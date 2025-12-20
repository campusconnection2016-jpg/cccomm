import React, { useState, useEffect } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import {
  getCandidateLogin,
  getCollege_id_candidateall_API,
  addSelectedTestAssign_API,
  getTestcandidate_LIST_Api,
  getdepartmentApi,
  getcollegeApi,
  getBatchNumbersByCollege,
  getTestcandidateReports_candidates_Api,
  get_Active_Test_Reassign_API,
  Test_Reassign_API
} from "../../../api/endpoints";
import { Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Nextarrow from "../../../assets/images/nextarrow.png";
import back from "../../../assets/images/backarrow.png";
import ErrorModal from "../../auth/errormodal";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import CustomOption from "../customoption";


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

const AddDBCandidates = () => {
  const [dbCan, setDbCan] = useState([]);
  const { test_name ,college_id} = useParams();
  console.log("test name: ", test_name); // Ensure the id is correctly retrieved
  const [testCandidates, setTestCandidates] = useState([]);
  const [studentIds, setStudentIds] = useState([]);
  const [selectedStudentNames, setSelectedStudentNames] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [questID, setQuesID] = useState(0);
  const [dtmCreated, setDtmCreated] = useState("");
  const [dtmStart, setDtmStart] = useState("");
  const [dtmStart1, setDtmStart1] = useState("")
  const [dtmEnd, setDtmEnd] = useState("");
  const [dtmEnd1, setDtmEnd1] = useState("");
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
 
  const [selectedIsDb, setSelectedIsDb] = useState(null);
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);


  const [testType, setTestType] = useState("Add Test");
  const [testCandidatesRe, setTestCandidatesRe] = useState([]);
  const [isSelectAllCheckedRe, setIsSelectAllCheckedRe] = useState(false);
  const [selectedStudentNamesRe, setSelectedStudentNamesRe] = useState([]);
  
      const years = [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
      ];
      const [selectedYear, setSelectedYear] = useState([]);

  const handleTestTypeChange = (selectedOption) => {
    setTestType(selectedOption.value);
  };

  const handleCloseError = () => {
    setShowError(false);
  };


  const fetchBatchNumbers = (collegeId, isDatabase) => {
    if (collegeId && isDatabase !== null) {
      getBatchNumbersByCollege(collegeId, isDatabase)
        .then((data) => {
          setBatchNumbers(
            data.batch_numbers.map((batch) => ({ value: batch, label: batch }))
          );
        })
        .catch((err) => {
          console.error("Error fetching batch numbers:", err);
        });
    }
  };



  const handleIsDbChange = (selectedOption) => {
    setSelectedIsDb(selectedOption);
    setSelectedBatch(null); // Reset batch_no when Db/Non-Db changes
    fetchBatchNumbers(selectedCollege?.value, selectedOption.value);
  };

  useEffect(() => {
    if (test_name) {
      getTestCandidates(test_name, college_id);
    }
    // Check if there are student IDs and selected college
    if (studentIds.length > 0 && selectedCollege) {
      getDbCandidates(
        selectedCollege.value,
        selectedDepartments.map((opt) => opt.value),
        // departments
  selectedBatch, // this should be the Select object
  selectedIsDb,
  selectedYear?.map((yr) => yr.value)

      );
    }
  }, [test_name, selectedCollege,selectedBatch,college_id]); // Added selectedCollege and selectedDepartments

  const handleCollegeChange = (selectedOption) => {
    setSelectedCollege(selectedOption); // Ensure this sets the selected college correctly
    if (selectedOption && selectedOption.value) {
      getDbCandidates(selectedOption.value); // Call with the valid selected option
    }

    setSelectedBatch(null); // Reset batch_no when college changes
    fetchBatchNumbers(selectedOption.value, selectedIsDb?.value);
  };

  const getTestCandidates = (testName,college_id) => {
    getTestcandidate_LIST_Api(testName,college_id)
      .then((data) => {
        setTestCandidates(data);
        console.log("Filtered test candidates: ", data);

        console.log('NeedInfo: ', data[0].need_candidate_info)

        if (data.length > 0) {
          const firstCandidate = data[0];
          setQuesID(firstCandidate.question_id);
          setDtmStart(firstCandidate.dtm_start);
          setDtmEnd(firstCandidate.dtm_end);
          setDtmStart1(firstCandidate.dtm_start1);
          setDtmEnd1(firstCandidate.dtm_end1);
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

  const getDbCandidates = (selectedCollegeId, selectedDepartmentIds, batchno, isdbs, selectedYearIDs = []) => {
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
          console.log('IS Database: ', isdbs);
          console.log(
            "Department Match:",
            selectedDepartmentIds.length === 0 ||
            selectedDepartmentIds.includes(stu.department_id)
          );

          // Base filters
          let filterData =
            stu.college_id === selectedCollegeId && // Mandatory college match
            !studentIds.includes(stu.id); // Exclude already included students

          // Conditional filters
          if (isdbs) {
            filterData = filterData && stu.is_database === isdbs.value;
          }

          if (batchno && batchno.value != null) {
            filterData = filterData && String(stu.batch_no) === String(batchno.value);
          }
          
          console.log('stu.id type:', typeof stu.id);
          console.log('studentIds:', studentIds);
          
          if (selectedDepartmentIds.length > 0) {
            filterData = filterData && selectedDepartmentIds.includes(stu.department_id);
          }
          

          if (selectedYearIDs.length > 0) {
            filterData = filterData && selectedYearIDs.includes(stu.year);
          }

          return filterData;
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
    if (selectedCollege || selectedDepartments.length > 0|| selectedYear.length > 0) {
      getDbCandidates(
        selectedCollege.value,
        selectedDepartments.map((opt) => opt.value),
        selectedBatch,
        selectedIsDb,
        selectedYear.map((opt) => opt.value)
      );
    }
  }, [selectedCollege, selectedDepartments, selectedBatch, selectedIsDb, selectedYear]);

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
      dtm_start1: dtmStart1,
      dtm_end1: dtmEnd1,
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


  const filteredCandidates = dbCan.filter((candidate) =>
    searchQuery === "" ||
    (candidate.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
    (candidate.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) || "")
  );


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAssign = () => {
    console.log('Re-Assign Test....');

    if (isSubmitting) return;

    setIsSubmitting(true);
    const dataToSubmit = {
      stu_id: selectedStudentNamesRe,
      test_name: test_name,
    };

    console.log("Data to submit: ", dataToSubmit);

    Test_Reassign_API(dataToSubmit)
      .then(() => {
        console.log("Test Re-Assigned Successfully");
        setErrorMessage("Test Re-Assigned Successfully");
        setShowError(true);
        navigate("/test/test-schedules/");
        setIsSubmitting(false);
        //alert('Test Assigned Successfully');
      })
      .catch((error) => console.log("Error: test not assigned.", error));
  };


  const getTestCandidatesRe = () => {
    get_Active_Test_Reassign_API(test_name)
      .then(data => {
        setTestCandidatesRe(data);
        console.log("filter", data)
      })
      .catch(error => console.error('Error fetching test candidates:', error));
  };


  useEffect(() => {
    if (testType === 'Re-Assign Test') {
      getTestCandidatesRe();
    }
  }, [testType]);


  const handleSelectAllRe = (e) => {
    const isChecked = e.target.checked;
    setIsSelectAllCheckedRe(isChecked);

    if (isChecked) {
      const allStudentNamesRe = testCandidatesRe.map((can) => can.user_name);
      setSelectedStudentNamesRe(allStudentNamesRe);
      console.log("Select Students name Re..: ", allStudentNamesRe);
    } else {
      setSelectedStudentNamesRe([]);
    }
  };


  const handleCheckboxChangeRe = (e, studentName) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelectedStudentNamesRe((prev) => [...prev, studentName]);
      console.log("studentName: ", studentName);
    } else {
      setSelectedStudentNamesRe((prev) =>
        prev.filter((name) => name !== studentName)
      );
    }
  };

  return (
    <div className="placement-container" style={{height:"auto !important"}} >

      <div className='add-t' >
        <Select
          options={[
            { value: "Add Test", label: "Add Test" },
            { value: "Re-Assign Test", label: "Re-Assign Test" },
          ]}
          value={{ value: testType, label: testType }}
          onChange={handleTestTypeChange}
          placeholder="Select Test Type"
          styles={customStyles}
        />
      </div>

      <div style={{ justifyContent: "space-between", display: "flex" }}>
        <Link
          to="/test/test-schedules/"
          style={{ color: "black", textDecoration: "none" }}
        > <button
          className="button-ques-save"
          style={{ float: "left", width: "100px" }}
        >
            <img src={back} className="nextarrow"></img>{" "}

            Back

          </button></Link>

        {/* Conditional Buttons for Test Type */}
        {testType === "Add Test" ? (
          <button
            className="button-ques-save"
            disabled={isSubmitting}
            type="submit"
            onClick={handleSubmit}
          >
            Add Test
          </button>
        ) : (
          <button
            className="button-ques-save"
            disabled={isSubmitting}
            type="submit"
            onClick={handleAssign}
          >
            Assign Test
          </button>
        )}

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
      {testType === "Add Test" ? (
        <div>
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
                <label className="label5-ques">Db/Non-Db</label>
                <p></p>
                <Select
                  options={[
                    { value: true, label: "Db" },
                    { value: false, label: "Non-Db" },
                  ]}
                  value={selectedIsDb}
                  placeholder="Select Db/Non-Db"
                  styles={customStyles}
                  onChange={handleIsDbChange}
                />
              </div>
            </Col>


            <Col>
              <div>
                <label className="label5-ques">Batch Number</label>
                <p></p>
                <Select
                  options={batchNumbers}
                  value={selectedBatch}
                  placeholder="Select Batch Number"
                  styles={customStyles}
                  onChange={(selectedOption) => {
                    console.log("Selected Batch Number:", selectedOption);
                    setSelectedBatch(selectedOption);
                  }}
                 
                />
              </div>
            </Col>
          </Row>
          <p></p>

          <Row>

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

            <Col >
              <div className='year' controlId="year" >
                <label className='label5-ques' >Year</label><p></p>
                <Select
                  isMulti
                  className='years-mcq'
                  options={years}
                  value={selectedYear}
                  onChange={setSelectedYear}
                  placeholder="Select year"

                  styles={customStyles}
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
                  className="search-box1-adddb"
                  style={{
                    backgroundColor: "#39444e",
                    border: "0.5px solid #fff",
                    padding: "8px 12px",
                    borderRadius: "5px",
                   
                    color: "#fff",
                    
                    fontWeight: "bold",
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <div style={{ paddingTop: "20px" }}>
          <div className="po-table-responsive-t-a">
                     <table className="placement-table-t">
     <thead >
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
        </div>
      ) : (
        <>


          <div style={{ paddingTop: "20px" }}>
          <div className="po-table-responsive-t-rea">
                     <table className="placement-table-t">

                <thead >
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={isSelectAllCheckedRe}
                        onChange={handleSelectAllRe}
                      />
                    </th>
                    <th>Login ID</th>
                    <th>Name</th>
                    <th>Password</th>
                  </tr>
                </thead>
                <tbody >
                  {testCandidatesRe.map((can) => (
                    <tr key={can.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudentNamesRe.includes(can.user_name)}
                          onChange={(e) => handleCheckboxChangeRe(e, can.user_name)}
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
        </>
      )}
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default AddDBCandidates;
