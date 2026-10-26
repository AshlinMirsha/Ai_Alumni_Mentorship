"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommunityRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/alumni-dashboard/community");
  }, [router]);

  return null;
}
