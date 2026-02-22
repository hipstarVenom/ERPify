import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import "./Login.css";
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Zap,
  AlertCircle,
  ArrowRight
} from "lucide-react";

const ROLE_META: Record<string, { label: string; Icon: any; color: string }> = {
  admin: { label: "Admin", Icon: ShieldCheck, color: "#6366f1" },
  faculty: { label: "Faculty", Icon: GraduationCap, color: "#0ea5e9" },
  student: { label: "Student", Icon: BookOpen, color: "#10b981" },
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detectedRole, setDetectedRole] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    setDetectedRole(null);

    try {
      const res = await API.post("/users/login", {
        email: email.trim(),
        password: password,
      });

      const user = res.data;
      setDetectedRole(user.role);

      // Brief pause so the user sees the detected role badge
      setTimeout(() => {
        login(user);
        navigate(`/${user.role}`);
      }, 900);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || "Invalid email or password.";
      setError(msg);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const roleMeta = detectedRole ? ROLE_META[detectedRole] : null;

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon"><Zap fill="currentColor" /></span>
          <span className="login-logo-text">ERPify</span>
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in with your email and password</p>

        <div className="login-form">
          {/* Email */}
          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. alice@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Role detection badge */}
          {detectedRole && roleMeta && (
            <div
              className="login-role-badge"
              style={{ borderColor: roleMeta.color, color: roleMeta.color }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}><roleMeta.Icon size={18} /></span>
              <span>
                Identified as <strong>{roleMeta.label}</strong> — signing you
                in…
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            id="loginBtn"
            className={`login-btn ${loading ? "login-btn--loading" : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                Sign In <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
