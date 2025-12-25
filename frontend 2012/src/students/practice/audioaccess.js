import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAudioTestTypesApi,
  getAudioCategoryQuestionsApi,
  getCandidateDetails_API ,logAudioTestStartApi ,
} from "../../api/endpoints";
import {
  FaMicrophoneAlt,
  FaHeadphonesAlt,
  FaVolumeUp,
  FaWaveSquare,
} from "react-icons/fa";

const AudioAccess = ({ username, collegeName, institute }) => {
  
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

  useEffect(() => {
  console.log("📌 AudioAccess props received:");
  console.log("👤 username:", username);
  console.log("🏫 collegeName:", collegeName);
  console.log("🏢 institute:", institute);
}, [username, collegeName, institute]);

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

        // ✅ CONSOLE ONLY
        console.log("🎓 Candidate Details:", details);
      } else {
        setCandidateDetails({
          student_id: null,
          college_id: null,
          department_id: null,
          year: null,
        });

        console.warn("⚠️ No candidate matched for username:", username);
      }
    } catch (error) {
      console.error("❌ Error fetching candidate details:", error);
      setCandidateDetails({
        student_id: null,
        college_id: null,
        department_id: null,
        year: null,
      });
    }
  };

  if (username) {
    fetchCandidateDetails();
  }
}, [username]);


  // === Fetch Audio Test Categories ===
  useEffect(() => {
    const fetchAudioTests = async () => {
      try {
        const response = await getAudioTestTypesApi();
        if (response.status === "success" && Array.isArray(response.data)) {
          const uniqueCategories = [
            ...new Set(response.data.map((item) => item.test_type_categories)),
          ];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("❌ Error fetching audio tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioTests();
  }, []);

  // === Fetch question papers for selected category ===
  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    setQuestionPapers([]);

    try {
      const testTypeResponse = await getAudioTestTypesApi();
      if (testTypeResponse.status === "success") {
        const match = testTypeResponse.data.find(
          (item) => item.test_type_categories === category
        );
        if (match) setTestTypeId(match.id);
      }

      const res = await getAudioCategoryQuestionsApi(category);
      if (res.status === "success") {
        setQuestionPapers(res.data);
      }
    } catch (err) {
      console.error("❌ Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // === Back to Category List ===
  const handleBack = () => {
    setSelectedCategory(null);
    setQuestionPapers([]);
    setTestTypeId(null);
  };

  // === Audio Icon Mapper ===
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
    <div className="test-access-page" style={{ padding: "30px", marginTop:"70px", textAlign: "center" }}>
  
      {/* ---------- CATEGORY LIST ---------- */}
      {!selectedCategory && (
        <div
          className="category-container"
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "40px",
          }}
        >
          {loading ? (
            <p>Loading...</p>
          ) : categories.length === 0 ? (
            <p>No audio test categories found.</p>
          ) : (
            categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(cat)}
               style={{
  width: "180px",
  height: "180px",
  background: "transparent",
  border: "2px solid grey",       // ✅ Corrected border
  borderRadius: "10px",           // ✅ Rounded corners only
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",    // ✅ Smooth hover animation
}}

onMouseOut={(e) => {
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.border = "2px solid grey";
  e.currentTarget.style.transform = "scale(1)";
}}

               
              >
                {getAudioIcon(index)}
                <h6 style={{ color: "#fff", marginTop: "10px" }}>{cat}</h6>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---------- QUESTION PAPER LIST ---------- */}
      {selectedCategory && (
        <div >
          <button
            onClick={handleBack}
            style={{
              background: "#F1A128",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "8px 12px",
              cursor: "pointer",
              marginBottom: "15px",
            }}
          >
            ← Back
          </button>

          <h5 style={{ color: "#F1A128", marginBottom: "20px" }}>
            {selectedCategory} - Question Papers
          </h5>

          {loading ? (
            <p>Loading questions...</p>
          ) : questionPapers.length === 0 ? (
            <p>No question papers found for this category.</p>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "25px",
              }}
            >
              {questionPapers.map((paper) => (
                <div
                  key={paper.id}


       onClick={async () => {
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

  try {
  const response = await logAudioTestStartApi(payload);
 
const { candidates_map_id, test_name, test_type_category } = response.data; // ✅ destructure here

  navigate("/test/practice-communication/", { state: { candidates_map_id, test_name, payload,test_type_category } });
  console.log("✅ Test start logged:", response.data);
} catch (err) {
  console.error("❌ Failed to log test start:", err);
}
}}


                   style={{
  width: "180px",
  height: "180px",
  background: "transparent",
  border: "2px solid grey",       // ✅ Corrected border
  borderRadius: "10px",           // ✅ Rounded corners only
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",    // ✅ Smooth hover animation
}}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1.0)")
                  }
                >
                  <h5>
                     {paper.sub_topic || "N/A"}
                  </h5>
                   <p style={{
    color: "#F1A128",
    textAlign: "center",
    maxWidth: "160px",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "normal",
    lineHeight: "1.3",
    margin: "8px 5px 0",
  }}>{paper.question_paper_name}</p>
                 
                  
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioAccess;
