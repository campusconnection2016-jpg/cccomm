import React, { useState, useEffect } from 'react';
import {
  get_Skill_Ques_FolderAPI,
  getPracticeTestTypeId_API,
  getQuestionSkillIds_API,
  getQuestionPaperWithTestDetails_API,
  getDifficultyLevelCounts_API,
  assignQuestions_API,
  getStudentId_API,
  getQuestionGroupsByDifficulty_API,
  getStudentTestAttemptsAPI,
  updateTestStatus_API
} from '../../api/endpoints';
import { useNavigate } from "react-router-dom";

import { FaPaperPlane } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

const PracticeAccess = ({ username }) => {
  const navigate = useNavigate();

  const questionTypeIcons = {
    Aptitude: "fa-brain",
    Softskills: "fa-user-friends",
    Technical: "fa-laptop-code",
    CompanySpecific: "fa-building",
  };

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
  };

  const testTypeIcons = {
    'MCQ Test': 'fa-question-circle',
    'Coding Test': 'fa-code',
  };

  const [step, setStep] = useState(1);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedSkillType, setSelectedSkillType] = useState(null);

  const [practiceTestId, setPracticeTestId] = useState(null);
  const [questionTypeId, setQuestionTypeId] = useState(null);
  const [skillTypeId, setSkillTypeId] = useState(null);
  const [studentId, setStudentId] = useState(null);

  const [allSkills, setAllSkills] = useState({});
  const [skillOptions, setSkillOptions] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [difficultyCounts, setDifficultyCounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState({});
  const [resolvedTestType, setResolvedTestType] = useState(null);
  const [testGroupData, setTestGroupData] = useState({});
  const [testAttempts, setTestAttempts] = useState([]);
  const [reorderedSkills, setReorderedSkills] = useState(skillOptions);

  // New state to track which skill's folder list is open
  const [openSkill, setOpenSkill] = useState(null);

  const shapeIcons = [
    '◼️', '🔺', '🔵', '⬛', '🟣', '🔶', '🟠', '⬜', '⭐', '💠',
    '🔷', '🔳', '🔲', '⬤', '⭕', '🟥', '🟧', '🟨', '🟩', '🟦',
    '🟪', '🟫', '◽', '◾', '◆', '◇', '◉', '◍', '⬟', '⬢',
    '⬣', '⬤', '▣', '◙', '⬚', '✴️', '✳️', '❇️', '🔘', '🔻'
  ];

  const getShapeForFolder = (folderName) => {
    const hash = folderName
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shapeIndex = hash % shapeIcons.length;
    return shapeIcons[shapeIndex];
  };
  const [expandedFolder, setExpandedFolder] = useState(null);

  useEffect(() => {
    if (skillOptions && skillOptions.length > 0) {
      if (openSkill) {
        const reordered = [
          skillOptions.find(
            (skill) => typeof skill === 'object' && Object.keys(skill)[0] === openSkill
          ),
          ...skillOptions.filter((skill) => {
            if (typeof skill === 'string') return skill !== openSkill;
            if (typeof skill === 'object') return Object.keys(skill)[0] !== openSkill;
            return true;
          }),
        ].filter(Boolean); // Remove undefined
        setReorderedSkills(reordered);
      } else {
        setReorderedSkills(skillOptions);
      }
    }
  }, [skillOptions, openSkill]);


  const handleSkillClick = (skillName, skillObj) => {
    setOpenSkill(skillName);

    // Reorder: selected skill to top
    const newOrder = [
      skillObj,
      ...reorderedSkills.filter(s => {
        if (typeof s === 'string') return s !== skillName;
        if (typeof s === 'object') return Object.keys(s)[0] !== skillName;
        return true;
      }),
    ];
    setReorderedSkills(newOrder);
  };


  // Fetch all skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await get_Skill_Ques_FolderAPI();
        if (res && typeof res === 'object') {
          setAllSkills(res);
        } else {
          setAllSkills({});
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };
    fetchSkills();
  }, []);

  // Fetch student ID and attempts when username is known
  useEffect(() => {
    if (username) {
      const fetchStudentIdAndAttempts = async () => {
        try {
          const res = await getStudentId_API(username);
          if (res && res.student_id) {
            const sid = res.student_id;
            setStudentId(sid);
            const attemptData = await getStudentTestAttemptsAPI(sid);
            setTestAttempts(attemptData.attempts || []);
          }
        } catch (err) {
          console.error("Error fetching student ID or attempts:", err);
        }
      };
      fetchStudentIdAndAttempts();
    }
  }, [username]);

  // Update skill options based on resolvedTestType and selectedQuestionType
  useEffect(() => {
    if (
      resolvedTestType &&
      selectedQuestionType &&
      allSkills[resolvedTestType] &&
      allSkills[resolvedTestType][selectedQuestionType]
    ) {
      const skills = allSkills[resolvedTestType][selectedQuestionType];
      setSkillOptions(skills);
    } else {
      setSkillOptions([]);
    }
  }, [selectedQuestionType, resolvedTestType, allSkills]);

  // Fetch practiceTestId based on selectedQuestionType and selectedTestType
  useEffect(() => {
    const fetchPracticeTestId = async () => {
      let testTypeForAPI = null;
      if (selectedQuestionType === 'Aptitude') {
        testTypeForAPI = 'MCQ Test';
      } else if (selectedQuestionType === 'Technical') {
        if (selectedTestType === 'MCQ Test') testTypeForAPI = 'MCQ Test';
        if (selectedTestType === 'Coding Test') testTypeForAPI = 'Coding Test';
      }
      if (testTypeForAPI) {
        try {
          const res = await getPracticeTestTypeId_API(testTypeForAPI);
          setPracticeTestId(res.id);
          setResolvedTestType(testTypeForAPI);
        } catch (err) {
          console.error('Failed to fetch PracticeTest ID:', err);
        }
      }
    };
    fetchPracticeTestId();
  }, [selectedQuestionType, selectedTestType]);

  const handleTestTypeClick = (testType) => {
    setSelectedTestType(testType);
    setSelectedSkillType(null);
    setQuestionPapers([]);
    setSelectedFolder(null);
    setDifficultyCounts(null);
    setResolvedTestType(testType);
    setStep(3);
    if (skillOptions && skillOptions.length > 0 && openSkill) {
      const reordered = [
        skillOptions.find(
          (skill) => typeof skill === 'object' && Object.keys(skill)[0] === openSkill
        ),
        ...skillOptions.filter((skill) => {
          if (typeof skill === 'string') return skill !== openSkill;
          if (typeof skill === 'object') return Object.keys(skill)[0] !== openSkill;
          return true;
        }),
      ].filter(Boolean);
      setReorderedSkills(reordered);
    }
  };

  const handleQuestionTypeClick = (type) => {
    setSelectedQuestionType(type);
    setSelectedTestType(null);
    setSelectedSkillType(null);
    setQuestionPapers([]);
    setSelectedFolder(null);
    setDifficultyCounts(null);
    if (type === 'Technical') {
      setSelectedTestType('Coding Test'); // Default to coding test
      setStep(3); // Go directly to skills
    } else {
      setSelectedTestType('MCQ Test'); // default for other types
      setStep(3);
    }
  };

  const handleSkillTypeClick = async (skill) => {
    setSelectedSkillType(skill);
    setSelectedFolder(null);
    setDifficultyCounts({});
    setQuestionPapers([]);
    setLoading(true);

    try {
      const idRes = await getQuestionSkillIds_API(selectedQuestionType, skill);
      const qTypeId = idRes.question_type_id || null;
      const sTypeId = idRes.skill_type_id || null;

      setQuestionTypeId(qTypeId);
      setSkillTypeId(sTypeId);

      if (practiceTestId && qTypeId && sTypeId) {
        const papers = await getQuestionPaperWithTestDetails_API(practiceTestId, qTypeId, sTypeId);

        const reshapedCounts = {};
        papers.forEach((paper) => {
          reshapedCounts[paper.folder_name] = paper.difficulty_data;
        });

        setDifficultyCounts(reshapedCounts);
        setQuestionPapers(papers || []);
        // setStep(4);
        setLoading(false);
        return papers;
      } else {
        console.warn("Missing IDs:", { practiceTestId, qTypeId, sTypeId });
      }
    } catch (err) {
      console.error("Failed to fetch papers:", err);
    }

    setLoading(false);
    return [];
  };

  const handleFolderClick = async (paper) => {
    try {
      const folderName = paper.folder_name;
      const questionPaperId = paper.question_paper_id || paper.id;
      const topic = paper.topic;
      const sub_topic = paper.sub_topic;

      setSelectedFolder(folderName);

      const difficultyRes = await getDifficultyLevelCounts_API(questionPaperId);
      setDifficultyCounts((prev) => ({
        ...prev,
        [folderName]: difficultyRes.difficulty_data,
      }));

      const groupRes = await getQuestionGroupsByDifficulty_API(folderName, topic, sub_topic);
      setTestGroupData((prev) => ({
        ...prev,
        [folderName]: groupRes.difficulty_level_distribution,
      }));
    } catch (err) {
      console.error("Failed to load data:", err);
      alert("Failed to load difficulty/test info for folder.");
    }
  };


  const handleBack = () => {
    setSelectedFolder(null);
    setDifficultyCounts(null);

    if (step === 4) {
      setStep(3);
    } else if (step === 3) {
      if (selectedQuestionType === 'Technical') {


        setStep(1);
      } else {
        setStep(1);
      }
      setSelectedSkillType(null);
      setOpenSkill(null); // Close any open folder list when going back
    } else if (step === 1) {
      setStep(1);
      setSelectedTestType(null);
    }
  };

  const questionTypes = ['Aptitude', 'Technical'];

  useEffect(() => {
    const tcm_id = localStorage.getItem("tcm_id");
    // Use tcm_id if needed
  }, []);

  return (
    <div className="form-ques-testaccess" style={{ color: 'white', padding: '20px' }}>
      {step !== 1 && (selectedQuestionType || selectedSkillType || selectedFolder) && (
        <div className="simple-breadcrumb">
          {selectedQuestionType && (
            <span
              className="crumb"
              onClick={() => {
                setStep(1);
                setSelectedTestType(null);
                setSelectedSkillType(null);
                setQuestionPapers([]);
                setSelectedFolder(null);
                setDifficultyCounts(null);
                setOpenSkill(null);
              }}
            >
              {selectedQuestionType}
            </span>
          )}
          {selectedSkillType && (
            <>
              <span className="sep">{' >> '}</span>
              <span
                className="crumb"
                onClick={() => {
                  setStep(3);
                  setSelectedFolder(null);
                  setDifficultyCounts(null);
                  setOpenSkill(null);
                }}
              >
                {selectedSkillType}
              </span>
            </>
          )}
          {selectedFolder && (
            <>
              <span className="sep">{' >> '}</span>
              <span className="crumb current">{selectedFolder}</span>
            </>
          )}
        </div>
      )}
      {/* Step 1 */}
      <div className="practice-access-container">
        {step === 1 && (
          <div style={{
  display: "flex",
  justifyContent: "center",
  width: "100%"
}}>

          <ul   style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: "48px",
      listStyle: "none",
      padding: 0,
      margin: "40px 0"
    }}>
            {questionTypes.map((type) => (
              <li key={type} className="chapter-item">
                <button
                  onClick={() => handleQuestionTypeClick(type)}
                  className="chapter-button"
                >
                  <span className="chapter-icon">
                    <i className={`fa ${questionTypeIcons[type]} question-icon`}></i>
                  </span>
                  <span className="chapter-title">{type}</span>
                </button>
              </li>
            ))}
          </ul>
          </div>
        )}
      </div>


      {step === 3 && selectedQuestionType && skillOptions.length > 0 && (
        <>
          <div className="skill-folder-layout">
            {/* Left Column: Skills */}

            <div className="skill-list-column">
              {selectedQuestionType === 'Technical' && (
                <div className="test-type-toggle">
                  {['MCQ Test', 'Coding Test'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTestTypeClick(type)}
                      className={`toggle-button ${selectedTestType === type ? 'active' : ''}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {reorderedSkills.map((skill, idx) => {
                if (typeof skill === 'string') {
                  return (
                    <div
                      key={idx}
                      className="skill-circle-card disabled"
                      title={skill}
                      style={{ cursor: 'default', opacity: 0.6 }}
                    >
                      <i className={`fa ${skillIcons[skill] || 'fa-circle'} skill-circle-icon`} />
                      <span className="skill-circle-title">{skill}</span>
                    </div>
                  );
                } else if (typeof skill === 'object') {
                  const skillName = Object.keys(skill)[0];
                  return (
                    <div
                      key={idx}
                      className={`skill-circle-card ${openSkill === skillName ? 'active' : ''}`}
                      title={skillName}
                      onClick={() => handleSkillClick(skillName, skill)}
                    >
                      <i className={`fa ${skillIcons[skillName] || 'fa-circle'} skill-circle-icon`} />
                      <span className="skill-circle-title">{skillName}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Right Column: Folders */}
            <div className="folder-display-column">
              {openSkill && (
                <div className="folder-rectangle-wrapper">
                  <ul className="folder-list-outside" id={`folder-list`}>
                    <div className="folder-grid-prac">
                      {reorderedSkills
                        .find(s => typeof s === 'object' && Object.keys(s)[0] === openSkill)?.[openSkill]
                        .map((folder, fIdx) => (
                          <div
                            key={fIdx}
                            className="folder-box"
                            title={folder}
                            onClick={async () => {
                              setSelectedSkillType(openSkill);
                              setSelectedFolder(folder);
                              setExpandedFolder(prev => (prev === folder ? null : folder)); // Toggle open/close

                              const papers = await handleSkillTypeClick(openSkill);
                              const paper = papers.find(p => p.folder_name === folder);
                              if (paper) {
                                await handleFolderClick(paper);
                                //  setStep(4);
                              } else {
                                alert("Folder not found in loaded question papers.");
                              }
                            }}
                          >
                            {/*}  <div className="folder-icon-inside">{getShapeForFolder(folder)}</div>*/}

                            <i className="folder-icon-inside fas fa-folder"></i>
                            <div className="folder-name-inside">{folder}</div>


                          </div>
                        ))}
                    </div>

                  </ul>
                </div>
              )}
            </div>
          </div>

          <button className="chapter-back" onClick={handleBack}>← Back</button>

          {/* Step 4 */}

          {selectedFolder && (
            <ul className="chapter-list">
              {[...new Set(
                questionPapers
                  .filter((paper) => paper.folder_name === selectedFolder)
                  .map((paper) => paper.folder_name)
              )].map((folderName, idx) => {
                const questionPaper = questionPapers.find(p => p.folder_name === folderName);
                const questionPaperId = questionPaper?.question_paper_id || questionPaper?.id;


                return (
                  <li key={idx} className="chapter-item">
                    <div>
                      {expandedFolder === folderName && testGroupData[folderName] && (
                        <div classname='stu-tab'>
                          <div className="po-table-responsive-t">
                            <table className="placement-table-t">
                              <thead>
                                <tr>
                                  <th>Test Name</th>
                                  <th style={{ textAlign: "center" }}>Difficulty Level</th>
                                  <th style={{ textAlign: "center" }}>Start Test</th>
                                  <th style={{ textAlign: "center" }}>Attempts</th>
                                  <th style={{ textAlign: "center" }}>Avg Mark</th>
                                  <th style={{ textAlign: "center" }}>Request for Reassign</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(testGroupData[folderName]).map(
                                  ([difficulty, data], dIdx) =>
                                    data.test_groups.map((group, gIdx) => {
                                      const baseTestName = `${group.test_name}_${difficulty}`;
                                      const fullTestName = `${baseTestName}_${studentId}`;

                                      const attemptInfo = testAttempts.find((a) =>
                                        (a.test_name || "").startsWith(baseTestName)
                                      );

                                      const isAttempted = attemptInfo?.is_active;
                                      const attemptCount = attemptInfo?.attempt_count || 0;
                                      const avgMark = attemptInfo?.stu_avg_mark || 0;

                                      return (
                                        <tr className="table-row" key={`${dIdx}-${gIdx}`}>
  <td style={{ color: isAttempted ? "Orange" : "inherit" }}>{group.test_name}</td>
  <td style={{ textAlign: "center" }}>{difficulty}</td>
  <td style={{ textAlign: "center" }}>
    <button
      style={{
        backgroundColor: attemptInfo?.is_active ? "#ccc" : "#F1A128",
        padding: "10px",
        border: "none",
        borderRadius: "4px",
        cursor: attemptInfo?.is_active ? "not-allowed" : "pointer",
      }}
      disabled={attemptInfo?.is_active}
      onClick={
        attemptInfo?.is_active
          ? null
          : async () => {
              console.log("➡️ Assign button clicked for test:", fullTestName);

              const questionIds = group.question_ids;
              const testName = fullTestName;

              // Step 1: Check required fields
              if (!questionPaperId) {
                console.warn("❌ Missing questionPaperId");
              }
              if (!questionIds?.length) {
                console.warn("❌ No question IDs found");
              }

              if (!questionPaperId || !questionIds.length) {
                alert("Missing data for test.");
                return;
              }

              try {
                const payload = {
                  student_id: studentId,
                  test_type_id: practiceTestId,
                  question_type_id: questionTypeId,
                  skill_type_id: skillTypeId,
                  question_name_id: questionPaperId,
                  question_ids: questionIds,
                  test_name: testName,
                };

                console.log("📦 Payload to be sent for assignment:", payload);

                const res = await assignQuestions_API(payload);

                console.log("✅ Test assignment successful. Response:", res);

                localStorage.setItem("tcm_id", res.candidates_map_id);
                localStorage.setItem("test_name", res.test_name);

                if (resolvedTestType === "MCQ Test") {
                  console.log("➡️ Navigating to practice MCQ");
                  navigate("/test/practice-mcq/", {
                    state: {
                      tcm_id: res.candidates_map_id,
                      test_name: res.test_name,
                    },
                  });
                } else {
                  console.log("➡️ Navigating to practice Code");
                  navigate("/test/practice-code/", {
                    state: {
                      tcm_id: res.candidates_map_id,
                      test_name: res.test_name,
                    },
                  });
                }
              } catch (err) {
                console.error("❌ Failed to assign test:", err);
                alert("Failed to start test. Please try again.");
              }
            }
      }
    >
      <FaArrowRight style={{ color: "black" }} />
    </button>
  </td>
  <td style={{ textAlign: "center" }}>{attemptCount}</td>
  <td style={{ textAlign: "center" }}>{avgMark}</td>
  <td style={{ textAlign: "center" }}>
    <button
      title="Reassign"
      style={{
        backgroundColor: "orange",
        border: "1px solid #ccc",
        borderRadius: "50%",
        padding: "5px",
        cursor: "pointer",
        textAlign: "center"
      }}
      onClick={async () => {
        try {
          const payload = {
            test_name: fullTestName,
            student_id: studentId,
            status: "Requested",
          };
          console.log("📤 Reassign request payload:", payload);
          await updateTestStatus_API(payload);
          alert("Test Reassign Request sent");
        } catch (err) {
          console.error("❌ Reassign failed:", err);
          alert("You cannot request a reassignment before attempting the test.");

        }
      }}
    >
      <FaPaperPlane />
    </button>
  </td>
</tr>

                                      );
                                    })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

    </div>
  );
};

export default PracticeAccess;
