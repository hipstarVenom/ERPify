import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import StudentLayout from "../layouts/StudentLayout";
import FacultyLayout from "../layouts/FacultyLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Institutions from "../pages/admin/Institutions";
import Students from "../pages/admin/Students";
import Faculty from "../pages/admin/Faculty";
import Courses from "../pages/admin/Courses";
import Departments from "../pages/admin/Departments";
import Enrollments from "../pages/admin/Enrollments";
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import FacultyAttendance from "../pages/faculty/FacultyAttendance";
import AttendanceHistory from "../pages/faculty/AttendanceHistory";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student" element={<StudentLayout />} />
      <Route path="/faculty" element={<FacultyLayout />}>
        <Route index element={<FacultyDashboard />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="history" element={<AttendanceHistory />} />
      </Route>

      {/* Admin portal — nested routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="institutions" element={<Institutions />} />
        <Route path="departments" element={<Departments />} />
        <Route path="faculty" element={<Faculty />} />
        <Route path="courses" element={<Courses />} />
        <Route path="students" element={<Students />} />
        <Route path="enrollments" element={<Enrollments />} />
      </Route>
    </Routes>
  );
}
