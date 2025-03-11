import { createContext, useContext, useState } from "react";

const CurPicksContext = createContext();

export const CurPicksProvider = ({ children }) => {
    const [picks, setPicks] = useState({});



    const updatePick = (matchId, winner) => {
      setPicks((prev) => {
        // If the selected team is already picked, remove it
        if (prev[matchId] === winner) {
          const newPicks = { ...prev };
          delete newPicks[matchId]; // Removes the pick
          return newPicks;
        }
        return { ...prev, [matchId]: winner };
      });
    };

    const removePick = (matchId) => {
      setPicks((prev) => {
        // If the selected team is already picked, remove it
        const newPicks = { ...prev };
        delete newPicks[matchId]; // Removes the pick
        return newPicks;
      });
    };

    const clearPicks = () => {
      setPicks({}); // Resets picks to an empty object
    };
    
    return (
      <CurPicksContext.Provider value={{ picks, updatePick, clearPicks, removePick }}>
        {children}
      </CurPicksContext.Provider>
    );
  };

export const useCurPicks = () => {
  const context = useContext(CurPicksContext);
  if (!context) {
    throw new Error("useCurPicks must be used within a CurPicksProvider");
  }
  return context;
};
