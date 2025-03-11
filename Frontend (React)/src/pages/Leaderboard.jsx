import React, { useState, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "../services/api";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an AuthContext
import SocialLeaderboard from "../components/SocialLeaderboard";
import "../css/Leaderboard.css"; // Make sure to create this CSS file for styling
import { useSearchParams, useNavigate } from "react-router-dom";
// Lazy load the icon
const BsFillPeopleFill = React.lazy(() => 
  import('react-icons/bs').then(module => ({
    default: module.BsFillPeopleFill
  }))
);

// Icon fallback component
const IconFallback = () => <span className="icon-placeholder" style={{ width: '2.5rem', height: '2.5rem' }} />;

function Leaderboard() {
    const { user } = useAuth(); // Accessing user from AuthContext
    const [leaderboardType, setLeaderboardType] = useState(user? "social_l" :"global_l"); // Default to "global_l"
    const [searchParams] = useSearchParams();
    const l_type = searchParams.get("type");
    const navigate = useNavigate();

    useEffect(() => {
        if (l_type) {
            setLeaderboardType(l_type);
        }
    }, [l_type]);


    // Fetch leaderboard data based on the selected type (global_l or social_l)
    const { data, error, isLoading } = useQuery({
        queryKey: [leaderboardType],
        queryFn: () => fetchLeaderboard(leaderboardType), // Fetch data based on leaderboardType
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 5,
    });

    const toggleLeaderboard = () => {
        // Toggle between 'global_l' and 'social_l' leaderboards
        setLeaderboardType((prev) => (prev === "global_l" ? "social_l" : "global_l"));
    };

    // If the user is not signed in, only show the global leaderboard
    if (isLoading) return <p>Loading Leaderboard...</p>;
    if (error) return <p>Error loading Leaderboard: {error.message}</p>;

    // Choose the correct leaderboard data based on the current leaderboard type
    const leaderboard = data ? data[leaderboardType] : [];

    // If user is not signed in, only show global leaderboard
    if (!user || leaderboardType === "global_l") {
        return (
            <div className="global-leader-page">

            <div className="Leaderboard-container2">
            <div className="top-social-leaderboard">
                <div>{user && (
                  <Suspense fallback={<IconFallback />}>
                    <div 
                      className="icon-button globe-icon"
                      onClick={() => toggleLeaderboard()}
                      data-tooltip={leaderboardType === "global_l" ? "View Social Leaderboard" : "View Global Leaderboard"}
                    >
                      <BsFillPeopleFill />
                    </div>
                  </Suspense>
                )}</div>
                <h1 className="leader-title">Global Leaderboard</h1>
                <div>{user && <div style={{ width: '2.8rem' }}></div>}</div>
            </div>
                <div className="leader-row-titles">
                            <div className="left-leader">Username</div>
                            <div className="right-side3">Balance</div> 
                </div>
                <ul className="global-list">
                    {leaderboard.map((user, index) => (
                        <li key={user.id} className="leader-row" onClick={() => navigate(`/user/${user.username}?backTo=global_l`)}>
                            <div className="social-under-left">
                            <div className="player-rank">{index+1}.</div>
                            <div className="player-username">{user.username}</div> 
                            </div>
                            
                            <div className="right-side2">{user.balance.toLocaleString()}</div> 
                        </li>
                    ))}
                </ul>
            </div>
            </div>
        );
    }

    // If the user is signed in, show both global and social leaderboards with a toggle button
    return (
        <div className="global-leader-page">
        <div className="Leaderboard-container">


            <SocialLeaderboard players={leaderboard} leaderboardType={leaderboardType} setLeaderboardType={setLeaderboardType} />
        </div>
        </div>
    );
}

export default Leaderboard;
