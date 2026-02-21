import { useEffect, useState } from "react";
import API from "../../api/api";

interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }

export default function Students() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [admissionYear, setAdmissionYear] = useState<number | "">("");
  const [currentYear, setCurrentYear] = useState<number | "">("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    API.get("/institutions/").then((r) => setInstitutions(r.data));
    API.get("/departments/").then((r) => setDepartments(r.data));
  }, []);

  useEffect(() => {
    setFilteredDepts(departments.filter((d) => d.institution_id === institutionId));
    setDepartmentId("");
  }, [institutionId, departments]);

  const handleCreate = async () => {
    if (!institutionId || !departmentId || !firstName || !lastName || !enrollmentNumber || !admissionYear || !currentYear) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
    try {
      const userRes = await API.post("/users/", {
        first_name: firstName,
        last_name: lastName,
        role: "student",
        institution_id: institutionId,
      });
      await API.post("/students/", {
        user_id: userRes.data.id,
        department_id: departmentId,
        enrollment_number: enrollmentNumber,
        admission_year: Number(admissionYear),
        current_year: Number(currentYear),
      });
      setMsg({ type: "success", text: `Student "${firstName} ${lastName}" created.` });
      setFirstName(""); setLastName(""); setEnrollmentNumber("");
      setAdmissionYear(""); setCurrentYear("");
      setInstitutionId(""); setDepartmentId("");
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Error creating student." });
    }
  };

  return (
    <div className="erp-card">
      <div className="card-header">
        <span className="card-title"><span className="card-title-icon">👥</span> Enroll Student</span>
      </div>

      {msg && (
        <div className={`erp-alert erp-alert-${msg.type}`} style={{ marginBottom: 14 }}>
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
              {filteredDepts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
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
            <input type="number" placeholder="1 – 4" value={currentYear} min={1} max={4} onChange={(e) => setCurrentYear(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <button className="erp-btn erp-btn-primary" onClick={handleCreate}>
            + Enroll Student
          </button>
        </div>
      </div>
    </div>
  );
}