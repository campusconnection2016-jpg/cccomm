import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  addPlacementannouncement_API,
  getcollegeApi,
  get_Departments_PO_Announce_API,
  getLoginApi,
  getRole_API,
  getCollege_id_candidateall_API,
  get_year_PO_Announce_API
} from "../../api/endpoints";
import CustomOption from "../test/customoption";
import { Col, Row } from 'react-bootstrap';

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

const PAnnouncement = ({ collegeName, institute }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [newAnnouncementImage, setNewAnnouncementImage] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loginIds, setLoginIds] = useState([]);
  const [college, setCollege] = useState(null);
  const [department, setDepartment] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isTrainingAdmin, setIsTrainingAdmin] = useState(false); // Checkbox state
  const [years, setYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  
  useEffect(() => {
    console.log("Fetching college data...");
    const fetchCollegeId = async () => {
      try {
        const data = await getcollegeApi();
        const matchingCollege = data.find(
          (college) => college.college.trim() === collegeName.trim()
        );
        if (matchingCollege) {
          console.log("Matching college found:", matchingCollege);
          setCollege(matchingCollege.id);
          setSelectedCollege({
            value: matchingCollege.id,
            label: matchingCollege.college,
          });
        } else {
          console.log("No matching college found for:", collegeName);
        }
      } catch (error) {
        console.error("Error fetching college data:", error);
      }
    };
    fetchCollegeId();
  }, [collegeName]);

  useEffect(() => {
    console.log("Fetching departments and students...");
    get_Departments_PO_Announce_API(institute)
      .then((data) => {
        const departmentOptions = data.map((item) => ({
          value: item.id,
          label: item.department,
        }));

        // Add "All" option
        setDepartment([{ value: "all", label: "All" }, ...departmentOptions]);

        console.log("Departments fetched:", data);
      })
      .catch((error) => console.error("Error fetching departments:", error));


    getCollege_id_candidateall_API(institute)
      .then((data) => {
        setStudents(data);
        console.log("Students fetched:", data);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
      });
  }, []);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        console.log("Fetching years...");
        let data = [];
  
        if (college) {
          data = await get_year_PO_Announce_API(college);
        } else if (institute) {
          data = await get_year_PO_Announce_API(institute);
        } else return;
  
        console.log("Raw year data:", data);
  
        // Ensure data is sorted numerically by `year`
        const sorted = [...data].sort((a, b) => a.year - b.year);
  
        const yearOptions = sorted.map((item) => ({
          value: item.year,
          label: item.year.toString(),
        }));
  
        setYears([{ value: "all", label: "All" }, ...yearOptions]);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };
  
    fetchYears();
  }, [college, institute]);
  
  
    
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRole_API();
        const roleOptions = rolesData.map((item) => ({
          value: item.label,
          label: item.label,
        }));
        setRoles(roleOptions);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchLoginIds = async () => {
      if (selectedRole) {
        console.log("Fetching login IDs for role:", selectedRole);
        try {
          const loginData = await getLoginApi();
          const filteredLoginData = loginData.filter(
            (user) => user.role === selectedRole
          );
          setLoginIds(
            filteredLoginData.map((item) => ({
              value: item.id,
              label: item.login_id,
            }))
          );
          console.log("Login IDs fetched:", filteredLoginData);
        } catch (error) {
          console.error("Error fetching login IDs:", error);
        }
      } else {
        setLoginIds([]);
        console.log("No role selected, login IDs cleared.");
      }
    };
    fetchLoginIds();
  }, [selectedRole]);

  useEffect(() => {
    if (college && selectedDepartments.length > 0) {
      console.log("Filtering students...");

      // If "All" is selected, don't filter by department
      const filtered = selectedDepartments.some(dep => dep.value === "all")
        ? students.filter(student => student.college_id__college === collegeName)
        : students.filter(
          (student) =>
            student.college_id__college === collegeName &&
            selectedDepartments.some(
              (department) => student.department_id__department === department.label
            )
        );

        const yearFiltered = selectedYears.some(y => y.value === "all")
  ? filtered
  : filtered.filter(student =>
      selectedYears.some(year => student.year === year.value)
    );

setFilteredStudents(yearFiltered);

     // setFilteredStudents(filtered);
      console.log("Filtered students:", yearFiltered);
    }
  }, [college, selectedDepartments, students,selectedYears]);



  const handleAddAnnouncement = async () => {
    console.log("Attempting to add announcement...");

    if (!newAnnouncement.trim()) {
      alert("Announcement is required.");
      console.log("Announcement is missing.");
      return;
    }

    try {
      const loginData = await getLoginApi();

      // When isTrainingAdmin is true, filter for "Training admin", otherwise no filtering needed.
      const filteredLoginData = loginData.filter((user) => {
        if (isTrainingAdmin) {
          return user.role === "Super admin";
        } else {
          return true; // If not training admin, return all users (or modify to fit your logic)
        }
      });

      const loginIds = filteredLoginData.map((item) => item.id);
      console.log("Filtered login IDs:", loginIds);

      // Check if we have users to send the announcement to
      if (loginIds.length === 0) {
        alert(`No users found for the selected role.`);
        console.log("No users found for the selected role.");
        return;
      }

      // Determine candidateIds, set to null if unchecked
      const candidateIds = filteredStudents.map((student) => student.id)

      console.log("Candidate IDs:", candidateIds);

      // If the checkbox is unchecked, allow storing candidate_id as null
      if (!isTrainingAdmin && candidateIds === null) {
        console.log("No candidates stored since checkbox is unchecked.");
      }

      // Loop over candidate IDs if checkbox is checked and candidateIds are available
      if (candidateIds && candidateIds.length > 0) {
        for (const candidateId of candidateIds) {
          const response = await addPlacementannouncement_API({
            announcement: newAnnouncement,
            login_ids: loginIds,
            candidate_id: candidateId,
            role: isTrainingAdmin ? "Training admin" : '',
            announcement_image: newAnnouncementImage,
          });
          console.log(
            "Announcement added for candidate ID",
            candidateId,
            ":",
            response
          );
        }
      }

      // Clear the form
      setNewAnnouncement("");
      setNewAnnouncementImage(null);
    } catch (error) {
      console.error("Error adding announcement:", error);
    }
  };

  const handleFileChange = (e) => {
    setNewAnnouncementImage(e.target.files[0]);
    console.log("File selected:", e.target.files[0]);
  };

  return (
    <div className="form-ques-announoff">
      <div className="form-ques">
        <div>
          <label className="label5-ques">Announcement</label>
          <p></p>
          <div className="input-group-clg">
            <textarea
              type="text"
              value={newAnnouncement}
              onChange={(e) => {
                setNewAnnouncement(e.target.value);
                console.log("Announcement updated:", e.target.value);
              }}
              placeholder="Enter announcement"
              className="input-ques"
              style={{ width: "60%", marginRight: "10px" }}
            />
            <div className="file-input-group-clg">
              <label
                htmlFor="announcementImage"
                className="input-button-ques-mcq-clg"
              >
                Attachment
              </label>
              <input
                type="file"
                id="announcementImage"
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


          <div className="role-section">
            <label className="label5-ques">Including CC Admin</label>
            <input
              type="checkbox"
              checked={isTrainingAdmin}
              onChange={(e) => setIsTrainingAdmin(e.target.checked)}
              className="role-checkbox"
            />
          </div>
          <p></p>
          <Row>
            <Col>
              <div className="college-section">
                <label className="label6-ques">College Name**</label> <p></p>
                <Select
                  options={[selectedCollege]}
                  value={selectedCollege}
                  isDisabled={true}
                  styles={customStyles}
                />
              </div>
            </Col>
            <Col>
              <div className="department-section">
                <label className="label6-ques">Department**</label> <p></p>
                <Select
  options={department}
  value={
    selectedDepartments.length === department.length
      ? [department[0]] // Display "All"
      : selectedDepartments
  }
  isMulti
  styles={customStyles}
  onChange={(selected) => {
    if (selected.some((item) => item.value === "all")) {
      // Select all except "All"
      setSelectedDepartments(department.filter((d) => d.value !== "all"));
    } else {
      setSelectedDepartments(selected);
    }
  }}
  placeholder="Select department"
  closeMenuOnSelect={false}
/>



              </div>
            </Col>
            <Col>
  <div className="department-section">
    <label className="label6-ques">Year**</label> <p></p>
    <Select
  options={years}
  value={
    selectedYears.length === years.length - 1
      ? [years[0]] // Display "All"
      : selectedYears
  }
  isMulti
  styles={customStyles}
  onChange={(selected) => {
    if (selected.some((item) => item.value === "all")) {
      // Select all except "All"
      setSelectedYears(years.filter((y) => y.value !== "all"));
    } else {
      setSelectedYears(selected);
    }
  }}
  placeholder="Select year"
  closeMenuOnSelect={false}
/>

  </div>
</Col>
          </Row>
          <p></p>
          <Row>
         

          </Row>

          <p></p>
          <div className="button-container">
            <button
              className="button-ques-save-master"
              onClick={handleAddAnnouncement}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PAnnouncement;
