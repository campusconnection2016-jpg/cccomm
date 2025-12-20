// AttendCommunication.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { getActiveAudioTestsApi, getActiveTestsDetailsApi,updateTestcadidateApi_teststarted,
  updateTestcadidateApi_is_active, } from "../../../api/endpoints";
import "../../../styles/students.css";

const AttendCommunication = ({ username, disableSidebar, enableSidebar }) => {
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState(null); // currently selected test
  const [selectedTest, setSelectedTest] = useState(null); // store full test object
  const navigate = useNavigate();
 const [salutation, setSalutation] = useState("");
  useEffect(() => {
     const now = new Date();
     const indianTime = new Date(
       now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
     );
     const hours = indianTime.getHours();
 
     let greeting = "";
     if (hours < 12) {
       greeting = "Good Morning";
     } else if (hours < 17) {
       greeting = "Good Afternoon";
     } else {
       greeting = "Good Evening";
     }
     setSalutation(greeting);
   }, []);
  // ✅ Fetch active audio tests
  useEffect(() => {
    if (!username) return;

    setLoading(true);
    getActiveAudioTestsApi(username)
      .then((data) => {
        if (data.status === "success" && data.tests?.length > 0) {
          setActiveTests(data.tests);
        } else {
          setActiveTests([]);
        }
      })
      .catch((error) => {
        console.error("Error loading active audio tests:", error);
        setActiveTests([]);
      })
      .finally(() => setLoading(false));
  }, [username]);

  // ✅ When Start is clicked on list page → show instruction page
  const handleViewInstructions = (test) => {
    setSelectedTestId(test.id);
    setSelectedTest(test);
  };

  // ✅ When user clicks Start on instruction page → go to test page
 
const handleGoForTest = async (test) => {
  disableSidebar && disableSidebar();

  try {
    console.log("🚀 Fetching active test details for:", test.test_name, "User:", username);
    const data = await getActiveTestsDetailsApi(test.test_name, username);
    console.log("✅ Fetched test details:", data);

    // ✅ Extract IDs
    const selectedCandidateId = data?.student_id;
    const mappingId = data?.mapping_id;

    if (!selectedCandidateId || !mappingId) {
      console.error("❌ Missing student_id or mapping_id:", data);
      alert("Unable to identify your record. Please try again or contact admin.");
      return;
    }

    console.log("🧠 Candidate ID (student_id):", selectedCandidateId);
    console.log("🧩 Mapping ID (tests_candidates_map.id):", mappingId);

    // ✅ Update backend test status before navigation
    try {
      console.log(`⏳ [mapping_id=${mappingId}] Calling updateTestcadidateApi_teststarted...`);
      const startRes = await updateTestcadidateApi_teststarted(mappingId);
      console.log("✅ Test started API Response:", startRes);

      console.log(`⏳ [mapping_id=${mappingId}] Calling updateTestcadidateApi_is_active...`);
      const activeRes = await updateTestcadidateApi_is_active(mappingId);
      console.log("✅ Active status API Response:", activeRes);

      if (
        activeRes?.status === "success" ||
        activeRes?.data?.status === "success" ||
        activeRes?.message?.toLowerCase()?.includes("activated")
      ) {
        console.log(`🟢 Successfully updated is_active = true for mapping_id ${mappingId}`);
      } else {
        console.warn("⚠️ Active status API did not return success:", activeRes);
      }
    } catch (statusErr) {
      console.error("❌ Error updating test status:", statusErr);
    }

    console.log("➡️ Proceeding to test navigation...");

    // ✅ Determine path based on audio_text (test_type_category)
    const category = data?.remarks?.trim()?.toLowerCase();
    let path = "";

    if (category === "audiomcq" || category === "audio mcq") {
      path = `/attend-audio-test/${test.test_name}`;
    } else if (category === "audiotyping" || category === "audio typing") {
      path = `/attend-audio/typing/${test.test_name}`;
    } else if (category === "pronunciation") {
      path = `/attend/audio-pronun/${test.test_name}`;
    } else {
      console.warn("⚠️ Unknown test category:", category);
      path = `/attend-audio-test/${test.test_name}`; // default fallback
    }

    console.log(`🧭 Navigating to: ${path}`);

    // ✅ Navigate with state
    navigate(path, {
      state: {
        testName: test.test_name,
        dtmStart: test.dtm_start,
        dtmEnd: test.dtm_end,
        duration: data.duration_of_test || test.duration,
        durationType: data.duration_type,
        audiotext: data.audio_text,
        questions: data.questions,
        testType: test.test_type,
        student_id: selectedCandidateId,
        mapping_id: mappingId,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching test details or updating status:", error);
    alert("Failed to start the test. Please try again later.");
  }
};


  // ✅ Format Date/Time
  const formatDateTime = (dt) => {
    if (!dt) return "N/A";
    const date = new Date(dt);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ✅ Current time check
  const currentDate = new Date();

  return (
    <div className="no-select">
      <div className="no-screenshot-overlay"></div>

      <div className="product-table-container-stu" style={{ marginLeft: "0px" }}>
        {/* ======================== TEST LIST PAGE ======================== */}
        {selectedTestId === null && (
          <>
            <div className="hai2">
             <h6 style={{ textAlign: "center" }}>
                    Hii {salutation}, You have only three chances for the test,
                    <br></br> If you skip all three test, you will be marked 0
                    and your eligibilty will go down
                  </h6>
            </div>

            <div className="hai2">
              <div className="dash-border">
                   <h5 style={{ fontWeight: "bold" }}>Upcoming Tests</h5>
                 
                {loading ? (
                  <p>Loading...</p>
                ) : activeTests.length === 0 ? (
                  <p>No active or upcoming tests available.</p>
                ) : (
                  <div className="dash-test-container">
                    <header>
                      <p style={{ width: "380px" }}>
                        <strong>Test Name</strong>
                      </p>
                      <p style={{ width: "320px", textAlign: "center" }}>
                        <strong>Start Date</strong>
                      </p>
                      <p style={{ width: "320px", textAlign: "center" }}>
                        <strong>End Date</strong>
                      </p>
                      <p>
                        <strong>Start</strong>
                      </p>
                    </header>

                    {activeTests.map((test) => {
                      const dtmStart = new Date(test.dtm_start);
                      const dtmEnd = new Date(test.dtm_end);

                      const isButtonActive =
                        currentDate >= dtmStart && currentDate <= dtmEnd;

                      return (
                        <div key={test.id} className="dash-test-item">
                          <p style={{ width: "380px" }}>{test.test_name}</p>
                          <p style={{ width: "320px", textAlign: "center" }}>
                            {formatDateTime(test.dtm_start)}
                          </p>
                          <p style={{ width: "320px", textAlign: "center" }}>
                            {formatDateTime(test.dtm_end)}
                          </p>
                          <p>
                            <button
                              style={{
                                backgroundColor: isButtonActive
                                  ? "#F1A128"
                                  : "#ccc",
                                padding: "10px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isButtonActive
                                  ? "pointer"
                                  : "not-allowed",
                              }}
                              onClick={
                                isButtonActive
                                  ? () => handleViewInstructions(test)
                                  : null
                              }
                              disabled={!isButtonActive}
                            >
                              <FaArrowRight style={{ color: "black" }} />
                            </button>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================== INSTRUCTIONS PAGE ======================== */}
        {selectedTestId !== null && selectedTest && (
          <div className="hai2">
            <div className="hai2">
              <div className="hai2">
              <h6 style={{ textAlign: "center" }}>YOU MUST BEFORE YOU GO...</h6>
            </div>
            </div>
            <br />

            <div className="hai2">
              <div className="instructions">
                {selectedTest.instruction
                  ? selectedTest.instruction
                      .split(/(?<=\.)\s/)
                      .map((inst, i) => (
                        <p key={i} className="instruction-item">
                          {i + 1}. {inst.trim()}
                        </p>
                      ))
                  : "No instructions available"}
              </div>

              <div style={{ display: "grid", placeItems: "center" }}>
                <button
                  style={{ border: "none", width: "100px" }}
                  onClick={() => handleGoForTest(selectedTest)}
                  className="ques-save"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendCommunication;
