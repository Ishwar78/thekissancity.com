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
import O2Img from "@/assets/O2.jpg.jpeg";
import KisanImg from "@/assets/CM-Kisan-Samman-Yojana.avif";
import s1Img from "@/assets/s1.webp";
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
    id: "4",
    name: "Kissan City Special",
    price: 2499,
    category: "Hoodies",
    description: "Exclusive Kissan City design featuring traditional Indian agricultural motifs with modern streetwear aesthetics.",
    image: KisanImg,
    images: [KisanImg],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
  },
  {
    id: "5",
    name: "Premium Collection",
    price: 3999,
    category: "Premium",
    description: "High-end premium collection featuring exclusive designs and premium materials.",
    image: O2Img,
    images: [O2Img],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
  },
  {
    id: "6",
    name: "Summer Special",
    price: 1899,
    category: "T-Shirts",
    description: "Lightweight and comfortable summer special edition with breathable fabric.",
    image: s1Img,
    images: [s1Img],
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Sky Blue"],
  }
];
