/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Star, Tag } from 'lucide-react';
import type { IProduct, IProductResponse } from '../context/CartContext';
import useCart from '../hooks/useCart';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductSkeleton } from './ui/ReactSkeletonLoader/ProductSkeleton';

const ProductListing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    handleFetchProduct,
    productList,
    productError,
    productLoading,
    handleAddToCart,
    cartItems,
  } = useCart();

  const handleNavigateToProductDetails = (getCurrentProductId: string) => {
    if (!getCurrentProductId) return;
    navigate(`/product-details/${getCurrentProductId}`);
  };

  let products: IProductResponse | null = productList;

  // Memoize fetchProduct outside of useEffect
  const fetchProduct = useCallback(
    async (q: string | null, retryCount = 0) => {
      try {
        const result = await handleFetchProduct(q || '');
        if (result.success && result.products) {
          products = result.products;
          console.log('search', products);
        } else {
          products = productList;
        }
      } catch (err) {
        console.error('Error in fetchProducts:', err);
        if (err && retryCount < 5) {
          // wait a few seconds and try again
          console.warn(
            `Error fetching product, retrying... Attempt ${retryCount + 1}`,
          );
          setTimeout(() => {
            fetchProduct(new URLSearchParams(location.search).get('category'));
          }, 2000); // Wait for 2 seconds before retrying
          return;
        }
      }
    },
    [handleFetchProduct],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('category');
    fetchProduct(q);
  }, [location.search]);

  // Function to render stars based on average rating
  const renderStars = (averageRating: number) => {
    // Full stars
    const stars = [];
    const ratingValue = averageRating !== undefined ? averageRating : 0;

    const fullStars = Math.floor(ratingValue);
    const emptyStars = 5 - Math.ceil(ratingValue);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          size={16}
          fill="currentColor"
          className="text-yellow-400"
        />,
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          size={16}
          className="text-gray-500" // Unfilled/grey star
        />,
      );
    }

    return stars;
  };

  if (location.pathname !== '/') return null;

  // Conditional Rendering for Loading, Error, and No Products
  if (productLoading) {
    return (
      <div className="lg:px-18 mx-auto my-10 grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-4 pt-10 lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] xl:px-20">
        {/* Render 4 skeletons */}
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (productError) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center py-8 font-semibold text-red-600">
        <p> Failed to fetch products. Please try again later...</p>
      </div>
    );
  }

  if (!products) {
    return;
  }

  if (products.products.length === 0) {
    return (
      <>
        <button
          className="mt-10 flex flex-row gap-2 pl-8 hover:font-semibold"
          onClick={() => navigate('/')}
        >
          <ArrowLeft />
          Back to Products
        </button>
        <div className="flex h-[60vh] items-center justify-center py-8 font-semibold text-gray-500">
          No products found.
        </div>
      </>
    );
  }

  return (
    <div className="lg:px-18 mx-auto my-10 grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-4 pt-10 lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] xl:px-20">
      {products.products.map((product: IProduct) => (
        <article
          key={product.id}
          className="flex min-h-[400px] cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 ease-in-out hover:shadow-lg dark:bg-gray-800"
          onClick={() => handleNavigateToProductDetails(product?.id)}
        >
          {/* Product Image Section */}
          <div className="relative h-56 w-full overflow-hidden">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-contain transition-transform duration-300 ease-in-out hover:scale-110"
            />

            {/* Heart Icon for Wishlist */}
            <div className="absolute right-2 top-2 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Wishlist feature coming soon');
                  // wishlist logic
                  // handleAddToWishlist(product.id);
                }}
                className="p-2 text-red-500 transition-colors hover:text-red-100 focus:outline-none"
                aria-label="Add to Wishlist"
                title="Add to Wishlist"
              >
                <Heart size={20} />
              </button>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-1 flex-col p-4">
            <h2 className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              {product.name}
            </h2>
            <div className="mt-auto flex w-full items-center justify-between">
              <p className="mt-auto flex items-center gap-1 text-xl font-bold text-teal-700">
                <Tag size={18} />₦
                {product.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {typeof product.rating === 'number' &&
                typeof product.ratingQuantity === 'number' && (
                  <div className="mb-2 flex items-center justify-center">
                    <div className="flex space-x-0.5">
                      {renderStars(product.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      ({product.ratingQuantity})
                    </span>
                  </div>
                )}
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <button
                className="rounded-sm bg-black px-5 py-2 font-bold text-white transition-colors hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateToProductDetails(product?.id);
                }}
              >
                View Product
              </button>
              <button
                disabled={cartItems?.some?.(
                  (item) => item?._id === product?.id,
                )}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                aria-label={`Add ${product.title} to cart`}
              >
                <ShoppingCart size={18} />
                Add
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ProductListing;
