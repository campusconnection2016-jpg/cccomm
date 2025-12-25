import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/trainingadmin.css'
import { Row, Col, Form, Button } from 'react-bootstrap';
import { getLastQuestionPaperApi, addQuestionCodeApi, addQuestionApi_code } from '../../api/endpoints'
import QuestionPaperMCQ from './questionpapermcq';
import QuesPaperTb from './quespapertb';
import Nextarrow from '../../assets/images/nextarrow.png'
import ErrorModal from '../auth/errormodal';
import back from '../../assets/images/backarrow.png';
import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';

const CodeForm = ({ userRole, collegeName }) => {
  const [isTestCase, setIsTestCase] = useState(false);
  console.log("testcase",isTestCase)
  const [formData, setFormData] = useState([
    {
      questionText: '',
      questionTextImage: null,
      mark: '',
      correctAnswer: '',
      explainAnswer: '',
      inputformat: "",
      test_case1:null,
      test_case2:null,
      test_case3:null,
      difficulty_level:""

    },
  ]);
  const [fileNames, setFileNames] = useState({
    questionTextImage: '',
  });
  const [errors, setErrors] = useState({});
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
        setLastQuestionPaper(response);
        setTotalForms(response.no_of_questions);
        setLastQuestionPaperID(response.id);
        if (response.is_testcase !== undefined) {
          setIsTestCase(response.is_testcase);
          console.log("istestcase",response.is_testcase)
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchData();
  }, []);

 
  const handleChange = (e, index) => {
    const { name, value } = e.target;
  
    setFormData((prevFormData) => {
      return prevFormData.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      );
    });
    console.log("Updating:", name, "with value:", value, "at index:", index);
console.log("Updated formData:", formData);

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

        'answer': form.get('correctAnswer'),
        'mark': form.get('mark'),
        'explain_answer': form.get('explainAnswer'),
        'input_format': form.get('inputformat'),
        'test_case1':form.get('test_case1'),
        'test_case2':form.get('test_case2'),
        'test_case3':form.get('test_case3'),
        'difficulty_level':form.get('difficulty_level')
      };

      console.log('Data to Submit: ', dataToSubmit);

      addQuestionApi_code(dataToSubmit)
        .then(() => {
          // alert('Data saved successfully');
          setErrorMessage('Data Added Successfully');
          setShowError(true);
          setFileNames({
            questionTextImage: '',
            optionAImage: '',
            optionBImage: '',
            optionCImage: '',
            optionDImage: ''
          });
          moveToNextForm();

        })
        .catch(error => {
          console.error("Failed to Add Data", error);
          setIsSubmitting(false);
          alert("Failed to Add. Check console for details.");

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
          mark: '',
          correctAnswer: '',
          explainAnswer: '',
          inputformat:'',
          test_case1:'',
      test_case2:'',
      test_case3:'',
       difficulty_level:''
        }]);
      }
    } else if (currentForm >= totalForms - 1) {
      setShowQuestionPaper(true);
    }
  };

  const currentData = formData[currentForm];
  const totalCount = currentForm + 1;

  return (
    <div className='questions'>
      {!isTestAddQues && showQuestionPaper ? (
              userRole === 'Placement Officer' ? (
                <QuesPaperTb collegeName={collegeName} userRole={userRole} />
              ) : (
                <QuesPaperTb />
              )
      ) : (
        <form onSubmit={handleSubmit} className='form-ques-mcq'>
          <div className='header'>
            <h6 >Question Number: {totalCount}</h6>
          </div>

          <div className='attach-code'>
            <label className='label6-ques'>Question Text<span style={{ color: '#F1A128' }}>**</span></label>
            <br />
            <input
              type="text"
              autocomplete="off"
              name="questionText"
              value={currentData.questionText}
              onChange={(e) => handleChange(e, currentForm)}
              className='input-ques-mcq'
              style={{ width: '50%' }}
            />
{/*}
            <label htmlFor="questionTextImage" className="input-button-ques-mcq" >Attachment</label>
            <input
              type="file"
              id="questionTextImage"
              name="questionTextImage"
              onChange={(e) => handleFileChange(e, currentForm)}
              className="input-file-ques-mcq"
            />
            {fileNames.questionTextImage && <span className="file-name">{fileNames.questionTextImage}</span>}
            {errors.questionText && <p className='error-text'>{errors.questionText}</p>}

*/}
          </div><p></p>

          <Row md={12}>
            <Col>
              <div className='code-form'>
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

            {!isTestCase && (
            <Col>
              <div className='code-form'>
                <label className='label5-ques'>Correct Answer<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                <input
                  type="text"
                  name="correctAnswer"
                  autocomplete="off"

                  value={currentData.correctAnswer}
                  onChange={(e) => handleChange(e, currentForm)}
                  className='input-ques'
                />
              </div>
            </Col>)}
            <Col>
              <div className='code-form'>
                <label className='label5-ques'>Explain Answer<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                <textarea
                  type="text"
                  name="explainAnswer"
                  autocomplete="off"
                  value={currentData.explainAnswer}
                  onChange={(e) => handleChange(e, currentForm)}
                  className='input-ques'
                />
              </div>
            </Col>

          </Row>
          {isTestCase && (
          <Row>
          <Col>
              <div className='code-form'>
                <label className='label5-ques'>Test Case1<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                <input
                  type="text"
                  name="test_case1"
                  autocomplete="off"
                 // value={formData[currentForm]?.test_case1 || ""}
                  value={currentData.test_case1}
                  onChange={(e) => handleChange(e, currentForm)}
                  className='input-ques'
                />
              </div>
            </Col>
            <Col>
              <div className='code-form'>
                <label className='label5-ques'>Test Case2<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                <input
                  type="text"
                  name="test_case2"
                  autocomplete="off"
                 // value={formData[currentForm]?.test_case2 || ""}
                  value={currentData.test_case2}
                  onChange={(e) => handleChange(e, currentForm)}
                  className='input-ques'
                />
              </div>
            </Col>
            <Col>
              <div className='code-form'>
                <label className='label5-ques'>Test Case3<span style={{ color: '#F1A128' }}>**</span></label><p></p>
                <input
                  type="text"
                  name="test_case3"
                  autocomplete="off"
                 // value={formData[currentForm]?.test_case3 || ""}
                  value={currentData.test_case3}
                  onChange={(e) => handleChange(e, currentForm)}
                  className='input-ques'
                />
              </div>
            </Col>
          </Row>
          )}<p></p>
          <Row md={12}>
           
             <Col> <label className='label6-ques'>Difficulty Level<span style={{ color: '#F1A128' }}>**</span></label>
                       <p></p>
                      <select
             name="difficulty_level"
             value={currentData.difficulty_level}
             onChange={(e) => handleChange(e, currentForm)}
             className='input-ques'
           >
             <option value="">Select Difficulty Level</option>
             <option value="Easy">Easy</option>
             <option value="Intermediate">Intermediate</option>
             <option value="Challenging">Challenging</option>
              <option value="Difficulty">Difficulty</option>
             <option value="Company_Specific">Company Specific</option>
           </select>
           
                      </Col>
                       <Col>
              <div className='code-form' >
                <label className='label5-ques'>Input Format</label><p></p>
                <textarea
                  type="text"
                  name="inputformat"
                  autocomplete="off"
                  value={currentData.inputformat}
                  onChange={(e) => handleChange(e, currentForm)}
                  className='input-ques'
                />
              </div>
            </Col>
            <Col></Col>


          </Row><p></p>

          <Row md={12}>

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
                ><img src={back} className='nextarrow' ></img>
                  <span className="button-text">Back</span>
                </button>


                <button className='button-ques-save'disabled={isSubmitting}
                  style={{
                    width: "100px"
                  }} type="submit">Save </button>


                <button className="button-ques-next btn btn-secondary next-button-lms"
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
                  <img src={Nextarrow} className='nextarrow' style={{ color: "#6E6D6C" }}></img>
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

export default CodeForm;
