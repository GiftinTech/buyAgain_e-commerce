import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useCart from '../hooks/useShopping';

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
  } = useCart();

  const { id } = useParams();
  //console.log(id);

  const fetchProductDetails = async () => {
    setLoading(true);
    console.log('Loading products details...');

    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/products/${id}`);

      if (!res.ok) {
        setError(res.statusText);
        throw new Error(res.statusText);
      }

      const result = await res.json();
      //console.log(result);

      if (result) {
        //console.log("Product details loaded successfully:", result?.details);
        setProductDetails(result);
        setLoading(false);
        setError('');
      }
    } catch (err: unknown) {
      setError('Error fetching product details. Please try again later.');
      console.log('Error fetching product details:', err);

      setProductDetails(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return <h3 className="flex justify-center">Fetching product details...</h3>;

  // prettier-ignore

  return (
    <div>
      <div className="lg:max-w-7x mx-auto bg-white text-black max-w-4xl p-6">
        <div className="grid grid-cols-1 items-center gap-12 p-6 shadow-sm lg:grid-cols-5">
          <div className="w-full top-0 text-center lg:sticky lg:col-span-3">
            <div className="relative rounded-xl px-4 py-10 shadow-lg">
              <img
                className="w-4/5 rounded object-cover"
                src={productDetails?.thumbnail}
                alt={productDetails?.title}
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 mx-auto">
              {
                productDetails?.images.length ?
                productDetails?.images.map(img => 
                <div className="rounded-xl p-4 shadow-md" key={img}>
                  <img 
                  className="w-24 cursor-pointer"
                  src={img} 
                  alt='Product secondary image.' 
                  />
                </div>
                ) : null
              }
            </div>
          </div>
          <div className="lg:col-span-2">
              <h2 className="text-2xl font-extrabold text-[#333]">{productDetails?.title}</h2>
              <div className="flex flex-wrap gap-4 mt-4">
                <p className="text-xl font-bold">${productDetails?.price}</p>
              </div>
              <div>
                <button 
                  disabled={cartItems.findIndex(item=>item.id === productDetails?.id)> - 1}
                  onClick={()=>handleAddToCart(productDetails!)} 
                  className="disabled:opacity-35 min-w-[200px] px-4 py-3 border border-[#333] bg-transparent text-sm font-semibold rounded mt-5"
                >Add to Cart</button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
