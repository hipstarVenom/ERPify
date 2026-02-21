import { useEffect, useState } from "react";
import API from "../../api/api";
import ConfirmModal from "../../components/ConfirmModal";

interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }
interface Course { id: string; course_name: string; department_id: string; }
interface FacultyRecord { user_id: string; department_id: string; designation: string; }
interface User { id: string; first_name: string; last_name: string; role: string; institution_id: string; }

export default function Faculty() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<FacultyRecord | null>(null);

  useEffect(() => {
    API.get("/institutions/").then((r) => setInstitutions(r.data));
    API.get("/departments/").then((r) => setDepartments(r.data));
    API.get("/courses/").then((r) => setCourses(r.data));
    API.get("/users/").then((r) => setUsers(r.data));
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    const res = await API.get("/faculty/");
    setFacultyList(res.data);
  };

  useEffect(() => {
    setFilteredDepartments(departments.filter((d) => d.institution_id === institutionId));
    setDepartmentId(""); setCourseId("");
  }, [institutionId, departments]);

  useEffect(() => {
    setFilteredCourses(courses.filter((c) => c.department_id === departmentId));
    setCourseId("");
  }, [departmentId, courses]);

  const getUserName = (userId: string) => {
    const u = users.find((u) => u.id === userId);
    return u ? `${u.first_name} ${u.last_name}` : "—";
  };
  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";
  const getInstByDept = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? institutions.find((i) => i.id === dept.institution_id)?.name ?? "—" : "—";
  };

  const handleCreate = async () => {
    if (!institutionId || !departmentId || !courseId || !firstName || !lastName || !designation) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
    setLoading(true);
    try {
      const userRes = await API.post("/users/", {
        first_name: firstName, last_name: lastName,
        role: "faculty", institution_id: institutionId,
      });
      await API.post("/faculty/", {
        user_id: userRes.data.id, department_id: departmentId,
        course_id: courseId, designation,
      });
      setMsg({ type: "success", text: `Faculty "${firstName} ${lastName}" added.` });
      setFirstName(""); setLastName(""); setDesignation("");
      setInstitutionId(""); setDepartmentId(""); setCourseId("");
      setTimeout(() => setMsg(null), 4000);
      fetchFaculty();
      API.get("/users/").then((r) => setUsers(r.data));
    } catch {
      setMsg({ type: "error", text: "Error creating faculty." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/faculty/${deleteTarget.user_id}`);
      setMsg({ type: "success", text: `"${getUserName(deleteTarget.user_id)}" removed.` });
      fetchFaculty();
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to delete faculty." });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          title="Remove Faculty Member?"
          message={`Are you sure you want to remove "${getUserName(deleteTarget.user_id)}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">🎓</span> Add Faculty Member</span>
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
              <label>Assigned Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={!departmentId}>
                <option value="">Select Course</option>
                {filteredCourses.map((c) => <option key={c.id} value={c.id}>{c.course_name}</option>)}
              </select>
            </div>
          </div>
          <div className="erp-form-row">
            <div className="erp-field">
              <label>First Name</label>
              <input placeholder="e.g. John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="erp-field">
              <label>Last Name</label>
              <input placeholder="e.g. Smith" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="erp-form-row">
            <div className="erp-field">
              <label>Designation</label>
              <input
                placeholder="e.g. Professor, Associate Professor"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <div>
            <button className="erp-btn erp-btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? (
                <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 6 }} />Creating…</>
              ) : "+ Add Faculty"}
            </button>
          </div>
        </div>
      </div>

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">📋</span> All Faculty Members</span>
          <span className="erp-badge badge-blue">{facultyList.length} total</span>
        </div>
        {facultyList.length === 0 ? (
          <div className="erp-empty">
            <div className="erp-empty-icon">🎓</div>
            <div className="erp-empty-text">No faculty members added yet</div>
          </div>
        ) : (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Designation</th><th>Department</th><th>Institution</th>
                  <th style={{ width: 80, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {facultyList.map((f, i) => (
                  <tr key={f.user_id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td><strong>{getUserName(f.user_id)}</strong></td>
                    <td><span className="erp-badge badge-amber">{f.designation}</span></td>
                    <td>{getDeptName(f.department_id)}</td>
                    <td><span className="erp-badge badge-blue">{getInstByDept(f.department_id)}</span></td>
                    <td style={{ textAlign: "center" }}>
                      <button className="erp-btn erp-btn-danger" onClick={() => setDeleteTarget(f)}>
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