import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Bordon.ai",
  description: "A brand-new party game. Just for tonight."
};

// viewportFit:cover is required for env(safe-area-inset-*) to be non-zero on
// notched phones. User-scaling stays enabled on purpose (accessibility) — the
// overscroll lock in globals.css handles bounce, not zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFF8E1"
};

// Vercel function timeout. Haiku 4.5 finishes in ~9–13s; we set the cap
// well above that so transient slow calls don't get clipped. Hobby tier
// allows up to 60s; raise to 300s on Pro if you switch back to Sonnet.
export const maxDuration = 60;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="bg-cream font-sans text-ink antialiased">
        {/* #app-shell + #app-scroll lock the viewport on touch devices (see
            globals.css). The footer lives inside the scroll region because it's
            content, not chrome — under the locked body it must stay reachable. */}
        <div id="app-shell">
          <SiteNav />
          <div id="app-scroll">
            {children}
            <SiteFooter />
          </div>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
