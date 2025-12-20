import React, { useEffect, useState } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import {
     createCourseFeedback,getStudentId_API,updateStudentFeedbackApi
} from '../../api/endpoints';
import ErrorModal from '../../components/auth/errormodal';
import Select from 'react-select';

import { useTheme,useMediaQuery } from "@mui/material";

import 'react-datepicker/dist/react-datepicker.css';
import "react-datetime/css/react-datetime.css";


const feedbackOptions = [
    { value: 'Good', label: 'Good' },
    { value: 'Poor', label: 'Poor' },
    { value: 'Average', label: 'Average' },
    { value: 'Excellent', label: 'Excellent' }
];

const StudentFeedback = ({ feedbackId,source, existingFeedback, onSubmit, username }) => {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (existingFeedback) {
      const feedbackOption = feedbackOptions.find(option => option.value === existingFeedback.feedback);
      setSelectedFeedback(feedbackOption);
      setRemarks(existingFeedback.remarks || '');
    }
  }, [existingFeedback]);

  const handleCloseError = () => {
    setShowError(false);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedFeedback || !username || !feedbackId || !source) {
    alert("All fields are required.");
    return;
  }

  try {
    if (source === 'training_schedule') {
      // ✅ TRAINING SCHEDULE SUBMISSION FLOW
      console.log("📘 Submitting Training Schedule Feedback");

      const studentData = await getStudentId_API(username);
      const student_id = studentData.student_id;

      const payload = {
        student_id,
        training_id: feedbackId,
        feedback: selectedFeedback.value,
        remarks: remarks,
      };

      console.log("📦 Training Feedback Payload:", payload);

      await createCourseFeedback(payload);

      setErrorMessage('✅ Feedback submitted successfully');
      setShowError(true);
      onSubmit();

    } else if (source === 'course_schedule') {
      // ✅ COURSE SCHEDULE UPDATE FLOW
      console.log("📗 Updating Course Schedule Feedback");

      const feedbackData = {
        feedback: selectedFeedback.value,
        remarks: remarks
      };

      console.log("📦 Course Feedback Update Payload:", feedbackData);

      const result = await updateStudentFeedbackApi(feedbackId, feedbackData);
      console.log("✅ Feedback updated successfully:", result);

      setErrorMessage('✅ Feedback updated successfully');
      setShowError(true);
      onSubmit();
    } else {
      alert("Unknown feedback source.");
    }

    // Optional: Reset form after success
    e.target.reset();
  } catch (error) {
    console.error('❌ Feedback submission failed:', error.response ? error.response.data : error);
    alert('Feedback submission failed. Check console for details.');
  }
};


  return (
    <div>
      <div className='form-queslmss' style={{ backgroundColor: "white", borderColor: "white" }}>
        <div className='feedback-responsive'>
          <Row>
            <Col>
              <form onSubmit={handleSubmit} className='form-queslmss' style={{ backgroundColor: "white" }}>
                <Row md={12}>
                  <Col>
                    <div className='feedback'>
                      <label className='label7-ques' style={{ color: "black" }}>Feedback</label>
                      <p></p>
                      <Select
                        options={feedbackOptions}
                        value={selectedFeedback}
                        onChange={setSelectedFeedback}
                        placeholder="Select Feedback"
                       
                      />
                    </div>
                  </Col>
                  <p></p>
                  <Col>
                    <div className='add-profile'>
                      <label className='label6-ques' style={{ color: "black" }}>Remarks</label>
                      <p></p>
                      <input
                        type="text"
                        name="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        autoComplete="off"
                        className="input-ques"
                        style={{ backgroundColor: "white", color: "black", borderColor: "#39444e" }}
                      />
                    </div>
                  </Col>
                </Row>
                <p style={{ height: "20px" }}></p>
                <Row>
                  <Col></Col>
                  <Col>
                    <button type="submit" className='button-ques-save' style={{ width: "100px", height: "40px", fontSize: isMobile ? "12px" : "15px", marginLeft: isMobile ? "70px" : "0px" }}>
                      Submit
                    </button>
                  </Col>
                  <Col></Col>
                </Row>
              </form>
            </Col>
          </Row>
        </div>
      </div>

      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
    </div>
  );
};

export default StudentFeedback;
