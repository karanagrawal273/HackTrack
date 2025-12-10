// app/forgot-password/page.tsx

import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';
import { Toaster } from 'react-hot-toast';
import React from 'react';

const ForgotPasswordPage = () => {
  return (
    <>
      <ForgotPasswordForm />
      <Toaster />
    </>
  );
};

export default ForgotPasswordPage;