import { useState, useEffect, lazy, Suspense } from "react";
import { LandingPage } from "./components/LandingPage";
import { DonationModal } from "./components/DonationModal";
import { trackPageView } from "./utils/geo";

// Lazy-loaded bundle splitting: Admin code & telemetry charts are NEVER downloaded by normal visitors
const StatsDashboard = lazy(() =>
  import("./components/StatsDashboard").then((m) => ({ default: m.StatsDashboard }))
);
const AdminPasswordGate = lazy(() =>
  import("./components/AdminPasswordGate").then((m) => ({ default: m.AdminPasswordGate }))
);

export default function App() {
  const [view, setView] = useState<"home" | "admin">("home");
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const token = sessionStorage.getItem("tm_admin_auth");
    // Validate that session token is a valid 64-character SHA-256 digest
    return Boolean(token && token.length === 64 && /^[0-9a-f]{64}$/i.test(token));
  });
  const [isDonationOpen, setIsDonationOpen] = useState<boolean>(false);

  useEffect(() => {
    // Log visitor pageview & country telemetry on any page entry
    trackPageView().catch(() => {});

    const checkPath = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      // /stats is deprecated and hidden — redirect seamlessly to home
      if (path.includes("/stats") || hash === "#stats") {
        window.history.replaceState(null, "", "/");
        setView("home");
        return;
      }

      // /me and /admin are the private admin routes
      if (
        path.includes("/me") ||
        path.includes("/admin") ||
        hash === "#me" ||
        hash === "#admin"
      ) {
        setView("admin");
      } else {
        setView("home");
      }
    };

    checkPath();
    window.addEventListener("popstate", checkPath);
    window.addEventListener("hashchange", checkPath);
    return () => {
      window.removeEventListener("popstate", checkPath);
      window.removeEventListener("hashchange", checkPath);
    };
  }, []);

  // Ensure robots noindex on admin view
  useEffect(() => {
    if (view === "admin") {
      let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "robots";
        document.head.appendChild(meta);
      }
      meta.content = "noindex, nofollow, noarchive";
    }
  }, [view]);

  const handleBackToHome = () => {
    window.history.pushState(null, "", "/");
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("tm_admin_auth");
    setIsAdminAuth(false);
    handleBackToHome();
  };

  return (
    <div className="landing-app">
      {view === "admin" ? (
        <Suspense
          fallback={
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-void, #0B0F13)",
                color: "var(--text-secondary, #9CA3AF)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "13px",
              }}
            >
              <span>Loading secure module…</span>
            </div>
          }
        >
          {!isAdminAuth ? (
            <AdminPasswordGate
              onSuccess={() => setIsAdminAuth(true)}
              onCancel={handleBackToHome}
            />
          ) : (
            <StatsDashboard
              onBack={handleBackToHome}
              onSignOut={handleSignOut}
            />
          )}
        </Suspense>
      ) : (
        <LandingPage onOpenDonation={() => setIsDonationOpen(true)} />
      )}

      {/* Crypto & Payoneer Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
    </div>
  );
}


