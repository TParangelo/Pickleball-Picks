import { Link } from "react-router-dom";
import "../css/Navbar.css";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useRef, useState } from "react";
import { fetchTokenValidity } from "../services/api";
import { useMutation } from "@tanstack/react-query";
import logo from "../assets/GreenLogo.png";

function NavBar() {
  const { user, login, logout, setValidUser } = useAuth(); // Access auth context
  const hasVerifiedToken = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Handle clicks outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          !hamburgerRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // React Query: Verify JWT token
  const { mutate, isLoading } = useMutation({
    mutationFn: fetchTokenValidity,
    mutationKey: ["fetchTokenValidity"],
    cacheTime: 1000*60*2,
    staleTime: 1000*60*2,
    onSuccess: (data) => {
      if (!data.isValid) {
        logout();
      } else {
        login(data.user, data.token);
        setValidUser(true);
      }
    },
    onError: (error) => {
      console.error("Error verifying token:", error);
      logout();
    },
    retry: 1,
  });

  useEffect(() => {
    if (user && !hasVerifiedToken.current) {
      console.log("Verifying token...");
      mutate();
      hasVerifiedToken.current = true;
    }
  }, [user, mutate]);

  if (isLoading)
    return (
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/">
            <img src={logo} alt="Site Logo" className="logo" />
          </Link>
          <div className="navbar-links">
            <Link to="/matches" className="nav-link">
              Matches
            </Link>
            <Link to="/leaderboard" className="nav-link">
              Leaderboard
            </Link>
            {user && (
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            )}
          </div>
        </div>
      </nav>
    );

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="Site Logo" className="logo" />
        </Link>
        <div className="navbar-links">
          <Link to="/matches" className="nav-link">
            Matches
          </Link>
          <Link to="/leaderboard" className="nav-link">
            Leaderboard
          </Link>
          {user && (
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
          )}
        </div>
      </div>

      {/* Right side: Hamburger icon and account buttons */}
      <div className="navbar-right">
        
        <div className="navbar-account">
          {user ? (
            <div className="show-balance">{user.balance.toLocaleString()} Dinks</div>
          ) : (
            <>
              <Link to="/login" className="nav-button login">
                Login
              </Link>
              <Link to="/register" className="nav-button register">
                Register
              </Link>
            </>
          )}
        </div>
        <div className="hamburger" ref={hamburgerRef} onClick={toggleMobileMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      {/* Mobile Pop-Out Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <Link to="/matches" className="nav-link" onClick={toggleMobileMenu}>
            Matches
          </Link>
          <Link
            to="/leaderboard"
            className="nav-link"
            onClick={toggleMobileMenu}
          >
            Leaderboard
          </Link>
          {user && (
            <Link
              to="/profile"
              className="nav-link"
              onClick={toggleMobileMenu}
            >
              Profile
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default NavBar;
