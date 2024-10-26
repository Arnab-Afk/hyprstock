import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.user_id) {
        setUserId(userData.user_id);
      } else {
        setError('User data not found');
      }
    } catch (error) {
      setError('Error parsing user data');
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://hyprstock.arnabbhowmik019.workers.dev/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        const filteredProducts = data.filter(product => product.user_id === userId);
        setProducts(filteredProducts);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProducts();
    }
  }, [userId, token]);

  if (isLoading) {
    return <div className="text-white text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }
  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewQuantity(product.quantity_in_stock);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setNewQuantity(0);
  };

  const handleUpdate = async (productId) => {
    try {
      const response = await fetch(`https://hyprstock.arnabbhowmik019.workers.dev/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity_in_stock: parseInt(newQuantity)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      // Update the local state
      setProducts(products.map(product => 
        product.product_id === productId 
          ? { ...product, quantity_in_stock: parseInt(newQuantity) }
          : product
      ));

      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold leading-6 text-white">Products</h1>
                <p className="mt-2 text-sm text-gray-300">
                  A list of all your products including their name, description, price, and stock status.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => navigate('/addProduct')}
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Add product
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-white text-center py-4">Loading...</div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-red-500 text-center py-4">Error: {error}</div>
            )}

            {/* No Products State */}
            {!isLoading && !error && products.length === 0 && (
              <div className="text-white text-center py-4">No products found</div>
            )}

            {/* Products Table */}
            {!isLoading && !error && products.length > 0 && (
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                            Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                            Description
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                            Price
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                            Stock
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {products.map((product) => (
                          <tr key={product.product_id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                              {product.product_name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {product.description}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            ₹{product.price.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {editingProduct?.product_id === product.product_id ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setNewQuantity(prev => Math.max(0, parseInt(prev) - 1))}
                                    className="text-gray-400 hover:text-gray-300 px-2 py-1 rounded-md bg-gray-800"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                    className="w-16 rounded-md border-gray-700 bg-gray-800 text-white px-2 py-1 text-center"
                                    min="0"
                                  />
                                  <button
                                    onClick={() => setNewQuantity(prev => parseInt(prev) + 1)}
                                    className="text-gray-400 hover:text-gray-300 px-2 py-1 rounded-md bg-gray-800"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => handleUpdate(product.product_id)}
                                    className="text-green-400 hover:text-green-300 px-2 py-1 rounded-md bg-gray-800"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="text-red-400 hover:text-red-300 px-2 py-1 rounded-md bg-gray-800"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <span className={`${product.quantity_in_stock === 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                  {product.quantity_in_stock} in stock
                                </span>
                              )}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                              {editingProduct?.product_id !== product.product_id && (
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="text-indigo-400 hover:text-indigo-300"
                                >
                                  Edit stock
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}