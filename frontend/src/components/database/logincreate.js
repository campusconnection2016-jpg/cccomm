import React, { useState, useEffect } from 'react';
import { Container, Card, Col, Row, Form, Button } from 'react-bootstrap';
import {
    addLogin_Profile_API,
    addLoginApi,
    getcollegeApi, getLoginApi,
    addTrainer_username_API,
    check_username_exists_API,
    getCollegeList_Concat_API,
     getcollege_Test_Api,
  get_user_colleges_API,
} from '../../api/endpoints';
import ErrorModal from "../auth/errormodal";
import Footer from '../../footer/footer';
import Select from 'react-select';
import LoginTable from './logintable';
import Next from '../../assets/images/nextarrow.png';
import back from '../../assets/images/backarrow.png';
import CustomOption from '../test/customoption';

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

            width: '91%'
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
            width: '91%'
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
function LoginCreate({userRole,loginusername}) {
    console.log("userRolelogin", userRole);
    console.log("userRolelogin", loginusername);

    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(true);
    const [role, setRole] = useState('');
    const [instituteName, setInstituteName] = useState([]); // Step 1: Add state variable for institute_name
    const [selectedInstitute, setSelectedInstitute] = useState([]); // Corrected variable name
    const [showAddstudent, setshowAddstudent] = useState(false); // State variable to track visibility
    const isInstituteEnabled = role === 'Student' || role === 'Placement Officer'|| role === 'college super admin'|| role === 'Placement admin'|| role==='Training admin';
const [mobileNumber, setMobileNumber] = useState('');

    const [triggerFetch, setTriggerFetch] = useState(true);

    const handlePreviousButtonClick = () => {
        setshowAddstudent(false); // Show the table
    };
    const handleNextButtonClick = () => {
        setshowAddstudent(true); // Show the Add Student form
    };


    const [collegeIds, setCollegeIds] = useState([]); // for Training admin
        
          // State to store college ID
        const [userColleges, setUserColleges] = useState([]); // store dropdown options
        
        useEffect(() => {
          // helper: merge concat list with codes from base list
          const mergeWithCodes = async (list) => {
            const base = await getcollege_Test_Api(); // has id, college_code
            const codeMap = new Map(base.map((b) => [Number(b.id), b.college]));
            return list.map((c) => ({
              value: Number(c.id),
              label: c.college_group_concat,
              code: codeMap.get(Number(c.id)) || "", // <-- keep code here
            }));
          };
        
        
          // ✅ Case 2: Training admin → show only assigned colleges
          if (userRole === "Training admin") {
            get_user_colleges_API(loginusername)
              .then(async (userData) => {
                const ids = (userData?.college_ids || []).map((x) => Number(x));
                setCollegeIds(ids);
        
                const concatList = await getCollegeList_Concat_API();
                const filtered = concatList.filter((c) => ids.includes(Number(c.id)));
                const withCodes = await mergeWithCodes(filtered);
                setUserColleges(withCodes);
              })
              .catch((error) => {
                console.error("❌ Error fetching user colleges:", error);
              });
          } else {
            // ✅ Case 3: other roles → show all colleges with concat labels
            Promise.all([getCollegeList_Concat_API(), getcollege_Test_Api()])
              .then(([concatList, base]) => {
                const codeMap = new Map(base.map((b) => [Number(b.id), b.college_code]));
                const all = concatList.map((c) => ({
                  value: Number(c.id),
                  label: c.college_group_concat,
                  code: codeMap.get(Number(c.id)) || "",
                }));
                setUserColleges(all);
              })
              .catch((error) => {
                console.error("❌ Error fetching all colleges:", error);
              });
          }
        }, [loginusername, userRole]);
        
    


    useEffect(() => {

        if (triggerFetch) {
            getCollegeList_Concat_API()
                .then((data) => {
                    // Map the API response to the required format
                    const options = data.map((college) => ({
                        value: college.id,
                        label: college.college_group_concat,
                    }));

                    // Prepend the default option
                    const defaultOption = {
                        value: '',
                        label: 'College - College Group',
                    };

                    setInstituteName([defaultOption, ...options]); // Add default option at the beginning
                    // setSelectedCollege(defaultOption); // Set the default option as the initial value

                    // ✅ Only reset trigger after successful data fetch
                    setTriggerFetch(false);
                })
                .catch((error) => console.error("Error fetching college list:", error));

        }
    }, [userRole, triggerFetch]);


    async function handleAddTrainer(userName) {
        try {
            const response = await addTrainer_username_API(userName);
            console.log('Trainer added successfully:', response);
        } catch (error) {
            console.error('Failed to add trainer:', error);
        }
    }

const handleRegister = (e) => {
  e.preventDefault();

  const isMultiRole = ["Placement admin", "Training admin", "College Super Admin"].includes(role);

  let collegeId = null;
  let remarks = null;

  if (isMultiRole) {
    // store all selected colleges in remarks
    remarks = JSON.stringify(selectedInstitute.map(opt => opt.value));
  } else {
    // single select → save college_id normally
    collegeId = selectedInstitute ? selectedInstitute.value : null;
  }

  // ===============================
  // 🔹 COMMON VALIDATION FOR ALL ROLES
  // ===============================

  if (!(username || "").trim() || !(password || "").trim() || !(role || "").trim()) {
    setErrorMessage("Please fill in all required fields.");
    setShowError(true);
    return;
  }

  if (!(email || "").trim()) {
    setErrorMessage("Email is required.");
    setShowError(true);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setErrorMessage("Please enter a valid email address.");
    setShowError(true);
    return;
  }

  if (!(mobileNumber || "").trim()) {
    setErrorMessage("Mobile number is required.");
    setShowError(true);
    return;
  }

  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobileNumber)) {
    setErrorMessage("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
    setShowError(true);
    return;
  }

  // ===============================
  // 🔹 USERNAME CHECK
  // ===============================

  check_username_exists_API(username)
    .then((data) => {
      if (data.status) {
        setErrorMessage("Username is already taken");
        setShowError(true);
        return;
      }

      const dtmCreated = new Date();
      let dtmTrainer = null;

      if (role === "Trainer") {
        dtmTrainer = new Date(dtmCreated);
        dtmTrainer.setMinutes(dtmTrainer.getMinutes() + 5);
      }

      const requestData = {
        email_id: email,
        user_name: username,
        password,
        role,
        college_id: collegeId, // single role case
        dtm_created: dtmCreated.toISOString(),
        dtm_trainer: dtmTrainer ? dtmTrainer.toISOString() : null,
        remarks, // multi role case
        mobile_number: mobileNumber,
      };

      addLoginApi(requestData)
        .then((result) => {
          setErrorMessage("Register Successfully");
          setShowError(true);

          if (result && role === "Trainer") {
            handleAddTrainer(username);
          }

          // Reset form
          setUsername("");
          setPassword("");
          setRole("");
          setEmail("");
          setSelectedInstitute([]);
          setMobileNumber("");
        })
        .catch(() => {
          setErrorMessage("Register is not Added");
          setShowError(true);
          setUsername("");
          setPassword("");
          setRole("");
          setSelectedInstitute([]);
          handleNextButtonClick();
        });
    })
    .catch(() => {
      setErrorMessage("Error checking username availability");
      setShowError(true);
    });
};

    const handleCloseError = () => {
        setShowError(false);
    };

    const handleLoginClick = () => {
        setIsRegisterMode(false); // Set register mode to false to show login screen
    };

    return (
        <div>
            {!showAddstudent ? (
                <div className='form-ques-create'>
                    <Row>
                        <form onSubmit={handleRegister} className="form-ques">
                            <Row md={12}>
                                <Col>
                                    <div controlId="username" className='add-profile'>
                                        <label className="label5-ques">User Name</label> <p></p>
                                        <input type="text" placeholder="Enter Username" className='input-ques' value={username} onChange={(e) => setUsername(e.target.value)} autocomplete="off" />
                                    </div>
                                </Col>
                                <Col>
                                    <div controlId="userType" className='add-profile'>
                                        <label className="label5-ques">User Type</label> <p></p>
                                        <select className='input-ques' value={role} onChange={(e) => setRole(e.target.value)}>
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
                                    <div controlId="email" className='add-profile'>
                                        <label className="label5-ques">Email</label> <p></p>
                                        <input className='input-ques' type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} autocomplete="off" />
                                    </div>
                                </Col>
                                <Col>
                                    <div controlId="instituteName" >
                                        <label className="label5-ques">Institute Name</label> <p></p>
                                        <div >
                                            <Select
                                                options={userColleges}
                                                value={selectedInstitute}
                                                onChange={setSelectedInstitute}
                                                placeholder="Select College"
                                                styles={customStyles}
                                               //   isMulti={["Placement admin", "Training admin", "College Super Admin"].includes(role)} // 👈 multi only for these roles
                                                isDisabled={!isInstituteEnabled}
                                               {...(["Placement admin", "Training admin", "College Super admin"].includes(role)
          ? {
              isMulti: true,
              components: { Option: CustomOption },
              closeMenuOnSelect: false,
            }
          : {})}   
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row> <p></p>
                            <Row md={12}>
                                <Col>
                                    <div controlId="password" className='add-profile'>
                                        <label className="label5-ques">Password</label> <p></p>
                                        <input className='input-ques' type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} autocomplete="off" />
                                    </div>
                                </Col>
                                <Col>
  <div controlId="mobileNumber" className='add-profile'>
    <label className="label5-ques">Mobile Number</label> <p></p>
    <input
      className='input-ques'
      type="text"
      placeholder="Enter Mobile Number"
      value={mobileNumber}
      onChange={(e) => setMobileNumber(e.target.value)}
      autoComplete="off"
    />
  </div>
</Col>

                            </Row>


                            <p style={{ height: "40px" }}></p>
                            <Row className="justify-content-center">
                                <Row>
                                    <Col>
                                        <div className="button-container-lms">
                                            <button

                                                className="button-ques-save btn btn-secondary back-button-lms"
                                                style={{
                                                    width: "100px",
                                                    color: 'black',
                                                    height: '50px',
                                                    backgroundColor: '#F1A128',
                                                    cursor: 'not-allowed'
                                                }}
                                                disabled
                                            ><img src={back} className='nextarrow' ></img>
                                                <span className="button-text">Back</span>
                                            </button>

                                            <button type="submit" style={{ width: "102px" }} className="button-ques-save-data">
                                                Signup
                                            </button>
                                            <button

                                                className="button-ques-save"
                                                style={{
                                                    width: "100px",
                                                    color: 'black',
                                                    height: '50px',
                                                    backgroundColor: '#F1A128',

                                                }} onClick={handleNextButtonClick}
                                            >
                                                <span className="button-text">Next</span>
                                                <img src={Next} className='nextarrow'></img>
                                            </button>

                                        </div>
                                    </Col>
                                </Row>


                            </Row>
                            <p></p>
                        </form>
                        <br />
                        <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
                    </Row><p style={{ height: "50px" }}></p>
                    {/*  <Footer></Footer>*/}
                </div>

            ) : (
                <div >
                    <button onClick={handlePreviousButtonClick} className='button-ques-save'><img src={back} className='nextarrow' ></img>
                        <span>Back</span></button>
                    <LoginTable userRole={userRole}/>
                </div>
            )}
        </div>
    );
}

export default LoginCreate;