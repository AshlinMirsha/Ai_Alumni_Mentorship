import { AppHeader } from "@/components/layout/AppHeader";

export default function AlumniLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col antialiased">
      <AppHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2 pb-2 border-b border-gray-200">
          <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
          <div className="h-8 w-56 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-neutral-100 rounded animate-pulse" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="bg-white p-4 rounded-2xl border border-[#E7E7E7] shadow-xs space-y-3">
          <div className="h-10 w-full bg-neutral-100 rounded-xl animate-pulse" />
          <div className="hidden lg:grid grid-cols-7 gap-2.5 pt-3 border-t border-gray-100">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 bg-neutral-100 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E7E7E7] p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-neutral-200 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-44 bg-neutral-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-neutral-100 rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-neutral-100 rounded animate-pulse" />
              </div>
              <div className="flex gap-1.5">
                <div className="h-5 w-16 bg-neutral-100 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-neutral-100 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-neutral-100 rounded-full animate-pulse" />
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
                <div className="h-8 w-28 bg-neutral-200 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
