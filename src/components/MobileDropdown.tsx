import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MobileDropdownProps {
  title: string;
  gender: 'male' | 'female' | 'unisex';
  categories: any[];
  products: any[];
  onClose: () => void;
}

export const MobileDropdown: React.FC<MobileDropdownProps> = ({ title, gender, categories, products, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  // For unisex gender, use categories as-is (already filtered)
  // For male/female, filter by gender
  const displayCategories = gender === 'unisex' 
    ? categories 
    : categories.filter(category => {
        const hasGenderProducts = products.some(product => 
          product.category === category.name && 
          product.gender === gender
        );
        return hasGenderProducts;
      });

  if (displayCategories.length === 0) return null;

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-base font-semibold px-3 py-3 rounded-md hover:bg-amber-50 transition-colors flex items-center justify-between"
        style={{ color: '#6b4423' }}
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className="ml-4 flex flex-col gap-1 py-2">
          {displayCategories.map((category) => (
            <Link
              key={category.slug || category.name}
              to={`/collection/${category.slug || category.name}`}
              className="text-sm text-gray-600 hover:text-green-700 px-3 py-2 rounded hover:bg-green-50 transition-colors border-l-2 border-transparent hover:border-green-500"
              onClick={onClose}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
