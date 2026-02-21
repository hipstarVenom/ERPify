import { useEffect, useState } from "react";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";

interface AttendanceRecord {
    id: string;
    enrollment_id: string;
    attendance_date: string;
    status: boolean;
    updated_at: string;
}

interface Enrollment {
    id: string;
    student_id: string;
    course_id: string;
}

interface Course {
    id: string;
    course_name: string;
    course_code: string;
}

interface User {
    id: string;
    first_name: string;
    last_name: string;
}

export default function AttendanceHistory() {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [attRes, enrRes, courseRes, userRes] = await Promise.all([
                API.get("/attendance/"),
                API.get(`/enrollment/?faculty_id=${user?.id}`),
                API.get("/courses/"),
                API.get("/users/")
            ]);

            // We only care about attendance records related to this faculty's enrollments
            const facultyEnrollmentIds = enrRes.data.map((e: Enrollment) => e.id);
            const filteredAtt = attRes.data.filter((a: AttendanceRecord) =>
                facultyEnrollmentIds.includes(a.enrollment_id)
            );

            setAttendance(filteredAtt.sort((a: AttendanceRecord, b: AttendanceRecord) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime()));
            setEnrollments(enrRes.data);
            setCourses(courseRes.data);
            setUsers(userRes.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    const getUserName = (enrollmentId: string) => {
        const enr = enrollments.find(e => e.id === enrollmentId);
        if (!enr) return "Unknown";
        const u = users.find(u => u.id === enr.student_id);
        return u ? `${u.first_name} ${u.last_name}` : "Unknown Student";
    };

    const getCourseInfo = (enrollmentId: string) => {
        const enr = enrollments.find(e => e.id === enrollmentId);
        if (!enr) return "—";
        const c = courses.find(c => c.id === enr.course_id);
        return c ? `${c.course_name} (${c.course_code})` : "—";
    };

    const getCourseIdFromEnrollment = (enrollmentId: string) => {
        return enrollments.find(e => e.id === enrollmentId)?.course_id ?? "";
    };

    // Filter attendance records based on course selection and search term
    const filteredRecords = attendance.filter(rec => {
        const courseMatch = selectedCourseId ? getCourseIdFromEnrollment(rec.enrollment_id) === selectedCourseId : true;
        const nameMatch = getUserName(rec.enrollment_id).toLowerCase().includes(searchTerm.toLowerCase());
        return courseMatch && nameMatch;
    });

    const myCourses = courses.filter(c =>
        enrollments.some(e => e.course_id === c.id)
    );

    return (
        <div className="erp-container">
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon">📜</span> Attendance History
                    </span>
                    <button className="erp-btn erp-btn-secondary" onClick={fetchData} disabled={loading}>
                        {loading ? "Refreshing..." : "🔄 Refresh"}
                    </button>
                </div>

                <div className="erp-form" style={{ padding: 20 }}>
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Filter by Course</label>
                            <select
                                value={selectedCourseId}
                                onChange={e => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">All My Courses</option>
                                {myCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="erp-field">
                            <label>Search Student</label>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {filteredRecords.length === 0 ? (
                    <div className="erp-empty" style={{ padding: '60px 0' }}>
                        <div className="erp-empty-icon">📂</div>
                        <div className="erp-empty-text">
                            {loading ? "Loading history..." : "No attendance records found."}
                        </div>
                    </div>
                ) : (
                    <div className="erp-table-wrap">
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th style={{ textAlign: "center" }}>Status</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((rec) => (
                                    <tr key={rec.id}>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>
                                                {new Date(rec.attendance_date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td><strong>{getUserName(rec.enrollment_id)}</strong></td>
                                        <td style={{ color: "var(--text-secondary)" }}>{getCourseInfo(rec.enrollment_id)}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <span className={`erp-badge ${rec.status ? 'badge-green' : 'badge-red'}`} style={{
                                                background: rec.status ? '#dcfce7' : '#fee2e2',
                                                color: rec.status ? '#16a34a' : '#dc2626',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700
                                            }}>
                                                {rec.status ? "Present" : "Absent"}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(rec.updated_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
