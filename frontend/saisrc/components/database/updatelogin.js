import React, { useState, useEffect } from "react";
import { Container, Card, Col, Row, Form, Button } from "react-bootstrap";
import {
  updateLoginApi,
  getcollegeApi,
  LoginDataApi,
  addTrainer_username_API,
} from "../../api/endpoints";

import CustomOption from "../test/customoption";
import ErrorModal from "../auth/errormodal";
import Footer from "../../footer/footer";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const customStyles = {
  control: (provided, state) => ({
      ...provided,
      backgroundColor: '#39444e',
      color: '#fff', // Text color
      borderColor: state.isFocused ? '' : '#ffff', // Border color on focus
      boxShadow: 'none', // Remove box shadow
      '&:hover': {
          borderColor: state.isFocused ? '#ffff' : '#ffff' // Border color on hover
      },
      '&.css-1a1jibm-control': {
          // Additional styles for the specific class
      },
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px', // Smaller font size

          width: '97%'
      }
  }),
  singleValue: (provided) => ({
      ...provided,
      color: '#ffff', // Text color for selected value
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px' // Smaller font size
      }
  }),
  option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
      color: '#ffff', // Text color
      '&:hover': {
          backgroundColor: '#39444e', // Background color on hover
          color: '#ffff' // Text color on hover
      },
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px',// Smaller font size
          width: '97%'
      }
  }),
  input: (provided) => ({
      ...provided,
      color: '#ffff' // Text color inside input when typing
  }),
  menu: (provided) => ({
      ...provided,
      backgroundColor: '#39444e',
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px' // Smaller font size
      }
  })
  
};
function UpdateLogin({userRole}) {
  const { user_name } = useParams(); // Get the username from the URL
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email_id, setemail_id] = useState("");
  const [role, setRole] = useState("");
  const [instituteName, setInstituteName] = useState([]); // For dropdown
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
const [mobileNumber, setMobileNumber] = useState('');
const [remarks, setRemarks] = useState([]);   // for storing selected colleges
const navigate = useNavigate();
  // Fetch user data and available colleges
  useEffect(() => {
    console.log("Fetching data for username:", user_name); // Step 1: Fetch user data by username

    if (user_name) {
      LoginDataApi(user_name)
        .then((data) => {
          console.log("Received user data:", data); // Step 2: Log fetched user data
          setUsername(data.user_name);
          setemail_id(data.email_id);
          setPassword(data.password);
          setRole(data.role);
          setMobileNumber(data.mobile_number || ""); // ✅ new
        setRemarks(data.remarks || []);   
          setSelectedInstitute({
            value: data.college_id,
            label: data.college_name,
          });
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }

    // Fetch list of colleges for the dropdown
    getcollegeApi()
      .then((data) => {
        console.log("Received college data:", data); // Step 3: Log fetched college data
        setInstituteName(
          data.map((item) => ({ value: item.id, label: item.college }))
        );
      })
      .catch((error) => console.error("Error fetching college data:", error));
  }, [user_name]);

  // Function to handle form submission
const handleRegister = (e) => {
  e.preventDefault();
  console.log("Handling form submission");

  const collegeId = selectedInstitute ? selectedInstitute.value : null;
  console.log("Selected collegeId:", collegeId);

  if (
  !(username || "").trim() ||
  !(password || "").trim() ||
  !(role || "").trim() ||
  !(email_id || "").trim() ||
  !(mobileNumber || "").trim()
) {
  setErrorMessage("Please fill in all required fields.");
  setShowError(true);
  return;
}

  // ✅ email validation (all roles)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email_id)) {
    setErrorMessage("Please enter a valid email address.");
    setShowError(true);
    return;
  }

  // ✅ mobile validation (all roles)
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobileNumber)) {
    setErrorMessage("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
    setShowError(true);
    return;
  }

  // ✅ Extra validation for special roles
  if (
    role === "Training admin" ||
    role === "Placement admin" ||
    role === "College Super admin"
  ) {
    if (!remarks || remarks.length === 0) {
      setErrorMessage("Remarks (colleges) are required for this role.");
      setShowError(true);
      return;
    }
  }

  const dtmCreated = new Date();
  let dtmTrainer = null;

  if (role === "Trainer") {
    dtmTrainer = new Date(dtmCreated);
    dtmTrainer.setMinutes(dtmTrainer.getMinutes() + 5);
  }

  // ✅ build payload
  const requestData = {
    email_id,
    user_name: username,
    password,
    role,
    college_id: collegeId,
    dtm_created: dtmCreated.toISOString(),
    mobile_number: mobileNumber,
    dtm_trainer: dtmTrainer ? dtmTrainer.toISOString() : null,
    ...(role === "Training admin" ||
    role === "Placement admin" ||
    role === "College Super admin"
      ? {
          remarks: Array.isArray(remarks)
            ? remarks.map(r => (r.value ? r.value : r)).join(",")
            : remarks || "",
        }
      : {}),
  };

  console.log("Request data being sent to API:", requestData);

  updateLoginApi(username, requestData)
    .then((result) => {
      console.log("Update successful:", result);
      setErrorMessage("Update Successful");
      setShowError(true);

      if (role === "Trainer") {
        handleAddTrainer(username);
      }
    })
    .catch((error) => {
      console.error("Update failed:", error);
      setErrorMessage("Update failed");
      console.error("Update failed:", error.response?.data);
      setShowError(true);
    });
};

  // Function to handle adding a trainer
  async function handleAddTrainer(userName) {
    try {
      console.log("Adding trainer with username:", userName); // Step 10: Log trainer addition
      const response = await addTrainer_username_API(userName);
      console.log("Trainer added successfully:", response); // Step 11: Log trainer addition success
    } catch (error) {
      console.error("Failed to add trainer:", error); // Step 12: Log trainer addition failure
    }
  }

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <div>
      <Row>
        <form onSubmit={handleRegister} className="form-ques">
          <Row md={12}>
            <Col>
              <div controlId="username" className="add-profile">
                <label className="label5-ques">User Name</label>
                <p></p>
                <input
                  type="text"
                  placeholder="Enter Username"
                  className="input-ques"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </Col>
            <Col>
              <div controlId="userType" className="add-profile">
                <label className="label5-ques">User Type</label>
                <p></p>
                <select
                  className="input-ques"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select role</option>
                   <option value="Placement Officer">Placement Officer</option>
                                            {userRole === "Super admin" && (
                                                <>
                                                    <option value="Training admin">Training admin</option>
                                                    <option value="Placement admin">Placement admin</option>
                                                    <option value="Hdfc">Hdfc</option>
                                                    <option value="Employee">Employee</option>
                                                    <option value='college super admin'>College Super Admin</option>
                                                </>
                                            )}

                                            {/*}  <option value="Student">Student</option>*/}
                                            <option value="Trainer">Trainer</option>
                 
                 
                </select>
              </div>
            </Col>
          </Row>
          <p></p>
          <Row md={12}>
            <Col>
              <div controlId="email_id" className="add-profile">
                <label className="label5-ques">Email</label>
                <p></p>
                <input
                  className="input-ques"
                  type="text"
                  placeholder="Enter email_id"
                  value={email_id}
                  onChange={(e) => setemail_id(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </Col>
           <Col>
  {role === "Training admin" || role === "Placement admin" || role === "College Super admin" ? (
    <div className="add-profile">
      <label className="label5-ques">Colleges</label>
      <p></p>
      <Select
        isMulti
        options={instituteName}
        value={instituteName.filter((item) => remarks.includes(item.value))}
        onChange={(selected) => setRemarks(selected.map((item) => item.value))}
        placeholder="Select Colleges"
        styles={customStyles}
         components={{ Option: CustomOption }}
                                    closeMenuOnSelect={false}
      />
    </div>
  ) : (
    <div controlId="instituteName" className="add-profile11">
      <label className="label5-ques">Institute Name</label>
      <p></p>
      <Select
        options={instituteName}
        value={selectedInstitute}
        onChange={setSelectedInstitute}
        placeholder="Select College"
        styles={customStyles}
      />
    </div>
  )}
</Col>

          </Row>
          <p></p>
          <Row md={12}>
            <Col>
              <div controlId="password" className="add-profile">
                <label className="label5-ques">Password</label>
                <p></p>
                <input
                  className="input-ques"
                  type="text"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </Col>
           <Col>
        <div className="add-profile">
          <label className="label5-ques">Mobile Number</label>
          <input
            type="text"
            className="input-ques"
            placeholder="Enter Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
        </div>
      </Col>
          </Row>
          <p style={{ height: "40px" }}></p>

         <Row className="justify-content-center">
                                    
  <Col >
   <div className="button-container-lms-create">

    <button
      type="button"
      className="button-ques-save"
      onClick={() => navigate("/database/login")}
    >
      Back
    </button>

     <button type="submit" className="button-ques-save">
        Update
      </button>
    
 
    <button type="button" className="button-ques-save" disabled>
      Next
    </button>
    </div>
  </Col>
</Row>
        </form>
        <ErrorModal
          show={showError}
          handleClose={handleCloseError}
          errorMessage={errorMessage}
        />
      </Row>
    </div>
  );
}

export default UpdateLogin;
