import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://fms.yunwuyun.com/api/fms/bizTrace/queryTraceInfoCondition";
const TENANT_CODE = "FSWL";

type TraceLeg = {
  haulageNo?: string | null;
  cntNo?: string | null;
  traceName?: string | null;
  traceTime?: string | null;
  attachmentUrl?: string | null;
};

type Shipment = Record<string, unknown> & { bizTraceVos?: TraceLeg[] };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const clean = (value: unknown) =>
  value === null || value === undefined || value === "" ? null : value;

const date = (value: unknown) => {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toISOString().slice(0, 10);
};

const normalise = (shipment: Shipment) => {
  const get = (key: string) => clean(shipment[key]);
  const port = (name: string, code: string) =>
    [get(name), get(code) ? `(${get(code)})` : null].filter(Boolean).join(" ") || null;

  const legs = Array.isArray(shipment.bizTraceVos) ? shipment.bizTraceVos : [];
  const groups = new Map<string, { haulageNo: string | null; cntNo: string | null; steps: TraceLeg[] }>();
  legs.forEach((leg) => {
    const key = String(leg?.haulageNo ?? "main");
    if (!groups.has(key)) {
      groups.set(key, {
        haulageNo: (leg?.haulageNo as string) ?? null,
        cntNo: (leg?.cntNo as string) ?? null,
        steps: [],
      });
    }
    groups.get(key)!.steps.push({
      traceName: (leg?.traceName as string) ?? null,
      traceTime: (leg?.traceTime as string) ?? null,
      attachmentUrl: (leg?.attachmentUrl as string) ?? null,
    });
  });

  return {
    jobNo: get("jobNo"),
    status: get("statusName") ?? get("jobStatus") ?? null,
    details: {
      refno: get("refno"),
      transferNo: get("transferNo"),
      deliveryExpressNo: get("deliveryExpressNo"),
      vessel: get("vessel"),
      voyage: get("voyage"),
      pieces: get("pieces"),
      grosskgs: get("grosskgs"),
      volume: get("volume"),
      freighttons: get("freighttons"),
      portofreceiveplace: get("portofreceiveplace"),
      portofloading: port("portofloading", "lgcode"),
      portofdischarge: port("portofdischarge", "dicode"),
      portofdestination: get("portofdestination"),
      etd: date(get("etd")),
      eta: date(get("eta")),
      atd: date(get("atd")),
      ata: date(get("ata")),
      destination: get("destination"),
      deliveryAddr: get("deliveryAddr"),
      warehouseCollectName: get("warehouseCollectName"),
    },
    legs: Array.from(groups.values()),
  };
};

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let code = "";
        try {
          const body = (await request.json()) as { code?: unknown };
          code = String(body?.code ?? "").trim();
        } catch {
          return json({ success: false, message: "Invalid request." }, 400);
        }

        if (!code || code.length > 64 || !/^[A-Za-z0-9/\-_. ]+$/.test(code)) {
          return json({ success: false, message: "Enter a valid tracking number." }, 400);
        }

        try {
          const upstream = await fetch(UPSTREAM, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantCode: TENANT_CODE, conditionNo: code }),
          });

          if (!upstream.ok) {
            const text = await upstream.text();
            console.error(`Tracking upstream failed [${upstream.status}]: ${text}`);
            return json({ success: false, message: "Tracking service is busy. Try again shortly." }, 502);
          }

          const payload = (await upstream.json()) as { result?: Shipment[] };
          const shipments = Array.isArray(payload?.result) ? payload.result : [];
          return json({
            success: true,
            code,
            shipments: shipments.map(normalise),
          });
        } catch (error) {
          console.error("Tracking lookup error", error);
          return json({ success: false, message: "Tracking service unreachable. Try again shortly." }, 502);
        }
      },
    },
  },
});
