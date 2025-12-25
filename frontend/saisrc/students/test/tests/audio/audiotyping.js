import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../../styles/students.css";
import {
  addOrUpdateResultApi,
  updateTestcadidateApi_submitted,
  updateTotalScoreTestcandidateApi,
  updateTotalAndAvgMarksdeleteanswerApi,
  Capture_Duration_Update_API,
  logSkillTypeQuestionApi,
} from "../../../../api/endpoints";
import { FaPlay, FaStop, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CommunicationTimer from "../communicationtimer";

const AttendAudioTyping = ({ username }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const skillType = location.state?.skill_type;
  const communication_category = location.state?.communication_category;

console.log("🟣 communication_category (from navigation state):", communication_category);

  

  const { testName, duration, questions, student_id, mapping_id } =
    location.state || {};

  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);

  const [playingQuestionId, setPlayingQuestionId] = useState(null);
  const [playedQuestions, setPlayedQuestions] = useState({});

  // ✅ PER QUESTION REVIEW STATE
  const [reviewedQuestions, setReviewedQuestions] = useState({});
  const [reviewHighlightedMap, setReviewHighlightedMap] = useState({});

  const ALLOWED_SKILL_TYPES = [
    "Tamil_English",
    "Telugu_English",
    "Hindi_English",
    "Kannada_English",
    "Malayalam_English",
  ];

  const SKILL_TO_SPEECH_LANG = {
    Tamil_English: "ta-IN",
    Telugu_English: "te-IN",
    Hindi_English: "hi-IN",
    Kannada_English: "kn-IN",
    Malayalam_English: "ml-IN",
  };

  const currentQ = questions[currentQuestionIndex];
  const isCurrentReviewed = reviewedQuestions[currentQ?.id];

  // ================= AUDIO =================
  const handlePlayQuestionAudio = (textToSpeak, qId) => {
    if (reviewedQuestions[qId]) return; // 🔑 only block reviewed question
    if (isPlaying || playedQuestions[qId]) return;
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = SKILL_TO_SPEECH_LANG[skillType] || "en-IN";

    utterance.onstart = () => {
      setIsPlaying(true);
      setPlayingQuestionId(qId);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setPlayingQuestionId(null);
      setPlayedQuestions((p) => ({ ...p, [qId]: true }));
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setPlayingQuestionId(null);
  }, [currentQuestionIndex]);

  // ================= SAVE =================
  const saveTypedAnswer = async () => {
    if (!currentQ) return;
    const value = typedText.trim();
    if (!value) return;

    setAnswers((p) => ({ ...p, [currentQ.id]: value }));

    await addOrUpdateResultApi({
      test_name: testName,
      question_id: currentQ.id,
      student_id,
      answer: value,
      dtm_start: new Date(),
      dtm_end: new Date(),
    });
  };

  // ================= COMPARE =================
  const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[.,]/g, "")   // remove punctuation
    .split(/\s+/);          // split by space

const compareText = (question, answer) => {
  const qWords = normalize(question);
  const aWords = normalize(answer);

  return qWords
    .map((word) => {
      // check full or partial match
      const isMatched = aWords.some(
        (ansWord) =>
          ansWord.includes(word) || word.includes(ansWord)
      );

      return isMatched
        ? word
        : `<span style="color:red">${word}</span>`;
    })
    .join(" ");
};


  // ================= REVIEW (PER QUESTION) =================
  const handleReview = async () => {
    await saveTypedAnswer();
    window.speechSynthesis.cancel();

    const highlighted = compareText(
      currentQ.question_text,
      answers[currentQ.id] || typedText
    );

    setReviewedQuestions((p) => ({ ...p, [currentQ.id]: true }));
    setReviewHighlightedMap((p) => ({
      ...p,
      [currentQ.id]: highlighted,
    }));
  };

  // ================= NAV =================
  const handleNext = async () => {
    await saveTypedAnswer();
    setCurrentQuestionIndex((p) => p + 1);
  };

  const handlePrevious = async () => {
    await saveTypedAnswer();
    setCurrentQuestionIndex((p) => p - 1);
  };

  // ================= TRANSLATION =================
  useEffect(() => {
    if (
      !currentQ?.question_text ||
      !ALLOWED_SKILL_TYPES.includes(skillType) ||
      reviewedQuestions[currentQ?.id]
    )
      return;

    setTranslatedText(null);

    logSkillTypeQuestionApi(skillType, currentQ.question_text)
      .then((res) =>
        setTranslatedText(res?.data?.translated_text || null)
      )
      .catch(() => setTranslatedText(null));
  }, [skillType, currentQ?.question_text, reviewedQuestions]);

  useEffect(() => {
    setTypedText(answers[currentQ?.id] || "");
    setTranslatedText(null);
  }, [currentQuestionIndex]);

  // ================= FINISH =================
  const handleFinish = async () => {
    await saveTypedAnswer();
    await updateTotalAndAvgMarksdeleteanswerApi(testName, student_id);

    const totalSeconds = duration * 60 - timeLeft;
    const formatted = `${Math.floor(totalSeconds / 60)} min ${
      totalSeconds % 60
    } sec`;

    await Capture_Duration_Update_API(mapping_id, formatted);
    await updateTestcadidateApi_submitted(mapping_id);

    navigate("/thank-you", { state: { duration: formatted, testName } });
  };

  // ================= TIMER =================
  const handleTestCompletionTimer = () => {
    alert("⏰ Time up! Auto submitting your test...");
    handleFinish();
  };

  // ================= QUESTION BUTTONS =================
  const renderQuestionButtons = () =>
    questions.map((q, i) => {
      const isCompleted = !!answers[q.id];
      const isActive = currentQuestionIndex === i;
      const backgroundColor = isActive
        ? "#F1A128"
        : isCompleted
        ? "#F1A128"
        : "grey";

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
            await saveTypedAnswer();
            setCurrentQuestionIndex(i);
          }}
          disabled={processing}
        >
          {i + 1}
        </button>
      );
    });

  // ================= RENDER =================
  return (
    <div className="no-select">
      <div className="Box">
        <div className="duration">Duration: {duration} mins</div>
        <div className="questions">Questions: {questions?.length || 0}</div>
      </div>

      <div className="test-container-mcq">
        <div className="question-container1-mcq">
          <div key={currentQ.id}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p className="questions" style={{ marginRight: "10px" }}>
                {currentQuestionIndex + 1})
              </p>

              {isCurrentReviewed ? (
                <div
                  style={{ color: "#fff", marginBottom: "10px" }}
                  dangerouslySetInnerHTML={{
                    __html: reviewHighlightedMap[currentQ.id],
                  }}
                />
              ) : (
                <button
                  className="audio-play-btn"
                  onClick={() =>
                    handlePlayQuestionAudio(
                      ALLOWED_SKILL_TYPES.includes(skillType) &&
                        translatedText
                        ? translatedText
                        : currentQ.question_text,
                      currentQ.id
                    )
                  }
                  disabled={isPlaying || playedQuestions[currentQ.id]}
                  style={{
                    background: "#ffb84d",
                    border: "none",
                    borderRadius: "50%",
                    padding: "10px",
                    cursor:
                      isPlaying || playedQuestions[currentQ.id]
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      isPlaying || playedQuestions[currentQ.id] ? 0.6 : 1,
                  }}
                >
                  {isPlaying && playingQuestionId === currentQ.id ? (
                    <FaStop />
                  ) : (
                    <FaPlay />
                  )}
                </button>
              )}
            </div>

            <textarea
              className="answer-textarea"
              placeholder="Type your answer here... (Press Enter to save)"
              rows={4}
              style={{
                width: "100%",
                marginTop: "15px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              readOnly={isCurrentReviewed}
              disabled={processing}
            />
          </div>

          <div className="navigation-container">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="button-ques-back-next back-button"
            >
              <FaArrowLeft /> Back
            </button>

{communication_category === "PracticeTest" && !isCurrentReviewed && (
  <button
    onClick={handleReview}
    className="button-ques-back-next finish-button"
    disabled={!typedText.trim()}
    style={{
      opacity: typedText.trim() ? 1 : 0.5,
      cursor: typedText.trim() ? "pointer" : "not-allowed",
    }}
  >
    Review
  </button>
)}


            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleFinish}
                className="button-ques-back-next finish-button"
              >
                Finish
              </button>
            ) : (
              <button
                onClick={handleNext}
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
                handleTestCompletionTimer={handleTestCompletionTimer}
              />
            </div>

            <div>{renderQuestionButtons()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendAudioTyping;
