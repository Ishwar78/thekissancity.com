import * as React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InquiryForm } from '@/components/InquiryForm';
import { api } from '@/lib/api';
import { Phone, Mail, MapPin, Copy, Clock, MessageCircle } from 'lucide-react';

export default function Contact() {
  const emails: string[] = ['support@uni10.in'];
  const address = { line1: 'Dwarka, Delhi', line2: '', city: 'Delhi', state: 'Delhi', pincode: '110001' };

  const copyToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      // You could add a toast notification here if you have one
      alert('Email copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy email: ', err);
      alert('Failed to copy email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-16 md:pt-36 lg:pt-40 lg:pb-24">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-block">
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                We're here to help
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions? Need assistance? Our team is ready to help you with orders, products, or any inquiries.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Email Card */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-black rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Email</CardTitle>
                    <CardDescription className="mt-1 text-xs">Response in 24hrs</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Send us your questions anytime</p>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3">
                  {emails.map((e, idx) => (
                    <li key={idx}>
                      <div 
                        className="group/link flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-transparent hover:from-purple-50 hover:to-purple-50/30 transition-all duration-200 border border-transparent hover:border-purple-200 cursor-pointer"
                        onClick={() => copyToClipboard(e)}
                      >
                        <span className="font-semibold text-foreground group-hover/link:text-primary transition-colors break-all">
                          {e}
                        </span>
                        <Copy className="h-4 w-4 text-muted-foreground group-hover/link:text-primary group-hover/link:scale-110 transition-all flex-shrink-0 ml-2" />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-black rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Location</CardTitle>
                    <CardDescription className="mt-1 text-xs">Visit us</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Our office and warehouse</p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 space-y-1 text-sm">
                    {address.line1 && <div className="font-semibold text-foreground">{address.line1}</div>}
                    {address.line2 && <div className="text-muted-foreground">{address.line2}</div>}
                    <div className="text-muted-foreground">
                      {(address.city ? address.city + ', ' : '') + (address.state || '')} {address.pincode ? address.pincode : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inquiry Form Section */}
          <div className="mt-20 pt-16 border-t-2 border-gray-200">
            <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-block">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Quick Response
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Send us a Message
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fill out the form below and our team will get back to you as soon as possible.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 md:p-10 hover:shadow-2xl transition-shadow duration-300">
              <InquiryForm />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-10 pt-8 md:pt-12 pb-8 md:pb-12 justify-items-center max-w-3xl mx-auto">
            <div className="text-center space-y-1 md:space-y-2 p-3 md:p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-md md:col-span-1">
              <div className="text-2xl md:text-4xl font-extrabold text-primary mb-1 md:mb-2">24/7</div>
              <div className="text-xs font-medium text-muted-foreground">Support Available</div>
            </div>
           
            <div className="text-center space-y-1 md:space-y-2 p-3 md:p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-md md:col-span-1">
              <div className="text-2xl md:text-4xl font-extrabold text-primary mb-1 md:mb-2">100%</div>
              <div className="text-[10px] font-medium text-muted-foreground">Customer Satisfaction</div>
            </div>
              
             <div className="text-center space-y-1 md:space-y-2 p-3 md:p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-md md:col-span-1">
              <div className="text-2xl md:text-4xl font-extrabold text-primary mb-1 md:mb-2">1000+</div>
              <div className="text-[10px] font-medium text-muted-foreground">Happy Customers</div>
            </div>

            {/* Hidden on mobile, visible on desktop */}
            <div className="hidden md:block text-center space-y-2 p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-md md:col-span-1">
              <div className="text-4xl font-extrabold text-primary mb-2">100%</div>
              <div className="text-[10px] font-medium text-muted-foreground">Guaranteed Products</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}