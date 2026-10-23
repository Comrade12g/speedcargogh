import { createFileRoute } from "@tanstack/react-router";

// Speed Cargo tracking lookups (Jiandaoyun public query forms).
const HOST = "https://sn4lnwzeqh.jiandaoyun.com";
const APP_ID = "6a9e593bc3e32d05ab790ec1";

const SOURCES = {
  courier: {
    label: "Courier / express number",
    page: "6abb30387e7593731b7eea74",
    entryId: "6abb30387e7593731b7eea71",
    field: "_widget_1790652462616",
    token: "vRxxipPUv7EfU2cjXNdHCT/Pw7sLQ1Ueg0N3hTqq2BM=",
    titleField: "_widget_1790652462616",
    statusField: "_widget_1790743472704",
  },
  order: {
    label: "Business order number",
    page: "6aa2200867125190ca5a9c57",
    entryId: "6aa2200867125190ca5a9c55",
    field: "_widget_1788914504364",
    token: "xpz4Vv9E2dTbPBfTDuZTcxIPEhjim9Vbrc2D2AZGZv0=",
    titleField: "_widget_1788914504364",
    statusField: "_widget_1789387916006",
  },
} as const;

type SourceKey = keyof typeof SOURCES;
type Header = { name: string; text?: string; type?: string; items?: Header[]; format?: string };

// Internal/billing columns we never show publicly.
const HIDDEN_TYPES = new Set(["image", "upload", "signature"]);
const HIDDEN_FIELDS = new Set(["updateTime", "_id", "appId", "entryId", "creator", "updater", "deleter", "createTime", "deleteTime"]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const fmtDate = (v: unknown) => {
  const d = new Date(typeof v === "number" ? v : String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toISOString().slice(0, 10);
};

const toText = (v: unknown, type?: string): string | null => {
  if (v === null || v === undefined || v === "") return null;
  if (type === "datetime") return fmtDate(v);
  if (Array.isArray(v)) {
    const parts = v.map((x) => toText(x)).filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const k of ["name", "text", "value", "label", "username"]) {
      if (o[k] !== undefined && o[k] !== null && o[k] !== "") return toText(o[k]);
    }
    return null;
  }
  if (typeof v === "number") return String(Math.round(v * 1000) / 1000);
  return String(v);
};

const freshToken = async (key: SourceKey) => {
  try {
    const res = await fetch(`${HOST}/q/${SOURCES[key].page}`);
    const html = await res.text();
    const m = html.match(/jdy_access_token\s*=\s*"([^"]+)"/);
    if (m) return m[1];
  } catch {
    /* fall back to known token */
  }
  return SOURCES[key].token;
};

const query = (key: SourceKey, code: string, token: string) =>
  fetch(`${HOST}/_/data_process/data/public_query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filter: {
        rel: "and",
        cond: [{ type: "text", entryId: SOURCES[key].entryId, field: SOURCES[key].field, value: [code], method: "in" }],
      },
      appId: APP_ID,
      fx_access_token: token,
      fx_access_type: "form_query",
      limit: 20,
      skip: 0,
      sort: [],
    }),
  });

const normalise = (key: SourceKey, headers: Header[], row: Record<string, unknown>) => {
  const src = SOURCES[key];
  const details: { label: string; value: string }[] = [];
  const tables: { label: string; columns: string[]; rows: string[][] }[] = [];

  for (const h of headers) {
    if (HIDDEN_FIELDS.has(h.name) || HIDDEN_TYPES.has(h.type ?? "")) continue;
    const raw = row[h.name];
    if (h.type === "subform") {
      if (!Array.isArray(raw) || !raw.length) continue;
      const items = (h.items ?? []).filter((i) => !HIDDEN_TYPES.has(i.type ?? ""));
      const keys = items.length
        ? items.map((i) => i.name)
        : Object.keys(raw[0] as object).filter((k) => !k.startsWith("_id"));
      const columns = items.length ? items.map((i) => i.text || i.name) : keys;
      const rows = raw.map((r) =>
        keys.map((k, idx) => toText((r as Record<string, unknown>)[k], items[idx]?.type) ?? ""),
      );
      tables.push({ label: h.text || h.name, columns, rows });
      continue;
    }
    const value = toText(raw, h.type);
    if (value) details.push({ label: h.text || h.name, value });
  }

  return {
    title: toText(row[src.titleField]),
    status: toText(row[src.statusField]),
    details,
    tables,
  };
};

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let code = "";
        let type: SourceKey = "courier";
        try {
          const body = (await request.json()) as { code?: unknown; type?: unknown };
          code = String(body?.code ?? "").trim();
          if (body?.type === "order") type = "order";
        } catch {
          return json({ success: false, message: "Invalid request." }, 400);
        }

        if (!code || code.length > 64 || !/^[A-Za-z0-9/\-_. ]+$/.test(code)) {
          return json({ success: false, message: "Enter a valid tracking number." }, 400);
        }

        try {
          let res = await query(type, code, SOURCES[type].token);
          if (!res.ok) res = await query(type, code, await freshToken(type));
          if (!res.ok) {
            console.error(`Tracking upstream failed [${res.status}]: ${await res.text()}`);
            return json({ success: false, message: "Tracking service is busy. Try again shortly." }, 502);
          }
          const payload = (await res.json()) as { header?: Header[]; data?: Record<string, unknown>[] };
          const headers = Array.isArray(payload?.header) ? payload.header : [];
          const rows = Array.isArray(payload?.data) ? payload.data : [];
          return json({
            success: true,
            code,
            type,
            typeLabel: SOURCES[type].label,
            shipments: rows.map((r) => normalise(type, headers, r)),
          });
        } catch (error) {
          console.error("Tracking lookup error", error);
          return json({ success: false, message: "Tracking service unreachable. Try again shortly." }, 502);
        }
      },
    },
  },
});
