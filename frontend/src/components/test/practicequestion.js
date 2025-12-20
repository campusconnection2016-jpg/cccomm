import React, { useState, useEffect } from 'react';
import '../../styles/assessment.css';

import {
  getAllTopics,
  getSubTopicsByTopicId,
  getSubTopicsByTopicIdModal,

  getFolderBySubTopicTestId,
  getFolderBySubTopicId,
  
  getfolderApi,

  addQuestionUpload,
  getGroupedQuestionPapersApi
} from '../../api/endpoints';
import ExcelJS from 'exceljs';
import { useNavigate } from 'react-router-dom';

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
import AddCodingQuestion from "./addcodingquestion";


import uploadIcon from "../../assets/images/upload.png";

const subtopicLogos = {
  java: Javalogo,
  tcs: tcslogo,
  wipro: wiprologo,
  cognizant: cognizantlogo,
  python: pythonlogo,
  ai: ailogo,
  ml: mllogo,
  iot: iotlogo,
  vlsi: vlsilogo,
  matlab: matlablogo,
  "data structures": dsalogo,

  c: clogo,
  quants: '🧮',
  logical: '🧩',
  verbal: '💬',
  html: htmllogo,
  cpp: '🔷',
  'c++': csharplogo,
  "all language": '📟',
  syllabus: '📚',
};

const icons = {
  technical: '💻',
  aptitude: '🧠',
  softskills: '🤝',
  companyspecific: '🏢',
  mcqtest: '📝',
  codingtest: '⌨️',
  ds: '📊',
  time: '⏳',
};

const codingOptions = [
  { key: 'testcases coding', label: 'testcases coding', is_testcase: true },
  { key: 'without testcases coding', label: 'without testcases coding', is_testcase: false }
];
const topicDisplayOverrideForNav = {
  CompanySpecific: 'Company Specific', // display override ONLY for navigation circles
};


const Demo = ({ userRole }) => {
  const [showAddCodingModal, setShowAddCodingModal] = useState(false);

  const [showSyllabusPopup, setShowSyllabusPopup] = useState(false);
  const [syllabusEmbed, setSyllabusEmbed] = useState('');

  const [topics, setTopics] = useState([]);
  // <-- SPLIT STATES: navigation vs modal
  const [subTopicsNav, setSubTopicsNav] = useState([]);
  const [subTopicsModal, setSubTopicsModal] = useState([]);

  const [folders, setFolders] = useState([]);
  const [papers, setPapers] = useState([]);
  const [mcqToggle, setMcqToggle] = useState(false);
  const [codingToggle, setCodingToggle] = useState(false);
  const [companyToggle, setCompanyToggle] = useState("center");
  const [modalFolders, setModalFolders] = useState([]);


  const [activeTopic, setActiveTopic] = useState(null);
  const [activeTestType, setActiveTestType] = useState(null);
  const [activeSubTopic, setActiveSubTopic] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [openCodingOption, setOpenCodingOption] = useState(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [hoveredCircle, setHoveredCircle] = useState(null);

  const [hasClickedTopic, setHasClickedTopic] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    test_type: '',
    subtopic: '',
    folder_name: '',
    file: null,
    uploadType: '',
  });

  const [visibleChildLevel, setVisibleChildLevel] = useState(null);

  const navigate = useNavigate();

  // Normalizer - convert various API shapes to a consistent {id, skill_type}
  const normalizeSubTopics = (data = []) => {
    return (Array.isArray(data) ? data : []).map((s, idx) => {
      const id = s.id ?? s.sub_topic_id ?? s.skill_type_id ?? s.sub_topic ?? `sub-${idx}`;
      const skill_type = s.skill_type ?? s.skill_type_name ?? s.sub_topic ?? s.name ?? String(id);
      return { id, skill_type, raw: s };
    });
  };

  useEffect(() => {
    if (showAddQuestionModal && (formData.subtopic || formData.folder_name) && activeTopic) {
      getFolderBySubTopicId()
        .then(data => {
          const filtered = data.filter(folder => {
            const folderTopic = (folder.topic || folder.topic_name || "").toString().toLowerCase();
            const folderSubtopic = (folder.sub_topic || folder.sub_topic_id || "").toString();
            const folderName = (folder.folder_name || folder.id || "").toString().toLowerCase();

            const activeTopicName = (activeTopic.question_type || activeTopic.name || "").toString().toLowerCase();
            const formSubtopic = (formData.subtopic || "").toString();
            const formFolderName = (formData.folder_name || "").toString().toLowerCase();

            const matchesTopic = folderTopic === activeTopicName;

            // If sub_topic is selected → filter strictly by topic + subtopic
            if (formData.subtopic) {
              return matchesTopic && folderSubtopic === formSubtopic;
            }

            // If only folder_name
            if (formData.folder_name) {
              return matchesTopic && folderName === formFolderName;
            }

            return false;
          });

          setModalFolders(filtered);
          setFormData(prev => ({
            ...prev,
            folder_name: prev.folder_name || ""
          }));
        })
        .catch(err => {
          console.error("Failed to fetch filtered folders:", err);
          setModalFolders([]);
          setFormData(prev => ({ ...prev, folder_name: "" }));
        });
    } else {
      setModalFolders([]);
      setFormData(prev => ({
        ...prev,
        folder_name: ""
      }));
    }
  }, [formData.subtopic, formData.folder_name, activeTopic, showAddQuestionModal]);

  const handleNavigationFolderSelect = (folder) => {
    setFormData(prev => ({
      ...prev,
      topic: activeTopic ? activeTopic.question_type : '',
      subtopic: activeSubTopic ? activeSubTopic.skill_type || activeSubTopic.id : '',
      folder_name: folder.folder_name || folder.id || '',
      file: null,
      uploadType: '',
    }));
    setShowAddQuestionModal(true);
  };

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
            if (topicTypeLower === 'technical') setVisibleChildLevel('testType');
            else setVisibleChildLevel('subTopic');
          }
        } else {
          setVisibleChildLevel(null);
        }
        break;
      case 'testType':
        setActiveTestType(null);
        setActiveSubTopic(null);
        setActiveFolder(null);
        setOpenCodingOption(null);
        setVisibleChildLevel('testType');
        break;
      case 'subTopic':
        setActiveSubTopic(null);

        if (activeTopic?.question_type !== "CompanySpecific") {
          setActiveFolder(null);
        }

        setOpenCodingOption(null);
        setVisibleChildLevel('subTopic');
        break;
      case 'codingOption':
        setOpenCodingOption(null);
        setActiveFolder(null);
        setVisibleChildLevel('codingOption');
        break;
      case 'folder':
        if (activeTopic?.question_type === "CompanySpecific") {
          setActiveFolder(null);
          setActiveSubTopic(null);
          setVisibleChildLevel('folder');
        } else {
          setActiveFolder(null);
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
      setSubTopicsNav([]);
      setFolders([]);
      setVisibleChildLevel(null);
      setHasClickedTopic(false);
    } else {
      setActiveTopic(topic);
      setActiveTestType(null);
      setActiveSubTopic(null);
      setActiveFolder(null);
      setOpenCodingOption(null);
      setSubTopicsNav([]);
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
        setVisibleChildLevel("folder");

        // Fetch its only sub_topic from DB for navigation (use navigation API)
        getSubTopicsByTopicId(topic.id)
          .then(data => {
            const filtered = data.filter(st => st.question_type_id === topic.id);
            const normalized = normalizeSubTopics(filtered);
            if (normalized.length > 0) {
              setSubTopicsNav(normalized);
              setActiveSubTopic(normalized[0]);   // auto-select first (only) sub_topic
            }
          })
          .catch(err => {
            console.error("Failed to fetch SoftSkills sub_topic:", err);
            setSubTopicsNav([]);
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

        // NAVIGATION must use getSubTopicsByTopicId
        getSubTopicsByTopicId(topic.id)
          .then(data => {
            const filteredSubTopics = (Array.isArray(data) ? data : []).filter(st => st.question_type_id === topic.id);
            setSubTopicsNav(normalizeSubTopics(filteredSubTopics));
          })
          .catch(err => {
            console.error('Failed to fetch subtopics:', err);
            setSubTopicsNav([]);
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
    // For CompanySpecific, always select the subtopic (don't toggle)
    if (activeTopic?.question_type === "CompanySpecific") {
      setActiveSubTopic(subTopic);

      if (subTopic.skill_type === "Syllabus") {
        getfolderApi()
          .then(data => {
            const syllabusItem = data.find(item =>
              item.skill_type_name === "Syllabus" &&
              item.folder_name === activeFolder
            );

            if (syllabusItem && syllabusItem.syllabus) {
              const fixedHtml = syllabusItem.syllabus
                .replace(/width="\d+"/gi, 'width="100%"')
                .replace(/height="\d+"/gi, 'height="100%"')
                .replace(/style="[^"]*"/gi, 'style="width:100%;height:100%;"');

              setSyllabusEmbed(fixedHtml);
              setShowSyllabusPopup(true);
            }
            else {
              console.warn("No syllabus found for this folder");
            }
          })
          .catch(err => console.error("Failed to fetch syllabus:", err));

        return;
      }

      setVisibleChildLevel('subTopic');
      return;
    }

    if (activeSubTopic && activeSubTopic.id === subTopic.id) {
      setActiveSubTopic(null);
      setOpenCodingOption(null);
      setFolders([]);
      setActiveFolder(null);
      setVisibleChildLevel(null);
    } else {
      setActiveSubTopic(subTopic);
      setOpenCodingOption(null);
      setActiveFolder(null);

      const topicTypeLower = activeTopic?.question_type.toLowerCase();
      if ((topicTypeLower === 'technical') && activeTestType === 'Coding Test') {
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
      if (activeTopic?.question_type === "CompanySpecific") {
        return;
      }
    } else {
      setActiveFolder(folderName);

      if (activeTopic?.question_type === "CompanySpecific") {
        getFolderBySubTopicTestId()
          .then(data => {
            const filteredData = data.filter(item =>
              item.topic === "CompanySpecific" && item.folder_name === folderName
            );

            let newSubTopics = filteredData.map(item => ({
              id: item.sub_topic_id || item.sub_topic,
              skill_type: item.sub_topic
            }));

            if (activeTopic?.question_type === "CompanySpecific") {
              const order = ["Syllabus", "Aptitude", "All language"];

              newSubTopics.sort((a, b) => {
                const aIndex = order.indexOf(a.skill_type);
                const bIndex = order.indexOf(b.skill_type);

                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return a.skill_type.localeCompare(b.skill_type);
              });
            }

            // SET NAV subtopics only
            setSubTopicsNav(newSubTopics);

            setVisibleChildLevel('subTopic');
          })
          .catch(err => {
            console.error("Failed to fetch CompanySpecific subtopics on folder click:", err);
          });
      } else {
        setVisibleChildLevel('folder');
      }
    }
  };


 const openAddQuestionModalFunc = () => {
  const topicTypeLower = activeTopic?.question_type.toLowerCase();

  if (topicTypeLower === 'companyspecific') {
    // only auto-fill when BOTH sub_topic and folder exist
    setFormData({
      topic: activeTopic.question_type,
      test_type: 'MCQ Test',
      subtopic: activeSubTopic ? activeSubTopic.skill_type || activeSubTopic.id : '',
      folder_name: (activeSubTopic && activeFolder) ? activeFolder : '',
      file: null,
      uploadType: '',
    });

    // IMPORTANT: modal dropdown must come from modal API only
    getSubTopicsByTopicIdModal(activeTopic.id)
      .then(data => setSubTopicsModal(normalizeSubTopics(data)))
      .catch(() => setSubTopicsModal([]));

    if (activeSubTopic) {
      getFolderBySubTopicId(activeSubTopic.id)
        .then(folders => {
          const filteredFolders = folders.filter(folder => folder.topic === activeTopic.question_type);
          setModalFolders(filteredFolders);
        })
        .catch(() => setModalFolders([]));
    } else {
      setModalFolders([]);
    }
  }
  else {
    setFormData({
      topic: activeTopic ? activeTopic.question_type : '',
      test_type: 'MCQ Test',
      subtopic: activeSubTopic ? activeSubTopic.skill_type || activeSubTopic.id : '',
      folder_name: activeFolder || '',
      file: null,
      uploadType: '',
    });

    // ALWAYS populate modal dropdown from the modal API
    if (activeTopic) {
      getSubTopicsByTopicIdModal(activeTopic.id)
        .then(data => setSubTopicsModal(normalizeSubTopics(data)))
        .catch(() => setSubTopicsModal([]));
    } else {
      setSubTopicsModal([]);
    }

    if (activeSubTopic) {
      getFolderBySubTopicId(activeSubTopic.id)
        .then(data => setModalFolders(data))
        .catch(() => setModalFolders([]));
    } else {
      setModalFolders([]);
    }
  }

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
          if (rowNumber === 1) return; // skip header
          rows.push({ rowNumber, values: row.values.slice(1) });
        });

        const questionMap = new Map();
        const duplicates = [];

        rows.forEach(({ rowNumber, values }) => {
          const questionText = (values[0] || '').toString().trim();
          if (questionText) {
            if (questionMap.has(questionText)) {
              duplicates.push(rowNumber);
            } else {
              questionMap.set(questionText, rowNumber);
            }
          }
        });

        if (duplicates.length > 0) {
          alert(`Duplicate question_text found at row(s): ${duplicates.join(', ')}`);
          setShowAddQuestionModal(false);
          return;
        }

        let created = 0;

        const topicTypeLower = activeTopic?.question_type.toLowerCase();
        const isTestcaseFlag =
          (topicTypeLower === "technical") &&
            activeTestType === "Coding Test" &&
            openCodingOption === "testcases coding"
            ? true
            : (topicTypeLower === "technical") &&
              activeTestType === "Coding Test" &&
              openCodingOption === "without testcases coding"
              ? false
              : undefined;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i].values;
          let folderNameFromExcel = row[9] ? String(row[9]).trim() : '';
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
            difficulty_level: row[7] || '',
            explain_answer: row[8] || '',
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

        alert(`Excel data uploaded successfully (${created} questions).`);
        setShowAddQuestionModal(false);
      } catch (error) {
        console.error(error);
        alert('Failed to upload Excel data.');
        setShowAddQuestionModal(false);
      }
    } else {
      alert('Unsupported file type. Please upload Excel files only.');
    }
  };

  // ... rest of UI styling and helper functions unchanged (circleStyle, icons, etc.)
  // For brevity I'm keeping the original styling and markup; only the subtopics-related JSX was changed below.

  // (Circle styles, iconCircleStyle, container styles remain the same as your original file)
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
          ? 'rgba(255,255,255,0.07)'
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

  const isTechnicalOrCompanySpecific = activeTopic && (activeTopic.question_type.toLowerCase() === 'technical');

  const showAddCodingQuestionButton =
    isTechnicalOrCompanySpecific &&
    activeTestType === "Coding Test" &&
    activeSubTopic &&
    (openCodingOption || activeFolder);

  const showAddQuestionButton =
    activeSubTopic && !showAddQuestionModal && activeTestType !== "Coding Test";

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
            style={breadcrumbItemStyle((!visibleChildLevel || (visibleChildLevel === 'folder' && !activeTestType && activeTopic?.question_type !== "CompanySpecific"))) }
            aria-current={(!visibleChildLevel || (visibleChildLevel === 'folder' && !activeTestType && activeTopic?.question_type !== "CompanySpecific")) ? 'page' : undefined}
            title="Topic"
          >
            {activeTopic.question_type}
          </span>

          {/* CompanySpecific / TestType / SubTopic / Folder breadcrumbs kept as original */}
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

          {(activeTopic.question_type.toLowerCase() === 'technical') && activeTestType && (
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

          {(activeSubTopic
            && activeTopic?.question_type !== "CompanySpecific"
            && activeTopic?.question_type !== "SoftSkills") && (

              <>
                {((activeTopic.question_type.toLowerCase() === 'technical') && activeTestType) && arrowIcon}
                {(activeTopic.question_type.toLowerCase() !== 'technical') && arrowIcon}
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

          {(openCodingOption && (activeTopic.question_type.toLowerCase() === 'technical') && activeTestType === 'Coding Test') && (
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '10px', marginRight: '20px' }}>

              {/* Add/Upload buttons area (unchanged) */}
              {(
                (showAddQuestionButton &&
                  (activeTopic?.question_type !== "CompanySpecific" ||
                    (activeTopic?.question_type === "CompanySpecific" &&
                      activeSubTopic?.skill_type === "Aptitude"))) ||

                (activeTopic?.question_type === "Aptitude") ||

                (activeTopic?.question_type === "Technical" && activeTestType === "MCQ Test")
              ) && (
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={mcqToggle}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMcqToggle(true);
                          setTimeout(() => {
                            openAddQuestionModalFunc();
                            setMcqToggle(false);
                          }, 300);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      position: 'relative',
                      width: '60px',
                      height: '22px',
                      background: mcqToggle ? '#f1a128' : '#ccc',
                      borderRadius: '20px',
                      transition: 'background 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: mcqToggle ? 'flex-start' : 'flex-end',
                      padding: '0 5px',
                      color: 'black',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {mcqToggle ? 'ON' : 'MCQ'}
                      <img
                        src={uploadIcon}
                        alt="upload"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: mcqToggle ? '40px' : '9px',
                          width: '16px',
                          height: '16px',
                          transition: 'left 0.3s',
                        }}
                      />
                    </span>
                  </label>
                )}

              {(
                (showAddCodingQuestionButton || (activeTopic?.question_type === activeSubTopic)) ||

                (activeTopic?.question_type === "Technical" && activeTestType === "Coding Test")
              ) && (
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={codingToggle}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCodingToggle(true);
                          setTimeout(() => {
                            setShowAddCodingModal(true);
                            setCodingToggle(false);
                          }, 300);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      position: 'relative',
                      width: '70px',
                      height: '22px',
                      background: codingToggle ? '#f1a128' : '#ccc',
                      borderRadius: '20px',
                      transition: 'background 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: codingToggle ? 'flex-start' : 'flex-end',
                      padding: '0 5px',
                      color: 'black',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      Coding
                      <img
                        src={uploadIcon}
                        alt="upload"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: codingToggle ? '50px' : '7px',
                          width: '16px',
                          height: '16px',
                          transition: 'left 0.3s',
                        }}
                      />
                    </span>
                  </label>
                )}

              {activeTopic?.question_type === "CompanySpecific" && activeSubTopic?.skill_type !== "Aptitude" && activeSubTopic?.skill_type !== "Syllabus" && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '20px', marginBottom: '10px', position: 'relative' }}>
                  <div style={{
                    position: 'relative',
                    width: '105px',
                    height: '26px',
                    background:
                      companyToggle === "left"
                        ? '#f1a128'
                        : companyToggle === "right"
                          ? '#f1a128'
                          : '#ccc',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'black',
                    transition: 'background 0.3s'
                  }}>
                    <span style={{ fontSize: '11px' }}>MCQ</span>
                    <span style={{ fontSize: '11px' }}>Coding</span>

                    <img
                      src={uploadIcon}
                      alt="upload"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: companyToggle === "left" ? '2px' : companyToggle === "center" ? '37px' : '70px',
                        width: '19px',
                        height: '19px',
                        transition: 'left 0.3s',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="1"
                    value={companyToggle === "left" ? 0 : companyToggle === "center" ? 1 : 2}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val === 0) {
                        setCompanyToggle("left");
                        setTimeout(() => {
                          openAddQuestionModalFunc();
                          setCompanyToggle("center");
                        }, 300);
                      } else if (val === 2) {
                        setCompanyToggle("right");
                        setTimeout(() => {
                          setShowAddCodingModal(true);

                          setCompanyToggle("center");
                        }, 300);
                      } else {
                        setCompanyToggle("center");
                      }
                    }}
                    style={{
                      position: 'absolute',
                      width: '90px',
                      height: '26px',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}

            </div>

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
                (activeTopic?.question_type === 'CompanySpecific' || (!isTechnicalOrCompanySpecific || activeTestType)) &&
                subTopicsNav.map(subTopic => {
                  const isActive = activeSubTopic && activeSubTopic.id === subTopic.id;
                  const circleKey = getSubTopicCircleKey(subTopic);
                  const isHovered = hoveredCircle === circleKey;
                  return (
                    <div
                      key={subTopic.id}
                      style={circleStyle(isActive, false, isHovered)}
                      onClick={() => {
                        handleSubTopicClick(subTopic);
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
                            if (logo.length === 2 || logo.length === 1) {
                              return <div style={{ fontSize: 24, lineHeight: 1 }}>{logo}</div>;
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
                  (activeTopic?.question_type === "CompanySpecific" && !activeFolder)
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
                    let folderLogoElement = (
                      <div style={{ fontSize: 24 }}>📁</div>
                    );
                    if (folder.folder_logo) {
                      let imageSrc;
                      if (typeof folder.folder_logo === 'string') {
                        imageSrc = folder.folder_logo.startsWith('data:')
                          ? folder.folder_logo
                          : `data:image/png;base64,${folder.folder_logo}`;
                      } else {
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
                        style={circleStyle(isActive, false, isHovered)}
                        onClick={e => {
                          e.stopPropagation();
                          handleFolderClick(folder.folder_name);
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

            <main className="right-content-container">
              {activeTopic && (
                <PracticeTable
                  data={[]}
                  userRole={userRole}
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

                      {/* MODAL DROPDOWN: ALWAYS USE subTopicsModal (populated from getSubTopicsByTopicIdModal) */}
                      <select
  id="subtopic-select"
  name="subtopic"
  value={formData.subtopic}
  onChange={(e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      subtopic: value,
      folder_name: ""   // reset folder when subtopic changes
    }));
    setModalFolders([]);
  }}
  style={{ width: '100%', background: '#1a252f', color: 'white', border: '1px solid grey', borderRadius: '6px', padding: '8px', fontSize: '14px' }}
>
  <option value="">Select Subtopic</option>
  {subTopicsModal
    .filter(sub => !(activeTopic?.question_type === "CompanySpecific" && sub.skill_type === "Syllabus"))
    .map(sub => (
      <option key={sub.id} value={sub.skill_type}>
        {sub.skill_type}
      </option>
  ))}
</select>


                    </div>
                    <div style={{ flex: '1 1 45%' }}>
                      <label style={{ color: 'white', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Folder (Optional):</label>
                      <select
                        name="folder_name"
                        value={formData.folder_name}
                        onChange={handleInputChange}
                        style={{ width: '100%', background: '#1a252f', color: 'white', border: '1px solid grey', borderRadius: '6px', padding: '8px', fontSize: '14px' }}
                      >
                         <option value="">Select Folder</option>
                        {modalFolders.map(folder => (
                          <option key={folder.id} value={folder.folder_name || folder.id}>
                            {folder.folder_name || folder.id}
                          </option>
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
                        borderRadius: '5px',
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
                        borderRadius: '5px',
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
                        borderRadius: '5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffb74d'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'orange'}
                    >
                      MCQ
                    </button>

                  </div>
                </form>
              </div>
            )}

            {showAddCodingModal && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '10px',
                overflowY: 'auto'
              }}>
                <div style={{
                  borderRadius: '12px',
                  minWidth: '80%',
                  minHeight: '80%',
                  padding: '0',
                  overflow: 'auto'
                }}>
                  <AddCodingQuestion
                    topic={activeTopic ? activeTopic.question_type : ''}
                    test_type={activeTestType}
                    subtopic={activeSubTopic ? activeSubTopic.skill_type : ''}
                    folder_name={activeFolder || ''}
                    codingType={openCodingOption}
                    onClose={() => setShowAddCodingModal(false)}
                  />
                </div>
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
            padding: '10px',
            borderRadius: '12px',
            width: '95%',
            height: '90%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div
              style={{ flex: 1 }}
              dangerouslySetInnerHTML={{ __html: syllabusEmbed }}
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
    </div>
  );
};

export default Demo;
