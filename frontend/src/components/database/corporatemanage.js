import React, { useState, useEffect, useContext } from 'react';
import { Pagination, Form,Row,Col } from 'react-bootstrap';
import {
  getcollegeApi,
  deletecorporateApi,
  addCorporate_logo_API,
  getCorporate_logo_API,
  updateCorporate_logo_API_NEW
} from '../../api/endpoints';
import Select from "react-select";
import CustomOption from "../test/customoption";
import { SearchContext } from '../../allsearch/searchcontext';
import '../../styles/trainingadmin.css';
import ErrorModal from '../auth/errormodal';
import Add from '../../assets/images/add.png';


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

const CorporateManagement = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyProfile, setCompanyProfile] = useState("");
  const [userName, setUserName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [password, setPassword] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [updateCollege, setUpdateCollege] = useState(null);

  const [colleges, setColleges] = useState([]);
  const [updateCompanyName, setUpdateCompanyName] = useState('');
  const [updateCompanyLogo, setUpdateCompanyLogo] = useState(null);
  const [updateCompanyProfile, setUpdateCompanyProfile] = useState('');
  const [updateUserName, setUpdateUserName] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [updateEmailId, setUpdateEmailId] = useState('');
  const [updateMobileNo, setUpdateMobileNo] = useState('');
  
  const [formErrors, setFormErrors] = useState({});
  
  // Show/hide password toggle state
  const [showPassword, setShowPassword] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const { searchQuery } = useContext(SearchContext);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedColleges, setSelectedColleges] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [college, setCollege] = useState([]);


  const handleCloseError = () => {
    setShowError(false);
  };

  const handleFileChange = (e) => {
    setCompanyLogo(e.target.files[0]);
  };

  const handleUpdateFileChange = (e) => {
    const file = e.target.files[0];
    setUpdateCompanyLogo(file);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);


  const fetchColleges = async () => {
    try {
      const collegesData = await getCorporate_logo_API();
      setColleges(collegesData);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  // Fetch colleges and companies initially
  useEffect(() => {
    fetchColleges();
    getcollegeApi()
    .then((data) => {
      const collegeOptions = data.map((item) => ({
        value: item.id,
        label: item.college,
      }));
      setCollege([{ value: "all", label: "All" }, ...collegeOptions]);
    })
    .catch((error) => console.error("Error fetching College:", error));
  }, []);


  const handleCollegeChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === "all")) {
      setSelectedColleges(college.filter((option) => option.value !== "all"));
    } else {
      setSelectedColleges(selectedOptions);
    }
  };
 
  const handleAddCollege = async () => {
    if (isSubmitting) return;
  setIsSubmitting(true);
  setErrorMessage('');

  // Validation
  if (!companyName.trim()) {
    setErrorMessage('Company Name is required.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }
  if (!userName.trim()) {
    setErrorMessage('User Name is required.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }
  if (!password.trim()) {
    setErrorMessage('Password is required.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }

  const mobileNumberPattern = /^[6-9]\d{9}$/;
  if (!mobileNo.trim()) {
    setErrorMessage('Mobile Number is required.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }
  if (!mobileNumberPattern.test(mobileNo.trim())) {
    setErrorMessage('Invalid Mobile Number. It must start with 6-9 and be exactly 10 digits.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.(com|in|net|org|edu|gov|co\.in|gmail\.com)$/i;
  if (!emailId.trim()) {
    setErrorMessage('Email is required.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }
  if (!emailPattern.test(emailId.trim())) {
    setErrorMessage('Invalid Email address. Must contain a valid domain like @gmail.com, .com, or .in.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }
    try {
      // Prepare the data for the API
      const test = {
        company_name: companyName,
        company_profile: companyProfile,
        user_name: userName,
        email_id: emailId,
        mobile_no: mobileNo,
        password: password,
        company_logo: companyLogo,
        college_id: selectedColleges.map((college) => college.value),
      };
 
      await addCorporate_logo_API(test);
 
      // Clear input fields after successful submission
      setCompanyName("");
      setCompanyProfile("");
      setUserName("");
      setEmailId("");
      setMobileNo("");
      setPassword("");
      setCompanyLogo(null);
      setSelectedColleges([]);

      await fetchColleges();
 
      setErrorMessage("Corporate added successfully.");
      setShowError(true);
    } catch (error) {
      console.error("Error adding corporate:", error);
      setErrorMessage("Failed to add corporate. Please try again.");
      setShowError(true);
    }
  };
 
  const handleUpdateCorporate = async () => {
    setErrorMessage('');

  // Validation
  const mobileNumberPattern = /^[6-9]\d{9}$/;
  if (updateMobileNo && !mobileNumberPattern.test(updateMobileNo.trim())) {
    setErrorMessage('Invalid Mobile Number. It must start with 6-9 and be exactly 10 digits.');
    setShowError(true);
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.(com|in|net|org|edu|gov|co\.in|gmail\.com)$/i;
  if (updateEmailId && !emailPattern.test(updateEmailId.trim())) {
    setErrorMessage('Invalid Email address. Must contain a valid domain like @gmail.com, .com, or .in.');
    setShowError(true);
    return;
  }
    const corporateDetails = {
      company_name: updateCompanyName,
      company_profile: updateCompanyProfile,
      user_name: updateUserName,
      email_id: updateEmailId,
      mobile_no: updateMobileNo,
      password: updatePassword,
      company_logo: updateCompanyLogo,
      college_ids: selectedColleges ? selectedColleges.map(college => college.value) : [],
    };
 
    try {
      // Call the API to update corporate details
      const response = await updateCorporate_logo_API_NEW(updateCollege, corporateDetails);
      if (response) {
        await fetchColleges();
        setErrorMessage("Corporate details updated successfully.");

        // Clear input fields after successful update
        setUpdateCompanyName("");
        setUpdateCompanyProfile("");
        setUpdateUserName("");
        setUpdateEmailId("");
        setUpdateMobileNo("");
        setUpdatePassword("");
        setUpdateCompanyLogo(null);
        setUpdateCollege(null);
        setSelectedColleges([]);
        setShowPassword(true); // show password as exact text after update or reset

        // Optionally close the update form
        setShowUpdateForm(false);
      }
    } catch (error) {
      console.error("Error updating corporate details:", error);
      setErrorMessage("Failed to update corporate details. Please try again.");
      setShowError(true);
    }
  };
 
 
  const handleDeleteCollege = async (collegeId) => {
    try {
      await deletecorporateApi(collegeId);
      setColleges(colleges.filter((college) => college.id !== collegeId));
      await fetchColleges();
      setErrorMessage('Data Deleted Successfully');
      setShowError(true);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Data Not Deleted ');
      setShowError(true);
    }
  };
 
  const [searchTerm, setSearchTerm] = useState(""); 
 
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
 
  const filteredcorporate = colleges.filter((corporate) =>
    (corporate.company_name && corporate.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (corporate.user_name && corporate.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
    
  const totalPages = Math.ceil(filteredcorporate.length / itemsPerPage);
  const currentColleges = filteredcorporate.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
 
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const getPaginationItems = () => {
    const items = [];
    let startPage, endPage;

    if (totalPages <= 3) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage === 1) {
      startPage = 1;
      endPage = 3;
    } else if (currentPage === totalPages) {
      startPage = totalPages - 2;
      endPage = totalPages;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return items;
  };



  return (
    <div className='form-ques-settings'>
       <input
        type="text"
        className="search-box1-settings"
        placeholder="Search corporate..."
        value={searchTerm}
        onChange={handleSearchChange}
       
      />
      <button className='button-ques-save-add' 
      onClick={() => {
        setShowAddForm(true);            // Show Add form
        setShowUpdateForm(false);       // Hide Update form

        // Optional: reset Add form fields if needed
        setCompanyName("");
        setCompanyProfile("");
        setUserName("");
        setPassword("");
        setEmailId("");
        setMobileNo("");
        setCompanyLogo(null);
        setSelectedColleges([]);
      }}>
        <img src={Add} className='nextarrow' alt="Add" style={{ marginRight: "2px" }} />
        <strong>Add</strong>
      </button>
      <p></p>
      <p></p>

      {/* Add form -- unchanged */}
      {showAddForm && (
        <div className="popup-container-clg">
          {/* Company Name */}
          <div className="input-row">
          <div className="input-group" >
            <label className="label5-ques">Company Name</label>
            <p></p>
            <input
              type="text"
              value={companyName}
              autoComplete="off"
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="input-ques-st"
            />
          </div>
          <div className="input-group">
            <label className="label5-ques">Company Profile</label>
            <p></p>
            <input
              type="text"
              value={companyProfile}
              autoComplete="off"
              onChange={(e) => setCompanyProfile(e.target.value)}
              placeholder="Enter company profile"
              className="input-ques-st"
            />
          </div>
          </div>
          <p></p>

          {/* User Name and Password */}
          <div className="input-row">
          <div className="input-group">
            <label className="label5-ques">User Name</label><p></p>
            <input
              type="text"
              value={userName}
              autoComplete="off"
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter user name"
              className="input-ques-st"
            />
          </div>
          <div className="input-group">
            <label className="label5-ques">Password</label><p></p>
            <input
              type="password"
              value={password}
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input-ques-st"
            />
          </div>
          </div>


          {/* Email and Mobile Number */}
          <div className="input-row">
          <div className="input-group">
            <label className="label5-ques">Email</label><p></p>
            <input
              type="email"
              value={emailId}
              autoComplete="off"
              onChange={(e) => setEmailId(e.target.value)}
              placeholder="Enter email"
              className="input-ques-st"
            />
          </div>
          
          <div className="input-group">
            <label className="label5-ques">Mobile No</label><p></p>
            <input
              type="text"
              value={mobileNo}
              autoComplete="off"
              onChange={(e) => setMobileNo(e.target.value)}
              placeholder="Enter mobile number"
              className="input-ques-st"
              maxLength="10"
            />
          </div>
          </div>
          <p></p>
          <Row md="12"> 
          <Col md={6}>
          <div className="input-group"></div>
          </Col><Col md={6}></Col>
          </Row>
          <Row md="12"> 
            <Col md={6}>
          
          <div className="file-input-group-clg" >
            <label htmlFor="companyLogo" className="input-button-ques-mcq-clg">Attachment</label>
            <input
              type="file"
              id="companyLogo"
              name="companyLogo"
              onChange={handleFileChange}
              className="input-file-ques-mcq-clg"
            />
            {companyLogo && <span className="file-name-clg">{companyLogo.name}</span>}
          </div></Col>
          
          </Row>  <p></p>
          
          <div>
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
                            closeMenuOnSelect={false}
                          />
                          {formErrors.college_id && (
                            <span className="error-text">
                              {formErrors.college_id}
                            </span>
                          )}{" "}
                        </div>
                      </div>
          {/* Buttons */}
          <div className="button-container-set">
            <button
              className="button-ques-save-st"
              onClick={handleAddCollege}
              disabled={isSubmitting}
            >
              Save
            </button>
            <button
              className="cancel-master"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Update form - only changed password input type and fixed college select prefill */}
      {showUpdateForm && (
        <div className="popup-container-clg">
          <div className='input-row'>
          <div className="input-group">
            <label className="label5-ques">Company Name</label>
            <p></p>
            <input
              type="text"
              value={updateCompanyName}
              onChange={(e) => setUpdateCompanyName(e.target.value)}
              placeholder="Enter updated company name"
              className="input-ques-st"
              style={{ marginRight: "10px" }}
            />
          </div>
          <div className="input-group">
            <label className="label5-ques">Company Profile</label><p></p>
            <input
              type="text"
              value={updateCompanyProfile}
              onChange={(e) => setUpdateCompanyProfile(e.target.value)}
              placeholder="Enter updated company profile"
              className="input-ques-st"
              style={{ marginRight: "10px" }}
            />
          </div></div>
          <p></p>
         
         
         
          <div className='input-row'>
          <div className="input-group">
            <label className="label5-ques">User Name</label>
           <p></p>
            <input
              type="text"
              value={updateUserName}
              onChange={(e) => setUpdateUserName(e.target.value)}
              placeholder="Enter updated user name"
              className="input-ques-st"
              style={{ marginRight: "10px" }}
            />
          </div>
          <div className="input-group" style={{position: 'relative'}}>
            <label className="label5-ques">Password</label>
           <p></p>
            <input
              type="text"  /* changed to text to show exact password */
              value={updatePassword}
              onChange={(e) => setUpdatePassword(e.target.value)}
              placeholder="Enter updated password"
              className="input-ques-st"
              style={{ marginRight: "10px" }}
              autoComplete="new-password"
            />
            {/* Uncomment below if you want show/hide toggle button for password */}
            {/*<button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 10,
                top: 28,
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.8rem'
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>*/}
          </div></div>
          <p></p>
          <div className="input-row">
          <div className="input-group">
            <label className="label5-ques">Email</label>
           <p></p> <input
              type="email"
              value={updateEmailId}
              onChange={(e) => setUpdateEmailId(e.target.value)}
              placeholder="Enter updated email"
              className="input-ques-st"
              style={{ marginRight: "10px" }}
            />
          </div>
          <div className="input-group">
            <label className="label5-ques">Mobile No</label>
           <p></p> <input
              type="text"
              value={updateMobileNo}
              onChange={(e) => setUpdateMobileNo(e.target.value)}
              placeholder="Enter updated mobile number"
              className="input-ques-st"
              maxLength="10"
              style={{ marginRight: "10px" }}
            />
          </div></div>
          <p></p>
         
          <div className="input-row">
          <label className="label5-ques">Company Logo</label><p></p>
          
          <div className="file-input-group-clg">
            <label htmlFor="updateCompanyLogo" className="input-button-ques-mcq-clg">Attachment</label>
            <input
              type="file"
              id="updateCompanyLogo"
              name="updateCompanyLogo"
              onChange={handleUpdateFileChange}
              className="input-file-ques-mcq-clg"
            />
            {updateCompanyLogo && (
              <span className="file-name-clg">
                {typeof updateCompanyLogo === 'string' ? (
                  <img src={`data:image/jpeg;base64,${updateCompanyLogo}`} alt="Current logo" style={{ maxWidth: '100px' }} />
                ) : (
                  updateCompanyLogo.name
                )}
              </span>
            )} 
          </div>
          <div className="input-group"></div>
          </div>
          <div>
          <label className="label5-ques">College Name</label>
          <p></p>
          <Select
            isMulti
            options={college} // Predefined list of colleges
            value={selectedColleges}
            onChange={handleCollegeChange}
            styles={customStyles}
            components={{ Option: CustomOption }}
            closeMenuOnSelect={false}
          />
        </div>

          <p></p>
          <div className="button-container-set">
            <button className="button-ques-save-st" onClick={handleUpdateCorporate}>Update</button>
            <button className="cancel-master" onClick={() => setShowUpdateForm(false)}>Cancel</button>
          </div>
        </div>
      )}



      <div className='table-responsive-settings'>


        <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th>Company</th>
              <th>User Name</th>
              <th> Company Logo</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {currentColleges
              .filter(content => !searchQuery || (content.college && content.college.toLowerCase().includes(searchQuery.toLowerCase())))
              .map((college) => (
                <tr key={college.id}>
                  <td>{college.company_name}</td>
                  <td>{college.user_name}</td>
                  <td >
                    {college.company_logo ? (
                      <img src={`data:image/png;base64,${college.company_logo}`} alt="College Logo" style={{ width: "70px", height: "auto" }} />
                    ) : (
                      "No Logo"
                    )}
                  </td>
                  <td>
                    <button className="action-button edit" onClick={() => {
                      setShowUpdateForm(true);
                      setUpdateCollege(college.id);  // This sets the college ID correctly
                      setUpdateCompanyName(college.company_name);
                      setUpdateUserName(college.user_name);
                      setUpdateEmailId(college.email_id);
                      setUpdatePassword(college.password);
                      setUpdateMobileNo(college.mobile_no);
                      setSelectedColleges(
                        college.colleges.map(c => ({
                          value: c.id,
                          label: c.college
                        }))
                      );
                      setShowAddForm(false);
                      setUpdateCompanyProfile(college.company_profile);
                      setShowPassword(true); // Show password as exact text when editing
                    }} >✏️</button>


                  </td>
                  <td>
                    <button className="action-button delete" onClick={() => handleDeleteCollege(college.id)} style={{ color: "orange" }}>🗑</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table><p></p><p></p>
        <div className='dis-page'>
          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex', }}>
            <Form.Label className='display' >Display:</Form.Label>
            <Form.Control
              className='label-dis'
              style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
              as="select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>
          <Pagination className="pagination-custom">
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {getPaginationItems()}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      </div>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />


    </div>
  );
};


export default CorporateManagement;
