import React, { useEffect, useRef, Suspense, useState } from "react";
import "../css/Home.css";
import { Link } from "react-router-dom";
import { loadCSS, unloadCSS } from '../utils/cssLoader';



// Create individual lazy components for each icon
const FaTrophy = React.lazy(() => 
  import('react-icons/fa').then(module => ({
    default: module.FaTrophy
  }))
);

const FaChartLine = React.lazy(() => 
  import('react-icons/fa').then(module => ({
    default: module.FaChartLine
  }))
);

const FaUsers = React.lazy(() => 
  import('react-icons/fa').then(module => ({
    default: module.FaUsers
  }))
);

const FaMobile = React.lazy(() => 
  import('react-icons/fa').then(module => ({
    default: module.FaMobile
  }))
);

// Fallback for icons while loading
const IconFallback = () => <span className="icon-placeholder" style={{ width: "24px", height: "24px", display: "inline-block" }} />;

// Example matches data - replace with your actual matches
const upcomingMatches = [
  { id: 1, type: "Mens Singles", player1: "B. Johns", player2: "T. McGuffin", odds1: "-150", odds2: "+130" },
  { id: 2, type: "Womens Singles", player1: "A. Waters", player2: "K. Fahey", odds1: "-315", odds2: "+285" },
  { id: 3, type: "Mens Doubles", player1: "J. Arnold / H. Johnson", player2: "M. Wright / Z. Navratil", odds1: "+175", odds2: "-195" },
  { id: 4, type: "Womens Doubles", player1: "T. Black / A. Jones", player2: "L. Jansen / K. Kovalova", odds1: "-115", odds2: "+105" },
  { id: 5, type: "Mixed Doubles", player1: "T. Pisnik / A. Daescu", player2: "J. Irvine / G. Tardio", odds1: "-105", odds2: "-105" },
  { id: 6, type: "Mixed Doubles", player1: "A. Bright / JW Johnson", player2: "C. Parenteau / C. Alshon", odds1: "-130", odds2: "+115" },
];

function Home() {
  const ballRef = useRef(null);
  const [isWidescreen, setIsWidescreen] = useState(false);
  const [minY, setMinY] = useState(0);
  const [maxY, setMaxY] = useState(0);


  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsWidescreen(width > 760);
      // Update bounce heights based on screen size
      setMinY(width > 760 ? -410 : -220);
      setMaxY(width > 760 ? 400 : 200);
    };

    // Call it once on mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  useEffect(() => {
    let directionX = -.25; // Horizontal movement direction
    let directionY = .5; // Vertical movement direction
    let positionX = 0;  // Initial horizontal position
    let positionY = 0;  // Initial vertical position
    let animationFrameId;

    const animateBall = () => {
      if (ballRef.current) {
        positionX += directionX * 1.3; // Move horizontally
        positionY += directionY * 1.3; // Move vertically

        // Bounce off top and bottom boundaries using current minY and maxY
        if (positionY > maxY || positionY < minY) {
          directionY *= -1;
          directionX *= -1;
        }
                
        // Apply the calculated positions to the ball
        ballRef.current.style.transform = `translate(${positionX}px, ${positionY}px)`;
      }
      animationFrameId = requestAnimationFrame(animateBall);
    };

    animateBall();

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [minY, maxY]); // Add dependencies so animation updates when bounds change

  useEffect(() => {
    loadCSS('../css/Home.css');
    return () => {
      unloadCSS('../css/Home.css');
    };
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="home-content">
          <h1 className="hero-title">Pickle Picks</h1>
          <p className="hero-subtitle">Serving up excitement with virtual pickleball wagers!</p>
          <Link to="/matches" className="cta-button">Start Predicting</Link>
        </div>

        {/* Right Side: Pickleball Court with Moving Ball */}
        <div className="court-container">
          <div className="court">
            <div className="cLine1"></div>
            <div className="kitchen">
              <p className="players">B. Johns -115 <br /> F. Staksrud +105</p>
            </div>
            <div className="angled-net"></div>
            <div className="pickleball" ref={ballRef}></div>
          </div>
        </div>
      </section>

      {/* Matches Marquee */}
      <div className="matches-marquee-wrapper">
        <div className="marquee-fade left"></div>
        <div className="marquee-fade right"></div>
        <div className="matches-marquee-container">
          <div className="matches-marquee">
            <div className="marquee-content">
              {upcomingMatches.map(match => {
                // Split player names if they contain a slash
                const team1Players = match.player1.split(' / ');
                const team2Players = match.player2.split(' / ');
                
                return (
                  <div key={match.id} className="match-card-home">
                    <div className="match-header-home">
                      <span className="match-time-home">{match.type}</span>
                    </div>
                    <div className="match-content">
                      <div className="players-container">
                        <div className="team-column">
                          <span className="player-name">{team1Players[0]}</span>
                          {team1Players[1] && <span className="player-name">{team1Players[1]}</span>}
                        </div>
                        <div className="team-separator">vs</div>
                        <div className="team-column">
                          <span className="player-name">{team2Players[0]}</span>
                          {team2Players[1] && <span className="player-name">{team2Players[1]}</span>}
                        </div>
                      </div>
                      <div className="odds-container-home">
                        <button className="odds-button-home">{match.odds1}</button>
                        <button className="odds-button-home">{match.odds2}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-grid">
        
        <div className="feature-card">
          
          <Suspense fallback={<IconFallback />}>
            <FaTrophy className="feature-icon" />
          </Suspense>
          <h3>Compete</h3>
          <p>Challenge yourself against other pickleball enthusiasts.</p>
        </div>
        <div className="feature-card">
          <Suspense fallback={<IconFallback />}>
            <FaChartLine className="feature-icon" />
          </Suspense>
          <h3>Live Stats</h3>
          <p>Access match statistics and odds updates</p>
        </div>
        <div className="feature-card">
          <Suspense fallback={<IconFallback />}>
            <FaUsers className="feature-icon" />
          </Suspense>
          <h3>Community</h3>
          <p>Join discussions and share predictions with fellow fans</p>
        </div>
        <div className="feature-card">
          <Suspense fallback={<IconFallback />}>
            <FaMobile className="feature-icon" />
          </Suspense>
          <h3>Mobile Ready</h3>
          <p>Place picks anywhere, anytime on any device</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
