import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProductListing from './components/Products';
import NotFound from './pages/NotFound';
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import AdminDashboard from './components/AdminDashboard';
import ProductDetailsPage from './components/ProductDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import AlertContainer from './utils/alert';
import MePage from './components/UserAccount';
import AccountSettings from './components/ui/dashboard/user/AccountSettings';
import MyOrders from './components/ui/dashboard/user/MyOrders';
import OrderDetails from './components/ui/dashboard/user/OrderDetails';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const { user } = useAuth();

  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<ProductListing />} />
          <Route path="/product-details/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            element={
              <ProtectedRoute user={user} requiredRoles={['user', 'admin']} />
            }
          >
            <Route path="/me" element={<MePage />} />
            <Route path="/me/settings" element={<AccountSettings />} />
            <Route path="/me/orders" element={<MyOrders />} />
            <Route path="/me/orders/:orderId" element={<OrderDetails />} />
          </Route>
          {/* Unauthorized route */}
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          element={<ProtectedRoute user={user} requiredRoles={['admin']} />}
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <AlertContainer />
    </>
  );
}

export default App;
