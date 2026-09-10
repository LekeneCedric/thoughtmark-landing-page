/**
 * Thoughtmark Landing Page Environment Configuration
 */

export const ENV = {
  SUPABASE_URL:
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    "https://jazltynmzizdezgyhmxw.supabase.co",
  SUPABASE_ANON_KEY:
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    "sb_publishable_oIhCNUSmcbnDGc4h9MOBgA_OijCgO-n",

  // Fallback baseline for community telemetry if offline
  DEFAULT_STATS: {
    total_pins: 0,
    total_users: 0,
    total_impressions: 0,
    total_installs: 0,
    browsers: {
      chrome: 100,
      firefox: 0,
      edge: 0,
      other: 0,
    },
    recent_pins_24h: 0,
    recent_installs_24h: 0,
  },
};
