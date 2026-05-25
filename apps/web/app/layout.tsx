import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VietSMS API - High Deliverability SMS Gateway for Vietnam",
  description: "Vietnamese SMS/OTP API Service with 99.9% deliverability. Reliable SMS gateway for authentication, marketing, and notifications.",
  keywords: ["SMS API", "OTP Vietnam", "SMS Gateway", "Vietnamese SMS", "API Service", "Authentication", "Marketing SMS"],
  authors: [{ name: "Viet Anh" }],
  openGraph: {
    type: "website",
    url: "https://vietsmsapi.com",
    title: "VietSMS API - High Deliverability SMS Gateway for Vietnam",
    description: "Vietnamese SMS/OTP API Service with 99.9% deliverability.",
    images: ["/images/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VietSMS API - High Deliverability SMS Gateway for Vietnam",
    description: "Vietnamese SMS/OTP API Service with 99.9% deliverability.",
    images: ["/images/og-image.png"],
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
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 overflow-x-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
        <div className="relative z-10">
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
