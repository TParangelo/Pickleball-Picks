import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PlayerStats from '../components/PlayerStats';
import { fetchUserByUsername } from '../services/api';

const User = () => {
    const { username } = useParams();

    const { data: userData, isLoading, error } = useQuery({
        queryKey: ['user', username],
        queryFn: () => fetchUserByUsername(username),
        enabled: !!username,
    });

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                color: 'white' 
            }}>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                color: 'white' 
            }}>
                Error loading user data
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <PlayerStats user={userData} hideLogout={true} />
        </div>
    );
};

export default User;
