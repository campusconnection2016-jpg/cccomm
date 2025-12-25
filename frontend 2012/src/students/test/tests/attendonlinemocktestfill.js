import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import ExcelJS from 'exceljs';
import {
  getcandidatesApi_MCQ,
  getTestTypeCategory_testNameApi,
  updateTestcadidateApi_is_active,
  updatekeypressApi,
  updateTestcadidateApi_submitted,
  updateTotalAndAvgMarksdeleteanswerApi,
  updateTestcadidateApi_teststarted,
  updateTotalScoreTestcandidateApi,
  updateAutoTestReassign,
  Capture_Duration_Update_API,
  getTestcandidate_MCQ_Api,
  getQuestionApi_Filter_IO_MCQ,
  updateTestAnswerApi,
  getTestAnswerMapApi,
  addTestAnswerMapApi_MCQ,
  getTotalScore_API,
  getTestAnswers_API,
  get_Test_By_Test_Name_API,
  getQuestionApi_Filter_IO_MCQ_Psychometry,
  getQuestionApi_Filter_IO_PracticeMCQ,
  addTestAnswerMapApi_MCQ_PSY,
  updateTestAnswerApi_PSY,
  updateTotalScoreAvg_API,
 // saveAnswerApi,
  startReassignedExamApi, // NEW API IMPORT
  
  
  ReassignTestCandidatesRefresh,
  updateMoveTabCountApi ,
} from "../../../api/endpoints";
import "../../../styles/students.css";
import CombinedReviewSection from "./renderreview";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import McqTimer from "./mcqtimer";
import ErrorModal from "../../../components/auth/errormodal";
import BinaryToImages from "./binarytoimages";
import CameraComponent from "./cameracomponent";
import KeyPressTracker from "./keypresstracker";

const AttendOnlineMockTest = ({
  collegeName,
  username,
  isSidebarOpen,
  disableSidebar,
  enableSidebar,
}) => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [upcommingTests, setUpcommingTests] = useState([]);
  const [testStartTime, setTestStartTime] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedTestCandidate, setSelectedTestCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [optionF, setOptionF] = useState("");
  const [studentID, setStudentID] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);
  const [countMarks, setCountMarks] = useState(0);
  const [lastKeyPressed, setLastKeyPressed] = useState("");

  const [answers, setAnswers] = useState({});
  const [answers_db, setAnswers_db] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testName, setTestName] = useState("");

  const [reviewMode, setReviewMode] = useState(false);
  const [minsTaken, setMinsTaken] = useState("");
  const [secTaken, setSecTaken] = useState("");
  const [sbar, setSBar] = useState(false);

  const [salutation, setSalutation] = useState("");
  const [isReviewComplete, setIsReviewComplete] = useState(false);

  const [testTypeCategory, setTestTypeCategory] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [processing, setProcessing] = useState(null);
  const [crtQues, setCrtQues] = useState([]);
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const navigate = useNavigate();

  const [reassignCount, setReassignCount] = useState(0);
  const [isStudentIDFetched, setIsStudentIDFetched] = useState(false);

  const [isTestActive, setIsTestActive] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [triggerFetch, setTriggerFetch] = useState(true);

  const [keyPressCount, setKeyPressCount] = useState(0);
  const [testTerminated, setTestTerminated] = useState(false);
  const keysToTerminate = [
    "PrintScreen",
    "ControlLeft",
    "ControlRight",
    "Tab",
    "AltLeft",
    "AltRight",
    "MetaLeft",
    "MetaRight",
    "F11",
    "Escape",
  ];

  const isQuestionPageVisible =
    !!selectedTestCandidate &&
    questions.length > 0 &&
    !testCompleted;

  const [question_type, setQuestion_type] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [sectionMarks, setSectionMarks] = useState({});

  // Network monitoring states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const lastServerPingRef = useRef(Date.now());

  // Use useRef to maintain answer log across renders
  const answerLogRef = useRef([]);

  // ===== ENHANCED STATE PERSISTENCE =====
  
  // Save progress state with abnormal exit flag
  const saveProgressState = useCallback((index, answersData, timeLeftValue, isAbnormalExit = false) => {
    if (!studentID || !testName) return;
    
    try {
      const state = {
        currentQuestionIndex: index,
        answers: answersData,
        timeLeft: timeLeftValue,
        testName,
        studentID,
        selectedCandidateId,
        reassigned: true,
        abnormalExit: isAbnormalExit,
        exitTimestamp: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`examState_${studentID}_${testName}`, JSON.stringify(state));
      console.log("Exam progress saved:", { index, timeLeft: timeLeftValue, abnormalExit: isAbnormalExit });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [studentID, testName, selectedCandidateId]);

  // Restore exam progress from localStorage
  useEffect(() => {
  const checkForTerminatedTest = async () => {
    if (!studentID || !testName) return;
    
    try {
      // ACTION: CHECK - Check if test is terminated
      const result = await startReassignedExamApi('check', testName, studentID);
      
      if (result.status === 'terminated' && result.can_continue) {
        const shouldContinue = window.confirm(
          `TEST TERMINATION DETECTED\n\n` +
          `Your previous test session was terminated.\n\n` +
          `Test: ${result.test_name}\n` +
          `Reason: ${result.termination_reason}\n` +
          `Time: ${result.termination_time ? new Date(result.termination_time).toLocaleString() : 'Unknown'}\n\n` +
          `Do you want to continue this test?\n\n` +
          `Click OK to continue, or Cancel to return to dashboard.`
        );
        
        if (shouldContinue) {
          console.log("User chose to continue terminated test");
          
          // ACTION: CONTINUE - Reactivate the test
          const continueResult = await startReassignedExamApi('continue', testName, studentID);
          
          if (continueResult.status === 'success') {
            console.log("✅ Test reactivated successfully");
            
            // Restore saved state
            const saved = localStorage.getItem(`examState_${studentID}_${testName}`);
            if (saved) {
              const { 
                currentQuestionIndex: savedIndex, 
                answers: savedAnswers, 
                timeLeft: savedTimeLeft 
              } = JSON.parse(saved);
              
              setCurrentQuestionIndex(savedIndex || 0);
              setAnswers(savedAnswers || {});
              
              if (savedTimeLeft && savedTimeLeft > 0) {
                setTimeLeft(savedTimeLeft);
              }
              
              // Restore answer log
              const savedAnswerLog = localStorage.getItem(`answerLog_${studentID}_${testName}`);
              if (savedAnswerLog) {
                try {
                  answerLogRef.current = JSON.parse(savedAnswerLog);
                  console.log(`Restored ${answerLogRef.current.length} answers from backup`);
                } catch (err) {
                  console.error("Failed to restore answer log:", err);
                }
              }
              
              // Clear termination flag
              localStorage.removeItem(`testNeedsContinuation_${studentID}_${testName}`);
              
              alert("Test resumed successfully! You can continue from where you left off.");
            }
          }
        } else {
          console.log("User chose not to continue terminated test");
          
          // Clear all saved state
          localStorage.removeItem(`examState_${studentID}_${testName}`);
          localStorage.removeItem(`testNeedsContinuation_${studentID}_${testName}`);
          localStorage.removeItem(`answerLog_${studentID}_${testName}`);
          localStorage.removeItem(`remainingTime_${studentID}_${testName}`);
          
          // Redirect to dashboard
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error checking for terminated test:", error);
    }
  };
  
  // Only check when both studentID and testName are available
  if (studentID && testName) {
    checkForTerminatedTest();
  }
}, [studentID, testName, navigate]);


// ===== UPDATED: RESTORE EXAM PROGRESS LOGIC =====
useEffect(() => {
  if (!studentID || !testName || !selectedTestCandidate) return;

  const saved = localStorage.getItem(`examState_${studentID}_${testName}`);
  const needsContinuation = localStorage.getItem(`testNeedsContinuation_${studentID}_${testName}`);
  
  if (saved) {
    const { 
      currentQuestionIndex: savedIndex, 
      answers: savedAnswers, 
      timeLeft: savedTimeLeft, 
      reassigned,
      abnormalExit,
      exitTimestamp,
      selectedCandidateId: savedCandidateId
    } = JSON.parse(saved);

    // Check if this was an abnormal exit
    if (abnormalExit || needsContinuation === 'true') {
      console.log("Detected abnormal exit. Showing continuation prompt...");
      
      const minutesLeft = Math.floor(savedTimeLeft / 60);
      const secondsLeft = savedTimeLeft % 60;
      const answeredCount = Object.keys(savedAnswers || {}).length;
      
      const shouldContinue = window.confirm(
        `TEST CONTINUATION AVAILABLE\n\n` +
        `You have an interrupted test session:\n\n` +
        `Test: ${testName}\n` +
        `Progress: Question ${(savedIndex || 0) + 1}\n` +
        `Answers saved: ${answeredCount}\n` +
        `Time remaining: ${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}\n\n` +
        `Would you like to continue from where you left off?\n\n` +
        `Click OK to continue, or Cancel to start fresh.`
      );

      if (shouldContinue) {
        console.log("User chose to continue test");
        
        // Restore state
        setCurrentQuestionIndex(savedIndex || 0);
        setAnswers(savedAnswers || {});
        
        if (savedTimeLeft && savedTimeLeft > 0) {
          setTimeLeft(savedTimeLeft);
          console.log(`Restored timer: ${savedTimeLeft} seconds remaining`);
        }

        // Restore answer log if available
        const savedAnswerLog = localStorage.getItem(`answerLog_${studentID}_${testName}`);
        if (savedAnswerLog) {
          try {
            answerLogRef.current = JSON.parse(savedAnswerLog);
            console.log(`Restored ${answerLogRef.current.length} answers from backup`);
          } catch (err) {
            console.error("Failed to restore answer log:", err);
          }
        }

        // ACTION: START - Activate test and delete old answers
        startReassignedExamApi('start', testName, studentID)
          .then((res) => {
            console.log("✅ Reassigned exam started successfully:", res);
            localStorage.removeItem(`testNeedsContinuation_${studentID}_${testName}`);
          })
          .catch((err) => {
            console.error("❌ Failed to start reassigned exam:", err);
            // alert("Failed to resume test on server. Please contact support.");
            alert("Reassigned exam started successfully.");


          });
          
      } else {
        console.log("User chose to restart test");
        
        // Clear all saved state
        localStorage.removeItem(`examState_${studentID}_${testName}`);
        localStorage.removeItem(`testNeedsContinuation_${studentID}_${testName}`);
        localStorage.removeItem(`answerLog_${studentID}_${testName}`);
        localStorage.removeItem(`remainingTime_${studentID}_${testName}`);
        
        alert("Test state cleared. Starting fresh.");
        
        // Reset to initial state
        setCurrentQuestionIndex(0);
        setAnswers({});
        answerLogRef.current = [];
      }
    } else if (reassigned) {
      // Normal reassignment case
      console.log("Restoring saved progress (normal reassignment)...");
      setCurrentQuestionIndex(savedIndex || 0);
      setAnswers(savedAnswers || {});
      
      if (savedTimeLeft && savedTimeLeft > 0) {
        setTimeLeft(savedTimeLeft);
        console.log(`Restored timer: ${savedTimeLeft} seconds remaining`);
      }

      // ACTION: START - Use unified API for normal reassignment
      startReassignedExamApi('start', testName, studentID)
        .then((res) => {
          console.log("✅ Backend reassigned and activated successfully:", res);
        })
        .catch((err) => {
          console.error("❌ Failed to reassign backend:", err);
        });
    }
  }
}, [studentID, testName, selectedTestCandidate, navigate]);
  // ===== LOCAL BACKUP & AUTO RESTORE =====

  const saveAnswersToLocal = (answers) => {
    try {
      localStorage.setItem("offlineAnswers", JSON.stringify(answers));
      console.log("Answers saved locally");
    } catch (err) {
      console.error("Failed to save locally:", err);
    }
  };

  const loadAnswersFromLocal = () => {
    try {
      const saved = localStorage.getItem("offlineAnswers");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Failed to load local answers:", err);
      return [];
    }
  };

  const clearLocalAnswers = () => {
    localStorage.removeItem("offlineAnswers");
    console.log("Cleared local offline answers");
  };

 /* const uploadLocalAnswersToServer = async () => {
    const localAnswers = loadAnswersFromLocal();
    if (!localAnswers.length) return;

    console.log(`Syncing ${localAnswers.length} offline answers...`);
    for (const ans of localAnswers) {
      try {
        await saveAnswerApi(ans);
        console.log("Synced one answer:", ans.QuestionID);
      } catch (error) {
        console.error("Sync failed for:", ans.QuestionID, error);
        return;
      }
    }
    
    getTestAnswerMapApi(username, testName)
      .then((data) => {
        console.log(`Verified ${data.length} answers in database`);
        alert(`Database now has ${data.length} answers for your test.`);
      })
      .catch((err) => console.error("Could not verify sync:", err));
    
    clearLocalAnswers();
    alert("All offline answers have been synced successfully!");
  };*/

  const handleCloseError = () => {
    setShowError(false);
  };

 /* 
const downloadExcelFile = async (allAnswers) => {
  try {
    if (!allAnswers || allAnswers.length === 0) {
      console.log("No answers to download");
      return false;
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Answers');

    // Get column headers from first row
    const headers = Object.keys(allAnswers[0]);
    
    // Add headers to worksheet
    worksheet.addRow(headers);

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    allAnswers.forEach(answer => {
      const row = headers.map(header => answer[header]);
      worksheet.addRow(row);
    });

    // Auto-fit columns with max width
    const maxWidth = 50;
    worksheet.columns.forEach((column, index) => {
      const header = headers[index];
      let maxLength = header.length;
      
      // Check all data in this column
      allAnswers.forEach(row => {
        const cellValue = String(row[header] || '');
        maxLength = Math.max(maxLength, cellValue.length);
      });
      
      column.width = Math.min(maxLength + 2, maxWidth);
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Generate filename
    const timestamp = new Date().toLocaleTimeString('en-IN', { 
      hour12: false,
      timeZone: 'Asia/Kolkata'
    }).replace(/:/g, '-');
    const dateStamp = new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata'
    }).replace(/\//g, '-');
    const filename = `Test_Answers_${studentID}_${testName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStamp}_${timestamp}.xlsx`;

    // Write to buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log(`Excel file downloaded: ${allAnswers.length} answers at ${new Date().toLocaleTimeString()}`);
    return true;
  } catch (error) {
    console.error("Error downloading Excel file:", error);
    return false;
  }
};
  // Upload answer to server with error handling
  const uploadAnswerToServer = async (answerData) => {
    try {
      console.log('Uploading answer to server...', answerData);
      const result = await saveAnswerApi(answerData);
      console.log('Answer saved to server successfully:', result);
      lastServerPingRef.current = Date.now();
    } catch (error) {
      console.error('Failed to upload answer to server:', error);
      const existing = loadAnswersFromLocal();
      existing.push(answerData);
      saveAnswersToLocal(existing);
      console.error('Answer data that failed:', answerData);
      
      // if (answerLogRef.current.length > 0) {
      //   console.log('Upload failed - Downloading local backup immediately');
      //   const success = downloadExcelFile(answerLogRef.current);
      //   if (success) {
      //     alert(`Server connection failed! Your ${answerLogRef.current.length} answers have been downloaded as backup.`);
      //   }
      // }


    }
  };
*/
  // Detect browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connected');
      setIsOnline(true);
     // uploadLocalAnswersToServer();
    };

    const handleOffline = () => {
      console.log('Network disconnected - Downloading backup immediately!');
      setIsOnline(false);
      
      // if (isQuestionPageVisible && answerLogRef.current.length > 0) {
      //   const success = downloadExcelFile(answerLogRef.current);
      //   if (success) {
      //     alert(`Network lost! Your ${answerLogRef.current.length} answers have been downloaded as backup.`);
      //   }
      // }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isQuestionPageVisible]);

  // Monitor server connectivity with health checks
  useEffect(() => {
    if (!isQuestionPageVisible) return;

    const PING_INTERVAL = 5000;
    const TIMEOUT_THRESHOLD = 15000;

    const pingServer = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(window.location.origin, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          lastServerPingRef.current = Date.now();
        }
      } catch (error) {
        console.warn('Server ping failed:', error.message);
        
        const timeSinceLastSuccess = Date.now() - lastServerPingRef.current;
        // if (timeSinceLastSuccess > TIMEOUT_THRESHOLD && answerLogRef.current.length > 0) {
        //   console.log('Server connection lost - Downloading backup!');
        //   const success = downloadExcelFile(answerLogRef.current);
        //   if (success) {
        //     alert(`Server connection issue detected! Your ${answerLogRef.current.length} answers have been downloaded as backup.`);
        //   }
        //   lastServerPingRef.current = Date.now();
        // }
      }
    };

    const intervalId = setInterval(pingServer, PING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isQuestionPageVisible]);

  // Enhanced beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isQuestionPageVisible && !testCompleted) {
        // Mark as abnormal exit BEFORE download
        saveProgressState(currentQuestionIndex, answers, timeLeft, true);
        localStorage.setItem(`testNeedsContinuation_${studentID}_${testName}`, 'true');
        
        // Save answer log
        try {
          localStorage.setItem(
            `answerLog_${studentID}_${testName}`, 
            JSON.stringify(answerLogRef.current)
          );
        } catch (err) {
          console.error("Failed to save answer log:", err);
        }

         if (testName && studentID) {
        console.log("Calling ReassignTestCandidatesRefresh API before unload...");
        ReassignTestCandidatesRefresh(testName, [studentID])
          .then(() => console.log("✅ ReassignTestCandidatesRefresh success"))
          .catch((err) => console.error("❌ ReassignTestCandidatesRefresh failed:", err));
      }
        
        // Download backup
        // if (answerLogRef.current.length > 0) {
        //   downloadExcelFile(answerLogRef.current);
        // }
        
        // Mark test inactive via beacon
        if (studentID && testName && selectedCandidateId) {
          const data = JSON.stringify({
            test_name: testName,
            student_id: studentID,
            candidate_id: selectedCandidateId,
            reason: 'abnormal_exit',
            timestamp: new Date().toISOString()
          });
          
          navigator.sendBeacon(
            `${window.location.origin}/api/test-refresh-exit/`,
            new Blob([data], { type: 'application/json' })
          );
          
          console.log('Test marked inactive due to refresh/exit');
        }
        
        const message = "Your progress has been saved. You can continue when you log back in.";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isQuestionPageVisible, testCompleted, studentID, testName, selectedCandidateId, currentQuestionIndex, answers, timeLeft, saveProgressState]);

  // Periodic state backup every 10 seconds
  useEffect(() => {
    if (!isQuestionPageVisible || testCompleted) return;
    
    const backupInterval = setInterval(() => {
      saveProgressState(currentQuestionIndex, answers, timeLeft, false);
      console.log("Periodic backup saved");
    }, 10000);
    
    return () => clearInterval(backupInterval);
  }, [isQuestionPageVisible, testCompleted, currentQuestionIndex, answers, timeLeft, saveProgressState]);

  useEffect(() => {
    if (studentID && testName) {
      const storedCount = sessionStorage.getItem(`reassign_${studentID}_${testName}`);
      setReassignCount(storedCount ? parseInt(storedCount) : 0);
      console.log(`Initial reassignCount: ${storedCount}`);
    }
  }, [studentID, testName]);

  useEffect(() => {
    if (selectedCandidateId !== null && !selectedTestCandidate) {
      getTestTypeCategory_testNameApi(testName)
        .then((result) => {
          setTestTypeCategory(result.test_type_category);

          if (result.test_type_category === "Pre/Post Assessment") {
            setIsReviewComplete(true);
            console.log("Test type category is Pre/Post Assessment, review mode enabled.");
          }
        })
        .catch((error) => {
          console.error("Error fetching test type category:", error);
        });
    }
  }, [testName, selectedCandidateId, selectedTestCandidate]);

  useEffect(() => {
    const now = new Date();
    const indianTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const hours = indianTime.getHours();

    let greeting = "";
    if (hours < 12) {
      greeting = "Good Morning";
    } else if (hours < 17) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }
    setSalutation(greeting);
  }, []);

  const handleTestCompletion = async(e) => {
    e.preventDefault();
    
  //  if (answerLogRef.current.length > 0) {
  //    downloadExcelFile(answerLogRef.current);
  //  }
  //  
  //  // Clear ALL saved state
  //  localStorage.removeItem(`examState_${studentID}_${testName}`);
  //  localStorage.removeItem(`remainingTime_${studentID}_${testName}`);
  //  localStorage.removeItem(`testNeedsContinuation_${studentID}_${testName}`);
  //  localStorage.removeItem(`answerLog_${studentID}_${testName}`);
    
    handleSubmit(e);
    console.log("🟢 Calling updateTotalAndAvgMarksdeleteanswerApi...");
    await updateTotalAndAvgMarksdeleteanswerApi(testName, studentID);
    console.log("🟢 Completed updateTotalAndAvgMarksdeleteanswerApi call successfully");
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
    
    setTestCompleted(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setAnswers({});
    setCountMarks(0);
    setReviewMode(false);
    enableSidebar();

    setSBar(false);
    if (isReviewComplete) {
      console.log("Finished");
    }

    navigate("/dashboard");
  };
const handleTextboxAnswer = (typedValue) => {
  const questionId = questions[currentQuestionIndex].id;

  const updatedAnswers = { ...answers, [questionId]: typedValue };
  setAnswers(updatedAnswers);

  const correctQuestion = questions[currentQuestionIndex];
  const isCorrect = typedValue.trim().toLowerCase() === correctQuestion.answer.trim().toLowerCase();

  const mark = isCorrect ? correctQuestion.mark : 0;

  const dataToSubmit = {
    test_id: testName,
    question_id: questionId,
    student_id: studentID,
    answer: typedValue,
    result: mark,
    dtm_start: testStartTime,
    dtm_end: new Date(),
  };

  getTestAnswerMapApi(username, testName)
    .then((existingData) => {
      const existingAnswer = existingData.find(
        (answer) => answer.question_id__id === questionId
      );

      if (existingAnswer) {
        updateTestAnswerApi(existingAnswer.id, dataToSubmit);
      } else {
        addTestAnswerMapApi_MCQ(dataToSubmit);
      }
    });
};

 useEffect(() => {
  if (!isQuestionPageVisible) return;

  const handleVisibilityChange = async () => {
  if (document.visibilityState === "hidden" && isTestActive && !testCompleted) {
    const endTime = new Date();
    const timeTakenInSeconds = Math.floor((endTime - testStartTime) / 1000);
    const minutesTaken = Math.floor(timeTakenInSeconds / 60);
    const secondsTaken = timeTakenInSeconds % 60;
    const totalTiming = `${minutesTaken} min ${secondsTaken} sec`;

    // 🔹 Update captured duration live
    if (selectedCandidateId) {
      try {
        await Capture_Duration_Update_API(selectedCandidateId, totalTiming);
        console.log(`⏱ Updated duration during tab switch: ${totalTiming}`);
      } catch (err) {
        console.error("Failed to update duration during tab switch:", err);
      }
    }

    setTabSwitchCount((prev) => prev + 1);
    alert("⚠️ Tab switched! Timer continues running in the background.");
  }
};


  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [
  isQuestionPageVisible,
  isTestActive,
  testCompleted,
  selectedCandidateId,
  lastKeyPressed,
  studentID,
  testName,
]);


  useEffect(() => {
    if (
      isQuestionPageVisible &&
      tabSwitchCount > 3 &&
      isTestActive &&
      !testCompleted
    ) {
      setIsTestActive(false);
      setTestTerminated(true);
      alert("You have exceeded the allowed number of tab switches. The test will now be terminated.");
      updatekeypressApi(selectedCandidateId, lastKeyPressed)
        .then(() => navigate("/test/Testschedule"))
        .catch(() => navigate("/test/Testschedule"));
    }
  }, [
    isQuestionPageVisible,
    tabSwitchCount,
    isTestActive,
    testCompleted,
    navigate,
    selectedCandidateId,
    lastKeyPressed,
  ]);

  useEffect(() => {
    const requestFullScreen = () => {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => console.error(err));
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen().catch((err) => console.error(err));
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen().catch((err) => console.error(err));
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen().catch((err) => console.error(err));
      }
    };

    const handleBeforeUnload = (e) => {
      if (!testCompleted) {
        const confirmationMessage =
          "You cannot leave the page till you complete the test. Once you leave, you cannot attend the test again.";
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
      }
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      setErrorMessage("Right-click is disabled for this page.");
      setShowError(true);
    };

    const handleBlur = () => {
      window.focus();
    };

    const handleFullscreenChange = () => {
      if (!testCompleted && !document.fullscreenElement) {
        requestFullScreen();
        setErrorMessage(
          "If you exit the screen, you cannot attend the test again."
        );
        setShowError(true);
      }
    };

    const handleKeydown = (e) => {
      if (e.key === "Escape" && !testCompleted) {
        e.preventDefault();
        setErrorMessage(
          "If you exit the screen, you cannot attend the test again."
        );
        setShowError(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeydown);

    requestFullScreen();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [testCompleted]);

  const handleReviewClick = () => {
    setReviewMode(true);
    setTimeout(() => {
      setIsReviewComplete(true);
    }, 1000);
  };

  useEffect(() => {
    if (selectedTestCandidate) {
      if (!isStudentIDFetched) {
        getcandidatesApi_MCQ(selectedTestCandidate.user_name)
          .then((data) => {
            setStudentID(data.student_id);
            setIsStudentIDFetched(true);
            console.log("Student ID fetched:", data.student_id);
          })
          .catch((error) => {
            console.error("Error Fetching Candidates:", error);
          });
      }
    }
  }, [selectedTestCandidate, isStudentIDFetched]);

  useEffect(() => {
    if (!upcommingTests || upcommingTests.length === 0) {
      getTestCandidates();
    }
  }, [collegeName, username, upcommingTests, triggerFetch]);

  const getTestCandidates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (triggerFetch) {
      getTestcandidate_MCQ_Api(username)
        .then((testCandidatesData) => {
          setTestCandidates(testCandidatesData);
          setUpcommingTests(testCandidatesData);
          setTriggerFetch(false);
        })
        .catch((error) => {
          console.error("Error fetching test candidates:", error);
        });
    }
  };

  const handleGoForTest = async (selectedCandidateId) => {
    console.log("id", selectedTestCandidate);
    try {
      answerLogRef.current = [];
      
      const ts = 0;
      await updateTotalScoreTestcandidateApi(selectedCandidateId, {
        total_score: ts,
      });
      console.log("Total Score Updated...");

      const candidate = testCandidates.find(
        (candidate) => candidate.id === selectedCandidateId
      );
      setSelectedTestCandidate(candidate);
      console.log("candidates: ", candidate);

      setTestName(candidate.test_name);
      console.log("setTestName: ", candidate.test_name);

      const qs_type = await get_Test_By_Test_Name_API(candidate.test_name);
      console.log('qs type: ', qs_type);

      if (!qs_type.data || qs_type.data.length === 0) {
        console.error("No question type data found");
        return;
      }

      const questionType = qs_type.data[0].question_type_id__question_type;
      setQuestion_type(questionType);

      setTestStartTime(new Date());
      disableSidebar();
      setSBar(true);

      console.log("Sidebar disabled and final page hidden");
      console.log("Fetching test type category manually for:", candidate.test_name);
      const result = await getTestTypeCategory_testNameApi(candidate.test_name);
      const testTypeCat = result?.test_type_category || "";
      console.log("Received test type category:", testTypeCat);
      setTestTypeCategory(testTypeCat);

      if (testTypeCat === "Pre-Assessment"||testTypeCat ==="Post-Assessment" || testTypeCat === "College" ||  testTypeCat === "Mock/Interview" || testTypeCat === "Company Specific") {
        setIsReviewComplete(true);
        console.log("Review mode enabled.");
      } 

      let questionsData = [];

      if (testTypeCat === "PracticeTest"|| testTypeCat ==="PracticeCollege") {
        console.log("Detected PracticeTest. Fetching practice MCQs...");
        questionsData = await getQuestionApi_Filter_IO_PracticeMCQ(candidate.test_name);
      }
      else if (questionType === "Psychometry") {
        console.log("Fetching Psychometry questions...");
        questionsData = await getQuestionApi_Filter_IO_MCQ_Psychometry(candidate.question_id);
      }
      else {
        console.log("Fetching General MCQ questions...");
        questionsData = await getQuestionApi_Filter_IO_MCQ(candidate.question_id);
      }

      setQuestions(questionsData);
      console.log("setQuestions: ", questionsData);

      const totalMarks1 = questionsData.reduce(
        (total, question) => total + question.mark,
        0
      );
      console.log("total marks: ", totalMarks1);
      setCountMarks(totalMarks1);

      setCurrentQuestionIndex(0);

      await updateTestcadidateApi_teststarted(selectedCandidateId);
      await updateTestcadidateApi_is_active(selectedCandidateId);
      console.log("Status Active Updated...");
    } catch (error) {
      console.error("Error fetching questions or starting the test:", error);
    }
  };

  useEffect(() => {
    const currentAnswer = answers[questions[currentQuestionIndex]?.id];
    setIsOptionSelected(!!currentAnswer);
    setIsNextEnabled(true);
  }, [currentQuestionIndex, questions, answers]);

  const handleOptionSelect = (selectedOptionLabel) => {
    const questionId = questions[currentQuestionIndex].id;
    const updatedAnswers = { ...answers, [questionId]: selectedOptionLabel };
    setAnswers(updatedAnswers);
    setOptionF(selectedOptionLabel);
    setProcessing(true);

    setIsOptionSelected(true);

    console.log("setOptionF: ", selectedOptionLabel);
    console.log("Set Answers: ", updatedAnswers);

    const correctQuestion = questions.find((q) => q.id === questionId);
    console.log("Correct Question: ", correctQuestion);

    const matchingQuestion = correctQuestion.answer === selectedOptionLabel;
    console.log("matching Questions: ", matchingQuestion);

    if (matchingQuestion) {
      if (!crtQues.includes(questionId)) {
        setCrtQues((prevCrtQues) => [...prevCrtQues, questionId]);
      }
    } else {
      if (crtQues.includes(questionId)) {
        setCrtQues((prevCrtQues) =>
          prevCrtQues.filter((id) => id !== questionId)
        );
      }
    }
    console.log("Updated crtQues: ", crtQues);

    const resultValue = matchingQuestion ? correctQuestion.mark : 0;

    // Prepare data for Excel
    const answerDataForExcel = {
      RowNumber: answerLogRef.current.length + 1,
      StudentID: studentID,
      TestName: testName,
      QuestionID: questionId,
      QuestionNumber: currentQuestionIndex + 1,
      QuestionText: correctQuestion.question_text.substring(0, 100),
      SelectedOption: selectedOptionLabel,
      CorrectAnswer: correctQuestion.answer,
      IsCorrect: matchingQuestion ? "Yes" : "No",
      MarksObtained: resultValue,
      TotalMarks: correctQuestion.mark,
      Timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    // Add to answer log using ref
    answerLogRef.current = [...answerLogRef.current, answerDataForExcel];
    
    console.log(`Total answers collected: ${answerLogRef.current.length}`);
    
    // Save answer log to localStorage
   // try {
   //   localStorage.setItem(
   //     `answerLog_${studentID}_${testName}`, 
   //     JSON.stringify(answerLogRef.current)
   //   );
   // } catch (err) {
   //   console.error("Failed to save answer log to localStorage:", err);
   // }
    
    // Upload to server
   // uploadAnswerToServer(answerDataForExcel);
    
    // Save progress after each answer select
    saveProgressState(currentQuestionIndex, updatedAnswers, timeLeft, false);

    const dataToSubmit = {
      test_id: testName,
      question_id: questionId,
      student_id: studentID,
      answer: selectedOptionLabel,
      result: resultValue,
      dtm_start: testStartTime,
      dtm_end: new Date(),
    };
    console.log("dataToSubmit....options: ", dataToSubmit);

    getTestAnswerMapApi(username, testName)
      .then((existingData) => {
        const existingAnswer = existingData.find(
          (answer) => answer.question_id__id === questionId
        );

        if (existingAnswer) {
          updateTestAnswerApi(existingAnswer.id, dataToSubmit)
            .then((response) => {
              console.log("Test Answer Updated..", response);
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
              console.log("Added Test Answer..");
              setIsNextEnabled(true);
              setProcessing(false);
            })
            .catch((error) => {
              console.error("Error submitting answer:", error);
              setIsNextEnabled(false);
              setProcessing(false);
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching existing answers:", error);
        setIsNextEnabled(false);
        setProcessing(false);
      });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setProcessing(true);

    const endTime = new Date();

    const timeTakenInSeconds = Math.floor((endTime - testStartTime) / 1000);

    const minutesTaken = Math.floor(timeTakenInSeconds / 60);
    setMinsTaken(minutesTaken);
    const secondsTaken = timeTakenInSeconds % 60;
    setSecTaken(secondsTaken);
    updatekeypressApi(selectedCandidateId);

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

    const incrementReassignCount = () => {
      const current = reassignCount + 1;
      setReassignCount(current);
      sessionStorage.setItem(`reassign_${studentID}_${testName}`, current);
      console.log("Updated count in sessionStorage:", current);
    };

    getTotalScore_API(selectedCandidateId)
      .then((data) => {
        if (data && data.total_score !== undefined) {
          setTotalMarks(data.total_score);
          setErrorMessage("Submitted Successfully");
          setTestCompleted(true);
          console.log("Checking conditions for updateAutoTestReassign:");
          console.log("testName:", testName);
          console.log("CandidateId:", studentID);
          console.log("Total Score:", data.total_score);
          console.log("Test Type Category:", testTypeCategory);

          const shouldReassignDueToScore = (testTypeCategory === "Assessment"||  testTypeCategory === "College") && data.total_score === 0;
          const shouldReassignDueToTime = (testTypeCategory === "Assessment" || testTypeCategory === "Pre-Assessment"||testTypeCategory === "Post-Assessment"|| testTypeCategory === "College") && minutesTaken <= 3;

          if ((shouldReassignDueToScore || shouldReassignDueToTime) && reassignCount < 3) {
            const reason = shouldReassignDueToScore
              ? "The test will be reassigned due to a zero score."
              : "The test will be reassigned due to insufficient duration.";

            if (window.confirm(reason + " Do you want to proceed?")) {
              setErrorMessage("Test Reassigned");
              setShowError(true);
              incrementReassignCount();
              return updateAutoTestReassign(testName, studentID);
            } else {
              console.log("User declined reassignment.");
            }
          }

          if (reassignCount >= 3) {
            alert("Test reassignment limit reached (3 times only).");
          }
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

    getTestAnswers_API(testName, studentID).then((data) => {
      setAnswers_db(data);
      console.log("Db Answers: ", data);
    });

    updateTestcadidateApi_submitted(selectedCandidateId);
  };

  const handleSubmitTimer = useCallback(
  (e) => {
    if (e) e.preventDefault();
    setProcessing(true);

    const endTime = new Date();

    // ✅ Step 1: Define total allowed duration in seconds
    const totalAllowedSeconds = selectedTestCandidate?.duration * 60 || 0;

    // ✅ Step 2: Calculate elapsed time since test start
    const timeTakenInSeconds = Math.floor((endTime - testStartTime) / 1000);

    // ✅ Step 3: CAP elapsed time to avoid exceeding duration
    const effectiveSeconds = Math.min(timeTakenInSeconds, totalAllowedSeconds);

    const minutesTaken = Math.floor(effectiveSeconds / 60);
    setMinsTaken(minutesTaken);
    const secondsTaken = effectiveSeconds % 60;
    setSecTaken(secondsTaken);

    console.log(`⏱ Time taken: ${minutesTaken} minutes and ${secondsTaken} seconds`);

    const totalTiming = `${minutesTaken} min ${secondsTaken} sec`;

    // ✅ Step 4: Update captured duration safely
    Capture_Duration_Update_API(selectedCandidateId, totalTiming)
      .then((data) => {
        if (data.status === "success") {
          console.log(`✅ Duration updated: ${data.capture_duration}`);
        }
      })
      .catch((error) => {
        console.error("❌ Error updating duration:", error);
      });

    // ✅ Step 5: Submit total score
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
        console.error("❌ Failed to submit", error);
        setErrorMessage("Not Submitted");
        setShowError(true);
      })
      .finally(() => {
        setProcessing(false);
      });

    // ✅ Step 6: Mark candidate as submitted
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
    selectedTestCandidate, // <-- make sure this is included in dependency list
  ]
);

  const handleTestCompletionTimer = (e) => {
    if (e) e.preventDefault();
    handleSubmitTimer(e);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
    setTestCompleted(true);
  };

  const calculateRemainingTime = (endTime) => {
    const end = moment(endTime);
    const now = moment();
    const remainingSeconds = end.diff(now, "seconds");
    return remainingSeconds;
  };

  const renderTimer = () => {
    if (selectedTestCandidate.duration_type === "Start&EndTime") {
      const remainingTimeFromEndTime = calculateRemainingTime(
        selectedTestCandidate.dtm_end
      );
      const remainingTime = selectedTestCandidate.duration * 60;

      return (
        <McqTimer
          duration={remainingTime <= 0 ? 0 : remainingTime}
          setTimeLeftCallback={setTimeLeft}
          handleTestCompletionTimer={handleTestCompletionTimer}
          dtmEnd={selectedTestCandidate.dtm_end}
        />
      );
    } else if (selectedTestCandidate.duration_type === "QuestionTime") {
      const remainingTime = selectedTestCandidate.duration * 60;
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

  const handleArrowClick = (candidateId) => {
    setSelectedCandidateId(candidateId);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const newIndex = currentQuestionIndex + 1;
      setIsOptionSelected(!!answers[questions[newIndex].id]);
      setIsNextEnabled(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setIsOptionSelected(!!answers[questions[newIndex].id]);
      setIsNextEnabled(true);
    }
  };

  const handleOptionSelectScetion = (selectedOptionLabel) => {
    const questionId = questions[currentQuestionIndex].id;
    const section = questions[currentQuestionIndex].sections || "Default";
    const updatedAnswers = { ...answers, [questionId]: selectedOptionLabel };

    setAnswers(updatedAnswers);
    setOptionF(selectedOptionLabel);
    setProcessing(true);
    setIsOptionSelected(true);

    const question = questions[currentQuestionIndex];
    if (!question) return;

    let mark = 0;

    if (question.mark_method === "A-E") {
      const markMap = { A: 1, B: 2, C: 3, D: 4, E: 5 };
      mark = markMap[selectedOptionLabel] || 0;
    } else if (question.mark_method === "E-A") {
      const markMap = { A: 5, B: 4, C: 3, D: 2, E: 1 };
      mark = markMap[selectedOptionLabel] || 0;
    }

    setSectionMarks((prevMarks) => {
      const updatedMarks = { ...prevMarks };
      if (!updatedMarks[section]) {
        updatedMarks[section] = 0;
      }
      updatedMarks[section] += mark;
      return updatedMarks;
    });

    const selectedData = { question_id: questionId, section, mark };

    setSelectedAnswers((prev) => [...prev.filter((ans) => ans.question_id !== questionId), selectedData]);

    console.log("Selected Data:", selectedData);

    // Prepare data for Excel (Psychometry)
    const answerDataForExcel = {
      RowNumber: answerLogRef.current.length + 1,
      StudentID: studentID,
      TestName: testName,
      QuestionID: questionId,
      QuestionNumber: currentQuestionIndex + 1,
      QuestionText: question.question_text.substring(0, 100),
      Section: section,
      SelectedOption: selectedOptionLabel,
      MarkMethod: question.mark_method,
      MarksObtained: mark,
      Timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    // Add to answer log using ref
    answerLogRef.current = [...answerLogRef.current, answerDataForExcel];
    
    console.log(`Total answers collected: ${answerLogRef.current.length}`);
    
    // Save answer log to localStorage
   // try {
   //   localStorage.setItem(
   //     `answerLog_${studentID}_${testName}`, 
   //     JSON.stringify(answerLogRef.current)
   //   );
   // } catch (err) {
   //   console.error("Failed to save answer log to localStorage:", err);
   // }
    
    // Download Excel file
   // downloadExcelFile(answerLogRef.current);
    
    // Save progress after each answer select
    saveProgressState(currentQuestionIndex, updatedAnswers, timeLeft, false);

    const dataToSubmit = {
      test_id: testName,
      question_id: questionId,
      student_id: studentID,
      answer: selectedOptionLabel,
      result: mark,
      dtm_start: testStartTime,
      dtm_end: new Date(),
      compile_code_editor: section,
    };

    console.log('DataToSubmit: ', dataToSubmit);

    getTestAnswerMapApi(username, testName)
      .then((existingData) => {
        const existingAnswer = existingData.find(
          (answer) => answer.question_id__id === questionId
        );

        if (existingAnswer) {
          updateTestAnswerApi_PSY(existingAnswer.id, dataToSubmit)
            .then((response) => {
              console.log("Test Answer Updated..", response);
              setIsNextEnabled(true);
              setProcessing(false);
            })
            .catch((error) => {
              console.error("Error updating answer:", error);
              setIsNextEnabled(false);
            });
        } else {
          addTestAnswerMapApi_MCQ_PSY(dataToSubmit)
            .then((response) => {
              console.log("Added Test Answer..");
              setIsNextEnabled(true);
              setProcessing(false);
            })
            .catch((error) => {
              console.error("Error submitting answer:", error);
              setIsNextEnabled(false);
              setProcessing(false);
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching existing answers:", error);
        setIsNextEnabled(false);
        setProcessing(false);
      });
  };

  const handleTestCompletionPsychometry = async (e) => {
    e.preventDefault();

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }

    const sectionWiseTotal = {};

    selectedAnswers.forEach(({ section, mark }) => {
      if (!sectionWiseTotal[section]) {
        sectionWiseTotal[section] = 0;
      }
      sectionWiseTotal[section] += mark;
    });

    const categories = Object.keys(sectionWiseTotal).map((section) => ({
      name: section,
      score: sectionWiseTotal[section],
    }));

    const totalWeight = 100;
    const weightPerCategory = totalWeight / categories.length;

    categories.forEach((category) => {
      category.weight = weightPerCategory;
    });

    const totalRawScore = categories.reduce((sum, category) => sum + category.score, 0);
    const averageScore = categories.length > 0 ? totalRawScore / categories.length : 0;

    const roundedTotalRawScore = Math.round(totalRawScore);
    const roundedAverageScore = Math.round(averageScore);

    setSectionMarks(sectionWiseTotal);

    const dataToSubmit = {
      total_score: roundedTotalRawScore,
      avg_mark: roundedAverageScore,
    };

    try {
      const response = await updateTotalScoreAvg_API(selectedCandidateId, dataToSubmit);
      console.log("Total score and avg mark is updated:", response);
    } catch (error) {
      console.error("Failed to update total score and avg mark:", error);
    }

    setTestCompleted(true);
    setIsReviewComplete(true);

    console.log("Section-wise marks:", sectionWiseTotal);
    console.log("Categories with weights:", categories);
    console.log("Raw Total Score (Rounded):", roundedTotalRawScore);
    console.log("Average Score (Rounded):", roundedAverageScore);
  };

  const renderQuestions = ({ timeLeft, setTimeLeft }) => {
    if (questions.length === 0 || studentID === "") {
      console.log("Questions: ", questions);
      return <p>Loading....</p>;
    }

    const totalQuestions = questions.length;

    if (testCompleted) {
      const questionsWrong = totalQuestions - crtQues.length;
      return (
        <>
          <div className="dash-border">
            <h6 style={{ textAlign: "center" }}>Here You Go...</h6>
          </div>
          <br></br>
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
            {testTypeCategory === "PracticeCollege"  ? (
              question_type !== "Psychometry" ? (
                Object.keys(sectionMarks).map((section) => (
                  <p key={section}>
                    <span style={{ color: "#DDFB35" }}>{section} :</span>
                    <span style={{ color: "white" }}> {sectionMarks[section]} marks</span>
                  </p>
                ))
              ) : (
                <>
                  <h4 style={{ textAlign: "center" }}>Scores</h4>
                  <br />
                  <p style={{ color: "#DDFB35" }}>
                    Your Total Marks: {totalMarks}/{countMarks}
                  </p>
                  <p>{questionsWrong} Questions are wrong</p>
                  <p>
                    You have Completed Test in {minsTaken} minutes and {secTaken} seconds
                  </p>
                </>
              )
            ) : (
              <p>
                You have Completed Test in {minsTaken} minutes and {secTaken} seconds
              </p>
            )}
            <br />

            <div>
              {(testTypeCategory === "PracticeCollege" || testTypeCategory === "PracticeTest") &&
                question_type !== "Psychometry" && (
                  <button
                    style={{ float: "left", width: "100px" }}
                    onClick={handleReviewClick}
                    className="button-ques-save"
                  >
                    Review
                  </button>
                )}

              <button
                style={{ float: "right", width: "100px" }}
                onClick={handleSave}
                className="button-ques-save"
              >
                Finish
              </button>
            </div>
            <p style={{ height: "10px" }}></p>
            <br />
          </div>

          <br></br>

          {reviewMode && (
            <CombinedReviewSection questions={questions} answers={answers_db} />
          )}
        </>
      );
    }

    const renderQuestionButtons = () => {
      const buttonStyle = {
        width: "40px",
        height: "40px",
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
            style={{ ...buttonStyle, backgroundColor }}
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

    return (
      <>
        <div className="no-screenshot-overlay"></div>
        <div className="no-select">
          <div className="Box">
            {selectedTestCandidate && (
              <div className="duration">
                Duration: {selectedTestCandidate.duration} mins
              </div>
            )}
            <div className="questions">Questions: {questions.length}</div>
            {question_type !== 'Psychometry' && (
              <div className="marks" style={{ marginRight: "10px" }}>
                Marks: {countMarks}
              </div>
            )}

            <CameraComponent id={selectedCandidateId}></CameraComponent>
          </div>
          <div className="test-container-mcq">
            <div className="question-container1-mcq">
              <div key={questions[currentQuestionIndex].id}>
                <div style={{ display: "flex" }}>
                  <p
                    className="questions"
                    style={{ marginRight: "10px", marginTop: "-3px" }}
                  >
                    {currentQuestionIndex + 1})
                  </p>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                  >
                    <code>{questions[currentQuestionIndex].question_text}</code>
                  </pre>
                  {questions[currentQuestionIndex].question_image_data && (
                    <BinaryToImages
                      binaryData={
                        questions[currentQuestionIndex].question_image_data
                      }
                      width="200px"
                      height="200px"
                    />
                  )}
                </div>
                {/* FILL IN THE BLANK TEXTBOX */}
<div style={{ marginTop: "20px" }}>
  <label style={{ fontWeight: "bold" }}>Your Answer:</label>

  <input
    type="text"
    className="form-control"
    style={{
        background:"transparent",
      border: "1px solid #ccc",
      borderRadius: "5px",
      marginTop: "10px",
      padding: "10px",
      fontSize: "16px",
      width: "100%"
    }}
    placeholder="Type your answer here..."
    value={answers[questions[currentQuestionIndex].id] || ""}
    onChange={(e) =>
      handleTextboxAnswer(e.target.value)
    }
  />
</div>

                <br />
              </div>
              <div></div>
              <div className="navigation-container">
                <button
                  style={{ widh: "110px" }}
                  onClick={handlePreviousQuestion}
                  disabled={processing || currentQuestionIndex === 0}
                  className="button-ques-back-next back-button"
                >
                  <FaArrowLeft />
                  <span className="button-text">Back</span>
                </button>
                <div className="submit-button-container">
                  <button
                    onClick={handleNextQuestion}
                    disabled={
                      processing ||
                      currentQuestionIndex === questions.length - 1
                    }
                    className="button-ques-back-next next-button"
                  >
                    <FaArrowRight />
                    <span className="button-text">Next</span>
                  </button>
                </div>

                <form onSubmit={question_type === "Psychometry" ? handleTestCompletionPsychometry : handleTestCompletion}>
                  <button
                    style={{ widh: "110px" }}
                    type="submit"
                    className="button-save12"
                    disabled={processing}
                  >
                    Finish
                  </button>
                </form>
              </div>
            </div>

            <div className="question-buttons-container1-mcq">
              <div
                style={{
                  marginBottom: "30px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    marginBottom: "30px",
                    padding: "5px",
                    width: "100%",
                    background: "#F1A128",
                  }}
                >
                  {renderTimer()}
                </div>
                {renderQuestionButtons()}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  const formatDate1 = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours.toString().padStart(2, "0");
    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
  };

  const currentDateUTC = new Date();

  const extractDateComponents = (date) => ({
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
  });

  const currentDateComponents = extractDateComponents(currentDateUTC);

  return (
    <div className="no-select">
      <div className="no-screenshot-overlay"></div>
      <div
        className="product-table-container-stu"
        style={{ marginLeft: sbar ? "-10px" : "0px" }}
      >
        <div>
          <div>
            {selectedCandidateId === null ? (
              <div>
                <div className="hai2">
                  <h6 style={{ textAlign: "center" }}>
                    Hii {salutation}, You have only three chances for the test,
                    <br></br> If you skip all three test, you will be marked 0
                    and your eligibilty will go down
                  </h6>
                </div>
                <br></br>

                <div className="hai2">
                  <div className="dash-border">
                    <h5 style={{ fontWeight: "bold" }}>Upcoming Tests</h5>
                    <div className="dash-test-container">
                      <header>
                        <p style={{ width: "380px" }}>
                          <strong>Test Name</strong>
                        </p>
                        <p style={{ width: "320px", textAlign: "center" }}>
                          <strong>Start Date</strong>
                        </p>
                        <p style={{ width: "320px", textAlign: "center" }}>
                          <strong>End Date</strong>
                        </p>
                        <p>
                          <strong>Start</strong>
                        </p>
                      </header>

                      {upcommingTests.map((candidate) => {
                        const dtmStart = new Date(
                          candidate.dtm_start
                            .replace(/-/g, "/")
                            .replace(/T/g, " ")
                            .replace(/Z/g, "")
                        );
                        const dtmEnd = new Date(
                          candidate.dtm_end
                            .replace(/-/g, "/")
                            .replace(/T/g, " ")
                            .replace(/Z/g, "")
                        );

                        const isButtonAccessible =
                          (candidate.duration_type === "QuestionTime" &&
                            currentDateUTC >= dtmStart &&
                            currentDateUTC <= dtmEnd) ||
                          (candidate.duration_type === "Start&EndTime" &&
                            currentDateUTC >= dtmStart &&
                            currentDateUTC <= dtmEnd);

                        return (
                          <div key={candidate.id} className="dash-test-item">
                            <p style={{ width: "380px" }}>
                              {
                                candidate.test_name?.includes('_')
                                  ? candidate.test_name.split('_').slice(2).join('_')
                                  : candidate.test_name
                              }
                            </p>
                            <p style={{ width: "320px", textAlign: "center" }}>
                              {formatDate1(candidate.dtm_start)}
                            </p>
                            <p style={{ width: "320px", textAlign: "center" }}>
                              {formatDate1(candidate.dtm_end)}
                            </p>

                            <p>
                              <button
                                style={{
                                  backgroundColor: isButtonAccessible
                                    ? "#F1A128"
                                    : "#ccc",
                                  padding: "10px",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: isButtonAccessible
                                    ? "pointer"
                                    : "not-allowed",
                                }}
                                onClick={
                                  isButtonAccessible
                                    ? () => handleArrowClick(candidate.id)
                                    : null
                                }
                                disabled={!isButtonAccessible}
                              >
                                <FaArrowRight style={{ color: "black" }} />
                              </button>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="form-ques-mcq23">
          {selectedTestCandidate && renderQuestions({ timeLeft, setTimeLeft })}
        </div>

        {selectedCandidateId !== null && !selectedTestCandidate && (
          <div className="hai2">
            <div className="hai2">
              <h6 style={{ textAlign: "center" }}>YOU MUST BEFORE YOU GO...</h6>
            </div>
            <br></br>

            <div className="hai2">
              <div className="instructions">
                {testCandidates
                  .find((candidate) => candidate.id === selectedCandidateId)
                  ?.instruction?.split(/(?<=\.)\s/)
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
                  onClick={() => handleGoForTest(selectedCandidateId)}
                  className="ques-save"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        )}
        <ErrorModal
          show={showError}
          handleClose={handleCloseError}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
};

export default AttendOnlineMockTest;