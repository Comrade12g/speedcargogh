const DATA_KEY = "speedCargoSiteData";
const QUOTES_KEY = "speedCargoQuoteRequests";
const NEWSLETTER_KEY = "speedCargoNewsletters";
const APPLICATION_KEY = "speedCargoApplications";
const AUTH_KEY = "speedCargoAdmin";

const SUPABASE_URL = "https://rqmxolzibpoiqpqvhigj.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbXhvbHppYnBvaXFwcXZoaWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjIxMTQsImV4cCI6MjA5NTYzODExNH0.Je1IXnfRlazgux_pwtV2aiEa-s1FVyXQTpDSGy7nb_8";
const SB_TOKEN_KEY = "sb-rqmxolzibpoiqpqvhigj-auth-token";

const readSession = () => {
  try {
    const raw = localStorage.getItem(SB_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.currentSession || parsed || null;
  } catch { return null; }
};

const refreshSession = async () => {
  const s = readSession();
  const rt = s?.refresh_token;
  if (!rt) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return null;
    const next = await res.json();
    localStorage.setItem(SB_TOKEN_KEY, JSON.stringify(next));
    return next?.access_token || null;
  } catch { return null; }
};

const getAccessToken = async ({ forceRefresh = false } = {}) => {
  const s = readSession();
  if (!s) return null;
  const exp = Number(s.expires_at || 0);
  const expired = exp && exp * 1000 < Date.now() + 30_000; // 30s skew
  if (forceRefresh || expired) {
    const fresh = await refreshSession();
    if (fresh) return fresh;
  }
  return s.access_token || null;
};

const fetchRemoteContent = async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?key=eq.main&select=data`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const d = rows?.[0]?.data;
    if (!d || typeof d !== "object" || Array.isArray(d) || Object.keys(d).length === 0) return null;
    return d;
  } catch { return null; }
};

const upsertSiteContent = async (token, payload) => {
  return fetch(`${SUPABASE_URL}/rest/v1/site_content?on_conflict=key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
      Prefer: "return=minimal,resolution=merge-duplicates",
    },
    body: JSON.stringify({ key: "main", data: payload, updated_at: new Date().toISOString() }),
  });
};

const saveRemoteContent = async (payload) => {
  let token = await getAccessToken();
  if (!token) throw new Error("Not signed in as admin. Sign in via /login.");
  let res = await upsertSiteContent(token, payload);
  if (res.status === 401 || res.status === 403) {
    token = await getAccessToken({ forceRefresh: true });
    if (!token) throw new Error("Session expired. Sign in again at /login.");
    res = await upsertSiteContent(token, payload);
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Save failed (${res.status})`);
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const defaultData = clone(window.SPEED_CARGO_DEFAULT_DATA);
const mergeDeep = (base, override) => {
  const output = clone(base);
  Object.entries(override || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === "object" &&
      !Array.isArray(output[key])
    ) {
      output[key] = mergeDeep(output[key], value);
      return;
    }
    output[key] = value;
  });
  return output;
};

const getData = () => {
  const stored = localStorage.getItem(DATA_KEY);
  if (!stored) return clone(defaultData);
  try {
    return mergeDeep(defaultData, JSON.parse(stored));
  } catch {
    return clone(defaultData);
  }
};

const saveData = (data) => {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

let siteData = getData();

const loginPanel = document.querySelector("[data-admin-login]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const jsonEditor = document.querySelector("[data-json-editor]");
const jsonNote = document.querySelector("[data-json-note]");

const showDashboard = async () => {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  syncEditor();
  renderSubmissions();
  const remote = await fetchRemoteContent();
  if (remote) {
    siteData = mergeDeep(defaultData, remote);
    saveData(siteData);
    syncEditor();
    if (jsonNote) jsonNote.textContent = "Loaded latest content from server.";
  }
};

const showLogin = () => {
  loginPanel.hidden = false;
  dashboard.hidden = true;
};

const syncEditor = () => {
  if (jsonEditor) {
    jsonEditor.value = JSON.stringify(siteData, null, 2);
  }
};

document.querySelector(".admin-login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (values.email && values.password) {
    localStorage.setItem(AUTH_KEY, "1");
    showDashboard();
    return;
  }
  document.querySelector("[data-admin-note]").textContent = "Enter an email and password.";
});

document.querySelector("[data-admin-logout]")?.addEventListener("click", () => {
  localStorage.removeItem(AUTH_KEY);
  showLogin();
});

document.querySelectorAll("[data-admin-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-admin-tab]")
      .forEach((item) => item.classList.toggle("is-active", item === button));
    document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.adminPanel === button.dataset.adminTab);
    });
  });
});

document.querySelectorAll("[data-save-json]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      siteData = JSON.parse(jsonEditor.value);
      saveData(siteData);
      syncEditor();
      jsonNote.textContent = "Saving to server…";
      await saveRemoteContent(siteData);
      jsonNote.textContent = "Saved live. Public site will pick it up on next page load.";
    } catch (error) {
      jsonNote.textContent = `Save error: ${error.message}`;
    }
  });
});

document.querySelector("[data-reset-json]")?.addEventListener("click", async () => {
  siteData = clone(defaultData);
  saveData(siteData);
  syncEditor();
  try {
    await saveRemoteContent(siteData);
    jsonNote.textContent = "Defaults restored and saved live.";
  } catch (error) {
    jsonNote.textContent = `Reset saved locally only: ${error.message}`;
  }
});

document.querySelectorAll("[data-add]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const section = form.dataset.add;
    const values = Object.fromEntries(new FormData(form).entries());

    if (!Array.isArray(siteData[section])) {
      siteData[section] = [];
    }


    if (section === "news" && !values.date) {
      values.date = new Date().toISOString().slice(0, 10);
    }

    siteData[section].unshift(values);
    saveData(siteData);
    syncEditor();
    form.reset();
    const button = form.querySelector("button");
    const original = button.textContent;
    button.textContent = "Saving…";
    try {
      await saveRemoteContent(siteData);
      button.textContent = "Saved live";
    } catch (err) {
      button.textContent = "Save failed";
      console.error(err);
    }
    setTimeout(() => { button.textContent = original; }, 1500);
  });
});

const getSubmissions = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const fetchRemoteQuotes = async () => {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/quote_requests?select=*&order=created_at.desc`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
};

const updateRemoteQuoteStatus = async (id, status) => {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/quote_requests?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
};

const deleteRemoteQuote = async (id) => {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/quote_requests?id=eq.${id}`, {
    method: "DELETE",
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
};

const formatDate = (iso) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

const STATUS_OPTIONS = ["new", "contacted", "quoted", "won", "lost", "archived"];

const quoteCardMarkup = (item) => {
  const title = item.contact_name || item.email || "Quote request";
  const fields = [
    ["Submitted", formatDate(item.created_at)],
    ["Email", item.email],
    ["Phone", item.phone],
    ["Company", item.company],
    ["Mode", item.mode],
    ["Origin", item.origin],
    ["Destination", item.destination],
    ["Weight (kg)", item.weight_kg],
    ["Volume (cbm)", item.volume_cbm],
    ["Goods", item.goods],
    ["Notes", item.notes],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "");
  const rows = fields
    .map(([k, v]) => `<span><strong>${escapeHtml(k)}</strong>${escapeHtml(v)}</span>`)
    .join("");
  const statusSelect = `<label class="quote-status"><strong>Status</strong>
    <select data-quote-status="${escapeHtml(item.id)}">
      ${STATUS_OPTIONS.map((s) => `<option value="${s}"${s === item.status ? " selected" : ""}>${s}</option>`).join("")}
    </select></label>`;
  return `<article class="submission-item quote-card" data-quote-id="${escapeHtml(item.id)}">
    <strong>${escapeHtml(title)}</strong>
    ${rows}
    ${statusSelect}
    <div class="quote-actions">
      <button type="button" class="button dark" data-quote-delete="${escapeHtml(item.id)}">Delete</button>
    </div>
  </article>`;
};

const submissionMarkup = (items) => {
  if (!items.length) return "<p>No saved items yet.</p>";
  return `
    <div class="submission-list">
      ${items
        .map((item) => {
          const title = item.name || item.email || item.role || "Submission";
          const rows = Object.entries(item)
            .map(([key, value]) => `<span><strong>${escapeHtml(key)}</strong>${escapeHtml(value)}</span>`)
            .join("");
          return `<article class="submission-item"><strong>${escapeHtml(title)}</strong>${rows}</article>`;
        })
        .join("")}
    </div>
  `;
};

const quotesMarkup = (items) => {
  if (!items.length) return "<p>No quote requests yet.</p>";
  return `<div class="submission-list">${items.map(quoteCardMarkup).join("")}</div>`;
};

const renderSubmissions = async () => {
  const quoteNode = document.querySelector('[data-submissions="quotes"]');
  const newsletterNode = document.querySelector('[data-submissions="newsletters"]');
  const applicationNode = document.querySelector('[data-submissions="applications"]');

  if (newsletterNode) newsletterNode.innerHTML = submissionMarkup(getSubmissions(NEWSLETTER_KEY));
  if (applicationNode) applicationNode.innerHTML = submissionMarkup(getSubmissions(APPLICATION_KEY));

  if (quoteNode) {
    quoteNode.innerHTML = "<p>Loading quote requests…</p>";
    const remote = await fetchRemoteQuotes();
    if (remote) {
      quoteNode.innerHTML = quotesMarkup(remote);
      bindQuoteHandlers(quoteNode);
    } else {
      // fallback to local mirror
      quoteNode.innerHTML = submissionMarkup(getSubmissions(QUOTES_KEY));
    }
  }
};

const bindQuoteHandlers = (root) => {
  root.querySelectorAll("[data-quote-status]").forEach((sel) => {
    sel.addEventListener("change", async (e) => {
      const id = e.target.dataset.quoteStatus;
      const prev = e.target.dataset.prev || "";
      e.target.disabled = true;
      try {
        await updateRemoteQuoteStatus(id, e.target.value);
        e.target.dataset.prev = e.target.value;
      } catch (err) {
        alert("Failed to update status: " + err.message);
        if (prev) e.target.value = prev;
      } finally {
        e.target.disabled = false;
      }
    });
  });
  root.querySelectorAll("[data-quote-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.quoteDelete;
      if (!confirm("Delete this quote request? This cannot be undone.")) return;
      btn.disabled = true;
      btn.textContent = "Deleting…";
      try {
        await deleteRemoteQuote(id);
        document.querySelector(`[data-quote-id="${id}"]`)?.remove();
      } catch (err) {
        alert("Failed to delete: " + err.message);
        btn.disabled = false;
        btn.textContent = "Delete";
      }
    });
  });
};

document.querySelector("[data-clear-submissions]")?.addEventListener("click", () => {
  localStorage.removeItem(QUOTES_KEY);
  localStorage.removeItem(NEWSLETTER_KEY);
  localStorage.removeItem(APPLICATION_KEY);
  renderSubmissions();
});


// Parent /admin route already validated admin role via Supabase. Skip the
// inner email/password gate when a Supabase session exists.
// Only a valid Supabase session unlocks the dashboard.
// The /admin TanStack route validates the admin role before mounting this iframe.
(async () => {
  if (await getAccessToken()) {
    showDashboard();
  } else {
    localStorage.removeItem(AUTH_KEY);
    window.location.replace("/login");
  }
})();
