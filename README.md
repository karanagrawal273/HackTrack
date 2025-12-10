# 💻 HackTrack: Contest Scheduling & Tracking

HackTrack is a full-stack web application designed to help competitive programmers effortlessly track, schedule, and receive reminders for coding contests across various major platforms (Codeforces, CodeChef, LeetCode, AtCoder, etc.).

It solves the problem of missing contest start times by integrating a robust, scheduled notification system and automated Google Calendar synchronization.

## ✨ Key Features

* **Automated Contest Sync:** Fetches upcoming contests every 5 minutes from reliable sources (via CList.by).
* **Personalized Feed:** Users can select their preferred platforms to filter the dashboard view.
* **Google Calendar Integration:** Automatically adds all preferred, upcoming contests to the user's Google Calendar upon logging in and updates their schedule periodically.
* **Scheduled Email Reminders:** Uses a model-based scheduling architecture to guarantee delivery of 24-hour and 1-hour email reminders, without duplication.
* **Authentication:** Secure, token-based authentication (JWT) for user management.

## 🚀 Getting Started

HackTrack is split into two main components: a Node.js/Express backend and a Next.js/React frontend. Both must be run independently.

### 📋 Prerequisites

* Node.js (LTS version recommended)
* MongoDB Instance (Local or Atlas)
* Google Cloud Project (for Calendar OAuth 2.0 credentials)

### ⚙️ Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/karanagrawal273/HackTrack.git
    cd hacktrack-contest-scheduler
    ```

2.  **Install dependencies:**
    ```bash
    # Install server dependencies
    cd server
    npm install
    ```
    ```bash
    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Configure Environment Variables:**
    * Create a `.env` file in the **`server`** directory.
    * Create a `.env.local` file in the **`client`** directory.

4.  **Follow the specific setup instructions for the Server and Client:**
    * [server](./server/README.md)

    * [client](./client/README.md)

