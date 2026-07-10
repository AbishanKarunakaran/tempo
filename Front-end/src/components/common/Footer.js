import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Green Justice Organization. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
