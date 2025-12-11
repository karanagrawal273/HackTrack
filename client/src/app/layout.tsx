// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ProviderWrapper from "@/components/ProviderWrapper"; // <-- Import the wrapper
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HackTrack - Coding Contest Tracker",
  description: "Never miss an upcoming coding contest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* --- FAVICON LINKS --- */}
        
        {/* The classic favicon (most browsers check this automatically) */}
        {/* <link rel="icon" href="/favicon.ico" sizes="any" />  */}
        
        {/* High-resolution favicon for modern browsers/pinnings (Optional: If using PNG) */}
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        
        {/* Apple touch icon for iOS home screen shortcut (Optional) */}
        {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" /> */}
        
        {/* --- END FAVICON LINKS --- */}
      </head>
      {/* TEMPORARY FIX: Add a distinct Tailwind class */}
      <body className={`${inter.className} bg-hack-bg-light text-hack-fg-dark dark:bg-hack-bg-dark dark:text-hack-fg-light`}>
        <ProviderWrapper>
          <div className="flex flex-col min-h-screen"> {/* Wrapper to push footer to bottom */}
            <Navbar />
            <main className="flex-grow"> {/* Main content stretches */}
              {children}
            </main>
            <Footer /> {/* <-- Render Footer here */}
          </div>
        </ProviderWrapper>
      </body>
    </html>
  );
}