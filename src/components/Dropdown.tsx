import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface Category {
  name: string;
  slug: string;
  gender?: string;
}

interface DropdownProps {
  title: string;
  gender: 'male' | 'female' | 'unisex';
  children: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({ title, gender, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        to={`/shop?gender=${gender}`}
        className="text-sm font-semibold px-3 py-2 rounded-full hover:bg-amber-50 transition flex items-center gap-1"
        style={{ color: '#6b4423' }}
      >
        {title}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Link>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {children}
        </div>
      )}
    </div>
  );
};
