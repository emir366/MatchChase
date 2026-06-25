# MatchChase ⚽️

MatchChase is a comprehensive football (soccer) statistics and tracking platform. It allows users to explore detailed data regarding nations, leagues, seasons, clubs, players, transfers, match weeks, fixtures, and deep match statistics (including xG, possession, shot maps, and goalkeeper performances).

The project is structured as a full-stack web application with a modern React frontend and a robust Node.js/Express backend powered by Prisma ORM.

## 🛠 Tech Stack

### Frontend (`/frontend`)
*   **Framework:** React 19 + Vite
*   **Routing:** React Router v7
*   **UI Libraries:** Material UI (MUI), Mantine Core, Tabler Icons
*   **Data Fetching:** Axios & native Fetch API

### Backend (`/backend`)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Data Processing:** `xlsx`, `csv-parse` (for importing rich football datasets)

---

## ✨ Features

*   **Global Coverage:** Browse nations, leagues, and individual seasons.
*   **Club Profiles:** View club squads, historical fixtures, and transfer activity.
*   **Player Database:** Detailed player profiles including market values, physical stats, and transfer histories.
*   **Fixture Insights:** Deep dive into match events, advanced stats (xG, big chances, shots on target), and individual goalkeeper performances.
*   **Data Pipelines:** Built-in scripts to parse and import raw `.xlsx` football statistics directly into the relational database.

---

## 🚀 Getting Started

To get the platform running locally, follow these steps. 

### 1. Clone the repository
```bash
git clone https://github.com/emir366/MatchChase.git
cd MatchChase
```

### 2. Configure and Start the Backend
This project is currently archived and does not come with a live database. To run the backend, you must connect it to your own PostgreSQL database.

1. **Setup Database:** Install PostgreSQL and create a database (e.g., `matchchase`).
2. **Environment Variables:** Create a `.env` file in the `backend/` directory and add your connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/matchchase"
   ```
3. **Run Migrations:** Generate the database tables using Prisma:
   ```bash
   cd backend
   npm install
   npx prisma db push
   ```
4. **Start the Server:**
   ```bash
   npm run dev
   ```
The backend server will start on `http://localhost:5000`.

### 3. Start the Frontend
Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start, typically at `http://localhost:5173`.

---

## 📂 Project Structure

```text
MatchChase/
├── backend/
│   ├── prisma/             # Prisma schema and database migrations
│   ├── routes/             # Express API route handlers (clubs, fixtures, leagues, etc.)
│   ├── scripts/            # Database utility scripts
│   ├── .env                # Environment variables (Database URL)
│   ├── server.js           # Main Express server entry point
│   ├── import_excel.mjs    # Scripts to seed the DB from raw datasets
│   └── package.json        # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components (Tables, Navbars)
│   │   ├── pages/          # Full page views (ClubPage, FixtureDetailPage, etc.)
│   │   ├── services/       # API connection utilities
│   │   ├── App.jsx         # Main React application shell
│   │   └── main.jsx        # React DOM rendering entry
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite build and proxy configuration
│   └── package.json        # Frontend dependencies
│
└── .gitignore              # Global git ignore rules (Blocks .env, .xlsx, .DS_Store)
```

---

## 📊 Data Import Scripts

If you are a contributor managing the database, the backend includes scripts to read `.xlsx` files and populate the database.
*   Place your target `.xlsx` files inside the `backend/` directory.
*   Run the relevant import scripts (e.g., `node new_fikstur_import.mjs`) to parse the data, resolve player names, calculate stats, and push them to the database via Prisma.

---

*Developed by [@emir366](https://github.com/emir366)*
