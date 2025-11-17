'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IContest } from '../../types';
import { generateGoogleCalendarLink } from '../../utils/calendar';
import Modal from '../../components/ui/Modal';
import SettingsModalContent from '../../components/dashboard/SettingsModalContent';
import ClientTime from '../../components/ui/ClientTime';

type GroupedContests = { [date: string]: IContest[] };

const DashboardPage = () => {
  const { authUser, setAuthUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [contests, setContests] = useState<IContest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (authUser) {
      const fetchContests = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests`, {
            withCredentials: true,
          });
          setContests(response.data);
        } catch (error) {
          toast.error('Failed to fetch contest data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchContests();
    }
  }, [authUser]);

  const groupedContests = useMemo(() => {
    return contests.reduce((acc, contest) => {
      const dateKey = new Date(contest.startTime).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(contest);
      return acc;
    }, {} as GroupedContests);
  }, [contests]);

  const handleConnectCalendar = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/google-calendar/connect`, {
        withCredentials: true,
      });
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to connect to Google Calendar.');
    }
  };

  const handleDisconnectCalendar = async () => {
    const toastId = toast.loading('Disconnecting Google Calendar...');
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/google-calendar/disconnect`,
        {},
        { 
          withCredentials: true
        }
      );
      setAuthUser(response.data);
      toast.success('Google Calendar disconnected.', { id: toastId });
    } catch (error) {
      toast.error('Failed to disconnect calendar.', { id: toastId });
    }
  };

  if (authLoading || !authUser) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading session...</div>;
  }

  return (
    <div className="p-4 md:p-8 text-white">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Your Contest Feed</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSettingsModalOpen(true)} 
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Preferences
          </button>
          
          {authUser.isGoogleCalendarConnected ? (
            <button 
              onClick={handleDisconnectCalendar}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect Calendar
            </button>
          ) : (
            <button 
              onClick={handleConnectCalendar}
              className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-2 px-4 rounded"
            >
              Connect Calendar
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 mt-10">Loading contests...</div>
      ) : contests.length > 0 ? (
        <div className="space-y-12">
          {Object.keys(groupedContests).map(dateKey => (
            <section key={dateKey}>
              <h2 className="text-2xl font-bold text-blue-400 border-b border-gray-700 pb-2 mb-6">
                {dateKey}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedContests[dateKey].map(contest => (
                  <div key={contest._id} className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{contest.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{contest.platform}</p>
                      <p className="text-sm text-gray-300 mt-2">
                        Starts: <ClientTime utcTime={contest.startTime} />
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <a href={contest.url} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded text-sm">
                        Go to Contest
                      </a>
                      <a href={generateGoogleCalendarLink(contest)} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded text-sm">
                        Add to Calendar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-lg mt-10">
          No upcoming contests found matching your preferences.
          <br />
          Try adding more platforms in your "Preferences"!
        </div>
      )}

      <Modal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        title="Manage Your Preferences"
      >
        <SettingsModalContent onClose={() => setIsSettingsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default DashboardPage;