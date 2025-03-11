import React from 'react';
import '../css/Footer.css'; // Import CSS for styling
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Pickleball-Picks</p>
        <div className="footer-links">
           <Link to="/about" className="footer-link">
                About
            </Link>
            <Link to="/privacy-policy" className="footer-link">
                Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="footer-link">
                Terms of Service
            </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
