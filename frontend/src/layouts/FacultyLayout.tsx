// layouts/StudentLayout.tsx
import { useAuth } from "../context/AuthContext";

export default function StudentLayout() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Faculty Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}