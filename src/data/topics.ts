export interface TopicTreeNode {
  depth: number;
  dot: string;
  text: string;
  last: boolean;
}

export interface DemoTopic {
  id: string;
  category: string;
  url: string;
  provider: string;
  msgLead: string;
  highlight: string;
  msgTrail: string;
  pinTitle: string;
  color: string;
  tree: TopicTreeNode[];
}

export const TOPICS: DemoTopic[] = [
  {
    "id": "deepseek",
    "category": "Deep Learning & AI",
    "url": "chat.deepseek.com / s / transformer-kv-cache-optimization",
    "provider": "DeepSeek",
    "msgLead": "In Multi-Head Latent Attention (MLA), ",
    "highlight": "compressing the key-value cache into low-dimensional latent vectors cuts inference memory bandwidth by 73% while retaining full expressive capacity.",
    "msgTrail": " This architecture allows serving 128k context windows with linear computational scaling.",
    "pinTitle": "KV Cache Latent Compression (MLA)",
    "color": "#4D6BFE",
    "tree": [
      {
        "depth": 0,
        "dot": "#4D6BFE",
        "text": "Transformer Attention Optimization",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#34D399",
        "text": "KV Cache Latent Compression (MLA)",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#0072B2",
        "text": "Inference Latency & Bandwidth",
        "last": true
      }
    ]
  },
  {
    "id": "medicine",
    "category": "Medicine & Biology",
    "url": "claude.ai / chat / immunology-and-vaccines",
    "provider": "Claude",
    "msgLead": "Upon secondary exposure to the pathogen, ",
    "highlight": "memory B cells rapidly differentiate into plasma cells that produce high-affinity neutralizing antibodies.",
    "msgTrail": " This accelerated response clears the infection before clinical symptoms develop.",
    "pinTitle": "Memory B cell response",
    "color": "#0072B2",
    "tree": [
      {
        "depth": 0,
        "dot": "#0072B2",
        "text": "Adaptive Immune Response",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#E69F00",
        "text": "Memory B cell differentiation",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#009E73",
        "text": "Antibody Affinity Maturation",
        "last": true
      }
    ]
  },
  {
    "id": "law",
    "category": "Law & Contracts",
    "url": "chatgpt.com / c / commercial-agreements-audit",
    "provider": "ChatGPT",
    "msgLead": "Under Section 12.4, ",
    "highlight": "the indemnification clause survives contract termination and caps liability to total fees paid in the prior 12 months.",
    "msgTrail": " Third-party intellectual property claims remain subject to standard statutory exceptions.",
    "pinTitle": "Indemnification survival & cap",
    "color": "#E69F00",
    "tree": [
      {
        "depth": 0,
        "dot": "#E69F00",
        "text": "Contractual Risk & Liability",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#34D399",
        "text": "Indemnification survival & cap",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#CC79A7",
        "text": "Governing Law & Dispute Resolution",
        "last": true
      }
    ]
  },
  {
    "id": "finance",
    "category": "Finance & Investing",
    "url": "gemini.google.com / app / dcf-enterprise-valuation",
    "provider": "Gemini",
    "msgLead": "Using a 9.2% WACC and 2.5% long-term growth, ",
    "highlight": "the terminal value accounts for 68% of the discounted cash flow enterprise valuation.",
    "msgTrail": " Sensitivity analysis indicates fair value ranges between $84 and $102 per share.",
    "pinTitle": "Terminal value & WACC calculation",
    "color": "#009E73",
    "tree": [
      {
        "depth": 0,
        "dot": "#009E73",
        "text": "DCF Valuation Model",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#0072B2",
        "text": "Terminal value & WACC calculation",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#E69F00",
        "text": "Scenario Sensitivity Matrix",
        "last": true
      }
    ]
  },
  {
    "id": "philosophy",
    "category": "History & Philosophy",
    "url": "claude.ai / chat / stoic-ethics-and-decision-making",
    "provider": "Claude",
    "msgLead": "Epictetus establishes that ",
    "highlight": "the dichotomy of control divides all things into what is up to us (our judgments, desires) and what is not (external outcomes).",
    "msgTrail": " True tranquility comes from investing effort only where we hold direct agency.",
    "pinTitle": "The Dichotomy of Control",
    "color": "#CC79A7",
    "tree": [
      {
        "depth": 0,
        "dot": "#CC79A7",
        "text": "Stoic Ethical Principles",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#0072B2",
        "text": "The Dichotomy of Control",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#34D399",
        "text": "Amor Fati & Mental Resilience",
        "last": true
      }
    ]
  },
  {
    "id": "design",
    "category": "Product & UX Design",
    "url": "chatgpt.com / c / usability-heuristics-audit",
    "provider": "ChatGPT",
    "msgLead": "To minimize cognitive friction during onboarding, ",
    "highlight": "progressive disclosure reveals advanced customization only when requested, keeping initial time-to-value under 60 seconds.",
    "msgTrail": " Default settings should satisfy 80% of typical user workflows out of the box.",
    "pinTitle": "Progressive disclosure in onboarding",
    "color": "#34D399",
    "tree": [
      {
        "depth": 0,
        "dot": "#34D399",
        "text": "Usability & Cognitive Load",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#E69F00",
        "text": "Progressive disclosure in onboarding",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#0072B2",
        "text": "Time-to-Value Benchmarking",
        "last": true
      }
    ]
  },
  {
    "id": "physics",
    "category": "Physics & Astronomy",
    "url": "gemini.google.com / app / gravitational-lensing-data",
    "provider": "Gemini",
    "msgLead": "Predicted by General Relativity, ",
    "highlight": "massive galaxy clusters warp surrounding spacetime, magnifying faint background galaxies from 13 billion light-years away.",
    "msgTrail": " This natural telescope effect enables spectroscopy of first-generation stars.",
    "pinTitle": "Gravitational lensing magnification",
    "color": "#0072B2",
    "tree": [
      {
        "depth": 0,
        "dot": "#0072B2",
        "text": "Cosmology & Spacetime Curvature",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#CC79A7",
        "text": "Gravitational lensing magnification",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#009E73",
        "text": "Early Galaxy Spectroscopy",
        "last": true
      }
    ]
  },
  {
    "id": "nutrition",
    "category": "Culinary & Food Science",
    "url": "claude.ai / chat / sourdough-fermentation-kinetics",
    "provider": "Claude",
    "msgLead": "During slow fermentation, ",
    "highlight": "lactic acid bacteria lower dough pH to 3.8, deactivating phytates and significantly increasing mineral bioavailability.",
    "msgTrail": " Acetic and lactic acids also create the signature depth of flavor and extend shelf life.",
    "pinTitle": "Phytate breakdown & pH 3.8",
    "color": "#E69F00",
    "tree": [
      {
        "depth": 0,
        "dot": "#E69F00",
        "text": "Sourdough Fermentation Science",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#009E73",
        "text": "Phytate breakdown & pH 3.8",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#34D399",
        "text": "Gluten Structure & Hydration",
        "last": true
      }
    ]
  },
  {
    "id": "coding",
    "category": "Software Engineering",
    "url": "chatgpt.com / c / raft-distributed-consensus",
    "provider": "ChatGPT",
    "msgLead": "To prevent split-brain states during network partitions, ",
    "highlight": "a Raft candidate node must receive vote confirmations from a strict majority (N/2 + 1) before assuming the leader role.",
    "msgTrail": " Committed log entries are guaranteed to persist across future leader terms.",
    "pinTitle": "Majority quorum & split-brain prevention",
    "color": "#009E73",
    "tree": [
      {
        "depth": 0,
        "dot": "#009E73",
        "text": "Distributed Consensus (Raft)",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#0072B2",
        "text": "Majority quorum & split-brain prevention",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#CC79A7",
        "text": "Log Replication Invariants",
        "last": true
      }
    ]
  },
  {
    "id": "marketing",
    "category": "Marketing & Growth",
    "url": "gemini.google.com / app / cohort-retention-playbook",
    "provider": "Gemini",
    "msgLead": "Across 50,000 trial signups, ",
    "highlight": "cohort retention curves stabilize at month 3 when users complete the core setup milestone within their first 24 hours.",
    "msgTrail": " Early activation is 3x more predictive of annual renewal than total login frequency.",
    "pinTitle": "24-Hour setup milestone impact",
    "color": "#CC79A7",
    "tree": [
      {
        "depth": 0,
        "dot": "#CC79A7",
        "text": "User Retention Economics",
        "last": false
      },
      {
        "depth": 1,
        "dot": "#34D399",
        "text": "24-Hour setup milestone impact",
        "last": true
      },
      {
        "depth": 0,
        "dot": "#E69F00",
        "text": "Long-term Cohort Curves",
        "last": true
      }
    ]
  }
];
