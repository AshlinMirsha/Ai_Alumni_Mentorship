import type { Metadata } from "next";
import { AlumniLayout } from "@/components/alumni-dashboard/AlumniLayout";

export const metadata: Metadata = {
  title: "Alumni Mentor Portal | AlumniPath",
  description:
    "Dedicated alumni mentorship dashboard to discover students, review incoming mentorship requests, post opportunities, and guide future leaders.",
};

export default function AlumniRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AlumniLayout>{children}</AlumniLayout>;
}
