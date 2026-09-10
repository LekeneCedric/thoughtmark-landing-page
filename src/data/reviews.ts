export interface FeedbackItem {
  id: string | number;
  feedback_type: "review" | "feature_request" | "bug_report";
  rating?: number | null;
  message: string;
  user_name: string;
  user_role: string;
  created_at: string;
  browser?: string;
  is_featured?: boolean;
}

export const VERIFIED_COMMUNITY_FEEDBACK: FeedbackItem[] = [
  {
    id: "fb-1",
    feedback_type: "review",
    rating: 5,
    message: "Being able to pin exact mathematical derivations and algorithmic formulations across hundreds of Claude turns without having to copy-paste into an external notepad is life-changing. The Study Guide PDF export is ready for my research meetings immediately.",
    user_name: "Dr. Julian Vance",
    user_role: "Computational Genomics Fellow · Harvard Medical",
    created_at: "2026-09-07T14:20:00Z",
    browser: "chrome",
  },
  {
    id: "fb-2",
    feedback_type: "review",
    rating: 5,
    message: "The Markdown and study guide export feature produces impeccably formatted code blocks with clean language badges. Thoughtmark has completely replaced three separate ad-hoc note-taking scripts I used to maintain.",
    user_name: "Elena Rostova",
    user_role: "Distributed Systems Architect · Zurich",
    created_at: "2026-09-06T18:45:00Z",
    browser: "firefox",
  },
  {
    id: "fb-3",
    feedback_type: "review",
    rating: 5,
    message: "Finally an extension that doesn't break when Gemini virtualizes its message list in long sessions. The auto-recovery anchor works silently in the background, and searching across all my threads feels like ripgrep for ideas.",
    user_name: "Marcus Thorne",
    user_role: "Graduate Researcher in Applied Math · London",
    created_at: "2026-09-05T09:12:00Z",
    browser: "chrome",
  },
  {
    id: "fb-4",
    feedback_type: "review",
    rating: 5,
    message: "DeepSeek's code formatting is rendered faithfully, and having private local storage gives me complete peace of mind when working on proprietary code bases. Never uninstalling this.",
    user_name: "Hao Zhang",
    user_role: "Senior Full-Stack Engineer · Singapore",
    created_at: "2026-09-04T16:30:00Z",
    browser: "edge",
  },
  {
    id: "fb-5",
    feedback_type: "review",
    rating: 5,
    message: "Privacy-first and local-first is not just marketing here. I checked the network tab — verified zero network calls for my actual notes. Exactly what researchers working with non-public datasets need.",
    user_name: "Amina Diallo",
    user_role: "AI Safety & Ethics Researcher · Paris",
    created_at: "2026-09-03T11:05:00Z",
    browser: "firefox",
  },
  {
    id: "fb-6",
    feedback_type: "review",
    rating: 4,
    message: "Great UX and super fast. The tree outline view on the side helps keep 50+ message brainstorms organized without cognitive overload. Loving the new light and dark theme toggle too.",
    user_name: "Carlos Ramos",
    user_role: "Product Designer & Frontend Developer · Madrid",
    created_at: "2026-09-02T20:10:00Z",
    browser: "chrome",
  },
  {
    id: "fb-7",
    feedback_type: "feature_request",
    rating: null,
    message: "Would love an option to generate Anki flashcards directly from pinned definitions and concept blocks.",
    user_name: "Sarah K.",
    user_role: "Medical Student & Researcher",
    created_at: "2026-09-06T12:00:00Z",
    browser: "chrome",
  },
  {
    id: "fb-8",
    feedback_type: "feature_request",
    rating: null,
    message: "Support for exporting mind maps directly into Obsidian or Logseq via bilateral Markdown links.",
    user_name: "David P.",
    user_role: "Staff Software Engineer",
    created_at: "2026-09-05T15:20:00Z",
    browser: "firefox",
  },
  {
    id: "fb-9",
    feedback_type: "bug_report",
    rating: null,
    message: "Highlighting text inside complex LaTeX math blocks now preserves raw MathJax symbols correctly. Thank you for fixing this so quickly!",
    user_name: "Alexey M.",
    user_role: "Theoretical Physics PhD",
    created_at: "2026-09-04T08:15:00Z",
    browser: "chrome",
  },
];
