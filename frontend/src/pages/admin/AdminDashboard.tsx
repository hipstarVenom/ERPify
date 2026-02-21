import { useEffect, useState } from "react";
import API from "../../api/api";
import {
  Building2,
  FolderTree,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList
} from "lucide-react";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    institutions: 0,
    departments: 0,
    students: 0,
    faculty: 0,
    courses: 0,
  });

  useEffect(() => {
    Promise.allSettled([
      API.get("/institutions/"),
      API.get("/departments/"),
      API.get("/students/"),
      API.get("/faculty/"),
      API.get("/courses/"),
    ]).then(([inst, dept, stu, fac, crs]) => {
      setCounts({
        institutions: inst.status === "fulfilled" ? inst.value.data.length : 0,
        departments: dept.status === "fulfilled" ? dept.value.data.length : 0,
        students: stu.status === "fulfilled" ? stu.value.data.length : 0,
        faculty: fac.status === "fulfilled" ? fac.value.data.length : 0,
        courses: crs.status === "fulfilled" ? crs.value.data.length : 0,
      });
    });
  }, []);

  const stats = [
    { icon: <Building2 />, label: "Institutions", value: counts.institutions, color: "var(--brand)" },
    { icon: <FolderTree />, label: "Departments", value: counts.departments, color: "#6366f1" },
    { icon: <Users />, label: "Students", value: counts.students, color: "#10b981" },
    { icon: <GraduationCap />, label: "Faculty", value: counts.faculty, color: "#f59e0b" },
    { icon: <BookOpen />, label: "Courses", value: counts.courses, color: "#3b82f6" },
  ];

  return (
    <>
      <div className="erp-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="erp-stat-card">
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-trend">↑ Active records</div>
          </div>
        ))}
      </div>

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title">
            <span className="card-title-icon"><ClipboardList /></span>
            Quick Overview
          </span>
          <span className="erp-badge badge-blue">Live Data</span>
        </div>
        <div style={{ padding: 20 }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7, marginBottom: 0 }}>
            Welcome to the ERPify Admin Control Panel. Use the sidebar to manage
            institutions, departments, faculty, students and courses.
          </p>
        </div>
      </div>
    </>
  );
}