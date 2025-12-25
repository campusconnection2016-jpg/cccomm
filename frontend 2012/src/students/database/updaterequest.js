import React, { useEffect, useState } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import {
  updatecandidatesApi,
  getSkillApi,
  getcollegeApi,
  getdepartmentApi,
  getTestcandidateApi,
  updateLoginPasswordApi,
  getcandidates_UserName_Api,
  updateStudentRequestStatusApi, LoginpassApi
} from '../../api/endpoints';
import '../../styles/students.css';
//import UploadStudentProfile from './uploadstudentprofile';
//import Dashboard from '../Dashboard/Dashboard';
//import Select, { components } from 'react-select';
import CustomOption from '../../components/test/customoption'
import Select, { components } from 'react-select';
import { useNavigate } from 'react-router-dom';
import ErrorModal from '../../components/auth/errormodal';

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

const UpdateRequest = ({ collegeName, username }) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseError = () => {
    setShowError(false);
  };
  const [students, setStudents] = useState([]);
  const [testCandidates, setTestCandidates] = useState([]);
  const [tcID, setTcID] = useState(0);
  const [need_info, setNeedInfo] = useState(false);
  const [errors, setErrors] = useState({ email_id: '', mobile_number: '' });

  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const yearOptions = [1, 2, 3, 4];
  const genderOptions = ['Male', 'Female'];
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ user_name: '', password: '' });

  useEffect(() => {
    const fetchLoginData = async () => {
      try {
        const loginResponse = await LoginpassApi(username);
        if (loginResponse && loginResponse.user_name && loginResponse.password) {
          setLoginData({
            user_name: loginResponse.user_name,
            password: loginResponse.password,
          });
        }
      } catch (error) {
        console.error('Error fetching login data:', error);
      }
    };
    if (username) fetchLoginData();
  }, [username]);

  // Handle input change for password
  const handleInputpassChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (username) {
      getTestcandidateApi(username)
        .then(data => {
          if (data.length > 0) {
            setTestCandidates(data[0]); // Backend already filters, return only relevant data
            setTcID(data[0].id);
            setNeedInfo(data[0].need_candidate_info);
          }
        })
        .catch(error => console.log('Error fetching test-candidates:', error));
    }
    fetchskill();
    fetchTraineeData();
    fetchColleges();
    fetchDepartments();
  }, [collegeName, username]);

  const fetchColleges = () => {
    getcollegeApi()
      .then(data => setColleges(data))
      .catch(error => console.error('Error fetching college data:', error));
  };

  const fetchDepartments = () => {
    getdepartmentApi()
      .then(data => setDepartments(data))
      .catch(error => console.error('Error fetching department data:', error));
  };

  const fetchTraineeData = () => {
    console.log('College Name:', collegeName);
    console.log('User Name:', username);
    getcandidates_UserName_Api(username)
      .then(data => {
        setStudents(data);
      })
      .catch(error => console.error('Error fetching trainee data:', error));
  };

  const handleInputChange = (index, field, value) => {
    if (index < 0 || index >= students.length) {
      console.error('Invalid student index:', index);
      return;
    }

    const updatedStudents = [...students];
    updatedStudents[index][field] = value;

    if (field === 'it_of_offers' || field === 'core_of_offers') {
      const itOffers = parseInt(updatedStudents[index].it_of_offers) || 0;
      const coreOffers = parseInt(updatedStudents[index].core_of_offers) || 0;
      updatedStudents[index].number_of_offers = itOffers + coreOffers;
    }

    validateField(field, value);
    setStudents(updatedStudents);
  };

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email_id') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (field === 'mobile_number') {
      const mobilePattern = /^[6789][0-9]{9}$/;
      if (!mobilePattern.test(value)) {
        error = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
      }
    }
    setErrors(prevErrors => ({ ...prevErrors, [field]: error }));
  };

  const fetchskill = () => {
    getSkillApi()
      .then(data => {
        console.log('Fetched skill data:', data); // Print the fetched data
        // Add "None" option
        const skillsWithNone = [{ value: 'none', skill_name: 'None' }, ...data];
        setSkills(skillsWithNone);
      })
      .catch(error => console.error('Error fetching skill data:', error));
  };

  const handleSkillChange = (index, selectedOptions) => {
    let skillIds = Array.isArray(selectedOptions) ? selectedOptions.map(option => option.value) : [];
    // If "None" is selected, set skillIds to an empty array
    if (skillIds.includes('none')) {
      skillIds = [];
    }
    handleInputChange(index, 'skill_id', skillIds);
  };

  const handleUpdate = async (e, index) => {
    e.preventDefault();
    const student = students[index]; // Accessing student from students array
    const studentId = student.id;
    console.log('student: ', student);

    // Extract and parse data
    const collegeId = student.college_id ? parseInt(student.college_id) : null;
    console.log('collegeId: ', collegeId);

    const departmentId = student.department_id ? parseInt(student.department_id) : null;
    console.log('departmentId: ', departmentId);

    const skillIds = Array.isArray(student.skill_id) ? student.skill_id : [];
    console.log('skillIds: ', skillIds);

    // Handling skillIds condition
    let skillId;
    if (skillIds === undefined || (Array.isArray(skillIds) && skillIds.length === 1 && skillIds[0] === undefined)) {
      skillId = [];
    } else {
      skillId = skillIds.includes('none') ? [] : skillIds.map(id => parseInt(id));
    }
    console.log('skillId: ', skillId);

    // Validate mandatory fields
    const requiredFields = {
      students_name: student.students_name,
      registration_number: student.registration_number,
      gender: student.gender,
      email_id: student.email_id,
      mobile_number: student.mobile_number,
      college_id: collegeId,
      department_id: departmentId,
      year: student.year,
      cgpa: student.cgpa,
      marks_10th: student.marks_10th,
      marks_12th: student.marks_12th
    };

    let errorMessages = [];
    let hasErrors = false;

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && isNaN(value))) {
        errorMessages.push(`Invalid ${field.replace('_', ' ')}. It cannot be empty.`);
        hasErrors = true;
      }
    }


    const registrationNumber = student.registration_number;
    if (registrationNumber === undefined || registrationNumber === null || registrationNumber.trim() === '' || parseFloat(registrationNumber) === 0) {
      errorMessages.push('Registration number cannot be empty, 0, or 0.0.');
      hasErrors = true;
    }
    // Validate mobile number
    const mobileNumber = student.mobile_number;
    const mobileNumberPattern = /^[6-9]\d{9}$/;
    if (!mobileNumberPattern.test(mobileNumber)) {
      errorMessages.push('Invalid mobile number. It should be exactly 10 digits and start with 6, 7, 8, or 9.');
      hasErrors = true;
    }

    // Validate email address
    const email = student.email_id;
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      errorMessages.push('Invalid email format.');
      hasErrors = true;
    }

    if (hasErrors) {
      setErrorMessage(errorMessages.join(' '));
      setShowError(true);
      return;
    }

    // Calculate total number of offers
    const itOffers = parseInt(student.it_of_offers) || 0;
    const coreOffers = parseInt(student.core_of_offers) || 0;
    const totalOffers = itOffers + coreOffers;

    // Fetching relevant details for the student's college, department, and skill
    const college = colleges.find(clg => clg.id === collegeId);
    const department = departments.find(dept => dept.id === departmentId);
    const validSkills = skills.filter(skill => skillId.includes(skill.id));

    // Ensuring that valid college, department, and skills were found
    if (!college || !department || validSkills.length !== skillId.length) {
      setErrorMessage('Invalid college, department, or skill');
      setShowError(true);
      return;
    }

    // Constructing data payload for API update
    const dataToSubmit = {
      students_name: student.students_name,
      registration_number: student.registration_number,
      gender: student.gender || '',
      email_id: student.email_id,
      mobile_number: student.mobile_number,
      college_id__college: college.id,
      department_id__department: department.id,
      marks_semester_wise: student.marks_semester_wise,
      skill_id: skillId,
      year: student.year,
      cgpa: student.cgpa,
      marks_10th: student.marks_10th,
      marks_12th: student.marks_12th,
      history_of_arrears: student.history_of_arrears || 0,
      standing_arrears: parseInt(student.standing_arrears) || 0,
      it_of_offers: parseInt(student.it_of_offers) || 0,
      core_of_offers: parseInt(student.core_of_offers) || 0,
      number_of_offers: totalOffers.toString(), // Store total offers count
      text: student.text,
    };

    console.log('dataToSubmit: ', dataToSubmit);
    try {
      // Now, update the login credentials with the updated user_name and password


      const loginUpdateData = {
        user_name: loginData.user_name,
        password: loginData.password,
        email_id: student.email_id,
        mobile_number: student.mobile_number
      };
      await updateLoginPasswordApi(loginData.user_name, loginUpdateData);

      console.log('Login credentials updated successfully.');


    } catch (error) {
      console.error('Error updating login credentials:', error);
    }
    try {
      // Updating student data via API
      try {
        await updatecandidatesApi(studentId, dataToSubmit);

        setErrorMessage('Student Data Updated Successfully');


        await updateStudentRequestStatusApi(studentId, 'Completed');
        navigate('/database/upload-student-profile');
        fetchTraineeData();
        setShowError(true);
      } catch (error) {
        console.error('Failed to update student data:', error);
        setErrorMessage(`Failed to update student data: ${error.message}`);
        setShowError(true);
      }


      // Updating additional information if needed


    } catch (error) {
      console.error('An unexpected error occurred:', error);
      setErrorMessage('An unexpected error occurred.');
      setShowError(true);
    }

  };


  return (
    <div className="no-select no-right-click">
      <div className="no-screenshot-overlay"></div>
      <div className='form-ques-student'>
        <div>
          <div className='header'>
            <h4 className='h4'>Students Profile</h4>
          </div>
          <p></p>
          <div className='form-ques'>
            {students.map((trainee, index) => (
              <Form key={index} onSubmit={(e) => handleUpdate(e, index)}>
                <p></p>
                <p> Students can update their information</p>
                <Row md={12}>

                  <Col>
                    <div controlId='students_name' className='add-profile'>
                      <label className='label5-ques'>Student Name<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <input

                        type="text"
                        className='input-ques'
                        autocomplete="off"
                        value={trainee.students_name}
                        onChange={(e) => handleInputChange(index, 'students_name', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col >
                    <div controlId='registration_number' className='add-profile' >
                      <label className='label5-ques'>Reg Number<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <input
                        type="text"
                        className='input-ques'
                        autocomplete="off"
                        value={trainee.registration_number}
                        onChange={(e) => handleInputChange(index, 'registration_number', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div className='add-profile'>
                      <label className='label5-ques'>Gender<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <select
                        className='input-ques'
                        value={trainee.gender || ''}
                        onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                      >
                        <option value=''>Select Gender</option>
                        {genderOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select></div>
                  </Col>
                </Row>
                <p></p>
                <Row md={12}>
                  <Col>
                    <div controlId='college' className='add-profile'>
                      <label className='label7-ques'>College<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <select
                        className='input-ques'
                        value={trainee.college_id || ''}
                        onChange={(e) => handleInputChange(index, 'college_id', e.target.value)}

                      >
                        <option value=''>Select College</option>
                        {colleges.map(clg => (
                          <option key={clg.id} value={clg.id}>{clg.college}</option>
                        ))}
                      </select>
                    </div>
                  </Col>
                  <Col>
                    <div controlId='department' className='add-profile'>
                      <label className='label6-ques'>Department<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <select
                        className='input-ques'
                        value={trainee.department_id || ''}
                        onChange={(e) => handleInputChange(index, 'department_id', e.target.value)}
                      >
                        <option value=''>Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.department}</option>
                        ))}
                      </select>
                    </div>
                  </Col>
                  <Col>
                    <div controlId='year' className='add-profile'>
                      <label className='label7-ques'>Year<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <select
                        className='input-ques'
                        value={trainee.year}
                        onChange={(e) => handleInputChange(index, 'year', e.target.value)}
                      >
                        <option value=''>Select Year</option>
                        {yearOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </Col>
                </Row>
                <p></p>
                <Row md={12}>
                  <Col>
                    <div controlId='cgpa' className='add-profile'>
                      <label htmlFor="cgpa" className='label6-ques'>CGPA<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <input
                        type="range"
                        id="cgpa"
                        name="cgpa"
                        min="0"
                        max="10"
                        step="0.1"
                        value={trainee.cgpa}
                        onChange={(e) => handleInputChange(index, 'cgpa', e.target.value)}
                      />
                      <span>{trainee.cgpa}</span>
                    </div>



                  </Col>
                  <Col>
                    <div controlId='marks_10th' className='add-profile' >
                      <label htmlFor="marks10th">10th Marks (%)<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <input
                        type="range"
                        id="marks10th"
                        name="marks10th"
                        min="0"
                        max="100"
                        step="1"
                        value={trainee.marks_10th}
                        onChange={(e) => handleInputChange(index, 'marks_10th', e.target.value)}
                      />
                      <span>{trainee.marks_10th}</span>
                    </div>


                  </Col>

                  <Col>
                    <div controlId='marks_12th' className='add-profile'>
                      <label htmlFor="marks12th">12th Marks (%)<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <input
                        type="range"
                        id="marks12th"
                        name="marks12th"
                        min="0"
                        max="100"
                        step="1"
                        value={trainee.marks_12th}
                        onChange={(e) => handleInputChange(index, 'marks_12th', e.target.value)}
                      />
                      <span>{trainee.marks_12th}</span>
                    </div>


                  </Col> </Row>
                <p></p>
                <Row md={12}>

                  <Col>
                    <div controlId='email_id' className='add-profile'>
                      <label className='label5-ques'>Email<span style={{ color: '#F1A128' }}>**</span> </label><p></p>
                      <input
                        type="text"
                        className='input-ques'
                        autocomplete="off"
                        value={trainee.email_id}
                        onChange={(e) => handleInputChange(index, 'email_id', e.target.value)}

                      />
                      {errors.email_id && <div className='error-message'>{errors.email_id}</div>}

                    </div>
                  </Col>

                  <Col>
                    <div controlId='mobile_number' className='add-profile'>
                      <label className='label5-ques'>Mobile Number<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <input
                        type="text"
                        autocomplete="off"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        className='input-ques'
                         value={
  trainee.mobile_number && trainee.mobile_number !== 0 && trainee.mobile_number !== "0.0"
    ? String(trainee.mobile_number).replace(/\.0$/, "")  // remove .0 if exists
    : ""
}
                        onChange={(e) => handleInputChange(index, 'mobile_number', e.target.value)}
                      />
                      {errors.mobile_number && <div className='error-message'>{errors.mobile_number}</div>}

                    </div>
                  </Col>
                  <Col>
                    <div controlId='skill_id'>
                      <label className='label5-ques'>Skill<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                      <Select
                        isMulti
                        options={skills.map(skill => ({ value: skill.id, label: skill.skill_name }))}
                        value={skills.filter(skill => Array.isArray(trainee.skill_id) && trainee.skill_id.includes(skill.id)).map(skill => ({ value: skill.id, label: skill.skill_name }))}
                        onChange={(selectedOptions) => handleSkillChange(index, selectedOptions)}
                        styles={customStyles}
                        className='inp-que'
                        components={{ Option: CustomOption }}
                        closeMenuOnSelect={false} // Keep the menu open when selecting multiple options
                      />
                    </div>
                  </Col>



                </Row>
                <p></p>


                <Row md={12}>
                  {/*} <Col>
                  <div controlId='marks_semester_wise' >
                    <label className='label5-ques'>Semester Marks</label><p></p>
                    <input
                      type="text"
                      className='input-ques'
                      value={trainee.marks_semester_wise}
                      onChange={(e) => handleInputChange(index, 'marks_semester_wise', e.target.value)}
                    />
                  </div>
                </Col>*/}

                  <Col>
                    <div controlId='history_of_arrears' className='add-profile'>
                      <label className='label5-ques'>History of Arrears</label><p></p>
                      <input
                        type="number"
                        min="0"
                        max='100'
                        step='1'
                        autocomplete="off"
                        className='input-ques'
                        value={trainee.history_of_arrears}
                        onChange={(e) => handleInputChange(index, 'history_of_arrears', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId='standing_arrears' className='add-profile'>
                      <label className='label5-ques'>Standing Arrears</label><p></p>
                      <input
                        type="number"
                        autocomplete="off"
                        min="0"
                        max='100'
                        step='1'
                        className='input-ques'
                        value={trainee.standing_arrears}
                        onChange={(e) => handleInputChange(index, 'standing_arrears', e.target.value)}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId='user_name' className='add-profile'>
                      <label className='label5-ques'>User Name</label><p></p>
                      <input
                        type="text"
                        className='input-ques'
                        autoComplete="off"
                        value={loginData.user_name}
                        readOnly
                      />
                    </div>
                  </Col>


                </Row>
                <p></p>
                <Row md={12}>
                  <Col>
                    <div controlId='password' className='add-profile'>
                      <label className='label5-ques'>Password</label><p></p>
                      <input
                        type="text"
                        className='input-ques'
                        autoComplete="off"
                        value={loginData.password}
                        onChange={(e) => handleInputpassChange('password', e.target.value)}
                        style={{ width: "32%" }}
                      />
                    </div>
                  </Col>


                </Row>

                <p></p>

                <Row md={12}>

                </Row>
                <p></p>

                <Row >
                  <Col md={6}></Col>
                  <Col>
                    <button className='button-ques-save' style={{ width: "100px" }} type="submit">Update</button>
                  </Col>
                </Row>
              </Form>
            ))}
          </div>
        </div>
        <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

      </div></div>
  );
}

export default UpdateRequest;
