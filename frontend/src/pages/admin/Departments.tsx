// src/pages/admin/Departments.tsx
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

export default function Departments() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [institutionId, setInstitutionId] = useState("");

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

  const handleCreate = async () => {
    if (!name || !institutionId) return;

    await API.post("/departments/", {
      name,
      institution_id: institutionId,
    });

    setName("");
    fetchDepartments();
  };

  return (
    <div>
      <h2>Departments</h2>

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

      <input
        placeholder="Department Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleCreate}>Create</button>

      <ul>
        {departments.map((dep) => (
          <li key={dep.id}>{dep.name}</li>
        ))}
      </ul>
    </div>
  );
}