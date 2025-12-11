// client/src/app/terms-of-service/page.tsx

import React from 'react';

const TermsOfServicePage = () => {
  return (
    // Outer container set for dark mode background and text
    <div className="min-h-screen bg-gray-900 text-gray-200 mt-4">
      
      {/* Content wrapper with fixed width and padding */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        
        <h1 className="text-5xl font-extrabold mb-4 text-indigo-400">Terms of Service for HackTrack</h1>
        <p className="mb-10 text-sm text-gray-400">Last Updated: December 11, 2025</p>

        <section className="mb-10 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">1. Acceptance of Terms</h2>
          <p className="text-gray-300">By registering for or using HackTrack, you signify that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must not use the service.</p>
        </section>

        <section className="mb-10 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">2. User Obligations and Prohibited Conduct</h2>
          <p className="mb-4 text-gray-300">You agree to use HackTrack only for its intended purpose of tracking competitive programming contests. You are strictly prohibited from:</p>
          <ul className="list-disc list-inside ml-6 space-y-3 text-gray-300">
            <li>Uploading or transmitting any malicious code, viruses, or harmful software.</li>
            <li>Accessing, tampering with, or using non-public areas of the service or the backend infrastructure.</li>
            <li>Attempting to gain unauthorized access to other user accounts, data, or credentials.</li>
            <li>Misusing the Google Calendar integration, including generating excessive or spammy requests.</li>
          </ul>
        </section>
        
        <section className="mb-10 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">3. Service Disclaimer (Contest Data)</h2>
          <p className="text-gray-300">
            HackTrack aggregates contest data primarily from third-party APIs (CList.by). While we run hourly checks to maintain accuracy, **we are not responsible for any inaccuracies, delays, or cancellations** of contests that may occur on the host platforms (Codeforces, LeetCode, etc.).
          </p>
          <p className="mt-4 text-gray-300">
            The service is provided on an **"as is" and "as available"** basis, without warranty of any kind.
          </p>
        </section>

        <section className="mb-10 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">4. Termination and Suspension</h2>
          <p className="text-gray-300">We reserve the right to immediately suspend or permanently terminate your access to HackTrack, at our sole discretion, particularly if we believe you have violated these Terms, engaged in fraudulent activity, or misused the sensitive Google Calendar integration.</p>
        </section>
        
      </div>
    </div>
  );
};

export default TermsOfServicePage;