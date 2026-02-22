import { useEffect, useState } from "react";
import API from "../../api/api";
import ConfirmModal from "../../components/ConfirmModal";
import {
    ClipboardList,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Inbox,
    RotateCw
} from "lucide-react";

// ── Interfaces ──────────────────────────────────────────────────────────────
interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }
interface Course {
    id: string; course_name: string; course_code: string;
    credits: number; department_id: string; institution_id: string;
}
interface Student {
    user_id: string; department_id: string;
    enrollment_number: string; current_year: number; admission_year: number;
}
interface Faculty {
    user_id: string; department_id: string; designation: string;
}
interface User { id: string; first_name: string; last_name: string; }
interface EnrollmentRecord {
    id: string; institution_id: string; student_id: string;
    course_id: string; faculty_id: string | null; semester_id: string; status: string;
}

const STATUS_OPTIONS = ["enrolled", "completed", "dropped", "on_hold"];

const STATUS_STYLES: Record<string, React.CSSProperties> = {
    enrolled: { background: "var(--success-bg, #dcfce7)", color: "#16a34a", border: "1px solid #16a34a" },
    completed: { background: "#dbeafe", color: "#2563eb", border: "1px solid #2563eb" },
    dropped: { background: "#fef9c3", color: "#b45309", border: "1px solid #b45309" },
    on_hold: { background: "var(--bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border)" },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function Enrollments() {
    // Reference data
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // Form state
    const [institutionId, setInstitutionId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [studentId, setStudentId] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [semesterId, setSemesterId] = useState("");
    const [status, setStatus] = useState("enrolled");
    const [loading, setLoading] = useState(false);

    // Derived filtered lists
    const filteredDepts = departments.filter(d => d.institution_id === institutionId);
    const filteredCourses = courses.filter(c => c.department_id === departmentId && c.institution_id === institutionId);
    const filteredStudents = students.filter(s => s.department_id === departmentId);
    const filteredFaculties = faculties.filter(f => f.department_id === departmentId);

    // Enrollment list
    const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EnrollmentRecord | null>(null);

    // Per-row status update loading tracker
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // ── Initial load ────────────────────────────────────────────────────────────
    useEffect(() => {
        API.get("/institutions/").then(r => setInstitutions(r.data));
        API.get("/departments/").then(r => setDepartments(r.data));
        API.get("/courses/").then(r => setCourses(r.data));
        API.get("/students/").then(r => setStudents(r.data));
        API.get("/faculty/").then(r => setFaculties(r.data));
        API.get("/users/").then(r => setUsers(r.data));
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        const res = await API.get("/enrollment/");
        setEnrollments(res.data);
    };

    // ── Cascade resets ──────────────────────────────────────────────────────────
    const handleInstitutionChange = (id: string) => {
        setInstitutionId(id); setDepartmentId(""); setCourseId(""); setStudentId(""); setFacultyId("");
    };
    const handleDepartmentChange = (id: string) => {
        setDepartmentId(id); setCourseId(""); setStudentId(""); setFacultyId("");
    };

    // ── Lookup helpers ──────────────────────────────────────────────────────────
    const getUserName = (uid: string) => { const u = users.find(u => u.id === uid); return u ? `${u.first_name} ${u.last_name}` : "—"; };
    const getCourseName = (cid: string) => courses.find(c => c.id === cid)?.course_name ?? "—";
    const getCourseCode = (cid: string) => courses.find(c => c.id === cid)?.course_code ?? "—";
    const getDeptByDeptId = (did: string) => departments.find(d => d.id === did)?.name ?? "—";
    const getInstName = (iid: string) => institutions.find(i => i.id === iid)?.name ?? "—";
    const getEnrollNo = (uid: string) => students.find(s => s.user_id === uid)?.enrollment_number ?? "—";
    const getFacultyDesignation = (fid: string) => faculties.find(f => f.user_id === fid)?.designation ?? "";

    // Course → dept → institution chain
    const getDeptFromCourse = (courseId: string) => {
        const c = courses.find(c => c.id === courseId);
        return c ? getDeptByDeptId(c.department_id) : "—";
    };
    const getInstFromCourse = (courseId: string) => {
        const c = courses.find(c => c.id === courseId);
        return c ? getInstName(c.institution_id) : "—";
    };

    // ── Create enrollment ───────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!institutionId || !departmentId || !courseId || !studentId || !semesterId) {
            setMsg({ type: "error", text: "Please fill all required fields." }); return;
        }
        setLoading(true);
        try {
            await API.post("/enrollment/", {
                institution_id: institutionId, student_id: studentId,
                course_id: courseId,
                faculty_id: facultyId || null,
                semester_id: semesterId, status,
            });
            setMsg({ type: "success", text: `"${getUserName(studentId)}" enrolled in "${getCourseName(courseId)}".` });
            setCourseId(""); setStudentId(""); setFacultyId(""); setSemesterId(""); setStatus("enrolled");
            setTimeout(() => setMsg(null), 4000);
            fetchEnrollments();
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            setMsg({ type: "error", text: detail ?? "Failed to enroll. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // ── Inline status update ────────────────────────────────────────────────────
    const handleStatusChange = async (enrollmentId: string, newStatus: string) => {
        setUpdatingId(enrollmentId);
        try {
            await API.patch(`/enrollment/${enrollmentId}`, { status: newStatus });
            setEnrollments(prev =>
                prev.map(e => e.id === enrollmentId ? { ...e, status: newStatus } : e)
            );
            setMsg({ type: "success", text: `Status changed to "${newStatus}".` });
            setTimeout(() => setMsg(null), 2500);
        } catch {
            setMsg({ type: "error", text: "Failed to update status." });
        } finally {
            setUpdatingId(null);
        }
    };

    // ── Delete enrollment ───────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await API.delete(`/enrollment/${deleteTarget.id}`);
            setMsg({ type: "success", text: "Enrollment removed successfully." });
            fetchEnrollments();
            setTimeout(() => setMsg(null), 3000);
        } catch {
            setMsg({ type: "error", text: "Failed to remove enrollment." });
        } finally {
            setDeleteTarget(null);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="erp-container">
            {deleteTarget && (
                <ConfirmModal
                    title="Remove Enrollment?"
                    message={`Remove "${getUserName(deleteTarget.student_id)}" from "${getCourseName(deleteTarget.course_id)}" (${deleteTarget.semester_id})? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* ── Enroll Form ──────────────────────────────────────── */}
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon"><Plus /></span> Enroll Student in Course
                    </span>
                </div>

                {msg && (
                    <div style={{ padding: '20px 24px 0' }}>
                        <div className={`erp-alert erp-alert-${msg.type}`}>
                            {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {msg.text}
                        </div>
                    </div>
                )}

                <div className="erp-form">
                    {/* Row 1: Institution */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Institution</label>
                            <select value={institutionId} onChange={e => handleInstitutionChange(e.target.value)}>
                                <option value="">Select Institution</option>
                                {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Department */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Department</label>
                            <select value={departmentId} onChange={e => handleDepartmentChange(e.target.value)} disabled={!institutionId}>
                                <option value="">Select Department</option>
                                {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Course + Student */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Course</label>
                            <select value={courseId} onChange={e => setCourseId(e.target.value)} disabled={!departmentId}>
                                <option value="">Select Course</option>
                                {filteredCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="erp-field">
                            <label>Student</label>
                            <select value={studentId} onChange={e => setStudentId(e.target.value)} disabled={!departmentId}>
                                <option value="">Select Student</option>
                                {filteredStudents.map(s => (
                                    <option key={s.user_id} value={s.user_id}>
                                        {getUserName(s.user_id)} — {s.enrollment_number}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Faculty */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Faculty <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.8rem" }}>(optional)</span></label>
                            <select value={facultyId} onChange={e => setFacultyId(e.target.value)} disabled={!departmentId}>
                                <option value="">Select Faculty</option>
                                {filteredFaculties.map(f => (
                                    <option key={f.user_id} value={f.user_id}>
                                        {getUserName(f.user_id)} — {f.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 5: Semester + Initial Status */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Semester</label>
                            <input placeholder="e.g. 2024-SEM1" value={semesterId} onChange={e => setSemesterId(e.target.value)} />
                        </div>
                        <div className="erp-field">
                            <label>Initial Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)}>
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <button className="erp-btn erp-btn-primary" onClick={handleCreate} disabled={loading}>
                            {loading ? (
                                <><RotateCw size={14} className="animate-spin" style={{ marginRight: 8 }} />Enrolling…</>
                            ) : <><Plus size={18} style={{ marginRight: 8 }} /> Create Enrollment</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Enrollment List ──────────────────────────────────────── */}
            <div className="erp-card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon"><ClipboardList /></span> All Enrollments
                    </span>
                    <span className="erp-badge badge-blue">{enrollments.length} total</span>
                </div>

                {enrollments.length === 0 ? (
                    <div className="erp-empty">
                        <div className="erp-empty-icon"><Inbox /></div>
                        <div className="erp-empty-text">No enrollments yet — use the form above to add one.</div>
                    </div>
                ) : (
                    <div className="erp-table-wrap">
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student</th>
                                    <th>Enroll No.</th>
                                    <th>Course</th>
                                    <th>Faculty</th>
                                    <th>Department</th>
                                    <th>Institution</th>
                                    <th>Semester</th>
                                    <th>Status</th>
                                    <th style={{ width: 80, textAlign: "center" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((enr, i) => (
                                    <tr key={enr.id}>
                                        <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>

                                        <td><strong>{getUserName(enr.student_id)}</strong></td>

                                        <td>
                                            <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--brand)", fontWeight: 600 }}>
                                                {getEnrollNo(enr.student_id)}
                                            </span>
                                        </td>

                                        <td>
                                            <span style={{ fontWeight: 600 }}>{getCourseName(enr.course_id)}</span>
                                            <span style={{ marginLeft: 6, fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                                {getCourseCode(enr.course_id)}
                                            </span>
                                        </td>

                                        <td>
                                            {enr.faculty_id ? (
                                                <span>
                                                    <strong>{getUserName(enr.faculty_id)}</strong>
                                                    {getFacultyDesignation(enr.faculty_id) && (
                                                        <span style={{ marginLeft: 5, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                                            ({getFacultyDesignation(enr.faculty_id)})
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>—</span>
                                            )}
                                        </td>

                                        <td style={{ color: "var(--text-secondary)" }}>{getDeptFromCourse(enr.course_id)}</td>

                                        <td>
                                            <span className="erp-badge badge-blue">{getInstFromCourse(enr.course_id)}</span>
                                        </td>

                                        <td>
                                            <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                                                {enr.semester_id}
                                            </span>
                                        </td>

                                        {/* ── Inline status dropdown ── */}
                                        <td>
                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                {updatingId === enr.id && (
                                                    <RotateCw size={12} className="animate-spin" style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                                                )}
                                                <select
                                                    value={enr.status}
                                                    disabled={updatingId === enr.id}
                                                    onChange={e => handleStatusChange(enr.id, e.target.value)}
                                                    style={{
                                                        ...STATUS_STYLES[enr.status],
                                                        padding: "4px 26px 4px 8px",
                                                        borderRadius: "var(--radius-sm, 6px)",
                                                        fontSize: "0.8rem",
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                        cursor: "pointer",
                                                        appearance: "auto",
                                                        outline: "none",
                                                        transition: "all 0.2s",
                                                        opacity: updatingId === enr.id ? 0.5 : 1,
                                                    }}
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s}>
                                                            {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>

                                        <td style={{ textAlign: "center" }}>
                                            <button className="erp-btn erp-btn-danger erp-btn-sm" onClick={() => setDeleteTarget(enr)} style={{ padding: '6px 12px' }}>
                                                <Trash2 size={14} style={{ marginRight: 6 }} /> Delete
                                            </button>
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
