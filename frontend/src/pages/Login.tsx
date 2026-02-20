import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/users/login", {
        first_name: firstName,
        last_name: lastName,
        role,
      });

      login(res.data.role);
      navigate(`/${res.data.role}`);
    } catch (error) {
      alert("User not found");
    }
  };

  return (
    <div className="container">
      <h2>{role?.toUpperCase()} Login</h2>

      <br /><br />

      <input
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}