import React from "react";
import { useState, useEffect } from "react";
import { useCurPicks } from "../contexts/CurPicks";
import "../css/PickSlip.css"; // Ensure styling
import { useAuth } from "../contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitPicks } from "../services/api";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useNavigate } from "react-router-dom";


const PickSlip = ({ matches, userId = 0 }) => {
  const { picks, updatePick } = useCurPicks();
  const [wager, setWager] = useState(100); // Single wager for all picks
  const { user, updateUserBalance, setValidUser } = useAuth();
  const { clearPicks, removePick } = useCurPicks();
  const [isLoadingForced, setIsLoadingForced] = useState(false);
  const [isPickslipVisible, setPickslipVisible] = useState(false);
  const [slipText, setSlipText] = useState("Your betslip is empty");
  const [isDisabled, setIsDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Add useEffect to check wager against balance
  useEffect(() => {
    if (!user || !wager) {
      setIsDisabled(true);
      return;
    }
    
    // Disable if wager is greater than balance or less than/equal to 0
    setIsDisabled(wager > user.balance || wager <= 99 || Object.keys(picks).length === 0);
    if (wager > user.balance) {
      setErrorMessage("Can't wager more than balance");
    } else if (wager <= 99) {
      setErrorMessage("Minimum wager is 100");
    } 
    
  }, [wager, user, picks]);

  const togglePickslip = () => {
    setPickslipVisible((prevState) => !prevState);
    setSlipText("Your betslip is empty");
    setErrorMessage(""); // Clear any error messages when toggling
  };

  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: (parlayInput) => submitPicks(parlayInput.formattedPicks, parlayInput.count),
    onSuccess: (data) => {
      console.log('Submit Successful', data);
      setErrorMessage(""); // Clear any error messages
      setTimeout(() => {
        user.balance = user.balance - wager;
        updateUserBalance(user.balance);
        clearPicks();
        setWager("");
        setIsLoadingForced(false);
        setSlipText("Pick submitted successfully\nView your picks on your profile page");
        setIsDisabled(false);

      }, 1500);
    },
    onError: (error) => {
      console.error('Submit failed:', error);
      setIsLoadingForced(false);
      setErrorMessage(error?.message.split("_")[0] || "Failed to submit picks. Please try again.");
      console.log(error?.message.split("_")[1]);
      removePick(error?.message.split("_")[1]);
      queryClient.invalidateQueries(["matches"]);
      setIsDisabled(false);
    }
  });
  // Handle wager input change
  const handleWagerChange = (e) => {
    const value = e.target.value;
    setWager(value);
  };

  // Calculate total odds (example: average odds or first odds)
  const calculateTotalOdds = (bets) => {
    if (bets.length === 1) {
      return bets[0]; // Return the odds as a string if it's just one bet
    } else if (bets.length > 1) {
      // Convert odds to decimal and multiply them together
      let totalOdds = 1;
      bets.forEach(odd => {
        // Check if the odd is in +/– format and convert to decimal
        if (odd.includes('+')) {
          totalOdds *= (1 + parseFloat(odd) / 100);
        } else if (odd.includes('-')) {
          totalOdds *= ((100 / Math.abs(parseFloat(odd)) + 1));
        }
      });
      // Convert the total decimal odds back to +/- format
      const totalOddsString = totalOdds >= 2 ? `+${Math.round((totalOdds - 1) * 100)}` : `${Math.round((-100) / (totalOdds - 1))}`;
      return totalOddsString;
    } else {
      return "N/A"; // No bets provided
    }
  };

  const caculatePayout = (wager, totalOdds) => {
    let mult = 1;
    if(totalOdds > 0)
    {
      mult = (totalOdds / 100) + 1;
    } else{
      mult = (100 / Math.abs(totalOdds)) + 1;
    }
    return Math.round(wager*mult);
  }


    // Compute picksArray as before
    const picksArray = picks && Object.entries(picks).map(([matchId, winner_team]) => {
        const match = matches.find(m => Number(m.id) === Number(matchId));
        const odds = winner_team === match.team1 ? match.team1_odds : match.team2_odds;
        return {
          match_id: Number(matchId),
          winner_team,
          wager: Number(wager),
          odds
        };
      });
    
      // Calculate total odds from the picks
      const oddsArray = picksArray.map(bet => bet.odds);
      const totalOdds = calculateTotalOdds(oddsArray);
      
      const balance = user?.balance || "N/A";

      const handleSubmit = () => {
        setIsDisabled(true);
        setIsLoadingForced(true);
        setValidUser(false);
        if(!user) {
          alert("Please login to submit your picks.");
          return;
        }
    
        if (!wager || wager <= 0) {
          alert("Please enter a valid wager amount.");
          return;
        }
        if(wager > user.balance)
        {
          alert("Can't wager more than balance");
          return;
        }
        
        let formattedPicks;
        if (picksArray.length === 1) {
          formattedPicks = {
            user_id: user.id,
            ...picksArray[0]
          };
        } else {
          formattedPicks = {
            user_id: user.id,
            wager: Number(wager),
            odds: totalOdds,
            bets: picksArray
          };
        }
        mutate({formattedPicks, count: picksArray.length});
      };

      const handleSubmitOrRegister = () => {
        if (!user) {
          navigate('/register');
          return;
        }
        handleSubmit();
      };



  return (
    <div>

    <div className={`pick-slip ${isPickslipVisible ? 'visible' : 'tucked'}`}>
      <div onClick={togglePickslip} className="always-visible">
        <h2 className="title-picks">Picks ({picksArray.length})</h2>
        <button className="toggle-button">
          {isPickslipVisible ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
        </button>
      </div>
      
      {Object.keys(picks).length === 0 ? (
        <div className="empty">
          {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
        {isPickslipVisible && slipText.split("\n").map((line, index) => (
          <div className="empty-pick-text" key={index}>
            {line}
            <br />
          </div>
        ))}
      </div>
        
      ) : (
        <>
          <div className="picks-scroll">
              <ul>
                {Object.entries(picks).map(([matchId, selectedTeam]) => {
                  const match = matches.find(m => Number(m.id) === Number(matchId));
                  if (!match) return null; // Skip if match not found
                    
                  return (
                    <li key={matchId} className="pick-slip-item">
                      <div className="left-side">
                        <span className="winner">{selectedTeam}</span>
                        <span className="betType"><strong>Moneyline</strong></span>
                        <span className="match-info">
                          <span>{match.team1}</span>
                          <strong>vs</strong>
                          <span>{match.team2}</span>
                          <span className="match-date">@ {match.match_date}</span>
                        </span>
                      </div>
                      <div className="right-side">
                        <span className="odds">{selectedTeam === match.team1 ? match.team1_odds : match.team2_odds}</span>
                        
                        <button className="tooltip" onClick={() => updatePick(match.id, selectedTeam)} >
                          <svg xmlns="http://www.w3.org/2000/svg" fillRule="none" viewBox="0 0 20 20" height="25" width="25">
                            <path fill="#000000" d="M8.78842 5.03866C8.86656 4.96052 8.97254 4.91663 9.08305 4.91663H11.4164C11.5269 4.91663 11.6329 4.96052 11.711 5.03866C11.7892 5.11681 11.833 5.22279 11.833 5.33329V5.74939H8.66638V5.33329C8.66638 5.22279 8.71028 5.11681 8.78842 5.03866ZM7.16638 5.74939V5.33329C7.16638 4.82496 7.36832 4.33745 7.72776 3.978C8.08721 3.61856 8.57472 3.41663 9.08305 3.41663H11.4164C11.9247 3.41663 12.4122 3.61856 12.7717 3.978C13.1311 4.33745 13.333 4.82496 13.333 5.33329V5.74939H15.5C15.9142 5.74939 16.25 6.08518 16.25 6.49939C16.25 6.9136 15.9142 7.24939 15.5 7.24939H15.0105L14.2492 14.7095C14.2382 15.2023 14.0377 15.6726 13.6883 16.0219C13.3289 16.3814 12.8414 16.5833 12.333 16.5833H8.16638C7.65805 16.5833 7.17054 16.3814 6.81109 16.0219C6.46176 15.6726 6.2612 15.2023 6.25019 14.7095L5.48896 7.24939H5C4.58579 7.24939 4.25 6.9136 4.25 6.49939C4.25 6.08518 4.58579 5.74939 5 5.74939H6.16667H7.16638ZM7.91638 7.24996H12.583H13.5026L12.7536 14.5905C12.751 14.6158 12.7497 14.6412 12.7497 14.6666C12.7497 14.7771 12.7058 14.8831 12.6277 14.9613C12.5495 15.0394 12.4436 15.0833 12.333 15.0833H8.16638C8.05588 15.0833 7.94989 15.0394 7.87175 14.9613C7.79361 14.8831 7.74972 14.7771 7.74972 14.6666C7.74972 14.6412 7.74842 14.6158 7.74584 14.5905L6.99681 7.24996H7.91638Z" clipRule="evenodd" fillRule="evenodd"></path>
                          </svg>
                        </button>
                      </div>
                      
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Error message display */}
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

          {/* Display total odds */}
          <div className="bottom-ticket">
            <div className="bal-odds">
              <div className="balance">Balance: {user ? balance : 0}</div>
              <div className="total-odds">
              {totalOdds}
            </div>
            
            </div>
            <div className="wager-section">
              <div className="input-side">
                <div className="wager-label">Wager</div>
                <input
                  type="number"
                  id="wager"
                  placeholder="Enter wager"
                  value={wager} 
                  onChange={handleWagerChange}
                  className={`wager-input ${wager > (user?.balance || 0) ? 'invalid' : ''}`}
                  disabled={isLoadingForced}
                />
              </div>
              <div className="payout-side">
                <div className="toWin-label">Payout</div>
                <div className="toWin-number">{caculatePayout(wager, totalOdds).toLocaleString()}</div>
              </div>
            </div>
            
            
            <button 
              onClick={handleSubmitOrRegister} 
              className={`submit-picks ${isDisabled || isLoadingForced ? 'disabled' : ''}`} 
              disabled={isDisabled || isLoadingForced}
            >
              {isLoadingForced ? "Submitting..." : user ? "Submit Picks" : "Create An Account"}
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  );
};

export default PickSlip;
