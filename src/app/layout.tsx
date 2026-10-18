import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AlumniPath — Alumni Networking & Career Mentorship",
    template: "%s | AlumniPath",
  },
  description:
    "Connect with alumni who understand your ambitions. Get career mentorship, AI-powered guidance, and a clear path to your professional goals.",
  keywords: [
    "alumni networking",
    "career mentorship",
    "college network",
    "career guidance",
    "student mentorship",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
