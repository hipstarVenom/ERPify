import { useEffect, useState } from "react";
import API from "../../api/api";
import ConfirmModal from "../../components/ConfirmModal";
import {
  Users,
  UserPlus,
  Trash2,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  RotateCw
} from "lucide-react";

interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }
interface StudentRecord {
  user_id: string; department_id: string;
  enrollment_number: string; admission_year: number; current_year: number;
}
interface User { id: string; first_name: string; last_name: string; role: string; institution_id: string; }

const YEAR_LABELS: Record<number, string> = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

export default function Students() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [admissionYear, setAdmissionYear] = useState<number | "">("");
  const [currentYear, setCurrentYear] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [studentList, setStudentList] = useState<StudentRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null);

  useEffect(() => {
    API.get("/institutions/").then((r) => setInstitutions(r.data));
    API.get("/departments/").then((r) => setDepartments(r.data));
    API.get("/users/").then((r) => setUsers(r.data));
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await API.get("/students/");
    setStudentList(res.data);
  };

  useEffect(() => {
    setFilteredDepartments(departments.filter((d) => d.institution_id === institutionId));
    setDepartmentId("");
  }, [institutionId, departments]);

  const getUserName = (id: string) => { const u = users.find((u) => u.id === id); return u ? `${u.first_name} ${u.last_name}` : "—"; };
  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";
  const getInstByDept = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? institutions.find((i) => i.id === dept.institution_id)?.name ?? "—" : "—";
  };

  const handleCreate = async () => {
    if (!institutionId || !departmentId || !firstName || !lastName || !enrollmentNumber || !admissionYear || !currentYear) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
    setLoading(true);
    try {
      const userRes = await API.post("/users/", {
        first_name: firstName, last_name: lastName,
        role: "student", institution_id: institutionId,
      });
      await API.post("/students/", {
        user_id: userRes.data.id, department_id: departmentId,
        enrollment_number: enrollmentNumber,
        admission_year: Number(admissionYear), current_year: Number(currentYear),
      });
      setMsg({ type: "success", text: `Student "${firstName} ${lastName}" enrolled.` });
      setFirstName(""); setLastName(""); setEnrollmentNumber("");
      setAdmissionYear(""); setCurrentYear("");
      setInstitutionId(""); setDepartmentId("");
      setTimeout(() => setMsg(null), 4000);
      fetchStudents();
      API.get("/users/").then((r) => setUsers(r.data));
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Error enrolling student.";
      setMsg({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/students/${deleteTarget.user_id}`);
      setMsg({ type: "success", text: `Student removed successfully.` });
      fetchStudents();
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to delete student." });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          title="Remove Student?"
          message={`Are you sure you want to remove "${getUserName(deleteTarget.user_id)}" (${deleteTarget.enrollment_number})? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title">
            <span className="card-title-icon"><UserPlus /></span> Enroll Student
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
              <label>First Name</label>
              <input placeholder="e.g. Alice" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="erp-field">
              <label>Last Name</label>
              <input placeholder="e.g. Brown" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="erp-form-row">
            <div className="erp-field">
              <label>Enrollment Number</label>
              <input placeholder="e.g. CSE2024001" value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} />
            </div>
            <div className="erp-field">
              <label>Admission Year</label>
              <input type="number" placeholder="e.g. 2024" value={admissionYear} onChange={(e) => setAdmissionYear(Number(e.target.value))} />
            </div>
            <div className="erp-field">
              <label>Current Year</label>
              <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))}>
                <option value="">Select Year</option>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>
          <div>
            <button className="erp-btn erp-btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? (
                <><RotateCw size={14} className="animate-spin" style={{ marginRight: 8 }} />Enrolling…</>
              ) : <><UserPlus size={18} style={{ marginRight: 8 }} /> Enroll Student</>}
            </button>
          </div>
        </div>
      </div>

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title">
            <span className="card-title-icon"><ClipboardList /></span> All Students
          </span>
          <span className="erp-badge badge-green">{studentList.length} enrolled</span>
        </div>
        {studentList.length === 0 ? (
          <div className="erp-empty">
            <div className="erp-empty-icon"><Users /></div>
            <div className="erp-empty-text">No students enrolled yet</div>
          </div>
        ) : (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Enrollment No.</th><th>Current Year</th>
                  <th>Admission</th><th>Department</th><th>Institution</th>
                  <th style={{ width: 80, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((s, i) => (
                  <tr key={s.user_id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td><strong>{getUserName(s.user_id)}</strong></td>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--brand)", fontWeight: 600 }}>{s.enrollment_number}</span></td>
                    <td><span className="erp-badge badge-green">{YEAR_LABELS[s.current_year] ?? `Year ${s.current_year}`}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{s.admission_year}</td>
                    <td>{getDeptName(s.department_id)}</td>
                    <td><span className="erp-badge badge-blue">{getInstByDept(s.department_id)}</span></td>
                    <td style={{ textAlign: "center" }}>
                      <button className="erp-btn erp-btn-danger erp-btn-sm" onClick={() => setDeleteTarget(s)} style={{ padding: '6px 12px' }}>
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
    </>
  );
}