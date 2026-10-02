require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
const cors = require("cors");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

// LOOP feedback storage
const feedbackFile = path.join(__dirname, "feedback.json");

let addedFeedback = [];
let statusOverrides = {};

if (fs.existsSync(feedbackFile)) {
  try {
    const savedData = JSON.parse(fs.readFileSync(feedbackFile, "utf8"));
    addedFeedback = savedData.addedFeedback || [];
    statusOverrides = savedData.statusOverrides || {};
  } catch (error) {
    console.error("Could not load feedback storage:", error);
  }
}

function saveFeedbackStorage() {
  // Vercel serverless functions do not provide
  // a persistent writable project filesystem.
  if (process.env.VERCEL) {
    return;
  }

  try {
    fs.writeFileSync(
      feedbackFile,
      JSON.stringify(
        {
          addedFeedback,
          statusOverrides,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Could not save feedback storage:", error);
  }
}

const usersFile = path.join(__dirname, "users.json");
const JWT_SECRET = process.env.JWT_SECRET;

function loadUsers() {
  return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, JWT_SECRET);

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}

app.use(cors());
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Project LOOP backend is running",
  });
});

// Authentication - Login
app.post("/api/auth/login", async (req, res) => {
      try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const users = loadUsers();

    console.log("Users:", users);
    console.log("Login email:", email);
    const user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
      },
    });
  } catch (error) {
console.error("Login error:", error.stack || error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "LOOP API",
  });
});

app.get("/api/feedback/summary", (req, res) => {
  const feedback = [
    // original 5 records
  ];

  const templates = [
    ["Onboarding", "Support", "Negative", "The onboarding process was confusing and took too long."],
    ["Onboarding", "NPS Survey", "Negative", "I had trouble understanding how to invite my teammates."],
    ["Onboarding", "Community", "Neutral", "Setup was okay, but the onboarding guide could be clearer."],
    ["Dashboard", "App Store", "Positive", "The dashboard loads quickly and is easy to understand."],
    ["Dashboard", "Support", "Positive", "The redesigned dashboard is much easier to navigate."],
    ["Dashboard", "NPS Survey", "Neutral", "The dashboard is useful but could offer more customization."],
    ["Mobile Experience", "App Store", "Negative", "The mobile experience feels slow compared with desktop."],
["Mobile Experience", "Support", "Negative", "Some buttons are difficult to use on a phone."],
["Mobile Experience", "NPS Survey", "Neutral", "The mobile layout works but needs some improvements."],
    ["Billing", "Support", "Negative", "The billing page sometimes takes too long to load."],
    ["Billing", "Support", "Negative", "I had trouble downloading my invoice."],
    ["Billing", "NPS Survey", "Neutral", "Billing information could be easier to find."],
    ["Security", "Sales Note", "Negative", "The customer asked for SSO before moving forward."],
    ["Security", "Support", "Positive", "The security controls give our team confidence."],
    ["Security", "NPS Survey", "Neutral", "More security documentation would be helpful."],
    ["Search", "App Store", "Positive", "Search is much faster after the latest update."],
    ["Search", "Support", "Neutral", "Search works well but could handle more filters."],
    ["Export", "Community", "Positive", "The export feature saved me a lot of time."],
    ["Export", "Support", "Positive", "Exporting reports is simple and reliable."],
    ["Documentation", "Community", "Neutral", "The API documentation needs more examples."],
    ["Documentation", "Support", "Negative", "I could not find the documentation for this feature."],
    ["Performance", "App Store", "Positive", "The application feels noticeably faster."],
    ["Performance", "Support", "Negative", "Some pages still take too long to load."],
    ["Performance", "NPS Survey", "Neutral", "Performance is good most of the time."],
  ];

  for (let i = 6; i <= 125; i++) {
    const template = templates[(i - 6) % templates.length];

feedback.push({
  id: i,
  text: template[3],
  channel: template[1],
  sentiment: template[2],
  theme: template[0],
  status: i % 3 === 0 ? "ACTIONED" : i % 2 === 0 ? "REVIEWED" : "NEW",
  workspaceId: "WS-001",
});
  }

  const totalFeedback = feedback.length;

  const positive = feedback.filter(
    (item) => item.sentiment === "Positive"
  ).length;

  const neutral = feedback.filter(
    (item) => item.sentiment === "Neutral"
  ).length;
const negative = feedback.filter(
  (item) => item.sentiment === "Negative"
).length;

const now = new Date();

const newThisWeek = 11;

const themes = {};

  feedback.forEach((item) => {
    themes[item.theme] = (themes[item.theme] || 0) + 1;
  });

  res.json({
  totalFeedback,
  positive,
  neutral,
  negative,
  negativePercentage:
    totalFeedback > 0
      ? Number(((negative / totalFeedback) * 100).toFixed(1))
      : 0,
  activeThemes: Object.keys(themes).length,
  newThisWeek,
  topThemes: Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5),
    });
});


app.get("/api/feedback", authenticateToken, (req, res) => {
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;

const channel = req.query.channel || "";
const sentiment = req.query.sentiment || "";
const status = req.query.status || "";
const theme = req.query.theme || "";
const search = req.query.search || "";

const feedback = [
{
  id: 1,
  text: "Onboarding took forever — I couldn't figure out how to invite my team.",
  channel: "Support",
  sentiment: "Negative",
  theme: "Onboarding",
  status: "NEW",
  workspaceId: "WS-001",
},
    {
      id: 2,
      text: "The new dashboard is gorgeous and finally fast. Huge improvement.",
      channel: "App Store",
      sentiment: "Positive",
      theme: "Dashboard",
      status: "REVIEWED",
      workspaceId: "WS-001",
    },
    {
      id: 3,
      text: "It does the job, but the mobile experience needs work.",
      channel: "NPS Survey",
      sentiment: "Neutral",
      theme: "Mobile Experience",
      status: "NEW",
      workspaceId: "WS-001",
    },
    {
      id: 4,
      text: "Prospect wants SSO before they'll sign — third time this month.",
      channel: "Sales Note",
      sentiment: "Negative",
      theme: "Security",
      status: "ACTIONED",
      workspaceId: "WS-001",
    },
    {
      id: 5,
      text: "Love the new export feature, saved me an hour today.",
      channel: "Community",
      sentiment: "Positive",
      theme: "Export",
      status: "REVIEWED",
      workspaceId: "WS-001",
    },
   ];

   const templates = [
  ["Onboarding", "Support", "Negative", "The onboarding process was confusing and took too long."],
  ["Onboarding", "NPS Survey", "Negative", "I had trouble understanding how to invite my teammates."],
  ["Onboarding", "Community", "Neutral", "Setup was okay, but the onboarding guide could be clearer."],
  ["Dashboard", "App Store", "Positive", "The dashboard loads quickly and is easy to understand."],
  ["Dashboard", "Support", "Positive", "The redesigned dashboard is much easier to navigate."],
  ["Dashboard", "NPS Survey", "Neutral", "The dashboard is useful but could offer more customization."],
  ["Mobile Experience", "App Store", "Negative", "The mobile experience feels slow compared with desktop."],
  ["Mobile Experience", "Support", "Negative", "Some buttons are difficult to use on a phone."],
  ["Mobile Experience", "NPS Survey", "Neutral", "The mobile layout works but needs some improvements."],
  ["Billing", "Support", "Negative", "The billing page sometimes takes too long to load."],
  ["Billing", "Support", "Negative", "I had trouble downloading my invoice."],
  ["Billing", "NPS Survey", "Neutral", "Billing information could be easier to find."],
  ["Security", "Sales Note", "Negative", "The customer asked for SSO before moving forward."],
  ["Security", "Support", "Positive", "The security controls give our team confidence."],
  ["Security", "NPS Survey", "Neutral", "More security documentation would be helpful."],
  ["Search", "App Store", "Positive", "Search is much faster after the latest update."],
  ["Search", "Support", "Neutral", "Search works well but could handle more filters."],
  ["Export", "Community", "Positive", "The export feature saved me a lot of time."],
  ["Export", "Support", "Positive", "Exporting reports is simple and reliable."],
  ["Documentation", "Community", "Neutral", "The API documentation needs more examples."],
  ["Documentation", "Support", "Negative", "I could not find the documentation for this feature."],
  ["Performance", "App Store", "Positive", "The application feels noticeably faster."],
  ["Performance", "Support", "Negative", "Some pages still take too long to load."],
  ["Performance", "NPS Survey", "Neutral", "Performance is good most of the time."],
];

for (let i = 6; i <= 125; i++) {
  const template = templates[(i - 6) % templates.length];

  feedback.push({
    id: i,
    text: template[3],
    channel: template[1],
    sentiment: template[2],
    theme: template[0],
    status: i % 3 === 0 ? "ACTIONED" : i % 2 === 0 ? "REVIEWED" : "NEW",
    workspaceId: "WS-001",
  });
}

// Include manually added feedback
feedback.push(...addedFeedback);

// Apply saved status changes
feedback.forEach((item) => {
  if (statusOverrides[item.id]) {
    item.status = statusOverrides[item.id];
  }
});

const filteredFeedback = feedback.filter((item) => {
const matchesWorkspace = true;
  const matchesChannel =
    !channel || item.channel === channel;

  const matchesSentiment =
    !sentiment || item.sentiment === sentiment;

  const matchesStatus =
    !status || item.status === status;

  const matchesTheme =
    !theme || item.theme === theme;

  const matchesSearch =
    !search ||
    item.text.toLowerCase().includes(search.toLowerCase()) ||
    item.theme.toLowerCase().includes(search.toLowerCase());

  return (
    matchesWorkspace &&
    matchesChannel &&
    matchesSentiment &&
    matchesStatus &&
    matchesTheme &&
    matchesSearch
  );
});



const start = (page - 1) * limit;
const paginatedFeedback = filteredFeedback.slice(
  start,
  start + limit
);

  res.json({
    data: paginatedFeedback,
    page,
    limit,
    total: filteredFeedback.length,
    totalPages: Math.ceil(filteredFeedback.length / limit),
  });
});


app.post("/api/feedback", authenticateToken, (req, res) => {
  try {
    const {
      text,
      channel = "Support",
      theme = "General",
      sentiment = "Neutral",
      status = "NEW",
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Feedback text is required",
      });
    }

    const allowedStatuses = ["NEW", "REVIEWED", "ACTIONED"];
    const allowedSentiments = ["Positive", "Neutral", "Negative"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    if (!allowedSentiments.includes(sentiment)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sentiment",
      });
    }

    const newFeedback = {
      id: `FB-${Date.now()}`,
      text: text.trim(),
      channel,
      theme,
      sentiment,
      status,
      workspaceId: req.user.workspaceId,
      date: new Date().toISOString(),
    };

    addedFeedback.push(newFeedback);
    saveFeedbackStorage();

    res.status(201).json({
      success: true,
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Add feedback error:", error);

    res.status(500).json({
      success: false,
      error: "Could not add feedback",
    });
  }
});


// Add a new customer feedback item
app.patch("/api/feedback/:id/status", authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ["NEW", "REVIEWED", "ACTIONED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    // Find the feedback item
    const feedback = [
      {
        id: 1,
        workspaceId: "WS-001",
      },
      {
        id: 2,
        workspaceId: "WS-001",
      },
      {
        id: 3,
        workspaceId: "WS-001",
      },
      {
        id: 4,
        workspaceId: "WS-001",
      },
      {
        id: 5,
        workspaceId: "WS-001",
      },
    ];

    // Check workspace ownership for the original feedback records
    const feedbackItem = feedback.find(
      (item) => String(item.id) === String(id)
    );

    if (feedbackItem) {
      if (feedbackItem.workspaceId !== req.user.workspaceId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    statusOverrides[id] = status;

    saveFeedbackStorage();

    res.json({
      success: true,
      id,
      status,
    });
  } catch (error) {
    console.error("Update feedback status error:", error);

    res.status(500).json({
      success: false,
      error: "Could not update feedback status",
    });
  }
});
app.post("/api/ai/ask", authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    // Build the same feedback dataset used by /api/feedback
    const feedback = [
      {
        id: 1,
        text: "Onboarding took forever — I couldn't figure out how to invite my team.",
        channel: "Support",
        sentiment: "Negative",
        theme: "Onboarding",
        status: "NEW",
        workspaceId: "WS-001",
      },
      {
        id: 2,
        text: "The new dashboard is gorgeous and finally fast. Huge improvement.",
        channel: "App Store",
        sentiment: "Positive",
        theme: "Dashboard",
        status: "REVIEWED",
        workspaceId: "WS-001",
      },
      {
        id: 3,
        text: "It does the job, but the mobile experience needs work.",
        channel: "NPS Survey",
        sentiment: "Neutral",
        theme: "Mobile Experience",
        status: "NEW",
        workspaceId: "WS-001",
      },
      {
        id: 4,
        text: "Prospect wants SSO before they'll sign — third time this month.",
        channel: "Sales Note",
        sentiment: "Negative",
        theme: "Security",
        status: "ACTIONED",
        workspaceId: "WS-001",
      },
      {
        id: 5,
        text: "Love the new export feature, saved me an hour today.",
        channel: "Community",
        sentiment: "Positive",
        theme: "Export",
        status: "REVIEWED",
        workspaceId: "WS-001",
      },
    ];

    const templates = [
      ["Onboarding", "Support", "Negative", "The onboarding process was confusing and took too long."],
      ["Onboarding", "NPS Survey", "Negative", "I had trouble understanding how to invite my teammates."],
      ["Onboarding", "Community", "Neutral", "Setup was okay, but the onboarding guide could be clearer."],
      ["Dashboard", "App Store", "Positive", "The dashboard loads quickly and is easy to understand."],
      ["Dashboard", "Support", "Positive", "The redesigned dashboard is much easier to navigate."],
      ["Dashboard", "NPS Survey", "Neutral", "The dashboard is useful but could offer more customization."],
      ["Mobile Experience", "App Store", "Negative", "The mobile experience feels slow compared with desktop."],
      ["Mobile Experience", "Support", "Negative", "Some buttons are difficult to use on a phone."],
      ["Mobile Experience", "NPS Survey", "Neutral", "The mobile layout works but needs some improvements."],
      ["Billing", "Support", "Negative", "The billing page sometimes takes too long to load."],
      ["Billing", "Support", "Negative", "I had trouble downloading my invoice."],
      ["Billing", "NPS Survey", "Neutral", "Billing information could be easier to find."],
      ["Security", "Sales Note", "Negative", "The customer asked for SSO before moving forward."],
      ["Security", "Support", "Positive", "The security controls give our team confidence."],
      ["Security", "NPS Survey", "Neutral", "More security documentation would be helpful."],
      ["Search", "App Store", "Positive", "Search is much faster after the latest update."],
      ["Search", "Support", "Neutral", "Search works well but could handle more filters."],
      ["Export", "Community", "Positive", "The export feature saved me a lot of time."],
      ["Export", "Support", "Positive", "Exporting reports is simple and reliable."],
      ["Documentation", "Community", "Neutral", "The API documentation needs more examples."],
      ["Documentation", "Support", "Negative", "I could not find the documentation for this feature."],
      ["Performance", "App Store", "Positive", "The application feels noticeably faster."],
      ["Performance", "Support", "Negative", "Some pages still take too long to load."],
      ["Performance", "NPS Survey", "Neutral", "Performance is good most of the time."],
    ];

    for (let i = 6; i <= 125; i++) {
      const template = templates[(i - 6) % templates.length];

      feedback.push({
        id: i,
        text: template[3],
        channel: template[1],
        sentiment: template[2],
        theme: template[0],
        status: i % 3 === 0 ? "ACTIONED" : i % 2 === 0 ? "REVIEWED" : "NEW",
        workspaceId: "WS-001",
      });
    }

    // Include manually added feedback
    feedback.push(...addedFeedback);

    // Apply saved status changes
    feedback.forEach((item) => {
      if (statusOverrides[item.id]) {
        item.status = statusOverrides[item.id];
      }
    });

    const questionLower = question.toLowerCase();

    const isComplaintQuestion =
      questionLower.includes("complaint") ||
      questionLower.includes("problem") ||
      questionLower.includes("issue") ||
      questionLower.includes("negative") ||
      questionLower.includes("pain point");

    const isPositiveQuestion =
      questionLower.includes("like") ||
      questionLower.includes("good") ||
      questionLower.includes("positive") ||
      questionLower.includes("love");

    const keywords = questionLower
      .split(/\s+/)
      .map((word) => word.replace(/[^a-z0-9]/g, ""))
      .filter((word) => word.length > 2);

    const scoredFeedback = feedback.map((item) => {
      const text =
        `${item.text} ${item.theme} ${item.sentiment} ${item.channel}`.toLowerCase();

      let score = 0;

      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          score += 1;
        }
      });

      if (isComplaintQuestion && item.sentiment === "Negative") {
        score += 5;
      }

      if (isPositiveQuestion && item.sentiment === "Positive") {
        score += 5;
      }

      return {
        ...item,
        score,
      };
    });

    const relevantFeedback = scoredFeedback
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const sources =
      relevantFeedback.length > 0
        ? relevantFeedback
        : feedback.slice(0, 10);

    // Generate a useful response without relying on Ollama or another external AI service.
    const negative = sources.filter(
      (item) => item.sentiment === "Negative"
    ).length;

    const positive = sources.filter(
      (item) => item.sentiment === "Positive"
    ).length;

    const themes = {};

    sources.forEach((item) => {
      themes[item.theme] = (themes[item.theme] || 0) + 1;
    });

    const topTheme = Object.entries(themes)
      .sort((a, b) => b[1] - a[1])[0];

    let answer;

    if (isComplaintQuestion || questionLower.includes("pain point")) {
      answer = `I found ${negative} negative feedback items among the most relevant results. The main area mentioned is ${topTheme ? topTheme[0] : "customer experience"}. Common concerns include usability, clarity, and performance.`;
    } else if (isPositiveQuestion) {
      answer = `I found ${positive} positive feedback items among the most relevant results. Customers particularly responded positively to areas such as ${topTheme ? topTheme[0] : "product improvements"}.`;
    } else {
      answer = `Based on the available customer feedback, the most relevant theme is ${topTheme ? topTheme[0] : "general feedback"}. I found ${sources.length} relevant feedback items, including ${positive} positive and ${negative} negative responses.`;
    }

    res.json({
      success: true,
      answer,
      sources,
    });
  } catch (error) {
    console.error("Ask LOOP error:", error);

    res.status(500).json({
      success: false,
      error: "LOOP could not process the question",
    });
  }
});

app.post("/api/ai/report", authenticateToken, async (req, res) => {
  try {
    const feedback = [
      {
        id: 1,
        text: "Onboarding took forever — I couldn't figure out how to invite my team.",
        channel: "Support",
        sentiment: "Negative",
        theme: "Onboarding",
        status: "NEW",
        workspaceId: "WS-001",
      },
      {
        id: 2,
        text: "The new dashboard is gorgeous and finally fast. Huge improvement.",
        channel: "App Store",
        sentiment: "Positive",
        theme: "Dashboard",
        status: "REVIEWED",
        workspaceId: "WS-001",
      },
      {
        id: 3,
        text: "It does the job, but the mobile experience needs work.",
        channel: "NPS Survey",
        sentiment: "Neutral",
        theme: "Mobile Experience",
        status: "NEW",
        workspaceId: "WS-001",
      },
      {
        id: 4,
        text: "Prospect wants SSO before they'll sign — third time this month.",
        channel: "Sales Note",
        sentiment: "Negative",
        theme: "Security",
        status: "ACTIONED",
        workspaceId: "WS-001",
      },
      {
        id: 5,
        text: "Love the new export feature, saved me an hour today.",
        channel: "Community",
        sentiment: "Positive",
        theme: "Export",
        status: "REVIEWED",
        workspaceId: "WS-001",
      },
    ];

    const templates = [
      ["Onboarding", "Support", "Negative", "The onboarding process was confusing and took too long."],
      ["Onboarding", "NPS Survey", "Negative", "I had trouble understanding how to invite my teammates."],
      ["Onboarding", "Community", "Neutral", "Setup was okay, but the onboarding guide could be clearer."],
      ["Dashboard", "App Store", "Positive", "The dashboard loads quickly and is easy to understand."],
      ["Dashboard", "Support", "Positive", "The redesigned dashboard is much easier to navigate."],
      ["Dashboard", "NPS Survey", "Neutral", "The dashboard is useful but could offer more customization."],
      ["Mobile Experience", "App Store", "Negative", "The mobile experience feels slow compared with desktop."],
      ["Mobile Experience", "Support", "Negative", "Some buttons are difficult to use on a phone."],
      ["Mobile Experience", "NPS Survey", "Neutral", "The mobile layout works but needs some improvements."],
      ["Billing", "Support", "Negative", "The billing page sometimes takes too long to load."],
      ["Billing", "Support", "Negative", "I had trouble downloading my invoice."],
      ["Billing", "NPS Survey", "Neutral", "Billing information could be easier to find."],
      ["Security", "Sales Note", "Negative", "The customer asked for SSO before moving forward."],
      ["Security", "Support", "Positive", "The security controls give our team confidence."],
      ["Security", "NPS Survey", "Neutral", "More security documentation would be helpful."],
      ["Search", "App Store", "Positive", "Search is much faster after the latest update."],
      ["Search", "Support", "Neutral", "Search works well but could handle more filters."],
      ["Export", "Community", "Positive", "The export feature saved me a lot of time."],
      ["Export", "Support", "Positive", "Exporting reports is simple and reliable."],
      ["Documentation", "Community", "Neutral", "The API documentation needs more examples."],
      ["Documentation", "Support", "Negative", "I could not find the documentation for this feature."],
      ["Performance", "App Store", "Positive", "The application feels noticeably faster."],
      ["Performance", "Support", "Negative", "Some pages still take too long to load."],
      ["Performance", "NPS Survey", "Neutral", "Performance is good most of the time."],
    ];

    for (let i = 6; i <= 125; i++) {
      const template = templates[(i - 6) % templates.length];

      feedback.push({
        id: i,
        text: template[3],
        channel: template[1],
        sentiment: template[2],
        theme: template[0],
        status: i % 3 === 0 ? "ACTIONED" : i % 2 === 0 ? "REVIEWED" : "NEW",
        workspaceId: "WS-001",
      });
    }

    feedback.push(...addedFeedback);

    feedback.forEach((item) => {
      if (statusOverrides[item.id]) {
        item.status = statusOverrides[item.id];
      }
    });

    const themeCounts = {};
    const sentimentCounts = {
      Positive: 0,
      Neutral: 0,
      Negative: 0,
    };

    feedback.forEach((item) => {
      themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1;

      if (sentimentCounts[item.sentiment] !== undefined) {
        sentimentCounts[item.sentiment]++;
      }
    });

    const topTheme = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])[0];

    const overallSentiment =
      sentimentCounts.Positive > sentimentCounts.Negative
        ? "Mostly Positive"
        : sentimentCounts.Negative > sentimentCounts.Positive
        ? "Mostly Negative"
        : "Mixed";

    const themes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([theme, count]) => `${theme} appears in ${count} customer feedback items.`);

    while (themes.length < 4) {
      themes.push("Additional customer feedback themes are being monitored.");
    }

    const negativeThemes = Object.entries(
      feedback
        .filter((item) => item.sentiment === "Negative")
        .reduce((acc, item) => {
          acc[item.theme] = (acc[item.theme] || 0) + 1;
          return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]);

    const actions = [
      "Prioritize improvements to the most frequently mentioned customer theme.",
      "Review negative feedback related to onboarding and usability.",
      "Continue monitoring security requests such as SSO.",
      "Maintain the improvements customers are responding positively to.",
    ];

    const keySignal =
      negativeThemes.length > 0
        ? `${negativeThemes[0][0]} is the most prominent negative-feedback theme.`
        : "Customer feedback shows several recurring product themes.";

    res.json({
      success: true,
      report: {
        topTheme: topTheme ? topTheme[0] : "General",
        sentiment: overallSentiment,
        keySignal,
        themes,
        actions,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);

    res.status(500).json({
      success: false,
      error: "LOOP could not generate the report",
    });
  }
});


app.listen(PORT, () => {
  console.log(`LOOP backend running at http://localhost:${PORT}`);
});