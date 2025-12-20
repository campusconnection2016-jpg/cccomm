import React,{useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CombinedReviewSection from "./renderreview";
const TestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
const [showReview, setShowReview] = useState(false);

  const {
    totalMarks,
    countMarks,
    minsTaken,
    secTaken,
    questionsWrong,
    questions,
    answers_db,
    username,
    testName,
  } = location.state || {};
console.log("Fetched values from location.state:", {
  totalMarks,
  countMarks,
  minsTaken,
  secTaken,
  questionsWrong,
  questions,
  answers_db,
  username,
  testName,
});
  const handleFinish = () => {
    navigate("/dashboard"); // or any page you want
  };
// Convert answers_db object into an array of its values
console.log("🔍 Raw answers_db:", answers_db);
console.log("📌 Type of answers_db:", typeof answers_db);
console.log("📌 IsArray:", Array.isArray(answers_db));

const answersArray = Object.values(answers_db || {});
console.log("📌 Converted answersArray:", answersArray);
const answersMap = answersArray.reduce((acc, curr) => {
  console.log("🛠️ Building answersMap from item:", curr);

  // Use question_text as the unique key
  const key = curr.question_text;
  acc[key] = {
    submitted: curr.submitted_answer,
    correct: curr.correct_answer,
    explanation: curr.explain_answer, 
  };

  return acc;
}, {});


  return (
    <>
      <div className="dash-border">
        <h6 style={{ textAlign: "center" }}>Here You Go...</h6>
      </div>
      <br />
      <div
        className="mcq-border"
        style={{
          padding: "10px",
          border: "1px solid white",
          width: "100%",
          boxSizing: "border-box",
          boxShadow: "0 8px 16px 0 rgba(0, 0, 0, 0.2)",
        }}
      >
        <h4 style={{ textAlign: "center" }}>Scores</h4>
        <br />
        <p style={{ color: "#DDFB35" }}>
          Your Total Marks: {totalMarks}
        </p>
        <p>{questionsWrong} Questions are wrong</p>
        <p>
          You completed the test in {minsTaken} minutes and {secTaken} seconds
        </p>
 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
  {/* Left: Review Button */}
  <div>
    <button
      className="button-ques-save"
      onClick={() => setShowReview(!showReview)}
    >
      {showReview ? "Review" : "Review"}
    </button>
  </div>

  {/* Right: Finish Button */}
  <div>
    <button onClick={handleFinish} className="button-ques-save">
      Finish
    </button>
  </div>
</div>

      </div>
{showReview && (
  <CombinedReviewSection questions={questions} answers={answersMap} />
)}

      <br />

      {/* ✅ Always show the review section */}
     {/*} <CombinedReviewSection questions={questions} answers={answers_db} />*/}
    </>
  );
};

export default TestResultPage;
