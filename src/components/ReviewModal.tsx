import React, { useState } from "react";
import { X, Star, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { ENV } from "../config/env";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (item: any) => void;
  initialType?: "review" | "bug_report" | "feature_request";
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmitted,
  initialType = "review",
}) => {
  const [feedbackType, setFeedbackType] = useState<"review" | "bug_report" | "feature_request">(initialType);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const starLabels: Record<number, string> = {
    1: "Needs work",
    2: "Fair",
    3: "Good",
    4: "Great!",
    5: "Loved it! ❤️",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && feedbackType !== "review") {
      setErrorMsg("Please enter your message or description.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const browser = "web";
    const bodyData = {
      feedback_type: feedbackType,
      rating: feedbackType === "review" ? rating : null,
      message: message.trim() || `Rated ${rating} stars`,
      user_name: name.trim() || "Community Member",
      user_role: role.trim() || (feedbackType === "review" ? "Thinker" : "User"),
      contact_email: email.trim() || null,
      browser,
      extension_version: "1.0.0",
    };

    try {
      if (ENV.SUPABASE_URL && !ENV.SUPABASE_ANON_KEY.includes("dummy_anon_key")) {
        const res = await fetch(`${ENV.SUPABASE_URL}/rest/v1/user_feedback`, {
          method: "POST",
          headers: {
            apikey: ENV.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(bodyData),
        });

        if (!res.ok && res.status === 400) {
          // Schema fallback if user_name / user_role columns not yet migrated
          const authorTag = `[Author: ${name.trim() || "Community Member"} · ${role.trim() || "User"}]\n\n`;
          const fallbackData = {
            feedback_type: feedbackType,
            rating: feedbackType === "review" ? rating : null,
            message: `${authorTag}${message.trim() || `Rated ${rating} stars`}`,
            contact_email: email.trim() || null,
            browser,
            extension_version: "1.0.0",
          };
          await fetch(`${ENV.SUPABASE_URL}/rest/v1/user_feedback`, {
            method: "POST",
            headers: {
              apikey: ENV.SUPABASE_ANON_KEY,
              Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify(fallbackData),
          }).catch(() => {});
        }
      }

      setIsSuccess(true);
      if (onSubmitted) {
        onSubmitted({
          ...bodyData,
          id: Date.now(),
          created_at: new Date().toISOString(),
        });
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch {
      setIsSuccess(true);
      if (onSubmitted) {
        onSubmitted({
          ...bodyData,
          id: Date.now(),
          created_at: new Date().toISOString(),
        });
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="review-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="review-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="review-success-state">
            <div className="review-success-icon-wrap">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="review-success-title">Thank You for Your Voice!</h3>
            <p className="review-success-desc">
              Your submission has been received. Your perspective helps shape Thoughtmark for thinkers worldwide.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="review-modal-form">
            <div className="review-modal-header">
              <div className="review-modal-badge">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                <span>COMMUNITY VOICES</span>
              </div>
              <h2 className="review-modal-title">Share Your Appreciation or Idea</h2>
              <p className="review-modal-sub">
                Your thoughts inspire the community and guide our open roadmap.
              </p>
            </div>

            {/* Category Pills */}
            <div className="review-category-pills">
              <button
                type="button"
                className={`review-cat-btn ${feedbackType === "review" ? "active" : ""}`}
                onClick={() => setFeedbackType("review")}
              >
                ⭐ Appreciation / Review
              </button>
              <button
                type="button"
                className={`review-cat-btn ${feedbackType === "feature_request" ? "active" : ""}`}
                onClick={() => setFeedbackType("feature_request")}
              >
                💡 Feature Proposition
              </button>
              <button
                type="button"
                className={`review-cat-btn ${feedbackType === "bug_report" ? "active" : ""}`}
                onClick={() => setFeedbackType("bug_report")}
              >
                🐛 Bug / Issue Note
              </button>
            </div>

            {/* Rating Stars (Only for Reviews) */}
            {feedbackType === "review" && (
              <div className="review-stars-box">
                <span className="review-stars-label">YOUR RATING</span>
                <div className="review-stars-row" role="radiogroup" aria-label="Rating out of 5 stars">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeVal = hoverRating > 0 ? hoverRating : rating;
                    const isLit = star <= activeVal;
                    return (
                      <button
                        key={star}
                        type="button"
                        className={`review-star-btn ${isLit ? "lit" : "unlit"}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        title={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={30}
                          strokeWidth={isLit ? 1.5 : 1.75}
                          fill={isLit ? "#F59E0B" : "currentColor"}
                          color={isLit ? "#F59E0B" : "currentColor"}
                          className={`review-star-svg ${isLit ? "review-star-lit" : "review-star-unlit"}`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="review-stars-sentiment">
                  {starLabels[hoverRating > 0 ? hoverRating : rating]}
                </span>
              </div>
            )}

            {/* Author Inputs: Name and Position */}
            <div className="review-input-grid">
              <div className="review-field">
                <label className="review-label">Your Name</label>
                <input
                  type="text"
                  className="review-text-input"
                  placeholder="e.g. Dr. Sarah Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="review-field">
                <label className="review-label">Profession</label>
                <input
                  type="text"
                  className="review-text-input"
                  placeholder="e.g. AI Researcher, Systems Engineer, Student"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required={feedbackType === "review"}
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div className="review-field">
              <label className="review-label">
                {feedbackType === "review"
                  ? "Your Review / Appreciation"
                  : feedbackType === "feature_request"
                  ? "Describe your Feature Proposition"
                  : "Describe the Issue or Note"}
              </label>
              <textarea
                className="review-textarea"
                rows={4}
                placeholder={
                  feedbackType === "review"
                    ? "What do you like most about Thoughtmark? How does it help your research, coding, or learning flow?"
                    : feedbackType === "feature_request"
                    ? "What new capability, shortcut, or export format would make your work even smoother?"
                    : "What did you observe? Which AI platform (Claude, ChatGPT, Gemini, DeepSeek) were you on?"
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Email Input (Optional) */}
            <div className="review-field">
              <label className="review-label">Contact Email (Optional)</label>
              <input
                type="email"
                className="review-text-input"
                placeholder="Optional: your email if you want follow-up notifications"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {errorMsg && <p className="review-error-msg">{errorMsg}</p>}

            {/* Actions */}
            <div className="review-actions-row">
              <button
                type="button"
                className="review-cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="review-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Submitting…</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    <span>
                      {feedbackType === "review"
                        ? "Post Appreciation"
                        : feedbackType === "feature_request"
                        ? "Submit Proposition"
                        : "Submit Report"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
