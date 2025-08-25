import { useCallback, useState, type ReactNode } from 'react';
import { AlertContext } from '../hooks/useAlert';

interface AlertState {
  type: 'success' | 'error' | 'info';
  message: string;
  duration: number;
}

export interface AlertContextType {
  alert: AlertState | null;
  showAlert: (
    type: 'success' | 'error' | 'info',
    message: string,
    duration?: number,
  ) => void;
  hideAlert: () => void;
}

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback(
    (type: 'success' | 'error' | 'info', message: string, duration = 5) => {
      setAlert({ type, message, duration });
      setTimeout(() => {
        setAlert(null);
      }, duration * 1000);
    },
    [],
  );

  const hideAlert = useCallback(() => setAlert(null), []);

  const value = { alert, showAlert, hideAlert };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
