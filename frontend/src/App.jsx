import { useEffect, useMemo, useState } from "react";
import Login from "./Login";

const API_URL = "/api";
function App() {
const [isLoggedIn, setIsLoggedIn] = useState(
  !!localStorage.getItem("loopToken")
);

const handleLogin = () => {
  setIsLoggedIn(true);
};
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [status, setStatus] = useState("All");
  const [showAddFeedback, setShowAddFeedback] = useState(false);

  const [newFeedbackText, setNewFeedbackText] = useState("");
  const [newFeedbackChannel, setNewFeedbackChannel] = useState("Support");
  const [newFeedbackTheme, setNewFeedbackTheme] = useState("General");
  const [newFeedbackSentiment, setNewFeedbackSentiment] = useState("Neutral");
 const handleAddFeedback = async () => {
  if (!newFeedbackText.trim()) {
    alert("Please enter customer feedback.");
    return;
  }

  const token = localStorage.getItem("loopToken");

  if (!token) {
    alert("Please log in first.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: newFeedbackText,
        channel: newFeedbackChannel,
        theme: newFeedbackTheme,
        sentiment: newFeedbackSentiment,
        status: "NEW",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to add feedback");
    }

    alert("Feedback added successfully!");

    setNewFeedbackText("");
    setNewFeedbackChannel("Support");
    setNewFeedbackTheme("General");
    setNewFeedbackSentiment("Neutral");
    setShowAddFeedback(false);

    window.location.reload();
  } catch (error) {
    console.error("Add feedback error:", error);
    alert("Could not add feedback. Please try again.");
  }
};

  const [theme, setTheme] = useState("All");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [themeFeedback, setThemeFeedback] = useState([]);
  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [report, setReport] = useState("");
  const [backendStatus, setBackendStatus] = useState("Checking...");

  const [summary, setSummary] = useState({
  totalFeedback: 0,
  positive: 0,
  neutral: 0,
  negative: 0,
  negativePercentage: 0,
  activeThemes: 0,
  newThisWeek: 0,
  topThemes: [],
});
 
  useEffect(() => {
  fetch(`${API_URL}/health`)
    .then((response) => response.json())
    .then((data) => {
      setBackendStatus(data.status === "ok" ? "Connected" : "Error");
    })
    .catch(() => {
      setBackendStatus("Offline");
    });
}, []);

useEffect(() => {
  const token = localStorage.getItem("loopToken");

  if (!token) {
    console.error("No login token found.");
    return;
  }

  console.log("SUMMARY TOKEN:", token);

  fetch(`${API_URL}/feedback/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load summary: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      setSummary(data);
    })
    .catch((error) => {
      console.error("Failed to load summary:", error);
    });
}, []);


useEffect(() => {
  const token = localStorage.getItem("loopToken");

  fetch(
    `${API_URL}/feedback?page=${currentPage}&limit=10&channel=${channel === "All" ? "" : channel}&sentiment=${sentiment === "All" ? "" : sentiment}&status=${status === "All" ? "" : status}&theme=${theme === "All" ? "" : theme}&search=${encodeURIComponent(search)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load feedback");
      }

      return data;
    })
    .then((data) => {
      setFeedback(data.data || []);
      setTotalPages(data.totalPages || 1);
    })
    .catch((error) => {
      console.error("Failed to load feedback:", error);
      setFeedback([]);
      setTotalPages(1);
    });
}, [currentPage, search, channel, sentiment, status, theme]);

useEffect(() => {
  if (!selectedTheme) {
    setThemeFeedback([]);
    return;
  }

  const token = localStorage.getItem("loopToken");

  fetch(
    `${API_URL}/feedback?limit=100&theme=${encodeURIComponent(
      selectedTheme
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load theme feedback: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      setThemeFeedback(data.data || []);
    })
    .catch((error) => {
      console.error("Failed to load theme feedback:", error);
      setThemeFeedback([]);
    });
}, [selectedTheme]);

const themesData = [
  {
    name: "Onboarding",
    count: 82,
    change: "+24%",
    description: "Customers are discussing setup and inviting teammates.",
    spike: true,
  },
  {
    name: "Performance",
    count: 68,
    change: "+18%",
    description: "Feedback around speed, loading and overall performance.",
    spike: true,
  },
  {
    name: "Dashboard",
    count: 57,
    change: "+9%",
    description: "Customers are talking about dashboard usability and design.",
    spike: false,
  },
  {
    name: "Mobile Experience",
    count: 43,
    change: "+15%",
    description: "Requests and complaints about the mobile experience.",
    spike: true,
  },
  {
    name: "Billing",
    count: 31,
    change: "-4%",
    description: "Questions and issues related to invoices and billing.",
    spike: false,
  },
  {
    name: "Security",
    count: 26,
    change: "+11%",
    description: "Requests around SSO and account security.",
    spike: true,
  },
];

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Feedback Inbox", icon: "▤" },
    { name: "Trends & Themes", icon: "◈" },
    { name: "Ask LOOP", icon: "✦" },
    { name: "Reports", icon: "▥" },
  ];

const handleLogout = () => {
  localStorage.removeItem("loopToken");
  window.location.reload();
};

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#f7f7fb",
      color: "#17172b",
      fontFamily:
        "Inter, Arial, sans-serif",
      display: "flex",
    },

    sidebar: {
      width: "245px",
      background: "#17152b",
      color: "#fff",
      padding: "28px 18px",
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      bottom: 0,
      left: 0,
    },

    logo: {
      fontSize: "25px",
      fontWeight: "800",
      letterSpacing: "-1px",
      padding: "0 14px",
    },

    tagline: {
      fontSize: "11px",
      color: "#9994c9",
      padding: "0 14px",
      marginTop: "8px",
      marginBottom: "35px",
      lineHeight: "1.8",
    },

    nav: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
    },

    navButton: {
      border: "none",
      background: "transparent",
      color: "#aaa7c3",
      padding: "13px 14px",
      borderRadius: "10px",
      textAlign: "left",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    content: {
      marginLeft: "245px",
      width: "calc(100% - 245px)",
      minHeight: "100vh",
    },

    header: {
      height: "78px",
      background: "#fff",
      borderBottom: "1px solid #e8e7ef",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 38px",
    },

    workspace: {
      fontSize: "13px",
      color: "#6f6d7e",
    },

    user: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "13px",
      fontWeight: "600",
    },

    avatar: {
      width: "35px",
      height: "35px",
      borderRadius: "50%",
      background: "#6655d8",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
    },

    main: {
      padding: "34px 38px 60px",
    },

    title: {
      fontSize: "30px",
      margin: 0,
      letterSpacing: "-1px",
    },

    subtitle: {
      color: "#777587",
      fontSize: "14px",
      marginTop: "8px",
      marginBottom: "28px",
    },

    stats: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",
      marginBottom: "22px",
    },

    card: {
      background: "#fff",
      border: "1px solid #e9e8ef",
      borderRadius: "14px",
      padding: "22px",
      boxSizing: "border-box",
    },

    statLabel: {
      color: "#777587",
      fontSize: "12px",
      marginBottom: "12px",
    },

    statValue: {
      fontSize: "28px",
      fontWeight: "750",
    },

    statChange: {
      fontSize: "11px",
      color: "#6655d8",
      marginTop: "8px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: "20px",
      marginBottom: "22px",
    },

    cardTitle: {
      margin: 0,
      fontSize: "16px",
    },

    cardSub: {
      fontSize: "12px",
      color: "#858391",
      marginTop: "5px",
      marginBottom: "20px",
    },

    chart: {
      height: "210px",
      display: "flex",
      alignItems: "end",
      gap: "12px",
      padding: "10px 5px 0",
      borderBottom: "1px solid #ecebf1",
    },

    bar: {
      flex: 1,
      background: "#7566dc",
      borderRadius: "6px 6px 0 0",
    },

    sentimentRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "20px",
    },

    sentimentCircle: {
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      fontSize: "12px",
    },

    themeRow: {
      marginBottom: "17px",
    },

    themeTop: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "12px",
      marginBottom: "7px",
    },

    progress: {
      height: "7px",
      background: "#ecebf5",
      borderRadius: "20px",
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      background: "#7566dc",
      borderRadius: "20px",
    },

    tableCard: {
      background: "#fff",
      border: "1px solid #e9e8ef",
      borderRadius: "14px",
      overflow: "hidden",
    },

    tableHeader: {
      padding: "20px 22px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "12px",
    },

    th: {
      background: "#f8f7fb",
      color: "#777587",
      textAlign: "left",
      padding: "12px 18px",
      borderTop: "1px solid #eeeef3",
      borderBottom: "1px solid #eeeef3",
    },

    td: {
      padding: "15px 18px",
      borderBottom: "1px solid #f0eff4",
      verticalAlign: "top",
    },

    badge: {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: "20px",
      fontSize: "10px",
      fontWeight: "700",
    },

    button: {
      border: "none",
      background: "#6655d8",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    },

    filters: {
      background: "#fff",
      border: "1px solid #e9e8ef",
      borderRadius: "14px",
      padding: "18px",
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr",
      gap: "12px",
      marginBottom: "18px",
    },

    input: {
      width: "100%",
      padding: "11px 13px",
      border: "1px solid #dedde7",
      borderRadius: "8px",
      fontSize: "12px",
      boxSizing: "border-box",
      outline: "none",
      background: "#fff",
    },

    select: {
      width: "100%",
      padding: "11px 13px",
      border: "1px solid #dedde7",
      borderRadius: "8px",
      fontSize: "12px",
      boxSizing: "border-box",
      background: "#fff",
    },

    inboxTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
        trendGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
      marginBottom: "22px",
    },

    themeCard: {
      background: "#fff",
      border: "1px solid #e9e8ef",
      borderRadius: "14px",
      padding: "20px",
      cursor: "pointer",
    },

    themeName: {
      fontSize: "15px",
      fontWeight: "700",
      marginBottom: "8px",
    },

    themeCount: {
      fontSize: "27px",
      fontWeight: "750",
      marginBottom: "4px",
    },

    themeDescription: {
      fontSize: "11px",
      color: "#858391",
      lineHeight: "1.5",
      minHeight: "34px",
    },

    spikeBadge: {
      display: "inline-block",
      marginTop: "14px",
      padding: "5px 9px",
      borderRadius: "20px",
      background: "#eeeafe",
      color: "#6655d8",
      fontSize: "10px",
      fontWeight: "700",
    },

    trendBars: {
      height: "230px",
      display: "flex",
      alignItems: "end",
      gap: "15px",
      padding: "20px 10px 0",
      borderBottom: "1px solid #ecebf1",
    },

    trendBar: {
      flex: 1,
      background: "#7566dc",
      borderRadius: "6px 6px 0 0",
    },

    selectedThemeHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "22px",
    },
  };

  const sentimentStyle = (value) => {
    if (value === "Positive") {
      return {
        background: "#e8f7ef",
        color: "#278552",
      };
    }

    if (value === "Negative") {
      return {
        background: "#fdebed",
        color: "#c94b5d",
      };
    }

    return {
      background: "#f1f0f7",
      color: "#716e80",
    };
  };

 const changeStatus = async (id, currentStatus) => {
  const token = localStorage.getItem("loopToken");

  if (!token) {
    alert("Please log in first.");
    return;
  }

  const nextStatus = {
    NEW: "REVIEWED",
    REVIEWED: "ACTIONED",
    ACTIONED: "NEW",
  };

  const newStatus = nextStatus[currentStatus];

  try {
    const response = await fetch(
  `${API_URL}/feedback/${id}/status`,
  {
    method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update status");
    }

    setFeedback((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: newStatus }
          : item
      )
    );
  } catch (error) {
    console.error("Status update error:", error);
    alert(error.message || "Could not update feedback status.");
  }
};
const askLoop = async () => {
  if (!question.trim()) return;

  const token = localStorage.getItem("loopToken");

  if (!token) {
    alert("Please log in first.");
    return;
  }

  setAnswer("LOOP is thinking...");
  setSources([]);

  try {
    const token = localStorage.getItem("loopToken");

const response = await fetch(`${API_URL}/ai/ask`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
      body: JSON.stringify({
        question: question.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to ask LOOP");
    }

    setAnswer(data.answer);
    setSources(data.sources || []);
  } catch (error) {
    console.error("Ask LOOP error:", error);
    setAnswer("Sorry, LOOP could not process your question.");
    setSources([]);
  }
};

const generateReport = async () => {
  const token = localStorage.getItem("loopToken");

  if (!token) {
    alert("Please log in first.");
    return;
  }

  setReportGenerated(true);

  try {
    const response = await fetch(`${API_URL}/ai/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        feedback: feedback,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate report");
    }

    setReport(data.report);
  } catch (error) {
    console.error("Report generation error:", error);
    setReport(
      "Sorry, LOOP could not generate the customer voice report."
    );
  }
};

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const matchesSearch =
        item.text.toLowerCase().includes(search.toLowerCase()) ||
        item.theme.toLowerCase().includes(search.toLowerCase());

      const matchesChannel =
        channel === "All" || item.channel === channel;

      const matchesSentiment =
        sentiment === "All" || item.sentiment === sentiment;

      const matchesStatus =
        status === "All" || item.status === status;

        const matchesTheme =
  theme === "All" || item.theme === theme;

     return (
  matchesSearch &&
  matchesChannel &&
  matchesSentiment &&
  matchesStatus &&
  matchesTheme
);
    });
}, [feedback, search, channel, sentiment, status, theme]);

const totalFeedback = summary.totalFeedback;

const negativeFeedback = summary.negative;

const positiveFeedback = summary.positive;

const negativePercentage = summary.negativePercentage;

const activeThemes = summary.activeThemes;

const newThisWeek = summary.newThisWeek;

const feedbackVolume = summary.totalFeedback;

const themeCounts = {};

feedback.forEach((item) => {
  themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1;
});

const topThemes = summary.topThemes;

if (!isLoggedIn) {
  return <Login onLogin={() => setIsLoggedIn(true)} />;
}

  return (
    <div style={styles.app}>
    <div
  style={{
    position: "fixed",
    top: "18px",
    right: "120px",
    fontSize: "13px",
    color: backendStatus === "Connected" ? "#16a34a" : "#dc2626",
    fontWeight: "600",
  }}
>
  Backend: {backendStatus}
</div>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>LOOP</div>

        <div style={styles.tagline}>
          CUSTOMER FEEDBACK
          <br />
          INTELLIGENCE
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => ( 
  <button 
    key={item.name} 
    onClick={() => setActivePage(item.name)} 
    style={{ 
      ...styles.navButton, 
      background: 
        activePage === item.name ? "#2a2747" : "transparent", 
      color: 
        activePage === item.name ? "#ffffff" : "#aaa7c3", 
    }} 
  > 
    <span>{item.icon}</span> 
    {item.name} 
  </button> 
))}

<button
  onClick={handleLogout}
  style={{
    ...styles.navButton,
    marginTop: "20px",
    color: "#aaa7c3",
  }}
>
  <span>↪</span>
  Logout
</button>

</nav>

        <div
          style={{
            position: "absolute",
            bottom: "28px",
            left: "32px",
            color: "#777398",
            fontSize: "10px",
            lineHeight: "1.6",
          }}
        >
          LOOP v1.0
          <br />
          AI Customer Intelligence
        </div>
      </aside>

      <div style={styles.content}>
        <header style={styles.header}>
          <div style={styles.workspace}>
            Workspace / <strong>Acme Inc.</strong>
          </div>

          <div style={styles.user}>
            <span>Admin</span>
            <div style={styles.avatar}>A</div>
          </div>
        </header>

        <main style={styles.main}>
          <h1 style={styles.title}>{activePage}</h1>

          <p style={styles.subtitle}>
            Turn scattered customer feedback into evidence-backed insights.
          </p>
          
          {activePage === "Dashboard" && (
            <>
              <section style={styles.stats}>
                <div style={styles.card}>
                  <div style={styles.statLabel}>TOTAL FEEDBACK</div>
                  <div style={styles.statValue}>{totalFeedback}</div>
                  <div style={styles.statChange}>
                    ↑ 12.4% this month
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={styles.statLabel}>NEGATIVE FEEDBACK</div>
                 <div style={styles.statValue}>{negativePercentage}%</div>
                  <div style={styles.statChange}>
                    ↓ 3.2% from last month
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={styles.statLabel}>NEW THIS WEEK</div>
                 <div style={styles.statValue}>
  {newThisWeek}
</div>
                  <div style={styles.statChange}>
                    ↑ 8.7% this week
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={styles.statLabel}>ACTIVE THEMES</div>
                  <div style={styles.statValue}>{activeThemes}</div>
                  <div style={styles.statChange}>
                    6 trending
                  </div>
                </div>
              </section>

              <section style={styles.grid}>
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Feedback Volume</h2>
                  <div style={styles.cardSub}>
                    Customer feedback over the last 30 days
                  </div>

                  <div style={styles.chart}>
                    {[45, 70, 55, 82, 65, 92, 75, 88, 60, 96, 78, 85].map(
                      (height, index) => (
                        <div
                          key={index}
                          style={{
                            ...styles.bar,
                            height: `${height}%`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>

                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>
                    Sentiment Breakdown
                  </h2>

                  <div style={styles.cardSub}>
                    Overall customer sentiment
                  </div>

                  {[
  [
    totalFeedback > 0
      ? `${Math.round((positiveFeedback / totalFeedback) * 100)}%`
      : "0%",
    "Positive",
    `${positiveFeedback} feedback items`,
    "#e8f7ef",
    "#278552",
  ],
  [
    totalFeedback > 0
      ? `${Math.round(
          ((totalFeedback -
            positiveFeedback -
            negativeFeedback) /
            totalFeedback) *
            100
        )}%`
      : "0%",
    "Neutral",
    `${
      totalFeedback -
      positiveFeedback -
      negativeFeedback
    } feedback items`,
    "#f1f0f7",
    "#716e80",
  ],
  [
    `${negativePercentage}%`,
    "Negative",
    `${negativeFeedback} feedback items`,
    "#fdebed",
    "#c94b5d",
  ],
].map((item) => (
                    <div
                      style={styles.sentimentRow}
                      key={item[1]}
                    >
                      <div
                        style={{
                          ...styles.sentimentCircle,
                          background: item[3],
                          color: item[4],
                        }}
                      >
                        {item[0]}
                      </div>

                      <div>
                        <strong>{item[1]}</strong>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#888594",
                            marginTop: "5px",
                          }}
                        >
                          {item[2]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section style={styles.grid}>
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Top Themes</h2>

                  <div style={styles.cardSub}>
                    Most discussed customer topics
                  </div>

                 {topThemes.map(([theme, count]) => (
                    <div style={styles.themeRow} key={theme}>
                      <div style={styles.themeTop}>
                        <span>{theme}</span>
                        <small style={{ color: "#888594", marginLeft: "8px" }}>
  {count} feedback
</small>
                       <strong>
 {totalFeedback > 0
    ? ((count / totalFeedback) * 100).toFixed(1)
    : "0.0"}
  %
</strong>
                      </div>

                      <div style={styles.progress}>
                        <div
                          style={{
                            ...styles.progressFill,
width: `${
  totalFeedback > 0
    ? ((count / totalFeedback) * 100).toFixed(1)
    : "0.0"
}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Ask LOOP</h2>

                  <div style={styles.cardSub}>
                    Ask questions about your customer feedback.
                  </div>

                  <div
                    style={{
                      background: "#f8f7fb",
                      borderRadius: "10px",
                      padding: "15px",
                      fontSize: "12px",
                      color: "#686576",
                      marginBottom: "14px",
                    }}
                  >
                    “What are customers saying about onboarding?”
                  </div>

                  <button
                    style={styles.button}
                    onClick={() => setActivePage("Ask LOOP")}
                  >
                    Ask LOOP →
                  </button>
                </div>
              </section>

              <section style={styles.tableCard}>
                <div style={styles.tableHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      Recent Feedback
                    </h2>

                    <div style={styles.cardSub}>
                      Latest customer feedback received
                    </div>
                  </div>

                  <button
                    style={styles.button}
                    onClick={() => setActivePage("Feedback Inbox")}
                  >
                    View Inbox →
                  </button>
                </div>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>FEEDBACK</th>
                      <th style={styles.th}>CHANNEL</th>
                      <th style={styles.th}>SENTIMENT</th>
                      <th style={styles.th}>THEME</th>
                      <th style={styles.th}>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {feedback.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>{item.text}</td>
                        <td style={styles.td}>{item.channel}</td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              ...sentimentStyle(item.sentiment),
                            }}
                          >
                            {item.sentiment}
                          </span>
                        </td>

                        <td style={styles.td}>{item.theme}</td>

                        <td style={styles.td}>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {activePage === "Feedback Inbox" && (
            <>
              <div style={styles.inboxTop}>
                <div>
                  <strong>
                    {filteredFeedback.length} feedback items
                  </strong>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#858391",
                      marginTop: "5px",
                    }}
                  >
                    Search, filter and triage customer feedback.
                  </div>
                </div>

                <button
  style={styles.button}
  onClick={() => setShowAddFeedback(true)}
>
  + Add Feedback
</button>
              </div>

              <div style={styles.filters}>
              {showAddFeedback && (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e5e1f5",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    }}
  >
    <h3 style={{ marginTop: 0 }}>
      Add Customer Feedback
    </h3>

    <textarea
      placeholder="Enter customer feedback..."
      value={newFeedbackText}
      onChange={(e) => setNewFeedbackText(e.target.value)}
      style={{
        width: "100%",
        minHeight: "100px",
        padding: "14px",
        border: "1px solid #d9d6e8",
        borderRadius: "10px",
        fontSize: "15px",
        resize: "vertical",
        boxSizing: "border-box",
        marginBottom: "16px",
      }}
    />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginBottom: "18px",
      }}
    >
      <select
        value={newFeedbackChannel}
        onChange={(e) => setNewFeedbackChannel(e.target.value)}
        style={styles.select}
      >
        <option>Support</option>
        <option>App Store</option>
        <option>NPS Survey</option>
        <option>Sales Note</option>
        <option>Community</option>
      </select>

      <select
        value={newFeedbackTheme}
        onChange={(e) => setNewFeedbackTheme(e.target.value)}
        style={styles.select}
      >
        <option>General</option>
        <option>Onboarding</option>
        <option>Dashboard</option>
        <option>Mobile Experience</option>
        <option>Billing</option>
        <option>Security</option>
        <option>Search</option>
        <option>Export</option>
        <option>Documentation</option>
        <option>Performance</option>
      </select>

      <select
        value={newFeedbackSentiment}
        onChange={(e) => setNewFeedbackSentiment(e.target.value)}
        style={styles.select}
      >
        <option>Positive</option>
        <option>Neutral</option>
        <option>Negative</option>
      </select>
    </div>

    <div style={{ display: "flex", gap: "12px" }}>
      <button
        style={styles.button}
        onClick={handleAddFeedback}
      >
        Add Feedback
      </button>

      <button
        style={{
          ...styles.button,
          background: "#eeeef5",
          color: "#555",
        }}
        onClick={() => setShowAddFeedback(false)}
      >
        Cancel
      </button>
    </div>
  </div>
)}
                <input
                  style={styles.input}
                  placeholder="🔎 Search feedback..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  style={styles.select}
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option>All</option>
                  <option>Support</option>
                  <option>App Store</option>
                  <option>NPS Survey</option>
                  <option>Sales Note</option>
                  <option>Community</option>
                </select>

                <select
                  style={styles.select}
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                >
                  <option>All</option>
                  <option>Positive</option>
                  <option>Neutral</option>
                  <option>Negative</option>
                </select>

                <select
                  style={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>All</option>
                  <option>NEW</option>
                  <option>REVIEWED</option>
                  <option>ACTIONED</option>
                </select>

                <select
  style={styles.select}
  value={theme}
  onChange={(e) => setTheme(e.target.value)}
>
  <option>All</option>
  <option>Onboarding</option>
  <option>Dashboard</option>
  <option>Mobile Experience</option>
  <option>Billing</option>
  <option>Security</option>
  <option>Search</option>
  <option>Export</option>
  <option>Documentation</option>
  <option>Performance</option>
</select>
              </div>

              <section style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>FEEDBACK</th>
                      <th style={styles.th}>CHANNEL</th>
                      <th style={styles.th}>SENTIMENT</th>
                      <th style={styles.th}>THEME</th>
                      <th style={styles.th}>STATUS</th>
                      <th style={styles.th}>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredFeedback.length === 0 ? (
                      <tr>
                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                            padding: "40px",
                            color: "#858391",
                          }}
                          colSpan="6"
                        >
                          No feedback matches your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredFeedback.map((item) => (
                        <tr key={item.id}>
                          <td style={styles.td}>
                            <div
                              style={{
                                maxWidth: "430px",
                                lineHeight: "1.5",
                              }}
                            >
                              {item.text}
                            </div>
                          </td>

                          <td style={styles.td}>
                            {item.channel}
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                ...sentimentStyle(item.sentiment),
                              }}
                            >
                              {item.sentiment}
                            </span>
                          </td>

                          <td style={styles.td}>
                            {item.theme}
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                background: "#f1f0f7",
                                color: "#68647b",
                              }}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td style={styles.td}>
                            <button
                              style={{
                                ...styles.button,
                                padding: "7px 10px",
                              }}
                    onClick={() => changeStatus(item.id, item.status)}
                            >
                              Change
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  }}
>
  <button
    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
    disabled={currentPage === 1}
  >
    Previous
  </button>

  <span>
    Page {currentPage} of {totalPages}
  </span>

  <button
    onClick={() =>
      setCurrentPage((page) => Math.min(page + 1, totalPages))
    }
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>
              </section>
            </>
          )}

         {activePage === "Trends & Themes" && (
  <>
    {!selectedTheme ? (
      <>
        <div style={styles.inboxTop}>
          <div>
            <strong>Customer Themes</strong>

            <div
              style={{
                fontSize: "12px",
                color: "#858391",
                marginTop: "5px",
              }}
            >
              Discover what customers are talking about and identify
              emerging themes.
            </div>
          </div>

          <div
            style={{
              padding: "9px 13px",
              background: "#eeeafe",
              color: "#6655d8",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            6 TRENDING
          </div>
        </div>

        <section style={styles.trendGrid}>
          {themesData.map((theme) => (
            <div
              key={theme.name}
              style={styles.themeCard}
              onClick={() => setSelectedTheme(theme.name)}
            >
              <div style={styles.themeName}>
                {theme.name}
              </div>

              <div style={styles.themeCount}>
                {theme.count}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#858391",
                  marginBottom: "8px",
                }}
              >
                feedback items
              </div>

              <div style={styles.themeDescription}>
                {theme.description}
              </div>

              <span style={styles.spikeBadge}>
                {theme.spike
                  ? `↑ ${theme.change} SPIKING`
                  : `${theme.change} THIS PERIOD`}
              </span>
            </div>
          ))}
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Theme Volume Over Time
          </h2>

          <div style={styles.cardSub}>
            Feedback volume across recent periods
          </div>

          <div style={styles.trendBars}>
            {[35, 48, 42, 62, 57, 75, 68, 88, 72, 94, 82, 100].map(
              (height, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.trendBar,
                    height: `${height}%`,
                  }}
                />
              )
            )}
          </div>
        </section>
      </>
    ) : (
      <>
        <div style={styles.selectedThemeHeader}>
          <div>
            <button
              style={{
                ...styles.button,
                background: "#eeeafe",
                color: "#6655d8",
                marginBottom: "12px",
              }}
              onClick={() => setSelectedTheme(null)}
            >
              ← All Themes
            </button>

            <h2 style={styles.title}>
              {selectedTheme}
            </h2>

            <p style={styles.subtitle}>
              Feedback items associated with this theme.
            </p>
          </div>
        </div>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                {selectedTheme} Feedback
              </h2>

              <div style={styles.cardSub}>
                Customer feedback connected to this theme
              </div>
            </div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>FEEDBACK</th>
                <th style={styles.th}>CHANNEL</th>
                <th style={styles.th}>SENTIMENT</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>

            <tbody>
           {themeFeedback.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      {item.text}
                    </td>

                    <td style={styles.td}>
                      {item.channel}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...sentimentStyle(item.sentiment),
                        }}
                      >
                        {item.sentiment}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {item.status}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </>
    )}
  </>
)}

{activePage === "Ask LOOP" && (
  <section>
    <div
      style={{
        background: "#fff",
        border: "1px solid #e9e8ef",
        borderRadius: "14px",
        padding: "24px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "18px" }}>
        Ask LOOP
      </h2>

      <p
        style={{
          color: "#777587",
          fontSize: "12px",
          marginTop: "7px",
          marginBottom: "20px",
        }}
      >
        Ask questions about your customer feedback.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askLoop();
            }
          }}
          placeholder="Ask something about your customer feedback..."
          style={{
            ...styles.input,
            flex: 1,
          }}
        />

        <button
          style={styles.button}
          onClick={askLoop}
        >
          Ask LOOP
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {[
          "What are customers saying about onboarding?",
          "What are the main complaints?",
          "What do customers like about the dashboard?",
          "What issues are customers reporting?",
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setQuestion(suggestion)}
            style={{
              border: "1px solid #dedde7",
              background: "#fff",
              padding: "8px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              cursor: "pointer",
              color: "#5f5c70",
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>

    {answer && (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e9e8ef",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            fontSize: "15px",
          }}
        >
          LOOP Answer
        </h3>

        <p
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#4f4d5d",
          }}
        >
          {answer}
        </p>
      </div>
    )}

    {sources.length > 0 && (
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Evidence from Customer Feedback
            </h2>

            <div style={styles.cardSub}>
              Feedback used to generate this answer
            </div>
          </div>
        </div>

        <div style={{ padding: "0 22px 22px" }}>
          {sources.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "16px 0",
                borderBottom: "1px solid #f0eff4",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  marginBottom: "8px",
                }}
              >
                "{item.text}"
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  fontSize: "11px",
                  color: "#777587",
                }}
              >
                <span>{item.channel}</span>
                <span>•</span>
                <span>{item.theme}</span>
                <span>•</span>

                <span
                  style={{
                    ...styles.badge,
                    ...sentimentStyle(item.sentiment),
                  }}
                >
                  {item.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
)}

{activePage === "Reports" && (
  <section>
    <div
      style={{
        background: "#fff",
        border: "1px solid #e9e8ef",
        borderRadius: "14px",
        padding: "24px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "18px" }}>
        Voice-of-Customer Report
      </h2>

      <p
        style={{
          color: "#777587",
          fontSize: "12px",
          marginTop: "7px",
          marginBottom: "20px",
        }}
      >
        Generate an evidence-backed summary of customer feedback.
      </p>

      <button
  style={styles.button}
  onClick={generateReport}
  disabled={reportGenerated && !report}
>
  {reportGenerated && !report ? "Generating Report..." : "Generate Report"}
</button>
    </div>

   {reportGenerated && report && (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>
      Customer Voice — Monthly Report
    </h2>

    <div style={styles.cardSub}>
      Generated from the current customer feedback dataset
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        marginTop: "20px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          background: "#f8f7fb",
          padding: "18px",
          borderRadius: "10px",
        }}
      >
        <div style={styles.statLabel}>TOP THEME</div>
        <strong>{report.topTheme}</strong>
      </div>

      <div
        style={{
          background: "#f8f7fb",
          padding: "18px",
          borderRadius: "10px",
        }}
      >
        <div style={styles.statLabel}>SENTIMENT</div>
        <strong>{report.sentiment}</strong>
      </div>

      <div
        style={{
          background: "#f8f7fb",
          padding: "18px",
          borderRadius: "10px",
        }}
      >
        <div style={styles.statLabel}>KEY SIGNAL</div>
        <strong>{report.keySignal}</strong>
      </div>
    </div>

    <h3 style={{ fontSize: "14px" }}>
      Key Customer Themes
    </h3>
    

    <ul
  style={{
    fontSize: "13px",
    lineHeight: "1.8",
    color: "#555363",
    margin: "12px 0 0 0",
    paddingLeft: "20px",
    textAlign: "left",
  }}
>
  {report.themes?.map((theme, index) => (
    <li
      key={index}
      style={{
        marginBottom: "6px",
      }}
    >
      {theme}
    </li>
  ))}
</ul>

    <h3
      style={{
        fontSize: "14px",
        marginTop: "24px",
      }}
    >
      Recommended Actions
    </h3>

    <ul
  style={{
    fontSize: "13px",
    lineHeight: "1.8",
    color: "#555363",
    margin: "12px 0 0 0",
    paddingLeft: "20px",
    textAlign: "left",
  }}
>
  {report.actions?.map((action, index) => (
    <li
      key={index}
      style={{
        marginBottom: "6px",
      }}
    >
      {action}
    </li>
  ))}
</ul>
</div>
)}
</section>
)}
</main>
</div>
</div>
);
}

export default App;

