import { useEffect, useState } from "react";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import {
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    Inbox
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

interface GradeEntry {
    marks: number;
    grade: string;
}

const calculateGrade = (marks: number): string => {
    if (marks >= 90) return "O";
    if (marks >= 80) return "A+";
    if (marks >= 70) return "A";
    if (marks >= 60) return "B+";
    if (marks >= 50) return "B";
    if (marks >= 40) return "C";
    return "F";
};

export default function FacultyGrades() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [facultyRecord, setFacultyRecord] = useState<any>(null);

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [gradesData, setGradesData] = useState<Record<string, GradeEntry>>({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
            const allGrades = res.data;
            const newGradesData: Record<string, GradeEntry> = {};

            enrolledStudents.forEach(enr => {
                const found = allGrades.find((g: any) => g.enrollment_id === enr.id);
                if (found) {
                    newGradesData[enr.id] = {
                        marks: found.marks,
                        grade: found.grade
                    };
                } else {
                    newGradesData[enr.id] = { marks: 0, grade: "F" };
                }
            });
            setGradesData(newGradesData);
        } catch (err) {
            console.error("Failed to fetch existing grades", err);
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

    const handleMarksChange = (enrollmentId: string, marksStr: string) => {
        const marks = parseInt(marksStr) || 0;
        const grade = calculateGrade(marks);
        setGradesData(prev => ({
            ...prev,
            [enrollmentId]: { marks, grade }
        }));
    };

    const handleSubmit = async () => {
        if (!selectedCourseId || enrolledStudents.length === 0) return;

        setLoading(true);
        setMsg(null);

        try {
            const payload = enrolledStudents.map(enr => ({
                institution_id: enr.institution_id,
                enrollment_id: enr.id,
                marks: gradesData[enr.id]?.marks || 0,
                grade: gradesData[enr.id]?.grade || "F"
            }));

            await API.post("/grades/bulk", payload);
            setMsg({ type: "success", text: "Grades submitted successfully for all students." });
        } catch (err) {
            setMsg({ type: "error", text: "Failed to save grades. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="erp-container">
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon"><GraduationCap /></span> Student Grading
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
                                    <th style={{ width: '150px' }}>Marks / 100</th>
                                    <th style={{ textAlign: "center", width: '100px' }}>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map((enr, i) => (
                                    <tr key={enr.id}>
                                        <td>{i + 1}</td>
                                        <td><code style={{ color: 'var(--brand)' }}>{getEnrollNo(enr.student_id)}</code></td>
                                        <td><strong>{getUserName(enr.student_id)}</strong></td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="erp-input"
                                                style={{ textAlign: 'center' }}
                                                value={gradesData[enr.id]?.marks ?? ""}
                                                onChange={e => handleMarksChange(enr.id, e.target.value)}
                                            />
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <span className={`erp-badge ${gradesData[enr.id]?.grade === 'F' ? 'badge-red' : 'badge-green'}`}
                                                style={{ fontSize: '1rem', padding: '5px 12px' }}>
                                                {gradesData[enr.id]?.grade ?? "F"}
                                            </span>
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
                    <div className="erp-empty-icon"><Inbox /></div>
                    <div className="erp-empty-text">Select a course to view students and give grades</div>
                </div>
            )}
        </div>
    );
}
