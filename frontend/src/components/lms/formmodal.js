import React, { useState, useEffect, useContext } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import Nextarrow from '../../assets/images/nextarrow.png'
import back from '../../assets/images/backarrow.png'

import 'react-datepicker/dist/react-datepicker.css';
import ErrorModal from '../auth/errormodal';
import { addcontentApi, gettopic, gettopicApi, getSkilltypeApi, getcontentApi, getqstntypeApi } from '../../api/endpoints';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext } from '../test/context/testtypecontext';
import Footer from '../../footer/footer';
import { useNavigate } from 'react-router-dom';
import CustomOption from '../test/customoption';
import { Modal } from 'react-bootstrap';

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

            width: '70%'
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
            width: '70%'
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

const FormModal = ({ onNextButtonClick }) => {
    const navigate = useNavigate();
    const { selectedQuestionType } = useContext(QuestionTypeContext);
    const { selectedSkillType } = useContext(SkillTypeContext);

    console.log('SelectedQuest Type: ', selectedQuestionType);
    console.log('SelectedSkill Type: ', selectedSkillType);
    const [showInputFieldTopic, setShowInputFieldTopic] = useState(false);

    const [manualTopic, setManualTopic] = useState(""); // For <input />

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
 


   
    const assessmentOptions = [
        { label: 'Psychometric Test Design', value: 'Psychometric Test Design' },
        { label: 'Reliability and Validity in Testing', value: 'Reliability and Validity in Testing' },
        { label: 'Types of Assessments', value: 'Types of Assessments' },
        { label: 'Interpreting Assessment Results', value: 'Interpreting Assessment Results' },
        { label: 'Ethical Considerations in Assessments', value: 'Ethical Considerations in Assessments' },
    ];

   

    const allLangOptions = [
        { label: 'Syntax and Semantics', value: 'Syntax and Semantics' },
        { label: 'Data Structures and Algorithms', value: 'Data Structures and Algorithms' },
        { label: 'Object-Oriented Programming (OOP)', value: 'Object-Oriented Programming (OOP)' },
        { label: 'Memory Management', value: 'Memory Management' },
        { label: 'Debugging and Testing', value: 'Debugging and Testing' },
    ];

   
    const getOptions = () => {
        if (selectedQuestionType === 'Softskills') {
            return softSkillsOptions;
        }

        // Check if selectedSkillType is defined or selectedQuestionType matches 'Aptitute', 'Technical', etc.
        if (selectedSkillType || ['Aptitute', 'Technical'].includes(selectedQuestionType)) {
            switch (selectedSkillType) {
                case 'Quants':
                    return quantsOptions;
                case 'Logical':
                    return logicalOptions;
                case 'Verbal':
                    return verbalOptions;
                case 'C':
                    return cPrgOptions;
                case 'C++':
                    return cppPrgOptions;
                case 'All Language' :
                     return allLangOptions;
      
                case 'Python':
                    return pythonOptions;
                case 'JAVA':
                    return javaOptions;
                case 'Assessment':
                    return assessmentOptions;
               
                
                default:
                    return [];
            }
        }

        return [];
    };



    const [selectedTopics, setSelectedTopics] = useState([]);


    const handleSelectionChange = (selectedOptions) => {
        setSelectedTopics(selectedOptions || []);
    };



    const [skilltype, setskilltype] = useState([]);
    const [questtionTypes, setQuestionTypes] = useState([]);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleCloseError = () => {
        setShowError(false);
    };
    const [dtmValidity, setDtmValidity] = useState(null);
    useEffect(() => {

        getqstntypeApi()
            .then(data => {
                setQuestionTypes(data.map(item => ({ value: item.id, label: item.question_type })));
            })
            .catch(error => console.error('Error fetching question types:', error));

        getSkilltypeApi()
            .then(data => {
                setskilltype(data.map(item => ({ value: item.id, label: item.skill_type })));
            })
            .catch(error => console.error('Error fetching skill types:', error));
    }, []);


    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

        // Adjusted width and height for iframe
        const width = "1100px";
        const height = "450px";

        // Get the content from the form
        const content = formData.get('actual_content');
        const link = formData.get('worksheet_link');

        const adjustedContent = content
            ? content
                .replace(/width="\d+"/, `width="${width}"`)
                .replace(/height="\d+"/, `height="${height}"`)
                .replace(/<iframe([^>]*?)>/, `<iframe$1 scrolling="yes">`)
            : '';
        const adjustedlink = link
            ? link
                .replace(/width="\d+"/, `width="${width}"`)
                .replace(/height="\d+"/, `height="${height}"`)
                .replace(/<iframe([^>]*?)>/, `<iframe$1 scrolling="yes">`)
            : '';

        let questypeID = null;
        let skillTypeID = null;

        const fetchData = async () => {
            try {

                const qstnTypes = await getqstntypeApi();
                const skillTypes = await getSkilltypeApi();

                const questionTypeData = qstnTypes.find(item => item.question_type === selectedQuestionType);
                const skillTypeData = skillTypes.find(item => item.skill_type === selectedSkillType);

                questypeID = questionTypeData ? questionTypeData.id : null;
                skillTypeID = skillTypeData ? skillTypeData.id : null;


                const topicsSub = showInputFieldTopic
  ? manualTopic?.trim() || ''
  : selectedTopics && selectedTopics.length > 0
    ? selectedTopics.map((topic) => topic.value).join(', ')
    : '';


                const contentmaster = {
                    question_type_id: questypeID,
                    skill_type_id: skillTypeID,
                    content_url: formData.get('content_url') || '',
                    actual_content: adjustedContent,
                    topic: topicsSub, // Ensures topic is not just a comma
                    worksheet_link: adjustedlink,
                };

                console.log('contentmaster: ', contentmaster);

                addcontentApi(contentmaster)
                    .then((result) => {
                        console.log('Result:', result);
                        console.log('Content master:', contentmaster);
                        setErrorMessage('Data Added Successfully');
                        setShowError(true);
                        setDtmValidity(null);

                        e.target.reset();
                        navigate('/lms/');
                    })
                    .catch((error) => {
                        console.error("Failed to add data", error);
                        alert("Failed to add. Check console for details.");
                    });
            } catch (error) {
                console.error("Failed to fetch data", error);
                alert("Failed to fetch data. Check console for details.");
            }
            setIsSubmitting(false);
        };

        fetchData();
    };

    const [selectedDocEmbed, setSelectedDocEmbed] = useState("");
    const [selectedWorksheetEmbed, setSelectedWorksheetEmbed] = useState("");
    const [selectedVideoUrl, setSelectedVideoUrl] = useState("");

    // Handles Content URL (Embedded HTML)
    const handleContentChange = (e) => {
        setSelectedDocEmbed(e.target.value.trim());
    };

    // Handles Worksheet Link (Embedded HTML)
    const handleWorksheetChange = (e) => {
        setSelectedWorksheetEmbed(e.target.value.trim());
    };

    // Handles Video URL
    const handleVideoChange = (e) => {
        let videoUrl = e.target.value.trim();

        if (videoUrl.includes("watch?v=")) {
            videoUrl = videoUrl.replace("watch?v=", "embed/");
        }

        setSelectedVideoUrl(videoUrl);
    };


    return (
        <div className='start'>
            <div className='form-ques'>
                <div >
                    <Form onSubmit={handleSubmit} className='form-ques-LMS'>
                        <Row>
                            <div><p></p></div>

                            <Row md={12}>
                                <Col >
                                    <div className='topic' controlId='topic'>
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


                                            <Select
                                                isMulti
                                                options={getOptions()}
                                                value={selectedTopics}
                                                onChange={handleSelectionChange}
                                                styles={customStyles}
                                                closeMenuOnSelect={false}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="input-ques"
                                                placeholder="Enter new topic"
                                                value={manualTopic}
                                                onChange={(e) => {
                                                    setManualTopic(e.target.value);
                                                }}
                                            />
                                        )}



                                    </div>

                                </Col>
                                <Col >
                                    <div className='url' controlId='worksheet_link'>
                                        <label className='label6-ques'>WorkSheet Link</label><p></p>
                                        <input
                                            type="text"
                                            name="worksheet_link"
                                            className="input-ques"
                                            autoComplete="off"
                                            onChange={handleWorksheetChange}
                                        />
                                        {/* Live Preview for WorkSheet Link */}
                                    </div>
                                </Col>
                            </Row>


                        </Row>
                        <p></p>
                        <Row md={12}>
                            <Col>
                                <div className='actual' controlId='actual_content'>
                                    <label className='label6-ques'> Content Url</label><p></p>
                                    <input
                                        type="text"
                                        name="actual_content"
                                        className="input-ques"
                                        autoComplete="off"
                                        onChange={handleContentChange}

                                    />
                                </div>
                            </Col>


                            <Col >
                                <div className='url' controlId='content_url'>
                                    <label className='label6-ques'>Video URL</label><p></p>
                                    <input type="text" name="content_url" onChange={handleVideoChange} placeholder="" className="input-ques" autocomplete="off" />
                                </div>
                            </Col>
                        </Row>
                        <p></p>
                        <Row style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                            <div style={{ flex: 1, maxWidth: "20%", marginLeft: "-20px" }}>
                                {selectedDocEmbed && (
                                    <div
                                        className="embedded-document"
                                        dangerouslySetInnerHTML={{ __html: selectedDocEmbed }}
                                    />
                                )}
                            </div>

                            <div style={{ flex: 1, maxWidth: "20%", marginLeft: "3px" }}>
                                {selectedWorksheetEmbed && (
                                    <div
                                        className="embedded-document"
                                        dangerouslySetInnerHTML={{ __html: selectedWorksheetEmbed }}
                                    />
                                )}
                            </div>

                            <div style={{ flex: 1, maxWidth: "30%", marginRight: "-20px" }}>
                                {selectedVideoUrl && (
                                    <iframe
                                        src={selectedVideoUrl}
                                        width="100%"
                                        height="315"
                                        frameBorder="0"
                                        allowFullScreen
                                        allow="autoplay; encrypted-media"
                                        sandbox="allow-same-origin allow-scripts allow-presentation"
                                        title="Video Player"
                                    ></iframe>
                                )}
                            </div>
                        </Row>


                        <p><p></p></p>
                        <br />
                        <Row>
                            <Col>
                                <div className="button-container-lms">
                                    <button
                                        className="button-ques-save1 btn btn-secondary back-button-lms"
                                        style={{
                                            width: "100px",
                                            color: 'black',
                                            height: '50px',
                                            backgroundColor: '#F1A128',
                                            cursor: 'not-allowed'
                                        }}
                                        disabled
                                    >
                                        <img src={back} className='nextarrow' alt="Back" />
                                        <span className="button-text">Back</span>
                                    </button>

                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className='button-ques-save save-button-lms'
                                        style={{ width: "100px" }}
                                    >
                                        Save
                                    </button>

                                    <button

                                        className="button-ques-save1 btn btn-secondary back-button-lms"

                                        style={{
                                            width: "100px",
                                            color: 'black',
                                            height: '50px',
                                            backgroundColor: '#F1A128',
                                            cursor: 'not-allowed'
                                        }}
                                        disabled
                                    >
                                        <span className="button-text">Next</span>
                                        <img src={Nextarrow} className='nextarrow' alt="Next" />
                                    </button>
                                </div>
                            </Col>
                        </Row>
                        <p></p>
                    </Form>


                </div>
                <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

            </div><p style={{ height: "50px" }}></p>
            {/*  <Footer></Footer>*/}</div>
    );

};

export default FormModal;
