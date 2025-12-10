// app/login/page.tsx

import React from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import { Toaster } from 'react-hot-toast'; // Import the Toaster
import { AuthRouteGuard } from '@/components/Auth/AuthRouteGuard';

const LoginPage = () => {
  return (
    <AuthRouteGuard>
      <LoginForm />
      <Toaster />
    </AuthRouteGuard>
  );
};

export default LoginPage;