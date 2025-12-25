import React, { useState, useEffect } from 'react';
import './login.css';
import Logo from "../../assets/images/logo.jpg";
import {
    getcollegeApi,
    get_Login_By_Username_API, getPlacementOfficersByBranch,
    getUserCredentials, sendDailyEmailReportAPI

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
    const [hover, setHover] = useState(false);


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

    const [userData, setUserData] = useState({
        role: '',
        collegeId: '',
        collegeName: '',
    });
    const [placementOfficers, setPlacementOfficers] = useState([]);
    const [showPOPopup, setShowPOPopup] = useState(false);
    const [isLoadingPOs, setIsLoadingPOs] = useState(false);

    const handleForgotPassword = async () => {
        if (!username) {
            alert("Please enter your username before requesting a password reset.");
            return;
        }

        try {
            const response = await getUserCredentials(username);

            if (response.error) {
                // If backend explicitly says error
                alert(response.error);
            } else if (response.message) {
                alert(response.message);
            } else {
                alert("Unexpected response from server.");
            }
        } catch (error) {
            console.error("Forgot password error:", error);

            if (error.response && error.response.status === 404 && error.response.data.error) {
                // Show backend "Username does not exist"
                alert(error.response.data.error);
            } else {
                alert("Failed to send credentials. Please try again.");
            }
        }
    };



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

        try {
            const response = await get_Login_By_Username_API(username, password);

            if (response.length > 0) {
                const user = response.find(
                    (u) =>
                        u.user_name.toLowerCase() === username.toLowerCase() &&
                        u.password === password
                );

                if (user) {
                    setIsLoggedIn(true);
                    setUsername(user.user_name);
                    setUserRole(user.role);
                    setInstitute(user.college_id);
                    setLoggedInInstitute(user.college_id);
                    //  setErrorMessage('Login Successfully');
                    //setShowError(true);

                    // 🔽 Fetch and set the college name


                    // ✅ Trigger backend email report API after login
                    try {
                        await sendDailyEmailReportAPI();
                        console.log("✅ Daily email report API triggered successfully.");
                    } catch (apiError) {
                        console.error("⚠️ Failed to trigger daily email report API:", apiError);
                    }

                    try {
                        const colleges = await getcollegeApi(user.college_id);
                        const matchedCollege = colleges.find(
                            (college) => college.id === user.college_id
                        );
                        setCollegeName(matchedCollege ? matchedCollege.college : '');
                    } catch (collegeError) {
                        console.error('Error fetching College:', collegeError);
                        setCollegeName('');
                    }
                    if (user.role !== 'Placement Officer') {
                        localStorage.removeItem("isPOFromSuperAdmin");
                    }

                    // 🔽 ADDITION: If user is "college super admin", fetch POs and show popup
                    if (user.role === 'college super admin') {
                        localStorage.setItem("college_id", user.college_id);
                        try {
                            setIsLoadingPOs(true); // Start loading
                            const officers = await getPlacementOfficersByBranch(user.college_id);
                            setPlacementOfficers(officers);
                            setShowPOPopup(true);
                        } catch (err) {
                            console.error('Error fetching placement officers:', err);
                        } finally {
                            setIsLoadingPOs(false); // Stop loading
                        }
                    }

                    // 🔽 Notify parent
                    if (onLogin && typeof onLogin === 'function') {
                        onLogin(username);
                    }
                } else {
                    setErrorMessage('Invalid email or password');
                    setShowError(true);
                }
            } else {
                setErrorMessage('No users found');
                setShowError(true);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while logging in');
            setErrorMessage('An error occurred while logging in');
            setShowError(true);
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
                                    style={{ marginBottom: "30px", marginTop: '10px' }}
                                />
                                <p style={{
                                    fontSize: "30px",
                                    marginTop: "-10px"
                                }}>Welcome!</p>
                                <p style={{ height: "10px" }}></p>
                                <p
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        marginTop: '-30px'
                                    }}
                                >
                                    Please sign in before continuing.
                                </p>
                                <form onSubmit={handleLogin}>
                                    <div className="form-group-login">
                                        <label htmlFor="username"
                                            style={{ fontWeight: "bold" }}>
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
                                            style={{ fontWeight: "bold" }}>
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
                                    <div
                                        className="form-footer-login"
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",   // ✅ Always row
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "nowrap",     // ✅ Prevent wrapping
                                            width: "100%",
                                            marginTop: "3px"
                                        }}
                                    >
                                        <div className="remember-me-login" style={{ flex: "0 0 auto" }}>
                                            <input type="checkbox" id="rememberMe" />
                                            <label
                                                htmlFor="rememberMe"
                                                style={{
                                                    fontSize: "15px",
                                                    fontWeight: "bold",
                                                    marginLeft: "5px"
                                                }}
                                            >
                                                Remember me
                                            </label>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            onMouseEnter={() => setHover(true)}
                                            onMouseLeave={() => setHover(false)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: hover ? "#ddd" : "white",  // change color on hover
                                                cursor: "pointer",
                                                fontSize: "15px",
                                                fontWeight: "bold",
                                                flex: "0 0 auto",
                                                textDecoration: "underline",
                                                transition: "color 0.3s ease"
                                            }}
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>


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
