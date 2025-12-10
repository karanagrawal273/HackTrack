// src/components/Auth/AuthRouteGuard.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface AuthRouteGuardProps {
  children: ReactNode;
}

/**
 * Redirects authenticated users from public pages (like login/register) to the dashboard.
 */
export const AuthRouteGuard: React.FC<AuthRouteGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only run if not loading and user IS authenticated
    if (!loading && isAuthenticated) {
      router.push('/dashboard'); 
    }
  }, [isAuthenticated, loading, router]);
  
  // If loading or authenticated, don't show the login/register page yet.
  // If not loading AND not authenticated, show the children (login/register form).
  if (loading || isAuthenticated) {
    return <div className="text-center p-20 text-white min-h-screen">Loading session...</div>;
  }
  
  return <>{children}</>;
};