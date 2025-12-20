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
  const skillType = state?.skill_type;

  const { testName, duration, questions: rawQuestions, student_id, mapping_id } =
    state || {};

  // ✅ Remove duplicates
  const questions = React.useMemo(() => {
    const map = new Map();
    (rawQuestions || []).forEach((q) => {
      if (!map.has(q.id)) map.set(q.id, q);
    });
    return [...map.values()];
  }, [rawQuestions]);

  const [answers, setAnswers] = useState({});               // qId -> string
  const [reviewedQuestions, setReviewedQuestions] = useState({}); // qId -> true
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [blankValues, setBlankValues] = useState([]);
  const [translatedText, setTranslatedText] = useState(null);
  const [hasTyped, setHasTyped] = useState(false);

  const currentQ = questions[currentQuestionIndex];

  // ===============================
  // Translation
  // ===============================
  const ALLOWED_SKILL_TYPES = [
    "Tamil_English",
    "Telugu_English",
    "Hindi_English",
    "Kannada_English",
    "Malayalam_English",
  ];

  useEffect(() => {
    if (!skillType || !currentQ?.question_text) return;
    if (!ALLOWED_SKILL_TYPES.includes(skillType)) return;

    setTranslatedText(null);
    logSkillTypeQuestionApi(skillType, currentQ.question_text)
      .then((res) => setTranslatedText(res?.data?.translated_text || null))
      .catch(() => setTranslatedText(null));
  }, [skillType, currentQ?.question_text]);

  const displayQuestionText =
    ALLOWED_SKILL_TYPES.includes(skillType) && translatedText
      ? translatedText
      : currentQ?.question_text;

  // ===============================
  // Parse blanks
  // ===============================
  const parseQuestionWithBlanks = (text) => {
    const BLANK = /_____/g;
    return {
      parts: text.split(BLANK),
      blanksCount: (text.match(BLANK) || []).length,
    };
  };

  // ===============================
  // Restore blanks on question change
  // ===============================
  useEffect(() => {
    if (!currentQ || !displayQuestionText) return;

    const { blanksCount } = parseQuestionWithBlanks(displayQuestionText);
    const saved = answers[currentQ.id];

    if (saved) {
      setBlankValues(saved.split(" | "));
      setHasTyped(true);
    } else {
      setBlankValues(new Array(blanksCount).fill(""));
      setHasTyped(false);
    }
  }, [currentQ, displayQuestionText]);

  // ===============================
  // Save Answer
  // ===============================
  const saveAnswer = async () => {
    if (!currentQ) return;

    const qId = currentQ.id;
    const answerText = blankValues.join(" | ");
    if (!answerText.trim()) return;

    setAnswers((p) => ({ ...p, [qId]: answerText }));

    await addOrUpdateResultApi({
      test_name: testName,
      question_id: qId,
      student_id,
      answer: answerText,
      dtm_start: new Date(),
      dtm_end: new Date(),
    });
  };

  // ===============================
  // Navigation
  // ===============================
  const goToQuestion = async (index) => {
    await saveAnswer();
    setCurrentQuestionIndex(index);
  };

  // ===============================
  // Finish
  // ===============================
  const handleFinish = async () => {
    await saveAnswer();
    await updateTotalAndAvgMarksdeleteanswerApi(testName, student_id);

    const used = duration * 60 - timeLeft;
    const formatted = `${Math.floor(used / 60)} min ${used % 60} sec`;

    await Capture_Duration_Update_API(mapping_id, formatted);
    await updateTestcadidateApi_submitted(mapping_id);

    navigate("/thank-you", { state: { duration: formatted, testName } });
  };

  // ===============================
  // Render blanks
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
              setHasTyped(copy.some((v) => v.trim() !== ""));
            }}
            className="answer-textarea"
          style={{
  width: "150px",
  margin: "0 6px",

  /* ❌ KILL ALL LINES FROM CSS */
  border: "none",
  borderBottom: "none",
  outline: "none",
  boxShadow: "none",
  textDecoration: "none",
  backgroundColor: "transparent",

  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",

  color: "white",
  textAlign: "center",

  /* ✅ ONLY DOT DOT (......) */
  backgroundImage:
    "repeating-linear-gradient(to right, white 0px, white 2px, transparent 2px, transparent 6px)",
  backgroundRepeat: "repeat-x",
  backgroundPosition: "left calc(100% - 1px)",
  backgroundSize: "6px 1px",
}}

            disabled={processing || reviewedQuestions[currentQ.id]}
          />
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="no-select">
      <div className="Box">
        <div className="duration">Duration: {duration} mins</div>
        <div className="questions">Questions: {questions.length}</div>
      </div>

      <div className="test-container-mcq">
        <div className="question-container1-mcq">
          {currentQ && (
            <>
              <p className="questions">
                {currentQuestionIndex + 1}) Fill in the blanks:
              </p>

              <p className="questions">{renderQuestion()}</p>

              {reviewedQuestions[currentQ.id] && currentQ.answer && (
                <p className="questions" style={{ marginTop: "10px" }}>
                  <strong>Correct Answer:</strong> {currentQ.answer}
                </p>
              )}
            </>
          )}

          <div className="navigation-container">
            <button
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="button-ques-back-next back-button"
            >
              <FaArrowLeft /> Back
            </button>

            <button
              className="button-ques-back-next"
              disabled={!hasTyped || reviewedQuestions[currentQ.id]}
              onClick={() =>
                setReviewedQuestions((p) => ({
                  ...p,
                  [currentQ.id]: true,
                }))
              }
            >
              Review
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleFinish}
                className="button-ques-back-next finish-button"
              >
                Finish
              </button>
            ) : (
              <button
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                className="button-ques-back-next next-button"
              >
                Next <FaArrowRight />
              </button>
            )}
          </div>
        </div>

        {/* ===== Timer + Question Count (UNCHANGED) ===== */}
        <div className="question-buttons-container1-mcq">
          <div style={{ textAlign: "center" }}>
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
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    margin: "5px",
                    fontWeight: "bold",
                    border: "2px solid gray",
                    backgroundColor:
                      i === currentQuestionIndex || answers[q.id]
                        ? "#F1A128"
                        : "grey",
                  }}
                  onClick={() => goToQuestion(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillInTheBlank;
