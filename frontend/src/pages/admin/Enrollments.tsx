import { useEffect, useState } from "react";
import API from "../../api/api";
import ConfirmModal from "../../components/ConfirmModal";

// ── Interfaces ─────────────────────────────────────────────
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
interface User { id: string; first_name: string; last_name: string; }
interface EnrollmentRecord {
    id: string; institution_id: string; student_id: string;
    course_id: string; semester_id: string; status: string;
}

const STATUS_OPTIONS = ["enrolled", "completed", "dropped", "on_hold"];

export default function Enrollments() {
    // ── Reference data ─────────────────────────────────────────
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // ── Form: cascading selects ────────────────────────────────
    const [institutionId, setInstitutionId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [studentId, setStudentId] = useState("");
    const [semesterId, setSemesterId] = useState("");
    const [status, setStatus] = useState("enrolled");

    // ── Derived filtered lists ─────────────────────────────────
    const filteredDepts = departments.filter((d) => d.institution_id === institutionId);
    const filteredCourses = courses.filter((c) => c.department_id === departmentId && c.institution_id === institutionId);
    const filteredStudents = students.filter((s) => s.department_id === departmentId);

    // ── Enrollment list ────────────────────────────────────────
    const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<EnrollmentRecord | null>(null);

    // ── Initial load ───────────────────────────────────────────
    useEffect(() => {
        API.get("/institutions/").then((r) => setInstitutions(r.data));
        API.get("/departments/").then((r) => setDepartments(r.data));
        API.get("/courses/").then((r) => setCourses(r.data));
        API.get("/students/").then((r) => setStudents(r.data));
        API.get("/users/").then((r) => setUsers(r.data));
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        const res = await API.get("/enrollment/");
        setEnrollments(res.data);
    };

    // ── Reset cascades ─────────────────────────────────────────
    const handleInstitutionChange = (id: string) => {
        setInstitutionId(id);
        setDepartmentId(""); setCourseId(""); setStudentId("");
    };
    const handleDepartmentChange = (id: string) => {
        setDepartmentId(id);
        setCourseId(""); setStudentId("");
    };

    // ── Lookup helpers ─────────────────────────────────────────
    const getUserName = (uid: string) => { const u = users.find((u) => u.id === uid); return u ? `${u.first_name} ${u.last_name}` : "—"; };
    const getCourseName = (cid: string) => courses.find((c) => c.id === cid)?.course_name ?? "—";
    const getCourseCode = (cid: string) => courses.find((c) => c.id === cid)?.course_code ?? "—";
    const getDeptName = (did: string) => departments.find((d) => d.id === did)?.name ?? "—";
    const getInstName = (iid: string) => institutions.find((i) => i.id === iid)?.name ?? "—";
    const getStudentDept = (uid: string) => { const s = students.find((s) => s.user_id === uid); return s ? getDeptName(s.department_id) : "—"; };
    const getEnrollmentNo = (uid: string) => students.find((s) => s.user_id === uid)?.enrollment_number ?? "—";

    const getStatusBadge = (s: string) => {
        const map: Record<string, string> = {
            enrolled: "badge-green",
            completed: "badge-blue",
            dropped: "badge-amber",
            on_hold: "",
        };
        return map[s] ?? "";
    };

    // ── Create enrollment ──────────────────────────────────────
    const handleCreate = async () => {
        if (!institutionId || !departmentId || !courseId || !studentId || !semesterId) {
            setMsg({ type: "error", text: "Please fill all fields." });
            return;
        }
        setLoading(true);
        try {
            await API.post("/enrollment/", {
                institution_id: institutionId,
                student_id: studentId,
                course_id: courseId,
                semester_id: semesterId,
                status,
            });
            setMsg({ type: "success", text: `Student enrolled in "${getCourseName(courseId)}" for ${semesterId}.` });
            setCourseId(""); setStudentId(""); setSemesterId(""); setStatus("enrolled");
            setTimeout(() => setMsg(null), 4000);
            fetchEnrollments();
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            setMsg({ type: "error", text: detail ?? "Failed to enroll. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // ── Delete enrollment ──────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await API.delete(`/enrollment/${deleteTarget.id}`);
            setMsg({ type: "success", text: "Enrollment removed." });
            fetchEnrollments();
            setTimeout(() => setMsg(null), 3000);
        } catch {
            setMsg({ type: "error", text: "Failed to remove enrollment." });
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <>
            {deleteTarget && (
                <ConfirmModal
                    title="Remove Enrollment?"
                    message={`Remove "${getUserName(deleteTarget.student_id)}" from "${getCourseName(deleteTarget.course_id)}" (${deleteTarget.semester_id})? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* ── Enroll Form Card ── */}
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon">📋</span> Enroll Student in Course
                    </span>
                </div>

                {msg && (
                    <div className={`erp-alert erp-alert-${msg.type}`} style={{ marginBottom: 16 }}>
                        {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
                    </div>
                )}

                <div className="erp-form">
                    {/* Row 1: Institution */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Institution</label>
                            <select value={institutionId} onChange={(e) => handleInstitutionChange(e.target.value)}>
                                <option value="">Select Institution</option>
                                {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Department */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Department</label>
                            <select
                                value={departmentId}
                                onChange={(e) => handleDepartmentChange(e.target.value)}
                                disabled={!institutionId}
                            >
                                <option value="">Select Department</option>
                                {filteredDepts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Course + Student */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Course</label>
                            <select
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                disabled={!departmentId}
                            >
                                <option value="">Select Course</option>
                                {filteredCourses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.course_name} ({c.course_code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="erp-field">
                            <label>Student</label>
                            <select
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                disabled={!departmentId}
                            >
                                <option value="">Select Student</option>
                                {filteredStudents.map((s) => (
                                    <option key={s.user_id} value={s.user_id}>
                                        {getUserName(s.user_id)} — {s.enrollment_number}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Semester + Status */}
                    <div className="erp-form-row">
                        <div className="erp-field">
                            <label>Semester</label>
                            <input
                                placeholder="e.g. 2024-SEM1"
                                value={semesterId}
                                onChange={(e) => setSemesterId(e.target.value)}
                            />
                        </div>
                        <div className="erp-field">
                            <label>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Submit */}
                    <div>
                        <button
                            className="erp-btn erp-btn-primary"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span style={{
                                        display: "inline-block", width: 14, height: 14,
                                        border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
                                        borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 6,
                                    }} />
                                    Enrolling…
                                </>
                            ) : "+ Create Enrollment"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Enrollment List Card ── */}
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon">📋</span> All Enrollments
                    </span>
                    <span className="erp-badge badge-blue">{enrollments.length} total</span>
                </div>

                {enrollments.length === 0 ? (
                    <div className="erp-empty">
                        <div className="erp-empty-icon">📭</div>
                        <div className="erp-empty-text">No enrollments yet</div>
                    </div>
                ) : (
                    <div className="erp-table-wrap">
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student</th>
                                    <th>Enrollment No.</th>
                                    <th>Course</th>
                                    <th>Department</th>
                                    <th>Institution</th>
                                    <th>Semester</th>
                                    <th>Status</th>
                                    <th style={{ width: 80, textAlign: "center" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((enr, i) => {
                                    // Resolve course → dept → institution chain
                                    const course = courses.find((c) => c.id === enr.course_id);
                                    const deptId = course?.department_id ?? "";
                                    const instId = course?.institution_id ?? enr.institution_id;

                                    return (
                                        <tr key={enr.id}>
                                            <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                                            <td><strong>{getUserName(enr.student_id)}</strong></td>
                                            <td>
                                                <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--brand)", fontWeight: 600 }}>
                                                    {getEnrollmentNo(enr.student_id)}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600 }}>{getCourseName(enr.course_id)}</span>
                                                <span style={{ marginLeft: 6, fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                                    {getCourseCode(enr.course_id)}
                                                </span>
                                            </td>
                                            <td>{getDeptName(deptId)}</td>
                                            <td>
                                                <span className="erp-badge badge-blue">{getInstName(instId)}</span>
                                            </td>
                                            <td>
                                                <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                                                    {enr.semester_id}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`erp-badge ${getStatusBadge(enr.status)}`}
                                                    style={enr.status === "on_hold" ? {
                                                        background: "var(--bg-hover)", color: "var(--text-secondary)",
                                                        border: "1px solid var(--border)",
                                                    } : {}}>
                                                    {enr.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <button
                                                    className="erp-btn erp-btn-danger"
                                                    onClick={() => setDeleteTarget(enr)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
