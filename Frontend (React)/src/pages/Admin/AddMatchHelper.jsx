import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createMatch, fetchAllPlayers, getMatchProbability } from '../../services/api';
import '../../css/admin/AddMatchHelper.css';
import PlayerSelect from '../../components/PlayerSelect';

const AddMatchHelper = () => {
    const navigate = useNavigate();
    const [matchData, setMatchData] = useState({
        team1: '',
        team2: '',
        team1player1: '',
        team1player2: '',
        team2player1: '',
        team2player2: '',
        team1_odds: '',
        team2_odds: '',
        match_type: '',
        match_date: ''
    });
    const [helpData, setHelpData] = useState(null);
    const [winProbability, setWinProbability] = useState(50);
    const [rake, setRake] = useState(4.5);  // Default 4.5% rake

    // Check for admin authentication
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const { data: allPlayers, isLoading: playersLoading } = useQuery({
        queryKey: ['allPlayers'],
        queryFn: fetchAllPlayers,
        staleTime: 1000 * 60 * 5, // Data stays fresh for 2 minutes
        cacheTime: 1000 * 60 * 5, // Cache persists for 2 minutes
        retry: 1,
    });

    const createOdds = useMutation({
        mutationFn: () => getMatchProbability(matchData.team1, matchData.team2, matchData.match_type),
        onSuccess: (data) => {
            console.log(data);
            setWinProbability(data.probability * 100);
            setHelpData({
                t1p1_rate: data.team1_stats[0].rating,
                t1p2_rate: data.team1_stats[1]?.rating,
                t2p1_rate: data.team2_stats[0].rating,
                t2p2_rate: data.team2_stats[1]?.rating,
                percent_win_prob: data.probability * 100
            });
        },
        onError: (error) => {
            console.log(error);
        }
    });



    // Calculate odds whenever win probability or rake changes
    useEffect(() => {
        const calculateOdds = (probability, rakePercentage) => {
            // Convert probability to decimal odds and apply rake by reducing payout
            const rake = 1 - (rakePercentage / 100);
            
            // Calculate fair decimal odds first
            const team1FairDecimal = 1 / (probability / 100);
            const team2FairDecimal = 1 / ((100 - probability) / 100);
            
            // Apply rake to the profit portion of the odds
            const team1DecimalOdds = 1 + ((team1FairDecimal - 1) * rake);
            const team2DecimalOdds = 1 + ((team2FairDecimal - 1) * rake);

            // Helper function to round to nearest 5
            const roundToNiceLine = (odds) => {
                // Round to nearest 5
                return Math.round(odds / 5) * 5;
            };

            // Convert decimal odds to American odds and round to nice numbers
            const team1AmericanOdds = team1DecimalOdds < 2 
                ? roundToNiceLine(-100 / (team1DecimalOdds - 1))
                : roundToNiceLine((team1DecimalOdds - 1) * 100);

            const team2AmericanOdds = team2DecimalOdds < 2 
                ? roundToNiceLine(-100 / (team2DecimalOdds - 1))
                : roundToNiceLine((team2DecimalOdds - 1) * 100);

            // Format odds with + or - prefix
            const team1Formatted = team1AmericanOdds > 0 ? `+${team1AmericanOdds}` : `${team1AmericanOdds}`;
            const team2Formatted = team2AmericanOdds > 0 ? `+${team2AmericanOdds}` : `${team2AmericanOdds}`;

            setMatchData(prev => ({
                ...prev,
                team1_odds: team1Formatted,
                team2_odds: team2Formatted
            }));
        };

        calculateOdds(winProbability, rake);
    }, [winProbability, rake]);

    const createMatchMutation = useMutation({
        mutationFn: createMatch,
        onSuccess: () => {
            alert('Match created successfully!');
            setMatchData({
                team1: '',
                team2: '',
                team1_odds: '',
                team2_odds: '',
                match_type: '',
                match_date: ''
            });
            setWinProbability(50);
        },
        onError: (error) => {
            alert('Error creating match: ' + error.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMatchMutation.mutate(matchData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMatchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleHelp = () => {
        console.log(matchData);
        if (matchData.match_type === "Mens Singles" || matchData.match_type === "Womens Singles") {
            setMatchData(prev => ({
                ...prev,
                team1: matchData.team1player1,
                team2: matchData.team2player1,
            }));
        }
        else if (matchData.match_type === "Mens Doubles" || matchData.match_type === "Womens Doubles" || matchData.match_type === "Mixed Doubles") {
            setMatchData(prev => ({
                ...prev,
                team1: matchData.team1player1 + " / " + matchData.team1player2,
                team2: matchData.team2player1 + " / " + matchData.team2player2,
            }));
        }
        createOdds.mutate();
        
    }

    if (playersLoading) {
        return <div>Loading...</div>;
    }


    return (
        <div className="admin-add-match">
            <div className="admin-header">
                <h1>Add New Match</h1>
                <button onClick={() => navigate('/admin/dashboard')} className="admin-back-btn">
                    Back to Dashboard
                </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-match-form">
                <div className="form-group">
                    <label htmlFor="match_type">Match Type</label>
                    <select
                        id="match_type"
                        name="match_type"
                        value={matchData.match_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Match Type</option>
                        <option value="Mens Singles">Men's Singles</option>
                        <option value="Womens Singles">Women's Singles</option>
                        <option value="Mens Doubles">Men's Doubles</option>
                        <option value="Womens Doubles">Women's Doubles</option>
                        <option value="Mixed Doubles">Mixed Doubles</option>
                    </select>
                </div>



                <div className='above-help-btn'>
                    <div className='left-side'>
                    <div className="form-group">
                        <label htmlFor="team1">Team 1</label>
                        <PlayerSelect
                            players={allPlayers}
                            onSelect={(player) => setMatchData({ ...matchData, team1player1: player })}
                            placeholder={matchData.team1player1}
                            value={matchData.team1player1}
                        />
                        <PlayerSelect
                            players={allPlayers}
                            onSelect={(player) => setMatchData({ ...matchData, team1player2: player })}
                            placeholder={matchData.team1player2}
                            value={matchData.team1player2}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="team2">Team 2</label>
                        <PlayerSelect
                            players={allPlayers}
                            onSelect={(player) => setMatchData({ ...matchData, team2player1: player })}
                            placeholder={matchData.team2player1}
                            value={matchData.team2player1}
                        />
                        <PlayerSelect
                            players={allPlayers}
                            onSelect={(player) => setMatchData({ ...matchData, team2player2: player })}
                            placeholder={matchData.team2player2}
                            value={matchData.team2player2}
                        />
                    </div>
                    </div>


                    <div className='right-side'>
                        {helpData && (
                            <div className='help-data'>
                                <h3 className='help-data-header'>DUPRS</h3>
                                <div className='team1-stats'>
                                <p>{helpData.t1p1_rate}</p>
                                <p>{helpData?.t1p2_rate}</p>
                                </div>
                                <div className='team2-stats'>
                                <p>{helpData.t2p1_rate}</p>
                                <p>{helpData?.t2p2_rate}</p>
                                </div>
                                <p className='help-data-win-prob'>Team1 Win %: {helpData.percent_win_prob}%</p>
                            </div>
                        )}



                    </div>



                </div>
                         <div className="help-btn" onClick={handleHelp}>Help</div>
                <div className="form-group odds-slider">
                    <label>Win Probability & Rake</label>
                    <div className="odds-controls">
                        <div className="rake-input-container">
                            <label htmlFor="rake">House Edge:</label>
                            <div className="rake-value">
                                <input
                                    type="number"
                                    id="rake"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    value={rake}
                                    onChange={(e) => {
                                        const value = Math.min(20, Math.max(0, Number(e.target.value)));
                                        setRake(value);
                                    }}
                                    className="rake-input"
                                />
                                <span className="percentage-symbol">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="slider-container">
                        <span className="team-label">{matchData.team1 || 'Team 1'}</span>
                        <div className="slider-with-value">
                            <input
                                type="range"
                                min="1"
                                max="99"
                                value={winProbability}
                                onChange={(e) => setWinProbability(Number(e.target.value))}
                                className="probability-slider"
                            />
                            <div className="probability-input-container">
                                <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={winProbability}
                                    onChange={(e) => {
                                        const value = Math.min(99, Math.max(1, Number(e.target.value)));
                                        setWinProbability(value);
                                    }}
                                    className="probability-input"
                                />
                                <span className="percentage-symbol">%</span>
                            </div>
                        </div>
                        <span className="team-label">{matchData.team2 || 'Team 2'}</span>
                    </div>
                    <div className="odds-display">
                        <div className="odds-item">
                            <span className="odds-label">{matchData.team1 || 'Team 1'} Odds:</span>
                            <span className="odds-value">{matchData.team1_odds}</span>
                        </div>
                        <div className="odds-item">
                            <span className="odds-label">{matchData.team2 || 'Team 2'} Odds:</span>
                            <span className="odds-value">{matchData.team2_odds}</span>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="match_date">Match Date</label>
                    <input
                        type="text"
                        id="match_date"
                        name="match_date"
                        value={matchData.match_date}
                        onChange={handleChange}
                        placeholder="Enter date (e.g., 4:00PM Friday)"
                        
                    />
                </div>

                <button type="submit" className="admin-submit-btn" onClick={handleSubmit}>
                    Create Match
                </button>
            </form>
        </div>
    );
};

export default AddMatchHelper; 