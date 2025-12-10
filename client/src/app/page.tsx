// app/page.tsx

import React from 'react';
import Link from 'next/link';

// Component to hold the main content of the home page
const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-white p-8">
      <header className="text-center max-w-4xl space-y-6 pt-20 pb-16">
        <h1 className="text-6xl font-extrabold text-gray-100 leading-tight">
          Never Miss a Competition.
        </h1>
        <p className="text-xl text-gray-400">
          HackTrack consolidates upcoming coding contests from all major platforms (Codeforces, LeetCode, AtCoder, etc.) directly into one personalized dashboard.
        </p>
        <div className="pt-4">
          <Link 
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Tracking Contests Now
          </Link>
        </div>
      </header>

      {/* Placeholder for features/stats */}
      <section className="mt-16 w-full max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-200 mb-8">Features at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-800 rounded-xl shadow-xl space-y-3">
                <p className="text-4xl text-green-400">📅</p>
                <h3 className="text-xl font-semibold">Unified Calendar</h3>
                <p className="text-gray-400 text-sm">See contests from all platforms in one view.</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-xl shadow-xl space-y-3">
                <p className="text-4xl text-yellow-400">🔔</p>
                <h3 className="text-xl font-semibold">Email Notifications</h3>
                <p className="text-gray-400 text-sm">Get reminders 60 mins before any start.</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-xl shadow-xl space-y-3">
                <p className="text-4xl text-red-400">⚙️</p>
                <h3 className="text-xl font-semibold">Personalized Feeds</h3>
                <p className="text-gray-400 text-sm">Filter contests by your preferred platforms.</p>
            </div>
          </div>
      </section>
    </div>
  );
};

export default HomePage;