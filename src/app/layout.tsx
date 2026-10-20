import type { Metadata } from "next";
import localFont from "next/font/local";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const repro = localFont({
  src: "./fonts/ABCReproVariable.ttf",
  variable: "--font-repro",
  display: "swap",
});

const zalandoSE = localFont({
  src: "./fonts/ZalandoSansSemiExpanded-VariableFont_wght.ttf",
  variable: "--font-zalando-se",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${repro.variable} ${zalandoSE.variable}`} suppressHydrationWarning>
      <head>
        {/* Run before paint to avoid flash of wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light');})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <div className="fixed top-2 right-3 z-50">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
