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
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
      </head>
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