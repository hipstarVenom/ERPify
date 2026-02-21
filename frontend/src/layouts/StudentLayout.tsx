import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function StudentLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="erp-shell">
      <aside className="erp-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">⚡</span>
          <span className="sidebar-brand-name">ERPify</span>
        </div>

        <span className="sidebar-section-label">Student Portal</span>
        <nav className="sidebar-nav">
          <a className="sidebar-link active">
            <span className="sidebar-link-icon">📊</span>
            Dashboard
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <span className="sidebar-link-icon">{theme === "light" ? "🌙" : "☀️"}</span>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
            <span className={`theme-toggle-track ${theme === "dark" ? "on" : ""}`}>
              <span className={`theme-toggle-thumb ${theme === "dark" ? "on" : ""}`} />
            </span>
          </button>
          <button className="erp-logout-btn" onClick={handleLogout}>
            <span className="sidebar-link-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="erp-main">
        <header className="erp-topbar">
          <span className="topbar-title">📊 Student Dashboard</span>
          <span className="topbar-badge">📚 {user?.first_name ?? "Student"}</span>
        </header>
        <main className="erp-content">
          <div className="erp-stats-grid">
            <div className="erp-stat-card">
              <div className="stat-icon">👋</div>
              <div className="stat-value">Welcome</div>
              <div className="stat-label">{user?.first_name} {user?.last_name}</div>
              <div className="stat-trend">✓ Logged in as Student</div>
            </div>
          </div>
          <div className="erp-card">
            <div className="card-header">
              <span className="card-title">
                <span className="card-title-icon">📋</span>
                My Courses
              </span>
            </div>
            <div className="erp-empty">
              <div className="erp-empty-icon">📭</div>
              <div className="erp-empty-text">No courses assigned yet</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}