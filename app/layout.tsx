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
  title: "Today's Manual — Coming Soon",
  description:
    "Today's Manual is a modern guide for navigating work, money, skills, life and success in a changing world.",
  icons: {
    icon: "/todaysmanuallogo.png",
    shortcut: "/todaysmanuallogo.png",
    apple: "/todaysmanuallogo.png",
  },
  openGraph: {
    title: "Today's Manual",
    description: "The world changed. The manual changed with it.",
    type: "website",
    url: "https://todaysmanual.com",
    siteName: "Today's Manual",
  },
  twitter: {
    card: "summary",
    title: "Today's Manual",
    description: "The world changed. The manual changed with it.",
  },
};

export const viewport: Viewport = {
  themeColor: "#071A38",
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
