import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../../styles/students.css";
import {
  addTestAnswerMapApi_MCQ,
  updateTestAnswerApi,
  getTestAnswerMapApi,
  updateTestcadidateApi_submitted,
  updateTotalScoreTestcandidateApi,
  updateTotalAndAvgMarksdeleteanswerApi,
  Capture_Duration_Update_API,
} from "../../../../api/endpoints";
import { FaPlay, FaPause, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CommunicationTimer from "../communicationtimer";

const AttendAudioTest = ({ username }) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { testName, duration, questions, audiotext, student_id ,mapping_id} = state || {};

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  // ====== Fullscreen Handling ======
  const enterFullScreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
    console.log("🟢 Entered fullscreen mode.");
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      console.log("🟡 Exited fullscreen mode.");
    }
  };

  // ===== PLAY AUDIO BEFORE STARTING TEST =====
 const handlePlayAudio = () => {
  if (!audiotext) {
    alert("No audio available for this test.");
    return;
  }

  // ✅ Enter fullscreen here (user click)
  enterFullScreen();

  setAudioEnded(false);
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(audiotext);
  utterance.lang = "en-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  utterance.onstart = () => setIsAudioPlaying(true);
  utterance.onend = () => {
    console.log("🎧 Audio ended.");
    setIsAudioPlaying(false);
    setAudioEnded(true);
  };

  window.speechSynthesis.speak(utterance);
};


  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
    setIsAudioPlaying(false);
    setAudioEnded(true);
    enterFullScreen();
  };

  useEffect(() => () => window.speechSynthesis.cancel(), []);
const [optionMarks, setOptionMarks] = useState({});

  // ===== SAVE EACH OPTION =====
 const handleOptionSelect = async (opt) => {
  const q = questions[currentQuestionIndex];
  const qId = q.id;

  const isCorrect = opt.toLowerCase() === q.answer?.toLowerCase();
  const resultValue = isCorrect ? q.mark || 1 : 0;

  // ✅ Update marks for selected question immediately
  setOptionMarks((prev) => ({ ...prev, [qId]: resultValue }));

  setAnswers((prev) => ({ ...prev, [qId]: opt }));

  const payload = {
    test_id: testName,
    question_id: qId,
    student_id,
    answer: opt,
    result: resultValue,
    dtm_start: new Date(),
    dtm_end: new Date(),
  };

  try {
    setProcessing(true);
    const existingData = await getTestAnswerMapApi(username, testName);
    const existingAnswer = existingData?.find((a) => a.question_id__id === qId);

    if (existingAnswer) {
      await updateTestAnswerApi(existingAnswer.id, payload);
      console.log(`✅ Updated Q${qId} for ${student_id} | Marks: ${resultValue}`);
    } else {
      await addTestAnswerMapApi_MCQ(payload);
      console.log(`✅ Added Q${qId} for ${student_id} | Marks: ${resultValue}`);
    }
  } catch (err) {
    console.error("❌ Error saving answer:", err);
  } finally {
    setProcessing(false);
  }
};

  // ====== SUBMIT TEST ======
  const handleSubmit = async () => {
    try {
      setProcessing(true);

      let totalScore = 0;
      questions.forEach((q) => {
        const selected = answers[q.id];
        if (selected && selected.toLowerCase() === q.answer?.toLowerCase()) {
          totalScore += q.mark || 1;
        }
      });

      console.log("🟢 Total Score:", totalScore);

     // await updateTotalScoreTestcandidateApi(student_id, { total_score: totalScore });
      await updateTotalAndAvgMarksdeleteanswerApi(testName, student_id);

      // ✅ Capture Duration
     const totalSeconds = duration * 60 - timeLeft;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const formattedDuration = `${minutes} min ${seconds} sec`;

    // Update in backend
    if (student_id) {
      try {
        const durRes = await Capture_Duration_Update_API(mapping_id, formattedDuration);
        console.log("⏱ Duration update API response:", durRes);
      } catch (e) {
        console.error("❌ Duration update failed:", e);
      }
    }
      await updateTestcadidateApi_submitted(mapping_id);
      exitFullScreen();

      // ✅ Navigate to Thank You Page
      navigate("/thank-you", {
        state: { duration: formattedDuration, testName },
      });
    } catch (err) {
      console.error("❌ Error submitting test:", err);
      alert("Failed to submit test. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ====== AUTO SUBMIT ======
  const handleTestCompletionTimer = () => {
    alert("⏰ Time up! Auto submitting your test...");
    handleSubmit();
  };

  // ====== RENDER QUESTION BUTTONS ======
  const renderQuestionButtons = () => {
    const totalQuestions = questions.length;
    const buttons = [];

    for (let i = 0; i < totalQuestions; i++) {
      const isCompleted = !!answers[questions[i].id];
      const isActive = currentQuestionIndex === i;
      const backgroundColor = isActive
        ? "#F1A128"
        : isCompleted
        ? "#F1A128"
        : "grey";

      buttons.push(
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
          onClick={() => setCurrentQuestionIndex(i)}
          disabled={processing}
        >
          {i + 1}
        </button>
      );
    }

    const rows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      rows.push(
        <div key={i} style={{ display: "flex", justifyContent: "center" }}>
          {buttons.slice(i, i + 5)}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="no-select">
      <div className="no-screenshot-overlay"></div>

      <div className="Box">
        <div className="duration">Duration: {duration} mins</div>
        <div className="questions">Questions: {questions?.length || 0}</div>
      </div>

      {/* 🎧 AUDIO SECTION */}
      {!audioEnded && (
        <div
          className="audio-section"
          style={{
            margin: "20px auto",
            textAlign: "center",
            background: "#fff4e6",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h5 style={{color:"black"}}>🎧 Please listen carefully before starting your test.</h5>
          <div style={{ marginTop: "15px", marginLeft:"150px" }}>
            {!isAudioPlaying ? (
              <button className="audio-play-btn" onClick={handlePlayAudio}>
                <FaPlay /> Play Audio
              </button>
            ) : (
              <button className="audio-stop-btn" onClick={handleStopAudio}>
                <FaPause /> Stop Audio
              </button>
            )}
          </div>
          <p className="audio-wait-text" style={{ marginTop: "10px", color: "#555" }}>
            Audio must finish before questions appear...
          </p>
        </div>
      )}

      {/* TEST SECTION */}
      {audioEnded && (
        <div className="test-container-mcq">
          <div className="question-container1-mcq">
            <div key={questions[currentQuestionIndex].id}>
              <div style={{ display: "flex" }}>
                <p className="questions" style={{ marginRight: "10px" }}>
                  {currentQuestionIndex + 1})
                </p>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  <code>{questions[currentQuestionIndex].question_text}</code>
                </pre>
              </div>

              <ul style={{ listStyleType: "none", padding: 0 }}>
                {["a", "b", "c", "d"].map((opt) => {
                  const optionText = questions[currentQuestionIndex][`option_${opt}`];
                  if (!optionText) return null;
                  return (
                    <li key={opt} style={{ marginBottom: "10px" }}>
                      <label style={{ cursor: "pointer", display: "flex" }}>
                        <input
                          type="radio"
                          name={`question_${questions[currentQuestionIndex].id}`}
                          value={opt}
                          checked={answers[questions[currentQuestionIndex].id] === opt}
                          onChange={() => handleOptionSelect(opt)}
                          disabled={processing}
                          style={{ marginRight: "8px" }}
                        />
                        <div className="option-circle">{optionText}</div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="navigation-container">
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev))
                }
                disabled={currentQuestionIndex === 0}
                className="button-ques-back-next back-button"
              >
                <FaArrowLeft /> Back
              </button>

              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    prev < questions.length - 1 ? prev + 1 : prev
                  )
                }
                disabled={currentQuestionIndex === questions.length - 1}
                className="button-ques-back-next next-button"
              >
                Next <FaArrowRight />
              </button>

              <button
                type="submit"
                className="button-save12"
                style={{ width: "110px" }}
                onClick={handleSubmit}
                disabled={processing}
              >
                Finish
              </button>
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
      )}
    </div>
  );
};

export default AttendAudioTest;
