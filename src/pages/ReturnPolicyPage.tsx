import { useEffect, useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChevronDown, RotateCcw, Clock, Package, CreditCard } from 'lucide-react';

interface PolicySection {
  title: string;
  content: string;
}

interface ReturnPolicyData {
  sections: PolicySection[];
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const iconMap: { [key: string]: any } = {
  "Return Eligibility": RotateCcw,
  "Return Process": Clock,
  "Refund Policy": CreditCard,
  "Exchange Policy": Package,
};

export const ReturnPolicyPage = () => {
  const [policy, setPolicy] = useState<ReturnPolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<number[]>([]);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch('/api/return-policy');
        
        if (!response.ok) {
          throw new Error('Failed to fetch return policy');
        }
        
        const data = await response.json();
        
        if (data?.data) {
          setPolicy(data.data as ReturnPolicyData);
          // Open all sections by default
          setOpenSections(data.data.sections.map((_: any, index: number) => index));
        } else {
          setPolicy({ sections: [] });
        }
      } catch (err) {
        console.error('Error fetching return policy:', err);
        setError(err instanceof Error ? err.message : 'Network error or server unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const toggleSection = (index: number) => {
    setOpenSections((prevOpenSections) => {
      if (prevOpenSections.includes(index)) {
        return prevOpenSections.filter((i) => i !== index);
      } else {
        return [...prevOpenSections, index];
      }
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mt-10 mb-10">
                <RotateCcw className="h-12 w-12 text-gray-800 animate-pulse" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">Return Policy</h1>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-8 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100">
          <div className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5 pattern-grid"></div>
            <div className="container mx-auto max-w-5xl relative z-10">
              <div className="flex items-center justify-center space-x-4 mt-10 mb-4">
                <RotateCcw className="h-14 w-14 text-gray-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
                Return Policy
              </h1>
            </div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-300 rounded-2xl p-8 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Policy</h2>
                <p className="text-gray-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Hero Section */}
          <div className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden mt-8">
          <div className="absolute inset-0 bg-black opacity-5 pattern-grid"></div>
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="flex items-center justify-center space-x-4 mt-10 mb-4">
              <RotateCcw className="h-14 w-14 text-blue-100" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-4 tracking-tight">
              Return Policy
            </h1>
           
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            {policy?.sections && policy.sections.length > 0 ? (
              <div className="space-y-6">
                {policy.sections.map((section, index) => {
                  const Icon = iconMap[section.title] || RotateCcw;
                  const isOpen = openSections.includes(index);
                  
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleSection(index)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-800 p-3 rounded-xl shadow-md">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                            {section.title}
                          </h2>
                        </div>
                        <ChevronDown
                          className={`h-7 w-7 text-gray-400 transition-all duration-300 flex-shrink-0 ${
                            isOpen ? 'rotate-180 text-gray-600' : ''
                          }`}
                        />
                      </div>
                    
                    <div
                      className={`transition-all duration-500 ease-in-out ${
                        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                      } overflow-hidden`}
                    >
                        <div className="px-6 sm:px-8 pb-8">
                          <div className="border-t border-slate-200 pt-6">
                            <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                              {section.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
                  <RotateCcw className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    No Return Policy Available
                  </h2>
                  <p className="text-lg text-gray-700 mb-2">
                    No return policy content available yet.
                  </p>
                  <p className="text-gray-600">
                    Please check back later or contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info Card */}
            <div className="mt-16 bg-gray-800 rounded-2xl p-10 border border-gray-700">
              <div className="flex items-start space-x-5">
                <div className="bg-gray-700 p-3 rounded-xl">
                  <RotateCcw className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Need Help with Returns?
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    If you have any questions about returns, exchanges, or refunds, 
                    please don't hesitate to contact our customer support team. We're here to help!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .pattern-grid {
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
}

