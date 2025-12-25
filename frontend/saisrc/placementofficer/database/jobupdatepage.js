import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { Row, Col } from "react-bootstrap";
import CustomOption from "../../components/test/customoption";
import { getjobApi, get_department_info_API, getSkillApi, getjobIdApi, updatejobApi } from '../../api/endpoints' // Adjust these imports to your actual API imports
import moment from 'moment';
import "react-datetime/css/react-datetime.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Next from "../../assets/images/nextarrow.png";
import back from "../../assets/images/backarrow.png";
import JobUpdateTable from "./jobupdatetable";
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
const JobUpdatePage = ({institute}) => {
  const { id } = useParams();
  const [jobData, setJobData] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    company_profile: "",
    post_name: "",
    intern_fulltime: "",
    job_type: "",
    department_id: [],
    year: "",
    interview_date: "",
    gender: "",
    history_of_arrears: 0,
    standing_arrears: 0,
    location: "",
    marks_10th: 0,
    marks_12th: 0,
    cgpa: 0,
    skill_id: [],
    no_of_offers: "",
    on_off_campus: false, // Added checkbox field
  });
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handlePreviousButtonClick = () => {
    navigate("/uploadstudentdata"); // Specify the route to navigate to
  };

  
  const handleNextButtonClick = () => {
    navigate("/jobofertable"); // Specify the route to navigate to
  };


  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log("id: ", id);
        const response = await getjobIdApi(id); // API call
        console.log("Response update: ", response);

        if (Array.isArray(response) && response.length > 0) {
          const job = response[0]; // Extract the first object from the array

          const departmentOptions = job.departments?.map((department) => ({
            value: department.department_id, // 'value' is the unique identifier for each department
            label: department.department_name, // 'label' is the name that will be displayed in the dropdown
          })) || [];
          setSelectedDepartment(departmentOptions);

          console.log('department values: ', departmentOptions);
          
          const skillOptions = job.skills?.map((skill) => ({
            value: skill.skill_id, // 'value' is the unique identifier for each department
            label: skill.skill_name, // 'label' is the name that will be displayed in the dropdown
          })) || [];
          setSelectedSkills(skillOptions);

          console.log('skills values: ', skillOptions);


          setJobData(job); // Save the job data if needed elsewhere
          setFormData({
            company_name: job.company_name || "",
            post_name: job.post_name || "",
            company_profile: job.company_profile || "",
            intern_fulltime: job.intern_fulltime || "",
            job_type: job.job_type || "",
            department_id: departmentOptions,
            year: job.year || "",
            marks_10th: job.marks_10th || 0,
            skill_id: skillOptions,
            on_off_campus: job.on_off_campus || false, // Populate checkbox
            interview_date: job.interview_date
              ? new Date(job.interview_date)
              : null, // Convert to Date object if present
            gender: job.gender || "",
            history_of_arrears: job.history_of_arrears || "",
            standing_arrears: job.standing_arrears || "",
            location: job.location || "",
            no_of_offers: typeof job.no_of_offers === "number" ? job.no_of_offers : job.no_of_offers?.toString() || "0",
            marks_12th: job.marks_12th || 0,
            cgpa: job.cgpa || 0,
          });
        } else {
          setError("Invalid response format: No job data found.");
        }
      } catch (error) {
        console.error("Error fetching job details: ", error);
        setError("Error fetching job details.");
      }
    };


    const fetchDepartments = async () => {
      try {
        const data = await get_department_info_API([institute]);
        const departmentOptions = data.map((item) => ({
          value: item.department_id_value,
          label: item.department_name_value,
        }));
        setDepartments([{ value: "all", label: "All" }, ...departmentOptions]);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchSkills = async () => {
      try {
        const data = await getSkillApi();
        const skillOptions = data.map((item) => ({
          value: item.id,
          label: item.skill_name,
        }));
        setSkills([{ value: "all", label: "All" }, ...skillOptions]);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchJob();
    fetchDepartments();
    fetchSkills();
  }, [id]);
  const handleMultiSelectChange = (selectedOptions, fieldName) => {
    const selectedValues = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: selectedValues,
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      interview_date: date,
    }));
  };
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSelectChange = (selectedOptions, name) => {
    const values = selectedOptions.map((option) => option.value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: values,
    }));
  };

  const handleDepartmentsChange = (selectedOptions) => {
    // If "all" is selected, remove it and set the rest
    if (selectedOptions.some((option) => option.value === "all")) {
      setSelectedDepartment(
        departments.filter((option) => option.value !== "all")
      );
    } else {
      setSelectedDepartment(selectedOptions); // Set selected options
    }

    console.log("*********selectedDepartment*********: ", selectedDepartment);
  };

  const handleSkillsChange = (selectedOptions) => {
    // If "all" is selected, remove it and set the rest
    if (selectedOptions.some((option) => option.value === "all")) {
      setSelectedSkills(
        skills.filter((option) => option.value !== "all")
      );
    } else {
      setSelectedSkills(selectedOptions); // Set selected options
    }

    console.log("*********selectedSkills*********: ", selectedSkills);
  };


  const handleUpdate = async () => {
    // Map selected departments to their values
    const department_values = selectedDepartment.map((dept) => dept.value);
    const skill_values = selectedSkills.map((dept) => dept.value);

    const updatedFormData = {
      ...formData,
      interview_date:
        formData.interview_date instanceof Date
          ? formData.interview_date.toISOString().split("T")[0] // Convert Date to YYYY-MM-DD
          : formData.interview_date, // Use as-is if already a string
      department_id: department_values, // Update department_id
      skill_id: skill_values, // Update department_id
    };

    try {
      await updatejobApi(id, updatedFormData); // API call
      navigate("/jobofertable"); // Navigate to job offer table
    } catch (error) {
      console.error("Error updating job:", error.response?.data || error.message);
      setError(error.response?.data || "Failed to update job");
    }
  };



  return (
    <div className="form-ques-addjoboff">
      <div className="header">
        <h6>Update Job Offer</h6>
      </div>
      <form className="form-ques">
        <Row>
          <Col>
            <div controlId="company_name">
              <label className="label5-ques">Company Name</label><p></p>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Company Name"
                className="input-ques"
              />
            </div></Col>
          <Col>
            <div controlId="company_profile">
              <label className="label5-ques">Company Profile</label><p></p>
              <input
                type="text"
                name="company_profile"
                value={formData.company_profile}
                onChange={handleInputChange}
                className="input-ques"
                placeholder="Company Profile"
              />
            </div></Col>

          <Col>
            <div controlId="post_name">
              <label className="label5-ques">Designation</label><p></p>
              <input
                type="text"
                name="post_name"
                value={formData.post_name}
                onChange={handleInputChange}
                placeholder="Post Name"
                className="input-ques"
              />
            </div></Col>
        </Row>

        <p></p>

        <Row>
          <Col>  <div>
            <label className="label5-ques">Intership/FullTime</label><p></p>
            <select
              name="intern_fulltime"
              value={formData.intern_fulltime}
              onChange={handleInputChange}
              className="input-ques"
            >
              <option value="">Select</option>
              {["Internship", "Fulltime"].map((intern_fulltime) => (
                <option key={intern_fulltime} value={intern_fulltime}>
                  {intern_fulltime}
                </option>
              ))}
            </select>
          </div>
          </Col>
          <Col>
            <div>
              <label className="label5-ques">Job Type</label><p></p>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleInputChange}
                className="input-ques"
              >
                <option value="">Select</option>
                {["IT", "Core"].map((job_type) => (
                  <option key={job_type} value={job_type}>
                    {job_type}
                  </option>
                ))}
              </select>
            </div></Col>
          <Col>
            <div>
              <label className="label5-ques">Location</label><p></p>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-ques"
                placeholder="location"
              />
            </div>
          </Col>
        </Row>

        <p></p>
        <Row>

          <Col>  <div>
            <label className="label5-ques">Interview Date</label><p></p>
            <DatePicker
              selected={formData.interview_date}
              onChange={handleDateChange}
              showTimeSelect
              styles={customStyles}
              className="interview-date"
              dateFormat="dd-MM-yyyy h:mm aa"
              timeFormat="HH:mm"
              timeIntervals={15}
              placeholderText="Select Interview Date and Time"
            />
          </div></Col>
          <Col> <div>
            <label className="label5-ques">Gender</label><p></p>
            <select
              name="gender"
              value={formData.gender}
              className="input-ques"
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              {["Male", "Female", "Both"].map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
          </Col>
          <Col> <div className="DepartmentName">
            <label className="label5-ques">Skills</label><p></p>
            <Select
              isMulti
              options={skills} // Options list
              value={selectedSkills} // Selected departments
              onChange={handleSkillsChange} // Update selection
              closeMenuOnSelect={false}
              components={{ Option: CustomOption }}
              styles={customStyles}
            />
          </div></Col>
        </Row><p></p>
        <Row>
          <Col> <div>
            <label className="label5-ques">On/Off Campus</label><p></p>
            <input
              type="checkbox"


              name="on_off_campus"

              checked={formData.on_off_campus}
              onChange={handleCheckboxChange}
            />
            <span>{formData.on_off_campus ? "On-Campus" : "Off-Campus"}</span>
          </div>
          </Col>

          <Col>  <div>
            <label className="label5-ques">Year</label><p></p>
            <select
              name="year"
              value={formData.year}
              className="input-ques"
              onChange={handleInputChange}
            >
              <option value="">Select Year</option>
              {[1, 2, 3, 4].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div></Col>
          <Col>  <div>
            <label className="label5-ques">No Of Offer</label><p></p>
            <input
              type="number"
              min="0"
              max="100"
              className="input-ques"
              name="no_of_offers"
              value={formData.no_of_offers}
              onChange={handleInputChange}
              placeholder="No of Offer"
            />
          </div></Col>
        </Row><p></p>
        <Row>
          <Col>
            <div controlId="marks_10th">
              <label className="label5-ques">10th Marks</label><p></p>
              <input
                type="range"
                name="marks_10th"
                min="0"
                max="100"
                
                value={formData.marks_10th}
                onChange={handleInputChange}
              />
              <label>{formData.marks_10th}</label>
            </div>
          </Col>
          <Col>  <div controlId="marks_12th">
            <label className="label5-ques">12th Marks</label><p></p>
            <input
              type="range"
              name="marks_12th"
              min="0"
              max="100"
             
              value={formData.marks_12th}
              onChange={handleInputChange}
            />
            <label>{formData.marks_12th}</label>
          </div></Col>
          <Col><div controlId="cgpa">
            <label className="label5-ques">CGPA</label><p></p>
            <input
              type="range"
              name="cgpa"
              min="0"
              max="10"
              step="0.1"
             
              value={formData.cgpa}
              onChange={handleInputChange}
            />
            <label>{formData.cgpa}</label>
          </div></Col>
        </Row><p></p>
        <Row>
          <Col>  <div>
            <label className="label5-ques">History Of Arrears</label><p></p>
            <input
              type="number"
              min="0"
              max="100"
              className="input-ques"
              name="history_of_arrears"
              value={formData.history_of_arrears}
              onChange={handleInputChange}
              
            />
          </div></Col>
          <Col> <div>
            <label className="label5-ques">Standing Arrears</label><p></p>
            <input
              type="number"
              name="standing_arrears"
              min="0"
              max="100"
              className="input-ques"
              value={formData.standing_arrears}
              onChange={handleInputChange}
             
            />
          </div></Col>
          {selectedDepartment.length < 4 && (
 <Col> <div>
            <label className="label5-ques">Department</label><p></p>
            <Select
              isMulti
              options={departments} // Options list
              value={selectedDepartment} // Selected departments
              onChange={handleDepartmentsChange} // Update selection
              closeMenuOnSelect={false}
              components={{ Option: CustomOption }}
              styles={customStyles}
            />
          </div>

          </Col>
             )}
        </Row><p></p>
        {selectedDepartment.length >= 4 && (
        <Row>
           <Col> <div>
            <label className="label5-ques">Department</label><p></p>
            <Select
              isMulti
              options={departments} // Options list
              value={selectedDepartment} // Selected departments
              onChange={handleDepartmentsChange} // Update selection
              closeMenuOnSelect={false}
              components={{ Option: CustomOption }}
              styles={customStyles}
            />
          </div>

          </Col>
        </Row>)}
        <p style={{ height: "50px" }}></p>
        <Row>
          <Col>
            <div className="button-container-lms">
              <button
                className="button-data button-spacing-back"
                onClick={handlePreviousButtonClick}
                style={{ width: "100px" }}
              >
                <img src={back} className="nextarrow"></img>
                <span className="button-text">Back</span>
              </button>

              <button
                onClick={handleUpdate}
                type="button"
                className="button-ques-save"
              >
                Save
              </button>

              <button
                className="button-ques-save btn btn-secondary back-button-lms"
                onClick={handleNextButtonClick}
                style={{
                  width: "100px",
                  color: "black",
                  height: "50px",
                  backgroundColor: "#F1A128",
                  // cursor: "not-allowed",
                }}
                // disabled
              >
                <span>Next</span>
                <img src={Next} className="nextarrow"></img>
              </button>
            </div>
          </Col>
        </Row>


        {error && <p>{error}</p>}
      </form></div>
  );
};

export default JobUpdatePage;
