import type { Metadata } from "next";
import { UserX } from "lucide-react";
import { alumniData, getAlumniById } from "@/lib/mock-data";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { AlumniProfileClient } from "@/components/alumni/AlumniProfileClient";

export function generateStaticParams() {
  return alumniData.map((alumnus) => ({
    id: alumnus.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const alumnus = getAlumniById(id);

  if (!alumnus) {
    return {
      title: "Profile Not Found | AlumniPath",
      description: "The requested alumni profile could not be found.",
    };
  }

  return {
    title: `${alumnus.name} — ${alumnus.role} at ${alumnus.company} | AlumniPath`,
    description: alumnus.bio.slice(0, 160),
  };
}

export default async function AlumniDetailPage({ params }: PageProps) {
  const { id } = await params;
  const alumnus = getAlumniById(id);

  if (!alumnus) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col antialiased">
        <AppHeader />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
          <EmptyState
            icon={<UserX size={26} />}
            title="Alumni Profile Not Found"
            description={`We couldn't locate an alumni record matching profile identifier "${id}". The profile may have been removed or the link is invalid.`}
            actionLabel="Return to Alumni Directory"
            actionHref="/alumni"
            className="w-full max-w-lg bg-white p-10 border border-[#E7E7E7] rounded-2xl shadow-xs"
          />
        </main>
      </div>
    );
  }

  return <AlumniProfileClient alumni={alumnus} />;
}
