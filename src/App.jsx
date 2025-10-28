import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Student from "./components/Student";
import Admin from "./components/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/student" element={<Student />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
