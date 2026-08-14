import { notFound } from "next/navigation";
import { CategoryPage } from "../components/CategoryPage";
import { getCategoryBySlug } from "@/lib/cms/content";

export const dynamic = "force-dynamic";

export default async function CategoryRoute({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const { category, articles } = await getCategoryBySlug(slug);
  if (!category) notFound();
  return <CategoryPage category={category} stories={articles} />;
}
