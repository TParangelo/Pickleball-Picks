import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Get user from localStorage on initial load
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [matches, setMatches] = useState([]);

  const [validUser, setValidUser] = useState(true);

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const login = (userData, accessToken) => {
    setUser(userData); // Set the user data when they log in
    setToken(accessToken); // Set the token when they log in
    console.log(user); // Log the user data to the console

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
  };

  const updateUserBalance = (newBalance) => {
    // Ensure user exists before trying to update balance
    if (!user) return;

    // Create a new user object with the updated balance
    const updatedUser = { ...user, balance: newBalance };

    // Update state and localStorage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };
  

  const logout = () => {
    setUser(null); // Clear user data when they log out
    setToken(null);
    // Remove from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, matches, login, logout, updateUserBalance, setMatches, validUser, setValidUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to access the context more easily
export const useAuth = () => {
  return useContext(AuthContext);
};
