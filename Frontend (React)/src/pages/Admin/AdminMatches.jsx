import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMatches, startMatch, setMatchWinner, deleteMatch } from '../../services/api';
import '../../css/admin/Admin.css';

const AdminMatches = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [matches, setMatches] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [selectedWinner, setSelectedWinner] = useState(null);

    // Check for admin authentication
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // API mutations
    const startMatchMutation = useMutation({
        mutationFn: startMatch,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-matches']);
        }
    });

    const setWinnerMutation = useMutation({
        mutationFn: setMatchWinner,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-matches']);
        }
    });

    const deleteMatchMutation = useMutation({
        mutationFn: deleteMatch,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-matches']);
        }
    });

    // Fetch matches data
    const { data: matchesData, isLoading, error } = useQuery({
        queryKey: ['admin-matches'],
        queryFn: fetchMatches,
    });

    // Update filtered matches when data, filter, or search changes
    useEffect(() => {
        if (matchesData) {
            let filteredMatches = [...matchesData];
            
            // Filter by status
            if (filter === 'pending') {
                filteredMatches = filteredMatches.filter(match => match.result === 'Pending');
            } else if (filter === 'started') {
                filteredMatches = filteredMatches.filter(match => match.result === 'Started');
            } else if (filter === 'finished') {
                filteredMatches = filteredMatches.filter(match => match.result === 'Final');
            }

            // Filter by search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                filteredMatches = filteredMatches.filter(match => {
                    const team1Players = match.team1.toLowerCase();
                    const team2Players = match.team2.toLowerCase();
                    return team1Players.includes(query) || team2Players.includes(query);
                });
            }

            setMatches(filteredMatches);
        }
    }, [matchesData, filter, searchQuery]);

    const handleStartMatch = async (matchId) => {
        try {
            await startMatchMutation.mutateAsync(matchId);
        } catch (error) {
            console.error('Error starting match:', error);
            alert('Failed to start match. Please try again.');
        }
    };

    const handleSetWinner = async (match) => {
        setSelectedMatch(match);
        setSelectedWinner(null);
        setShowWinnerModal(true);
    };

    const handleWinnerSubmit = async () => {
        if (selectedWinner === null) {
            alert('Please select a winner');
            return;
        }

        try {
            await setWinnerMutation.mutateAsync({ 
                match_id: selectedMatch.id, 
                winner: selectedWinner + 1
            });
            setShowWinnerModal(false);
        } catch (error) {
            console.error('Error setting winner:', error);
            alert('Failed to set winner. Please try again.');
        }
    };

    const handleDeleteMatch = async (matchId) => {
        if (!confirm('Are you sure you want to delete this match?')) return;

        try {
            await deleteMatchMutation.mutateAsync(matchId);
        } catch (error) {
            console.error('Error deleting match:', error);
            alert('Failed to delete match. Please try again.');
        }
    };

    const renderMatchActions = (match) => {
        switch (match.result) {
            case 'Pending':
                return (
                    <button 
                        className="start-match-btn"
                        onClick={() => handleStartMatch(match.id)}
                    >
                        Start Match
                    </button>
                );
            case 'Started':
                return (
                    <button 
                        className="set-winner-btn"
                        onClick={() => handleSetWinner(match)}
                    >
                        Set Winner
                    </button>
                );
            case 'Final':
                return (
                    <button 
                        className="delete-match-btn"
                        onClick={() => handleDeleteMatch(match.id)}
                    >
                        Delete Match
                    </button>
                );
            default:
                return null;
        }
    };

    if (isLoading) return <div className="admin-loading">Loading matches...</div>;
    if (error) return <div className="admin-error">Error loading matches: {error.message}</div>;

    const WinnerSelectionModal = () => {
        if (!showWinnerModal || !selectedMatch) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Select Winner</h2>
                    <div className="winner-options">
                        <label className="winner-option">
                            <input
                                type="radio"
                                name="winner"
                                value={0}
                                checked={selectedWinner === 0}
                                onChange={(e) => setSelectedWinner(Number(e.target.value))}
                            />
                            <span>{selectedMatch.team1}</span>
                        </label>
                        <label className="winner-option">
                            <input
                                type="radio"
                                name="winner"
                                value={1}
                                checked={selectedWinner === 1}
                                onChange={(e) => setSelectedWinner(Number((e.target.value)))}
                            />
                            <span>{selectedMatch.team2}</span>
                        </label>
                    </div>
                    <div className="modal-actions">
                        <button 
                            className="modal-submit" 
                            onClick={handleWinnerSubmit}
                        >
                            Confirm
                        </button>
                        <button 
                            className="modal-cancel" 
                            onClick={() => setShowWinnerModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-matches">
            <div className="admin-header">
                <h1>Manage Matches</h1>
                <button onClick={() => navigate('/admin/dashboard')} className="admin-back-btn">
                    Back to Dashboard
                </button>
            </div>

            <div className="admin-controls">
                <div className="admin-search">
                    <input
                        type="text"
                        placeholder="Search by player name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                <div className="admin-filters">
                    <button 
                        className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Matches
                    </button>
                    <button 
                        className={`admin-filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button 
                        className={`admin-filter-btn ${filter === 'started' ? 'active' : ''}`}
                        onClick={() => setFilter('started')}
                    >
                        Started
                    </button>
                    <button 
                        className={`admin-filter-btn ${filter === 'finished' ? 'active' : ''}`}
                        onClick={() => setFilter('finished')}
                    >
                        Finished
                    </button>
                </div>
            </div>

            <div className="admin-matches-grid">
                {matches.length === 0 ? (
                    <div className="no-matches">No matches found</div>
                ) : (
                    matches.map(match => (
                        <div key={match.id} className="admin-match-card">
                            <div className="match-header">

                                    <span className="match-type">{match.match_type}</span>
                                    <span className={`match-status-badge ${match.result.toLowerCase()}`}>
                                        {match.result}
                                    </span>

                            </div>
                            <span className="match-date-admin">{match.match_date}</span>
                            <div className="match-teams">
                                <div className="team">
                                    {typeof match.team1 === 'string' 
                                        ? match.team1.split('/').join(' / ') 
                                        : match.team1}
                                </div>
                                <div className="vs">vs</div>
                                <div className="team">
                                    {typeof match.team2 === 'string' 
                                        ? match.team2.split('/').join(' / ') 
                                        : match.team2}
                                </div>
                            </div>
                            <div className="match-actions">
                                {renderMatchActions(match)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <WinnerSelectionModal />
        </div>
    );
};

export default AdminMatches; 