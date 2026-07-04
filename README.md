# CodeJourney – DSA & Interview Preparation Tracker

CodeJourney is a professional, dark-first MERN stack platform designed to help students organize, log, and optimize their Data Structures & Algorithms (DSA) and mock interview preparation.

🚀 **Live local port**: `http://localhost:5173`  
🔗 **GitHub Repository**: [CodeJourney-DSA-Interview-Preparation-Tracker](https://github.com/abhivadiyala26/CodeJourney-DSA-Interview-Preparation-Tracker)

---

## Key Core Features

1. **Problems Journal (CRUD)**: Log coding problems with platform tags, links, difficulty, logical approaches, concept notes, common pitfalls, and solution code blocks.
2. **AI Code Coach**: Powered by Google Gemini API (with fallback regex parser) to analyze space-time complexities, provide optimization suggestions, and recommend FAANG-level approaches.
3. **Interactive Dashboard**:
   * Streaks tracking (database-recalculated current and longest active streaks).
   * 365-day GitHub-style consistency heatmap.
   * Recharts analytics (difficulty splits donut, monthly solves bar graphs, topic-wise progress bars).
4. **Cheat Sheet Hub**: Split-screen Markdown editor with live HTML rendering for documenting algorithm templates.
5. **Mock Interview Feedback Log**: Tracks peer communication, problem-solving, and coding ratings with linked problem logs.
6. **Curated Lists Tracker**: Dynamically tracks Blind 75 and NeetCode 150 progress. Solved problems are checked off automatically.

---

## Technology Stack

* **Frontend**: React.js, Tailwind CSS v3, React Router v6, Axios, Recharts, Lucide Icons.
* **Backend**: Node.js, Express.js (MVC architecture), JWT Authentication, Bcrypt password hashing.
* **Database**: MongoDB Atlas, Mongoose (indexing-optimized).

---

## Production Security & Optimization Hardening

* **Database Indexing**: Compound indexing on `{ userId: 1, solvedDate: -1 }`, `{ userId: 1, status: 1 }`, and `{ userId: 1, topic: 1 }` inside [Problem Schema](backend/models/Problem.js) to guarantee fast aggregations.
* **HTTP Security Headers (Helmet)**: Restricts browser-level exploits conditionally (relaxed CSP in dev for HMR support).
* **API Rate Limiting**: Restricts global route limits to 100 reqs/15 mins, and sensitive auth/AI endpoints to 20 reqs/15 mins.
* **NoSQL Injection Protection**: Sanitizes query variables globally using `express-mongo-sanitize`.
* **Static Asset Hosting**: Serves the compiled React client directly from the Node backend in production for monolithic hosting.

---

## Getting Started Locally

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas connection URL (or local MongoDB running)

### 1. Environment Settings
Configure a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_jwt_signing_secret
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

### 2. Startup Command
Install all dependencies and spin up both dev servers concurrently from the root directory:
```bash
# Install all root, frontend, and backend packages
npm run install-all

# Run concurrently (Vite dev at 5173, Express dev at 5000)
npm run dev
```

---

## Production Deployment

This project contains root scripts supporting monolithic deployment to Render/Railway under a single Web Service.

1. **Deploy Target**: Render Web Service
2. **Root Directory**: `.`
3. **Build Command**: `npm run build` *(installs all dependencies and compiles frontend)*
4. **Start Command**: `npm start` *(starts Node backend which hosts the React static assets)*
5. **Required Env Variables**: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `VITE_API_URL=/api`.
