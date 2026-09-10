import { TOPICS } from "../data/topics";
import { TRANSLATIONS, SupportedLanguage } from "../data/translations";
import { ENV } from "../config/env";

export function initLandingScript(onOpenDonation: () => void): () => void {
  // ── 1. Light / Dark Theme Switching ─────────────────────────────────────────
  const themeToggle = document.getElementById("theme-toggle");
  const getSystemTheme = (): "dark" | "light" =>
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const savedTheme = localStorage.getItem("tm_theme");
  const initialTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : getSystemTheme();

  function applyTheme(theme: string, persist = false) {
    document.documentElement.setAttribute("data-theme", theme);
    if (persist) {
      localStorage.setItem("tm_theme", theme);
    }
  }

  applyTheme(initialTheme);

  const handleThemeClick = () => {
    const current = document.documentElement.getAttribute("data-theme") || getSystemTheme();
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next, true);
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", handleThemeClick);
  }

  const mediaQuery =
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem("tm_theme")) {
      applyTheme(e.matches ? "dark" : "light", false);
    }
  };
  if (mediaQuery) {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  }

  // ── 2. 10 Rotating Hero Topic Cards with Live Progress Bar ──────────────────
  const topics = TOPICS;
  let currentTopicIdx = 0;
  let elapsedMs = 0;
  const DURATION_MS = 10000; // 10 seconds
  const TICK_MS = 50;
  let tickTimer: number | null = null;
  let isHovered = false;

  const cardTabTitle = document.getElementById("card-tab-title");
  const cardTopicBadge = document.getElementById("card-topic-badge");
  const cardLead = document.getElementById("card-lead");
  const cardHighlight = document.getElementById("card-highlight");
  const cardTrail = document.getElementById("card-trail");
  const cardTreeNodes = document.getElementById("card-tree-nodes");
  const carouselDotsContainer = document.getElementById("carousel-dots");
  const heroCard = document.getElementById("hero-preview-card");
  const chatBody = document.querySelector(".preview-chat-body") as HTMLElement | null;
  const progressBar = document.getElementById("card-progress-bar");

  // Build dots
  if (carouselDotsContainer && topics.length > 0) {
    carouselDotsContainer.innerHTML = "";
    topics.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = `c-dot${i === 0 ? " active" : ""}`;
      dot.title = `Switch to topic ${i + 1}`;
      dot.addEventListener("click", () => {
        showTopic(i);
        resetProgress();
      });
      carouselDotsContainer.appendChild(dot);
    });
  }

  function showTopic(idx: number) {
    currentTopicIdx = idx;
    const topic = topics[idx];
    if (!topic) return;

    // Fade out
    if (chatBody) {
      chatBody.style.opacity = "0";
      chatBody.style.transform = "translateY(3px)";
    }
    if (cardTreeNodes) {
      cardTreeNodes.style.opacity = "0";
    }

    setTimeout(() => {
      // Update DOM
      if (cardTabTitle) cardTabTitle.textContent = topic.url;
      if (cardTopicBadge) cardTopicBadge.textContent = topic.category;
      if (cardLead) cardLead.textContent = topic.msgLead;
      if (cardHighlight) cardHighlight.textContent = topic.highlight;
      if (cardTrail) cardTrail.textContent = topic.msgTrail;

      if (cardTreeNodes) {
        cardTreeNodes.innerHTML = topic.tree
          .map((node) => {
            const connector = node.last ? "└── " : "├── ";
            const paddingLeft = node.depth * 20;
            const isHighlighted = node.depth === 1 || node.text === topic.pinTitle;

            return `
              <div class="mockup-node${isHighlighted ? " active" : ""}" style="padding-left:${paddingLeft}px;">
                <span class="mockup-connector">${connector}</span>
                <span class="mockup-dot" style="background:${node.dot}"></span>
                <span class="mockup-label">${node.text}</span>
              </div>
            `;
          })
          .join("");
      }

      // Update active dot
      const dots = carouselDotsContainer?.querySelectorAll(".c-dot") ?? [];
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));

      // Fade in
      if (chatBody) {
        chatBody.style.opacity = "1";
        chatBody.style.transform = "translateY(0)";
      }
      if (cardTreeNodes) {
        cardTreeNodes.style.opacity = "1";
      }
    }, 150);
  }

  function resetProgress() {
    elapsedMs = 0;
    if (progressBar) progressBar.style.width = "0%";
  }

  function startProgressLoop() {
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = window.setInterval(() => {
      if (!isHovered && topics.length > 0) {
        elapsedMs += TICK_MS;
        const pct = Math.min(100, (elapsedMs / DURATION_MS) * 100);
        if (progressBar) progressBar.style.width = `${pct}%`;

        if (elapsedMs >= DURATION_MS) {
          elapsedMs = 0;
          const nextIdx = (currentTopicIdx + 1) % topics.length;
          showTopic(nextIdx);
        }
      }
    }, TICK_MS);
  }

  const handleMouseEnter = () => { isHovered = true; };
  const handleMouseLeave = () => { isHovered = false; };

  if (heroCard) {
    heroCard.addEventListener("mouseenter", handleMouseEnter);
    heroCard.addEventListener("mouseleave", handleMouseLeave);
  }

  if (topics.length > 0) {
    showTopic(0);
    resetProgress();
    startProgressLoop();
  }

  // ── 3. i18n Language Switching & Browser Detection ────────────────────────
  function detectBrowserLang(): SupportedLanguage {
    const raw = (
      (typeof navigator !== "undefined"
        ? navigator.language || (navigator.languages && navigator.languages[0]) || ""
        : "") || ""
    ).toLowerCase();
    if (raw.startsWith("zh")) return "zh";
    if (raw.startsWith("es")) return "es";
    if (raw.startsWith("fr")) return "fr";
    if (raw.startsWith("de")) return "de";
    if (raw.startsWith("ja")) return "ja";
    return "en";
  }

  const langSelect = document.getElementById("lang-select") as HTMLSelectElement | null;
  const storedLang = (localStorage.getItem("tm_landing_lang") || detectBrowserLang()) as SupportedLanguage;

  function detectBrowser() {
    const ua = (navigator.userAgent || "").toLowerCase();
    // if (ua.includes("firefox")) return "firefox";
    if (ua.includes("toto")) return "firefox";
    if (ua.includes("chrome") || ua.includes("chromium") || ua.includes("edg/") || ua.includes("brave") || ua.includes("opr/")) return "chrome";
    return "other";
  }

  const detectedBrowser = detectBrowser();

  function setupBrowserCtas(lang: string) {
    const ctas = document.querySelectorAll<HTMLAnchorElement>(".dynamic-browser-cta");
    const unsupportedNotes = document.querySelectorAll<HTMLElement>(".browser-unsupported-note");

    if (detectedBrowser === "other") {
      ctas.forEach((el) => (el.style.display = "none"));
      unsupportedNotes.forEach((el) => (el.style.display = "block"));
      return;
    }

    unsupportedNotes.forEach((el) => (el.style.display = "none"));

    const isFirefox = detectedBrowser === "firefox";
    const storeUrl = isFirefox
      ? "https://addons.mozilla.org/firefox/addon/thoughtmark/"
      : "https://chromewebstore.google.com/detail/thoughtmark/mnmlfccbgcgbhbhpfckfpcfeikkiapom";

    const labelMap: Record<string, string> = {
      en: isFirefox ? "Add to Firefox — Free" : "Add to Chrome — Free",
      zh: isFirefox ? "添加到 Firefox — 免费" : "添加到 Chrome — 免费",
      es: isFirefox ? "Añadir a Firefox — Gratis" : "Añadir a Chrome — Gratis",
      fr: isFirefox ? "Ajouter à Firefox — Gratuit" : "Ajouter à Chrome — Gratuit",
      de: isFirefox ? "Zu Firefox hinzufügen — Kostenlos" : "Zu Chrome hinzufügen — Kostenlos",
      ja: isFirefox ? "Firefox に追加 — 無料" : "Chrome に追加 — 無料",
    };

    const shortLabelMap: Record<string, string> = {
      en: isFirefox ? "Add to Firefox" : "Add to Chrome",
      zh: isFirefox ? "添加到 Firefox" : "添加到 Chrome",
      es: isFirefox ? "Añadir a Firefox" : "Añadir a Chrome",
      fr: isFirefox ? "Ajouter à Firefox" : "Ajouter à Chrome",
      de: isFirefox ? "Zu Firefox hinzufügen" : "Zu Chrome hinzufügen",
      ja: isFirefox ? "Firefox に追加" : "Chrome に追加",
    };

    const currentLang = lang || "en";
    const fullText = labelMap[currentLang] || labelMap.en;
    const shortText = shortLabelMap[currentLang] || shortLabelMap.en;

    ctas.forEach((btn) => {
      btn.style.display = "inline-flex";
      btn.href = storeUrl;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";

      const textSpan = btn.querySelector(".cta-text");
      const isNav = btn.classList.contains("nav-cta");
      if (textSpan) {
        textSpan.textContent = isNav ? shortText : fullText;
      } else {
        btn.textContent = isNav ? shortText : fullText;
      }

      const iconSpan = btn.querySelector(".cta-icon");
      if (iconSpan) {
        if (isFirefox) {
          iconSpan.innerHTML = `<img src="/assets/firefox.png" alt="Firefox" width="18" height="18" class="cta-browser-icon" />`;
        } else {
          iconSpan.innerHTML = `<img src="/assets/chrome.png" alt="Chrome" width="18" height="18" class="cta-browser-icon" />`;
        }
      }
    });
  }

  function setLanguage(lang: SupportedLanguage) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) {
        el.textContent = dict[key];
      }
    });

    const widgetInput = document.getElementById("widget-title-input") as HTMLInputElement | null;
    if (widgetInput && dict.interactivePlaceholder) {
      widgetInput.placeholder = dict.interactivePlaceholder;
    }

    document.documentElement.lang = lang;
    setupBrowserCtas(lang);
  }

  const handleLangChange = (e: Event) => {
    const selected = (e.target as HTMLSelectElement).value as SupportedLanguage;
    localStorage.setItem("tm_landing_lang", selected);
    setLanguage(selected);
  };

  if (langSelect) {
    langSelect.value = storedLang;
    setLanguage(storedLang);
    langSelect.addEventListener("change", handleLangChange);
  } else {
    setLanguage(storedLang);
  }

  // ── 4. Donation Trigger Interceptor ───────────────────────────────────────
  const supporterBtn = document.getElementById('pricing-support-btn');
  const footerSupportLink = document.getElementById('footer-support-link');

  const handleDonationClick = (e: Event) => {
    e.preventDefault();
    onOpenDonation();
  };

  if (supporterBtn) {
    supporterBtn.addEventListener("click", handleDonationClick);
  }
  if (footerSupportLink) {
    footerSupportLink.addEventListener("click", handleDonationClick);
  }

  // ── 6. Live Community Stats Bar ───────────────────────────────────────────
  const pinsCountEl = document.getElementById("stat-pins-count");
  const usersCountEl = document.getElementById("stat-users-count");
  const installsCountEl = document.getElementById("stat-installs-count");

  async function loadLiveStatsBar() {
    let data = {
      total_pins: 0,
      total_users: 0,
      total_installs: 0,
      browsers: { chrome: 100, firefox: 0, brave: 0, edge: 0, other: 0 },
    };

    if (ENV.SUPABASE_URL && !ENV.SUPABASE_ANON_KEY?.includes("dummy_anon_key")) {
      try {
        const res = await fetch(
          `${ENV.SUPABASE_URL}/rest/v1/telemetry_events?select=event_type,browser,client_id&limit=5000`,
          {
            headers: {
              apikey: ENV.SUPABASE_ANON_KEY,
              Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows)) {
            const pins = rows.filter((r) => r.event_type === "pin_created").length;
            const installs = rows.filter((r) => r.event_type === "install").length;
            const users = new Set(rows.map((r) => r.client_id).filter(Boolean)).size || (pins > 0 ? 1 : 0);
            const chrome = rows.filter((r) => r.browser === "chrome").length;
            const firefox = rows.filter((r) => r.browser === "firefox").length;
            const brave = rows.filter((r) => r.browser === "brave" || r.browser === "edge").length;
            data = {
              total_pins: pins,
              total_users: users,
              total_installs: installs,
              browsers: { chrome, firefox, brave, edge: brave, other: 0 },
            };
          }
        }
      } catch (_) {}
    }

    const pins = data.total_pins || 0;
    const users = data.total_users || 0;
    const installs = data.total_installs || 0;

    if (pinsCountEl) {
      animateCounter(pinsCountEl, pins);
    }
    if (usersCountEl) {
      animateCounter(usersCountEl, users);
    }
    if (installsCountEl) {
      animateCounter(installsCountEl, installs);
    }

    const browsersSummaryEl = document.getElementById("stat-browsers-summary");
    if (browsersSummaryEl && data.browsers) {
      const b = data.browsers;
      const bTotal = (b.chrome || 0) + (b.firefox || 0) + (b.brave || 0) || 1;
      const cPct = Math.round(((b.chrome || 0) / bTotal) * 100);
      const fPct = Math.round(((b.firefox || 0) / bTotal) * 100);
      const bPct = Math.max(0, 100 - cPct - fPct);
      browsersSummaryEl.innerHTML = `
        <span class="browser-pill chrome-pill">Chrome ${cPct}%</span>
        <span class="browser-pill firefox-pill">Firefox ${fPct}%</span>
        <span class="browser-pill brave-pill">Brave ${bPct}%</span>
      `;
    }
  }

  function animateCounter(el: HTMLElement, target: number) {
    const start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function step(time: number) {
      const progress = Math.min((time - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * ease);
      el.textContent = current.toLocaleString() + "+";
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + "+";
    }
    requestAnimationFrame(step);
  }

  loadLiveStatsBar();

  // ── 7. Visitor Country Geolocation & Pageview Telemetry ────────────────────
  async function getVisitorCountry(): Promise<{ country: string; country_code: string } | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch("https://ipwho.is/", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.country) {
          return {
            country: data.country,
            country_code: (data.country_code || "").toUpperCase(),
          };
        }
      }
    } catch (_) {}

    // Fallback: detect region from timezone if network geo is blocked
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.includes("/")) {
        const region = tz.split("/")[0].replace(/_/g, " ");
        return { country: region, country_code: "" };
      }
    } catch (_) {}
    return null;
  }

  async function trackPageView() {
    if (!ENV.SUPABASE_URL || ENV.SUPABASE_ANON_KEY.includes("dummy_anon_key")) return;

    // Track once per session to avoid duplicate counts on page refresh
    const sessionKey = "tm_session_logged_" + new Date().toISOString().slice(0, 10);
    if (sessionStorage.getItem(sessionKey)) return;

    let visitorId = localStorage.getItem("tm_visitor_id");
    if (!visitorId) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        visitorId = crypto.randomUUID();
      } else {
        visitorId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
      }
      localStorage.setItem("tm_visitor_id", visitorId);
    }

    const geo = await getVisitorCountry();
    const payload: Record<string, any> = {
      event_type: "page_view",
      browser: detectedBrowser === "other" ? "chrome" : detectedBrowser,
      client_id: visitorId,
    };

    if (geo?.country) {
      payload.country = geo.country;
      payload.country_code = geo.country_code;
    }

    try {
      const res = await fetch(`${ENV.SUPABASE_URL}/rest/v1/telemetry_events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ENV.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      // If remote database does not have country column yet (PGRST204), retry without country
      if (!res.ok && payload.country) {
        delete payload.country;
        delete payload.country_code;
        await fetch(`${ENV.SUPABASE_URL}/rest/v1/telemetry_events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ENV.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        });
      }

      sessionStorage.setItem(sessionKey, "1");
    } catch (_) {}
  }

  trackPageView();

  // Return teardown function
  return () => {
    if (tickTimer) clearInterval(tickTimer);
    if (themeToggle) themeToggle.removeEventListener("click", handleThemeClick);
    if (langSelect) langSelect.removeEventListener("change", handleLangChange);
    if (heroCard) {
      heroCard.removeEventListener("mouseenter", handleMouseEnter);
      heroCard.removeEventListener("mouseleave", handleMouseLeave);
    }
    if (supporterBtn) supporterBtn.removeEventListener("click", handleDonationClick);
    if (footerSupportLink) footerSupportLink.removeEventListener("click", handleDonationClick);
    if (mediaQuery) mediaQuery.removeEventListener("change", handleSystemThemeChange);
  };
}
