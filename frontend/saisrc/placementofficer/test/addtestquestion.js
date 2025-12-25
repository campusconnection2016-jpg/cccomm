import React, { useState, useEffect, useContext } from 'react';
import TestaccessForm from './testaccessform';
import {
  getFolders_Name_API,
  get_Questions_Folders_Name_API,
  Update_Question_Text_API,

  QuestionsExportAPI_PO,
  QuestionsExportAPI_PO_CODE
} from '../../api/endpoints';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  TestTypeContext,
  QuestionTypeContext,
  SkillTypeContext,
} from './context/testtypecontext';
import BinaryToImages from '../../students/test/tests/binarytoimages';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { Edit2, Save, X, Send } from "lucide-react"; // Using lucide-react for icons
import '../../styles/trainingadmin.css';
import { Col, Row, Form, Button, Modal } from 'react-bootstrap';
import TestaccessFormAddTest from './testaccessformaddtest';
import { useTestQuesContext } from './context/testquescontext';



const AddTestQuestion = ({ collegeName, institute, username, userRole }) => {
  const [showAddTest, setShowAddTest] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedQuestionPaper, setSelectedQuestionPaper] = useState([]);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionPaperPass, setQuestionPaperPass] = useState(null);
  const [questionIdPass, setQuestionsIdPass] = useState(null);

  const { selectedTestType, setSelectedTestType } = useContext(TestTypeContext);
  const { selectedQuestionType, setSelectedQuestionType } = useContext(QuestionTypeContext);
  const { selectedSkillType, setSelectedSkillType } = useContext(SkillTypeContext);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);

  const [editableQuestionId, setEditableQuestionId] = useState(null); // Track the ID of the editable question
  const [editedText, setEditedText] = useState({}); // Track edited text for each question
  const [loading, setLoading] = useState(false); // Loading state for API call

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


    const {
        questionPaperCon,
        setQuestionPaperCon,
        topicCon, 
        setTopicCon,
        subtopicCon,
        isTestAddQues,
        setIsTestAddQues
     } = useTestQuesContext();
   
  // Handle text input change
  const handleTextChange = (id, value) => {
    setEditedText((prev) => ({
      ...prev,
      [id]: value, // Update the specific question's edited text
    }));
  };

  // Handle Save
  const handleSave = async (id) => {
    if (!editedText[id]) return; // If no changes, do nothing
    setLoading(true);

    try {
      await Update_Question_Text_API({ id, question_text: editedText[id] });
      alert("Question updated successfully!");

      // Update the `questions` array in the parent component
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === id
            ? { ...question, question_text: editedText[id] }
            : question
        )
      );

      setEditableQuestionId(null); // Disable editing after saving
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Failed to update question.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel
  const handleCancel = (id) => {
    setEditableQuestionId(null); // Exit editing mode
    setEditedText((prev) => {
      const updated = { ...prev };
      delete updated[id]; // Remove the edited text for the question
      return updated;
    });
  };


  // Fetch folder names on component mount or dependency changes
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        let topic, subtopic;
        if (selectedQuestionType === 'Softskills') {
          topic = selectedQuestionType;
          subtopic = '';
        } else {
          topic = selectedQuestionType;
          subtopic = selectedSkillType;
        }
        setSelectedTopic(topic);
        setSelectedSubTopic(subtopic);

        const data = await getFolders_Name_API(selectedTestType, topic, subtopic);
        setFolders([...new Set(data.folder_names.filter((name) => name !== null))]); // Deduplicate and remove nulls
      } catch (error) {
        console.error('Error fetching folder names:', error);
      }
    };
    fetchFolders();
    setQuestions([]);
    setShowQuestionPaper(false);
  }, [selectedTestType, selectedQuestionType, selectedSkillType]);


  const handleFolderClick = async (folder) => {
    {/*}
    if (folder === selectedFolder) {
      // Handle case if the same folder is clicked consecutively
      console.log("Same folder clicked again, skipping API call");
      return;
    }
      */}
    setSelectedFolder(folder);
    setShowQuestionPaper(false); // Reset show state for the next folder click
    setQuestions([]);
    setShowfolderNames(false)
    try {
      const data = await get_Questions_Folders_Name_API(folder, selectedTestType, selectedTopic, selectedSubTopic);
      console.log('Folder Data: ', data);
      setSelectedQuestionPaper(data);
      setShowQuestionPaper(true);
    } catch (error) {
      console.error('Error fetching question papers:', error);
    }
  };

  useEffect(() => {
    console.log("Selected Folder Updated:", selectedFolder);
  }, [selectedFolder]);


  const handleSendQuestionPaper = (name, id) => {
    setQuestionPaperPass(name);
    setQuestionsIdPass(id);
    setShowAddTest(true);
  };


  // Handle button click when no folders are available
  const handleNoFolderClick = () => {
    setSelectedFolder(null); // No folder selected
    setShowAddTest(true); // Show the TestaccessForm
    setQuestionPaperPass(null);
    setQuestionsIdPass(null);
  };



  const [selectedDefaultFolder, setSelectedDefaultFolder] = useState(null);
  const [selectedSubFolder, setSelectedSubFolder] = useState(null);
  const [showFolderNames, setShowfolderNames] = useState(false);
  const [showDefaultFolder, setShowDefaultfolder] = useState(true);
  const [showSubFolderFolder, setShowSubfolder] = useState(false);
  const [isDefaultFolderClicked, setIsDefaultFolderClicked] = useState(false);

  const defaultFolders = [
    { name: "Aptitude", icon: "fa-brain" },
    //  { name: "Softskills", icon: "fa-user-friends" },
    { name: "Technical", icon: "fa-laptop-code" },
    //  { name: "Communication", icon: "fa-comments" }, // Communication icon
    //  { name: "Psychometry", icon: "fa-flask" }, // Psychometry icon (science-related)
    //  { name: "CompanySpecific", icon: "fa-building" }, // CompanySpecific icon (building)
  ];


  // Filter folders based on selectedTestType
  const filteredFolders =
    selectedTestType === "MCQ Test"
      ? defaultFolders
      : selectedTestType === "Coding Test"
        ? defaultFolders.filter((folder) => folder.name === "Technical")
        : [];


  const subfolders = {
    Aptitude: ["Quants", "Logical", "Verbal", "Overall", "Generic", "ProblemSolving"],
    //  Softskills: ["Communication", "Leadership", "Teamwork"],
    Technical: [
      { name: "All Languages", icon: "fa-laptop-code" },
      { name: "C", icon: "fa-code" },
      { name: "C++", icon: "fa-cogs" },
      { name: "Python", icon: "fa-python" },
      { name: "JAVA", icon: "fa-coffee" },
    ],
    //  Communication: ["Verbal", "Nonverbal", "Written", "Interpersonal"],
    //  Psychometry: ["Personality", "Behavior", "Emotions", "Assessment"],
    //  CompanySpecific: ["Leadership", "Communication", "ProblemSolving", "TimeManagement", "Teamwork"],
  };

  const handleDefaultFolderClick = async (folder) => {
    console.log('defailt folder name: ', folder);

    if (folder === 'Aptitude' || folder === 'Technical' || folder === 'Communication' || folder === 'Psychometry' || folder === 'CompanySpecific') {
      setShowfolderNames(false);
      setShowDefaultfolder(false);
     // setShowSubfolder(true);
    }
    setQuestionPaperCon(null);
    setSelectedDefaultFolder(folder); // Toggling logic
    setSelectedQuestionType(folder);
    setTopicCon(folder);
    setShowAddTest(true);
    setShowQuestionPaper(false); // Reset show state for the next folder click
    setQuestions([]);
    if (folder === 'Softskills') {
      try {
        setSelectedDefaultFolder(folder);
        const topic = folder;
        const subtopic = '';
        setSelectedTopic(topic);
        setSelectedSubTopic(subtopic);

        setSelectedQuestionType(topic);
        setSelectedSkillType(subtopic);

        const data = await getFolders_Name_API(selectedTestType, topic, subtopic);
        const uniqueFolders = [...new Set(data.folder_names.filter((name) => name !== null))];
        setFolders(uniqueFolders);
        setShowfolderNames(true);
        setShowDefaultfolder(false);
        // setShowAddTest(true);
      } catch (error) {
        console.error("Error fetching folder names:", error);
      }
    }
  };


  const handleSubFolderClick = async (folder) => {
    console.log('sub folder name: ', folder);
    setSelectedSubFolder(folder);
    setShowfolderNames(true);
    setShowSubfolder(false);
    setIsDefaultFolderClicked(false);
    setShowQuestionPaper(false); // Reset show state for the next folder click
    setQuestions([]);

    //setShowAddTest(true);

    try {
      const topic = selectedDefaultFolder;
      const subtopic = selectedDefaultFolder === "Softskills" ? "" : folder;

      setSelectedTopic(topic);
      setSelectedSubTopic(subtopic);

      setSelectedQuestionType(topic);
      setSelectedSkillType(subtopic);

      console.log("Selected Default Folder:", selectedDefaultFolder);
      console.log("Folder clicked:", folder);

      const data = await getFolders_Name_API(selectedTestType, topic, subtopic);
      const uniqueFolders = [...new Set(data.folder_names.filter((name) => name !== null))];
      setFolders(uniqueFolders);
    } catch (error) {
      console.error("Error fetching folder names:", error);
    }
  };


  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;




  // Calculate the start and end index for the current page
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;

  // Get the questions for the current page
  const currentQuestions = selectedQuestionPaper.slice(startIndex, endIndex);

  // Handlers for navigation
  const handleNext = () => {
    if (endIndex < selectedQuestionPaper.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };


  const [currentPageQues, setCurrentPageQues] = useState(0);
  const questionsPerPageQues = 5;

  // Calculate the start and end index for the current page
  const startIndexQues = currentPageQues * questionsPerPageQues;
  const endIndexQues = startIndexQues + questionsPerPageQues;



  // Get the questions for the current page
  const currentQuestionsQues = questions.slice(startIndexQues, endIndexQues);

  // Handlers for navigation
  const handleNextQues = () => {
    if (endIndexQues < questions.length) {
      setCurrentPageQues((prevPage) => prevPage + 1);
    }
  };

  const handleBackQues = () => {
    if (currentPageQues > 0) {
      setCurrentPageQues((prevPage) => prevPage - 1);
    }
  };


  //-----------------------------------------------------------//


  const handleGoButtonClick = () => {
    setShowModal(true);
  };


  const [formData, setFormData] = useState({
    question_paper_name: "", // String for file names
    duration_of_test: "",
    topic: selectedDefaultFolder,
    sub_topic: selectedSubFolder,
    no_of_questions: 0,
    upload_type: "",
    folder_name: collegeName,
    file: [] // Array for selected files
  });


  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // Convert FileList to an array
    const fileNames = selectedFiles.map((file) => file.name); // Extract file names

    setFormData((prevState) => ({
      ...prevState,
      file: selectedFiles, // Store selected files as an array
      question_paper_name: fileNames // Store file names as an array
    }));
  };





  const handleInputChangeModal = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value // Dynamically update form field by name
    }));
  };

  const handleSave_Ques = async () => {
    console.log("Handle Save function...");
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setShowError(false);

    if (formData.file.length === 0 || formData.question_paper_name.length === 0) {
      setErrorMessage("Please select files and provide question paper names");
      setShowError(true);
      setIsSubmitting(false);
      return;
    }

    const TestType = selectedTestType === "MCQ Test" ? "MCQ Test" : "Coding Test";

    const formDataToSend = new FormData();
    formDataToSend.append("duration_of_test", formData.duration_of_test);
    formDataToSend.append("topic", selectedDefaultFolder);
    formDataToSend.append("sub_topic", selectedSubFolder);
    formDataToSend.append("no_of_questions", formData.no_of_questions || 0);
    formDataToSend.append("upload_type", formData.upload_type || "manual");
    formDataToSend.append("test_type", TestType);
    formDataToSend.append("folder_name", formData.folder || collegeName);

    formData.file.forEach((file, index) => {
      formDataToSend.append("file", file);
      formDataToSend.append("question_paper_name", formData.question_paper_name[index]);
    });

    try {
      const response =
        TestType === "MCQ Test"
          ? await QuestionsExportAPI_PO(formDataToSend) // MCQ API call
          : await QuestionsExportAPI_PO_CODE(formDataToSend); // Coding API call

      const uploadedQuestions = response.data?.result || []; // Ensure result is an array
      console.log("Uploaded Questions: ", uploadedQuestions);

      // Check if there are uploaded questions
      if (uploadedQuestions.length > 0) {
        const firstQuestion = uploadedQuestions[0]; // Use the first question as an example

        // Set questionPaperPass and questionIdPass from the first question
        setQuestionPaperPass(firstQuestion.question_paper_name);
        setQuestionsIdPass(firstQuestion.id);

        // Trigger showing the "Add Test" section
        setShowAddTest(true);
      }

      // Update the question list dynamically
      const newQuestions = uploadedQuestions.map((question) => ({
        value: question.id,
        label: question.question_paper_name,
      }));

      //  setQuestions(newQuestions);
      //  setSelectedQuestions(newQuestions);
      //  setQuestionTime(formData.duration_of_test);

      //  setErrorMessage("Questions uploaded successfully.");
      //  setShowError(true);

      // Automatically hide the success message after 2 seconds
      setTimeout(() => {
        setShowError(false);
        setShowModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error during upload: ", error);
      setErrorMessage("Failed to upload questions. Please try again.");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackButtonClick = () => {
    setShowAddTest(false); // Hide `TestaccessForm` and show `AddTestQuestion` content
    setShowDefaultfolder(true);
    setIsDefaultFolderClicked(true);
  };





  return (
    <div className='form-ques-testaccess'>
      <div>
        {showAddTest && (
          <div>
            <TestaccessFormAddTest
          onBackButtonClick={handleBackButtonClick}
              selectedFolder={selectedFolder}
              collegeName={collegeName}
              institute={institute}
              username={username}
              questionPaperPass={questionPaperPass}
              questionIdPass={questionIdPass}
              userRole={userRole}
            />
            <br />
            <br />
          </div>
        )}

        {!showAddTest && (
          <div className="test-navigation">
            <h5 className="test-navigation-title">
              {selectedTestType} &gt;{' '}
              {selectedDefaultFolder && (
                <span
                  className="test-navigation-link"
                  onClick={() => {
                    setIsDefaultFolderClicked(true); // Mark default folder as clicked
                    setShowDefaultfolder(true); // Show default folders
                    setShowSubfolder(false);   // Hide subfolders
                    setShowfolderNames(false);
                    setShowQuestionPaper(false);
                  }}
                >
                  {selectedDefaultFolder}
                </span>
              )}{' '}
              &gt;{' '}
              {selectedSubFolder &&
                selectedDefaultFolder !== 'SoftSkills' &&
                !isDefaultFolderClicked && ( // Additional condition
                  <span
                    className="test-navigation-link"
                    onClick={() => {
                      setShowSubfolder(true);    // Show subfolders
                      setShowDefaultfolder(false); // Hide default folders
                      setShowfolderNames(false);
                      setShowQuestionPaper(false);
                    }}
                  >
                    {selectedSubFolder}
                  </span>
                )}
            </h5>

            <div style={{ display: 'flex', gap: '20px' }}>

              {!showAddTest && (showFolderNames && folders.length < 0 || showQuestionPaper) && (
                <button
                  onClick={handleNoFolderClick}
                  className="test-navigation-button"
                >
                  <i className="fas fa-arrow-right fa-lg"></i>
                </button>

              )}

              {!showAddTest && (showFolderNames || showQuestionPaper) && (
                <button
                  onClick={handleGoButtonClick}
                  className="test-navigation-button"
                >
                  Add Question
                </button>

              )}

            </div>




          </div>
        )}



        {!showAddTest && showDefaultFolder && (
          <div className="folder-grid" >
            {filteredFolders.map((folder) => (
              <div
                key={folder.name}
                onClick={() => handleDefaultFolderClick(folder.name)}
                className="folder-item"
              >
                <i className={`folder-icon fas ${folder.icon}`}></i>

                <p className="folder-name">{folder.name}</p>
              </div>
            ))}

          </div>
        )}



        {!showAddTest && selectedDefaultFolder && showSubFolderFolder && (
          <div className="subfolder-container">
            {/*}  <h4>{selectedFolder} Subfolders</h4>      */}
            <div
              className="subfolder-grid"
            >
              {subfolders[selectedDefaultFolder] && (
                subfolders[selectedDefaultFolder].map((subfolder, index) => (
                  <div
                    key={typeof subfolder === "object" ? subfolder.name : subfolder}
                    onClick={() =>
                      handleSubFolderClick(typeof subfolder === "object" ? subfolder.name : subfolder)
                    }
                    className="subfolder-item"
                  >
                    {typeof subfolder === "object" ? (
                      <>
                        <i className={`subfolder-icon fas ${subfolder.icon}`}></i>
                        <p className="subfolder-name">{subfolder.name}</p>
                      </>
                    ) : (
                      <p className="subfolder-name">{subfolder}</p>
                    )}
                  </div>
                ))
              )}

            </div>
          </div>
        )}




        {!showAddTest && showFolderNames && (
          <div className="folder-section">
            {/*}  <h5>{selectedTestType} &gt; {selectedTopic} &gt; {selectedSubTopic}</h5>  */}
            <p></p>

            {folders.length > 0 ? (
              <div
                className="folder-grid"
              >

                {folders.map((folder, index) => (
                  <div
                    key={index}
                    className="folder-item"
                    onClick={() => handleFolderClick(folder)}

                  >
                    <i className="folder-icon fas fa-folder"></i>
                    <p className="folder-name">{folder}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-folder-container">
                <p>No folders available.</p>
                <button
                  onClick={handleNoFolderClick}
                  className="no-folder-button"
                >
                  <i className="fas fa-arrow-right fa-lg" ></i>

                </button>
              </div>
            )}
          </div>
        )}

        {!showAddTest && showQuestionPaper && selectedQuestionPaper.length > 0 && (
          <div className="question-paper-container" >
            {/* Left Side: Question Paper Names */}
            <div className="question-paper-list">
              <div className="question-paper-header">
                <h4>Question Papers</h4>
                <div className="pagination-buttons">
                  <button
                    onClick={handleBack}
                    disabled={currentPage === 0}
                    className="nav-button"
                  >
                    <FaArrowLeft />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={endIndex >= selectedQuestionPaper.length}
                    className="nav-button"
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>
              <p></p>

              {currentQuestions.map((paper, index) => (
                <div
                  key={index}
                  onClick={() => setQuestions(paper.questions)} // Set questions when clicking on a question paper
                  className="question-paper-item"
                >
                  {/* Question Paper Name */}
                  <p className="question-paper-name" >
                    {paper.question_paper_name}
                  </p>

                  {/* Send Button */}
                  <button
                    className="send-button-po"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering parent onClick
                      handleSendQuestionPaper(paper.question_paper_name, paper.id);
                    }}
                  >
                    <Send size={20} color="#F1A128" /> {/* Send icon */}
                  </button>
                </div>
              ))}
            </div>

            {/* Right Side: Questions */}
            <div className="question-list" >
              <div className="question-paper-header">
                <h4>Questions</h4>
                <div className="pagination-buttons">
                  <button
                    onClick={handleBackQues}
                    disabled={currentPageQues === 0}
                    className="nav-button"
                  >
                    <FaArrowLeft />
                  </button>
                  <button
                    onClick={handleNextQues}
                    disabled={endIndexQues >= questions.length}
                    className="nav-button"
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>
              <p></p>

              {questions.length > 0 ? (
                <ul className="question-list-content">
                  {currentQuestionsQues.map((question, i) => (
                    <li
                      key={startIndexQues + i}
                      className="question-item"
                    >
                      {/* Display auto-incremented number */}
                      <span className="question-number">
                        {startIndexQues + i + 1}.
                      </span>

                      {/* Question Text */}
                      {editableQuestionId === question.id ? (
                        <textarea
                          style={{
                            flex: 1,
                            padding: "5px",
                            fontFamily: "inherit",
                            fontSize: "14px",
                            marginRight: "10px",
                          }}
                          defaultValue={question.question_text}
                          onChange={(e) =>
                            handleTextChange(question.id, e.target.value)
                          }
                        />
                      ) : (
                        <pre
                          className="question-text"
                        >
                          <code>{question.question_text}</code>
                        </pre>
                      )}

                      {/* Icons: Save, Cancel, or Edit */}
                      <div className="icon-buttons">
                        {editableQuestionId === question.id ? (
                          <>
                            <button
                              onClick={() => handleSave(question.id)}
                              disabled={loading}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                marginRight: "5px",
                              }}
                            >
                              <Save
                                size={20}
                                color={loading ? "#ccc" : "#28a745"}
                                style={{ marginRight: "5px" }}
                              />
                            </button>
                            <button
                              onClick={() => handleCancel(question.id)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <X size={20} color="#FF0000" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditableQuestionId(question.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <Edit2 size={20} color="#007BFF" />
                          </button>
                        )}
                      </div>

                      {/* Display image if present */}
                      {question.question_image_data && (
                        <BinaryToImages
                          binaryData={question.question_image_data}
                          width="60px"
                          height="60px"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-questions-message">Select a question paper to view questions.</p>
              )}
            </div>
          </div>
        )}



      </div>


      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Questions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row md={12}>

            <Col>
              <label>Upload Question Files</label> <p></p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xlsx" // Restrict file types if needed
                onChange={handleFileChange}
              />
            </Col>

            <Col>
              <div className='duration' controlId='duration_of_test'>
                <label  >Duration of the Test</label><p></p>
                <input
                  type="number"
                  autocomplete="off"
                  name="duration_of_test"
                  required
                  placeholder=""
                  // className='input-ques-dur'
                  min="0"
                  onChange={handleInputChangeModal}
                //  readOnly={!uploadType}
                />

              </div>
            </Col>

          </Row>
          <p></p> <p></p>

          <div>
            <Button variant="primary" onClick={handleSave_Ques} style={{ float: 'right' }}>
              Save
            </Button>
          </div>

        </Modal.Body>

      </Modal>

    </div>
  );
};

export default AddTestQuestion;
