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

export default function Courses() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [credits, setCredits] = useState<number | "">("");

  useEffect(() => {
    fetchInstitutions();
    fetchDepartments();
  }, []);

  const fetchInstitutions = async () => {
    const res = await API.get("/institutions/");
    setInstitutions(res.data);
  };

  const fetchDepartments = async () => {
    const res = await API.get("/departments/");
    setDepartments(res.data);
  };

  // Filter departments based on selected institution
  useEffect(() => {
    const filtered = departments.filter(
      (dep) => dep.institution_id === institutionId
    );
    setFilteredDepartments(filtered);
    setDepartmentId("");
  }, [institutionId, departments]);

  const handleCreate = async () => {
    if (
      !institutionId ||
      !departmentId ||
      !courseName ||
      !courseCode ||
      !credits
    ) {
      alert("Please fill all fields");
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

      alert("Course created successfully");

      // Reset form
      setCourseName("");
      setCourseCode("");
      setCredits("");
      setInstitutionId("");
      setDepartmentId("");

    } catch (error) {
      console.error(error);
      alert("Error creating course");
    }
  };

  return (
    <div>
      <h2>Create Course</h2>

      {/* Institution */}
      <select
        value={institutionId}
        onChange={(e) => setInstitutionId(e.target.value)}
      >
        <option value="">Select Institution</option>
        {institutions.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>

      {/* Department */}
      <select
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
        disabled={!institutionId}
      >
        <option value="">Select Department</option>
        {filteredDepartments.map((dep) => (
          <option key={dep.id} value={dep.id}>
            {dep.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
      />

      <input
        placeholder="Course Code"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
      />

      <input
        type="number"
        placeholder="Credits"
        value={credits}
        onChange={(e) => setCredits(Number(e.target.value))}
      />

      <button onClick={handleCreate}>Create Course</button>
    </div>
  );
}