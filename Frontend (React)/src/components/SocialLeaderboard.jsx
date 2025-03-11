import React, { useState, Suspense, useEffect } from "react";
import "../css/SocialLeaderboard.css"; // Import your CSS for styling
import { useNavigate } from "react-router-dom";

// Lazy load components and icons
const FriendManagement = React.lazy(() => import("./FriendManagement"));
const SearchBar = React.lazy(() => import("./SearchBar"));
const MdGroupAdd = React.lazy(() => 
  import('react-icons/md').then(module => ({
    default: module.MdGroupAdd
  }))
);
const FaGlobeAmericas = React.lazy(() => 
  import('react-icons/fa').then(module => ({
    default: module.FaGlobeAmericas
  }))
);

// Fallback components
const IconFallback = () => <span className="icon-placeholder" style={{ width: '2.5rem', height: '2.5rem' }} />;
const ComponentFallback = () => <div className="loading-placeholder">Loading...</div>;

// SocialLeaderboard component
const SocialLeaderboard = ({ players, setLeaderboardType, LeaderboardType }) => {
  
  const [manageFriends, setManageFriends] = useState(false)
  const navigate = useNavigate();
  
  // Prefetch components when SocialLeaderboard mounts
  useEffect(() => {
    const prefetchComponents = () => {
      // Create an array of import promises
      const prefetchPromises = [
        import("./FriendManagement"),
        import("./SearchBar")
      ];

      // Execute all prefetch promises
      Promise.all(prefetchPromises).catch(() => {
        // Silent catch - prefetch failures shouldn't affect the user experience
      });
    };

    prefetchComponents();
  }, []); // Empty dependency array means this runs once on mount

    const calcTag = (value) =>
        {
          if(value===1){
              return "1st"
          }
          if(value===2){
              return "2nd"
          }
          if(value===3){
              return "3rd"
          }
          return(value+"th")
        }
        const handleFriends = () => {
          setManageFriends(true)
        }

        const handleGlobal = () => {
          setLeaderboardType((prev) => (prev === "global_l" ? "social_l" : "global_l"))
        }

  return (
    <div className="social-leaderboard-container">
      {manageFriends ? (
        <Suspense fallback={<ComponentFallback />}>
          <FriendManagement setManageFriend={setManageFriends} />
        </Suspense>
      ) : (
        <>
        <div className="top-social-leaderboard">
          <Suspense fallback={<IconFallback />}>
            <div 
              className="icon-button globe-icon"
              onClick={() => handleGlobal()}
              data-tooltip="View Global Leaderboard"
            >
              <FaGlobeAmericas />
            </div>
          </Suspense>
          <h1 className="leader-title">Social Leaderboard</h1>
          <Suspense fallback={<IconFallback />}>
            <div 
              className="icon-button add-friend-icon"
              onClick={handleFriends}
              data-tooltip="Add Friends"
            >
              <MdGroupAdd />
            </div>
          </Suspense>
        </div>

        <div className="podium">
          {/* Display the top 3 players in podium positions */}
          {players.slice(0, 3).map((player, index) => (
            <div
              key={player.id}
              onClick={() => navigate(`/user/${player.username}?backTo=social_l`)}
              className={`podium ${index === 0 ? "first" : index === 1 ? "second" : "third"}`}
            >
              <div className="player-info">
                <div className="player-username">{player.username}</div>
                <div className="player-balance">{player.balance.toLocaleString()} Dinks</div>
              </div>
            </div>
          ))}
        </div>

        <div className="leaderboard-list-social">
          <ul className="under-podium">
            {/* Display remaining players below the podium */}
            {players.slice(3).map((player, index) => (
              <li key={player.id} onClick={() => navigate(`/user/${player.username}?backTo=social_l`)} className="player-item-social">
                <div className="social-under-left">
                  <div className="player-rank">{index + 4}.</div>
                  <div className="player-username">{player.username}</div>
                  </div>
                
                <div className="player-balance">{player.balance.toLocaleString()} Dinks</div>
              </li>
            ))}
          </ul>
        </div>
        </>
        )}
    </div>
  );
};

export default SocialLeaderboard;
