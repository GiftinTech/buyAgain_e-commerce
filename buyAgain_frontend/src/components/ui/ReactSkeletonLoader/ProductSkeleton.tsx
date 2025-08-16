import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const ProductSkeleton = () => {
  return (
    <div className="relative flex min-h-[300px] cursor-pointer flex-col overflow-hidden rounded-lg shadow-md">
      {/* Skeleton for the image */}
      <Skeleton height={300} className="h-full w-full object-cover" />
      <div className="relative z-20 flex h-full flex-col p-4">
        {/* Skeleton for the title */}
        <Skeleton count={1} height={24} className="mb-2" />
        <div className="mt-auto flex w-full items-center justify-between">
          {/* Skeleton for the price */}
          <Skeleton width={80} height={20} />
          {/* Skeleton for the ratings */}
          <Skeleton width={80} height={20} />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          {/* Skeleton for the view product button */}
          <Skeleton width={120} height={40} />
          {/* Skeleton for the add to cart button */}
          <Skeleton width={80} height={40} />
        </div>
      </div>
    </div>
  );
};

export const ProductDetailsSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl animate-pulse overflow-hidden rounded-xl bg-gray-900 shadow-lg md:flex">
      {/* Skeleton for the image gallery */}
      <div className="relative flex flex-col items-center justify-center p-6 md:w-1/2">
        <div className="relative mb-6 aspect-square w-full max-w-lg overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full object-cover" />
        </div>
        <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-4">
          <Skeleton className="h-20 w-20 rounded-md" count={4} />
        </div>
      </div>
      {/* Skeleton for product details */}
      <div className="flex flex-col justify-between p-6 md:w-1/2 md:p-10">
        <div>
          <Skeleton width={120} className="mb-2" />
          <Skeleton width={300} height={40} className="mb-4" />
          <Skeleton width={180} className="mb-6" />
          <div className="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
            <Skeleton width={100} height={30} />
            <Skeleton width={120} height={20} />
          </div>
          <Skeleton width={100} className="mb-6" />
          <Skeleton count={3} />
          <Skeleton className="my-8" height={60} />
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6">
          <Skeleton width={200} height={24} className="mb-4" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Skeleton height={20} count={6} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReviewSkeleton = () => (
  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-md">
    <Skeleton width={100} className="mb-2" />
    <Skeleton count={2} />
    <Skeleton width={150} className="mt-2" />
  </div>
);
