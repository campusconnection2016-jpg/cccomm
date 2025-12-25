import React, { useState, useEffect, useRef } from "react";
import {
  getTestsByTypeAndDifficulty_API,
  getCandidateDetails_API,
  sendAssignData_API,
  getStudentTestAttemptsAPI,
  updateTestStatus_API,
  requestAssignPermission_API, filterCompanyTest_API, getStudentId_API,
} from "../../api/endpoints";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import '../../styles/practicetable.css';


// ✅ Bind modal root element once
Modal.setAppElement("#root");
const tableWrapperStyle = {
  border: "1px solid #fff",        // Border instead of box-shadow
  borderRadius: "8px",              // Rounded corners
  overflow: "hidden",               // Ensures the content stays within the border
  backgroundColor: "#36404a"       // Background color
};

const containerStyle = { marginTop: "10px", userSelect: "none", paddingLeft: "24px", paddingRight: "24px" };

const dropdownContainerStyle = {
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
};
const labelStyle = {
  marginRight: "8px",
  marginLeft: "20px",
  fontWeight: "600",
  color: "white",
  fontSize: "20px",
};
const selectStyle = {
  padding: "6px 12px",
  fontSize: "14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  cursor: "pointer",
  backgroundColor: "#36404a",
  color: "white",
};
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadStyle = {
  boxShadow: "0 4px 6px -2px rgba(0, 0, 0, 0.3)",
  position: "relative",
  zIndex: 1,
};
const headerCellStyle = {
  fontWeight: "bold",
  padding: "12px 16px",
  textAlign: "left",
  backgroundColor: "#36404a",
  color: "white",
  userSelect: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
};
const rowStyle = { padding: "12px 16px", backgroundColor: "#36404a", userSelect: "none", color: "white" };
const rowBorderStyle = { borderBottom: "1px solid #ddd" };
const noDataStyle = {
  padding: "20px",
  fontStyle: "italic",
  color: "white",
  textAlign: "center",
  backgroundColor: "#36404a",
};

const mapCodingType = (codingType) => {
  if (codingType === "testcases coding") return true;
  if (codingType === "without testcases coding") return false;
  return false;
};

const PracticeTable = ({ navState = {}, username }) => {
  console.log("navstate received", navState)
  const navigate = useNavigate();
  const topicLower = (navState.topic || "").toLowerCase();
  const [resolvedTestType, setResolvedTestType] = useState(null);
  const testType = (topicLower === "technical" || topicLower === "companyspecific") ? navState.test_type || "" : "MCQ Test";
  const [studentId, setStudentId] = useState(null);

  const [companyTestData, setCompanyTestData] = useState([]);
  const [acceptedCompanyTests, setAcceptedCompanyTests] = useState(new Set());

  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  const [formData, setFormData] = useState({
    topic: navState.topic || "",
    test_type: testType,
    sub_topic: navState.subtopic || "",
    folder_name: navState.folder_name || "",
    is_testcase: mapCodingType(navState.codingType),
  });

  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCoding, setSelectedCoding] = useState(() => {
    if (topicLower === "technical" || topicLower === "companyspecific"
    ) return "";
    if (navState.test_type === "MCQ Test") return "MCQ Test";
    if (
      navState.codingType === "testcases coding" ||
      navState.codingType === "without testcases coding"
    )
      return navState.codingType;
    return "";
  });

  const [testTableRows, setTestTableRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const lastSendRef = useRef(null);

  const [candidateDetails, setCandidateDetails] = useState({
    student_id: null,
    college_id: null,
    department_id: null,
    year: null,
  });


  useEffect(() => {
    // Reset time whenever topic changes
    setSelectedTime("");

    // Priority 1: coding dropdown (if selected)
    if (selectedCoding === "MCQ Test") {
      setSelectedTime("30min");
    } else if (
      selectedCoding === "testcases coding" ||
      selectedCoding === "without testcases coding"
    ) {
      setSelectedTime("30min");
    }
    // Priority 2: fallback to test_type if coding not set
    else if (formData.test_type === "MCQ Test") {
      setSelectedTime("30min");
    } else if (formData.test_type === "Coding Test") {
      setSelectedTime("30min");
    }
  }, [formData.topic, formData.test_type, selectedCoding]);



  // Fetch candidate details on username change
  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        const res = await getCandidateDetails_API();
        const candidates = res?.data || [];
        const matchedCandidate = candidates.find((c) => c.user_name === username);
        if (matchedCandidate) {
          setCandidateDetails({
            student_id: matchedCandidate.id,
            college_id: matchedCandidate.college_id,
            department_id: matchedCandidate.department_id,
            year: matchedCandidate.year,
          });
        } else {
          setCandidateDetails({ student_id: null, college_id: null, department_id: null, year: null });
        }
      } catch (error) {
        console.error("Error fetching candidate details:", error);
        setCandidateDetails({ student_id: null, college_id: null, department_id: null, year: null });
      }
    };

    if (username) {
      fetchCandidateDetails();
    }
  }, [username]);

  // Update formData and selectedCoding based on navState changes (including test_type)
  useEffect(() => {
    const isTestcaseVal = mapCodingType(navState.codingType);

    setFormData({
      topic: navState.topic || "None",
      test_type:
        topicLower === "technical" || topicLower === "companyspecific"
          ? navState.test_type || "None"
          : "MCQ Test",
      sub_topic: navState.subtopic || "None",
      folder_name: navState.folder_name || "None",
      is_testcase: isTestcaseVal,
    });

    if (topicLower === "technical" || topicLower === "companyspecific") {
      // 🆕 Special case: CompanySpecific + Aptitude → default MCQ Test
      if (navState.topic === "CompanySpecific" && navState.subtopic === "Aptitude") {
        setSelectedCoding("MCQ Test");
        setFormData((prev) => ({ ...prev, test_type: "MCQ Test" }));
      } else if (navState.test_type === "MCQ Test") {
        setSelectedCoding("MCQ Test");
      } else if (
        navState.codingType === "testcases coding" ||
        navState.codingType === "without testcases coding"
      ) {
        setSelectedCoding(navState.codingType);
      } else {
        setSelectedCoding("");
      }
    } else {
      setSelectedCoding("");
    }
  }, [
    navState.topic,
    navState.subtopic,
    navState.folder_name,
    navState.codingType,
    navState.test_type,
    topicLower,
  ]);

  const isSameParams = (a, b) => {
    if (!a || !b) return false;
    return (
      a.topic === b.topic &&
      a.test_type === b.test_type &&
      a.sub_topic === b.sub_topic &&
      a.folder_name === b.folder_name &&
      a.is_testcase === b.is_testcase &&
      a.time === b.time
    );
  };


  useEffect(() => {
    let finalTestType = formData.test_type;
    let finalIsTestcase = formData.is_testcase;

    if (topicLower === "technical" || topicLower === "companyspecific") {
      if (!selectedCoding || !selectedTime) return;
      if (selectedCoding === "MCQ Test") {
        finalTestType = "MCQ Test";
        finalIsTestcase = false;
      } else if (
        selectedCoding === "testcases coding" ||
        selectedCoding === "without testcases coding"
      ) {
        finalTestType = "Coding Test";
        finalIsTestcase = selectedCoding === "testcases coding";
      }
    } else {
      if (!selectedTime) return;
      finalTestType = "MCQ Test";
      finalIsTestcase = false;
    }

    const paramsToSend = {
      topic: formData.topic,
      test_type: finalTestType,
      sub_topic: formData.sub_topic,
      folder_name: formData.folder_name,
      is_testcase: finalIsTestcase,
      time: selectedTime,
    };

    if (!isSameParams(lastSendRef.current, paramsToSend)) {
      lastSendRef.current = paramsToSend;
      sendToBackend(paramsToSend);
    }
  }, [
    formData.topic,
    formData.test_type,
    formData.sub_topic,
    formData.folder_name,
    formData.is_testcase,
    selectedCoding,
    selectedTime,
    topicLower,
  ]);

  const sendToBackend = async (params) => {
    const { topic, test_type, sub_topic, folder_name, is_testcase, time } = params;

    if (!topic || !test_type || !time) {
      setTestTableRows([]);
      return;
    }

    setLoading(true);
    try {
      const res = await getTestsByTypeAndDifficulty_API({
        topic,
        test_type,
        sub_topic,
        folder_name,
        is_testcase,
        time: parseInt(time.replace("min", ""), 10),
        student_id: candidateDetails.student_id,
      });

      const rows = [];
      if (res && res.difficulty_level_distribution) {
        Object.entries(res.difficulty_level_distribution).forEach(([diff, group]) => {
          group.test_groups.forEach((test) => {
            rows.push({
              testName: test.test_name,
              difficulty_level: diff,
              question_ids: test.question_ids,
              // question_texts: test.question_texts, 
            });
          });
        });
      }

      setTestTableRows(rows);
    } catch {
      setTestTableRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = async (row) => {
    let finalTestType = formData.test_type;
    let finalIsTestcase = formData.is_testcase;

    if (topicLower === "technical" || topicLower === "companyspecific") {
      if (!selectedCoding || !selectedTime) {
        alert("Please select both coding type and time before assigning.");
        return;
      }

      if (selectedCoding === "MCQ Test") {
        finalTestType = "MCQ Test";
        finalIsTestcase = false;
      } else if (
        selectedCoding === "testcases coding" ||
        selectedCoding === "without testcases coding"
      ) {
        finalTestType = "Coding Test";
        finalIsTestcase = selectedCoding === "testcases coding";
      }
    } else {
      if (!selectedTime) {
        alert("Please select time before assigning.");
        return;
      }
      finalTestType = "MCQ Test";
      finalIsTestcase = false;
    }

    const assignData = {
      topic: formData.topic,
      test_type: finalTestType,
      sub_topic: formData.sub_topic,
      folder_name: formData.folder_name,
      is_testcase: finalIsTestcase,
      time: selectedTime,
      test_name: row.testName,
      difficulty_level: row.difficulty_level,
      question_ids: row.question_ids,
      student_id: candidateDetails.student_id,
      college_id: candidateDetails.college_id,
      department_id: candidateDetails.department_id,
      year: candidateDetails.year,
    };

    try {
      const res = await sendAssignData_API(assignData);

      const { test_name, tests_candidates_map_id } = res.data;

      // ✅ Store in localStorage
      localStorage.setItem("tcm_id", tests_candidates_map_id);
      localStorage.setItem("test_name", test_name);

      // alert(`Test "${test_name}" assigned with ID: ${tests_candidates_map_id}`);

      // ✅ Navigate based on test type
      if (finalTestType === "MCQ Test") {
        console.log("➡️ Navigating to practice MCQ");
        navigate("/test/practice-mcq/", {
          state: {
            tcm_id: tests_candidates_map_id,
            test_name: test_name,
          },
        });
      } else {
        console.log("➡️ Navigating to practice Code");
        navigate("/test/practice-code/", {
          state: {
            tcm_id: tests_candidates_map_id,
            test_name: test_name,
          },
        });
      }

    } catch (error) {
      console.error("Failed to send assign data:", error);
      alert("Failed to assign test. Please try again.");
    }
  };

  // After the useEffect where candidateDetails is set:
  const [testAttempts, setTestAttempts] = useState([]);
  const normalizeName = (name) =>
    name ? name.trim().toLowerCase() : "";

  useEffect(() => {
    if (username) {
      const fetchStudentData = async () => {
        try {
          const res = await getStudentId_API(username);
          if (res?.student_id) {
            const sid = res.student_id;
            setStudentId(sid);

            // 1️⃣ Fetch attempts
            const attemptData = await getStudentTestAttemptsAPI(sid);
            setTestAttempts(attemptData.attempts || []);

            const companyTestRes = await filterCompanyTest_API(sid);

            const namesSet = new Set(
              (companyTestRes.data || [])
                .map((item) => normalizeName(item.test_name)) // ✅ normalize
            );

            console.log("📋 Accepted company tests set:", namesSet);

            setAcceptedCompanyTests(namesSet);
          }
        } catch (err) {
          console.error("Error fetching student data:", err);
        }
      };

      fetchStudentData();
    }
  }, [username]);

  useEffect(() => {
    if (candidateDetails.student_id) {
      const fetchStudentAttempts = async () => {
        try {
          const attemptData = await getStudentTestAttemptsAPI(candidateDetails.student_id);
          console.log("Fetched attempts:", attemptData.attempts);
          setTestAttempts(attemptData.attempts || []);
        } catch (err) {
          console.error("Error fetching test attempts:", err);
        }
      };
      fetchStudentAttempts();
    }
  }, [candidateDetails.student_id]);


  const findAttemptData = (testName) => {
    console.log("🔍 Searching attempt data for testName:", testName);

    const normalizedTestName = normalizeName(testName);
    console.log("🔍 Searching attempt data for testName:", normalizedTestName);

    const match = testAttempts.find(
      (attempt) => normalizeName(attempt.test_name) === normalizedTestName
    );

    if (match) {
      console.log("✅ Match found:", match);
    } else {
      console.log("❌ No match found for testName:", normalizedTestName);
    }
    const attempt_count = match?.attempt_count ?? 0;
    const stu_avg_mark = match?.stu_avg_mark ?? 0;
    const is_active = match?.is_active ?? false;

    console.log("📊 Final Attempt Data →", {
      attempt_count,
      stu_avg_mark,
      is_active,
    });

    return {
      attempt_count,
      stu_avg_mark,
      is_active,
    };
  };


  const canStartTest = (item) => {
    const nameToCheck = normalizeName(item.testName || item.test_name);
    console.log("🟢 Checking test:", nameToCheck);

    const attemptData = findAttemptData(nameToCheck);
    console.log("📌 Found attemptData:", attemptData);

    // 1️⃣ Disable if already active
    if (attemptData.is_active) {
      console.log("❌ Test is already active → disabling");
      return false;
    }

    // 2️⃣ Company-specific check
    console.log("🔍 topicLower:", topicLower);
    if (topicLower === "") {
      console.log("📋 acceptedCompanyTests set:", acceptedCompanyTests);
      const isAccepted = acceptedCompanyTests.has(nameToCheck);
      console.log(`🔎 Comparing → "${nameToCheck}" with set → ${isAccepted}`);
      return isAccepted;
    }

    // 3️⃣ Default allow
    console.log("✅ Topic not companyspecific → enabling");
    return true;
  };
  const handleTimeChange = (e) => setSelectedTime(e.target.value);
  const handleCodingChange = (e) => setSelectedCoding(e.target.value);
  const difficultyLevels = Array.from(new Set(testTableRows.map(row => row.difficulty_level))).sort();

  useEffect(() => {
    setCurrentPage(1);
  }, [testTableRows]);

  const filteredRows = selectedDifficulty
    ? testTableRows.filter(row => row.difficulty_level === selectedDifficulty)
    : testTableRows;

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRequestReassignClick = async (row) => {
    try {
      const payload = {
        test_name: row.testName,    // Use the current row's test name
        student_id: candidateDetails.student_id,
        status: "Requested",
      };

      console.log("📤 Reassign request payload:", payload);

      await updateTestStatus_API(payload);

      alert("Test Reassign Request sent");
    } catch (err) {
      console.error("❌ Reassign failed:", err);
      alert("You cannot request a reassignment before attempting the test.");
    }
  };

  const handleAskPermission = async (row) => {
    try {
      const { testName } = row;
      const { student_id } = candidateDetails;

      if (!student_id || !testName) {
        alert("Missing student ID or test name.");
        return;
      }

      const confirmed = window.confirm(`Request permission for test "${testName}"?`);

      if (!confirmed) return;

      const payload = {
        student_id,
        test_name: testName,
      };

      const response = await requestAssignPermission_API(payload); // ⬅️ Your backend API function

      if (response?.data?.message) {
        alert(response.data.message);
      } else {
        alert("Permission request submitted.");
      }

    } catch (error) {
      console.error("❌ Failed to request permission:", error);
      alert("Failed to request permission. Please try again.");
    }
  };

  return (
    <div className="practice-page-wrapper" style={containerStyle}>
      <div className="dropdown-container" style={dropdownContainerStyle}>
        <label htmlFor="time-select" style={labelStyle}>Time:</label>
        <select
          id="time-select"
          value={selectedTime}
          onChange={handleTimeChange}
          style={selectStyle}
          aria-label="Select time duration"
        >
          <option value="">Select Time</option>
          <option value="15min">15min</option>
          <option value="30min">30min</option>
          <option value="45min">45min</option>
          <option value="60min">60min</option>
        </select>



        {(topicLower === "technical" || topicLower === "companyspecific") && (
          <>
            <label htmlFor="coding-select" style={{ ...labelStyle, marginLeft: "20px" }}>Coding:</label>
            <select
              id="coding-select"
              value={selectedCoding}
              onChange={handleCodingChange}
              style={selectStyle}
              aria-label="Select coding type"
            >
              <option value="">Select Coding</option>
              <option value="MCQ Test">MCQ Test</option>
              <option value="testcases coding">testcases coding</option>
              <option value="without testcases coding">without testcases coding</option>
            </select>
          </>
        )}

        <label htmlFor="difficulty-select" style={labelStyle}>Difficulty:</label>
        <select
          id="difficulty-select"
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          style={selectStyle}
          aria-label="Select difficulty level"
        >
          <option value="">All</option>
          {difficultyLevels.map((level, idx) => (
            <option key={idx} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="table-scroll-wrapper" style={tableWrapperStyle}>
        <table style={tableStyle} aria-label="Practice Questions Table">
          <thead style={theadStyle}>
            <tr>
              <th style={headerCellStyle}>Test Name</th>
              <th style={headerCellStyle}>Difficulty_level</th>
              <th style={{ ...headerCellStyle, textAlign: "center" }}>Start Test</th>
              {/* {topicLower === "companyspecific" && (
      <th style={{ ...headerCellStyle, textAlign: "center" }}>Request for Assign test</th>
    )} */}
              <th style={{ ...headerCellStyle, textAlign: "center" }}>Attempts</th>
              <th style={{ ...headerCellStyle, textAlign: "center" }}>Avg mark</th>
              <th style={{ ...headerCellStyle, textAlign: "center" }}>Request for Reassign</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={noDataStyle}>
                  Loading...
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan="6" style={noDataStyle}>
                  No data available.
                </td>
              </tr>
            ) : (
              paginatedRows.map((item, index) => {
                const attemptData = findAttemptData(item.testName);
                return (
                  <tr
                    key={index}
                    style={{ ...rowStyle, ...(index !== paginatedRows.length - 1 ? rowBorderStyle : {}) }}
                  >
                    <td  >{item.testName}</td>
                    <td>{item.difficulty_level}</td>


                    <td style={{ textAlign: "center" }}>
                      <button
                        style={{
                          backgroundColor: "orange",
                          border: "none",
                          cursor: canStartTest(item) ? "pointer" : "not-allowed",
                          borderRadius: "6px",
                          padding: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: canStartTest(item) ? 1 : 0.5,
                        }}
                        aria-label="Start Test"
                        title={
                          canStartTest(item)
                            ? "Start Test - Enabled"
                            : topicLower === ""
                              ? "Test not accepted yet"
                              : "Already Active - Disabled"
                        }
                        onClick={() => canStartTest(item) && handleAssignClick(item)}
                        disabled={!canStartTest(item)}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#000000"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="4" y1="12" x2="20" y2="12" />
                          <polyline points="14 6 20 12 14 18" />
                        </svg>
                      </button>
                    </td>


                    {topicLower === "" && (
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => handleAskPermission(item)}
                          title="Ask Permission to Attend"
                          aria-label="Ask Permission"
                          style={{
                            backgroundColor: "orange",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "6px",
                            padding: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#000000"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M7 17L17 7" />
                            <path d="M8 7h9v9" />
                          </svg>
                        </button>
                      </td>
                    )}


                    <td style={{ textAlign: "center" }}>{attemptData.attempt_count}</td>
                    <td style={{ textAlign: "center" }}>{attemptData.stu_avg_mark}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleRequestReassignClick(item)}
                        title="Request for Reassign"
                        aria-label="Request for Reassign"
                        style={{
                          backgroundColor: "orange",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "6px",
                          padding: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* Arrow bottom-left to top-right */}
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#000000"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M7 17L17 7" />
                          <path d="M8 7h9v9" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

      </div>
      <div>
        {totalPages > 1 && (
          <ul
            className="pagination-custom pagination"
            style={{ display: "flex", justifyContent: "flex-end", margin: "16px 0 0 0", padding: 0, listStyle: "none" }}
          >
            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  border: "none",
                  background: "none",
                  color: "#fff",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  marginRight: 4,
                  padding: "4px 10px",
                  borderRadius: 4,
                  backgroundColor: "#3a3a3a",
                }}
              >
                ‹<span className="visually-hidden">Previous</span>
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, idx) => (
              <li key={idx + 1} className={`page-item${currentPage === idx + 1 ? " active" : ""}`}>
                {currentPage === idx + 1 ? (
                  <span
                    className="page-link"
                    style={{
                      backgroundColor: "#f1a128",
                      color: "#fff",
                      fontWeight: 600,
                      marginRight: 4,
                      padding: "4px 10px",
                      borderRadius: 4,
                    }}
                  >
                    {idx + 1}
                    <span className="visually-hidden">(current)</span>
                  </span>
                ) : (
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(idx + 1)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#fff",
                      cursor: "pointer",
                      marginRight: 4,
                      padding: "4px 10px",
                      borderRadius: 4,
                      backgroundColor: "#3a3a3a",
                    }}
                  >
                    {idx + 1}
                  </button>
                )}
              </li>
            ))}
            <li
              className={`page-item${currentPage === totalPages || totalPages === 0 ? " disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  border: "none",
                  background: "none",
                  color: "#fff",
                  cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
                  marginRight: 0,
                  padding: "4px 10px",
                  borderRadius: 4,
                  backgroundColor: "#3a3a3a",
                }}
              >
                ›<span className="visually-hidden">Next</span>
              </button>
            </li>
          </ul>
        )}
      </div>

    </div>
  );
};

export default PracticeTable;
