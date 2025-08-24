import { createContext, useContext } from 'react';
import { type AlertContextType } from '../context/AlertContext';

// Create the context
export const AlertContext = createContext<AlertContextType | null>(null);

// The custom hook to consume the context
export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === null) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
