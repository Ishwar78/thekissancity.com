import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesStrip from '../components/FeaturesStrip';
import Categories from '../components/Categories';
import Products from '../components/Products';
import ChooseByHealth from '../components/ChooseByHealth';
import VideoSection from '../components/VideoSection';
import AboutBanner from '../components/AboutBanner';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero Banners Slider */}
        <HeroSection />

  {/* 3. Features Strip */}
        <FeaturesStrip />
        {/* 2. Categories Section */}
        <Categories />

        

        {/* 4. Featured Products */}
        <Products />
        <ChooseByHealth />
        <VideoSection />
        <AboutBanner />
        <WhyChooseUs />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
