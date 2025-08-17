import { useState, useMemo } from 'react';
import { Plus, XCircle, Edit, Trash2 } from 'lucide-react';
import type { IProduct } from '../../../context/ShoppingContext';
import useAdmin from '../../../hooks/useAdmin';
import useCart from '../../../hooks/useShopping';

const ProductManagement = () => {
  const { productList } = useCart();
  const { handleCreateProduct, handleUpdateProduct, handleDeleteProduct } =
    useAdmin();

  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [newProductForm, setNewProductForm] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    price: '',
    stock: '',
  });

  const PAGE_SIZE = 5;

  const products = productList;

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          String(p.price).toLowerCase().includes(productSearch.toLowerCase()),
      ),
    [products, productSearch],
  );

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, productPage]);

  const startEditProduct = (product: IProduct) => {
    setEditingProduct(product);
  };

  const cancelEditProduct = () => {
    setEditingProduct(null);
  };

  const saveProduct = async () => {
    if (!editingProduct) return;

    await handleUpdateProduct(editingProduct);

    setEditingProduct(null);
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await handleDeleteProduct(id);
    }
  };

  const startAddProduct = () => {
    setNewProductForm(true);
    setNewProductData({ name: '', price: '', stock: '' });
  };

  const cancelAddProduct = () => {
    setNewProductForm(false);
  };

  const saveNewProduct = async () => {
    if (
      newProductData.name.trim() === '' ||
      newProductData.stock.trim() === '' ||
      newProductData.price.trim() === '' ||
      isNaN(Number(newProductData.price))
    )
      return alert('Please fill all fields');

    const newProduct = {
      name: newProductData.name,
      price: Number(newProductData.price),
      stock: Number(newProductData.stock),
    } as unknown as IProduct;

    await handleCreateProduct(newProduct);
    setNewProductForm(false);
    setNewProductData({ name: '', price: '', stock: '' });
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Product Management
        </h2>
        {!newProductForm && (
          <button
            onClick={startAddProduct}
            className="inline-flex items-center gap-1 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        )}
      </div>

      {/* New Product Form */}
      {newProductForm && (
        <div className="mb-4 rounded border border-pink-500 p-4 dark:border-pink-400">
          <div className="flex justify-between">
            <h3 className="mb-2 font-semibold text-pink-600 dark:text-pink-400">
              Add New Product
            </h3>
            <button onClick={cancelAddProduct} aria-label="Cancel add product">
              <XCircle className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveNewProduct();
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Name"
              className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={newProductData.name}
              onChange={(e) =>
                setNewProductData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <input
              type="text"
              placeholder="Price (e.g. $50)"
              className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={newProductData.price}
              onChange={(e) => {
                setNewProductData((prev) => ({
                  ...prev,
                  price: e.target.value,
                }));
              }}
              required
            />
            <input
              type="number"
              placeholder="Stock"
              className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={newProductData.stock}
              onChange={(e) =>
                setNewProductData((prev) => ({
                  ...prev,
                  stock: e.target.value,
                }))
              }
              required
              min={0}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-pink-600 px-4 py-1 text-white hover:bg-pink-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelAddProduct}
                className="rounded border border-pink-600 px-4 py-1 text-pink-600 hover:bg-pink-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <input
        type="search"
        placeholder="Search products..."
        className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        value={productSearch}
        onChange={(e) => {
          setProductSearch(e.target.value);
          setProductPage(1);
        }}
      />

      {/* Products Table */}
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
        <thead className="bg-gray-50 dark:bg-gray-600">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
              ID
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
              Name
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
              Price
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
              Stock
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
          {paginatedProducts.map((product, i) =>
            editingProduct?.id === product.id ? (
              <tr key={product.id}>
                <td className="cursor-pointer px-4 py-2 text-sm dark:text-gray-200">
                  {(productPage - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </td>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  <input
                    type="text"
                    value={editingProduct.price}
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        price: isNaN(newPrice) ? 0 : newPrice,
                      });
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </td>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    min={0}
                  />
                </td>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  <button
                    onClick={saveProduct}
                    className="mr-2 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditProduct}
                    className="rounded border border-pink-500 px-3 py-1 text-pink-500 hover:bg-pink-100"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={product.id}>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  {(productPage - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  {product.name}
                </td>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  {product.price}
                </td>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  {product.stock}
                </td>
                <td className="px-4 py-2 text-sm dark:text-gray-200">
                  <button
                    onClick={() => startEditProduct(product)}
                    className="mr-4 text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300"
                    aria-label={`Edit product ${product.name}`}
                  >
                    <Edit className="inline h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    aria-label={`Delete product ${product.name}`}
                  >
                    <Trash2 className="inline h-4 w-4" />
                  </button>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-between text-gray-600 dark:text-gray-300">
        <button
          onClick={() => setProductPage((p) => Math.max(p - 1, 1))}
          disabled={productPage === 1}
          className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
        >
          Previous
        </button>
        <span>
          Page {productPage} of{' '}
          {Math.ceil(filteredProducts.length / PAGE_SIZE) || 1}
        </span>
        <button
          onClick={() =>
            setProductPage((p) =>
              p < Math.ceil(filteredProducts.length / PAGE_SIZE) ? p + 1 : p,
            )
          }
          disabled={
            productPage >= Math.ceil(filteredProducts.length / PAGE_SIZE)
          }
          className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default ProductManagement;
