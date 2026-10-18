import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#f3f5f7] flex flex-col antialiased">
      <DashboardNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Back Link Skeleton */}
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />

        {/* Header Card Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="space-y-2">
                <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-80 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-3 pt-1">
                  <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full sm:w-44">
              <div className="h-10 w-full bg-[#ebf3fb] rounded-full animate-pulse" />
              <div className="h-10 w-full bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* 2-Column Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3 shadow-xs">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-4/6 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 shadow-xs">
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-16 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-16 w-full bg-gray-100 rounded animate-pulse" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3 shadow-xs">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3 shadow-xs">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-6 w-14 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
