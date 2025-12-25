import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getTestcandidate_MCQTestId_Api,
  getQuestionApi_Filter_IO_PracticeMCQ,
  updateTestAnswerApi,
getTestAnswerMapApi,
addTestAnswerMapApi_MCQ,
getStudentId_API,
updateTestcadidateApi_submitted,
getTotalScore_API,
Capture_Duration_Update_API,
updateTestcadidateApi_teststarted,
updateTestcadidateApi_is_active,
getTestAnswers_API,
incrementAttemptCount_API,
updateStuAvgMarkAPI,
updateTotalAndAvgMarksdeleteanswerApi
} from '../../api/endpoints';
import { useCallback } from 'react';
import McqTimer from '../test/tests/mcqtimer';
import ErrorModal from '../../components/auth/errormodal';
import BinaryToImages from '../test/tests/binarytoimages';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import '../../styles/students.css';
import moment from "moment";
import { useNavigate } from "react-router-dom";

const AttendOnlinePracticeTest = ({ username }) => {
  const location = useLocation();
  const tcm_id = location.state?.tcm_id;

  const [testCandidate, setTestCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTestPage, setShowTestPage] = useState(false);
 const [timeLeft, setTimeLeft] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [crtQues, setCrtQues] = useState([]);
const [processing, setProcessing] = useState(false);
const [isNextEnabled, setIsNextEnabled] = useState(false);
const [isOptionSelected, setIsOptionSelected] = useState(false);
const [optionF, setOptionF] = useState("");
const [testStartTime, setTestStartTime] = useState(new Date());
const [studentID, setstudentID] = useState(null);

const [testCompleted, setTestCompleted] = useState(false);
 const [selectedTestCandidate, setSelectedTestCandidate] = useState(null);
 const [minsTaken, setMinsTaken] = useState(0);
 const [secTaken, setSecTaken] = useState(0);
const [selectedCandidateId, setSelectedCandidateId] = useState(null);
const [totalMarks, setTotalMarks] = useState(0);
const [countMarks, setCountMarks] = useState(0);
const [errorMessage, setErrorMessage] = useState('');
const [showError, setShowError] = useState(false);
const navigate = useNavigate();
 const [answers_db, setAnswers_db] = useState({});
 const [tabSwitchCount, setTabSwitchCount] = useState(0);


// ⛔ Force Fullscreen and handle exit attempts
useEffect(() => {
  const requestFullScreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(console.error);
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen().catch(console.error);
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(console.error);
    else if (el.msRequestFullscreen) el.msRequestFullscreen().catch(console.error);
  };

  const handleFullscreenChange = () => {
    if (!testCompleted && !document.fullscreenElement) {
      requestFullScreen();
      alert("If you exit fullscreen, you cannot attend the test again.");
    }
  };

  const handleKeydown = (e) => {
    if (e.key === "Escape" && !testCompleted) {
      e.preventDefault();
      alert("If you exit fullscreen, you cannot attend the test again.");
    }
  };

  requestFullScreen();
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("keydown", handleKeydown);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("keydown", handleKeydown);
  };
}, [testCompleted]);

// ⚡ Detect Tab Switch
useEffect(() => {
  if (!showTestPage) return; // ✅ Only activate after Start clicked

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden" && !testCompleted) {
      setTabSwitchCount((prev) => {
        const newCount = prev + 1;
        if (newCount <= 3) {
          alert(`Warning: You switched tabs ${newCount} time(s). ${3 - newCount} chances left.`);
        } else {
          alert("You exceeded allowed tab switches. The test will now end.");
          setTestCompleted(true);
          navigate("/test/Testschedule");
        }
        return newCount;
      });
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [showTestPage, testCompleted, navigate]);


 const testName = testCandidate?.test_name;
useEffect(() => {
  if (tcm_id) {
    setSelectedCandidateId(tcm_id);
  }
}, [tcm_id]); 

useEffect(() => {
  console.log("🟡 useEffect triggered. Username:", username);

  if (username) {
    const fetchstudentID = async () => {
      console.log("🔄 Fetching student ID for:", username);

      try {
        const res = await getStudentId_API(username);
        console.log("✅ Student ID fetched successfully:", res);

       if (res && res.student_id) {
          setstudentID(res.student_id);  // ✅ Correct assignment
          console.log("📌 studentID set in state:", res.student_id);
        }
          
         else {
          console.warn("⚠️ API returned no 'id' in response:", res);
        }
      } catch (err) {
        console.error("❌ Failed to load student ID:", err);
      }
    };

    fetchstudentID();
  } else {
    console.warn("⚠️ Username is not defined.");
  }
}, [username]);

  useEffect(() => {
    if (!tcm_id) {
      setError("No test candidate ID found.");
      setLoading(false);
      return;
    }
  console.log("testdetails",tcm_id,testName)
    const fetchTestDetails = async () => {
      try {
        const response = await getTestcandidate_MCQTestId_Api(tcm_id);
        setTestCandidate(response);
        console.log("✅ Loaded test details for tcm_id:", response);
      } catch (err) {
        console.error("❌ Failed to load test details:", err);
        setError("Failed to load test details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [tcm_id]);



  const handleGoForTest = async () => {
  try {
   const testName = testCandidate?.test_name;

    if (!testName) {
      alert("Test name not found!");
      return;
    }
    const response = await getQuestionApi_Filter_IO_PracticeMCQ(testName);
    console.log("✅ Questions loaded:", response);
    await updateTestcadidateApi_teststarted(selectedCandidateId);
    await updateTestcadidateApi_is_active(selectedCandidateId);
    await incrementAttemptCount_API({ test_name: testName, student_id: studentID });

   
    if (Array.isArray(response) && response.length > 0) {
      setQuestions(response);
      setShowTestPage(true);
    } else {
      alert("No questions found for this test.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch questions:", error);
    alert("Error fetching questions. Try again.");
  }
};

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  useEffect(() => {
  const currentAnswer = answers[questions[currentQuestionIndex]?.id];
  setIsOptionSelected(!!currentAnswer);
  setIsNextEnabled(!!currentAnswer);
}, [currentQuestionIndex, questions, answers]);

 const handleTestCompletionTimer = (e) => {
    if (e) e.preventDefault();
    handleSubmitTimer(e); // Assume handleSubmit is defined elsewhere
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
    setTestCompleted(true);
  };

const renderTimer = () => {
  if (!testCandidate) return null;

  if (testCandidate.duration_type === "QuestionTime") {
    const remainingTime = testCandidate.duration * 60;
    return (
      <McqTimer
        duration={remainingTime <= 0 ? 0 : remainingTime}
        setTimeLeftCallback={setTimeLeft}
        handleTestCompletionTimer={handleTestCompletionTimer}
      />
    );
  }

  return null;
};


  const handleSubmitTimer = useCallback(
    (e) => {
      if (e) e.preventDefault();
      setProcessing(true);

      // Capture the current time when the user submits the test
      const endTime = new Date();

      // Calculate the time taken in seconds
      const timeTakenInSeconds = Math.floor((endTime - testStartTime) / 1000);

      // Convert the time taken to minutes and seconds
      const minutesTaken = Math.floor(timeTakenInSeconds / 60);
      setMinsTaken(minutesTaken);
      const secondsTaken = timeTakenInSeconds % 60;
      setSecTaken(secondsTaken);

      // Display the time taken
      console.log(
        `Time taken: ${minutesTaken} minutes and ${secondsTaken} seconds`
      );

      const totalTiming = `${minutesTaken} min ${secondsTaken} sec`;

      Capture_Duration_Update_API(selectedCandidateId, totalTiming)
        .then((data) => {
          if (data.status === "success") {
            console.log(`Duration updated: ${data.capture_duration}`);
          }
        })
        .catch((error) => {
          console.error("Error updating duration:", error);
        });

      getTotalScore_API(selectedCandidateId)
        .then((data) => {
          if (data && data.total_score !== undefined) {
            setTotalMarks(data.total_score);
            setErrorMessage("Submitted Successfully");
         

            setTestCompleted(true);
          } else {
            throw new Error("Invalid response data");
          }
        })
        .catch((error) => {
          console.error("Failed to submit", error);
          setErrorMessage("Not Submitted");
          setShowError(true);
        })
        .finally(() => {
          setProcessing(false);
        });

      // Optionally update test candidate status if required
      updateTestcadidateApi_submitted(selectedCandidateId);
    },
    [
      testStartTime,
      testName,
      studentID,
      answers,
      questions,
      totalMarks,
      countMarks,
      selectedCandidateId,
    ]
  );

  
    const renderQuestionButtons = () => {
      const buttonStyle = {
        width: "40px", // Set the fixed width
        height: "40px", // Set the fixed height
        borderRadius: "50%",
        margin: "5px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "double",
        borderColor: "gray",
      };

      const buttons = [];
      for (let i = 0; i < questions.length; i++) {

        //const isCompleted = !!answers[questions[i].id]; // Check if the question is answered
        const isCompleted = !!answers[questions[i].id]; // Check if the question is answered
        const isActive = currentQuestionIndex === i; // Check if the question is active

        // Determine background color based on completion and active status
        const backgroundColor = isActive
          ? "#F1A128" // Active question color
          : isCompleted
            ? "#F1A128"
            : "grey";

        // Button is disabled if an option hasn't been selected or if the question is not completed.
        const isButtonDisabled =
          !isOptionSelected ||
          !isNextEnabled ||
          (currentQuestionIndex !== i && !isCompleted);

        buttons.push(
          <button
            key={i}
            style={{ ...buttonStyle, backgroundColor }}
            onClick={() => setCurrentQuestionIndex(i)}
            disabled={processing}
          // variant={currentQuestionIndex === i ? 'rgb(253, 121, 13)' : (isCompleted ? 'success' : 'secondary')}
          // variant={variant}
          >
            {i + 1}
          </button>
        );
      }

      // Create rows with 4 buttons each
      const rows = [];
      for (let i = 0; i < buttons.length; i += 5) {
        rows.push(
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            {buttons.slice(i, i + 5)}
          </div>
        );
      }

      return rows;
    };
const handleOptionSelect = (selectedOptionLabel) => {
  const questionId = questions[currentQuestionIndex].id;
  const updatedAnswers = { ...answers, [questionId]: selectedOptionLabel };
  setAnswers(updatedAnswers);
  setOptionF(selectedOptionLabel);
  setProcessing(true);
  setIsOptionSelected(true);

  const correctQuestion = questions.find((q) => q.id === questionId);
  const matchingQuestion = correctQuestion.answer === selectedOptionLabel;

  // Update correct questions tracking
  if (matchingQuestion) {
    if (!crtQues.includes(questionId)) {
      setCrtQues((prev) => [...prev, questionId]);
    }
  } else {
    if (crtQues.includes(questionId)) {
      setCrtQues((prev) => prev.filter((id) => id !== questionId));
    }
  }

  const resultValue = matchingQuestion ? correctQuestion.mark : 0;

  const dataToSubmit = {
    test_id: testName,
    question_id: questionId,
    student_id: studentID,
    answer: selectedOptionLabel,
    result: resultValue,
    dtm_start: testStartTime,
    dtm_end: new Date(),
  };

  console.log("dataToSubmit:", dataToSubmit);

  getTestAnswerMapApi(username, testName)
    .then((existingData) => {
      const existingAnswer = existingData.find(
        (answer) => answer.question_id__id === questionId
      );

      if (existingAnswer) {
        updateTestAnswerApi(existingAnswer.id, dataToSubmit)
          .then((response) => {
            console.log("Test Answer Updated:", response);
            setIsNextEnabled(true);
            setProcessing(false);
          })
          .catch((error) => {
            console.error("Error updating answer:", error);
            setIsNextEnabled(false);
          });
      } else {
        addTestAnswerMapApi_MCQ(dataToSubmit)
          .then((response) => {
            console.log("Test Answer Added:", response);
            setIsNextEnabled(true);
            setProcessing(false);
          })
          .catch((error) => {
            console.error("Error submitting new answer:", error);
            setIsNextEnabled(false);
            setProcessing(false);
          });
      }
    })
    .catch((error) => {
      console.error("Error checking existing answers:", error);
      setIsNextEnabled(false);
      setProcessing(false);
    });
};

 const handleTestSubmit = async (e) => {
  e.preventDefault();

  setProcessing(true); // Optional: Show loading

  try {
    // 1. Capture time taken
    const endTime = new Date();
    const timeTakenInSeconds = Math.floor((endTime - testStartTime) / 1000);
    const minutesTaken = Math.floor(timeTakenInSeconds / 60);
    const secondsTaken = timeTakenInSeconds % 60;
    const totalTiming = `${minutesTaken} min ${secondsTaken} sec`;

    setMinsTaken(minutesTaken);
    setSecTaken(secondsTaken);

    // 2. Update duration
    await Capture_Duration_Update_API(selectedCandidateId, totalTiming);

    // 3. Get total score
    const data = await getTotalScore_API(selectedCandidateId);

    if (data && data.total_score !== undefined) {
      setTotalMarks(data.total_score);
      setErrorMessage("Submitted Successfully");

      // 4. Mark test as submitted
      const avg_mark = (data.total_score / questions.length) * 100;
      console.log("avg", avg_mark)
  // ✅ Update student's average mark
      await updateStuAvgMarkAPI(testName, studentID, avg_mark);
     
      await updateTestcadidateApi_submitted(selectedCandidateId);

       getTestAnswers_API(testName, studentID).then((data) => {
            setAnswers_db(data);
            console.log("Db Answers: ", data);
          });
      
     // Map answers
const mappedAnswers = questions.map((q) => ({
  question_text: q.question_text,
  correct_answer: q.answer,
  submitted_answer: answers[q.id] || null,
}));

console.log("Mapped Answers for TestResult:", mappedAnswers);
    
      console.log("Navigating to /test-result...");

navigate("/test-result", {
  state: {
    totalMarks: data.total_score,
    countMarks: countMarks,
    minsTaken: minutesTaken,
    secTaken: secondsTaken,
    questionsWrong: questions.length - crtQues.length,
    questions,
    answers_db: mappedAnswers,
    username,
    testName,
  },
});

      setTestCompleted(true);
console.log("🟢 Calling updateTotalAndAvgMarksdeleteanswerApi...");
await updateTotalAndAvgMarksdeleteanswerApi(testName, studentID);
console.log("🟢 Completed updateTotalAndAvgMarksdeleteanswerApi call successfully");

    } else {
      throw new Error("Invalid response data from score API");
    }
  } catch (error) {
    console.error("Error during test submission:", error);
    setErrorMessage("Submission Failed");
    setShowError(true);
  } finally {
    setProcessing(false);
  }
};

  if (loading) return <div className="attend-test-container">⏳ Loading test data...</div>;
  if (error) return <ErrorModal message={error} />;

  if (!showTestPage) {
    // ✅ Show Instructions Page
    return (
      <div className="attend-test-container">
        <div className="hai2">
          <h6 style={{ textAlign: "center" }}>YOU MUST BEFORE YOU GO...</h6>
        </div>
        <br />
        <div className="hai2">
          <div className="instructions">
            {testCandidate?.instruction
              ?.split(/(?<=\.)\s/)
              ?.map((instruction, index) => (
                <p key={index} className="instruction-item">
                  {index + 1}. {instruction.trim()}
                </p>
              )) || <p>No instructions available</p>}
          </div>
<p></p>
          <div style={{ display: "grid", placeItems: "center" }}>
            <button
              style={{ border: "none", width: "100px" }}
              onClick={handleGoForTest}
              className="ques-save"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Show Test Page After Clicking Start
  return (
    <div className="no-select">
      <div className="Box">
        <div className="duration">Durationn: {testCandidate?.duration} mins</div>
        <div className="questions">Questions: {questions.length}</div>
      </div>

      <div className="test-container-mcq">
        <div className="question-container1-mcq" style={{ display: "flex", justifyContent: "space-between" }}>
         <div style={{ width: "75%" }}>
          <div key={questions[currentQuestionIndex].id}>
            <div style={{ display: "flex" }}>
              <p className="questions" style={{ marginRight: "10px", marginTop: "-3px" }}>
                {currentQuestionIndex + 1})
              </p>
              <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                <code>{questions[currentQuestionIndex].question_text}</code>
              </pre>
            </div>

            <ul style={{ listStyleType: "none", padding: 0 }}>
              {["A", "B", "C", "D"].map((opt) => {
                const text = questions[currentQuestionIndex][`option_${opt.toLowerCase()}`];
                if (!text) return null;

                return (
                  <li key={opt} style={{ marginBottom: "10px" }}>
                    <label style={{ cursor: "pointer", display: "flex" }}>
                      <input
                        type="radio"
                        name={`question_${questions[currentQuestionIndex].id}`}
                        value={opt}
                        checked={answers[questions[currentQuestionIndex].id] === opt}
                        onChange={() => handleOptionSelect(opt)}
                        style={{ marginRight: "8px" }}
                      />
                      <div className="option-circle">{text}</div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="navigation-container">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="button-ques-back-next back-button"
            >
              <FaArrowLeft />
              <span className="button-text">Back</span>
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="button-ques-back-next next-button"
            >
              <FaArrowRight />
              <span className="button-text">Next</span>
            </button>

            <form onSubmit={handleTestSubmit}>
              <button type="submit" className="button-save12">
                Finish
              </button>
            </form>
          </div>
          </div>
          
        </div>
         <div style={{  paddingLeft: "20px", textAlign: "center",marginTop:"20px" }}>
    {renderTimer()}
     <div style={{ marginTop: "20px" }}>
      {renderQuestionButtons()}
    </div>
  </div>
 
      </div>
    </div>
  );
};

export default AttendOnlinePracticeTest;
