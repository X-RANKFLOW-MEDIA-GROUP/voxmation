export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface JobRequirement {
  category: string;
  items: string[];
}

export interface JobListing {
  id: string;
  title: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  department: string;
  salary: string;
  compensation: {
    baseCommission?: string;
    trialBonus: string;
    retentionBonus: string;
    potential: string;
  };
  description: string;
  responsibilities: string[];
  requirements: JobRequirement[];
  benefits: Benefit[];
  whyJoinUs: string[];
  applyUrl: string;
}

export const jobListings: JobListing[] = [
  {
    id: "outbound-sales-rep",
    title: "Outbound Sales Representative",
    location: "Remote",
    type: "Remote",
    department: "Sales",
    salary: "$0 - $500+ per week (commission-based)",
    compensation: {
      trialBonus: "$50 per 7-day trial booked",
      retentionBonus: "$100 per customer that fidelizes",
      potential: "$2,000 - $5,000+ monthly",
    },
    description:
      "Join our dynamic sales team and earn excellent commissions by booking 7-day trials and converting customers into long-term clients. We're looking for a fluent English speaker with excellent sales skills, perfect diction, and outstanding organizational abilities. This is a perfect opportunity for sales professionals who want to earn based on performance with no caps on commission.",
    responsibilities: [
      "Make outbound calls to qualified prospects in English",
      "Book 7-day trials for Voxmation's AI voice agent platform",
      "Follow up with prospects and guide them through the trial experience",
      "Convert trial users into paying customers for long-term contracts",
      "Maintain detailed records of all interactions using our CRM system",
      "Meet weekly and monthly performance targets",
      "Collaborate with the sales team to refine pitch and closing techniques",
      "Provide feedback on customer pain points and market opportunities",
    ],
    requirements: [
      {
        category: "Language & Communication",
        items: [
          "Fluent English (native or near-native proficiency required)",
          "Clear, professional diction and speaking voice",
          "Ability to articulate complex technical concepts simply",
          "Strong listening and active engagement skills",
        ],
      },
      {
        category: "Sales Experience",
        items: [
          "Proven track record in outbound sales or lead generation (minimum 1-2 years)",
          "Experience with SaaS, B2B, or technology products preferred",
          "Consultative selling approach with focus on customer needs",
          "Ability to overcome objections and close deals",
          "Demonstrated success hitting or exceeding sales targets",
        ],
      },
      {
        category: "Technical Skills",
        items: [
          "Comfortable using CRM systems and sales tools",
          "Basic proficiency with Google Suite or Microsoft Office",
          "Reliable internet connection and professional home setup",
          "Ability to quickly learn new software and platforms",
        ],
      },
      {
        category: "Personal Qualities",
        items: [
          "Highly organized and detail-oriented",
          "Self-motivated and able to work independently",
          "Resilient with positive attitude towards rejection",
          "Excellent time management and productivity habits",
          "Passion for continuous improvement and learning",
          "Professional demeanor in all customer interactions",
        ],
      },
    ],
    benefits: [
      {
        icon: "💰",
        title: "Unlimited Earning Potential",
        description:
          "Earn $50 per trial booked and $100 per customer that converts. No caps on commissions.",
      },
      {
        icon: "🌍",
        title: "100% Remote Work",
        description:
          "Work from anywhere in the world with flexible hours. Choose your own schedule.",
      },
      {
        icon: "📈",
        title: "Career Growth",
        description:
          "Proven path to team lead and management positions based on performance.",
      },
      {
        icon: "🎯",
        title: "Performance Bonuses",
        description:
          "Additional bonuses for exceptional months and exceeding targets.",
      },
      {
        icon: "🏆",
        title: "Supportive Team",
        description:
          "Regular training, mentoring, and support from experienced sales managers.",
      },
      {
        icon: "💻",
        title: "Modern Tools",
        description:
          "Access to best-in-class sales tools, CRM, and technology stack.",
      },
    ],
    whyJoinUs: [
      "Join a fast-growing AI company disrupting the voice sales industry",
      "Sell a product that genuinely helps businesses close more deals",
      "Work with a team that values transparency and direct communication",
      "Flexible remote setup that respects work-life balance",
      "Clear performance metrics so you always know how you're doing",
      "Regular feedback and coaching to help you improve and earn more",
    ],
    applyUrl: "mailto:careers@voxmation.com?subject=Outbound%20Sales%20Representative%20Application",
  },
];
