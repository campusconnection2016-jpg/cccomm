import React, { useEffect, useState, useRef, useContext } from 'react';
import { Col, Row, Form, Button, Modal } from 'react-bootstrap';
import Select, { components } from 'react-select';
import CustomOption from './customoption';
import {
    addTestcandidateCORPORATEApiBatch,
    getTestsApi,
    getrulesApi,
    getCorporate_Collegeid_API,

    getQuestionPaperApi,
    addTestsApi,
    gettesttypeApi,
    getSkilltypeApi,
    getqstntypeApi,
    getCorporate_logo_API,
    get_department_info_Test_API,
    getClg_Group_API,
    get_Batches_API,
    get_Batches_API_COR,
    QuestionsExportAPI,
    QuestionsExportAPI_COR,
    QuestionsExportAPI_COR_CODE
} from '../../api/endpoints';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext } from './context/testtypecontext';
//import './Test.css';
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
import ErrorModal from '../../components/auth/errormodal'
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "react-datetime/css/react-datetime.css";
import { Link } from 'react-router-dom';
import '../../styles/global.css'
import { useNavigate } from 'react-router-dom';

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
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#39444e',
        '@media (max-width: 768px)': { // Adjust for mobile devices
            fontSize: '12px' // Smaller font size
        }
    })
};
const TestaccessForm = ({ onNextButtonClick, username }) => {

    const { selectedTestType } = useContext(TestTypeContext);
    const { selectedTestTypeCategory } = useContext(TestTypeCategoriesContext);
    const { selectedQuestionType } = useContext(QuestionTypeContext);
    const { selectedSkillType } = useContext(SkillTypeContext);
    const navigate = useNavigate();

    const selectOptionRef = useRef(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleCloseError = () => {
        setShowError(false);
    };
    const [tests, setTests] = useState([]);
    // const [batchNo, setBatchNo] = useState([]);
    const [college, setCollege] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);

    const [rules, setRules] = useState([]);
    const [selectedRulesId, setSelectedRulesId] = useState(null);

    const [selectedCollege, setSelectedCollege] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isActualTest, setIsActualTest] = useState(false);
    const [needCandidateInfo, setNeedCandidateInfo] = useState(false);
    const [selectedColleges, setSelectedColleges] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [camera, setCamera] = useState(false);
    const defaultStartTime = new Date();
    defaultStartTime.setHours(8, 0, 0, 0); // 8:00 AM

    const defaultEndTime = new Date();
    defaultEndTime.setHours(18, 0, 0, 0); // 6:00 PM
    const [startDateTime, setStartDateTime] = useState(defaultStartTime);
    const [endDateTime, setEndDateTime] = useState(defaultEndTime);
    const [durationType, setDurationType] = useState('');
    const [duration, setDuration] = useState(0);
    const years = [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
    ];
    const [selectedYear, setSelectedYear] = useState(null);
    const [questionTime, setQuestionTime] = useState(null);

    const [testName, setTestName] = useState('');
    const [error, setError] = useState('');
    const [collegeGroups, setCollegeGroups] = useState([]); // Stores fetched groups for selected colleges
    const [selectedCollegeGroups, setSelectedCollegeGroups] = useState([]); // Stores selected college groups
    const [stuBatches, setStuBatches] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [Cemail, setCemail] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;

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
            case 'company_name':
                setCompanyName(value);
                break;
            case 'company_email':
                setCemail(value);
                break;
            default:
                break;
        }
    };
    const handleDurationTypeChange = (event) => {
        const { value } = event.target;
        setDurationType(value);

        // console.log('Duration type: ', value);
    };

    const [colleges, setColleges] = useState([]); // For storing fetched college IDs
    const [collegeOptions, setCollegeOptions] = useState([]); // Dropdown options


    const [numOfQuestions, setNumOfQuestions] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleInputChangeNo = (e) => {
        setNumOfQuestions(e.target.value);
    };

    const handleKeyPress = (e) => {
        console.log('selectedTestType: ', selectedTestType);

        if (e.key === 'Enter' && numOfQuestions) {
            setShowModal(true); // Show the modal when Enter is pressed
        }
    };

    const handleGoButtonClick = () => {
        if (numOfQuestions) {
            setShowModal(true); // Show the modal when the button is clicked
        }
    };



    useEffect(() => {
        if (username) {
            fetchCollegesAndReports();
        }
    }, [username, collegeOptions]);

    const fetchCollegesAndReports = async () => {
        try {
            // console.log("Step 1: Fetching colleges for username:", username);

            // Step 2: Fetch corporate data
            const corporateData = await getCorporate_logo_API(username);
            // console.log("Step 2: Corporate data fetched:", corporateData);

            const fetchedColleges = [];
            if (Array.isArray(corporateData)) {
                corporateData.forEach(data => {
                    if (data.user_name === username && data.colleges && Array.isArray(data.colleges)) {
                        data.colleges.forEach(college => {
                            if (college.id) {
                                fetchedColleges.push(college.id);
                            }
                        });
                    }
                });
            }
            //console.log("Step 3: Fetched college IDs:", fetchedColleges);

            if (fetchedColleges.length > 0) {
                setColleges(fetchedColleges);

                // Step 4: Fetch colleges using the retrieved college IDs
                const collegeIDsString = fetchedColleges.join(','); // Convert the IDs into a comma-separated string
                //console.log("Step 4: Fetching colleges for IDs:", collegeIDsString);

                const testData = await getCorporate_Collegeid_API(collegeIDsString);
                // console.log("Step 4: Colleges fetched from API:", testData);

                // Step 5: Map the fetched colleges into dropdown options
                const collegeOptions = testData.map(item => ({
                    value: item.college,
                    label: item.college || item.college_id,
                }));
                //console.log("Step 5: Mapped college options:", collegeOptions);

                setCollegeOptions([{ value: 'all', label: 'All' }, ...collegeOptions]);
            } else {
                // console.warn("Step 3: No colleges found for the username.");
            }
        } catch (error) {
            //console.error("Error fetching data:", error);
            setShowError(true);
            setErrorMessage("An error occurred while fetching data.");
        }
    };


    useEffect(() => {
        /* getCorporate_Collegeid_API()
             .then(data => {
                 const collegeOptions = data.map(item => ({ value: item.college, label: item.college }));
                 setCollege([{ value: 'all', label: 'All' }, ...collegeOptions]);
             })
             .catch(error => console.error('Error fetching College:', error));
 */

        getrulesApi()
            .then(data => {
                setRules(data.map(item => ({ value: item.id, label: item.rule_name })));
            })
            .catch(error => console.error('Error fetching rules:', error));

        getQuestionPaperApi()
            .then(data => {
                // Map and filter the data
                const filteredQuestions = data
                    .map(item => {
                        return { value: item.id, label: item.question_paper_name, test_type: item.test_type };
                    })
                    .filter(item => {
                        return item.test_type === selectedTestType.trim();
                    });

                // setQuestions(filteredQuestions);
                console.log(filteredQuestions);

                // Only set duration type if it's 'QuestionTime'
                if (durationType === 'QuestionTime') {
                    setDurationType(data.map(item => ({ value: item.id, label: item.duration_of_test })));
                }
            })
            .catch(error => console.error('Error fetching question paper:', error));


    }, [selectedTestType, selectedTestTypeCategory, selectedQuestionType, selectedSkillType, duration]);


    // Fetch department data when selectedColleges changes
    useEffect(() => {
        const filteredColleges = selectedColleges.filter(college => college.value !== 'all');
        const collegeIds = filteredColleges.map(college => college.value);
        console.log('College IDs:', collegeIds);

        get_department_info_Test_API(collegeIds)
            .then(data => {
                const departmentOptions = data.map(item => ({
                    value: item.department_id_value,
                    label: item.department_name_value
                }));
                setDepartments([{ value: 'all', label: 'All' }, ...departmentOptions]);
                return get_Batches_API_COR(collegeIds, null, null, null);
            })
            .then(data => {
                const batchOptions = data.map(item => ({ value: item.batch_name, label: item.batch_name })); // Adjust if necessary
                console.log('batchOptions: ', batchOptions);
                setStuBatches(batchOptions);
                //  console.log('Processed Batch Data:', batchOptions);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [selectedColleges]);





    const handleCheckboxChange = (checked, setter) => {
        setter(checked);
    };




    const handleCollegeChange = async (selectedOptions) => {
        if (selectedOptions.some(option => option.value === 'all')) {
            setSelectedColleges(college.filter(option => option.value !== 'all'));
        } else {
            setSelectedColleges(selectedOptions);
        }

        // Fetch college groups for each selected college
        const collegeGroupsData = await Promise.all(
            selectedOptions.map(async (college) => {
                try {
                    const data = await getClg_Group_API(college.label); // Fetch college groups
                    return data.map(item => ({
                        value: item.id,
                        label: item.college_group,
                        collegeId: college.value
                    }));
                } catch (error) {
                    console.error(`Failed to fetch groups for ${college.label}:`, error);
                    return []; // Return an empty array on failure
                }
            })
        );

        // Flatten the results to a single array and set it in state
        setCollegeGroups(collegeGroupsData.flat());
    };



    const handleCollegeGroupsChange = async (selectedGroupOptions) => {
        setSelectedCollegeGroups(selectedGroupOptions);

        const collegeIds = selectedGroupOptions.map((college) => college.value);
        try {
            const data = await get_Batches_API_COR(null, collegeIds, null, null);
            const batchOptions = data.map((item) => ({ value: item.batch_name, label: item.batch_name })); // Adjusted mapping
            setStuBatches(batchOptions);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const handleDepartmentsChange = async (selectedOptions) => {
        if (selectedOptions.some((option) => option.value === 'all')) {
            setSelectedDepartments(departments.filter((option) => option.value !== 'all'));
        } else {
            setSelectedDepartments(selectedOptions);
        }

        const departmentIds = selectedOptions.map((option) => option.value); // Ensure correct values
        try {
            const data = await get_Batches_API_COR(null, null, departmentIds, null);
            const batchOptions = data.map((item) => ({ value: item.batch_name, label: item.batch_name })); // Adjusted mapping
            setStuBatches(batchOptions);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const handleYearsChange = async (selectedOption) => {
        setSelectedYear(selectedOption);

        try {
            const data = await get_Batches_API_COR(null, null, null, selectedOption.value);
            const batchOptions = data.map((item) => ({ value: item.batch_name, label: item.batch_name }));
            setStuBatches(batchOptions);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };


    const handleBatches = (selectedBatches) => {
        // console.log('selectedBatches: ', selectedBatches); // Check the structure here
        // If selectedBatches is null, default to an empty array to avoid errors
        const batchValues = selectedBatches ? selectedBatches.map(batch => batch.value) : [];
        setSelectedBatches(batchValues);
    };



    const handleSubmitol = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const testName = formData.get('test_name');

        // Check if the test name contains '/'
        if (testName.includes('/')) {
            setErrorMessage("Test name not allowed to include '/' .");
            setShowError(true);
            return;  // Exit the function to prevent submission
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const [qstnTypes, skillTypes] = await Promise.all([getqstntypeApi(), getSkilltypeApi()]);
            const testTypes = await gettesttypeApi();


            const questionTypeData = qstnTypes.find(item => item.question_type === selectedQuestionType);
            const skillTypeData = skillTypes.find(item => item.skill_type === selectedSkillType);
            const testtypeData = testTypes.find(item => item.test_type === selectedTestType && item.test_type_categories === selectedTestTypeCategory);


            const questypeID = questionTypeData ? questionTypeData.id : null;
            const skillTypeID = skillTypeData ? skillTypeData.id : null;
            const testTypeID = testtypeData ? testtypeData.id : null;

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
                //   if (!skillTypeID) console.error('skillTypeID is null');
                return;
            }

            const existingTests = await getTestsApi();
            const testExists = existingTests.some(test => test.test_name === testMaster.test_name);

            if (testExists) {
                setErrorMessage("Test name already exists. Please choose a different test name.");
                setShowError(true);
                return;
            }

            const year = formData.get('year');
            const filteredColleges = selectedColleges.filter(college => college.value !== 'all');
            const filteredDepartments = selectedDepartments.filter(department => department.value !== 'all');

            const filteredCollegesGroup = selectedCollegeGroups.filter(college => college.value !== 'all');
            const filteredBatches = selectedBatches
                .filter(batch => batch !== 'all')
                .map(batch => ({ value: batch, label: batch })); // Ensure format consistency

            console.log('filteredBatches: ', filteredBatches);

            const pracOnlineTest = {
                college_name: filteredColleges.map(college => college.label),
                college_group_id: filteredCollegesGroup.map(college => college.value),
                batch_no: filteredBatches.map(batch => batch.value),
                department_id: filteredDepartments.map(department => department.value),
                year: selectedYear.value,
                test_name: formData.get('test_name'),
                question_id: selectedQuestions.value,
                dtm_start: moment(startDateTime).format('YYYY-MM-DD HH:mm:ss'),
                dtm_end: moment(endDateTime).format('YYYY-MM-DD HH:mm:ss'),
                duration: 0, // Will be updated later
                duration_type: durationType,
                rules_id: selectedRulesId.value,
                need_candidate_info: needCandidateInfo,
                test_type_id: testTypeID,
                question_type_id: questypeID,
                skill_type_id: skillTypeID,
                company_name: formData.get('company_name') || '',
                company_email: formData.get('company_email') || '',
                is_camera_on: camera,

            };

            const submitForm = async (durationN) => {
                pracOnlineTest.duration = durationN;

                console.log('PracOnlineTest:', pracOnlineTest);

                try {
                    await addTestcandidateCORPORATEApiBatch(pracOnlineTest);
                    setErrorMessage("Test Assigned successfully");
                    setShowError(true);

                    // Reset form and states after submission
                    setSelectedCollege(null);
                    setSelectedDepartments([]);
                    setSelectedColleges([]);
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
                finally {
                    setIsSubmitting(false); // Re-enable the button after processing
                }
            };

            if (durationType === 'Start&EndTime') {
                const parseDate = (dateStr) => {
                    const [date, time] = dateStr.split(', ');
                    const [day, month, year] = date.split('-');
                    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/).slice(1);
                    let hours24 = parseInt(hours, 10);

                    if (period === 'PM' && hours24 !== 12) hours24 += 12;
                    if (period === 'AM' && hours24 === 12) hours24 = 0;

                    return new Date(year, month - 1, day, hours24, minutes);
                };

                const start = parseDate(formData.get('dtm_start'));
                const end = parseDate(formData.get('dtm_end'));
                const durations = Math.ceil((end - start) / (1000 * 60)); // Duration in minutes, rounded up
                console.log('Start&End Duration:', durations);
                await submitForm(durations);
            } else if (durationType === 'QuestionTime') {
                const data = await getQuestionPaperApi();
                const matchingDuration = data.find(dur => dur.id === selectedQuestions.value);
                const durationValue = matchingDuration ? matchingDuration.duration_of_test : 0;
                console.log('Question Time Duration:', durationValue);
                await submitForm(durationValue);
            }
        } catch (error) {
            console.error("Error during submission:", error);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const testName = formData.get('test_name');

        // Check if the test name contains '/'
        if (testName.includes('/')) {
            setErrorMessage("Test name not allowed to include '/' .");
            setShowError(true);
            return; // Exit the function to prevent submission
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const [qstnTypes, skillTypes] = await Promise.all([getqstntypeApi(), getSkilltypeApi()]);
            const testTypes = await gettesttypeApi();

            const questionTypeData = qstnTypes.find(item => item.question_type === selectedQuestionType);
            const skillTypeData = skillTypes.find(item => item.skill_type === selectedSkillType);
            const testtypeData = testTypes.find(item => item.test_type === selectedTestType && item.test_type_categories === selectedTestTypeCategory);

            const questypeID = questionTypeData ? questionTypeData.id : null;
            const skillTypeID = skillTypeData ? skillTypeData.id : null;
            const testTypeID = testtypeData ? testtypeData.id : null;

            if (!testTypeID || !questypeID) {
                console.error('One or more IDs are null. Aborting submission.');
                if (!testTypeID) console.error('testTypeID is null');
                if (!questypeID) console.error('questypeID is null');
                return;
            }

            const existingTests = await getTestsApi();
            const testExists = existingTests.some(test => test.test_name === testName);

            if (testExists) {
                setErrorMessage("Test name already exists. Please choose a different test name.");
                setShowError(true);
                return;
            }

            // Shuffle the questions
            const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);
            const shuffledQuestions = shuffleArray(selectedQuestions.map(q => q.value));

            console.log('selectedBatches: ', selectedBatches);

            const pracOnlineTest = {
                // college_name: selectedColleges.map(college => college.label),
                // college_group_id: selectedCollegeGroups.map(college => college.value),
                batch_no: selectedBatches,
                // department_id: selectedDepartments.filter(department => department.value !== 'all').map(department => department.value),
                // year: selectedYear.value,
                test_name: testName,
                question_id: shuffledQuestions, // Assign shuffled questions
                dtm_start: moment(startDateTime).format('YYYY-MM-DD HH:mm:ss'),
                dtm_end: moment(endDateTime).format('YYYY-MM-DD HH:mm:ss'),
                duration: 0, // Updated later
                duration_type: durationType,
                rules_id: selectedRulesId.value,
                need_candidate_info: needCandidateInfo,
                test_type_id: testTypeID,
                question_type_id: questypeID,
                skill_type_id: skillTypeID,
                company_name: formData.get('company_name') || '',
                company_email: formData.get('company_email') || '',
                is_camera_on: camera,
            };

            console.log('PracOnlineTest:', pracOnlineTest);
            console.log('suffle', shuffledQuestions);

            // Submit the form logic continues...
            const submitForm = async (durationN) => {
                pracOnlineTest.duration = durationN;

                try {
                    await addTestcandidateCORPORATEApiBatch(pracOnlineTest);
                    setErrorMessage("Test Assigned successfully");
                    setShowError(true);

                    // Reset form and states after submission
                    setSelectedCollege(null);
                    setSelectedDepartments([]);
                    setSelectedColleges([]);
                    setSelectedRulesId(null);
                    setEndDateTime(null);
                    setStartDateTime(null);
                    e.target.reset();
                    navigate('/test/test-schedules/');
                } catch (error) {
                    console.error("An error occurred while assigning the test:", error);
                    setErrorMessage("An error occurred while assigning the test. Please try again later.");
                    setShowError(true);
                } finally {
                    setIsSubmitting(false); // Re-enable the button after processing
                }
            };

            if (durationType === 'Start&EndTime') {
                const start = new Date(startDateTime);
                const end = new Date(endDateTime);
                const durations = Math.ceil((end - start) / (1000 * 60)); // Duration in minutes, rounded up
                await submitForm(durations);
            } else if (durationType === 'QuestionTime') {
                // const data = await getQuestionPaperApi();
                // const matchingDuration = data.find(dur => dur.id === selectedQuestions.value);
                // const durationValue = matchingDuration ? matchingDuration.duration_of_test : 0;
                const durationValue = questionTime;
                console.log('duration_value: ', durationValue);
                await submitForm(durationValue);
            }
        } catch (error) {
            console.error("Error during submission:", error);
        } finally {
            setIsSubmitting(false); // Ensure re-enabling the submit button
        }
    };


    const [formData, setFormData] = useState({
        question_paper_name: "", // String for file names
        duration_of_test: "",
        topic: "",
        sub_topic: "",
        no_of_questions: 0,
        upload_type: "",
        file: [] // Array for selected files
    });


    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files); // Convert FileList to an array
        const fileNames = selectedFiles.map((file) => file.name); // Extract file names

        setFormData((prevState) => ({
            ...prevState,
            file: selectedFiles, // Store selected files as an array
            question_paper_name: fileNames // Store file names as an array
        }));
    };






    const handleInputChangeModal = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
            ...(name === "topic" && { sub_topic: "" }), // Reset sub_topic when topic changes
        }));
    };

    // Define topics and their corresponding subtopics
    const topicOptions = {
        Aptitude: ['Quants', 'Logical', 'Verbal', 'Overall', 'Generic', 'ProblemSolving'],
        Softskills: [],
        Technical: ['All Languages', 'C', 'C++', 'Python', 'JAVA', 'VLSI'],
        Communication: ['Verbal', 'Nonverbal', 'Written', 'Interpersonal'],
        Psychometry: ['Personality', 'Behavior', 'Emotions', 'Assessment'],
        CompanySpecific: ['Leadership', 'Communication', 'ProblemSolving', 'TimeManagement', 'Teamwork'],
    };


    const currentSubTopics = topicOptions[formData.topic] || [];


    const handleSaveold = async () => {
        console.log("Handle Save function...");
        if (isSubmitting) return;

        setIsSubmitting(true);

        // Reset any previous error
        setErrorMessage("");
        setShowError(false);

        if (formData.file.length === 0 || formData.question_paper_name.length === 0) {
            setErrorMessage("Please select files and provide question paper names");
            setShowError(true);
            setIsSubmitting(false);
            return;
        }

        const MCQTest = "MCQ Test";

        // Create FormData object
        const formDataToSend = new FormData();
        formDataToSend.append("duration_of_test", formData.duration_of_test);
        formDataToSend.append("topic", formData.topic);
        formDataToSend.append("sub_topic", formData.sub_topic);
        formDataToSend.append("no_of_questions", formData.no_of_questions || 0);
        formDataToSend.append("upload_type", formData.upload_type || "manual");
        formDataToSend.append("test_type", MCQTest);

        // Append files and question paper names
        formData.file.forEach((file, index) => {
            formDataToSend.append("file", file);
            formDataToSend.append("question_paper_name", formData.question_paper_name[index]);
        });

        try {
            const response = await QuestionsExportAPI_COR(formDataToSend); // Call the API
            setErrorMessage(`Upload response: ${JSON.stringify(response.data.result)}`);
            setShowError(true);
        } catch (error) {
            handleUploadError(error);
        }

        setIsSubmitting(false);
    };

    const handleSave = async () => {
        console.log("Handle Save function...");
        if (isSubmitting) return;

        setIsSubmitting(true);
        setErrorMessage("");
        setShowError(false);

        if (formData.file.length === 0 || formData.question_paper_name.length === 0) {
            setErrorMessage("Please select files and provide question paper names");
            setShowError(true);
            setIsSubmitting(false);
            return;
        }

        const TestType = selectedTestType === "MCQ Test" ? "MCQ Test" : "Coding Test";

        const formDataToSend = new FormData();
        formDataToSend.append("duration_of_test", formData.duration_of_test);
        formDataToSend.append("topic", formData.topic);
        formDataToSend.append("sub_topic", formData.sub_topic);
        formDataToSend.append("no_of_questions", formData.no_of_questions || 0);
        formDataToSend.append("upload_type", formData.upload_type || "manual");
        formDataToSend.append("test_type", TestType);

        formData.file.forEach((file, index) => {
            formDataToSend.append("file", file);
            formDataToSend.append("question_paper_name", formData.question_paper_name[index]);
        });

        try {
            const response =
                TestType === "MCQ Test"
                    ? await QuestionsExportAPI_COR(formDataToSend) // MCQ API call
                    : await QuestionsExportAPI_COR_CODE(formDataToSend); // Coding API call

            const uploadedQuestions = response.data?.result || []; // Ensure result is an array
            console.log("Uploaded Questions: ", uploadedQuestions);

            // Update the question list dynamically
            const newQuestions = uploadedQuestions.map((question) => ({
                value: question.id,
                label: question.question_paper_name,
            }));

            setQuestions(newQuestions);
            setSelectedQuestions(newQuestions);
            setQuestionTime(formData.duration_of_test);

            setErrorMessage("Questions uploaded successfully.");
            setShowError(true);

            // Automatically hide the success message after 2 seconds
            setTimeout(() => {
                setShowError(false);
                setShowModal(false);
            }, 2000);
        } catch (error) {
            console.error("Error during upload: ", error);
            setErrorMessage("Failed to upload questions. Please try again.");
            setShowError(true);
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleUploadError = async (error) => {
        console.error('Error uploading file:', error);

        if (error.response) {
            const errorData = error.response.data;
            let errorMsg = 'Error uploading file.';
            if (errorData.error) {
                errorMsg = errorData.error;
            } else if (typeof errorData === 'string') {
                errorMsg = errorData;
            }

            setErrorMessage(errorMsg);
            setShowError(true);


        } else {
            setErrorMessage('Error uploading file. Please try again.');
            setShowError(true);
        }
    };




    return (
        <div className='form-ques-compo'>
            <div className='form-ques-testmcq'>
                {/*}    <div className='non-db-btn'>
                    <Link to='/test-access/non-db/' style={{ color: "black", textDecoration: "none" }}><button className='button-ques-save  save-button-lms'>Non DB </button></Link>

                </div>      */}
                <br />

                <div>
                    <Row>
                        <Col>
                            <form onSubmit={handleSubmit} className='form-ques'>
                                <br />
                                <Row md={12}>
                                    <Col >
                                        <div className='TestName' controlId='test_name'>
                                            <label className='label5-ques' >Test Name</label><p></p>
                                            <input
                                                type="text"
                                                className='input-ques'
                                                name="test_name"
                                                required
                                                placeholder=""
                                                autoComplete="off"
                                                value={testName}
                                                onChange={handleInputChange}
                                            />
                                            {/* Display error message if there is an error */}
                                            {error && <p style={{ color: 'white' }}>{error}</p>}
                                        </div>
                                    </Col>
                                    <Col></Col>
                                </Row>
                                <p></p>

                                <Row>

                                    <Col>
                                        <label>No. of Questions Paper</label><p></p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="number"
                                                className='input-ques'
                                                value={numOfQuestions}
                                                onChange={handleInputChangeNo}
                                                onKeyPress={handleKeyPress} // Trigger modal on Enter key
                                                placeholder="Enter number of questions"
                                            />
                                            <Button style={{ backgroundColor: '#f1a128', color: 'black', border: 'none' }} onClick={handleGoButtonClick}>Go</Button>
                                        </div>
                                    </Col>

                                    <Col >
                                        <div className='QuestionName' controlId='question_name' >
                                            <label className='label5-ques' >Question Paper</label><p></p>
                                            {/*}  <Select style={{ width: "600px" }}
                                                options={questions}
                                                value={selectedQuestions}
                                                onChange={setSelectedQuestions}
                                                placeholder="Select Question Name"

                                                styles={customStyles}
                                            />*/}
                                            <Select
                                                isMulti
                                                style={{ width: "600px" }}
                                                options={questions}
                                                value={selectedQuestions}
                                                onChange={setSelectedQuestions}
                                                placeholder="Select Question Name"
                                                styles={customStyles}
                                            />


                                        </div>
                                    </Col>


                                </Row>
                                <p></p>
                                <Row md={12}>
                                    <Col >
                                        <div >
                                            <label className='label5-ques'>Start Date</label><p></p>

                                            <DatePicker
                                                name='dtm_start'
                                                selected={startDateTime}
                                                onChange={(date) => setStartDateTime(date)}
                                                showTimeSelect
                                                timeFormat="hh:mm aa"
                                                timeIntervals={15}
                                                dateFormat="dd-MM-yyyy, h:mm aa"
                                                timeCaption="Time"

                                                className='input-date-custom'
                                                styles={customStyles}
                                                autoComplete="off"
                                                required
                                            />
                                        </div>
                                    </Col>
                                    <Col >
                                        <div >
                                            <label className='label5-ques' >End Date</label><p></p>

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
                                                autoComplete="off"
                                                required
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <p></p>
                                <Row md={12}>
                                    <Col>
                                        <div className='College' controlId='college'>
                                            <label className='label5-ques'>College</label><p></p>
                                            <Select
                                                isMulti
                                                options={collegeOptions} // Verify this contains the expected data
                                                value={selectedColleges}
                                                onChange={handleCollegeChange}
                                                styles={customStyles}
                                                components={{ Option: CustomOption }}
                                                closeMenuOnSelect={false}
                                                onMenuOpen={() => console.log("Dropdown options on open:", collegeOptions)}
                                            />

                                        </div>
                                    </Col>

                                    <Col>
                                        <div className='CollegeGroup' controlId='college_group'>
                                            <label className='label5-ques'>College Group</label><p></p>
                                            <Select
                                                isMulti
                                                options={collegeGroups.filter(group =>
                                                    selectedColleges.some(college => college.value === group.collegeId)
                                                )}
                                                value={selectedCollegeGroups}
                                                onChange={handleCollegeGroupsChange}
                                                placeholder="Select College Group"
                                                styles={customStyles}
                                                components={{ Option: CustomOption }}
                                                closeMenuOnSelect={false}
                                            />
                                        </div>
                                    </Col>

                                </Row>

                                <p></p>
                                <Row md={12}>
                                    <Col >
                                        <div className='DepartmentName' controlId='department_name' >
                                            <label className='label5-ques' >Department Name</label><p></p>
                                            <Select
                                                isMulti
                                                options={departments}
                                                value={selectedDepartments}
                                                onChange={handleDepartmentsChange}
                                                styles={customStyles}
                                                components={{ Option: CustomOption }}
                                                closeMenuOnSelect={false}
                                            />
                                        </div>
                                    </Col>
                                    <Col >
                                        <div className='year' controlId="year" >
                                            <label className='label5-ques' >Year</label><p></p>
                                            <Select
                                                className='years-mcq'
                                                options={years}
                                                value={selectedYear}
                                                onChange={handleYearsChange}
                                                placeholder="Select year"

                                                styles={customStyles}
                                            />
                                        </div>

                                    </Col>


                                </Row>
                                <p></p>
                                <Row md={12}>
                                    <Col>
                                        <div className='CollegeGroup' controlId='college_group'>
                                            <label className='label5-ques'>Batches**</label><p></p>
                                            <Select
                                                isMulti
                                                options={stuBatches || []}
                                                value={selectedBatches.map((batch) => ({ value: batch, label: batch }))}
                                                onChange={handleBatches}
                                                placeholder="Select Batches"
                                                styles={customStyles}
                                                components={{ Option: CustomOption }}
                                                closeMenuOnSelect={false}
                                            />

                                        </div>
                                    </Col>

                                    <Col>
                                        <div className='RulesName' controlId='rule_id' >
                                            <label className='label5-ques' >Rule Name</label><p></p>
                                            <Select
                                                options={rules}
                                                value={selectedRulesId}
                                                onChange={setSelectedRulesId}
                                                placeholder="Select rule"

                                                styles={customStyles}
                                            />

                                        </div>
                                    </Col>


                                </Row>
                                <p></p>

                                <Row md={12}>

                                    <Col>
                                        <div controlId='need_candidate_info' style={{ marginLeft: "-198px" }}>
                                            <label className='label5-ques' style={{ marginLeft: "200px" }}>Need Candidate Info</label><p></p>
                                            <div style={{ marginLeft: "200px" }}>
                                                <input type="checkbox" id="need_candidate_info_checkbox" checked={needCandidateInfo} onChange={(e) => handleCheckboxChange(e.target.checked, setNeedCandidateInfo)} />
                                                <label htmlFor="need_candidate_info_checkbox"></label>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col >
                                        <Form.Group controlId='duration'>
                                            <label className='label5-ques' >Duration</label><p></p>
                                            <div className="custom-radio-grouping" style={{}}>
                                                <label className="custom-radios">
                                                    <input
                                                        type="radio"
                                                        name="duration"
                                                        value="QuestionTime"
                                                        onChange={handleDurationTypeChange}
                                                        required
                                                    />
                                                    <span className="custom-radio-labels" style={{ marginLeft: "10px", color: "white" }} >QuestionTime</span>
                                                </label>
                                                <label className="custom-radios" style={{ marginLeft: "20px" }} >
                                                    <input
                                                        type="radio"
                                                        name="duration"
                                                        value="Start&EndTime"
                                                        onChange={handleDurationTypeChange}
                                                        required
                                                    />
                                                    <span className="custom-radio-labels" style={{ marginLeft: "10px", color: "white" }}  >Start&End Time</span>
                                                </label>
                                            </div>
                                        </Form.Group>
                                    </Col>


                                </Row>
                                <p></p>
                                <Row md={12}>
                                    <Col >
                                        <div className='TestName' controlId='company_name'>
                                            <label className='label5-ques' >Company Name</label><p></p>
                                            <input
                                                type="text"
                                                className='input-ques'
                                                name="company_name"

                                                placeholder=""
                                                autoComplete="off"
                                                value={companyName}
                                                onChange={handleInputChange}
                                            />

                                        </div>
                                    </Col>
                                    <Col >
                                        <div className='TestName' controlId='company_email'>
                                            <label className='label5-ques' >Company Email</label><p></p>
                                            <input
                                                type="text"
                                                className='input-ques'
                                                name="company_email"

                                                placeholder=""
                                                autoComplete="off"
                                                value={Cemail}
                                                onChange={handleInputChange}
                                            />

                                        </div>
                                    </Col>
                                </Row>
                                <p></p>

                                <Row>

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
                                </Row>

                                <p style={{ height: "50px" }}></p><p></p>
                                <Row>
                                    <Col>

                                        <div className="button-container-lms">
                                            <button

                                                className="button-ques-back btn btn-secondary back-button-lms"
                                                style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128', cursor: 'not-allowed' }}
                                                disabled
                                            ><img src={Back} className='nextarrow' ></img>
                                                <span className="button-text">Back</span>
                                            </button>
                                            <button type="submit" className='button-ques-save save-button-lms' disabled={isSubmitting} style={{ width: "100px" }}>
                                                Save
                                            </button>
                                            <button onClick={onNextButtonClick} className="button-ques-back btn btn-secondary back-button-lms"
                                                style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128', cursor: 'not-allowed' }}
                                                disabled >
                                                <span className="button-text">Next</span><img src={Next} className='nextarrow'></img>

                                            </button>
                                        </div>
                                    </Col>
                                </Row>
                            </form><br></br>
                        </Col>
                    </Row>
                    <p></p>


                </div>
            </div>


            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Questions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row md={12}>

                        <Col>
                            <label>Upload Question Files</label> <p></p>
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.txt,.xlsx" // Restrict file types if needed
                                onChange={handleFileChange}
                            />
                        </Col>
                    </Row><p></p><p></p>

                    <Row md={12}>

                        <Col>
                            <div className='duration' controlId='duration_of_test'>
                                <label  >Duration of the Test</label><p></p>
                                <input
                                    type="number"
                                    autocomplete="off"
                                    name="duration_of_test"
                                    required
                                    placeholder=""
                                    // className='input-ques-dur'
                                    min="0"
                                    onChange={handleInputChangeModal}
                                //  readOnly={!uploadType}
                                />

                            </div>
                        </Col>
                        <Col>
                            <div controlId='topic'>
                                <label >Topic</label><p></p>

                                <select
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleInputChangeModal}
                                >
                                    <option value="">Select Topic</option>
                                    {Object.keys(topicOptions).map((key) => (
                                        <option key={key} value={key}>
                                            {key}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Col>

                        <Col >
                            <div controlId='selectedSubTopic'>
                                <label >  Sub Topic</label><p></p>

                                <select
                                    name="sub_topic"
                                    value={formData.sub_topic}
                                    onChange={handleInputChangeModal}
                                    disabled={!currentSubTopics.length}
                                >
                                    <option value="">Select Sub Topic</option>
                                    {currentSubTopics.map((subTopic, index) => (
                                        <option key={index} value={subTopic}>
                                            {subTopic}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Col>


                    </Row>
                    <p></p> <p></p>

                    <div>
                        <Button variant="primary" onClick={handleSave} style={{ float: 'right' }}>
                            Save
                        </Button>
                    </div>

                </Modal.Body>

            </Modal>


            <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />


        </div>
    );
};

export default TestaccessForm;