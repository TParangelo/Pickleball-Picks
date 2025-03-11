import React, { useState, useEffect } from "react";
import "../css/Home.css";

function HowItWorks() {
  // List of card texts
  const cards = [
    "Create an account track your progress and stats",
    "See projected outcomes for upcoming pickleball matches",
    "Wager virtual currency (Dinks) on matches",
    "Compete against friends and climb the leaderboard",
  ];

  // State for current card index
  const [currentCard, setCurrentCard] = useState(0);

  // Cycle through cards every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCard((prevIndex) => (prevIndex + 1) % cards.length);
    }, 5000); // Change card every 5000 ms (5 seconds)

    return () => clearInterval(timer);
  }, [cards.length]);

  return (
    <div className="how-works">
      <div className="card">{cards[currentCard]}</div>
    </div>
  );
}

export default HowItWorks;
