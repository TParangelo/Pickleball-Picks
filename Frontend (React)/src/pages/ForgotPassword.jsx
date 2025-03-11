import React, { useState } from "react";
import "../css/Auth.css";
import { Link } from "react-router-dom";
import FloatingInput from "../components/FloatingInput";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [resetRequested, setResetRequested] = useState(false);
    const [forceLoading, setForceLoading] = useState(false);

    const { mutate, isLoading, isError, error } = useMutation({
        mutationFn: (email) => requestPasswordReset(email),
        onSuccess: () => {
            setResetRequested(true);
            setForceLoading(false);
        },
        onError: (error) => {
            console.error('Password reset request failed:', error);
            setForceLoading(false);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setForceLoading(true);
        if (!email) {
            setForceLoading(false);
            return;
        }
        mutate(email);
    };

    if (resetRequested) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <h1>Check Your Email</h1>
                    <p className="reset-message">
                        If an account exists for {email}, you will receive a password reset link shortly.
                    </p>
                    <p>
                        <Link to="/login">Return to Login</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>Reset Password</h1>
                {isError && (
                    <div className="auth-error">
                        {error?.message || "An error occurred while requesting password reset"}
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
                    />
                    <button 
                        type="submit" 
                        disabled={forceLoading || !email}
                        className={forceLoading ? 'disabled' : ''}
                    >
                        {isLoading ? "Requesting Reset..." : "Reset Password"}
                    </button>
                </form>
                <p>
                    Remember your password? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword; 