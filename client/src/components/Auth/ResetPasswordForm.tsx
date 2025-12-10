// src/components/Auth/ResetPasswordForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import { resetPassword } from '@/services/auth'; 

interface ResetPasswordFormProps {
  token: string;
}

// Schema for new passwords
const newPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof newPasswordSchema>;

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = newPasswordSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Resetting password...');

    try {
      const response = await resetPassword(token, formData.newPassword);

      if (response.success) {
        toast.success('Password reset successfully! Redirecting to login.', { id: toastId });
        // Delay redirect slightly to show success message
        setTimeout(() => router.push('/login'), 2000); 
      } else {
        toast.error(response.error || 'Reset failed. Token might be invalid or expired.', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An unexpected error occurred.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="New Password" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Enter new password (min 6 chars)" />
          <Input label="Confirm New Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Set New Password'}
          </button>
          
          <div className="text-center text-gray-400 text-sm">
            {/* <p>Token: {token ? `${token.substring(0, 8)}...` : 'N/A'}</p> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;