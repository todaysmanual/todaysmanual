import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://todaysmanual.com"),
  title: {
    default: "Today’s Manual — The guide for what comes next",
    template: "%s — Today’s Manual",
  },
  description:
    "Practical guidance for young Africans navigating work, money, skills, life and opportunity.",
  icons: {
    icon: "/todaysmanuallogo.png",
    shortcut: "/todaysmanuallogo.png",
    apple: "/todaysmanuallogo.png",
  },
  openGraph: {
    title: "Today’s Manual — The guide for what comes next",
    description: "Practical guidance for navigating work, money, skills, life and opportunity.",
    type: "website",
    url: "https://todaysmanual.com",
    siteName: "Today's Manual",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Today’s Manual — The guide for what comes next" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Today’s Manual — The guide for what comes next",
    description: "Practical guidance for navigating work, money, skills, life and opportunity.",
    images: ["/og.png"],
  },
};

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
