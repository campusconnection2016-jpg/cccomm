import React, { useState, useEffect, useContext } from 'react';
import TestaccessForm from './testaccessform';
import {
  getFolders_Name_API,
  get_Questions_Folders_Name_API,
  Update_Question_Text_API,
  get_Skill_Ques_API
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
import { useTestQuesContext } from './context/testquescontext';

const Testaccess = ({ collegeName, institute, username, userRole }) => {
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

  const [editableQuestionId, setEditableQuestionId] = useState(null);
  const [editedText, setEditedText] = useState({});
  const [loading, setLoading] = useState(false);

  const {
    questionPaperCon,
    setQuestionPaperCon,
    topicCon,
    setTopicCon,
    subTopicCon,
    setSubtopicCon,
  } = useTestQuesContext();

  // Navigation stack to save states for back button functionality
  const [navigationStack, setNavigationStack] = useState([]);

  const [selectedDefaultFolder, setSelectedDefaultFolder] = useState(null);
  const [selectedSubFolder, setSelectedSubFolder] = useState(null);
  const [showFolderNames, setShowfolderNames] = useState(false);
  const [showDefaultFolder, setShowDefaultfolder] = useState(true);
  const [showSubFolderFolder, setShowSubfolder] = useState(false);
  const [isDefaultFolderClicked, setIsDefaultFolderClicked] = useState(false);

  const [defaultFolders, setDefaultFolders] = useState([]);
  const [subfolders, setSubFolders] = useState([]);

  const questionTypeIcons = {
    Aptitude: "fa-brain",
    Softskills: "fa-user-friends",
    Technical: "fa-laptop-code",
    Communication: "fa-comments",
    Psychometry: "fa-flask",
    CompanySpecific: "fa-building",
  };

  const handleTextChange = (id, value) => {
    setEditedText(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async (id) => {
    if (!editedText[id]) return;
    setLoading(true);

    try {
      await Update_Question_Text_API({ id, question_text: editedText[id] });
      alert("Question updated successfully!");

      setQuestions(prev =>
        prev.map(question =>
          question.id === id ? { ...question, question_text: editedText[id] } : question
        )
      );

      setEditableQuestionId(null);
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Failed to update question.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (id) => {
    setEditableQuestionId(null);
    setEditedText(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

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
        setFolders([...new Set(data.folder_names.filter(name => name !== null))]);
      } catch (error) {
        console.error('Error fetching folder names:', error);
      }
    };
    fetchFolders();
    setQuestions([]);
    setShowQuestionPaper(false);
  }, [selectedTestType, selectedQuestionType, selectedSkillType]);

  const handleFolderClick = async (folder) => {
    // Save current state before navigating forward
    setNavigationStack(prev => [...prev, {
      showFolderNames,
      showDefaultFolder,
      showSubFolderFolder,
      showQuestionPaper,
      selectedDefaultFolder,
      selectedSubFolder,
      selectedTopic,
      selectedSubTopic,
      topicCon,
      subTopicCon,
      selectedQuestionType,
      selectedSkillType,
      selectedFolder,
      selectedQuestionPaper,
      questions,
      showAddTest,
      questionPaperPass,
      questionIdPass,
      currentPage,
      currentPageQues,
    }]);

    setSelectedFolder(folder);
    setShowQuestionPaper(false);
    setQuestions([]);
    setShowfolderNames(false);

    try {
      const data = await get_Questions_Folders_Name_API(folder, selectedTestType, selectedTopic, selectedSubTopic);
      setSelectedQuestionPaper(data);
      setShowQuestionPaper(true);
      setCurrentPage(0);
      setCurrentPageQues(0);
    } catch (error) {
      console.error('Error fetching question papers:', error);
    }
  };

  const handleSendQuestionPaper = (name, id) => {
    setQuestionPaperPass(name);
    setQuestionsIdPass(id);
    setQuestionPaperCon(id);
    setShowAddTest(true);
  };

  const handleNoFolderClick = () => {
    setSelectedFolder(null);
    setShowAddTest(true);
    setQuestionPaperPass(null);
    setQuestionsIdPass(null);
    setQuestionPaperCon(null);
  };

  const handleNextButtonClick = () => {
    setShowAddTest(false);
    setSelectedFolder(null);
    setQuestions([]);
    setShowQuestionPaper(false);
    setShowDefaultfolder(true);
  };

  useEffect(() => {
    get_Skill_Ques_API().then(data => {
      setSubFolders(data);

      const foldersWithIcons = Object.keys(data).map(type => ({
        name: type,
        icon: questionTypeIcons[type] || "fa-folder",
      }));

      setDefaultFolders(foldersWithIcons);
    });

    get_Skill_Ques_API().then(data => {
      setSubFolders(data);
      const skillIcons = {
        "All Languages": "fa-laptop-code",
        Python: "fa-python",
        C: "fa-code",
        "C++": "fa-cogs",
        JAVA: "fa-coffee",
        Quants: "fa-calculator",
        Logical: "fa-brain",
        Verbal: "fa-comment",
        Overall: "fa-chart-bar",
        Generic: "fa-list",
        Communication: "fa-comments",
        Leadership: "fa-user-tie",
        Teamwork: "fa-users",
        Nonverbal: "fa-user-secret",
        Written: "fa-pen",
        Interpersonal: "fa-handshake",
        Personality: "fa-user",
        Behavior: "fa-theater-masks",
        Emotions: "fa-smile",
        Assessment: "fa-check-circle",
        ProblemSolving: "fa-lightbulb",
        TimeManagement: "fa-clock",
        Teamwork: "fa-users",
        ML: "fa-robot",
        IOT: " fa-network-wired",
        "Data Structures": "fa-database",
      };

      const transformed = {};
      for (const [questionType, skills] of Object.entries(data)) {
        transformed[questionType] = skills.map(skill => ({
          name: skill,
          icon: skillIcons[skill] || "fa-circle",
        }));
      }

      setSubFolders(transformed);
    });
  }, []);

  const filteredFolders =
    selectedTestType === "MCQ Test"
      ? defaultFolders
      : selectedTestType === "Coding Test"
        ? defaultFolders.filter(folder => folder.name === "Technical")
        : [];

  const handleDefaultFolderClick = async (folder) => {
    // Save current state before navigating forward
    setNavigationStack(prev => [...prev, {
      showFolderNames,
      showDefaultFolder,
      showSubFolderFolder,
      showQuestionPaper,
      selectedDefaultFolder,
      selectedSubFolder,
      selectedTopic,
      selectedSubTopic,
      topicCon,
      subTopicCon,
      selectedQuestionType,
      selectedSkillType,
      selectedFolder,
      selectedQuestionPaper,
      questions,
      showAddTest,
      questionPaperPass,
      questionIdPass,
      currentPage,
      currentPageQues,
    }]);

    if (['Aptitude', 'Technical', 'Communication', 'Psychometry', 'CompanySpecific'].includes(folder)) {
      setShowfolderNames(false);
      setShowDefaultfolder(false);
      setShowSubfolder(true);
    }

    setSelectedDefaultFolder(folder);
    setSelectedQuestionType(folder);
    setTopicCon(folder);

    setShowQuestionPaper(false);
    setQuestions([]);
    setCurrentPage(0);
    setCurrentPageQues(0);

    if (folder === 'Softskills') {
      try {
        const topic = folder;
        const subtopic = '';
        setSelectedTopic(topic);
        setSelectedSubTopic(subtopic);
        setSelectedQuestionType(topic);
        setSelectedSkillType(subtopic);
        setTopicCon(topic);
        setSubtopicCon(subtopic);

        const data = await getFolders_Name_API(selectedTestType, topic, subtopic);
        const uniqueFolders = [...new Set(data.folder_names.filter(name => name !== null))];
        setFolders(uniqueFolders);
        setShowfolderNames(true);
        setShowDefaultfolder(false);
      } catch (error) {
        console.error("Error fetching folder names:", error);
      }
    }
  };

  const handleSubFolderClick = async (folder) => {
    // Save current state before navigating forward
    setNavigationStack(prev => [...prev, {
      showDefaultFolder,
      showSubFolderFolder,
      showFolderNames,
      showQuestionPaper,
      selectedDefaultFolder,
      selectedSubFolder,
      selectedTopic,
      selectedSubTopic,
      topicCon,
      subTopicCon,
      selectedQuestionType,
      selectedSkillType,
      selectedFolder,
      selectedQuestionPaper,
      questions,
      showAddTest,
      questionPaperPass,
      questionIdPass,
      currentPage,
      currentPageQues,
    }]);

    setSelectedSubFolder(folder);
    setShowfolderNames(true);
    setShowSubfolder(false);
    setIsDefaultFolderClicked(false);
    setShowQuestionPaper(false);
    setQuestions([]);
    setCurrentPage(0);
    setCurrentPageQues(0);

    try {
      const topic = selectedDefaultFolder;
      const subtopic = selectedDefaultFolder === "Softskills" ? "" : folder;
      setSelectedTopic(topic);
      setSelectedSubTopic(subtopic);
      setSelectedQuestionType(topic);
      setSelectedSkillType(subtopic);
      setTopicCon(topic);
      setSubtopicCon(subtopic);

      const data = await getFolders_Name_API(selectedTestType, topic, subtopic);
      const uniqueFolders = [...new Set(data.folder_names.filter(name => name !== null))];
      setFolders(uniqueFolders);
    } catch (error) {
      console.error("Error fetching folder names:", error);
    }
  };

  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;

  const currentQuestions = selectedQuestionPaper.slice(startIndex, endIndex);

  const handleNext = () => {
    if (endIndex < selectedQuestionPaper.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const [currentPageQues, setCurrentPageQues] = useState(0);
  const questionsPerPageQues = 5;

  const startIndexQues = currentPageQues * questionsPerPageQues;
  const endIndexQues = startIndexQues + questionsPerPageQues;

  const currentQuestionsQues = questions.slice(startIndexQues, endIndexQues);

  const handleNextQues = () => {
    if (endIndexQues < questions.length) {
      setCurrentPageQues(prev => prev + 1);
    }
  };

  const handleBackQues = () => {
    if (currentPageQues > 0) {
      setCurrentPageQues(prev => prev - 1);
    }
  };

  // ----- BACK BUTTON HANDLER
  const handleBackButtonClick = () => {
    if (navigationStack.length === 0) return;

    const prev = navigationStack[navigationStack.length - 1];
    setNavigationStack(stack => stack.slice(0, stack.length - 1));

    setShowDefaultfolder(prev.showDefaultFolder);
    setShowSubfolder(prev.showSubFolderFolder);
    setShowfolderNames(prev.showFolderNames);
    setShowQuestionPaper(prev.showQuestionPaper);
    setSelectedDefaultFolder(prev.selectedDefaultFolder);
    setSelectedSubFolder(prev.selectedSubFolder);
    setSelectedTopic(prev.selectedTopic);
    setSelectedSubTopic(prev.selectedSubTopic);
    setTopicCon(prev.topicCon);
    setSubtopicCon(prev.subTopicCon);
    setSelectedQuestionType(prev.selectedQuestionType);
    setSelectedSkillType(prev.selectedSkillType);
    setSelectedFolder(prev.selectedFolder);
    setSelectedQuestionPaper(prev.selectedQuestionPaper || []);
    setQuestions(prev.questions || []);
    setShowAddTest(prev.showAddTest || false);
    setQuestionPaperPass(prev.questionPaperPass);
    setQuestionsIdPass(prev.questionIdPass);
    setCurrentPage(prev.currentPage || 0);
    setCurrentPageQues(prev.currentPageQues || 0);

    setEditableQuestionId(null);
    setEditedText({});

    console.log('Back button clicked → Restored state:', prev);
  };

  return (
    <div className='form-ques-testaccess'>
      <div>
        {navigationStack.length > 0 && (
          <button
            className="back-button"
            onClick={handleBackButtonClick}
          >
            ← Back
          </button>
        )}

        {showAddTest && (
          <div>
            <TestaccessForm
              onNextButtonClick={handleNextButtonClick}
              selectedFolder={selectedFolder}
              collegeName={collegeName}
              institute={institute}
              username={username}
              questionPaperPass={questionPaperPass}
              questionIdPass={questionIdPass}
              selectedTopicPass={selectedTopic}
              selectedSubTopicPass={selectedSubTopic}
              selectedTestTypepass={selectedTestType}
              selectedFolderpass={selectedFolder}
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
                    setIsDefaultFolderClicked(true);
                    setShowDefaultfolder(true);
                    setShowSubfolder(false);
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
                !isDefaultFolderClicked && (
                  <span
                    className="test-navigation-link"
                    onClick={() => {
                      setShowSubfolder(true);
                      setShowDefaultfolder(false);
                      setShowfolderNames(false);
                      setShowQuestionPaper(false);
                    }}
                  >
                    {selectedSubFolder}
                  </span>
                )}
            </h5>

            {!showAddTest && (showFolderNames || showQuestionPaper) && (
              <button
                onClick={handleNoFolderClick}
                className="test-navigation-button"
              >
                <i className="fas fa-arrow-right fa-lg"></i>
              </button>
            )}
          </div>
        )}

        {!showAddTest && showDefaultFolder && (
          <div className="folder-grid" >
            {filteredFolders.map(folder => (
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
            <div className="subfolder-grid">
              {subfolders[selectedDefaultFolder] && subfolders[selectedDefaultFolder].map(subfolder => (
                <div
                  key={typeof subfolder === "object" ? subfolder.name : subfolder}
                  onClick={() => handleSubFolderClick(typeof subfolder === "object" ? subfolder.name : subfolder)}
                  className="subfolder-item"
                >
                  {typeof subfolder === "object" ? (
                    <>
                      <i className={`subfolder-icon fas ${subfolder.icon}`}></i>
                      <p className="subfolder-name">{subfolder.name}</p>
                    </>
                  ) : (
                    <>
                      <i className={`subfolder-icon fas fa-circle`}></i>
                      <p className="subfolder-name">{subfolder}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!showAddTest && showFolderNames && (
          <div className="folder-section">
            {folders.length > 0 ? (
              <div className="folder-grid">
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
                  <i className="fas fa-arrow-right fa-lg"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {!showAddTest && showQuestionPaper && selectedQuestionPaper.length > 0 && (
          <div className="question-paper-container" >
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

              {currentQuestions.map((paper, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setQuestions(paper.questions);
                    setCurrentPageQues(0);
                  }}
                  className="question-paper-item"
                >
                  <p className="question-paper-name" >
                    {paper.question_paper_name}
                  </p>

                  <button
                    className="send-button-po"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendQuestionPaper(paper.question_paper_name, paper.id);
                    }}
                  >
                    <Send size={20} color="#F1A128" />
                  </button>
                </div>
              ))}
            </div>

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

              {questions.length > 0 ? (
                <ul className="question-list-content">
                  {currentQuestionsQues.map((question, i) => (
                    <li
                      key={startIndexQues + i}
                      className="question-item"
                    >
                      <span className="question-number">
                        {startIndexQues + i + 1}.
                      </span>

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
                          onChange={e => handleTextChange(question.id, e.target.value)}
                        />
                      ) : (
                        <pre className="question-text">
                          <code>{question.question_text}</code>
                        </pre>
                      )}

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
    </div>
  );
};

export default Testaccess;
