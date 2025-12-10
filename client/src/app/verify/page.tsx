// app/verify/page.tsx

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyUser } from '@/services/auth';
import Cookies from 'js-cookie';
import Input from '@/components/ui/Input';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';

const VerifyPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) {
        setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Verifying account...');

    if (otp.length !== 6) {
        toast.error('OTP must be 6 digits.', { id: toastId });
        setLoading(false);
        return;
    }

    try {
      const response = await verifyUser({ email, otp });

      if (response.success && response.token) {
        Cookies.set('hacktrack_token', response.token, { expires: 30 });
        toast.success('Account verified successfully!', { id: toastId });
        router.push('/dashboard'); 
      } else {
        toast.error(response.error || 'Verification failed. Invalid OTP or email.', { id: toastId });
      }
    } catch (err: any) {
        toast.error(err.response?.data?.error || 'An unexpected error occurred.', { id: toastId });
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-white">
          <h1 className="text-3xl font-bold text-center">Verify Your Account</h1>
          
          <p className="text-center text-sm text-gray-400">
            An OTP has been sent to **{email}**. Please check your inbox.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Email (Editable)" 
              type="email" 
              name="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
            
            <Input
              label="OTP"
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the 6-digit OTP"
              maxLength={6}
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>

          <div className="text-center text-gray-400 text-sm">
            <Link href="/register" className="text-blue-400 hover:underline">
              Didn't receive the email? Register again.
            </Link>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

const VerifyPageWrapper = () => {
    return (
        // The fallback is shown during the initial server render
        // This tells Next.js where to "bail out" of static rendering
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-gray-400">Loading verification form...</p>
            </div>
        }>
            <VerifyPage />
        </Suspense>
    );
};

export default VerifyPageWrapper;