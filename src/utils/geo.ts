/**
 * Visitor Geolocation & Analytics Telemetry
 * Resolves visitor country name and ISO 2-letter country code with multi-tier fallbacks:
 * 1. Fast IP-lookup API (ipwho.is)
 * 2. Secondary API (country.is)
 * 3. Browser timezone-to-country heuristic (instant, 100% offline-tolerant)
 */

import { ENV } from "../config/env";

const TIMEZONE_TO_COUNTRY: Record<string, { country: string; code: string }> = {
  "Africa/Douala": { country: "Cameroon", code: "CM" },
  "Africa/Yaounde": { country: "Cameroon", code: "CM" },
  "Africa/Lagos": { country: "Nigeria", code: "NG" },
  "Africa/Nairobi": { country: "Kenya", code: "KE" },
  "Africa/Johannesburg": { country: "South Africa", code: "ZA" },
  "Africa/Cairo": { country: "Egypt", code: "EG" },
  "Africa/Casablanca": { country: "Morocco", code: "MA" },
  "Africa/Dakar": { country: "Senegal", code: "SN" },
  "Africa/Abidjan": { country: "Ivory Coast", code: "CI" },
  "Africa/Accra": { country: "Ghana", code: "GH" },
  "Europe/Paris": { country: "France", code: "FR" },
  "Europe/London": { country: "United Kingdom", code: "GB" },
  "Europe/Berlin": { country: "Germany", code: "DE" },
  "Europe/Madrid": { country: "Spain", code: "ES" },
  "Europe/Rome": { country: "Italy", code: "IT" },
  "Europe/Amsterdam": { country: "Netherlands", code: "NL" },
  "Europe/Brussels": { country: "Belgium", code: "BE" },
  "Europe/Zurich": { country: "Switzerland", code: "CH" },
  "America/New_York": { country: "United States", code: "US" },
  "America/Chicago": { country: "United States", code: "US" },
  "America/Denver": { country: "United States", code: "US" },
  "America/Los_Angeles": { country: "United States", code: "US" },
  "America/Phoenix": { country: "United States", code: "US" },
  "America/Toronto": { country: "Canada", code: "CA" },
  "America/Vancouver": { country: "Canada", code: "CA" },
  "America/Montreal": { country: "Canada", code: "CA" },
  "America/Sao_Paulo": { country: "Brazil", code: "BR" },
  "America/Mexico_City": { country: "Mexico", code: "MX" },
  "Asia/Tokyo": { country: "Japan", code: "JP" },
  "Asia/Shanghai": { country: "China", code: "CN" },
  "Asia/Hong_Kong": { country: "Hong Kong", code: "HK" },
  "Asia/Taipei": { country: "Taiwan", code: "TW" },
  "Asia/Seoul": { country: "South Korea", code: "KR" },
  "Asia/Singapore": { country: "Singapore", code: "SG" },
  "Asia/Kolkata": { country: "India", code: "IN" },
  "Asia/Dubai": { country: "United Arab Emirates", code: "AE" },
  "Australia/Sydney": { country: "Australia", code: "AU" },
  "Australia/Melbourne": { country: "Australia", code: "AU" },
};

const CODE_TO_NAME: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
  CA: "Canada",
  CM: "Cameroon",
  NG: "Nigeria",
  KE: "Kenya",
  ZA: "South Africa",
  JP: "Japan",
  CN: "China",
  IN: "India",
  AU: "Australia",
  BR: "Brazil",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
};

export async function getVisitorCountry(): Promise<{ country: string; country_code: string }> {
  // 1. Try ipwho.is (fast, CORS-open, rich data)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
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

  // 2. Try api.country.is (instant lightweight fallback)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("https://api.country.is/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.country) {
        const code = data.country.toUpperCase();
        const country = CODE_TO_NAME[code] || code;
        return { country, country_code: code };
      }
    }
  } catch (_) {}

  // 3. Fallback: Browser Timezone mapping (zero network calls, 100% reliable)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const match = TIMEZONE_TO_COUNTRY[tz];
    if (match) {
      return { country: match.country, country_code: match.code };
    }
    // Generic timezone continent parsing
    if (tz.includes("/")) {
      const city = tz.split("/")[1]?.replace(/_/g, " ") || "";
      const region = tz.split("/")[0]?.replace(/_/g, " ") || "Global";
      return { country: city || region, country_code: "" };
    }
  } catch (_) {}

  return { country: "Global Visitor", country_code: "" };
}

function getBrowserName(): string {
  if (typeof navigator === "undefined") return "chrome";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("brave")) return "brave";
  if (ua.includes("firefox")) return "firefox";
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("chrome")) return "chrome";
  return "chrome";
}

export async function trackPageView(): Promise<void> {
  if (!ENV.SUPABASE_URL || ENV.SUPABASE_ANON_KEY.includes("dummy_anon_key")) return;

  // Track once per session per day to avoid inflating views on manual refreshes
  const sessionKey = "tm_pv_logged_" + new Date().toISOString().slice(0, 10);
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
    browser: getBrowserName(),
    client_id: visitorId,
  };

  if (geo.country) {
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

    // If Supabase schema does not yet have country column, fallback without country
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
