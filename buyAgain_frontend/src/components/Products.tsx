import React, { useEffect, useState } from 'react';
import { ShoppingCart, Tag } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import type { Product } from '../context/AuthContext';

const ProductListing: React.FC = () => {
  const { handleFetchProduct } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log(error);
  console.log(loading);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await handleFetchProduct();

      console.log('Fetched Products:', result);

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
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Conditional Rendering for Loading, Error, and No Products
  if (loading) {
    return (
      <div className="py-8 text-center text-gray-700">Loading products...</div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center font-semibold text-red-600">
        Error: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">No products found.</div>
    );
  }

  return (
    <div className="mx-auto my-8 grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-4 lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] lg:px-12 xl:px-20">
      {products.map((product: Product) => (
        <article
          key={product.id}
          className="flex flex-col items-center rounded-lg bg-white p-4 shadow-md transition-shadow duration-300 ease-in-out hover:shadow-lg"
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.15)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')
          }
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="mb-4 h-40 w-full rounded-sm bg-gray-200 object-contain"
          />
          <h2 className="mb-2 min-h-[3rem] text-center text-lg font-semibold">
            {product.name}
          </h2>
          <p className="mb-4 flex items-center gap-1 text-xl font-bold text-teal-600">
            <Tag size={18} />${product.price.toFixed(2)}
          </p>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border-none bg-slate-800 px-4 py-2 font-semibold text-white transition-colors duration-300 ease-in-out hover:bg-slate-700"
            onClick={() => alert(`Added "${product.name}" to cart`)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </article>
      ))}
    </div>
  );
};

export default ProductListing;
