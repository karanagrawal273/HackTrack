// src/components/Layout/Footer.tsx

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center text-sm flex-wrap">
          <p>&copy; {new Date().getFullYear()} HackTrack. All rights reserved.</p>
          <div className="space-x-4">
            <Link href="/about" className="hover:text-white transition duration-200">About</Link>
            <Link href="/privacy" className="hover:text-white transition duration-200">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white transition duration-200">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;