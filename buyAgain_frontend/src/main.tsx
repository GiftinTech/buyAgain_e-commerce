import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './context/AuthContext';
import ShoppingCartProvider from './context/ShoppingContext';
import AdminProvider from './context/AdminContext';
import { AlertProvider } from './context/AlertContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AlertProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ShoppingCartProvider>
            <AdminProvider>
              <App />
            </AdminProvider>
          </ShoppingCartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AlertProvider>
  </BrowserRouter>,
);
