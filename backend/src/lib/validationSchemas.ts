import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export const backendResetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters long.'),
  token: z.string().min(1, 'Token is required.'),
});