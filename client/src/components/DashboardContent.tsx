// src/components/DashboardContent.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react'; // ADDED hooks
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
// Assuming these utilities/types are in your client directory
import { IContest } from '@/types/index'; // Import IContest interface
import { generateGoogleCalendarLink } from '@/utils/calendar'; // Import manual link utility
import ClientTime from './ui/ClientTime'; // Import time formatting component
import Modal from './ui/Modal'; // Import Modal component
import SettingsModalContent from './dashboard/SettingsModalContent'; // Import the Preferences Form

type GroupedContests = { [date: string]: IContest[] };

const DashboardContent: React.FC = () => {
    const { authUser, setAuthUser, loading: authLoading } = useAuth();
    const router = useRouter();
    
    // --- NEW STATE ---
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [contests, setContests] = useState<IContest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // -----------------

    // --- EFFECT 1: Redirection/Authentication Check ---
    useEffect(() => {
        // Redirect unauthorized users
        if (!authLoading && !authUser) {
            router.push('/login');
        }
    }, [authUser, authLoading, router]);

    // --- EFFECT 2: Contest Data Fetching ---
    useEffect(() => {
        if (authUser) {
            const fetchContests = async () => {
                setIsLoading(true);
                const token = Cookies.get('hacktrack_token');
                
                if (!token) {
                    // Safety check: if authUser exists but token doesn't, force logout
                    toast.error('Session token missing. Please log in.');
                    router.push('/login');
                    return; 
                }
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contests`, {
                        headers: {
                            Authorization: `Bearer ${token}`, // <-- CRITICAL FIX
                        },
                        withCredentials: true,
                    });
                    setContests(response.data); // Data is already filtered by server preferences
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response?.status === 401) {
                         toast.error('Session expired. Logging out.');
                         router.push('/login');
                    } else {
                         toast.error('Failed to fetch contest data.');
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            fetchContests();
        }
    }, [authUser, router]);

    // --- Memoization: Group Contests by Date ---
    const groupedContests = useMemo(() => {
        return contests.reduce((acc, contest) => {
            const startTime = new Date(contest.startTime);
            
            // CHECK 1: Ensure date parsing works
            if (isNaN(startTime.getTime())) {
                console.error("Failed to parse date for contest:", contest.name, contest.startTime);
                return acc; // Skip broken contests
            }
            
            const dateKey = startTime.toLocaleDateString('en-IN', {
                // ... (formatting options) ...
            });
            
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(contest);
            return acc;
        }, {} as GroupedContests);
    }, [contests]);


    // --- Handlers ---
    
    // 1. Connect Calendar (Initiates OAuth Flow)
    const handleConnectCalendar = async () => {
        const token = Cookies.get('hacktrack_token');
        if (!token) {
            toast.error('Session expired. Please log in.');
            return router.push('/login');
        }

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/calendar/auth`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.data.success && response.data.authUrl) {
                window.location.href = response.data.authUrl;
            } else {
                toast.error('Failed to initiate Google sign-in.');
            }
        } catch (error) {
            toast.error('Authentication server error.');
        }
    };

    // 2. Disconnect Calendar (Clears Token on Server)
    const handleDisconnectCalendar = async () => {
        const token = Cookies.get('hacktrack_token'); // Get token from cookie
    
        // Safety check: If no token, user is logged out, stop the process
        if (!token) {
            toast.error('You must be logged in to disconnect.');
            return router.push('/login');
        }
        const toastId = toast.loading('Disconnecting Google Calendar...');
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/calendar/disconnect`, 
                {}, 
                { 
                    headers: {
                    Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                // Update local AuthContext with the new user data (calendarSync: false)
                setAuthUser(response.data.data); 
                toast.success('Google Calendar successfully disconnected.', { id: toastId });
            } else {
                toast.error(response.data.error || 'Failed to disconnect calendar.', { id: toastId });
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                toast.error('Session expired. Please log in again.', { id: toastId });
                return router.push('/login');
            }
            console.error('Disconnect error:', error);
            toast.error('Failed to disconnect calendar due to a server error.', { id: toastId });
        }
    };


    if (authLoading || !authUser) {
        return <div className="flex items-center justify-center min-h-screen text-white">Loading session...</div>;
    }

    const isSyncActive = authUser.calendarSync;

    return (
        <div className="p-4 md:p-8 text-white pt-16">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-gray-700 pb-4">
                <h1 className="text-2xl md:text-3xl font-bold">Your Contest Feed</h1>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsSettingsModalOpen(true)} 
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Preferences
                    </button>
                    
                    {isSyncActive ? (
                        <button 
                            onClick={handleDisconnectCalendar}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Disconnect Calendar
                        </button>
                    ) : (
                        <button 
                            onClick={handleConnectCalendar}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Link Google Calendar
                        </button>
                    )}
                </div>
            </div>
         
            {/* --- Contest Display --- */}
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
                                            {/* Manual Add to Calendar Link */}
                                            <a 
                                                href={generateGoogleCalendarLink(contest)} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded text-sm"
                                            >
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
                    Try setting your platforms in "Preferences"!
                </div>
            )}

            {/* --- Preferences Modal --- */}
            <Modal 
                isOpen={isSettingsModalOpen} 
                onClose={() => setIsSettingsModalOpen(false)} 
                title="Manage Your Preferences"
            >
                {/* Assuming SettingsModalContent is your PreferencesForm */}
                <SettingsModalContent onClose={() => setIsSettingsModalOpen(false)} /> 
            </Modal>
        </div>
    );
};

export default DashboardContent;