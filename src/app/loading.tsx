export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-brand-bg flex flex-col">
      {/* Skeleton Navbar */}
      <div className="w-full h-16 bg-white border-b border-border flex items-center justify-between px-6 md:px-12 animate-pulse">
        <div className="h-6 w-36 bg-gray-200 rounded-md" />
        <div className="hidden md:flex items-center gap-8">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Main Skeleton Shell */}
      <div className="grow max-w-7xl mx-auto w-full px-6 py-8 md:px-12 flex flex-col gap-12">
        {/* Hero Banner Skeleton */}
        <div className="w-full h-[40vh] min-h-[300px] bg-white rounded-xl shadow-card p-8 flex flex-col justify-end animate-pulse">
          <div className="max-w-xl flex flex-col gap-4">
            <div className="h-10 w-3/4 bg-gray-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
            <div className="flex gap-4 mt-4">
              <div className="h-11 w-36 bg-gray-200 rounded-lg" />
              <div className="h-11 w-36 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Catalog Tabs Placeholder */}
        <div className="flex justify-center md:justify-start gap-4 animate-pulse">
          <div className="h-11 w-40 bg-gray-200 rounded-full" />
          <div className="h-11 w-40 bg-gray-200 rounded-full" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-border p-4 flex flex-col gap-4 shadow-card"
            >
              {/* Card Image */}
              <div className="aspect-video w-full bg-gray-200 rounded-lg" />
              {/* Category Tag */}
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
              {/* Title */}
              <div className="h-6 w-3/4 bg-gray-200 rounded" />
              {/* Short Desc */}
              <div className="flex flex-col gap-2">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-200 rounded" />
              </div>
              {/* Price & Action Row */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <div className="h-5 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-20 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
