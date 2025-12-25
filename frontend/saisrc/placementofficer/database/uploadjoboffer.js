import React, { useEffect, useState, useContext } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
//import './uploadstudent.css'
import {
  getcollegeApi,
  getdepartmentApi,
  getcompanyApi,
  addcompanyApi,
  getcandidatesApi,
  getSkillApi,
  addjobApi,
  Unique_Job_Offers_API,
  get_department_info_API,
  get_Batches_API,
  getClg_Group_API,
} from "../../api/endpoints";
//import AddQuestionPage from '../Test/question/AddQuestionPage'
import Select from "react-select";
import back from "../../assets/images/backarrow.png";
import "../../styles/global.css";
import ErrorModal from '../../components/auth/errormodal';
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import Next from "../../assets/images/nextarrow.png";
import CustomOption from "../test/customoption";
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../../allsearch/searchcontext";
import Pagination from "react-bootstrap/Pagination";
import { Modal } from "react-bootstrap";
import { useSearch } from "../../allsearch/searchcontext";

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

      width: '72%'
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
const Uploadjoboffers = ({ collegeName, institute }) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyProfile, setCompanyProfile] = useState("");
  const [postName, setPostName] = useState("");
  const [postNameDescription, setPostNameDescription] = useState("");
  const [internFullTime, setInternFullTime] = useState("");
  const [jobType, setJobType] = useState("");
  const [onOffCampus, setOnOffCampus] = useState("");
  const [cgpaModal, setCGPAMAodal] = useState("");
  const [marks10thModal, setMarks10thModal] = useState("");
  const [marks12thModal, setMarks12thModal] = useState("");
  const [genderModal, setGenderModal] = useState("");
  const [histArrearsModal, setHistArrearsModal] = useState("");
  const [standArrearsModal, setStandArrearsModal] = useState("");
  const [interviewDateModal, setInterviewDateModal] = useState("");
  const [yearModal, setYearModal] = useState("");
  const [locationModal, setLocationModal] = useState("");
  const [noOfOffersModal, setNoOfOffersModal] = useState("");
  const [packagesModal, setPackagesModal] = useState("");
  const [departmentIdModal, setDepartmentIdModal] = useState([]);
  const [skillIdModal, setSkillIdModal] = useState([]);

  const [testcontents, setTestcontents] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessageModal, setErrorMessageModal] = useState("");
  const { searchQuery } = useContext(SearchContext);
  // const [showModal, setShowModal] = useState(true);
  const [showModal, setShowModal] = useState(true);
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleCloseError = () => {
    setShowError(false);
  };
  console.log("colleges", collegeName)
  const [college, setCollege] = useState([]);

  const [department, setDepartment] = useState([]);
  // const [company, setcompany] = useState([]);

  //const [selectedcompany, setSelectedcompany] = useState(null);
  const [skill, setskill] = useState([]);

  const [selectedskill, setSelectedskill] = useState([]);

  const [selectedCollege, setSelectedCollege] = useState(null);
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
  const filteredYears = internFullTime === "Fulltime"
  ? years.filter((year) => year.value === "3" || year.value === "4")
  : years;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oncampus, setoncampus] = useState(false);
  const [selectedCollegeGroups, setSelectedCollegeGroups] = useState([]); // Stores selected college groups
   const [collegeId, setCollegeId] = useState(null);
    const [collegeGroups, setCollegeGroups] = useState([]); // Stores fetched groups for selected colleges
  const handleNextButtonClick = () => {
    setshowAddstudent(true); // Show the Add Student form
  };

  const handlePreviousButtonClick = () => {
    navigate("/uploadstudentdata");
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
        setCollege(
          data.map((item) => ({ value: item.id, label: item.college }))
        );
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
   
  }, [collegeName]);


   useEffect(() => {
          const fetchCollegeData = async () => {
              try {
                  if (!collegeName) {
                      console.warn('⚠️ College name is empty.');
                      return;
                  }
  
                  // Fetch college groups for the selected college
                  const groupData = await getClg_Group_API(collegeName);
                  console.log('📄 College Group API Response:', groupData);
  
                  // Ensure response has college_code
                  const formattedGroups = groupData.map(item => ({
                      value: item.id,
                      label: item.college_group,
                      collegeId: collegeName,
                      collegeCode: item.college_code, // Ensure we get college_code
                  }));
  
                  console.log('✅ Formatted Groups:', formattedGroups);
                  setCollegeGroups(formattedGroups);
  
                  // Fetch batches for the selected college
                 
              } catch (error) {
                  console.error('❌ Error fetching college data:', error);
              }
          };
  
          fetchCollegeData();
      }, []);

         useEffect(() => {
              getcollegeApi()
                  .then(data => {
                      const matchedCollege = data.find(item => item.college === collegeName.trim());
                      if (matchedCollege) {
                          setCollegeId([matchedCollege.id]); // Make sure collegeId is set as an array
                          console.log('Matched College ID:', matchedCollege.id);
      
                          // Fetch departments for the matched college
                          get_department_info_API([institute])
                              .then(departmentData => {
                                  const departmentOptions = departmentData.map(item => ({
                                      value: item.department_id_value,
                                      label: item.department_name_value,
                                  }));
                                  setDepartment([{ value: 'all', label: 'All' }, ...departmentOptions]);
                              })
                              .catch(error => console.error('Error fetching departments:', error));
                      } else {
                          console.error('College name not found in fetched data');
                      }
                  })
                  .catch(error => console.error('Error fetching colleges:', error));
          }, [  collegeName]);
      
  const handleDepartmentsChange = (selectedOptions) => {
    // Check if "All" was selected
    if (selectedOptions.some((option) => option.value === "all")) {
      // Select all actual departments (excluding 'all')
      const allDepartments = department.filter((option) => option.value !== "all");
      setSelectedDepartment(allDepartments);
    } else {
      setSelectedDepartment(selectedOptions);
    }
  };
  

  const handleSubmit = (e) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    e.preventDefault();

    const formData = new FormData(e.target);

    console.log("Skills: ", selectedskill);
    let skill_values = selectedskill
      ? selectedskill.map((skill) => skill.value)
      : null;

    console.log("skill_value: ", skill_values);
    let department_values = selectedDepartment
      ? selectedDepartment.map((dept) => dept.value)
      : [];

    console.log('Year: ', yearModal);
    if (!formData.get("company_name") || !formData.get("post_name") || !yearModal || !selectedDepartment.length ) {
      alert("Please fill all mandatory fields marked with **");
      setIsSubmitting(false);
      return;
    }
    
    // Create job offers data
    const joboffers = {
      company_name: formData.get("company_name"),
      company_profile: formData.get("company_profile"),
      post_name: formData.get("post_name") || null,
      skill_id: skill_values || null,
      gender: genderModal || null,
      college_id: [institute] || [],
      cgpa: cgpaModal || null,
      interview_date: interviewDate 
  ? moment(interviewDate).format("YYYY-MM-DD HH:mm:ss")
  : null,

     // interview_date: moment(interviewDate).format("YYYY-MM-DD HH:mm:ss"),
      //year: yearModal.value||null,
      year: yearModal.value,
      packages: formData.get("packages") || null,
      // intrview_date: formData.get('interview_date'),

      intern_fulltime: internFullTime ||null,
      no_of_offers: formData.get("no_of_offers") || null,
      department_id: department_values,
      marks_10th: marks10thModal,
      marks_12th: marks12thModal,
      history_of_arrears: formData.get("history_of_arrears") || null,
      on_off_campus: oncampus|| null,
      standing_arrears: formData.get("standing_arrears") || null,
      location: formData.get("location") || null,
      job_type: jobType|| null,
    };

    console.log("job", joboffers)
    // Create company data
    const companyData = {
      company_name: formData.get("company_name"),
      company_profile: formData.get("company_profile"),
    };

    console.log("Job Offers Data: ", joboffers);
    console.log("Company Data: ", companyData);
    Object.keys(joboffers).forEach((key) => {
      if (
        joboffers[key] === "" ||
        joboffers[key] === null ||
        (Array.isArray(joboffers[key]) && joboffers[key].length === 0)
      ) {
        delete joboffers[key];
      }
    });
    // Submit to addjobApi
    addjobApi(joboffers)
      .then((jobResponse) => {
        console.log("addjobApi Response: ", jobResponse);

        // Submit to addcompanyApi
        return addcompanyApi(companyData);
      })
      .then((companyResponse) => {
        console.log("addcompanyApi Response: ", companyResponse);
        setErrorMessage("Job Offer Uploaded Successfully");
        setShowError(true);
       navigate('/jobofertable'); 
        // Both submissions were successful
        //  window.alert("Job offer and company added successfully");
        e.target.reset(); // Clear the form fields
        setSelectedCollege(null); // Clear selected college
        setSelectedDepartment(null); // Clear selected department
        setMarks10th(0); // Reset slider value
        setMarks12th(0);
        setCgpa(0);
        setSelectedYear(null);
        setinterviewDate(null);
        setoncampus(null);

        setSelectedskill([]);
        handleNextClick();
      })
      .catch((error) => {
        console.error(
          "Failed to Add Data",
          error.response ? error.response.data : error.message
        ); // Log the error to the console
        alert("Failed to Add. Check console for details.");
      });
    setIsSubmitting(false);
  };

  const totalPages = Math.ceil(testcontents.length / itemsPerPage);


  useEffect(() => {
    getTestcontents();
  }, []);

  const getTestcontents = async () => {
    try {
      let data = await Unique_Job_Offers_API(institute); // Use let instead of const to allow reassignment
      setTestcontents(data); // Set the filtered data to state
      console.log("Job Offer Data: ", data);
    } catch (error) {
      console.error("Error fetching test contents:", error);
      //setErrorMessage('Failed to load announcements.');
      setShowError(true);
    }
  };

  const handleShowOffers = () => {
    navigate("/job-update");
  };


  const handleNextClick = () => {
    navigate('/jobofertable'); // Navigate to the /jobofertable route
  };


  return (
    <div>
      <div>
        <div>
          <div className="form-ques-addjoboff">
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
                        className="input-ques-text-po"
                        min="0"
                        name="company_name"
                        placeholder=""
                        autoComplete="off"
                        defaultValue={companyName}
                      />
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
                        className="input-ques-text-po"
                        min="0"
                        name="company_profile"
                        placeholder=""
                        autoComplete="off"
                        defaultValue={companyProfile}
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
                        className="input-ques-text-po"
                        min="0"
                        name="post_name"
                        placeholder=""
                        autoComplete="off"
                        defaultValue={postName}
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>
                <Row>
                  <Col>
                    <div controlId="intern_fulltime">
                      <label className="label6-ques">
                        Intern/Full Time 
                      </label>{" "}
                      <p></p>
                      <select
                        as="select"
                        name="intern_fulltime"
                        className="input-ques-text-po"
                        value={internFullTime} // Controlled component
                        onChange={(e) => setInternFullTime(e.target.value)}
                      >
                        <option value="">Select </option>
                        <option value="Internship">Internship</option>
                        <option value="Fulltime">Full Time</option>
                         <option value="Inter/Fulltime">Intern/Fulltime</option>
                      </select>
                    </div>
                  </Col>

                  <Col>
                    <div controlId="department">
                      <label className="label6-ques">
                        Department<span>**</span>
                      </label>
                      <p></p>
                     {/*} <Select
                        isMulti
                        options={department} // options list for the select component
                        value={selectedDepartment} // This holds the selected departments
                        onChange={handleDepartmentsChange} // Update onChange to reflect changes
                        closeMenuOnSelect={false}
                        components={{ Option: CustomOption }}
                        styles={customStyles}
                      />*/}
                      <Select
  isMulti
  options={department}
  value={
    selectedDepartment.length === department.length - 1 // excluding "all"
      ? [{ value: "all", label: "All" }]
      : selectedDepartment
  }
  onChange={handleDepartmentsChange}
  closeMenuOnSelect={false}
  components={{ Option: CustomOption }}
  className="year-jobpost"
  styles={customStyles}
/>

                    </div>
                  </Col>

                  <Col>
                    <div className="year" controlId="year">
                      <label className="label5-ques">
                        Year<span>**</span>
                      </label>
                      <p></p>
                    {/*}  <Select
                        options={years}
                        onChange={setYearModal}
                        placeholder="Select year"
                        styles={customStyles}
                        className="year-jobpost"
                        value={yearModal} // Controlled component
                      />*/}
                      <Select
  options={filteredYears}
  onChange={setYearModal}
  placeholder="Select year"
  styles={customStyles}
  className="year-jobpost"
  value={yearModal}
/>

                    </div>
                  </Col>
                </Row>
                <p></p>
                <Row>
                  <Col>
                    <div controlId="marks_10th" className="ranges-over">
                      <label className="label6-ques">
                        10th Mark<span>**</span>
                      </label>
                      <p></p>
                      <input
                        type="range"
                        name="marks_10th"
                        min='35'
                        max="100"
                        value={
                          marks10thModal ? parseInt(marks10thModal, 10) : 0
                        }
                        onChange={(e) => setMarks10thModal(e.target.value)}
                        defaultValue={
                          marks10thModal ? parseInt(marks10thModal, 10) : 0
                        }
                      />
                      <Form.Text style={{ color: "#94a0ad" }}>
                        {marks10thModal}
                      </Form.Text>
                    </div>
                  </Col>
                  <Col>
                    <div controlId="marks_12th" className="ranges-over">
                      <label className="label7-ques">
                        12th Mark<span>**</span>
                      </label>
                      <p></p>
                      <input
                        type="range"
                        name="marks_12th"
                        min='35'
                        max="100"
                        value={
                          marks12thModal ? parseInt(marks12thModal, 10) : 0
                        }
                        onChange={(e) => setMarks12thModal(e.target.value)}
                        defaultValue={
                          marks12thModal ? parseInt(marks12thModal, 10) : 0
                        }
                      />
                      <Form.Text style={{ color: "#94a0ad" }}>
                        {marks12thModal}
                      </Form.Text>
                    </div>
                  </Col>
                  <Col>
                    <div controlId="cgpa" className="ranges-over">
                      <label className="label6-ques">
                        CGPA<span>**</span>
                      </label>
                      <p></p>
                      <input
                        type="range"
                        name="cgpa"
                        min="0"
                        max="10"
                        step="0.1"
                        value={cgpaModal ? parseFloat(cgpaModal, 10) : 0}
                        onChange={(e) => setCGPAMAodal(e.target.value)}
                        defaultValue={cgpaModal ? parseFloat(cgpaModal, 10) : 0}
                      />
                      <Form.Text style={{ color: "#94a0ad" }}>
                        {cgpaModal}
                      </Form.Text>
                    </div>
                  </Col>
                </Row>

                <p></p>
                <Row>
                  <Col>
                    <div controlId="skill_id">
                      <label className="label6-ques">Skill Name</label>
                      <p></p>
                      <Select
                        options={skill}
                        value={selectedskill}
                        onChange={setSelectedskill}
                        placeholder="Select skill"
                        isMulti
                        className="year-jobpost"
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
                        className="input-ques-text-po"
                        min="0"
                        name="history_of_arrears"
                        placeholder=""
                        autoComplete="off"
                        defaultValue={histArrearsModal}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId="standing_arrears">
                      <label className="label7-ques">
                        Standing Arrears
                      </label>
                      <p></p>
                      <input
                        type="number"
                        className="input-ques-text-po"
                        min="0"
                        name="standing_arrears"
                        placeholder=""
                        autoComplete="off"
                        defaultValue={standArrearsModal}
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>
                <Row>
                  <Col>
                    <div controlId="gender">
                      <label className="label6-ques">Gender</label> <p></p>
                      <select
                        name="gender"
                        className="input-ques-text-po"
                        value={genderModal} // Controlled component
                        onChange={(e) => setGenderModal(e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="Both">Both</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </Col>
                  <Col>
                    <div>
                      <label className="label5-ques">
                        Interview Date
                      </label>
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
                       /// required
                        defaultValue={interviewDateModal}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId="packages">
                      <label className="label7-ques">
                        Packages
                      </label>{" "}
                      <p></p>
                      <input
                        type="text"
                        className="input-ques-text-po"
                        min="0"
                        name="packages"
                        placeholder=""
                        autoComplete="off"
                        defaultValue={packagesModal}
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>

                <Row>
                  <Col>
                    <div controlId="location">
                      <label className="label7-ques">
                        Location
                      </label>{" "}
                      <p></p>
                      <input
                        type="text"
                        className="input-ques-text-po"
                        min="0"
                        name="location"
                        placeholder=""
                        autoComplete="off"
                        defaultValue={locationModal}
                      />
                    </div>
                  </Col>

                  <Col>
                    <div controlId="job_type">
                      <label className="label6-ques">
                        Job Type
                      </label>{" "}
                      <p></p>
                      <select
                        as="select"
                        name="job_type"
                        className="input-ques-text-po"
                        value={jobType} // Controlled component
                        onChange={(e) => setJobType(e.target.value)}
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
                        className="input-ques-text-po"
                        min="0"
                        name="no_of_offers"
                        placeholder=""
                        autoComplete="off"
                        defaultValue={noOfOffersModal}
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>
                <Row>
                  <Col>
                    <div controlId="on_off_campus">
                      <label className="label5-ques">
                        Off Campus
                      </label>
                      <p></p>
                      <div>
                        <input
                          type="checkbox"
                          id="on_off_campus"
                          checked={oncampus}
                          onChange={(e) =>
                            handleCheckboxChange(e.target.checked, setoncampus)
                          }
                        />
                        <label htmlFor="on_off_campus_checkbox"></label>
                      </div>
                    </div>
                  </Col>
                  <Col></Col>
                  <Col></Col>
                </Row>
                <p style={{ height: "40px" }}></p>
                <p></p>
                <p></p>

                <Row>
                  <Col>
                    <div className="button-container-lms">
                       <button
                className="button-ques-save"
                style={{ marginRight: "20px", width: "112px" }}
                onClick={handleShowOffers}

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
                        className="button-ques-save"
                        style={{
                          width: '100px',
                          color: 'black',
                          height: '50px',
                          backgroundColor: '#F1A128',
                          cursor: 'pointer', // Enable cursor interaction
                        }}
                        onClick={handleNextClick}
                       
                      // Attach the click handler
                      >
                        <span>Next</span>
                        <img src={Next} className="nextarrow" alt="Next" />
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
