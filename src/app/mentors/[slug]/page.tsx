import { notFound } from "next/navigation";
import { alumniData, getAlumniById } from "@/lib/mock-data";
import { AlumniProfileClient } from "@/components/alumni/AlumniProfileClient";

export function generateStaticParams() {
  return alumniData.map((alumnus) => ({
    slug: alumnus.id,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MentorSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const alumnus = getAlumniById(slug) || alumniData.find((a) => a.id === slug || a.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase());

  if (!alumnus) {
    notFound();
  }

  return <AlumniProfileClient alumni={alumnus} />;
}
