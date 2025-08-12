import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './context/AuthContext';
import ShoppingCartProvider from './context/ShoppingContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShoppingCartProvider>
          <App />
        </ShoppingCartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>,
);
