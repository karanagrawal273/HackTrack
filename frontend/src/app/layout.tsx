import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HackTrack',
  description: 'Your ultimate contest and hackathon tracker.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <div className="sticky top-0 z-50 w-full">
              <Navbar />
            </div>
            
            <main className="flex-grow">
              {children}
            </main>
            
            <footer className="w-full py-6 bg-gray-800 text-center text-gray-500 text-sm border-t border-gray-700">
              © {new Date().getFullYear()} HackTrack. All rights reserved.
            </footer>
          </div>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}