import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_Khmer, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const notoKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  variable: "--font-noto-sans-khmer",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["Khmer OS", "system-ui", "sans-serif"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  display: "swap",
  fallback: ["Consolas", "Courier New", "monospace"],
});

export const metadata: Metadata = {
  title: "Rean (រៀន) — Software Development Learning & Resource Hub",
  description:
    "Curated software development resources, guided learning paths, and practical hands-on projects for developers.",
  icons: {
    icon: "/images/brand-book.png",
    shortcut: "/images/brand-book.png",
    apple: "/images/brand-book.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoKhmer.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-accent selection:text-navy">
        {children}
      </body>
    </html>
  );
}
