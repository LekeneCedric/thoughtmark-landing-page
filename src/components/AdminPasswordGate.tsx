import React, { useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface AdminPasswordGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Pre-computed SHA-256 hash of the master passphrase (one-way cryptographic digest)
const DEFAULT_ADMIN_HASH = "045cbcb336a18dbf8668fcd2706666fa9b41e7139a4dbbe7ec270c8c43b409d4";

export async function hashPassphrase(passphrase: string): Promise<string> {
  const enc = new TextEncoder().encode(passphrase.trim());
  const digestBuffer = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getExpectedAdminHash(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_HASH;
  return (
    localStorage.getItem("tm_admin_hash") ||
    (import.meta.env.VITE_ADMIN_HASH as string) ||
    DEFAULT_ADMIN_HASH
  );
}

export const AdminPasswordGate: React.FC<AdminPasswordGateProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Cryptographically hash the input locally via WebCrypto
      const inputHash = await hashPassphrase(password);
      const expectedHash = getExpectedAdminHash();

      if (inputHash === expectedHash) {
        // Store cryptographic token in session
        sessionStorage.setItem("tm_admin_auth", inputHash);
        setIsVerifying(false);
        onSuccess();
      } else {
        setIsVerifying(false);
        setError("Invalid admin password. Access denied.");
      }
    } catch {
      setIsVerifying(false);
      setError("Cryptographic verification failed. Please retry.");
    }
  };

  return (
    <div className="admin-gate-overlay">
      <div className="admin-gate-card">
        <div className="admin-gate-header">
          <div className="admin-gate-icon-wrap">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0 2px" }}>
            <img
              src="/assets/logo.png"
              alt="Thoughtmark"
              style={{ width: 22, height: 22, borderRadius: 5, objectFit: "contain" }}
            />
            <h2 className="admin-gate-title">Thoughtmark Admin</h2>
          </div>
          <p className="admin-gate-sub">
            Restricted workspace for review curation, platform telemetry, and settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-gate-form">
          <div className="admin-gate-field">
            <label className="admin-gate-label">Enter Admin Password</label>
            <div className="admin-gate-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className="admin-gate-input"
                placeholder="Enter passphrase…"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
                required
              />
              <button
                type="button"
                className="admin-gate-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="admin-gate-error">{error}</div>}

          <div className="admin-gate-actions">
            <button
              type="button"
              className="admin-gate-cancel-btn"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Return to Website
            </button>
            <button
              type="submit"
              className="admin-gate-submit-btn"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <span>Verifying…</span>
              ) : (
                <>
                  <span>Unlock Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="admin-gate-footer">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />
          <span>Private endpoint. Crawlers and indexers strictly prohibited.</span>
        </div>
      </div>
    </div>
  );
};
