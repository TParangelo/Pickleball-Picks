import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createMatch } from '../../services/api';
import '../../css/admin/Admin.css';

const AddMatch = () => {
    const navigate = useNavigate();
    const [matchData, setMatchData] = useState({
        team1: '',
        team2: '',
        team1_odds: '',
        team2_odds: '',
        match_type: '',
        match_date: ''
    });
    const [winProbability, setWinProbability] = useState(50);
    const [rake, setRake] = useState(4.5);  // Default 4.5% rake

    // Check for admin authentication
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
        }
    }, [navigate]);

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

                <div className="form-group">
                    <label htmlFor="team1">Team 1</label>
                    <input
                        type="text"
                        id="team1"
                        name="team1"
                        value={matchData.team1}
                        onChange={handleChange}
                        placeholder="Enter team 1 name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="team2">Team 2</label>
                    <input
                        type="text"
                        id="team2"
                        name="team2"
                        value={matchData.team2}
                        onChange={handleChange}
                        placeholder="Enter team 2 name"
                        required
                    />
                </div>

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
                        required
                    />
                </div>

                <button type="submit" className="admin-submit-btn">
                    Create Match
                </button>
            </form>
        </div>
    );
};

export default AddMatch; 