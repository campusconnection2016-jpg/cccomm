import React, { useEffect, useState } from "react";
import axios from "axios";
//import './questions.css';
import { Row, Col } from "react-bootstrap";
import {
  getQuestionsApi_QP_ID,
  update_MCQ_images_API_NEW,
} from "../../api/endpoints";
import QuesPaperTb from "./quespapertb";
import { useParams, useLocation } from "react-router-dom";
import ErrorModal from "../auth/errormodal";
import Next from "../../assets/images/nextarrow.png";
import Back from "../../assets/images/backarrow.png";
const Update_MCQForm = () => {
  const { id } = useParams(); // This id is for the overall question paper or set
  console.log(id);
  const location = useLocation();   // ✅ new
  const params = new URLSearchParams(location.search);  // ✅ new
  const remarks = params.get("remarks");  // ✅ new
  console.log("Remarks from URL:", remarks);

  const [formData, setFormData] = useState({
    questionText: "",
    questionTextImage: null,
    optionA: "",
    optionAImage: null,
    optionB: "",
    optionBImage: null,
    optionC: "",
    optionCImage: null,
    optionD: "",
    optionDImage: null,
    optionE: "",
    optionEImage: null,
    correctAnswer: null,
    mark: null,
    mark_method:null,
    sections:"",
     difficulty_level:""
  });

  const [fileNames, setFileNames] = useState({
    questionTextImage: "",
    optionAImage: "",
    optionBImage: "",
    optionCImage: "",
    optionDImage: "",
    optionEImage:"",
  });
  const [questionTopic, setQuestionTopic] = useState("");
  const [currentForm, setCurrentForm] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [questionIds, setQuestionIds] = useState([]); // To store IDs of individual questions
  const [questionsData, setQuestionsData] = useState([]); // Store all question data
  const [showQuestionPaper, setShowQuestionPaper] = useState(false); // Initialize showQuestionPaper
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseError = () => {
    setShowError(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getQuestionsApi_QP_ID(id);
        const questionData = response; // Access the data correctly

        setQuestionsData(questionData);
        console.log("setQuestionsData", questionData);

        setTotalForms(questionData.length); // Set total forms based on the length of the array
        console.log("setTotalForms", questionData.length);

        setQuestionIds(questionData.map((q) => q.id)); // Assuming response has question ids
        console.log(
          "setQuestionIds",
          questionData.map((q) => q.id)
        );
        if (questionData.length > 0) {
          setQuestionTopic(questionData[0].topic.trim());
        //  setQuestionTopic(questionData[0].topic || ""); // ✅ Store topic
          console.log("Fetched Topic:", questionData[0].topic);
      }
        if (questionData.length > 0) {
            setFormData({
            questionText: questionData[0].question_text || "",
            questionTextImage: questionData[0].question_image_data || null,
            optionA: questionData[0].option_a || "",
            optionAImage: questionData[0].option_a_image_data || null,
            optionB: questionData[0].option_b || "",
            optionBImage: questionData[0].option_b_image_data || null,
            optionC: questionData[0].option_c || "",
            optionCImage: questionData[0].option_c_image_data || null,
            optionD: questionData[0].option_d || "",
            optionDImage: questionData[0].option_d_image_data || null,
            optionE: questionData[0].option_e || "",
            optionEImage: questionData[0].option_e_image_data || null,
            correctAnswer: questionData[0].answer || null,
            mark_method: questionData[0].mark_method || null,
            mark: questionData[0].mark || null,
            sections:questionData[0].sections||null,
             difficulty_level:questionData[0].difficulty_level||''
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
    setFileNames({ ...fileNames, [name]: files[0] ? files[0].name : "" });
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
        question_text: form.get("questionText"),
        question_image_data: form.get("questionTextImage"),
        option_a_image_data: form.get("optionAImage"),
        option_b_image_data: form.get("optionBImage"),
        option_c_image_data: form.get("optionCImage"),
        option_d_image_data: form.get("optionDImage"),
        option_e_image_data: form.get("optionEImage"),
        option_a: form.get("optionA"),
        option_b: form.get("optionB"),
        option_c: form.get("optionC"),
        option_d: form.get("optionD"),
        option_e: form.get("optionE"),
        answer: form.get("correctAnswer"),
        mark: form.get("mark"),
        mark_method:form.get("mark_method"),
        sections:form.get("sections"),
         difficulty_level:form.get('difficulty_level')
      };

      console.log("Data to Submit: ", dataToSubmit);
      console.log("Question id: ", questionIds[currentForm]);
      console.log("Payload before sending:", JSON.stringify(dataToSubmit, null, 2));
      await update_MCQ_images_API_NEW(questionIds[currentForm], dataToSubmit);
      setErrorMessage("Data Updated Successfully");
      setShowError(true);
      //alert('Data updated successfully');
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const moveToNextForm = () => {
    if (currentForm < totalForms - 1) {
      setCurrentForm(currentForm + 1);
      const nextFormData = questionsData[currentForm + 1];

      setFormData({
        questionText: nextFormData.question_text || "",
        questionTextImage: nextFormData.question_image_data || null,
        optionA: nextFormData.option_a || "",
        optionAImage: nextFormData.option_a_image_data || null,
        optionB: nextFormData.option_b || "",
        optionBImage: nextFormData.option_b_image_data || null,
        optionC: nextFormData.option_c || "",
        optionCImage: nextFormData.option_c_image_data || null,
        optionD: nextFormData.option_d || "",
        optionDImage: nextFormData.option_d_image_data || null,
        optionE: nextFormData.option_e || "",
        optionEImage: nextFormData.option_e_image_data || null,
        correctAnswer: nextFormData.answer || null,
        mark: nextFormData.mark || null,
        mark_method:nextFormData.mark_method||null,
        sections:nextFormData.sections||null,
         difficulty_level:nextFormData.difficulty_level||''
      });

      // Reset fileNames when moving to the next form
      setFileNames({
        questionTextImage: "",
        optionAImage: "",
        optionBImage: "",
        optionCImage: "",
        optionDImage: "",
        optionEImage:"",
      });
    }
  };

  const moveToPreviousForm = () => {
    if (currentForm > 0) {
      setCurrentForm(currentForm - 1);
      const prevFormData = questionsData[currentForm - 1];

      setFormData({
        questionText: prevFormData.question_text || "",
        questionTextImage: prevFormData.question_image_data || null,
        optionA: prevFormData.option_a || "",
        optionAImage: prevFormData.option_a_image_data || null,
        optionB: prevFormData.option_b || "",
        optionBImage: prevFormData.option_b_image_data || null,
        optionC: prevFormData.option_c || "",
        optionCImage: prevFormData.option_c_image_data || null,
        optionD: prevFormData.option_d || "",
        optionDImage: prevFormData.option_d_image_data || null,
        optionE: prevFormData.option_e || "",
        optionEImage: prevFormData.option_e_image_data || null,
        correctAnswer: prevFormData.answer || null,
        mark: prevFormData.mark || null,
mark_method:prevFormData.mark_method||null,
sections:prevFormData.sections||null,
 difficulty_level:prevFormData.difficulty_level||""
      });

      // Reset fileNames when moving to the previous form
      setFileNames({
        questionTextImage: "",
        optionAImage: "",
        optionBImage: "",
        optionCImage: "",
        optionDImage: "",
        optionEImage:"",
      });
    }
  };

  const currentData = formData;
  const totalCount = currentForm + 1;

  return (
    <div>
      {showQuestionPaper ? (
        <QuesPaperTb />
      ) : (
        <form onSubmit={handleSubmit} className="form-update-mcq">
          {/*   <div className='form-navigation'>
           <h4>Question Number: {totalCount}</h4>  
            <button  style={{ float: 'right'}} type="submit" className='button-ques-save'>Edit</button>
          </div> */}
          <div>
            <button type="submit" className="button-ques-save mcq-edit-btn">
              Edit
            </button>
          </div>

          <div>
            <label className="label6-ques">Question Text</label>
            <br />

            <input
              type="text"
              autocomplete="off"
              name="questionText"
              value={currentData.questionText}
              onChange={handleChange}
              className="input-ques-mcq"
            />

            <label
              htmlFor="questionTextImage"
              className="input-button-ques-mcq"
            >
              Attachment
            </label>
            <input
              type="file"
              id="questionTextImage"
              name="questionTextImage"
              onChange={handleFileChange}
              className="input-file-ques-mcq"
            />
            {/*}  {fileNames.questionTextImage && <span className="file-name">{fileNames.questionTextImage}</span>}   */}

            {fileNames.questionTextImage && (
              <span className="file-name">{fileNames.questionTextImage}</span>
            )}
            {currentData.questionTextImage &&
              typeof currentData.questionTextImage === "string" && (
                <img
                  src={`data:image/jpeg;base64,${currentData.questionTextImage}`}
                  alt="Current logo"
                  style={{ maxWidth: "100px", maxHeight: "100px" }}
                />
              )}
          </div>

          {["A", "B", "C", "D", ...(questionTopic === "Psychometry" ? ["E"] : [])].map((option) => (
    <div key={option}>
        <label className="label6-ques">Option {option}</label>
        <br />

        <input
            type="text"
            autoComplete="off"
            name={`option${option}`}
            value={currentData[`option${option}`]}
            onChange={handleChange}
            className="input-ques-mcq"
        />

        <label
            htmlFor={`option${option}Image`}
            className="input-button-ques-mcq"
        >
            Attachment
        </label>
        <input
            type="file"
            id={`option${option}Image`}
            name={`option${option}Image`}
            onChange={handleFileChange}
            className="input-file-ques-mcq"
        />

        {fileNames[`option${option}Image`] && (
            <span className="file-name">
                {fileNames[`option${option}Image`]}
            </span>
        )}
        {currentData[`option${option}Image`] &&
            typeof currentData[`option${option}Image`] === "string" && (
                <img
                    src={`data:image/jpeg;base64,${currentData[`option${option}Image`]}`}
                    alt="Current logo"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                />
            )}
    </div>
))}
  <Col> <label className='label6-ques'>Difficulty Level<span style={{ color: '#F1A128' }}>**</span></label>
                                     <p></p>
                                    <select
                           name="difficulty_level"
                           value={currentData.difficulty_level}
                           onChange={(e) => handleChange(e, currentForm)}
                           className="input-ques-mcq"
                         >
                           <option value="">Select Difficulty Level</option>
                           <option value="Easy">Easy</option>
                           <option value="Intermediate">Intermediate</option>
                           <option value="Challenging">Challenging</option>
                                         <option value="Difficulty">Difficulty</option>
                           <option value="Company_Specific">Company Specific</option>
                         </select>
                         
                                    </Col>

 {questionTopic !== "Psychometry" && (
          <Row>
           
            <Col>
              <div>
                <label className="label6-ques">mark</label> <br />
                <input
                  type="text"
                  autocomplete="off"
                  name="mark"
                  value={currentData.mark}
                  onChange={handleChange}
                  className="input-ques-mcq"
                />
              </div>
            </Col>
            <Col>
  <div>
    <label className="label6-ques">Correct Answer</label> <br />
    <select
      name="correctAnswer"
      value={currentData.correctAnswer}
      onChange={handleChange}
      className="input-ques-mcq"
    >
      <option value="">Select Answer</option>  {/* Default placeholder */}
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  </div>
</Col>

          </Row>)}
          {questionTopic === "Psychometry" && (
    <Row>
      <Col>
      <label className="label6-ques">Sections</label>
            <br />

            <input
              type="text"
              autocomplete="off"
              name="sections"
              value={currentData.sections}
              onChange={handleChange}
              className="input-ques-mcq"
            /></Col>
        <Col>
            <div>
                <label className="label6-ques">Mark Method</label> <br />
                <select
                    name="mark_method"
                    value={currentData.mark_method}
                    onChange={handleChange}
                    className="input-ques-mcq"
                    required
                >
                    <option value="">Select Mark Method</option>
                    <option value="A-E">A-E</option>
                    <option value="E-A">E-A</option>
                </select>
            </div>
        </Col>
    </Row>
)}

         
        </form>
      )}
      <p></p>
      <div
        className="form-navigation"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        {currentForm > 0 && (
          <button
            onClick={moveToPreviousForm}
            className="button-ques-save"
            style={{ width: "100px" }}
          >
            <img src={Back} className="nextarrow"></img> Back
          </button>
        )}
        {currentForm < totalForms - 1 && (
          <button
            onClick={moveToNextForm}
            className="button-ques-save"
            style={{ width: "100px" }}
          >
            Next<img src={Next} className="nextarrow"></img>
          </button>
        )}
      </div>
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default Update_MCQForm;
