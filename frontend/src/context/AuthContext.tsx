'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define the shape for a single profile link
interface ProfileLink {
  platform: string;
  url: string;
}

// Define the AuthUser interface
interface AuthUser {
  _id: string;
  name: string;
  email: string;
  trackedPlatforms: string[];
  profileLinks: ProfileLink[];
  isGoogleCalendarConnected: boolean;
}

interface AuthContextType {
  authUser: AuthUser | null;
  setAuthUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          withCredentials: true,
        });
        setAuthUser(response.data);
      } catch (error) {
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};