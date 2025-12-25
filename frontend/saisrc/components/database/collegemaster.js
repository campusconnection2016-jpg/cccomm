import React, { useState, useEffect, useContext } from 'react';
import {
  deletecollegApi,
  addCollege_logo_API,
  getCollege_logo_API_CLG,
  updateCollege_logo_API_NEW,
 
} from '../../api/endpoints';
import { SearchContext } from '../../allsearch/searchcontext';
import '../../styles/trainingadmin.css';
import ErrorModal from '../auth/errormodal';
import Add from '../../assets/images/add.png'

import CustomPagination from '../../api/custompagination';
const CollegeManagement = () => {
  const [colleges, setColleges] = useState([]);
  const [newCollegeGroup, setNewCollegeGroup] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [instruct, setinstruction] = useState('');
  const [spocName, setSpocName] = useState("");
  const [spocNo, setSpocNo] = useState("");
  const [email, setEmail] = useState("");
  const [levelOfAccess, setLevelOfAccess] = useState(""); // State for dropdown
  const [updatedLevel, setupdatedLevel] = useState(""); // State for dropdown


  const [updateSpocName, setUpdateSpocName] = useState('');
  const [updateSpocNo, setUpdateSpocNo] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');

  const [updateCollegeGroup, setUpdateCollegeGroup] = useState('');
  const [updateCollege, setUpdateCollege] = useState('');
  const [updateCollege_Logo, setUpdateCollege_Logo] = useState('');
  const [updateCollegeId, setUpdateCollegeId] = useState(null);
  //const [errorMessage, setErrorMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const { searchQuery } = useContext(SearchContext);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [collegeLogo, setCollegeLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adUrl, setAdUrl] = useState('');
  const [updateStayInchargeNo, setUpdateStayInchargeNo] = useState("");
  const [updateTransInchargeName, setUpdateTransInchargeName] = useState("");
  const [updatestayInchargeName, setUpdatestayInchargeName] = useState("");
  const [updateTransInchargeNo, setUpdateTransInchargeNo] = useState("");
  
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search input
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages1, setTotalPages1] = useState(1);
  const [pageSize] = useState(10); // Items per page

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleFileChange = (e) => {
    setCollegeLogo(e.target.files[0]);
  };
  const [tests, setTests] = useState([]);

  const handleFileChangeLogo = (e) => {
    setUpdateCollege_Logo(e.target.files[0]);
  };



  const fetchColleges = async (page) => {
    try {
      const collegesData = await getCollege_logo_API_CLG(page, searchTerm); // Pass searchTerm here
      setColleges(collegesData.results);
      setTotalPages1(Math.ceil(collegesData.count / pageSize));

    } catch (error) {
      console.error("Error:", error);
    }
  };



  // Fetch colleges when component mounts
  useEffect(() => {
    fetchColleges(currentPage, searchTerm);
  }, [currentPage, searchTerm]);


  const handlePageChange1 = (page) => {
    setCurrentPage(page);
  };


  const handleAddCollege = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  setErrorMessage('');  // Clear previous message

  if (!newCollege.trim()) {
    setErrorMessage('College name is required.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }


  // Validate SPOC Contact Number
  const spocNumberPattern = /^[6-9]\d{9}$/;
  if (spocNo && !spocNumberPattern.test(spocNo)) {
    setErrorMessage('Invalid SPOC Contact Number. It must start with 6-9 and be exactly 10 digits.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }

  // Validate Email
  const emailPattern = /^[^\s@]+@[^\s@]+\.(com|in|net|org|edu|gov|co\.in|gmail\.com)$/i;
  if (email && !emailPattern.test(email)) {
    setErrorMessage('Invalid Email address. Must contain a valid domain like @gmail.com, .com, or .in.');
    setShowError(true);
    setIsSubmitting(false);
    return;
  }



  const dataToSubmit = {
    college_group: newCollegeGroup.trim() === '' ? '' : newCollegeGroup,
    college: newCollege.trim(),
    instruction: instruct,
    spoc_name: spocName,
    spoc_no: spocNo,
    email: email,
    college_logo: collegeLogo,
    attendance_url: adUrl,
    level_of_access: levelOfAccess,
  };

  try {
    // Note: axios resolves here only if status code is 2xx
    const response = await addCollege_logo_API(dataToSubmit);

    // Assume the backend sends a message field when duplicate or failure
    if (response.data && response.data.message && response.data.message.toLowerCase().includes("already exists")) {
      setErrorMessage(response.data.message);
      setShowError(true);
    } else {
      // Success
      fetchColleges();
      setErrorMessage('Data Added Successfully');
      setShowError(true);

      // Reset form fields
      setinstruction('');
      setNewCollegeGroup('');
      setNewCollege('');
      setSpocName('');
      setSpocNo('');
      setEmail('');
      setAdUrl('');
      setCollegeLogo(null);
      setLevelOfAccess('');
      setShowAddForm(false);
    }
 } catch (error) {
  console.error('Error object:', error);

  let serverMessage = 'Failed to add college. Please try again.';

  if (error.response) {
    // Check if response contains valid JSON
    const resData = error.response.data;

    if (typeof resData === 'string') {
      serverMessage = resData;  // Might be plain string like "College already exists"
    } else if (resData && typeof resData === 'object') {
      serverMessage = resData.message || resData.detail || serverMessage;
    }
  }

  setErrorMessage(serverMessage);
  setShowError(true);
}

finally {
    setIsSubmitting(false);
  }
};



  const handleDeleteCollege = async (collegeId) => {
    try {
      await deletecollegApi(collegeId);
      setColleges(colleges.filter((college) => college.id !== collegeId));
      setErrorMessage('Data Deleted Successfully');
      setShowError(true);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Data Not Deleted ');
      // Handle error
    }
  };


  const handleUpdateCollege = async (event) => {
    event.preventDefault();

    // Validate SPOC Contact Number
  const spocNumberPattern = /^[6-9]\d{9}$/;
  if (updateSpocNo && !spocNumberPattern.test(updateSpocNo)) {
    setErrorMessage('Invalid SPOC Contact Number. It must start with 6-9 and be exactly 10 digits.');
    setShowError(true);
    return;
  }

  // Validate Email
  const emailPattern = /^[^\s@]+@[^\s@]+\.(com|in|net|org|edu|gov|co\.in|gmail\.com)$/i;
  if (updateEmail && !emailPattern.test(updateEmail)) {
    setErrorMessage('Invalid Email address. Must contain a valid domain like @gmail.com, .com, or .in.');
    setShowError(true);
    return;
  }

    console.log("Preparing data to update...");

    const formData = new FormData();
    formData.append('college_id', updateCollegeId || '');
    formData.append('college_group', updateCollegeGroup && updateCollegeGroup.trim() === '' ? '' : updateCollegeGroup);
    
    formData.append('college', updateCollege || '');
formData.append('level_of_access', updatedLevel || '');

    if (updateCollege_Logo) {
      formData.append('college_logo', updateCollege_Logo);
    }

    formData.append('spoc_name', updateSpocName || '');
    formData.append('spoc_no', updateSpocNo || '');
    formData.append('email', updateEmail || '');
    formData.append('stay_incharge_name', updatestayInchargeName || '');
    formData.append('stay_incharge_no', updateStayInchargeNo || '');
    formData.append('trans_incharge_name', updateTransInchargeName || '');
    formData.append('trans_incharge_no', updateTransInchargeNo || '');

    // Log the FormData contents
    console.log('College Form data to be updated:');
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      console.log("Calling the API to update college details...");
      const response = await updateCollege_logo_API_NEW(updateCollegeId, formData);
      console.log("API Response:", response);
      fetchColleges();
      setErrorMessage('Data Updated Successfully');
      setShowError(true);
      setUpdateCollege('');
      setShowUpdateForm(false);

      if (response && response.status === 200) {
        console.log("API update successful. Refreshing colleges...");
        fetchColleges();
        setErrorMessage('Data Updated Successfully');
        setShowError(true);
        setUpdateCollege('');
        setShowUpdateForm(false);
      }
    } catch (error) {
      console.error('Error during update:', error);
      setErrorMessage('Failed to update college. Please try again.');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // setCurrentPage(1); // Reset to first page on search
  };

  const filteredColleges = colleges.filter((college) =>
    (college.college && college.college.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (college.college_group && college.college_group.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentColleges = colleges.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
 


  return (
    <div className='form-ques-settings'>
      <input
        type="text"
        className="search-box1-settings"
        placeholder="Search College..."
        value={searchTerm}
        onChange={handleSearchChange}

      />

      <button className='button-ques-save-add' 
      onClick={() => {
    setShowAddForm(true);           // Show Add form
    setShowUpdateForm(false);      // Hide Update form
   
  }}>
        <img src={Add} className='nextarrow' alt="Add" style={{ marginRight: "2px" }} />
        <strong>Add</strong>
      </button>
      <p></p>

      <p></p>

      {showAddForm && (
        <div className="popup-container-clg">
          <div className="input-group-clg" style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", marginTop: "10px" }}>
            {/* College Name */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques">College Name</label><p></p>
              <input
                type="text"
                value={newCollege}
                autoComplete="off"
                onChange={(e) => setNewCollege(e.target.value)}
                placeholder="Enter college name"
                className="input-ques"
                style={{ marginTop: "5px" }}
              />
            </div>

            {/* Branch */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques">College Branch</label><p></p>
              <input
                type="text"
                value={newCollegeGroup}
                autoComplete="off"
                onChange={(e) => setNewCollegeGroup(e.target.value)}
                placeholder="Enter college Branch"
                className="input-ques"
                style={{ marginTop: "5px" }}
              />
            </div>

            {/* Attachment */}
            <div className="file-input-group-clg" style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label htmlFor="collegeLogo" className="input-button-ques-mcq-clg">Attachment</label><p></p>
              <input
                type="file"
                id="collegeLogo"
                name="collegeLogo"
                onChange={handleFileChange}
                className="input-file-ques-mcq-clg"
                style={{ marginTop: "5px" }}
              />
              {collegeLogo && <span className="file-name-clg">{collegeLogo.name}</span>}
            </div>
          </div>
          <p></p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques">SPOC Name</label><p></p>
              <input
                type="text"
                value={spocName}
                autoComplete="off"
                onChange={(e) => setSpocName(e.target.value)}
                placeholder="Enter SPOC name"
                className='input-ques'
                style={{ marginTop: "5px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques">SPOC Contact Number</label><p></p>
              <input
                type="text"
                value={spocNo}
                autoComplete="off"
                onChange={(e) => setSpocNo(e.target.value)}
                placeholder="Enter SPOC contact number"
                className='input-ques'
                style={{ marginTop: "5px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques">Email</label><p></p>
              <input
                type="email"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className='input-ques'
                style={{ marginTop: "5px" }}
              />
            </div>
          </div><p></p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", marginTop: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques">Level of Access</label><p></p>
              <select
                value={levelOfAccess}
                onChange={(e) => setLevelOfAccess(e.target.value)}
                className="input-ques"
                style={{ marginTop: "5px" }}
              >
                <option value="">Select Level</option>
                <option value="Platinum">Platinum</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Diamond">Diamond</option>
              </select>
            </div>

            <div></div>
            <div></div>
          </div>

          <p></p>
          <div className='button-container-set'>
            <button className='button-ques-save-st' onClick={handleAddCollege} disabled={isSubmitting}>Save</button>
            <button className='cancel-master' onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showUpdateForm && (
        <div className="popup-container-clg">
          <div className="input-group-clg" style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", marginTop: "10px" }}>

            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>

              <label className="label5-ques">CollegeName</label><p></p><p></p>

              <input
                autoComplete="off"
                type="text"
                value={updateCollege}
                className='input-ques'

                onChange={(e) => setUpdateCollege(e.target.value)}
                placeholder="Enter updated college name"
              />

            </div>
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>

              <label className="label5-ques">College(Branch)</label><p></p><p></p>

              <input
                autoComplete="off"
                type="text"
                value={updateCollegeGroup}
                className='input-ques'

                onChange={(e) => setUpdateCollegeGroup(e.target.value)}
                placeholder="Enter updated college name"
              /></div>
            <div className="file-input-group-clg" style={{ display: "flex", flexDirection: "column", width: "30%" }}>


              <label htmlFor="collegeLogo" className="input-button-ques-mcq-clg">Attachment</label><p></p>
              <p></p>
              <input
                type="file"
                id="collegeLogo"
                name="collegeLogo"
                onChange={handleFileChangeLogo}
                className="input-file-ques-mcq-clg"
              />
              {updateCollege_Logo && typeof updateCollege_Logo === 'string' && (
                <img src={`data:image/jpeg;base64,${updateCollege_Logo}`} alt="Current logo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
              )}
              {updateCollege_Logo && typeof updateCollege_Logo !== 'string' && (
                <span className="file-name-clg">{updateCollege_Logo.name}</span>
              )}
            </div>
          </div>
          <p></p>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Spoc Name */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: '10px' }}>Spoc Name</label><p></p>
              <input
                type="text"
                value={updateSpocName}
                autoComplete="off"
                onChange={(e) => setUpdateSpocName(e.target.value)}
                className="input-ques"
                placeholder="Enter Spoc Name"
              />
            </div>

            {/* Spoc No */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: '10px' }}>Spoc No.</label><p></p>
              <input
                type="text"
                value={updateSpocNo}
                autoComplete="off"
                onChange={(e) => setUpdateSpocNo(e.target.value)}
                className="input-ques"
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: '10px' }}>SPOC Email</label><p></p>
              <input
                type="email"
                value={updateEmail}
                autoComplete="off"
                onChange={(e) => setUpdateEmail(e.target.value)}
                className="input-ques"
              />
            </div>
            
           
            {/* Stay Incharge Name */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className='label5-ques' style={{ marginRight: '10px' }}>Stay Incharge Name</label><p></p>
              <input
                type="text"
                value={updatestayInchargeName}
                autoComplete="off"
                onChange={(e) => setUpdatestayInchargeName(e.target.value)}
                className='input-ques'
              />
            </div>

          </div>
          <p></p>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

            {/* Stay Incharge No. */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className='label5-ques' style={{ marginRight: '10px' }}>Stay Incharge No.</label><p></p>
              <input
                type="text"
                value={updateStayInchargeNo}
                autoComplete="off"
                onChange={(e) => setUpdateStayInchargeNo(e.target.value)}
                className='input-ques'
              />
            </div>

            {/* Transport Incharge Name */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className='label5-ques' style={{ marginRight: '10px' }}>Transport Incharge Name</label><p></p>
              <input
                type="text"
                value={updateTransInchargeName}
                autoComplete="off"
                onChange={(e) => setUpdateTransInchargeName(e.target.value)}
                className='input-ques'
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
  <label className="label5-ques">Level of Access</label><p></p>
  <select
    value={updatedLevel}
    onChange={(e) => setupdatedLevel(e.target.value)}
    className="input-ques"
    
  >
    <option value="">Select Level</option>
     <option value="Platinum">Platinum</option>
    <option value="Silver">Silver</option>
    <option value="Gold">Gold</option>
    <option value="Diamond">Diamond</option>
  </select>
</div>


            {/* Transport Incharge No. */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className='label5-ques' style={{ marginRight: '10px' }}>Transport Incharge No.</label><p></p>
              <input
                type="text"
                value={updateTransInchargeNo}
                autoComplete="off"
                onChange={(e) => setUpdateTransInchargeNo(e.target.value)}
                className='input-ques'
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>

            </div>
          </div><p></p>
          <div className='button-container-set'>
            <button className='button-ques-save-st' onClick={handleUpdateCollege}>Update</button>
            <button className='cancel-master' onClick={() => setShowUpdateForm(false)}>Cancel</button>
          </div>
        </div>
      )}



      <div className='table-responsive-settings'>

        <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th>College</th>
              <th>College(Branch)</th>
              <th> College Logo</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {colleges
              .map((college) => (
                <tr key={college.id}>
                  <td>{college.college}</td>
                  <td>{college.college_group}</td>
                  <td >
                    {college.college_logo ? (
                      <img src={`data:image/png;base64,${college.college_logo}`} alt="College Logo" style={{ width: "70px", height: "auto" }} />
                    ) : (
                      "No Logo"
                    )}
                  </td>
                  <td>
                    <button className="action-button edit" onClick={() => {
                      setShowUpdateForm(true);
                      setUpdateCollegeId(college.id);
                      setShowAddForm(false);
                      setUpdateCollege(college.college);
                      setUpdateCollegeGroup(college.college_group);
                      //  setUpdateCollege_Logo(college.college_logo);
                      setUpdateSpocName(college.spoc_name);
                      setUpdateSpocNo(college.spoc_no);
                      setUpdateEmail(college.email);
                      setupdatedLevel(college.level_of_access);

                      setUpdatestayInchargeName(college.stay_incharge_name);
                      setUpdateStayInchargeNo(college.stay_incharge_no);
                      setUpdateTransInchargeName(college.trans_incharge_name);
                      setUpdateTransInchargeNo(college.trans_incharge_no);
                    }}>✏️</button>
                  </td>
                  <td>
                    <button className="action-button delete" onClick={() => handleDeleteCollege(college.id)} style={{ color: "orange" }}>🗑</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table><p></p><p></p>



        <div className='dis-page' style={{ marginTop: '10%' }}>
          {/* Custom Pagination */}
          <CustomPagination
            totalPages={totalPages1}
            currentPage={currentPage}
            onPageChange={handlePageChange1}
            maxVisiblePages={3} // Limit to 3 visible pages
          />
        </div>

      </div>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default CollegeManagement;

