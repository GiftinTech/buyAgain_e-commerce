import { createContext, useContext } from 'react';
import type { UserContextType } from '../context/UserContext';

//create the context
export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default useUser;
