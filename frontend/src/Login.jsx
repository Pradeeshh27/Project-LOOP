import { useState } from "react";

const API_URL = "";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
    const response = await fetch(`${API_URL}/auth/login`, {     
       method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      localStorage.setItem("loopToken", data.token);

      localStorage.setItem(
        "loopUser",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f6fb",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "42px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "34px",
              fontWeight: "700",
              color: "#7566dc",
              letterSpacing: "-1px",
            }}
          >
            LOOP
          </h1>

          <p
            style={{
              marginTop: "10px",
              marginBottom: 0,
              color: "#716e80",
              fontSize: "15px",
            }}
          >
            AI Customer Feedback Intelligence
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#292735",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              border: "1px solid #dddbe7",
              borderRadius: "9px",
              fontSize: "14px",
              outline: "none",
              marginBottom: "20px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#292735",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              border: "1px solid #dddbe7",
              borderRadius: "9px",
              fontSize: "14px",
              outline: "none",
              marginBottom: "20px",
            }}
          />

          {error && (
            <div
              style={{
                background: "#fdebed",
                color: "#c94b5d",
                padding: "11px 13px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "18px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "9px",
              background: "#7566dc",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #eeeef3",
            textAlign: "center",
            fontSize: "12px",
            color: "#8a8797",
          }}
        >
          Project LOOP
        </div>
      </div>
    </div>
  );
}

export default Login;