import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../../styles/students.css";
import {
  addOrUpdateResultApi,
  updateTestcadidateApi_submitted,
  updateTotalAndAvgMarksdeleteanswerApi,
  Capture_Duration_Update_API,
  logSkillTypeQuestionApi,
} from "../../../../api/endpoints";
import { FaMicrophone, FaStop, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CommunicationTimer from "../communicationtimer";

const Pronunciation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const skillType = location.state?.skill_type;

  const { testName, duration, questions, student_id, mapping_id } = state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [answers, setAnswers] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // ✅ track recorded questions (ONE TIME only)
  const [recorded, setRecorded] = useState({});
  const silenceTimerRef = useRef(null);
const lastSpeechTimeRef = useRef(null);


  const recognitionRef = useRef(null);
  const currentQ = questions[currentQuestionIndex];

  const ALLOWED_SKILL_TYPES = [
    "Tamil_English",
    "Telugu_English",
    "Hindi_English",
    "Kannada_English",
    "Malayalam_English",
  ];

  // ================= Speech Recognition =================
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recog = new SR();
   recog.continuous = true;
recog.interimResults = true;

    recog.lang = "en-IN";

  recog.onresult = async (e) => {
  lastSpeechTimeRef.current = Date.now();

  let transcript = "";
  for (let i = e.resultIndex; i < e.results.length; i++) {
    transcript += e.results[i][0].transcript;
  }

  setSpokenText(transcript.trim());

  // ⏱ Reset silence timer
  if (silenceTimerRef.current) {
    clearTimeout(silenceTimerRef.current);
  }

  silenceTimerRef.current = setTimeout(async () => {
    recognitionRef.current?.stop();

    const finalText = transcript.trim();
    if (!finalText) return;

    const payload = {
      test_name: testName,
      question_id: currentQ.id,
      student_id,
      answer: finalText,
      dtm_start: new Date(),
      dtm_end: new Date(),
    };

    try {
      setProcessing(true);
      await addOrUpdateResultApi(payload);

      setAnswers((prev) => ({ ...prev, [currentQ.id]: finalText }));
      setRecorded((prev) => ({ ...prev, [currentQ.id]: true }));
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setProcessing(false);
      setIsListening(false);
    }
  }, 2500); // ✅ 2.5 seconds silence
};


    recog.onerror = () => {};
    recog.onend = () => setIsListening(false);

    recognitionRef.current = recog;
  }, [currentQ, testName, student_id]);

  // ================= Controls =================
  const handleStartListening = () => {
    if (
      isListening ||
      !recognitionRef.current ||
      recorded[currentQ.id]
    )
      return;

    setSpokenText("");
    setIsListening(true);
    recognitionRef.current.start();
  };

 const handleStopListening = () => {
  if (silenceTimerRef.current) {
    clearTimeout(silenceTimerRef.current);
  }
  recognitionRef.current?.stop();
  setIsListening(false);
};


  // ================= Navigation =================
  const changeQuestion = (index) => {
    handleStopListening();
    setCurrentQuestionIndex(index);
    setSpokenText(answers[questions[index].id] || "");
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      changeQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      changeQuestion(currentQuestionIndex - 1);
    }
  };

  // ================= Translation (ONLY before recording) =================
  useEffect(() => {
    if (
      recorded[currentQ?.id] ||
      !ALLOWED_SKILL_TYPES.includes(skillType) ||
      !currentQ?.question_text
    )
      return;

    setIsTranslating(true);
    setTranslatedText(null);

    logSkillTypeQuestionApi(skillType, currentQ.question_text)
      .then((res) =>
        setTranslatedText(res?.data?.translated_text || null)
      )
      .finally(() => setIsTranslating(false));
  }, [skillType, currentQ, recorded]);

  // ================= Word Match Highlight =================
  const renderHighlightedQuestion = () => {
    if (!recorded[currentQ.id]) return currentQ.question_text;

    const qWords = currentQ.question_text.toLowerCase().split(" ");
    const aWords = (spokenText || "").toLowerCase().split(" ");

    return qWords.map((word, i) => {
      const match = aWords.includes(word.replace(/[^\w]/g, ""));
      return (
        <span key={i} style={{ color: match ? "#fff" : "red" }}>
          {word}{" "}
        </span>
      );
    });
  };

  // ================= FINAL SUBMIT =================
  const handleFinish = async () => {
    try {
      setProcessing(true);

      await updateTotalAndAvgMarksdeleteanswerApi(testName, student_id);

      const used = duration * 60 - timeLeft;
      const formatted = `${Math.floor(used / 60)} min ${used % 60} sec`;

      await Capture_Duration_Update_API(mapping_id, formatted);
      await updateTestcadidateApi_submitted(mapping_id);

      navigate("/thank-you", {
        state: { duration: formatted, testName },
      });
    } catch (err) {
      console.error("Submit error", err);
    } finally {
      setProcessing(false);
    }
  };

  // ================= UI =================
  return (
    <div className="no-select">
      <div className="Box">
        <div className="duration">Duration: {duration} mins</div>
        <div className="questions">Questions: {questions.length}</div>
      </div>

      <div className="test-container-mcq">
        <div className="question-container1-mcq">
          <p style={{ fontWeight: "bold", fontSize: "18px", color: "#fff" }}>
            {currentQuestionIndex + 1}) Read this sentence clearly:
          </p>

          <div style={{ padding: "15px", borderRadius: "8px" }}>
            {isTranslating ? (
              <span style={{ color: "#ccc" }}>Loading question…</span>
            ) : recorded[currentQ.id] ? (
              renderHighlightedQuestion()
            ) : (
              ALLOWED_SKILL_TYPES.includes(skillType) && translatedText
                ? translatedText
                : currentQ.question_text
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            {!isListening ? (
              <button
                className="audio-play-btn"
                onClick={handleStartListening}
                disabled={recorded[currentQ.id]}
              >
                <FaMicrophone />
              </button>
            ) : (
              <button
                className="audio-stop-btn"
                onClick={handleStopListening}
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
                const answered = recorded[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => changeQuestion(i)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      margin: "5px",
                      fontWeight: "bold",
                      border: "2px solid gray",
                      background:
                        i === currentQuestionIndex
                          ? "#F1A128"
                          : answered
                          ? "#F1A128"
                          : "grey",
                    }}
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
