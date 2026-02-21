import { useEffect, useState } from "react";
import API from "../../api/api";

interface Institution { id: string; name: string; }
interface Department { id: string; name: string; institution_id: string; }

export default function Courses() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepts, setFilteredDepts] = useState<Department[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [credits, setCredits] = useState<number | "">("");
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
    if (!institutionId || !departmentId || !courseName || !courseCode || !credits) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
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
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Error creating course." });
    }
  };

  return (
    <div className="erp-card">
      <div className="card-header">
        <span className="card-title"><span className="card-title-icon">📚</span> Add Course</span>
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
            <input type="number" placeholder="e.g. 4" value={credits} onChange={(e) => setCredits(Number(e.target.value))} min={1} max={10} />
          </div>
        </div>

        <div>
          <button className="erp-btn erp-btn-primary" onClick={handleCreate}>
            + Create Course
          </button>
        </div>
      </div>
    </div>
  );
}