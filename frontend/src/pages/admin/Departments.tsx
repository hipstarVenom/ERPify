import { useEffect, useState } from "react";
import API from "../../api/api";

interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }

export default function Departments() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    API.get("/institutions/").then((r) => setInstitutions(r.data));
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await API.get("/departments/");
    setDepartments(res.data);
  };

  const handleCreate = async () => {
    if (!name.trim() || !institutionId) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
    try {
      await API.post("/departments/", { name: name.trim(), institution_id: institutionId });
      setName("");
      setMsg({ type: "success", text: `Department "${name}" created.` });
      fetchDepartments();
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to create department." });
    }
  };

  const getInstitutionName = (id: string) =>
    institutions.find((i) => i.id === id)?.name ?? "—";

  return (
    <>
      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">🗂️</span> Add Department</span>
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
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="erp-field">
              <label>Department Name</label>
              <input
                placeholder="e.g. Computer Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <div>
            <button className="erp-btn erp-btn-primary" onClick={handleCreate}>
              + Create Department
            </button>
          </div>
        </div>
      </div>

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">📋</span> All Departments</span>
          <span className="erp-badge badge-blue">{departments.length} total</span>
        </div>
        {departments.length === 0 ? (
          <div className="erp-empty">
            <div className="erp-empty-icon">🗂️</div>
            <div className="erp-empty-text">No departments yet</div>
          </div>
        ) : (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr><th>#</th><th>Department</th><th>Institution</th></tr>
              </thead>
              <tbody>
                {departments.map((dep, i) => (
                  <tr key={dep.id}>
                    <td>{i + 1}</td>
                    <td><strong>{dep.name}</strong></td>
                    <td><span className="erp-badge badge-blue">{getInstitutionName(dep.institution_id)}</span></td>
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