import React, { useState, useEffect } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import {
  getCandidateLogin,
  getCollege_id_candidateall_API,
  addSelectedTestAssign_API,
  getTestcandidate_LIST_Api,
  getdepartmentApi,
  getcollegeApi,
} from "../../../api/endpoints";
import { Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Nextarrow from "../../../assets/images/nextarrow.png";
import back from "../../../assets/images/backarrow.png";
import ErrorModal from "../../../components/auth/errormodal";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import CustomOption from "../customoption";

const customStyles = {
  container: (provided) => ({
    ...provided,
    width: "90%", // Set the width of the dropdown container
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      width: "70%", // Adjust the width for mobile
    },
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#39444e",

    color: "#fff", // Text color
    borderColor: state.isFocused ? "" : "#ffff", // Border color on focus
    boxShadow: "none", // Remove box shadow

    "&:hover": {
      borderColor: state.isFocused ? "#ffff" : "#ffff", // Border color on hover
    },
    "&.css-1a1jibm-control": {
      // Additional styles for the specific class
    },
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      fontSize: "12px", // Smaller font size

      width: "80%",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#ffff", // Text color for selected value
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      fontSize: "12px", // Smaller font size
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#39444e"
      : state.isFocused
      ? "#39444e"
      : "#39444e",
    color: "#ffff", // Text color

    "&:hover": {
      backgroundColor: "#39444e", // Background color on hover
      color: "#ffff", // Text color on hover
    },
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      fontSize: "12px", // Smaller font size
      width: "80%",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#39444e",
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      fontSize: "12px", // Smaller font size
    },
  }),
};

const AddDBCandidates = () => {
  const [dbCan, setDbCan] = useState([]);
  const { test_name } = useParams();
  console.log("test name: ", test_name); // Ensure the id is correctly retrieved
  const [testCandidates, setTestCandidates] = useState([]);
  const [studentIds, setStudentIds] = useState([]);
  const [selectedStudentNames, setSelectedStudentNames] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [questID, setQuesID] = useState(0);
  const [dtmCreated, setDtmCreated] = useState("");
  const [dtmStart, setDtmStart] = useState("");
  const [dtmEnd, setDtmEnd] = useState("");
  const [actualTest, setActualTest] = useState("");
  const [duration, setDuration] = useState(0);
  const [durationType, setDurationType] = useState("");
  const [rulesID, setRulesID] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needInfo, setNeedInfo] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [collegeDropdownDisabled, setCollegeDropdownDisabled] = useState(false);
  const [uniqueClgs, setUniqueClgs] = useState([]);

  const handleCloseError = () => {
    setShowError(false);
  };

  useEffect(() => {
    if (test_name) {
      getTestCandidates(test_name);
    }
    // Check if there are student IDs and selected college
    if (studentIds.length > 0 && selectedCollege) {
      getDbCandidates(
        selectedCollege.value,
        selectedDepartments.map((opt) => opt.value)
      );
    }
  }, [test_name, selectedCollege]); // Added selectedCollege and selectedDepartments

  const handleCollegeChange = (selectedOption) => {
    setSelectedCollege(selectedOption); // Ensure this sets the selected college correctly
    if (selectedOption && selectedOption.value) {
      getDbCandidates(selectedOption.value); // Call with the valid selected option
    }
  };

  const getTestCandidates = (testName) => {
    getTestcandidate_LIST_Api(testName)
      .then((data) => {
        setTestCandidates(data);
        console.log("Filtered test candidates: ", data);

        if (data.length > 0) {
          const firstCandidate = data[0];
          setQuesID(firstCandidate.question_id);
          setDtmStart(firstCandidate.dtm_start);
          setDtmEnd(firstCandidate.dtm_end);
          setActualTest(firstCandidate.is_actual_test);
          setDuration(firstCandidate.duration);
          setDurationType(firstCandidate.duration_type);
          setRulesID(firstCandidate.rules_id);
          setDtmCreated(firstCandidate.dtm_created);
          setNeedInfo(firstCandidate.need_candidate_info);

          // Extract unique colleges from API response
          const uniqueColleges = data.reduce((acc, curr) => {
            if (!acc.find((college) => college.value === curr.college_id_id)) {
              acc.push({ value: curr.college_id_id, label: curr.college_id });
            }
            return acc;
          }, []);

          console.log("unique Colleges: ", uniqueColleges);
          setUniqueClgs(uniqueColleges);

          // Optionally set the first college as the selected one in dropdown
          // const firstCollegeId = uniqueColleges[0]?.value;
          // if (firstCollegeId) {
          //     getDbCandidates(firstCollegeId);
          // }

          // Enable the dropdown for user selection
          setCollegeDropdownDisabled(false);
        }

        const stu_ids = data.map((test) => test.student_id);
        setStudentIds(stu_ids);
        console.log("test stu ids: ", stu_ids);
      })
      .catch((error) =>
        console.error("Error fetching test candidates:", error)
      );
  };

  useEffect(() => {
    getcollegeApi()
      .then((data) => {
        setColleges(
          data.map((item) => ({ value: item.id, label: item.college }))
        );
      })
      .catch((error) => console.error("Error fetching College:", error));
  }, []);

  useEffect(() => {
    getdepartmentApi()
      .then((data) => {
        setDepartments(
          data.map((item) => ({ value: item.id, label: item.department }))
        );
      })
      .catch((error) => console.error("Error fetching Departments:", error));
  }, []);

  const handleDepartmentsChange = (selectedOptions) => {
    setSelectedDepartments(selectedOptions);

    const selectedCollegeId = selectedCollege?.value; // Single college selection
    if (selectedCollegeId) {
      getDbCandidates(
        selectedCollegeId,
        selectedOptions.map((opt) => opt.value)
      );
    }
  };

  const getDbCandidates = (selectedCollegeId, selectedDepartmentIds = []) => {
    console.log("getDbCandidates called with:", {
      selectedCollegeId,
      selectedDepartmentIds,
    });
    console.log("selectedCollegeId------------: ", selectedCollegeId);

    // Call the API with the dynamically passed collegeId
    getCollege_id_candidateall_API(selectedCollegeId)
      .then((allCandidates) => {
        console.log("allCandidates:", allCandidates);

        // Filter candidates based on selected college, departments, and excluding those already in studentIds
        const filteredCandidates = allCandidates.filter((stu) => {
          console.log("stu.id: ", stu.id);
          console.log("studentIds: ", studentIds);
          console.log("College Match:", stu.college_id === selectedCollegeId);
          console.log(
            "Department Match:",
            selectedDepartmentIds.length === 0 ||
              selectedDepartmentIds.includes(stu.department_id)
          );

          return (
            !studentIds.includes(stu.id) && // Ensure only candidates not in studentIds are included
            stu.college_id === selectedCollegeId && // Match with selected college
            (selectedDepartmentIds.length === 0 ||
              selectedDepartmentIds.includes(stu.department_id)) // Check departments
          );
        });

        console.log("filteredCandidates:", filteredCandidates);

        // Fetch login information for filtered candidates
        getCandidateLogin()
          .then((candidates) => {
            console.log("candidates:", candidates);

            // Get IDs of filtered candidates
            const filteredCandidateIds = filteredCandidates.map(
              (stu) => stu.id
            );
            console.log("filteredCandidateIds:", filteredCandidateIds);

            // Filter login candidates by matching student IDs with filtered candidate IDs
            const filteredLoginCandidates = candidates.filter((data) =>
              filteredCandidateIds.includes(data.student_id)
            );

            console.log("filteredLoginCandidates:", filteredLoginCandidates);

            // Update the dbCan state with filtered login candidates
            setDbCan(filteredLoginCandidates);
          })
          .catch((error) =>
            console.error("Error fetching candidate login:", error)
          );
      })
      .catch((error) => console.error("Error fetching db candidates:", error));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setIsSelectAllChecked(isChecked);

    if (isChecked) {
      const allStudentNames = dbCan.map((can) => can.student_id);
      setSelectedStudentNames(allStudentNames);
      console.log("setSelectedStudentNames: ", allStudentNames);
    } else {
      setSelectedStudentNames([]);
    }
  };

  useEffect(() => {
    if (selectedCollege && selectedDepartments.length > 0) {
      getDbCandidates(
        selectedCollege.value,
        selectedDepartments.map((opt) => opt.value)
      );
    }
  }, [selectedCollege, selectedDepartments]);

  const handleCheckboxChange = (e, studentName) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelectedStudentNames((prev) => [...prev, studentName]);
      console.log("studentName: ", studentName);
    } else {
      setSelectedStudentNames((prev) =>
        prev.filter((name) => name !== studentName)
      );
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const dataToSubmit = {
      stu_id: selectedStudentNames,
      test_name: test_name,
      question_id: questID,
      dtm_start: dtmStart,
      dtm_end: dtmEnd,
      is_actual_test: actualTest,
      duration: duration,
      duration_type: durationType,
      rules_id: rulesID,
      dtm_created: dtmCreated,
      need_candidate_info: needInfo,
    };

    console.log("Data to submit: ", dataToSubmit);

    addSelectedTestAssign_API(dataToSubmit)
      .then(() => {
        console.log("Test Assigned Successfully");
        setErrorMessage("Test Assigned Successfully");
        setShowError(true);
        navigate("/test/test-schedules/");
        setIsSubmitting(false);
        //alert('Test Assigned Successfully');
      })
      .catch((error) => console.log("Error: test not assigned.", error));
  };

  // search
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCandidates = dbCan.filter(
    (candidate) =>
      searchQuery === "" ||
      candidate.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="form-ques">
      <div style={{ justifyContent: "space-between", display: "flex" }}>
        <button
          className="button-ques-save"
          style={{ float: "left", width: "100px" }}
        >
          <img src={back} className="nextarrow"></img>{" "}
          <Link
            to="/test/test-schedules/"
            style={{ color: "black", textDecoration: "none" }}
          >
            Back
          </Link>
        </button>
        <button
          className="button-ques-save"
          disabled={isSubmitting}
          style={{}}
          type="submit"
          onClick={handleSubmit}
        >
          Add Test
        </button>
        <button
          className="button-ques-save btn btn-secondary"
          disabled
          style={{
            float: "right",
            width: "100px",
            backgroundColor: "#F1A128",
            cursor: "not-allowed",
            width: "100px",
            color: "black",
            height: "50px",
          }}
        >
          Next{" "}
          <img
            src={Nextarrow}
            className="nextarrow"
            style={{ color: "#6E6D6C" }}
          ></img>
        </button>
      </div>
      <br />
      <Row>
        <Col>
          <div controlId="instituteName">
            <label className="label5-ques">College Name</label>
            <p></p>

            <Select
              options={uniqueClgs} // List of unique colleges
              value={selectedCollege} // Single selected college
              placeholder="Select College"
              className="opt"
              styles={customStyles}
              isDisabled={collegeDropdownDisabled} // Make the dropdown read-only if necessary
              onChange={handleCollegeChange} // Use the updated handler
            />
          </div>
        </Col>

        <Col>
          <div>
            <label className="label5-ques">Department</label>
            <p></p>
            <Select
              isMulti
              options={departments}
              value={selectedDepartments}
              onChange={handleDepartmentsChange}
              styles={customStyles}
              components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
              className="opt"
            />
          </div>
        </Col>
        <Col className="search-option" style={{ marginTop: "-10px" }}>
          <Form.Group controlId="globalSearch">
            <Form.Label className="label5-ques">Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name, login ID, or college"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
              style={{
                backgroundColor: "#39444e",
                border: "0.5px solid #fff",
                padding: "8px 12px",
                borderRadius: "5px",
                width: "100%",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            />
          </Form.Group>
        </Col>
      </Row>

      <div style={{ paddingTop: "20px" }}>
        <div className="table-responsive-addstu">
          <table className="product-table-result">
            <thead className="table-thead-candidate">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isSelectAllChecked}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Login ID</th>
                <th>Name</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody className="table-tbody-candidate">
              {filteredCandidates.map((can) => (
                <tr key={can.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStudentNames.includes(can.student_id)}
                      onChange={(e) => handleCheckboxChange(e, can.student_id)}
                    />
                  </td>
                  <td>{can.user_name}</td>
                  <td>{can.student_name}</td>
                  <td>{can.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default AddDBCandidates;
