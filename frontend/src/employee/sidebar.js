import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/sidebar.css';
import DashboardIcon from '../assets/images/dashboard.png';
import TestIcon from '../assets/images/test.png';
import ProfileIcon from '../assets/images/jobprofile.png';
import invoiceIcon from '../assets/images/invoice.png';


const Sidebar = ({ isSidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [islmsOpen, setIslmsOpen] = useState(false);
  const [ispracticeOpen, setIspracticeOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (isSidebarOpen === false) {
      setIsOpen(false);
      setIsTestOpen(false);
      setIsDatabaseOpen(false);
      setIslmsOpen(false);
      setIspracticeOpen(false);
    } else if (isSidebarOpen === true) {
      setIsOpen(true);
      setIsTestOpen(true);
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
    setIsOpen(false); // Collapse the sidebar when a menu item is clicked
  };

  const toggleMenu = (menu) => {
    setIsTestOpen(menu === 'test' ? !isTestOpen : false);
    setIsDatabaseOpen(menu === 'database' ? !isDatabaseOpen : false);
    setIslmsOpen(menu === 'lms' ? !islmsOpen : false);
    setIspracticeOpen(menu === 'practice' ? !ispracticeOpen : false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }

  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'}${isDisabled ? 'disabled' : ''}`} id="sidebar">
      <button className="toggle-btn" onClick={toggleSidebar}>
        <span className="arrow">{isOpen ? '<' : '>'}</span>
      </button>

      <div style={{ marginTop: '20px' }}>
        <nav className="sidebar-nav">
         <ul>
  <Link to="/test/ts-online" onContextMenu={(e) => e.preventDefault()} style={{ color: "white", textDecoration: "none" }}>
    <li className={`test-option ${activeMenuItem === 'onlineTest' ? 'active' : ''}`} onClick={() => handleMenuItemClick('onlineTest')}>
      <img src={TestIcon} alt="Test" className='icon-image' />
      <span className="dashboard-text">Test</span>
    </li>
  </Link>

  {/* ✅ New Register Menu Item */}
  <Link to="/register/employee/" onContextMenu={(e) => e.preventDefault()} style={{ color: "white", textDecoration: "none" }}>
    <li className={`register-option ${activeMenuItem === 'register' ? 'active' : ''}`} onClick={() => handleMenuItemClick('register')}>
      <img src={ProfileIcon} alt="Register" className="icon-image" />
      <span className="dashboard-text">Register</span>
    </li>
  </Link>
</ul>

        </nav>
      </div>
    </div >
  );
};

export default Sidebar;
