import React, { useState, useEffect } from 'react';
import './login.css';
import Logo from "../../assets/images/logo.jpg";
import {verify_otp_API,
    getcollegeApi,send_otp_API,check_user_status_API,
    get_Login_By_Username_API,getPlacementOfficersByBranch
} from '../../api/endpoints.js';
import Students from '../../students.js';
import App from '../../app.js';
import ErrorModal from './errormodal.js';

import Trainer from '../../trainers.js'
import Corporate from '../../corporate.js';
//import Corporate from '../../Corporate';
import PlacementOfficer from '../../placementofficer.js';
import PlacementAdmin from '../../placementadmin.js';
import TrainingAdmin from '../../trainingadmin.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Employee from '../../employee.js';
import Hdfc from '../../hdfc.js';


function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [institute, setInstitute] = useState('');

    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Initialize isLoggedIn state
    const [rememberMe, setRememberMe] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [loggedInInstitute, setLoggedInInstitute] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [collegeGroup, setCollegeGroup] = useState('');
// OTP related states
const [showOTPSection, setShowOTPSection] = useState(false);
const [otp, setOtp] = useState("");
const [tempUserData, setTempUserData] = useState(null);
const [isSendingOtp, setIsSendingOtp] = useState(false);
const [isOtpSent, setIsOtpSent] = useState(false);
const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

// Optional (if you want resend OTP with timer)
const [otpTimer, setOtpTimer] = useState(0);
const [canResendOtp, setCanResendOtp] = useState(false);

    const [userData, setUserData] = useState({
        role: '',
        collegeId: '',
        collegeName: '',
    });
const [placementOfficers, setPlacementOfficers] = useState([]);
const [showPOPopup, setShowPOPopup] = useState(false);
const [isLoadingPOs, setIsLoadingPOs] = useState(false);
useEffect(() => {
  const isSwapToPO = localStorage.getItem("swapToPO");

  if (isSwapToPO) {
    localStorage.removeItem("swapToPO"); // Clear flag

    // 👇 Optional: Show loading or message

    // Fetch the list of Placement Officers
    const fetchPOs = async () => {
      try {

        const officers = await getPlacementOfficersByBranch(loggedInInstitute); // default to 1 or use saved collegeId if available
        setPlacementOfficers(officers);
        setShowPOPopup(true);
      } catch (err) {
        console.error("Error fetching placement officers during swap:", err);
      }
    };

    fetchPOs();
  }
}, []);

const handleLogin = async (e) => {
  e.preventDefault();
  console.log("➡️ handleLogin started...");

  try {
    // ---------- OTP VERIFICATION ----------
    if (showOTPSection) {
      console.log("📨 Verifying OTP...");
      try {
        const res = await verify_otp_API(tempUserData.user_name, otp);

        if (res && res.success) {
          console.log("✅ OTP verified successfully → completing login");

          // Special handling for college super admin
          if (tempUserData.role === "college super admin") {
            console.log("🏫 College Super Admin logged in");
            localStorage.setItem("college_id", tempUserData.college_id);

            try {
              setIsLoadingPOs(true);
              const officers = await getPlacementOfficersByBranch(tempUserData.college_id);
              setPlacementOfficers(officers);
              setShowPOPopup(true);
            } catch (err) {
              console.error("🚨 Error fetching placement officers:", err);
            } finally {
              setIsLoadingPOs(false);
            }
          }

          completeLogin(tempUserData);
        } else {
          console.warn("❌ OTP verification failed");
          setErrorMessage(res?.error || "Invalid OTP. Please try again.");
          setShowError(true);
        }
      } catch (err) {
        console.error("🚨 Error verifying OTP:", err);
        setErrorMessage(err.response?.data?.error || "Error verifying OTP. Please try again.");
        setShowError(true);
      } finally {
        setIsVerifyingOtp(false);
      }
      return;
    }

    // ---------- NORMAL LOGIN ----------
    console.log("👤 Normal login mode");
    const response = await get_Login_By_Username_API(username, password);

    if (response.length === 0) {
      console.warn("⚠️ No users found");
      setErrorMessage("No users found");
      setShowError(true);
      return;
    }

    const user = response.find(
      (u) =>
        u.user_name.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      console.warn("⚠️ Invalid credentials");
      setErrorMessage("Invalid email or password");
      setShowError(true);
      return;
    }

    console.log("✅ User found:", user);

    // ---------- STUDENT LOGIN ----------
    if (user.role === "Student") {
      const statusRes = await check_user_status_API(user.user_name);

      if (statusRes?.is_database === true) {
        // OTP required for students in database
        console.log("📩 Student requires OTP → sending OTP to:", user.user_name);
        setTempUserData(user);
        setShowOTPSection(true);
        await sendOTPToEmail(user.user_name);
        return;
      } else {
        // Direct password login for students not in database
        console.log("✅ Student is_database = false → login directly");
        completeLogin(user);
        return;
      }
    }

    // ---------- ALL OTHER ROLES ----------
    console.log(`🔒 Sending OTP to ${user.role}:`, user.user_name);
    setTempUserData(user);
    setShowOTPSection(true);
    await sendOTPToEmail(user.user_name);

  } catch (error) {
    console.error("🚨 Error in handleLogin:", error);
    setErrorMessage("An error occurred while logging in");
    setShowError(true);
  }
};

const sendOTPToEmail = async (username) => {
  try {
    setIsSendingOtp(true);
    const res = await send_otp_API(username);

    if (res && res.message) {
      // ✅ OTP sent successfully
      setIsOtpSent(true);
      setOtpTimer(300); // 5 mins
      setCanResendOtp(false);

      setErrorMessage(""); // clear any old error
      setShowError(false);
      console.log("✅", res.message);
    } else {
      setErrorMessage(res?.error || "Failed to send OTP. Please try again.");
      setShowError(true);
    }
  } catch (err) {
    console.error("🚨 Error sending OTP:", err);
    setErrorMessage("Error sending OTP. Please try again.");
    setShowError(true);
  } finally {
    setIsSendingOtp(false);
  }
};

const completeLogin = (user) => {
  setIsLoggedIn(true);
  setUsername(user.user_name);
  setUserRole(user.role);
  setInstitute(user.college_id);
  setLoggedInInstitute(user.college_id);

  // fetch college name
  getcollegeApi(user.college_id)
    .then((colleges) => {
      const matchedCollege = colleges.find(
        (college) => college.id === user.college_id
      );
      setCollegeName(matchedCollege ? matchedCollege.college : "");
    })
    .catch((err) => {
      console.error("Error fetching College:", err);
      setCollegeName("");
    });

  if (onLogin && typeof onLogin === "function") {
    onLogin(user.user_name);
  }
};
    const handleCloseError = () => {
        setShowError(false);
    };
const handlePOLogin = (officer) => {
    setUsername(officer.user_name);
    setUserRole('Placement Officer');
    setInstitute(officer.college_id);
    setCollegeName(officer.college_name);
     setCollegeGroup(officer.college_group); 
    setIsLoggedIn(true);
    setShowPOPopup(false);
    localStorage.setItem("isPOFromSuperAdmin", "true");
};

    return (
        <div>

            {isLoggedIn ? (
                (() => {
                    switch (userRole) {
                        case 'Placement admin':
                            return <PlacementAdmin username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;
                        case 'Super admin':
                            return <App username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;
                        case 'Placement Officer':
                            return <PlacementOfficer username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;

                        case 'Training admin':

                            return <TrainingAdmin username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;
                        case 'Student':
                            return <Students username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;

                        case 'Trainer':
                            return <Trainer username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;
                        case 'Corporate':
                            return <Corporate username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;
                        case 'Employee':
                            return <Employee username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;
                        case 'Hdfc':
                            return <Hdfc username={username} collegeName={collegeName} institute={institute} userRole={userRole} />;
                        default:
                           // alert('Something went wrong. Please contact support.');
                            setIsLoggedIn(false);
                            return <Login />; // or any other appropriate fallback
                    }
                })()
            ) : (
                <>
                    <div className="App-login">
                        <div
                            className="signin-container-login"
                            style={{ marginBottom: "40px", marginTop: "-45px" }}
                        >
                            <div className="signin-box-login" style={{ width: "450px" }}>
                                <img
                                    src={Logo}
                                    alt="Campus Connection Logo"
                                    className="logo-login"
                                    style={{ marginBottom: "30px" }}
                                />
                                <p style={{
                                    fontSize: "25px",
                                    marginTop: "-10px"
                                }}>Welcome!</p>
                                <p style={{ height: "5px" }}></p>
                                <p
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        marginTop: '-30px'
                                    }}
                                >
                                    Please sign in before continuing.
                                </p>
                                <form onSubmit={handleLogin}>
                                    <div className="form-group-login">
                                        <label htmlFor="username"
                                           style={{fontSize:"16px",fontWeight:"bold"}}  >
                                            Username
                                        </label>

                                        <input
                                            type="text"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            placeholder="Username"
                                            className="form-input-login"
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                    <div className="form-group-login">
                                        <label htmlFor="password"
                                          style={{fontSize:"16px",fontWeight:"bold"}}  >
                                            Password
                                        </label>
                                        <div className="password-container-login">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="Password"
                                                className="form-input-login"
                                            />
                                            <span
                                                className="toggle-password-login"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="form-footer-login">
                                        <div className="remember-me-login">
                                            <input type="checkbox" id="rememberMe" />
                                            <label
                                                htmlFor="rememberMe"
                                                style={{
                                                    fontSize: "15px",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                Remember me
                                            </label>
                                        </div>

                                    </div>
                                                                           {/* OTP Section (only when required) */}
{showOTPSection && (
  <div className="form-group-login">
    <label htmlFor="otp"  style={{fontSize:"16px",fontWeight:"bold"}}  >
      Enter OTP
    </label>
    <input
      type="text"
      id="otp"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      placeholder="Enter 6-digit OTP"
      className="form-input-login"
      style={{ width: "100%" }}
    />
   
  </div>
)}

                                    <button
                                        type="submit"
                                        className="signin-button-login"
                                        style={{ fontWeight: "bold" }}
                                    >
                                        Sign In
                                    </button>
                                    {error && <p style={{ color: 'red' }}>{error}</p>}
                                </form>
                             {showPOPopup && ( 
  <div className="modal-overlay">
    <div className="po-popup">
      <p>Select a Placement Officer to Login </p>
      <div className="po-list">
        {placementOfficers.map((officer, index) => (
          <div key={index} className="po-item">
            <span>
             {/*} <strong>{officer.user_name}</strong>*/} ({officer.college_name} - {officer.college_group})
            </span>
            <button onClick={() => handlePOLogin(officer)}>Login</button>
          </div>
        ))}
      </div>
      <div className="close-btn" onClick={() => setShowPOPopup(false)}>
        Close
      </div>
    </div>
  </div>
)}

                                <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Login;
