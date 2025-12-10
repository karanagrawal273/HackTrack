// src/components/Layout/Navbar.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { authUser, loading, logout } = useAuth(); 
  const router = useRouter();

  // Use the context's centralized logout function
  const handleLogout = () => {
     logout(); 
     toast.success('Logged out successfully!');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. HackTrack Link (Left Side) */}
          <Link href={authUser ? "/dashboard" : "/"} className="text-2xl font-bold text-blue-400">
            HackTrack
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              
              {loading ? (
                <div>Loading...</div>
              ) : authUser ? (

                <>
                  <span className="text-gray-300 text-sm font-medium">
                    Welcome, {authUser.name || 'User'}
                  </span>

                  {/* Logout Button (Directly Visible) */}
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                
                <>
                  <Link href="/login" className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </Link>
                  <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;