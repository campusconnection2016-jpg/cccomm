import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import './questions.css';
import { Row, Col } from 'react-bootstrap';
import { getQuestionsApi_QP_ID, updateQuestionApi_IO_code } from '../../api/endpoints';
//import QuesPaperTb from './QuesPaperTb';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../components/auth/errormodal'
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
const CodeForms = () => {
  const { id } = useParams(); // This id is for the overall question paper or set
  console.log(id);

  const [formData, setFormData] = useState({
    questionText: '',
    questionTextImage: null,
    inputformat: '',
    correctAnswer: null,
    explainAnswer: '',

  });

  const [fileNames, setFileNames] = useState({
    questionTextImage: '',

  });

  const [currentForm, setCurrentForm] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [questionIds, setQuestionIds] = useState([]); // To store IDs of individual questions
  const [questionsData, setQuestionsData] = useState([]); // Store all question data
  const [showQuestionPaper, setShowQuestionPaper] = useState(false); // Initialize showQuestionPaper
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseError = () => {
    setShowError(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getQuestionsApi_QP_ID(id);
        const questionData = response; // Access the data correctly

        setQuestionsData(questionData);
        console.log('setQuestionsData', questionData);

        setTotalForms(questionData.length); // Set total forms based on the length of the array
        console.log('setTotalForms', questionData.length);

        setQuestionIds(questionData.map(q => q.id)); // Assuming response has question ids
        console.log('setQuestionIds', questionData.map(q => q.id));

        if (questionData.length > 0) {
          setFormData({
            questionText: questionData[0].question_text || '',
            questionTextImage: questionData[0].question_image_data || null,
            inputformat: questionData[0].input_format || null,
            correctAnswer: questionData[0].answer || null,
            explainAnswer: questionData[0].explain_answer || null,

          });
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
    setFileNames({ ...fileNames, [name]: files[0] ? files[0].name : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }

    try {
      const dataToSubmit = {
        //  'question_name_id': questionIds[currentForm], // Use the current question ID
        'question_text': form.get('questionText'),
        'question_image_data': form.get('questionTextImage'),
        'input_format': form.get('inputformat'),
        'answer': form.get('correctAnswer'),
        'explain_answer': form.get('explainAnswer'),

      };

      console.log('Data to Submit: ', dataToSubmit);
      console.log('Question id: ', questionIds[currentForm]);

      await updateQuestionApi_IO_code(questionIds[currentForm], dataToSubmit);
      //alert('Data updated successfully');
      setErrorMessage('Data Updated Successfully');
      setShowError(true);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const moveToNextForm = () => {
    if (currentForm < totalForms - 1) {
      setCurrentForm(currentForm + 1);
      const nextFormData = questionsData[currentForm + 1];

      setFormData({
        questionText: nextFormData.question_text || '',
        questionTextImage: nextFormData.question_image_data || null,
        inputformat: nextFormData.input_format || '',
        correctAnswer: nextFormData.answer || null,
        explainAnswer: nextFormData.explain_answer || '',

      });
    }
  };

  const moveToPreviousForm = () => {
    if (currentForm > 0) {
      setCurrentForm(currentForm - 1);
      const prevFormData = questionsData[currentForm - 1];

      setFormData({
        questionText: prevFormData.question_text || '',
        questionTextImage: prevFormData.question_image_data || null,
        inputformat: prevFormData.input_format || '',
        correctAnswer: prevFormData.answer || null,
        explainAnswer: prevFormData.explain_answer || '',

      });
    }
  };

  const currentData = formData;
  const totalCount = currentForm + 1;

  return (
    <div className='form-update-code' style={{ height: "500px" }}>
     
        <form onSubmit={handleSubmit} className='form-update-mcq'>
          {/*   <div className='form-navigation'>
           <h4>Question Number: {totalCount}</h4>  
            <button  style={{ float: 'right'}} type="submit" className='button-ques-save'>Edit</button>
          </div> */}
         

          <div>
            <label className='label6-ques'>Question Text</label>
            <br />

            <input
              type="text"
              name="questionText"
               autocomplete="off"
              value={currentData.questionText}
              onChange={handleChange}
              className='input-ques-mcq'
              style={{ width: '50%' }}
            />

            <label htmlFor="questionTextImage" className="input-button-ques-mcq">Attachment</label>
            <input
              type="file"
              id="questionTextImage"
              name="questionTextImage"
              onChange={handleFileChange}
              className="input-file-ques-mcq"
            />
            {fileNames.questionTextImage && <span className="file-name">{fileNames.questionTextImage}</span>}

          </div>


          <Row md={12}><Col>
            <div >
              <label className='label6-ques'>Input Format</label><p></p>
              <textarea
                type="text"
                name="inputformat"
                 autocomplete="off"
                value={currentData.inputformat}
                onChange={handleChange}
                className='input-ques'
              />
            </div></Col>
            <Col>
              <div>
                <label className='label6-ques'>Correct Answer</label><p></p>
                <input
                  type="text"
                   autocomplete="off"
                  name="correctAnswer"
                  value={currentData.correctAnswer}
                  onChange={handleChange}
                  className='input-ques'
                />
              </div></Col>
            <Col>
              <div >
                <label className='label6-ques'>Explain Answer</label><p></p>
                <textarea
                  type="text"
                  name="explainAnswer"
                   autocomplete="off"
                  value={currentData.explainAnswer}
                  onChange={handleChange}
                  className='input-ques'
                />
              </div></Col>
          </Row>


        </form>
      <p></p>
      <div className="form-navigation" style={{ display: 'flex', justifyContent: 'space-between' }}>
        {currentForm > 0 && (
          <button onClick={moveToPreviousForm} className="button-ques-save" style={{ width: "100px" }}>
            <img src={Back} className='nextarrow' alt='Back' /> Back
          </button>
        )}



        {currentForm < totalForms - 1 && (
          <button onClick={moveToNextForm} className="button-ques-save" style={{ width: "100px" }}>
            Next <img src={Next} className='nextarrow' alt='Next' />
          </button>
        )}
      </div>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default CodeForms;
