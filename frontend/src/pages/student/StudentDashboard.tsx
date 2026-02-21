import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/api";
import {
    User,
    BookOpen,
    Calendar,
    Trophy,
    Inbox,
    FileText,
    ListChecks,
    Book,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

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

    const overallAttendance = attendance.length > 0
        ? attendance.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / attendance.length
        : 0;

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
            {/* 🔝 Hero Stats Section */}
            <div className="erp-stats-grid">
                <div className="erp-stat-card welcome-card">
                    <div className="stat-icon">
                        <User />
                    </div>
                    <div className="stat-value">Welcome back,</div>
                    <div className="stat-label">{user?.first_name} {user?.last_name}</div>
                    <div className="stat-trend" style={{ color: 'var(--brand)' }}>
                        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>ID: {user?.id?.slice(0, 8)}</span>
                    </div>
                </div>

                <div className="erp-stat-card attendance-hero-card">
                    <div className="attendance-hero-content">
                        <div className="attendance-hero-visual">
                            <svg viewBox="0 0 36 36" className="circular-chart blue">
                                <path className="circle-bg"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                    strokeDasharray={`${overallAttendance}, 100`}
                                    style={{ stroke: overallAttendance < 75 ? '#ef4444' : '#10b981' }}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="percentage">{overallAttendance.toFixed(1)}%</text>
                            </svg>
                        </div>
                        <div className="attendance-hero-info">
                            <div className="stat-label">Overall Attendance</div>
                            <div className={`stat-trend ${overallAttendance < 75 ? 'text-danger' : 'text-success'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {overallAttendance < 75 ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                {overallAttendance < 75 ? 'Below Threshold' : 'Good Standing'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="erp-stat-card">
                    <div className="stat-icon">
                        <BookOpen />
                    </div>
                    <div className="stat-value">{courses.length}</div>
                    <div className="stat-label">Registered Courses</div>
                    <div className="stat-trend text-primary">Active Semester</div>
                </div>
            </div>

            <div className="erp-grid-2-col">
                {/* 📅 Detailed Attendance Section */}
                <div className="erp-card">
                    <div className="card-header">
                        <span className="card-title">
                            <span className="card-title-icon"><Calendar /></span>
                            Subject-wise Attendance
                        </span>
                    </div>
                    <div className="card-body">
                        {attendance.length > 0 ? (
                            <div className="subject-attendance-list">
                                {attendance.map((item, index) => {
                                    const status = item.attendance_percentage >= 85 ? 'Safe'
                                        : item.attendance_percentage >= 75 ? 'Warning'
                                            : 'Shortage';
                                    const statusColor = status === 'Safe' ? 'var(--success)'
                                        : status === 'Warning' ? 'var(--warning)'
                                            : 'var(--danger)';

                                    return (
                                        <div key={index} className="subject-attendance-item">
                                            <div className="subject-info">
                                                <div className="subject-name-group">
                                                    <span className="subject-name">{item.course_name}</span>
                                                    <span className="subject-classes">{item.attended_classes}/{item.total_classes} Classes</span>
                                                </div>
                                                <span className="attendance-status-tag" style={{ color: statusColor, border: `1px solid ${statusColor}` }}>
                                                    {status}
                                                </span>
                                            </div>
                                            <div className="attendance-progress-container">
                                                <div className="attendance-progress-bar">
                                                    <div
                                                        className={`attendance-progress-fill ${item.attendance_percentage < 75 ? 'low' : ''}`}
                                                        style={{
                                                            width: `${item.attendance_percentage}%`,
                                                            background: statusColor
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="attendance-percent-text">{item.attendance_percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="erp-empty">
                                <div className="erp-empty-icon">
                                    <Inbox />
                                </div>
                                <div className="erp-empty-text">No attendance records found</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🎯 Academic Performance Section */}
                <div className="erp-card">
                    <div className="card-header">
                        <span className="card-title">
                            <span className="card-title-icon"><Trophy /></span>
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
                                <div className="erp-empty-icon">
                                    <FileText />
                                </div>
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
                        <span className="card-title-icon"><ListChecks /></span>
                        My Registered Courses
                    </span>
                </div>
                <div className="card-body">
                    {courses.length > 0 ? (
                        <div className="course-cards-grid">
                            {courses.map((course) => (
                                <div key={course.id} className="course-mini-card">
                                    <div className="course-icon">
                                        <Book size={20} />
                                    </div>
                                    <div className="course-info">
                                        <div className="course-code">{course.code}</div>
                                        <div className="course-name">{course.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="erp-empty">
                            <div className="erp-empty-icon">
                                <Inbox />
                            </div>
                            <div className="erp-empty-text">No courses assigned yet</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
