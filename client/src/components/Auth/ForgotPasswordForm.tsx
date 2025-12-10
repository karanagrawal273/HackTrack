// src/components/Auth/ForgotPasswordForm.tsx

'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import { forgotPassword } from '@/services/auth'; 

// Simple schema for email validation
const emailSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

type FormData = z.infer<typeof emailSchema>;

const ForgotPasswordForm = () => {
  const [formData, setFormData] = useState<FormData>({ email: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending reset link...');

    try {
      const response = await forgotPassword(formData.email);

      // The backend returns success regardless of user existence for security
      if (response.success) {
        toast.success('If an account exists, a reset OTP has been sent.', { id: toastId, duration: 6000 });
        setSubmitted(true);
      } else {
        toast.error(response.error || 'Request failed.', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An unexpected error occurred.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-white text-center">
          <h1 className="text-3xl font-bold">Check Your Email</h1>
          <p className="text-gray-400">
            A password reset OTP has been sent to **{formData.email}**. Use the token in your email to reset your password.
          </p>
          <Link href="/login" className="text-blue-400 hover:underline block pt-4">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email" 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="Enter your registered email" 
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset OTP'}
          </button>
          
          <div className="text-center text-gray-400">
            <Link href="/login" className="text-blue-400 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;