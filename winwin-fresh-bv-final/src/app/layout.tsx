import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "WIN & WIN FRESH BV | Dagverse Groenten en Fruit in Nederland",
  description:
    "WIN & WIN FRESH BV levert dagelijks verse groenten en fruit van Nederlandse telers en wereldwijde topleveranciers. Verkoop per stuk, gekoeld bezorgd, eenvoudig bestellen als gast.",
  keywords: [
    "verse groenten",
    "vers fruit",
    "Nederland",
    "WIN & WIN FRESH BV",
    "tomaten",
    "appels",
    "per stuk",
    "gekoelde bezorging",
    "biologische groenten",
  ],
  authors: [{ name: "WIN & WIN FRESH BV" }],
  icons: {
    icon: [{ url: "/images/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/images/favicon.svg",
    apple: "/images/winwin-logo.png",
  },
  openGraph: {
    title: "WIN & WIN FRESH BV | Verse groenten en fruit van topkwaliteit",
    description: "Dagelijks vers ingekocht, per stuk geprijsd en gekoeld bezorgd aan huis in heel Nederland.",
    url: "https://winandwinfresh.nl",
    siteName: "WIN & WIN FRESH BV",
    locale: "nl_NL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#fcfbf7] text-[#1c1917] antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
