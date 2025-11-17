'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Input from '../ui/Input';

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<'loading' | 'verify' | 'redirecting'>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      if (!email) {
        toast.error('No email provided. Redirecting to register.');
        setTimeout(() => router.push('/register'), 2000);
        return;
      }
      
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/check-verification?email=${email}`);
        
        if (response.data.isVerified) {
          toast.success('Account is already verified. Redirecting to login.');
          setPageState('redirecting');
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setPageState('verify');
        }
      } catch (err) {
        toast.error('Failed to check user status.');
        setPageState('verify');
      }
    };
    checkStatus();
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length < 6) {
      return toast.error('Please enter a valid 6-digit OTP.');
    }
    
    setLoading(true);
    const toastId = toast.loading('Verifying account...');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/verify-otp`, { email, otp });
      toast.success(response.data.message, { id: toastId });
      router.push('/login');
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

  const handleResend = async () => {
    if (!email) return;
    const toastId = toast.loading('Resending OTP...');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/resend-otp`, { email });
      toast.success(response.data.message, { id: toastId });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message, { id: toastId });
      } else {
        toast.error('An unexpected error occurred.', { id: toastId });
      }
    }
  };

  if (pageState !== 'verify') {
    return <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] text-white">{pageState === 'loading' ? 'Checking status...' : 'Redirecting...'}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Verify Your Account</h1>
        <p className="text-center text-gray-400">
          Enter the 6-digit code sent to <br />
          <span className="font-medium text-blue-400">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Verification Code" type="text" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter your 6-digit OTP" />
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        <div className="text-center text-gray-400 text-sm">
          Didn't receive the code?{' '}
          <button onClick={handleResend} className="font-medium text-blue-400 hover:underline bg-transparent border-none cursor-pointer">
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

const VerifyEmailForm = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-10rem)] text-white">Loading...</div>}>
    <VerifyEmailContent />
  </Suspense>
);

export default VerifyEmailForm;