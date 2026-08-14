import {
  heroArticle,
  manuals,
  quickReads,
  secondaryStories,
  startHereItems,
  dailyBriefs,
  popularTopics,
} from "@/app/data/homepage";
import { contactEmail, socialLinks } from "@/app/data/contact";
import { imageCredits } from "@/app/data/imageCredits";
import type { ArticleRecord, CategoryRecord, SiteConfig } from "./types";

const fallbackBody = [
  "## The useful version is on its way",
  "We’re building this story with the context, examples and practical next steps it deserves.",
  "In the meantime, explore Today’s Manual for more useful guidance on work, money, skills, life and opportunity.",
].join("\n\n");

function toArticle(
  article: typeof heroArticle,
  sortOrder: number,
): ArticleRecord {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    category_slug: article.category.toLowerCase(),
    excerpt: article.excerpt ?? "A practical guide from Today’s Manual.",
    body: fallbackBody,
    image_url: article.image,
    image_alt: article.imageAlt,
    read_time: article.readTime,
    author: "Today’s Manual",
    status: "published",
    featured: Boolean(article.featured),
    sort_order: sortOrder,
    published_at: "2026-08-01T08:00:00.000Z",
  };
}

export const defaultArticles: ArticleRecord[] = [
  heroArticle,
  ...secondaryStories,
  ...quickReads,
].map((article, index) => toArticle(article, index));

export const defaultCategories: CategoryRecord[] = manuals.map((manual, index) => ({
  slug: manual.slug,
  title: manual.name.replace(" Manual", ""),
  description: manual.description,
  color: manual.color,
  image_url: manual.image,
  image_alt: manual.imageAlt,
  sort_order: index,
  published: true,
}));

export const defaultSiteConfig: SiteConfig = {
  siteTitle: "Today’s Manual",
  siteDescription: "Practical guidance for young Africans navigating work, money, skills, life and opportunity.",
  contactEmail,
  logoUrl: "/todaysmanual1.png",
  ogImageUrl: "/og.png",
  issueLabel: "Issue 001",
  headerLabel: "Today in the Manual",
  headerTopics: ["AI", "Careers", "Money", "Ghana", "Business"],
  popularTopics,
  socialLinks: socialLinks.map((link) => ({ ...link })),
  heroArticleSlug: heroArticle.slug,
  secondaryArticleSlugs: secondaryStories.map((article) => article.slug),
  quickReadSlugs: quickReads.map((article) => article.slug),
  startHereEyebrow: "Start here",
  startHereTitle: "Where are you right now?",
  startHereItems: startHereItems.map((item) => ({ ...item })),
  manualsEyebrow: "The five manuals",
  manualsTitle: "Explore what matters.",
  manualsDescription: "Everything you need to build a meaningful and successful life in today’s world.",
  quickReadsTitle: "You should know this.",
  quickReadsDescription: "Quick reads to help you make smarter decisions.",
  dailyBriefsTitle: "3 things you should know today",
  dailyBriefs: dailyBriefs.map((item) => ({ ...item })),
  voice: {
    eyebrow: "Voices",
    description: "Real stories from young Africans.",
    quote: "I thought getting a degree was enough.",
    attribution: "Kofi, 26, Accra",
    imageUrl: "/editorial/voice.jpg",
    imageAlt: "A young Ghanaian man speaking during a University of Ghana workshop",
    href: "/article/voices",
  },
  featuredManual: {
    eyebrow: "The Manual",
    description: "Definitive guides for every stage of your journey.",
    title: "The Interview Manual",
    summary: "Everything you need before, during and after an interview.",
    readTime: "12 min read",
    imageUrl: "/editorial/interview.jpg",
    imageAlt: "Ghanaian broadcaster Anita Erskine taking part in a television interview",
    href: "/article/the-interview-manual",
  },
  newsletter: {
    title: "The Morning Manual",
    description: "Three useful things. Five minutes. Every morning.",
    buttonLabel: "Get the Manual",
    successTitle: "You’re on the Morning Manual list.",
    successDescription: "Watch your inbox for the next edition.",
  },
  footerDescription: "A guide for the generation building tomorrow. Practical knowledge, honest conversations and useful direction for navigating careers, business and life in modern Africa.",
  footerColumns: [
    { title: "Explore", links: defaultCategories.map((category) => ({ label: `${category.title} Manual`, href: `/${category.slug}` })) },
    { title: "About", links: ["About Us", "Our Mission", "Editorial Principles", "Write for Us", "Contributors"].map((label) => ({ label, href: `/article/${label.toLowerCase().replaceAll(" ", "-")}` })) },
    { title: "Resources", links: ["The Manual", "Opportunities", "Newsletter", "Podcast", "Videos"].map((label) => ({ label, href: label === "Newsletter" ? "/#newsletter" : `/article/${label.toLowerCase().replaceAll(" ", "-")}` })).concat([{ label: "Image Credits", href: "/image-credits" }]) },
    { title: "Support", links: ["Contact Us", "Advertise", "Partner With Us", "Privacy Policy", "Terms of Use"].map((label) => ({ label, href: label === "Contact Us" ? `mailto:${contactEmail}` : `/article/${label.toLowerCase().replaceAll(" ", "-")}` })) },
  ],
  footerSignoff: "Made in Africa for the world we live in.",
  imageCredits: imageCredits.map((credit) => ({ ...credit })),
};
