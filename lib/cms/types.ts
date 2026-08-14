export type ArticleStatus = "draft" | "published";

export type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  excerpt: string;
  body: string;
  image_url: string;
  image_alt: string;
  read_time: string;
  author: string;
  status: ArticleStatus;
  featured: boolean;
  sort_order: number;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CategoryRecord = {
  slug: string;
  title: string;
  description: string;
  color: string;
  image_url: string;
  image_alt: string;
  sort_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SocialLink = {
  label: string;
  href: string;
  icon: string;
};

export type StartHereItem = {
  title: string;
  description: string;
  icon: "school" | "briefcase" | "growth" | "idea" | "compass";
  color: string;
  href: string;
};

export type DailyBriefItem = {
  id: string;
  title: string;
  meta: string;
  href?: string;
};

export type FooterColumn = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

export type SiteConfig = {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  logoUrl: string;
  ogImageUrl: string;
  issueLabel: string;
  headerLabel: string;
  headerTopics: string[];
  popularTopics: string[];
  socialLinks: SocialLink[];
  heroArticleSlug: string;
  secondaryArticleSlugs: string[];
  quickReadSlugs: string[];
  startHereEyebrow: string;
  startHereTitle: string;
  startHereItems: StartHereItem[];
  manualsEyebrow: string;
  manualsTitle: string;
  manualsDescription: string;
  quickReadsTitle: string;
  quickReadsDescription: string;
  dailyBriefsTitle: string;
  dailyBriefs: DailyBriefItem[];
  voice: {
    eyebrow: string;
    description: string;
    quote: string;
    attribution: string;
    imageUrl: string;
    imageAlt: string;
    href: string;
  };
  featuredManual: {
    eyebrow: string;
    description: string;
    title: string;
    summary: string;
    readTime: string;
    imageUrl: string;
    imageAlt: string;
    href: string;
  };
  newsletter: {
    title: string;
    description: string;
    buttonLabel: string;
    successTitle: string;
    successDescription: string;
  };
  footerDescription: string;
  footerColumns: FooterColumn[];
  footerSignoff: string;
  imageCredits: Array<{
    file: string;
    imageUrl?: string;
    placement: string;
    title: string;
    creator: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
    alt: string;
    note?: string;
  }>;
};

export type SubscriberRecord = {
  id: string;
  email: string;
  source: string;
  status: "active" | "unsubscribed";
  created_at: string;
};

export type ContentBundle = {
  articles: ArticleRecord[];
  categories: CategoryRecord[];
  config: SiteConfig;
  source: "supabase" | "fallback";
};
