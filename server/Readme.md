
This directory contains the Node.js/Express backend for HackTrack. It is responsible for all core business logic, database management, external data fetching, and the scheduling system.

## 🗄️ Architecture & Core Components

* **Database:** MongoDB/Mongoose.
* **API:** Express.js (RESTful API, accessible at `/api/v1`).
* **Scheduler:** `node-cron` integrated with service files (`notificationService.ts` and `contestService.ts`).
* **Authentication:** JWT (JSON Web Tokens).

## ⚙️ Configuration

Create a `.env` file in the root of the `server` directory with the following required variables. **Do not commit this file to GitHub.**

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server port |
| `MONGO_URI` | Connection string for MongoDB | `mongodb+srv://<user>:<password>@cluster.mongodb.net/hacktrackdb` |
| `JWT_SECRET` | Secret key for signing JWTs | `YOUR_SECRET_JWT_KEY` |
| `CLIST_USERNAME` | Username for CList.by API | `YOUR_CLIST_USERNAME` |
| `CLIST_API_KEY` | API key for CList.by | `YOUR_CLIST_API_KEY` |
| `EMAIL_SERVICE` | Email transport provider (e.g., `gmail`) | `gmail` |
| `EMAIL_USERNAME` | Sender email address | `youremail@gmail.com` |
| `EMAIL_PASSWORD` | App password/SMTP key for email sending | `YOUR_APP_PASSWORD` |
| `GOOGLE_MAIL_CLIENT_ID` | OAuth Client ID for Calendar integration | `YOUR_GOOGLE_CLIENT_ID` |
| `GOOGLE_MAIL_CLIENT_SECRET` | OAuth Client Secret | `YOUR_GOOGLE_CLIENT_SECRET` |
| `GOOGLE_REDIRECT_URI` | Must match the authorized redirect URL in Google Console |
| `FRONTEND_URL` | Base URL of the client application |

## ▶️ Running the Server

Make sure you are in the `server` directory before running these commands.

```bash
# From the project root directory:
cd server

# 1. Install dependencies (if needed)
# npm install

# 2. Run in development mode (with hot reloading)
npm run dev 

# 3. Run in production mode
npm start

```