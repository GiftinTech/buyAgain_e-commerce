import React, { useCallback, useEffect, useState } from 'react';
import { ShoppingCart, Star, Tag } from 'lucide-react';
import type { IProduct } from '../context/ShoppingContext';
import useCart from '../hooks/useShopping';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductSkeleton } from './ui/ReactSkeletonLoader/ProductSkeleton';
import { showAlert } from '../utils/alert';

const ProductListing: React.FC = () => {
  const { handleFetchProduct, handleAddToCart, cartItems } = useCart();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Flag to prevent multiple fetches

  console.log('cartItems:', cartItems);

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigateToProductDetails = (getCurrentProductId: string) => {
    navigate(`/product-details/${getCurrentProductId}`);
  };

  const fetchProduct = useCallback(async () => {
    if (hasFetched) return; // Prevent refetch
    setHasFetched(true);

    try {
      setLoading(true);
      setError('');
      const result = await handleFetchProduct();

      if (result.success && result.products) {
        setProducts(result.products);
      } else {
        setError(result.message || 'Failed to load products.');
        setProducts([]); // Ensure products is empty on error
      }
    } catch (err: unknown) {
      console.error('Error in fetchProductsData:', err);
      setError('An unexpected error occurred while fetching products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [handleFetchProduct, hasFetched]);

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
          className="text-gray-300" // Unfilled/grey star
        />,
      );
    }

    return stars;
  };

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('alert') === 'order') {
      showAlert(
        'success',
        'Your order was successful! Please check your email for a confirmation. If your order doesn’t show up here immediately, please come back later.',
      );

      // Remove query param after alert
      params.delete('alert');
      const newUrl = `${location.pathname}?${params.toString()}`;
      navigate(newUrl, { replace: true });
    }
  }, [location, navigate]);

  // Conditional Rendering for Loading, Error, and No Products
  if (loading) {
    return (
      <div className="lg:px-18 mx-auto my-10 grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-4 pt-10 lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] xl:px-20">
        {/* Render 4 skeletons */}
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center py-8 font-semibold text-red-600">
        Failed to fetch products. Please try again later...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">No products found.</div>
    );
  }

  return (
    <div className="lg:px-18 mx-auto my-10 grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-4 pt-10 lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] xl:px-20">
      {products.map((product: IProduct) => (
        <article
          key={product.id}
          className="relative flex min-h-[300px] cursor-pointer flex-col overflow-hidden rounded-lg shadow-md transition-shadow duration-300 ease-in-out hover:shadow-lg"
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.15)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')
          }
          onClick={() => handleNavigateToProductDetails(product?.id)}
        >
          {/* Product Image (Background) */}
          <img
            src={product.thumbnail}
            alt={product.title}
            className="absolute inset-0 z-0 h-full w-full rounded-lg object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 z-10 rounded-lg bg-black/10 dark:bg-white/10"></div>{' '}
          <div className="relative z-20 flex h-full flex-col p-4 text-white">
            {' '}
            <h2 className="mb-2 min-h-[3rem] text-center text-lg font-semibold">
              {product.name}
            </h2>
            <div className="mt-auto flex w-full items-center justify-between">
              <p className="mt-auto flex items-center gap-1 text-xl font-bold text-teal-900">
                <Tag size={18} />₦{product.price.toFixed(2)}
              </p>
              {/* Ratings Display */}
              {/* Only show ratings if product.rating is a number */}
              {typeof product.rating === 'number' &&
                typeof product.ratingQuantity === 'number' && (
                  <div className="mb-2 flex items-center justify-center">
                    <div className="flex space-x-0.5">
                      {renderStars(product.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-200">
                      ({product.ratingQuantity}){' '}
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
