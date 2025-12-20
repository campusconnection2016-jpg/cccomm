import React, { useEffect, useState } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import {
  getcandidatesRequestsApi,
  updatecandidatestextApi,
  LoginpassApi,
  getRequestStatus_API,
  StudentRequestApi,
} from "../../api/endpoints";
import "../../styles/students.css";
import ErrorModal from "../../components/auth/errormodal";
import UpdateRequest from "./updaterequest";
const UploadStudentProfile = ({ collegeName, username }) => {
  const [newSkill, setNewSkill] = useState("");
  const [students, setStudents] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);
  const [newtextareaValue, setTextareaValue] = useState("");

  const [status, setStatus] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [loginData, setLoginData] = useState({ user_name: "", password: "" });
  useEffect(() => {
    const fetchLoginData = async () => {
      try {
        const loginResponse = await LoginpassApi(username);
        if (loginResponse && loginResponse.user_name && loginResponse.password) {
          setLoginData({
            user_name: loginResponse.user_name,
            password: loginResponse.password,
          });
        }
      } catch (error) {
        console.error("Error fetching login data:", error);
      }
    };
    if (username) fetchLoginData();
  }, [username]);
  const handleInputpassChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };


  const handleCloseError = () => {
    setShowError(false);
  };
  useEffect(() => {
    fetchTraineeData();
  }, [collegeName, username]);

  const fetchTraineeData = () => {
    console.log("College Name: ", collegeName);
    console.log("User Name: ", username);
    getcandidatesRequestsApi()
      .then((data) => {
        console.log("Students Data: ", data);
        const filteredCandidate = data.filter((candidate) => {
          return candidate.user_name === username;
        });
        setStudents(filteredCandidate);
        console.log("Filtered Student: ", filteredCandidate);
        if (filteredCandidate.length > 0) {
          setNewSkill(filteredCandidate[0].text || ""); // Assuming "text" holds the skill information
          setTextareaValue(filteredCandidate[0].student_query || ""); // Assuming "textarea_value" holds the text area value
        }
      })
      .catch((error) => {
        console.error("Error fetching trainee data:", error);
      });
  };

  const handleSkillChange = (e) => {
    setNewSkill(e.target.value);
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();

    if (students.length > 0) {
      const studentId = students[0].id; // Assuming there's only one student
      const skill = newSkill;

      const dataToSubmit = {
        text: newSkill,
        password: loginData.password  
      };

      try {
        console.log("Student ID: ", studentId);
        console.log("Skills: ", skill);

        await updatecandidatestextApi(studentId, dataToSubmit);
        setErrorMessage("Password Updated Successfully");
        setShowError(true);
        // alert("Skill Updated Successfully");
        fetchTraineeData(); // Refresh the data
      } catch (error) {
        console.error("Failed to update skill:", error);
        alert(`Failed to update skill: ${error.message}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newtextareaValue.length === 0) {
      setErrorMessage("Your Query is an Empty..!");
      setShowError(true);
      return;
    }

    console.log("Passing the if condition.....!");

    if (students.length > 0) {
      const studentId = students[0].id; // Assuming there's only one student
      const textareaValue = newtextareaValue;
      // const dtmRequest = newdtmRequest ;

      const dataToSubmit = {
        student_id: students[0].id,
        student_query: newtextareaValue,
        // dtm_request:newdtmRequest,
      };

      try {
        console.log("Student ID: ", studentId);
        console.log("Query: ", textareaValue);

        await StudentRequestApi(dataToSubmit);
        setErrorMessage("Query Raised Successfully");
        setShowError(true);

        //alert(' Successfully');
        fetchTraineeData(); // Refresh the data
      } catch (error) {
        console.error("Failed to raised query:", error);
        alert(`Failed to raised query: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    console.log("Students:", students);

    const fetchStudentStatus = async () => {
      if (students.length > 0) {
        const studentId = students[0].id;

        try {
          // Await the async call
          const data = await getRequestStatus_API(studentId);
          console.log("Full response from API:", data); // Log the entire response
          console.log("Status from API:", data.status); // Log the status field

          // Check if 'status' exists and log it
          if (data && data.status) {
            setStatus(data.status);
          } else {
            console.error("Status field is missing or undefined:", data);
          }
        } catch (error) {
          console.error("Error fetching student request status:", error);
        }
      }
    };

    fetchStudentStatus();
  }, [students]);

  // console.log('Status in useEffect:', status);
  useEffect(() => {
    // console.log('Status in useEffect:', status);
    if (status === "Accepted") {
      setIsEditable(true);
      console.log("Form is now editable");
    } else if (
      status === "Pending" ||
      status === "Decline" ||
      status === "Completed"
    ) {
      setIsEditable(false);
    }
  }, [status]);

  return (
    <div className="no-select no-right-click">
      <div className="no-screenshot-overlay"></div>
      {isEditable === true ? (
        <UpdateRequest username={username} collegeName={collegeName} />
      ) : (
        <div className="form-ques-student">
          <div className="header">
            <h4 className="h4">Students Profile</h4>
          </div>
          <p></p>
          <div className="form-ques-stu">
            {students.map((trainee, index) => (
              <form key={index} onSubmit={handleUpdateSkill}>
                <p></p>
                <p className="header">
                  {" "}
                  Students can Update only Additional Info
                </p>
                <Row md={12}>
                  <Col>
                    <div controlId="students_name" className="add-profile">
                      <label className="label6-ques">Student Name</label>
                      <p></p>

                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.students_name}
                        readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div
                      controlId="registration_number"
                      className="add-profile"
                    >
                      <label className="label7-ques">Reg Number</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.registration_number}
                        readOnly
                      />
                    </div>
                  </Col>

                  <Col>
                    <div controlId="gender" className="add-profile">
                      <label className="label6-ques">Gender</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                    value={
      trainee.gender === 0 || trainee.gender === 0.0 || trainee.gender === "0.0"
        ? ""
        : trainee.gender
        ? String(trainee.gender)
        : ""
    }
                        readOnly
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>
                <Row md={12}>
                  <Col>
                    <div controlId="email_id" className="add-profile">
                      <label className="label7-ques">Email </label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.email_id}
                        readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId="mobile_number" className="add-profile">
                      <label className="label6-ques">Mobile Number</label>
                      <p></p>
                      <input
                        type="text"
                        inputMode="numeric"          // mobile shows number keypad
                        pattern="[0-9]*"             // only digits allowed
                        maxLength={10}
                        className="input-ques"
                        value={
  trainee.mobile_number && trainee.mobile_number !== 0 && trainee.mobile_number !== "0.0"
    ? String(trainee.mobile_number).replace(/\.0$/, "")  // remove .0 if exists
    : ""
}
                      />
                    </div>
                  </Col>

                  <Col>
                    <div controlId="cgpa" className="add-profile">
                      <label className="label7-ques">CGPA</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.cgpa}
                        readOnly
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>

                <Row md={12}>
                  <Col>
                    <div
                      controlId="college_id__college"
                      className="add-profile"
                    >
                      <label className="label6-ques">College Name</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.college_id__college}
                        readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div
                      controlId="department_id__department"
                      className="add-profile"
                    >
                      <label className="label7-ques">Department</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.department_id__department}
                        readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId="year" className="add-profile">
                      <label className="label6-ques">Year</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.year}
                        readOnly
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>
                <Row md={12}>
                  <Col>
                    <div
                      controlId="marks_semester_wise"
                      className="add-profile"
                    >
                      <label className="label7-ques">Semester Marks</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.marks_semester_wise}
                        readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId="marks_10th" className="add-profile">
                      <label className="label6-ques">10th Marks</label>
                      <p></p>
                      <input
                        type="text"
                        min='35'
                        max="100"
                        className="input-ques"
                        value={trainee.marks_10th}
                        readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId="marks_12th" className="add-profile">
                      <label className="label7-ques">12th Marks</label>
                      <p></p>
                      <input
                        type="text"
                        min='35'
                        max="100"
                        className="input-ques"
                        value={trainee.marks_12th}
                        readOnly
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>

                <Row md={12}>
                  <Col>
                    <div controlId="history_of_arrears" className="add-profile">
                      <label className="label6-ques">History of Arrears</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.history_of_arrears}
                        readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId="standing_arrears" className="add-profile">
                      <label className="label7-ques">Standing Arrears</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        value={trainee.standing_arrears}
                        readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div controlId="user_name" className="add-profile">
                      <label className="label6-ques">User Name</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        autoComplete="off"
                        value={loginData.user_name}
                        readOnly
                      />
                    </div>
                  </Col>

                </Row>
                <p></p>
                <Row md={12}>
                  <Col>
                    <div controlId="password" className="add-profile">
                      <label className="label6-ques">Password</label>
                      <p></p>
                      <input
                        type="text"
                        className="input-ques"
                        autoComplete="off"
                       // readOnly

                        value={loginData.password}
                        onChange={(e) => handleInputpassChange("password", e.target.value)}
                        style={{ width: "32%" }}  // 👈 control width
                      />
                    </div>
                  </Col>

                </Row>
                <p></p>
                <Row>
                  <Col>
                    <button
                      variant="primary"
                      type="submit"
                      className="button-update"
                    >
                      Update
                    </button>
                  </Col>
                  <Col>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => setShowTextarea(true)}
                      style={{
                        float: "right",
                        backgroundColor: "#F1A128",
                        color: "black",
                        border: "none",
                        height: "45px",
                        borderRadius: "4px",
                      }}
                      className="button-request"
                    >
                      Request
                    </Button>
                  </Col>
                </Row>
              </form>
            ))}

            {showTextarea && (
              <Form onSubmit={handleSubmit} style={{ marginTop: "25px" }}>
                <Form.Group controlId="formTextarea">
                  <Form.Control
                    as="input"
                    rows={3}
                    value={newtextareaValue}
                    name="studentQuery"
                    onChange={(e) => setTextareaValue(e.target.value)}
                    style={{
                      backgroundColor: "#39444e",
                      color: "white",
                      outline: "none",
                      border: "1px solid white",
                      boxShadow: "none",
                    }}
                  />
                </Form.Group>{" "}
                <p></p>
                <Row>
                  <Col>
                    <button className="button-ques-save" type="submit">
                      Submit
                    </button>
                  </Col>
                  <Col></Col>
                 
                    <Col>
                      <button
                        style={{ marginLeft: "250px" }}
                        className="button-cancel"
                        onClick={() => setShowTextarea(false)}
                      >
                        Cancel
                      </button>
                    </Col>
                 
                </Row>
              </Form>
            )}
          </div>
          <ErrorModal
            show={showError}
            handleClose={handleCloseError}
            errorMessage={errorMessage}
          />
        </div>
      )}
    </div>
  );
};

export default UploadStudentProfile;
