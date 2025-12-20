import React, { useState, useEffect } from 'react';
import { addTrainerReportApi, getTrainers_topic_API ,addTrainerTrainingReportApi} from '../../api/endpoints';
import { Col, Row, Form } from 'react-bootstrap';
import ErrorModal from '../../components/auth/errormodal';
const customStyles = {
  control: (provided, state) => ({
      ...provided,
      backgroundColor: 'white',
      color: '#39444e',
      borderColor: state.isFocused ? '' : '#39444e',
      boxShadow: 'none',
      '&:hover': {
          borderColor: state.isFocused ? '#39444e' : '#39444e'
      },
      '@media (max-width: 768px)': {
          fontSize: '12px',
          width: '70%'
      }
  }),
  singleValue: (provided) => ({
      ...provided,
      color: '#39444e',
      '@media (max-width: 768px)': {
          fontSize: '12px'
      }
  }),
  option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'white' : state.isFocused ? 'white' : 'white',
      color: 'black',
      '&:hover': {
           backgroundColor: 'white',
            color: 'black'
      },
      '@media (max-width: 768px)': {
          fontSize: '12px',
          width: '70%'
      }
  }),
  menu: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      '@media (max-width: 768px)': {
          fontSize: '12px'
      }
  })
};

function TrainerReportForm({ coursesrc,username ,courseScheduleId,handleClose}) {
  const [formData, setFormData] = useState({
    course_schedule_id: null,
    
    no_of_question_solved: '',
    comments: '',
    status: '', // Default option
    student_feedback: '', // Default option
    infrastructure_feedback: '', // Default option
    remarks: ''
  });
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseError = () => {
    setShowError(false);
  };

  
  const [activities_done, setActive] = useState(false);
  
  console.log("username", username);
  console.log("Received courseScheduleId:", courseScheduleId); // Log the received courseScheduleId

  // Update formData with course_schedule_id whenever courseScheduleId prop changes
  useEffect(() => {
    if (courseScheduleId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        course_schedule_id: courseScheduleId // Set the course_schedule_id in form data
      }));
    }
  }, [courseScheduleId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change detected:', name, value); // Log the input name and value
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Form submission started");
  console.log("Form data before processing:", formData);
  console.log("coursesrc:", coursesrc);

  const trainerReportData = {
    ...formData,
    activities_done,
  };

  console.log("Final data to submit:", trainerReportData);

  try {
    let result;

    // 🔁 Dynamically call the correct API based on source
    if (coursesrc === "training_schedule") {
      console.log("➡️ Calling addTrainerTrainingReportApi...");
      result = await addTrainerTrainingReportApi(trainerReportData);
    } else if (coursesrc === "course_schedule") {
      console.log("➡️ Calling addTrainerReportApi...");
      result = await addTrainerReportApi(trainerReportData);
    } else {
      throw new Error("Invalid source: coursesrc must be either 'training_schedule' or 'course_schedule'");
    }

    console.log("API response:", result);

    if (result && result.id) {
      console.log("✅ Form submitted successfully");
      setErrorMessage("Form submitted successfully");
      setShowError(true);
      handleClose();

      // Reset the form after successful submission
      setFormData({
        course_schedule_id: null,
        no_of_question_solved: '',
        comments: '',
        status: '',
        student_feedback: '',
        infrastructure_feedback: '',
        remarks: ''
      });
      setActive(false);
    } else {
      console.log("❌ Form submission failed - no 'id' returned");
      setErrorMessage('Form submission failed - API returned an error');
      setShowError(true);
    }
  } catch (error) {
    console.error("❌ Error submitting form:", error);
    setErrorMessage(`Error submitting form: ${error.message}`);
    setShowError(true);
  }

  console.log("Form submission completed");
};


  return (
    <div className='form-ques-trainer'  style={{ backgroundColor: "white", borderColor: "white" }}>
      <form onSubmit={handleSubmit} className='form-ques-trainer' style={{ backgroundColor: "white" }}>
       

        <Row md={12}>
          <Col>
            <div>
              <label htmlFor="status" className='label5-ques' style={{ color: "#39444e" }}>Status:</label>
              <select
                id="status"
                name="status"
                className="input-ques"
                value={formData.status}
                styles={customStyles}
                onChange={handleInputChange}
                required
                style={{ backgroundColor: "white", borderColor: "#39444e" ,color:"black"}}
              >
                <option value="">Select Status</option>
                <option value="Yet Not Started">Yet Not Started</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </Col>

          <Col>
            <div>
              <label htmlFor="comments" className='label5-ques' style={{ color: "#39444e" }}>Comments:</label>
              <input
                id="comments"
                className="input-ques"
                name="comments"
                autoComplete='off'
                value={formData.comments}
                onChange={handleInputChange}
                style={{ backgroundColor: "white", borderColor: "#39444e" ,color:"black"}}
              />
            </div>
          </Col>
          <Col>
            <div controlId="activities_done">
              <label className="label5-ques" style={{ color: "#39444e"}}>Activities Done</label>
              
              <Form.Check
                type="switch"
                className="custom-switch"
                id="custom-switch"
                label=""
                checked={activities_done}
                onChange={(e) => setActive(e.target.checked)}
                style={{ backgroundColor: "white", borderColor: "#39444e" ,color:"black"}}
              />

            </div>
          </Col>

        </Row><p></p>



        <Row md={12}>
          <Col>
            <div>
              <label htmlFor="student_feedback" className='label5-ques' style={{color: "#39444e" }}>Student Feedback:</label>
              <select
                id="student_feedback"
                name="student_feedback"
                className="input-ques"
                value={formData.student_feedback}
                style={{ backgroundColor: "white", borderColor: "#39444e" ,color:"black"}}
                onChange={handleInputChange}
                required
              >
                <option value="">Select...</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </Col>

          <Col>
            <div>
              <label htmlFor="infrastructure_feedback" className='label5-ques' style={{ color: "#39444e" }}>Infrastructure Feedback:</label>
              
              <select
                id="infrastructure_feedback"
                name="infrastructure_feedback"
                className="input-ques"
                value={formData.infrastructure_feedback}
                onChange={handleInputChange}
                required
                style={{ backgroundColor: "white", borderColor: "#39444e" ,color:"black"}}
              >
                <option value="">Select...</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </Col>



          <Col>
            <div>
              <label htmlFor="remarks" className='label5-ques' style={{ color: "#39444e" }}>Remarks:</label>
              <input
                id="remarks"
                name="remarks"
                className="input-ques"
                value={formData.remarks}
                autoComplete='off'
                style={{ backgroundColor: "white", borderColor: "#39444e" ,color:"black"}}
                onChange={handleInputChange}
              />
            </div>
          </Col>
        </Row><p></p>
        <Row md={12}>
                   <Col>
            <div>
              <label htmlFor="no_of_question_solved" className='label5-ques' style={{ color: "#39444e"}}>Questions Solved:</label>
              
              <input
                type="number"
                autoComplete='off'
                min='0'
                style={{ backgroundColor: "white", borderColor: "#39444e" ,color:"black"}}
                className="input-ques"
                id="no_of_question_solved"
                name="no_of_question_solved"
                value={formData.no_of_question_solved}
                onChange={handleInputChange}
                required
              />
            </div>
          </Col>
          <Col></Col>
          <Col></Col>

        </Row><p style={{ height: "50px" }}></p>
        <Row>
          <Col></Col>
          <Col>
            <button type="submit" className='button-ques-save' style={{ marginLeft: "50px" }}>Submit</button></Col>
          <Col></Col>
        </Row>

      </form>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
}

export default TrainerReportForm;
