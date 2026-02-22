import { useEffect, useState, useMemo } from "react";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import {
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    Inbox,
    Loader2,
    Scan
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

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
    const [facultyRecord, setFacultyRecord] = useState<{ course_id?: string } | null>(null);

    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [gradesData, setGradesData] = useState<Record<string, GradeEntry>>({});
    const [loading, setLoading] = useState(false);
    const [scanningId, setScanningId] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const myCourses = useMemo(() => courses.filter(c =>
        enrollments.some(e => e.course_id === c.id) || (facultyRecord && facultyRecord.course_id === c.id)
    ), [courses, enrollments, facultyRecord]);

    const enrolledStudents = useMemo(() =>
        enrollments.filter(e => e.course_id === selectedCourseId)
        , [enrollments, selectedCourseId]);

    useEffect(() => {
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

        if (user?.id) {
            fetchData();
        }
    }, [user?.id]);

    useEffect(() => {
        const fetchExistingGrades = async () => {
            try {
                const res = await API.get("/grades/");
                const allGrades = res.data;
                const newGradesData: Record<string, GradeEntry> = {};

                enrolledStudents.forEach(enr => {
                    const found = allGrades.find((g: { enrollment_id: string; marks: number; grade: string }) => g.enrollment_id === enr.id);
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

        if (selectedCourseId) {
            fetchExistingGrades();
        }
    }, [selectedCourseId, enrolledStudents]);

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

    const handleAICan = async (e: React.ChangeEvent<HTMLInputElement>, enrollmentId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanningId(enrollmentId);
        setMsg(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            await new Promise((resolve, reject) => {
                reader.onload = async () => {
                    try {
                        const base64Data = (reader.result as string).split(',')[1];
                        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                        const prompt = "Extract the numeric marks obtained and the total maximum marks from this marksheet image. Return ONLY a JSON object like this: {\"obtained\": 42, \"total\": 100}. If total marks are not mentioned, assume 100.";

                        const result = await model.generateContent([
                            prompt,
                            { inlineData: { data: base64Data, mimeType: file.type } }
                        ]);

                        const response = await result.response;
                        const text = response.text().trim();

                        // Try to parse JSON from the response
                        let mark = 0;
                        try {
                            const jsonMatch = text.match(/\{.*\}/s);
                            if (jsonMatch) {
                                const data = JSON.parse(jsonMatch[0]);
                                const obtained = parseFloat(data.obtained) || 0;
                                const total = parseFloat(data.total) || 100;
                                // Convert to percentage
                                mark = Math.round((obtained / total) * 100);
                            } else {
                                // Fallback to simple number extraction
                                mark = parseInt(text.match(/\d+/)?.[0] || "0");
                            }
                        } catch (e) {
                            console.error("JSON parse failed", e);
                            mark = parseInt(text.match(/\d+/)?.[0] || "0");
                        }

                        // Cap at 100
                        if (mark > 100) mark = 100;

                        handleMarksChange(enrollmentId, mark.toString());
                        setMsg({ type: "success", text: `AI extracted: ${mark}% (scaled to 100)` });
                        resolve(null);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = () => reject(new Error("File reading failed"));
            });
        } catch (err) {
            console.error("AI Scan failed:", err);
            setMsg({ type: "error", text: "AI Scan failed. Please upload a clearer image." });
        } finally {
            setScanningId(null);
            // reset file input
            e.target.value = "";
        }
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
                                    <th style={{ width: '80px' }}>AI Scan</th>
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
                                        <td>
                                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id={`ai-scan-${enr.id}`}
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleAICan(e, enr.id)}
                                                    disabled={scanningId !== null}
                                                />
                                                <label
                                                    htmlFor={`ai-scan-${enr.id}`}
                                                    className="erp-btn"
                                                    style={{
                                                        padding: '4px 8px',
                                                        cursor: scanningId ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 5,
                                                        background: 'var(--brand-bg)',
                                                        color: 'var(--brand)',
                                                        border: '1px solid var(--brand-border)',
                                                        borderRadius: 6,
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {scanningId === enr.id ? <Loader2 className="animate-spin" size={14} /> : <Scan size={14} />}
                                                    Scan
                                                </label>
                                            </div>
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
