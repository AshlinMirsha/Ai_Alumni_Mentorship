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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("alumnipath_theme");if(!t){var s=localStorage.getItem("alumnipath_user_settings");if(s){var p=JSON.parse(s);if(p&&p.appearance&&p.appearance.theme){t=p.appearance.theme;}}}var d=t==="dark"||(t==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}else{document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light";}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FAFAFA] text-[#090909] font-sans antialiased selection:bg-[#090909] selection:text-white">
        {children}
      </body>
    </html>
  );
}
