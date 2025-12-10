// src/components/ProviderWrapper.tsx

'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

interface ProviderWrapperProps {
  children: ReactNode;
}

export default function ProviderWrapper({ children }: ProviderWrapperProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}