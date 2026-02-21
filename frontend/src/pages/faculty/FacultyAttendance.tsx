import { useEffect, useState } from "react";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";

interface Enrollment {
    id: string;
    student_id: string;
    course_id: string;
    semester_id: string;
    institution_id: string;
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

interface Student {
    user_id: string;
    enrollment_number: string;
}

export default function FacultyAttendance() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCourseId && attendanceDate) {
            fetchExistingAttendance();
        }
    }, [selectedCourseId, attendanceDate]);

    const fetchExistingAttendance = async () => {
        try {
            const res = await API.get(`/attendance/?attendance_date=${attendanceDate}`);
            const existing = res.data;
            const newAttendanceData: Record<string, boolean> = {};

            // Map existing attendance to our local state
            enrolledStudents.forEach(enr => {
                const found = existing.find((a: any) => a.enrollment_id === enr.id);
                if (found) {
                    newAttendanceData[enr.id] = found.status;
                }
            });
            setAttendanceData(newAttendanceData);
        } catch (err) {
            console.error("Failed to fetch existing attendance", err);
        }
    };

    const [facultyRecord, setFacultyRecord] = useState<any>(null);

    const fetchData = async () => {
        try {
            const [enrRes, courseRes, userRes, studentRes, facultyRes] = await Promise.all([
                API.get(`/enrollment/?faculty_id=${user?.id}`),
                API.get("/courses/"),
                API.get("/users/"),
                API.get("/students/"),
                API.get(`/faculty/${user?.id}`)
            ]);
            setEnrollments(enrRes.data);
            setCourses(courseRes.data);
            setUsers(userRes.data);
            setStudents(studentRes.data);
            setFacultyRecord(facultyRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    // Filter unique courses taught by this faculty (either via enrollments or direct assignment)
    const myCourses = courses.filter(c =>
        enrollments.some(e => e.course_id === c.id) || (facultyRecord && facultyRecord.course_id === c.id)
    );

    // Filter students for the selected course
    const enrolledStudents = enrollments.filter(e => e.course_id === selectedCourseId);

    const getUserName = (uid: string) => {
        const u = users.find(u => u.id === uid);
        return u ? `${u.first_name} ${u.last_name}` : "Unknown Student";
    };

    const getEnrollNo = (uid: string) => {
        return students.find(s => s.user_id === uid)?.enrollment_number ?? "—";
    };

    const handleStatusChange = (enrollmentId: string, status: boolean) => {
        setAttendanceData(prev => ({ ...prev, [enrollmentId]: status }));
    };

    const handleSubmit = async () => {
        if (!selectedCourseId || enrolledStudents.length === 0) return;

        setLoading(true);
        setMsg(null);

        try {
            const payload = enrolledStudents.map(enr => ({
                institution_id: enr.institution_id,
                enrollment_id: enr.id,
                attendance_date: attendanceDate,
                course_id: enr.course_id,
                status: attendanceData[enr.id] ?? false
            }));

            await API.post("/attendance/bulk", payload);
            setMsg({ type: "success", text: "✅ Attendance marked successfully for all students." });
        } catch (err) {
            setMsg({ type: "error", text: "Failed to save attendance. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="erp-container">
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon">📝</span> Mark Attendance
                    </span>
                </div>

                <div className="erp-form" style={{ padding: 20 }}>
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Course</label>
                            <select
                                value={selectedCourseId}
                                onChange={e => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">Select Course</option>
                                {myCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="erp-field">
                            <label>Date</label>
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={e => setAttendanceDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {selectedCourseId && (
                <div className="erp-card" style={{ marginTop: 20 }}>
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="card-title">
                            Students List ({enrolledStudents.length})
                        </span>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                className="erp-btn erp-btn-secondary"
                                style={{ fontSize: '0.8rem' }}
                                onClick={() => {
                                    const allChecked: Record<string, boolean> = {};
                                    enrolledStudents.forEach(e => allChecked[e.id] = true);
                                    setAttendanceData(allChecked);
                                }}
                            >
                                Mark All Present
                            </button>
                            <button
                                className="erp-btn erp-btn-secondary"
                                style={{ fontSize: '0.8rem' }}
                                onClick={() => {
                                    const allUnchecked: Record<string, boolean> = {};
                                    enrolledStudents.forEach(e => allUnchecked[e.id] = false);
                                    setAttendanceData(allUnchecked);
                                }}
                            >
                                Mark All Absent
                            </button>
                        </div>
                    </div>

                    <div className="erp-table-wrap">
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Enroll No.</th>
                                    <th>Name</th>
                                    <th style={{ textAlign: "center" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map((enr, i) => (
                                    <tr key={enr.id}>
                                        <td>{i + 1}</td>
                                        <td><code style={{ color: 'var(--brand)' }}>{getEnrollNo(enr.student_id)}</code></td>
                                        <td><strong>{getUserName(enr.student_id)}</strong></td>
                                        <td style={{ textAlign: "center" }}>
                                            <div className="status-toggle" style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                                                <button
                                                    onClick={() => handleStatusChange(enr.id, true)}
                                                    className={`erp-btn ${attendanceData[enr.id] === true ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
                                                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(enr.id, false)}
                                                    className={`erp-btn ${attendanceData[enr.id] === false ? 'erp-btn-danger' : 'erp-btn-secondary'}`}
                                                    style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="card-footer" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
                        {msg && (
                            <div className={`erp-alert erp-alert-${msg.type}`}>
                                {msg.text}
                            </div>
                        )}
                        <button
                            className="erp-btn erp-btn-primary"
                            style={{ alignSelf: 'flex-end', minWidth: 200 }}
                            onClick={handleSubmit}
                            disabled={loading || enrolledStudents.length === 0}
                        >
                            {loading ? "Saving..." : "Save Daily Attendance"}
                        </button>
                    </div>
                </div>
            )}

            {!selectedCourseId && (
                <div className="erp-empty" style={{ marginTop: 20 }}>
                    <div className="erp-empty-icon">☝️</div>
                    <div className="erp-empty-text">Select a course to mark attendance</div>
                </div>
            )}
        </div>
    );
}
