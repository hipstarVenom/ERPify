import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  ClipboardCheck,
  History,
  GraduationCap,
  Moon,
  Sun,
  LogOut,
  Zap,
  User
} from "lucide-react";

export default function FacultyLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="erp-shell">
      {/* Sidebar */}
      <aside className="erp-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon"><Zap fill="currentColor" /></span>
          <span className="sidebar-brand-name">ERPify</span>
        </div>

        <span className="sidebar-section-label">Faculty Portal</span>
        <nav className="sidebar-nav">
          <NavLink to="/faculty" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon"><LayoutDashboard /></span>
            Dashboard
          </NavLink>
          <NavLink to="/faculty/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon"><ClipboardCheck /></span>
            Mark Attendance
          </NavLink>
          <NavLink to="/faculty/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon"><History /></span>
            Attendance History
          </NavLink>
          <NavLink to="/faculty/grades" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon"><GraduationCap /></span>
            Grade Evaluation
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

      {/* Main */}
      <div className="erp-main">
        <header className="erp-topbar">
          <span className="topbar-title">Faculty Portal</span>
          <span className="topbar-badge">
            <User size={14} style={{ marginRight: 6 }} />
            {user?.first_name ?? "Faculty"}
          </span>
        </header>
        <main className="erp-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}