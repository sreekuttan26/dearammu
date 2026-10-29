import type { Metadata, Viewport } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import { love } from "@/config/love";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: `For ${love.herName} 💌`,
  description: `A little something made just for ${love.herName}.`,
};

// viewport-fit=cover lets us paint under the notch; we pad with safe-area insets instead.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffe4ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${dancing.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
