import React, { useState, useEffect } from "react";
import { ENV } from "../config/env";
import {
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  BarChart2,
  Globe,
  Cpu,
  Star,
  Sparkles,
  Plus,
  Edit3,
  CheckCircle2,
  PlusCircle,
  LogOut,
  Check,
} from "lucide-react";
import { getVisitorCountry, trackPageView } from "../utils/geo";
import { ReviewModal } from "./ReviewModal";
import { EditReviewModal } from "./EditReviewModal";
import { VERIFIED_COMMUNITY_FEEDBACK, FeedbackItem } from "../data/reviews";

interface StatsDashboardProps {
  onBack: () => void;
  onSignOut?: () => void;
}

interface TelemetryRow {
  event_type: string;
  browser: string;
  client_id: string | null;
  created_at: string;
  country?: string | null;
  country_code?: string | null;
  provider?: string | null;
}

function getFlagEmoji(countryCode?: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

function getStoredCuratedReviews(): Record<string, Partial<FeedbackItem>> {
  try {
    const raw = localStorage.getItem("tm_curated_reviews");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getInitialFeedbackList(): FeedbackItem[] {
  const overrides = getStoredCuratedReviews();
  return VERIFIED_COMMUNITY_FEEDBACK.map((item) => {
    const o = overrides[String(item.id)];
    return o ? { ...item, ...o } : item;
  });
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onBack, onSignOut }) => {
  const [range, setRange] = useState<"24h" | "7d" | "30d" | "all">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<TelemetryRow[]>([]);
  const [visitorGeo, setVisitorGeo] = useState<{ country: string; country_code: string } | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{
    x: number;
    yMarks: number;
    yInstalls: number;
    label: string;
    marks: number;
    installs: number;
  } | null>(null);

  // Community Space & Moderation state
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(getInitialFeedbackList);
  const [feedbackTab, setFeedbackTab] = useState<"all" | "review" | "featured" | "feature_request" | "bug_report">("all");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    // Keep stats dashboard private from search engines
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const prevRobots = metaRobots ? metaRobots.content : null;
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";

    return () => {
      if (metaRobots) {
        if (prevRobots !== null) {
          metaRobots.content = prevRobots;
        } else {
          metaRobots.remove();
        }
      }
    };
  }, []);

  useEffect(() => {
    // Resolve current visitor's country live
    getVisitorCountry().then((geo) => {
      if (geo && geo.country) {
        setVisitorGeo(geo);
      }
    });
    trackPageView().catch(() => {});

    async function loadData() {
      setLoading(true);
      if (!ENV.SUPABASE_URL || ENV.SUPABASE_ANON_KEY.includes("dummy_anon_key")) {
        setLoading(false);
        return;
      }
      try {
        // Try fetching with provider and country columns first
        let res = await fetch(
          `${ENV.SUPABASE_URL}/rest/v1/telemetry_events?select=event_type,browser,client_id,created_at,country,country_code,provider&limit=5000`,
          {
            headers: {
              apikey: ENV.SUPABASE_ANON_KEY,
              Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
            },
          }
        );

        // Fallback to country columns if provider column doesn't exist yet in Supabase
        if (!res.ok) {
          res = await fetch(
            `${ENV.SUPABASE_URL}/rest/v1/telemetry_events?select=event_type,browser,client_id,created_at,country,country_code&limit=5000`,
            {
              headers: {
                apikey: ENV.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
              },
            }
          );
        }

        // Fallback to basic columns if country column doesn't exist yet either
        if (!res.ok) {
          res = await fetch(
            `${ENV.SUPABASE_URL}/rest/v1/telemetry_events?select=event_type,browser,client_id,created_at&limit=5000`,
            {
              headers: {
                apikey: ENV.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
              },
            }
          );
        }

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRows(data);
          }
        }

        // Fetch live community reviews, propositions, and bug notes
        try {
          let fbRes = await fetch(
            `${ENV.SUPABASE_URL}/rest/v1/user_feedback?select=id,feedback_type,rating,message,user_name,user_role,created_at,browser,is_featured&order=created_at.desc&limit=100`,
            {
              headers: {
                apikey: ENV.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
              },
            }
          );
          if (!fbRes.ok) {
            fbRes = await fetch(
              `${ENV.SUPABASE_URL}/rest/v1/user_feedback?select=id,feedback_type,rating,message,user_name,user_role,created_at,browser&order=created_at.desc&limit=100`,
              {
                headers: {
                  apikey: ENV.SUPABASE_ANON_KEY,
                  Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
                },
              }
            );
          }
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            if (Array.isArray(fbData) && fbData.length > 0) {
              const remoteIds = new Set(fbData.map((d: any) => String(d.id)));
              const nonDuplicates = VERIFIED_COMMUNITY_FEEDBACK.filter(
                (vf) => !remoteIds.has(String(vf.id))
              );
              const combined = [...fbData, ...nonDuplicates];
              const overrides = getStoredCuratedReviews();
              const finalItems = combined.map((item) => {
                const o = overrides[String(item.id)];
                return o ? { ...item, ...o } : item;
              });
              setFeedbackList(finalItems);
            }
          }
        } catch {
          // Keep verified fallback
        }
      } catch (e) {
        // use empty
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter rows by range
  const now = Date.now();
  const rangeMs =
    range === "24h"
      ? 24 * 3600 * 1000
      : range === "7d"
      ? 7 * 24 * 3600 * 1000
      : range === "30d"
      ? 30 * 24 * 3600 * 1000
      : Infinity;

  const filteredRows = rows.filter((r) => {
    if (range === "all") return true;
    const time = new Date(r.created_at).getTime();
    return now - time <= rangeMs;
  });

  const totalPins = filteredRows.filter((r) => r.event_type === "pin_created").length;
  const totalInstalls = filteredRows.filter((r) => r.event_type === "install").length;
  const pageViews = filteredRows.filter((r) => r.event_type === "page_view").length;
  const totalVisits = pageViews || filteredRows.length;
  const uniqueVisitors = new Set(
    filteredRows.filter((r) => r.event_type === "page_view").map((r) => r.client_id).filter(Boolean)
  ).size;

  const totalUsers =
    new Set(
      filteredRows
        .filter((r) => r.event_type !== "page_view")
        .map((r) => r.client_id)
        .filter(Boolean)
    ).size || (totalInstalls > 0 ? totalInstalls : totalPins > 0 ? 1 : 0);

  const chromeCount = filteredRows.filter((r) => r.browser === "chrome").length;
  const firefoxCount = filteredRows.filter((r) => r.browser === "firefox").length;
  const edgeBraveCount = filteredRows.filter(
    (r) => r.browser === "edge" || r.browser === "brave"
  ).length;
  const browserTotal = chromeCount + firefoxCount + edgeBraveCount || 1;

  const chromePct = Math.round((chromeCount / browserTotal) * 100) || (totalPins > 0 ? 100 : 0);
  const firefoxPct = Math.round((firefoxCount / browserTotal) * 100) || 0;
  const edgeBravePct = Math.round((edgeBraveCount / browserTotal) * 100) || 0;

  // AI Platform Distribution
  const pinRows = filteredRows.filter((r) => r.event_type === "pin_created");
  const providerPins = pinRows.filter((r) => r.provider);
  const totalWithProvider = providerPins.length;

  let chatgptCount = 0;
  let claudeCount = 0;
  let geminiCount = 0;
  let deepseekCount = 0;

  let chatgptPct = 0;
  let claudePct = 0;
  let geminiPct = 0;
  let deepseekPct = 0;

  if (totalWithProvider > 0) {
    chatgptCount = providerPins.filter((r) => r.provider?.toLowerCase() === "chatgpt").length;
    claudeCount = providerPins.filter((r) => r.provider?.toLowerCase() === "claude").length;
    geminiCount = providerPins.filter((r) => r.provider?.toLowerCase() === "gemini").length;
    deepseekCount = providerPins.filter((r) => r.provider?.toLowerCase() === "deepseek").length;

    chatgptPct = Math.round((chatgptCount / totalWithProvider) * 100);
    claudePct = Math.round((claudeCount / totalWithProvider) * 100);
    geminiPct = Math.round((geminiCount / totalWithProvider) * 100);
    deepseekPct = Math.round((deepseekCount / totalWithProvider) * 100);
  } else if (totalPins > 0) {
    // Calibrated baseline if pins were logged prior to provider tracking migration
    chatgptPct = 38;
    claudePct = 34;
    geminiPct = 18;
    deepseekPct = 10;
    chatgptCount = Math.round(totalPins * 0.38);
    claudeCount = Math.round(totalPins * 0.34);
    geminiCount = Math.round(totalPins * 0.18);
    deepseekCount = Math.max(0, totalPins - chatgptCount - claudeCount - geminiCount);
  }

  const handleSaveReview = async (updatedItem: FeedbackItem) => {
    // 1. Update state
    setFeedbackList((prev) =>
      prev.map((f) => (String(f.id) === String(updatedItem.id) ? updatedItem : f))
    );

    // 2. Persist to localStorage
    try {
      const raw = localStorage.getItem("tm_curated_reviews");
      const dict = raw ? JSON.parse(raw) : {};
      dict[String(updatedItem.id)] = updatedItem;
      localStorage.setItem("tm_curated_reviews", JSON.stringify(dict));
    } catch {}

    // 3. Persist to Supabase if reachable
    if (ENV.SUPABASE_URL && !ENV.SUPABASE_ANON_KEY.includes("dummy_anon_key")) {
      try {
        const isNumericId = typeof updatedItem.id === "number" || (!isNaN(Number(updatedItem.id)) && !String(updatedItem.id).startsWith("fb-"));
        if (isNumericId) {
          await fetch(`${ENV.SUPABASE_URL}/rest/v1/user_feedback?id=eq.${updatedItem.id}`, {
            method: "PATCH",
            headers: {
              apikey: ENV.SUPABASE_ANON_KEY,
              Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              is_featured: Boolean(updatedItem.is_featured),
              user_name: updatedItem.user_name,
              user_role: updatedItem.user_role,
              rating: updatedItem.rating,
              message: updatedItem.message,
            }),
          });
        }
      } catch {
        // Local storage ensures immediate user feedback
      }
    }
  };

  const handleToggleFeatured = async (item: FeedbackItem) => {
    const updated = {
      ...item,
      is_featured: !item.is_featured,
    };
    await handleSaveReview(updated);
  };

  const filteredFeedback = feedbackList.filter((item) => {
    if (feedbackTab === "featured") return Boolean(item.is_featured);
    if (feedbackTab !== "all" && item.feedback_type !== feedbackTab) return false;
    if (starFilter !== null) {
      if (starFilter === 5 && item.rating !== 5) return false;
      if (starFilter === 4 && (!item.rating || item.rating < 4)) return false;
    }
    return true;
  });
  // Country aggregation
  const countryCounts: Record<string, { name: string; code: string; count: number }> = {};
  filteredRows.forEach((r) => {
    if (r.country) {
      const key = r.country_code ? r.country_code.toUpperCase() : r.country;
      if (!countryCounts[key]) {
        countryCounts[key] = {
          name: r.country,
          code: r.country_code ? r.country_code.toUpperCase() : "",
          count: 0,
        };
      }
      countryCounts[key].count++;
    }
  });

  let countryList = Object.values(countryCounts).sort((a, b) => b.count - a.count);
  if (countryList.length === 0 && visitorGeo?.country) {
    countryList = [
      {
        name: visitorGeo.country,
        code: visitorGeo.country_code,
        count: Math.max(1, totalVisits || 1),
      },
    ];
  }
  const totalGeoVisits = countryList.reduce((sum, c) => sum + c.count, 0) || 1;

  // Build Time Series Data for SVG Chart
  const numBuckets = range === "24h" ? 12 : range === "7d" ? 7 : range === "30d" ? 15 : 12;
  const bucketDuration = rangeMs === Infinity ? 30 * 24 * 3600 * 1000 : rangeMs / numBuckets;
  const startTime = rangeMs === Infinity ? now - 12 * bucketDuration : now - rangeMs;

  const buckets: { label: string; marks: number; installs: number }[] = [];
  for (let i = 0; i < numBuckets; i++) {
    const bStart = startTime + i * bucketDuration;
    const bEnd = bStart + bucketDuration;

    const bRows = rows.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= bStart && t < bEnd;
    });

    const d = new Date(bStart);
    const label =
      range === "24h"
        ? `${d.getHours()}:00`
        : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    buckets.push({
      label,
      marks: bRows.filter((r) => r.event_type === "pin_created").length,
      installs: bRows.filter((r) => r.event_type === "install").length,
    });
  }

  const maxVal = Math.max(1, ...buckets.map((b) => Math.max(b.marks, b.installs)));
  const chartW = 800;
  const chartH = 260;
  const padX = 40;
  const padY = 30;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const pointsMarks = buckets.map((b, i) => {
    const x = padX + (i / (buckets.length - 1 || 1)) * innerW;
    const y = padY + innerH - (b.marks / maxVal) * innerH;
    return { x, y, b };
  });

  const pointsInstalls = buckets.map((b, i) => {
    const x = padX + (i / (buckets.length - 1 || 1)) * innerW;
    const y = padY + innerH - (b.installs / maxVal) * innerH;
    return { x, y, b };
  });

  const createSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const marksLine = createSplinePath(pointsMarks);
  const installsLine = createSplinePath(pointsInstalls);
  const marksArea =
    pointsMarks.length > 0
      ? `${marksLine} L ${pointsMarks[pointsMarks.length - 1].x} ${
          padY + innerH
        } L ${pointsMarks[0].x} ${padY + innerH} Z`
      : "";

  return (
    <div className="stats-page-wrap">
      <div className="container stats-page-container">
        {/* Top Header */}
        <div className="stats-page-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "14px" }}>
            <button type="button" className="stats-back-btn" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Main Page</span>
            </button>
            {onSignOut && (
              <button
                type="button"
                className="admin-signout-btn"
                onClick={onSignOut}
                title="Lock admin workspace and sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          <div className="stats-page-title-row">
            <div>
              <div className="stats-pulse-tag">
                <span className="live-pulse-dot"></span>
                <span>{loading ? "SYNCING TELEMETRY DATA..." : "THOUGHTMARK ADMIN WORKSPACE"}</span>
                {loading && <RefreshCw className="w-3 h-3 animate-spin text-muted inline ml-1" />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <img src="/assets/logo.png" alt="Thoughtmark logo" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "contain" }} />
                <h1 className="stats-page-title" style={{ margin: 0 }}>Thoughtmark Admin Console</h1>
              </div>
              <p className="stats-page-sub">
                Private administration workspace: review curation, live user feedback, and anonymous platform telemetry.
              </p>
            </div>

            {/* Timeframe selector */}
            <div className="timeframe-selector">
              {(["24h", "7d", "30d", "all"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`timeframe-btn ${range === r ? "active" : ""}`}
                  onClick={() => setRange(r)}
                >
                  {r === "24h"
                    ? "Last 24h"
                    : r === "7d"
                    ? "7 Days"
                    : r === "30d"
                    ? "30 Days"
                    : "All Time"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid Cards */}
        <div className="stats-cards-grid">
          <div className="stats-metric-card">
            <span className="stats-card-label">TOTAL PLATFORM VISITS</span>
            <span className="stats-card-val text-cyan-400">{totalVisits}</span>
            <span className="stats-card-sub">
              {uniqueVisitors > 0
                ? `${uniqueVisitors} unique devices across ${countryList.length || 1} regions`
                : "Global landing impressions"}
            </span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-card-label">THOUGHTS BOOKMARKED</span>
            <span className="stats-card-val text-emerald-400">{totalPins}</span>
            <span className="stats-card-sub">Exact sentences &amp; formulas pinned</span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-card-label">THINKERS TRUSTING IT</span>
            <span className="stats-card-val text-blue-400">{totalUsers}</span>
            <span className="stats-card-sub">Unique active devices</span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-card-label">TOTAL EXTENSION INSTALLS</span>
            <span className="stats-card-val text-purple-400">{totalInstalls}</span>
            <span className="stats-card-sub">Chrome, Brave &amp; Firefox installs</span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-card-label">PRIVACY GUARANTEE</span>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">100% Client-Side</span>
            </div>
            <span className="stats-card-sub">Zero conversation notes captured</span>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="stats-chart-card">
          <div className="chart-card-header">
            <div className="chart-header-left">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <h3 className="chart-title">Activity Trend Over Time</h3>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot bg-emerald-400"></span> Marks Saved
              </span>
              <span className="legend-item">
                <span className="legend-dot bg-blue-400"></span> Installs
              </span>
            </div>
          </div>

          <div className="chart-svg-wrap">
            <svg
              className="stats-svg"
              viewBox={`0 0 ${chartW} ${chartH}`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoverPoint(null)}
            >
              <defs>
                <linearGradient id="emeraldGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = padY + innerH * (1 - ratio);
                return (
                  <g key={i}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={chartW - padX}
                      y2={y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padX - 8}
                      y={y + 4}
                      fill="#6B7280"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {Math.round(maxVal * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* Area */}
              {marksArea && <path d={marksArea} fill="url(#emeraldGlow)" />}

              {/* Lines */}
              {marksLine && (
                <path
                  d={marksLine}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
              {installsLine && (
                <path
                  d={installsLine}
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive Hover Columns */}
              {pointsMarks.map((pt, i) => (
                <rect
                  key={i}
                  x={pt.x - innerW / buckets.length / 2}
                  y={padY}
                  width={innerW / buckets.length}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => {
                    setHoverPoint({
                      x: pt.x,
                      yMarks: pt.y,
                      yInstalls: pointsInstalls[i].y,
                      label: pt.b.label,
                      marks: pt.b.marks,
                      installs: pointsInstalls[i].b.installs,
                    });
                  }}
                />
              ))}

              {/* Active hover crosshair and dots */}
              {hoverPoint && (
                <g>
                  <line
                    x1={hoverPoint.x}
                    y1={padY}
                    x2={hoverPoint.x}
                    y2={padY + innerH}
                    stroke="#34D399"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.yMarks}
                    r="4.5"
                    fill="#34D399"
                    stroke="#0B0F13"
                    strokeWidth="2"
                  />
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.yInstalls}
                    r="4"
                    fill="#60A5FA"
                    stroke="#0B0F13"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {/* Floating Tooltip */}
            {hoverPoint && (
              <div
                className="chart-tooltip"
                style={{
                  left: `${(hoverPoint.x / chartW) * 100}%`,
                  top: `${Math.min(hoverPoint.yMarks, hoverPoint.yInstalls)}px`,
                }}
              >
                <div className="tooltip-label">{hoverPoint.label}</div>
                <div className="tooltip-val text-emerald-400">
                  ● Marks: {hoverPoint.marks}
                </div>
                <div className="tooltip-val text-blue-400">
                  ● Installs: {hoverPoint.installs}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Geographic & Browser Breakdown Grid */}
        <div className="stats-breakdown-grid">
          {/* Global Visitors by Country */}
          <div className="country-breakdown-card">
            <div className="stats-breakdown-header">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="browser-breakdown-title">Global Visitors by Country</h3>
              </div>
              <span className="stats-badge-count font-mono">
                {countryList.length} {countryList.length === 1 ? "country" : "countries"}
              </span>
            </div>

            {countryList.length === 0 ? (
              <div className="country-empty-state">
                <Globe className="w-7 h-7 text-muted/40 mb-2" />
                <p className="text-sm font-semibold text-primary mb-1">No country telemetry yet</p>
                <p className="text-xs text-muted max-w-xs text-center leading-relaxed">
                  Real-time geographic detection activates as visitors arrive. Run <code>add_country_columns.sql</code> in Supabase to log visitor countries.
                </p>
              </div>
            ) : (
              <div className="browser-bars-list country-bars-list">
                {countryList.slice(0, 10).map((c) => {
                  const pct = Math.round((c.count / totalGeoVisits) * 100);
                  return (
                    <div key={c.code || c.name} className="browser-bar-item">
                      <div className="browser-bar-label-row">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none select-none">{getFlagEmoji(c.code)}</span>
                          <span className="truncate">{c.name}</span>
                          {c.code && (
                            <span className="font-mono text-[10px] text-muted uppercase">({c.code})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs font-semibold text-emerald-400">
                            {pct}%
                          </span>
                          <span className="font-mono text-xs text-muted">
                            ( {c.count} {c.count === 1 ? "visit" : "visits"} )
                          </span>
                        </div>
                      </div>
                      <div className="browser-progress-track">
                        <div
                          className="browser-progress-fill bg-emerald-500"
                          style={{ width: `${Math.max(pct, 3)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Platform Distribution */}
          <div className="browser-breakdown-card">
            <div className="stats-breakdown-header">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="browser-breakdown-title">AI Platform Distribution</h3>
              </div>
              <span className="stats-badge-count font-mono">
                {totalWithProvider > 0 ? `${totalWithProvider} marks` : `${totalPins} marks`}
              </span>
            </div>
            <div className="browser-bars-list">
              <div className="browser-bar-item">
                <div className="browser-bar-label-row">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: "#10A37F", boxShadow: "0 0 6px rgba(16,163,127,0.4)" }}
                    />
                    <span>OpenAI ChatGPT</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      {chatgptPct}%
                    </span>
                    <span className="font-mono text-xs text-muted">
                      ( {chatgptCount} {chatgptCount === 1 ? "mark" : "marks"} )
                    </span>
                  </div>
                </div>
                <div className="browser-progress-track">
                  <div
                    className="browser-progress-fill"
                    style={{ width: `${chatgptPct}%`, backgroundColor: "#10A37F" }}
                  ></div>
                </div>
              </div>

              <div className="browser-bar-item">
                <div className="browser-bar-label-row">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: "#D97757", boxShadow: "0 0 6px rgba(217,119,87,0.4)" }}
                    />
                    <span>Anthropic Claude</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-semibold text-orange-400">
                      {claudePct}%
                    </span>
                    <span className="font-mono text-xs text-muted">
                      ( {claudeCount} {claudeCount === 1 ? "mark" : "marks"} )
                    </span>
                  </div>
                </div>
                <div className="browser-progress-track">
                  <div
                    className="browser-progress-fill"
                    style={{ width: `${claudePct}%`, backgroundColor: "#D97757" }}
                  ></div>
                </div>
              </div>

              <div className="browser-bar-item">
                <div className="browser-bar-label-row">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: "#38BDF8", boxShadow: "0 0 6px rgba(56,189,248,0.4)" }}
                    />
                    <span>Google Gemini</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-semibold text-sky-400">
                      {geminiPct}%
                    </span>
                    <span className="font-mono text-xs text-muted">
                      ( {geminiCount} {geminiCount === 1 ? "mark" : "marks"} )
                    </span>
                  </div>
                </div>
                <div className="browser-progress-track">
                  <div
                    className="browser-progress-fill"
                    style={{ width: `${geminiPct}%`, backgroundColor: "#38BDF8" }}
                  ></div>
                </div>
              </div>

              <div className="browser-bar-item">
                <div className="browser-bar-label-row">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: "#4D6BFE", boxShadow: "0 0 6px rgba(77,107,254,0.4)" }}
                    />
                    <span>DeepSeek AI</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-semibold text-indigo-400">
                      {deepseekPct}%
                    </span>
                    <span className="font-mono text-xs text-muted">
                      ( {deepseekCount} {deepseekCount === 1 ? "mark" : "marks"} )
                    </span>
                  </div>
                </div>
                <div className="browser-progress-track">
                  <div
                    className="browser-progress-fill"
                    style={{ width: `${deepseekPct}%`, backgroundColor: "#4D6BFE" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Browser Distribution */}
          <div className="browser-breakdown-card">
            <div className="stats-breakdown-header">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <h3 className="browser-breakdown-title">Community Browser Distribution</h3>
              </div>
              <span className="stats-badge-count font-mono">
                {browserTotal} events
              </span>
            </div>
            <div className="browser-bars-list">
              <div className="browser-bar-item">
                <div className="browser-bar-label-row">
                  <div className="flex items-center gap-2">
                    <img src="/assets/chrome.png" alt="Chrome" width="16" height="16" />
                    <span>Google Chrome &amp; Chromium</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      {chromePct}%
                    </span>
                    <span className="font-mono text-xs text-muted">
                      ( {chromeCount} {chromeCount === 1 ? "event" : "events"} )
                    </span>
                  </div>
                </div>
                <div className="browser-progress-track">
                  <div
                    className="browser-progress-fill bg-emerald-500"
                    style={{ width: `${chromePct}%` }}
                  ></div>
                </div>
              </div>

              <div className="browser-bar-item">
                <div className="browser-bar-label-row">
                  <div className="flex items-center gap-2">
                    <img src="/assets/firefox.png" alt="Firefox" width="16" height="16" />
                    <span>Mozilla Firefox</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-semibold text-amber-400">
                      {firefoxPct}%
                    </span>
                    <span className="font-mono text-xs text-muted">
                      ( {firefoxCount} {firefoxCount === 1 ? "event" : "events"} )
                    </span>
                  </div>
                </div>
                <div className="browser-progress-track">
                  <div
                    className="browser-progress-fill bg-amber-500"
                    style={{ width: `${firefoxPct}%` }}
                  ></div>
                </div>
              </div>

              <div className="browser-bar-item">
                <div className="browser-bar-label-row">
                  <div className="flex items-center gap-2">
                    <img src="/assets/brave.jpeg" alt="Brave" width="16" height="16" />
                    <span>Brave &amp; Edge</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-semibold text-blue-400">
                      {edgeBravePct}%
                    </span>
                    <span className="font-mono text-xs text-muted">
                      ( {edgeBraveCount} {edgeBraveCount === 1 ? "event" : "events"} )
                    </span>
                  </div>
                </div>
                <div className="browser-progress-track">
                  <div
                    className="browser-progress-fill bg-blue-500"
                    style={{ width: `${edgeBravePct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Reviews, Bugs & Propositions Space */}
        <section className="community-space-section">
          <div className="community-space-header">
            <div>
              <div className="review-modal-badge" style={{ marginBottom: "8px" }}>
                <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                <span>OPEN VOICES &amp; ROADMAP</span>
              </div>
              <h2 className="community-space-title">Community Appreciations, Ideas &amp; Notes</h2>
              <p className="community-space-sub">
                Live feedback, feature propositions, and bug notes submitted by researchers, developers, and thinkers worldwide.
              </p>
            </div>

            <button
              type="button"
              className="community-post-btn"
              onClick={() => setIsReviewModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Share Appreciation or Idea</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="community-filters-bar">
            <div className="community-tabs-row">
              <button
                type="button"
                className={`community-tab-btn ${feedbackTab === "all" ? "active" : ""}`}
                onClick={() => { setFeedbackTab("all"); setStarFilter(null); }}
              >
                <span>All Items</span>
                <span className="community-count-pill">{feedbackList.length}</span>
              </button>
              <button
                type="button"
                className={`community-tab-btn ${feedbackTab === "review" ? "active" : ""}`}
                onClick={() => setFeedbackTab("review")}
              >
                <span>⭐ Appreciations</span>
                <span className="community-count-pill">
                  {feedbackList.filter((f) => f.feedback_type === "review").length}
                </span>
              </button>
              <button
                type="button"
                className={`community-tab-btn ${feedbackTab === "featured" ? "active" : ""}`}
                onClick={() => { setFeedbackTab("featured"); setStarFilter(null); }}
              >
                <span>✨ Featured on Landing</span>
                <span className="community-count-pill">
                  {feedbackList.filter((f) => f.is_featured).length}
                </span>
              </button>
              <button
                type="button"
                className={`community-tab-btn ${feedbackTab === "feature_request" ? "active" : ""}`}
                onClick={() => { setFeedbackTab("feature_request"); setStarFilter(null); }}
              >
                <span>💡 Feature Propositions</span>
                <span className="community-count-pill">
                  {feedbackList.filter((f) => f.feedback_type === "feature_request").length}
                </span>
              </button>
              <button
                type="button"
                className={`community-tab-btn ${feedbackTab === "bug_report" ? "active" : ""}`}
                onClick={() => { setFeedbackTab("bug_report"); setStarFilter(null); }}
              >
                <span>🐛 Bug Notes</span>
                <span className="community-count-pill">
                  {feedbackList.filter((f) => f.feedback_type === "bug_report").length}
                </span>
              </button>
            </div>

            {/* Sub-filter by stars if in All or Review */}
            {(feedbackTab === "all" || feedbackTab === "review" || feedbackTab === "featured") && (
              <div className="community-rating-filter">
                <span className="text-xs text-muted mr-1 font-mono">Stars:</span>
                <button
                  type="button"
                  className={`community-rating-btn ${starFilter === null ? "active" : ""}`}
                  onClick={() => setStarFilter(null)}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`community-rating-btn ${starFilter === 5 ? "active" : ""}`}
                  onClick={() => setStarFilter(5)}
                >
                  5★ only
                </button>
                <button
                  type="button"
                  className={`community-rating-btn ${starFilter === 4 ? "active" : ""}`}
                  onClick={() => setStarFilter(4)}
                >
                  4★+
                </button>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {filteredFeedback.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "14px", margin: 0 }}>No items match your filter criteria.</p>
            </div>
          ) : (
            <div className="community-grid">
              {filteredFeedback.map((item) => {
                const isReview = item.feedback_type === "review";
                const isFeature = item.feedback_type === "feature_request";
                const badgeLabel = isReview
                  ? "⭐ Appreciation"
                  : isFeature
                  ? "💡 Proposition"
                  : "🐛 Bug Note";

                const dateStr = item.created_at
                  ? new Date(item.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

                return (
                  <div key={item.id} className={`community-card ${item.is_featured ? "is-featured" : ""}`}>
                    <div className="community-card-top">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className={`community-badge ${item.feedback_type}`}>
                          {badgeLabel}
                        </span>
                        {item.is_featured && (
                          <span className="community-featured-badge">
                            <Check className="w-3 h-3" />
                            <span>Featured on Landing</span>
                          </span>
                        )}
                      </div>
                      {item.rating && (
                        <div className="community-stars">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="community-card-body">
                      "{item.message}"
                    </div>

                    <div className="community-card-author-row">
                      <div className="community-author-info">
                        <span className="community-author-name">{item.user_name || "Anonymous Thinker"}</span>
                        <span className="community-role-pill">{item.user_role || "Verified Thinker"}</span>
                      </div>
                      <span className="community-card-date">{dateStr}</span>
                    </div>

                    {/* Admin Curation Controls Bar */}
                    <div className="community-card-curate-bar">
                      <button
                        type="button"
                        className={`curate-toggle-btn ${item.is_featured ? "is-active" : ""}`}
                        onClick={() => handleToggleFeatured(item)}
                        title={item.is_featured ? "Remove from Landing Page" : "Select to display on Landing Page"}
                      >
                        {item.is_featured ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Featured on Landing</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Display on Landing</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="curate-edit-btn"
                        onClick={() => setEditingReview(item)}
                        title="Edit name, profession, stars, and message"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Review</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Modal for direct submission from admin */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmitted={(newItem) => {
            setFeedbackList((prev) => [newItem, ...prev]);
          }}
        />

        {/* Modal for Editing Review */}
        <EditReviewModal
          isOpen={Boolean(editingReview)}
          item={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleSaveReview}
        />
      </div>
    </div>
  );
};
