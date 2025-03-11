import React, { useEffect, useState, useRef } from 'react';
import { getUserPicks, fetchMatches } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "../css/PicksViewer.css";
import { useNavigate } from 'react-router-dom';
const PicksViewer = () => {
  const queryClient = useQueryClient();
  const gotPicks = useRef(false);
  const {matches, setMatches, validUser} = useAuth();
  const [active, setActive] = useState(true);
  const { data: matches2, error: error2, isLoading: isLoading2 } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    enabled: matches.length === 0, // Fetch only if no matches are stored
  });
  
  useEffect(() => {
      if (matches2) {
        setMatches(matches2); // Store matches in context after fetching
      }
    }, [matches2, setMatches]);

    const navigate = useNavigate();

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

  // Fetch picks using React Query
  const { data: picks, error, isLoading } = useQuery({
    queryKey: ["picks"],
    queryFn: getUserPicks,
    // Refetch when validUser changes to false
    enabled: true,
    staleTime: 1000*60*3,
    cacheTime: 1000*60*3,
  });

  // Refresh picks when validUser changes to false
  useEffect(() => {
    if (!validUser) {
      queryClient.invalidateQueries(["picks"]);
    }
  }, [validUser, queryClient]);

  useEffect(() => {
    if (picks) {
      gotPicks.current = true;
    }
  }, [picks]);

  if (isLoading || isLoading2) return <p>Loading picks...</p>;
  if (error || error2) return <p>Error loading picks: {error.message}</p>;

  // Filtered picks based on 'active' state
  const filteredPicks = {
    straight_bets: picks.straight_bets.filter((bet) => (active ? bet.status === 'Pending' : bet.status !== 'Pending')),
    parlays: picks.parlays.filter((parlay) => (
      active ? parlay.status === 'Pending' : parlay.status !== 'Pending'
    )),
  };


  console.log(picks);
  return (
    <div className='picksViewer-container'>
      <h1 className='my-picks'>My Picks</h1>
      <div className='tab'>
        <button 
          className={`active-button ${active ? 'active' : ''}`} 
          onClick={() => setActive(true)}
        >
          Active
        </button>
        <button 
          className={`active-button ${!active ? 'active' : ''}`} 
          onClick={() => setActive(false)}
        >
          Settled
        </button>
      </div>
      <div className='picks'>
        {/* Display Straight Bets */}
        <div className='straights'>
          {/* <h3 className='str-label'>Straights</h3> */}
          {filteredPicks.straight_bets.length === 0 && filteredPicks.parlays.length === 0 ? (
            <>
            <p className='empty-text'>No {active ? 'live' : 'settled'} picks found</p>
            <div className='make-picks-btn-container'>
            <button className="make-picks-btn" onClick={() => navigate('/matches')}>
              Make Picks
            </button>
            </div>
            </>
          ) : (
            <ul className='straight-list'>
                {filteredPicks.straight_bets.map((bet) => {
                  // Find the corresponding match using bet.match_id
                  const match = matches.find((m) => Number(m.id) === Number(bet.match_id));
                  if (!match) return null; // Skip if match not found

                  // Determine the selected team
                  const selectedTeam = bet.winner_team === 1 ? match.team1 : match.team2;

                  return (
                    <li key={bet.bet_id} className="pick-slip-item-submitted">
                      <div className='top-half'>
                        <div className="left-side">
                        <span className={`winner ${bet.status==='won' ? 'won' : ''} ${bet.status==='lost' ? 'lost' : ''}`} >{selectedTeam}</span>
                          <span className="betType">Moneyline</span>
                          <span className="match-info">
                            <span>{match.team1}</span>
                            <strong>vs</strong>
                            <span>{match.team2}</span>
                            <span className="match-date">@ {match.match_date}</span>
                          </span>
                        </div>
                        <div className={`right-side-submitted ${bet.status==='Pending' ? 'live' : ''} ${bet.status==='won' ? 'won' : ''} ${bet.status==='lost' ? 'lost' : ''}`}>
                          {/* Show odds based on selected team */}
                          <span className={`odds-submitted ${bet.status==='won' ? 'won' : ''} ${bet.status==='lost' ? 'lost' : ''}`}>
                            <strong>{selectedTeam === match.team1 ? match.team1_odds : match.team2_odds}</strong>
                          </span>
                        </div>
                      </div>
                      <div className='split'></div>
                      <div className='under'>
                        <div className='wager-info-submitted'>
                            <p className='risk'>Wager:</p>
                            <p className='risk-amount'>{bet.wager.toLocaleString()}</p>
                        </div>
                        <div className='payout-info'>
                          <p className='risk'>Payout:</p>
                          <p className='risk-amount'>{bet.status === 'won' || bet.status ==='Pending' ? bet.payout.toLocaleString() : '0'}</p>
                          </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
          )}
        </div>

        {/* Display Parlays */}
        <div className='parlays'>
          {/* <h3 className='str-label'>Parlays</h3> */}
          {filteredPicks.parlays.length === 0 ? (
            <p></p>
          ) : (
            <ul className='parlay-ticket1'>
              {filteredPicks.parlays.map((parlay) => (
                <li className='parlay-ticket2' key={parlay.parlay_id+'_'+parlay.payout}>
                  <div className='top-parlay'>
                    <div className={`parlay-length ${parlay.status === 'won' ? 'won' : ''}`}>
                      {parlay.parlayBets.length} Leg Parlay
                    </div>
                    <div className={`total-odds ${parlay.status === 'Pending' ? 'live' : parlay.status === 'won' ? 'won' : 'lost'}`}>
                      {calculateTotalOdds(parlay.parlayBets.map(bet => bet.odds))}
                    </div>
                  </div>
                  <ul className='parlay-bet-list'>
                    {parlay.parlayBets.map((bet) => {
                      // Find the corresponding match using bet.match_id
                      const match = matches.find((m) => Number(m.id) === Number(bet.match_id));
                      if (!match) return null; // Skip if match not found

                      // Determine the selected team
                      const selectedTeam = bet.winner_team === 1 ? match.team1 : match.team2;

                      return (
                        <li key={bet.parlay_bet_id} className="pick-slip-item-submitted parlay">
                          <div className='top-half2'>
                            <div className="left-side">
                              <span className={`winner ${bet.status==='won' ? 'won' : ''} ${bet.status==='lost' ? 'lost' : ''}`} >{selectedTeam}</span>
                              <span className="betType">Moneyline</span>
                              <span className="match-info">
                                <span>{match.team1}</span>
                                <strong>vs</strong>
                                <span>{match.team2}</span>
                                <span className="match-date">@ {match.match_date}</span>
                              </span>
                            </div>
                            <div className={`right-side-submitted ${bet.status==='Pending' ? 'live' : ''} ${bet.status==='won' ? 'won' : ''} ${bet.status==='lost' ? 'lost' : ''}`}>
                              {/* Show odds based on selected team */}
                              <span className={`odds-submitted ${bet.status==='won' ? 'won' : ''} ${bet.status==='Pending' ? 'live' : ''} ${bet.status==='lost' ? 'lost' : ''}`}>
                                <strong>{selectedTeam === match.team1 ? match.team1_odds : match.team2_odds}</strong>
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                      <div className='under parlay'>
                        <div className='wager-info-submitted'>
                            <p className='risk'>Wager:</p>
                            <p className='risk-amount'>{parlay.wager.toLocaleString()}</p>
                        </div>
                        <div className='payout-info'>
                          <p className='risk'>Payout:</p>
                          <p className='risk-amount'>{parlay.status === 'won' || parlay.status ==='Pending' ? parlay.payout.toLocaleString() : '0'}</p>
                          </div>
                      </div>
                  </ul>
                </li>
              ))}
              
            </ul>
          )}
        </div>
        </div>
    </div>
  );
};

export default PicksViewer;
