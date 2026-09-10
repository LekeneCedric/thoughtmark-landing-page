import React, { useEffect, useState } from "react";
import { Star, Sparkles, Plus, Linkedin } from "lucide-react";
import { initLandingScript } from "../scripts/landingScript";
import { ReviewModal } from "./ReviewModal";
import { VERIFIED_COMMUNITY_FEEDBACK, FeedbackItem } from "../data/reviews";
import { ENV } from "../config/env";

interface LandingPageProps {
  onOpenDonation: () => void;
}

function getStoredCuratedOverrides(): Record<string, Partial<FeedbackItem>> {
  try {
    const raw = localStorage.getItem("tm_curated_reviews");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getCuratedLandingReviews(baseList: FeedbackItem[]): FeedbackItem[] {
  const overrides = getStoredCuratedOverrides();
  const merged = baseList.map((item) => {
    const o = overrides[String(item.id)];
    return o ? { ...item, ...o } : item;
  });

  // Display ONLY reviews explicitly marked as featured by admin
  return merged.filter((item) => item.is_featured === true);
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenDonation }) => {
  const [reviewsList, setReviewsList] = useState<FeedbackItem[]>(() =>
    getCuratedLandingReviews(VERIFIED_COMMUNITY_FEEDBACK)
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const cleanup = initLandingScript(onOpenDonation);
    return cleanup;
  }, [onOpenDonation]);

  useEffect(() => {
    async function loadReviews() {
      const overrides = getStoredCuratedOverrides();
      let all: FeedbackItem[] = [...VERIFIED_COMMUNITY_FEEDBACK];

      if (ENV.SUPABASE_URL && !ENV.SUPABASE_ANON_KEY.includes("dummy_anon_key")) {
        try {
          let res = await fetch(
            `${ENV.SUPABASE_URL}/rest/v1/user_feedback?select=id,feedback_type,rating,message,user_name,user_role,created_at,browser,is_featured&feedback_type=eq.review&order=created_at.desc&limit=50`,
            {
              headers: {
                apikey: ENV.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
              },
            }
          );
          if (!res.ok) {
            res = await fetch(
              `${ENV.SUPABASE_URL}/rest/v1/user_feedback?select=id,feedback_type,rating,message,user_name,user_role,created_at,browser&feedback_type=eq.review&order=created_at.desc&limit=50`,
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
            if (Array.isArray(data) && data.length > 0) {
              const remoteIds = new Set(data.map((d: any) => String(d.id)));
              const nonDuplicates = VERIFIED_COMMUNITY_FEEDBACK.filter(
                (vf) => !remoteIds.has(String(vf.id))
              );
              all = [...data, ...nonDuplicates];
            }
          }
        } catch {
          // Keep initial verified reviews
        }
      }

      // Apply overrides and filter strictly to only featured reviews
      const merged = all.map((item) => {
        const o = overrides[String(item.id)];
        return o ? { ...item, ...o } : item;
      });

      const featured = merged.filter((item) => item.is_featured === true);
      setReviewsList(featured);
    }
    loadReviews();
  }, []);

  return (
    <div className="landing-page-root">
      <header className="nav-wrap">
        <nav className="nav">
          <a className="nav-logo" href="#hero">
            <img src="/assets/logo.png" alt="Thoughtmark logo" width="24" height="24" className="nav-logo-icon" style={{ borderRadius: "4px", objectFit: "contain" }} />
            <span className="nav-name">Thoughtmark</span>
          </a>

          <ul className="nav-links">
            <li><a href="#use-cases" data-i18n="navUseCases">Use Cases</a></li>
            <li><a href="#capabilities" data-i18n="navCapabilities">Capabilities</a></li>
            <li><a href="#comparison" data-i18n="navComparison">Comparison</a></li>
            {reviewsList.length > 0 && (
              <li><a href="#reviews">Reviews</a></li>
            )}
            <li><a href="#pricing" data-i18n="navPricing">Pricing</a></li>
            <li><a href="#creator" data-i18n="navCreator">Creator</a></li>
          </ul>

          <div className="nav-right">
            {/* Theme Toggle (Light / Dark) */}
            <button id="theme-toggle" className="theme-toggle-btn" aria-label="Toggle light or dark theme" title="Toggle theme">
              <span className="theme-icon-light">☀️</span>
              <span className="theme-icon-dark">🌙</span>
            </button>

            {/* Language Selector (Desktop) */}
            <div className="lang-dropdown-wrap">
              <select id="lang-select" className="lang-select" aria-label="Select language">
                <option value="en">🌐 English</option>
                <option value="zh">🇨🇳 简体中文</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="ja">🇯🇵 日本語</option>
              </select>
            </div>

            {
              /*
            <a className="nav-cta dynamic-browser-cta" href="#">
              <span className="cta-text">Add to Chrome</span>
            </a>
              * */
            }
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════════════════
       HERO
  ══════════════════════════════════════════════ */}
      <section className="hero" id="hero">
        <div className="hero-bg-glow"></div>
        <div className="container hero-container">
          <div className="hero-content">
            {
              /*
                <div className="hero-badge">
                  <span className="badge-dot"></span>
                  <span data-i18n="heroBadge">100% Private · Your notes stay on your computer</span>
                </div>
               */
            }

            <h1 className="hero-headline">
              <span data-i18n="heroTitle1">Never lose a thought in</span><br />
              <span className="gradient-text serif-accent" data-i18n="heroTitleGradient">long AI conversations</span>
            </h1>

            <p className="hero-sub" data-i18n="heroSub">
              Thoughtmark is the premier bookmark and outline extension for Claude, ChatGPT, Gemini, and DeepSeek. Pin exact sentences, formulas, and code snippets — organized into structured outlines and publication-ready study guides.
            </p>

            {/* Smart Dynamic Browser CTA Action Row */}
            <div className="hero-cta-action-wrap">
              <a className="hero-cta-primary dynamic-browser-cta" href="#">
                <span className="cta-icon"></span>
                <span className="cta-text">Add to Chrome — Free</span>
              </a>
              <a className="hero-cta-secondary" href="#capabilities">
                <span data-i18n="heroCtaSecondary">Explore Capabilities</span>
                <span className="cta-arrow">↓</span>
              </a>
              {
                /*
                 * 
                 *
              <div className="browser-unsupported-note" style={{ display: "none" }}>
                <span>◈</span> Available for Google Chrome &amp; Mozilla Firefox on Desktop.
              </div>
                 */
              }
            </div>

            {/* Dedicated Browser Availability Status Strip (Available Now vs Coming Soon) */}
            <div className="browser-availability-strip">
              <div className="availability-col">
                <div className="availability-header">
                  <span className="status-indicator available"></span>
                  <span className="availability-title" data-i18n="availNowTitle">Available Now</span>
                </div>
                <div className="browser-badges-list">
                  <a className="browser-chip available" href="https://chromewebstore.google.com/detail/thoughtmark/mnmlfccbgcgbhbhpfckfpcfeikkiapom" target="_blank" rel="noopener" title="Install on Google Chrome">
                    <img src="/assets/chrome.png" alt="Google Chrome" width="16" height="16" className="browser-chip-icon" />
                    <span>Chrome</span>
                  </a>
                  {
                    /*
                                <a className="browser-chip available" href="https://addons.mozilla.org/firefox/addon/thoughtmark/" target="_blank" rel="noopener" title="Install on Mozilla Firefox">
                                  <img src="/assets/firefox.png" alt="Mozilla Firefox" width="16" height="16" className="browser-chip-icon" />
                                  <span>Firefox</span>
                                </a>
                                */
                  }
                  <a className="browser-chip available" href="https://chromewebstore.google.com/detail/thoughtmark/mnmlfccbgcgbhbhpfckfpcfeikkiapom" target="_blank" rel="noopener" title="Install on Brave Browser">
                    <img src="/assets/brave.jpeg" alt="Brave Browser" width="16" height="16" className="browser-chip-icon" />
                    <span>Brave</span>
                  </a>
                  <a className="browser-chip available" href="https://chromewebstore.google.com/detail/thoughtmark/mnmlfccbgcgbhbhpfckfpcfeikkiapom" target="_blank" rel="noopener" title="Install on Microsoft Edge">
                    <img src="/assets/edge.svg" alt="Microsoft Edge" width="16" height="16" className="browser-chip-icon" />
                    <span>Edge</span>
                  </a>
                  <a className="browser-chip available" href="https://chromewebstore.google.com/detail/thoughtmark/mnmlfccbgcgbhbhpfckfpcfeikkiapom" target="_blank" rel="noopener" title="Install on Opera Browser">
                    <img src="/assets/opera.jpeg" alt="Opera Browser" width="16" height="16" className="browser-chip-icon" />
                    <span>Opera</span>
                  </a>
                </div>
              </div>

              <div className="availability-vsep"></div>

              <div className="availability-col">
                <div className="availability-header">
                  <span className="status-indicator soon"></span>
                  <span className="availability-title" data-i18n="availSoonTitle">Coming Soon</span>
                </div>
                <div className="browser-badges-list">
                  <span className="browser-chip soon" title="Apple Safari (In Development)">
                    <img src="/assets/safari.jpeg" alt="Apple Safari" width="16" height="16" className="browser-chip-icon" />
                    <span>Safari</span>
                    <span className="chip-soon-tag">Soon</span>
                  </span>

                  <span className="browser-chip soon" title="Apple Safari (In Development)">
                    <img src="/assets/firefox.png" alt="Mozilla Firefox" width="16" height="16" className="browser-chip-icon" />
                    <span>Firefox</span>
                    <span className="chip-soon-tag">Soon</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="browser-note-text">
              <span data-i18n="browserNote">Works on Claude, ChatGPT, Gemini &amp; DeepSeek · No account required</span>
            </div>

            <div className="trust-row">
              <span className="trust-item">✓ <span data-i18n="trust1">Free Forever</span></span>
              <span className="trust-sep">·</span>
              <span className="trust-item">✓ <span data-i18n="trust2">Zero Tracking or Accounts</span></span>
              <span className="trust-sep">·</span>
              <span className="trust-item">✓ <span data-i18n="trust3">Claude · ChatGPT · Gemini · DeepSeek</span></span>
              <span className="trust-sep">·</span>
              <span className="trust-item">✓ <span data-i18n="trust4">PDF &amp; Markdown Export</span></span>
            </div>
          </div>

          {/* Live Rotating Preview Card (10 Topics) */}
          <div className="hero-preview-card" id="hero-preview-card">
            <div className="preview-header">
              <div className="preview-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="preview-tab-title" id="card-tab-title">claude.ai / chat / immunology-and-vaccines</div>
              <div className="preview-topic-badge" id="card-topic-badge">Medicine &amp; Biology</div>
            </div>

            <div className="preview-chat-body">
              <div className="preview-msg-assistant">
                <p id="card-chat-text">
                  <span id="card-lead">Upon secondary exposure to the pathogen, </span><mark className="preview-highlight" id="card-highlight">memory B cells rapidly differentiate into plasma cells that produce high-affinity neutralizing antibodies.</mark><span id="card-trail"> This accelerated response clears the infection before clinical symptoms develop.</span>
                  <span className="preview-floating-pill">
                    <span className="pill-dot">◈</span> Mark <span className="pill-shortcut">Alt+M</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Sidebar Panel Inset */}
            <div className="preview-sidebar-inset">
              <div className="mockup-header">
                <span className="mockup-title" data-i18n="mockupTitle">◈ THOUGHTMARK</span>
                <div className="carousel-dots" id="carousel-dots">
                  {/* 10 dot indicators generated dynamically */}
                </div>
              </div>
              <div className="mockup-tree" id="card-tree-nodes">
                {/* Tree nodes injected dynamically */}
              </div>
              <div className="mockup-footer">
                <span className="mockup-count" data-i18n="mockupFooterCount">3 marks</span>
                <span className="mockup-board-link" data-i18n="mockupFooterBoard">Open Board ↗</span>
              </div>
            </div>

            {/* 10-Second Countdown Progression Bar */}
            <div className="preview-progress-bar-wrap" title="Next topic in 10s">
              <div className="preview-progress-bar" id="card-progress-bar"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       SECTION: LIVE STATS BAR
  ══════════════════════════════════════════════ */}
      <section className="live-stats-bar-section">
        <div className="container">
          <div className="live-stats-bar">
            <div className="live-stats-grid">
              <div className="stat-item">
                <span className="stat-num" id="stat-pins-count">0+</span>
                <span className="stat-label" data-i18n="statPinsLabel">Thoughts Bookmarked</span>
              </div>
              <div className="stat-item-divider"></div>
              <div className="stat-item">
                <span className="stat-num" id="stat-users-count">0+</span>
                <span className="stat-label" data-i18n="statUsersLabel">Active Thinkers</span>
              </div>
              {
                /* 
                             <div className="stat-item-divider"></div>
                             <div className="stat-item">
                               <span className="stat-num" id="stat-installs-count">0+</span>
                               <span className="stat-label" data-i18n="statInstallsLabel">Extension Installs</span>
                             </div>
                             */
              }
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       SECTION: USE CASES
  ══════════════════════════════════════════════ */}
      <section className="section section-alt" id="use-cases">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-badge">USE CASES</span>
            <h2 className="section-title serif-title" data-i18n="useCasesTitle">Who bookmarks their AI conversations</h2>
            <p className="section-sub" data-i18n="useCasesSub">From debugging build breaks to researching papers — see how different thinkers keep their breakthrough answers.</p>
          </div>

          <div className="use-cases-grid">
            {/* 1. Developers */}
            <div className="uc-card">
              <div className="uc-card-head">
                <span className="uc-icon">💻</span>
                <h3 className="uc-role" data-i18n="uc1Role">Developers &amp; Engineers</h3>
              </div>
              <ul className="uc-list">
                <li><span className="uc-dash">—</span> <span data-i18n="uc1Item1">Bookmark the exact answer that fixed the build</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc1Item2">Save your prompt that produced the right architecture</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc1Item3">Jump back to code blocks without scrolling through 80 turns</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc1Item4">Keep thoughts nested inside the chat, not in a disconnected notes file</span></li>
              </ul>
            </div>

            {/* 2. Writers */}
            <div className="uc-card">
              <div className="uc-card-head">
                <span className="uc-icon">✍️</span>
                <h3 className="uc-role" data-i18n="uc3Role">Writers &amp; Creators</h3>
              </div>
              <ul className="uc-list">
                <li><span className="uc-dash">—</span> <span data-i18n="uc3Item1">Mark the draft paragraph worth keeping</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc3Item2">Save the prompt instruction that nailed the tone</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc3Item3">Return to editorial feedback without rereading the whole session</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc3Item4">Group ideas into clean, hierarchical chapter outlines</span></li>
              </ul>
            </div>

            {/* 3. Researchers */}
            <div className="uc-card">
              <div className="uc-card-head">
                <span className="uc-icon">🔬</span>
                <h3 className="uc-role" data-i18n="uc2Role">Researchers &amp; Academics</h3>
              </div>
              <ul className="uc-list">
                <li><span className="uc-dash">—</span> <span data-i18n="uc2Item1">Bookmark the exact synthesis and citations you will cite</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc2Item2">Save methodology formulas and statistical proofs mid-thread</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc2Item3">Rich visual previews make sources easy to tell apart</span></li>
                <li><span className="uc-dash">—</span> <span data-i18n="uc2Item4">Export structured study guides with Table of Contents when done</span></li>
              </ul>
            </div>


            {/* 5. Wide Multi-Model Callout Card */}
            <div className="uc-card uc-callout-card">
              <div className="uc-callout-badge" data-i18n="ucCalloutTag">ALL AI ASSISTANTS INCLUDED</div>
              <h3 className="uc-callout-title serif-title" data-i18n="ucCalloutTitle">One single tool across all your AI chats</h3>
              <p className="uc-callout-desc" data-i18n="ucCalloutDesc">
                Unlike other extensions that charge $9.99/mo per platform or lock you after 2 chats, Thoughtmark supports Claude, ChatGPT, Gemini, and DeepSeek unified with zero paywalls.
              </p>
              <a className="btn-primary uc-callout-btn dynamic-browser-cta" href="#">
                <span className="cta-text">Add to Chrome — Free</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       SECTION: CAPABILITIES
  ══════════════════════════════════════════════ */}
      <section className="section" id="capabilities">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-badge">CAPABILITIES</span>
            <h2 className="section-title serif-title" data-i18n="eightTitle">Built for how you actually think</h2>
            <p className="section-sub" data-i18n="eightSub">Every feature is available for free. No paywalls, no artificial limits.</p>
          </div>

          <div className="capabilities-grid">
            {/* 1 */}
            <div className="cap-card">
              <div className="cap-icon-wrap">📌</div>
              <h3 className="cap-title" data-i18n="cap1Title">Exact Sentence Pinning</h3>
              <p className="cap-desc" data-i18n="cap1Desc">Most tools bookmark an entire response. Thoughtmark pins the exact sentence, formula, or code block you selected — nothing more.</p>
            </div>

            {/* 2 */}
            <div className="cap-card">
              <div className="cap-icon-wrap">🌲</div>
              <h3 className="cap-title" data-i18n="cap2Title">Structured Outlines</h3>
              <p className="cap-desc" data-i18n="cap2Desc">Nest thoughts under topics. Your bookmarks organize themselves into a hierarchical tree as you read — not a flat, unmanageable list.</p>
            </div>

            {/* 3 */}
            <div className="cap-card">
              <div className="cap-icon-wrap">🌐</div>
              <h3 className="cap-title" data-i18n="cap3Title">All AI Platforms, One Extension</h3>
              <p className="cap-desc" data-i18n="cap3Desc">Claude, ChatGPT, Gemini, and DeepSeek — all supported natively. No separate fee per platform, no switching tools.</p>
            </div>

            {/* 4 */}
            <div className="cap-card">
              <div className="cap-icon-wrap">🔄</div>
              <h3 className="cap-title" data-i18n="cap4Title">Smart Auto-Recovery</h3>
              <p className="cap-desc" data-i18n="cap4Desc">Long conversations cause earlier messages to unload from the page. Thoughtmark silently detects this and re-anchors your bookmarks as you scroll.</p>
            </div>

            {/* 5 */}
            <div className="cap-card">
              <div className="cap-icon-wrap">📄</div>
              <h3 className="cap-title" data-i18n="cap5Title">PDF &amp; Markdown Export</h3>
              <p className="cap-desc" data-i18n="cap5Desc">Export your bookmarks as a clean PDF study guide with Table of Contents, or as structured Markdown — ready to share or archive.</p>
            </div>

            {/* 6 */}
            <div className="cap-card">
              <div className="cap-icon-wrap">🔒</div>
              <h3 className="cap-title" data-i18n="cap6Title">Stays on Your Device</h3>
              <p className="cap-desc" data-i18n="cap6Desc">Your bookmarks live entirely in your browser's local storage. Nothing is sent to any server. No account needed, ever.</p>
            </div>

            {/* 7 */}
            <div className="cap-card">
              <div className="cap-icon-wrap">🔍</div>
              <h3 className="cap-title" data-i18n="cap7Title">Search Across All Your Thoughts</h3>
              <p className="cap-desc" data-i18n="cap7Desc">Find any sentence you've bookmarked across every conversation. Type a word and Thoughtmark highlights exact matches — like a code editor's global search, built for ideas.</p>
            </div>

            {/* 8 */}
            <div className="cap-card">
              <div className="cap-icon-wrap">🚀</div>
              <h3 className="cap-title" data-i18n="cap8Title">Completely Free</h3>
              <p className="cap-desc" data-i18n="cap8Desc">No subscriptions, no paywalls, no artificial conversation limits. Thoughtmark is free across all supported AI platforms.</p>
            </div>
          </div>

          {/* Search Feature Visual Demo */}
          <div className="search-feature-demo">
            <div className="search-demo-header">
              <div className="search-demo-title-group">
                <span className="search-demo-badge">SEARCH IN ACTION</span>
                <p className="search-demo-desc">Search across every bookmark with code-editor precision</p>
              </div>
            </div>

            {/* Search UI */}
            <div className="search-demo-ui">
              {/* Search bar */}
              <div className="sdemo-search-bar">
                <div className="sdemo-search-left">
                  <span className="sdemo-search-badge">GLOBAL SEARCH</span>
                  <span className="sdemo-count-pill">102 matches</span>
                </div>
                <div className="sdemo-search-input-wrap">
                  <span className="sdemo-search-icon">🔍</span>
                  <span className="sdemo-search-query">file</span>
                  <span className="sdemo-cursor"></span>
                  <span className="sdemo-match-info">102 occurrences across 3 conversations</span>
                </div>
                <button className="sdemo-exit-btn" type="button">✕ Exit Search</button>
              </div>
              {/* Result group */}
              <div className="sdemo-result-group">
                <div className="sdemo-group-header">
                  <div className="sdemo-group-left">
                    <span className="sdemo-provider-dot" style={{ background: "#CC79A7" }}></span>
                    <span className="sdemo-group-title">Go mastery - Google Gemini</span>
                    <span className="sdemo-group-url">https://gemini.google.com/app/b8...</span>
                  </div>
                  <div className="sdemo-group-right">
                    <span className="sdemo-match-badge">382 matches</span>
                    <button className="sdemo-open-btn" type="button">open thread →</button>
                  </div>
                </div>
                {/* Match item */}
                <div className="sdemo-match-item">
                  <div className="sdemo-match-head">
                    <span className="sdemo-match-dot" style={{ background: "#34D399" }}></span>
                    <span className="sdemo-match-label">Difference between user-space &amp; kernel space</span>
                    <span className="sdemo-source-tag">[Captured text]</span>
                    <span className="sdemo-jump-hint">Jump to mark →</span>
                  </div>
                  <div className="sdemo-code-box">
                    <div className="sdemo-gutter">
                      <span>18</span>
                      <span className="sdemo-gutter-match">19</span>
                      <span>20</span>
                    </div>
                    <div className="sdemo-code-content">
                      <div className="sdemo-code-line">Open <mark className="sdemo-highlight">File</mark> Table Entry ———→ Inode in VFS Memory</div>
                      <div className="sdemo-code-line sdemo-line-match">Your Process Space: It only holds a tiny index array called the <mark className="sdemo-highlight">File</mark> Descriptor (FD) Table.</div>
                      <div className="sdemo-code-line">directly — it just holds the integer 3, which points to an entry inside the kernel's private memory.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       HOW IT WORKS & INTERACTIVE WIDGET
  ══════════════════════════════════════════════ */}
      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-badge">WORKFLOW</span>
            <h2 className="section-title serif-title" data-i18n="howTitle">How it works</h2>
            <p className="section-sub" data-i18n="howSub">Three simple steps. No setup. No account required.</p>
          </div>

          <div className="how-steps-row">
            <div className="step-card">
              <div className="step-badge" data-i18n="step1Num">01</div>
              <div className="step-info">
                <h3 className="step-h" data-i18n="step1Title">Select any text</h3>
                <p className="step-p" data-i18n="step1Desc">
                  Highlight any sentence, formula, or code block. Click the floating Mark button or press Alt+M.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-badge" data-i18n="step2Num">02</div>
              <div className="step-info">
                <h3 className="step-h" data-i18n="step2Title">Build your outline</h3>
                <p className="step-p" data-i18n="step2Desc">
                  Name it, pick a color, and nest it under a topic. Your notes organize themselves as you read.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-badge" data-i18n="step3Num">03</div>
              <div className="step-info">
                <h3 className="step-h" data-i18n="step3Title">Jump &amp; export anytime</h3>
                <p className="step-p" data-i18n="step3Desc">
                  Click any mark in the side panel to jump back to it instantly. Export to PDF or Markdown when you're ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       VIDEO DEMO — How to use Thoughtmark
  ══════════════════════════════════════════════ */}
      <section className="section" id="demo">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-badge" data-i18n="demoBadge">WATCH IT IN ACTION</span>
            <h2 className="section-title serif-title" data-i18n="demoTitle">See how Thoughtmark works</h2>
            <p className="section-sub" data-i18n="demoSub">A short walkthrough: pin a sentence, build your outline, and export a study guide.</p>
          </div>

          <div className="demo-video-wrap">
            <video
              className="demo-video"
              controls
              preload="none"
              playsInline
              poster="/assets/demo-poster.webp"
              width={1280}
              height={720}
              aria-label="Thoughtmark demo video"
            >
              <source src="/assets/demo.webm" type="video/webm" />
              <source src="/assets/demo.mp4" type="video/mp4" />
            </video>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
       COMPARISON TABLE
  ══════════════════════════════════════════════ */}
      <section className="section" id="comparison">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-badge">HEAD-TO-HEAD</span>
            <h2 className="section-title serif-title" data-i18n="compTitle">Why Thoughtmark beats the competition</h2>
            <p className="section-sub" data-i18n="compSub">See how Thoughtmark stands 10X ahead of standard bookmarks and competitor extensions.</p>
          </div>

          <div className="table-wrap">
            <table className="comp-table">
              <thead>
                <tr>
                  <th data-i18n="compCol1">Feature</th>
                  <th className="col-highlight" data-i18n="compCol2">Thoughtmark</th>
                  <th data-i18n="compCol3">Commercial Competitors</th>
                  <th data-i18n="compCol4">Browser Bookmarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-feature" data-i18n="row1Name">Bookmark Precision</td>
                  <td className="col-highlight row-win">✓ <span data-i18n="row1Val2">Exact sentence, formula &amp; table</span></td>
                  <td className="row-loss">✕ <span data-i18n="row1Val3">Whole message turn only</span></td>
                  <td className="row-loss">✕ <span data-i18n="row1Val4">Whole page URL only</span></td>
                </tr>
                <tr>
                  <td className="row-feature" data-i18n="row2Name">Outline Organization</td>
                  <td className="col-highlight row-win">✓ <span data-i18n="row2Val2">Nested multi-level tree outline</span></td>
                  <td className="row-loss">✕ <span data-i18n="row2Val3">Flat linear list</span></td>
                  <td className="row-loss">✕ <span data-i18n="row2Val4">Flat bookmark bar</span></td>
                </tr>
                <tr>
                  <td className="row-feature" data-i18n="row3Name">Multi-Platform Support</td>
                  <td className="col-highlight row-win">✓ <span data-i18n="row3Val2">Claude + ChatGPT + Gemini in ONE</span></td>
                  <td className="row-loss">✕ <span data-i18n="row3Val3">Separate fee ($9.99/mo per AI)</span></td>
                  <td className="row-loss">✕ <span data-i18n="row3Val4">None (generic URLs)</span></td>
                </tr>
                <tr>
                  <td className="row-feature" data-i18n="row4Name">Lazy DOM Auto-Healing</td>
                  <td className="col-highlight row-win">✓ <span data-i18n="row4Val2">LiveDOMObserver auto-unstall</span></td>
                  <td className="row-loss">✕ <span data-i18n="row4Val3">Stalls on virtualized chats</span></td>
                  <td className="row-loss">✕ <span data-i18n="row4Val4">None</span></td>
                </tr>
                <tr>
                  <td className="row-feature" data-i18n="row5Name">Study Guide Export</td>
                  <td className="col-highlight row-win">✓ <span data-i18n="row5Val2">PDF with Table of Contents &amp; MD</span></td>
                  <td className="row-loss">✕ <span data-i18n="row5Val3">Raw TXT / JSON dump only</span></td>
                  <td className="row-loss">✕ <span data-i18n="row5Val4">HTML link export only</span></td>
                </tr>
                <tr>
                  <td className="row-feature" data-i18n="row6Name">Pricing / Value</td>
                  <td className="col-highlight row-win">✓ <span data-i18n="row6Val2">Generous Free + $19 Lifetime Pro</span></td>
                  <td className="row-loss">✕ <span data-i18n="row6Val3">Locked after 2 chats / $199 Lifetime</span></td>
                  <td className="row-loss">✕ <span data-i18n="row6Val4">Free but useless for AI chats</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       WALL OF LOVE / USER APPRECIATIONS (4+ STARS)
  ══════════════════════════════════════════════ */}
      {reviewsList.length > 0 && (
        <section className="landing-reviews-section" id="reviews">
          <div className="container">
            <div className="landing-reviews-header">
              <div className="landing-reviews-badge">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COMMUNITY VOICES · 4+ STARS</span>
              </div>
              <h2 className="landing-reviews-title serif-title">
                Loved by Researchers, Engineers &amp; Thinkers
              </h2>
              <p className="landing-reviews-sub">
                What genuine community members say about bookmarking ideas and never losing a thought in long AI conversations.
              </p>

              <div className="landing-reviews-cta-row">
                <button
                  type="button"
                  className="landing-reviews-share-btn"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Share your appreciation →</span>
                </button>
              </div>
            </div>

            <div className="landing-reviews-grid">
              {reviewsList.slice(0, 9).map((review) => {
                const initials = (review.user_name || "TM")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div key={review.id} className="landing-review-card">
                    <div className="landing-review-top">
                      <div className="landing-review-stars">
                        {Array.from({ length: review.rating || 5 }).map((_, i) => (
                          <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="landing-review-verified">Verified Thinker</span>
                    </div>

                    <blockquote className="landing-review-quote">
                      "{review.message}"
                    </blockquote>

                    <div className="landing-review-author">
                      <div className="landing-review-avatar">
                        {initials}
                      </div>
                      <div className="landing-review-meta">
                        <span className="landing-review-name">{review.user_name || "Community Thinker"}</span>
                        <span className="landing-review-role">{review.user_role || "Researcher & Developer"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Direct Review Modal from Landing Page */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitted={() => {
          // Review submitted to community space - will appear on landing once curated by admin
        }}
      />

      {/* ══════════════════════════════════════════════
       FREE FOREVER & ROADMAP FUNDING
  ══════════════════════════════════════════════ */}
      <section className="section section-alt" id="pricing">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-badge" data-i18n="navPricing">FREE FOREVER</span>
            <h2 className="section-title serif-title" data-i18n="pricingTitle">Free Forever · Community Supported</h2>
            <p className="section-sub" data-i18n="pricingSub">No subscriptions, no paywalls. Thoughtmark is completely free — funded by voluntary contributions from users who find it useful.</p>
          </div>

          <div className="pricing-cards-grid">
            {/* Free Edition Card */}
            <div className="p-card">
              <h3 className="p-title" data-i18n="planFreeTitle">Free Edition</h3>
              <div className="p-price-wrap">
                <span className="p-price" data-i18n="planFreePrice">$0</span>
              </div>
              <a className="p-btn p-btn-primary dynamic-browser-cta" style={{ justifyContent: 'center' }} href="#" data-i18n="planFreeCta">Install Extension</a>
              <ul className="p-features">
                <li>✓ <span data-i18n="freeF1">Unlimited conversations &amp; unlimited marks</span></li>
                <li>✓ <span data-i18n="freeF2">Claude, ChatGPT, Gemini &amp; DeepSeek</span></li>
                <li>✓ <span data-i18n="freeF3">Hierarchical tree outlines</span></li>
                <li>✓ <span data-i18n="freeF4">PDF &amp; Markdown export</span></li>
                <li>✓ <span data-i18n="freeF5">Full-text search across all bookmarks</span></li>
                <li>✓ <span data-i18n="freeF6">Stays on your device — no cloud, no account</span></li>
              </ul>
            </div>

            {/* Community Supporter & Milestones Roadmap Card */}
            <div className="p-card p-card-featured">
              <div className="p-badge" data-i18n="planSupporterBadge">WHAT YOUR SUPPORT BUILDS</div>
              <h3 className="p-title serif-title" data-i18n="planSupporterTitle">Support the Project</h3>
              <button type="button" style={{ marginTop: 45 }} className="p-btn p-btn-primary" id="pricing-support-btn" data-i18n="planSupporterCta">Support the Project →</button>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: "1.5" }} data-i18n="supporterSub">
                Your support keeps Thoughtmark free and funds the next milestones on our roadmap:
              </p>
              <ul className="p-features p-roadmap-features">
                <li><span data-i18n="ms1">🎯 Support every major AI provider — Grok, Perplexity, Mistral &amp; more</span></li>
                <li><span data-i18n="ms2">🎯 Synchronization across many devices</span></li>
                <li><span data-i18n="ms3">🎯 Local semantic search — find thoughts by concept and meaning</span></li>
              </ul>
            </div>
          </div>

          {/* Competitor Price Callout Box */}
          <div className="comp-callout-box">
            <h4 className="comp-callout-title" data-i18n="compCalloutTitle">What comparable tools cost:</h4>
            <ul className="comp-callout-list">
              <li><strong>✕</strong> <span data-i18n="compCallout1">Commercial extensions: $9.99/mo per platform or $199 lifetime — locked after 2 chats</span></li>
              <li><strong>✕</strong> <span data-i18n="compCallout2">Subscription tools: $10–$15/month</span></li>
              <li><strong>✕</strong> <span data-i18n="compCallout3">Platform-specific plugins: $59/year per AI</span></li>
            </ul>
            <div className="comp-callout-verdict">
              <span>⚡</span>
              <span data-i18n="compCalloutSummary">Competitors cost $120–$200/year. Thoughtmark costs nothing.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
       ABOUT THE CREATOR / DEVELOPER
  ══════════════════════════════════════════════ */}
      {
        /*
        *
      <section className="section" id="creator">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-badge" data-i18n="devSectionBadge">BEHIND THE PROJECT</span>
            <h2 className="section-title serif-title" data-i18n="devSectionTitle">Meet the Developer</h2>
          </div>

          <div className="creator-card">
            <div className="creator-content">
              <div className="creator-header">
                <div>
                  <h3 className="creator-name serif-title">Cedric Lekene</h3>
                  <p className="creator-role" data-i18n="devRole">Software Engineer</p>
                </div>
                <a
                  href="https://www.linkedin.com/in/cedric-lekene/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="creator-linkedin-btn"
                  title="Connect with Cedric Lekene on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                  <span data-i18n="devConnect">Connect on LinkedIn</span>
                </a>
              </div>

              <blockquote className="creator-quote" data-i18n="devQuote">
                "I built Thoughtmark out of personal frustration. As a software developer, I was constantly losing critical answers across long AI threads and struggling with messy notes. I needed a tool that was simple, fast, and 100% local. I'm sharing it hoping it helps you as much as it has helped me."
              </blockquote>
            </div>
          </div>
        </div>
      </section>
        *
        * */
      }

      {/* ══════════════════════════════════════════════
       FOOTER
  ══════════════════════════════════════════════ */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <div className="footer-logo">
              <img src="/assets/logo.png" alt="Thoughtmark logo" width="26" height="26" className="footer-logo-img" style={{ borderRadius: "4px", objectFit: "contain" }} loading="lazy" decoding="async" />
              <span className="serif-title">Thoughtmark</span>
            </div>
            <p className="footer-copy" data-i18n="footerCopy">
              A free, privacy-first browser extension for anyone who thinks deeply with AI. Your bookmarks stay on your device — always.
            </p>
            <p className="footer-creator-line">
              Crafted by <a href="https://www.linkedin.com/in/cedric-lekene/" target="_blank" rel="noopener noreferrer" className="footer-creator-link">Cedric Lekene</a>
            </p>
          </div>

          <div className="footer-links">
            <a href="#use-cases" data-i18n="navUseCases">Use Cases</a>
            <a href="#pricing" data-i18n="navPricing">Pricing</a>
            <a href="#creator" data-i18n="navCreator">Creator</a>
            <button type="button" id="footer-support-link" className="footer-link-btn" data-i18n="footerSupport">Support the Project</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
