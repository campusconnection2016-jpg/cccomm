import React, { useState, useContext,useEffect } from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';

import { useLocation } from "react-router-dom";

import DashboardIcon from '../assets/images/dashboard.png';
import DatabaseIcon from '../assets/images/database.png';
import TestIcon from '../assets/images/test.png';

import Downarrow from '../assets/images/dowm.png';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext } from '../components/test/context/testtypecontext';

const Sidebar = () => {
  const location = useLocation();
  const { setSelectedTestTypeCategory } = useContext(TestTypeCategoriesContext);

  const [isOpen, setIsOpen] = useState(true);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isdashopen, setIsDashOpen] = useState(false);

  const [activeMenuItem, setActiveMenuItem] = useState(null);

  useEffect(() => {
    if (location.pathname.includes('/test/test-schedules/')) {
      setIsTestOpen(true);
    }
  }, [location.pathname]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
    if (window.innerWidth <= 768) setIsOpen(false);
  };

  const toggledashMenu = () => {
    setIsDashOpen(!isdashopen);
    setIsTestOpen(false);
    setIsDatabaseOpen(false);
  };

  const toggleTestMenu = () => {
    setIsTestOpen(!isTestOpen);
    setIsDashOpen(false);
    setIsDatabaseOpen(false);
  };

  const toggleDatabaseMenu = () => {
    setIsDatabaseOpen(!isDatabaseOpen);
    setIsTestOpen(false);
    setIsDashOpen(false);
  };

  const handleAssessmentClick = (type) => {
    setSelectedTestTypeCategory(type);
    setActiveMenuItem(type);
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'}`} style={{ maxHeight: '100vh', overflowY: 'auto', scrollbarWidth: 'thin' }}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        <span className="arrow">{isOpen ? '<' : '>'}</span>
      </button>

      <div style={{ marginTop: '20px' }}>
        <nav className="sidebar-nav">
          <ul>
            {/* Dashboard */}
           
            {/* Test */}
            <li>
              <div className="test-section" style={{ width: '100%' }}>
                <div className="test-header" onClick={toggleTestMenu}>
                  <img src={TestIcon} alt="Test" className="icon-image" />
                  <Link to="/test/test-schedules/">Test</Link>
                  <img
                    src={Downarrow}
                    alt="Down Arrow"
                    className={`images12 ${!isTestOpen ? 'rotate-right' : ''}`}
                  />
                </div>

                {isTestOpen && isOpen && (
                  <ul className="test-options" style={{ paddingLeft: '20px' }}>
                    <li
                      className={`test-option ${activeMenuItem === 'pre-assessment' ? 'active' : ''}`}
                      onClick={() => handleAssessmentClick('pre-assessment')}
                    >
                     <Link to="/test/add-test/test-form/pre-assessment">Pre Assessment</Link>
                    </li>
                    <li
                      className={`test-option ${activeMenuItem === 'post-assessment' ? 'active' : ''}`}
                      onClick={() => handleAssessmentClick('post-assessment')}
                    >
                     <Link to="/test/add-test/test-form/post-assessment">Post Assessment</Link>
                    </li>
                  </ul>
                )}
              </div>
            </li>

           <li className="test-option">
    <Link
      to="/upload-employees"
      className={activeMenuItem === 'employees' ? 'active' : ''}
      onClick={() => handleMenuItemClick('employees')}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <img src={DatabaseIcon} alt="Employees" className="icon-image" />
      <span className="dashboard-text">Employees</span>
    </Link>
  </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
