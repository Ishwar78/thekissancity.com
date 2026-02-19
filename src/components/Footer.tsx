import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type Page = {
  id: string;
  slug: string;
  name: string;
  status: "active" | "inactive";
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [pages, setPages] = useState<Page[]>([]);
  const GSTIN = "06GIBPS2596J1ZP";

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await api("/api/admin/pages/list");
        if (res.ok && res.json?.data) {
          const activePages = (res.json.data as Page[]).filter(
            (p) => p.status === "active"
          );
          setPages(activePages);
        }
      } catch (err) {
        console.error("Failed to fetch pages for footer:", err);
      }
    };

    fetchPages();
  }, []);

  return (
    <footer className="bg-black text-white relative overflow-hidden mb-0">
      <div
        className="absolute bottom-0 left-0 w-full h-full bg-no-repeat bg-left-bottom opacity-10 sm:opacity-20"
        style={{ backgroundImage: 'url(/src/assets/table-outline.png)', backgroundSize: '40% auto' }}
      ></div>
      <div
        className="absolute top-0 right-0 w-full h-full bg-no-repeat bg-right-top opacity-10 sm:opacity-20"
        style={{ backgroundImage: 'url(/src/assets/chair-outline.png)', backgroundSize: '40% auto' }}
      ></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-20 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-8 md:mb-12 w-full">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-3 md:mb-4"
              aria-label="UNI10 Home"
            >
              <img
                src="/uni10-logo.png" 
                alt="UNI10 Logo"
                className="h-8 md:h-10 w-auto object-contain"
              />
              <span className="sr-only">UNI10</span>
            </Link>

            <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-4 md:mb-6 max-w-xs">
              Premium streetwear and lifestyle products for those who dare to be
              different. Define your universe with uni10.
            </p>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors">
                <Mail className="h-3 w-3 md:h-4 md:w-4 text-white flex-shrink-0" />
                <a href="mailto:support@uni10.in">
                  support@uni10.in
                </a>
              </div>
              
              <div className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-gray-300">
                <MapPin className="h-3 w-3 md:h-4 md:w-4 text-white mt-0.5 flex-shrink-0" />
                <span>India</span>
              </div>

              {/* GSTIN (added) */}
              {/* <div className="text-xs md:text-sm text-gray-300">
                <span className="font-medium text-yellow-400">GSTIN:</span>{" "}
                <span className="select-all tracking-wider">{GSTIN}</span>
              </div> */}
            </div>
          </div>

          {/* Shop and Support Links (Mobile Parallel) */}
          <div className="grid grid-cols-2 gap-6 md:gap-12 md:col-span-1 lg:col-span-2">
            {/* Shop Links */}
            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-5 text-sm md:text-base">Shop</h4>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link
                    to="/shop"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop/new-arrivals"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    Collections
                  </Link>
                </li>
                <li>
                  <Link
                    to="/wishlist"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company & Info */}
            <div>
              <h4 className="font-semibold text-white mb-3 md:mb-5 text-sm md:text-base">Support</h4>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link
                    to="/contact"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping-policy"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/return-policy"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-of-service"
                    className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors font-medium"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Connect */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-white mb-3 md:mb-5 text-sm md:text-base">Follow Us</h4>
            <p className="text-xs md:text-sm text-gray-300 mb-3 md:mb-4">
              Stay updated with our latest collections and news.
            </p>
            <div className="flex gap-3 md:gap-4">
              <a
                href="https://www.instagram.com/uni10.in?igsh=MXU1cjdkMmp3emVrMQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-200"
              >
                <Instagram className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-200"
              >
                <Twitter className="h-4 w-4 md:h-5 md:w-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1DHeCmuRjB/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-200"
              >
                <Facebook className="h-4 w-4 md:h-5 md:w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6 md:my-12" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <p className="text-xs md:text-sm text-gray-300 text-center md:text-left">
            &copy; {currentYear} <span className="font-semibold text-white">uni10</span>. All
            rights reserved.
          </p>

          {/* Removed GSTIN in bottom bar */}
          <div className="flex gap-4 md:gap-6">
            <a
              href="#privacy"
              className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-xs md:text-sm text-gray-300 hover:text-yellow-400 transition-colors"
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};