import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import './footer.css';



const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="flex-container">
          <div className="social-links">
            <a href="https://github.com/Urmil7766" className="social-icon">
              <FaGithub size={20} />
            </a>
            <a href="https://www.linkedin.com/" className="social-icon">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
