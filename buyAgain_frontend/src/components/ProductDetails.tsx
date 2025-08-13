import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Tag,
  ShoppingCart,
  Star,
  Box,
  Ruler,
  Weight,
  Truck,
  ShieldCheck,
  Info,
  Gift,
} from 'lucide-react'; // Added more icons

import useCart from '../hooks/useShopping';
import type { ICart } from '../context/ShoppingContext';
// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

const ProductDetailsPage = () => {
  const {
    loading,
    setLoading,
    setError,
    productDetails,
    setProductDetails,
    handleAddToCart,
    cartItems,
    cartError,
  } = useCart();

  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);

  // Function to render stars based on the average rating
  const renderStars = useCallback((averageRating: number | undefined) => {
    const stars = [];
    const ratingValue = averageRating !== undefined ? averageRating : 0;

    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 !== 0;
    const emptyStars = 5 - Math.ceil(ratingValue);

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

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half-${Date.now()}"
          size={16}
          fill="currentColor"
          className="text-yellow-400 opacity-70"
        />,
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={16} className="text-gray-300" />,
      );
    }
    return stars;
  }, []);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    console.log('Loading products details...');

    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/products/${id}`);

      if (!res.ok) {
        setError(res.statusText);
        throw new Error(res.statusText);
      }

      const result = await res.json();
      const productDetail = result.data.products;

      if (result) {
        setProductDetails(productDetail);
        setLoading(false);
        setError('');
      }
    } catch (err: unknown) {
      setError('Error fetching product details. Please try again later.');
      console.log('Error fetching product details:', err);

      setProductDetails(null);
      setLoading(false);
    }
  }, [id, setLoading, setError, setProductDetails]);

  useEffect(() => {
    if (id) fetchProductDetails();
  }, [id, fetchProductDetails]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <h3 className="text-xl">Fetching product details...</h3>
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
        <h3 className="mb-4 text-xl text-red-500">
          {cartError || 'Product not found or an error occurred.'}
        </h3>
        <button
          className="rounded-sm bg-black px-4 text-white dark:bg-white dark:text-black"
          onClick={() => navigate('/')}
        >
          Back to Products
        </button>
      </div>
    );
  }

  const handleThumbnailClick = (image: string) => {
    setMainImage(image);
  };

  // Check if product is already in cart to disable "Add to Cart" button
  const isProductInCart = cartItems.some(
    (item: ICart) => item.id === productDetails._id,
  );

  // Calculate discounted price
  const discountedPrice = productDetails.discountPercentage
    ? productDetails.price * (1 - productDetails.discountPercentage / 100)
    : productDetails.price;

  return (
    <div className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-gray-900 shadow-lg md:flex">
        {/* Product Image Gallery (Left Section) */}
        <div className="relative flex flex-col items-center justify-center p-6 md:w-1/2">
          <div className="relative mb-6 flex aspect-square w-full max-w-lg items-center justify-center overflow-hidden rounded-lg border-2 border-pink-600 shadow-xl">
            <img
              className="h-full w-full object-contain" // object-contain ensures image fits without cropping
              src={mainImage || productDetails.thumbnail}
              alt={productDetails.title || productDetails.name}
              onError={(e) => {
                e.currentTarget.src =
                  'https://placehold.co/600x600/333333/FFFFFF?text=Image+Not+Found';
              }}
            />
          </div>
          <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-4">
            {productDetails.images?.length > 0 ? (
              productDetails.images.map((img: string, index: number) => (
                <div
                  key={img} // Use the image URL as key, assuming unique URLs
                  className={`cursor-pointer rounded-lg p-2 shadow-md transition-all duration-200 ${
                    img === mainImage
                      ? 'border-2 border-pink-600'
                      : 'border border-gray-700 hover:border-pink-500'
                  }`}
                  onClick={() => handleThumbnailClick(img)}
                >
                  <img
                    className="h-20 w-20 rounded-md object-cover"
                    src={img}
                    alt={`Product thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://placehold.co/80x80/555555/FFFFFF?text=No+Img';
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No additional images available.
              </p>
            )}
          </div>
        </div>

        {/* Product Details (Right Section) */}
        <div className="flex flex-col justify-between p-6 md:w-1/2 md:p-10">
          <div>
            {/* Title, Brand, Category */}
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-pink-400">
              {productDetails.category}
            </p>
            <h1 className="mb-2 text-4xl font-extrabold leading-tight text-white">
              {productDetails.title || productDetails.name}
            </h1>
            <p className="mb-4 text-lg text-gray-400">
              By {productDetails.brand}
            </p>

            {/* Price & Rating */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
              <div className="flex flex-col">
                <p className="flex items-center gap-2 text-4xl font-extrabold text-pink-500">
                  <Tag size={28} className="text-pink-400" />$
                  {discountedPrice.toFixed(2)}
                </p>
                {productDetails.discountPercentage > 0 && (
                  <span className="ml-0 mt-1 text-base font-normal text-gray-400 line-through">
                    ${productDetails.price.toFixed(2)} (
                    {productDetails.discountPercentage}% OFF)
                  </span>
                )}
              </div>

              {/* Ratings Display */}
              {typeof productDetails.rating === 'number' &&
                typeof productDetails.ratingQuantity === 'number' && (
                  <div className="flex items-center text-gray-300">
                    <div className="flex space-x-0.5">
                      {renderStars(productDetails.rating)}
                    </div>
                    <span className="ml-2 text-sm">
                      ({productDetails.ratingQuantity} reviews)
                    </span>
                  </div>
                )}
            </div>

            {/* Stock & Availability */}
            <div className="mb-6">
              <p
                className={`text-lg font-bold ${productDetails.stock > 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                Status: {productDetails.availabilityStatus} (
                {productDetails.stock} in stock)
              </p>
            </div>

            {/* Description */}
            <p className="mb-8 leading-relaxed text-gray-300">
              {productDetails.description}
            </p>

            {/* Actions: Add to Cart */}
            <button
              onClick={() => handleAddToCart(productDetails)}
              disabled={isProductInCart || productDetails.stock === 0}
              className={`w-full rounded-lg px-6 py-3 text-lg font-bold transition-all duration-300 ${
                isProductInCart || productDetails.stock === 0
                  ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
              aria-label={`Add ${productDetails.title || productDetails.name} to cart`}
            >
              <ShoppingCart size={20} className="mr-2 inline-block" />
              {isProductInCart
                ? 'Already in Cart'
                : productDetails.stock === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
            </button>
          </div>

          {/* Additional Details (Bottom Section) */}
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="mb-4 text-xl font-bold text-white">
              Product Specifications
            </h3>
            <ul className="grid grid-cols-1 gap-3 text-gray-400 md:grid-cols-2">
              <li className="flex items-center gap-2">
                <Info size={16} className="text-pink-500" /> SKU:{' '}
                {productDetails.sku}
              </li>
              <li className="flex items-center gap-2">
                <Box size={16} className="text-pink-500" /> Brand:{' '}
                {productDetails.brand}
              </li>{' '}
              {/* Added Brand here */}
              <li className="flex items-center gap-2">
                <Truck size={16} className="text-pink-500" /> Shipping:{' '}
                {productDetails.shippingInformation}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-pink-500" /> Warranty:{' '}
                {productDetails.warrantyInformation}
              </li>
              <li className="flex items-center gap-2">
                <Ruler size={16} className="text-pink-500" /> Dimensions: H
                {productDetails.dimensions.height} x D
                {productDetails.dimensions.depth} cm
              </li>
              <li className="flex items-center gap-2">
                <Weight size={16} className="text-pink-500" /> Weight:{' '}
                {productDetails.weight} kg
              </li>
              <li className="flex items-center gap-2">
                <Gift size={16} className="text-pink-500" /> Return Policy:{' '}
                {productDetails.returnPolicy}
              </li>
            </ul>
            {productDetails.tags?.length > 0 && (
              <div className="mt-6">
                <span className="mb-2 block font-semibold text-white">
                  Product Tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {productDetails.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
