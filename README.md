# Project LOOP — AI Customer Feedback Intelligence Platform

Project LOOP is an AI-powered customer feedback intelligence platform designed to help teams collect, explore, analyze, and act on customer feedback from multiple channels.

The platform provides a centralized feedback dashboard with sentiment analysis, themes, filtering, feedback status management, an AI-powered "Ask LOOP" assistant, and customer voice report generation.

## Live Demo

Production URL:

https://project-loop-ai-ten.vercel.app

### Demo Login

Admin:

- Email: `admin2@loop.demo`
- Password: `Admin@123`

Other seeded roles:

- Manager: `manager@loop.demo`
- Analyst: `analyst@loop.demo`

> Demo credentials are provided for evaluation purposes.

---

## Features

### Authentication

- JWT-based authentication
- Role-based users
- Admin, Manager, and Analyst roles
- Protected API endpoints

### Feedback Dashboard

- View customer feedback
- Pagination
- Search feedback
- Filter by:
  - Channel
  - Sentiment
  - Status
  - Theme
- View feedback statistics
- Update feedback status

### Customer Feedback Intelligence

- Positive, Neutral, and Negative sentiment tracking
- Theme analysis
- Top feedback themes
- Feedback volume tracking
- Summary statistics

### Ask LOOP

Ask natural-language questions about customer feedback.

Examples:

- "What are the main complaints?"
- "What do customers like?"
- "What are the biggest problems?"
- "Which areas need improvement?"

LOOP retrieves relevant feedback and provides an evidence-based response.

### Generate Report

The Generate Report feature creates a customer voice report containing:

- Top theme
- Overall sentiment
- Key customer signal
- Major feedback themes
- Recommended actions

The report is generated from the seeded customer feedback dataset.

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- JWT
- bcrypt / bcryptjs
- REST APIs

### AI

- LOOP AI feedback analysis
- Local Ollama integration for development
- Rule-based customer voice report generation for the production deployment

### Deployment

- Vercel
- GitHub

---

## Project Structure

```text
Project-LOOP/
│
├── backend/
│   ├── server.js
│   ├── users.json
│   ├── feedback.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── vercel.json
├── .gitignore
└── README.md