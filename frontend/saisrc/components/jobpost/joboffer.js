import React, { useEffect, useState } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
//import './uploadstudent.css'
import {
  getcollegeApi,
   get_department_info_API_jd,
  getcompanyApi,
  addcompanyApi,
  getcandidatesApi,
  getSkillApi,
  addjoboffersApi,
} from "../../api/endpoints";
//import AddQuestionPage from '../Test/question/AddQuestionPage'
import Select from "react-select";
import JobTable from "./uploadtable";
import back from "../../assets/images/backarrow.png";
import "../../styles/global.css";

import ErrorModal from "../auth/errormodal";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";

import Next from "../../assets/images/nextarrow.png";
import CustomOption from "../test/customoption";
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

          width: '98%'
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
          width: '98%'
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


const Uploadjoboffers = () => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseError = () => {
    setShowError(false);
  };

  const [college, setCollege] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [skill, setskill] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);

  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const [selectedskill, setSelectedskill] = useState([]);
  // const [selectedCourseName, setSelectedCourseName] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState([]);

  const [showAddstudent, setshowAddstudent] = useState(false); // State variable to track visibility
  const [marks10th, setMarks10th] = useState(0);
  const [marks12th, setMarks12th] = useState(0);
  const [cgpa, setCgpa] = useState(0);
  const [interviewDate, setinterviewDate] = useState("");
  const navigate = useNavigate();
  const years = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
  ];
  const [selectedYear, setSelectedYear] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oncampus, setoncampus] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleNextButtonClick = () => {
    setshowAddstudent(true); // Show the Add Student form
  };

  const handlePreviousButtonClick = () => {
    setshowAddstudent(false); // Show the table
  };
  const handleCheckboxChange = (checked, setter) => {
    setter(checked);
  };

  useEffect(() => {
    getcompanyApi()
      .then((data) => {
        // setcompany(data.map(item => ({ value: item.id, label: item.company_name })));
      })
      .catch((error) => console.error("Error fetching Company:", error));

    getcollegeApi()
      .then((data) => {
        const collegeOptions = data.map((item) => ({
          value: item.id,
          label: item.college,
        }));
        setCollege([{ value: "all", label: "All" }, ...collegeOptions]);
      })
      .catch((error) => console.error("Error fetching College:", error));

    getSkillApi()
      .then((data) => {
        setskill(
          data.map((item) => ({ value: item.id, label: item.skill_name }))
        );
      })
      .catch((error) => console.error("Error fetching skill:", error));

    //Fetch Department
  }, []);

  useEffect(() => {
    const isAllSelected = selectedColleges.some(college => college.value === "all");
  
    const collegeIds = isAllSelected
      ? ["all"]  // <-- send a string 'all' to let backend know
      : selectedColleges.map(college => college.value);
  
     get_department_info_API_jd(collegeIds)
      .then((data) => {
        const departmentOptions = data.map((item) => ({
          value: item.department_id_value,
          label: item.department_name_value,
        }));
        setDepartments([{ value: "all", label: "All" }, ...departmentOptions]);
      })
      .catch((error) => console.error("Error fetching departments:", error));
  }, [selectedColleges]);
  
  
  const handleCollegeChange = (selectedOptions) => {
    if (selectedOptions.some(option => option.value === 'all')) {
      setSelectedColleges([{ value: 'all', label: 'All' }]);
     //etSelectedDepartments(departments.filter(option => option.value !== 'all'));
  } else {
    setSelectedColleges(selectedOptions);
  }
  setSelectedDepartments([]);
   
  };

  const handleDepartmentsChange = (selectedOptions) => {
    if (selectedOptions.some(option => option.value === 'all')) {
      setSelectedDepartments([{ value: 'all', label: 'All' }]);
     //etSelectedDepartments(departments.filter(option => option.value !== 'all'));
  } else {
      setSelectedDepartments(selectedOptions);
  }
  };

  const handleSubmit = (e) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    e.preventDefault();

    // Log the form submission start
    console.log("Form submitted. Processing started...");

    const formData = new FormData(e.target);

    const errors = {};

    // Validation logic for mandatory fields (fields marked with '**')
    if (!formData.get("company_name")) {
      errors.company_name = "Company Name is required";
    }
   
    if (!formData.get("post_name")) {
      errors.post_name = "Designation is required";
    }
    if (selectedColleges.length === 0) {
      errors.college_id = "At least one college must be selected";
    }
    if (selectedDepartments.length === 0) {
      errors.department_id = "At least one department must be selected";
    }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Set error messages to state
      setIsSubmitting(false); // Stop the submission process
      return; // Return early since there are validation errors
    }

    setFormErrors({}); // Clear any previous errors if form is valid

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const filteredColleges = selectedColleges.some(col => col.value === 'all')
    ? college.filter(col => col.value !== 'all')
    : selectedColleges;
  
  const filteredDepartments = selectedDepartments.some(dep => dep.value === 'all')
    ? departments.filter(dep => dep.value !== 'all')
    : selectedDepartments;
  
    // Log selected colleges and departments
    console.log("Filtered Colleges: ", filteredColleges);
    console.log("Filtered Departments: ", filteredDepartments);

    console.log("Skills: ", selectedskill);
    let skill_values = selectedskill
      ? selectedskill.map((skill) => skill.value)
      : null;

    // Log the mapped skill values
    console.log("Skill Values: ", skill_values);

    // Construct the job offer object
    const joboffers = {
      company_name: formData.get("company_name"),
      company_profile: formData.get("company_profile")?.trim() || null,

      //company_profile: formData.get("company_profile")|| null,
      post_name: formData.get("post_name") || null,
      skill_id: skill_values || null,
      gender: formData.get("gender") || null,
      college_id: filteredColleges.map(col => col.value),
department_id: filteredDepartments.map(dep => dep.value),

     // college_id: filteredColleges.map((college) => college.value),
     // department_id: filteredDepartments.map((department) => department.value),
      cgpa: cgpa || null,
      interview_date: interviewDate
      ? moment(interviewDate).format("YYYY-MM-DD HH:mm:ss")
      : null,
    
      year: selectedYear ? selectedYear.value : null, // Updated line
      packages: formData.get("packages") || "",
      intern_fulltime: formData.get("intern_fulltime"),
      no_of_offers: formData.get("no_of_offers") || 0,
      marks_10th: marks10th,
      marks_12th: marks12th,
      history_of_arrears: formData.get("history_of_arrears") || 0,
      on_off_campus: oncampus,
      standing_arrears: formData.get("standing_arrears") || 0,
      location: formData.get("location") || "",
      job_type: formData.get("job_type"),
    };

    // Log the constructed job offer data
    console.log("Constructed Job Offers Data: ", joboffers);

    // Call the API
    addjoboffersApi(joboffers)
      .then((jobResponse) => {
        console.log("API Response: ", jobResponse); // Log the API response

        setErrorMessage("Job Offer Uploaded Successfully");
        setShowError(true);

        // Reset form data
        console.log("Resetting form...");
        e.target.reset(); // Clear the form fields
        setSelectedColleges([]);
        setSelectedDepartments([]); // Clear selected department
        setMarks10th(35); // Reset slider value
        setMarks12th(35);
        setCgpa(0);
        setSelectedYear(null);
        setinterviewDate(null);
        setoncampus(null);
        setSelectedskill([]);

        // Call the next button action
        handleNextButtonClick();
      })
      .catch((error) => {
        // Log error details
        console.error(
          "Failed to Add Data",
          error.response ? error.response.data : error.message
        );
        alert("Failed to Add. Check console for details.");
      })
      .finally(() => {
        // Ensure that the submitting flag is reset regardless of success or error
        setIsSubmitting(false);
        console.log("Form processing completed.");
      });
  };

  const handleNextClick = () => {
    navigate('/jobofertable'); // Navigate to the /jobofertable route
  };

  return (
    <div>
      <div>
        {!showAddstudent ? (
          <div>
            <div className="form-ques">
          {/*}  <button
                className="button-ques-save"
                style={{ marginRight: "20px", width: "112px" }}
                onClick={handleNextClick}

              >
                <span>Show Offers</span>
              </button>*/}
              <div className="header">
                <h6 >Add Job Offer</h6>
              </div>
              <p></p>
              <div className="boxshadow">
                <Form onSubmit={handleSubmit} className="form-ques">
                  <p></p>

                  <Row>
                    <Col>
                      <div controlId="company_name">
                        <label className="label6-ques">
                          Company Name <span>**</span>
                        </label>
                        <p></p>
                        <input
                          type="text"
                          className="input-ques-textfiled"
                          min="0"
                          name="company_name"
                          placeholder=""
                          autoComplete="off"
                        />
                        {formErrors.company_name && (
                          <span className="error-text">
                            {formErrors.company_name}
                          </span>
                        )}{" "}
                        {/* Display error */}
                      </div>
                    </Col>
                    <Col>
                      <div controlId="company_profile">
                        <label className="label6-ques">
                          {" "}
                          Company Profile 
                        </label>
                        <p></p>
                        <input
                          type="text"
                          className="input-ques-textfiled"
                          min="0"
                          name="company_profile"
                          placeholder=""
                          autoComplete="off"
                        />
                       
                      </div>
                    </Col>
                    <Col>
                      <div controlId="post_name">
                        <label className="label6-ques">
                          Designation <span>**</span>
                        </label>
                        <p></p>
                        <input
                          type="text"
                          className="input-ques-textfiled"
                          min="0"
                          name="post_name"
                          placeholder=""
                          autoComplete="off"
                        />
                        {formErrors.post_name && (
                          <span className="error-text">
                            {formErrors.post_name}
                          </span>
                        )}{" "}
                        {/* Display error */}
                      </div>
                    </Col>
                  </Row>
                  <p></p>

                  <Row md={12}>
                    <Col>
                      <div className="CollegeName" controlId="college_name">
                        <label className="label5-ques">
                          College Name <span>**</span>
                        </label>
                        <p></p>
                        <Select
                          isMulti
                          options={college}
                          value={selectedColleges}
                          onChange={handleCollegeChange}
                          styles={customStyles}
                          components={{ Option: CustomOption }}
                          closeMenuOnSelect={false} // Keep the menu open when selecting multiple options
                        />
                        {formErrors.college_id && (
                          <span className="error-text">
                            {formErrors.college_id}
                          </span>
                        )}{" "}
                        {/* Display error */}
                      </div>
                    </Col>
                    <Col>
                      <div
                        className="DepartmentName"
                        controlId="department_name"
                      >
                        <label className="label5-ques">
                          Department Name <span>**</span>
                        </label>
                        <p></p>
                        <Select
                          isMulti
                          options={departments}
                          value={selectedDepartments}
                          onChange={handleDepartmentsChange}
                          styles={customStyles}
                          components={{ Option: CustomOption }}
                          closeMenuOnSelect={false}
                        />
                        {formErrors.department_id && (
                          <span className="error-text">
                            {formErrors.department_id}
                          </span>
                        )}{" "}
                        {/* Display error */}
                      </div>
                    </Col>

                    <Col>
                      <div  className="DepartmentName" controlId="year">
                        <label className="label5-ques">Year</label>
                        <p></p>
                        <Select
                          options={years}
                          value={selectedYear}
                          onChange={setSelectedYear}
                          placeholder="Select year"
                          styles={customStyles}
                          
                        />
                      </div>
                    </Col>
                  </Row>

                  <p></p>
                  <Row>
                    <Col>
                      <div controlId="marks_10th" className="ranges-over">
                        <label className="label6-ques">10th Mark</label>
                        <p></p>
                        <input
                          type="range"
                          name="marks_10th"
                          min='35'
                          max="100"
                           classname='ranges'
                          value={marks10th}
                          onChange={(e) => setMarks10th(e.target.value)}
                        />
                        <Form.Text style={{ color: "#94a0ad" }}>
                          {marks10th}
                        </Form.Text>
                      </div>
                    </Col>
                    <Col>
                      <div controlId="marks_12th" className="ranges-over">
                        <label className="label7-ques">12th Mark</label>
                        <p></p>
                        <input
                          type="range"
                          name="marks_12th"
                           classname='ranges'
                          min='35'
                          max="100"
                          value={marks12th}
                          onChange={(e) => setMarks12th(e.target.value)}
                        />
                        <Form.Text style={{ color: "#94a0ad" }}>
                          {marks12th}
                        </Form.Text>
                      </div>
                    </Col>
                    <Col>
                      <div controlId="cgpa" className="ranges-over">
                        <label className="label6-ques">CGPA</label>
                        <p></p>
                        <input
                        classname='ranges'
                          type="range"
                          name="cgpa"
                          min="0"
                          max="10"
                          step="0.1"
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                        />
                        <Form.Text style={{ color: "#94a0ad" }}>
                          {cgpa}
                        </Form.Text>
                      </div>
                    </Col>
                  </Row>

                  <p></p>
                  <Row>
                    <Col>
                      <div   className="DepartmentName"controlId="skill_id">
                        <label className="label6-ques">Skill Name</label>
                        <p></p>
                        <Select
                          options={skill}
                          value={selectedskill}
                          onChange={setSelectedskill}
                          placeholder="Select skill"
                          isMulti
                          styles={customStyles} // Verify that customStyles is not causing issues
                          components={{ Option: CustomOption }}
                          closeMenuOnSelect={false} // Keep the menu open when selecting multiple options
                        />
                      </div>
                    </Col>

                    <Col>
                      <div controlId="history_of_arrears">
                        <label className="label6-ques">
                          History of Arrears
                        </label>
                        <p></p>
                        <input
                          type="number"
                          className="input-ques-textfiled"
                          min="0"
                          name="history_of_arrears"
                          placeholder=""
                          autoComplete="off"
                        />
                      </div>
                    </Col>
                    <Col>
                      <div controlId="standing_arrears">
                        <label className="label7-ques">Standing Arrears</label>
                        <p></p>
                        <input
                          type="number"
                          className="input-ques-textfiled"
                          min="0"
                          name="standing_arrears"
                          placeholder=""
                          autoComplete="off"
                        />
                      </div>
                    </Col>
                  </Row>
                  <p></p>
                  <Row>
                    <Col>
                      <div controlId="gender">
                        <label className="label6-ques">Gender</label> <p></p>
                        <select name="gender" className="input-ques-textfiled">
                          <option value="">Select Gender</option>
                          <option value="Both">Both</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </Col>
                    <Col>
                      <div>
                        <label className="label5-ques">Interview Date</label>
                        <p></p>

                        <DatePicker
                          name="dtm_start"
                          selected={interviewDate}
                          onChange={(date) => setinterviewDate(date)}
                          showTimeSelect
                          timeFormat="hh:mm aa"
                          timeIntervals={15}
                          dateFormat="dd-MM-yyyy, h:mm aa"
                          timeCaption="Time"
                          className="interview-date-su"
                          styles={customStyles}
                          autoComplete="off"
                         
                        />
                      </div>
                    </Col>
                    <Col>
                      <div controlId="packages">
                        <label className="label7-ques">Packages</label> <p></p>
                        <input
                          type="text"
                          className="input-ques-textfiled"
                          min="0"
                          name="packages"
                          placeholder=""
                          autoComplete="off"
                        />
                      </div>
                    </Col>
                  </Row>
                  <p></p>

                  <Row>
                    <Col>
                      <div controlId="location">
                        <label className="label7-ques">Location</label> <p></p>
                        <input
                          type="text"
                          className="input-ques-textfiled"
                          min="0"
                          name="location"
                          placeholder=""
                          autoComplete="off"
                        />
                      </div>
                    </Col>

                    <Col>
                      <div controlId="job_type">
                        <label className="label6-ques">Job Type</label> <p></p>
                        <select
                          as="select"
                          name="job_type"
                          className="input-ques-textfiled"
                        >
                          <option value="">Select </option>
                          <option value="IT">IT</option>
                          <option value="Core">Core</option>
                        </select>
                      </div>
                    </Col>
                    <Col>
                      <div controlId="no_of_offers">
                        <label className="label6-ques">No of Offers</label>
                        <p></p>
                        <input
                          type="text"
                          className="input-ques-textfiled"
                          min="0"
                          name="no_of_offers"
                          placeholder=""
                          autoComplete="off"
                        />
                      </div>
                    </Col>
                  </Row>
                  <p></p>
                  <Row>
                    <Col>
                      <div controlId="intern_fulltime">
                        <label className="label6-ques">Intern/Full Time</label>{" "}
                        <p></p>
                        <select
                          as="select"
                          name="intern_fulltime"
                          className="input-ques-textfiled"
                        >
                          <option value="">Select </option>
                          <option value="Internship">Internship</option>
                          <option value="Fulltime">Full Time</option>
                        </select>
                      </div>
                    </Col>
                    <Col>
                      <div controlId="on_off_campus">
                        <label className="label5-ques">On/Off Campus</label>
                        <p></p>
                        <div>
                          <input
                            type="checkbox"
                            id="on_off_campus"
                            checked={oncampus}
                            onChange={(e) =>
                              handleCheckboxChange(
                                e.target.checked,
                                setoncampus
                              )
                            }
                          />
                          <label htmlFor="on_off_campus_checkbox"></label>
                        </div>
                      </div>
                    </Col>
                    <Col></Col>
                  </Row>
                  <p style={{ height: "40px" }}></p>
                  <p></p>
                  <p></p>

                  <Row>
                    <Col>
                      <div className="button-container-lms-update">
                        <button
                          className="button-ques-save btn btn-secondary back-button-lms"
                          style={{
                            width: "100px",
                            color: "black",
                            height: "50px",
                            backgroundColor: "#F1A128",
                            cursor: "not-allowed",
                          }}
                          disabled
                        >
                          <img src={back} className="nextarrow"></img>
                          <span className="button-text">Back</span>
                        </button>

                        <button
                          variant="primary"
                          disabled={isSubmitting}
                          type="submit"
                          style={{ width: "100px" }}
                          className="button-ques-save"
                        >
                          Save
                        </button>

                        <button
                          className="button-data button-spacing"
                          onClick={handleNextButtonClick}
                          style={{ width: "100px" }}
                        >
                          <span>Next</span>
                          <img src={Next} className="nextarrow"></img>
                        </button>
                      </div>
                    </Col>
                  </Row>
                  <p></p>
                </Form>

                <p></p>
              </div>
            </div>
          </div>
        ) : (
          <div>
           <div className="back-button-container">
        <button onClick={handlePreviousButtonClick} className="button-ques-save" style={{ width: "100px", marginLeft:"20px"  }} >
          <img src={back} className="nextarrow" alt="Back" />
          <span>Back</span>
        </button>
      </div>
            <JobTable />
          </div>
        )}
      </div>
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default Uploadjoboffers;
