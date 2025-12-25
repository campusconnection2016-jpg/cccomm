// PracticeCommunication.js
import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import {
  getActiveAudioTestsApi, getActiveTestsDetailsApi, updateTestcadidateApi_teststarted,
  updateTestcadidateApi_is_active,getSkillTypeByTestNameApi ,
} from "../../api/endpoints";
import "../../styles/students.css";

const PracticeCommunication = ({ username, disableSidebar, enableSidebar }) => {
  const [activeTests, setActiveTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState(null); // currently selected test
  const [selectedTest, setSelectedTest] = useState(null); // store full test object
  const navigate = useNavigate();
  
  const [salutation, setSalutation] = useState("");
const [skillType, setSkillType] = useState(null);

 const location = useLocation(); // ✅ Access passed state
  const passedData = location.state || {}; // safe fallback

  const { candidates_map_id, test_name, payload, test_type_category } = passedData;
  console.log("📌 Passed Data:", passedData);
 


useEffect(() => {
  if (!selectedTest?.test_name) return;
  getSkillTypeByTestNameApi(selectedTest.test_name)
    .then((res) => {
      console.log("✅ Skill Type:", res.skill_type);
      setSkillType(res.skill_type);   // ⭐ STORE HERE
    })
    .catch((err) => {
      console.error("❌ Skill type fetch failed:", err);
    });
}, [selectedTest]);


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

  useEffect(() => {
  if (candidates_map_id && test_name) {
    console.log("🟢 Auto-selecting assigned test");

    setSelectedTestId(candidates_map_id);

    setSelectedTest({
      id: candidates_map_id,
      test_name: test_name,
      test_type: test_type_category,
      instruction: payload?.instruction || "Please read the instructions carefully.",
      dtm_start: payload?.dtm_start,
      dtm_end: payload?.dtm_end,
      duration: payload?.duration,
    });
  }
}, [candidates_map_id, test_name]);

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
      console.log("📌 Received Test Category from backend (remarks):", data?.remarks);
      console.log("📌 Normalized Category used for routing:", category);
      let path = "";

      if (category === "audiomcq" || category === "audio mcq") {
        path = `/attend-audio-test/${test.test_name}`;
      } else if (category === "audiotyping" || category === "audio typing") {
        path = `/attend-audio/typing/${test.test_name}`;
      }

      else if (category === "typingblank" || category === "typingblank") {
        path = `/attend-fill-blank-test/${test.test_name}`;
      }
      else if (category === "multi_audiotyping" || category === "multi language audiotyping") {
        path = `/attend-audio/typing/${test.test_name}`;


      } else if (category === "multi_pronunciation" || category === "multi language pronunciation") {
        path = `/attend/audio-pronun/${test.test_name}`;
      }
      else if (category === "pronunciation") {
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
           skill_type: skillType,
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

export default PracticeCommunication;
