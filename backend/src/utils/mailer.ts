import { google } from 'googleapis';
import { IUser } from '../models/user.model';
import { IContest } from '../models/contest.model';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set the refresh token for your developer account
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

/**
 * Creates and sends an email using the Gmail API.
 */
async function sendEmailWithGmailAPI(to: string, subject: string, htmlBody: string) {
  try {
    // 1. Get a new access token using the refresh token
    const { token: accessToken } = await oauth2Client.getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    // 2. Set the new access token for this request
    oauth2Client.setCredentials({ access_token: accessToken });

    // 3. Create the Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 4. Create the raw email message (Base64 encoded)
    const emailLines = [
      `To: ${to}`,
      `From: ${process.env.EMAIL_USER}`, // Your email
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      htmlBody,
    ];
    const email = emailLines.join('\r\n');
    const base64Email = Buffer.from(email).toString('base64');
    const raw = base64Email.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // 5. Send the email
    await gmail.users.messages.send({
      userId: 'me', // 'me' refers to the authenticated account (your developer account)
      requestBody: {
        raw: raw,
      },
    });

  } catch (error) {
    console.error('Error sending email via Gmail API:', error);
    throw new Error('Could not send email.');
  }
}

// --- Your Existing Functions, Now Using the New Sender ---

export const sendOTPEmail = async (email: string, otp: string) => {
  const subject = 'Your OTP for Account Verification of HackTrack';
  const htmlBody = `<b>Thank you for registering. Your One-Time Password is: ${otp}</b><p>It will expire in 10 minutes.</p>`;
  
  try {
    await sendEmailWithGmailAPI(email, subject, htmlBody);
    // console.log('OTP email sent successfully via Gmail API.');
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request';
  const htmlBody = `<p>You requested a password reset. Please use the following token to reset your password:</p>
                    <b>${resetURL}</b>
                    <p>This token is valid for 10 minutes.</p>`;
  
  try {
    await sendEmailWithGmailAPI(email, subject, htmlBody);
    // console.log('Password reset email sent successfully via Gmail API.');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendContestReminderEmail = async (user: any, contest: any) => {
  const startTimeLocal = new Date(contest.startTime).toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata', 
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true 
  });
  
  const subject = `Reminder: ${contest.name} starts on ${startTimeLocal}`;
  const htmlBody = `<p>Hi ${user.name},</p>
                    <p>This is a reminder that the contest <strong>${contest.name}</strong> on ${contest.platform} is scheduled to start at:</p>
                    <h3 style="color: #2563eb;">${startTimeLocal} (IST)</h3>
                    <p>Get ready and good luck!</p>
                    <a href="${contest.url}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Contest</a>`;

  try {
    await sendEmailWithGmailAPI(user.email, subject, htmlBody);
    // console.log(`Reminder email sent successfully to ${user.email} for ${contest.name}`);
  } catch (error) {
    console.error(`Failed to send reminder email`, error);
  }
};