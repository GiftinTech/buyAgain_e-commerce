import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './context/AuthContext';
import CartProvider from './context/CartContext';
import AdminProvider from './context/AdminContext';
import { AlertProvider } from './context/AlertContext';
import ReviewProvider from './context/ReviewContext';
import UserProvider from './context/UserContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AlertProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ReviewProvider>
            <CartProvider>
              <AdminProvider>
                <UserProvider>
                  <App />
                </UserProvider>
              </AdminProvider>
            </CartProvider>
          </ReviewProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AlertProvider>
  </BrowserRouter>,
);
