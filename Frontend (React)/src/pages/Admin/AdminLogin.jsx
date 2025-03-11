import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { adminLogin } from '../../services/api';
import '../../css/admin/Admin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { mutate, isLoading } = useMutation({
        mutationFn: () => adminLogin(username, password),
        onSuccess: (data) => {
            localStorage.setItem('adminToken', data.access_token);
            localStorage.setItem('adminData', JSON.stringify(data.admin));
            navigate('/admin/dashboard');
        },
        onError: (error) => {
            setError(error.message || 'Invalid credentials');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        mutate();
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <h1>Admin Login</h1>
                {error && <div className="admin-error">{error}</div>}
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-form-group">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="admin-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin; 