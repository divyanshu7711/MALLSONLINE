import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import ToastContainer from './components/ui/Toast';

import LandingPage from './pages/user/LandingPage';
import LoginPage from './pages/user/LoginPage';
import SignupPage from './pages/user/SignupPage';
import VerifyOtpPage from './pages/user/VerifyOtpPage';
import MarketplacePage from './pages/user/MarketplacePage';
import StorePage from './pages/user/StorePage';
import ProductPage from './pages/user/ProductPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import CustomRequestPage from './pages/user/CustomRequestPage';
import ProfilePage from './pages/user/ProfilePage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminVerifyOtpPage from './pages/admin/AdminVerifyOtpPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCustomRequestsPage from './pages/admin/AdminCustomRequestsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <ToastContainer />
              <Routes>
                {/* User Routes */}
                <Route path="/" element={<><Navbar /><LandingPage /><Footer /></>} />
                <Route path="/login" element={<><Navbar /><LoginPage /><Footer /></>} />
                <Route path="/signup" element={<><Navbar /><SignupPage /><Footer /></>} />
                <Route path="/verify-otp" element={<><Navbar /><VerifyOtpPage /><Footer /></>} />
                <Route path="/marketplace" element={<><Navbar /><MarketplacePage /><Footer /></>} />
                <Route path="/store/:slug" element={<><Navbar /><StorePage /><Footer /></>} />
                <Route path="/product/:id" element={<><Navbar /><ProductPage /><Footer /></>} />
                <Route path="/cart" element={<ProtectedRoute><><Navbar /><CartPage /><Footer /></></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><><Navbar /><CheckoutPage /><Footer /></></ProtectedRoute>} />
                <Route path="/custom-request" element={<ProtectedRoute><><Navbar /><CustomRequestPage /><Footer /></></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><><Navbar /><ProfilePage /><Footer /></></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/divyanshu" element={<AdminLoginPage />} />
                <Route path="/admin/verify-otp" element={<AdminVerifyOtpPage />} />
                <Route path="/admin" element={<Navigate to="/admin/divyanshu" replace />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboardPage />} />
                </Route>
                <Route path="/admin/stores" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminStoresPage />} />
                </Route>
                <Route path="/admin/products" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminProductsPage />} />
                </Route>
                <Route path="/admin/custom-requests" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminCustomRequestsPage />} />
                </Route>
                <Route path="/admin/orders" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminOrdersPage />} />
                </Route>
                <Route path="/admin/analytics" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminAnalyticsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
