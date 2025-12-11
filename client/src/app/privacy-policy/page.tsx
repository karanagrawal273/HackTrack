// client/src/app/privacy-policy/page.tsx

import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    // Outer container set for dark mode background and text
    <div className="min-h-screen bg-gray-900 text-gray-200 mt-4">
      
      {/* Content wrapper with fixed width and padding */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        
        <h1 className="text-5xl font-extrabold mb-4 text-indigo-400">Privacy Policy for HackTrack</h1>
        <p className="mb-10 text-sm text-gray-400">Last Updated: December 11, 2025</p>

        <section className="mb-10 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">1. Information We Collect</h2>
          <p className="mb-4 text-gray-300">We collect and store the following information to provide and improve our service:</p>
          <ul className="list-disc list-inside ml-6 space-y-3 text-gray-300">
            <li><strong>Account Information:</strong> Your name and email address, provided during registration.</li>
            <li><strong>Preferences:</strong> Your selected competitive programming platforms (e.g., Codeforces, LeetCode).</li>
            <li>
              <strong>Google Account Data (Sensitive Scope):</strong> We request access to your Google Calendar to perform calendar synchronization. We receive and store an encrypted **Google Refresh Token** and the **Google Calendar ID** (the unique ID of your primary calendar).
            </li>
          </ul>
        </section>

        <section className="mb-10 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">2. How We Use Your Data (Google Calendar Use)</h2>
          <p className="mb-4 text-gray-300">
            We adhere strictly to Google's Limited Use Policy regarding your Google user data. The access token and calendar data are used **ONLY** for the following purposes:
          </p>
          <ul className="list-disc list-inside ml-6 space-y-3 text-gray-300">
            <li><strong>Writing Events:</strong> To automatically create, update, and delete contest events on your selected Google Calendar.</li>
            <li><strong>Synchronization:</strong> To ensure contests are not duplicated and to maintain an accurate schedule.</li>
            <li><strong>Internal Reminders:</strong> To schedule personalized 24-hour and 1-hour email reminders related to the synced events.</li>
          </ul>
          <p className="mt-6 p-4 bg-red-900/40 border-l-4 border-red-500 font-medium text-red-300 rounded">
            **We will NEVER read your personal calendar events, modify other calendars, sell your data, or use your Google data for marketing purposes.**
          </p>
        </section>

        <section className="mb-10 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">3. Data Security and Deletion</h2>
          <p className="mb-4 text-gray-300">
            Your Google Refresh Token is stored securely in an encrypted format in our MongoDB database. When you delete your HackTrack account, all associated data, including your name, email, preferences, and the encrypted Google Refresh Token, are permanently removed from our servers within [Specify days, e.g., 7] days.
          </p>
        </section>
        
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;