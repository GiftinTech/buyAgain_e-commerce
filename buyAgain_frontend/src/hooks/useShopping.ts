import { createContext, useContext } from 'react';
import type { ShopContextType } from '../context/ShoppingContext';

//create the context
export const ShoppingCartContext = createContext<ShopContextType | undefined>(
  undefined,
);

const useCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within an CartProvider');
  }
  return context;
};

export default useCart;
