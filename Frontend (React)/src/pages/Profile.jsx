import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust the path as necessary
import "../css/Profile.css"
import PicksViewer from "../components/PicksViewer"
import PlayerStats from "../components/PlayerStats"
import { useQueryClient } from '@tanstack/react-query';
import { fetchMatches } from '../services/api';
import { loadCSS } from '../utils/cssLoader';

// Function to prefetch a component
const prefetchComponent = (importFn) => {
  // This triggers webpack/vite to load the chunk
  importFn().catch(() => {});
};

const Profile = () => {
  const { user, logout } = useAuth(); // Accessing user from AuthContext
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load profile CSS
    loadCSS('../css/Profile.css');

    // Prefetch data
    queryClient.prefetchQuery({
      queryKey: ['matches'],
      queryFn: fetchMatches,
    });

    // Prefetch route components
    prefetchComponent(() => import('./Home'));
    prefetchComponent(() => import('./Matches'));
    prefetchComponent(() => import('./Leaderboard'));
    prefetchComponent(() => import('./About'));

    // Prefetch common components
    prefetchComponent(() => import('../components/MatchCardSimple'));
    prefetchComponent(() => import('../components/Pickslip'));

    // Load common CSS files
    loadCSS('../css/Matches.css');
    loadCSS('../css/Home.css');
    loadCSS('../css/Leaderboard.css');

    return () => {
      // Cleanup CSS when component unmounts
      const cssFiles = [
        '../css/Profile.css',
        '../css/Matches.css',
        '../css/Home.css',
        '../css/Leaderboard.css'
      ];
      
      cssFiles.forEach(file => {
        const link = document.querySelector(`link[href="${file}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, [queryClient]);

  const handleLogout = () => {
    logout(); // Calling the logout function to set user to null
    console.log("Logged out successfully.");
    // Optionally, redirect the user to a different page (e.g., home or login page)
    // Example using useHistory (if you're using React Router v5):
    // history.push("/login");
  };

  if (!user) {
    return <div className='blank-profile'>You are logged out</div>; // Handle case when user is null
  }

  return (
    <div className='profile-container'>
      <div className='stats-side'>

        <PlayerStats user={user} logout={logout}/>



      </div>
      <div className='picks-side'>
        <PicksViewer />
      </div>







    </div>
  );
};

export default Profile;
