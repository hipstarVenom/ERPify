import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  GraduationCap,
  BookOpen,
  Users,
  ClipboardList,
  Bot,
  Moon,
  Sun,
  LogOut,
  Zap,
  ShieldCheck
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/institutions", label: "Institutions", Icon: Building2 },
  { to: "/admin/departments", label: "Departments", Icon: FolderTree },
  { to: "/admin/faculty", label: "Faculty", Icon: GraduationCap },
  { to: "/admin/courses", label: "Courses", Icon: BookOpen },
  { to: "/admin/students", label: "Students", Icon: Users },
  { to: "/admin/enrollments", label: "Enrollments", Icon: ClipboardList },
  { to: "/admin/risk", label: "Risk Automation", Icon: Bot },
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
          <span className="sidebar-brand-icon"><Zap fill="currentColor" /></span>
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
              <span className="sidebar-link-icon">
                <item.Icon size={18} />
              </span>
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
              {theme === "light" ? <Moon /> : <Sun />}
            </span>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
            <span className={`theme-toggle-track ${theme === "dark" ? "on" : ""}`}>
              <span className={`theme-toggle-thumb ${theme === "dark" ? "on" : ""}`} />
            </span>
          </button>

          {/* Logout */}
          <button id="logoutBtn" className="erp-logout-btn" onClick={handleLogout}>
            <span className="sidebar-link-icon"><LogOut /></span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="erp-main">
        {/* Top bar */}
        <header className="erp-topbar">
          <span className="topbar-title">
            {currentItem && <currentItem.Icon size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--brand)' }} />}
            {currentItem?.label ?? "Admin Panel"}
          </span>
          <span className="topbar-badge">
            <ShieldCheck size={14} style={{ marginRight: 6 }} />
            {user?.first_name ?? "Admin"}
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
