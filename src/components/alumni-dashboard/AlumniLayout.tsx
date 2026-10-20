"use client";

import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { AlumniNav } from "@/components/alumni-dashboard/AlumniNav";
import { AlumniSidebar } from "@/components/alumni-dashboard/AlumniSidebar";
import { cn } from "@/lib/utils";

interface AlumniLayoutProps {
  children: React.ReactNode;
}

export function AlumniLayout({ children }: AlumniLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/alumni-dashboard";
  const isStudentsPage = pathname?.startsWith("/alumni-dashboard/students");
  const hideSidebar = isDashboard || isStudentsPage;

  return (
    <div className="min-h-screen bg-[#F3F2EF] flex flex-col antialiased text-[#191919]">
      {/* Top Navigation */}
      <AlumniNav
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen((p) => !p)}
      />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-[#F3F2EF] shadow-xl z-50 p-4 overflow-y-auto">
            <Suspense fallback={null}>
              <AlumniSidebar onItemClick={() => setMobileMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6",
          hideSidebar ? "max-w-[1400px]" : "max-w-7xl"
        )}
      >
        {hideSidebar ? (
          <main className="w-full">{children}</main>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Desktop Left Sidebar for Portal Subpages */}
            <div className="hidden lg:block">
              <Suspense
                fallback={
                  <div className="w-60 h-96 bg-white border border-[#D9D9D9] rounded-lg animate-pulse" />
                }
              >
                <AlumniSidebar />
              </Suspense>
            </div>

            {/* Subpage Dynamic Content */}
            <main className="flex-1 min-w-0 w-full">{children}</main>
          </div>
        )}
      </div>
    </div>
  );
}
