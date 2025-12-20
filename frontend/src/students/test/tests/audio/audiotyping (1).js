import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../../styles/students.css";
import {
  addOrUpdateResultApi,
  updateTestcadidateApi_submitted,
  updateTotalScoreTestcandidateApi,
  updateTotalAndAvgMarksdeleteanswerApi,
  Capture_Duration_Update_API,logSkillTypeQuestionApi 
} from "../../../../api/endpoints";
import { FaPlay, FaStop, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CommunicationTimer from "../communicationtimer";

const AttendAudioTyping = ({ username }) => {
  const { state } = useLocation();
  const location = useLocation();
const skillType = location.state?.skill_type;


  const navigate = useNavigate();
  const { testName, duration, questions, student_id,mapping_id } = state || {};

  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);

const [playingQuestionId, setPlayingQuestionId] = useState(null);
const [playedQuestions, setPlayedQuestions] = useState({});

const getBestVoice = (lang) => {
  const voices = window.speechSynthesis.getVoices();

  if (!voices || voices.length === 0) return null;

  // Try exact match first
  let voice = voices.find(v => v.lang === lang);

  // Try partial match (ta, te, hi, etc.)
  if (!voice) {
    const shortLang = lang.split("-")[0];
    voice = voices.find(v => v.lang.startsWith(shortLang));
  }

  return voice || null;
};

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



  // ===== Play question as audio =====
const handlePlayQuestionAudio = (textToSpeak, qId) => {
  // Stop audio ONLY if question changes (handled elsewhere)
  window.speechSynthesis.cancel();

  if (!textToSpeak) return;

  const targetLang = SKILL_TO_SPEECH_LANG[skillType] || "en-IN";
  const voices = window.speechSynthesis.getVoices();

  const voice =
    voices.find(v => v.lang === targetLang) ||
    voices.find(v => v.lang.startsWith(targetLang.split("-")[0])) ||
    voices.find(v => v.lang === "en-IN");

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.voice = voice;
  utterance.lang = voice?.lang || "en-IN";

  utterance.onstart = () => {
    setIsPlaying(true);
    setPlayingQuestionId(qId);
  };

  utterance.onend = () => {
    setIsPlaying(false);
    setPlayingQuestionId(null);
    setPlayedQuestions(prev => ({ ...prev, [qId]: true })); // play once
  };

  utterance.onerror = () => {
    setIsPlaying(false);
    setPlayingQuestionId(null);
  };

  window.speechSynthesis.speak(utterance);
};





  useEffect(() => {
  if (!skillType) return;

  console.log("🎯 Received Skill Type:", skillType);
}, [skillType]);

  useEffect(() => {
  window.speechSynthesis.cancel();
  setIsPlaying(false);
  setPlayingQuestionId(null);
}, [currentQuestionIndex]);

  // ===== Save current answer (only when Enter, Next, or Finish pressed) =====
  const saveTypedAnswer = async () => {
    const q = questions[currentQuestionIndex];
    if (!q) return;

    const qId = q.id;
    const typedAnswer = (typedText || "").trim();
    if (!typedAnswer) return; // skip empty

    setAnswers((prev) => ({ ...prev, [qId]: typedAnswer }));

    const payload = {
      test_name: testName,
      question_id: qId,
      student_id,
      answer: typedAnswer,
      dtm_start: new Date(),
      dtm_end: new Date(),
    };

    try {
      setProcessing(true);
      await addOrUpdateResultApi(payload);
      console.log(`✅ Saved answer for Question ID ${qId}`);
    } catch (err) {
      console.error("❌ Error saving result:", err);
    } finally {
      setProcessing(false);
    }
  };

  // ===== Detect Enter press for submission =====
  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      await saveTypedAnswer();
    }
  };

  // ===== Next Question =====
  const handleNext = async () => {
    await saveTypedAnswer();
    setCurrentQuestionIndex((prev) =>
      prev < questions.length - 1 ? prev + 1 : prev
    );
  };

  // ===== Previous Question =====
  const handlePrevious = async () => {
    await saveTypedAnswer();
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // ===== Finish Test =====
  const handleFinish = async () => {
    await saveTypedAnswer();
    try {
      setProcessing(true);
    //  await updateTotalScoreTestcandidateApi(student_id, {});
      await updateTotalAndAvgMarksdeleteanswerApi(testName, student_id);

     const totalSeconds = duration * 60 - timeLeft;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formattedDuration = `${minutes} min ${seconds} sec`;

    console.log("⏱ Duration calculation details:");
    console.log("➡ Duration (minutes):", minutes);
    console.log("➡ Duration (seconds):", seconds);
    console.log("➡ Formatted Duration:", formattedDuration);

    // ===== Duration Update API =====
    console.log("📡 Sending duration to Capture_Duration_Update_API...");
    const durationResponse = await Capture_Duration_Update_API(
      mapping_id,
      formattedDuration
    );
    console.log("✅ Duration API Response:", durationResponse);

      await updateTestcadidateApi_submitted(mapping_id);

      navigate("/thank-you", { state: { duration: formattedDuration, testName } });
    } catch (err) {
      console.error("❌ Error submitting test:", err);
      alert("Failed to submit test. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ===== Auto Submit on timer end =====
  const handleTestCompletionTimer = () => {
    alert("⏰ Time up! Auto submitting your test...");
    handleFinish();
  };

  // ===== Render question buttons =====
  const renderQuestionButtons = () =>
    questions.map((q, i) => {
      const isCompleted = !!answers[q.id];
      const isActive = currentQuestionIndex === i;
      const backgroundColor = isActive ? "#F1A128" : isCompleted ? "#F1A128" : "grey";

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
            setTypedText(answers[q.id] || "");
            setCurrentQuestionIndex(i);
          }}
          disabled={processing}
        >
          {i + 1}
        </button>
      );
    });

  const currentQ = questions[currentQuestionIndex];


useEffect(() => {
  if (!skillType) return;
  if (!currentQ?.question_text) return;

  // Allow translation ONLY for these skill types
  if (!ALLOWED_SKILL_TYPES.includes(skillType)) return;

  // Reset previous translation before fetching new one
  setTranslatedText(null);

  logSkillTypeQuestionApi(skillType, currentQ.question_text)
    .then((res) => {
      const translated = res?.data?.translated_text || null;
      console.log("✅ Translated Text from backend:", translated);
      setTranslatedText(translated);
    })
    .catch((err) => {
      console.error("❌ Failed to fetch translated text:", err);
      setTranslatedText(null);
    });

}, [skillType, currentQ?.question_text]);


useEffect(() => {
  setTranslatedText(null);
}, [currentQuestionIndex]);


  useEffect(() => {
    // Load previously saved answer (if exists)
    if (currentQ) {
      setTypedText(answers[currentQ.id] || "");
    }
  }, [currentQuestionIndex, currentQ, answers]);



  
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
             <button
  className="audio-play-btn"
  onClick={() =>
    handlePlayQuestionAudio(
      ALLOWED_SKILL_TYPES.includes(skillType) && translatedText
        ? translatedText
        : currentQ.question_text,
      currentQ.id
    )
  }
  disabled={playedQuestions[currentQ.id]}
  style={{
    background: "#ffb84d",
    border: "none",
    borderRadius: "50%",
    padding: "10px",
    cursor: playedQuestions[currentQ.id] ? "not-allowed" : "pointer",
    opacity: playedQuestions[currentQ.id] ? 0.6 : 1,
  }}
>
  {isPlaying && playingQuestionId === currentQ.id ? <FaStop /> : <FaPlay />}
</button>

              <span style={{ marginLeft: "15px", fontWeight: "bold", color: "#fff" }}>
                Listen to the audio and type exactly what you hear:
              </span>
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
              onChange={(e) => setTypedText(e.target.value)} // ← Spaces won't trigger save
              onKeyDown={handleKeyDown} // ← Enter key triggers save
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
