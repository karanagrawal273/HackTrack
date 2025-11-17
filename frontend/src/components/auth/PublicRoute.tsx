'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { authUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authUser) {
      router.push('/dashboard');
    }
  }, [authUser, loading, router]);

  if (loading || authUser) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  return <>{children}</>;
};

export default PublicRoute;