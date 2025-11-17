'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { registerSchema } from '../../lib/ValidationSchemas';
import Input from '../ui/Input';
import Link from 'next/link';

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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
        name,
        email,
        password,
      });

      toast.success(response.data.message, { id: toastId });
      router.push(`/verify-email?email=${formData.email}`);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          toast.success('Account exists. Sending new OTP.', { id: toastId });
          router.push(`/verify-email?email=${formData.email}`);
        } else {
          toast.error(error.response.data.message || 'Registration failed.', { id: toastId });
        }
      } else {
        toast.error('An unexpected error occurred.', { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
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
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
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