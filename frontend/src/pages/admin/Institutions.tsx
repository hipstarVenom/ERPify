// src/pages/admin/Institutions.tsx
import { useEffect, useState } from "react";
import API from "../../api/api";

interface Institution {
  id: string;
  name: string;
}

export default function Institutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [name, setName] = useState("");

  const fetchInstitutions = async () => {
    const res = await API.get("/institutions");
    setInstitutions(res.data);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleCreate = async () => {
    if (!name) return;

    await API.post("/institutions", { name });
    setName("");
    fetchInstitutions();
  };

  return (
    <div>
      <h2>Institutions</h2>

      <input
        placeholder="Institution Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleCreate}>Create</button>

      <ul>
        {institutions.map((inst) => (
          <li key={inst.id}>{inst.name}</li>
        ))}
      </ul>
    </div>
  );
}