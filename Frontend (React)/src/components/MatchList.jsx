import React, { useEffect, useState } from "react";

const MatchList = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8000/all_matches/")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch");
                }
                return response.json();
            })
            .then((data) => {
                setMatches(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, []);  // Empty dependency array means this runs only once after initial render

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Pickleball Matches</h2>
            <ul>
                {matches.map((match) => (
                    <li key={match.id}>
                        {match.team1} vs {match.team2} - Winner: {match.winner}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MatchList;