import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Component/Navbar/Navbar";
import Home from "./Component/HomePage/Home";
import AboutUS from "./Component/AboutUs/About";
import Contact from "./Component/Contact/Contact";
import Movements from "./Component/Movements/Movements";
import AdminLogin from "./Component/Admin/AdminLogin";
import AdminDashboard from "./Component/Admin/AdminDashboard";
import ProtectedRoute from "./Component/Admin/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes (no navbar) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public Routes (with navbar) */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/about" element={<><Navbar /><AboutUS /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /></>} />
          <Route path="/movements" element={<><Navbar /><Movements /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;