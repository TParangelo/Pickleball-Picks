import React, { useState, useEffect, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMatches } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { loadCSS } from '../utils/cssLoader';
import "../css/Matches.css";

// Lazy load components
const MatchCardSimple = lazy(() => import("../components/MatchCardSimple"));
const PickSlip = lazy(() => import("../components/Pickslip"));

// Loading fallback for components
const ComponentLoader = () => (
  <div style={{ padding: "1rem", textAlign: "center" }}>Loading...</div>
);

function Matches() {
  const { matches, setMatches } = useAuth();
  const { data, error, isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    if (data) {
      setMatches(data); // Store matches in context after fetching
    }
  }, [data, setMatches]);

  useEffect(() => {
    loadCSS('../css/Matches.css');
    return () => {
      const link = document.querySelector('link[href="../css/Matches.css"]');
      if (link) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Wide screen filter options for big screens
  const wideFilters = [
    { label: "Doubles", filterFn: (match) => match.match_type.includes("Doubles") },
    { label: "Singles", filterFn: (match) => match.match_type.includes("Singles") },
    { label: "All", filterFn: () => true },
  ];

  // Small screen filter options (now including All)
  const smallFilters = [
    { label: "All", filterFn: () => true },
    { label: "Womens Doubles", filterFn: (match) => match.match_type === "Womens Doubles" },
    { label: "Mens Doubles", filterFn: (match) => match.match_type === "Mens Doubles" },
    { label: "Mixed Doubles", filterFn: (match) => match.match_type === "Mixed Doubles" },
    { label: "Womens Singles", filterFn: (match) => match.match_type === "Womens Singles" },
    { label: "Mens Singles", filterFn: (match) => match.match_type === "Mens Singles" },
  ];

  // Determine if the screen is wide (arbitrarily set to > 800px)
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 860);

  useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth > 860);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine active filter state based on screen size
  const [activeFilter, setActiveFilter] = useState(isWideScreen ? "All" : "All");

  // Update activeFilter if screen size changes
  useEffect(() => {
    if (isWideScreen) {
      setActiveFilter("All");
    } else {
      // Default to "All" for both screen sizes
      setActiveFilter("All");
    }
  }, [isWideScreen]);

  if (isLoading) return <p>Loading matches...</p>;
  if (error) return <p>Error loading matches: {error.message}</p>;

  // For wide screens, group matches by filter options
  let groupedMatches = {};
  let orderedGroups = [];
  if (isWideScreen) {
    if (activeFilter === "Doubles") {
      groupedMatches = matches
      .filter(match => match.result === "Pending") // Filter here
      .reduce((groups, match) => {
        if (match.match_type.includes("Doubles")) {
          if (match.match_type.includes("Mens")) {
            groups["Mens Doubles"] = groups["Mens Doubles"] || [];
            groups["Mens Doubles"].push(match);
          } else if (match.match_type.includes("Womens")) {
            groups["Womens Doubles"] = groups["Womens Doubles"] || [];
            groups["Womens Doubles"].push(match);
          } else if (match.match_type.includes("Mixed")) {
            groups["Mixed Doubles"] = groups["Mixed Doubles"] || [];
            groups["Mixed Doubles"].push(match);
          }
        }
        return groups;
      }, {});
      orderedGroups = ["Mens Doubles", "Mixed Doubles", "Womens Doubles"];
    } else if (activeFilter === "Singles") {
      groupedMatches = matches
      .filter(match => match.result === "Pending") // Filter here
      .reduce((groups, match) => {
        if (match.match_type.includes("Singles")) {
          if (match.match_type.includes("Mens")) {
            groups["Mens Singles"] = groups["Mens Singles"] || [];
            groups["Mens Singles"].push(match);
          } else if (match.match_type.includes("Womens")) {
            groups["Womens Singles"] = groups["Womens Singles"] || [];
            groups["Womens Singles"].push(match);
          }
        }
        return groups;
      }, {});
      orderedGroups = ["Mens Singles", "Womens Singles"];
    } else {
      // All matches for wide screen
      groupedMatches = matches
      .filter(match => match.result === "Pending") // Filter here
      .reduce((groups, match) => {
        if (match.match_type.includes("Mens")) {
          groups["Mens"] = groups["Mens"] || [];
          groups["Mens"].push(match);
        } else if (match.match_type.includes("Womens")) {
          groups["Womens"] = groups["Womens"] || [];
          groups["Womens"].push(match);
        } else if (match.match_type.includes("Mixed")) {
          groups["Mixed"] = groups["Mixed"] || [];
          groups["Mixed"].push(match);
        }
        return groups;
      }, {});
      orderedGroups = ["Mens", "Mixed", "Womens"];
    }
  } else {
    // For small screens, filter matches based on the smallFilters
    const filterOption = smallFilters.find(opt => opt.label === activeFilter);
    const filteredMatches = matches
    .filter(match => match.result === "Pending") // Filter here
    .filter((match) =>
      filterOption ? filterOption.filterFn(match) : true
    );
    
    // Group filtered matches by match type for better organization
    if (activeFilter === "All") {
      groupedMatches = filteredMatches.reduce((groups, match) => {
        const type = match.match_type;
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(match);
        return groups;
      }, {});
      orderedGroups = Object.keys(groupedMatches).sort();
    } else {
      groupedMatches = { [activeFilter]: filteredMatches };
      orderedGroups = [activeFilter];
    }
  }

  return (
    <>
    <div className="matches-container">
      <h1>Upcoming Pickleball Matches</h1>
      <div className="filter-buttons">
        {isWideScreen
          ? wideFilters.map((option) => (
              <button
                key={option.label}
                className={`filter-button ${activeFilter === option.label ? "active" : ""}`}
                onClick={() => setActiveFilter(option.label)}
              >
                {option.label}
              </button>
            ))
          : smallFilters.map((option) => (
              <button
                key={option.label}
                className={`filter-button ${activeFilter === option.label ? "active" : ""}`}
                onClick={() => setActiveFilter(option.label)}
              >
                {option.label}
              </button>
            ))}
      </div>

      {isWideScreen ? (
        <div className="matches-grid">
          {activeFilter ? (
            orderedGroups.map((group) => (
              <div className="match-column" key={group}>
                <h2>{group}</h2>
                <ul>
                  {groupedMatches[group] &&
                    groupedMatches[group].map((match) => (
                      <li key={match.id}>
                        <Suspense fallback={<ComponentLoader />}>
                          <MatchCardSimple match={match} />
                        </Suspense>
                      </li>
                    ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="match-column">
              <h2>{activeFilter}</h2>
              <ul>
                {groupedMatches["Filtered"]
                  ? groupedMatches["Filtered"].map((match) => (
                      <li key={match.id}>
                        <Suspense fallback={<ComponentLoader />}>
                          <MatchCardSimple match={match} />
                        </Suspense>
                      </li>
                    ))
                  : matches
                      .filter((match) => {
                        const filterOption = wideFilters.find((opt) => opt.label === activeFilter);
                        return filterOption ? filterOption.filterFn(match) : true;
                      })
                      .map((match) => (
                        <li key={match.id}>
                          <Suspense fallback={<ComponentLoader />}>
                            <MatchCardSimple match={match} />
                          </Suspense>
                        </li>
                      ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="matches-grid">
          {orderedGroups.map((group) => (
            <div className="match-column" key={group}>
              <ul>
                {groupedMatches[group].map((match) => (
                  <li key={match.id}>
                    <Suspense fallback={<ComponentLoader />}>
                      
                      <MatchCardSimple match={match} />
                    </Suspense>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      
      <Suspense fallback={<ComponentLoader />}>
        <PickSlip matches={matches} />
      </Suspense>
    </div>
    </>
  );
}

export default Matches;
