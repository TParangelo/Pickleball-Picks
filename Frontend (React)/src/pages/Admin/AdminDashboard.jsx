import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats } from '../../services/api';
import '../../css/admin/Admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState(null);
    
    useEffect(() => {
        const storedAdminData = localStorage.getItem('adminData');
        if (!storedAdminData) {
            navigate('/admin/login');
            return;
        }
        setAdminData(JSON.parse(storedAdminData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    if (!adminData) {
        return <div className="admin-loading">Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Welcome, {adminData.admin_username}</h1>
                <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <h3>Total Users</h3>
                    <p>{adminData.total_users}</p>
                </div>
                <div className="admin-stat-card">
                    <h3>Net Profit</h3>
                    <p>{adminData.net_profit} Dinks</p>
                </div>
                <div className="admin-stat-card">
                    <h3>Total Bets</h3>
                    <p>{adminData.bet_count}</p>
                </div>
                <div className="admin-stat-card">
                    <h3>Admin ID</h3>
                    <p>{adminData.id}</p>
                </div>
            </div>

            <div className="admin-actions">
                <button 
                    className="admin-action-btn"
                    onClick={() => navigate('/admin/matches')}
                >
                    Manage Matches
                </button>
                <button 
                    className="admin-action-btn"
                    onClick={() => navigate('/admin/users')}
                >
                    Manage Users
                </button>
                <button 
                    className="admin-action-btn"
                    onClick={() => navigate('/admin/add-match')}
                >
                    Create Match
                </button>
                <button 
                    className="admin-action-btn"
                    onClick={() => navigate('/admin/add-match-helper')}
                >
                    Create Match Helper
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard; 