import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../services/api";
import FloatingInput from "../components/FloatingInput";
import "../css/Auth.css";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [forceLoading, setForceLoading] = useState(false);
    const resetToken = searchParams.get("token");

    useEffect(() => {
        if (!resetToken) {
            setValidationError("Invalid or missing reset token");
        }
    }, [resetToken]);

    const { mutate, isLoading, isError, error, isSuccess } = useMutation({
        mutationFn: ({ token, newPassword }) => resetPassword(token, newPassword),
        onSuccess: () => {
            // Show success state for 2 seconds before redirecting
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        },
        onError: (error) => {
            console.error('Password reset failed:', error);
            setForceLoading(false);
        }
    });

    const validateForm = () => {
        if (password.length < 6) {
            setValidationError("Password must be at least 6 characters long");
            return false;
        }
        if (password !== confirmPassword) {
            setValidationError("Passwords do not match");
            return false;
        }
        setValidationError("");
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setForceLoading(true);

        if (!resetToken) {
            setValidationError("Invalid or missing reset token");
            setForceLoading(false);
            return;
        }

        if (!validateForm()) {
            setForceLoading(false);
            return;
        }

        mutate({ token: resetToken, newPassword: password });
    };

    if (isSuccess) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <h1>Password Reset Successful</h1>
                    <p className="reset-message">
                        Your password has been successfully reset. You will be redirected to the login page shortly.
                    </p>
                    <p>
                        <Link to="/login">Click here if you're not redirected</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>Reset Your Password</h1>
                {(isError || validationError) && (
                    <div className="auth-error">
                        {validationError || error?.message || "An error occurred during password reset"}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <FloatingInput
                        label="New Password (min. 6 characters)"
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
                    <FloatingInput
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setValidationError("");
                        }}
                        required
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={forceLoading || !password || !confirmPassword || !resetToken}
                        className={forceLoading ? 'disabled' : ''}
                    >
                        {isLoading ? "Resetting Password..." : "Reset Password"}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>
                        <Link to="/login">Return to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword; 