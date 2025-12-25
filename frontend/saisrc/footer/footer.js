import React from 'react';
import Copyright from '../../src/assets/images/copyright.png';
import '../../src/styles/global.css';

const Footer = () => {
  return (
    <div className="footer">
      <img src={Copyright} alt="Copyright" className="footer-image" />
      <strong>
        <p className="footer-text">Copyrights Campus Connection 2024. All rights reserved</p>
      </strong>
    </div>
  );
};

export default Footer;
