import { useEffect, useState } from "react";
import API from "../../api/api";
import ConfirmModal from "../../components/ConfirmModal";

interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }

interface CourseRecord {
  id: string;
  institution_id: string;
  department_id: string;
  course_name: string;
  course_code: string;
  credits: number;
}

export default function Courses() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [credits, setCredits] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [courseList, setCourseList] = useState<CourseRecord[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CourseRecord | null>(null);

  useEffect(() => {
    API.get("/institutions/").then((r) => setInstitutions(r.data));
    API.get("/departments/").then((r) => setDepartments(r.data));
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await API.get("/courses/");
    setCourseList(res.data);
  };

  useEffect(() => {
    setFilteredDepartments(departments.filter((d) => d.institution_id === institutionId));
    setDepartmentId("");
  }, [institutionId, departments]);

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";
  const getInstName = (id: string) => institutions.find((i) => i.id === id)?.name ?? "—";
  const getCreditBadge = (c: number) => c <= 2 ? "badge-green" : c <= 4 ? "badge-blue" : "badge-amber";

  const handleCreate = async () => {
    if (!institutionId || !departmentId || !courseName || !courseCode || !credits) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
    setLoading(true);
    try {
      await API.post("/courses/", {
        institution_id: institutionId,
        department_id: departmentId,
        course_name: courseName,
        course_code: courseCode,
        credits: Number(credits),
      });
      setMsg({ type: "success", text: `Course "${courseName}" created.` });
      setCourseName(""); setCourseCode(""); setCredits("");
      setInstitutionId(""); setDepartmentId("");
      setTimeout(() => setMsg(null), 4000);
      fetchCourses();
    } catch {
      setMsg({ type: "error", text: "Error creating course." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/courses/${deleteTarget.id}`);
      setMsg({ type: "success", text: `"${deleteTarget.course_name}" deleted.` });
      fetchCourses();
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to delete course." });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          title="Delete Course?"
          message={`Are you sure you want to delete "${deleteTarget.course_name} (${deleteTarget.course_code})"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">📚</span> Add Course</span>
        </div>

        {msg && (
          <div className={`erp-alert erp-alert-${msg.type}`} style={{ marginBottom: 16 }}>
            {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
          </div>
        )}

        <div className="erp-form">
          <div className="erp-form-row">
            <div className="erp-field">
              <label>Institution</label>
              <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
                <option value="">Select Institution</option>
                {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="erp-field">
              <label>Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={!institutionId}>
                <option value="">Select Department</option>
                {filteredDepartments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="erp-form-row">
            <div className="erp-field">
              <label>Course Name</label>
              <input placeholder="e.g. Data Structures" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
            </div>
            <div className="erp-field">
              <label>Course Code</label>
              <input placeholder="e.g. CS201" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
            </div>
          </div>
          <div className="erp-form-row">
            <div className="erp-field">
              <label>Credits</label>
              <select value={credits} onChange={(e) => setCredits(Number(e.target.value))}>
                <option value="">Select Credits</option>
                {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c} Credit{c > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
          <div>
            <button className="erp-btn erp-btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "+ Create Course"}
            </button>
          </div>
        </div>
      </div>

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">📋</span> All Courses</span>
          <span className="erp-badge badge-blue">{courseList.length} total</span>
        </div>
        {courseList.length === 0 ? (
          <div className="erp-empty">
            <div className="erp-empty-icon">📚</div>
            <div className="erp-empty-text">No courses added yet</div>
          </div>
        ) : (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Credits</th>
                  <th>Department</th>
                  <th>Institution</th>
                  <th style={{ width: 80, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {courseList.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td><strong>{c.course_name}</strong></td>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--brand)", fontWeight: 600 }}>{c.course_code}</span></td>
                    <td><span className={`erp-badge ${getCreditBadge(c.credits)}`}>{c.credits} cr</span></td>
                    <td>{getDeptName(c.department_id)}</td>
                    <td><span className="erp-badge badge-blue">{getInstName(c.institution_id)}</span></td>
                    <td style={{ textAlign: "center" }}>
                      <button className="erp-btn erp-btn-danger" onClick={() => setDeleteTarget(c)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}