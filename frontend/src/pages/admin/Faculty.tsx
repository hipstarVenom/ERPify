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

  useEffect(() => {
    fetchInstitutions();
    fetchDepartments();
    fetchCourses();
  }, []);

  const fetchInstitutions = async () => {
    const res = await API.get("/institutions/");
    setInstitutions(res.data);
  };

  const fetchDepartments = async () => {
    const res = await API.get("/departments/");
    setDepartments(res.data);
  };

  const fetchCourses = async () => {
    const res = await API.get("/courses/");
    setCourses(res.data);
  };

  // Filter departments
  useEffect(() => {
    const filtered = departments.filter(
      (dep) => dep.institution_id === institutionId
    );
    setFilteredDepartments(filtered);
    setDepartmentId("");
    setCourseId("");
  }, [institutionId, departments]);

  // Filter courses
  useEffect(() => {
    const filtered = courses.filter(
      (course) => course.department_id === departmentId
    );
    setFilteredCourses(filtered);
    setCourseId("");
  }, [departmentId, courses]);

  const handleCreate = async () => {
    if (
      !institutionId ||
      !departmentId ||
      !courseId ||
      !firstName ||
      !lastName ||
      !designation
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create User
      const userRes = await API.post("/users/", {
        first_name: firstName,
        last_name: lastName,
        role: "faculty",
        institution_id: institutionId,
      });

      const userId = userRes.data.id;

      // Step 2: Create Faculty
      await API.post("/faculty/", {
        user_id: userId,
        department_id: departmentId,
        course_id: courseId,
        designation,
      });

      alert("Faculty created successfully");

      setFirstName("");
      setLastName("");
      setDesignation("");
      setInstitutionId("");
      setDepartmentId("");
      setCourseId("");

    } catch (error) {
      console.error(error);
      alert("Error creating faculty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create Faculty</h2>

      <div className="form-grid">

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

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          disabled={!departmentId}
        >
          <option value="">Select Course</option>
          {filteredCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_name}
            </option>
          ))}
        </select>

        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          placeholder="Designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />

        <button onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create Faculty"}
        </button>

      </div>
    </div>
  );
}