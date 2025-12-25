import React, { useState, useEffect } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
  addQuestionpaperApi,

  addQuestionpaperApi_place
} from "../../api/endpoints";
import ExcelJS from 'exceljs';
import allWord from '../../assets/all-languages-coding.docx'
import allWordtestcase from '../../assets/all-languages-coding.docx'
import alllang from '../../assets/all languages.xlsx'
import testcase from '../../assets/testcase_coding_questions.xlsx'
import testcaseword from '../../assets/testcase_question.docx'
import testcaseAll from '../../assets/testcaseall.xlsx'
import Word from '../../assets/sample_coding_questions.docx';
import { FiDownload } from "react-icons/fi";
//import './QuestionPaperCode.css';
//import '../global.css';
import CodeForm from "./codeform";
import ImportFuncode from "./importcode";
import Nextarrow from "../../assets/images/nextarrow.png";
import ErrorModal from "../auth/errormodal";
import back from "../../assets/images/backarrow.png";
import Footer from "../../footer/footer";
import ImportCodeWord from "./importcodeword";
import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#39444e',
    color: '#fff', // Text color
    borderColor: state.isFocused ? '' : '#ffff', // Border color on focus
    boxShadow: 'none', // Remove box shadow
    '&:hover': {
      borderColor: state.isFocused ? '#ffff' : '#ffff' // Border color on hover
    },
    '&.css-1a1jibm-control': {
      // Additional styles for the specific class
    },
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px', // Smaller font size

      width: '100%'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#ffff', // Text color for selected value
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px' // Smaller font size
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
    color: '#ffff', // Text color
    '&:hover': {
      backgroundColor: '#39444e', // Background color on hover
      color: '#ffff' // Text color on hover
    },
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px',// Smaller font size
      width: '100%'
    }
  }),
  input: (provided) => ({
    ...provided,
    color: '#ffff' // Text color inside input when typing
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#39444e',
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px' // Smaller font size
    }
  })

};

const exportCodeToExcel = (questions) => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Questions-Code');

  const header = [
    { header: 'Questions**', key: 'question_text', width: 40 },
    { header: 'Answer**', key: 'answer', width: 25 },
    { header: 'Mark**', key: 'mark', width: 10 },
    { header: 'Explain Answer**', key: 'explain_answer', width: 40 },
    { header: 'Input Format', key: 'input_format', width: 30 },
    { header: 'Difficulty Level', key: 'difficulty_level', width: 30 },
  ];

  // Add the header row
  worksheet.columns = header;

  // Apply orange background color and black text color to header cells
  worksheet.getRow(1).eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFA500' } // Orange color
    };
    cell.font = {
      color: { argb: '00000000' }, // Black color
      bold: true
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } }, // Black border
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Filter out unwanted fields and add rows to the worksheet
  questions.forEach(({ id, option_a, option_b, option_c, option_d, view_hint, question_id, negative_mark, ...rest }) => {
    worksheet.addRow(rest);
  });

  // Ensure the width is set for the data rows
  worksheet.columns.forEach(column => {
    column.width = column.width || 20; // Default width if not specified
  });

  // Save workbook as Excel file
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_Coding_questions.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }).catch(error => {
    console.error('Error exporting to Excel:', error);
  });
};


// Define a constant sample question
const sampleQuestion = [
  {
    question_text: 'Multiply two float numbers and print the result',
    answer: 'Product of 1.20 and 3.40 is 4.0',
    mark: '25',
    explain_answer: 'printf("Hello, World!\n");',
    input_format: 'Here is a sample linae of code that can be executed in Python:print("Hello, World!"),You can just as easily store a string as a variable and then print it to stdout:, my_string = "Hello, World!"print(my_string)'
  }
];

const QuestionPaperCode = ({ userRole, collegeName }) => {
  console.log('Coding...userRole: ', userRole);

  const {
    setQuestionPaperCon,
    topicCon,
    subTopicCon,
    setSubtopicCon,
    // isTestAddQues
  } = useTestQuesContext();

  const [topic, setTopic] = useState(topicCon);
  const [subtopics, setSubtopics] = useState([]);

  const [showMCQForm, setShowMCQForm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadType, setUploadType] = useState("Manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();


  const [showInputField, setShowInputField] = useState(false);
  const [showInputFieldSubTopic, setShowInputFieldSupTopic] = useState(false);
  const [showInputFieldTopic, setShowInputFieldTopic] = useState(false);


  const handleUploadTypeChange = (type) => {
    setUploadType(type);
  };

  const [isTestCase, setIsTestCase] = useState(false);
  const initialFormData = userRole === 'Placement Officer'
    ? {
      question_paper_name: '',
      duration_of_test: '',
      topic: '',
      sub_topic: '',
      folder_name: '',
      no_of_questions: 0, // Initialize with appropriate default value
      upload_type: '', // Initialize with appropriate default value
      created_by: collegeName,
      remarks: ''

    }
    : {
      question_paper_name: '',
      duration_of_test: '',
      topic: '',
      sub_topic: '',
      folder_name: '',
      no_of_questions: 0, // Initialize with appropriate default value
      upload_type: '',// Initialize with appropriate default value
      remarks: ''
    };



  // Initialize formData with the computed initial state
  const [formData, setFormData] = useState(initialFormData);


  useEffect(() => {
    // Always reset topic & subtopic on page load
    setTopic('');
    setSubtopics([]);
    setSelectedSubtopic('');
    setFormData(prev => ({
      ...prev,
      topic: '',
      sub_topic: ''
    }));
    setSelectedFolder([]);
    setSelectedFolderName('');
  }, []); // empty dependency so it runs only once on mount


  const handleCloseError = () => {
    setShowError(false);
  };

  // const [uploadType, setUploadType] = useState(true); // State to track the selected upload type
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleNextbuttonClick = () => {
    setShowMCQForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.question_paper_name !== '' &&
      formData.duration_of_test !== '' &&
      formData.topic !== '' &&
      (
        (formData.topic === 'Softskills' && true) || // sub_topic is optional for Softskills
        ((formData.topic === 'Aptitude' || formData.topic === 'Technical' || formData.topic === 'CompanySpecific') && formData.sub_topic !== '') // sub_topic is mandatory for Aptitude and Technical
      )
      // formData.folder_name !== ""
    );
  };


  const handleCheckboxChange = (e) => {
    setIsTestCase(e.target.checked);
  };

  const handleSubmit = (e, formData) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const MCQTest = "Coding Test";

    // Construct the question data
    const question = {
      test_type: MCQTest,
      topic: formData.topic,
      sub_topic: formData.sub_topic,
      question_paper_name: formData.question_paper_name,
      no_of_questions: formData.no_of_questions,
      upload_type: formData.upload_type,
      folder_name: selectedFolderName,
      duration_of_test: formData.duration_of_test,
      is_testcase: isTestCase,
      remarks: formData.remarks,

      ...(userRole === 'Placement Officer' && { created_by: collegeName }), // Conditionally add `created_by`
    };

    console.log('Question Paper Data: ', question);
    setQuestionPaperCon(formData.question_paper_name);
    setSubtopicCon(formData.sub_topic);

    // Select the appropriate API function based on userRole
    const apiFunction =
      userRole === 'Placement Officer' ? addQuestionpaperApi_place : addQuestionpaperApi;

    // Call the selected API function
    apiFunction(question)
      .then((result) => {
        console.log('Question Paper Added Successfully');
        setTimeout(() => {
          setFormSubmitted(true);
          if (formData.upload_type === 'Manual') {
            handleNextbuttonClick();
          }
        }, 1000);
      })
      .catch((error) => {
        console.error('Failed to Add Data', error);
        alert('Failed to Add. Check console for details.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };


  // Define topics and their corresponding subtopics
  const topicOptions = {
    Technical: ['All Languages', 'C', 'C++', 'Python', 'JAVA', 'VLSI', 'Html', 'MySQL','Csharp','MATLAB','NodeJS','SpringBoot','AngularJS','PHP','JQuery','Excel'],
    CompanySpecific: ['All Languages', 'C', 'C++', 'Python', 'JAVA', 'VLSI', 'Html', 'MySQL','Csharp','MATLAB','NodeJS','SpringBoot','AngularJS','PHP','JQuery','Excel'],

  };

  // Handle topic change
  const handleTopicChange = (e) => {
    const selectedTopic = e.target.value;
    setTopic(selectedTopic);
    setSubtopics(topicOptions[selectedTopic] || []);

    setFormData((prevData) => ({
      ...prevData,
      topic: selectedTopic,
      sub_topic: '', // Reset sub_topic when topic changes
    }));
    setSelectedFolder([]);
    setSelectedFolderName('')
  };
  const [selectedSubtopic, setSelectedSubtopic] = useState('');


  const handleSubtopicChange = (e) => {
    console.log(`Selected Subtopic: ${e.target.value}`);
    setSubtopicCon(e.target.value);
    const selected = e.target.value;
    setSelectedSubtopic(selected);
    setFormData((prevData) => ({
      ...prevData,
      sub_topic: selected,
    }));
    setSelectedFolder([]);
    setSelectedFolderName('')
  };


  const softSkillsOptions = [
    { label: "Oral Communication", value: "Oral Communication" },
    { label: "Body language", value: "Body language" },
    { label: "Personality Development", value: "Personality Development" },
    { label: "Grooming", value: "Grooming" },
    { label: "Talk on a topic", value: "Talk on a topic" },
    { label: "Communication", value: "Communication" },
    { label: "Writing skills", value: "Writing skills" },
    { label: "Reading Skillls", value: "Reading Skillls" },
    { label: "Listening Skills", value: "Listening Skills" },
    { label: "Behavioural Skills", value: "Behavioural Skills" },
    { label: "Sentence Jumbling", value: "Sentence Jumbling" },
    { label: "Para Jumbling", value: "Para Jumbling" },
    { label: "Presentation Skills", value: "Presentation Skills" },
    { label: "Goal Setting", value: "Goal Setting" },
    { label: "Time Management", value: "Time Management" },
    { label: "Team Building", value: "Team Building" },
    { label: "Work Ethiquette", value: "Work Ethiquette" },
    { label: "Email Writing", value: "Email Writing" },
    { label: "Resume Building", value: "Resume Building" },
    { label: "Telephone Etiquette", value: "Telephone Etiquette" },
    { label: "Public Speaking", value: "Public Speaking" },
    { label: "Interview Skills", value: "Interview Skills" },
    { label: "GD", value: "GD" },
    { label: "Mock Interview", value: "Mock Interview" },
    { label: "Mock GD", value: "Mock GD" },
    { label: "Company specific", value: "Company specific" }
  ];


  const quantsOptions = [
    { label: 'Number System', value: 'Number System' },
    { label: 'HCF & LCM', value: 'HCF & LCM' },
    { label: 'Average', value: 'Average' },
    { label: 'Percentage', value: 'Percentage' },
    { label: 'Profit & Loss', value: 'Profit & Loss' },
    { label: 'Ages', value: 'Ages' },
    { label: 'SI & CI', value: 'SI & CI' },
    { label: 'Ratio Proportion', value: 'Ratio Proportion' },
    { label: 'Time and Work', value: 'Time and Work' },
    { label: 'Permutation Combination', value: 'Permutation Combination' },
    { label: 'Time Speed and Distance', value: 'Time Speed and Distance' },
    { label: 'Arithmetic Progression', value: 'Arithmetic Progression' },
    { label: 'Data Sufficiency', value: 'Data Sufficiency' },
    { label: 'Boat and Streams', value: 'Boat and Streams' },
    { label: 'Train', value: 'Train' },
    { label: 'Pipes and cisterns', value: 'Pipes and cisterns' },
    { label: 'Data Interpretation', value: 'Data Interpretation' },
    { label: 'Flow Chart', value: 'Flow Chart' },
    { label: 'Calander', value: 'Calander' },
    { label: 'Clock', value: 'Clock' },
    { label: 'Cryt Arithmetic', value: 'Cryt Arithmetic' },
    { label: 'Alligation & Mixture', value: 'Alligation & Mixture' },
    { label: 'Geometry', value: 'Geometry' },
    { label: 'Mensuration', value: 'Mensuration' }
  ];

  const logicalOptions = [
    { label: 'Number Series', value: 'Number Series' },
    { label: 'Puzzles', value: 'Puzzles' },
    { label: 'Mirro Image & Water Images', value: 'Mirro Image & Water Images' },
    { label: 'Blood Relations', value: 'Blood Relations' },
    { label: 'Odd One Out', value: 'Odd One Out' },
    { label: 'Logical Sequencing', value: 'Logical Sequencing' },
    { label: 'Syllogism', value: 'Syllogism' },
    { label: 'Logical Game', value: 'Logical Game' },
    { label: 'Problem Solving', value: 'Problem Solving' },
    { label: 'Statements and Arguments', value: 'Statements and Arguments' },
    { label: 'Assumptipns', value: 'Assumptipns' },
    { label: 'Conclusions', value: 'Conclusions' },

    { label: 'Seating Arrangements', value: 'Seating Arrangements' },
    { label: 'Arithmatical Reasoning', value: 'Arithmatical Reasoning' },
    { label: 'Probability', value: 'Probability' },
    { label: 'Pattern Completion', value: 'Pattern Completion' },
    { label: 'Image Analysis', value: 'Image Analysis' },
    { label: 'Logical Deduction', value: 'Logical Deduction' },
    { label: 'Coding Decoding', value: 'Coding Decoding' },
    { label: 'Directions', value: 'Directions' }
  ];

  const verbalOptions = [
    { label: 'Articles & Prepositions', value: 'Articles & Prepositions' },
    { label: 'Tenses', value: 'Tenses' },
    { label: 'Sequence of Words', value: 'Sequence of Words' },
    { label: 'Inserting the missing Character', value: 'Inserting the missing Character' },
    { label: 'Verification Of Truth', value: 'Verification Of Truth' },
    { label: 'Synonmys & Antonyms', value: 'Synonmys & Antonyms' },
    { label: 'Idioms and Phrases', value: 'Idioms and Phrases' },
    { label: 'Direct & Indirect Speech', value: 'Direct & Indirect Speech' },
    { label: 'Conjuctions and Punctuations', value: 'Conjuctions and Punctuations' },
    { label: 'Sentence Formation', value: 'Sentence Formation' },
    { label: 'Error Corrections', value: 'Error Corrections' },
    { label: 'Reading Comprehentions', value: 'Reading Comprehentions' },
    { label: 'Paragraph Formation', value: 'Paragraph Formation' },
    { label: 'Sentence Jumbling', value: 'Sentence Jumbling' },
    { label: 'One word substitution', value: 'One word substitution' },
    { label: 'Completing Statements', value: 'Completing Statements' },
    { label: 'Completing Sentences', value: 'Completing Sentences' },
    { label: 'Parts of Speech', value: 'Parts of Speech' },
    { label: 'Error Spotting', value: 'Error Spotting' },
    { label: 'Root words', value: 'Root words' },
    { label: 'Direct-indirect Speech', value: 'Direct-indirect Speech' },
    { label: 'Analogies', value: 'Analogies' },
  ];

  const cPrgOptions = [
    { label: "Pre-Assessment", value: "Pre-Assessment" },
    { label: "C - Introduction & Setup", value: "C - Introduction & Setup" },
    { label: "C - Data Types and Variables", value: "C - Data Types and Variables" },
    { label: "C - Operators and Expressions", value: "C - Operators and Expressions" },
    { label: "C - Control Structures", value: "C - Control Structures" },
    { label: "C - Looping Constructs", value: "C - Looping Constructs" },
    { label: "C - Functions", value: "C - Functions" },
    { label: "C - Arrays", value: "C - Arrays" },
    { label: "C - Strings", value: "C - Strings" },
    { label: "C - Pointers", value: "C - Pointers" },
    { label: "C - Structures and Unions", value: "C - Structures and Unions" },
    { label: "C - File Handling", value: "C - File Handling" },
    { label: "C - Dynamic Memory Allocation", value: "C - Dynamic Memory Allocation" }
  ];

  const cppPrgOptions = [
    { label: "Pre-Assessment", value: "Pre-Assessment" },
    { label: "C++ Basics & First Program", value: "C++ Basics & First Program" },
    { label: "C++ Data Types & Variables", value: "C++ Data Types & Variables" },
    { label: "Operators & Control Structures in C++", value: "Operators & Control Structures in C++" },
    { label: "Functions & Function Overloading in C++", value: "Functions & Function Overloading in C++" },
    { label: "Classes & Objects in C++", value: "Classes & Objects in C++" },
    { label: "Constructors & Destructors in C++", value: "Constructors & Destructors in C++" },
    { label: "Inheritance in C++", value: "Inheritance in C++" },
    { label: "Polymorphism & Virtual Functions in C++", value: "Polymorphism & Virtual Functions in C++" },
    { label: "Templates in C++", value: "Templates in C++" },
    { label: "Exception Handling in C++", value: "Exception Handling in C++" },
    { label: "STL - Introduction in C++", value: "STL - Introduction in C++" },
    { label: "STL - Containers (Vectors, Lists, Maps, Sets) in C++", value: "STL - Containers (Vectors, Lists, Maps, Sets) in C++" },
    { label: "STL - Iterators & Algorithms in C++", value: "STL - Iterators & Algorithms in C++" }
  ];

  const javaOptions = [
    { label: "Pre-Assessment", value: "Pre-Assessment" },
    { label: "Java-intro", value: "Java-intro" },
    { label: "Java-Setup and First Program", value: "Java-Setup and First Program" },
    { label: "Java-Data Types and Variables", value: "Java-Data Types and Variables" },
    { label: "Java-Operators and Control Statements", value: "Java-Operators and Control Statements" },
    { label: "Java-Classes and Objects", value: "Java-Classes and Objects" },
    { label: "Java-Methods and Method Overloading", value: "Java-Methods and Method Overloading" },
    { label: "Java-Inheritance", value: "Java-Inheritance" },
    { label: "Java-Polymorphism", value: "Java-Polymorphism" },
    { label: "Java-Abstraction and Interfaces", value: "Java-Abstraction and Interfaces" },
    { label: "Java-Packages and Access Modifiers", value: "Java-Packages and Access Modifiers" },
    { label: "Java-Exception Handling", value: "Java-Exception Handling" },
    { label: "Java-Basic Input and Output", value: "Java-Basic Input and Output" },
    { label: "Java-Generics", value: "Java-Generics" },
    { label: "Java-Collections Framework", value: "Java-Collections Framework" },
    { label: "Java-Multi-threading and Concurrency", value: "Java-Multi-threading and Concurrency" },
    { label: "Java-Streams and Lambda Expressions", value: "Java-Streams and Lambda Expressions" },
    { label: "Java-File I/O (NIO.2)", value: "Java-File I/O (NIO.2)" },
    { label: "Java-JDBC", value: "Java-JDBC" },
    { label: "Java-Networking (Sockets)", value: "Java-Networking (Sockets)" },
    { label: "Java-JavaFX", value: "Java-JavaFX" },
    { label: "Java-Annotations", value: "Java-Annotations" },
    { label: "Java-Reflection", value: "Java-Reflection" },
    { label: "Java-Serialization", value: "Java-Serialization" },
    { label: "Java-Internationalization (i18n) & Localization (l10n)", value: "Java-Internationalization (i18n) & Localization (l10n)" },
    { label: "Java-Security (Cryptography & Access Control)", value: "Java-Security (Cryptography & Access Control)" },
    { label: "Java-Regular Expressions", value: "Java-Regular Expressions" },
    { label: "Java-Modules (Java 9+ Module System)", value: "Java-Modules (Java 9+ Module System)" },
    { label: "Java-Memory Management & Garbage Collection", value: "Java-Memory Management & Garbage Collection" },
    { label: "Java-JVM Internals & Performance Tuning", value: "Java-JVM Internals & Performance Tuning" }
  ];

  const pythonOptions = [
    { label: "Pre-Assessment", value: "Pre-Assessment" },
    { label: "Python-Intro", value: "Python-Intro" },
    { label: "Python-Setup and First Program", value: "Python-Setup and First Program" },
    { label: "Python-Data Types and Variables", value: "Python-Data Types and Variables" },
    { label: "Python-Operators and Expressions", value: "Python-Operators and Expressions" },
    { label: "Python-Control Flow", value: "Python-Control Flow" },
    { label: "Python-Loops", value: "Python-Loops" },
    { label: "Python-Functions", value: "Python-Functions" },
    { label: "Python-Lists and Tuples", value: "Python-Lists and Tuples" },
    { label: "Python-Dictionaries and Sets", value: "Python-Dictionaries and Sets" },
    { label: "Python-Strings", value: "Python-Strings" },
    { label: "Python-Modules and Packages", value: "Python-Modules and Packages" },
    { label: "Python-File I/O", value: "Python-File I/O" },
    { label: "Python - Object-Oriented Programming", value: "Python - Object-Oriented Programming" },
    { label: "Python - Advanced Functions (Decorators, Generators)", value: "Python - Advanced Functions (Decorators, Generators)" },
    { label: "Python - Exception Handling", value: "Python - Exception Handling" },
    { label: "Python - Working with JSON and CSV files", value: "Python - Working with JSON and CSV files" },
    { label: "Python - Regular Expressions", value: "Python - Regular Expressions" },
    { label: "Python - Multithreading and Multiprocessing", value: "Python - Multithreading and Multiprocessing" },
    { label: "Python - Networking (Sockets)", value: "Python - Networking (Sockets)" },
    { label: "Python - Web Scraping (BeautifulSoup, Scrapy)", value: "Python - Web Scraping (BeautifulSoup, Scrapy)" },
    { label: "Python - Data Analysis (Pandas)", value: "Python - Data Analysis (Pandas)" },
    { label: "Python - Visualization (Matplotlib, Seaborn)", value: "Python - Visualization (Matplotlib, Seaborn)" }
  ];


  const allLangOptions = [
    { label: 'Syntax and Semantics', value: 'Syntax and Semantics' },
    { label: 'Data Structures and Algorithms', value: 'Data Structures and Algorithms' },
    { label: 'Object-Oriented Programming (OOP)', value: 'Object-Oriented Programming (OOP)' },
    { label: 'Memory Management', value: 'Memory Management' },
    { label: 'Debugging and Testing', value: 'Debugging and Testing' },
  ];


  const vlsiOptions = [
    { label: 'Digital Electronics', value: 'Digital Electronics' },
    { label: 'VHDL/Verilog Programming', value: 'VHDL/Verilog Programming' },
    { label: 'CMOS Technology', value: 'CMOS Technology' },
    { label: 'RTL Design', value: 'RTL Design' },
    { label: 'ASIC Design Flow', value: 'ASIC Design Flow' },
    { label: 'FPGA Design', value: 'FPGA Design' },
    { label: 'Physical Design', value: 'Physical Design' },
    { label: 'Static Timing Analysis', value: 'Static Timing Analysis' },
    { label: 'DFT (Design For Testability)', value: 'DFT (Design For Testability)' },
    { label: 'EDA Tools', value: 'EDA Tools' }
  ];

  const htmlOptions = [
    { label: 'Basics', value: 'Basics' },
    { label: 'Syntax and Semantics', value: 'Syntax and Semantics' },
    { label: 'Element Nesting Rules', value: 'Element Nesting Rules' },
    { label: 'Attributes and Values', value: 'Attributes and Values' },
    { label: 'HTML5 Features', value: 'HTML5 Features' },
    { label: 'Forms and Input Validation', value: 'Forms and Input Validation' },
    { label: 'Media Elements', value: 'Media Elements' },
    { label: 'Tables and Layouts', value: 'Tables and Layouts' },
    { label: 'Meta Tags and SEO', value: 'Meta Tags and SEO' },
    { label: 'Accessibility Features', value: 'Accessibility Features' },
    { label: 'Document Object Model (DOM)', value: 'Document Object Model (DOM)' },
    { label: 'Inline vs Block Elements', value: 'Inline vs Block Elements' },
    { label: 'Responsive Web Design', value: 'Responsive Web Design' },
    { label: 'Semantic HTML Elements', value: 'Semantic HTML Elements' },
    { label: 'HTML and CSS Integration', value: 'HTML and CSS Integration' },
    { label: 'Scripting and Interactivity', value: 'Scripting and Interactivity' },
    { label: 'Custom Data Attributes', value: 'Custom Data Attributes' },
    { label: 'HTML Templates', value: 'HTML Templates' },
    { label: 'Iframe and Embedded Content', value: 'Iframe and Embedded Content' },
  ];

// MATLAB Subtopics
const matlabOptions = [
    { label: 'Simulink Modeling', value: 'Simulink Modeling' },
    { label: 'Signal Processing', value: 'Signal Processing' },
    { label: 'Control Systems', value: 'Control Systems' },
    { label: 'Image Processing', value: 'Image Processing' },
    { label: 'MATLAB Programming', value: 'MATLAB Programming' },
    { label: 'Data Analysis', value: 'Data Analysis' },
    { label: 'Toolboxes', value: 'Toolboxes' },
    { label: 'Optimization', value: 'Optimization' },
    { label: 'Pre-Assessment', value: 'Pre-Assessment' },
];

// AngularJS Subtopics
const angularjsOptions = [
    { label: 'Components & Directives', value: 'Components & Directives' },
    { label: 'Data Binding', value: 'Data Binding' },
    { label: 'Services & Dependency Injection', value: 'Services & Dependency Injection' },
    { label: 'Routing', value: 'Routing' },
    { label: 'Forms & Validation', value: 'Forms & Validation' },
    { label: 'HTTP & Observables', value: 'HTTP & Observables' },
    { label: 'Modules & CLI', value: 'Modules & CLI' },
    { label: 'Pre-Assessment', value: 'Pre-Assessment' },
];

// NodeJS Subtopics
const nodejsOptions = [
    { label: 'Node.js Basics', value: 'Node.js Basics' },
    { label: 'Modules & NPM', value: 'Modules & NPM' },
    { label: 'File System', value: 'File System' },
    { label: 'Event Loop & Async', value: 'Event Loop & Async' },
    { label: 'Express.js', value: 'Express.js' },
    { label: 'REST APIs', value: 'REST APIs' },
    { label: 'Database Integration', value: 'Database Integration' },
    { label: 'Pre-Assessment', value: 'Pre-Assessment' },
];

// Spring Boot Subtopics
const springbootOptions = [
    { label: 'Spring Boot Basics', value: 'Spring Boot Basics' },
    { label: 'Spring MVC', value: 'Spring MVC' },
    { label: 'REST APIs', value: 'REST APIs' },
    { label: 'Spring Data JPA', value: 'Spring Data JPA' },
    { label: 'Security', value: 'Security' },
    { label: 'Testing', value: 'Testing' },
    { label: 'Actuator & Monitoring', value: 'Actuator & Monitoring' },
    { label: 'Pre-Assessment', value: 'Pre-Assessment' },
];
// C# Subtopics
const csharpOptions = [
    { label: 'C# Basics', value: 'C# Basics' },
    { label: 'Object-Oriented Programming', value: 'Object-Oriented Programming' },
    { label: 'Collections & Generics', value: 'Collections & Generics' },
    { label: 'LINQ', value: 'LINQ' },
    { label: 'Delegates & Events', value: 'Delegates & Events' },
    { label: 'Exception Handling', value: 'Exception Handling' },
    { label: 'File I/O & Serialization', value: 'File I/O & Serialization' },
    { label: 'Async & Await', value: 'Async & Await' },
    { label: '.NET Core / Framework', value: '.NET Core / Framework' },
    { label: 'Pre-Assessment', value: 'Pre-Assessment' },
];
const excelOptions = [
  { label: 'Excel Basics', value: 'Excel Basics' },
  { label: 'Cell Referencing', value: 'Cell Referencing' },
  { label: 'Basic Formulas', value: 'Basic Formulas' },
  { label: 'Logical Functions', value: 'Logical Functions' },
  { label: 'Text Functions', value: 'Text Functions' },
  { label: 'Date & Time Functions', value: 'Date & Time Functions' },
  { label: 'Lookup Functions', value: 'Lookup Functions' },
  { label: 'Statistical Functions', value: 'Statistical Functions' },
  { label: 'Math & Trigonometry', value: 'Math & Trigonometry' },
  { label: 'Conditional Formatting', value: 'Conditional Formatting' },
  { label: 'Data Validation', value: 'Data Validation' },
  { label: 'Sorting & Filtering', value: 'Sorting & Filtering' },
  { label: 'Pivot Tables', value: 'Pivot Tables' },
  { label: 'Charts & Dashboards', value: 'Charts & Dashboards' },
  { label: 'What-If Analysis', value: 'What-If Analysis' },
  { label: 'Power Query (Basics)', value: 'Power Query (Basics)' },
  { label: 'Macros & VBA (Basics)', value: 'Macros & VBA (Basics)' },
  { label: 'Excel Automation', value: 'Excel Automation' },
  { label: 'Excel Best Practices', value: 'Excel Best Practices' },
  { label: 'Pre-Assessment', value: 'Pre-Assessment' },
];


  const mySqlOptions = [
    { label: 'DDL (Data Definition Language)', value: 'DDL' },
    { label: 'DML (Data Manipulation Language)', value: 'DML' },
    { label: 'DCL (Data Control Language)', value: 'DCL' },
    { label: 'TCL (Transaction Control Language)', value: 'TCL' },
    { label: 'Joins', value: 'Joins' },
    { label: 'Subqueries', value: 'Subqueries' },
    { label: 'Indexes', value: 'Indexes' },
    { label: 'Views', value: 'Views' },
    { label: 'Stored Procedures', value: 'StoredProcedures' },
    { label: 'Functions', value: 'Functions' },
    { label: 'Triggers', value: 'Triggers' },
    { label: 'Operators', value: 'Operators' },
    { label: 'Constraints', value: 'Constraints' },
    { label: 'Clauses (WHERE, GROUP BY, etc.)', value: 'Clauses' },
    { label: 'Aggregate Functions', value: 'AggregateFunctions' },
    { label: 'Date Functions', value: 'DateFunctions' },
    { label: 'String Functions', value: 'StringFunctions' },
    { label: 'Data Types', value: 'DataTypes' },
    { label: 'Normalization', value: 'Normalization' },
    { label: 'Keys (Primary, Foreign)', value: 'Keys' },
  ];
const JQueryOptions = [
  { label: 'Basics', value: 'Basics' },
  { label: 'Selectors', value: 'Selectors' },
  { label: 'Events', value: 'Events' },
  { label: 'Effects and Animations', value: 'Effects and Animations' },
  { label: 'DOM Manipulation', value: 'DOM Manipulation' },
  { label: 'CSS Manipulation', value: 'CSS Manipulation' },
  { label: 'HTML and Attributes', value: 'HTML and Attributes' },
  { label: 'Traversing the DOM', value: 'Traversing the DOM' },
  { label: 'AJAX', value: 'AJAX' },
  { label: 'jQuery Utilities', value: 'jQuery Utilities' },
  { label: 'Plugins', value: 'Plugins' },
  { label: 'Forms', value: 'Forms' },
  { label: 'jQuery UI', value: 'jQuery UI' },
  { label: 'Event Delegation', value: 'Event Delegation' },
  { label: 'Animations and Queues', value: 'Animations and Queues' },
  { label: 'Callback Functions', value: 'Callback Functions' },
  { label: 'Chaining', value: 'Chaining' },
  { label: 'Filtering', value: 'Filtering' },
  { label: 'JSON Handling', value: 'JSON Handling' },
  { label: 'jQuery noConflict()', value: 'jQuery noConflict()' },
];

const phpOptions = [
  { label: 'Basics & Syntax', value: 'Basics' },
  { label: 'Variables & Constants', value: 'Variables' },
  { label: 'Data Types', value: 'DataTypes' },
  { label: 'Operators', value: 'Operators' },
  { label: 'Control Structures (if, switch, loops)', value: 'ControlStructures' },
  { label: 'Functions', value: 'Functions' },
  { label: 'Arrays (Indexed, Associative, Multidimensional)', value: 'Arrays' },
  { label: 'Strings & String Functions', value: 'Strings' },
  { label: 'Form Handling (GET & POST)', value: 'FormHandling' },
  { label: 'File Handling (Read/Write Files)', value: 'FileHandling' },
  { label: 'Sessions & Cookies', value: 'SessionsCookies' },
  { label: 'Include & Require', value: 'IncludeRequire' },
  { label: 'Error & Exception Handling', value: 'ErrorHandling' },
  { label: 'Date & Time Functions', value: 'DateTime' },
  { label: 'Regular Expressions', value: 'Regex' },
  { label: 'Superglobals ($_GET, $_POST, $_SERVER, etc.)', value: 'Superglobals' },
  { label: 'OOP Concepts (Classes, Objects, Inheritance, Polymorphism)', value: 'OOP' },
  { label: 'Namespaces & Traits', value: 'NamespacesTraits' },
  { label: 'PDO & MySQLi (Database Connectivity)', value: 'DatabaseConnectivity' },
  { label: 'Form Validation', value: 'FormValidation' },
  { label: 'File Uploads', value: 'FileUploads' },
  { label: 'JSON Handling', value: 'JSON' },
  { label: 'Session Management', value: 'SessionManagement' },
  { label: 'Cookies Management', value: 'CookiesManagement' },
  { label: 'PHP with HTML Integration', value: 'PHPHTMLIntegration' },
  { label: 'Security (SQL Injection, XSS, etc.)', value: 'Security' },
  { label: 'Composer & Packages', value: 'Composer' },
  { label: 'PHP Frameworks (Laravel, CodeIgniter Basics)', value: 'Frameworks' },
  { label: 'REST API (JSON API using PHP)', value: 'RESTAPI' },
  { label: 'File System Functions', value: 'FileSystem' },
  { label: 'Email Handling (mail function)', value: 'EmailHandling' },
  { label: 'Session Tracking', value: 'SessionTracking' },
  { label: 'PHP Configuration & php.ini', value: 'Configuration' },
  { label: 'Error Logging & Debugging', value: 'Debugging' },
  { label: 'Best Practices & Code Optimization', value: 'BestPractices' }
];


  const getOptions = () => {
    if (topic === 'Softskills') {
      return softSkillsOptions;
    }
    if (topic === 'Aptitude') {
      if (selectedSubtopic === 'Quants') {
        return quantsOptions;
      }
      if (selectedSubtopic === 'Logical') {
        return logicalOptions;
      }
      if (selectedSubtopic === 'Verbal') {
        return verbalOptions;
      }
    }
    if (topic === 'Technical') {
      if (selectedSubtopic === 'All Languages') {
        return allLangOptions;
      }
      if (selectedSubtopic === 'C') {
        return cPrgOptions;
      }
      if (selectedSubtopic === 'C++') {
        return cppPrgOptions;
      }
      if (selectedSubtopic === 'Python') {
        return pythonOptions; // Fixed typo
      }
      if (selectedSubtopic === 'JAVA') {
        return javaOptions;
      }
      if (selectedSubtopic === 'VLSI') {
        return vlsiOptions;
      }
      if (selectedSubtopic === 'Html') {
        return htmlOptions;
      }
      if (selectedSubtopic === 'MySQL') {
        return mySqlOptions;
      }
        if (selectedSubtopic === 'Csharp') {
        return csharpOptions;
    }
     if (selectedSubtopic === 'Excel') {
        return excelOptions;
    }
    if (selectedSubtopic === 'PHP') {
        return phpOptions;
    }
   
    if (selectedSubtopic === 'MATLAB') {
        return matlabOptions;
    }
    if (selectedSubtopic === 'NodeJS') {
        return nodejsOptions;
    }
    if (selectedSubtopic === 'SpringBoot') {
        return springbootOptions;
    }
    if (selectedSubtopic === 'AngularJS') {
        return angularjsOptions;
    }
    if (selectedSubtopic === 'JQuery') {
        return JQueryOptions;
    }
    }

    if (topic === 'CompanySpecific') {
      if (selectedSubtopic === 'All Languagess') {
        return allLangOptions;
      }
      if (selectedSubtopic === 'C') {
        return cPrgOptions;
      }
      if (selectedSubtopic === 'C++') {
        return cppPrgOptions;
      }
      if (selectedSubtopic === 'Python') {
        return pythonOptions; // Fixed typo
      }
      if (selectedSubtopic === 'JAVA') {
        return javaOptions;
      }
      if (selectedSubtopic === 'VLSI') {
        return vlsiOptions;
      }
      if (selectedSubtopic === 'Html') {
        return htmlOptions;
      }
      if (selectedSubtopic === 'MySQL') {
        return mySqlOptions;
      }
       if (selectedSubtopic === 'JQuery') {
        return JQueryOptions;
    }
         if (selectedSubtopic === 'Csharp') {
        return csharpOptions;
    }
      if (selectedSubtopic === 'Excel') {
        return excelOptions;
    }
    if (selectedSubtopic === 'PHP') {
        return phpOptions;
    }
   
    if (selectedSubtopic === 'MATLAB') {
        return matlabOptions;
    }
    if (selectedSubtopic === 'NodeJS') {
        return nodejsOptions;
    }
    if (selectedSubtopic === 'SpringBoot') {
        return springbootOptions;
    }
    if (selectedSubtopic === 'AngularJS') {
        return angularjsOptions;
    }
   
    }
    return []; // Fallback for unmatched cases
  };




  const [selectedFolder, setSelectedFolder] = useState([]);
  const [selectedFolderName, setSelectedFolderName] = useState('');



  const handleSelectionChange = (selectedOptions) => {
    console.log('SelectesOption: ', selectedOptions.value);
    setSelectedFolder(selectedOptions || []);
    setSelectedFolderName(selectedOptions.value);
  };


  const handleExportCode = () => {
    // Export the constant sample question
    exportCodeToExcel(sampleQuestion);
  };


  const handleExportCoding = () => {
    // Path to the document in the public/assets directory
    const documentUrl = Word;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'sample_coding_questions.docx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };


  const handleExportAllLang = () => {
    // Path to the document in the public/assets directory
    const documentUrl = alllang;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'all languages.xlsx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleExportTestcase = () => {
    // Path to the document in the public/assets directory
    const documentUrl = testcase;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Testcase_questions.xlsx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleExportTestcaseAll = () => {
    // Path to the document in the public/assets directory
    const documentUrl = testcaseAll;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Testcase_questions.xlsx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };

  const handleExportTestcaseword = () => {
    // Path to the document in the public/assets directory
    const documentUrl = testcaseword;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Testcase_questions.docx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleExportAllLangword = () => {
    // Path to the document in the public/assets directory
    const documentUrl = allWord;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'all-languages-coding.docx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleExportAllLangwordtestcase = () => {
    // Path to the document in the public/assets directory
    const documentUrl = allWordtestcase;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'all-languages-coding.docx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleDownloadTemplate = () => {
    if (uploadType === 'Excel') {
      if (selectedSubtopic === 'All Languages' && isTestCase) {
        handleExportTestcaseAll();
      } else if (isTestCase) {
        handleExportTestcase();
      } else if (selectedSubtopic === 'All Languages') {
        handleExportAllLang();
      } else {
        handleExportCode();
      }
    } else if (uploadType === 'Word') {
      if (selectedSubtopic === 'All Languages' && isTestCase) {
        handleExportAllLangwordtestcase();
      } else if (isTestCase) {
        handleExportTestcaseword();
      } else if (selectedSubtopic === 'All Languages') {
        handleExportAllLangword();
      } else {
        handleExportCoding();
      }
    }
  };

  return (
    <div className="form-ques-compo">
      {!showMCQForm ? (
        <div>
          <div>
            <Row>
              <Col>
                <Form
                  className="form-ques-compo"
                  onSubmit={(e) => handleSubmit(e, formData)}
                >
                  <Row md={12}>
                    <Col>
                      <div
                        className="questionName"
                        controlId="question_paper_name"
                      >
                        <label className="label6-ques">
                          Question Paper Name
                        </label>
                        <p></p>
                        <input
                          type="text"
                          className="input-ques"
                          name="question_paper_name"
                          required
                          placeholder=""
                          autocomplete="off"
                          onChange={handleInputChange}
                        />{" "}
                      </div>
                    </Col>

                    <Col>
                      <div className="duration" controlId="duration_of_test">
                        <label className="label7-ques">
                          Duration of the Test
                        </label>
                        <p></p>
                        <input
                          type="number"
                          name="duration_of_test"
                          required
                          placeholder=""
                          autocomplete="off"
                          className="input-ques-dur"
                          min="0"
                          onChange={handleInputChange}
                        />
                      </div>
                    </Col>
                  </Row>
                  <p></p>

                  <Row md={12}>
                    <Col>
                      <div controlId='topic'>
                        <label className='label6-ques'>Topic
                          <Button
                            variant="link"
                            onClick={() => setShowInputFieldTopic(!showInputFieldTopic)}
                            style={{ color: '#fff', marginLeft: '10px', padding: 0 }}
                          >
                            {showInputFieldTopic ? (
                              <i className="bi bi-x-circle"></i> // Use 'x' for close
                            ) : (
                              <i className="bi bi-plus-circle"></i> // Use plus for open
                            )}
                          </Button>
                        </label><p></p>
                        {!showInputFieldTopic ? (

                          <select
                            name="topic"
                            value={topic}
                            onChange={handleTopicChange}
                            className='input-ques-topic'
                          // disabled={!!topicCon}
                          >
                            <option value="">Select a Topic</option>


                            {/* Show new topic if not in topicOptions */}
                            {!Object.keys(topicOptions).includes(formData.topic) && formData.topic && (
                              <option value={formData.topic}>{formData.topic} (new)</option>
                            )}

                            {Object.keys(topicOptions).map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="input-ques"
                            placeholder="Enter new topic"
                            value={formData.topic}
                            onChange={(e) => {
                              const value = e.target.value;
                              setTopic(value);
                              setSubtopics(topicOptions[value] || []);
                              setFormData((prevData) => ({
                                ...prevData,
                                topic: value,
                              }));
                            }}
                          />
                        )}
                      </div>
                    </Col>




                    {(
                      <Col >
                        <div controlId='selectedSubTopic'>
                          <label className='label7-ques'>  Sub Topic
                            <Button
                              variant="link"
                              onClick={() => setShowInputFieldSupTopic(!showInputFieldSubTopic)}
                              style={{ color: '#fff', marginLeft: '10px', padding: 0 }}
                            >
                              {showInputFieldSubTopic ? (
                                <i className="bi bi-x-circle"></i> // Use 'x' for close
                              ) : (
                                <i className="bi bi-plus-circle"></i> // Use plus for open
                              )}
                            </Button></label><p></p>
                          {!showInputFieldSubTopic ? (

                            <select
                              name="sub_topic"
                              onChange={handleSubtopicChange}
                              className='input-ques-topic'
                              disabled={subtopics.length === 0}
                            >
                              <option value="">Select a Subtopic</option>
                              {subtopics.map((subtopic) => (
                                <option key={subtopic} value={subtopic}>
                                  {subtopic}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="input-ques"
                              placeholder="Enter new sub topic"
                              value={formData.sub_topic}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedSubtopic(value);
                                setFormData((prevData) => ({
                                  ...prevData,
                                  sub_topic: value,
                                }));
                              }}
                            />
                          )}

                        </div>
                      </Col>

                    )}
                  </Row>
                  <p></p> <p></p>
                  <Row>
                    {(
                      <Col>
                        <div
                          className="questionName"
                          controlId="folder_name"
                        >
                          <label className="label5-ques">
                            Folder Name**
                            <Button
                              variant="link"
                              onClick={() => setShowInputField(!showInputField)}
                              style={{ color: '#fff', marginLeft: '10px', padding: 0 }}
                            >
                              {showInputField ? (
                                <i className="bi bi-x-circle"></i> // Use 'x' for close
                              ) : (
                                <i className="bi bi-plus-circle"></i> // Use plus for open
                              )}
                            </Button>
                          </label>
                          <p></p>

                          {!showInputField ? (

                            <Select
                              options={getOptions()}
                              value={selectedFolder}
                              onChange={handleSelectionChange}
                              styles={customStyles}
                              closeMenuOnSelect={false}
                            />
                          ) : (
                            <input
                              type="text"
                              className="input-ques"
                              placeholder="Enter new folder name"
                              value={selectedFolderName}
                              onChange={(e) => {
                                setSelectedFolder(e.target.value);
                                setSelectedFolderName(e.target.value);
                              }}
                            />
                          )}
                        </div>

                        {" "}
                      </Col>

                    )}

                    <Col>
                      <div controlId="remarks">
                        <label className="label5-ques">Test Type</label>
                        <p></p>
                        <select
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          className="input-ques-topic"
                          required
                        >
                          <option value="">Select Test Type</option>
                          {userRole === 'Placement Officer' ? (
                            <>
                              <option value="College">College</option>
                              <option value="Assessment">Assessment</option>
                            </>
                          ) : (
                            <>
                              <option value="Pre-Assessment">Pre-Assessment</option>
                              <option value="Post-Assessment">Post-Assessment</option>
                              <option value="Mock/Interview">Mock/Interview</option>
                              <option value="College">College</option>
                              <option value="Assessment">Assessment</option>
                            </>
                          )}
                        </select>
                      </div>
                    </Col>




                  </Row><p></p>


                  <Row md={12}>
                    <Col>
                      <div controlId="upload_type">
                        <label className="label6-ques">Upload Questions</label>
                        <p></p>
                        <div className="custom-radio-group">
                          <label
                            className="custom-radio"
                            style={{ marginLeft: "10px" }}
                          >
                            <input
                              type="radio"
                              name="upload_type"
                              value="Manual"
                              // onChange={() => handleUploadTypeChange('Manual')}
                              onChange={(e) => {
                                handleUploadTypeChange("Manual"); // Call handleUploadTypeChange with the value 'Manual'
                                handleInputChange(e); // Call handleInputChange with the event object e
                              }}
                              required
                            />
                            <span
                              className="custom-radio-label"
                              style={{ color: "white", marginLeft: "10px" }}
                            >
                              Manual
                            </span>
                          </label>
                          <label
                            className="custom-radio"
                            style={{ marginLeft: "10px" }}
                          >
                            <input
                              type="radio"
                              name="upload_type"
                              value="Excel"
                              onChange={(e) => {
                                handleUploadTypeChange("Excel"); // Call handleUploadTypeChange with the value 'Manual'
                                handleInputChange(e);
                                /* setTimeout(() => {
                                   if (selectedSubtopic === 'All Languages' && isTestCase) {
                                     handleExportTestcaseAll();
                                   } else if (isTestCase) {
                                     handleExportTestcase();
                                   } else if (selectedSubtopic === 'All Languages') {
                                     handleExportAllLang();
                                   } else {
                                     handleExportCode();
                                   }
                                 }, 100);*/
                                // Call handleInputChange with the event object e
                              }}
                              required
                            // disabled={!isFormValid()}
                            />
                            <span
                              className="custom-radio-label"
                              style={{ color: "white", marginLeft: "10px" }}
                            >
                              Excel
                            </span>
                          </label>

                          <label className="custom-radio" style={{ marginLeft: "10px" }}>
                            <input
                              type="radio"
                              name="upload_type"
                              value="Word"
                              onChange={(e) => {
                                handleUploadTypeChange('Word');  // Call handleUploadTypeChange with the value 'Manual'
                                handleInputChange(e);
                                /* setTimeout(() => {
                                   if (selectedSubtopic === 'All Languages' && isTestCase) {
                                     handleExportAllLangwordtestcase();
                                   } else if (isTestCase) {
                                     handleExportTestcaseword();
                                   } else if (selectedSubtopic === 'All Languages') {
                                     handleExportAllLangword();
                                   } else {
                                     handleExportCoding();
                                   }
                                 }, 100);*/

                                // Call handleInputChange with the event object e
                              }}
                              required
                            //  disabled={!isFormValid()}
                            />
                            <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>Word / pdf</span>
                          </label>
                        </div>
                      </div>
                    </Col>
                    {(
                      <Col>

                        <label className="label5-ques"> Is Test Case </label><p></p>
                        <input
                          type="checkbox"
                          checked={isTestCase}
                          onChange={handleCheckboxChange}
                        />

                      </Col>

                    )}

                  </Row>
                  <p>
                    <p></p>
                  </p>
                  <Col>
                    {uploadType === "Manual" && (
                      <React.Fragment>
                        <Col>
                          <div className="status" controlId="no_of_questions">
                            <label className="label7-ques">
                              No of Questions
                            </label>
                            <p></p>
                            <input
                              type="number"
                              autocomplete="off"
                              name="no_of_questions"
                              required
                              placeholder=""
                              min="0"
                              className="input-no"
                              onChange={handleInputChange}
                              style={{ width: "50%" }}
                            />
                          </div>
                        </Col>

                        <Col></Col>
                      </React.Fragment>
                    )}
                    {uploadType !== 'Manual' && selectedSubtopic && (
                      <div className="mt-3">
                        <div
                          className="download-circle"
                          onClick={handleDownloadTemplate}
                          title="Download Template"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          }}
                        >
                          <FiDownload size={20} />
                        </div>
                      </div>
                    )}
                  </Col>

                  <Row>

                    <Col>
                      {uploadType === "Manual" && (
                        <React.Fragment>
                          <p style={{ height: "0px" }}></p>

                          <div className="button-container-lms">
                            <button
                              className="button-ques-save1 btn btn-secondary back-button-lms"
                              style={{
                                float: "left",
                                width: "100px",
                                color: "black",
                                height: "50px",
                                backgroundColor: "#F1A128",
                                cursor: "not-allowed",
                              }}
                              disabled
                            >
                              <img src={back} className="nextarrow"></img>
                              <span className="button-text">Back</span>
                            </button>
                            <button
                              type="submit"
                              className="button-ques-save save-button-lms"
                              disabled={isSubmitting}
                              style={{ width: "100px" }}
                            >
                              Save
                            </button>
                            {/*}  {!formSubmitted && (
                              <button
                                onClick={handleNextbuttonClick}
                                className="button-ques-save btn btn-secondary next-button-lms"
                                disabled
                                style={{
                                  float: "right",
                                  width: "100px",
                                  backgroundColor: "#F1A128",
                                  cursor: "not-allowed",
                                  width: "100px",
                                  color: "black",
                                  height: "50px",
                                }}
                              >
                                <span className="button-text">Next</span>{" "}
                                <img
                                  src={Nextarrow}
                                  className="nextarrow"
                                  style={{ color: "#6E6D6C" }}
                                ></img>
                              </button>
                            )}

                            {formSubmitted && (
                              <button
                                onClick={handleNextbuttonClick}
                                className="button-ques-save next-button-lms"
                                style={{ float: "right", width: "100px" }}
                              >
                                <span className="button-text">Next</span>{" "}
                                <img
                                  src={Nextarrow}
                                  className="nextarrow"
                                ></img>
                              </button>
                            )}*/}
                            {/* <button className="button-ques-save save-button-lms" style={{ width: "100px" }} onClick={() => navigate("/test/test-schedules/")} >
                              AddTest
                            </button> */}
                          </div>


                          <p style={{ height: "0px" }}></p>
                        </React.Fragment>
                      )}
                    </Col>

                  </Row>
                </Form>
              </Col>
            </Row>{" "}
            <p></p>
          </div>

          {uploadType === "Excel" && (
            <div style={{ marginLeft: "0px" }}>
              <div style={{ height: "140px" }}>
                <ImportFuncode
                  isFormValid={isFormValid}
                  formData={formData}
                  isTestCase={isTestCase}
                  handleSubmit={handleSubmit}
                  selectedFolderName={selectedFolderName}
                  collegeName={collegeName}
                  userRole={userRole}
                />
              </div>
              <p style={{ height: "50px" }}></p>
            </div>
          )}

          {uploadType === "Word" && (
            <div style={{ marginLeft: "0px" }}>
              <div style={{ height: "280px" }}>
                <ImportCodeWord isFormValid={isFormValid} isTestCase={isTestCase} formData={formData} selectedFolderName={selectedFolderName} collegeName={collegeName} userRole={userRole} />
              </div>
              <p style={{ height: "50px" }}></p>
            </div>
          )}

          <div>
            {!uploadType && !showMCQForm && (
              <div style={{ height: "280px" }}>
                {" "}
                <ImportFuncode isFormValid={isFormValid} formData={formData} selectedFolderName={selectedFolderName} userRole={userRole} collegeName={collegeName} />
              </div>
            )}
          </div>
          <p style={{ height: "0px" }}></p>
        </div>
      ) : (
        <div>
          {userRole === 'Placement Officer' ? (
            <CodeForm collegeName={collegeName} userRole={userRole} isTestCase={isTestCase} />
          ) : (
            <CodeForm isTestCase={isTestCase} />
          )}
        </div>
      )}

      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default QuestionPaperCode;
