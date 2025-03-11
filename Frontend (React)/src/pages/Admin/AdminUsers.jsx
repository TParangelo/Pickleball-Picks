import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminUsers, updateUserBalance } from '../../services/api';
import '../../css/admin/Admin.css';

const AdminUsers = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');

    // Check for admin authentication
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Fetch users data
    const { data: users, isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: fetchAdminUsers,
    });

    // Update user balance mutation
    const updateBalanceMutation = useMutation({
        mutationFn: ({ userId, newBalance }) => updateUserBalance(userId, newBalance),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
        }
    });

    const handleUpdateBalance = async (userId, currentBalance) => {
        const newBalance = prompt('Enter new balance:', currentBalance);
        if (newBalance === null) return;

        const balanceNum = parseInt(newBalance);
        if (isNaN(balanceNum)) {
            alert('Please enter a valid number');
            return;
        }

        try {
            await updateBalanceMutation.mutateAsync({ userId, newBalance: balanceNum });
            alert('Balance updated successfully!');
        } catch (error) {
            console.error('Error updating balance:', error);
            alert('Failed to update balance. Please try again.');
        }
    };

    // Filter users based on search query
    const filteredUsers = users?.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toString().includes(searchQuery)
    ) || [];

    if (isLoading) return <div className="admin-loading">Loading users...</div>;
    if (error) return <div className="admin-error">Error loading users: {error.message}</div>;

    return (
        <div className="admin-users">
            <div className="admin-header">
                <h1>Manage Users</h1>
                <button onClick={() => navigate('/admin/dashboard')} className="admin-back-btn">
                    Back to Dashboard
                </button>
            </div>

            <div className="admin-controls">
                <div className="admin-search">
                    <input
                        type="text"
                        placeholder="Search by username or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                    />
                </div>
            </div>

            <div className="admin-users-grid">
                {filteredUsers.length === 0 ? (
                    <div className="no-users">No users found</div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user.id} className="admin-user-card">
                            <div className="user-info-admin">
                                <div className="user-header-admin">
                                    <span className="user-id-admin">ID: {user.id}</span>
                                    <span className="user-username-admin">{user.username}</span>
                                </div>
                                <div className="user-balance-admin">
                                    Balance: {user.balance.toLocaleString()}
                                </div>
                            </div>
                            <div className="user-actions">
                                <button
                                    className="update-balance-btn"
                                    onClick={() => handleUpdateBalance(user.id, user.balance)}
                                >
                                    Update Balance
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminUsers; 