import React, { useState, useEffect, useRef } from "react";
import { getTestsByTypeAndDifficulty_API } from "../../api/endpoints";
import { useNavigate } from "react-router-dom";
import { Heading6 } from "lucide-react";
import '../../styles/assessment.css';


// --- Styles & helpers (unchanged) ---
const tableWrapperStyle = {
  border: "1px solid #fff",        // Border instead of box-shadow
  borderRadius: "8px",              // Rounded corners
  overflow: "hidden",               // Ensures the content stays within the border
  backgroundColor: "#36404a"       // Background color
};

const containerStyle = { marginTop: "10px", userSelect: "none", paddingLeft: "24px", paddingRight: "24px" };
//const tableWrapperStyle = { boxShadow: "0 0 10px rgba(0,0,0,0.25)", borderRadius: "8px", overflow: "hidden", backgroundColor: "#36404a" };
const dropdownContainerStyle = { 
  marginBottom: "8px", display: "flex", alignItems: "center" ,gap: "0px", overflowX: "auto"  
};
const labelStyle = { marginRight: "3px", marginLeft: "0px", fontWeight: "600", color: "white", fontSize: "15px" };
const selectStyle = {padding: "6px 12px",
  fontSize: "14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  cursor: "pointer",
  backgroundColor: "#36404a",
  color: "white",
  maxWidth: "160px",    // keep within screen
  minWidth: "120px",    // still readable
  whiteSpace: "nowrap", // prevent text breaking
  textOverflow: "ellipsis", };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadStyle = { boxShadow: "0 4px 6px -2px rgba(0, 0, 0, 0.3)", position: "relative", zIndex: 1 };
const headerCellStyle = { textAlign:"center",fontWeight: "bold", padding: "12px 16px",  backgroundColor: "#36404a", color: "white", userSelect: "none", borderBottom: "1px solid rgba(255, 255, 255, 0.3)", borderTop: "1px solid rgba(255, 255, 255, 0.3)" };
const rowStyle = { padding: "12px 16px", backgroundColor: "#36404a", userSelect: "none", color: "white" };
const rowBorderStyle = { borderBottom: "1px solid #ddd" };
const noDataStyle = { padding: "20px", fontStyle: "italic", color: "white", textAlign: "center", backgroundColor: "#36404a" };

const mapCodingType = (codingType) => {
  if (codingType === "testcases coding") return true;
  if (codingType === "without testcases coding") return false;
  return false; // default false
};

const PracticeTable = ({ navState = {}, userRole }) => {
  console.log("🛠️ navState received from other page:", navState);
  console.log("print userrole", userRole)
  const navigate = useNavigate();
  const topicLower = (navState.topic || "").toLowerCase();

  // New helper to treat companyspecific like technical
  const isTechnicalOrCompanySpecific = topicLower === "technical" || topicLower === "companyspecific";

  // Use test_type from navState or default MCQ Test for non-technical topics
  const testType = isTechnicalOrCompanySpecific ? navState.test_type || "" : "MCQ Test";

  // Manage form data based on navigation
  const [formData, setFormData] = useState({
    topic: navState.topic || "",
    test_type: testType,
    sub_topic: navState.subtopic || "",    // renamed from subtopic to sub_topic to match backend param
    folder_name: navState.folder_name || "",
    is_testcase: mapCodingType(navState.codingType),
  });
  const [testTypeCategory, setTestTypeCategory] = useState("PracticeTest");


  const [effectiveTestType, setEffectiveTestType] = useState("");
  const [effectiveIsTestcase, setEffectiveIsTestcase] = useState(false);
  // Manage dropdown states
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCoding, setSelectedCoding] = useState(formData.is_testcase ? navState.codingType || "" : "");
  // Difficulty filter state
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  // Table data state
  const [testTableRows, setTestTableRows] = useState([]);
  const [loading, setLoading] = useState(false);


  // Filtered rows according to difficulty
  const [filteredRows, setFilteredRows] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Ref to track last sent params and avoid duplicate sends
  const lastSendRef = useRef(null);

  // Coding dropdown options, for easy reference and matching
  const codingDropdownOptions = [
    "MCQ Test",
    "testcases coding",
    "without testcases coding",
  ];

  // Auto select default time based on test_type
// Auto select/reset time based on topic and test_type
// Auto select/reset time based on topic, test_type, and coding dropdown
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


  // Update formData and selectedCoding when navState changes
  // Update formData and selectedCoding when navState changes
useEffect(() => {
  const isTestcaseVal = mapCodingType(navState.codingType);

  // normalize for safer comparisons
  const navTopicLower = (navState.topic || "").toLowerCase();
  const navSubtopicLower = (navState.subtopic || "").toLowerCase();

  // Special-case: if CompanySpecific + Aptitude and navState.test_type is empty,
  // auto-fill test_type as "MCQ Test" (but don't override explicit navState.test_type)
  let resolvedTestType;
  if (
    navTopicLower === "companyspecific" &&
    navSubtopicLower === "aptitude" &&
    !navState.test_type
  ) {
    resolvedTestType = "MCQ Test";
  } else {
    resolvedTestType = isTechnicalOrCompanySpecific ? navState.test_type || "None" : "MCQ Test";
  }

  setFormData({
    topic: navState.topic || "None",
    test_type: resolvedTestType,
    sub_topic: navState.subtopic || "None",
    folder_name: navState.folder_name || "None",
    is_testcase: isTestcaseVal,
  });

  // Ensure the dropdown (selectedCoding) shows the MCQ Test option for this special case.
  // Otherwise keep the original logic (so nothing old is removed).
  if (
    navTopicLower === "companyspecific" &&
    navSubtopicLower === "aptitude" &&
    !navState.test_type
  ) {
    setSelectedCoding("MCQ Test");
  } else if (isTechnicalOrCompanySpecific) {
    // original behavior below (keeps existing logic)
    if (navState.test_type && codingDropdownOptions.includes(navState.test_type)) {
      setSelectedCoding(navState.test_type);
    } else if (navState.codingType) {
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

  // Send API request when navigation or dropdown selections change, with validation
  useEffect(() => {
    let finalTestType = formData.test_type;
    let finalIsTestcase = formData.is_testcase;

    if (isTechnicalOrCompanySpecific) {
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

    setEffectiveTestType(finalTestType);
    setEffectiveIsTestcase(finalIsTestcase);

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
      setSelectedDifficulty("");
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
const [popupOpen, setPopupOpen] = useState(false);
const [selectedQuestions, setSelectedQuestions] = useState([]);
const [entriesPerPage, setEntriesPerPage] = useState(10);

  const sendToBackend = async (params) => {
    const { topic, test_type, sub_topic, folder_name, is_testcase, time } = params;

    // Validate inputs before sending
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
      });

      const rows = [];
     if (res && res.difficulty_level_distribution) {
  console.log("✅ difficulty_level_distribution received:", res.difficulty_level_distribution);

  Object.entries(res.difficulty_level_distribution).forEach(([diff, group]) => {
    console.log("➡️ Difficulty Level:", diff);
    console.log("📦 Group object:", group);

    group.test_groups.forEach((test, index) => {
      console.log(`📝 Test #${index + 1} (${test.test_name})`);
      console.log("   🔑 question_ids:", test.question_ids);
      console.log("   📜 question_texts:", test.question_texts);

      rows.push({
        testName: test.test_name,
        difficulty_level: diff,
        question_ids: test.question_ids,
        question_texts: test.question_texts,
      });
    });
  });
} else {
  console.warn("⚠️ No difficulty_level_distribution in response:", res);
}

      setTestTableRows(rows);
    } catch {
      setTestTableRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for clicking Assign button
  const handleAssignClick = (row) => {
    navigate("/add-test", {
      state: {
        topic: formData.topic,
        test_type: effectiveTestType,
        test_type_categories: testTypeCategory,
        sub_topic: formData.sub_topic,
        folder_name: formData.folder_name,
        is_testcase: effectiveIsTestcase,
        time: selectedTime,
        question_ids: row.question_ids,
        testName: row.testName,
        difficultyLevels,selectedDifficulty: row.difficulty_level,
      },
    });
  };

  const handleTimeChange = (e) => setSelectedTime(e.target.value);
  const handleCodingChange = (e) => setSelectedCoding(e.target.value);
  const handleDifficultyChange = (e) => setSelectedDifficulty(e.target.value);

  // Filter rows by difficulty level
  useEffect(() => {
    if (selectedDifficulty === "" || selectedDifficulty === "All") {
      setFilteredRows(testTableRows);
    } else {
      setFilteredRows(testTableRows.filter(row => row.difficulty_level === selectedDifficulty));
    }
  }, [testTableRows, selectedDifficulty]);

  // Reset current page on filteredRows change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRows]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Extract distinct difficulty levels for dropdown options (sorted for consistency)
  const difficultyLevels = Array.from(new Set(testTableRows.map(row => row.difficulty_level))).sort();
useEffect(() => {
  console.log("🎯 selectedQuestions updated:", selectedQuestions);
}, [selectedQuestions]);
const handleOpenPopup = (row) => {
  console.log("📌 Opening popup with row:", row);
  console.log("📜 Question texts inside row:", row.question_texts);

  if (Array.isArray(row.question_texts)) {
    setSelectedQuestions([...row.question_texts]); // clone array
  } else {
    setSelectedQuestions([]);
  }
  setPopupOpen(true);
};

  return (
    <div style={containerStyle}>
      <div className="container-styles">
  <div className="dropdown-containers">
    <label htmlFor="time-select" >
      Time:
    </label>

    <select
      id="time-select"
      value={selectedTime}
      onChange={handleTimeChange}
      className="dropdown-custom"
      aria-label="Select time duration"
    >
      <option value="">Select Time</option>
      <option value="15min">15min</option>
      <option value="30min">30min</option>
      <option value="45min">45min</option>
      <option value="60min">60min</option>
    </select>

    {isTechnicalOrCompanySpecific && (
      <>
        <label htmlFor="coding-select" >
          Coding:
        </label>
        <select
          id="coding-select"
          value={selectedCoding}
          style={{background:"transparent",color:"white"}}
          onChange={handleCodingChange}
          className="dropdown-custom"
          aria-label="Select coding type"
        >
          <option value="">Select Coding</option>
          <option value="MCQ Test">MCQ Test</option>
          <option value="testcases coding">testcases coding</option>
          <option value="without testcases coding">without testcases coding</option>
        </select>
      </>
    )}

    <label htmlFor="difficulty-selects" >
      Difficulty Level:
    </label>

    <select
      id="difficulty-selects"
      style={{background:"transparent",color:"white"}}
      value={selectedDifficulty}
      onChange={handleDifficultyChange}
      className="dropdown-custom"
      aria-label="Select difficulty level"
    >
      <option value="">All</option>
      {difficultyLevels.map((level) => (
        <option key={level} value={level}>
          {level}
        </option>
      ))}
    </select>

    {window.location.pathname === "/practice-question" && (
      <>
        <label htmlFor="category-select" >
          Score Display:
        </label>
        <select
          id="category-select"
          value={testTypeCategory}
          style={{background:"transparent",color:"white",marginLeft:"-9px"}}
          onChange={(e) => setTestTypeCategory(e.target.value)}
          className="dropdown-custom"
        >
          <option value="">Select Option</option>
          <option value="PracticeCollege">Display Score</option>
          <option value="PracticeTest">Not Display Score</option>
        </select>
      </>
    )}
  </div>
</div>


      <div className="po-table-responsive-t-lms">
        <table className="placement-table-t"  aria-label="Practice Questions Table">
          <thead >
            <tr>
              <th style={{textAlign:"center"}}>Test Name</th>
              <th style={{textAlign:"center"}}>Difficulty_level</th>
               {userRole === "Placement Officer" ? (
          <th style={{textAlign:"center"}} >View Questions</th>
        ) : (
          <th style={{textAlign:"center"}}>Assign</th>
        )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" >
                  Loading...
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan="3" >
                  No data available.
                </td>
              </tr>
            ) : (
              paginatedRows.map((item, index) => (
                <tr key={index} style={{ ...rowStyle, ...(index !== paginatedRows.length - 1 ? rowBorderStyle : {}) }}>
                  <td
style={{
  textAlign:"center",
  cursor: userRole === "Placement Officer" ? "default" : "pointer",
  color: userRole === "Placement Officer" ? "#fff" : "white",
  textDecoration: userRole === "Placement Officer" ? "none" : "underline"
}}
  onClick={() => {
    if (userRole !== "Placement Officer") {
      handleOpenPopup(item);
    }
  }}
>{item.testName}</td>
                  <td style={{textAlign:"center"}}>{item.difficulty_level}</td>
                 {userRole === "Placement Officer" ? (
              <td style={{textAlign:"center"}}>
                <button
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  aria-label="View Questions"
                  title="View Questions"
                  onClick={() => handleOpenPopup(item)}
                >
                  {/* Example eye icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="#f1a128"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </td>
            ) : (
              <td style={{textAlign:"center"}}>
                <button
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  aria-label="Assign"
                  title="Assign"
                  onClick={() => handleAssignClick(item)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f1a128"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </button>
              </td>
            )}
                </tr>
              ))
            )}
          </tbody>
        </table>

       
      </div><p></p>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#fff" }}>
  {/* Left side: Showing X of Y entries */}
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
  <span style={{ color: "#fff", fontWeight: 500 }}>Display</span>
  <p style={{
    margin: 0,
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#3a3a3a",
    color: "#fff",
    minWidth: "40px",
    textAlign: "center"
  }}>
    {paginatedRows.length}
  </p>
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
                    style={{ backgroundColor: "#f1a128", color: "#fff", fontWeight: 600, marginRight: 4, padding: "4px 10px", borderRadius: 4 }}
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
            <li className={`page-item${currentPage === totalPages || totalPages === 0 ? " disabled" : ""}`}>
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


        {popupOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.6)", // slightly darker backdrop
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px",
    }}
    onClick={() => setPopupOpen(false)} // close on background click
  >
    <div
      style={{
        backgroundColor: "#1e1e1e", // dark card style
        padding: "24px",
        color: "white",
        borderRadius: "12px",
        maxWidth: "700px",
        width: "100%",
        maxHeight: "80%",
        overflowY: "auto",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
        animation: "fadeIn 0.3s ease-in-out",
      }}
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      <h6 style={{ marginBottom: "16px", borderBottom: "1px solid #444", paddingBottom: "8px" }}>
        📘 Questions for Selected Test
      </h6>

      <ul style={{ paddingLeft: "20px", lineHeight: "1.6", fontSize:"14px" }}>
        {selectedQuestions.map((q, idx) => (
          <li
            key={idx}
            style={{
              marginBottom: "12px",
              background: "#2a2a2a",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #444",
            }}
          >
            <strong style={{ color: "#f1a128", marginRight: "8px" }}>
              Q{idx + 1}.
            </strong>
            {q}
          </li>
        ))}
      </ul>

      <div style={{ textAlign: "right" }}>
        <button
          onClick={() => setPopupOpen(false)}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            backgroundColor: "#f1a128",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#d48806")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#f1a128")}
        >
          Close ✖
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default PracticeTable;
