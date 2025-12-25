import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import './questions.css';
import { Row, Col } from 'react-bootstrap';
import { getQuestionsApi_QP_ID, update_MCQ_images_API_NEW } from '../../api/endpoints';
import QuesPaperTb from './quespapertb';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../components/auth/errormodal';
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
const Update_MCQForm = () => {
  const { id } = useParams(); // This id is for the overall question paper or set
  console.log(id);

  const [formData, setFormData] = useState({
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
    correctAnswer: null,
    mark: null,

  });

  const [fileNames, setFileNames] = useState({
    questionTextImage: '',
    optionAImage: '',
    optionBImage: '',
    optionCImage: '',
    optionDImage: ''
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
            optionA: questionData[0].option_a || '',
            optionAImage: questionData[0].option_a_image_data || null,
            optionB: questionData[0].option_b || '',
            optionBImage: questionData[0].option_b_image_data || null,
            optionC: questionData[0].option_c || '',
            optionCImage: questionData[0].option_c_image_data || null,
            optionD: questionData[0].option_d || '',
            optionDImage: questionData[0].option_d_image_data || null,
            correctAnswer: questionData[0].answer || null,
            mark: questionData[0].mark || null,


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
        'option_a_image_data': form.get('optionAImage'),
        'option_b_image_data': form.get('optionBImage'),
        'option_c_image_data': form.get('optionCImage'),
        'option_d_image_data': form.get('optionDImage'),
        'option_a': form.get('optionA'),
        'option_b': form.get('optionB'),
        'option_c': form.get('optionC'),
        'option_d': form.get('optionD'),
        'answer': form.get('correctAnswer'),
        'mark': form.get('mark'),

      };

      console.log('Data to Submit: ', dataToSubmit);
      console.log('Question id: ', questionIds[currentForm]);

      await update_MCQ_images_API_NEW(questionIds[currentForm], dataToSubmit);
      setErrorMessage('Data Updated Successfully');
      setShowError(true);
      //alert('Data updated successfully');
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
        optionA: nextFormData.option_a || '',
        optionAImage: nextFormData.option_a_image_data || null,
        optionB: nextFormData.option_b || '',
        optionBImage: nextFormData.option_b_image_data || null,
        optionC: nextFormData.option_c || '',
        optionCImage: nextFormData.option_c_image_data || null,
        optionD: nextFormData.option_d || '',
        optionDImage: nextFormData.option_d_image_data || null,
        correctAnswer: nextFormData.answer || null,
        mark: nextFormData.mark || null,

      });

      // Reset fileNames when moving to the next form
      setFileNames({
        questionTextImage: '',
        optionAImage: '',
        optionBImage: '',
        optionCImage: '',
        optionDImage: ''
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
        optionA: prevFormData.option_a || '',
        optionAImage: prevFormData.option_a_image_data || null,
        optionB: prevFormData.option_b || '',
        optionBImage: prevFormData.option_b_image_data || null,
        optionC: prevFormData.option_c || '',
        optionCImage: prevFormData.option_c_image_data || null,
        optionD: prevFormData.option_d || '',
        optionDImage: prevFormData.option_d_image_data || null,
        correctAnswer: prevFormData.answer || null,
        mark: prevFormData.mark || null,

      });

      // Reset fileNames when moving to the previous form
      setFileNames({
        questionTextImage: '',
        optionAImage: '',
        optionBImage: '',
        optionCImage: '',
        optionDImage: ''
      });
    }
  };

  const currentData = formData;
  const totalCount = currentForm + 1;

  return (
    <div className='form-ques'>
      {showQuestionPaper ? (
        <QuesPaperTb />
      ) : (
        <form onSubmit={handleSubmit} className='form-update-mcq'>
          {/*   <div className='form-navigation'>
           <h4>Question Number: {totalCount}</h4>  
            <button  style={{ float: 'right'}} type="submit" className='button-ques-save'>Edit</button>
          </div> */}
          {/* <div>
            <button type="submit" className='button-ques-save mcq-edit-btn'>Edit</button>
          </div> */}

          <div>
            <label className='label6-ques'>Question Text</label>
            <br />

            <input
              type="text"
              autocomplete="off"
              name="questionText"
              value={currentData.questionText}
              onChange={handleChange}
              className='input-ques-mcq'
            />

           
            <input
              type="file"
              id="questionTextImage"
              name="questionTextImage"
              onChange={handleFileChange}
              className="input-file-ques-mcq"
            />
            {/*}  {fileNames.questionTextImage && <span className="file-name">{fileNames.questionTextImage}</span>}   */}

            {fileNames.questionTextImage && <span className="file-name">{fileNames.questionTextImage}</span>}
            {currentData.questionTextImage && typeof currentData.questionTextImage === 'string' && (
              <img src={`data:image/jpeg;base64,${currentData.questionTextImage}`} alt="Current logo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
            )}


          </div>

          {['A', 'B', 'C', 'D'].map((option) => (
            <div key={option}>
              <label className='label6-ques'>Option {option}</label>
              <br />

              <input
                type="text"
                autocomplete="off"
                name={`option${option}`}
                value={currentData[`option${option}`]}
                onChange={handleChange}
                className='input-ques-mcq'
              />

              <input
                type="file"
                id={`option${option}Image`}
                name={`option${option}Image`}
                onChange={handleFileChange}
                className="input-file-ques-mcq"
              />
              {/*}  {fileNames[`option${option}Image`] && <span className="file-name">{fileNames[`option${option}Image`]}</span>}     */}


              {fileNames[`option${option}Image`] && <span className="file-name">{fileNames[`option${option}Image`]}</span>}
              {currentData[`option${option}Image`] && typeof currentData[`option${option}Image`] === 'string' && (
                <img src={`data:image/jpeg;base64,${currentData[`option${option}Image`]}`} alt="Current logo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
              )}

            </div>
          ))}

          <Row><p></p>
            <Col><div>
              <label className='label6-ques'>Correct Answer</label> <br />
              <input
                type="text"
                autocomplete="off"
                name="correctAnswer"
                value={currentData.correctAnswer}
                onChange={handleChange}
                className='input-ques-mcq'
              />
            </div></Col>
          </Row>

          <Row><p></p>

            <Col><div>
              <label className='label6-ques'>mark</label> <br />
              <input
                type="text"
                autocomplete="off"
                name="mark"
                value={currentData.mark}
                onChange={handleChange}
                className='input-ques-mcq'
              />
            </div></Col>
          </Row>

        </form>
      )}
      <p></p>
      <div className="form-navigation" style={{ display: 'flex', justifyContent: 'space-between' }}>
        {currentForm > 0 && (
          <button onClick={moveToPreviousForm} className="button-ques-save" style={{ width: "100px" }}>
            <img src={Back} className='nextarrow'></img> Back
          </button>
        )}
        {currentForm < totalForms - 1 && (
          <button onClick={moveToNextForm} className="button-ques-save" style={{ width: "100px" }}>
            Next<img src={Next} className='nextarrow'></img>
          </button>
        )}
      </div>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default Update_MCQForm;
