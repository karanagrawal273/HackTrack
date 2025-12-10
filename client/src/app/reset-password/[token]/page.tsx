// app/reset-password/[token]/page.tsx
'use client';
import ResetPasswordForm from '@/components/Auth/ResetPasswordForm';
import { Toaster } from 'react-hot-toast';
import React from 'react';
import { useParams } from 'next/navigation';

// FIX 1: Change the function signature to 'async'
const ResetPasswordPage =  () => {
  // FIX 2: Ensure the token exists before passing it, preventing the 'substring' error.
  const params = useParams<{ token: string }>();
  const token = params.token || ''; 

  // The rest of the page remains the same, passing the token to the client component.
  return (
    <>
      <ResetPasswordForm token={token} />
      <Toaster />
    </>
  );
};

export default ResetPasswordPage; 