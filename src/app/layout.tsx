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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | ReppulseAI",
    default: "ReppulseAI - Capture 5-Star Reviews & Intercept Bad Ones",
  },
  description: "Protect your business reputation. Get more 5-star Google reviews and privately intercept negative feedback before it goes public.",
  keywords: ["reputation management", "google reviews", "business reviews", "intercept negative reviews"],
  openGraph: {
    title: "ReppulseAI - Capture 5-Star Reviews & Intercept Bad Ones",
    description: "Protect your business reputation. Get more 5-star Google reviews and privately intercept negative feedback before it goes public.",
    type: "website",
    locale: "en_US",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
