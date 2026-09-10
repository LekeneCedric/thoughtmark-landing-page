import React, { useState, useEffect } from "react";
import { DONATION_CONFIG } from "../config/donations";
import { TRANSLATIONS, SupportedLanguage } from "../data/translations";
import { Copy, Check, X, Heart, ShieldCheck, Share2 } from "lucide-react";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getCurrentLang(): SupportedLanguage {
  try {
    const stored = localStorage.getItem("tm_lang") as SupportedLanguage | null;
    if (stored && TRANSLATIONS[stored]) return stored;
  } catch {}
  return "en";
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string>("btc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [lang, setLang] = useState<SupportedLanguage>(getCurrentLang);

  // Close on escape key + sync language whenever modal opens
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setLang(getCurrentLang());
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const t = (TRANSLATIONS[lang] || TRANSLATIONS.en) as Record<string, string>;
  const s = (key: string, fallback: string) => t[key] ?? fallback;

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareCopy = () => {
    navigator.clipboard.writeText(DONATION_CONFIG.shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const currentWallet =
    DONATION_CONFIG.wallets.find((w) => w.id === selectedWalletId) ||
    DONATION_CONFIG.wallets[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-heart-icon">
              <Heart className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            </div>
            <div>
              <h3 className="modal-title">{s("modalTitle", "Support Thoughtmark")}</h3>
              <p className="modal-sub">
                {s("modalSub", "100% voluntary · Keeps Thoughtmark free forever with zero paywalls.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body-crypto">
          {/* Highlight Callout: Share = Biggest Donation */}
          <div className="share-callout-box">
            <div className="share-callout-head">
              <span className="share-star-icon">✨</span>
              <span className="share-callout-title">
                {s("modalShareTitle", "The biggest donation is to share it around you!")}
              </span>
            </div>
            <p className="share-callout-desc">
              {s("modalShareDesc", "Helping fellow researchers, students, and engineers discover Thoughtmark is the most impactful way to support the project.")}
            </p>
            <button
              type="button"
              className="share-copy-btn"
              onClick={handleShareCopy}
            >
              {shareCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{s("modalShareCopied", "Recommendation Copied!")}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{s("modalShareBtn", "Copy Share Link & Text")}</span>
                </>
              )}
            </button>
          </div>

          {/* Crypto Wallets Section */}
          <div className="crypto-section-label">
            <span>{s("modalCryptoLabel", "Direct Crypto Contribution")}</span>
          </div>

          {/* Wallet Selection Chips (BTC & ETH) */}
          <div className="wallet-chips-row">
            {DONATION_CONFIG.wallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                className={`wallet-chip-btn ${wallet.id === currentWallet.id ? "active" : ""}`}
                onClick={() => setSelectedWalletId(wallet.id)}
              >
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  width="20"
                  height="20"
                  className="wallet-coin-icon"
                />
                <span className="wallet-chip-symbol">{wallet.symbol}</span>
                <span className="wallet-chip-name">{wallet.name}</span>
              </button>
            ))}
          </div>

          {/* Selected Wallet Detail Box */}
          <div className="wallet-detail-box">
            <div className="wallet-detail-head">
              <div className="wallet-network-tag">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {s("modalNetwork", "Network:")} <strong>{currentWallet.network}</strong>
                </span>
              </div>
              {currentWallet.badge && (
                <span className="wallet-badge">{currentWallet.badge}</span>
              )}
            </div>

            {/* Address Container */}
            <div className="wallet-address-container">
              <div className="wallet-address-label">
                {s("modalDepositLabel", "Deposit Address:")}
              </div>
              <div className="wallet-address-box">
                <code className="wallet-address-code">{currentWallet.address}</code>
                <button
                  type="button"
                  className="wallet-copy-btn"
                  onClick={() => handleCopy(currentWallet.address, currentWallet.id)}
                  title="Copy address"
                >
                  {copiedId === currentWallet.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{s("modalCopied", "Copied!")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{s("modalCopyBtn", "Copy")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {currentWallet.note && (
              <div className="wallet-note-text">
                ⚠️ {currentWallet.note}
              </div>
            )}
          </div>

          <div className="modal-crypto-footer-note">
            {s("modalFooterNote", "Thank you for supporting decentralized, private, and local-first software.")}
          </div>
        </div>
      </div>
    </div>
  );
};

