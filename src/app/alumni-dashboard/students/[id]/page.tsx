import { Suspense } from "react";
import type { Metadata } from "next";
import { studentsData } from "@/lib/mock-data";
import { StudentProfileClient } from "@/components/alumni-dashboard/StudentProfileClient";

export function generateStaticParams() {
  return studentsData.map((st) => ({
    id: st.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const student = studentsData.find((s) => s.id === id);

  if (!student) {
    return {
      title: "Student Profile Not Found | AlumniPath",
      description: "The requested student profile could not be found.",
    };
  }

  return {
    title: `${student.name} — ${student.careerGoal} | Discover Students | AlumniPath`,
    description: student.bio.slice(0, 160),
  };
}

export default async function StudentProfilePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-xs text-gray-500 animate-pulse">
          Loading student profile...
        </div>
      }
    >
      <StudentProfileClient studentId={id} />
    </Suspense>
  );
}
