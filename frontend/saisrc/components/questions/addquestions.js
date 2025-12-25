import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { AddQuestions_mcq_Api } from '../../api/endpoints';
import ErrorModal from '../auth/errormodal';
import back from '../../assets/images/backarrow.png';
import Nextarrow from '../../assets/images/nextarrow.png';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const AddQuestions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
      const params = new URLSearchParams(location.search);  // ✅ new
      const remarks = params.get("remarks");  // ✅ new
      console.log("Remarks from URL:", remarks); 

    // Initialize state for the form fields
    const [formData, setFormData] = useState({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        optionE:'',
        mark: '',
        mark_method:'',
        correctAnswer: '',
        explainAnswer: '',
        questionImage: null, // Image file for question
        optionAImage: null,  // Image file for option A
        optionBImage: null,  // Image file for option B
        optionCImage: null,  // Image file for option C
        optionDImage: null ,  // Image file for option D
        optionEImage:null,
        sections:'',
         difficulty_level:""

    });

    // New state to store selected file names
    const [fileNames, setFileNames] = useState({
        questionImage: '',
        optionAImage: '',
        optionBImage: '',
        optionCImage: '',
        optionDImage: '',
        optionEImage:'',
    });

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCloseError = () => {
        setShowError(false);
    };

    // Handle change for text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle image change and update file name state
    const handleImageChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        setFormData({
            ...formData,
            [name]: file // Store the file object for image
        });

        // Update the file name state with the selected file's name
        setFileNames({
            ...fileNames,
            [name]: file ? file.name : ''
        });
    };

    // Submit handler (FormData-based for images)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        // Create an object to send to the endpoint
        const dataToSubmit = {
            question_name_id: id,
            question_text: formData.questionText,
            option_a: formData.optionA,
            option_b: formData.optionB,
            option_c: formData.optionC,
            option_d: formData.optionD,
            option_e: formData.optionE,
            answer: formData.correctAnswer,
            mark: formData.mark,
            mark_method:formData.mark_method,
            explain_answer: formData.explainAnswer,
            sections:formData.sections,
            question_image_data: formData.questionImage,  // Passing image as plain data
            option_a_image_data: formData.optionAImage,
            option_b_image_data: formData.optionBImage,
            option_c_image_data: formData.optionCImage,
            option_d_image_data: formData.optionDImage,
            option_e_image_data: formData.optionEImage,
             difficulty_level:formData.difficulty_level
        };

        console.log('DataToSubmit: ', dataToSubmit);

        try {
            // Call the API endpoint
            await AddQuestions_mcq_Api(dataToSubmit);
            setErrorMessage('Data Added Successfully');
            setShowError(true);
            navigate('/question-paper-table');
        } catch (error) {
            console.error("Failed to Add Data", error);
            setErrorMessage(error.message);
            setShowError(true);
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div>
            <form onSubmit={handleSubmit} className='form-ques-mcq'>
                <div className='header'>
                    <h6>Add Questions</h6>
                </div>

                <div className='attach-mcq'>
                    <label className='label6-ques'>Question Text<span style={{ color: '#F1A128' }}>**</span></label>
                    <br />
                    <input
                        type="text"
                        name="questionText"
                        autoComplete="off"
                        value={formData.questionText}
                        onChange={handleChange}
                        className='input-ques-mcq'
                    />

                    <label htmlFor="questionImage" className="input-button-ques-mcq">Attachment</label>
                    <input
                        id='questionImage'
                        type="file"
                        name="questionImage"
                        onChange={handleImageChange}
                        className='input-file-ques-mcq'
                    />
                    {fileNames.questionImage && <span className="file-name">{fileNames.questionImage}</span>}
                </div>

                {['A', 'B', 'C', 'D','E'].map((option) => (
                    <div className='attach-mcq' key={option}>
                        <label className='label6-ques'>
                            Option {option}
                            {option === 'A' || option === 'B' ? <span style={{ color: '#F1A128' }}>**</span> : null}
                        </label>
                        <br />
                        <input
                            type="text"
                            name={`option${option}`}
                            autoComplete="off"
                            value={formData[`option${option}`]}
                            onChange={handleChange}
                            className='input-ques-mcq'
                        />

                        <label htmlFor={`option${option}Image`} className="input-button-ques-mcq">Attachment</label>
                        <input
                            id={`option${option}Image`}
                            type="file"
                            name={`option${option}Image`}
                            onChange={handleImageChange}
                            className='input-file-ques-mcq'
                        />
                        {fileNames[`option${option}Image`] && <span className="file-name">{fileNames[`option${option}Image`]}</span>}
                    </div>
                ))}

                <Row md={12}>
                    <Col>
                        <div className='mcq-form'>
                            <label className='label5-ques'>Mark<span style={{ color: '#F1A128' }}>**</span></label>
                            <p></p>
                            <input
                                type="number"
                                name="mark"
                                autoComplete="off"
                                min="0"
                                value={formData.mark}
                                onChange={handleChange}
                                className='input-ques'
                            />
                        </div>
                    </Col>

                    <Col>
                        <div className='mcq-form'>
                            <label className='label5-ques'>Correct Answer<span style={{ color: '#F1A128' }}>**</span></label>
                            <p></p>
                            <select
                                name="correctAnswer"
                                autoComplete="off"
                                value={formData.correctAnswer}
                                onChange={handleChange}
                                className='input-ques'
                            >
                                <option value="">Select</option>
                                {['A', 'B', 'C', 'D'].map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </Col>

                    </Row>
<Row>
     <Col>
                <div className='mcq-form'>
                    <label className='label7-ques'>Mark Method <span>(psychometry)</span></label><p></p>
                    <select
                        name="mark_method"
                        
                        value={formData.mark_method}
                        onChange={handleChange}
                        className='input-ques'
                       
                    >
                        <option value="">Select Mark Method</option>
                        <option value="A-E">A-E</option>
                        <option value="E-A">E-A</option>
                    </select>
                </div>
            </Col>
            <Col>
            <div className='mcq-form'>
            <label className='label7-ques'>Sections</label><span>(psychometry)</span><p></p>
                   
                    <input
                        type="text"
                        name="sections"
                        autoComplete="off"
                        value={formData.sections}
                        onChange={handleChange}
                        className='input-ques'
                    /></div></Col>
               
</Row>
<Row>
<Col>
                        <div className='mcq-form'>
                            <label className='label7-ques'>Explain Answer</label>
                            <p></p>
                            <textarea
                                type="text"
                                name="explainAnswer"
                                autoComplete="off"
                                value={formData.explainAnswer}
                                onChange={handleChange}
                                className='input-ques'
                            />
                        </div>
                    </Col>
                     <Col> <label className='label6-ques'>Difficulty Level<span style={{ color: '#F1A128' }}>**</span></label>
                               <br />
                              <select
                     name="difficulty_level"
                     value={formData.difficulty_level}
                    onChange={handleChange}

                     className='input-ques-mcq'
                   >
                     <option value="">Select Difficulty Level</option>
                     <option value="Easy">Easy</option>
                     <option value="Intermediate">Intermediate</option>
                     <option value="Challenging">Challenging</option>
                     <option value="Company_Specific">Company Specific</option>
                   </select>
                   
                              </Col>
                              
           
</Row><p></p>
                <Row>
                    <Col>
                        <div className="button-container-lms">
                            <button
                                className="button-ques-save btn btn-secondary back-button-lms"
                                style={{
                                    width: "100px",
                                    color: 'black',
                                    height: '50px',
                                    backgroundColor: '#F1A128',
                                    cursor: 'not-allowed',
                                }}
                                disabled
                            >
                                <img src={back} className='nextarrow' alt="Back" />
                                <span className="button-text">Back</span>
                            </button>

                            <button
                                disabled={isSubmitting}
                                className='button-ques-save save-button-lms'
                                style={{ width: "100px" }}
                                type="submit"
                            >
                                Save
                            </button>

                            <button
                                className="button-ques-save btn btn-secondary next-button-lms"
                                disabled
                                style={{
                                    width: "100px",
                                    color: 'black',
                                    height: '50px',
                                    backgroundColor: '#F1A128',
                                    cursor: 'not-allowed',
                                }}
                            >
                                <span className="button-text">Next</span>
                                <img src={Nextarrow} className='nextarrow' alt="Next" />
                            </button>
                        </div>
                    </Col>
                </Row>

                <ErrorModal show={showError} handleClose={handleCloseError} message={errorMessage} />
            </form>
        </div>
    );
};

export default AddQuestions;
