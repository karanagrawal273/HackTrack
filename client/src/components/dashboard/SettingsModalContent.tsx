// D:\HackTrack\client\src\components\dashboard\SettingsModalContent.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

// Define the supported platforms
const ALL_PLATFORMS = [
  'Codeforces', 'CodeChef', 'LeetCode', 'AtCoder', 'HackerRank', 'TopCoder'
];

interface SettingsModalContentProps {
    onClose: () => void;
}

const SettingsModalContent: React.FC<SettingsModalContentProps> = ({ onClose }) => {
    const { authUser, setAuthUser, loading } = useAuth();
    const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Load preferences from authUser state
    useEffect(() => {
        if (authUser) {
            setPreferredPlatforms(authUser.preferredPlatforms || []);
        }
    }, [authUser]);

    const handlePlatformToggle = (platform: string) => {
        setPreferredPlatforms(prev => 
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving preferences...');

        try {
            const token = Cookies.get('hacktrack_token');
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/preferences`, 
                { preferredPlatforms }, // Only sending platforms
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Update local context state with new user data
                setAuthUser(response.data.data); 
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/sync-history`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Preferences updated successfully!', { id: toastId });
                onClose(); // Close the modal on success
            } else {
                toast.error('Failed to update preferences.', { id: toastId });
            }
        } catch (error) {
            toast.error('Error saving preferences.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !authUser) {
        return <div className="p-4 text-center text-white">Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-400">Select the contest platforms you wish to **show in your feed** and **receive email and calendar notifications for**.</p>
            
            <div className="grid grid-cols-2 gap-3">
                {ALL_PLATFORMS.map(platform => (
                    <div
                        key={platform}
                        onClick={() => handlePlatformToggle(platform)}
                        className={`p-3 rounded-lg cursor-pointer transition duration-150 text-center border-2 
                            ${preferredPlatforms.includes(platform) 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {platform}
                    </div>
                ))}
            </div>

            <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
        </form>
    );
};

export default SettingsModalContent;