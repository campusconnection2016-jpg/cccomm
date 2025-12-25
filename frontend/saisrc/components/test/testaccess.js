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
  TestTypeCategoriesContext,
} from './context/testtypecontext';
import BinaryToImages from '../../students/test/tests/binarytoimages';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { Edit2, Save, X, Send } from "lucide-react";
import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';

const Testaccess = ({ username, userRole }) => {
  // UI / data states
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
  const { selectedTestTypeCategory } = useContext(TestTypeCategoriesContext); // remarks

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);

  const [editableQuestionId, setEditableQuestionId] = useState(null);
  const [editedText, setEditedText] = useState({});
  const [loading, setLoading] = useState(false);
  const [navigationStack, setNavigationStack] = useState([]);

  // folder/subfolder UI states
  const [selectedDefaultFolder, setSelectedDefaultFolder] = useState(null);
  const [selectedSubFolder, setSelectedSubFolder] = useState(null);
  const [showFolderNames, setShowfolderNames] = useState(false);
  const [showDefaultFolder, setShowDefaultfolder] = useState(true);
  const [showSubFolder, setShowSubfolder] = useState(false);
  const [isDefaultFolderClicked, setIsDefaultFolderClicked] = useState(false);

  const [defaultFolders, setDefaultFolders] = useState([]);
  const [subfolders, setSubFolders] = useState([]);

  const {
    questionPaperCon,
    setQuestionPaperCon,
    topicCon,
    setTopicCon,
    subTopicCon,
    setSubtopicCon,
  } = useTestQuesContext();

  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  const [currentPageQues, setCurrentPageQues] = useState(0);
  const questionsPerPageQues = 5;

  // ICON MAPPING (declare early because used by get_Skill_Ques_API processing)
  const questionTypeIcons = {
    Aptitude: "fa-brain",
    Softskills: "fa-user-friends",
    SoftSkills: "fa-user-friends",

    Technical: "fa-laptop-code",
    Communication: "fa-comments",
    Psychometry: "fa-flask",
    CompanySpecific: "fa-building",
  };

  // Utility to compare two states for equality (simplified shallow)
  const isStateEqual = (a, b) => {
    if (!a || !b) return false;
    const keys = Object.keys(a);
    for (const key of keys) {
      if (Array.isArray(a[key]) && Array.isArray(b[key])) {
        if (a[key].length !== b[key].length) return false;
        for (let i = 0; i < a[key].length; i++) {
          if (a[key][i] !== b[key][i]) return false;
        }
      } else if (a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  };

  // Save current state to stack only if different from last saved
  const pushToNavigationStack = () => {
    const currentState = {
      showFolderNames,
      showDefaultFolder,
      showSubFolder,
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
      currentPage,
      currentPageQues,
      showAddTest,
      questionPaperPass,
      questionIdPass,
    };
    const lastState = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;
    if (!isStateEqual(currentState, lastState)) {
      setNavigationStack(prev => [...prev, currentState]);
    }
  };

  // Reset UI state for fresh page when category or test type changes
  const resetTestaccessState = () => {
    // Local UI
    setShowAddTest(false);
    setFolders([]);
    setSelectedFolder(null);
    setSelectedQuestionPaper([]);
    setShowQuestionPaper(false);
    setQuestions([]);
    setShowQuestions(false);
    setQuestionPaperPass(null);
    setQuestionsIdPass(null);

    // Local selections
    setSelectedTopic(null);
    setSelectedSubTopic(null);

    // Editing
    setEditableQuestionId(null);
    setEditedText({});
    setLoading(false);
    setNavigationStack([]);

    // Folder display
    setSelectedDefaultFolder(null);
    setSelectedSubFolder(null);
    setShowfolderNames(false);
    setShowDefaultfolder(true); // initial view (show default folders grid)
    setShowSubfolder(false);
    setIsDefaultFolderClicked(false);

    // Keep defaultFolders & subFolders so UI doesn't go blank
    // (we intentionally do NOT clear defaultFolders/subfolders here)

    // Reset contexts so breadcrumb and logic starts fresh
    try {
      if (typeof setSelectedQuestionType === 'function') setSelectedQuestionType(null);
      if (typeof setSelectedSkillType === 'function') setSelectedSkillType(null);
      if (typeof setTopicCon === 'function') setTopicCon(null);
      if (typeof setSubtopicCon === 'function') setSubtopicCon(null);
      if (typeof setQuestionPaperCon === 'function') setQuestionPaperCon(null);
    } catch (e) {
      console.warn('Error resetting context values:', e);
    }

    setCurrentPage(0);
    setCurrentPageQues(0);

    console.log('🔁 Resetting Testaccess UI state (preserve defaultFolders/subFolders)');
  };

  // Handle text input change
  const handleTextChange = (id, value) => {
    setEditedText((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle Save edited question
  const handleSave = async (id) => {
    if (!editedText[id]) return;
    setLoading(true);
    try {
      await Update_Question_Text_API({ id, question_text: editedText[id] });
      alert("Question updated successfully!");
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === id
            ? { ...question, question_text: editedText[id] }
            : question
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

  // Handle Cancel editing
  const handleCancel = (id) => {
    setEditableQuestionId(null);
    setEditedText((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // Fetch defaultFolders and skill mapping on mount
  useEffect(() => {
    get_Skill_Ques_API()
      .then((data) => {
        // defaultFolders for grid (name + icon)
        const foldersWithIcons = Object.keys(data).map((type) => ({
          name: type,
          icon: questionTypeIcons[type] || "fa-folder",
        }));
        setDefaultFolders(foldersWithIcons);
      })
      .catch((err) => console.error('Error loading skill ques (1):', err));

    get_Skill_Ques_API()
      .then((data) => {
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
        };

        const transformed = {};
        for (const [questionType, skills] of Object.entries(data)) {
          transformed[questionType] = skills.map((skill) => ({
            name: skill,
            icon: skillIcons[skill] || "fa-circle",
          }));
        }

        setSubFolders(transformed);
      })
      .catch((err) => console.error('Error loading skill ques (2):', err));
  }, []); // run once

  // Fetch folder names when relevant selections change.
  // Require: selectedQuestionType (topic) AND selectedTestTypeCategory (remarks).
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        if (!selectedQuestionType) {
          console.log('⏭️ fetchFolders skipped — no selectedQuestionType.');
          return;
        }

        // derive topic/subtopic carefully
        let topic, subtopic;
        if (selectedQuestionType === 'Softskills') {
          topic = selectedQuestionType;
          subtopic = '';
        } else {
          topic = selectedQuestionType;
          subtopic = selectedSkillType || '';
        }

        setSelectedTopic(topic);
        setSelectedSubTopic(subtopic);

        console.log('📤 Fetching folders with params:', {
          selectedTestTypeCategory,
          selectedTestType,
          topic,
          subtopic
        });

        const data = await getFolders_Name_API(
          selectedTestType,
          topic,
          subtopic,
          selectedTestTypeCategory // send remarks/category
        );

        const unique = [...new Set((data.folder_names || []).filter((name) => name !== null))];
        setFolders(unique);
        console.log('📥 Received folder names:', unique);
      } catch (error) {
        console.error('Error fetching folder names:', error);
      }
    };

    // Only attempt to fetch when we have both category and a topic
    if (selectedTestTypeCategory && selectedQuestionType) {
      console.log('📌 Running fetchFolders useEffect');
      fetchFolders();
      setQuestions([]);
      setShowQuestionPaper(false);
    }
  }, [selectedTestType, selectedQuestionType, selectedSkillType, selectedTestTypeCategory]);

  // When sidebar category OR test-type changes -> reset UI to initial view for that selection
  useEffect(() => {
    // Whenever the user toggles category or test type, reset internal UI so page behaves fresh
    console.log('📌 selectedTestTypeCategory changed:', selectedTestTypeCategory, 'selectedTestType changed:', selectedTestType);
    resetTestaccessState();
    // Note: fetchFolders will run automatically when user picks a topic (selectedQuestionType) or when dependencies satisfy.
  }, [selectedTestTypeCategory, selectedTestType]);

  // Clicking a folder to get questions — push stack first (with check!)
  const handleFolderClick = async (folder) => {
    pushToNavigationStack();  // Push previous state before change

    setSelectedFolder(folder);
    setShowQuestionPaper(false);
    setQuestions([]);
    setShowfolderNames(false);

    console.log('📂 handleFolderClick -> folder:', folder, 'category:', selectedTestTypeCategory, 'testType:', selectedTestType);

    try {
      const data = await get_Questions_Folders_Name_API(folder, selectedTestType, selectedTopic, selectedSubTopic,selectedTestTypeCategory);
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

  // Handle Default folder click with push check
  const handleDefaultFolderClick = async (folder) => {
    pushToNavigationStack();

    console.log('🧭 handleDefaultFolderClick ->', folder, 'category:', selectedTestTypeCategory, 'testType:', selectedTestType);

    // Reset selection of folder/questionPaper, but keep defaultFolders/subFolders
    setSelectedDefaultFolder(folder);
    setSelectedQuestionType(folder);
    setTopicCon(folder);

    setShowQuestionPaper(false);
    setQuestions([]);
    setCurrentPage(0);
    setCurrentPageQues(0);

    if (['Aptitude', 'Technical', 'Communication', 'Psychometry', 'CompanySpecific'].includes(folder)) {
      setShowfolderNames(false);
      setShowDefaultfolder(false);
      setShowSubfolder(true);
    }

    if (folder === 'Softskills') {
      try {
        if (!selectedTestTypeCategory) {
          console.warn('⚠️ selectedTestTypeCategory missing — cannot fetch folders (remarks required). showing addTest instead.');
          setShowDefaultfolder(false);
          setShowAddTest(true);
          return;
        }

        const topic = folder;
        const subtopic = '';
        setSelectedTopic(topic);
        setSelectedSubTopic(subtopic);
        setSelectedQuestionType(topic);
        setSelectedSkillType(subtopic);
        setTopicCon(topic);
        setSubtopicCon(subtopic);

        console.log('📤 Fetching folders for Softskills with:', { selectedTestType, topic, subtopic, selectedTestTypeCategory });

        const data = await getFolders_Name_API(
          selectedTestType,
          topic,
          subtopic,
          selectedTestTypeCategory
        );

        const uniqueFolders = [...new Set((data.folder_names || []).filter((name) => name !== null))];
        setFolders(uniqueFolders);

        if (selectedTestTypeCategory === 'Pre/Post Assessment' || selectedTestTypeCategory === 'Mock/Interview') {
          setShowfolderNames(false);
          setQuestionPaperCon(null);
          setShowAddTest(true);
        } else {
          setShowfolderNames(true);
        }
        setShowDefaultfolder(false);
      } catch (error) {
        console.error("Error fetching folder names (Softskills):", error);
      }
    }
  };

  // Handle Subfolder click with push check
  const handleSubFolderClick = async (folder) => {
    pushToNavigationStack();

    console.log('🧭 handleSubFolderClick ->', folder, 'category:', selectedTestTypeCategory, 'testType:', selectedTestType);

    setSelectedSubFolder(folder);
    setShowSubfolder(false);
    setIsDefaultFolderClicked(false);
    setShowQuestionPaper(false);
    setQuestions([]);
    setCurrentPage(0);
    setCurrentPageQues(0);

    if (!selectedTestTypeCategory) {
      console.warn('⚠️ selectedTestTypeCategory missing — cannot fetch folders on subfolder click.');
      setShowfolderNames(false);
      setShowAddTest(true);
      return;
    }

    if (selectedTestTypeCategory === 'Pre/Post Assessment' || selectedTestTypeCategory === 'Mock/Interview') {
      setShowfolderNames(false);
      setShowAddTest(true);
    } else {
      setShowfolderNames(true);
    }

    try {
      const topic = selectedDefaultFolder;
      const subtopic = selectedDefaultFolder === "Softskills" ? "" : folder;

      setSelectedTopic(topic);
      setSelectedSubTopic(subtopic);
      setSelectedQuestionType(topic);
      setSelectedSkillType(subtopic);
      setTopicCon(topic);
      setSubtopicCon(subtopic);
      setQuestionPaperCon(null);

      console.log('📤 Fetching folders for subfolder click with:', { selectedTestType, topic, subtopic, selectedTestTypeCategory });

      const data = await getFolders_Name_API(
        selectedTestType,
        topic,
        subtopic,
        selectedTestTypeCategory
      );
      const uniqueFolders = [...new Set((data.folder_names || []).filter((name) => name !== null))];
      setFolders(uniqueFolders);
    } catch (error) {
      console.error("Error fetching folder names (subfolder):", error);
    }
  };

  // Pagination handlers
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = selectedQuestionPaper.slice(startIndex, endIndex);

  const handleNext = () => {
    if (endIndex < selectedQuestionPaper.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const startIndexQues = currentPageQues * questionsPerPageQues;
  const endIndexQues = startIndexQues + questionsPerPageQues;
  const currentQuestionsQues = questions.slice(startIndexQues, endIndexQues);

  const handleNextQues = () => {
    if (endIndexQues < questions.length) {
      setCurrentPageQues((prev) => prev + 1);
    }
  };

  const handleBackQues = () => {
    if (currentPageQues > 0) {
      setCurrentPageQues((prev) => prev - 1);
    }
  };

  // ----------- BACK BUTTON HANDLER --------------------
  const handleBackButtonClick = () => {
    if (navigationStack.length === 0) return;

    const prev = navigationStack[navigationStack.length - 1];
    setNavigationStack(stack => stack.slice(0, stack.length - 1));

    // Restore all saved states
    setShowDefaultfolder(prev.showDefaultFolder);
    setShowSubfolder(prev.showSubFolder);
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
    setCurrentPage(prev.currentPage || 0);
    setCurrentPageQues(prev.currentPageQues || 0);
    setShowAddTest(prev.showAddTest || false);
    setQuestionPaperPass(prev.questionPaperPass);
    setQuestionsIdPass(prev.questionIdPass);
    setEditableQuestionId(null);
    setEditedText({});

    console.log('Back button clicked → Restoring state:', prev);
  };

  const filteredFolders =
    selectedTestType === "MCQ Test"
      ? defaultFolders
      : selectedTestType === "Coding Test"
        ? defaultFolders.filter((folder) => folder.name === "Technical" || folder.name === "CompanySpecific")
        : [];

  return (
    <div className='form-ques-testaccess'>
      <div>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  {navigationStack.length > 0 && (
    <button
      className="button-ques-save"
      style={{ width: "auto" }}
      onClick={handleBackButtonClick}
    >
      <FaArrowLeft />
    </button>
  )}

  {!showAddTest && (showFolderNames || showQuestionPaper) && (
    <button
      className="test-navigation-button"
      onClick={handleNoFolderClick}
    >
      <i className="fas fa-arrow-right fa-lg"></i>
    </button>
  )}
</div>


        {showAddTest && (
          <div>
            <TestaccessForm
              onNextButtonClick={handleNextButtonClick}
              selectedFolder={selectedFolder}
              username={username}
              questionPaperPass={questionPaperPass}
              questionIdPass={questionIdPass}
              userRole={userRole}
              selectedTopicPass={selectedTopic}
              selectedSubTopicPass={selectedSubTopic}
              selectedTestTypepass={selectedTestType}
              selectedFolderpass={selectedFolder}
              selectedTestTypeCategoryPass={selectedTestTypeCategory}
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

          </div>
        )}

        {!showAddTest && showDefaultFolder && (
          <div className="folder-grid">
            {filteredFolders.map((folder) => (
              <div key={folder.name} className="folder-item" onClick={() => handleDefaultFolderClick(folder.name)}>
                <i className={`folder-icon fas ${folder.icon}`}></i>
                <p className="folder-name">{folder.name}</p>
              </div>
            ))}
          </div>
        )}

        {!showAddTest && selectedDefaultFolder && showSubFolder && (
          <div className="subfolder-container">
            <div className="subfolder-grid">
              {subfolders[selectedDefaultFolder] &&
                subfolders[selectedDefaultFolder].map((subfolder) => (
                  <div
                    key={typeof subfolder === "object" ? subfolder.name : subfolder}
                    className="subfolder-item"
                    onClick={() =>
                      handleSubFolderClick(
                        typeof subfolder === "object" ? subfolder.name : subfolder
                      )
                    }
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
                <button className="no-folder-button" onClick={handleNoFolderClick}>
                  <i className="fas fa-arrow-right fa-lg"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {!showAddTest && showQuestionPaper && selectedQuestionPaper.length > 0 && (
          <div className="question-paper-container">
            <div className="question-paper-list">
              <div className="question-paper-header">
                <h4>Question Papers</h4>

                <div className="pagination-buttons">
                  <button onClick={handleBack} disabled={currentPage === 0} className="nav-button">
                    <FaArrowLeft />
                  </button>
                  <button onClick={handleNext} disabled={endIndex >= selectedQuestionPaper.length} className="nav-button">
                    <FaArrowRight />
                  </button>
                </div>

                
              </div>

              {currentQuestions.map((paper, index) => (
                <div key={index} className="question-paper-item" onClick={() => { setQuestions(paper.questions); setCurrentPageQues(0); }}>
                  <p className="question-paper-name">{paper.question_paper_name}</p>
                  <button className="send-button-po" onClick={(e) => { e.stopPropagation(); handleSendQuestionPaper(paper.question_paper_name, paper.id); }}>
                    <Send size={20} color="#F1A128" />
                  </button>
                </div>
              ))}
            </div>

            <div className="question-list">
              <div className="question-paper-header">
                <h4>Questions</h4>
                <div className="pagination-buttons">
                  <button onClick={handleBackQues} disabled={currentPageQues === 0} className="nav-button">
                    <FaArrowLeft />
                  </button>
                  <button onClick={handleNextQues} disabled={endIndexQues >= questions.length} className="nav-button">
                    <FaArrowRight />
                  </button>
                </div>
              </div>

              {questions.length > 0 ? (
                <ul className="question-list-content">
                  {currentQuestionsQues.map((question, i) => (
                    <li key={startIndexQues + i} className="question-item">
                      <span className="question-number">{startIndexQues + i + 1}.</span>

                      {editableQuestionId === question.id ? (
                        <textarea
                          style={{ flex: 1, padding: "5px", fontFamily: "inherit", fontSize: "14px", marginRight: "10px" }}
                          defaultValue={question.question_text}
                          onChange={(e) => handleTextChange(question.id, e.target.value)}
                        />
                      ) : (
                        <pre className="question-text"><code>{question.question_text}</code></pre>
                      )}

                      <div className="icon-buttons">
                        {editableQuestionId === question.id ? (
                          <>
                            <button onClick={() => handleSave(question.id)} disabled={loading} style={{ background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer", marginRight: "5px" }}>
                              <Save size={20} color={loading ? "#ccc" : "#28a745"} style={{ marginRight: "5px" }} />
                            </button>
                            <button onClick={() => handleCancel(question.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                              <X size={20} color="#FF0000" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setEditableQuestionId(question.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                            <Edit2 size={20} color="#007BFF" />
                          </button>
                        )}
                      </div>

                      {question.question_image_data && (
                        <BinaryToImages binaryData={question.question_image_data} width="60px" height="60px" />
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
