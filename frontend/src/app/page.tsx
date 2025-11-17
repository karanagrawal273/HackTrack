import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function HomePage() {
  const features = [
    { title: "All Events, One Place", description: "Track contests & hackathons from Codeforces, LeetCode, CodeChef, Devpost, and more." },
    { title: "Personalized Feed", description: "Filter your dashboard to show only the platforms you care about." },
    { title: "Never Miss a Deadline", description: "Get automatic email reminders 24 hours and 1 hour before each event." },
    { title: "Calendar Sync", description: "Connect your Google Calendar to automatically add events you're tracking." },
    { title: "Quick Links", description: "Directly jump to contest pages or your saved coding profiles." },
    { title: "Always Up-to-Date", description: "Contest data is automatically refreshed frequently." },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-gradient-to-b from-gray-900 via-gray-900 to-background">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            HackTrack
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl">
          Your ultimate companion for competitive programming and hackathons. Stay organized, get notified, and never miss an event.
        </p>
        <Link href="/register">
          <span className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/50">
            Get Started for Free
          </span>
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose HackTrack?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 hover:border-blue-500 transition duration-300">
              <CheckCircle className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}