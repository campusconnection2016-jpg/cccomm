import React, { useState, useEffect } from "react";
import {
  getCandidateLogin,
  addSelectedTestAssign_API,
  getCollege_id_candidateall_API,
  getTestcandidate_LIST_Api,
  getBatchnumberClgID_API,
  getDepart_Report_dropDown_Po_API

} from "../../../api/endpoints";
import { Table } from "react-bootstrap";
import { Col, Row, Form, Button } from "react-bootstrap";
import Select from "react-select";
import { Link, useParams } from "react-router-dom";
import Nextarrow from "../../../assets/images/nextarrow.png";
import back from "../../../assets/images/backarrow.png";
import ErrorModal from '../../../components/auth/errormodal';
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

          width: '200px'
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
          width: '200px'
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

const AddDBCandidates = ({ collegeName, institute }) => {
  const [dbCan, setDbCan] = useState([]);
  const { test_name } = useParams();
  console.log("test name: ", test_name); // Ensure the id is correctly retrieved
  const [testCandidates, setTestCandidates] = useState([]);
  const [studentIds, setStudentIds] = useState([]);
  const [selectedStudentNames, setSelectedStudentNames] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [questID, setQuesID] = useState(0);
  const [dtmStart, setDtmStart] = useState("");
  const [dtmEnd, setDtmEnd] = useState("");
  const [actualTest, setActualTest] = useState("");
  const [duration, setDuration] = useState(0);
  const [rulesID, setRulesID] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dtmCreated, setDtmCreated] = useState("");
  const [needInfo, setNeedInfo] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
const [departments, setDepartments] = useState([]);


const [batches, setBatches] = useState([]);
const [selectedDepartment, setSelectedDepartment] = useState([]);
const [selectedBatch, setSelectedBatch] = useState([]);
      const years = [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
      ];
      const [selectedYear, setSelectedYear] = useState([]);

  const handleCloseError = () => {
    setShowError(false);
  };

  useEffect(() => {
    if (test_name) {
      getTestCandidates(test_name);
    }
  }, [test_name, institute]);

  useEffect(() => {
    if (studentIds.length > 0) {
      getDbCandidates();
    }
  }, [studentIds]);
useEffect(() => {
  if (institute) {
    console.log("🔍 Fetching dropdowns for institute:", institute);

    // Fetch departments
   getDepart_Report_dropDown_Po_API(institute)
  .then((data) => {
    console.log("✅ Departments API raw response:", data);

    const deptArray = data.departments || []; // <-- fix
    const deptOptions = deptArray.map((d) => ({
      label: d.department_id__department,
      value: d.department_id,
    }));

    setDepartments(deptOptions);
    console.log("📦 Department dropdown options:", deptOptions);
  })
  .catch((err) =>
    console.error("❌ Error fetching departments:", err)
  );


    getBatchnumberClgID_API(institute)
  .then((data) => {
    console.log("✅ Raw batch API response:", data);

    const batchList = data.batch_numbers || [];  // <-- fix here
    const batchOptions = batchList.map((b) => ({
      label: b,
      value: b,
    }));

    setBatches(batchOptions);
    console.log("📦 Final batch dropdown options:", batchOptions);
  })
  .catch((err) => console.error("❌ Error fetching batch numbers:", err));

  }
}, [institute]);


  const getTestCandidates = (testName) => {
    getTestcandidate_LIST_Api(testName)
      .then((data) => {
        setTestCandidates(data);
        console.log("Filtered test candidates: ", data);

        if (data.length > 0) {
          setQuesID(data[0].question_id);
          setDtmStart(data[0].dtm_start);
          setDtmEnd(data[0].dtm_end);
          setActualTest(data[0].is_actual_test);
          setDuration(data[0].duration);
          setRulesID(data[0].rules_id);
          setDtmCreated(data[0].dtm_created);
          setNeedInfo(data[0].need_candidate_info);
        }

        const stu_ids = data.map((test) => test.student_id);
        setStudentIds(stu_ids);
        console.log("test stu ids: ", stu_ids);
      })
      .catch((error) =>
        console.error("Error fetching test candidates:", error)
      );
  };
  const handleDepartmentsChange = (selected) => {
  setSelectedDepartment(selected);
};

  useEffect(() => {
  getDbCandidates();
}, [selectedDepartment, selectedBatch,selectedYear]);
const getDbCandidates = () => {
  console.log("📥 Fetching candidates with filters:");
  console.log("Selected Departments:", selectedDepartment);
  console.log("Selected Batches:", selectedBatch);
  console.log("Selected Years:", selectedYear);

  const selectedDeptIds = selectedDepartment.map((d) => d.value);
  const selectedBatchValues = selectedBatch.map((b) => b.value);
  const selectedYearValues = selectedYear.map((y) => y.value);

  getCollege_id_candidateall_API(institute)
    .then((allCandidates) => {
      const allCandidatesCollege = allCandidates.filter(
        (candidate) => candidate.college_id__college === collegeName
      );

      const filteredCandidates = allCandidatesCollege.filter((stu) => {
        const deptMatch =
          selectedDeptIds.length === 0 || selectedDeptIds.includes(stu.department_id);

        const batchMatch =
          selectedBatchValues.length === 0 || selectedBatchValues.includes(stu.batch_no);

        const yearMatch =
          selectedYearValues.length === 0 || selectedYearValues.includes(stu.year);

        return deptMatch && batchMatch && yearMatch && !studentIds.includes(stu.id);
      });

      console.log("🧪 Filtered Candidates:", filteredCandidates);

      getCandidateLogin()
        .then((logins) => {
          const validIds = filteredCandidates.map((c) => c.id);
          const filteredLogins = logins.filter(
            (login) =>
              login.college_name === collegeName &&
              validIds.includes(login.student_id)
          );

          console.log("✅ Final Login Candidates:", filteredLogins);
          setDbCan(filteredLogins);
        })
        .catch((err) => console.error("❌ Error fetching logins:", err));
    })
    .catch((err) => console.error("❌ Error fetching candidates:", err));
};


  const getDbCandidatesold = () => {
    getCollege_id_candidateall_API(institute)
      .then((allCandidates) => {
        console.log("all candidates: ", allCandidates);

        // Filter login candidates by college name before extracting IDs
        const allCandidatesCollege = allCandidates.filter(
          (candidate) => candidate.college_id__college === collegeName
        );
        console.log("allCandidatesCollege: ", allCandidatesCollege);

        // Filter candidates that are not in the test candidates and match the college ID
        const filteredCandidates = allCandidatesCollege.filter(
          (stu) => !studentIds.includes(stu.id)
        );

        console.log("Filtered candidates: ", filteredCandidates);

        // Now filter these candidates by their login information
        getCandidateLogin()
          .then((candidates) => {
            // Filter login candidates by college name before extracting IDs
            const filteredLoginCandidates = candidates.filter(
              (candidate) => candidate.college_name === collegeName
            );

            // Extract the student IDs from the filtered candidates
            const filteredCandidateIds = filteredCandidates.map(
              (stu) => stu.id
            );
            console.log("Filtered candidates id: ", filteredCandidateIds);

            // Filter login candidates based on these IDs
            const fc = filteredLoginCandidates.filter((data) =>
              filteredCandidateIds.includes(data.student_id)
            );

            // Set the state with the filtered login candidates
            setDbCan(fc);
            console.log("Filtered login candidates: ", fc);
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
    const dataToSubmit = {
      stu_id: selectedStudentNames,
      test_name: test_name,
      question_id: questID,
      dtm_start: dtmStart,
      dtm_end: dtmEnd,
      is_actual_test: actualTest,
      duration: duration,
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
        //alert('Test Assigned Successfully');
      })
      .catch((error) => console.log("Error: test not assigned.", error));
  };

  return (
    <div className="placement-container">
      <div style={{ justifyContent: "space-between", display: "flex" }}>
          <Link  to="/test/test-schedules/"
            style={{ color: "black", textDecoration: "none" }}
          ><button
          className="button-po-save"
          style={{ float: "left" }}
        >
          <img src={back} className="nextarrow"></img>{" "}
        
           
            Back
         
        </button>
       </Link>
        <button
          className="button-po-save"
          style={{}}
          type="submit"
          onClick={handleSubmit}
        >
          Add Test
        </button>
        <button
          className="button-po-save btn btn-secondary"
          disabled
          style={{
            float: "right",
            backgroundColor: "#F1A128",
            cursor: "not-allowed",
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
     
  <div>
    <div className="filter-cont-set">
<Col>
  <div className="year" controlId="Batch">
    <label className="label5-ques">Batch</label>
    <p></p>
    <Select
  isMulti
  options={batches}
  value={selectedBatch}
  onChange={(option) => setSelectedBatch(option)}
  placeholder="Select Batch"
  styles={customStyles}
/>
    </div>
    </Col>
    <Col>
  <div className="year" controlId="department">
    <label className="label5-ques">Department</label>
    <p></p>
    
<Select
  isMulti
  options={departments}
  value={selectedDepartment}
  onChange={(option) => setSelectedDepartment(option)}
  placeholder="Select Department"
  styles={customStyles}
/>
    </div>
    </Col>


<Col>
  <div className="year" controlId="year">
    <label className="label5-ques">Year</label>
    <p></p>
   <Select
  isMulti
  options={years}
  value={selectedYear}
  onChange={setSelectedYear}
  placeholder="Select year"
  styles={customStyles}
/>

  </div>
</Col>



</div>
 <input
    className="po-search-box"
    type="text"
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
   
  />

  </div>
      <div  className="po-table-responsive-add-candidates" style={{ paddingTop: "20px" }}>
        <table className="placement-table">
          <thead>
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
          <tbody >
            {dbCan.filter(
      (can) =>
        can.user_name.toLowerCase().includes(search.toLowerCase()) ||
        can.student_name.toLowerCase().includes(search.toLowerCase()) ||
        can.password.toLowerCase().includes(search.toLowerCase())
    ).map((can) => (
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
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default AddDBCandidates;
