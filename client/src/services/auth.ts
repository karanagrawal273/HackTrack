// src/services/auth.ts

import api from './api';
import { LoginData, RegisterData, VerifyData, ResetData } from '../types/auth'; // We will define these types later

// Interface placeholders for data (create src/types/auth.ts later)
interface AuthResponse {
  success: boolean;
  token?: string;
  data?: string;
  error?: string;
}

export const registerUser = (data: RegisterData): Promise<AuthResponse> => {
  return api.post('/auth/register', data).then(res => res.data);
};

export const verifyUser = (data: VerifyData): Promise<AuthResponse> => {
  return api.post('/auth/verify', data).then(res => res.data);
};

export const loginUser = (data: LoginData): Promise<AuthResponse> => {
  return api.post('/auth/login', data).then(res => res.data);
};

export const forgotPassword = (email: string): Promise<AuthResponse> => {
  return api.post('/auth/forgotpassword', { email }).then(res => res.data);
};

export const resetPassword = (token: string, newPassword: string): Promise<AuthResponse> => {
  return api.put(`/auth/resetpassword/${token}`, { newPassword }).then(res => res.data);
};