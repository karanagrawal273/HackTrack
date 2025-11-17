'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ALL_PLATFORMS = [
  'leetcode.com',
  'codeforces.com',
  'codechef.com',
  'atcoder.jp',
  'hackerrank.com',
  'devpost.com'
];

const PLATFORM_DISPLAY_NAMES: { [key: string]: string } = {
  'leetcode.com': 'LeetCode',
  'codeforces.com': 'Codeforces',
  'codechef.com': 'CodeChef',
  'atcoder.jp': 'AtCoder',
  'hackerrank.com': 'HackerRank',
  'devpost.com': 'Devpost'
};

interface ProfileLink {
  platform: string;
  url: string;
}

const SettingsModalContent = ({ onClose }: { onClose: () => void }) => {
  const { authUser, setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [platforms, setPlatforms] = useState<string[]>(authUser?.trackedPlatforms || []);
  const [links, setLinks] = useState<ProfileLink[]>(authUser?.profileLinks || []);

  const handlePlatformChange = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleLinkToggle = (platform: string) => {
    if (links.some(l => l.platform === platform)) {
      setLinks(prev => prev.filter(l => l.platform !== platform));
    } else {
      setLinks(prev => [...prev, { platform, url: '' }]);
    }
  };

  const handleLinkUrlChange = (platform: string, url: string) => {
    setLinks(prev => prev.map(l => l.platform === platform ? { ...l, url } : l));
  };

  const handleSave = async () => {
    for (const link of links) {
      if (!link.url || link.url.trim() === '') {
        toast.error(`Please provide a URL for your ${PLATFORM_DISPLAY_NAMES[link.platform]} profile.`);
        return;
      }
    }

    setLoading(true);
    const toastId = toast.loading('Saving preferences...');
    
    const validPlatforms = platforms.filter(p => ALL_PLATFORMS.includes(p));

    try {
      await Promise.all([
        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/preferences/platforms`, { platforms: validPlatforms }, { withCredentials: true }),
        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/preferences/profiles`, { profileLinks: links }, { withCredentials: true })
      ]);

      if (authUser) {
        setAuthUser({ ...authUser, trackedPlatforms: validPlatforms, profileLinks: links });
      }
      
      toast.success('Preferences saved successfully!', { id: toastId });
      onClose();
    } catch (error) {
      toast.error('Failed to save preferences.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      {/* Platform Selection */}
      <div className="mb-6">
        <h4 className="font-bold mb-3">Tracked Contest Platforms</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ALL_PLATFORMS.map(p => (
            <label key={p} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={platforms.includes(p)} 
                onChange={() => handlePlatformChange(p)} 
                className="h-5 w-5 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"
              />
              <span>{PLATFORM_DISPLAY_NAMES[p]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Profile Links */}
      <div>
        <h4 className="font-bold mb-3">Your Profile Links</h4>
        <div className="space-y-4">
          {ALL_PLATFORMS.map(p => {
            const linkExists = links.some(l => l.platform === p);
            return (
              <div key={p} className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 w-32 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={linkExists} 
                    onChange={() => handleLinkToggle(p)} 
                    className="h-5 w-5 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span>{PLATFORM_DISPLAY_NAMES[p]}</span>
                </label>
                <input
                  type="url"
                  placeholder={`URL for your ${PLATFORM_DISPLAY_NAMES[p]} profile`}
                  value={links.find(l => l.platform === p)?.url || ''}
                  onChange={(e) => handleLinkUrlChange(p, e.target.value)}
                  disabled={!linkExists}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end gap-3">
        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-4 rounded">Cancel</button>
        <button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded disabled:bg-gray-500">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SettingsModalContent;