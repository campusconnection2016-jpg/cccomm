import React, { useEffect, useState, useRef, useContext } from 'react';
import { Col, Row, Form, Button, Modal } from 'react-bootstrap';
import Select, { components } from 'react-select';
import CustomOption from './customoption';
import '../../api/loading.css'

import {
    addTestcandidateApiBatch,
    getTestsApi,
    getrulesApi,
    getcollege_Test_Api,
    getQuestionPaperApi,
    gettesttypeApi,
    getSkilltypeApi,
    getqstntypeApi,
    get_department_info_Test_API_CC,
    get_Batches_API_CLG_ID,

    getCollegeList_Concat_API,
    get_user_colleges_API,
} from '../../api/endpoints';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext, } from './context/testtypecontext';
//import './Test.css';
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
import ErrorModal from '../auth/errormodal';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "react-datetime/css/react-datetime.css";
import { Link } from 'react-router-dom';
import '../../styles/global.css';

import { useNavigate } from 'react-router-dom';
import QuestionPaperMCQTest from '../questions/questionpapermcqtest';
import QuestionPaperCodeTest from '../questions/questionpapercodetest';
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
const TestaccessForm = ({ onNextButtonClick, selectedFolder, questionPaperPass, questionIdPass, username, userRole, selectedTopicPass, selectedSubTopicPass, selectedTestTypepass, selectedFolderpass, selectedTestTypeCategoryPass }) => {
    console.log("selectedFolder", selectedFolder)
    console.log("selectedTopicPass543", selectedTopicPass)
    console.log(" for selectedSubTopicPass432", selectedSubTopicPass)


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
    const [selectedQuestions, setSelectedQuestions] = useState(null);
    // ✅ Auto-fill question name when questionPaperPass is received
    useEffect(() => {
        if (questionPaperPass && questions.length > 0) {
            const matched = questions.find(q => q.label === questionPaperPass);
            if (matched) {
                setSelectedQuestions(matched);
                setDuration(matched.duration_of_test || 0);
                console.log("✅ Auto-filled Question Name from questionPaperPass:", matched);
            }
        } else {
            // If not received, keep it empty
            setSelectedQuestions(null);
            console.log("ℹ️ No questionPaperPass received, leaving Question Name empty");
        }
    }, [questionPaperPass, questions]);


    //const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isActualTest, setIsActualTest] = useState(false);
    // const [needCandidateInfo, setNeedCandidateInfo] = useState(false);
    const [needCandidateInfo, setNeedCandidateInfo] = useState(true);
    const [durationType, setDurationType] = useState("QuestionTime");
    const [selectedColleges, setSelectedColleges] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const defaultStartTime = new Date();
    defaultStartTime.setHours(defaultStartTime.getHours(), defaultStartTime.getMinutes(), 0, 0);

    // ✅ Set Default End Date (After 48 Hours)
    const defaultEndTime = new Date();
    defaultEndTime.setTime(defaultStartTime.getTime() + 48 * 60 * 60 * 1000); // Add 48 hours

    const [startDateTime, setStartDateTime] = useState(defaultStartTime);
    const [endDateTime, setEndDateTime] = useState(defaultEndTime);
    // const [durationType, setDurationType] = useState('');
    const [duration, setDuration] = useState(0);
    const years = [
        { value: 'all', label: 'All' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
    ];

    const [selectedYear, setSelectedYear] = useState([]);
    const [triggerFetch, setTriggerFetch] = useState(true);
    const [triggerFetch1, setTriggerFetch1] = useState(true);

    const [isManualTestName, setIsManualTestName] = useState(false); // NEW FLAG



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

    const [isModalOpen, setIsModalOpen] = useState(false);


    const handleYearChange = (selectedOptions) => {
        if (!selectedOptions) {
            setSelectedYear([]);
            return;
        }

        const selectedValues = selectedOptions.map(option => option.value);

        if (selectedValues.includes('all')) {
            setSelectedYear(years.filter(year => year.value !== 'all')); // Select all years except 'All'
        } else {
            setSelectedYear(selectedOptions);
        }
    };


    const [testName, setTestName] = useState('');
    const [error, setError] = useState('');
    const [collegeGroups, setCollegeGroups] = useState([]); // Stores fetched groups for selected colleges
    const [selectedCollegeGroups, setSelectedCollegeGroups] = useState([]); // Stores selected college groups
    const [stuBatches, setStuBatches] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [Cemail, setCemail] = useState('');
    const [camera, setCamera] = useState(false);
    const [isFormModified, setIsFormModified] = useState(false); // Track form changes
    const [collegeList, setCollegeList] = useState([]);
    const [batchNumbers, setBatchNumbers] = useState([]);
    const [selectedBatchNo, setSelectedBatchNo] = useState([]);


    const handleInputChange = (e) => {
        setIsFormModified(true);
        const { name, value } = e.target;

        if (name === 'test_name') {
            setTestName(value);
            setIsManualTestName(true); // ✅ Mark as manual entry

            if (value.includes('/')) {
                setError(" '/' is not allowed in Test Name");
            } else {
                setError('');
            }
        }
    };



    const handleCompanyDetailsChange = (e) => {
        const { name, value } = e.target;
        if (name === "company_name") {
            setCompanyName(value);
        } else if (name === "company_email") {  // Correct name matching input field
            setCemail(value);
        }
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

    useEffect(() => {

        getQuestionPaperApi(selectedTestTypeCategoryPass, selectedTopicPass, selectedSubTopicPass)
            .then(data => {
                console.log("📄 Filtered Question Papers (Backend):", data);
                setQuestions(data.map(item => ({
                    value: item.id,
                    label: item.question_paper_name,
                    duration_of_test: item.duration_of_test
                })));
            })
            .catch(error => console.error("❌ Error fetching question paper:", error));
    }, [selectedTestTypeCategoryPass, selectedTopicPass, selectedSubTopicPass]);



    useEffect(() => {
        // Call API and always send selectedTestTypeCategoryPass
        getQuestionPaperApi(
            selectedTestTypeCategoryPass,
            selectedTopicPass,
            selectedSubTopicPass
        )

            .then(data => {
                console.log("📄 Full Question Papers Data:", data);
                console.log("🔍 selectedTestTypepass Data:", selectedTestTypepass);
                console.log("🔍 selectedTopicPass Data:", selectedTopicPass);
                console.log("🔍 selectedSubTopicPass Data:", selectedSubTopicPass);
                console.log("🔍 selectedFolderpass Data:", selectedFolderpass);
                console.log("🔍 selectedTestTypeCategoryPass Data:", selectedTestTypeCategoryPass);

                // Filter based on all parameters, including category
                let filteredData = data.filter(item =>
                    item.test_type === selectedTestTypepass &&
                    item.topic === selectedTopicPass &&
                    (selectedSubTopicPass === "Softskills" || item.sub_topic === selectedSubTopicPass) &&
                    (!selectedFolderpass || item.folder_name === selectedFolderpass) &&
                    (selectedTestTypeCategoryPass ? item.test_type_categories === selectedTestTypeCategoryPass : true)
                );

                console.log("🔍 Filtered Data (All Parameters):", filteredData);

                // Fallback: if nothing matched, ignore sub_topic and category
                if (filteredData.length === 0) {
                    filteredData = data.filter(item =>
                        item.test_type === selectedTestTypepass &&
                        item.topic === selectedTopicPass &&
                        (!selectedFolderpass || item.folder_name === selectedFolderpass)
                    );
                    console.log("🔍 Fallback Filtered Data:", filteredData);
                }

                // Map filtered data into dropdown options
                const filteredQuestions = filteredData.map(item => ({
                    value: item.id,
                    label: item.question_paper_name || "Unnamed Paper",
                    duration_of_test: item.duration_of_test || 0,
                    test_type: item.test_type,
                    folder_name: item.folder_name,
                    test_type_categories: item.test_type_categories
                }));

                console.log("🛠 Filtered Questions List:", filteredQuestions);
                setQuestions(filteredQuestions);

                // Auto-select question if questionPaperCon exists
                if (questionPaperCon) {
                    const matchedQuestion = filteredQuestions.find(q => q.label === questionPaperCon);
                    console.log("🔎 Auto-selected question:", matchedQuestion);
                    if (matchedQuestion) {
                        setSelectedQuestions(matchedQuestion);
                        setDuration(matchedQuestion.duration_of_test || 0);
                    }
                }
            })
            .catch(error => console.error("❌ Error fetching question paper:", error));
    }, [
        selectedTestTypepass,
        selectedTopicPass,
        selectedSubTopicPass,
        selectedFolderpass,
        selectedTestTypeCategoryPass,
        questionPaperCon,
        isModalOpen
    ]);



    // ✅ Ensure question duration is set when fetching questions
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
    const [collegeIds, setCollegeIds] = useState([]); // for Training admin

    // State to store college ID
    const [userColleges, setUserColleges] = useState([]); // store dropdown options

    // State already present:
    // const [collegeIds, setCollegeIds] = useState([]);
    // const [userColleges, setUserColleges] = useState([]);

    useEffect(() => {
        if (!username) return;

        // helper: merge concat list with codes from base list
        const mergeWithCodes = async (list) => {
            const base = await getcollege_Test_Api(); // has id, college_code
            const codeMap = new Map(base.map((b) => [Number(b.id), b.college_code]));
            return list.map((c) => ({
                value: Number(c.id),
                label: c.college_group_concat,
                code: codeMap.get(Number(c.id)) || "", // <-- keep code here
            }));
        };

        if (userRole === "Training admin") {
            get_user_colleges_API(username)
                .then(async (userData) => {
                    const ids = (userData?.college_ids || []).map((x) => Number(x));
                    setCollegeIds(ids); // ✅ store in state (no shadowing)

                    const concatList = await getCollegeList_Concat_API();
                    const filtered = concatList.filter((c) => ids.includes(Number(c.id)));
                    const withCodes = await mergeWithCodes(filtered);
                    setUserColleges(withCodes);
                })
                .catch((error) => {
                    console.error("❌ Error fetching user colleges:", error);
                });
        } else {
            Promise.all([getCollegeList_Concat_API(), getcollege_Test_Api()])
                .then(([concatList, base]) => {
                    const codeMap = new Map(base.map((b) => [Number(b.id), b.college_code]));
                    const all = concatList.map((c) => ({
                        value: Number(c.id),
                        label: c.college_group_concat,
                        code: codeMap.get(Number(c.id)) || "",
                    }));
                    setUserColleges(all);
                })
                .catch((error) => {
                    console.error("❌ Error fetching all colleges:", error);
                });
        }
    }, [username, userRole]);



    useEffect(() => {
        if (isManualTestName) return;

        if (collegeIds.length === 0 && userRole === "Training admin") return;

        // Fetch concatenated college list
        if (triggerFetch1) {
            getCollegeList_Concat_API()
                .then((data) => {
                    const options = data.map((college) => ({
                        value: college.id,
                        label: college.college_group_concat,
                    }));

                    // Filter only allowed colleges for Training admin
                    const filteredOptions =
                        userRole === "Training admin"
                            ? options.filter((c) => collegeIds.includes(Number(c.value)))
                            : options;

                    const defaultOption = { value: '', label: 'College - College Branches' };
                    setCollegeList([defaultOption, ...filteredOptions]);
                    setTriggerFetch1(false);
                })
                .catch((error) => console.error("Error fetching college list:", error));
        }

        // Fetch normal college API
        if (triggerFetch) {
            getcollege_Test_Api()
                .then((data) => {
                    const collegeOptions = data.map((item) => ({
                        value: item.id,
                        label: item.college,
                        code: item.college_code,
                    }));

                    const filteredCollegeOptions =
                        userRole === "Training admin"
                            ? collegeOptions.filter((c) => collegeIds.includes(Number(c.value)))
                            : collegeOptions;

                    setCollege([{ value: 'all', label: 'All' }, ...filteredCollegeOptions]);
                    setTriggerFetch(false);
                })
                .catch((error) => console.error('Error fetching College:', error));
        }

        const selectedDate = new Date(startDateTime);
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');

        const shortQuestionType = selectedQuestionType ? selectedQuestionType.substring(0, 3) : '';
        const shortSkillType = selectedSkillType ? selectedSkillType.substring(0, 3) : '';
        const formattedDate = `${day}-${month}`;


        const selectedQuestionLabel = selectedQuestions
            ? (selectedQuestions ? selectedQuestions.label : "")
            : questionPaperPass; // ✅ Ensures valid label


        if (!college || college.length === 0) return; // Prevents undefined issues

        const selectedCollegeCodes =
            selectedColleges && selectedColleges.length > 0
                ? selectedColleges
                    .map((colItem) => {
                        const foundCollege = userColleges.find(c => c.value === colItem.value);
                        return foundCollege?.code;
                    })
                    .filter(Boolean)
                    .join(',')
                : '';
        const academicYear = selectedYear?.length > 0 ? selectedYear.map((y) => y.value).join(',') : '';

        if (selectedColleges.length > 1) {
            setTestName(
                `${academicYear}yr_${shortQuestionType}_${shortSkillType}_${selectedQuestionLabel}_${formattedDate}`
            );
        } else {
            setTestName(
                `${selectedCollegeCodes}_${academicYear}yr_${shortQuestionType}_${shortSkillType}_${selectedQuestionLabel}_${formattedDate}`
            );
        }

        // setTestName(`${selectedCollegeCodes}_${academicYear}yr_${shortQuestionType}_${skillType}_${selectedQuestionLabel}_${formattedDate}`);

    }, [
        selectedTestType,
        selectedTestTypeCategory,
        selectedQuestionType,
        selectedSkillType,
        duration,
        selectedColleges,
        selectedQuestions,
        questionPaperPass, // ✅ Ensure changes trigger effect
        questionIdPass,    // ✅ Ensure changes trigger effect
        startDateTime,
        selectedYear, college, triggerFetch, triggerFetch1, userRole, username, userColleges, isManualTestName
    ]);
    // Fetch department data when selectedColleges changes
    useEffect(() => {
        const filteredColleges = selectedColleges.filter(college => college.value !== 'all');
        const collegeNames = filteredColleges.map(college => college.label);
        const collegeIds = filteredColleges.map(college => college.value);
        console.log('collegeIDs: ', collegeIds);

        get_department_info_Test_API_CC(collegeIds)
            .then(data => {
                const departmentOptions = data.map(item => ({
                    value: item.department_id__id,
                    label: item.department_id__department
                }));
                setDepartments([{ value: 'all', label: 'All' }, ...departmentOptions]);
            })
            .catch(error => console.error('Error fetching departments:', error));


        get_Batches_API_CLG_ID(collegeIds)
            .then((batches) => {
                console.log('Batch Numbers:', batches);
                const options = batches.map((batch) => ({
                    label: batch.batch_no, // Update according to API response structure
                    value: batch.batch_no,
                }));
                setBatchNumbers(options);


                // Map the response to the format expected by react-select
                // const options = [
                //     { label: "All", value: "all" }, // Add the "All" option
                //     ...batches.batch_numbers.map((batch) => ({
                //         label: batch,
                //         value: batch,
                //     })),
                // ];


            })
            .catch((error) => {
                console.error('Error fetching batch numbers:', error);
            });


    }, [selectedColleges]); // Dependency array includes selectedColleges

    const handleCheckboxChange = (checked, setter) => {
        setter(checked);
    };


    const handleDepartmentsChange = (selectedOptions) => {
        if (selectedOptions.some(option => option.value === 'all')) {
            setSelectedDepartments([{ value: 'all', label: 'All' }]);
            //etSelectedDepartments(departments.filter(option => option.value !== 'all'));
        } else {
            setSelectedDepartments(selectedOptions);
        }
    };

    const normalizeName = (name) =>
        name.replace(/_+/g, "_").trim().toLowerCase();

    const handleSubmit = async (e) => {
        console.log("🚀 Form submission started");
        e.preventDefault();

        const formData = new FormData(e.target);
        const testName = formData.get('test_name');
        if (isSubmitting) return;
        setIsSubmitting(true);

        // 🔎 Step 1: Duplicate test name check FIRST
        try {
            console.log("🔍 Checking duplicate test name:", testName);

            const existingTests = await getTestsApi();
            console.log("✅ getTestsApi returned:", existingTests.map(t => t.test_name));

            const duplicate = existingTests.some(
                (test) => normalizeName(test.test_name) === normalizeName(testName)
            );



            if (duplicate) {
                console.log("❌ Duplicate test name found:", testName);
                setErrorMessage(
                    "Test name already exists. Please write a different test name."
                );
                setShowError(true);
                setIsSubmitting(false);
                return; // 🚫 Stop immediately
            }
        } catch (err) {
            console.error("❌ Error fetching existing tests:", err);
            setErrorMessage("Unable to verify test name. Please try again.");
            setShowError(true);
            setIsSubmitting(false);
            return;
        }



        // Check if the test name contains '/'
        if (testName.includes('/')) {
            console.error("❌ Error: Test name contains '/'");

            setErrorMessage("Test name not allowed to include '/' .");
            setShowError(true);
            setIsSubmitting(false);
            return;  // Exit the function to prevent submission
        }


        if (!startDateTime || !endDateTime) {
            console.error("❌ Error: Start or End Date missing");

            setErrorMessage("Start Date and End Date are required.");
            setShowError(true);
            setIsSubmitting(false);
            return;
        }

        if (moment(endDateTime).isBefore(moment(startDateTime))) {
            console.error("❌ Error: End Date is before Start Date");

            setErrorMessage("End Date must be after Start Date.");
            setShowError(true);
            setIsSubmitting(false);
            return;
        }

        try {
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
            console.log("📌 Matched Rule ID:", ruleID);
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
                setIsSubmitting(false);
                return;
            }



            const year = formData.get('year');
            const filteredColleges = selectedColleges.filter(college => college.value !== 'all');
            const filteredDepartments = selectedDepartments.filter(department => department.value !== 'all');

            const filteredCollegesGroup = selectedCollegeGroups.filter(college => college.value !== 'all');
            const filteredBatches = selectedBatchNo
                .filter(batch => batch.value !== 'all') // Exclude 'all'
                .map(batch => ({ value: batch.value, label: batch.label })); // Ensure correct structure


            console.log('filteredBatches: ', filteredBatches);

            //  const question_id_id = questionIdPass || selectedQuestions.value;

            const question_id_id = selectedQuestions?.value || questionIdPass || null;
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
            const collegeNames = filteredColleges?.map(college => college.label) || [];
            const collegeIds = filteredColleges?.map(college => college.value) || [];
            const collegeGroupIds = filteredCollegesGroup?.map(college => college.value) || [];
            const departmentIds = filteredDepartments?.map(department => department.value) || [];
            const yearValues = selectedYear?.map(y => y.value) || [];
            const createdBy = typeof username === "object" && username.username ? username.username : "System"; // Ensure string
            console.log("Created By (Final):", createdBy); // Debugging

            const pracOnlineTest = {
                college_id: collegeIds,
                college_name: collegeNames,
                created_by: createdBy,
                college_group_id: collegeGroupIds,
                batch_no: filteredBatches.map(batch => batch.value),
                department_id: departmentIds,
                //  year: selectedYear.value,
                year: yearValues,
                test_name: formData.get('test_name'),
                question_id: question_id_id,
                dtm_start: moment(startDateTime).format('YYYY-MM-DD HH:mm:ss'),
                dtm_end: moment(endDateTime).format('YYYY-MM-DD HH:mm:ss'),
                is_camera_on: isActualTest,
                duration: questionDuration,
                // duration: 0, // Will be updated later
                // duration_type: durationType,

                // rules_id: selectedRulesId.value,
                duration_type: "QuestionTime",
                need_candidate_info: true,
                rules_id: ruleID,
                // need_candidate_info: needCandidateInfo,
                test_type_id: testTypeID,
                question_type_id: questypeID,
                skill_type_id: skillTypeID,
                company_name: formData.get('company_name') || '',
                company_email: formData.get('company_email') || '',
                is_camera_on: camera,

            };
            console.log("📝 Test data before submitting:", pracOnlineTest);


            const submitForm = async (durationN) => {
                try {
                    const filteredColleges = selectedColleges.filter(c => c.value !== 'all');

                    if (filteredColleges.length > 1) {
                        // Multiple colleges → assign per college with appended code
                        for (const colItem of filteredColleges) {
                            const foundCollege = userColleges.find(c => c.value === colItem.value);
                            const code = foundCollege?.code || '';

                            // ✅ Always take current testName (manual or auto) and add code
                            // const indivTestName = `${code}_${testName}`;
                            const indivTestName = `${testName}`;


                            const indivTest = {
                                ...pracOnlineTest,
                                college_id: [colItem.value],
                                college_name: [colItem.label],
                                test_name: indivTestName,
                                duration: durationN,
                            };

                            await addTestcandidateApiBatch(indivTest);
                            console.log("✅ Test assigned for:", colItem.label, indivTestName);
                        }
                    } else {
                        // Single college → just use current testName
                        pracOnlineTest.duration = durationN;
                        pracOnlineTest.test_name = testName;
                        await addTestcandidateApiBatch(pracOnlineTest);
                        console.log("✅ Test assigned successfully:", testName);
                    }

                    setErrorMessage("Test Assigned successfully");
                    setShowError(true);
                    navigate('/test/test-schedules/');
                    setQuestionPaperCon(null);
                } catch (error) {
                    console.error("❌ Error while assigning the test:", error);
                    setErrorMessage("An error occurred while assigning the test. Please try again later.");
                    setShowError(true);
                } finally {
                    setIsSubmitting(false);
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
                        // setErrorMessage("Failed to fetch question paper data. Check console for details.");
                        // setShowError(true);
                        // alert("Failed to fetch question paper data. Check console for details.");
                    });
            }
        } catch (error) {
            console.error("Error during submission:", error);
        }

        finally {
            setIsSubmitting(false);


        }
    };

    const handleNonDBClick = () => {
        console.log("📝 Navigating to NonDatabaseForm...");
        console.log("📂 Folder:", selectedFolder);
        console.log("📄 Question Paper:", questionPaperPass);
        console.log("📌 Question Paper ID:", questionIdPass);

        navigate('/test-access/non-db/', {
            state: {
                selectedFolder,
                questionPaperPass,
                questionIdPass,
                questionsPass: questions
            }
        });
    };



    const handleModalClose = () => setIsModalOpen(false);
    const handleModalOpen = () => {
        setIsModalOpen(true);
        setIsTestAddQues(true);
    };

    return (
        <div className='form-ques-compo'>
            <div className='form-ques-testmcq'>

                <div className='non-db-btn'>
                    <button className='button-ques-save save-button-lms' onClick={handleNonDBClick}>
                        Non DB
                    </button>
                </div>
                <br />

                <div>
                    <Row>
                        <Col>
                            <form onSubmit={handleSubmit} className='form-ques'>
                                <br />
                                <Row md={12}>


                                    <Col>
                                        <div className='QuestionName' controlId='question_name'>
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
                                                type='button'
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
                                                Add Questionn
                                            </button>



                                        </div>

                                        <Modal show={isModalOpen} onHide={handleModalClose} size="lg" centered>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Question Paper</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                {selectedTestType === "MCQ Test" && (
                                                    <QuestionPaperMCQTest
                                                        userRole={userRole}
                                                        collegeName={'CC'}
                                                        selectedTestTypeCategoryPass={selectedTestTypeCategoryPass}   // ✅ added
                                                    />
                                                )}
                                                {selectedTestType === "Coding Test" && (
                                                    <QuestionPaperCodeTest
                                                        userRole={userRole}
                                                        collegeName={'CC'}
                                                        selectedTestTypeCategoryPass={selectedTestTypeCategoryPass}   // ✅ added
                                                    />
                                                )}
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={handleModalClose}>
                                                    Close
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>



                                    </Col>

                                    <Col >
                                        <div className='CollegeName' controlId='college_name' >
                                            <label className='label5-ques'  >College Name**</label><p></p>

                                            <Select
                                                isMulti
                                                options={userColleges}
                                                value={selectedColleges}
                                                onChange={(college) => {
                                                    console.log("College Selected:", college);
                                                    setSelectedColleges(college);
                                                }}
                                                placeholder="Select College"
                                                styles={customStyles}
                                            />
                                        </div>
                                    </Col>


                                    {batchNumbers && batchNumbers.length > 0 && (
                                        <Col>
                                            <div className='CollegeGroup' controlId='college_group'>
                                                <label className='label5-ques'>Batches</label><p></p>
                                                <Select
                                                    options={batchNumbers}
                                                    value={selectedBatchNo}
                                                    onChange={(bt) => setSelectedBatchNo(bt)}
                                                    placeholder="Select Batches"
                                                    styles={customStyles}
                                                    components={{ Option: CustomOption }}
                                                    closeMenuOnSelect={false}
                                                    isMulti // Allows selecting multiple batches
                                                />
                                            </div>
                                        </Col>
                                    )}


                                </Row>
                                <p></p>


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
                                                isMulti
                                                className='years-mcq'
                                                options={years}
                                                value={selectedYear}
                                                // onChange={setSelectedYear}
                                                onChange={handleYearChange}
                                                placeholder="Select year"

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
                                                name="dtm_end"
                                                selected={endDateTime}
                                                onChange={(date) => setEndDateTime(date)}
                                                minDate={startDateTime} // Prevent selecting dates before start date
                                                disabled={!startDateTime}
                                                timeFormat="hh:mm aa"
                                                timeIntervals={15}
                                                dateFormat="dd-MM-yyyy, h:mm aa"
                                                showTimeSelect

                                                className='input-date-custom'
                                                styles={customStyles}
                                                autoComplete="off"
                                                required
                                            />
                                            {/* {errorMessage && <p style={{ color: "white" }}>{errorMessage}</p>} */}


                                        </div>
                                    </Col>
                                </Row>
                                <p></p>

                                <Row md={12}>
                                    <Col >
                                        <div className='TestName' controlId='test_name'>
                                            <label className='label5-ques' >Test Name**</label><p></p>
                                            <input
                                                type="text"
                                                className='input-ques-test-name'
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

                                    <Col>
                                        <div className='RulesName' controlId='rule_id'>
                                            <label className='label5-ques'>Rule Name</label><p></p>
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

                                    <Col>
                                        <Form.Group controlId="duration">
                                            <label className="label5-ques">Duration</label>
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




                                </Row>
                                <p></p>
                                {(selectedTestTypeCategory === 'Mock/Interview') && (
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
                                                    onChange={handleCompanyDetailsChange}
                                                />

                                            </div>
                                        </Col>
                                        <Col >
                                            <div controlId='company_email'>
                                                <label className='label5-ques' >Company Email</label><p></p>
                                                <input
                                                    type="text"
                                                    className='input-ques'
                                                    name="company_email"
                                                    placeholder=""
                                                    autoComplete="off"
                                                    value={Cemail}
                                                    onChange={handleCompanyDetailsChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>)}
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
                                </Row>

                                <p style={{ height: "50px" }}></p><p></p>
                                <Row>
                                    <Col>

                                        <div className="button-container-lms">
                                            <button
                                                onClick={onNextButtonClick}

                                                className="button-ques-back btn btn-secondary back-button-lms"
                                                style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128' }}

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
            <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />


        </div>
    );
};

export default TestaccessForm;