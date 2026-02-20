// src/layouts/AdminLayout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/institutions">Institutions</Link>
          <Link to="/admin/departments">Departments</Link>
          <Link to="/admin/faculty">Faculty</Link>
          <Link to="/admin/courses">Courses</Link>
          <Link to="/admin/students">Students</Link>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}