import { useEffect, useState } from "react";
import API from "../../api/api";
import ConfirmModal from "../../components/ConfirmModal";

interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }

export default function Departments() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  useEffect(() => {
    API.get("/institutions/").then((r) => setInstitutions(r.data));
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await API.get("/departments/");
    setDepartments(res.data);
  };

  const getInstitutionName = (id: string) =>
    institutions.find((i) => i.id === id)?.name ?? "—";

  const handleCreate = async () => {
    if (!name.trim() || !institutionId) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
    setLoading(true);
    try {
      await API.post("/departments/", { name: name.trim(), institution_id: institutionId });
      setMsg({ type: "success", text: `Department "${name}" created.` });
      setName(""); setInstitutionId("");
      setTimeout(() => setMsg(null), 4000);
      fetchDepartments();
    } catch {
      setMsg({ type: "error", text: "Error creating department." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/departments/${deleteTarget.id}`);
      setMsg({ type: "success", text: `"${deleteTarget.name}" deleted.` });
      fetchDepartments();
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to delete department." });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          title="Delete Department?"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">🗂️</span> Add Department</span>
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
            <button className="erp-btn erp-btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "+ Create Department"}
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
            <div className="erp-empty-text">No departments added yet</div>
          </div>
        ) : (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Department Name</th>
                  <th>Institution</th>
                  <th style={{ width: 80, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dep, i) => (
                  <tr key={dep.id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td><strong>{dep.name}</strong></td>
                    <td><span className="erp-badge badge-blue">{getInstitutionName(dep.institution_id)}</span></td>
                    <td style={{ textAlign: "center" }}>
                      <button className="erp-btn erp-btn-danger" onClick={() => setDeleteTarget(dep)}>
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