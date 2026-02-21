import { useEffect, useState } from "react";
import API from "../../api/api";

interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }

export default function Faculty() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
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
    if (!institutionId || !departmentId || !firstName || !lastName || !designation) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
    try {
      const userRes = await API.post("/users/", {
        first_name: firstName,
        last_name: lastName,
        role: "faculty",
        institution_id: institutionId,
      });
      await API.post("/faculty/", {
        user_id: userRes.data.id,
        department_id: departmentId,
        designation,
      });
      setMsg({ type: "success", text: `Faculty "${firstName} ${lastName}" created.` });
      setFirstName(""); setLastName(""); setDesignation("");
      setInstitutionId(""); setDepartmentId("");
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Error creating faculty." });
    }
  };

  return (
    <div className="erp-card">
      <div className="card-header">
        <span className="card-title"><span className="card-title-icon">🎓</span> Add Faculty Member</span>
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
            <input placeholder="e.g. Professor, Associate Professor" value={designation} onChange={(e) => setDesignation(e.target.value)} />
          </div>
        </div>

        <div>
          <button className="erp-btn erp-btn-primary" onClick={handleCreate}>
            + Add Faculty
          </button>
        </div>
      </div>
    </div>
  );
}