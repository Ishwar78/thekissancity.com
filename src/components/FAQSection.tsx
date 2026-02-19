import { useEffect, useState } from 'react';
import { Loader2, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/lib/api";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { ok, json } = await api('/api/faqs');
        if (ok && Array.isArray(json?.data)) {
          setFaqs(json.data);
        } else {
          setError(json?.message || 'Failed to fetch FAQs');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-600">Loading FAQs...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500 text-sm">Error: {error}</p>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null; // Don't show section if no FAQs
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
            Frequently Asked
            <span className="text-primary"> Questions</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, returns, and more.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl lg:max-w-6xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq._id}
                value={`item-${index}`}
                className="bg-white border border-gray-200 rounded-lg px-4 md:px-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left py-4 md:py-5 hover:no-underline">
                  <span className="font-semibold text-base md:text-lg text-gray-900 pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 md:pb-5 pt-0">
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <a
            href="/contact"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-gray-900 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
