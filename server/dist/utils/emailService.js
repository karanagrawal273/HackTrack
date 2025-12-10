"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// --- Environment Variables ---
const CLIENT_ID = process.env.GOOGLE_MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_MAIL_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_MAIL_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
// Initialize the OAuth2 Client
if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error("Missing Google Mail API credentials in environment variables.");
}
const oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 
// Redirect URI is not strictly needed for server-to-server with a stored Refresh Token
undefined);
// Set the stored Refresh Token on the client
oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
});
/**
 * Creates a raw email body in base64 format required by Gmail API
 */
function makeBody(to, from, subject, body) {
    const str = [
        `Content-Type: text/html; charset="UTF-8"\n`,
        `MIME-Version: 1.0\n`,
        `Content-Transfer-Encoding: 7bit\n`,
        `to: ${to}\n`,
        `from: ${from}\n`,
        `subject: ${subject}\n\n`,
        `${body}`,
    ].join('');
    const encodedMail = Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return encodedMail;
}
/**
 * Sends an email using the Gmail API
 */
const sendEmail = async (to, subject, htmlBody) => {
    if (!REFRESH_TOKEN) {
        console.error("Cannot send email: Refresh token missing.");
        return false;
    }
    if (!SENDER_EMAIL) {
        console.error("Sender email is missing");
        return false;
    }
    try {
        // Use the authenticated OAuth2Client
        const authClient = oauth2Client;
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth: authClient });
        const fromEmail = SENDER_EMAIL;
        const raw = makeBody(to, fromEmail, subject, htmlBody);
        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: raw,
            },
        });
        console.log('Email sent successfully:', res.data);
        return true;
    }
    catch (error) {
        console.error('Error sending email via Gmail API:', error);
        return false;
    }
};
exports.sendEmail = sendEmail;
