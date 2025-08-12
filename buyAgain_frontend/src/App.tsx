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

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/products" element={<MainLayout />}>
          <Route index element={<ProductListing />} />
          {/* checkout page */}
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
