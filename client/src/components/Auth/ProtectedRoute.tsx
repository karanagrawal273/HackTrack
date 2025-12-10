// src/components/Auth/ProtectedRoute.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login'); 
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    // Show a loading spinner or skeleton while checking auth status
    return <div className="text-center p-20">Loading authentication state...</div>;
  }

  // Only render children if authenticated
  return isAuthenticated ? children : null;
};