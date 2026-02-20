import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="portal-title">ERPIFY</h1>

      <div className="role-buttons">
        <button className="role-btn" onClick={() => navigate("/login/student")}>
          Student
        </button>
        <button className="role-btn" onClick={() => navigate("/login/faculty")}>
          Faculty
        </button>
        <button className="role-btn" onClick={() => navigate("/login/admin")}>
          Admin
        </button>
      </div>
    </div>
  );
}