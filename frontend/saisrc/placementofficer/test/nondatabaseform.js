import React, { useEffect, useState, useRef, useContext } from 'react';
import { Col, Row, Form, Button, Modal } from 'react-bootstrap';
import Select from 'react-select';

import { useLocation } from 'react-router-dom';
import {
    addNonDatabaseTest_API,
    getcandidatesApi,
    getQuestionPaperApi,
    getrulesApi,
    addTestsApi,
    getTestsApi,
    gettesttypeApi,
    getSkilltypeApi,
    getqstntypeApi,
    getcollegeApi,
    getDistinct_Upload_timing_API,
    get_Batches_API,
    getClg_Group_API,
    getcollege_Test_Api
} from '../../api/endpoints';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext } from './context/testtypecontext';
import Footer from '../../footer/footer';
import ErrorModal from '../../components/auth/errormodal';
import { Link } from 'react-router-dom';
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomOption from './customoption';
import QuestionPaperMCQ from '../../components/questions/questionpapermcq';
import QuestionPaperCode from '../../components/questions/questionpapercode';
import { useTestQuesContext } from './context/testquescontext';

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
const NonDatabaseForm = ({ collegeName, username, institute, userRole }) => {
    console.log("College", collegeName)
    const navigate = useNavigate();
    const { selectedTestType } = useContext(TestTypeContext);
    const { selectedTestTypeCategory } = useContext(TestTypeCategoriesContext);
    const { selectedQuestionType } = useContext(QuestionTypeContext);
    const { selectedSkillType } = useContext(SkillTypeContext);
    const [camera, setCamera] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [rules, setRules] = useState([]);
    const location = useLocation();
    const [selectedRulesId, setSelectedRulesId] = useState(null);
    // const [needCandidateInfo, setNeedCandidateInfo] = useState(true);
    const defaultStartTime = new Date();
    defaultStartTime.setHours(defaultStartTime.getHours(), defaultStartTime.getMinutes(), 0, 0);

    // ✅ Set Default End Date (After 48 Hours)
    const defaultEndTime = new Date();
    defaultEndTime.setTime(defaultStartTime.getTime() + 48 * 60 * 60 * 1000); // Add 48 hours

    const [startDateTime, setStartDateTime] = useState(defaultStartTime);
    const [endDateTime, setEndDateTime] = useState(defaultEndTime);
    const [needCandidateInfo, setNeedCandidateInfo] = useState(true);
    const [durationType, setDurationType] = useState("QuestionTime");
    const { selectedFolder, questionPaperPass, questionIdPass } = location.state || {};

    console.log("✅ Received Folder:", selectedFolder);
    console.log("✅ Received Question Paper:", questionPaperPass);
    console.log("✅ Received Question Paper ID:", questionIdPass);

    const [duration, setDuration] = useState(0);
    const [isActualTest, setIsActualTest] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [colleges, setColleges] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState([]);
    const [uploadTime, setUploadTime] = useState([]);
    const [selectedUploadTime, setSelectedUploadTime] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testName, setTestName] = useState('');
    const [error, setError] = useState('');


    const [collegeGroups, setCollegeGroups] = useState([]); // Stores fetched groups for selected colleges
    const [selectedCollegeGroups, setSelectedCollegeGroups] = useState([]); // Stores selected college groups
    const [stuBatches, setStuBatches] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [formattedGroups, setFormattedGroups] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // Default: Today's date


    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        questionPaperCon,
        setQuestionPaperCon,
        topicCon,
        setTopicCon,
        subTopicCon,
        setSubtopicCon,
        isTestAddQues,
        setIsTestAddQues
    } = useTestQuesContext();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTestName(e.target.value);
        // Set state based on the input field's `name`
        switch (name) {
            case 'test_name':
                setTestName(value);
                // Check for '/' character only in the `test_name` field
                if (value.includes('/')) {
                    setError(" '/' is not allowed in Test Name");
                } else {
                    setError('');  // Clear the error if '/' is not found
                }
                break;

            default:
                break;
        }
    };
    useEffect(() => {
        getrulesApi()
            .then(data => {
                setRules(data.map(item => ({ value: item.id, label: item.rule_name })));

                // ✅ Find matching rule where rule_name matches selected test_type
                const matchedRule = data.find(rule => rule.rule_name === selectedTestType);

                if (matchedRule) {
                    setSelectedRulesId({ value: matchedRule.id, label: matchedRule.rule_name });
                } else {
                    setSelectedRulesId(null); // Reset if no match is found
                }
            })
            .catch(error => console.error('Error fetching rules:', error));
    }, [selectedTestType, selectedTestTypeCategory]); // ✅ Updates when test type or category changes



    // ✅ Second useEffect to set test name based on formattedGroups
    useEffect(() => {


        getcollege_Test_Api()
            .then(data => {
                console.log("College API Response:", data);
                const collegeOptions = data.map(item => ({ value: item.id, label: item.college, code: item.college_code }));
                setColleges([{ value: 'all', label: 'All' }, ...collegeOptions]);
            })
            .catch(error => console.error('Error fetching College:', error));



        const day = String(selectedDate.getDate()).padStart(2, '0');
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');

        const shortQuestionType = topicCon ? topicCon.substring(0, 3) : '';
        const shortSkillType = subTopicCon ? subTopicCon.substring(0, 3) : '';

        const formattedDate = `${day}-${month}`;

        const selectedCollegeCodes = colleges.find(c => c.value === institute);

        const selectedQuestionLabel = selectedQuestions
            ? (selectedQuestions ? selectedQuestions.label : "")
            : questionPaperPass;

        const testName = `${selectedCollegeCodes?.code}_${shortQuestionType}_${shortSkillType}_${selectedQuestionLabel}_${formattedDate}`;

        console.log("🚀 Generated Test Name:", testName);
        setTestName(testName);

    }, [institute, subTopicCon, topicCon, selectedQuestionType, selectedSkillType, selectedQuestions, selectedDate]);
    // ✅ Now selectedDate and formattedGroups are defined!


    const handleCloseError = () => {
        setShowError(false);
    };
    const handleNextbuttonClick = () => {
        // setShowMCQForm(true);
        navigate('/testschedule');
    };

    const handleGoBackClick = () => {
        // setShowMCQForm(false);
        navigate('/testaccess');
    };
    const handleDurationTypeChange = (event) => {
        const { value } = event.target;
        console.log("🚀 Duration Type Changed:", value);

        setDurationType(value);

        if (value === "QuestionTime" && selectedQuestions) {
            console.log("⏳ Fetching question duration for ID:", selectedQuestions.value);
            const matchingQuestion = questions.find(q => q.value === selectedQuestions.value);
            if (matchingQuestion) {
                console.log("✅ Found Question Duration:", matchingQuestion.duration_of_test);
                setDuration(matchingQuestion.duration_of_test || 0);
            } else {
                console.warn("⚠️ No matching question found!");
            }
        }
    };

    const formatDate1 = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strHours = hours.toString().padStart(2, '0');
        return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        const fetchCollegeData = async () => {
            try {
                if (!collegeName) {
                    console.warn('⚠️ College name is empty.');
                    return;
                }

                // Fetch college groups for the selected college
                const groupData = await getClg_Group_API(collegeName);
                console.log('📄 College Group API Response:', groupData);

                // Ensure response has college_code
                const formattedGroups = groupData.map(item => ({
                    value: item.id,
                    label: item.college_group,
                    collegeId: collegeName,
                    collegeCode: item.college_code, // Ensure we get college_code
                }));

                console.log('✅ Formatted Groups:', formattedGroups);
                setCollegeGroups(formattedGroups);

                // Fetch batches for the selected college
                const batchData = await get_Batches_API([collegeName], []);
                console.log('📌 Batches Data:', batchData);
                setStuBatches(batchData);

            } catch (error) {
                console.error('❌ Error fetching college data:', error);
            }
        };

        fetchCollegeData();
    }, [collegeName]);

    // ✅ Second useEffect to set test name based on formattedGroups
    useEffect(() => {
        if (!formattedGroups.length) return;

        const day = String(selectedDate.getDate()).padStart(2, '0');
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');

        const shortQuestionType = selectedQuestionType ? selectedQuestionType.substring(0, 3) : '';
        const shortSkillType = selectedSkillType ? selectedSkillType.substring(0, 3) : '';

        const formattedDate = `${day}-${month}`;

        const selectedCollegeCodes = formattedGroups
            .filter(group => selectedCollege.some(col => col.value === group.value))
            .map(group => group.collegeCode)
            .filter(Boolean)
            .join(',');

        const selectedQuestionLabel = questionPaperPass && questionIdPass
            ? questionPaperPass
            : (selectedQuestions ? selectedQuestions.label : "");



        const testName = `${selectedCollegeCodes}_${shortQuestionType}_${shortSkillType}_${selectedQuestionLabel}_${formattedDate}`;

        console.log("🚀 Generated Test Name:", testName);
        setTestName(testName);

    }, [formattedGroups, selectedCollege, selectedQuestionType, selectedSkillType, questionPaperPass, questionIdPass, selectedQuestions, selectedDate]);
    // ✅ Now selectedDate and formattedGroups are defined!




    const handleCollegeGroupsChange = async (selectedGroupOptions) => {
        console.log('selectedCollegeGroup: ', selectedGroupOptions);
        setSelectedCollegeGroups(selectedGroupOptions);

        // Extract the values and send them to the API
        const collegeIds = selectedGroupOptions.map(college => college.value);
        const collegeBatchesData = await get_Batches_API([collegeName], collegeIds);

        console.log(collegeBatchesData, "*****!"); // Verify response data structure
        setStuBatches(collegeBatchesData); // No need for `.flat()` if response is already flat
    };




    const handleBatches = (selectedBatches) => {
        console.log('selectedBatches: ', selectedBatches); // This will show the correct format
        setSelectedBatches(selectedBatches); // This should be correct if selectedBatches is in the expected format
    };




    useEffect(() => {

        // Fetch rules
        //getrulesApi()
        // .then(data => {
        // setRules(data.map(item => ({ value: item.id, label: item.rule_name })));
        // })
        //.catch(error => console.error('Error fetching rules:', error));

        // Fetch and filter question papers
        getQuestionPaperApi()
            .then(data => {
                // Log the raw data received from the API
                console.log('Raw question paper data:', data);

                // Map the data to transform it to the desired structure
                const mappedQuestions = data.map(item => {
                    const mappedItem = {
                        value: item.id,
                        label: item.question_paper_name,
                        test_type: item.test_type
                    };
                    // console.log('Mapped item:', mappedItem); // Log each mapped item
                    return mappedItem;
                });

                // Filter questions based on selectedTestType
                const filteredQuestions = mappedQuestions.filter(item => {
                    const isMatch = item.test_type === selectedTestType.trim();
                    console.log(`Checking if "${item.test_type}" matches "${selectedTestType.trim()}":`, isMatch);
                    return isMatch;
                });

                // Log filtered questions
                console.log('Filtered Questions:', filteredQuestions);

                // Set the filtered questions to state
                setQuestions(filteredQuestions);

                // If the duration type is 'QuestionTime', set the duration type
                if (durationType === 'QuestionTime') {
                    const durationData = data.map(item => ({
                        value: item.id,
                        label: item.duration_of_test
                    }));
                    console.log('Duration Data:', durationData); // Log duration data
                    setDurationType(durationData);
                }
            })
            .catch(error => {
                // Log any errors that occur during the API call
                console.error('Error fetching question paper:', error);
            });


    }, [collegeName, questionPaperCon, selectedTestType, selectedTestTypeCategory, selectedQuestionType, selectedSkillType, duration, selectedCollege]);
    
    
        // State to store college ID
        useEffect(() => {
            getQuestionPaperApi()
                .then(data => {
                    console.log("📄 Full Question Papers Data:", data);
    
                    const filteredQuestions = data.map(item => ({
                        value: item.id,  // Ensure `id` is used for matching
                        label: item.question_paper_name || "Unnamed Paper",
                        duration_of_test: item.duration_of_test || 0,
                        test_type: item.test_type,
                        folder_name: item.folder_name,
                    }));
    
                    console.log("🛠 Filtered Questions List:", filteredQuestions);
                    setQuestions(filteredQuestions);
    
                    if (questionIdPass) {
                        const matchedQuestion = filteredQuestions.find(q => q.value === questionIdPass);
                        console.log("🔎 Auto-selected question:", matchedQuestion);
    
                        if (matchedQuestion) {
                            setSelectedQuestions(matchedQuestion);
                            setDuration(matchedQuestion.duration_of_test || 0);
                        }
                    }
    
                    
                    if (questionPaperCon) {
                        console.log('questionPaperCon: ', questionPaperCon);
                        const matchedQuestion = filteredQuestions.find(q => q.label === questionPaperCon);
                        console.log("🔎 Auto-selected question:", matchedQuestion);
    
                        if (matchedQuestion) {
                            setSelectedQuestions(matchedQuestion);
                            setDuration(matchedQuestion.duration_of_test || 0);
                        }
                    }
                })
                .catch(error => console.error("❌ Error fetching question paper:", error));
        }, [selectedTestType, questionPaperCon, username, selectedFolder, questionIdPass]);
    
    
    // Fetch college data when collegeName changes
    useEffect(() => {
        getcollegeApi().then(data => {
            // Filter colleges based on collegeName
            const filteredColleges = data
                .filter(item => item.college.toLowerCase().includes(collegeName.toLowerCase()))
                .map(item => ({ value: item.id, label: item.college }));

            console.log('Filtered Colleges:', filteredColleges); // Log filtered colleges

            // Set the filtered colleges in state
            setColleges(filteredColleges);

            // If the filtered result has at least one item, set the first result as the selectedCollege
            if (filteredColleges.length > 0) {
                console.log('Setting selectedCollege:', filteredColleges[0]);
                setSelectedCollege(filteredColleges[0]);
            } else {
                console.warn('No matching college found for the name:', collegeName);
                setSelectedCollege(null); // If no college matches, set selectedCollege to null
            }
        }).catch(error => {
            console.error('Error fetching College:', error);
        });
    }, [collegeName]);

    // You can still log the selectedCollege as requested
    console.log('Initial selectedCollege:', selectedCollege);


    // Fetch upload times when a college is selected
    useEffect(() => {
        getDistinct_Upload_timing_API(institute)
            .then(data => {
                console.log('API Response:', data); // Log the API response

                if (data.distinct_dtm_uploads.length === 0) {
                    console.warn('No upload times available for this college.'); // Log a warning if no upload times
                    // setErrorMessage('No upload times available for the selected college.');
                    // setShowError(true);
                } else {
                    const formattedUploadTimes = data.distinct_dtm_uploads.map(item => ({
                        value: item,
                        label: formatDate1(item)
                    }));

                    console.log('Formatted Upload Times:', formattedUploadTimes); // Log the formatted upload times
                    setUploadTime(formattedUploadTimes); // Set the upload times state
                }
            })
            .catch(error => {
                console.error('Error fetching Upload Time:', error); // Log any errors
            });
    }, [institute]);

  
    const handleSubmit = async (e) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
       
        e.preventDefault();
        if (testName.includes('/')) {
            setErrorMessage("Test name not allowed to include '/' .");
            setShowError(true);
            return;  // Exit the function to prevent submission
        }
        try {
            const formData = new FormData(e.target);
            const [qstnTypes, skillTypes, testTypes, rulesData] = await Promise.all([
                getqstntypeApi(),
                getSkilltypeApi(),
                gettesttypeApi(),
                getrulesApi()
            ]);
            //const [qstnTypes, skillTypes] = await Promise.all([getqstntypeApi(), getSkilltypeApi()]);
            // const testTypes = await gettesttypeApi();

            console.log("✅ Dropdown data fetched successfully");

            console.log("🔎 Searching for selected values...");
            const questionTypeData = qstnTypes.find(item => item.question_type === selectedQuestionType);
            const skillTypeData = skillTypes.find(item => item.skill_type === selectedSkillType);
            //  const testtypeData = testTypes.find(item => item.test_type === selectedTestType && item.test_type_categories === selectedTestTypeCategory);
            const testtypeData = testTypes?.find(item => item.test_type === selectedTestType && item.test_type_categories === selectedTestTypeCategory) || null;
            console.log("📌 Found Question Type Data:", questionTypeData);
            console.log("📌 Found Skill Type Data:", skillTypeData);
            console.log("📌 Found Test Type Data:", testtypeData);

            const questypeID = questionTypeData ? questionTypeData.id : null;
            const skillTypeID = skillTypeData ? skillTypeData.id : null;
            const testTypeID = testtypeData ? testtypeData.id : null;

            console.log("🆔 Question Type ID:", questypeID);
            console.log("🆔 Skill Type ID:", skillTypeID);
            console.log("🆔 Test Type ID:", testTypeID);

            const matchedRule = rulesData.find(rule => rule.rule_name === selectedTestType);
            const ruleID = matchedRule ? matchedRule.id : null;

            const testMaster = {
                test_name: formData.get('test_name'),
                test_type_id: testTypeID,
                question_type_id: questypeID,
                skill_type_id: skillTypeID,
            };

            console.log('testMaster:', testMaster);

            if (!testTypeID || !questypeID) {
                console.error('One or more IDs are null. Aborting submission.');
                if (!testTypeID) console.error('testTypeID is null');
                if (!questypeID) console.error('questypeID is null');
                if (!skillTypeID) console.error('skillTypeID is null');
                return;
            }

            const existingTests = await getTestsApi();
            const testExists = existingTests.some(test => test.test_name === testMaster.test_name);

            if (testExists) {
                 // 🔵 Remove loading spinner
                setIsSubmitting(false);
                setErrorMessage("Test name already exists. Please choose a different test name.");
                setShowError(true);
                return;
            }

            const year = formData.get('year');

            const filteredCollegesGroup = selectedCollegeGroups.filter(college => college.value !== 'all');
            const filteredBatches = selectedBatches.filter(batch => batch.value !== 'all');

            console.log('filteredBatches: ', filteredBatches);

            const clgName = collegeName ? [collegeName] : [];
            const question_id_id = questionIdPass || selectedQuestions?.value || null;
            console.log("selectedQuestions:", selectedQuestions);
            console.log("question_id_id:", question_id_id);
            console.log("questions:", questions);

            console.log('Resolved question_id_id:', question_id_id);
            let questionDuration = 0;
            if (durationType === "QuestionTime") {
                const matchingQuestion = questions.find(q => q.value === question_id_id);
                questionDuration = matchingQuestion ? matchingQuestion.duration_of_test : 0;
                console.log("🕒 Fetched Question Time Duration:", questionDuration);
            } else {
                // Calculate duration if Start & End Time is used
                const durationMins = Math.ceil((new Date(endDateTime) - new Date(startDateTime)) / (1000 * 60));
                questionDuration = durationMins;
                console.log("⏳ Start & End Time Duration:", questionDuration);
            }

            let durationValue = 0;
            const createdBy = typeof username === "object" && username.username ? username.username : "System"; // Ensure string
            console.log("Created By (Final):", createdBy); // Debugging


            const clgID = institute ? [institute] : []; // Ensure clgID is always a list

            console.log('CLG ID: ', clgID); // Logs correctly as a list

            const pracOnlineTest = {
                college_id: clgID, // This ensures it remains a list
                college_name: clgName,
                created_by: createdBy,
                college_group_id: filteredCollegesGroup.map(college => college.value),
                batch_no: filteredBatches.map(batch => batch.value),
                test_name: formData.get('test_name'),
                // question_id: selectedQuestions.value,
                question_id: question_id_id,
                dtm_start: moment(startDateTime).format('YYYY-MM-DD HH:mm:ss'),
                dtm_end: moment(endDateTime).format('YYYY-MM-DD HH:mm:ss'),
                college_id: selectedCollege.value,
                dtm_upload: selectedUploadTime.value || null,
                is_camera_on: camera,
                is_actual_test: isActualTest,
                
                duration: questionDuration,
                duration_type: "QuestionTime",
                need_candidate_info: true,
                rules_id: ruleID,
                test_type_id: testTypeID,
                question_type_id: questypeID,
                skill_type_id: skillTypeID,
            };

            const submitForm = async (durationN) => {
                pracOnlineTest.duration = durationN;


                const clgID = institute ? [institute] : [];
                pracOnlineTest.college_id = clgID;


                console.log('PracOnlineTest:', pracOnlineTest);

                try {
                    await addNonDatabaseTest_API(pracOnlineTest);
                    setErrorMessage("Test Assigned successfully");
                    setShowError(true);


                    setSelectedRulesId(null);
                    setEndDateTime(null);
                    setStartDateTime(null);
                    e.target.reset();
                    navigate('/test/test-schedules/');
                  
                    
                } catch (error) {
                    console.error("An error occurred while assigning the test:", error);
                    setErrorMessage("An error occurred while assigning the test. Please try again later.");
                    setShowError(true);
                  
                }
            };
            if (durationType === 'Start&EndTime') {
                const dtm_start = formData.get('dtm_start');
                const dtm_end = formData.get('dtm_end');
                console.log('dtm_start: ', dtm_start);
                console.log('dtm_end: ', dtm_end);

                // Define a function to parse the date string in the expected format
                const parseDate = (dateStr) => {
                    const [date, time] = dateStr.split(', ');
                    const [day, month, year] = date.split('-');
                    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/).slice(1);
                    let hours24 = parseInt(hours, 10);

                    // Convert to 24-hour format
                    if (period === 'PM' && hours24 !== 12) {
                        hours24 += 12;
                    } else if (period === 'AM' && hours24 === 12) {
                        hours24 = 0;
                    }

                    return new Date(year, month - 1, day, hours24, minutes);
                };

                // Use the function to parse the start and end dates
                const start = parseDate(dtm_start);
                const end = parseDate(dtm_end);
                console.log('start: ', start);
                console.log('end: ', end);

                // Calculate duration in minutes, rounded up
                const durations = Math.ceil((end - start) / (1000 * 60));
                console.log('Start&End Duration: ', durations);

                submitForm(durations);
            } else if (durationType === 'QuestionTime') {
                getQuestionPaperApi()
                    .then(data => {
                        console.log("Data: ", data);

                        const matchingDuration = data.find(dur =>
                            dur.id === selectedQuestions.value
                        );
                        console.log('matching durations: ', matchingDuration);
                        console.log('selectedQuestions.value: ', selectedQuestions.value);

                        durationValue = matchingDuration ? matchingDuration.duration_of_test : 0;
                        console.log('matchingDuration.duration_of_test: ', matchingDuration.duration_of_test);
                        console.log('question Time Duration: ', durationValue);

                        submitForm(durationValue);
                    })
                    .catch(error => {
                        console.error("Failed to fetch question paper data", error);
                        setIsSubmitting(false);
                        setErrorMessage("Failed to fetch question paper data. Check console for details.");
                        setShowError(true);
                        // alert("Failed to fetch question paper data. Check console for details.");
                    });
            }
        } catch (error) {
            console.error("Error during submission:", error);
        }
        setIsSubmitting(false);

    };

    const handleModalClose = () => setIsModalOpen(false);
    const handleModalOpen = () => {
        setIsModalOpen(true);
        setIsTestAddQues(true);
    };



    const handleCheckboxChange = (checked, setter) => {
        setter(checked);
    };

    return (
        <div>
            <div className='form-ques-nondb-off'>
               
                <div>
                    <div className='form-ques'>
                        <Row>
                            <Col>
                                <form onSubmit={handleSubmit}>
                                    <br />
                                    <Row md={12}>
                                        <Col >
                                            <div className='TestName' controlId='test_name' >
                                                <label className='label5-ques'>Test Name**</label><p></p>
                                                <input type="text" className='input-ques' autocomplete="off" name="test_name" value={testName}
                                                    onChange={handleInputChange} required placeholder="" />
                                                {/* Display error message if there is an error */}
                                                {error && <p style={{ color: 'white' }}>{error}</p>}

                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='QuestionName-NDB' controlId='question_name'>
                                                <label className='label5-ques'>Question Name**</label>
                                                <p></p>
                                                <Select
                                                    style={{ width: "600px" }}
                                                    options={questions}
                                                    value={selectedQuestions || null} // ✅ Prevents null issue
                                                    onChange={(selectedOption) => {
                                                        console.log("✅ User Selected Question:", selectedOption);
                                                        setSelectedQuestions(selectedOption);
                                                        setDuration(selectedOption?.duration_of_test || 0); // ✅ Ensure duration updates correctly
                                                    }}
                                                    placeholder="Select Question Name"
                                                    isClearable // ✅ Allows clearing the selection
                                                    styles={customStyles}
                                                />


                                                {/* Add + Icon */}
                                                <button
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        color: "#fff",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                        marginLeft: "10px",
                                                        fontWeight: "bold",
                                                        textDecoration: "underline"
                                                    }}
                                                    onClick={handleModalOpen}
                                                >
                                                    Add Question
                                                </button>

                                            </div>

                                            {/* Modal for Question Paper */}
                                            <Modal show={isModalOpen} onHide={handleModalClose} size="lg" centered>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Question Paper</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    {selectedTestType === "MCQ Test" && (
                                                        <QuestionPaperMCQ userRole={userRole} collegeName={collegeName} />
                                                    )}
                                                    {selectedTestType === "Coding Test" && <QuestionPaperCode userRole={userRole} collegeName={collegeName} />}
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button variant="secondary" onClick={handleModalClose}>
                                                        Close
                                                    </Button>
                                                </Modal.Footer>
                                            </Modal>

                                        </Col>

                                    </Row>
                                    <p></p>
                                    <Row md={12}>
                                        <Col >
                                            <div >
                                                <label className='label5-ques'>Start Date**</label><p></p>

                                                <DatePicker
                                                    name='dtm_start'
                                                    selected={startDateTime}
                                                    styles={customStyles}
                                                    onChange={(date) => setStartDateTime(date)}
                                                    showTimeSelect
                                                    timeFormat="hh:mm aa"
                                                    timeIntervals={15}
                                                    dateFormat="dd-MM-yyyy, h:mm aa"
                                                    timeCaption="Time"
                                                    className='input-date-custom'
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>
                                        </Col>
                                        <Col >
                                            <div >
                                                <label className='label5-ques'>End Date**</label><p></p>
                                                <DatePicker
                                                    name='dtm_end'
                                                    selected={endDateTime}
                                                    onChange={(date) => setEndDateTime(date)}
                                                    showTimeSelect
                                                    timeFormat="hh:mm aa"
                                                    timeIntervals={15}
                                                    dateFormat="dd-MM-yyyy, h:mm aa"
                                                    timeCaption="Time"
                                                    className='input-date-custom'
                                                    styles={customStyles}
                                                    minDate={startDateTime} // Prevent selecting dates before start date
                                                    disabled={!startDateTime}
                                                    autoComplete="off"
                                                    required
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    {/*}
                                    <Row>

                                        <Col>
                                            <div controlId="instituteName" >
                                                <label className="label5-ques">College Branch</label> <p></p>
                                                <div >
                                                    <Select
                                                        isMulti
                                                        options={collegeGroups}
                                                        value={selectedCollegeGroups}
                                                        onChange={handleCollegeGroupsChange}
                                                        placeholder="Select College Group"
                                                        styles={customStyles}
                                                        components={{ Option: CustomOption }}
                                                        closeMenuOnSelect={false}
                                                    />
                                                </div>
                                            </div>
                                        </Col>

                                        <Col>
                                            <div controlId="instituteName">
                                                <label className="label5-ques">Batches</label>
                                                <p></p>
                                                <div>
                                                    <Select
                                                        isMulti
                                                        options={stuBatches.map(batch => ({ value: batch.batch_no, label: batch.batch_no }))}
                                                        value={selectedBatches} // Use selectedBatches directly here
                                                        onChange={handleBatches}
                                                        placeholder="Select Batches"
                                                        styles={customStyles}
                                                        components={{ Option: CustomOption }}
                                                        closeMenuOnSelect={false}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
*/}

                                    <p></p>



                                    <Row md={12}>
                                        {(selectedTestTypeCategory === 'Mock/Interview') && (

                                            <Col>
                                                <div controlId='is_camera_on' style={{ marginLeft: "-198px" }}>
                                                    <label className='label5-ques' style={{ marginLeft: "200px" }}>Is Camera ON</label><p></p>
                                                    <div style={{ marginLeft: "200px" }}>
                                                        <input type="checkbox" id="is_camera_on_checkbox" checked={camera} onChange={(e) => handleCheckboxChange(e.target.checked, setCamera)} />
                                                        <label htmlFor="is_camera_on_checkbox"></label>
                                                    </div>
                                                </div>
                                            </Col>
                                        )}
                                    </Row><p></p>
                                    <Row md={12}>

                                        <Col>
                                            <div controlId="uploadTime" >
                                                <label className="label5-ques">Upload Timing</label> <p></p>
                                                <div >
                                                    <Select
                                                        options={uploadTime}
                                                        value={selectedUploadTime}
                                                        // onChange={setSelectedUploadTime}
                                                        onChange={(value) => {
                                                            console.log('Selected Upload Time:', value); // Add this line to check if it's being set
                                                            setSelectedUploadTime(value);
                                                        }}
                                                        placeholder="Select timing.."
                                                        className='timing'
                                                        styles={customStyles}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='RulesName-non' controlId='rule_id' >
                                                <label className='label5-ques' >Rule Name**</label><p></p>
                                                <Select
                                                    options={rules}
                                                    value={selectedRulesId}
                                                    onChange={setSelectedRulesId}
                                                    placeholder="Select rule"
                                                    className='opt'
                                                    styles={customStyles}
                                                />

                                            </div>
                                        </Col>

                                    </Row>
                                    <p></p>
                                    <Row md={12}>
                                        <Col>
                                            <Form.Group controlId="duration">
                                                <label className="label5-ques">Duration**</label>
                                                <p></p>
                                                <div className="custom-radio-grouping" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                    <label className="custom-radios" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="duration"
                                                            value="QuestionTime"
                                                            onChange={handleDurationTypeChange}
                                                            checked={durationType === "QuestionTime"}  // ✅ Always checked by default
                                                            required
                                                        />
                                                        <span className="custom-radio-labels" style={{ marginLeft: "10px", color: "white" }}>QuestionTime</span>
                                                    </label>

                                                    <label className="custom-radios" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="duration"
                                                            value="Start&EndTime"
                                                            onChange={handleDurationTypeChange}
                                                            checked={durationType === "Start&EndTime"}  // ✅ Changes only if selected
                                                            required
                                                        />
                                                        <span className="custom-radio-labels" style={{ marginLeft: "10px", color: "white" }}>Start&End Time</span>
                                                    </label>
                                                </div>
                                            </Form.Group>
                                        </Col>

                                        <Col >
                                            <div controlId='need_candidate_info' >
                                                <label className='label5-ques'>Need Candidate Info**</label><p></p>
                                                <div>
                                                    <input type="checkbox" id="need_candidate_info_checkbox" checked={needCandidateInfo} style={{ accentColor: 'orange' }} />
                                                    <label htmlFor="need_candidate_info_checkbox"></label>
                                                </div>
                                            </div>
                                        </Col>

                                    </Row>

                                    <p style={{ height: "50px" }}></p><p></p>
                                    <Row>
                                        <Col>
                                            <div className="button-container-lms">
                                                <button onClick={handleGoBackClick} style={{ float: "left", width: "100px", }} className="button-ques-save  back-button-lms">
                                                    <img src={Back} className='nextarrow'></img> <span className="button-text">Back</span>

                                                </button>
                                                <button type="submit" disabled={isSubmitting} className="button-ques-save save-button-lms" style={{ width: "100px", }}>
                                                    Save
                                                </button>

                                                <button onClick={handleNextbuttonClick} className="button-ques-back btn btn-secondary back-button-lms"
                                                    style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128', cursor: 'not-allowed' }}
                                                    disabled >
                                                    <span className="button-text">Next</span><img src={Next} className='nextarrow'></img>

                                                </button>


                                            </div>

                                        </Col>
                                    </Row>   </form>

                            </Col>
                        </Row>
                        <p></p>


                    </div>
                </div>
            </div><ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

        </div>
    );
};

export default NonDatabaseForm;