import type { Metadata } from "next";
import { Cormorant_Garamond, Crimson_Pro, Noto_Naskh_Arabic, DM_Sans } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

// Headings: Elegant serif
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Body text: Highly readable serif
const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Arabic text: Traditional Naskh style
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Metadata/UI: Clean sans-serif
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Islamic Lecture Notes | English Notes from Arabic Lectures",
  description: "Professional English notes from Arabic Islamic lectures by Sheikh Ḥasan Ad-Daghrīrī. Clear, accessible Islamic scholarship for students worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${crimsonPro.variable} ${notoNaskhArabic.variable} ${dmSans.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
