export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-100 rounded w-16"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-100 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-100 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-14"></div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-20"></div>
        </div>
        <div className="text-right space-y-2 ml-4">
          <div className="h-7 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-100 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}
