import { createContext, useContext } from 'react';
import type { AdminContextType } from '../context/AdminContext';

//create the context
export const AdminContext = createContext<AdminContextType | undefined>(
  undefined,
);

const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default useAdmin;
