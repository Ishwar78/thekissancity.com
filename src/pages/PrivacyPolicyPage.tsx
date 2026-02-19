import { useEffect, useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Info, FileText, ChevronDown, CheckCircle } from 'lucide-react'; // Added CheckCircle for points

interface Point {
  point: string;
}

interface Section2 {
  subHeading: string;
  paragraph: string;
}

interface Section3 {
  subHeading: string;
  description: string;
  points: Point[]; // 5 points
}

interface Section4 {
  subHeading: string;
  description: string;
  points: Point[]; // 3 points
}

interface Section5 {
  subHeading: string;
  paragraphs: string[]; // 3 paragraphs
}

interface Section6 {
  subHeading: string;
  description: string;
}

interface InputField {
  label: string;
  placeholder: string;
  name: string;
}

interface PrivacyPolicyData {
  mainHeading: string;
  mainParagraph: string;
  section2: Section2[];
  section3: Section3[];
  section4: Section4[];
  section5: Section5[];
  section6: Section6[];
  inputFields: InputField[];
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PrivacyPolicyPage = () => {
  const [policy, setPolicy] = useState<PrivacyPolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTexts, setExpandedTexts] = useState<Record<string, boolean>>({}); // To manage read more/less for long texts
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({}); // To manage accordion-like sections


  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch('/api/privacy-policy');
        
        if (!response.ok) {
          throw new Error('Failed to fetch privacy policy');
        }
        
        const data = await response.json();
        
        if (data?.data) {
          setPolicy(data.data as PrivacyPolicyData);
          setOpenSections({
            ...Object.fromEntries(data.data.section2.map((_: any, index: number) => [`section2-${index}`, true])),
            ...Object.fromEntries(data.data.section3.map((_: any, index: number) => [`section3-${index}`, true])),
            ...Object.fromEntries(data.data.section4.map((_: any, index: number) => [`section4-${index}`, true])),
            ...Object.fromEntries(data.data.section5.map((_: any, index: number) => [`section5-${index}`, true])),
            ...Object.fromEntries(data.data.section6.map((_: any, index: number) => [`section6-${index}`, true])),
          });
        } else {
          setPolicy({ 
            mainHeading: '', 
            mainParagraph: '', 
            section2: [], 
            section3: [], 
            section4: [], 
            section5: [], 
            section6: [], 
            inputFields: [] 
          });
        }
      } catch (err) {
        console.error('Error fetching privacy policy:', err);
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

  const toggleTextExpansion = (textId: string) => {
    setExpandedTexts((prevExpanded) => ({
      ...prevExpanded,
      [textId]: !prevExpanded[textId],
    }));
  };

  const truncateText = (text: string, maxChars: number = 150) => {
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars) + '...';
  };

  const shouldShowReadMore = (text: string, maxChars: number = 150) => {
    return text.length > maxChars;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100">
          <div className="px-0 sm:px-4 lg:px-8 py-16 sm:py-20">
            <div className="max-w-none sm:max-w-5xl sm:mx-auto">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-8 sm:mt-10 mb-8 sm:mb-10">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-800 animate-pulse" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight">Privacy Policy</h1>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 lg:p-8 animate-pulse">
                <div className="h-6 sm:h-8 bg-slate-200 rounded w-1/3 mb-4 sm:mb-6"></div>
                <div className="space-y-2 sm:space-y-4">
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-5/6"></div>
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
            <div className="container mx-auto relative z-10">
              <div className="flex items-center justify-center space-x-4 mt-10 mb-4">
                <FileText className="h-14 w-14 text-gray-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
                Privacy Policy
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
        <div className="bg-gray-900 text-white py-12 sm:py-16 mt-8 sm:mt-12 px-0 sm:px-4 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-5 pattern-grid"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-8 sm:mt-10 mb-3 sm:mb-4">
              <FileText className="h-10 w-10 sm:h-14 sm:w-14 text-gray-300" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-3 sm:mb-4 tracking-tight px-2 sm:px-0">
              {policy?.mainHeading || "Privacy Policy"}
            </h1>
            <div className="text-base sm:text-lg text-center text-gray-300 leading-relaxed px-3 sm:px-4">
              <div className="block sm:hidden">
                {expandedTexts['main-paragraph'] ? (
                  <div>{policy?.mainParagraph || "Your privacy is important to us. This policy explains how we collect, use, and protect your personal information."}</div>
                ) : (
                  <div>{truncateText(policy?.mainParagraph || "Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.", 100)}</div>
                )}
                {shouldShowReadMore(policy?.mainParagraph || "Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.", 100) && (
                  <button
                    onClick={() => toggleTextExpansion('main-paragraph')}
                    className="text-blue-300 hover:text-blue-100 font-medium text-sm mt-2 inline-block underline bg-blue-800 bg-opacity-30 px-3 py-1 rounded"
                  >
                    {expandedTexts['main-paragraph'] ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
              <div className="hidden sm:block">
                {policy?.mainParagraph || "Your privacy is important to us. This policy explains how we collect, use, and protect your personal information."}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-0 sm:px-4 lg:px-8 py-8 sm:py-16">
          <div className="max-w-none sm:max-w-4xl sm:mx-auto">
            {policy && (policy.mainHeading || policy.section2.length > 0 || policy.section3.length > 0 || policy.section4.length > 0 || policy.section5.length > 0 || policy.section6.length > 0) ? (
              <div className="space-y-6">
                {/* Section 2 */}
                {policy.section2.map((section, index) => {
                  const sectionId = `section2-${index}`;
                  const isOpen = openSections[sectionId];
                  return (
                    <div
                      key={sectionId}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleSection(sectionId)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-800 p-3 rounded-xl shadow-md">
                            <Info className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            {section.subHeading}
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
                        <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                          <div className="border-t border-slate-200 pt-4 sm:pt-6">
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                              {section.paragraph}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Section 3 */}
                {policy.section3.map((section, index) => {
                  const sectionId = `section3-${index}`;
                  const isOpen = openSections[sectionId];
                  return (
                    <div
                      key={sectionId}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleSection(sectionId)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-800 p-3 rounded-xl shadow-md">
                            <Info className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            {section.subHeading}
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
                          maxHeight: isOpen ? '1000px' : '0', // Arbitrary large max-height
                          opacity: isOpen ? '1' : '0',
                          overflow: 'hidden',
                        }}
                      >
                        <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                          <div className="border-t border-slate-200 pt-4 sm:pt-6">
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4">{section.description}</p>
                            <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                              {section.points.map((point, pIndex) => (
                                <li key={pIndex} className="flex items-start text-gray-700">
                                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-1" />
                                  <span className="text-sm sm:text-base">{point.point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Section 4 */}
                {policy.section4.map((section, index) => {
                  const sectionId = `section4-${index}`;
                  const isOpen = openSections[sectionId];
                  return (
                    <div
                      key={sectionId}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleSection(sectionId)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-800 p-3 rounded-xl shadow-md">
                            <Info className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            {section.subHeading}
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
                            <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">{section.description}</p>
                            <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                              {section.points.map((point, pIndex) => (
                                <li key={pIndex} className="flex items-start text-gray-700">
                                   <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-1" />
                                   <span className="text-sm sm:text-base">{point.point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Section 5 */}
                {policy.section5.map((section, index) => {
                  const sectionId = `section5-${index}`;
                  const isOpen = openSections[sectionId];
                  return (
                    <div
                      key={sectionId}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleSection(sectionId)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-800 p-3 rounded-xl shadow-md">
                            <Info className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            {section.subHeading}
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
                            <div className="space-y-3 sm:space-y-4">
                              {section.paragraphs.map((paragraph, pIndex) => (
                                <p key={pIndex} className="text-base sm:text-lg text-gray-700 leading-relaxed">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Section 6 */}
                {policy.section6.map((section, index) => {
                  const sectionId = `section6-${index}`;
                  const isOpen = openSections[sectionId];
                  return (
                    <div
                      key={sectionId}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleSection(sectionId)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-800 p-3 rounded-xl shadow-md">
                            <Info className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            {section.subHeading}
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
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                              {section.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Input Fields */}
                {policy.inputFields.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 lg:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-base sm:text-lg text-gray-700">
                      {policy.inputFields.map((field, index) => (
                        <div key={index}>
                          <p><span className="font-medium">{field.label} :</span> {field.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
                  <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    No Privacy Policy Available
                  </h2>
                  <p className="text-lg text-gray-700 mb-2">
                    No privacy policy content available yet.
                  </p>
                  <p className="text-gray-600">
                    Please check back later or contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info Card */}
            <div className="mt-8 sm:mt-16 bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-700">
              <div className="flex items-start space-x-3 sm:space-x-5">
                <div className="bg-gray-700 p-2 sm:p-3 rounded-xl">
                  <Info className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    Questions About Our Privacy Policy?
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    If you have any questions or concerns regarding our privacy practices, 
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
