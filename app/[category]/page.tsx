import { notFound } from "next/navigation";
import { CategoryPage } from "../components/CategoryPage";
import { categoryNames } from "../data/homepage";

export function generateStaticParams() {
  return categoryNames.map((category) => ({ category }));
}

export default async function CategoryRoute({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!categoryNames.includes(category as (typeof categoryNames)[number])) notFound();
  return <CategoryPage category={category} />;
}

