# LOOP — AI Customer Feedback Intelligence Platform

LOOP is an AI-powered customer feedback intelligence platform that transforms scattered customer feedback into actionable insights.

It helps teams understand what customers are saying, identify recurring themes, analyze sentiment, ask questions about feedback using natural language, and generate evidence-backed customer voice reports.

---

## 🚀 Live Demo

**Production:**  
https://project-loop-ai-ten.vercel.app

**GitHub Repository:**  
https://github.com/Pradeeshh27/Project-LOOP

---

## 📌 Project Overview

Customer feedback is often distributed across multiple sources and can be difficult to analyze manually.

LOOP brings customer feedback into one interface and provides:

- Feedback management
- Sentiment analysis
- Theme identification
- Feedback filtering and search
- AI-powered questions and answers
- Evidence-backed responses
- AI-generated customer voice reports
- Dashboard-level customer insights

The goal is to help product and customer teams move from raw feedback to clear, actionable insights.

---

## ✨ Key Features

### 🔐 Authentication

- Secure login interface
- Email and password authentication
- JWT-based authentication
- Protected application routes

### 📊 Dashboard

The dashboard provides an overview of customer feedback through:

- Total feedback
- Negative feedback percentage
- New feedback
- Active themes
- Feedback volume
- Sentiment breakdown

### 📥 Feedback Inbox

Users can explore customer feedback and filter it by:

- Channel
- Sentiment
- Status
- Theme
- Search keywords

Feedback status can also be updated as part of the workflow.

### 📈 Trends & Themes

LOOP organizes customer feedback into recurring themes and helps identify patterns across the dataset.

Examples include:

- Onboarding
- Dashboard
- Mobile Experience
- Billing
- Security
- Search
- Export
- Documentation
- Performance

### 🤖 Ask LOOP

Ask LOOP allows users to ask natural-language questions about customer feedback.

Example:

> What are the main complaints?

LOOP analyzes relevant feedback and returns an answer supported by customer feedback evidence.

The response also displays the underlying feedback used to generate the answer.

### 📄 Customer Voice Reports

The Reports section generates an AI-assisted customer voice report containing:

- Top theme
- Overall sentiment
- Key customer signal
- Key customer themes
- Recommended actions

The report is generated from the current customer feedback dataset.

---

## 🧠 AI Functionality

LOOP uses AI to turn customer feedback into useful summaries and insights.

### Ask LOOP

The system:

1. Receives the user's question.
2. Loads customer feedback.
3. Identifies relevant feedback.
4. Uses sentiment and keyword relevance.
5. Provides the relevant feedback as context to the AI.
6. Generates an answer based on the available evidence.
7. Displays supporting customer feedback.

### Customer Voice Report

The report workflow:

1. Loads the customer feedback dataset.
2. Provides the feedback as context to the AI.
3. Requests a structured customer voice report.
4. Parses the generated response.
5. Displays the report in a structured interface.

The AI prompts are designed to reduce unsupported claims by instructing the system to use the provided customer feedback as evidence.

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- REST APIs
- JWT authentication
- bcrypt/bcryptjs authentication utilities

### AI

- AI-powered natural-language feedback analysis
- AI-generated customer voice reports

### Deployment

- Vercel

### Development Tools

- Visual Studio Code
- Git
- GitHub

---

## 🏗️ Project Structure

```text
Project-LOOP/
│
├── backend/
│   ├── server.js
│   ├── feedback.json
│   ├── users.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── README.md
├── vercel.json
└── .gitignore