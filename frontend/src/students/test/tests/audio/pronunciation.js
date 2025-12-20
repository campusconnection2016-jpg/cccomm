import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../../styles/students.css";
import {
  addOrUpdateResultApi,
  updateTestcadidateApi_submitted,
  updateTotalScoreTestcandidateApi,
  updateTotalAndAvgMarksdeleteanswerApi,
  Capture_Duration_Update_API,
} from "../../../../api/endpoints";
import { FaMicrophone, FaStop, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CommunicationTimer from "../communicationtimer";

const Pronunciation = ({ username }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { testName, duration, questions: rawQuestions, student_id ,mapping_id} = state || {};

  // ✅ Remove duplicate questions (safety)
  const questions = React.useMemo(() => {
    if (!Array.isArray(rawQuestions)) return [];
    const uniqueMap = new Map();
    rawQuestions.forEach((q) => {
      if (!uniqueMap.has(q.id)) uniqueMap.set(q.id, q);
    });
    return Array.from(uniqueMap.values());
  }, [rawQuestions]);

  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const recognitionRef = useRef(null);

  // ===== Initialize Speech Recognition =====
  // ===== Initialize Speech Recognition =====
useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in your browser!");
    return;
  }

  const recog = new SpeechRecognition();
  recog.continuous = true;
  recog.interimResults = false;
  recog.lang = "en-IN";

  // Use dynamic handler so it always refers to the latest question index
  recog.onresult = async (event) => {
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    setSpokenText(transcript);

    // ✅ dynamically use current question index instead of stale closure
    await evaluatePronunciation(transcript, currentQuestionIndex);

    setIsListening(false);
  };

  recog.onerror = (err) => {
    console.warn("Speech recognition error:", err);
    setIsListening(false);
  };

  recog.onend = () => {
  if (isListening) {
    console.log("🔄 Speech ended — restarting...");
    recog.start();  // auto-restart
  }
};

  recog.onend = () => setIsListening(false);

  recognitionRef.current = recog;
}, []); // <— 👈 add dependency here

  // ===== Start Listening (Safe) =====
 const handleStartListening = () => {
  const recog = recognitionRef.current;
  if (!recog) return;

  if (isListening) return;

  setSpokenText("");
  setHighlightedText("");
  setIsListening(true);

  try {
    recog.start();
    console.log("🎤 Listening started...");
  } catch (err) {
    console.error("❌ Start error", err);
  }
};

  // ===== Stop Listening =====
 const handleStopListening = () => {
  const recog = recognitionRef.current;
  if (!recog) return;

  setIsListening(false);

  try {
    recog.stop();
    console.log("🛑 Listening stopped");
  } catch (err) {
    console.error("❌ Stop error", err);
  }
};

  // ===== Evaluate Pronunciation =====
const evaluatePronunciation = async (spoken, qIndex = currentQuestionIndex) => {
  const q = questions[qIndex];
  if (!q) return;

  const qText = q.question_text.trim().toLowerCase();
  const qId = q.id;

  // ✅ Clean punctuation for fair comparison
  const clean = (text) =>
    text
      .replace(/[.,!?;:()'"-]/g, "") // remove punctuation
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const spokenWords = clean(spoken).split(" ");
  const correctWords = clean(qText).split(" ");

  let matchCount = 0;
  const highlighted = correctWords
    .map((word) => {
      if (spokenWords.includes(word)) {
        matchCount++;
        return `<span style="color:green; font-weight:bold">${word}</span>`;
      } else {
        return `<span style="color:red">${word}</span>`;
      }
    })
    .join(" ");

  setHighlightedText(highlighted);

  // Calculate pronunciation score
  let score = Math.round((matchCount / correctWords.length) * (q.mark || 1));
  if (score > q.mark) score = q.mark;

  const payload = {
    test_name: testName,
    question_id: qId,
    student_id,
    answer: spoken,
    dtm_start: new Date(),
    dtm_end: new Date(),
  };

  try {
    setProcessing(true);
    await addOrUpdateResultApi(payload);
    console.log(`✅ Saved pronunciation result for Q${qId}: ${score}`);
  } catch (err) {
    console.error("❌ Error saving pronunciation result:", err);
  } finally {
    setProcessing(false);
  }

  setAnswers((prev) => ({ ...prev, [qId]: spoken }));
};

  // ===== Navigation =====
  const handleQuestionChange = (index) => {
    handleStopListening(); // stop current speech before switching question

    setCurrentQuestionIndex(index);
    const q = questions[index];
    const saved = answers[q.id];
    setSpokenText(saved ? saved.spoken : "");
    setHighlightedText(saved ? saved.highlighted : "");
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleQuestionChange(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      handleQuestionChange(currentQuestionIndex - 1);
    }
  };

  // ===== Submit Test =====
  const handleFinish = async () => {
    try {
      setProcessing(true);
      handleStopListening();

     // await updateTotalScoreTestcandidateApi(student_id, {});
      await updateTotalAndAvgMarksdeleteanswerApi(testName, student_id);

      const totalSeconds = duration * 60 - timeLeft;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const formattedDuration = `${minutes} min ${seconds} sec`;

      await Capture_Duration_Update_API(mapping_id, formattedDuration);
      await updateTestcadidateApi_submitted(mapping_id);

      navigate("/thank-you", { state: { duration: formattedDuration, testName } });
    } catch (err) {
      console.error("❌ Error submitting pronunciation test:", err);
      alert("Failed to submit test. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="no-select">
      <div className="Box">
        <div className="duration">Duration: {duration} mins</div>
        <div className="questions">Questions: {questions?.length || 0}</div>
      </div>

      <div className="test-container-mcq">
        <div className="question-container1-mcq">
          {currentQ && (
            <div key={currentQ.id}>
              <p style={{ fontWeight: "bold", fontSize: "18px", color: "#fff" }}>
                {currentQuestionIndex + 1}) Read this sentence clearly:
              </p>

              <div
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    highlightedText || `<span>${currentQ.question_text}</span>`,
                }}
              ></div>

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                {!isListening ? (
                  <button
                    className="audio-play-btn"
                    onClick={handleStartListening}
                    disabled={processing}
                    style={{
                      background: "#28a745",
                      border: "none",
                      borderRadius: "50%",
                      padding: "15px",
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    <FaMicrophone />
                  </button>
                ) : (
                  <button
                    className="audio-stop-btn"
                    onClick={handleStopListening}
                    style={{
                      background: "#dc3545",
                      border: "none",
                      borderRadius: "50%",
                      padding: "15px",
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    <FaStop /> Stop
                  </button>
                )}
              </div>

              <div
                style={{
                  background: "#f7f7f7",
                  borderRadius: "8px",
                  padding: "10px",
                  marginTop: "15px",
                  color: "#000",
                }}
              >
                <strong>Your Speech:</strong>{" "}
                {spokenText || "(not recorded yet)"}
              </div>
            </div>
          )}

          <div className="navigation-container">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="button-ques-back-next back-button"
            >
              <FaArrowLeft /> Back
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleFinish}
                className="button-ques-back-next finish-button"
                disabled={processing}
              >
                Finish
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={processing}
                className="button-ques-back-next next-button"
              >
                Next <FaArrowRight />
              </button>
            )}
          </div>
        </div>

        <div className="question-buttons-container1-mcq">
          <div style={{ width: "100%", textAlign: "center" }}>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginBottom: "20px",
                padding: "5px",
                background: "#F1A128",
              }}
            >
              <CommunicationTimer
                duration={duration * 60}
                setTimeLeftCallback={setTimeLeft}
                handleTestCompletionTimer={handleFinish}
              />
            </div>
            <div>
             {questions.map((q, i) => {
  const hasAnswered = !!answers[q.id]; // ✅ check if user answered this question
  const isActive = currentQuestionIndex === i;

  // Active = orange, Answered = yellow, Pending = grey
  let backgroundColor = "grey";
  if (isActive) backgroundColor = "#F1A128"; // current question (orange)
  else if (hasAnswered) backgroundColor = "#F1A128"; // answered (yellow)

  return (
    <button
      key={i}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        margin: "5px",
        fontWeight: "bold",
        border: "2px solid gray",
        backgroundColor,
        transition: "background-color 0.3s ease",
      }}
      onClick={() => handleQuestionChange(i)}
      disabled={processing}
    >
      {i + 1}
    </button>
  );
})}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pronunciation;
