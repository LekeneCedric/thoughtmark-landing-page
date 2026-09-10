import React, { useState, useEffect } from "react";
import { X, Star, Save, CheckCircle2 } from "lucide-react";
import { FeedbackItem } from "../data/reviews";

interface EditReviewModalProps {
  isOpen: boolean;
  item: FeedbackItem | null;
  onClose: () => void;
  onSave: (updated: FeedbackItem) => Promise<void> | void;
}

export const EditReviewModal: React.FC<EditReviewModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (item) {
      setName(item.user_name || "");
      setRole(item.user_role || "");
      setRating(item.rating || 5);
      setMessage(item.message || "");
      setIsFeatured(Boolean(item.is_featured));
      setErrorMsg("");
      setSaveSuccess(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("Review message cannot be empty.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    const updated: FeedbackItem = {
      ...item,
      user_name: name.trim() || "Anonymous Thinker",
      user_role: role.trim() || "Verified Thinker",
      rating: rating || 5,
      message: message.trim(),
      is_featured: isFeatured,
    };

    try {
      await onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save changes. Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Close Button */}
        <button
          type="button"
          className="review-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="review-modal-form">
          <div className="review-modal-header">
            <div className="review-modal-badge">
              <span>ADMIN REVIEW EDITOR</span>
            </div>
            <h2 className="review-modal-title">Edit Community Review</h2>
            <p className="review-modal-sub">
              Modify display details and toggle presence on the live landing page.
            </p>
          </div>

          {/* Rating Stars */}
          <div className="review-stars-box">
            <span className="review-stars-label">STAR RATING</span>
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
                  >
                    <Star
                      size={28}
                      strokeWidth={isLit ? 1.5 : 1.75}
                      fill={isLit ? "#F59E0B" : "currentColor"}
                      color={isLit ? "#F59E0B" : "currentColor"}
                      className={`review-star-svg ${isLit ? "review-star-lit" : "review-star-unlit"}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Author Inputs: Name and Profession */}
          <div className="review-input-grid">
            <div className="review-field">
              <label className="review-label">Reviewer Name</label>
              <input
                type="text"
                className="review-text-input"
                placeholder="e.g. Dr. Julian Vance"
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
                placeholder="e.g. Distributed Systems Architect"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Review Message Textarea */}
          <div className="review-field">
            <label className="review-label">Review Content</label>
            <textarea
              className="review-textarea"
              rows={4}
              placeholder="Edit the review message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Featured on Landing Toggle Checkbox */}
          <div className="admin-curate-toggle-row">
            <label className="admin-checkbox-wrap">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="admin-checkbox-input"
              />
              <span className="admin-checkbox-custom"></span>
              <div className="admin-checkbox-text">
                <span className="admin-checkbox-title">Display on Landing Page (Featured)</span>
                <span className="admin-checkbox-desc">
                  When enabled, this review is featured on the Thoughtmark homepage Wall of Love.
                </span>
              </div>
            </label>
          </div>

          {errorMsg && <p className="review-error-msg">{errorMsg}</p>}

          {/* Actions */}
          <div className="review-actions-row">
            <button
              type="button"
              className="review-cancel-btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="review-submit-btn"
              disabled={isSaving}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : isSaving ? (
                <span>Saving…</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>Save Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
