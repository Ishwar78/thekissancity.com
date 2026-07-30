import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { UserProvider } from './context/UserContext';


import ScrollToTop from "./components/ScrollToTop";


import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import CategoryPage from './pages/CategoryPage';
import WishlistPage from './pages/WishlistPage';
import SearchPage from './pages/SearchPage';
import CheckoutPage from './pages/CheckoutPage';
import SolarDryerPage from './pages/SolarDryerPage';
import HealthConcernPage from './pages/HealthConcernPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import UserDashboard from './pages/user/UserDashboard';
import DeleteAccountPage from './pages/user/DeleteAccountPage';
import InvoicePage from './pages/InvoicePage';
import ThankYouPage from './pages/ThankYouPage';
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";

import BlogDetailPage from "./pages/BlogDetailPage";
import ContactPage from './pages/ContactPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import TrackOrderPage from './pages/TrackOrderPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>

              <ScrollToTop />

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/new-arrivals" element={<NewArrivalsPage />} />
              <Route path="/health-concern/:id" element={<HealthConcernPage />} />
              <Route path="/category/health/:id" element={<HealthConcernPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/solar-dryer" element={<SolarDryerPage />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/account/delete" element={<DeleteAccountPage />} />
              <Route path="/invoice/:orderId" element={<InvoicePage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/about" element={<AboutPage />} />
<Route path="/blog" element={<BlogPage />} />


<Route path="/blog/:slug" element={<BlogDetailPage />} />

<Route path="/contact" element={<ContactPage />} />
<Route path="/shipping" element={<ShippingPolicyPage />} />
<Route path="/Return-policy" element={<ReturnPolicyPage />} />
<Route path="/Track-order" element={<TrackOrderPage />} />
<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
<Route path="/terms" element={<TermsOfServicePage />} />




              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </UserProvider>
  );
}
