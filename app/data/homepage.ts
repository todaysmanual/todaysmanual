export type Article = {
  id: string;
  slug: string;
  title: string;
  category: "Work" | "Money" | "Skills" | "Life" | "Opportunity";
  excerpt?: string;
  image: string;
  imageAlt: string;
  readTime: string;
  featured?: boolean;
};

export type StartHereItem = {
  title: string;
  description: string;
  icon: "school" | "briefcase" | "growth" | "idea" | "compass";
  color: string;
  href: string;
};

export type Manual = {
  name: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  color: string;
};

export type DailyBriefItem = {
  id: string;
  title: string;
  meta: string;
};

export const heroArticle: Article = {
  id: "hero-01",
  slug: "what-happens-after-university",
  title: "Nobody Told Us What Happens After University.",
  category: "Work",
  excerpt:
    "The real world looks nothing like the classroom. Here’s what actually changes — and how to prepare for it.",
  image: "/editorial/hero-laptop.jpg",
  imageAlt: "Young man working on a laptop while carrying a colourful patterned shoulder bag",
  readTime: "8 min read",
  featured: true,
};

export const secondaryStories: Article[] = [
  {
    id: "story-02",
    slug: "salary-is-not-net-worth",
    title: "Your Salary Isn’t Your Net Worth.",
    category: "Money",
    image: "/editorial/money.jpg",
    imageAlt: "A Ghanaian market trader serving customers at her stall in northern Ghana",
    readTime: "5 min read",
  },
  {
    id: "story-03",
    slug: "skills-that-will-pay-in-2030",
    title: "The Skills That Will Pay You in 2030.",
    category: "Skills",
    image: "/editorial/skills.jpg",
    imageAlt: "Young Ghanaian women participating in a laptop-based technology workshop",
    readTime: "6 min read",
  },
];

export const startHereItems: StartHereItem[] = [
  {
    title: "I’m still in school",
    description: "What should I be doing before graduating?",
    icon: "school",
    color: "#f6ae2d",
    href: "/article/prepare-before-graduating",
  },
  {
    title: "I just graduated",
    description: "How do I actually start my career?",
    icon: "briefcase",
    color: "#f47b4a",
    href: "/article/start-your-career",
  },
  {
    title: "I’m working",
    description: "How do I move up and grow faster?",
    icon: "growth",
    color: "#22b879",
    href: "/article/grow-faster-at-work",
  },
  {
    title: "I want to build something",
    description: "Business, freelancing and entrepreneurship.",
    icon: "idea",
    color: "#8f75bd",
    href: "/article/build-something-of-your-own",
  },
  {
    title: "I feel lost",
    description: "Where do I even begin?",
    icon: "compass",
    color: "#275fb4",
    href: "/article/find-your-next-step",
  },
];

export const manuals: Manual[] = [
  {
    name: "Work Manual",
    slug: "work",
    description: "Careers, workplace culture and growth.",
    image: "/editorial/work.jpg",
    imageAlt: "Ghanaian professionals and students collaborating around laptops at a workshop",
    color: "#f15a24",
  },
  {
    name: "Money Manual",
    slug: "money",
    description: "Make, manage and multiply your money.",
    image: "/editorial/money.jpg",
    imageAlt: "A Ghanaian market trader serving customers at her stall in northern Ghana",
    color: "#3d652f",
  },
  {
    name: "Skills Manual",
    slug: "skills",
    description: "The skills that build value and freedom.",
    image: "/editorial/skills.jpg",
    imageAlt: "Young Ghanaian women participating in a laptop-based technology workshop",
    color: "#1b4b78",
  },
  {
    name: "Life Manual",
    slug: "life",
    description: "Mindset, health, relationships and becoming your best.",
    image: "/editorial/life.jpg",
    imageAlt: "A Ghanaian environmental initiative team gathered around a work table",
    color: "#8063a8",
  },
  {
    name: "Opportunity Manual",
    slug: "opportunity",
    description: "Jobs, scholarships, fellowships and more.",
    image: "/editorial/opportunity.jpg",
    imageAlt: "A diverse group of young Ghanaian adults outside the University of Ghana",
    color: "#d59620",
  },
];

export const quickReads: Article[] = [
  {
    id: "01",
    slug: "five-things-about-your-first-job",
    title: "5 things nobody tells you about your first job.",
    category: "Work",
    image: "/editorial/student.jpg",
    imageAlt: "Young Ghanaian adults working together on laptops at a University of Ghana workshop",
    readTime: "3 min read",
  },
  {
    id: "02",
    slug: "your-first-1000-ghs",
    title: "Your first 1000 GHS is different.",
    category: "Money",
    image: "/editorial/cash.jpg",
    imageAlt: "Front and back of a Ghana 50 cedi banknote",
    readTime: "4 min read",
  },
  {
    id: "03",
    slug: "high-income-skills-six-months",
    title: "7 high-income skills you can learn in 6 months.",
    category: "Skills",
    image: "/editorial/desk.jpg",
    imageAlt: "Ghanaian students learning together with a laptop in a classroom",
    readTime: "5 min read",
  },
  {
    id: "04",
    slug: "corporate-phrases-explained",
    title: "Corporate phrases (and what they mean).",
    category: "Work",
    image: "/editorial/office.jpg",
    imageAlt: "Attendees preparing for a Young Entrepreneurs Summit in Ghana",
    readTime: "3 min read",
  },
  {
    id: "05",
    slug: "why-side-hustles-do-not-make-money",
    title: "Why most side hustles never make money.",
    category: "Money",
    image: "/editorial/buildings.jpg",
    imageAlt: "People walking past small businesses on a busy market street in Accra",
    readTime: "4 min read",
  },
];

export const dailyBriefs: DailyBriefItem[] = [
  { id: "01", title: "MTN Ghana launches 5G in Accra and Kumasi.", meta: "2 min read" },
  { id: "02", title: "The World Bank predicts 3.3% growth for Ghana in 2026.", meta: "2 min read" },
  { id: "03", title: "Flutterwave is hiring across multiple roles.", meta: "View opportunity" },
];

export const popularTopics = [
  "Career Change",
  "AI",
  "Salary",
  "CV",
  "Masters",
  "Entrepreneurship",
  "Remote Work",
  "Money",
  "Productivity",
];

export const categoryNames = ["work", "money", "skills", "life", "opportunity"] as const;
