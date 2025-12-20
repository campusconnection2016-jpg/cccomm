import React, { useState, useEffect, useContext } from 'react';
import FormModal from './formmodal';
import {
  getFolders_Name_API,
  get_Skill_Ques_API,
  getSkilltypeApi,
} from '../../api/endpoints';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  TestTypeContext,
  QuestionTypeContext,
  SkillTypeContext,
  TestTypeCategoriesContext,
} from '../test/context/testtypecontext';

const LMSAccess = (username) => {
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
  const { selectedTestTypeCategory } = useContext(TestTypeCategoriesContext);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);

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

  useEffect(() => {
    get_Skill_Ques_API().then((data) => {
      setSubFolders(data); // Full response

      const foldersWithIcons = Object.keys(data).map((type) => ({
        name: type,
        icon: questionTypeIcons[type] || "fa-folder",
      }));
      setDefaultFolders(foldersWithIcons);
    });

    get_Skill_Ques_API().then((data) => {
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
        ML: "fa-robot",
        IOT: "fa-network-wired",
        "Data Structures": "fa-database",
      };

      const transformed = {};
      for (const [questionType, skills] of Object.entries(data)) {
        transformed[questionType] = skills.map((skill) => ({
          name: skill,
          icon: skillIcons[skill] || "fa-circle",
        }));
      }
      setSubFolders(transformed);
    });
  }, []);

  // 🟡 Back Button Internal Logic (no page navigation)
  const handleGoBack = () => {
    if (showSubFolderFolder) {
      // From subfolder → back to default folder view
      setShowSubfolder(false);
      setShowDefaultfolder(true);
      setSelectedDefaultFolder(null);
    } else if (!showAddTest && !showDefaultFolder) {
      // Just ensure folder view visible
      setShowDefaultfolder(true);
    }
  };

  const handleNoFolderClick = () => {
    setSelectedFolder(null);
    setShowAddTest(true);
    setQuestionPaperPass(null);
    setQuestionsIdPass(null);
  };

  const handleNextButtonClick = () => {
    setShowAddTest(false);
    setSelectedFolder(null);
    setQuestions([]);
    setShowQuestionPaper(false);
    setShowDefaultfolder(true);
  };

  const handleDefaultFolderClick = async (folder) => {
    console.log('default folder name: ', folder);
    if (folder === 'Aptitude' || folder === 'Technical' || folder === 'Communication' || folder === 'Psychometry' || folder === 'CompanySpecific') {
      setShowDefaultfolder(false);
      setShowSubfolder(true);
    }

    setSelectedDefaultFolder(folder);
    setSelectedQuestionType(folder);
    setShowQuestionPaper(false);
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
        setShowDefaultfolder(false);
        setShowAddTest(true);
      } catch (error) {
        console.error("Error fetching folder names:", error);
      }
    }
  };

  const handleSubFolderClick = async (folder) => {
    console.log('sub folder name: ', folder);
    setSelectedSubFolder(folder);
    setShowSubfolder(false);
    setIsDefaultFolderClicked(false);

    try {
      const topic = selectedDefaultFolder;
      const subtopic = selectedDefaultFolder === "Softskills" ? "" : folder;
      setSelectedTopic(topic);
      setSelectedSubTopic(subtopic);
      setSelectedQuestionType(topic);
      setSelectedSkillType(subtopic);
      setShowAddTest(true);
    } catch (error) {
      console.error("Error fetching folder names:", error);
    }
  };

  return (
    <div className='form-ques-testaccess' style={{ marginTop: "30px" }}>
      <div>
    

        {/* 🧾 Form Modal */}
        {showAddTest && (
          <div>
            <FormModal
              onNextButtonClick={handleNextButtonClick}
              username={username}
            />
            <br />
            <br />
          </div>
        )}



        {/* 📁 Default Folders (Question Type Level) */}
{!showAddTest && showDefaultFolder && (
  <div className="folder-grid">
    {defaultFolders.map((folder) => (
      <div
        key={folder.name}
        className="folder-item"
        onClick={() => handleDefaultFolderClick(folder.name)}
      >
        <i className={`folder-icon fas ${folder.icon}`}></i>
        <p className="folder-name">{folder.name}</p>
      </div>
    ))}
  </div>
)}

{/* 🟡 BACK BUTTON — appears after Question Type, only in Subfolder view */}
{!showAddTest && showSubFolderFolder && (
  <div style={{ margin: "15px 0 10px 10px" }}>
    <button
      onClick={handleGoBack}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#e2901f")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#f1a128")}
      style={{
        backgroundColor: "#f1a128",
        color: "black",
        border: "none",
        borderRadius: "5px",
        padding: "8px 10px",
        cursor: "pointer",
        fontSize: "18px",
        fontWeight: "bold",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s ease-in-out",
      }}
    >
      <i className="fas fa-arrow-left" style={{ fontWeight: "900" }}></i>
    </button>
  </div>
)}


       

        {/* 📂 Subfolders */}
        {!showAddTest && selectedDefaultFolder && showSubFolderFolder && (
          <div className="subfolder-container">
            <div className="subfolder-grid">
              {subfolders[selectedDefaultFolder] &&
                subfolders[selectedDefaultFolder].map((subfolder, index) => (
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
      </div>
    </div>
  );
};

export default LMSAccess;
