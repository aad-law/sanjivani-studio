import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AdminLogin.css";

// Static admin credentials
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Store authentication in localStorage
            localStorage.setItem("isAdminAuthenticated", "true");
            localStorage.setItem("adminLoginTime", Date.now().toString());
            navigate("/admin/dashboard");
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>Admin Login</h1>
                    <p>Sanjivani Studios Dashboard</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        Login to Dashboard
                    </button>
                </form>

                <Link to="/" className="back-link">
                    ← Back to Website
                </Link>
            </div>
        </div>
    );
}
