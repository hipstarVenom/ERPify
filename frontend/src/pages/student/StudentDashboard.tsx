import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/api";

interface AttendanceSummary {
    course_name: string;
    total_classes: number;
    attended_classes: number;
    attendance_percentage: number;
}

interface Grade {
    course_name: string;
    marks: number;
    grade: string;
}

interface Course {
    id: string;
    name: string;
    code: string;
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;

            try {
                // Sync attendance summary first
                await API.get(`/attendance-summary/student/${user.id}`);

                // Fetch dashboard data
                const res = await API.get(`/students/${user.id}/dashboard`);
                setCourses(res.data.courses);
                setAttendance(res.data.attendance);
                setGrades(res.data.grades);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const gradeInfo: Record<string, { label: string, color: string }> = {
        "O": { label: "Outstanding", color: "#10b981" },
        "A+": { label: "Excellent Plus", color: "#3b82f6" },
        "A": { label: "Excellent", color: "#60a5fa" },
        "B+": { label: "Very Good", color: "#8b5cf6" },
        "B": { label: "Good", color: "#a78bfa" },
        "C": { label: "Average", color: "#f59e0b" },
        "U": { label: "Re-appear", color: "#ef4444" },
    };

    if (loading) {
        return (
            <div className="erp-loading-container">
                <div className="erp-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="erp-dashboard-content">
            <div className="erp-stats-grid">
                <div className="erp-stat-card">
                    <div className="stat-icon">👋</div>
                    <div className="stat-value">Welcome</div>
                    <div className="stat-label">{user?.first_name} {user?.last_name}</div>
                    <div className="stat-trend">✓ Logged in as Student</div>
                </div>

                <div className="erp-stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-value">{courses.length}</div>
                    <div className="stat-label">Registered Courses</div>
                    <div className="stat-trend text-primary">Active Semester</div>
                </div>

                <div className="erp-stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-value">
                        {attendance.length > 0
                            ? (attendance.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / attendance.length).toFixed(1)
                            : 0}%
                    </div>
                    <div className="stat-label">Avg. Attendance</div>
                    <div className="stat-trend text-success">Overall Status</div>
                </div>
            </div>

            <div className="erp-grid-2-col">
                {/* Attendance Summary Section */}
                <div className="erp-card">
                    <div className="card-header">
                        <span className="card-title">
                            <span className="card-title-icon">📅</span>
                            Attendance Summary
                        </span>
                    </div>
                    <div className="card-body">
                        {attendance.length > 0 ? (
                            <div className="erp-table-container">
                                <table className="erp-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Attended</th>
                                            <th>Total</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance.map((item, index) => (
                                            <tr key={index}>
                                                <td><strong>{item.course_name}</strong></td>
                                                <td>{item.attended_classes}</td>
                                                <td>{item.total_classes}</td>
                                                <td>
                                                    <div className="attendance-progress-container">
                                                        <div className="attendance-progress-bar">
                                                            <div
                                                                className={`attendance-progress-fill ${item.attendance_percentage < 75 ? 'low' : ''}`}
                                                                style={{ width: `${item.attendance_percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="attendance-percent-text">{item.attendance_percentage.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="erp-empty">
                                <div className="erp-empty-icon">📭</div>
                                <div className="erp-empty-text">No attendance records found</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grades / Marks Section */}
                <div className="erp-card">
                    <div className="card-header">
                        <span className="card-title">
                            <span className="card-title-icon">🎯</span>
                            Academic Performance
                        </span>
                    </div>
                    <div className="card-body">
                        {grades.length > 0 ? (
                            <div className="erp-table-container">
                                <table className="erp-table">
                                    <thead>
                                        <tr>
                                            <th>Course</th>
                                            <th>Marks</th>
                                            <th>Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.map((grade, index) => (
                                            <tr key={index}>
                                                <td><strong>{grade.course_name}</strong></td>
                                                <td>
                                                    <div className="marks-display">
                                                        <span className="marks-value">{grade.marks}</span>
                                                        <span className="marks-max">/100</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="grade-badge-container">
                                                        <span
                                                            className="erp-badge"
                                                            style={{
                                                                backgroundColor: gradeInfo[grade.grade]?.color || "#94a3b8",
                                                                color: "#fff",
                                                                fontWeight: "bold"
                                                            }}
                                                        >
                                                            {grade.grade}
                                                        </span>
                                                        <span className="grade-label">
                                                            {gradeInfo[grade.grade]?.label}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="erp-empty">
                                <div className="erp-empty-icon">📝</div>
                                <div className="erp-empty-text">Grades not yet published</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Registered Courses Section */}
            <div className="erp-card mt-6">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon">📋</span>
                        My Registered Courses
                    </span>
                </div>
                <div className="card-body">
                    {courses.length > 0 ? (
                        <div className="course-cards-grid">
                            {courses.map((course) => (
                                <div key={course.id} className="course-mini-card">
                                    <div className="course-icon">📘</div>
                                    <div className="course-info">
                                        <div className="course-code">{course.code}</div>
                                        <div className="course-name">{course.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="erp-empty">
                            <div className="erp-empty-icon">📭</div>
                            <div className="erp-empty-text">No courses assigned yet</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
