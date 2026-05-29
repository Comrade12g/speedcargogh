const DATA_KEY = "speedCargoSiteData";
const QUOTES_KEY = "speedCargoQuoteRequests";
const NEWSLETTER_KEY = "speedCargoNewsletters";
const APPLICATION_KEY = "speedCargoApplications";
const AUTH_KEY = "speedCargoAdmin";

const SUPABASE_URL = "https://rqmxolzibpoiqpqvhigj.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbXhvbHppYnBvaXFwcXZoaWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjIxMTQsImV4cCI6MjA5NTYzODExNH0.Je1IXnfRlazgux_pwtV2aiEa-s1FVyXQTpDSGy7nb_8";
const SB_TOKEN_KEY = "sb-rqmxolzibpoiqpqvhigj-auth-token";

const getAccessToken = () => {
  try {
    const raw = localStorage.getItem(SB_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token || parsed?.currentSession?.access_token || null;
  } catch { return null; }
};

const fetchRemoteContent = async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?key=eq.main&select=data`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const d = rows?.[0]?.data;
    if (!d || typeof d !== "object" || Array.isArray(d) || Object.keys(d).length === 0) return null;
    return d;
  } catch { return null; }
};

const saveRemoteContent = async (payload) => {
  const token = getAccessToken();
  if (!token) throw new Error("Not signed in as admin. Sign in via /login.");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?key=eq.main`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify({ data: payload, updated_at: new Date().toISOString() })
  });
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
    button.textContent = "Saved";
    setTimeout(() => {
      button.textContent = original;
    }, 1200);
  });
});

const getSubmissions = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
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

const renderSubmissions = () => {
  const quoteNode = document.querySelector('[data-submissions="quotes"]');
  const newsletterNode = document.querySelector('[data-submissions="newsletters"]');
  const applicationNode = document.querySelector('[data-submissions="applications"]');

  if (quoteNode) quoteNode.innerHTML = submissionMarkup(getSubmissions(QUOTES_KEY));
  if (newsletterNode) newsletterNode.innerHTML = submissionMarkup(getSubmissions(NEWSLETTER_KEY));
  if (applicationNode) applicationNode.innerHTML = submissionMarkup(getSubmissions(APPLICATION_KEY));
};

document.querySelector("[data-clear-submissions]")?.addEventListener("click", () => {
  localStorage.removeItem(QUOTES_KEY);
  localStorage.removeItem(NEWSLETTER_KEY);
  localStorage.removeItem(APPLICATION_KEY);
  renderSubmissions();
});

if (localStorage.getItem(AUTH_KEY) === "1") {
  showDashboard();
} else {
  showLogin();
}
