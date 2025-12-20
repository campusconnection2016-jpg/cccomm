import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import '../components/sidebar.css'
import menuIcon from '../assets/images/menu.png';
import DashboardIcon from '../assets/images/dashboard.png';
import DatabaseIcon from '../assets/images/database.png';
import TestIcon from '../assets/images/test.png';
import announcement from '../assets/images/annonucement.png';
import LMSIcon from '../assets/images/lms.png';
import CompanyIcon from '../assets/images/company-statestic.png';
import Testaccess from './test/testaccess';
import ProfileIcon from '../assets/images/jobprofile.png';
import Downarrow from '../assets/images/dowm.png';
import questionsPng from '../assets/images/questions.png';
import PracticesIcon from '../assets/images/practice.png';
import {getUserRoleAccess} from  '../api/endpoints';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext } from './test/context/testtypecontext';
import  { useEffect} from 'react';
const Sidebar = ({institute,username}) => {
  const { setSelectedTestType } = useContext(TestTypeContext);
  const { setSelectedTestTypeCategory } = useContext(TestTypeCategoriesContext);
  const { setSelectedQuestionType } = useContext(QuestionTypeContext);
  const { setSelectedSkillType } = useContext(SkillTypeContext);
  const [isannouncementopen, setIsannouncementOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(true); // Changed initial state to true
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [islmsOpen, setIslmsOpen] = useState(false);
  const [isdashopen, setIsDashOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [ispracticeOpen, setIspracticeOpen] = useState(false);
  const [iscmpyOpen, setIscmpyOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMCQOpen, setIsMCQOpen] = useState(false);
  const [selectedMCQOption, setSelectedMCQOption] = useState(null);
  const [isCodingOpen, setIsCodingOpen] = useState(false);
  const [selectedCodingOption, setSelectedCodinOption] = useState(null);

  const [isPreOpen, setIsPreOpen] = useState(false);
  const [selectedPreOption, setSelectedPreOption] = useState(null);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isMockOpen, setIsMockOpen] = useState(false);
  const [isComOpen, setIsComOpen] = useState(false);
  const [isPsyOpen, setIsPsyOpen] = useState(false);
  const [isSoftOpen, setIsSoftOpen] = useState(false);
  const [isPracOpen, setIsPracOpen] = useState(false);

  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [selectedSkillTypeOption, setSelectedSkillTypeOption] = useState(null);
  const [selectedSkillTypeOptionLMS, setSelectedSkillTypeOptionLMS] = useState(null);

  const [isAptitudeOpen, setIsAptitudeOpen] = useState(false);
  const [isSfOpen, setIsSfOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);

  const [isAptitudeOpenLMS, setIsAptitudeOpenLMS] = useState(false);
  const [isSfOpenLMS, setIsSfOpenLMS] = useState(false);
  const [isTechOpenLMS, setIsTechOpenLMS] = useState(false);

  const [isTechOpenCode, setIsTechOpenCode] = useState(false);
  const [isPreOpenCode, setIsPreOpenCode] = useState(false);
  const [isPostOpenCode, setIsPostOpenCode] = useState(false);
  const [isAssessmentOpenCode, setIsAssessmentOpenCode] = useState(false);
  const [isMockOpenCode, setIsMockOpenCode] = useState(false);
  const [isComOpenCode, setIsComOpenCode] = useState(false);
  const [isPracOpenCode, setIsPracOpenCode] = useState(false);


  const [selectedTestTypeOption, setSelectedTestTypeOption] = useState(null);
  const [isTestaccessVisible, setIsTestaccessVisible] = useState(false); // Set to false to hide initially

  const [isReportsOpen, setIsReportsOpen] = useState(false);
 const [levelAccess, setLevelAccess] = useState(null);
  useEffect(() => {
    if (institute && username) {
      getUserRoleAccess(institute, username)
        .then((data) => {
          console.log("Access Data:", data);
          setLevelAccess(data?.level_of_access || null);
        })
        .catch((err) => console.error("Failed to fetch level of access:", err));
    }
  }, [institute, username]);
  
  const toggleReportsMenu = () => {
    setIsReportsOpen(!isReportsOpen);
    setIslmsOpen(false);
    setIsTestOpen(false);
    setIsDatabaseOpen(false);
    setIsProfileMenuOpen(false);
    setIscmpyOpen(false);
    setIsAptitudeOpenLMS(false);
    setIsTechOpenLMS(false);
    setIsQuestionsOpen(false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }

  };
  const togglelmsMenu = () => {
    setIslmsOpen(!islmsOpen && true);
    setIsTestOpen(false);
    setIsDatabaseOpen(false);
    setIscmpyOpen(false);
    setIsAptitudeOpenLMS(false);
    setIsTechOpenLMS(false);
    setIsQuestionsOpen(false);
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };


  const [activeMenuItem, setActiveMenuItem] = useState(null);

  //const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMenuItemClick = (menuItem, isLastSubMenu) => {
    setActiveMenuItem(menuItem);

    // setIsOpen(false); // Expand the sidebar if it's collapsed

  };
  const toggleSidebar = () => {
    setIsOpen(!isOpen);

  };
  const toggleSubmenu = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
    setIsOpen(false);
  };
  const toggledashMenu = () => {
    setIsDashOpen(!isdashopen && true)
    setIslmsOpen(false);
    setIsTestOpen(false);
    setIsDatabaseOpen(false);
    setIsProfileMenuOpen(false);
    setIscmpyOpen(false);
    setIsAptitudeOpenLMS(false);
    setIsTechOpenLMS(false);
    setIsQuestionsOpen(false);
    setIsReportsOpen(false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };
  const toggleannounceMenu = () => {
    setIsannouncementOpen(isannouncementopen && true);
    setIslmsOpen(false);
    setIsDashOpen(false);
    setIsTestOpen(false);
    setIsDatabaseOpen(false);
    setIscmpyOpen(false);
    setIsAptitudeOpenLMS(false);
    setIsTechOpenLMS(false);
    setIsQuestionsOpen(false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen && true);
    setIsTestOpen(false);
    setIsDatabaseOpen(false);
    setIsReportsOpen(false);
    setIscmpyOpen(false);
    setIsAptitudeOpenLMS(false);
    setIsTechOpenLMS(false);
    setIsQuestionsOpen(false);

  };

  /* const toggleReportsMenu = () => {
     setIslmsOpen(false);
     setIsTestOpen(false);
     setIsDatabaseOpen(false);
     setIscmpyOpen(false);
     setIsAptitudeOpenLMS(false);
     setIsTechOpenLMS(false);
     setIsQuestionsOpen(false);
     if (!isOpen) {
       setIsOpen(true); // Expand the sidebar if it's collapsed
     }
   };*/


  const toggleQuestionsMenu = () => {
    setIsQuestionsOpen(!isQuestionsOpen && true);
    setIslmsOpen(false);
    setIsTestOpen(false);
    setIsDatabaseOpen(false);
    setIsProfileMenuOpen(false);
    setIsReportsOpen(false);
    setIscmpyOpen(false);
    setIsAptitudeOpenLMS(false);
    setIsTechOpenLMS(false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }
  };


  const toggleTestMenu = () => {
    setIsTestOpen(!isTestOpen && true);
    setIsMCQOpen(false);
    setIslmsOpen(false);
    setIsDatabaseOpen(false);
    setIsProfileMenuOpen(false);
    setIscmpyOpen(false);
    setIsReportsOpen(false);
    setIsMapOpen(false);
    setIsTechOpenCode(false);
    setIsCodingOpen(false);
    setIsQuestionsOpen(false);
    setIsPreOpen(false);
    setIsPostOpen(false);
    setIsPracOpen(false);
    setIsAssessmentOpen(false);
    setIsMockOpen(false);
    setIsComOpen(false);
    setIsPsyOpen(false);

  };



  const toggleDatabaseMenu = () => {
    setIsDatabaseOpen(!isDatabaseOpen && true);
    setIsTestOpen(false);
    setIslmsOpen(false);
    setIscmpyOpen(false);
    setIsReportsOpen(false);
    setIsProfileMenuOpen(false);
    setIsQuestionsOpen(false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }
  };

  const togglecmpyMenu = () => {
    setIscmpyOpen(!iscmpyOpen && true);
    setIsDatabaseOpen(false);
    setIsTestOpen(false);
    setIslmsOpen(false);
    setIsQuestionsOpen(false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }
  };


  const toggleMapTest = () => {
    setIsMapOpen(!isMapOpen && true);
    setIsMCQOpen(false);
    setIsCodingOpen(false);
    setIsQuestionsOpen(false);
    setIsPreOpen(false);
    setIsPostOpen(false);
    setIsPracOpen(false);
    setIsAssessmentOpen(false);
    setIsMockOpen(false);
    setIsComOpen(false);
    setIsPsyOpen(false);
    setIsQuestionsOpen(false);


  };

  const toggleMCQMenu = () => {
    setIsMCQOpen(!isMCQOpen && true);
    setIsCodingOpen(false);
    setIsPreOpen(false);
    setIsPostOpen(false);
    setIsPracOpen(false);
    setIsAssessmentOpen(false);
    setIsMockOpen(false);
    setIsComOpen(false);
    setIsPsyOpen(false);
    setIsQuestionsOpen(false);

    setSelectedTestType('MCQ Test');
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };


  const toggleCodingMenu = () => {
    setIsCodingOpen(!isCodingOpen && true);
    setIsMCQOpen(false);
    setIsPreOpenCode(false);
    setIsPostOpenCode(false);
    setIsPracOpenCode(false);
    setIsAssessmentOpenCode(false);
    setIsMockOpenCode(false);
    setIsComOpenCode(false);
    setIsQuestionsOpen(false);

    setSelectedTestType('Coding Test');
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };

  const handleMcqOp = (option) => {
    setSelectedMCQOption(option);
    setSelectedTestTypeCategory(option);
    console.log('Selected MCQ option: ', option)
  };

  const handleCodingOp = (option) => {
    setSelectedCodinOption(option);
    setSelectedTestTypeCategory(option);
    console.log('Selected Coding option: ', option)
  };


  const handleTestType = (option) => {
    setSelectedTestTypeOption(option);
    console.log('Selected Test Type option: ', option)
  };



  const togglePreMenu = () => {
    setIsPreOpen(false);
    setIsPostOpen(false);
    setIsPracOpen(false);
    setIsAssessmentOpen(false);
    setIsMockOpen(false);
    setIsComOpen(false);
    setIsPsyOpen(false);
    setIsAptitudeOpen(false);
    setIsTechOpen(false);
    setIsQuestionsOpen(false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }
  };


  const togglePreMenuCode = () => {
    setIsPreOpenCode(!isPreOpenCode && true);
    setIsPostOpenCode(false);
    setIsPracOpenCode(false);
    setIsAssessmentOpenCode(false);
    setIsMockOpenCode(false);
    setIsComOpenCode(false);
    setIsTechOpenCode(false);
    setIsQuestionsOpen(false);


  };


  const togglePostMenu = () => {
    setIsPostOpen(!isPostOpen && true);
    setIsPreOpen(false);
    setIsPracOpen(false);
    setIsAssessmentOpen(false);
    setIsMockOpen(false);
    setIsComOpen(false);
    setIsPsyOpen(false);
    setIsAptitudeOpen(false);
    setIsTechOpen(false);
    setIsQuestionsOpen(false);
    if (!isOpen) {
      setIsOpen(true); // Expand the sidebar if it's collapsed
    }
  };

  const togglePostMenuCode = () => {
    setIsPostOpenCode(!isPostOpenCode && true);
    setIsPreOpenCode(false);
    setIsPracOpenCode(false);
    setIsAssessmentOpenCode(false);
    setIsMockOpenCode(false);
    setIsComOpenCode(false);
    setIsTechOpenCode(false);
    setIsQuestionsOpen(false);

  };


  const toggleAssessMenu = () => {
    setIsAssessmentOpen(!isAssessmentOpen);
    setIsPreOpen(false);
    setIsPostOpen(false);
    setIsPracOpen(false);
    setIsMockOpen(false);
    setIsComOpen(false);
    setIsPsyOpen(false);
    setIsAptitudeOpen(false);
    setIsTechOpen(false);
    setIsQuestionsOpen(false);

  };

  const toggleAssessMenuCode = () => {
    setIsAssessmentOpenCode(!isAssessmentOpenCode);
    setIsPostOpenCode(false);
    setIsPracOpenCode(false);
    setIsPreOpenCode(false);
    setIsMockOpenCode(false);
    setIsComOpenCode(false);
    setIsTechOpenCode(false);
    setIsQuestionsOpen(false);

  };


  const toggleMockMenu = () => {
    setIsMockOpen(!isMockOpen && true);
    setIsPostOpen(false);
    setIsPracOpen(false);
    setIsAssessmentOpen(false);
    setIsPreOpen(false);
    setIsComOpen(false);
    setIsPsyOpen(false);
    setIsAptitudeOpen(false);
    setIsTechOpen(false);
    setIsQuestionsOpen(false);

  };

  const toggleMockMenuCode = () => {
    setIsMockOpenCode(!isMockOpenCode && true);
    setIsPostOpenCode(false);
    setIsPracOpenCode(false);
    setIsAssessmentOpenCode(false);
    setIsPreOpenCode(false);
    setIsComOpenCode(false);
    setIsTechOpenCode(false);
    setIsQuestionsOpen(false);

  };


  const toggleComMenu = () => {
    setIsComOpen(!isComOpen && true);
    setIsPostOpen(false);
    setIsPracOpen(false);
    setIsAssessmentOpen(false);
    setIsMockOpen(false);
    setIsPreOpen(false);
    setIsPsyOpen(false);
    setIsAptitudeOpen(false);
    setIsTechOpen(false);
    setIsQuestionsOpen(false);

  };

  const toggleComMenuCode = () => {
    setIsComOpenCode(!isComOpenCode && true);
    setIsPostOpenCode(false);
    setIsPracOpenCode(false);
    setIsAssessmentOpenCode(false);
    setIsMockOpenCode(false);
    setIsPreOpenCode(false);
    setIsTechOpenCode(false);
    setIsQuestionsOpen(false);

  };


  const togglePsyMenu = () => {
    setIsPsyOpen(!isPsyOpen && true);
    setIsPostOpen(false);
    setIsPracOpen(false);
    setIsAssessmentOpen(false);
    setIsMockOpen(false);
    setIsComOpen(false);
    setIsPreOpen(false);
    setIsAptitudeOpen(false);
    setIsTechOpen(false);
    setIsQuestionsOpen(false);
  };

  const toggleSoftMenu = () => {
    setIsSoftOpen(!isSoftOpen);
  };

  const togglePracMenu = () => {
    setIsPracOpen(!isPracOpen && true);
    setIsPostOpen(false);
    setIsAssessmentOpen(false);
    setIsMockOpen(false);
    setIsComOpen(false);
    setIsPreOpen(false);
    setIsAptitudeOpen(false);
    setIsTechOpen(false);
    setIsQuestionsOpen(false);
  };

  const togglePracMenuCode = () => {
    setIsPracOpenCode(!isPracOpenCode && true);
    setIsPostOpenCode(false);
    setIsPreOpenCode(false);
    setIsAssessmentOpenCode(false);
    setIsMockOpenCode(false);
    setIsComOpenCode(false);
    setIsTechOpenCode(false);
    setIsQuestionsOpen(false);
  };


  const handlePre = (option) => {
    setSelectedPreOption(option);
    console.log('Selected Pre option: ', option)
    setSelectedQuestionType(option);
  };


  const handleSkillType = (option) => {
    setSelectedSkillTypeOption(option);
    console.log('Selected skill option: ', option)
    setSelectedSkillType(option);

  };

  const handleSkillTypeLMS = (option) => {
    setSelectedSkillTypeOptionLMS(option);
    console.log('Selected skilltypelms option: ', option)
    setSelectedSkillType(option);

  };

  const toggleSkillMenu = () => {
    setIsSkillOpen(!isSkillOpen);
  };


  const toggleAptitudeMenu = () => {
    setIsAptitudeOpen(!isAptitudeOpen && true);
    setIsTechOpen(false);
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };


  const toggleSfMenu = () => {
    setIsSfOpen(!isSfOpen);
  };


  const toggleTechMenu = () => {
    setIsTechOpen(!isTechOpen && true);
    setIsAptitudeOpen(false);
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };


  const toggleAptitudeMenuLMS = () => {
    setIsAptitudeOpenLMS(!isAptitudeOpenLMS && true);
    setIsTechOpenLMS(false);
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };

  const toggleTechMenuLMS = () => {
    setIsTechOpenLMS(!isTechOpenLMS && true);
    setIsAptitudeOpenLMS(false);
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };

  const toggleTechMenuCode = () => {
    setIsTechOpenCode(!isTechOpenCode && true);
    if (window.innerWidth <= 768) {
      setIsOpen(false);  // Auto-collapse on mobile
    }
  };




  const SkilltypeAptitude = () => (
    <ul className='test-options' style={{ paddingLeft: '15px' }}>
      <li className={`test-option ${activeMenuItem === 'quants' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('quants'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('Quants')} onContextMenu={(e) => e.preventDefault()}>Quants</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'logical' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('logical'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('Logical')} onContextMenu={(e) => e.preventDefault()}>Logical</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'verbal' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('verbal'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('Verbal')} onContextMenu={(e) => e.preventDefault()}>Verbal</Link>
      </li>
    </ul>

  )

  const SkilltypeAptitudeLMS = () => (
    <ul className='test-options' style={{ paddingLeft: '25px' }}>
      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('Quants')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'quants' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('quants'); toggleSubmenu(); }}>

          <span className="dashboard-text">Quants</span>
        </li>
      </Link>
      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('Logical')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'logical' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('logical'); toggleSubmenu(); }}>

          <span className="dashboard-text">Logical</span>
        </li>
      </Link>
      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('Verbal')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'verbal' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('verbal'); toggleSubmenu(); }}>

          <span className="dashboard-text">Verbal</span>
        </li>
      </Link>

    </ul>

  )

  const SkilltypeTechnicalLMS = () => (
    <ul className='test-options' style={{ paddingLeft: '25px' }}>
      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('C')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'c' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('c'); toggleSubmenu(); }}>
          <span className="dashboard-text">C</span>
        </li>
      </Link>

      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('C++')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'c++' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('c++'); toggleSubmenu(); }}>
          <span className="dashboard-text">C++</span>
        </li>
      </Link>

      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('JAVA')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'java' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('java'); toggleSubmenu(); }}>
          <span className="dashboard-text">JAVA</span>
        </li>
      </Link>

      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('Python')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'python' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('python'); toggleSubmenu(); }}>
          <span className="dashboard-text">Python</span>
        </li>
      </Link>

      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('IOT')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'iot' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('iot'); toggleSubmenu(); }}>
          <span className="dashboard-text">IOT</span>
        </li>
      </Link>

      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('ML')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'ml' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('ml'); toggleSubmenu(); }}>
          <span className="dashboard-text">ML</span>
        </li>
      </Link>

      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('AI')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'ai' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('ai'); toggleSubmenu(); }}>
          <span className="dashboard-text">AI</span>
        </li>
      </Link>

      <Link to='/Lms/upload-video' onClick={() => handleSkillTypeLMS('Data Structures')} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'datastructures' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('datastructures'); toggleSubmenu(); }}>
          <span className="dashboard-text">Data Structures</span>
        </li>
      </Link>
    </ul>
  );


  const SkilltypeTechnical = () => (
    <ul className='test-options' style={{ paddingLeft: '10px' }}>
      <li className={`test-option ${activeMenuItem === 'All Languages' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('All Languages'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('All Languages')} onContextMenu={(e) => e.preventDefault()}>All</Link>
      </li>

      <li className={`test-option ${activeMenuItem === 'c' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('c'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('C')} onContextMenu={(e) => e.preventDefault()}>C</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'c++' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('c++'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('C++')} onContextMenu={(e) => e.preventDefault()}>C++</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'java' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('java'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('JAVA')} onContextMenu={(e) => e.preventDefault()}>JAVA</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'python' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('python'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('Python')} onContextMenu={(e) => e.preventDefault()}>Python</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'iot' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('iot'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('IOT')} onContextMenu={(e) => e.preventDefault()}>IOT</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'ml' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('ml'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('ML')} onContextMenu={(e) => e.preventDefault()}>ML</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'ai' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('ai'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('AI')} onContextMenu={(e) => e.preventDefault()}>AI</Link>
      </li>
      <li className={`test-option ${activeMenuItem === 'datastructures' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('datastructures'); toggleSubmenu(); }}>

        <Link to='/test/test-access' onClick={() => handleSkillType('Data Structures ')} onContextMenu={(e) => e.preventDefault()}>Data Structures </Link>
      </li>
    </ul>

  )

  const MCQOptions = () => (
    <ul className='test-options' style={{ paddingLeft: '20px' }}>
      <li className={`test-option ${activeMenuItem === 'aptitude' ? 'active' : ''}`} onClick={() => handleMenuItemClick('aptitude')}>

        <Link onClick={() => { handlePre('Aptitude'); toggleAptitudeMenu(); }} onContextMenu={(e) => e.preventDefault()}>Aptitude</Link>
        {isAptitudeOpen && (
          <img src={Downarrow} alt="Down Arrow" className="images12" />
        )}
      </li>
      {isAptitudeOpen && <SkilltypeAptitude />}

      <li className={`test-option ${activeMenuItem === 'softskills' ? 'active' : ''}`} onClick={() => handleMenuItemClick('softskills')}>

        <Link to='/test/test-access' onClick={() => { handlePre('Softskills'); handleSkillType('') }} onContextMenu={(e) => e.preventDefault()}>Softskills</Link>

      </li>


      <li className={`test-option ${activeMenuItem === 'technical' ? 'active' : ''}`} onClick={() => handleMenuItemClick('technical')}>

        <Link onClick={() => { handlePre('Technical'); toggleTechMenu(); }} onContextMenu={(e) => e.preventDefault()}>Technical</Link>
        {isTechOpen && (
          <img src={Downarrow} alt="Down Arrow" className="images12" />
        )}
      </li>
      {isTechOpen && <SkilltypeTechnical />}
    </ul>
  );

  const CodingOptions = () => (
    <ul className='test-options' style={{ paddingLeft: '20px' }}>
      <li className={`test-option ${activeMenuItem === 'technical' ? 'active' : ''}`} onClick={() => handleMenuItemClick('technical')}>

        <Link onClick={() => { handlePre('Technical'); toggleTechMenuCode(); }} onContextMenu={(e) => e.preventDefault()}>Technical</Link>
      </li>
      {isTechOpenCode && <SkilltypeTechnical />}
    </ul>

  )
  const [isTechOpenLMSmap, setIsTechOpenLMSmap] = useState(false);

  const toggleTechMenuLMSmap = () => {
    setIsTechOpenLMSmap(!isTechOpenLMSmap && true);
    setIsAptitudeOpenLMS(false);

  };
  

  const LMSOptions = () => (
    <ul className='test-options' style={{ paddingLeft: '15px', width: '100%' }}>

      <Link onClick={() => { handlePre('Aptitude'); toggleAptitudeMenuLMS(); }} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'aptitude' ? 'active' : ''}`} onClick={() => handleMenuItemClick('aptitude')}>
          <span className="dashboard-text">Aptitude</span>
        </li>
      </Link>
      {isAptitudeOpenLMS && <SkilltypeAptitudeLMS />}

      <Link to='/Lms/upload-video' onClick={() => { handlePre('Softskills'); handleSkillTypeLMS(''); toggleSubmenu(); }} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'softskills' ? 'active' : ''}`} onClick={() => handleMenuItemClick('softskills')}>
          <span className="dashboard-text">Softskills</span>
        </li>
      </Link>

      <Link onClick={() => { handlePre('Technical'); toggleTechMenuLMS(); }} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'technical' ? 'active' : ''}`} onClick={() => handleMenuItemClick('technical')}>
          <span className="dashboard-text">Technical</span>
        </li>
      </Link>
      {isTechOpenLMS && <SkilltypeTechnicalLMS />}

      <Link to="/lms/map/" onClick={() => { handlePre('map-lms'); toggleTechMenuLMSmap(); }} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'map-lms' ? 'active' : ''}`} onClick={() => handleMenuItemClick('map-lms')}>
          <span className="dashboard-text">Map LMS</span>
        </li>
      </Link>

      <Link to="/stufeedback/" onClick={() => { handlePre('stufeedback'); toggleTechMenuLMSmap(); }} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'stufeedback' ? 'active' : ''}`} onClick={() => handleMenuItemClick('stufeedback')}>
          <span className="dashboard-text">Student's Feedback</span>
        </li>
      </Link>

      <Link to="/Trainerfeedback/" onClick={() => { handlePre('Trainerfeedback'); toggleTechMenuLMSmap(); }} onContextMenu={(e) => e.preventDefault()}>
        <li className={`test-option ${activeMenuItem === 'Trainerfeedback' ? 'active' : ''}`} onClick={() => handleMenuItemClick('Trainerfeedback')}>
          <span className="dashboard-text">Trainer's Report</span>
        </li>
      </Link>

    </ul>
  );



  const QuestionsOptions = () => (
     <ul className='test-options' style={{ paddingLeft: '20px' }}>
 
       <Link to='/question/mcq' className="disabled-link"
   onClick={(e) => e.preventDefault()} 
      // onClick={() => { handleTestType('MCQ Test'); }} onContextMenu={(e) => e.preventDefault()}
       >
         <li 
         className={`menu-item disabled ${
     activeMenuItem === "training" ? "active" : ""
   }`}
        // className={`test-option ${activeMenuItem === 'mcq' ? 'active' : ''}`} 
        onClick={() => { handleMenuItemClick('mcq'); toggleSubmenu(); }}>
           <span className="dashboard-text">MCQ</span>
         </li>
       </Link>
 
       <Link to='/question/code' 
       className="disabled-link"
   onClick={(e) => e.preventDefault()} 
   //onClick={() => { handleTestType('Coding Test'); }} onContextMenu={(e) => e.preventDefault()}
   >
         <li 
         className={`menu-item disabled ${
     activeMenuItem === "training" ? "active" : ""
   }`}
         //className={`test-option ${activeMenuItem === 'coding' ? 'active' : ''}`} 
         onClick={() => { handleMenuItemClick('coding'); toggleSubmenu(); }}>
           <span className="dashboard-text">Coding</span>
         </li>
       </Link>
      <Link to='/question/communication/' onClick={() => { handleTestType('Communication Test'); }} onContextMenu={(e) => e.preventDefault()}>
       <li className={`test-option ${activeMenuItem === 'communication' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('communication'); toggleSubmenu(); }}>
         <span className="dashboard-text">Communication</span>
       </li>
       </Link>
       <Link to='/question-paper-table' onClick={() => { handleTestType('Coding Test'); }} onContextMenu={(e) => e.preventDefault()}>
         <li className={`test-option ${activeMenuItem === 'qp-paper' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('qp-paper'); toggleSubmenu(); }}>
           <span className="dashboard-text">Question Papers</span>
         </li>
       </Link>
 
       {/*}
       <Link to='/binary/to/image' onClick={() => { handleTestType('Coding Test'); }} onContextMenu={(e) => e.preventDefault()}>
         <li className={`test-option ${activeMenuItem === 'qp-paper' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('qp-paper'); toggleSubmenu(); }}>
           <span className="dashboard-text">Binary to Image</span>
         </li>
       </Link>
       */}
 
     </ul>
   );

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'} `} style={{
      maxHeight: '100vh', overflowY: 'auto', scrollbarWidth: "thin",
    }}>
      <button className="toggle-btn" onClick={toggleSidebar} >
        <span className="arrow">{isOpen ? '<' : '>'}</span>
      </button>

      <div style={{ marginTop: "20px" }}>
        <nav className="sidebar-nav">
          <ul>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              <li className={activeMenuItem === 'dashboard' ? 'active' : ''} onClick={() => { handleMenuItemClick('dashboard'); toggleSubmenu(); }}>
                <div className={`test-section ${isdashopen ? 'open' : ''}`} style={{ width: '100%' }}>
                  <div className="test-header" onClick={toggledashMenu}>
                    <img src={DashboardIcon} alt="Dashboard" className='icon-image' />
                    <span className="dashboard-text"> Dashboard</span>
                  </div>
                </div>
              </li></Link>
            <Link to='/lms/' style={{ color: "white", textDecoration: "none" }} onContextMenu={(e) => e.preventDefault()}>
              <li className={activeMenuItem === 'lms' ? 'active' : ''} onClick={() => { handleMenuItemClick('lms'); toggleSubmenu(); }}>
                <div className={`test-section ${islmsOpen ? 'open' : ''}`} style={{ width: '100%' }}>
                  <div className="test-header" onClick={togglelmsMenu}>

                    <img src={LMSIcon} alt="Learning Material" className='icon-image' />
                    <span className="dashboard-text"> LMS</span>



                  </div>
                  {/*}  {islmsOpen && isOpen && <LMSOptions />}*/}

                </div>
              </li></Link>
{levelAccess !== 'Silver' && (
            <li>
              <div className={`test-section ${islmsOpen ? 'open' : ''}`} style={{ width: '100%' }}>
                <div className="test-header" onClick={toggleQuestionsMenu}>
                  <img src={questionsPng} alt="Learning Material" className='icon-image'
                  />
                  <Link>Questions</Link>
                  {isQuestionsOpen && isOpen && (
                    <img src={Downarrow} alt="Down Arrow" className="images13" />
                  )}
                  {!isQuestionsOpen && isOpen && (
                    <img src={Downarrow} alt="Down Arrow" className="images13 rotate-right" />
                  )}
                </div>
                {isQuestionsOpen && isOpen && <QuestionsOptions />}
                {/*}  {islmsOpen && (
                  <ul className="test-options">                    
                    <li className="test-option">
                      <Link to="/Lms/content-map">Content Map</Link>
                    </li>
                  </ul>
                )}  */}

              </div>
            </li>)}

 {levelAccess !== 'Silver' && (
<li>
  <div className="test-section" style={{ color: "white", textDecoration: "none", width: '100%' }}>
    <div className="test-header" onClick={toggleTestMenu}>
      <img src={TestIcon} alt="Test" className='icon-image' />
      <Link to='/test/test-schedules/'>Test</Link>
      {isTestOpen && isOpen && (
        <img src={Downarrow} alt="Down Arrow" className="images12" />
      )}
      {!isTestOpen && isOpen && (
        <img src={Downarrow} alt="Down Arrow" className="images12 rotate-right" />
      )}
    </div>
    {isTestOpen && isOpen && (
      <ul className="test-options" style={{ paddingLeft: '15px' }}>

       <Link
        className="disabled-link"
  onClick={(e) => e.preventDefault()}
          to="test/add-test/test-form/"
         // onClick={() => { handleMcqOp('College'); togglePreMenu(); }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <li
          className={`menu-item disabled ${
    activeMenuItem === "training" ? "active" : ""
  }`}
          //  className={`test-option ${activeMenuItem === 'College' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('College')}
          >
            <span className="dashboard-text">Add Test</span>
          </li>
        </Link>
        {isPreOpen && isOpen && (
          <ul className="test-options" style={{ paddingLeft: '15px', paddingTop: "4px" }}>
            <Link to='/add/test/question' 
            
            onClick={() => { handleTestType('MCQ Test'); toggleMCQMenu(); }} onContextMenu={(e) => e.preventDefault()}>
              <li className={`test-option ${activeMenuItem === 'mcqTest' ? 'active' : ''}`} onClick={() => handleMenuItemClick('mcqTest')}>
                <span className="dashboard-text">MCQ Test</span>
              </li>
            </Link>
            <li className={`test-option ${activeMenuItem === 'codingTest' ? 'active' : ''}`} onClick={() => handleMenuItemClick('codingTest')}>
              <Link to='/add/test/question' onContextMenu={(e) => e.preventDefault()} onClick={() => { handleTestType('Coding Test'); toggleCodingMenu(); }}>Coding Test</Link>
            </li>
          </ul>
        )}
        {/* Remove Assessment submenu */}
         {levelAccess !== 'Silver' && levelAccess !== 'Gold' && (
        <Link
          to="/practice-question"
           className="disabled-link"
  onClick={(e) => e.preventDefault()}
          onContextMenu={e => e.preventDefault()}
          style={{ color: "white", textDecoration: "none" }}
        >
          <li 
className={`menu-item disabled ${
    activeMenuItem === "training" ? "active" : ""
  }`}
          //className={activeMenuItem === 'practiceQuestion' ? 'active' : ''} 
          onClick={() => handleMenuItemClick('practiceQuestion')}
          >
            <span className="dashboard-text">Assessment</span>
          </li>
        </Link>)}
         {levelAccess !== 'Silver' && levelAccess !== 'Gold' && (
         <Link
          className="disabled-link"
  onClick={(e) => e.preventDefault()}
          to="/practice-question-paper"
          onContextMenu={e => e.preventDefault()}
          style={{ color: "white", textDecoration: "none" }}
        >
          <li 
          className={`menu-item disabled ${
    activeMenuItem === "training" ? "active" : ""
  }`}
          //className={activeMenuItem === 'practiceQuestion-paper' ? 'active' : ''} onClick={() => handleMenuItemClick('practiceQuestion-paper')}
          >
            <span className="dashboard-text">Practice Worksheet</span>
          </li>
        </Link>)}
      </ul>
    )}
  </div>
</li>)}




            <li>
              <div className={`test-section ${isReportsOpen ? 'open' : ''}`} style={{ width: '100%' }}>
                <div className="test-header" onClick={toggleReportsMenu}>
                  <img src={DashboardIcon} alt="Reports" className='icon-image' />
                  <Link>Reports</Link>
                  {isReportsOpen && isOpen && (
                    <img src={Downarrow} alt="Down Arrow" className="images13" />
                  )}
                  {!isReportsOpen && isOpen && (
                    <img src={Downarrow} alt="Down Arrow" className="images13 rotate-right" />
                  )}
                </div>
                {isReportsOpen && isOpen && (
                  <ul className="test-options" style={{ paddingLeft: '20px' }}>
                    <Link to="/reports/test-report" onContextMenu={(e) => {
                      e.preventDefault();
                      const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                      if (newWindow) newWindow.opener = null;
                    }}>
                      <li className={`test-option ${activeMenuItem === 'testReport' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('testReport'); toggleSubmenu(); }}>
                        <span className="dashboard-text">Test Report</span>
                      </li></Link>
                    <Link to="/reports/placement-report" onContextMenu={(e) => {
                      e.preventDefault();
                      const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                      if (newWindow) newWindow.opener = null;
                    }}>
                      <li className={`test-option ${activeMenuItem === 'placementReport' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('placementReport'); toggleSubmenu(); }}>
                        <span className="dashboard-text"> Students Report</span>
                      </li></Link>
                    <Link to="/reports/dep-report" onContextMenu={(e) => {
                      e.preventDefault();
                      const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                      if (newWindow) newWindow.opener = null;
                    }}>
                      <li className={`test-option ${activeMenuItem === 'depReport' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('depReport'); toggleSubmenu(); }}>
                        <span className="dashboard-text"> Department Report</span>
                      </li></Link>
                    <Link to="/cumulative/test/report" onContextMenu={(e) => {
                      e.preventDefault();
                      const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                      if (newWindow) newWindow.opener = null;
                    }} style={{ color: "white", textDecoration: "none" }}>
                      <li className={activeMenuItem === 'cumulativereports' ? 'active' : ''} onClick={() => { handleMenuItemClick('cumulativereports'); toggleReportsMenu(); toggleSubmenu(); }} >

                        <span className="dashboard-text">Cumulative</span>
                      </li>
                    </Link>
                    <Link to="/growth/test/report" onContextMenu={(e) => {
                      e.preventDefault();
                      const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                      if (newWindow) newWindow.opener = null;
                    }} style={{ color: "white", textDecoration: "none" }}>
                      <li className={activeMenuItem === 'growthreports' ? 'active' : ''} onClick={() => { handleMenuItemClick('growthreports'); toggleReportsMenu(); toggleSubmenu(); }} >

                        <span className="dashboard-text">Growth Report</span>
                      </li>
                    </Link>
                     <Link to="/daywise/test/report" onContextMenu={(e) => {
                      e.preventDefault();
                      const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                      if (newWindow) newWindow.opener = null;
                    }} style={{ color: "white", textDecoration: "none" }}>
                      <li className={activeMenuItem === 'daywisereports' ? 'active' : ''} onClick={() => { handleMenuItemClick('daywisereports'); toggleReportsMenu(); toggleSubmenu(); }} >

                        <span className="dashboard-text">DayWise Report</span>
                      </li>
                    </Link>
                     <Link to="/practice/stu/report" onContextMenu={(e) => {
                      e.preventDefault();
                      const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                      if (newWindow) newWindow.opener = null;
                    }} style={{ color: "white", textDecoration: "none" }}>
                      <li className={activeMenuItem === 'pracstureports' ? 'active' : ''} onClick={() => { handleMenuItemClick('pracstureports'); toggleReportsMenu(); toggleSubmenu(); }} >

                        <span className="dashboard-text">Practice Test Report</span>
                      </li>
                    </Link>
                  </ul>
                )}
              </div>
            </li>



            <li>
              <div className={`test-section ${isDatabaseOpen ? 'open' : ''}`} style={{ width: '100%' }}>
                <div className="test-header" onClick={toggleDatabaseMenu}>
                  <img src={DatabaseIcon} alt="Database" className='icon-image' />
                  <Link>Database</Link>
                  {isDatabaseOpen && isOpen && (
                    <img src={Downarrow} alt="Down Arrow" className="images13" />
                  )}
                  {!isDatabaseOpen && isOpen && (
                    <img src={Downarrow} alt="Down Arrow" className="images13 rotate-right" />
                  )}
                </div>
                {isDatabaseOpen && isOpen && (
                  <ul className="test-options" style={{ paddingLeft: '15px' }}>
                    {/*} <li className={`test-option ${activeMenuItem === 'uploadProfile' ? 'active' : ''}`} onClick={() => {handleMenuItemClick('uploadProfile'); toggleSubmenu();}}>

                      <Link to="/Database/upload-student" onContextMenu={(e) => {
                        e.preventDefault();
                        const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                        if (newWindow) newWindow.opener = null;
                      }}>Upload Job Offer</Link>
                    </li>*/}
                    <Link to="/Database/upload-student" onContextMenu={(e) => {
                      e.preventDefault();
                      const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
                      if (newWindow) newWindow.opener = null;
                    }}>
                      <li className={`test-option ${activeMenuItem === 'uploadProfile' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('uploadProfile'); toggleSubmenu(); }}>

                        <span className="dashboard-text">   UploadProfile</span>
                      </li></Link>
                    {/*}  <Link to="/Database/login">
                    <li className={`test-option ${activeMenuItem === 'createAccount' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('createAccount'); toggleSubmenu(); }}>

                     
                      <span className="dashboard-text">Create account</span>

                      
                    </li></Link>*/}
                    {levelAccess !== 'Silver' && levelAccess !== 'Gold' && (
                    <Link to="/Database/filterdb" 
                     className="disabled-link"
  onClick={(e) => e.preventDefault()}>
                      <li 
                                                className={`menu-item disabled ${
    activeMenuItem === "training" ? "active" : ""
  }`}
                     // className={`test-option ${activeMenuItem === 'filterdb' ? 'active' : ''}`} onClick={() => { handleMenuItemClick('filterdb'); toggleSubmenu(); }}
                      >


                        <span className="dashboard-text">EligibleStudent
                        </span>

                      </li> </Link>)}
                  </ul>
                )}
              </div>
            </li>
            {levelAccess !== 'Silver' && levelAccess !== 'Gold' && (
            <Link 
             className="disabled-link"
  onClick={(e) => e.preventDefault()} 
            to="/uploadstudentdata" onContextMenu={(e) => {
              e.preventDefault();
              const newWindow = window.open('https://ccportal.co.in', '_blank', 'noopener,noreferrer');
              if (newWindow) newWindow.opener = null;
            }} style={{ color: "white", textDecoration: "none" }}>
              <li 
                                        className={`menu-item disabled ${
    activeMenuItem === "training" ? "active" : ""
  }`}
            //  className={activeMenuItem === 'job' ? 'active' : ''} onClick={() => { handleMenuItemClick('job'); toggleSubmenu(); }}
            >

                <div className={`test-section ${isProfileMenuOpen ? 'open' : ''}`} style={{ width: '100%' }}>
                  <div className="test-header" onClick={toggleProfileMenu}>
                    <img src={ProfileIcon} alt="Profile" className='icon-image' />

                    <span className="dashboard-text"> Job Posting</span>

                  </div>

                </div>
              </li></Link>)}
            {levelAccess !== 'Silver' && levelAccess !== 'Gold' && (
            <Link to="/announce/" style={{ color: "white", textDecoration: "none" }}>
              <li
                className={activeMenuItem === 'announcement' ? 'active' : ''}
                onClick={() => {
                  handleMenuItemClick('announcement');
                  toggleSubmenu();
                }}
              >
                <div className={`test-section ${isannouncementopen ? 'open' : ''}`} style={{ width: '100%' }}>
                  <div className="test-header" onClick={toggleannounceMenu}>
                    <img src={announcement} alt="announcement" className='icon-image'
                    />
                    <span className="dashboard-text"> Announcement</span>
                  </div>
                </div>
              </li></Link>)}
          </ul>
        </nav>
        {selectedMCQOption && isTestaccessVisible && <Testaccess selectedMCQOption={selectedMCQOption} />}
      </div>
      <div className='select-option'>{selectedSkillTypeOption && (
        <React.Fragment>
          {console.log(selectedSkillTypeOption)}
          <p> {selectedSkillTypeOption}</p>
        </React.Fragment>)}</div>
      <div className='select-lms'>{selectedPreOption && (
        <React.Fragment>
          {console.log(selectedPreOption)}
          <p> {selectedPreOption}</p>
        </React.Fragment>)}</div>
      <div className='select-lms-skill'>{selectedSkillTypeOptionLMS && (
        <React.Fragment>
          {console.log(selectedSkillTypeOptionLMS)}
          <p> {selectedSkillTypeOptionLMS}</p>
        </React.Fragment>)}</div>
    </div>
  );
};

export default Sidebar;
