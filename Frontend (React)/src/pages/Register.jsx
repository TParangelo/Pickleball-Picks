import React, { useState } from "react";
import "../css/Auth.css";
import { Link, useNavigate } from "react-router-dom";
import FloatingInput from "../components/FloatingInput";
import { createAccount } from "../services/api";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();
    const [forceLoading, setForceLoading] = useState(false);

    const { mutate, isLoading, isError, error } = useMutation({
        mutationFn: (createData) => createAccount(createData.email, createData.username, createData.password),
        onSuccess: (data) => {
            console.log('Account creation successful:', data);
            login(data.user, data.access_token);
            setTimeout(() => {
                navigate("/profile");
            }, 5);
        },
        onError: (error) => {
            console.error('Registration failed:', error);
            setForceLoading(false);
        }
    });

    const validateForm = () => {
        const usernameRegex = /^[a-zA-Z0-9_.]{4,30}$/; // Letters, numbers, underscores, dots (4-30 chars)
        const passwordRegex = /^[a-zA-Z\d@$!%*#?&-]{6,}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!usernameRegex.test(username)) {
            setValidationError("Username must be 4-30 characters and can only contain letters, numbers, underscores, or dots.");
            return false;
        }
        if (!passwordRegex.test(password)) {
            setValidationError("Password must be 6-16 characters long and can only contain letters, numbers, and @$!%*#?&.-");
            return false;
        }
        if (!emailRegex.test(email)) {
            setValidationError("Please enter a valid email address");
            return false;
        }
    

        setValidationError("");
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setForceLoading(true);
        
        if (!email || !username || !password) {
            setValidationError("All fields are required");
            setForceLoading(false);
            return;
        }

        if (!validateForm()) {
            setForceLoading(false);
            return;
        }

        mutate({ email, username, password });
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>Create Account</h1>
                {(isError || validationError) && (
                    <div className="auth-error">
                        {validationError || error?.message || "An error occurred during registration"}
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
                        label="Username (min. 4 characters)"
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setValidationError("");
                        }}
                        required
                        disabled={isLoading}
                        minLength={4}
                        autoComplete="off"
                    />
                    <FloatingInput
                        label="Password (min. 6 characters)"
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setValidationError("");
                        }}
                        required
                        disabled={isLoading}
                        minLength={6}
                    />
                    <button 
                        type="submit" 
                        disabled={forceLoading || !email || !username || !password}
                        className={forceLoading ? 'disabled' : ''}
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
