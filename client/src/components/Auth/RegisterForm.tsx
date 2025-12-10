// src/components/Auth/RegisterForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Assuming you moved the schema to this path
import { registerSchema } from '@/lib/ValidationSchemas'; 
import Input from '@/components/ui/Input';
import { registerUser } from '@/services/auth'; // Use existing auth service

type FormData = z.infer<typeof registerSchema> & {
  confirmPassword: '';
};

const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Zod Validation
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    
    setLoading(true);
    const toastId = toast.loading('Creating your account...');
    
    try {
      const { name, email, password } = formData;
      // Using the service function instead of direct axios call
      const response = await registerUser({ name, email, password }); 

      if (response.success) {
        toast.success(response.data || 'Account created successfully. Check your email!', { id: toastId });
        // Redirect to the verification page
        router.push(`/verify?email=${formData.email}`); 
      } else {
        // Handle server-side errors
        toast.error(response.error || 'Registration failed.', { id: toastId });
      }

    } catch (error: any) {
      // Axios error handling from the service
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
      // Note: We need to handle the case where the user exists (400 or specific message)
      if (errorMessage.includes('User already exists')) {
         toast.success('Account exists. Sending new OTP.', { id: toastId });
         router.push(`/verify?email=${formData.email}`);
      } else {
          toast.error(errorMessage, { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Create an Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" />
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password (min 6 chars)" />
          <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md 
               transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div className="text-center text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;