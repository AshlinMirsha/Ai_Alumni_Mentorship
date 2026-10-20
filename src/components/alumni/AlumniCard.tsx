"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Alumni } from "@/types";

interface AlumniCardProps {
  alumni: Alumni & { experienceYears?: string; coverUrl?: string };
}

// Curated architectural grayscale cover photos for alumni cards
const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
];

function getCoverForAlumni(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_COVERS[Math.abs(hash) % DEFAULT_COVERS.length];
}

export function AlumniCard({ alumni }: AlumniCardProps) {
  const coverUrl = alumni.coverUrl || getCoverForAlumni(alumni.id);

  return (
    <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-xs hover:shadow-md hover:border-[#D1D1D1] transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Grayscale Panoramic Architectural Cover */}
        <div className="h-32 w-full bg-[#F4F4F4] relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={`${alumni.name} cover`}
            className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#090909] border border-[#E7E7E7]">
            Class of &apos;{String(alumni.graduationYear).slice(-2)}
          </span>
        </div>

        {/* Overlapping Circular Avatar & Details */}
        <div className="px-5 pt-0 pb-4 relative">
          <div className="-mt-8 mb-3 flex items-end justify-between">
            <div className="relative">
              <Avatar
                name={alumni.name}
                src={alumni.avatar}
                size="lg"
                className="ring-4 ring-white"
              />
              {alumni.isVerified && (
                <span
                  title="Verified Alumni"
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#090909] text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-white"
                >
                  <Check size={9} strokeWidth={3} />
                </span>
              )}
            </div>

            {alumni.matchScore && (
              <span className="text-[10px] font-semibold text-[#090909] bg-[#F4F4F4] px-2 py-0.5 rounded-full border border-[#E7E7E7]">
                {alumni.matchScore}% Match
              </span>
            )}
          </div>

          <Link
            href={`/alumni/${alumni.id}`}
            className="text-base font-bold text-[#090909] group-hover:text-[#454545] transition-colors block"
          >
            {alumni.name}
          </Link>

          <p className="text-xs text-[#454545] font-medium mt-0.5">
            {alumni.role} · <strong className="text-[#090909]">{alumni.company}</strong>
          </p>

          <p className="text-[11px] text-[#737373] mt-0.5">
            {alumni.location} · {alumni.department || "Computer Science"}
          </p>

          <p className="text-xs text-[#555555] leading-relaxed mt-3 line-clamp-2 italic">
            &ldquo;{alumni.bio}&rdquo;
          </p>

          {/* Skills Chips */}
          <div className="flex flex-wrap gap-1 mt-3.5">
            {alumni.skills.slice(0, 3).map((s) => (
              <span
                key={s.id || s.name}
                className="text-[10px] text-[#454545] bg-[#F4F4F4] px-2 py-0.5 rounded-full border border-[#E7E7E7]"
              >
                {s.name}
              </span>
            ))}
            {alumni.skills.length > 3 && (
              <span className="text-[10px] text-[#737373] px-1 py-0.5">
                +{alumni.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer with Circular Arrow Button */}
      <div className="px-5 py-3.5 border-t border-[#E7E7E7] bg-[#FAFAFA] flex items-center justify-between">
        <span className="text-xs text-[#242424] font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#090909]" />
          {alumni.responseRate || 96}% response
        </span>

        <Link
          href={`/alumni/${alumni.id}`}
          className="w-8 h-8 rounded-full bg-[#090909] text-white flex items-center justify-center hover:bg-[#242424] active:scale-95 transition-all shadow-xs"
          aria-label={`View ${alumni.name}'s profile`}
        >
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
