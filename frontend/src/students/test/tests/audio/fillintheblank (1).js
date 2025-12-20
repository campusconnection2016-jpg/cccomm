import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../../styles/students.css";
import {
  addOrUpdateResultApi,
  updateTestcadidateApi_submitted,
  updateTotalAndAvgMarksdeleteanswerApi,
  Capture_Duration_Update_API,
  logSkillTypeQuestionApi,
} from "../../../../api/endpoints";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CommunicationTimer from "../communicationtimer";

const FillInTheBlank = ({ username }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const skillType = location.state?.skill_type;

  const { testName, duration, questions: rawQuestions, student_id, mapping_id } =
    state || {};

  // ✅ Remove duplicate questions
  const questions = React.useMemo(() => {
    if (!Array.isArray(rawQuestions)) return [];
    const map = new Map();
    rawQuestions.forEach((q) => {
      if (!map.has(q.id)) map.set(q.id, q);
    });
    return Array.from(map.values());
  }, [rawQuestions]);

  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [blankValues, setBlankValues] = useState([]);
  const [translatedText, setTranslatedText] = useState(null);

  const ALLOWED_SKILL_TYPES = [
    "Tamil_English",
    "Telugu_English",
    "Hindi_English",
    "Kannada_English",
    "Malayalam_English",
  ];

  const currentQ = questions[currentQuestionIndex];

  // ===============================
  // Translation logic
  // ===============================
  useEffect(() => {
    if (!skillType) return;
    if (!currentQ?.question_text) return;
    if (!ALLOWED_SKILL_TYPES.includes(skillType)) return;

    setTranslatedText(null);

    logSkillTypeQuestionApi(skillType, currentQ.question_text)
      .then((res) => {
        setTranslatedText(res?.data?.translated_text || null);
      })
      .catch(() => setTranslatedText(null));
  }, [skillType, currentQ?.question_text]);

  useEffect(() => {
    setTranslatedText(null);
  }, [currentQuestionIndex]);

  const displayQuestionText =
    ALLOWED_SKILL_TYPES.includes(skillType) && translatedText
      ? translatedText
      : currentQ?.question_text;

  // ===============================
  // Parse blanks (ONLY _____)
  // ===============================
  const parseQuestionWithBlanks = (text) => {
    if (!text) return { parts: [""], blanksCount: 0 };

    const BLANK_PATTERN = /_____/g;
    const matches = text.match(BLANK_PATTERN) || [];
    const blanksCount = matches.length;

    if (blanksCount === 0) {
      return { parts: [text], blanksCount: 0 };
    }

    const parts = text.split(BLANK_PATTERN);
    return { parts, blanksCount };
  };

  // Initialize blanks
  useEffect(() => {
    if (!displayQuestionText) return;
    const { blanksCount } = parseQuestionWithBlanks(displayQuestionText);
    setBlankValues(blanksCount > 0 ? new Array(blanksCount).fill("") : []);
  }, [displayQuestionText]);

  // ===============================
  // Save Answer
  // ===============================
  const saveAnswer = async () => {
    if (!currentQ) return;

    const qId = currentQ.id;
    const answerText = blankValues.join(" | ");

    if (!answerText.trim()) return;

    setAnswers((prev) => ({ ...prev, [qId]: answerText }));

    const payload = {
      test_name: testName,
      question_id: qId,
      student_id,
      answer: answerText,
      dtm_start: new Date(),
      dtm_end: new Date(),
    };

    try {
      setProcessing(true);
      await addOrUpdateResultApi(payload);
    } catch (err) {
      console.error("❌ Error saving answer:", err);
    } finally {
      setProcessing(false);
    }
  };

  // ===============================
  // Navigation
  // ===============================
  const handleNext = async () => {
    await saveAnswer();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
    }
  };

  const handlePrevious = async () => {
    await saveAnswer();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((p) => p - 1);
    }
  };

  // ===============================
  // Finish Test
  // ===============================
  const handleFinish = async () => {
    await saveAnswer();
    try {
      setProcessing(true);

      await updateTotalAndAvgMarksdeleteanswerApi(testName, student_id);

      const totalSeconds = duration * 60 - timeLeft;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const formattedDuration = `${minutes} min ${seconds} sec`;

      await Capture_Duration_Update_API(mapping_id, formattedDuration);
      await updateTestcadidateApi_submitted(mapping_id);

      navigate("/thank-you", {
        state: { duration: formattedDuration, testName },
      });
    } catch (err) {
      alert("Failed to submit test");
    } finally {
      setProcessing(false);
    }
  };

  // ===============================
  // Render Question with Blanks
  // ===============================
  const renderQuestion = () => {
    if (!displayQuestionText) return null;

    const { parts } = parseQuestionWithBlanks(displayQuestionText);

    return parts.map((part, idx) => (
      <React.Fragment key={idx}>
        <span>{part}</span>
        {idx < parts.length - 1 && (
        <input
  type="text"
  value={blankValues[idx] || ""}
  onChange={(e) => {
    const copy = [...blankValues];
    copy[idx] = e.target.value;
    setBlankValues(copy);
  }}
  className="answer-textarea"
  style={{
    width: "150px",
    display: "inline-block",
    margin: "0 6px",

    /* ✅ DOT STYLE BLANK */
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px dotted white",
    color: "white",
    outline: "none",
    textAlign: "center",
  }}
  disabled={processing}
/>


        )}
      </React.Fragment>
    ));
  };

  // ===============================
  // UI
  // ===============================
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
              <p className="questions">
                {currentQuestionIndex + 1}) Fill in the blanks:
              </p>

              <p className="questions">{renderQuestion()}</p>
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
                className="button-ques-back-next next-button"
                disabled={processing}
              >
                Next <FaArrowRight />
              </button>
            )}
          </div>
        </div>

        {/* ===== Timer + Question Numbers ===== */}
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

            {/* ✅ Question Numbers */}
            <div>
              {questions.map((q, i) => {
                const isActive = currentQuestionIndex === i;
                const hasAnswered = !!answers[q.id];

                let backgroundColor = "grey";
                if (isActive) backgroundColor = "#F1A128";
                else if (hasAnswered) backgroundColor = "#F1A128";

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
                    }}
                    onClick={async () => {
                      await saveAnswer();
                      setCurrentQuestionIndex(i);
                    }}
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

export default FillInTheBlank;
