import { useEffect, useState } from "react";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import {
    GraduationCap,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

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


export default function GradeEvaluation() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [marksData, setMarksData] = useState<Record<string, number>>({});
    const [gradesData, setGradesData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [facultyRecord, setFacultyRecord] = useState<any>(null);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCourseId) {
            fetchExistingGrades();
        }
    }, [selectedCourseId]);

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

    const fetchExistingGrades = async () => {
        try {
            const res = await API.get("/grades/");
            const existing = res.data;
            const newMarks: Record<string, number> = {};
            const newGrades: Record<string, string> = {};

            enrolledStudents.forEach(enr => {
                const found = existing.find((g: any) => g.enrollment_id === enr.id);
                if (found) {
                    newMarks[enr.id] = found.marks;
                    newGrades[enr.id] = found.grade;
                }
            });
            setMarksData(newMarks);
            setGradesData(newGrades);
        } catch (err) {
            console.error("Failed to fetch existing grades", err);
        }
    };

    const gradeInfo: Record<string, { label: string, color: string }> = {
        "O": { label: "Outstanding", color: "#10b981" },
        "A+": { label: "Excellent Plus", color: "#3b82f6" },
        "A": { label: "Excellent", color: "#60a5fa" },
        "B+": { label: "Very Good", color: "#8b5cf6" },
        "B": { label: "Good", color: "#a78bfa" },
        "C": { label: "Average", color: "#f59e0b" },
        "U": { label: "Re-appear", color: "#ef4444" },
    };

    const calculateGrade = (marks: number): string => {
        if (marks >= 95) return "O";
        if (marks >= 90) return "A+";
        if (marks >= 80) return "A";
        if (marks >= 70) return "B+";
        if (marks >= 60) return "B";
        if (marks >= 50) return "C";
        return "U";
    };

    const handleMarksChange = (enrollmentId: string, marks: string) => {
        const val = parseInt(marks) || 0;
        const clampedVal = Math.min(100, Math.max(0, val));

        setMarksData(prev => ({ ...prev, [enrollmentId]: clampedVal }));
        setGradesData(prev => ({ ...prev, [enrollmentId]: calculateGrade(clampedVal) }));
    };

    const handleSubmit = async () => {
        if (!selectedCourseId || enrolledStudents.length === 0) return;

        setLoading(true);
        setMsg(null);

        try {
            const payload = enrolledStudents.map(enr => ({
                institution_id: enr.institution_id,
                enrollment_id: enr.id,
                marks: marksData[enr.id] || 0,
                grade: gradesData[enr.id] || "U"
            }));

            await API.post("/grades/bulk", payload);
            setMsg({ type: "success", text: "Grades submitted successfully." });
        } catch (err) {
            setMsg({ type: "error", text: "Failed to submit grades. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const myCourses = courses.filter(c =>
        enrollments.some(e => e.course_id === c.id) || (facultyRecord && facultyRecord.course_id === c.id)
    );

    const enrolledStudents = enrollments.filter(e => e.course_id === selectedCourseId);

    const getUserName = (uid: string) => {
        const u = users.find(u => u.id === uid);
        return u ? `${u.first_name} ${u.last_name}` : "Unknown Student";
    };

    const getEnrollNo = (uid: string) => {
        return students.find(s => s.user_id === uid)?.enrollment_number ?? "—";
    };

    return (
        <div className="erp-container">
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon"><GraduationCap /></span> Student Grade Evaluation
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
                    </div>
                </div>
            </div>

            {selectedCourseId && (
                <div className="erp-card" style={{ marginTop: 20 }}>
                    <div className="card-header">
                        <span className="card-title">
                            Students List ({enrolledStudents.length})
                        </span>
                    </div>

                    <div className="erp-table-wrap">
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Enroll No.</th>
                                    <th>Name</th>
                                    <th style={{ width: 120 }}>Marks (0-100)</th>
                                    <th style={{ textAlign: "center" }}>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map((enr, i) => (
                                    <tr key={enr.id}>
                                        <td>{i + 1}</td>
                                        <td><code style={{ color: 'var(--brand)' }}>{getEnrollNo(enr.student_id)}</code></td>
                                        <td><strong>{getUserName(enr.student_id)}</strong></td>
                                        <td>
                                            <div className="marks-input-container" style={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '40px',
                                                backgroundColor: 'rgba(0,0,0,0.03)',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <div className="marks-progress" style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: `${marksData[enr.id] || 0}%`,
                                                    backgroundColor: gradeInfo[gradesData[enr.id] || 'U'].color,
                                                    opacity: 0.15,
                                                    transition: 'width 0.3s ease, background-color 0.3s ease'
                                                }} />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={marksData[enr.id] ?? ""}
                                                    onChange={e => handleMarksChange(enr.id, e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        textAlign: 'center',
                                                        fontSize: '1.1rem',
                                                        fontWeight: '600',
                                                        color: 'var(--text-primary)',
                                                        position: 'relative',
                                                        zIndex: 1,
                                                        outline: 'none',
                                                        appearance: 'none'
                                                    }}
                                                    placeholder="0"
                                                />
                                                <span style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-secondary)',
                                                    fontWeight: 'bold',
                                                    pointerEvents: 'none',
                                                    zIndex: 1
                                                }}>%</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                                <span
                                                    className="erp-badge"
                                                    style={{
                                                        fontSize: '1rem',
                                                        fontWeight: 'bold',
                                                        backgroundColor: gradeInfo[gradesData[enr.id] || 'U'].color,
                                                        color: '#fff',
                                                        minWidth: '35px'
                                                    }}
                                                >
                                                    {gradesData[enr.id] || "U"}
                                                </span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                    {gradeInfo[gradesData[enr.id] || 'U'].label}
                                                </span>
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
                                {msg.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
                                {msg.text}
                            </div>
                        )}
                        <button
                            className="erp-btn erp-btn-primary"
                            style={{ alignSelf: 'flex-end', minWidth: 200 }}
                            onClick={handleSubmit}
                            disabled={loading || enrolledStudents.length === 0}
                        >
                            {loading ? "Submitting..." : "Submit Grades"}
                        </button>
                    </div>
                </div>
            )}

            {!selectedCourseId && (
                <div className="erp-empty" style={{ marginTop: 20 }}>
                    <div className="erp-empty-icon"><GraduationCap /></div>
                    <div className="erp-empty-text">Select a course to evaluate grades</div>
                </div>
            )}
        </div>
    );
}
