// client/src/app/about/page.tsx

import React from 'react';
import { CalendarCheck, Clock, Layers, Users } from 'lucide-react'; // Icons for visual appeal
import Link from 'next/link';

const AboutPage = () => {
  // Set the background to dark mode compliant (assuming parent layout is also dark)
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      
      {/* 1. HERO SECTION: Bold and Attractive Header */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-indigo-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-extrabold text-white mb-4">
            Your Personal Guide Through Competitive Programming
          </h1>
          <p className="text-xl text-indigo-300 mb-8 max-w-3xl mx-auto">
            HackTrack eliminates the stress and headache of juggling schedules across Codeforces, LeetCode, AtCoder, and more. Focus on coding—we handle the calendar.
          </p>
          <Link href="/register" legacyBehavior>
            <a className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200">
              Get Started Now
            </a>
          </Link>
        </div>
      </div>

      {/* 2. MISSION & VISION SECTION */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Mission Card */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
            <Layers className="text-indigo-400 mb-4" size={36} />
            <h2 className="text-3xl font-bold text-indigo-400 mb-4">Our Mission: Simplify Scheduling</h2>
            <p className="text-gray-300 text-lg space-y-4">
              HackTrack was created by developers, for developers. We understand that contest tracking is a major headache. Our goal is simple: to provide a centralized hub that filters, synchronizes, and alerts you reliably, allowing you to **focus 100% on the problem sets, not the paperwork.**
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
            <Users className="text-green-400 mb-4" size={36} />
            <h2 className="text-3xl font-bold text-green-400 mb-4">Our Vision: Seamless Integration</h2>
            <p className="text-gray-300 text-lg space-y-4">
              We envision a world where competitive programming is fully integrated into the modern developer workflow. Through reliable cron jobs, secure Mongoose models, and clean API integration, HackTrack delivers your contest schedule right where you need it—your personal calendar and inbox.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CORE FEATURES / VALUE PROPS */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center text-white mb-12">Why Choose HackTrack?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Value Prop 1 */}
            <div className="p-6 bg-gray-800 rounded-xl shadow-lg border-t-4 border-indigo-500">
              <CalendarCheck className="text-indigo-400 mb-3" size={32} />
              <h3 className="text-xl font-semibold text-white mb-2">Automated Calendar Sync</h3>
              <p className="text-gray-400">Instantly push all your filtered contests directly to your Google Calendar, complete with reminders. Set it once and forget it.</p>
            </div>

            {/* Value Prop 2 */}
            <div className="p-6 bg-gray-800 rounded-xl shadow-lg border-t-4 border-green-500">
              <Clock className="text-green-400 mb-3" size={32} />
              <h3 className="text-xl font-semibold text-white mb-2">Guaranteed Email Reminders</h3>
              <p className="text-gray-400">Our robust scheduler ensures you receive 24-hour and 1-hour email alerts without fail, thanks to our dedicated background cron jobs.</p>
            </div>

            {/* Value Prop 3 */}
            <div className="p-6 bg-gray-800 rounded-xl shadow-lg border-t-4 border-yellow-500">
              <Layers className="text-yellow-400 mb-3" size={32} />
              <h3 className="text-xl font-semibold text-white mb-2">Centralized Hub</h3>
              <p className="text-gray-400">Filter and track contests from all major platforms (Codeforces, AtCoder, LeetCode) in one clean, personalized dashboard.</p>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AboutPage;