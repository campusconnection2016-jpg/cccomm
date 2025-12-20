import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/sidebar.css';
import DashboardIcon from '../assets/images/dashboard.png';
import TestIcon from '../assets/images/test.png';
import PracticesIcon from '../assets/images/practice.png';
import LMSIcon from '../assets/images/lms.png';
import ProfileIcon from '../assets/images/jobprofile.png';
import invoiceIcon from '../assets/images/invoice.png';
import { getUserRoleAccess } from '../api/endpoints';

const Sidebar = ({ isSidebarOpen, institute, username }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [islmsOpen, setIslmsOpen] = useState(false);
  const [ispracticeOpen, setIspracticeOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [isDisabled, setIsDisabled] = useState(false);
  const [levelAccess, setLevelAccess] = useState(null);

  // ✅ Detect if mobile screen
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (isMobile) setIsOpen(false); // ✅ Close sidebar on mobile when a link is clicked
  };

  const toggleMenu = (menu) => {
    setIsTestOpen(menu === 'test' ? !isTestOpen : false);
    setIsDatabaseOpen(menu === 'database' ? !isDatabaseOpen : false);
    setIslmsOpen(menu === 'lms' ? !islmsOpen : false);
    setIspracticeOpen(menu === 'practice' ? !ispracticeOpen : false);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (institute && username) {
      getUserRoleAccess(institute, username)
        .then((data) => {
          console.log("Access Data:", data);
          setLevelAccess(data?.level_of_access || null);
        })
        .catch((err) => console.error("Failed to fetch level of access:", err));
    }
  }, [institute, username]);

  return (
    <>
   

      <div
        className={`sidebar ${
          isOpen ? 'open' : 'collapsed'
        } ${isMobile ? 'mobile-sidebar' : ''} ${isDisabled ? 'disabled' : ''}`}
        id="sidebar"
      >
        <button className="toggle-btn" onClick={toggleSidebar}>
          <span className="arrow">{isOpen ? '<' : '>'}</span>
        </button>

        <div style={{ marginTop: '20px' }}>
          <nav className="sidebar-nav">
            <ul>
              <Link
                to="/"
                onContextMenu={(e) => e.preventDefault()}
                style={{ color: "white", textDecoration: "none" }}
              >
                <li
                  className={activeMenuItem === 'dashboard' ? 'active' : ''}
                  onClick={() => handleMenuItemClick('dashboard')}
                >
                  <img src={DashboardIcon} alt="Dashboard" className="icon-image" />
                  <span className="dashboard-text">Dashboard</span>
                </li>
              </Link>

              <Link
                to="/Database/upload-student-profile"
                onContextMenu={(e) => e.preventDefault()}
                style={{ color: "white", textDecoration: "none" }}
              >
                <li
                  className={activeMenuItem === 'database' ? 'active' : ''}
                  onClick={() => handleMenuItemClick('database')}
                >
                  <img src={ProfileIcon} alt="Database" className="icon-image" />
                  <span className="dashboard-text">Student Profile</span>
                </li>
              </Link>

              <Link
                to="/Lms/lms"
                onContextMenu={(e) => e.preventDefault()}
                style={{ color: "white", textDecoration: "none" }}
              >
                <li
                  className={activeMenuItem === 'learningMaterial' ? 'active' : ''}
                  onClick={() => handleMenuItemClick('learningMaterial')}
                >
                  <img src={LMSIcon} alt="Learning Material" className="icon-image" />
                  <span className="dashboard-text">LMS</span>
                </li>
              </Link>

              {levelAccess !== 'Silver' && levelAccess !== 'Gold' && (
                <Link
                  to="/practice-question"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ color: "white", textDecoration: "none" }}
                >
                  <li
                    className={activeMenuItem === 'practiceQuestion' ? 'active' : ''}
                    onClick={() => handleMenuItemClick('practiceQuestion')}
                  >
                    <img src={PracticesIcon} alt="Practice Question" className="icon-image" />
                    <span className="dashboard-text">Practice Test</span>
                  </li>
                </Link>
              )}

              <li>
                <div
                  className={`test-section ${isTestOpen ? 'open' : ''}`}
                  style={{ color: "white", textDecoration: "none" }}
                >
                  <div className="test-header" onClick={() => toggleMenu('test')}>
                    <img src={TestIcon} alt="Test" className="icon-image" />
                    <span>Assessment</span>
                  </div>
                  {isTestOpen && isOpen && (
                    <ul
                      className="test-options"
                      style={{
                        color: "white",
                        textDecoration: "none",
                        paddingLeft: '15px',
                      }}
                    >
                      <Link  className="disabled-link"
  onClick={(e) => e.preventDefault()} 
                      to="/test/ts-online" onContextMenu={(e) => e.preventDefault()}>
                        <li
                          className={`menu-item disabled ${
    activeMenuItem === "training" ? "active" : ""
  }`}
                        //  className={`test-option ${
                        //    activeMenuItem === 'onlineTest' ? 'active' : ''
                        //  }`}
                          onClick={() => handleMenuItemClick('onlineTest')}
                        >
                          <span className="dashboard-text">MCQ Test</span>
                        </li>
                      </Link>

                      <Link
                       className="disabled-link"
  onClick={(e) => e.preventDefault()} 
                        to="/test/ts-code"
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ color: "white", textDecoration: "none" }}
                      >
                        <li
                          className={`menu-item disabled ${
    activeMenuItem === "training" ? "active" : ""
  }`}
                        //  className={`test-option ${
                        //    activeMenuItem === 'codeTest' ? 'active' : ''
                        //  }`}
                          onClick={() => handleMenuItemClick('codeTest')}
                        >
                          <span className="dashboard-text">Code Test</span>
                        </li>
                      </Link>
                      <Link
                        to="/test/communication/"
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ color: "white", textDecoration: "none" }}
                      >
                        <li
                          className={`test-option ${
                            activeMenuItem === 'communication' ? 'active' : ''
                          }`}
                          onClick={() => handleMenuItemClick('communication')}
                        >
                          <span className="dashboard-text">communication Test</span>
                        </li>
                      </Link>

                      <Link
                        to="/test/Testschedule"
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ color: "white", textDecoration: "none" }}
                      >
                        <li
                          className={`test-option ${
                            activeMenuItem === 'testSchedule' ? 'active' : ''
                          }`}
                          onClick={() => handleMenuItemClick('testSchedule')}
                        >
                          <span className="dashboard-text">Test Schedule</span>
                        </li>
                      </Link>
                    </ul>
                  )}
                </div>
              </li>
               
{/*} <Link
                  to="/lang-translate"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ color: "white", textDecoration: "none" }}
                >
                  <li
                    className={activeMenuItem === 'lang-translate' ? 'active' : ''}
                    onClick={() => handleMenuItemClick('lang-translate')}
                  >
                     <span className="dashboard-text">LanguageTransplate</span>
                  </li>
                </Link>*/}

              {levelAccess !== 'Silver' && levelAccess !== 'Gold' && (
                <Link
                        className="disabled-link"
  onClick={(e) => e.preventDefault()} 
                  to="/offers"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ color: "white", textDecoration: "none" }}
                >
                  <li
                    className={`menu-item disabled ${
    activeMenuItem === "training" ? "active" : ""
  }`}
                   // className={activeMenuItem === 'Offer' ? 'active' : ''}
                    onClick={() => handleMenuItemClick('Offer')}
                  >
                    <img src={invoiceIcon} alt="Offer" className="icon-image" />
                    <span className="dashboard-text">Placement</span>
                  </li>
                </Link>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
