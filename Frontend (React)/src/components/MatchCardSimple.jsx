import { useState } from "react";
import { useCurPicks } from "../contexts/CurPicks";
import "../css/MatchCardSimple.css";

const MatchCardSimple = ({ match }) => {
  const {picks, updatePick} = useCurPicks();
  const selectedWinner = picks[match.id] || null;

  return (
    <div className="match-card-simple">
      <h3 className="match-time-simple">{match.match_date}</h3>
      <h2 className="match-type-simple">{match.match_type}</h2>
        <div className="teams-simple">
          <div className="team1-simple">
            {match.team1.split('/').map((player, index) => (
              <span key={index}>{player} <br /></span>
            ))}
          </div>
          <div className="center-line-simple"></div> 
          <div className="team2-simple">
            {match.team2.split('/').map((player, index) => (
              <span key={index}>{player} <br /></span>
            ))}
          </div>
        </div>     
      <div className="under-court-simple">
      <button 
              onClick={() => updatePick(match.id, match.team1)}
              className={selectedWinner === match.team1 ? "selected-simple" : "pick-button-simple"}
            >
              {match.team1_odds}
      </button>
      <div className="vs-tag"></div>
      <button 
              onClick={() => updatePick(match.id, match.team2)}
              className={selectedWinner === match.team2 ? "selected-simple" : "pick-button-simple"}
            >
              {match.team2_odds}
      </button>
      </div>
    </div>
  );
};

export default MatchCardSimple;
