'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import Input from '../ui/Input';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending reset token...');
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/forgot-password`, { email });
      toast.success('Request successful!', { id: toastId });
      setMessage(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message, { id: toastId });
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
        <h1 className="text-3xl font-bold text-center text-white">Forgot Password</h1>
        
        {message ? (
          <div className="text-center text-green-400">
            <p>{message}</p>
            <Link href="/login" className="text-blue-400 hover:underline cursor-pointer mt-4 inline-block">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-400">Enter your email to receive a reset token.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your registered email" />
              <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500">
                {loading ? 'Sending...' : 'Send Reset Token'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;