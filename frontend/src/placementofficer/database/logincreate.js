import React, { useState, useEffect } from 'react';
import { Container, Card, Col, Row, Form, Button } from 'react-bootstrap';
import { addLogin_Profile_API, 
    addLoginApi, 
    getcollegeApi 
} from '../../api/endpoints';
import ErrorModal from '../../components/auth/errormodal';
import Footer from '../../footer/footer';
import Select from 'react-select';

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

            width: '70%'
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
            width: '70%'
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
function LoginCreate() {
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

    useEffect(() => {
        getcollegeApi()
            .then(data => {
                setInstituteName(data.map(item => ({ value: item.id, label: item.college })));
            })
            .catch(error => console.error('Error fetching data:', error));

    }, []);


    const handleRegister = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        const collegeId = selectedInstitute ? selectedInstitute.value : null;

        if (username.trim().length !== 0 && password.trim().length !== 0 && role.trim().length !== 0) {
            const requestData = {
                email: email,
                user_name: username,
                password: password,
                role: role,
                college_id: collegeId, // Step 3: Include institute_name in requestData
            };
            console.log(requestData)

            addLoginApi(requestData)
                .then(result => {
                    setErrorMessage('Register Successfully');
                    setShowError(true);
                    setUsername('');
                    setPassword('');
                    setRole('');
                    setEmail('');
                    setSelectedInstitute(''); // Reset institute_name state after successful registration
                })
                .catch(error => {
                    setErrorMessage('Register is not Added');
                    setShowError(true);
                    setUsername('');
                    setPassword('');
                    setRole('');
                    setSelectedInstitute('');
                });
        }
    };

    const handleCloseError = () => {
        setShowError(false);
    };

    const handleLoginClick = () => {
        setIsRegisterMode(false); // Set register mode to false to show login screen
    };

    return (
        <div className='form-ques'>
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
                                   
                                  
                                    <option value="Student">Student</option>
                                    
                                   
                                </select>
                            </div>
                        </Col>
                    </Row>

                    <p></p>
                    <Row md={12}>
                        <Col>
                            <div controlId="email" className='add-profile'>
                                <label className="label5-ques">Email</label> <p></p>
                                <input className='input-ques' type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} autocomplete="off"/>
                            </div>
                        </Col>
                        <Col>
                            <div controlId="instituteName" >
                                <label className="label5-ques">Institute Name</label> <p></p>
                                <div >
                                    <Select
                                        options={instituteName}
                                        value={selectedInstitute}
                                        onChange={setSelectedInstitute}
                                        placeholder="Select College"

                                        styles={customStyles}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row> <p></p>
                    <Row md={12}>
                        <Col>
                            <div controlId="password" className='add-profile'>
                                <label className="label5-ques">Password</label> <p></p>
                                <input className='input-ques' type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} autocomplete="off"/>
                            </div>
                        </Col>
                        <Col>
                        </Col>
                    </Row>


                    <p style={{height:"40px"}}></p>
                    <Row className="justify-content-center">
                        
                            <button type="submit" style={{ width: "102px" }} className="button-ques-save-data">
                                Sign up
                            </button>
                       
                    </Row>
                    <p></p>
                </form>
                <br />
                <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
            </Row><p style={{ height: "50px" }}></p>
            {/*  <Footer></Footer>*/}
        </div>

    );
}

export default LoginCreate;