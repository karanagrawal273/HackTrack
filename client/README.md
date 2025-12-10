
This directory contains the Next.js/React frontend for HackTrack. It provides the user interface, handles client-side routing, renders the dashboard, and manages user interaction.

## 🗂️ Technology Stack

* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **State Management:** React Context API (e.g., AuthContext)
* **HTTP Client:** Axios

## ⚙️ Configuration

Create a `.env.local` file in the root of the `client` directory with the following variables. These are used by Next.js to communicate with your backend API.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The base URL for your server's API | `your server api url` |

## ▶️ Running the Client

Make sure your server is running on the port specified in `NEXT_PUBLIC_API_URL` before starting the client.

```bash
# From the project root directory:
cd client

# 1. Install dependencies (if needed)
npm install

# 2. Run the development server
npm run dev

```