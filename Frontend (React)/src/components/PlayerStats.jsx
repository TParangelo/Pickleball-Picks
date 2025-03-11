import React, { useEffect, useRef } from "react";
import "../CSS/PlayerStats.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTokenValidity } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { IoArrowBack } from "react-icons/io5";

const PlayerStats = ({ user, logout, hideLogout }) => {

    const navigate = useNavigate();
    const { login, validUser, setValidUser } = useAuth();
    const hasVerifiedToken = useRef(false);
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const backTo = searchParams.get("backTo");


    const handleLogout = () => {
        logout();
        queryClient.invalidateQueries({ queryKey: ["picks"] });
        navigate("/");
      };

      const { mutate, isLoading } = useMutation({
        mutationFn: fetchTokenValidity,
        mutationKey: ["fetchTokenValidity"],
        onSuccess: (data) => {
          if (!data.isValid) {
            logout();
          } else {
            login(data.user, data.token);
            setValidUser(true);
          }
        },
        onError: (error) => {
          console.error("Error verifying token:", error);
          logout();
        },
        retry: 1,
      });
    
      useEffect(() => {
        
        if (!hideLogout && ((user && !validUser) || (user && !hasVerifiedToken.current))) {
          console.log("Verifying token...");
          mutate();
          hasVerifiedToken.current = true;
        }
      }, [user, mutate, validUser, isLoading, hideLogout]);


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


    return (        
        <div className="stats-card">
            <div className="user-info">

                { hideLogout&& <div 
                    className="icon-button back-to-board-icon"
                    onClick={() => navigate(`/leaderboard?type=${backTo}`)}
                    data-tooltip="Back to Leaderboard"
                >
                    <IoArrowBack />
                  </div>}
                <h1 className="user-name">{user.username} Stats</h1>


            </div>
            

            <div className="under-title">
            
                    <div className="indv-stat">{user.wins + user.losses}
                        <div className="stat-detail">Settled Picks</div>
                    </div>

                    <div className="indv-stat">{user.totalRisked.toLocaleString()}
                        <div className="stat-detail">Dinks Wagered</div>
                    </div>
                    

                    <div className="indv-stat">{user.wins}-{user.losses}
                        <div className="stat-detail">Record (W-L)</div>
                    </div>


                    <div className="indv-stat">{(user.totalWon - user.totalRisked).toLocaleString()}
                        <div className="stat-detail">Net Gain</div>
                    </div>
                </div>

                {!hideLogout && user.ranks && (
                    <div className="leaderboard-spots">
                        <div className="leaderboard-section-title">
                            <div className="leaderboard-text">Leaderboard Placement</div>
                        </div>
                        <div className="list-leaderboard">
                            <div className="global-l" onClick={() => navigate("/leaderboard?type=global_l")}>
                                <div className="global-tag">Global:</div>
                                <div className="scalar">{calcTag(user.ranks.global_rank)}</div>
                            </div>
                            <div className="global-l" onClick={() => navigate("/leaderboard?type=social_l")}>
                                <div className="global-tag">Friends:</div>
                                <div className="scalar">{calcTag(user.ranks.friend_rank)}</div>
                            </div>
                        </div>
                    </div>
                )}

                {!hideLogout && (
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                )}

                
        </div>
    );
  };

export default PlayerStats;
