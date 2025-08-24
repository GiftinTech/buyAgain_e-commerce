import { createContext, useContext } from 'react';
import type { CartContextType } from '../context/CartContext';

//create the context
export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within an CartProvider');
  }
  return context;
};

export default useCart;
