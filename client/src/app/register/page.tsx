// app/register/page.tsx

import React from 'react';
import RegisterForm from '@/components/Auth/RegisterForm';
import { Toaster } from 'react-hot-toast'; // Import the Toaster
import { AuthRouteGuard } from '@/components/Auth/AuthRouteGuard';

const RegisterPage = () => {
  return (
    <AuthRouteGuard>
      <RegisterForm />
      <Toaster /> {/* Place the Toaster component */}
    </AuthRouteGuard>
  );
};

export default RegisterPage;