import React, { useEffect, useState, useRef, useContext } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import {
    addNonDatabaseTest_API,
    getcandidatesApi,
    getQuestionPaperApi,
    getrulesApi,

    getCorporate_logo_API,
    addTestsApi,
    getTestsApi,
    gettesttypeApi,
    getSkilltypeApi,
    getqstntypeApi,
    getCorporate_Collegeid_API,
    getDistinct_Upload_timing_API,
} from '../../api/endpoints';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext } from './context/testtypecontext';
import Footer from '../../footer/footer';
import ErrorModal from '../../components/auth/errormodal'
import { Link } from 'react-router-dom';
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


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

            width: '88%'
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


const NonDatabaseForm = ({ username }) => {
    const navigate = useNavigate();
    const { selectedTestType } = useContext(TestTypeContext);
    const { selectedTestTypeCategory } = useContext(TestTypeCategoriesContext);
    const { selectedQuestionType } = useContext(QuestionTypeContext);
    const { selectedSkillType } = useContext(SkillTypeContext);

    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [rules, setRules] = useState([]);
    const [selectedRulesId, setSelectedRulesId] = useState(null);
    const [needCandidateInfo, setNeedCandidateInfo] = useState(true);
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [durationType, setDurationType] = useState('');
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
    const [camera, setCamera] = useState(false);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setTestName(value);

        // Check if the input contains a '/' character
        if (value.includes('/')) {
            setError(" '/' is not allowed");
        } else {
            setError('');  // Clear the error if '/' is not found
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
        navigate('/test/test-access');
    };
    const handleDurationTypeChange = (event) => {
        const { value } = event.target;
        setDurationType(value);

        console.log('Duration type: ', value);

        // Reset the duration when switching duration types
        //setDuration('');
    };



    const formatDate1 = (dateString) => {
        if (!dateString) {
            return null; // Return null if dateString is null or undefined
        }

        const localDate = moment(dateString).local();
        return localDate.format('DD/MM/YYYY hh:mm A');
    };

    useEffect(() => {
        if (username) {
            fetchCollegesAndReports();
        }
    }, [username]); // Only trigger when username changes

    const fetchCollegesAndReports = async () => {
        try {
            console.log("Step 1: Fetching colleges for username:", username);

            // Step 2: Fetch corporate data
            const corporateData = await getCorporate_logo_API(username);
            console.log("Step 2: Corporate data fetched:", corporateData);

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
            console.log("Step 3: Fetched college IDs:", fetchedColleges);

            if (fetchedColleges.length > 0) {
                setColleges(fetchedColleges);

                // Step 4: Fetch colleges using the retrieved college IDs
                const collegeIDsString = fetchedColleges.join(','); // Convert IDs to a comma-separated string
                console.log("Step 4: Fetching colleges for IDs:", collegeIDsString);

                const testData = await getCorporate_Collegeid_API(collegeIDsString);
                console.log("Step 4: Colleges fetched from API:", testData);

                // Map the fetched colleges into dropdown options
                const collegeOptions = testData.map(item => ({
                    value: item.id, // Include id here
                    label: item.college,
                }));
                console.log("Step 5: Mapped college options:", collegeOptions);

                setColleges([{ value: 'all', label: 'All' }, ...collegeOptions]);
            } else {
                console.warn("Step 3: No colleges found for the username.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setShowError(true);
            setErrorMessage("An error occurred while fetching data.");
        }
    };

    // Additional useEffect for dependencies
    useEffect(() => {
        if (colleges.length > 0) {
            // Fetch upload times for selected college
            if (selectedCollege?.value) {
                console.log('selectedCollege.value:', selectedCollege.value);
                getDistinct_Upload_timing_API(selectedCollege.value)
                    .then(data => {
                        // Access the 'distinct_dtm_uploads' key before mapping
                        setUploadTime(data.distinct_dtm_uploads.map(item => ({ value: item, label: formatDate1(item) })));
                    })
                    .catch(error => console.error('Error fetching Upload Time:', error));
            }

            // Fetch rules
            getrulesApi()
                .then(data => {
                    setRules(data.map(item => ({ value: item.id, label: item.rule_name })));
                })
                .catch(error => console.error('Error fetching rules:', error));

            // Fetch question papers
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

                    setQuestions(filteredQuestions);

                    // Only set duration type if it's 'QuestionTime'
                    if (durationType === 'QuestionTime') {
                        console.log('set duration type: ', durationType);

                        setDurationType(data.map(item => ({ value: item.id, label: item.duration_of_test })));
                    }
                })
                .catch(error => console.error('Error fetching question paper:', error));
        }
    }, [colleges, selectedCollege, selectedTestType, duration]); // Trigger when dependencies change


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (testName.includes('/')) {
            setErrorMessage("Test name not allowed to include '/' .");
            setShowError(true);
            return;  // Exit the function to prevent submission
        }

        setIsSubmitting(true);
        try {
            const [qstnTypes, skillTypes] = await Promise.all([getqstntypeApi(), getSkilltypeApi()]);
            const testTypes = await gettesttypeApi();

            const formData = new FormData(e.target);

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

            console.log('Befor if condition..');
            if (!testTypeID || !questypeID) {
                console.error('One or more IDs are null. Aborting submission.');
                if (!testTypeID) console.error('testTypeID is null');
                if (!questypeID) console.error('questypeID is null');
                if (!skillTypeID) console.error('skillTypeID is null');
                return;
            }

            console.log('After if condition...');

            const existingTests = await getTestsApi();
            const testExists = existingTests.some(test => test.test_name === testMaster.test_name);
            console.log('testExist: ', testExists);

            if (testExists) {
                setErrorMessage("Test name already exists. Please choose a different test name.");
                setShowError(true);
                return;
            }

            const year = formData.get('year');
            let durations = 0;
            let durationValue = 0;

            console.log('selectedCollege: ', selectedCollege);
            console.log('duration type: ', durationType);
            const pracOnlineTest = {
                test_name: formData.get('test_name'),
                question_id: selectedQuestions.value,
                dtm_start: moment(startDateTime).format('YYYY-MM-DD HH:mm:ss'),
                dtm_end: moment(endDateTime).format('YYYY-MM-DD HH:mm:ss'),
                college_id: selectedCollege.value,
                dtm_upload: selectedUploadTime.value || null,

                // dtm_start: moment(startDateTime).format('YYYY-MM-DD HH:mm:ss'),
                // dtm_end: moment(endDateTime).format('YYYY-MM-DD HH:mm:ss'),

                is_actual_test: isActualTest,
                duration: 0,
                duration_type: durationType,
                rules_id: selectedRulesId.value,
                need_candidate_info: needCandidateInfo,
                test_type_id: testTypeID,
                question_type_id: questypeID,
                skill_type_id: skillTypeID,
                is_camera_on: camera
            };

            console.log('before Submit form...');

            const submitForm = async (durationN) => {
                pracOnlineTest.duration = durationN;
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

            console.log('after submit form...');

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
                        setErrorMessage("Failed to fetch question paper data. Check console for details.");
                        setShowError(true);
                        // alert("Failed to fetch question paper data. Check console for details.");
                    });
            }
        } catch (error) {
            console.error("Error during submission:", error);
        }
        finally {
            setIsSubmitting(false); // Re-enable the button after processing
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
                                        <Col >
                                            <div className='TestName' controlId='test_name' >
                                                <label className='label5-ques'>Test Name</label><p></p>
                                                <input type="text" className='input-ques' onChange={handleInputChange} autocomplete="off" value={testName} name="test_name" required placeholder="" />
                                                {error && <p style={{ color: 'white' }}>{error}</p>}

                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='QuestionName-non' controlId='question_name' >
                                                <label className='label5-ques' >Question Name</label><p></p>
                                                <Select style={{ width: "600px" }}
                                                    options={questions}
                                                    value={selectedQuestions}
                                                    onChange={setSelectedQuestions}
                                                    placeholder="Select Question Name"
                                                    className='opt'
                                                    styles={customStyles}
                                                    isSearchable={true} // Enable the searchable feature

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
                                            <div controlId="instituteName" >
                                                <label className="label5-ques">College Name</label> <p></p>
                                                <div >
                                                    <Select
                                                        options={colleges}
                                                        value={selectedCollege}
                                                        onChange={setSelectedCollege}
                                                        placeholder="Select College"
                                                        className='option'
                                                        styles={customStyles}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div controlId="uploadTime" >
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
                                    </Row>
                                    <p></p>

                                    <Row md={12}>
                                        <Col  >
                                            <div >
                                                <Form.Group controlId='duration'>
                                                    <label className='label5-ques'>Duration</label><p></p>
                                                    <div className="custom-radio-grouping" style={{ marginLeft: "50px" }}>
                                                        <label className="custom-radios">
                                                            <input
                                                                type="radio"
                                                                name="duration"
                                                                value="QuestionTime"
                                                                onChange={handleDurationTypeChange}
                                                                required
                                                            />
                                                            <span className="custom-radio-labels" style={{ marginLeft: "10px", color: "white" }} >QuestionTime</span>
                                                        </label><p></p>
                                                        <label className="custom-radios" >
                                                            <input
                                                                type="radio"
                                                                name="duration"
                                                                value="Start&EndTime"
                                                                onChange={handleDurationTypeChange}
                                                                required
                                                            />
                                                            <span className="custom-radio-labels" style={{ marginLeft: "10px", color: "white" }} >Start&End Time</span>
                                                        </label>
                                                    </div>
                                                </Form.Group>
                                            </div>
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


                                    </Row><p></p>

                                    <Row md={12}>


                                        <Col>
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
                                        </Col>

                                        <Col>
                                            <div controlId='is_camera_on' style={{ marginLeft: "-198px" }}>
                                                <label className='label5-ques' style={{ marginLeft: "200px" }}>Is Camera ON</label><p></p>
                                                <div style={{ marginLeft: "200px" }}>
                                                    <input type="checkbox" id="is_camera_on_checkbox" checked={camera} onChange={(e) => handleCheckboxChange(e.target.checked, setCamera)} />
                                                    <label htmlFor="is_camera_on_checkbox"></label>
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