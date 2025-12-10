// src/components/Auth/LoginForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { loginSchema } from '@/lib/ValidationSchemas';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext'; // Use the Auth context for login logic

type FormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth(); // Get login function from context
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Zod Validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading('Logging in...');
    
    try {
      const success = await login(formData); // Use Auth context login function

      if (success) {
        toast.success('Welcome back!', { id: toastId });
        router.push('/dashboard'); 
      } else {
        // If login fails (error handled internally by loginUser service)
        toast.error('Invalid email or password.', { id: toastId });
      }

    } catch (error) {
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Login to HackTrack</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center text-gray-400">
            <Link href="/forgot-password" className="text-blue-400 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="text-center text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:underline">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;