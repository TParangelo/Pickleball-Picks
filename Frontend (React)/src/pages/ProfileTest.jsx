import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust the path as necessary
import { getUserPicks } from '../services/api';
import "../css/Profile.css"

const Profile = () => {
  const { user, logout } = useAuth(); // Accessing user from AuthContext
  const [userPicks, setUserPicks] = useState(null); // State to store user picks
  const [loading, setLoading] = useState(false); // State for loading
  const [error, setError] = useState(null); // State for error

  useEffect(() => {
    if (user) {
      // Fetch user picks when the user is logged in
      const fetchUserPicks = async () => {
        setLoading(true);
        setError(null); // Reset error state
        try {
          const picks = await getUserPicks();
          setUserPicks(picks); // Store picks in state
        } catch (err) {
          setError("Failed to load user picks.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserPicks();
    }
  }, [user]); // Re-run when the user changes

  const handleLogout = () => {
    logout(); // Calling the logout function to set user to null
    console.log("Logged out successfully.");
    // Optionally, redirect the user to a different page (e.g., home or login page)
    // Example using useHistory (if you're using React Router v5):
    // history.push("/login");
  };

  if (!user) {
    return <div>You are logged out</div>; // Handle case when user is null
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Profile Page</h1>
      <div style={{ marginBottom: '10px' }}>
        <strong>Username:</strong> {user.username}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Email:</strong> {user.email}
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Balance:</strong> {user.balance.toFixed(2)} Dink Coins
      </div>

      {/* Display user picks */}
      {loading && <div>Loading user picks...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {userPicks && (
        <div>
          <h3>Your Picks:</h3>
          <div>
            <h4>Straight Bets:</h4>
            <ul>
              {userPicks.straight_bets.map((bet) => (
                <li key={bet.id}>{bet.odds}</li> // Adjust according to your data structure
              ))}
            </ul>
          </div>
          <div>
            <h4>Parlays:</h4>
            <ul>
              {userPicks.parlays.map((parlay) => (
                <li key={parlay.id}>{parlay.details}</li> // Adjust according to your data structure
              ))}
            </ul>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
