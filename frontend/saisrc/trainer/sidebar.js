import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
//import './Sidebar.css';
import "../components/sidebar.css";
import menuIcon from "../assets/images/menu.png";
import DashboardIcon from "../assets/images/dashboard.png";
import DatabaseIcon from "../assets/images/database.png";
import TestIcon from "../assets/images/test.png";
import PracticesIcon from "../assets/images/practice.png";
import LMSIcon from "../assets/images/lms.png";
import questionsPng from '../assets/images/questions.png';
import invoiceIcon from '../assets/images/invoice.png';

const Sidebar = (isSidebarOpen) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [islmsOpen, setIslmsOpen] = useState(false);
  const [isinvoiceOpen, setIsinvoiceOpen] = useState(false);
  const [ispracticeOpen, setIspracticeOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");
  const [isDisabled, setIsDisabled] = useState(false);
 const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  useEffect(() => {
    if (isSidebarOpen === false) {
      setIsOpen(false);
      setIsTestOpen(false);
      setIsDatabaseOpen(false);
      setIslmsOpen(false);
      setIsinvoiceOpen(false);
      setIspracticeOpen(false);
      // setIsQuestionsOpen(false);
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
     if (isMobile) setIsOpen(false);
    setIsOpen(false); // Collapse the sidebar when a menu item is clicked
  };

  const toggleMenu = (menu) => {
    setIsQuestionsOpen(menu === "questions" ? !isQuestionsOpen : false);
    setIsTestOpen(menu === "test" ? !isTestOpen : false);
    setIsDatabaseOpen(menu === "database" ? !isDatabaseOpen : false);
    setIslmsOpen(menu === "lms" ? !islmsOpen : false);
    setIsinvoiceOpen(menu === "invoice" ? !isinvoiceOpen : false);
    setIspracticeOpen(menu === "practice" ? !ispracticeOpen : false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }
  };

  return (
    <div
        className={`sidebar ${
          isOpen ? 'open' : 'collapsed'
        } ${isMobile ? 'mobile-sidebar' : ''} ${isDisabled ? 'disabled' : ''}`}
        id="sidebar"
      >
        <button className="toggle-btn" onClick={toggleSidebar}>
          <span className="arrow">{isOpen ? '<' : '>'}</span>
        </button>

      <div style={{ marginTop: "20px" }}>
        <nav className="sidebar-nav">
          <ul>
            <Link
              to="/"
              onContextMenu={(e) => e.preventDefault()}
              style={{ color: "white", textDecoration: "none" }}
            >
              <li
                className={activeMenuItem === "dashboard" ? "active" : ""}
                onClick={() => handleMenuItemClick("dashboard")}
              >
                <img
                  src={DashboardIcon}
                  alt="Dashboard"
                  className="icon-image"
                />
                <span className="dashboard-text">Dashboard</span>
              </li>
            </Link>

            <Link
              to="/questions/question-paper"
              onContextMenu={(e) => e.preventDefault()}
              style={{ color: "white", textDecoration: "none" }}
            >
              <li
                className={activeMenuItem === "questionPaper" ? "active" : ""}
                onClick={() => handleMenuItemClick("questionPaper")}
              >
                <img
                  src={questionsPng}
                  alt="Learning Material"
                  className="icon-image"
                   style={{ width: '20px', height: '20px' }}
                />
                <span className="dashboard-text">Questions</span>
              </li>
            </Link>

            <li
              className={activeMenuItem === "lms" ? "active" : ""}
              onClick={() => handleMenuItemClick("lms")}
            >
              <div className={`test-section ${islmsOpen ? "open" : ""}`}>
                <div className="test-header" onClick={() => toggleMenu("lms")}>
                  <img
                    src={LMSIcon}
                    alt="Learning Material"
                    className="icon-image"
                  />
                  <Link
                    to="/Lms/upload-video"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    LMS
                  </Link>
                </div>
              </div>
            </li>
            <li>
              <div className={`test-section ${isTestOpen ? "open" : ""}`}>
                <div className="test-header" onClick={() => toggleMenu("test")}>
                  <img src={TestIcon} alt="Test" className="icon-image" />
                  <span>Test</span>
                </div>

                {isTestOpen && isOpen && (
                  <ul className="test-options" style={{ paddingLeft: "15px" }}>
                    <Link
                      to="/test/report"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <li
                        className={`test-option ${
                          activeMenuItem === "testReport" ? "active" : ""
                        }`}
                        onClick={() => handleMenuItemClick("testReport")}
                      >
                        <span className="dashboard-text"> TestReport</span>
                      </li>
                    </Link>
                  </ul>
                )}
              </div>
            </li>
            <Link
              to="/Database/upload-profile"
              onContextMenu={(e) => e.preventDefault()}
              style={{ color: "white", textDecoration: "none" }}
            >
              <li
                className={activeMenuItem === "database" ? "active" : ""}
                onClick={() => handleMenuItemClick("database")}
              >
                <img src={DatabaseIcon} alt="Database" className="icon-image" />
                <span className="dashboard-text"> TrainerProfile</span>
              </li>
            </Link>
            <Link
              to="/invoice"
              onContextMenu={(e) => e.preventDefault()}
              style={{ color: "white", textDecoration: "none" }}
            >
              <li
                className={activeMenuItem === "invoice" ? "active" : ""}
                onClick={() => handleMenuItemClick("invoice")}
              >
                <div className={`test-section ${islmsOpen ? "open" : ""}`}>
                  <div
                    className="test-header"
                    onClick={() => toggleMenu("invoice")}
                  >
                    <img src={invoiceIcon} alt="invoice" className="icon-image" />
                    <span className="dashboard-text"> Invoice</span>
                  </div>
                </div>
              </li>
            </Link>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
