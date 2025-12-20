import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import { getLastQuestionPaperApi, addQuestionApi_IO_CSRF } from '../../api/endpoints';
import QuesPaperTb from './quespapertb';
import Nextarrow from '../../assets/images/nextarrow.png'
import ErrorModal from '../auth/errormodal';
import back from '../../assets/images/backarrow.png';
import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';

const MCQForm = ({ userRole, collegeName,selectedTopic, selectedSubTopic, no_of_questions, questionPaperId ,onComplete}) => {
 
  console.log("selectedTopic", selectedTopic, selectedSubTopic,no_of_questions)
  const [formData, setFormData] = useState([
    {
      questionText: '',
      questionTextImage: null,
      optionA: '',
      optionAImage: null,
      optionB: '',
      optionBImage: null,
      optionC: '',
      optionCImage: null,
      optionD: '',
      optionDImage: null,
      optionE: '',
      optionEImage: null,
      mark: '',
      mark_method:'',
      correctAnswer: '',
      explainAnswer: '',
      sections:"",
      difficulty_level:""
    },
  ]);

  const [fileNames, setFileNames] = useState({
    questionTextImage: '',
    optionAImage: '',
    optionBImage: '',
    optionCImage: '',
    optionDImage: '',
    optionEImage:"",
    correctAnswer: '',

  });

  const [currentForm, setCurrentForm] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [lastQuestionPaper, setLastQuestionPaper] = useState(null);
  const [lastQuestionPaperID, setLastQuestionPaperID] = useState(null);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  
      const {
          setQuestionPaperCon,
          setSubtopicCon,
          isTestAddQues
       } = useTestQuesContext();
     
  
  

  const handleCloseError = () => {
    setShowError(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getLastQuestionPaperApi();
        setLastQuestionPaper(response); // Ensure you're accessing the data correctly
        console.log('setLastQuestionPaper: ', response);

        setTotalForms(response.no_of_questions);
        console.log('setTotalForms: ', response.no_of_questions);

        setLastQuestionPaperID(response.id);
        console.log('setLastQuestionPaperID: ', response.id);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedFormData = [...formData];
    updatedFormData[index][name] = value;
    setFormData(updatedFormData);
  };

  const handleFileChange = (e, index) => {
    const { name, files } = e.target;
    if (!formData[index]) return;

    const updatedFormData = [...formData];
    updatedFormData[index][name] = files[0];
    setFormData(updatedFormData);

    setFileNames({ ...fileNames, [name]: files[0] ? files[0].name : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const currentData = formData[currentForm];
    const form = new FormData();
    for (const key in currentData) {
      form.append(key, currentData[key]);
    }

    try {
      const dataToSubmit = {
        'question_name_id': lastQuestionPaperID,
        'question_text': form.get('questionText'),
        'question_image_data': form.get('questionTextImage'),
        'option_a_image_data': form.get('optionAImage'),
        'option_b_image_data': form.get('optionBImage'),
        'option_c_image_data': form.get('optionCImage'),
        'option_d_image_data': form.get('optionDImage'),
        'option_e_image_data': form.get('optionEImage'),
        'option_a': form.get('optionA'),
        
        'option_b': form.get('optionB'),
        'option_c': form.get('optionC'),
        'option_d': form.get('optionD'),
        'option_e': form.get('optionE'),
        'answer': form.get('correctAnswer'),
        'mark': form.get('mark'),
        'explain_answer': form.get('explainAnswer'),
        
        'mark_method':form.get('mark_method'),
        'sections':form.get('sections'),
        'difficulty_level':form.get('difficulty_level')
      };

      console.log('Data to Submit: ', dataToSubmit);

      addQuestionApi_IO_CSRF(dataToSubmit)
        .then(() => {
          // alert('Data saved successfully');
          setErrorMessage('Data Added Successfully');
          setShowError(true);
          setFileNames({
            questionTextImage: '',
            optionAImage: '',
            optionBImage: '',
            optionCImage: '',
            optionDImage: '',
            optionEImage: ''
          });
          moveToNextForm();

        })
        .catch(error => {
          console.error("Failed to Add Data", error);
          setIsSubmitting(false);
          setErrorMessage(error.message); // Set the specific error message
          setShowError(true);

        });
    } catch (error) {
      console.error('Error saving data:', error);
    }
    finally {
      setIsSubmitting(false); // Re-enable the button after processing
    }
  };

  const moveToNextForm = () => {
    if (currentForm < totalForms - 1) {
      setCurrentForm(currentForm + 1);
      if (formData.length <= currentForm + 1) {
        setFormData([...formData, {
          questionText: '',
          questionTextImage: null,
          optionA: '',
          optionAImage: null,
          optionB: '',
          optionBImage: null,
          optionC: '',
          optionCImage: null,
          optionD: '',
          optionDImage: null,
          optionE: '',
          optionEImage: null,
          mark_method:'',
          mark: '',
          correctAnswer: '',
          explainAnswer: '',
          scetions:"",
          difficulty_level:""
        }]);


      }
    } else if (currentForm >= totalForms - 1) {
      setShowQuestionPaper(true);
    }
  };

  const currentData = formData[currentForm];
  const totalCount = currentForm + 1;

  return (
    <div>
      {!isTestAddQues && showQuestionPaper ? (
        userRole === 'Placement Officer' ? (
          <QuesPaperTb collegeName={collegeName} />
        ) : (
          <QuesPaperTb />
        )
      ) : (
        <form onSubmit={handleSubmit} className='form-ques-mcq'>
          <div className='header'>
            <h6 >Question Number: {totalCount}</h6>
          </div>

          <div className='attach-mcq' >
            <label className='label6-ques'>Question Text<span style={{ color: '#F1A128' }}>**</span></label>
            <br />
            <input
              type="text"
              name="questionText"
              autocomplete="off"
              value={currentData.questionText}
              onChange={(e) => handleChange(e, currentForm)}
              className='input-ques-mcq'
            />

            <label htmlFor="questionTextImage" className="input-button-ques-mcq">Attachment</label>
            <input
              type="file"
              id="questionTextImage"

              name="questionTextImage"
              onChange={(e) => handleFileChange(e, currentForm)}
              className="input-file-ques-mcq"
            />
            {fileNames.questionTextImage && <span className="file-name">{fileNames.questionTextImage}</span>}

          </div>

         {!(selectedTopic === "Communication" &&
  (selectedSubTopic === "AudioTyping" || selectedSubTopic === "Pronunciation")) && (
    ['A', 'B', 'C', 'D', ...(selectedTopic === "Psychometry" ? ['E'] : [])].map((option) => (
      <div className='attach-mcq' key={option}>
        <label className='label6-ques'>
          Option {option}
          {option === 'A' || option === 'B' ? <span style={{ color: '#F1A128' }}>**</span> : null}
        </label>
        <br />
        <input
          type="text"
          autoComplete="off"
          name={`option${option}`}
          value={currentData[`option${option}`]}
          onChange={(e) => handleChange(e, currentForm)}
          className='input-ques-mcq'
        />

        <label htmlFor={`option${option}Image`} className="input-button-ques-mcq">Attachment</label>
        <input
          type="file"
          id={`option${option}Image`}
          name={`option${option}Image`}
          onChange={(e) => handleFileChange(e, currentForm)}
          className="input-file-ques-mcq"
        />
        {fileNames[`option${option}Image`] && (
          <span className="file-name">{fileNames[`option${option}Image`]}</span>
        )}
      </div>
    ))
)}


          <p></p>
          <Row>
             <Col> <label className='label6-ques'>Difficulty Level<span style={{ color: '#F1A128' }}>**</span></label>
            <br />
           <select
  name="difficulty_level"
  value={currentData.difficulty_level}
  onChange={(e) => handleChange(e, currentForm)}
  className='input-ques-mcq'
>
  <option value="">Select Difficulty Level</option>
  <option value="Easy">Easy</option>
  <option value="Intermediate">Intermediate</option>
  <option value="Challenging">Challenging</option>
     <option value="Difficulty">Difficulty</option>
  <option value="Company_Specific">Company Specific</option>
</select>

           </Col>
           
          </Row>
          {selectedTopic !== "Psychometry" && (
          <Row md={12}>
            <Col>
              <div className='mcq-form'>
                <label className='label5-ques'>Mark<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                <input
                  type="number"
                  name="mark"
                  autocomplete="off"
                  min="0"
                  value={currentData.mark}
                  onChange={(e) => handleChange(e, currentForm)}
                  className='input-ques'
                />
              </div>
            </Col>

          <Col>
  <div className='mcq-form'>
    <label className='label5-ques'>
      Correct Answer<span style={{ color: '#F1A128' }}>**</span>
    </label>
    <p></p>

    {/* ✅ CASE 1: Communication + AudioTyping/Pronunciation → Text input only */}
    {selectedTopic === "Communication" &&
    (selectedSubTopic === "AudioTyping" || selectedSubTopic === "Pronunciation") ? (
      <input
        type="text"
        name="correctAnswer"
        autoComplete="off"
        value={currentData.correctAnswer}
        onChange={(e) => handleChange(e, currentForm)}
        className='input-ques'
      />
    ) : (
      // ✅ CASE 2: All other topics → Dropdown
      <select
        name="correctAnswer"
        autoComplete="off"
        value={currentData.correctAnswer}
        onChange={(e) => handleChange(e, currentForm)}
        className='input-ques'
      >
        <option value="">Select</option>
        {['A', 'B', 'C', 'D'].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )}
  </div>
</Col>

           {!(selectedTopic === "Communication" &&
  (selectedSubTopic === "AudioTyping" || selectedSubTopic === "Pronunciation")) && (
  <Col>
    <div className='mcq-form'>
      <label className='label7-ques'>Explain Answer</label><p></p>
      <textarea
        type="text"
        name="explainAnswer"
        autoComplete="off"
        value={currentData.explainAnswer}
        onChange={(e) => handleChange(e, currentForm)}
        className='input-ques'
      />
    </div>
  </Col>
)}

           
          </Row>
          )}
{selectedTopic === "Psychometry" && (
    <Row>
        <Col>
            <div className='mcq-form'>
                <label className='label7-ques'>Mark Method<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                <select
                    name="mark_method"
                    value={currentData.mark_method}
                    onChange={(e) => handleChange(e, currentForm)}
                    className='input-ques'
                    required
                >
                    <option value="">Select Mark Method</option>
                    <option value="A-E">A-E</option>
                    <option value="E-A">E-A</option>
                </select>
            </div>
        </Col>
        
        <Col>
         <div className='mcq-form'>
          <label className='label6-ques'>Sections<span style={{ color: '#F1A128' }}>**</span></label>
           <p></p>
            <input
              type="text"
              name="sections"
              autocomplete="off"
              value={currentData.sections}
              onChange={(e) => handleChange(e, currentForm)}
              className='input-ques'
            /></div>
        </Col>
    </Row>
)}

          <p style={{ height: "50px" }}></p>
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
                ><img src={back} className='nextarrow' alt="Back" />
                  <span className="button-text">Back</span>
                </button>

                <button
                  disabled={isSubmitting}
                  className='button-ques-save save-button-lms'
                  style={{ width: "100px" }}
                  type="submit">
                  Save
                </button>


                <button
                  className="button-ques-save btn btn-secondary next-button-lms"
                  disabled
                  style={{
                    width: "100px",
                    backgroundColor: "#F1A128",
                    cursor: 'not-allowed',
                    width: "100px",
                    color: 'black',
                    height: '50px',
                  }} >
                  <span className="button-text">Next</span>
                  <img src={Nextarrow} className='nextarrow' style={{ color: "#6E6D6C" }} alt="Next" />
                </button>
              </div>
            </Col>
          </Row>
        </form>
      )}
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default MCQForm;
