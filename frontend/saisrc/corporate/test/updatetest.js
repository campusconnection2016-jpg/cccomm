import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getTestUpdateID_API, 
    getrulesApi, 
    getQuestionPaperApi,
    updateTestcandidateApi, 
   
    updateTestMAsterTestNameApi,
    updateTestName_TestReports_API 
} from '../../api/endpoints';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { testNameContext } from './context/testtypecontext';
import moment from 'moment'; // Ensure you have moment.js installed
import TestSchedules from './testschedules';
import Footer from '../../footer/footer';
import Nextarrow from '../../assets/images/nextarrow.png'
import back from '../../assets/images/backarrow.png';
import ErrorModal from '../../components/auth/errormodal';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#39444e',
        '@media (max-width: 768px)': { // Adjust for mobile devices
            fontSize: '12px' // Smaller font size
        }
    })
};
const UpdateTestAccessForm = ({ institute }) => {

    const [tests, setTests] = useState([
        { dtm_start: null, dtm_end: null, duration_type: '', question_id: '', test_name: '', rules_id: '' },
    ]);
    const [questions, setQuestions] = useState([]);
    const [rules, setRules] = useState([]);
    const [testID, setTestID] = useState(null);

    const [durationType, setDurationType] = useState('');
    const { testName } = useContext(testNameContext);
    const [showTestSchedule, setTestSchedule] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const { test_name } = useParams();
    console.log("print test", test_name)

    const handleCloseError = () => {
        setShowError(false);
    };
    useEffect(() => {
        const fetchData = async () => {
            try {

                const testUpdateData = await getTestUpdateID_API(test_name);
                setTests(testUpdateData);
                console.log('setTests: ', testUpdateData);

            } catch (error) {
                console.log(error.message);
            }
        };

        if (testName) {
            fetchData();
        }
    }, []);

    useEffect(() => {
        getrulesApi()
            .then(data => {
                setRules(data.map(item => ({ value: item.id, label: item.rule_name })));
            })
            .catch(error => console.error('Error fetching rules:', error));

        getQuestionPaperApi()
            .then(data => {
                setQuestions(data.map(item => ({ value: item.id, label: item.question_paper_name, test_type: item.test_type })));
            })
            .catch(error => console.error('Error fetching question papers:', error));
    }, []);

    const handleInputChange = (index, field, value) => {
        const updatedTests = [...tests];
        updatedTests[index][field] = value;
        setTests(updatedTests);
    };

    const handleDurationTypeChange_OLD = (event) => {
        const { value } = event.target;
        setDurationType(value);

        console.log('Duration type: ', value);
    };

    const handleDurationTypeChange = (event) => {
        const { value } = event.target;
        const updatedTests = [...tests];
        updatedTests[0].duration_type = value; // Assuming you're updating the first test
        setTests(updatedTests);
        console.log('Duration type: ', value);
    };

    const handleDateChange = (index, field, date) => {
        if (moment.isMoment(date) || date instanceof Date) {
            const formattedDate = moment(date).format('DD-MM-YYYY hh:mm A');
            handleInputChange(index, field, formattedDate);
        } else {
            handleInputChange(index, field, date);
        }
    };

    const handleSubmit = async (e, index) => {
        e.preventDefault();
        const test = tests[index];

        try {
            let durations = 0;
            let durationValue = 0;

            const submitForm = async (durationN) => {
                const dataToSubmit = {
                    testName: test_name,
                    test_name: test.test_name,
                    question_id: test.question_id,
                    // dtm_start: moment(test.dtm_start).toISOString(), // Use toISOString for proper ISO 8601 format
                    // dtm_end: moment(test.dtm_end).toISOString(),
                    // dtm_start: moment(test.dtm_start, 'DD-MM-YYYY hh:mm A').utc().format(),
                    // dtm_end: moment(test.dtm_end, 'DD-MM-YYYY hh:mm A').utc().format(),
                    dtm_start: moment(test.dtm_start, 'DD-MM-YYYY hh:mm A').format('DD-MM-YYYY hh:mm A'),
                    dtm_end: moment(test.dtm_end, 'DD-MM-YYYY hh:mm A').format('DD-MM-YYYY hh:mm A'),


                    duration: durationN,
                    duration_type: test.duration_type,
                    rules_id: test.rules_id,

                };

                const dataToTestName = {
                    testName: test_name,
                    test_name: test.test_name,
                };

                console.log('dataToSubmit: ', dataToSubmit);

                await updateTestcandidateApi(dataToSubmit);
                await updateTestMAsterTestNameApi(dataToTestName);
                await updateTestName_TestReports_API(dataToSubmit);
                setErrorMessage('Data Updated Successfully');
                setShowError(true);
                navigate('/test/test-schedules/');

                // alert('Data Updated Successfully');
                // setTestSchedule(true);
            };

            if (test.duration_type === 'Start&EndTime') {
                const start = moment(test.dtm_start, 'DD-MM-YYYY hh:mm A');
                const end = moment(test.dtm_end, 'DD-MM-YYYY hh:mm A');

                const durations = Math.ceil(end.diff(start, 'minutes')); // Duration in minutes, rounded up
                console.log('Start&End Duration: ', durations);
                submitForm(durations);

            } else if (test.duration_type === 'QuestionTime') {
                const data = await getQuestionPaperApi();
                const matchingDuration = data.find(dur => dur.id === test.question_id);
                durationValue = matchingDuration ? matchingDuration.duration_of_test : 0;
                console.log('Question Time Duration: ', durationValue);
                submitForm(durationValue);
            }

        } catch (error) {
            console.error('Failed to update data:', error);
            setErrorMessage(`Failed to update data: ${error.message}`);
            setShowError(true);

            // alert(`Failed to update data: ${error.message}`);
        }
    };

   



    return (
        <div className='form-ques2'>
            <div>
                <div className='start'>
                    {tests.map((trainee, index) => (
                        <form key={index} onSubmit={(e) => handleSubmit(e, index)} className='form-ques'>
                            <Row>
                                <Col>
                                    <div className='TestName' controlId="testName">
                                        <label className='lable5-ques'>Test Name</label><p></p>
                                        <input
                                            type="text"
                                            value={trainee.test_name}
                                            className='input-ques'
                                            autocomplete="off"
                                            onChange={(e) => handleInputChange(index, 'test_name', e.target.value)}
                                        />
                                    </div>
                                </Col>

                                <Col style={{ marginTop: "-2px" }}>
                                    <div className='QuestionName-update' controlId="questionId">
                                        <label className='lable5-ques'>Question</label><p></p>
                                        <Select
                                            options={questions}
                                            value={questions.find(option => option.value === trainee.question_id)}
                                            onChange={(selectedOption) => handleInputChange(index, 'question_id', selectedOption.value)}
                                            placeholder="Select Question Paper Name"
                                            styles={customStyles}
                                        />
                                    </div>
                                </Col>
                            </Row><p></p>

                            <Row md={12}>
                                <Col>
                                    <div controlId="dtmStart">
                                        <label className='lable5-ques'>Start Date & Time</label><p></p>
                                        <DatePicker
                                            name="dtm_start"
                                            selected={tests[0].dtm_start ? moment(tests[0].dtm_start, 'DD-MM-YYYY hh:mm A').toDate() : null}
                                            onChange={(date) => handleDateChange(0, 'dtm_start', date)}
                                            showTimeSelect
                                            timeFormat="hh:mm aa"
                                            timeIntervals={15}
                                            dateFormat="dd-MM-yyyy, h:mm aa"
                                            timeCaption="Time"
                                            className='input-date-custom32'
                                            required
                                        />
                                    </div>
                                </Col>

                                <Col>
                                    <div controlId="dtmEnd">
                                        <label className='lable5-ques'>End Date & Time</label><p></p>
                                        <DatePicker
                                            name="dtm_end"
                                            selected={tests[0].dtm_end ? moment(tests[0].dtm_end, 'DD-MM-YYYY hh:mm A').toDate() : null}
                                            onChange={(date) => handleDateChange(0, 'dtm_end', date)}
                                            showTimeSelect
                                            timeFormat="hh:mm aa"
                                            timeIntervals={15}
                                            dateFormat="dd-MM-yyyy, h:mm aa"
                                            timeCaption="Time"
                                            className='input-date-custom32'
                                            required
                                        />
                                    </div>
                                </Col>
                            </Row><p></p>

                            <Row>
                                <Col>
                                    <div controlId='duration'>
                                        <label className='lable5-ques'>Duration</label><p></p>
                                        <div className="custom-radio-grouping" >
                                            <label className={`custom-radios ${trainee.duration_type === 'QuestionTime' ? 'selected-radio' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="duration"
                                                    value="QuestionTime"
                                                    onChange={handleDurationTypeChange}
                                                    // required
                                                    checked={trainee.duration_type === "QuestionTime"}
                                                />
                                                <span className="custom-radio-labels" style={{ marginLeft: "10px", color: "white" }} >QuestionTime</span>
                                            </label>
                                            <label className={`custom-radios ${trainee.duration_type === 'Start&EndTime' ? 'selected-radio' : ''}`} style={{ marginLeft: "20px" }}>
                                                <input
                                                    type="radio"
                                                    name="duration"
                                                    value="Start&EndTime"
                                                    onChange={handleDurationTypeChange}
                                                    //required
                                                    checked={trainee.duration_type === "Start&EndTime"}
                                                />
                                                <span className="custom-radio-labels" style={{ marginLeft: "10px", color: "white" }} >Start&End Time</span>
                                            </label>
                                        </div>
                                    </div>
                                </Col>
                                <Col>
                                    <div className='RulesName-update' controlId="ruleId">
                                        <label className='lable5-ques'>Rules</label><p></p>
                                        <Select
                                            options={rules}
                                            value={rules.find(option => option.value === trainee.rules_id)}
                                            onChange={(selectedOption) => handleInputChange(index, 'rules_id', selectedOption.value)}
                                            placeholder="Select Rules"
                                            styles={customStyles}
                                        />
                                    </div>
                                </Col>
                            </Row><p style={{ height: "50px" }}></p>

                            <Row>
                                <Col>
                                    <div className="button-container1">
                                        <button

                                            className="button-ques-save btn btn-secondary back-button-lms"
                                            style={{
                                                width: "100px",
                                                color: 'black',
                                                height: '50px',
                                                backgroundColor: '#F1A128',
                                                cursor: 'not-allowed'
                                            }}
                                            disabled
                                        ><img src={back} className='nextarrow' ></img>
                                            <span className="button-text">Back</span>
                                        </button>
                                        <button style={{ width: "100px" }} className='button-ques-save save-button-lms' type="submit">Update</button>
                                        <button className="button-ques-save btn btn-secondary next-button-lms"
                                            disabled
                                            style={{
                                                width: "100px",
                                                backgroundColor: "#F1A128",
                                                cursor: 'not-allowed',
                                                width: "100px",
                                                color: 'black',
                                                height: '50px',
                                            }} >
                                            <span className="button-text">Next</span>  <img src={Nextarrow} className='nextarrow' style={{ color: "#6E6D6C" }}></img>
                                        </button>
                                    </div>

                                </Col>
                            </Row>

                        </form>

                    ))}
                </div>
            </div> <p style={{ height: "50px" }}></p>
            {/*  <Footer></Footer>*/}
        </div>
    );
};

export default UpdateTestAccessForm;
