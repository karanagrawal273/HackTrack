'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { frontendResetPasswordSchema } from '../../lib/ValidationSchemas';
import Input from '../ui/Input';

const ResetPasswordForm = () => {
  const params = useParams();
  const token = params.token as string;
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = frontendResetPasswordSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading('Resetting password...');

    try {
      const { newPassword } = formData;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/reset-password`, {
        token,
        newPassword,
      });

      toast.success(response.data.message, { id: toastId });
      setSuccess(true);
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

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
        <div className="w-full max-w-md p-8 text-center bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-green-400">Password Reset Successful!</h2>
          <p className="mt-2 text-gray-300">You can now log in with your new password.</p>
          <Link href="/login" className="inline-block mt-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 cursor-pointer">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Reset Your Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="New Password" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Enter your new password" />
          <Input label="Confirm New Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your new password" />
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;