import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FeatureRowProps {
  image: string;
  title: string;
  link?: string;
  imageAlt?: string;
  reverse?: boolean;
}

export const FeatureRow = ({ image, title, link, imageAlt, reverse = false }: FeatureRowProps) => {
  const firstLetter = (title || '').charAt(0).toUpperCase();
  const restTitle = (title || '').slice(1); // ✅ added: title ke baaki letters
  const isClickable = link && link.trim().length > 0;
  
  const content = (
    <div className={`relative min-h-[70vh] flex flex-col md:flex-row items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 ${reverse ? 'md:flex-row-reverse' : ''}`}>

      {/* Image Section */}
      <div className="relative z-0 w-full md:w-1/2 h-full flex items-center justify-center p-4 md:p-10">
        <img
          src={image}
          alt={imageAlt || title}
          className="max-h-[80vh] w-auto object-contain shadow-lg rounded-lg transform transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="relative z-10 w-full md:w-1/2 h-full flex flex-col items-center md:items-start justify-center p-8 md:p-12 text-center md:text-left">
        <h2
          className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6"
        >
          {title}
        </h2>
        {isClickable && (
          <div className="w-full flex justify-center md:justify-start">
            <Button
              size="lg"
              className="text-lg px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              VIEW
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <Link to={link} className="block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
