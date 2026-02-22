import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Moon,
  Sun,
  LogOut,
  Zap,
  BookOpen
} from "lucide-react";

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
          <span className="sidebar-brand-icon"><Zap fill="currentColor" /></span>
          <span className="sidebar-brand-name">ERPify</span>
        </div>

        <span className="sidebar-section-label">Student Portal</span>
        <nav className="sidebar-nav">
          <NavLink to="/student" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon"><LayoutDashboard /></span>
            Dashboard
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            <span className="sidebar-link-icon">
              {theme === "light" ? <Moon /> : <Sun />}
            </span>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
            <span className={`theme-toggle-track ${theme === "dark" ? "on" : ""}`}>
              <span className={`theme-toggle-thumb ${theme === "dark" ? "on" : ""}`} />
            </span>
          </button>
          <button className="erp-logout-btn" onClick={handleLogout}>
            <span className="sidebar-link-icon"><LogOut /></span>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="erp-main">
        <header className="erp-topbar">
          <span className="topbar-title">Student Portal</span>
          <span className="topbar-badge">
            <BookOpen size={14} style={{ marginRight: 6 }} />
            {user?.first_name ?? "Student"}
          </span>
        </header>
        <main className="erp-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
