export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full animate-shimmer"></div>
            <div className="h-5 rounded-lg w-28 animate-shimmer"></div>
            <div className="h-4 rounded w-14 animate-shimmer"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-6 rounded w-14 animate-shimmer"></div>
            <div className="flex-1 h-0.5 animate-shimmer rounded"></div>
            <div className="h-6 rounded w-14 animate-shimmer"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-4 rounded-full w-12 animate-shimmer"></div>
            <div className="h-4 rounded-full w-16 animate-shimmer"></div>
          </div>
        </div>
        <div className="text-right space-y-2 ml-6">
          <div className="h-8 rounded w-24 animate-shimmer"></div>
          <div className="h-3 rounded w-16 animate-shimmer"></div>
          <div className="h-7 rounded-lg w-20 animate-shimmer"></div>
        </div>
      </div>
    </div>
  )
}
