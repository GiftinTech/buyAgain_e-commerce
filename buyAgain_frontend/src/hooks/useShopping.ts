import { useContext } from 'react';
import { ShoppingCartContext } from '../context/ShoppingContext';

const useCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within an CartProvider');
  }
  return context;
};

export default useCart;
