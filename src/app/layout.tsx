import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AlumniPath — Collegiate Alumni Mentorship Network",
    template: "%s | AlumniPath",
  },
  description:
    "Direct, asynchronous mentorship connecting university students with verified alumni leaders across Tier-1 engineering, product, and design organizations.",
  keywords: [
    "alumni networking",
    "collegiate network",
    "career roadmap",
    "student mentorship",
    "software engineering mentorship",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[#FAFAFA] text-[#090909] font-sans antialiased selection:bg-[#090909] selection:text-white">
        {children}
      </body>
    </html>
  );
}
