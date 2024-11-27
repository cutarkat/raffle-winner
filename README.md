# Raffle Winner Picker

This project is a Raffle Winner Picker web application built with an **Express.js** backend and a **React.js** frontend, styled with **TailwindCSS** and bundled using **Vite**. It includes confetti animations, powered by the **react-confetti-boom** package.

Designed for celebrations like parties, events, or gatherings, this application randomly selects a winner using photos as raffle entries. Participants' photos are stored in a designated folder within the project, making it a visual and exciting experience.

## Features

- Use photos as raffle entries, stored in a folder within the project.
- Randomly select a winner from the participant pool.
- Confetti animations for winner announcements.
- Designed with TailwindCSS.

## Technologies Used

- **Backend**: Express.js
- **Frontend**: React.js (with Vite)
- **Styling**: TailwindCSS
- **Animations**: react-confetti-boom

---

## Installation and Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- A code editor (e.g., VS Code)

### Backend Setup (Express.js)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy environment file:

   ```bash
   cp .env.example .env 
   ```

3. Install dependencies:
   ```bash
   npm install
   ```
4. Ensure the folder for participant photos is properly set up in `backend/images/participants` and is not empty.

6. Start the backend server:
   ```bash
   node server.js
   ```

   The backend will be running at `http://localhost:3001`.

### Frontend Setup (React.js with Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy environment file:

   ```bash
   cp .env.example .env 
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be running at the URL provided in the terminal (e.g., `http://localhost:5173`).

---

## Usage

1. Place participant photos in the designated folder `backend/images/participants`.
2. Open the frontend URL (e.g., `http://localhost:5173`) in your browser.
3. Click the "Draw!" button to randomly select a winner.
4. Enjoy the confetti celebration on the screen!

---

## Customization

- **Styling**: Modify TailwindCSS classes in the `frontend/src` components for a customized look.
- **Backend Logic**: Update the logic in the `backend/server.js` to adjust how participants are processed.
- **Animations**: Customize confetti effects by modifying `react-confetti-boom` options in the React components.


### Enjoy! 🎉