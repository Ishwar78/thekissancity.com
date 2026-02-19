import { useEffect, useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, ChevronDown, CheckCircle, Info } from 'lucide-react';

// Interfaces matching the backend schema
interface Paragraph {
  content: string;
}

interface Point {
  point: string;
}

interface InputField {
  label: string;
  value: string;
}

interface TermsOfServiceSection {
  _id?: string;
  heading: string;
  subHeading?: string;
  paragraphs?: Paragraph[];
  description?: string;
  points?: Point[];
  inputFields?: InputField[];
}

interface TermsOfServiceData {
  _id?: string;
  mainHeading: string;
  sections: TermsOfServiceSection[];
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const TermsOfServicePage = () => {
  const [policy, setPolicy] = useState<TermsOfServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch('/api/terms-of-service');
        if (!response.ok) {
          throw new Error('Failed to fetch terms of service');
        }
        const data = await response.json();
        if (data?.data) {
          setPolicy(data.data as TermsOfServiceData);
          // Initialize all sections as open
          const initialOpenState: Record<string, boolean> = {};
          data.data.sections.forEach((_, index: number) => {
            initialOpenState[`section-${index}`] = true;
          });
          setOpenSections(initialOpenState);
        } else {
          setPolicy({ mainHeading: '', sections: [] });
        }
      } catch (err) {
        console.error('Error fetching terms of service:', err);
        setError(err instanceof Error ? err.message : 'Network error or server unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [sectionId]: !prevOpenSections[sectionId],
    }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-8 sm:mt-10 mb-8 sm:mb-10">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-800 animate-pulse" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight break-words px-2">Terms of Service</h1>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 lg:p-8 animate-pulse">
                <div className="h-6 sm:h-8 bg-slate-200 rounded w-1/3 mb-4 sm:mb-6"></div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-4/5 sm:w-5/6"></div>
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
          <div className="bg-gray-900 text-white py-12 sm:py-16 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5 pattern-grid"></div>
            <div className="container mx-auto relative z-10">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-8 sm:mt-10 mb-4">
                <FileText className="h-10 w-10 sm:h-14 sm:w-14 text-gray-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 tracking-tight px-2 break-words">
                Terms of Service
              </h1>
            </div>
          </div>
          
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-300 rounded-2xl p-6 sm:p-8 text-center">
                <div className="text-red-500 text-4xl sm:text-5xl mb-4">⚠️</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Error Loading Terms of Service</h2>
                <p className="text-sm sm:text-base text-gray-700 break-words">{error}</p>
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
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <div className="bg-gray-900 text-white py-12 sm:py-16  px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden mt-10">
          <div className="absolute inset-0 bg-black opacity-5 pattern-grid"></div>
          <div className="container mx-auto relative z-10  ">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-8 sm:mt-10 mb-4">
              <FileText className="h-10 w-10 sm:h-14 sm:w-14 text-gray-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-center mb-4 tracking-tight px-2 break-words ">
              {policy?.mainHeading || "Terms of Service"}
            </h1>
          
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 mt-8 sm:mt-12 lg:mt-16">
          <div className="max-w-4xl mx-auto w-full">
            {policy?.sections && policy.sections.length > 0 ? (
              <div className="space-y-6">
                {policy.sections.map((section, index) => {
                  const sectionId = `section-${index}`;
                  const isOpen = openSections[sectionId];
                  return (
                    <div
                      key={sectionId}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer p-4 sm:p-6 lg:p-8 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleSection(sectionId)}
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="bg-gray-800 p-2 sm:p-3 rounded-xl shadow-md flex-shrink-0">
                            <Info className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-words">
                            {section.heading}
                          </h2>
                        </div>
                        <ChevronDown
                          className={`h-7 w-7 text-gray-400 transition-all duration-300 flex-shrink-0 ${
                            isOpen ? 'rotate-180 text-gray-600' : ''
                          }`}
                        />
                      </div>
                    
                      <div
                        className="transition-all duration-500 ease-in-out"
                        style={{
                          maxHeight: isOpen ? '1000px' : '0',
                          opacity: isOpen ? '1' : '0',
                          overflow: 'hidden',
                        }}
                      >
                        <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                          <div className="border-t border-slate-200 pt-4 sm:pt-6">
                            {section.subHeading && (
                              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 break-words">
                                {section.subHeading}
                              </h3>
                            )}
                            {section.paragraphs && section.paragraphs.map((p, pIndex) => (
                              <p key={pIndex} className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 break-words">
                                {p.content}
                              </p>
                            ))}
                            {section.description && (
                              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 break-words">
                                {section.description}
                              </p>
                            )}
                            {section.points && section.points.length > 0 && (
                              <ul className="list-disc list-inside space-y-2">
                                {section.points.map((point, pIndex) => (
                                  <li key={pIndex} className="flex items-start text-green-500">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-1" />
                                    <span className="text-sm sm:text-base lg:text-lg text-gray-700 break-words">{point.point}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {section.inputFields && section.inputFields.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base lg:text-lg text-gray-700 mt-4">
                                {section.inputFields.map((field, fIndex) => (
                                  <div key={fIndex}>
                                    <p className="break-words"><span className="font-medium">{field.label} :</span> {field.value}</p>
                                  </div>
                                ))}
                              </div>
                            )}
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
                  <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    No Terms of Service Available
                  </h2>
                  <p className="text-lg text-gray-700 mb-2">
                    No terms of service content available yet.
                  </p>
                  <p className="text-gray-600">
                    Please check back later or contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info Card */}
            <div className="mt-8 sm:mt-12 lg:mt-16 bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-700">
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-5">
                <div className="bg-gray-700 p-3 rounded-xl flex-shrink-0">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 break-words">
                    Questions About Our Terms of Service?
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed break-words">
                    If you have any questions or concerns regarding our terms of service, 
                    please don't hesitate to contact our support team for clarification.
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
};

