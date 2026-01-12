import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "./AdminLogin.css";


export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Auth state persistence is handled automatically by Firebase
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            let message = "Failed to login. Please check your credentials.";

            if (err.code === 'auth/invalid-credential') {
                message = "Invalid email or password.";
            } else if (err.code === 'auth/user-not-found') {
                message = "No admin account found with this email.";
            } else if (err.code === 'auth/wrong-password') {
                message = "Incorrect password.";
            } else if (err.code === 'auth/too-many-requests') {
                message = "Too many failed attempts. Please try again later.";
            }

            setError(message);
        } finally {
            setLoading(false);
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
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
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

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Login to Dashboard"}
                    </button>
                </form>

                <Link to="/" className="back-link">
                    ← Back to Website
                </Link>
            </div>
        </div>
    );
}
