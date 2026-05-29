const DATA_KEY = "speedCargoSiteData";
const QUOTES_KEY = "speedCargoQuoteRequests";
const NEWSLETTER_KEY = "speedCargoNewsletters";
const APPLICATION_KEY = "speedCargoApplications";

const clone = (value) => JSON.parse(JSON.stringify(value));
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

const getSiteData = () => {
  const stored = localStorage.getItem(DATA_KEY);
  if (!stored) return clone(window.SPEED_CARGO_DEFAULT_DATA);

  try {
    return mergeDeep(window.SPEED_CARGO_DEFAULT_DATA, JSON.parse(stored));
  } catch {
    return clone(window.SPEED_CARGO_DEFAULT_DATA);
  }
};

const saveCollectionItem = (key, item) => {
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.unshift({ ...item, createdAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(list));
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const data = getSiteData();

const setText = (selector, value) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
};

const setProfileLinks = () => {
  const { profile } = data;
  document.querySelectorAll('[data-profile="phoneLink"]').forEach((node) => {
    node.textContent = profile.phoneDisplay;
    node.href = `tel:${profile.phoneHref}`;
  });
  document.querySelectorAll('[data-profile="emailLink"]').forEach((node) => {
    node.textContent = profile.email;
    node.href = `mailto:${profile.email}`;
  });
  document.querySelectorAll('[data-profile="instagram"]').forEach((node) => {
    node.href = profile.instagram;
  });
  document.querySelectorAll('[data-profile="facebook"]').forEach((node) => {
    node.href = profile.facebook;
  });
  document.querySelectorAll('[data-profile="phoneButton"]').forEach((node) => {
    node.href = `tel:${profile.phoneHref}`;
  });
  document.querySelectorAll('[data-profile="whatsappButton"]').forEach((node) => {
    node.href = `https://wa.me/${profile.whatsapp}`;
  });
  document.querySelectorAll('[data-profile="trackingExternal"]').forEach((node) => {
    node.href = profile.trackingUrl;
  });
};

const renderHero = () => {
  const hero = data.hero || {};
  setText('[data-hero="eyebrow"]', hero.eyebrow || "");
  setText('[data-hero="title"]', hero.title || "Speed Cargo");
  setText('[data-hero="subtitle"]', hero.subtitle || "");
  setText('[data-hero="primaryCta"]', hero.primaryCta || "Track shipment");
  setText('[data-hero="secondaryCta"]', hero.secondaryCta || "Request quote");
  document.querySelectorAll(".hero-video").forEach((video) => {
    if (hero.video) video.src = hero.video;
  });
};

const renderAnnouncements = () => {
  document.querySelectorAll('[data-render="announcements"]').forEach((node) => {
    node.innerHTML = (data.announcements || [])
      .map(
        (item) => `
          <article class="announcement">
            <span>${escapeHtml(item.tag || "News")}</span>
            <p><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.text)}</p>
          </article>
        `
      )
      .join("");
  });
};

const renderStats = () => {
  document.querySelectorAll('[data-render="stats"]').forEach((node) => {
    node.innerHTML = (data.stats || [])
      .map(
        (item) => `
          <article class="metric">
            <strong>${escapeHtml(item.value)}</strong>
            <span>${escapeHtml(item.label)}</span>
          </article>
        `
      )
      .join("");
  });
};

const renderServices = () => {
  document.querySelectorAll('[data-render="services"]').forEach((node) => {
    node.innerHTML = (data.services || [])
      .map(
        (item, index) => {
          let media = `<div class="media-placeholder">${escapeHtml(item.title)}</div>`;
          if (item.image?.endsWith(".mp4")) {
            media = `<video src="${escapeHtml(item.image)}" autoplay muted loop playsinline></video>`;
          } else if (item.image) {
            media = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />`;
          }
          return `
          <article class="service-card">
            <div class="service-media">${media}</div>
            <span class="service-index">${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `;
        }
      )
      .join("");
  });
};

const renderProcess = () => {
  document.querySelectorAll('[data-render="process"]').forEach((node) => {
    node.innerHTML = (data.process || [])
      .map(
        (item, index) => `
          <article class="route-step">
            <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `
      )
      .join("");
  });
};

const renderOffices = () => {
  document.querySelectorAll('[data-render="offices"]').forEach((node) => {
    node.innerHTML = (data.offices || [])
      .map(
        (item) => `
          <article class="location-card">
            <iframe
              class="map-preview"
              title="${escapeHtml(item.title)} map preview"
              src="${escapeHtml(item.mapEmbed || `https://maps.google.com/maps?q=${encodeURIComponent(item.address)}&z=15&output=embed`)}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <strong>${escapeHtml(item.title)}</strong>
            <h3>${escapeHtml(item.address)}</h3>
            <p>${escapeHtml(item.text)}</p>
            <a class="text-link" href="${escapeHtml(item.map)}" target="_blank" rel="noopener noreferrer">
              Open map
            </a>
          </article>
        `
      )
      .join("");
  });
};

const renderPartners = () => {
  document.querySelectorAll('[data-render="partners"]').forEach((node) => {
    node.innerHTML = (data.partners || [])
      .map(
        (item) => `
          <div class="partner-logo">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
          </div>
        `
      )
      .join("");
  });
};

const renderSupportPartners = () => {
  document.querySelectorAll('[data-render="supportPartners"]').forEach((node) => {
    node.innerHTML = (data.supportPartners || [])
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join("");
  });
};

const renderGallery = () => {
  document.querySelectorAll('[data-render="gallery"]').forEach((node) => {
    node.innerHTML = (data.gallery || [])
      .map((item) => {
        let media = `<div class="media-placeholder">${escapeHtml(item.title || "Media")}</div>`;
        if (item.type === "video" && item.src) {
          media = `<video src="${escapeHtml(item.src)}" controls muted playsinline></video>`;
        }
        if (item.type === "image" && item.src) {
          media = `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy" />`;
        }
        return `
          <article class="media-card">
            ${media}
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.caption)}</p>
            </div>
          </article>
        `;
      })
      .join("");
  });
};

const renderTeam = () => {
  document.querySelectorAll('[data-render="team"]').forEach((node) => {
    node.innerHTML = (data.team || [])
      .map(
        (item) => `
          <article class="team-card">
            <h3>${escapeHtml(item.name)}</h3>
            <strong>${escapeHtml(item.role)}</strong>
            <p>${escapeHtml(item.bio)}</p>
          </article>
        `
      )
      .join("");
  });
};

const renderTestimonials = () => {
  document.querySelectorAll('[data-render="testimonials"]').forEach((node) => {
    node.innerHTML = (data.testimonials || [])
      .map(
        (item) => `
          <article class="testimonial-card">
            <blockquote>"${escapeHtml(item.quote)}"</blockquote>
            <p><strong>${escapeHtml(item.name)}</strong><br />${escapeHtml(item.detail)}</p>
          </article>
        `
      )
      .join("");
  });
};

const renderNews = () => {
  document.querySelectorAll('[data-render="news"]').forEach((node) => {
    node.innerHTML = (data.news || [])
      .map(
        (item) => `
          <article class="news-card">
            <span class="news-meta">${escapeHtml(item.category)} | ${escapeHtml(item.date)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
          </article>
        `
      )
      .join("");
  });
};

const renderJobs = () => {
  document.querySelectorAll('[data-render="jobs"]').forEach((node) => {
    node.innerHTML = (data.jobs || [])
      .map(
        (item) => `
          <article class="job-card">
            <div>
              <span class="job-meta">${escapeHtml(item.location)} | ${escapeHtml(item.type)}</span>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.summary)}</p>
            </div>
            <a class="text-link" href="#apply">Apply</a>
          </article>
        `
      )
      .join("");
  });

  document.querySelectorAll("[data-job-select]").forEach((select) => {
    select.innerHTML = (data.jobs || [])
      .map((job) => `<option>${escapeHtml(job.title)}</option>`)
      .join("");
  });
};

const setupNavigation = () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navPane = document.querySelector(".nav-pane");
  if (!navPane) return;

  // Inject backdrop + close button into the pane (mobile slide-out clarity)
  if (!document.querySelector(".nav-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", () => closeNav());
  }
  if (!navPane.querySelector(".nav-close")) {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "nav-close";
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.innerHTML = "&times;";
    navPane.prepend(closeBtn);
    closeBtn.addEventListener("click", () => closeNav());
  }

  function openNav() {
    document.body.classList.add("nav-open");
    navToggle?.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }

  navToggle?.addEventListener("click", () => {
    document.body.classList.contains("nav-open") ? closeNav() : openNav();
  });

  navPane.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
};

const setupFloatingWhatsApp = () => {
  if (document.querySelector(".whatsapp-fab")) return;
  const profile = (window.SPEED_CARGO_DEFAULT_DATA || {}).profile || {};
  const number = (profile.whatsapp || "").replace(/\D/g, "");
  if (!number) return;
  const a = document.createElement("a");
  a.className = "whatsapp-fab";
  a.href = `https://wa.me/${number}?text=${encodeURIComponent("Hello Speed Cargo, I would like more information.")}`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", "Chat on WhatsApp");
  a.innerHTML = `
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <path fill="currentColor" d="M16 .5C7.4.5.5 7.4.5 16c0 2.8.7 5.4 2 7.7L.5 31.5l8-2.1c2.2 1.2 4.8 1.9 7.5 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.5 16 .5zm0 28.2c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5C3.9 20.7 3.3 18.4 3.3 16 3.3 9 9 3.3 16 3.3S28.7 9 28.7 16 23 28.7 16 28.7zm7.3-9.5c-.4-.2-2.3-1.1-2.7-1.3s-.6-.2-.9.2-1 1.3-1.2 1.5-.4.3-.8.1c-2.4-1.2-4-2.1-5.6-4.7-.4-.7.4-.7 1.2-2.2.1-.3.1-.5 0-.7s-.9-2.1-1.2-2.9c-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5s-1.3 1.3-1.3 3.1 1.3 3.6 1.5 3.8c.2.3 2.6 4 6.3 5.6 2.3 1 3.2 1.1 4.4.9.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.2-.4-.3-.8-.5z"/>
    </svg>
    <span>Chat</span>
  `;
  document.body.appendChild(a);
};

const setupStatCounters = () => {
  const numbers = document.querySelectorAll(".metric-strip strong, .metric-strip [data-metric-value]");
  if (!numbers.length || !("IntersectionObserver" in window)) return;
  const animate = (el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    if (!isFinite(target)) return;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = target * eased;
      const formatted = target >= 100
        ? Math.round(cur).toLocaleString()
        : cur.toFixed(num.includes(".") ? 1 : 0);
      el.textContent = `${prefix}${formatted}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const seen = new WeakSet();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !seen.has(e.target)) {
        seen.add(e.target);
        animate(e.target);
      }
    });
  }, { threshold: 0.4 });
  numbers.forEach((n) => io.observe(n));
};

const submitQuoteToBackend = async (payload) => {
  const cfg = window.SPEED_CARGO_SUPABASE;
  if (!cfg?.url || !cfg?.anonKey) throw new Error("Backend not configured");
  const res = await fetch(`${cfg.url}/rest/v1/quote_requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: cfg.anonKey,
      Authorization: `Bearer ${cfg.anonKey}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Request failed (${res.status})`);
  }
};

const setupForms = () => {
  document.querySelector(".quote-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form).entries());
    const note = document.querySelector('[data-note="quote"]');
    const btn = form.querySelector('button[type="submit"]');
    const payload = {
      contact_name: String(formData.name || "").trim().slice(0, 200),
      phone: String(formData.phone || "").trim().slice(0, 60) || null,
      email: String(formData.email || formData.phone || "noemail@speedcargogh.com").trim().slice(0, 320),
      origin: String(formData.origin || "Unspecified").trim().slice(0, 200) || "Unspecified",
      destination: String(formData.destination || "Unspecified").trim().slice(0, 200) || "Unspecified",
      mode: String(formData.route || "Not sure").trim().slice(0, 40),
      goods: String(formData.cargo || "").trim().slice(0, 2000) || null,
      notes: String(formData.size || "").trim().slice(0, 2000) || null
    };
    // Basic email pattern - fall back to placeholder if user didn't supply one
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      payload.email = "noemail@speedcargogh.com";
    }
    if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
    try {
      await submitQuoteToBackend(payload);
      saveCollectionItem(QUOTES_KEY, formData); // keep local mirror for admin offline view
      form.reset();
      if (note) {
        note.textContent = "Quote request sent. The Speed Cargo team will be in touch shortly.";
        note.style.color = "var(--green, #1b8a3a)";
      }
    } catch (err) {
      saveCollectionItem(QUOTES_KEY, formData);
      if (note) {
        note.textContent = "Saved locally — the Speed Cargo team will follow up. (" + err.message + ")";
        note.style.color = "var(--red)";
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Send quote request"; }
    }
  });

  document.querySelectorAll(".newsletter-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      saveCollectionItem(NEWSLETTER_KEY, formData);
      form.reset();
      form.querySelector('[data-note="newsletter"]').textContent =
        "You are on the Speed Cargo update list.";
    });
  });

  document.querySelector(".application-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("cv");
    const payload = Object.fromEntries(formData.entries());
    payload.cv = file instanceof File ? file.name : "";
    saveCollectionItem(APPLICATION_KEY, payload);
    form.reset();
    document.querySelector('[data-note="application"]').textContent =
      "Application saved. Speed Cargo can review it from the admin dashboard.";
  });
};

const trackingUrlWithCode = (code) => {
  const base = data.profile.trackingUrl;
  if (!code) return base;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}conditionNo=${encodeURIComponent(code)}&trackingNo=${encodeURIComponent(code)}&trackNo=${encodeURIComponent(code)}`;
};

const renderTrackingResults = (state, code, payload) => {
  const node = document.querySelector("[data-tracking-results]");
  if (!node) return;

  if (state === "empty") {
    node.innerHTML = `
      <div class="empty-state">
        <strong>Enter a tracking number above.</strong>
        <p>Speed Cargo will query the live tracking system and show the result here.</p>
      </div>
    `;
    return;
  }

  if (state === "loading") {
    node.innerHTML = `
      <div class="empty-state">
        <strong>Checking ${escapeHtml(code)}...</strong>
        <p>Speed Cargo is querying the live tracking system.</p>
      </div>
    `;
    return;
  }

  if (state === "error") {
    node.innerHTML = `
      <div class="empty-state error-state">
        <strong>Tracking lookup could not load.</strong>
        <p>${escapeHtml(payload?.message || "Use the embedded portal below or WhatsApp support while we retry the live lookup.")}</p>
      </div>
    `;
    return;
  }

  const results = Array.isArray(payload?.result) ? payload.result : [];
  if (!results.length) {
    node.innerHTML = `
      <div class="empty-state">
        <strong>No live record found for ${escapeHtml(code)} yet.</strong>
        <p>The number may not be scanned into the live system yet. You can still use the embedded portal or WhatsApp support below.</p>
      </div>
    `;
    return;
  }

  node.innerHTML = results
    .map((item, index) => {
      const rows = Object.entries(item)
        .filter(([, value]) => value !== null && value !== "" && typeof value !== "object")
        .slice(0, 12)
        .map(
          ([key, value]) => `
            <span>
              <strong>${escapeHtml(key)}</strong>
              ${escapeHtml(value)}
            </span>
          `
        )
        .join("");

      return `
        <article class="tracking-result-card">
          <h3>Tracking result ${index + 1}</h3>
          <div class="tracking-result-grid">${rows}</div>
        </article>
      `;
    })
    .join("");
};

const queryLiveTracking = async (code) => {
  if (!code) return;
  renderTrackingResults("loading", code);
  try {
    const response = await fetch(data.profile.trackingApi, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tenantCode: data.profile.tenantCode || "FSWL",
        conditionNo: code
      })
    });

    if (!response.ok) {
      throw new Error(`Tracker returned ${response.status}`);
    }

    const payload = await response.json();
    renderTrackingResults("ready", code, payload);
  } catch (error) {
    renderTrackingResults("error", code, error);
  }
};

const setupTracking = () => {
  const openTracking = (code) => {
    const label = document.querySelector("[data-tracking-label]");
    const url = trackingUrlWithCode(code);
    if (label) label.textContent = code ? `Checking ${code}` : "Ready";
    document.querySelectorAll("[data-tracking-frame]").forEach((frame) => {
      frame.src = url;
    });
    document.querySelectorAll("[data-live-tracking-link]").forEach((link) => {
      link.href = url;
    });
    document.querySelectorAll("[data-whatsapp-tracking-link]").forEach((link) => {
      const text = code
        ? `Hello Speed Cargo, please help me track shipment ${code}.`
        : "Hello Speed Cargo, please help me track my shipment.";
      link.href = `https://wa.me/${data.profile.whatsapp}?text=${encodeURIComponent(text)}`;
    });
    document.querySelectorAll("[data-copy-tracking]").forEach((button) => {
      button.disabled = !code;
      button.dataset.copyValue = code;
    });
    localStorage.setItem("speedCargoLastTracking", code);
    queryLiveTracking(code);
  };

  document.querySelector(".mini-tracking-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("tracking") || "";
    window.location.href = `./tracking.html?tracking=${encodeURIComponent(String(code).trim())}`;
  });

  document.querySelector(".tracking-page-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("tracking") || "").trim();
    document.querySelector('[data-note="tracking"]').textContent = code
      ? "Tracking desk ready. Use the live engine or WhatsApp support button below."
      : "Enter a tracking number to check cargo movement.";
    openTracking(code);
  });

  document.querySelectorAll("[data-copy-tracking]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyValue || "";
      if (!value) return;
      await navigator.clipboard?.writeText(value);
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy number";
      }, 1200);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const code = params.get("tracking") || localStorage.getItem("speedCargoLastTracking") || "";
  const input = document.querySelector("#tracking-code");
  if (input && code) {
    input.value = code;
    openTracking(code);
  } else {
    renderTrackingResults("empty");
  }
};

setProfileLinks();
renderHero();
renderAnnouncements();
renderStats();
renderServices();
renderProcess();
renderOffices();
renderPartners();
renderSupportPartners();
renderGallery();
renderTeam();
renderTestimonials();
renderNews();
renderJobs();
setupNavigation();
setupForms();
setupTracking();
setupFloatingWhatsApp();
setupStatCounters();
