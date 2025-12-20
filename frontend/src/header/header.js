import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  useMediaQuery,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Button,
  Tooltip,
} from "@mui/material";

import "./header.css";
import ErrorModal from '../components/auth/errormodal';
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useContext } from "react";
import { ThemeContext } from "../themecontext";
import Logo from "../assets/images/logo.jpg";
import { SearchContext } from "../allsearch/searchcontext";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material";
import {
  getCollege_logo_API,

  updateStudentRequestStatusApi,
  getStudentRequests,
  getPlacementOfficersByBranch,
  getrequestpla_countApi,
  getrequestplaementQueryApi,
  getcollegeApi,
  getRequestedStudentTestNames_API,
  reassignTestCandidate_API

} from "../api/endpoints";
import App from "../app";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CircleIcon from "@mui/icons-material/Circle";   // ✅ Added import
import { useNavigate } from 'react-router-dom';

const Header = ({ collegeName, username, userRole, institute }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { searchQuery, setSearchQuery, globalSearch, setGlobalSearch } = useContext(SearchContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [collegeLogo, setCollegeLogo] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [studentRequests, setStudentRequests] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // State to track which item is being hovered
  const [scheduleDate, setScheduleDate] = useState(null);
  const [invoiceReminder, setInvoiceReminder] = useState(null);
const [showPOPopup, setShowPOPopup] = useState(false);
const [placementOfficers, setPlacementOfficers] = useState([]);

  const [hoveredId, setHoveredId] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [collegeCode, setCollegeCode] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();


  const [studentRequestsReassigned, setStudentRequestsReassigned] = useState([]);

  // Define fetchRequestedTests at the top-level of the component
  const fetchRequestedTests = async () => {
    try {
      const response = await getRequestedStudentTestNames_API();
      setStudentRequestsReassigned(response);
    } catch (error) {
      console.error("Failed to fetch reassigned student test names:", error);
    }
  };

    const refreshStudentRequestsCount = () => {
      return new Promise(async (resolve, reject) => {
        if (
          userRole === "Training admin" ||
          userRole === "Placement admin" ||
          userRole === "Super admin"||
          userRole === "Placement Officer" 
        ) {
          try {
            const requests = await getStudentRequests();
            const pendingRequests = requests.filter(
              (request) => request.status === "Pending"
            );
            const sortedRequests = pendingRequests.sort(
              (a, b) => new Date(b.dtm_request) - new Date(a.dtm_request)
            );
            //setStudentRequests(sortedRequests);
            resolve(sortedRequests.length); // <-- resolve with count
          } catch (error) {
            console.error("Error fetching student requests:", error);
            reject(error);
          }
        } else if (userRole === "Placement Officer") {
          try {
            const count = await getrequestpla_countApi(institute);
            const requests = await getrequestplaementQueryApi(institute);
            // setStudentRequests(requests);
            resolve(count.count || 0); // <-- resolve with count
          } catch (error) {
            console.error("Error fetching student requests:", error);
            reject(error);
          }
        } else {
          resolve(0); // if role doesn't match
        }
      });
    };

    const fetchRequestedTestsCount = async () => {
      try {
        const response = await getRequestedStudentTestNames_API();
        // setStudentRequestsReassigned(response);
        return response.length;
      } catch (error) {
        console.error("Failed to fetch reassigned student test names:", error);
        return 0;
      }
    };

    const refreshAllRequestCount = async () => {
  try {
    let reassignCount = 0;
    let requestCount = 0;

    if (
      userRole === "Super admin" ||
     userRole === "Placement admin" ||
       userRole === "Placement Officer"
       
    ) {
      reassignCount = await fetchRequestedTestsCount();
    }

    if (
      userRole === "Super admin" ||
      userRole === "Placement admin" ||
      userRole === "Placement Officer"
    ) {
      requestCount = await refreshStudentRequestsCount();
    }

    setRequestCount(reassignCount + requestCount);
  } catch (error) {
    console.error("Failed to refresh total request count:", error);
  }
};


    const refreshAllRequestCount_OLD = async () => {
      try {
        const [reassignCount, requestCount] = await Promise.all([
          fetchRequestedTestsCount(),
          refreshStudentRequestsCount(),
        ]);
        setRequestCount(reassignCount + requestCount);
      } catch (error) {
        console.error("Failed to refresh total request count:", error);
      }
    };



  // Run it on initial mount
  useEffect(() => {
    refreshStudentRequests();
    fetchRequestedTests();

    refreshAllRequestCount();
  }, []);

  // Use it inside the handlers
  const handleAcceptReassign = async (studentId) => {
    try {
      await reassignTestCandidate_API({ id: studentId, action: "accept" });
      console.log("Reassigned test accepted");
      fetchRequestedTests(); // Refresh

      refreshAllRequestCount();
    } catch (error) {
      console.error("Failed to accept reassigned test:", error);
    }
  };

  const handleDeclineReassign = async (studentId) => {
    try {
      await reassignTestCandidate_API({ id: studentId, action: "decline" });
      console.log("Reassigned test declined");
      fetchRequestedTests(); // Refresh
      refreshAllRequestCount();
    } catch (error) {
      console.error("Failed to decline reassigned test:", error);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  useEffect(() => {
    // Fetch request count and student requests on component mount

    if (userRole !== 'Super admin') {
      getCollege_logo_API()
        .then((data) => {
          console.log('college data:', data);

          const college = data.find((college) => college.college === collegeName);

          if (college) {
            if (college.college_logo) {
              setCollegeLogo(college.college_logo);
            }
            if (college.college_code) {
              setCollegeCode(college.college_code); // Assuming you have a state for college_code
              console.log('collegeCode:', college.college_code);
            }
          } else {
            console.log('No matching college found for the given collegeName.');
          }
        })
        .catch((error) => {
          console.error('Error fetching college data:', error);
        });
    }
  }, [collegeName, userRole]); // Adding userRole dependency to avoid potential stale values


  useEffect(() => {
    const fetchCollegeId = async () => {
      try {
        if (!collegeName || typeof collegeName !== 'string') {
          // console.warn("collegeName is invalid:", collegeName);
          return;
        }

        console.log("Fetching college list...");
        const data = await getcollegeApi();
        console.log("API response data:", data);
        console.log("collegeName value and type:", collegeName, typeof collegeName);
        console.log("Is data an array?", Array.isArray(data));

        if (Array.isArray(data)) {
          const matchingCollege = data.find(
            (college) =>
              typeof college.college === 'string' &&
              college.college.trim() === collegeName.trim()
          );

          if (matchingCollege) {
            console.log("Matching college:", matchingCollege);
            setCollegeId(matchingCollege.id);
          } else {
            console.warn("No matching college found for:", collegeName);
          }
        } else {
          console.warn("Unexpected response structure:", data);
        }
      } catch (error) {
        console.error("Error fetching college data:", error);
      }
    };

    fetchCollegeId();
  }, [collegeName]);


  const refreshStudentRequests = () => {
    if (
      userRole === "Training admin" ||
      userRole === "Placement admin" ||
      userRole === "Super admin"
    ) {

      // getStudentRequestCount()
      //   .then((count) => setRequestCount(count))
      //   .catch((error) =>
      //     console.error("Error fetching request count:", error)
      //   );

      getStudentRequests()
        .then((requests) => {
          const pendingRequests = requests.filter(
            (request) => request.status === "Pending"
          );
          const sortedRequests = pendingRequests.sort(
            (a, b) => new Date(b.dtm_request) - new Date(a.dtm_request)
          );

          setStudentRequests(sortedRequests);
          //setRequestCount(sortedRequests.length);
        })
        .catch((error) =>
          console.error("Error fetching student requests:", error)
        );
    } else if (userRole === "Placement Officer") {
      console.log('Header Placement Officer Request processing....');
      console.log('Colllege id: ', institute);

      getrequestpla_countApi(institute)
        .then((count) => {
          console.log('count: ', count.count);
          // setRequestCount(count.count);
          return getrequestplaementQueryApi(institute); // Ensure you return the promise

        })
        .then((requests) => {
          console.log('Request.po: ', requests);

          setStudentRequests(requests);
        })
        .catch((error) =>
          console.error("Error fetching student requests:", error)
        );
    }
  };



  // Define keyword-route mappings
  const routeMapping = [
    { keyword: 'Questions', route: '/question-paper-table' },
    { keyword: 'Dashboard', route: '/' },
    { keyword: 'Reports', route: '/reports' },
    { keyword: 'Upload Video', route: '/lms/upload-video' },
    { keyword: 'Test Schedules', route: '/test/test-schedules/' },
    { keyword: 'LMS', route: '/lms' },
    { keyword: 'LMS Map', route: '/lms/map/' },
    { keyword: 'Student Feedback', route: '/stufeedback/' },
    { keyword: 'Trainers Report', route: '/Trainerfeedback/' },
    // Add more keyword-route mappings as needed
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    const input = e.target.value;
    setGlobalSearch(input);

    // Filter suggestions based on input
    if (input.trim() === '') {
      setSuggestions([]);
    } else {
      const filteredSuggestions = routeMapping.filter(({ keyword }) =>
        keyword.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    }
  };

  // Handle selection from suggestions
  const handleSuggestionClick = (route) => {
    navigate(route);
    setGlobalSearch(''); // Clear search input
    setSuggestions([]); // Clear suggestions
  };

  // Handle pressing Enter
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      navigate(suggestions[0].route); // Navigate to the first suggestion
      setGlobalSearch('');
      setSuggestions([]);
    }
  };
  const handleLogout = () => {
    console.log("Logging out...");

    // ✅ Clear localStorage
    localStorage.clear();

    // ✅ Clear sessionStorage
    sessionStorage.clear();

    // ✅ Clear all cookies for current domain
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      // Set cookie to expire immediately
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
localStorage.removeItem("isPOFromSuperAdmin");
localStorage.removeItem("swapToPO");
localStorage.removeItem("college_id"); // if you're using it

    // ✅ Redirect to your login/home page
    //window.location.assign("http://localhost:3000");
    window.location.assign("https://ccportal.co.in");
  };
const handleSwapToPOLogin = () => {
  // Save a flag to localStorage so Login page knows this is a swap
  localStorage.setItem("swapToPO", "true");

  // Logout (clear everything and redirect to login page)
  handleLogout();
};


  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (option) => {
    if (option === "logout") {
      handleLogout();
    } else if (option === "settings") {
      console.log("Settings selected");
    }
    handleMenuClose();
  };

  const handleIconClick = () => {
    setIsPopoverOpen(true);
    refreshStudentRequests(); // Refresh the list and count when the icon is clicked
    fetchRequestedTests();
  };

  const handleDecline = async (studentId) => {
    try {
      await updateStudentRequestStatusApi(studentId, "Declined");
      setStudentRequests((prevRequests) =>
        prevRequests.filter((request) => request.student_id !== studentId)
      );
      setRequestCount((prevCount) => prevCount - 1, 0); // Decrease the count immediately
      refreshStudentRequests();
      refreshAllRequestCount();
    } catch (error) {
      console.error(
        `Failed to decline request with Student ID: ${studentId}`,
        error
      );
    }
  };

  const handleAccept = async (studentId) => {
    try {
      await updateStudentRequestStatusApi(studentId, "Accepted");
      setStudentRequests((prevRequests) =>
        prevRequests.filter((request) => request.student_id !== studentId)
      );
      setRequestCount((prevCount) => prevCount - 1, 0); // Decrease the count immediately
      refreshStudentRequests();
      refreshAllRequestCount();
    } catch (error) {
      console.error(
        `Failed to accept request with Student ID: ${studentId}`,
        error
      );
    }
  };

  const handleClose = () => {
    setIsPopoverOpen(false);
  };



  return (
    <AppBar
      style={{
        top: 0,
        zIndex: 1000,
        backgroundColor: "#39444e",
        position: "sticky",
        position: "-webkit-sticky",
      }}
    >
      <Toolbar
        style={{ justifyContent: isMobile ? "space-between" : "flex-start" }}
      >
        <img
          style={{
            borderRadius: "5px",
            width: isMobile ? "50px" : "140px",
            height: "auto",
            marginLeft: isMobile ? "-13px" : "10px",
          }}
          src={Logo}
          className="Campus-logo"
          alt="Campus Connection Logo"
        />
        <div variant="h6" className="headerss-container">
          {collegeLogo && (
            <img
              src={`data:image/png;base64,${collegeLogo}`}
              alt={`${collegeName} Logo`}
              className="headerss-logo"
            />
          )}
          <span
            style={{ marginLeft: isMobile ? "-95px" : "10px" }}
            className="headerss-text"
          >
            {collegeName}
          </span>
          {/* ✅ Online/Offline Indicator - Moved next to college name for mobile */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", marginLeft: "8px" }}>
              <CircleIcon
                style={{
                  fontSize: "10px",
                  color: isOnline ? "limegreen" : "red",
                  marginRight: "3px",
                }}
              />
              <Typography variant="body2" style={{ color: "white", fontSize: "10px", whiteSpace: "nowrap" }}>
                {isOnline ? "Online" : "Offline"}
              </Typography>
            </div>
          )}
        </div>

        <div
          className="end-header"
          style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
        >
          {/* ✅ Online/Offline Indicator for Desktop */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", marginRight: "15px" }}>
              <CircleIcon
                style={{
                  fontSize: "14px",
                  color: isOnline ? "limegreen" : "red",
                  marginRight: "6px",
                }}
              />
              <Typography variant="body2" style={{ color: "white", fontSize: "14px" }}>
                {isOnline ? "Online" : "Offline"}
              </Typography>
            </div>
          )}
          
          {/* Google-style Search Bar */}
          <div style={{ position: 'relative', marginLeft: isMobile ? "-45%" : "10px" }}>
            {/* Google-style Search Container */}
            <div
              className="google-search-container"
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#2d353c",
                borderRadius: isMobile ? "20px" : "24px",
                padding: isMobile ? "4px 8px" : "8px 16px",
                boxShadow: "0 1px 6px rgba(0, 0, 0, 0.3)",
                transition: "box-shadow 0.2s",
                width: isMobile ? "85px" : "280px",
                border: "1px solid #4a5562",
                height: isMobile ? "28px" : "auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 6px rgba(0, 0, 0, 0.3)";
              }}
            >
              {/* Search Icon */}
              <SearchIcon style={{ color: "#9ca3af", marginRight: isMobile ? "2px" : "8px", fontSize: isMobile ? "14px" : "20px" }} />

              {/* Search Input */}
              <InputBase
                type="text"
                placeholder={isMobile ? "Search" : "Search…"}
                className="search-input"
                style={{
                  flex: 1,
                  color: "white",
                  fontSize: isMobile ? "10px" : "14px",
                }}
                value={globalSearch}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
              />
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <ul
                  style={{
                    position: 'absolute',
                    top: isMobile ? '38px' : '50px',
                    left: '0',
                    backgroundColor: '#2d353c',
                    border: '1px solid #4a5562',
                    borderRadius: '8px',
                    listStyle: 'none',
                    padding: '8px 0',
                    margin: '0',
                    width: isMobile ? '85px' : '280px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {suggestions.map(({ keyword, route }, index) => (
                    <li
                      key={index}
                      style={{
                        padding: isMobile ? '5px 6px' : '10px 16px',
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: isMobile ? '9px' : '14px',
                        transition: 'background-color 0.1s',
                        whiteSpace: isMobile ? 'nowrap' : 'normal',
                        overflow: isMobile ? 'hidden' : 'visible',
                        textOverflow: isMobile ? 'ellipsis' : 'clip',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#39444e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2d353c';
                      }}
                      onClick={() => handleSuggestionClick(route)}
                    >
                      <SearchIcon style={{ fontSize: isMobile ? '10px' : '16px', color: '#9ca3af', marginRight: isMobile ? '3px' : '12px', verticalAlign: 'middle' }} />
                      {keyword}
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {/* Notification */}
          <IconButton
            color="inherit"
            style={{
              marginLeft: "15px",
              color: userRole === "Placement admin" ? "black" : "inherit",
            }}
          >
            {userRole === "Trainer" && invoiceReminder ? (
              <Badge
                badgeContent={scheduleDate ? 1 : 0} // Add logic to handle notification count
                color="secondary"
                onClick={handleIconClick}
              >
                <NotificationsIcon />
              </Badge>
            ) : userRole === "Placement admin" ? (
              <NotificationsIcon onClick={handleIconClick} />
            ) : (
              <Badge
                badgeContent={requestCount}
                color="secondary"
                onClick={handleIconClick}
              >
                <NotificationsIcon />
              </Badge>
            )}
          </IconButton>
          <Popover
            style={{ marginTop: "30px" }}
            open={isPopoverOpen}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              style: {
                height: "300px",
                overflowY: "auto",
                backgroundColor: "#2d353c",
              },
            }}
          >
            {userRole === "Trainer" ? (
              invoiceReminder && (
                <List style={{ backgroundColor: "#2d353c" }}>
                  <ListItem style={{ color: "white" }}>
                    <ListItemText primary={invoiceReminder} />
                  </ListItem>
                </List>
              )
            ) : userRole === "Training admin" ||
              userRole === "Placement Officer" ||
              userRole === "Super admin" ? (
              <List style={{ backgroundColor: "#2d353c" }}>

                {studentRequests.length > 0 || studentRequestsReassigned.length > 0 ? (
                  <>
                    {/* 🔹 Student Query Requests */}
                    {studentRequests.map((request) => (
                      <ListItem
                        key={request.student_id}
                        onMouseEnter={() => setHoveredId(request.student_id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{ color: "white" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", marginRight: "8px" }}>
                          <Tooltip title={`User Name: ${request.user_name}`}>
                            <AccountCircleIcon
                              style={{
                                color: hoveredId === request.student_id ? "white" : "#ccc",
                                transition: "color 0.3s",
                                marginLeft: isMobile ? "-15px" : "0px",
                              }}
                            />
                          </Tooltip>
                        </div>
                        <ListItemText
                          primary={request.student_query}
                          style={{ color: "white" }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleAccept(request.student_id)}
                          style={{ color: "rgba(85 150 147)" }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          style={{ marginLeft: "10px", color: "rgba(157 85 27)" }}
                          onClick={() => handleDecline(request.student_id)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </ListItem>
                    ))}

                    {/* 🔸 Reassign Requests */}
                    {studentRequestsReassigned.map((request) => (
                      <ListItem
                        key={`reassign-${request.id}`}
                        onMouseEnter={() => setHoveredId(request.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{ color: "white" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", marginRight: "8px" }}>
                          <Tooltip title={`User Name: ${request.user_name}`}>
                            <AccountCircleIcon
                              style={{
                                color: hoveredId === request.id ? "white" : "#ccc",
                                transition: "color 0.3s",
                                marginLeft: isMobile ? "-15px" : "0px",
                              }}
                            />
                          </Tooltip>
                        </div>
                        <ListItemText
                          primary={`Practice : ${request.test_name}`}
                          style={{ color: "#d7d71a" }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleAcceptReassign(request.id)}
                          style={{ color: "rgba(85 150 147)" }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          style={{ marginLeft: "10px", color: "rgba(157 85 27)" }}
                          onClick={() => handleDeclineReassign(request.id)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </>
                ) : userRole === "Placement admin" ? (
                  <List style={{ backgroundColor: "#2d353c" }}>
                    <ListItem>
                      <ListItemText primary="You do not have permission to view this." style={{ color: "white" }} />
                    </ListItem>
                  </List>
                ) : (
                  <ListItem>
                    <ListItemText primary="No requests available" style={{ color: "white" }} />
                  </ListItem>
                )}
              </List>
            ) : (
              <List style={{ backgroundColor: "#2d353c" }}>
                <ListItem>
                  <ListItemText primary="You do not have permission to view this." />
                </ListItem>
              </List>
            )}
          </Popover>
          {/* Notification */}
          <IconButton edge="end" color="inherit">
            {/*  <AccountCircle />*/}
          </IconButton>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              style={{
                marginLeft: "-7px",
                marginLeft: isMobile ? "-1%" : "0px",
              }}
            >
              <MoreVertIcon />
            </IconButton>
          )}
          {!isMobile && (
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography style={{ fontWeight: "bold", fontSize: "18px" }}>
                {userRole === "Placement Officer" ? collegeCode : username}
              </Typography>
            </MenuItem>
            {(userRole === "Training admin" ||
              userRole === "Placement admin" ||
              userRole === "Super admin" ||
              userRole === "Placement Officer") && (
                <MenuItem>
                  <Link to="/Database/settings">Settings</Link>
                </MenuItem>
              )}
          {(userRole === "college super admin" ||
  (userRole === "Placement Officer" && localStorage.getItem("isPOFromSuperAdmin") === "true")) && (
    <MenuItem onClick={handleSwapToPOLogin}>Swap to PO</MenuItem>
)}


            <MenuItem onClick={() => handleMenuItemClick("logout")}>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </AppBar>
  );
};

export default Header;