import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAudioTestTypesApi,
  getAudioCategoryQuestionsApi,
  getCandidateDetails_API,
  logAudioTestStartApi,
} from "../../api/endpoints";

import {
  FaMicrophoneAlt,
  FaHeadphonesAlt,
  FaVolumeUp,
  FaWaveSquare,
  FaPlayCircle,
} from "react-icons/fa";

const AudioAccess = ({
  username,
  collegeName,
  institute,
  communication_category,
}) => {
  console.log(" received aa", institute, collegeName, username, communication_category);

  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [testTypeId, setTestTypeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [candidateDetails, setCandidateDetails] = useState({
    student_id: null,
    college_id: null,
    department_id: null,
    year: null,
  });

  // ================= Candidate Details =================
  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        const res = await getCandidateDetails_API();
        const candidates = res?.data || [];

        const matchedCandidate = candidates.find(
          (c) => c.user_name === username
        );

        if (matchedCandidate) {
          const details = {
            student_id: matchedCandidate.id,
            college_id: matchedCandidate.college_id,
            department_id: matchedCandidate.department_id,
            year: matchedCandidate.year,
          };

          setCandidateDetails(details);
          console.log("🎓 Candidate Details:", details);
        }
      } catch (error) {
        console.error("❌ Candidate fetch error:", error);
      }
    };

    if (username) fetchCandidateDetails();
  }, [username]);

  // ================= Fetch Categories =================
  useEffect(() => {
    const fetchAudioTests = async () => {
      try {
        const response = await getAudioTestTypesApi();
        if (response.status === "success") {
          const uniqueCategories = [
            ...new Set(response.data.map((i) => i.test_type_categories)),
          ];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("❌ Category fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioTests();
  }, []);

  // ================= Category Click =================
  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    setQuestionPapers([]);

    try {
      const testTypeResponse = await getAudioTestTypesApi();
      const match = testTypeResponse.data.find(
        (i) => i.test_type_categories === category
      );
      if (match) setTestTypeId(match.id);

      const res = await getAudioCategoryQuestionsApi(
        category,
        communication_category
      );

      console.log("📥 Question Papers:", res?.data);

      if (res.status === "success") {
        setQuestionPapers(res.data);
      }
    } catch (err) {
      console.error("❌ Question fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= Back =================
  const handleBack = () => {
    setSelectedCategory(null);
    setQuestionPapers([]);
    setTestTypeId(null);
  };

  // ================= Start Test =================
  const handleStartTest = async (paper) => {
    const confirmStart = window.confirm("Are you ready to start test?");
    if (!confirmStart) return;

    const payload = {
      test_type_id: testTypeId,
      question_paper_id: paper.id,
      question_paper_name: paper.question_paper_name,
      test_type: selectedCategory,
      topic: paper.topic || "",
      sub_topic: paper.sub_topic || "",
      student_id: candidateDetails.student_id,
      college_id: candidateDetails.college_id,
      department_id: candidateDetails.department_id,
      year: candidateDetails.year,
    };

    console.log("📘 Start Payload:", payload);

    try {
      const response = await logAudioTestStartApi(payload);
      const { candidates_map_id, test_name, test_type_category } =
        response.data;

      navigate("/test/practice-communication/", {
        state: {
          candidates_map_id,
          test_name,
          payload,
          test_type_category,
          sub_topic: paper.sub_topic,
        },
      });
    } catch (err) {
      console.error("❌ Start test error:", err);
    }
  };

  // ================= Icon Mapper (DO NOT REMOVE) =================
  const getAudioIcon = (index) => {
    const icons = [
      <FaMicrophoneAlt size={50} color="#F1A128" />,
      <FaHeadphonesAlt size={50} color="#F1A128" />,
      <FaVolumeUp size={50} color="#F1A128" />,
      <FaWaveSquare size={50} color="#F1A128" />,
    ];
    return icons[index % icons.length];
  };

  return (
    <div style={{ padding: "30px", marginTop: "1px" }}>
      {/* ================= CATEGORY UI (UNCHANGED) ================= */}
      {!selectedCategory && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "40px",
          }}
        >
          {loading ? (
            <p>Loading...</p>
          ) : (
            categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  width: "180px",
                  height: "180px",
                  background: "transparent",
                  border: "2px solid grey",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {getAudioIcon(index)}
                <h6 style={{ color: "#fff", marginTop: "10px" }}>{cat}</h6>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= TABLE VIEW ================= */}
    {selectedCategory && (
  <>
    <button
      onClick={handleBack}
      style={{
        marginBottom: "20px",
        background: "#F1A128",
        color: "#fff",
        border: "none",
        padding: "8px 14px",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      ← Back
    </button>

    <div
      style={{
        width: "80%",
        margin: "0 auto",
      }}
    >
      <h4
        style={{
          color: "#F1A128",
          marginBottom: "15px",
          textAlign: "left",
        }}
      >
        {selectedCategory} – Question Papers
      </h4>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : questionPapers.length === 0 ? (
        <p style={{ textAlign: "center" }}>No question papers found.</p>
      ) : (
        /* ✅ VERTICAL SCROLL WRAPPER */
        <div
          style={{
            maxHeight: "360px",   // ≈ 8 table rows
            overflowY: "auto",    // vertical scroll
            
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#fff",
            }}
          >
            <thead>
              <tr style={{ background: "#222" }}>
                <th style={thStyle}>Question Paper</th>
                <th style={thStyle}>Difficulty Level</th>
                <th
                  style={{
                    ...thStyle,
                    textAlign: "center",
                    width: "120px",
                  }}
                >
                  Start
                </th>
              </tr>
            </thead>

            <tbody>
              {questionPapers.map((paper) => (
                <tr
                  key={paper.id}
                  style={{ borderBottom: "1px solid #444" }}
                >
                  <td style={tdStyle}>
                    {paper.question_paper_name}
                  </td>
                  <td style={tdStyle}>
                    {paper.difficulty_level || "N/A"}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      left: "30px",
                    }}
                  >
                    <FaPlayCircle
                      size={26}
                      color="#F1A128"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleStartTest(paper)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>
)}


      
    </div>
  );
};

// ================= Styles =================
const thStyle = {
  padding: "12px",
  borderBottom: "2px solid #555",
  textAlign: "left",
};

const tdStyle = {
  padding: "6px",
};

export default AudioAccess;
