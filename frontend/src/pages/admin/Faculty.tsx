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

export default function Faculty() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  const [institutionId, setInstitutionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");

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
      !firstName ||
      !lastName ||
      !designation
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      // 🔹 Step 1: Create User
      const userRes = await API.post("/users/", {
        first_name: firstName,
        last_name: lastName,
        role: "faculty",
        institution_id: institutionId,
      });

      const userId = userRes.data.id;

      // 🔹 Step 2: Create Faculty
      await API.post("/faculty/", {
        user_id: userId,
        department_id: departmentId,
        designation: designation,
      });

      alert("Faculty created successfully");

      // Reset form
      setFirstName("");
      setLastName("");
      setDesignation("");
      setInstitutionId("");
      setDepartmentId("");

    } catch (error) {
      console.error(error);
      alert("Error creating faculty");
    }
  };

  return (
    <div>
      <h2>Create Faculty</h2>

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
        placeholder="Designation (e.g., Professor)"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
      />

      <button onClick={handleCreate}>Create Faculty</button>
    </div>
  );
}