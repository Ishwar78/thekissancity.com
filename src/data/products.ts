import hoodieImg from "@/assets/product-hoodie-1.jpg";
import tshirtImg from "@/assets/product-tshirt-1.jpg";
import capImg from "@/assets/product-cap-1.jpg";
import jacketImg from "@/assets/product-jacket-1.jpg";
import pantsImg from "@/assets/product-pants-1.jpg";
import backpackImg from "@/assets/product-backpack-1.jpg";
import hoddiesImg from "@/assets/hoddies.jpeg";
import Pant from "@/assets/pant.jpeg";
import Coord from "@/assets/Coord.jpeg";
import Lower from "@/assets/lower.jpeg";
import Upper from "@/assets/Upper.jpeg";
import Shoes from "@/assets/Shoes.jpeg";
import Accessories from "@/assets/Accessories.jpeg";
import Home from "@/assets/Home.jpeg";
import Office from "@/assets/Office.jpeg";
import homepageImg1 from "@/assets/homepage1.webp";

import homepageImg3 from "@/assets/homepage3.webp";
import finalkvImg from "@/assets/Final_KV__banner_desk_01.webp";
import activewearImg from "@/assets/ACTIVEWEAR_HOMEPAGE_BANNER.webp";
import homepage5 from"@/assets/5.webp";
import homepage6 from"@/assets/6.webp";
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Cosmic Hoodie",
    price: 3499,
    category: "Hoodies",
    description: "Premium black hoodie featuring an exclusive geometric gold logo design. Made from high-quality cotton blend for ultimate comfort and durability.",
    image: hoddiesImg,
    images: [hoddiesImg],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "2",
    name: "Essential Tee",
    price: 1299,
    category: "T-Shirts",
    description: "Classic black t-shirt with bold white typography. Perfect for everyday wear with a streetwear edge.",
    image: Pant,
    images: [Pant],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "3",
    name: "Luxury Cap",
    price: 1799,
    category: "Accessories",
    description: "Premium snapback cap with embroidered gold logo. Adjustable fit for maximum comfort.",
    image:Lower,
    images: [Lower],
    sizes: ["One Size"],
    colors: ["Black"],
  }

];
