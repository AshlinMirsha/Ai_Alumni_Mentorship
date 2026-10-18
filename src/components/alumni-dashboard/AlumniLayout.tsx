"use client";

import { useState, Suspense } from "react";
import { AlumniNav } from "@/components/alumni-dashboard/AlumniNav";
import { AlumniSidebar } from "@/components/alumni-dashboard/AlumniSidebar";

interface AlumniLayoutProps {
  children: React.ReactNode;
}

export function AlumniLayout({ children }: AlumniLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f5f7] flex flex-col antialiased">
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
          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-[#f3f5f7] shadow-xl z-50 p-4 overflow-y-auto">
            <Suspense fallback={null}>
              <AlumniSidebar onItemClick={() => setMobileMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Desktop Left Sidebar */}
          <div className="hidden lg:block">
            <Suspense fallback={<div className="w-60 h-96 bg-white border border-gray-200 rounded-lg animate-pulse" />}>
              <AlumniSidebar />
            </Suspense>
          </div>

          {/* Main Dynamic Page Content */}
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
