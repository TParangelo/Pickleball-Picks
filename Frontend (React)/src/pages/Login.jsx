import React, { useState } from "react";
import "../css/Auth.css"; // Reuse styles for both login and register
import { Link, useNavigate } from "react-router-dom";

import FloatingInput from "../components/FloatingInput";
import { fetchLogin } from "../services/api";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();
    const [forceLoading, setForceLoading] = useState(false);

    const { mutate, isLoading, isError, error } = useMutation({
        mutationFn: (loginData) => fetchLogin(loginData.email, loginData.password),
        onSuccess: (data) => {
            console.log('Login successful:', data);
            login(data.user, data.access_token);
            setTimeout(() => {
                navigate("/profile");
            }, 5);
        },
        onError: (error) => {
            console.error('Login failed:', error);
            setForceLoading(false);
        }
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setForceLoading(true);
        if (!email || !password) {
            return;
        }
        mutate({ email, password });
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>Login</h1>
                {isError && (
                    <div className="auth-error">
                        {error?.message || "Invalid email or password"}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <FloatingInput
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="email"
                    />
                    <FloatingInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                    <button 
                        type="submit" 
                        disabled={forceLoading || !email || !password}
                        className={forceLoading ? 'disabled' : ''}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                    <p>
                        <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
