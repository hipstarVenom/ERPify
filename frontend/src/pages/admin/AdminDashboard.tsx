import { useEffect, useState } from "react";
import API from "../../api/api";

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
    { icon: "🏛️", label: "Institutions", value: counts.institutions, badge: "blue" },
    { icon: "🗂️", label: "Departments", value: counts.departments, badge: "blue" },
    { icon: "👥", label: "Students", value: counts.students, badge: "green" },
    { icon: "🎓", label: "Faculty", value: counts.faculty, badge: "amber" },
    { icon: "📚", label: "Courses", value: counts.courses, badge: "blue" },
  ];

  return (
    <>
      <div className="erp-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="erp-stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-trend">↑ Active records</div>
          </div>
        ))}
      </div>

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title">
            <span className="card-title-icon">📋</span>
            Quick Overview
          </span>
          <span className="erp-badge badge-blue">Live Data</span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
          Welcome to the ERPify Admin Control Panel. Use the sidebar to manage
          institutions, departments, faculty, students and courses.
        </p>
      </div>
    </>
  );
}