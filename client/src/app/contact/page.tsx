// client/src/app/contact/page.tsx

'use client'
import React from 'react';
import { Mail, Zap, MessageSquare } from 'lucide-react'; // Adding MessageSquare for variety

const ContactPage = () => {
  const supportEmail = "hacktrack273@gmail.com";

  return (
    // Outer container set for dark mode background and text
    <div className="min-h-screen bg-gray-900 text-gray-200 mt-4">
      
      {/* Content wrapper with fixed width and padding */}
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        
        <h1 className="text-5xl font-extrabold mb-4 text-indigo-400">Get in Touch</h1>
        
        <p className="mb-12 text-xl text-gray-400">
          Have a question, need support, or found a bug? We're here to help you get back to coding!
        </p>

        {/* Contact Card */}
        <div className="space-y-6 p-10 bg-gray-800 shadow-2xl rounded-xl border border-gray-700">
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <Mail className="text-indigo-500" size={32} />
            <h2 className="text-2xl font-semibold text-white">Technical Support & General Inquiries</h2>
          </div>
          
          <p className="text-3xl font-bold break-all">
            <a 
              href={`mailto:${supportEmail}`} 
              className="text-blue-400 hover:text-blue-300 transition duration-150"
            >
              {supportEmail}
            </a>
          </p>

          <p className="text-base text-gray-400">
            Click the email address above to contact us directly.
          </p>

          {/* Response Time Disclaimer */}
          <div className="pt-6 border-t border-gray-700 mt-6">
            <p className="text-sm text-gray-500">
              We aim to respond to all inquiries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;