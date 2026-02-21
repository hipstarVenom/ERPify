import { useEffect, useState } from "react";
import API from "../../api/api";

interface Institution {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  institution_id: string;
}

interface Course {
  id: string;
  course_name: string;
  department_id: string;
}

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

  useEffect(() => {
    API.get("/institutions/").then((r) => setInstitutions(r.data));
    API.get("/departments/").then((r) => setDepartments(r.data));
    API.get("/courses/").then((r) => setCourses(r.data));
  }, []);

  // Filter departments by institution
  useEffect(() => {
    setFilteredDepartments(departments.filter((d) => d.institution_id === institutionId));
    setDepartmentId("");
    setCourseId("");
  }, [institutionId, departments]);

  // Filter courses by department
  useEffect(() => {
    setFilteredCourses(courses.filter((c) => c.department_id === departmentId));
    setCourseId("");
  }, [departmentId, courses]);

  const handleCreate = async () => {
    if (!institutionId || !departmentId || !courseId || !firstName || !lastName || !designation) {
      setMsg({ type: "error", text: "Please fill all fields." });
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create User
      const userRes = await API.post("/users/", {
        first_name: firstName,
        last_name: lastName,
        role: "faculty",
        institution_id: institutionId,
      });

      // Step 2: Create Faculty record
      await API.post("/faculty/", {
        user_id: userRes.data.id,
        department_id: departmentId,
        course_id: courseId,
        designation,
      });

      setMsg({ type: "success", text: `Faculty "${firstName} ${lastName}" created successfully.` });
      setFirstName(""); setLastName(""); setDesignation("");
      setInstitutionId(""); setDepartmentId(""); setCourseId("");
      setTimeout(() => setMsg(null), 4000);
    } catch {
      setMsg({ type: "error", text: "Error creating faculty. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-card">
      <div className="card-header">
        <span className="card-title">
          <span className="card-title-icon">🎓</span> Add Faculty Member
        </span>
      </div>

      {msg && (
        <div className={`erp-alert erp-alert-${msg.type}`} style={{ marginBottom: 16 }}>
          {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
        </div>
      )}

      <div className="erp-form">

        {/* Row 1: Institution + Department */}
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
            <label>Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={!institutionId}
            >
              <option value="">Select Department</option>
              {filteredDepartments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Course */}
        <div className="erp-form-row">
          <div className="erp-field">
            <label>Assigned Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={!departmentId}
            >
              <option value="">Select Course</option>
              {filteredCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.course_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: First + Last Name */}
        <div className="erp-form-row">
          <div className="erp-field">
            <label>First Name</label>
            <input
              placeholder="e.g. John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="erp-field">
            <label>Last Name</label>
            <input
              placeholder="e.g. Smith"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        {/* Row 4: Designation */}
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
                  display: "inline-block",
                  width: 14, height: 14,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  marginRight: 6,
                }} />
                Creating…
              </>
            ) : (
              "+ Add Faculty"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}