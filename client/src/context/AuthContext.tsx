// src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios'; // <-- ADDED: Need axios for fetching user profile
import { LoginData, User as AuthUserType } from '@/types/auth';
import { jwtDecode } from 'jwt-decode'; 
import toast from 'react-hot-toast';
import { loginUser } from '@/services/auth';

// Define the shape of the Context
interface AuthContextType {
 authUser: AuthUserType | null;
 isAuthenticated: boolean;
 login: (data: LoginData) => Promise<boolean>;
 logout: () => void;
 loading: boolean;
 setAuthUser: React.Dispatch<React.SetStateAction<AuthUserType | null>>; 
}

// Default values for the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define Props for the Provider component
interface AuthProviderProps {
 children: ReactNode;
}

// --- Utility Function to Fetch User Profile ---
// We define this inside the provider to access state setters and router
// But for cleaner code, we will implement it as an inner function.

// --- Auth Provider Component ---
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
 const [authUser, setAuthUser] = useState<AuthUserType | null>(null);
 const [loading, setLoading] = useState(true);
 const router = useRouter();

// --- START: NEW/MODIFIED LOGIC ---

    // Helper function to fetch the user's latest profile (including calendarSync status)
    const fetchUserProfile = async (token: string) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // The response.data.data contains the full user object from the DB,
            // which includes the correct calendarSync status.
            setAuthUser(response.data.data);
        } catch (e) {
            console.error("Failed to fetch user profile:", e);
            // If the token fails the /me check, clear session
            Cookies.remove('hacktrack_token');
            setAuthUser(null);
        } finally {
            // Only set loading false after successfully fetching or failing silently
            setLoading(false); 
        }
    };

 useEffect(() => {
        const token = Cookies.get('hacktrack_token');
        const urlParams = new URLSearchParams(window.location.search);

        if (token) {
            // 1. Check for success redirect from OAuth (Highest priority)
            if (urlParams.get('calendarSuccess') === 'true') {
                fetchUserProfile(token).then(() => {
                    router.replace('/dashboard');
                    toast.success("Google Calendar successfully linked!");
                });
                return;
            }
            
            // 2. Normal page load: Fetch the user's DB state directly
            // This ensures calendarSync status is always up-to-date on every page load.
            fetchUserProfile(token);
            
            // NOTE: We no longer rely solely on jwtDecode for the *initial* state, 
            // but fetching the DB state is crucial for persistence.
        } else {
             // If no token exists, we are done.
             setLoading(false);
        }
    }, [router]);

// ... (login and logout functions remain the same) ...

 const login = async (data: LoginData): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await loginUser(data);

            if (response.success && response.token) {
                Cookies.set('hacktrack_token', response.token, { expires: 30 });
                
                // CRITICAL: After successful login, fetch the full profile from the DB
                // to get the latest status, preferredPlatforms, etc.
                await fetchUserProfile(response.token); 
                
                return true;
            } else {
                setLoading(false);
                return false;
            }
        } catch (error) {
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        Cookies.remove('hacktrack_token');
        setAuthUser(null);
        router.push('/login');
    };

    const contextValue: AuthContextType = {
        authUser,
        isAuthenticated: !!authUser,
        login,
        logout,
        loading,
        setAuthUser,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Custom Hook to Consume Context ---
export const useAuth = () => {
 const context = useContext(AuthContext);
 if (context === undefined) {
   throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};