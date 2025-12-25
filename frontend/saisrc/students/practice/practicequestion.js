import React, { useState, useEffect } from 'react';
import '../../styles/assessment.css';

import {
  getAllTopics,
  getSubTopicsByTopicId,
  getFolderBySubTopicTestId,
  getfolderApi,
  addQuestionUpload,
  getGroupedQuestionPapersApi,
  getStudentRequestsByUserNameApi,
  requestCompanyAssignPermission_API,
  getStudentId_API
} from '../../api/endpoints';
import ExcelJS from 'exceljs';
import { useNavigate } from 'react-router-dom';
import withouttestcase from '../../assets/sample_without_testcases.xlsx';
import withtestcase from '../../assets/sample_testcase_questions.xlsx';
import MCQ from '../../assets/mcq_sample.xlsx';
import PracticeTable from './practicetable';
import pythonlogo from '../../assets/logo/python.png';
import Javalogo from '../../assets/logo/java.png';
import clogo from '../../assets/logo/c.png';
import tcslogo from '../../assets/logo/tcs.png';
import wiprologo from '../../assets/logo/wipro.png';
import cognizantlogo from '../../assets/logo/cognizant.png';
import htmllogo from '../../assets/logo/html.jpeg';
import csharplogo from '../../assets/logo/csharp.png';

import ailogo from '../../assets/logo/ai.jpeg';
import mllogo from '../../assets/logo/ml.jpeg';
import iotlogo from '../../assets/logo/iot.png';
import vlsilogo from '../../assets/logo/vlsi.jpeg';
import matlablogo from '../../assets/logo/matlab.jpeg';
import dsalogo from '../../assets/logo/dsa.png';

const subtopicLogos = {
  java: Javalogo,
  tcs: tcslogo,
  wipro: wiprologo,
  cognizant: cognizantlogo,
  python: pythonlogo,
  ai:ailogo,
  ml:mllogo,
  iot:iotlogo,
  vlsi:vlsilogo,
  matlab:matlablogo,
  "data structures":dsalogo,
  
  c: clogo,
  quants: '🧮',
  logical: '🧩',
  verbal: '💬',
  html: htmllogo,
  // "data structures": '🗂️',
  cpp: '🔷',
  'c++': csharplogo,
   "all language": '📟',
   syllabus:'📚',
 // 📚📖
};

const icons = {
  technical: '💻',
  aptitude: '🧠',
  softskills: '🤝',
  companyspecific: '🏢',
  mcqtest: '📝',
  codingtest: '⌨️',
  ds: '📊',
  time: '⏳'
};

const codingOptions = [
  { key: 'testcases coding', label: 'testcases coding', is_testcase: true },
  { key: 'without testcases coding', label: 'without testcases coding', is_testcase: false }
];
const topicDisplayOverrideForNav = {
  CompanySpecific: 'Company Specific', // display override ONLY for navigation circles
};


const Demo = ({ username }) => {
  console.log("username",username)

 const [showSyllabusPopup, setShowSyllabusPopup] = useState(false);
const [syllabusEmbed, setSyllabusEmbed] = useState('');

const [allowedFolders, setAllowedFolders] = useState([]);

  
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [folders, setFolders] = useState([]);
  const [papers, setPapers] = useState([]);

  const [activeTopic, setActiveTopic] = useState(null);
  const [activeTestType, setActiveTestType] = useState(null);
  const [activeSubTopic, setActiveSubTopic] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [openCodingOption, setOpenCodingOption] = useState(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [hoveredCircle, setHoveredCircle] = useState(null); // <--- Hovered Circle State Added

  const [hasClickedTopic, setHasClickedTopic] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    test_type: '',
    subtopic: '',
    folder_name: '',
    file: null,
    uploadType: '',
  });
const [studentId, setStudentId] = useState(null);

  const [visibleChildLevel, setVisibleChildLevel] = useState(null); // controls which child group is visible exactly

  const navigate = useNavigate();

useEffect(() => {
  if (username) {
    getStudentId_API(username)
      .then(data => {
        console.log("🎯 Student ID:", data.student_id);
        setStudentId(data.student_id);
      })
      .catch(err => console.error("Failed to fetch student ID:", err));
  }
}, [username]);

  
  useEffect(() => {
    getAllTopics()
      .then(data => setTopics(data))
      .catch(err => console.error('Failed to fetch topics:', err));
  }, []);

  useEffect(() => {
    getGroupedQuestionPapersApi()
      .then(data => setPapers(data))
      .catch(err => console.error('Failed to fetch grouped question papers:', err));
  }, []);

  useEffect(() => {
  if (activeTopic?.question_type === "CompanySpecific" && folders.length > 0) {
    getStudentRequestsByUserNameApi(username)
      .then(reqs => {
        const accepted = reqs
          .filter(r => r.user_name === username && r.status === "Accepted")
          .map(r => r.remarks);
        setAllowedFolders(accepted);
      })
      .catch(err => {
        console.error("Failed to fetch allowed folders:", err);
        setAllowedFolders([]); 
      });
  } else {
    setAllowedFolders([]); 
  }
}, [activeTopic, folders, username]);

  const norm = v => (v === null || v === undefined) ? '' : String(v).trim();

  const findQuestionNameId = (topicName, testType, subTopicName, folderName, isTestcase = undefined) => {
    const matched = papers.find(paper =>
      norm(paper.topic) === norm(topicName) &&
      norm(paper.test_type) === norm(testType) &&
      norm(paper.sub_topic) === norm(subTopicName) &&
      norm(paper.folder_name) === norm(folderName) &&
      (isTestcase === undefined || paper.is_testcase === isTestcase)
    );
    return matched ? matched.id : null;
  };

  const handleBreadcrumbClick = (level) => {
    switch (level) {
      case 'topic':
        setActiveTestType(null);
        setActiveSubTopic(null);
        setActiveFolder(null);
        setOpenCodingOption(null);
        if (activeTopic) {
          if (activeTopic.question_type === "CompanySpecific") {
            setVisibleChildLevel('folder');
          } else {
            const topicTypeLower = activeTopic.question_type.toLowerCase();
            if (topicTypeLower === 'technical' ) setVisibleChildLevel('testType');
            else setVisibleChildLevel('subTopic');
          }
        } else {
          setVisibleChildLevel(null);
        }
        break;
      case 'testType':
        setActiveTestType(null);         // Clear active test type as well
        setActiveSubTopic(null);         // Clear subtopic selection
        setActiveFolder(null);
        setOpenCodingOption(null);
        setVisibleChildLevel('testType');
        break;
      case 'subTopic':
  setActiveSubTopic(null);

  // Keep folder for CompanySpecific, clear only for others
  if (activeTopic?.question_type !== "CompanySpecific") {
    setActiveFolder(null);
  }

  setOpenCodingOption(null);
  setVisibleChildLevel('subTopic');
  break;

      case 'codingOption':
        setOpenCodingOption(null);       // Clear coding option
        setActiveFolder(null);
        setVisibleChildLevel('codingOption');
        break;
      case 'folder':
        // For CompanySpecific, clicking folder breadcrumb should go back to folder selection
        if (activeTopic?.question_type === "CompanySpecific") {
          setActiveFolder(null);
          setActiveSubTopic(null);       // Clear subtopic when going back to folder level
          setVisibleChildLevel('folder');
        } else {
          setActiveFolder(null);           // Clear active folder as well
          setVisibleChildLevel('folder');
        }
        break;
      default:
        break;
    }
  };

const handleTopicClick = (topic) => {
  if (activeTopic && activeTopic.id === topic.id) {
    setActiveTopic(null);
    setActiveTestType(null);
    setActiveSubTopic(null);
    setActiveFolder(null);
    setOpenCodingOption(null);
    setSubTopics([]);
    setFolders([]);
    setVisibleChildLevel(null);
    setHasClickedTopic(false);
  } else {
    setActiveTopic(topic);
    setActiveTestType(null);
    setActiveSubTopic(null);
    setActiveFolder(null);
    setOpenCodingOption(null);
    setSubTopics([]);
    setFolders([]);

    console.log("Clicked topic:", topic);

    if (topic.question_type === "CompanySpecific") {
      setVisibleChildLevel('folder');
      console.log("Fetching folders for CompanySpecific...");

      getFolderBySubTopicTestId()
        .then(data => {
          const companyFolders = data.filter(folder => folder.topic === "CompanySpecific");
          const uniqueFoldersMap = {};
          companyFolders.forEach(folder => {
            if (folder.folder_name && !(folder.folder_name in uniqueFoldersMap)) {
              uniqueFoldersMap[folder.folder_name] = folder;
            }
          });
          const uniqueFolders = Object.values(uniqueFoldersMap);
          setFolders(uniqueFolders);
        })
        .catch(err => {
          console.error("Failed to fetch folders for CompanySpecific:", err);
          setFolders([]);
        });

    } else if (topic.question_type === "SoftSkills") {
      // 🔹 New logic for SoftSkills
      setVisibleChildLevel("folder");

      // Fetch its only sub_topic from DB
      getSubTopicsByTopicId(topic.id)
        .then(data => {
          const filtered = data.filter(st => st.question_type_id === topic.id);
          if (filtered.length > 0) {
            setSubTopics(filtered);
            setActiveSubTopic(filtered[0]);   // auto-select first (only) sub_topic
          }
        })
        .catch(err => {
          console.error("Failed to fetch SoftSkills sub_topic:", err);
          setSubTopics([]);
        });

      // Fetch all folders directly
      getFolderBySubTopicTestId()
        .then(data => {
          const softSkillFolders = data.filter(folder => folder.topic === "SoftSkills");
          setFolders(softSkillFolders);
        })
        .catch(err => {
          console.error("Failed to fetch folders for SoftSkills:", err);
          setFolders([]);
        });

    } else {
      // Default behavior for Technical & other topics
      const topicTypeLower = topic.question_type.toLowerCase();
      if (topicTypeLower === 'technical') setVisibleChildLevel('testType');
      else setVisibleChildLevel('subTopic');

      getSubTopicsByTopicId(topic.id)
        .then(data => {
          const filteredSubTopics = data.filter(st => st.question_type_id === topic.id);
          setSubTopics(filteredSubTopics);
        })
        .catch(err => {
          console.error('Failed to fetch subtopics:', err);
          setSubTopics([]);
        });
    }

    if (!hasClickedTopic) setHasClickedTopic(true);
  }
};



  const handleTestTypeClick = (testType) => {
    if (activeTestType === testType) {
      setActiveTestType(null);
      setActiveSubTopic(null);
      setOpenCodingOption(null);
      setActiveFolder(null);
      setVisibleChildLevel(null);
    } else {
      setActiveTestType(testType);
      setActiveSubTopic(null);
      setOpenCodingOption(null);
      setActiveFolder(null);
      setVisibleChildLevel('subTopic');
    }
  };

 const handleSubTopicClick = (subTopic) => {
  if (activeTopic?.question_type === "CompanySpecific") {
    setActiveSubTopic(subTopic);

    // ✅ Special handling for "Syllabus"
    if (subTopic.skill_type === "Syllabus") {
      getfolderApi()
        .then(data => {
          // Match folder by skill_type_name === "Syllabus"
          const syllabusItem = data.find(item =>
            item.skill_type_name === "Syllabus" &&
            item.folder_name === activeFolder // only inside selected folder
          );

          if (syllabusItem && syllabusItem.syllabus) {
  // Force iframe full size
  const fixedHtml = syllabusItem.syllabus
    .replace(/width="\d+"/, 'width="100%"')
    .replace(/height="\d+"/, 'height="100%"');

  setSyllabusEmbed(fixedHtml);
  setShowSyllabusPopup(true);
}
 else {
            console.warn("No syllabus found for this folder");
          }
        })
        .catch(err => console.error("Failed to fetch syllabus:", err));

      return; // ❌ don’t send to PracticeTable
    }


    setVisibleChildLevel('subTopic');
    return;
  }

    // Original logic for other topics
    if (activeSubTopic && activeSubTopic.id === subTopic.id) {
      // If clicking the same subtopic, deselect it
      setActiveSubTopic(null);
      setOpenCodingOption(null);
      setFolders([]);
      setActiveFolder(null);
      setVisibleChildLevel(null);
    } else {
      // Select the new subtopic
      setActiveSubTopic(subTopic);
      setOpenCodingOption(null);
      setActiveFolder(null);

      // Original logic for other topics
      const topicTypeLower = activeTopic?.question_type.toLowerCase();
      if ((topicTypeLower === 'technical' ) && activeTestType === 'Coding Test') {
        setVisibleChildLevel('codingOption');
      } else {
        setVisibleChildLevel('folder');
      }
      
      getFolderBySubTopicTestId()
        .then(data => {
          const filteredFolders = data.filter(folder => folder.skill_type_id === subTopic.id);
          setFolders(filteredFolders);
        })
        .catch(err => {
          console.error('Failed to fetch folders:', err);
          setFolders([]);
        });
    }
  };

  const handleCodingOptionClick = (optionKey) => {
    if (openCodingOption === optionKey) {
      setOpenCodingOption(null);
      setActiveFolder(null);
      setVisibleChildLevel('subTopic');
    } else {
      setOpenCodingOption(optionKey);
      setActiveFolder(null);
      setVisibleChildLevel('folder');
    }
  };

  const handleFolderClick = (folderName) => {
  if (activeFolder === folderName) {
    // For CompanySpecific, clicking the same folder should not deselect it
    if (activeTopic?.question_type === "CompanySpecific") {
      return; // Do nothing, keep folder selected
    }
    // For other topics, keep original behavior (do nothing on same folder click)
  } else {
    setActiveFolder(folderName);

    // Special logic for CompanySpecific topic only
    if (activeTopic?.question_type === "CompanySpecific") {
      getFolderBySubTopicTestId()
        .then(data => {
          // Filter API results where folder_name and topic match
          const filteredData = data.filter(item =>
            item.topic === "CompanySpecific" && item.folder_name === folderName
          );
          console.log("Matched CompanySpecific Subtopics for folder:", folderName);
          console.log(filteredData);

          // Extract subtopics from filteredData, assuming each item has sub_topic property
          // If your data shape differs, adjust accordingly
          // Extract subtopics
let newSubTopics = filteredData.map(item => ({
  id: item.sub_topic_id || item.sub_topic,
  skill_type: item.sub_topic
}));

// ✅ Custom ordering ONLY for CompanySpecific
if (activeTopic?.question_type === "CompanySpecific") {
  const order = ["Syllabus", "Aptitude", "All language"];

  newSubTopics.sort((a, b) => {
    const aIndex = order.indexOf(a.skill_type);
    const bIndex = order.indexOf(b.skill_type);

    // If both are in order array, sort by that order
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;

    // If only a is in the order list, it comes first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // Otherwise, keep normal alphabetical order
    return a.skill_type.localeCompare(b.skill_type);
  });
}

setSubTopics(newSubTopics);

          // Show subtopics after folder selection for CompanySpecific
          setVisibleChildLevel('subTopic');
        })
        .catch(err => {
          console.error("Failed to fetch CompanySpecific subtopics on folder click:", err);
        });
    } else {
      // For other topics, keep folder level visible
      setVisibleChildLevel('folder');
    }
  }
};


  const openAddQuestionModalFunc = () => {
    const topicTypeLower = activeTopic?.question_type.toLowerCase();
    const testTypeForModal = (topicTypeLower === 'technical' )
      ? (activeTestType || '')
      : 'MCQ Test';

    setFormData({
      topic: activeTopic ? activeTopic.question_type : '',
      test_type: testTypeForModal,
      subtopic: activeSubTopic ? activeSubTopic.skill_type : '',
      folder_name: activeFolder || '',
      file: null,
      uploadType: '',
    });
    setShowAddQuestionModal(true);
  };

  const handleExportmcqpsyo = () => {
    const documentUrl = MCQ;
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Sample_MCQ.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportwithouttestcase = () => {
    const documentUrl = withouttestcase;
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Sample_Without_Test_case.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExporttestcase = () => {
    const documentUrl = withtestcase;
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Sample_Testcase_Question.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    let uploadType = (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) ? 'excel' : 'other';
    setFormData(prev => ({ ...prev, file, uploadType }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      alert('Please choose a file to upload.');
      return;
    }

    if (formData.uploadType === 'excel') {
      try {
        const data = await formData.file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);
        const worksheet = workbook.worksheets[0];
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          rows.push(row.values.slice(1));
        });

        let created = 0;

        const topicTypeLower = activeTopic?.question_type.toLowerCase();
        const isTestcaseFlag = (topicTypeLower === "technical" ) && activeTestType === "Coding Test" && openCodingOption === "testcases coding"
          ? true
          : (topicTypeLower === "technical" ) && activeTestType === "Coding Test" && openCodingOption === "without testcases coding"
            ? false
            : undefined;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          let folderNameFromExcel = row[7] !== undefined && row[7] !== null ? String(row[7]).trim() : '';
          let folderName = folderNameFromExcel || formData.folder_name || 'Overall';

          const question_name_id = findQuestionNameId(
            formData.topic,
            formData.test_type,
            formData.subtopic,
            folderName,
            isTestcaseFlag
          );

          let markRaw = row[6];
          let mark = 0;
          if (markRaw !== undefined && markRaw !== null && markRaw !== '') {
            const parsed = parseInt(markRaw, 10);
            mark = isNaN(parsed) ? 0 : parsed;
          }

          const payload = {
            question_text: row[0] || '',
            option_a: row[1] || '',
            option_b: row[2] || '',
            option_c: row[3] || '',
            option_d: row[4] || '',
            answer: row[5] || '',
            mark: mark,
            difficulty_level: row[8] || '',
            explain_answer: row[9] || '',
            topic: formData.topic,
            test_type: formData.test_type,
            subtopic: formData.subtopic,
            folder_name: folderName,
            is_testcase: isTestcaseFlag,
            test_type_categories: "PracticeTest"
          };

          await addQuestionUpload(payload);
          created++;
        }

        alert(`Excel data uploaded and saved successfully (${created} questions).`);
        setShowAddQuestionModal(false);
      } catch (error) {
        console.error(error);
        alert('Failed to upload Excel data.');
      }
    } else {
      alert('Unsupported file type. Please upload Excel files only.');
    }
  };

  // Updated circleStyle now supports hovered parameter
  const circleStyle = (active = false, isTopic = false, hovered = false) => {
    let baseSize = 120;
    if (isTopic) {
      baseSize = hasClickedTopic ? 50 : 132;
    }
    return {
      cursor: 'pointer',
      width: baseSize,
      height: baseSize,
      minWidth: baseSize,
      minHeight: baseSize,
      borderRadius: '50%',
      backgroundColor: active
        ? 'rgba(76, 175, 80, 0.15)'
        : hovered
          ? 'rgba(255,255,255,0.07)' // Slight white bg on hover
          : 'transparent',
      color: active ? '#4caf50' : '#ddd',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: active ? '700' : '600',
      fontSize: 14,
      textAlign: 'center',
      padding: '10px',
      transition: 'all 0.3s ease',
      userSelect: 'none',
      flexShrink: 0,
      border: '1px solid grey',
      boxSizing: 'border-box',
      boxShadow: 'none',
    };
  };

  const iconCircleStyle = {
    fontSize: '35px',
    marginBottom: '1px',
    userSelect: 'none',
  };

  const childCirclesContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '30px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    paddingLeft: '60px',
    paddingRight: '20px',
    userSelect: 'none',
  };

  const topicsContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '25px',
    padding: '16px 20px',
    width: '100%',
    boxSizing: 'border-box',
    userSelect: 'none',
    top: '0px',
    zIndex: 3000,
    backgroundColor: 'transparent',
    marginBottom: '30px',
  };

  const topicsAndChildrenContainer = {
    display: 'flex',
    gap: '20px',
    padding: '10px 20px',
    minHeight: 140,
    userSelect: 'none',
  };

  const rightContentContainer = {
    marginTop: '0px',
    padding: '0 10px 0px 20px',
    userSelect: 'none',
    flexGrow: 1,
    minWidth: 0,
    overflowY: 'auto',
  };

  const mainLayoutStyle = {
    backgroundColor: '#36404a',
    borderRadius: '8px',
    marginTop: '10px',
    position: 'relative',
    minHeight: '600px',
    paddingBottom: '80px',
    color: 'white',
    boxSizing: 'border-box',
  };

  const breadcrumbContainer = {
    top: '20px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    zIndex: 3000,
    userSelect: 'none',
    padding: '10px 16px',
  };

  const breadcrumbItemStyle = (active = false) => ({
    cursor: 'pointer',
    color: active ? '#4caf50' : 'white',
    textDecoration: 'underline',
    userSelect: 'none',
  });

  const arrowIcon = (
    <span aria-hidden="true" style={{ userSelect: 'none' }}>→</span>
  );

  const isTechnicalOrCompanySpecific = activeTopic && (activeTopic.question_type.toLowerCase() === 'technical' );

  
  function getTopicCircleKey(topic) {
    return `topic-${topic.id}`;
  }
  function getTestTypeCircleKey(testType) {
    return `testtype-${testType}`;
  }
  function getSubTopicCircleKey(subTopic) {
    return `subtopic-${subTopic.id}`;
  }
  function getCodingOptionCircleKey(opt) {
    return `codingopt-${opt.key}`;
  }
  function getFolderCircleKey(folder) {
    return `folder-${folder.id}`;
  }

  return (
    <div style={mainLayoutStyle}>
      {activeTopic && (
        <nav aria-label="Breadcrumb" style={breadcrumbContainer}>
          {/* Topic breadcrumb: always show if activeTopic */}
          <span
            onClick={() => handleBreadcrumbClick('topic')}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBreadcrumbClick('topic'); }}
            role="button"
            tabIndex={0}
            style={breadcrumbItemStyle((!visibleChildLevel || (visibleChildLevel === 'folder' && !activeTestType && activeTopic?.question_type !== "CompanySpecific")))}
            aria-current={(!visibleChildLevel || (visibleChildLevel === 'folder' && !activeTestType && activeTopic?.question_type !== "CompanySpecific")) ? 'page' : undefined}
            title="Topic"
          >
            {activeTopic.question_type}
          </span>

          {/* For CompanySpecific: Topic → Folder → SubTopic */}
          {activeTopic?.question_type === "CompanySpecific" && activeFolder && (
            <>
              {arrowIcon}
              <span
                onClick={() => handleBreadcrumbClick('folder')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBreadcrumbClick('folder'); }}
                role="button"
                tabIndex={0}
                style={breadcrumbItemStyle(visibleChildLevel === 'folder' && !activeSubTopic)}
                aria-current={visibleChildLevel === 'folder' && !activeSubTopic ? 'page' : undefined}
                title="Folder"
              >
                {activeFolder}
              </span>
            </>
          )}

          {activeTopic?.question_type === "CompanySpecific" && activeSubTopic && (
            <>
              {arrowIcon}
              <span
                onClick={() => handleBreadcrumbClick('subTopic')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBreadcrumbClick('subTopic'); }}
                role="button"
                tabIndex={0}
                style={breadcrumbItemStyle(visibleChildLevel === 'subTopic')}
                aria-current={visibleChildLevel === 'subTopic' ? 'page' : undefined}
                title="Sub Topic"
              >
                {activeSubTopic.skill_type}
              </span>
            </>
          )}

          {/* For Technical Topics - show testType if selected */}
          {(activeTopic.question_type.toLowerCase() === 'technical' ) && activeTestType && (
            <>
              {arrowIcon}
              <span
                onClick={() => handleBreadcrumbClick('testType')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBreadcrumbClick('testType'); }}
                role="button"
                tabIndex={0}
                style={breadcrumbItemStyle(visibleChildLevel === 'testType')}
                aria-current={visibleChildLevel === 'testType' ? 'page' : undefined}
                title="Test Type"
              >
                {activeTestType}
              </span>
            </>
          )}

          {/* Show subTopic breadcrumb if selected (for non-CompanySpecific topics) */}
         {(activeSubTopic 
  && activeTopic?.question_type !== "CompanySpecific" 
  && activeTopic?.question_type !== "SoftSkills") && (

            <>
              {((activeTopic.question_type.toLowerCase() === 'technical' ) && activeTestType) && arrowIcon}
              {(activeTopic.question_type.toLowerCase() !== 'technical' ) && arrowIcon}
              <span
                onClick={() => handleBreadcrumbClick('subTopic')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBreadcrumbClick('subTopic'); }}
                role="button"
                tabIndex={0}
                style={breadcrumbItemStyle(visibleChildLevel === 'subTopic')}
                aria-current={visibleChildLevel === 'subTopic' ? 'page' : undefined}
                title="Sub Topic"
              >
                {activeSubTopic.skill_type}
              </span>
            </>
          )}

          {/* Show coding option breadcrumb if opened */}
          {(openCodingOption && (activeTopic.question_type.toLowerCase() === 'technical' ) && activeTestType === 'Coding Test') && (
            <>
              {arrowIcon}
              <span
                onClick={() => handleBreadcrumbClick('codingOption')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBreadcrumbClick('codingOption'); }}
                role="button"
                tabIndex={0}
                style={breadcrumbItemStyle(visibleChildLevel === 'codingOption')}
                aria-current={visibleChildLevel === 'codingOption' ? 'page' : undefined}
                title="Coding Option"
              >
                {openCodingOption}
              </span>
            </>
          )}

          {/* Show folder breadcrumb if selected (for non-CompanySpecific topics) */}
          {(activeFolder && activeTopic?.question_type !== "CompanySpecific") && (
            <>
              {arrowIcon}
              <span
                onClick={() => handleBreadcrumbClick('folder')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBreadcrumbClick('folder'); }}
                role="button"
                tabIndex={0}
                style={breadcrumbItemStyle(visibleChildLevel === 'folder')}
                aria-current={visibleChildLevel === 'folder' ? 'page' : undefined}
                title="Folder"
              >
                {activeFolder}
              </span>
            </>
          )}
        </nav>
      )}

      {activeTopic ? (
        <div style={topicsAndChildrenContainer}>
          <nav aria-label="Topics" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {topics.map(topic => {
              const isActive = activeTopic && activeTopic.id === topic.id;
              const circleKey = getTopicCircleKey(topic);
              const isHovered = hoveredCircle === circleKey;
              return (
                <div
                  key={topic.id}
                  style={circleStyle(isActive, true, isHovered)}
                  onClick={() => handleTopicClick(topic)}
                  title={topic.question_type}
                  aria-label={`Topic: ${topic.question_type}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleTopicClick(topic); }}
                  onMouseEnter={() => setHoveredCircle(circleKey)}
                  onMouseLeave={() => setHoveredCircle(null)}
                >
                  <div style={{ fontSize: 13 }}>{icons[topic.question_type?.toLowerCase()] || '👨‍💻'}</div>
                  <div style={{ fontSize: 6, fontWeight: isActive ? '700' : '600', lineHeight: '1.2', wordBreak: 'break-word' }}>{topic.question_type}</div>
                </div>
              );
            })}
          </nav>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
           

            <div style={childCirclesContainerStyle} aria-label="Child Navigation Circles" className='scrll-new-prac'>
              {visibleChildLevel === 'testType' && isTechnicalOrCompanySpecific && (
                ['MCQ Test', 'Coding Test'].map(testType => {
                  const circleKey = getTestTypeCircleKey(testType);
                  const isHovered = hoveredCircle === circleKey;
                  return (
                    <div
                      key={testType}
                      style={circleStyle(activeTestType === testType, false, isHovered)}
                      onClick={() => {
                        handleTestTypeClick(testType);
                        setVisibleChildLevel('subTopic');
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { handleTestTypeClick(testType); setVisibleChildLevel('subTopic'); } }}
                      aria-pressed={activeTestType === testType}
                      title={testType}
                      onMouseEnter={() => setHoveredCircle(circleKey)}
                      onMouseLeave={() => setHoveredCircle(null)}
                    >
                      <span style={{ marginBottom: '6px', fontSize: '28px' }}>{icons[testType.toLowerCase().replace(/\s/g, '')] || '👨‍💻'}</span>
                      <span>{testType}</span>
                    </div>
                  )
                })
              )}

            {visibleChildLevel === 'subTopic' && activeTopic?.question_type !== "SoftSkills" && (

                // Show subtopics for CompanySpecific (after folder selection) or other topics
                (activeTopic?.question_type === 'CompanySpecific' || (!isTechnicalOrCompanySpecific || activeTestType)) && 
                subTopics.map(subTopic => {
                  const isActive = activeSubTopic && activeSubTopic.id === subTopic.id;
                  const circleKey = getSubTopicCircleKey(subTopic);
                  const isHovered = hoveredCircle === circleKey;
                  return (
                    <div
                      key={subTopic.id}
                      style={circleStyle(isActive, false, isHovered)}
                      onClick={() => {
                        handleSubTopicClick(subTopic);
                        // For CompanySpecific, don't automatically change visible level
                        if (activeTopic?.question_type !== 'CompanySpecific') {
                          if (isTechnicalOrCompanySpecific && activeTestType === 'Coding Test') {
                            setVisibleChildLevel('codingOption');
                          } else {
                            setVisibleChildLevel('folder');
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSubTopicClick(subTopic);
                          // For CompanySpecific, don't automatically change visible level
                          if (activeTopic?.question_type !== 'CompanySpecific') {
                            if (isTechnicalOrCompanySpecific && activeTestType === 'Coding Test') {
                              setVisibleChildLevel('codingOption');
                            } else {
                              setVisibleChildLevel('folder');
                            }
                          }
                        }
                      }}
                      aria-pressed={isActive}
                      title={subTopic.skill_type}
                      onMouseEnter={() => setHoveredCircle(circleKey)}
                      onMouseLeave={() => setHoveredCircle(null)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 14 }}>
                        {(() => {
                          const logo = subtopicLogos[subTopic.skill_type?.toLowerCase()];
                          if (!logo) {
                            return <div style={{ fontSize: 24, lineHeight: 1 }}>👨‍💻</div>;
                          }
                          if (typeof logo === 'string') {
                            // Check if this string is an emoji (render text)
                            if (logo.length === 2 || logo.length === 1) {
                              return <div style={{ fontSize: 24, lineHeight: 1 }}>{logo}
                              </div>;
                            }
                            return (
                              <img
                                src={logo}
                                alt={subTopic.skill_type}
                                style={{ width: 38, height: 38, objectFit: 'contain' }}
                              />
                            );
                          }
                          if (React.isValidElement(logo)) {
                            return logo;
                          }
                          return <div style={{ fontSize: 24, lineHeight: 1 }}>👨‍💻</div>;
                        })()}
                        <div style={{ marginTop: 4 }}>{subTopic.skill_type}</div>
                      </div>
                    </div>
                  );
                })
              )}

              {visibleChildLevel === 'codingOption' && isTechnicalOrCompanySpecific && activeTestType === "Coding Test" && activeSubTopic && (
                codingOptions.map(opt => {
                  const circleKey = getCodingOptionCircleKey(opt);
                  const isHovered = hoveredCircle === circleKey;
                  return (
                    <div
                      key={opt.key}
                      style={circleStyle(openCodingOption === opt.key, false, isHovered)}
                      onClick={e => {
                        e.stopPropagation();
                        handleCodingOptionClick(opt.key);
                        setVisibleChildLevel('folder');
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleCodingOptionClick(opt.key); setVisibleChildLevel('folder'); } }}
                      aria-pressed={openCodingOption === opt.key}
                      title={opt.label}
                      onMouseEnter={() => setHoveredCircle(circleKey)}
                      onMouseLeave={() => setHoveredCircle(null)}
                    >
                      {opt.label}
                    </div>
                  )
                })
              )}

              {visibleChildLevel === 'folder' && (
                (
                  (activeTopic?.question_type === "CompanySpecific" && !activeFolder) // Show folders for CompanySpecific when no folder is selected
                  // OR the existing original conditions for other topics
                  ||
                  (!isTechnicalOrCompanySpecific && activeSubTopic)
                  ||
                  (isTechnicalOrCompanySpecific && activeTestType === 'Coding Test' && openCodingOption)
                  ||
                  (isTechnicalOrCompanySpecific && activeTestType === 'MCQ Test' && activeSubTopic)
                ) && (
                  folders.map(folder => {
                    const isActive = activeFolder === folder.folder_name;
                    const circleKey = getFolderCircleKey(folder);
                    const isHovered = hoveredCircle === circleKey;
                    const isAllowed = activeTopic?.question_type !== "CompanySpecific" 
    || allowedFolders.includes(folder.folder_name);
                    // Convert binary folder_logo to Base64 if it exists
                    let folderLogoElement = (
                      <div style={{ fontSize: 24 }}>📁</div>
                    );
                    if (folder.folder_logo) {
                      let imageSrc;
                      if (typeof folder.folder_logo === 'string') {
                        // If the logo is already a base64 string or data url
                        imageSrc = folder.folder_logo.startsWith('data:')
                          ? folder.folder_logo
                          : `data:image/png;base64,${folder.folder_logo}`;
                      } else {
                        // If the logo is raw binary (ArrayBuffer or Uint8Array)
                        imageSrc = `data:image/png;base64,${arrayBufferToBase64(folder.folder_logo)}`;
                      }
                      folderLogoElement = (
                        <img
                          src={imageSrc}
                          alt={folder.folder_name || 'Folder Logo'}
                          style={{ width: 38, height: 38, objectFit: 'contain' }}
                        />
                      );
                    }

                    function arrayBufferToBase64(buffer) {
                      let binary = '';
                      const bytes = new Uint8Array(buffer);
                      const len = bytes.byteLength;
                      for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i]);
                      }
                      return window.btoa(binary);
                    }

                    return (
                      <div
                        key={folder.id}
                       style={{
    ...circleStyle(isActive, false, isHovered),
    opacity: isAllowed ? 1 : 0.4,
    cursor: isAllowed ? 'pointer' : 'not-allowed'
  }}
                     onClick={async e => {
  e.stopPropagation();

  if (activeTopic?.question_type === "CompanySpecific" && !isAllowed) {
    try {
      const requests = await getStudentRequestsByUserNameApi(username);
      const alreadyPending = requests.some(
        r =>
          r.user_name === username &&
          r.student_id === studentId &&
          r.remarks === folder.folder_name &&
          r.status === "Pending"
      );

      if (alreadyPending) {
        alert(`You have already sent a request for ${folder.folder_name} . Please wait for approval.`);
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to send request for ${folder.folder_name} Test?`
      );
      if (confirmed) {
        await requestCompanyAssignPermission_API({
          student_id: studentId,
          folder_name: folder.folder_name
        });
        alert("Request sent successfully.");
      }
    } catch (err) {
      console.error("Error checking or sending request:", err);
      alert("Failed to send request. Please try again.");
    }

    return;
  }

  if (isAllowed) {
    handleFolderClick(folder.folder_name);
  }
}}


                        role="button"
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            handleFolderClick(folder.folder_name);
                          }
                        }}
                        aria-pressed={isActive}
                        title={folder.folder_name || 'No Folder'}
                        onMouseEnter={() => setHoveredCircle(circleKey)}
                        onMouseLeave={() => setHoveredCircle(null)}
                      >
                        {folderLogoElement}
                        <div style={{ marginTop: 4, fontSize: 14 }}>{folder.folder_name || 'No Folder'}</div>
                      </div>
                    );
                  })
                )
              )}
            </div>

            <main style={rightContentContainer}>
              {activeTopic && (
                <PracticeTable
                  data={[]}
                  username={username}
                  navState={{
                    topic: activeTopic?.question_type || '',
                    test_type: activeTestType || '',
                    subtopic: activeSubTopic?.skill_type || '',
                    folder_name: activeFolder || '',
                    codingType: openCodingOption || '',
                  }}
                />
              )}
            </main>

     {showSyllabusPopup && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 5000,
  }}>
    <div style={{
      background: '#282c34',
      padding: '20px',
      borderRadius: '12px',
      width: '95%',
      height: '90%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Embed syllabus iframe */}
      <div
        dangerouslySetInnerHTML={{ __html: syllabusEmbed }}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
        }}
      />

      <button
        style={{
          marginTop: '10px',
          alignSelf: 'center',
          background: '#f1a128',
          color: 'black',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
        onClick={() => setShowSyllabusPopup(false)}
      >
        Close
      </button>
    </div>
  </div>
)}


            {showAddQuestionModal && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2000,
                padding: '10px',
                overflowY: 'auto'
              }}>
                <form
                  style={{
                    background: '#2c3e50',
                    padding: '30px',
                    borderRadius: '12px',
                    minWidth: '320px',
                    maxWidth: '700px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: 'white',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  }}
                  onSubmit={handleSubmit}
                >
                  <h3 style={{ color: 'white', marginBottom: '24px', textAlign: 'center' }}>Add Question</h3>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ color: 'white', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Topic:</label>
                      <input
                        type="text"
                        name="topic"
                        value={formData.topic}
                        readOnly
                        style={{ width: '100%', background: '#1a252f', color: 'white', border: '1px solid grey', borderRadius: '6px', padding: '8px', fontSize: '14px' }}
                      />
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ color: 'white', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Test Type:</label>
                      <input
                        type="text"
                        name="test_type"
                        value={formData.test_type}
                        readOnly
                        style={{ width: '100%', background: '#1a252f', color: 'white', border: '1px solid grey', borderRadius: '6px', padding: '8px', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ color: 'white', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Sub Topic:</label>
                      <input
                        type="text"
                        name="subtopic"
                        value={formData.subtopic}
                        readOnly
                        style={{ width: '100%', background: '#1a252f', color: 'white', border: '1px solid grey', borderRadius: '6px', padding: '8px', fontSize: '14px' }}
                      />
                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ color: 'white', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Folder (Optional):</label>
                      <select
                        name="folder_name"
                        value={formData.folder_name}
                        onChange={handleInputChange}
                        style={{ width: '100%', background: '#1a252f', color: 'white', border: '1px solid grey', borderRadius: '6px', padding: '8px', fontSize: '14px' }}
                      >
                        <option value="">Select Folder Option</option>
                        {folders.map(folder => (
                          <option key={folder.id} value={folder.folder_name || ''}>{folder.folder_name || 'None'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                    <label style={{ color: 'white', minWidth: '120px', fontWeight: '600' }}>Upload File:</label>
                    <input
                      type="file"
                      name="file"
                      accept=".xls,.xlsx"
                      onChange={handleFileChange}
                      style={{ flex: 1, color: 'white', background: '#1a252f', border: '1px solid grey', borderRadius: '6px', padding: '6px 8px', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#f1a128',
                        color: 'black',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '30px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffb74d'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1a128'}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '30px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                      onClick={() => setShowAddQuestionModal(false)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ef5350'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f44336'}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExportmcqpsyo}
                      style={{
                        background: 'orange',
                        color: 'black',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffb74d'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'orange'}
                    >
                      MCQ
                    </button>
                    <button
                      onClick={handleExportwithouttestcase}
                      type="button"
                      style={{
                        background: 'orange',
                        color: 'black',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffb74d'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'orange'}
                    >
                      Coding
                    </button>
                    <button
                      onClick={handleExporttestcase}
                      type="button"
                      style={{
                        background: 'orange',
                        color: 'black',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffb74d'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'orange'}
                    >
                      Testcase
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <nav aria-label="Topics" style={topicsContainerStyle}>
          {topics.map(topic => {
            const isActive = activeTopic && activeTopic.id === topic.id;
            const circleKey = getTopicCircleKey(topic);
            const isHovered = hoveredCircle === circleKey;
            return (
              <div
                key={topic.id}
                style={circleStyle(isActive, true, isHovered)}
                onClick={() => handleTopicClick(topic)}
                title={topic.question_type}
                aria-label={`Topic: ${topic.question_type}`}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleTopicClick(topic); }}
                onMouseEnter={() => setHoveredCircle(circleKey)}
                onMouseLeave={() => setHoveredCircle(null)}
              >
                <div style={iconCircleStyle}>{icons[topic.question_type?.toLowerCase()] || '👨‍💻'}</div>
                <div style={{ fontSize: 12, fontWeight: isActive ? '700' : '600', lineHeight: '1.2', wordBreak: 'break-word' }}>
                  {topicDisplayOverrideForNav[topic.question_type] || topic.question_type}
                </div>
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Demo;