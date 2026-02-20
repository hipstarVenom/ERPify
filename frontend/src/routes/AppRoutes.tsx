import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
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


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/student" element={<StudentLayout />} />
      <Route path="/faculty" element={<FacultyLayout />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="institutions" element={<Institutions />} />
        <Route path="departments" element={<Departments />} />
        <Route path="faculty" element={<Faculty />} />
        <Route path="courses" element={<Courses />} />
        <Route path="students" element={<Students />} />
      </Route>
    </Routes>
  );
}