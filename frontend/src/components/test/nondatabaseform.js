import React, { useEffect, useState, useRef, useContext } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
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
    updateTestEntries_API,
    getDistinct_Upload_timing_API,
    getClg_Group_API,
    get_Batches_API_NONDB,
    getcollege_Test_Api,
    getDistinct_Upload_timing_API_CC,
    getCollegeList_Concat_API,
    get_Batches_API_CLG_ID_NDB,


    get_user_colleges_API,
    
} from '../../api/endpoints';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext } from './context/testtypecontext';
import Footer from '../../footer/footer';
import ErrorModal from '../auth/errormodal';
import { Link } from 'react-router-dom';
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomOption from './customoption';

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

            width: '90%'
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

const NonDatabaseForm = ({ username ,userRole}) => {
    console.log("nondb",username,userRole)
    const navigate = useNavigate();
    const { selectedTestType } = useContext(TestTypeContext);
    const { selectedTestTypeCategory } = useContext(TestTypeCategoriesContext);
    const { selectedQuestionType } = useContext(QuestionTypeContext);
    const { selectedSkillType } = useContext(SkillTypeContext);
    const location = useLocation();
    const { selectedFolder, questionPaperPass, questionIdPass,questionsPass } = location.state || {};
    console.log("✅ Received Folder:", selectedFolder);
    console.log("✅ Received Question Paper:", questionPaperPass);
    console.log("✅ Received Question Paper ID:", questionIdPass);
    console.log('Received questions3:', questionsPass);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [rules, setRules] = useState([]);
    const [selectedRulesId, setSelectedRulesId] = useState(null);
    // const [needCandidateInfo, setNeedCandidateInfo] = useState(true);
    const defaultStartTime = new Date();
    defaultStartTime.setHours(defaultStartTime.getHours(), defaultStartTime.getMinutes(), 0, 0);

    // ✅ Set Default End Date (After 48 Hours)
    const defaultEndTime = new Date();
    defaultEndTime.setTime(defaultStartTime.getTime() + 48 * 60 * 60 * 1000); // Add 48 hours

    const [startDateTime, setStartDateTime] = useState(defaultStartTime);
    const [endDateTime, setEndDateTime] = useState(defaultEndTime);
    //  const [durationType, setDurationType] = useState('');
    const [needCandidateInfo, setNeedCandidateInfo] = useState(true);
    const [durationType, setDurationType] = useState("QuestionTime");

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

    const [companyName, setCompanyName] = useState('');
    const [Cemail, setCemail] = useState('');
    const [camera, setCamera] = useState(false);

    const [collegeList, setCollegeList] = useState([]);
    const [batchNumbers, setBatchNumbers] = useState([]);
    const [selectedBatchNo, setSelectedBatchNo] = useState([]);
    const [triggerFetch, setTriggerFetch] = useState(true);
    const [triggerFetch1, setTriggerFetch1] = useState(true);
    const [isManualTestName, setIsManualTestName] = useState(false);




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
    


const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestName(value);
    setIsManualTestName(true); // ✅ user manually edited

    if (name === 'test_name') {
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
    useEffect(() => {
        getQuestionPaperApi()
            .then(data => {
                console.log("📄 Question Papers Fetched:", data);

                const filteredQuestions = data
                    .map(item => ({
                        value: item.id,
                        label: item.question_paper_name || "Unnamed Paper", // ✅ Ensure label is not undefined
                        duration_of_test: item.duration_of_test || 0,
                        test_type: item.test_type,
                        folder_name: item.folder_name,
                    }))
                    .filter(item => item.test_type === selectedTestType.trim());

                setQuestions(filteredQuestions);

                if (questionIdPass) { // ✅ Preserve user selection
                    const matchedQuestion = filteredQuestions.find(q => q.value === questionIdPass);

                    if (matchedQuestion) {
                        console.log("✅ Auto-selecting question:", matchedQuestion);
                        setSelectedQuestions(matchedQuestion);
                        setDuration(matchedQuestion.duration_of_test || 0);
                    }
                }
            })
            .catch(error => console.error("❌ Error fetching question paper:", error));
    }, [selectedTestType, selectedFolder, questionIdPass]); // ✅ Removed `selectedQuestions` dependency



    const formatDate1 = (dateString) => {
        if (!dateString) {
            return null; // Return null if dateString is null or undefined
        }

        const localDate = moment(dateString).local();
        return localDate.format('DD/MM/YYYY hh:mm A');
    };

    useEffect(() => {
        // Fetch upload times when a college is selected
        if (selectedCollege.length > 0 || selectedCollegeGroups.length > 0 || selectedBatches.length > 0) {
            console.log('1**selectedCollege.value: ', selectedCollege.filter(college => college.value !== 'all'));
            console.log('2**selectedCollegeGroups: ', selectedCollegeGroups.filter(college => college.value !== 'all'));
            console.log('3**selectedBatches: ', selectedBatches
                .filter(batch => batch.value !== 'all')  // Filter out 'all' if needed
                .map(batch => batch.value));

            const testsDatas = {
                college_id: selectedCollege
                    .filter(college => college.value !== 'all')
                    .map(college => college.value)
                    .join(','), // Convert to comma-separated string
                batch_no: selectedBatchNo
                    .filter(batch => batch.value !== 'all')  // Filter out 'all' if needed
                    .map(batch => batch.value)
                    .join(','), // Convert to comma-separated string
            };

            getDistinct_Upload_timing_API_CC(testsDatas)
                .then(data => {
                    if (data && data.distinct_dtm_uploads) {
                        setUploadTime(data.distinct_dtm_uploads.map(item => ({ value: item, label: formatDate1(item) })));
                    } else {
                        console.error('Unexpected response structure:', data);
                    }
                })
                .catch(error => console.error('Error fetching Upload Time:', error));
        }


        const filteredColleges = selectedCollege.filter(college => college.value !== 'all');
        const collegeIds = filteredColleges.map(college => college.value);
        console.log('collegeIDs: ', collegeIds);

        get_Batches_API_CLG_ID_NDB(collegeIds)
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




    }, [selectedCollege, selectedCollegeGroups, selectedBatches]);

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



    useEffect(() => {
        if (isManualTestName) return;

        if (triggerFetch1) {
            getCollegeList_Concat_API()
                .then((data) => {
                    // Map the API response to the required format
                    const options = data.map((college) => ({
                        value: college.id,
                        label: college.college_group_concat,
                    }));

                    // Prepend the default option
                    const defaultOption = {
                        value: '',
                        label: 'College - College Branches',
                    };

                    setCollegeList([defaultOption, ...options]); // Add default option at the beginning
                    // setSelectedCollege(defaultOption); // Set the default option as the initial value

                    // ✅ Only reset trigger after successful data fetch
                    setTriggerFetch1(false);
                })
                .catch((error) => console.error("Error fetching college list:", error));
        }

        if (triggerFetch) {
            getcollege_Test_Api()
                .then(data => {
                    // Map the fetched data to dropdown options
                    const collegeOptions = data.map(item => ({
                        value: item.id,
                        label: item.college,
                        code: item.college_code
                    }));

                    // Set the options with an "All" entry at the top
                    setColleges([{ value: 'all', label: 'All' }, ...collegeOptions]);

                    // ✅ Only reset trigger after successful data fetch
                    setTriggerFetch(false);
                })
                .catch(error => {
                    console.error('Error fetching College:', error);
                    // Optionally handle error without resetting trigger if retry is needed
                });
        }



        // getrulesApi()
        // .then(data => {
        //  setRules(data.map(item => ({ value: item.id, label: item.rule_name })));
        // })
        //.catch(error => console.error('Error fetching rules:', error));
        const selectedDate = new Date(startDateTime);

        const day = String(selectedDate.getDate()).padStart(2, '0');
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const year = selectedDate.getFullYear();

        // const questionType = selectedQuestionType ;
        const questionTypeMap = {
            "Aptitude": "Apti",
            "Softskill": "Soft",
            "Technical": "Tech"
        };

        //const shortQuestionType = questionTypeMap[selectedQuestionType] ;
        //  const skillType = selectedSkillType ;
        const formattedDate = `${day}-${month}`;
        const shortQuestionType = selectedQuestionType ? selectedQuestionType.substring(0, 3) : '';
        const shortSkillType = selectedSkillType ? selectedSkillType.substring(0, 3) : '';


        const selectedQuestionLabel = selectedQuestions
            ? (selectedQuestions ? selectedQuestions.label : "")
            : questionPaperPass; // ✅ Ensures valid label


        const selectedCollegeCodes =
            selectedCollege && selectedCollege.length > 0
                ? selectedCollege
                    .map((colItem) => {
                        // Find the corresponding college object to extract its code
                        const foundCollege = colleges.find(c => c.value === colItem.value);
                        return foundCollege?.code;
                    })
                    .filter(Boolean) // Remove any undefined values
                    .join(',')
                : '';

          let collegeCodePart = '';
    if (selectedCollege.length === 1) {
  const foundCollege = colleges.find(c => c.value === selectedCollege[0].value);
  collegeCodePart = (foundCollege?.code || '').replace(/^_+$/, ''); // remove trailing underscores
}
     
if (selectedCollege.length > 1) {
  setTestName([`${shortQuestionType}_${shortSkillType}_${selectedQuestionLabel}_${formattedDate}`].join('_'));
} else {
  setTestName(`${collegeCodePart}_${shortQuestionType}_${shortSkillType}_${selectedQuestionLabel}_${formattedDate}`);
}

 


    }, [
        selectedTestType,
        selectedTestTypeCategory,
        selectedQuestionType,
        selectedSkillType,
        duration,
        selectedCollege,
        selectedQuestions,
        questionPaperPass, // ✅ Ensure changes trigger effect
        questionIdPass,    // ✅ Ensure changes trigger effect
        startDateTime,
        username, triggerFetch, triggerFetch1

    ]);


    const handleCollegeChange = async (selectedOptions) => {
        try {
            setSelectedCollege(selectedOptions);
            console.log('selectedOptions: ', selectedOptions);

            // Fetch college groups for each selected college
            const collegeGroupsData = await Promise.all(
                selectedOptions.map(async (college) => {
                    const data = await getClg_Group_API(college.label); // Fetch college groups
                    return data.map(item => ({
                        value: item.id,
                        label: item.college_group,
                        collegeId: college.value
                    }));
                })
            );

            // Flatten the results to a single array and set it in state
            setCollegeGroups(collegeGroupsData.flat());

            // Fetch batches for selected colleges
            const collegeNames = selectedOptions.map(clg => clg.label);
            const collegeBatchesData = await get_Batches_API_NONDB(collegeNames, []);

            console.log(collegeBatchesData, "Batches Data:"); // Debug the structure of fetched batches
            setStuBatches(collegeBatchesData);

        } catch (error) {
            console.error('Error in handleCollegeChange:', error);
        }
    };



    const handleCollegeGroupsChange = async (selectedGroupOptions) => {
        console.log('selectedCollegeGroup: ', selectedGroupOptions);
        setSelectedCollegeGroups(selectedGroupOptions);

        // Extract the values and send them to the API
        const collegeIds = selectedGroupOptions.map(college => college.value);
        const collegesname = selectedCollege.map(clg => clg.label)
        const collegeBatchesData = await get_Batches_API_NONDB(collegesname, collegeIds);

        console.log(collegeBatchesData, "*****!"); // Verify response data structure
        setStuBatches(collegeBatchesData); // No need for `.flat()` if response is already flat
    };



    const handleBatches = (selectedBatches) => {
        console.log('selectedBatches: ', selectedBatches); // This will show the correct format
        setSelectedBatches(selectedBatches); // This should be correct if selectedBatches is in the expected format
    };
    const normalizeName = (name) => 
  name.replace(/_+/g, "_").trim().toLowerCase();


    useEffect(() => {
  getTestsApi()
    .then(data => console.log("🔥 getTestsApi returned:", data))
    .catch(err => console.error("❌ getTestsApi error:", err));
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
  setIsSubmitting(true);

 try {
    const existingTests = await getTestsApi();
    const duplicate = existingTests.some((test) => test.test_name === testName);

    if (duplicate) {
      console.log("❌ Duplicate test name found:", testName);
      setErrorMessage("Test name already exists. Please write a different test name.");
      setShowError(true);
      setIsSubmitting(false);
      return; // 🚫 Stop here, don’t continue
    }
  } catch (err) {
    console.error("Error fetching existing tests:", err);
    setErrorMessage("Unable to verify test name. Please try again.");
    setShowError(true);
    setIsSubmitting(false);
    return;
  }

  // 🔽 Step 2: Basic validations
  if (testName.includes("/")) {
    setErrorMessage("Test name not allowed to include '/' .");
    setShowError(true);
    setIsSubmitting(false);
    return;
  }
  if (!startDateTime || !endDateTime) {
    setErrorMessage("Start Date and End Date are required.");
    setShowError(true);
    setIsSubmitting(false);
    return;
  }
  if (moment(endDateTime).isBefore(moment(startDateTime))) {
    setErrorMessage("End Date must be after Start Date.");
    setShowError(true);
    setIsSubmitting(false);
    return;
  }

  try {
    // 🔽 Step 3: Fetch metadata
    const [qstnTypes, skillTypes, testTypes, rulesData] = await Promise.all([
      getqstntypeApi(),
      getSkilltypeApi(),
      gettesttypeApi(),
      getrulesApi(),
    ]);

    const formData = new FormData(e.target);

    const questionTypeData = qstnTypes.find(
      (item) => item.question_type === selectedQuestionType
    );
    const skillTypeData = skillTypes.find(
      (item) => item.skill_type === selectedSkillType
    );
    const testtypeData = testTypes.find(
      (item) =>
        item.test_type === selectedTestType &&
        item.test_type_categories === selectedTestTypeCategory
    );

    const questypeID = questionTypeData ? questionTypeData.id : null;
    const skillTypeID = skillTypeData ? skillTypeData.id : null;
    const testTypeID = testtypeData ? testtypeData.id : null;

    const matchedRule = rulesData.find(
      (rule) => rule.rule_name === selectedTestType
    );
    const ruleID = matchedRule ? matchedRule.id : null;

    if (!testTypeID || !questypeID) {
      console.error("One or more IDs are null. Aborting submission.");
      setIsSubmitting(false);
      return;
    }

    // 🔽 Step 4: Prepare base object
    const filteredColleges = selectedCollege.filter(
      (college) => college.value !== "all"
    );
    const collegeIds = filteredColleges?.map((college) => college.value) || [];
    const filteredCollegesGroup = selectedCollegeGroups.filter(
      (college) => college.value !== "all"
    );
    const filteredBatches = selectedBatchNo
      .filter((batch) => batch.value !== "all")
      .map((batch) => ({ value: batch.value, label: batch.label }));

    const question_id_id = selectedQuestions.value || questionIdPass;
    let questionDuration = 0;
    if (durationType === "QuestionTime") {
      const matchingQuestion = questions.find((q) => q.value === question_id_id);
      questionDuration = matchingQuestion
        ? matchingQuestion.duration_of_test
        : 0;
    } else {
      const durationMins = Math.ceil(
        (new Date(endDateTime) - new Date(startDateTime)) / (1000 * 60)
      );
      questionDuration = durationMins;
    }

    const createdBy =
      typeof username === "object" && username.username
        ? username.username
        : "System";

    const baseTestObj = {
      test_name: formData.get("test_name"),
      college_id: collegeIds,
      question_id: question_id_id,
      created_by: createdBy,
      dtm_start: moment(startDateTime).format("YYYY-MM-DD HH:mm:ss"),
      dtm_end: moment(endDateTime).format("YYYY-MM-DD HH:mm:ss"),
      college_name: filteredColleges.map((college) => college.label),
      college_group_id: filteredCollegesGroup.map((college) => college.value),
      batch_no: filteredBatches.map((batch) => batch.value),
      dtm_upload: selectedUploadTime.value || null,
      is_actual_test: isActualTest,
      duration_type: "QuestionTime",
      need_candidate_info: true,
      rules_id: ruleID,
      duration: questionDuration,
      test_type_id: testTypeID,
      question_type_id: questypeID,
      skill_type_id: skillTypeID,
      is_camera_on: camera,
    };

    // 🔽 Step 5: Save test
    if (filteredColleges.length > 1) {
      for (const college of filteredColleges) {
        const foundCollege = colleges.find((c) => c.value === college.value);
        const collegeCode = foundCollege?.code || "";
        // const newTestName = `${collegeCode}_${testName}`;
        const newTestName = `${testName}`;


        const pracOnlineTestForCollege = {
          ...baseTestObj,
          test_name: newTestName,
          college_id: [college.value],
          college_name: [college.label],
        };

        await addNonDatabaseTest_API(pracOnlineTestForCollege);
      }

      setErrorMessage("Tests assigned separately for each college");
      setShowError(true);
      setIsSubmitting(false);
      navigate("/test/test-schedules/");
      return;
    } else {
      await addNonDatabaseTest_API(baseTestObj);
      setErrorMessage("Test Assigned successfully");
      setShowError(true);
      navigate("/test/test-schedules/");
    }
  } catch (error) {
    console.error("❌ Error during submission:", error);
    setErrorMessage(
      "An error occurred while assigning the test. Please try again later."
    );
    setShowError(true);
  } finally {
    setIsSubmitting(false);
  }
};




    const handleCheckboxChange = (checked, setter) => {
        setter(checked);
    };

    return (
        <div className='form-ques-compo'>

            <div className='form-ques-nondb'>
                <div>
                    <div className='form-ques'>
                        <Row>
                            <Col>
                                <form onSubmit={handleSubmit}>
                                    <br />
                                    <Row md={12}>

                                        <Col>
                                            <div className='QuestionName-NDB' controlId='question_name'>
                                                <label className='label5-ques'>Question Name**</label>
                                                <p></p>
                                                {/*}
                                                {questionPaperPass && questionIdPass ? (
                                                    // Display read-only input field when questionPaperPass and questionIdPass have values
                                                    <input
                                                        type="text"
                                                        className='input-ques'
                                                        value={questionPaperPass}

                                                    />
                                                ) : (
                                                    // Display Select dropdown when questionPaperPass and questionIdPass are null
                                                    
                                                    */}
                                                <Select
                                                    style={{ width: "600px" }}
                                                    options={questionsPass}
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


                                                {/*}

                                                )}
*/}
                                            </div>

                                        </Col>
                                        <Col>
                                            <div controlId="instituteName" className='QuestionName-NDB' >
                                                <label className="label5-ques">College Name**</label> <p></p>
                                                <div >

                                                    <Select
                                                        isMulti
                                                        options={userColleges}
                                                        value={selectedCollege}
                                                        onChange={(college) => {
                                                            console.log("College Selected:", college);
                                                            setSelectedCollege(college);
                                                        }}
                                                        placeholder="Select College"
                                                        styles={customStyles}
                                                    />
                                                </div>
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

                                    <Row md={12}>



                                        <Col>
                                            <div controlId="uploadTime" className='QuestionName-NDB' >
                                                <label className="label5-ques">Upload Timing</label> <p></p>
                                                <div >
                                                    <Select
                                                        options={uploadTime}
                                                        value={selectedUploadTime}
                                                        onChange={setSelectedUploadTime}
                                                        placeholder="Select timing.."
                                                        className='option'
                                                        styles={customStyles}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
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
                                    </Row>
                                    <p></p>

                                    <Row md={12}>
                                        <Col >
                                            <div >
                                                <label className='label5-ques'>Start Date</label><p></p>

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
                                                <label className='label5-ques'>End Date</label><p></p>
                                                <DatePicker
                                                    name='dtm_end'
                                                    selected={endDateTime}
                                                    onChange={(date) => setEndDateTime(date)}
                                                    showTimeSelect
                                                    minDate={startDateTime} // Prevent selecting dates before start date
                                                    disabled={!startDateTime}
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

                                        <Col >
                                            <div controlId='need_candidate_info' >
                                                <label className='label5-ques'>Need Candidate Info</label><p></p>
                                                <div>
                                                    <input type="checkbox" id="need_candidate_info_checkbox" checked={needCandidateInfo} style={{ accentColor: 'orange' }} />
                                                    <label htmlFor="need_candidate_info_checkbox"></label>
                                                </div>
                                            </div>
                                        </Col>


                                    </Row>
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
                                        </Row>)}<p></p>

                                    <Row> <Col>
                                        <div className='RulesName-non' controlId='rule_id' >
                                            <label className='label5-ques' >Rule Name</label><p></p>
                                            <Select
                                                options={rules}
                                                value={selectedRulesId}
                                                onChange={setSelectedRulesId}
                                                placeholder="Select rule"
                                                className='opt'
                                                styles={customStyles}
                                            />

                                        </div>
                                    </Col><Col></Col>

                                    </Row>
                                    <p style={{ height: "50px" }}></p><p></p>
                                    <Row>
                                        <Col>
                                            <div className="button-container-lms">
                                                <button onClick={handleGoBackClick} style={{ float: "left", width: "100px", }} className="button-ques-save  back-button-lms">
                                                    <img src={Back} className='nextarrow'></img> <span className="button-text">Back</span>

                                                </button>
                                                <button type="submit" className="button-ques-save save-button-lms" disabled={isSubmitting} style={{ width: "100px", }}>
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