import React, { useEffect, useState } from "react";
import { getEmployeeAnswers, getEmpUpcommingTest_API, getQuestionApi_HDFCAPI, submitEmployeeAnswer, updateEmployeeTestScore, updateTestempApi_is_active } from "../../api/endpoints";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';

const EmployeeAttendTest = ({ username }) => {
    const [upcomingTests, setUpcomingTests] = useState([]);
    const [view, setView] = useState("upcoming"); // "upcoming" | "instruction" | "test"
    const [selectedTest, setSelectedTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isNextEnabled, setIsNextEnabled] = useState(false);
    const [isOptionSelected, setIsOptionSelected] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [processing, setProcessing] = useState(false);
    const [crtQues, setCrtQues] = useState([]);
    const [testCompleted, setTestCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getEmpUpcommingTest_API(username);
                setUpcomingTests(data);
            } catch (error) {
                console.error("Error fetching tests:", error);
            }
        };

        fetchData();
    }, [username]);

    const handleArrowClick = async (testId) => {
        const selected = upcomingTests.find((t) => t.id === testId);
        setSelectedTest(selected);

        
        try {
            const testName = selected?.test_name;

            if (!testName) {
                alert("Test name not found!");
                return;
            }
            const response = await getQuestionApi_HDFCAPI(testName);
            console.log("✅ Questions loaded:", response);
            await updateTestempApi_is_active(selected.id);

            if (Array.isArray(response) && response.length > 0) {
                setQuestions(response);
                setView("test");
            } else {
                alert("No questions found for this test.");
            }
        } catch (error) {
            console.error("❌ Failed to fetch questions:", error);
            alert("Error fetching questions. Try again.");
        }
        
        setView("test");
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




    const handleOptionSelect = (selectedOptionLabel) => {
        const questionId = questions[currentQuestionIndex].id;
        const updatedAnswers = { ...answers, [questionId]: selectedOptionLabel };
        setAnswers(updatedAnswers);
        //  setOptionF(selectedOptionLabel);
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
            test_name: selectedTest.test_name,
            question_id: questionId,
            emp_id: selectedTest.employee_id,
            answer: selectedOptionLabel,
            result: resultValue,
        };

        console.log("dataToSubmit:", dataToSubmit);

        submitEmployeeAnswer(dataToSubmit)
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
    };

  
    const handleTestSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true); // Optional: show loading spinner

        const dataToSubmit = {
            emp_id: selectedTest.employee_id,
            test_name: selectedTest.test_name,
        }
        try {
            await updateEmployeeTestScore(dataToSubmit);
            setView("final"); // Show final page
        } catch (error) {
            console.error("Error during test submission:", error);
            setErrorMessage("Submission Failed");
            setShowError(true);
        } finally {
            setProcessing(false);
        }
    };



    const handleStartTest = async () => {
        try {
            const testName = selectedTest?.test_name;

            if (!testName) {
                alert("Test name not found!");
                return;
            }
            const response = await getQuestionApi_HDFCAPI(testName);
            console.log("✅ Questions loaded:", response);
            await updateTestempApi_is_active(selectedTest.id);

            if (Array.isArray(response) && response.length > 0) {
                setQuestions(response);
                setView("test");
            } else {
                alert("No questions found for this test.");
            }
        } catch (error) {
            console.error("❌ Failed to fetch questions:", error);
            alert("Error fetching questions. Try again.");
        }
    };


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
        for (let i = 0; i < buttons.length; i += 4) {
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




    // View: Upcoming Tests List
    if (view === "upcoming") {
        return (
            <div className="dash-border" style={{ padding: '5%'}}>
                <div className="dash-border" style={{ width: '70%', marginLeft: '12%' }}>
                    
                    <div className="dash-test-container">
                        <header>
                            <p style={{ width: "380px" }}>
                                <strong>Test Name</strong>
                            </p>
                            <p>
                                <strong>Start Test</strong>
                            </p>
                        </header>

                        {upcomingTests.map((test) => {
                            return (
                                <div key={test.id} className="dash-test-item">
                                    <p style={{ width: "380px" }}>
                                        {test.test_name.includes("_")
                                            ? test.test_name.split("_").slice(2).join("_")
                                            : test.test_name}
                                    </p>

                                    <p>
                                        <button
                                            style={{
                                                backgroundColor: "#F1A128",
                                                padding: "10px",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => handleArrowClick(test.id)} // <-- wrap in arrow function!
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
        );
    }

    // View: Instruction Page
    if (view === "instruction") {
        return (
            <div className="instruction-page">
                <h2>Instructions for Test</h2>
                <p><strong>Test Name:</strong> {selectedTest?.test_name}</p>
                {/*}  <p><strong>Date:</strong> {new Date(selectedTest?.test_date).toLocaleString()}</p>      */}
                {/* Add more instructions as needed */}
                <button
                    onClick={handleStartTest}
                    style={{
                        marginTop: "20px",
                        backgroundColor: "#F1A128",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Start Test
                </button>
            </div>
        );
    }

    // View: Actual Test Attend Page
    if (view === "test") {
        return (
            <div className="dash-border">
            <div className="test-page">

                <div className="test-container-mcq">
                    <div className="question-container1-mcq emp1" style={{ display: "flex", justifyContent: "space-between" }}>
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
                    <div className="mob-question-box">
                        <div className="mob-question-btn-wrapper">
                            {renderQuestionButtons()}
                        </div>
                    </div>

                </div>
            </div></div>
        );
    }

    if (view === "final") {
        return (
             <div className="dash-border" style={{ height: "400px" }}>
  <div className="final-page" style={{ textAlign: "center", marginTop: "70px" }}>
    <h3>Thanks for Attending the Test!</h3>
    <p>We appreciate your time and effort.</p>
    <FontAwesomeIcon icon={faHandshake} size="3x" color="orange" style={{ marginTop: '20px' }} />
  </div>
</div>
        );
    }


    return null; // fallback
};

export default EmployeeAttendTest;
