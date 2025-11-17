'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';

const LoginForm = () => {
  const router = useRouter();
  const { setAuthUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Logging in...');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, formData, {
        withCredentials: true,
      });
      
      setAuthUser(response.data); // Update global context
      toast.success('Logged in successfully!', { id: toastId });
      router.push('/dashboard');

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          toast.success(error.response.data.message, { id: toastId });
          router.push(`/verify-email?email=${formData.email}`);
        } else {
          toast.error(error.response.data.message || 'Login failed.', { id: toastId });
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
        <h1 className="text-3xl font-bold text-center text-white">Welcome Back</h1>
        <p className="text-center text-gray-400">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
          <div>
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" />
            <div className="text-right mt-2">
              <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition disabled:bg-gray-500">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="text-center text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;