import React, { useState, useEffect, useContext } from "react";
import { Pagination, Form } from "react-bootstrap";
import {
  addCCannouncement_API,
  getCCannouncement_API,
  updateCCannouncement_API_NEW,
  getLoginApi,
  getRole_API,
  deleteCCannouncement_API,
  getCollegeList_Concat_API,
} from "../../api/endpoints";
import Nextarrow from '../../assets/images/nextarrow.png'
import back from '../../assets/images/backarrow.png';
import { FaEdit, FaTrash } from "react-icons/fa";
//import { SearchContext } from '../../AllSearch/SearchContext';
import "../../styles/trainingadmin.css";
import AnnounceTable from "./announcetable";
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import { Col, Row } from "react-bootstrap";

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


const CCAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [newLoginId, setNewLoginId] = useState("");
  const [newAnnouncementImage, setNewAnnouncementImage] = useState(null);
  const [updateAnnouncement, setUpdateAnnouncement] = useState("");
  const [updateLoginId, setUpdateLoginId] = useState("");
  const [updateAnnouncementImage, setUpdateAnnouncementImage] = useState(null);
  const [updateAnnouncementId, setUpdateAnnouncementId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loginIds, setLoginIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddstudent, setshowAddstudent] = useState(false);
  const navigate = useNavigate();
  const [triggerFetch, setTriggerFetch] = useState(true);


  const [collegeList, setCollegeList] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);



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

          setCollegeList([defaultOption, ...options]); // Add default option at the beginning
          // setSelectedCollege(defaultOption); // Set the default option as the initial value

          // ✅ Only reset trigger after successful data fetch
          setTriggerFetch(false);
        })
        .catch((error) => console.error("Error fetching college list:", error));

    }
  }, [triggerFetch]);



  // Fetch roles on component load
  // Fetch roles on component load
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRole_API();
        // Store roles with value (id) and label (role name)
        setRoles(
          rolesData.map((item) => ({ value: item.id, label: item.label }))
        );
      } catch (error) {
        console.error("Error fetching roles:", error);
        setErrorMessage("Failed to fetch roles.");
        setShowError(true);
      }
    };
    fetchRoles();
  }, []);

  // Fetch login IDs based on the selected role (by comparing role labels)
  useEffect(() => {
    const fetchLoginIds = async () => {
      if (selectedRole) {
        try {
          const loginData = await getLoginApi(); // Fetch all users with roles
          console.log("logindata:", loginData);

          // Filter login IDs by matching role label with the selected role
          const filteredLoginData = loginData.filter(
            (user) => user.role === selectedRole
          );
          setLoginIds(
            filteredLoginData.map((item) => ({
              value: item.id,
              label: item.login_id,
            }))
          );

          console.log("Filtered login IDs:", filteredLoginData);
        } catch (error) {
          console.error("Error fetching login IDs:", error);
          setErrorMessage("Failed to fetch login IDs.");
          setShowError(true);
        }
      } else {
        setLoginIds([]); // Reset login IDs if no role is selected
      }
    };

    fetchLoginIds();
  }, [selectedRole]);

  const handleAddAnnouncementOLD = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    if (!newAnnouncement.trim() || !selectedRole) {
      setErrorMessage("Announcement and Role are required.");
      setShowError(true);
      return;
    }

    try {
      const loginData = await getLoginApi();
      const filteredLoginData = loginData.filter(
        (user) => user.role === selectedRole
      );

      const loginIds = filteredLoginData.map((item) => item.id);

      if (loginIds.length === 0) {
        setErrorMessage(
          `No users found for the selected role: ${selectedRole}`
        );
        setShowError(true);
        return;
      }

      const response = await addCCannouncement_API({
        announcement: newAnnouncement,
        login_ids: loginIds,
        role: selectedRole, // Ensure role is included
        announcement_image: newAnnouncementImage,
      });

      fetchAnnouncements();
      setNewAnnouncement("");
      setSelectedRole("");
      setNewAnnouncementImage(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Failed to add announcement. Please try again.");
      setShowError(true);
    }
    setIsSubmitting(false);
  };

  const handleAddAnnouncement = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    if (!newAnnouncement.trim() || !selectedRole) {
      setErrorMessage("Announcement and Role are required.");
      setShowError(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const loginData = await getLoginApi();
      let filteredLoginData = loginData.filter(
        (user) => user.role === selectedRole
      );

      if (selectedRole === "Placement Officer") {
        filteredLoginData = filteredLoginData.filter(
          (item) => item.college_id === selectedCollege.value
        );
      }
      console.log('Fetched Login Ids....: ', filteredLoginData);
      const loginIds = filteredLoginData.map((item) => item.id);

      if (loginIds.length === 0) {
        setErrorMessage(`No users found for the selected role: ${selectedRole}`);
        setShowError(true);
        setIsSubmitting(false);
        return;
      }

      await addCCannouncement_API({
        announcement: newAnnouncement,
        login_ids: loginIds,
        role: selectedRole,
        announcement_image: newAnnouncementImage,
      });

      fetchAnnouncements();
      resetForm(); // Call reset logic here
    } catch (error) {
      console.error("Error adding announcement:", error.message || error);
      setErrorMessage("Failed to add announcement. Please try again.");
      setShowError(true);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setNewAnnouncement("");
    setSelectedRole("");
    setNewAnnouncementImage(null);
    setShowAddForm(false);
    setErrorMessage("");
    setShowError(false);
  };


  const handleCloseError = () => setShowError(false);

  const handleFileChange = (e) => setNewAnnouncementImage(e.target.files[0]);

  const handleFileChangeUpdate = (e) =>
    setUpdateAnnouncementImage(e.target.files[0]);

  const fetchAnnouncements = async () => {
    try {
      const announcementsData = await getCCannouncement_API();
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleNextButtonClick = () => {

    navigate('/announce/table/'); // Show the Add Student form
  };

  return (
    <div>

      <div className="form-ques-announcement ">
        <div className="form-ques">
          <div>
            <label className="label5-ques">Announcement</label>
            <p></p>

            <div className="announcement-attachment-container">
              <textarea
                type="text"
                value={newAnnouncement}
                autoComplete="off"
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Enter announcement"
                className="input-ques-announcement"
                style={{
                  marginRight: "10px",
                }}
              />
              <div
                className="file-input-group-clg-announ"
                style={{ marginLeft: "0%" }}
              >
                <label
                  htmlFor="announcementImage"
                  className="input-button-ques-mcq-clg"
                >
                  Attachment
                </label>
                <input
                  type="file"
                  id="announcementImage"
                  name="announcementImage"
                  onChange={handleFileChange}
                  className="input-file-ques-mcq-clg"
                />
                {newAnnouncementImage && (
                  <span className="file-name-clg">
                    {newAnnouncementImage.name}
                  </span>
                )}
              </div>
            </div>

            <p></p>
            <label className="label5-ques">Select Role</label>
            <p></p>

            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-ques"
              style={{ width: "60%" }}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            <p></p>
            {selectedRole === 'Placement Officer' && (
              <Col sm={8}>
                <label className="label5-ques">College</label>
                <p></p>
                <Select
                  options={collegeList}
                  value={selectedCollege}
                  onChange={(college) => setSelectedCollege(college)}
                  placeholder="Select College"
                  styles={customStyles}

                />
              </Col>
            )}



            <p style={{ height: "50px" }}></p>

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

              <button
                className="button-ques-save-master"
                onClick={handleAddAnnouncement}
                disabled={isSubmitting}
              >
                Save
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
                <span className="button-text">Next</span>  <img src={Nextarrow} className='nextarrow' style={{ color: "#6E6D6C" }}></img>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CCAnnouncement;
