# Portfolio Backend API (Node.js + Express + TypeScript)

High-performance, secure REST API backend powering the personal developer portfolio.

## Features
- **Profile & Bio API**: Detailed profile metadata, metrics, bio, and social links.
- **Projects Showcase API**: Filterable by category, featured highlights, and performance metrics.
- **Skills Matrix API**: Categorized technology stacks with animated proficiency scoring.
- **Experience Timeline API**: Detailed career milestones, responsibilities, and achievements.
- **Interactive Contact Gateway**: Input validation via Zod, rate-limiting via Express Rate Limit, and persistent message queuing.
- **Security**: Hardened with Helmet, CORS controls, and sanitized error middleware.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development
```bash
npm run dev
```
Runs the API server on `http://localhost:5001` with hot reload via `tsx`.

### 3. Build & Run in Production
```bash
npm run build
npm start
```
