import { useEffect, useState } from "react";
import API from "../../api/api";
import ConfirmModal from "../../components/ConfirmModal";

interface Institution { id: string; name: string; }

export default function Institutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);

  const fetchInstitutions = async () => {
    const res = await API.get("/institutions");
    setInstitutions(res.data);
  };

  useEffect(() => { fetchInstitutions(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await API.post("/institutions", { name: name.trim() });
      setName("");
      setMsg({ type: "success", text: `Institution "${name}" created.` });
      fetchInstitutions();
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to create institution." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/institutions/${deleteTarget.id}`);
      setMsg({ type: "success", text: `"${deleteTarget.name}" deleted.` });
      fetchInstitutions();
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to delete institution." });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          title="Delete Institution?"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Add Form */}
      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">🏛️</span> Add Institution</span>
        </div>

        {msg && (
          <div className={`erp-alert erp-alert-${msg.type}`} style={{ marginBottom: 14 }}>
            {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
          </div>
        )}

        <div className="erp-form">
          <div className="erp-form-row">
            <div className="erp-field">
              <label>Institution Name</label>
              <input
                placeholder="e.g. MIT"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <div>
            <button className="erp-btn erp-btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "+ Create Institution"}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="erp-card">
        <div className="card-header">
          <span className="card-title"><span className="card-title-icon">📋</span> All Institutions</span>
          <span className="erp-badge badge-blue">{institutions.length} total</span>
        </div>
        {institutions.length === 0 ? (
          <div className="erp-empty">
            <div className="erp-empty-icon">🏛️</div>
            <div className="erp-empty-text">No institutions yet</div>
          </div>
        ) : (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th style={{ width: 80, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst, i) => (
                  <tr key={inst.id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td><strong>{inst.name}</strong></td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="erp-btn erp-btn-danger"
                        onClick={() => setDeleteTarget(inst)}
                      >
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