import React from 'react';
import Navbar from '../components/Navbar';
import ProductDetailPage from '../components/ProductDetailPage';
import Footer from '../components/Footer';

export default function ProductPage() {
  return (
    <>
      <Navbar />
      <main>
        <ProductDetailPage />
      </main>
      <Footer />
    </>
  );
}
