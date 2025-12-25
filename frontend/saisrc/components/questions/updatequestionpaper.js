import React, { useState, useEffect } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import Select from "react-select";
import {
  updateQuestionPaperApi,
  getQuestionPaperByIdApi,
} from "../../api/endpoints";
import { useParams, Link } from "react-router-dom";
import ErrorModal from "../auth/errormodal";
import { useNavigate } from "react-router-dom";
import Nextarrow from "../../assets/images/nextarrow.png";
import back from "../../assets/images/backarrow.png";
import { format } from "date-fns";

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

      width: '170px'
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
      width: '170px'
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

const QuestionPaper = () => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInputField, setShowInputField] = useState(false);

  const [showInputFieldSubTopic, setShowInputFieldSupTopic] = useState(false);
  const [showInputFieldTopic, setShowInputFieldTopic] = useState(false);


  const { id } = useParams();
  console.log("print id", id);
  const [formData, setFormData] = useState({
    question_paper_name: "",
    duration_of_test: "",
    topic: "",
    sub_topic: "",
    folder_name: "",
    remarks: "", audio_text: ""
  });



  // Define topics and their corresponding subtopics
  const topicOptions = {
    Aptitude: ['Quants', 'Logical', 'Verbal', 'Generic'],
    Softskills: [],
    Technical: ['All Languages', 'C', 'C++', 'Python', 'JAVA', 'VLSI', 'Html', 'MySQL'],
    Communication: ['Verbal', 'Nonverbal', 'Written', 'Interpersonal','Pronunciation','Listening','TypingBlank','Tamil_English','Telugu_English','Hindi_English','Kannada_English','Malayalam_English'],
    Psychometry: ['Personality', 'Behavior', 'Emotions', 'Assessment'],
    CompanySpecific: ['Leadership', 'Communication', 'ProblemSolving', 'TimeManagement', 'Teamwork'],
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

  const [topic, setTopic] = useState('');
  const [subtopics, setSubtopics] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState([]);
  const [selectedFolderName, setSelectedFolderName] = useState('');

  // Handle subtopic change (optional)
  const handleSubtopicChange = (e) => {
    console.log(`Selected Subtopic: ${e.target.value}`);
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

  const NonVerbalOptions = [
    { label: 'Importance of body language, gestures, and facial expressions', value: 'Importance of body language, gestures, and facial expressions' },
    { label: 'Reading and interpreting nonverbal cues', value: 'Reading and interpreting nonverbal cues' },
    { label: 'Maintaining appropriate eye contact and posture', value: 'Maintaining appropriate eye contact and posture' },
  ]


  const writtenOptions = [
    { label: 'Structuring emails, reports, and proposals effectively', value: 'Structuring emails, reports, and proposals effectively' },
    { label: 'Avoiding common errors in professional writing', value: 'Avoiding common errors in professional writing' },
    { label: 'Writing clear and concise messages', value: 'Writing clear and concise messages' },
  ]

  const InterPeronalOptions = [
    { label: 'Building rapport and maintaining relationships', value: 'Building rapport and maintaining relationships' },
    { label: 'Effective negotiation and conflict resolution', value: 'Effective negotiation and conflict resolution' },
    { label: 'Empathy and emotional intelligence in conversations', value: 'Empathy and emotional intelligence in conversations' },
  ]

  const personalityOptions = [
    { label: 'Theories', value: 'Theories' },
    { label: 'Personality Development', value: 'Personality Development' },
    { label: 'Personality Assessments', value: 'Personality Assessments' },
    { label: 'Impact on Career and Relationships', value: 'Impact on Career and Relationships' },
    { label: 'Personality and Leadership Styles', value: 'Personality and Leadership Styles' },
  ];

  const behaviorOptions = [
    { label: 'Behavioral Patterns and Habits', value: 'Behavioral Patterns and Habits' },
    { label: 'Influences of Environment on Behavior', value: 'Influences of Environment on Behavior' },
    { label: 'Behavioral Assessments', value: 'Behavioral Assessments' },
    { label: 'Role of Behavior in Decision-Making', value: 'Role of Behavior in Decision-Making' },
    { label: 'Behavioral Modification Techniques', value: 'Behavioral Modification Techniques' },
  ];

  const emotionsOptions = [
    { label: 'Emotional Intelligence (EQ)', value: 'Emotional Intelligence (EQ)' },
    { label: 'Managing Emotional Stress', value: 'Managing Emotional Stress' },
    { label: 'Role of Emotions in Communication', value: 'Role of Emotions in Communication' },
    { label: 'Emotions and Decision-Making', value: 'Emotions and Decision-Making' },
    { label: 'Techniques for Emotional Regulation', value: 'Techniques for Emotional Regulation' },
  ];

  const assessmentOptions = [
    { label: 'Psychometric Test Design', value: 'Psychometric Test Design' },
    { label: 'Reliability and Validity in Testing', value: 'Reliability and Validity in Testing' },
    { label: 'Types of Assessments', value: 'Types of Assessments' },
    { label: 'Interpreting Assessment Results', value: 'Interpreting Assessment Results' },
    { label: 'Ethical Considerations in Assessments', value: 'Ethical Considerations in Assessments' },
  ];

  const leadershipOptions = [
    { label: 'Decision-Making', value: 'Decision-Making' },
    { label: 'Team Management', value: 'Team Management' },
    { label: 'Strategic Thinking', value: 'Strategic Thinking' },
    { label: 'Conflict Resolution', value: 'Conflict Resolution' },
    { label: 'Vision and Goal Setting', value: 'Vision and Goal Setting' },
  ];

  const communicationOptions = [
    { label: 'Verbal and Written Communication', value: 'Verbal and Written Communication' },
    { label: 'Active Listening', value: 'Active Listening' },
    { label: 'Nonverbal Communication', value: 'Nonverbal Communication' },
    { label: 'Public Speaking', value: 'Public Speaking' },
    { label: 'Cross-Cultural Communication', value: 'Cross-Cultural Communication' },
  ];

  const problemSolvingOptions = [
    { label: 'Analytical Thinking', value: 'Analytical Thinking' },
    { label: 'Root Cause Analysis', value: 'Root Cause Analysis' },
    { label: 'Brainstorming Techniques', value: 'Brainstorming Techniques' },
    { label: 'Decision-Making Models', value: 'Decision-Making Models' },
    { label: 'Creative Solutions', value: 'Creative Solutions' },
  ];

  const timeManagementOptions = [
    { label: 'Prioritization Techniques', value: 'Prioritization Techniques' },
    { label: 'Task Delegation', value: 'Task Delegation' },
    { label: 'Goal Setting and Tracking', value: 'Goal Setting and Tracking' },
    { label: 'Productivity Tools', value: 'Productivity Tools' },
    { label: 'Overcoming Procrastination', value: 'Overcoming Procrastination' },
  ];

  const teamworkOptions = [
    { label: 'Collaboration Techniques', value: 'Collaboration Techniques' },
    { label: 'Building Trust', value: 'Building Trust' },
    { label: 'Role Clarity and Responsibility', value: 'Role Clarity and Responsibility' },
    { label: 'Conflict Management', value: 'Conflict Management' },
    { label: 'Celebrating Achievements', value: 'Celebrating Achievements' },
  ];


  const allLangOptions = [
    { label: 'Syntax and Semantics', value: 'Syntax and Semantics' },
    { label: 'Data Structures and Algorithms', value: 'Data Structures and Algorithms' },
    { label: 'Object-Oriented Programming (OOP)', value: 'Object-Oriented Programming (OOP)' },
    { label: 'Memory Management', value: 'Memory Management' },
    { label: 'Debugging and Testing', value: 'Debugging and Testing' },
  ];

  const PrblmSoveOption = [
    { label: 'Critical Thinking', value: 'critical_thinking' },
    { label: 'Logical Reasoning', value: 'logical_reasoning' },
    { label: 'Analytical Skills', value: 'analytical_skills' },
    { label: 'Creative Problem Solving', value: 'creative_problem_solving' },
    { label: 'Decision Making', value: 'decision_making' }
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
    }
    if (topic === 'Communication') {
      if (selectedSubtopic === 'Nonverbal') {
        return NonVerbalOptions;
      }
      if (selectedSubtopic === 'Written') {
        return writtenOptions;
      }
      if (selectedSubtopic === 'Interpersonal') {
        return InterPeronalOptions;
      }
      if (selectedSubtopic === 'Verbal') {
        return verbalOptions;
      }
    }
    if (topic === 'Psychometry') {
      if (selectedSubtopic === 'Personality') {
        return personalityOptions;
      }
      if (selectedSubtopic === 'Behavior') {
        return behaviorOptions;
      }
      if (selectedSubtopic === 'Emotions') {
        return emotionsOptions;
      }
      if (selectedSubtopic === 'Assessment') {
        return assessmentOptions;
      }
    }
    if (topic === 'CompanySpecific') {
      if (selectedSubtopic === 'Leadership') {
        return leadershipOptions;
      }
      if (selectedSubtopic === 'Communication') {
        return communicationOptions;
      }
      if (selectedSubtopic === 'ProblemSolving') {
        return problemSolvingOptions;
      }
      if (selectedSubtopic === 'TimeManagement') {
        return timeManagementOptions;
      }
      if (selectedSubtopic === 'Teamwork') {
        return teamworkOptions;
      }
    }
    return []; // Fallback for unmatched cases
  };




  const handleSelectionChange = (selectedOptions) => {
    console.log('SelectesOption: ', selectedOptions.value);
    setSelectedFolder(selectedOptions || []);
    setSelectedFolderName(selectedOptions.value);


    setFormData((prevData) => ({
      ...prevData,
      folder_name: selectedOptions.value,
    }));
  };



  useEffect(() => {
    // Fetch question paper by ID when the component mounts
    getQuestionPaperByIdApi(id)
      .then((data) => {
        // Set the form data with the fetched question paper details
        setFormData({
          question_paper_name: data.question_paper_name || "",
          duration_of_test: data.duration_of_test || "",
          topic: data.topic || "",
          sub_topic: data.sub_topic || "",
          folder_name: data.folder_name || "",
          remarks: data.remarks || '', audio_text: data.audio_text || ""
        });

        setTopic(data.topic);


        if (data.topic) {
          const subtopics = topicOptions[data.topic] || [];
          console.log('Subtopics for topic:', data.topic, subtopics);
          setSubtopics(subtopics);
        }


        const folderOption = [{ label: data.folder_name, value: data.folder_name }];
        console.log('Selected Folder: ', folderOption);
        setSelectedFolder(folderOption);


      })
      .catch((error) => {
        console.error("Failed to fetch question paper", error);
        setErrorMessage("Failed to fetch question paper. Please try again.");
        setShowError(true);
      });
  }, [id]); // Only runs once when component mounts or when id changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    console.log("print formdata", formData)
    if (!formData.duration_of_test || String(formData.duration_of_test).trim() === "") {
      formData.duration_of_test = null;
    }


    // Fetch existing question papers to validate unique topic-subtopic pairs
    updateQuestionPaperApi(id, formData)
      .then((result) => {
        navigate("/question-paper-table");
        // Handle success (e.g., show a success message or navigate to another page)
        console.log("Question paper updated successfully", result);
      })
      .catch((error) => {
        console.error("Failed to update question paper", error);
        alert("Failed to update question paper. Check console for details.");
      });
  };

  const handleCloseError = () => {
    setShowError(false);
  };




  return (
    <div className="form-ques1">
      <div className="form-ques-codepap">
        <div>
          <form
            className="form-ques-upd"
            onSubmit={(e) => handleSubmit(e, formData)}
          >
            <Row md={12}>
              <Col>
                <div className="questionName" controlId="question_paper_name">
                  <label className="label6-ques">Question Paper Name</label>
                  <p></p>
                  <input
                    type="text"
                    className="input-ques"
                    name="question_paper_name"
                    required
                    placeholder=""
                    autoComplete="off"
                    value={formData.question_paper_name}
                    onChange={handleInputChange}
                  />{" "}
                </div>
              </Col>

              <Col>
                <div className="duration" controlId="duration_of_test">
                  <label className="label7-ques">Duration of the Test</label>
                  <p></p>
                  <input
                    type="number"
                    name="duration_of_test"
                    // required
                    placeholder=""
                    autoComplete="off"
                    className="input-ques-dur"
                    min="0"
                    value={formData.duration_of_test}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
            </Row>
            <p></p>

            <Row md={12}>
              <Col>
                <div controlId="topic">
                  <label className="label6-ques">Topic
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
                      value={formData.topic}
                      onChange={handleTopicChange}
                      className='input-ques-topic'
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
              <Col>
                <div controlId="selectedSubTopic">
                  <label className="label7-ques"> Sub Topic
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
                    </Button>
                  </label><p></p>
                  {!showInputFieldSubTopic ? (
                    <select
                      name="sub_topic"
                      onChange={handleSubtopicChange}
                      className='input-ques-topic'
                      disabled={subtopics.length === 0}
                      value={formData.sub_topic || ""} // Ensure value is set
                    >
                      <option value="">Select a Subtopic</option>


                      {/* Conditionally add the selected sub_topic if not already in the list */}
                      {!subtopics.includes(formData.sub_topic) && formData.sub_topic && (
                        <option value={formData.sub_topic}>{formData.sub_topic} (new)</option>
                      )}
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
            </Row><p></p>
            <Row>
              <Col>
                <div className="questionName" controlId="folder_name">
                  <label className="label6-ques">Folder Name
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
                        const value = e.target.value;
                        setSelectedFolder(e.target.value);
                        setSelectedFolderName(e.target.value);
                        setFormData((prevData) => ({
                          ...prevData,
                          folder_name: value,
                        }));
                      }}
                    />
                  )}
                </div>
                {" "}
              </Col>
              <Col>
                <div controlId="remarks">
                  <label className="label5-ques">Test Type</label><p></p>
                  <select
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    className="input-ques-topic"
                    required
                  >
                    <option value="">Select Test Type</option>
                    <option value="Pre-Assessment">Pre-Assessment</option>
                    <option value="Post-Assessment">Post-Assessment</option>
                    <option value="Mock/Interview">Mock/Interview</option>
                    <option value="College">College</option>
                    <option value="Assessment">Assessment</option>
                    <option value="PracticeTest">PracticeTest</option>
                    <option value='Pronunciation'>Pronunciation</option>
                    <option value='AudioMCQ'>AudioMCQ</option>

                    <option value='AudioTyping'>AudioTyping</option>
                    <option value="TypingBlank">TypingBlank</option>
    <option value="Multi_Pronunciation">Multi Language Pronunciation</option>
    <option value="Multi_AudioTyping">Multi Language AudioTyping</option>
                  </select>
                </div>
              </Col>

            </Row>
            <p ></p>

            {formData.remarks === "AudioMCQ" && (
              <Row>
                <Col>
                  <div className="questionName" controlId="audio_text">
                    <label className="label6-ques">Audio Text</label>
                    <p></p>
                    <input
                      type="text"
                      className="input-ques"
                      name="audio_text"
                      placeholder="Enter audio text"
                      autoComplete="off"
                      value={formData.audio_text}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Col>
              </Row>
            )}

            <p ></p>
            <Row>
              <Col>
                <div className="button-container-lms">
                  <Link to="/question-paper-table"
                    style={{ color: "black", textDecoration: "none" }}
                  >     <button
                    className="button-ques-save btn btn-secondary back-button-lms"
                    style={{

                      color: "black",

                    }}

                  >
                      <img src={back} className="nextarrow"></img>
                      <span className="button-text">Back</span>
                    </button></Link>
                  <button
                    style={{ width: "100px" }}
                    className="button-ques-save save-button-lms"
                    type="submit"
                  >
                    Update
                  </button>
                  <button
                    className="button-ques-save btn btn-secondary next-button-lms"
                    disabled
                    style={{
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
                </div>
              </Col>
            </Row>
          </form>
          <p></p>
        </div>
      </div>
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default QuestionPaper;
