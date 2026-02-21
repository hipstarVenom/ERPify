import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/institutions", label: "Institutions", icon: "🏛️" },
  { to: "/admin/departments", label: "Departments", icon: "🗂️" },
  { to: "/admin/faculty", label: "Faculty", icon: "🎓" },
  { to: "/admin/courses", label: "Courses", icon: "📚" },
  { to: "/admin/students", label: "Students", icon: "👥" },
  { to: "/admin/enrollments", label: "Enrollments", icon: "📋" },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (to: string) =>
    to === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(to);

  // Derive current page title
  const currentItem = NAV_ITEMS.find((n) => isActive(n.to));

  return (
    <div className="erp-shell">
      {/* ── Sidebar ── */}
      <aside className="erp-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">⚡</span>
          <span className="sidebar-brand-name">ERPify</span>
        </div>

        {/* Nav */}
        <span className="sidebar-section-label">Navigation</span>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isActive(item.to) ? "active" : ""}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Theme Toggle */}
          <button
            id="themeToggle"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            <span className="sidebar-link-icon">
              {theme === "light" ? "🌙" : "☀️"}
            </span>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
            <span className={`theme-toggle-track ${theme === "dark" ? "on" : ""}`}>
              <span className={`theme-toggle-thumb ${theme === "dark" ? "on" : ""}`} />
            </span>
          </button>

          {/* Logout */}
          <button id="logoutBtn" className="erp-logout-btn" onClick={handleLogout}>
            <span className="sidebar-link-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="erp-main">
        {/* Top bar */}
        <header className="erp-topbar">
          <span className="topbar-title">
            {currentItem?.icon} {currentItem?.label ?? "Admin Panel"}
          </span>
          <span className="topbar-badge">
            🛡️ {user?.first_name ?? "Admin"}
          </span>
        </header>

        {/* Page content */}
        <main className="erp-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}