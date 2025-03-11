// src/components/PlayerSelect.jsx
import React, { useState } from 'react';
import '../css/PlayerSelect.css';

const PlayerSelect = ({ players, onSelect, placeholder, value }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredPlayers = players.filter(player =>
        player.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (player) => {
        console.log("Selected player:", player);
        onSelect(player);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div className="player-select">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                onFocus={() => setIsOpen(true)}
            />
            {isOpen && (
                <div className="dropdown">
                    {filteredPlayers.length > 0 ? (
                        filteredPlayers.map((player, index) => (
                            <div
                                key={index}
                                className="dropdown-item"
                                onClick={() => handleSelect(player)}
                            >
                                {player}
                            </div>
                        ))
                    ) : (
                        <div className="dropdown-item">No players found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlayerSelect;