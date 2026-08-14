import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getContentBundle } from "@/lib/cms/content";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getContentBundle();
  return {
    metadataBase: new URL("https://todaysmanual.com"),
    title: { default: config.siteTitle, template: `%s — ${config.siteTitle}` },
    description: config.siteDescription,
    icons: { icon: config.logoUrl, shortcut: config.logoUrl, apple: config.logoUrl },
    openGraph: {
      title: config.siteTitle,
      description: config.siteDescription,
      type: "website",
      url: "https://todaysmanual.com",
      siteName: config.siteTitle,
      images: [{ url: config.ogImageUrl, alt: config.siteTitle }],
    },
    twitter: { card: "summary_large_image", title: config.siteTitle, description: config.siteDescription, images: [config.ogImageUrl] },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
