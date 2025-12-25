/* global google */
import React, { useState, useEffect } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import {
    addQuestionpaperApi,

    addQuestionpaperApi_place,
} from '../../api/endpoints';
import ExcelJS from 'exceljs';
import physico from '../../assets/sample_physico.xlsx';

import { FiDownload } from "react-icons/fi";
import Word from '../../assets/sample_mcq_word_questions.docx';
import Wordpsy from '../../assets/word_psycho.docx';
import MCQForm from './mcqform';
import ImportFuncode from './importcode';
import ImportMCQ from './importmcq';
import '../../styles/trainingadmin.css'
import Nextarrow from '../../assets/images/nextarrow.png'
import back from '../../assets/images/backarrow.png';
import Fooer from '../../footer/footer';
import ErrorModal from '../auth/errormodal';
import ImportMCQWord from './importmcqword';
import { gapi } from "gapi-script";

import { useNavigate } from "react-router-dom";
import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';


const CLIENT_ID = "1004976523607-8qtbf0jjhjf8n6n8q406592f46la0o7h.apps.googleusercontent.com";
const API_KEY = "AIzaSyBU9Oi_2a91lZsM7anp8KRNgFsZvLWBcMA";
const SCOPE = "https://www.googleapis.com/auth/drive.file";


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

            width: '99%'
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
            width: '99%'
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

const exportMCQToExcel = (questions) => {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Questions');


    const header = [
        { header: 'Questions**', key: 'question_text', width: 40 },
        { header: 'Option A', key: 'option_a', width: 20 },
        { header: 'Option B', key: 'option_b', width: 20 },
        { header: 'Option C', key: 'option_c', width: 20 },
        { header: 'Option D', key: 'option_d', width: 20 },
        { header: 'Answer**', key: 'answer', width: 15 },
        { header: 'Mark**', key: 'mark', width: 15 },
        { header: 'Difficulty Level', key: 'difficulty_level', width: 40 },
        { header: 'Explain Answer', key: 'explain_answer', width: 40 },
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
    questions.forEach(({ id, input_format, view_hint, question_id, negative_mark, ...rest }) => {
        worksheet.addRow(rest);
    });

    // Save workbook as Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Sample_MCQ_Questions.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    }).catch(error => {
        console.error('Error exporting to Excel:', error);
    });

};

// Define a constant sample question
const sampleQuestion = [
    {
        question_text: 'What is the capital of France?',
        option_a: 'Paris',
        option_b: 'Berlin',
        option_c: 'Madrid',
        option_d: 'Rome',
        answer: 'A',
        mark: '1',
        difficulty_level: "Challenging",
        explain_answer: 'Paris is the capital city of France.'
    }
];


const QuestionPaperMCQTest = ({ selectedSkill,userRole, collegeName,selectedTestTypeCategoryPass }) => {
    console.log("topic received",selectedSkill)

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
    const [formSubmitted, setFormSubmitted] = useState(false);
    // const [uploadType, setUploadType] = useState(true); // State to track the selected upload type
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadType, setUploadType] = useState('Manual');
    const navigate = useNavigate();
    const [selectedTopic, setSelectedTopic] = useState("");
    const [showInputField, setShowInputField] = useState(false);
    const [showInputFieldSubTopic, setShowInputFieldSupTopic] = useState(false);
    const [showInputFieldTopic, setShowInputFieldTopic] = useState(false);




    const handleUploadTypeChange = (type) => {
        setUploadType(type);
    };

useEffect(() => {
  if (selectedSkill === "Aptitude") {
    setTopic("Aptitude");
    setSelectedTopic("Aptitude");
    setFormData(prev => ({ ...prev, topic: "Aptitude" }));
  } else if (selectedSkill === "MCQ-Technical") {
    setTopic("Technical");
    setSelectedTopic("Technical");
    setFormData(prev => ({ ...prev, topic: "Technical" }));
  }
}, [selectedSkill]);

   
    
useEffect(() => {
  if (selectedTestTypeCategoryPass) {
    setFormData(prev => ({
      ...prev,
      remarks: selectedTestTypeCategoryPass
    }));
  }
}, [selectedTestTypeCategoryPass]);


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
            remarks: ''   // ✅ new field
        }
        : {
            question_paper_name: '',
            duration_of_test: '',
            topic: '',
            sub_topic: '',
            folder_name: '',
            no_of_questions: 0, // Initialize with appropriate default value
            upload_type: '', // Initialize with appropriate default value
            remarks: ''   // ✅ new field
        };

    // Initialize formData with the computed initial state
    const [formData, setFormData] = useState(initialFormData);

    const handleCloseError = () => {
        setShowError(false);
    };
    const handleGoBackClick = () => {
        setShowMCQForm(false);
    };
    const handleNextButtonClick = () => {
        setShowMCQForm(true);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (formData.topic === 'HDFC') {
            setFormData(prev => ({
                ...prev,
                sub_topic: 'Sample'
            }));
        }
    }, [formData.topic]);

    const isFormValid = () => {
        return (
            formData.question_paper_name !== '' &&
            formData.duration_of_test !== '' &&
            formData.topic !== '' &&
            (
                (formData.topic === 'Softskills' && true) || // sub_topic is optional for Softskills
                ((formData.topic === 'Aptitude' || formData.topic === 'Technical') && formData.sub_topic !== '') || // sub_topic is mandatory for Aptitude and Technical
                (formData.topic === 'HDFC' && formData.sub_topic !== '')  // sub_topic is mandatory for HDFC
            )
            // formData.folder_name !== ""
        );
    };


    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e, formData) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const MCQTest = "MCQ Test";
        console.log("📌 Validating Form Data...");

        // Check for missing required fields
        const requiredFields = [
            "question_paper_name",
            "duration_of_test",
            "topic",
            "sub_topic",
            "no_of_questions",
            "upload_type"
        ];

        const missingFields = requiredFields.filter((field) => !formData[field]);

        if (missingFields.length > 0) {
            console.error("❌ Missing Fields:", missingFields);
            alert(`Please fill all required fields: ${missingFields.join(", ")}`);
            return;
        }

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
                        handleNextButtonClick();
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
        Aptitude: ['Quants', 'Logical', 'Verbal', 'Overall', 'Generic', 'ProblemSolving'],
        Technical: ['All Languages', 'C', 'C++', 'Python', 'JAVA', 'VLSI', 'SQL', 'Others'],
        Softskills: [],
        HDFC: [],

        Communication: ['Verbal', 'Nonverbal', 'Written', 'Interpersonal'],
        Psychometry: ['Personality', 'Behavior', 'Emotions', 'Assessment'],
        CompanySpecific: ['All Languages', 'C', 'C++', 'Python', 'JAVA', 'VLSI', 'SQL', 'Others', 'Quants', 'Logical', 'Verbal', 'Overall', 'Generic', 'Leadership', 'Communication', 'ProblemSolving', 'TimeManagement', 'Teamwork'],
    };

    // Handle topic change
    const handleTopicChange = (e) => {
        setSelectedTopic(e.target.value);
        const selectedTopic = e.target.value;
        setTopic(selectedTopic);
        setSubtopics(topicOptions[selectedTopic] || []);

        setFormData((prevData) => ({
            ...prevData,
            topic: selectedTopic,
            sub_topic: '', // Reset sub_topic when topic changes
        }));
        console.log("Selected Topic in QuestionPaper:", selectedTopic);
        setSelectedFolder([]);
        setSelectedFolderName('')
    };
    const [selectedSubtopic, setSelectedSubtopic] = useState('');

    useEffect(() => {
        console.log("Selected Topic in useEffect:", selectedTopic);
    }, [selectedTopic]);

    // Handle subtopic change (optional)
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
        { label: 'Pre-Assessment', value: 'Pre-Assessment' },
        { label: 'Cross-Cultural Communication', value: 'Cross-Cultural Communication' },
    ];

    const HDFCOptions = [
        { label: 'pre-assessment', value: 'pre-assessment' },
        { label: 'post-assessment', value: 'post-assessment' },

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
        { label: 'Pre-Assessment', value: 'Pre-Assessment' },
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
        { label: 'Pre-Assessment', value: 'Pre-Assessment' },
    ];

    const PrblmSoveOption = [
        { label: 'Critical Thinking', value: 'critical_thinking' },
        { label: 'Logical Reasoning', value: 'logical_reasoning' },
        { label: 'Analytical Skills', value: 'analytical_skills' },
        { label: 'Creative Problem Solving', value: 'creative_problem_solving' },
        { label: 'Decision Making', value: 'decision_making' }
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
        { label: 'EDA Tools', value: 'EDA Tools' },
        { label: 'Pre-Assessment', value: 'Pre-Assessment' },
    ];



    const getOptions = () => {
        if (topic === 'Softskills') {
            return softSkillsOptions;
        }
        if (topic === 'HDFC') {
            return HDFCOptions;
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

            if (selectedSubtopic === 'ProblemSolving') {
                return PrblmSoveOption;
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




    const [selectedFolder, setSelectedFolder] = useState([]);
    const [selectedFolderName, setSelectedFolderName] = useState('');


    const handleSelectionChange = (selectedOption) => {
        if (selectedOption) {
            console.log('Selected or Typed Folder Name:', selectedOption.value);
            setSelectedFolder(selectedOption); // this sets the full object: { label, value }
            setSelectedFolderName(selectedOption.value); // this stores just the value
        } else {
            // If user clears the input
            setSelectedFolder(null);
            setSelectedFolderName('');
        }
    };


    useEffect(() => {
        const initClient = () => {
            gapi.load("client:auth2", () => {
                gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    scope: SCOPE,
                });
            });
        };
        initClient();
    }, []);




    const loadGoogleAPI = () => {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => console.log("Google API loaded");
        document.body.appendChild(script);
    };

    useEffect(() => {
        loadGoogleAPI();
    }, []);
    const handleExportMCQword = () => {
        // Path to the document in the public/assets directory
        const documentUrl = Word;

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = 'sample_mcq_word_questions.docx';

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };
    const handleExportMCQwordpsyho = () => {
        // Path to the document in the public/assets directory
        const documentUrl = Wordpsy;

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = 'Sample_MCQ_Psyhometry.docx';

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };


    const handleExportMCQ = async () => {
        try {
            exportMCQToExcel(sampleQuestion); // Use sampleQuestion for export
        } catch (error) {
            console.error('Error exporting code:', error);
        }
    };

    const handleExportmcqpsyo = () => {
        // Path to the document in the public/assets directory
        const documentUrl = physico;

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = 'Sample_physicometry.xlsx';

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };
    const handleDownloadTemplate = () => {
        if (uploadType === 'Excel') {
            if (selectedTopic === 'Psychometry') {
                handleExportmcqpsyo();
            } else {
                handleExportMCQ();
            }
        } else if (uploadType === 'Word') {
            if (selectedTopic === 'Psychometry') {
                handleExportMCQwordpsyho();
            } else {
                handleExportMCQword();
            }
        } else {
            alert('Please select a valid Upload Type');
        }
    };

    return (

        <div className="form-ques-composite">
            {!showMCQForm ? (
                <div>
                    <div>
                        <Row>
                            <Col>
                                <Form onSubmit={(e) => handleSubmit(e, formData)} className='form-ques-compo'>

                                    <Row md={12}>

                                        <Col>
                                            <div className='questionName' controlId='question_paper_name'>
                                                <label className='label5-ques'>Question Paper Name**</label><p></p>
                                                <input
                                                    type="text"
                                                    autocomplete="off"
                                                    className='input-ques'
                                                    name="question_paper_name"
                                                    required
                                                    placeholder=""
                                                    onChange={handleInputChange}
                                                //  readOnly={!uploadType}
                                                />   </div>
                                        </Col>

                                        <Col>
                                            <div className='duration' controlId='duration_of_test'>
                                                <label className='label5-ques' >Duration of the Test**</label><p></p>
                                                <input
                                                    type="number"
                                                    autocomplete="off"
                                                    name="duration_of_test"
                                                    required
                                                    placeholder=""
                                                    className='input-ques-dur'
                                                    min="0"
                                                    onChange={handleInputChange}
                                                //  readOnly={!uploadType}
                                                />

                                            </div>
                                        </Col>
                                    </Row><p></p><p></p>

                                    <Row md={12}>
                                        <Col>
                                            <div controlId='topic'>
                                                <label className='label5-ques'>Topic**
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

                                        { (
                                            <Col >
                                                <div controlId='selectedSubTopic'>
                                                    <label className='label5-ques'>  Sub Topic**
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
                                        ) }


                                    </Row>
                                    <p></p> <p></p>


                                    <Row>
                                        { (
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
                                                <label className="label5-ques">Test Type</label><p></p>
                                                <select
                                                    name="remarks"
                                                    value={formData.remarks}
                                                    onChange={handleInputChange}
                                                    className="input-ques-topic"
                                                    required
      disabled

                                                >
                                                    <option value="">Select Test Type</option>
                                                    <option value="Pre-Assessment">Pre-Assessment</option>
                                                    <option value="Post-Assessment">Post-Assessment</option>
                                                    <option value="Mock/Interview">Mock/Interview</option>
                                                     <option value="College">College</option>
                                                     <option value="Assessment">Assessment</option>            </select>
                                            </div>
                                        </Col>

                                    </Row><p></p>

                                    <Row md={12}>
                                        <Col>
                                            {uploadType === 'Manual' &&  (
                                                <React.Fragment>
                                                    < Col >
                                                        <div className='status' controlId='no_of_questions'>
                                                            <label className='label5-ques'>No of Questions</label><p></p>
                                                            <input
                                                                type="number"
                                                                autocomplete="off"
                                                                name="no_of_questions"
                                                                required
                                                                placeholder=""
                                                                className='input-no'
                                                                min="0"
                                                                onChange={handleInputChange}
                                                            />

                                                        </div>
                                                    </Col>


                                                </React.Fragment>


                                            )}
                                            {(uploadType === 'Excel' || uploadType === 'Word') && selectedTopic && (
                                                <div
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
                                            )}</Col>


                                        <Col >
                                            <div controlId='upload_type'>
                                                <label className='label5-ques'>Upload Questions</label><p></p><p></p>
                                                <div className="custom-radio-group">
                                                    <label className="custom-radio" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="upload_type"
                                                            value="Manual"
                                                            // onChange={() => handleUploadTypeChange('Manual')}
                                                            onChange={(e) => {
                                                                handleUploadTypeChange('Manual');  // Call handleUploadTypeChange with the value 'Manual'
                                                                handleInputChange(e);  // Call handleInputChange with the event object e
                                                            }}
                                                            required
                                                        />
                                                        <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>Manual</span>
                                                    </label>
                                                    <label className="custom-radio" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="upload_type"
                                                            value="Excel"
                                                            onChange={(e) => {
                                                                handleUploadTypeChange('Excel');  // Call handleUploadTypeChange with the value 'Manual'
                                                                handleInputChange(e);
                                                                /*  if (selectedTopic === 'Psychometry') {
                                                                    handleExportmcqpsyo();
                                                                  }
                                                                  else {
                                                                      handleExportMCQ();
                                                                  }*/

                                                            }}
                                                            required
                                                        //  disabled={!isFormValid()}
                                                        />
                                                        <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>Excel</span>
                                                    </label>
                                                    <label className="custom-radio" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="upload_type"
                                                            value="Word"
                                                            onChange={(e) => {

                                                                handleUploadTypeChange('Word');  // Call handleUploadTypeChange with the value 'Manual'
                                                                handleInputChange(e);
                                                                /*  if (selectedTopic === 'Psychometry') {
                                                                      handleExportMCQwordpsyho();
                                                                  }
                                                                  else {
                                                                      handleExportMCQword();
                                                                  }*/

                                                                // Call handleInputChange with the event object e
                                                            }}
                                                            required
                                                        //  disabled={!isFormValid()}
                                                        />
                                                        <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>Word / Pdf</span>
                                                    </label>
                                                    {/*}
                                                    <label className="custom-radio" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="upload_type"
                                                            value="G-Drive"
                                                            // onChange={() => handleUploadTypeChange('Manual')}
                                                            onClick={handleFilePicker}
                                                            required
                                                        />
                                                        <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>G-Drive</span>
                                                    </label>
                                                    */}
                                                </div>
                                            </div>
                                        </Col>

                                    </Row>
                                    <p></p>


                                    <Row>
                                        <Col>

                                            {uploadType === 'Manual' && (
                                                <React.Fragment>
                                                    <p ></p>

                                                    <div className="button-container-lms">
                                                        <button

                                                            className="button-ques-save btn btn-secondary back-button-lms"
                                                            style={{ float: "left", width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128', cursor: 'not-allowed' }}
                                                            disabled
                                                        ><img src={back} className='nextarrow' ></img>
                                                            <span className="button-text">Back</span>
                                                        </button>
                                                        <button type="submit" disabled={isSubmitting} className="button-ques-save save-button-lms" style={{ width: "100px" }}  >
                                                            Save
                                                        </button>


                                                        {/* <button className="button-ques-save save-button-lms" style={{ width: "100px" }} onClick={() => navigate("/test/test-schedules/")} >
                                                            AddTest
                                                        </button> */}
                                                    </div>
                                                </React.Fragment>
                                            )}

                                        </Col>
                                    </Row>

                                </Form>
                                <p></p><p></p>
                            </Col>

                        </Row>
                    </div>


                    {uploadType === 'Excel' && (
                        <div style={{ marginLeft: '0px' }}>
                            <div style={{ height: "140px" }}>
                                <ImportMCQ isFormValid={isFormValid} selectedTopic={selectedTopic} formData={formData} handleSubmit={handleSubmit} selectedFolderName={selectedFolderName} collegeName={collegeName} userRole={userRole}  />
                            </div>
                            <p style={{ height: "50px" }}></p>
                        </div>
                    )}

                    {uploadType === 'Word' && (
                        <div style={{ marginLeft: '0px' }}>
                            <div style={{ height: "140px" }}>
                                <ImportMCQWord selectedTopic={selectedTopic} isFormValid={isFormValid} formData={formData} selectedFolderName={selectedFolderName} collegeName={collegeName} userRole={userRole}  />
                            </div>
                            <p style={{ height: "50px" }}></p>
                        </div>
                    )}

                </div>) : (
                <div>
                    {userRole === 'Placement Officer' ? (
                        <MCQForm collegeName={collegeName} userRole={userRole} selectedTopic={selectedTopic}  />
                    ) : (
                        <MCQForm selectedTopic={selectedTopic}   />
                    )}
                </div>
            )}

            <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

        </div>
    );

};

export default QuestionPaperMCQTest;