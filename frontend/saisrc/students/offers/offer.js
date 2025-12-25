import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Form, Button, Modal } from "react-bootstrap";
import ErrorModal from "../../components/auth/errormodal";
import {
    geteligiblestudentsAllApi,
    update_is_DeclineApi,
    update_is_acceptApi,
    StudentRequestApi,
    getcandidatesRequestsApi, getJDApi
} from "../../api/endpoints";
import '../../styles/students.css'

const Offer = ({ collegeName, username, institute }) => {
    const [showModal, setShowModal] = useState(false);
    const [students, setStudents] = useState([]);
    const [newtextareaValue, setTextareaValue] = useState("");
    const handleShow = () => setShowModal(true); // Opens the modal
    const handleClose = () => setShowModal(false); // Closes the modal
    const [Candidates, setCandidates] = useState([]);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [showModalJD, setShowModalJD] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        fetchTraineeData();
        getCandidates();
    }, [collegeName, username, institute]);



    const handleCloseError = () => {
        setShowError(false);
    };


    const fetchTraineeData = () => {
        //console.log('College Name: ', collegeName);
        //console.log('User Name: ', username);
        getcandidatesRequestsApi()
            .then(data => {
                //console.log('Students Data: ', data)
                const filteredCandidate = data.filter(candidate => {
                    return candidate.user_name === username;
                });
                setStudents(filteredCandidate);
                //console.log("Filtered Student: ", filteredCandidate)
                if (filteredCandidate.length > 0) {

                    setTextareaValue(filteredCandidate[0].student_query || ""); // Assuming "textarea_value" holds the text area value
                }
            })
            .catch(error => {
                console.error('Error fetching trainee data:', error);
            });
    };

    const getCandidates = () => {
        geteligiblestudentsAllApi(institute, username, collegeName)
            .then(CandidatesData => {
                // Filter the data based on username and collegeName
                const filteredCandidates = CandidatesData.filter(candidate =>
                    candidate.students_id__user_name === username &&
                    candidate.students_id__college_id__college === collegeName
                );

                setCandidates(filteredCandidates);
                //console.log('Filtered Candidates: ', filteredCandidates);
            })
            .catch(error => {
                console.error('Error fetching test candidates:', error);
            });
    };

    const handleAccept = (id,companyName) => {
        console.log("✅ Accepting Job ID:", id, "Company:", companyName);
        update_is_acceptApi(id)
            .then(response => {
                //console.log('Accepted job:', id, response);
                setCandidates(prevCandidates =>
                    prevCandidates.map(candidate =>
                        candidate.id === id ? { ...candidate, is_accept: true } : candidate
                    )
                );
                setErrorMessage(`Successfully registered for ${companyName}`);
                setShowError(true);
                //alert(`Job ${id} accepted successfully!`);
            })
            .catch(error => {
                console.error('Error accepting job:', id, error);
            });
    };

    const handleDecline = (id,companyName) => {
        update_is_DeclineApi(id)
            .then(response => {
                //console.log('Declined job:', id, response);
                setCandidates(prevCandidates =>
                    prevCandidates.map(candidate =>
                        candidate.id === id ? { ...candidate, is_accept: false } : candidate
                    )
                );
                setErrorMessage(`Declined for ${companyName}`);
                setShowError(true);

                // alert(`Job ${id} declined successfully!`);
            })
            .catch(error => {
                console.error('Error declining job:', id, error);
            });
    };
    const handleShowJD = async (job_id__id) => {
        try {
            console.log("Fetching job details for job_id:", job_id__id); // ✅ Debugging
            const jobData = await getJDApi(job_id__id);
            console.log("Job Data Received:", jobData); // ✅ Debugging
            setSelectedJob(jobData);
            setShowModalJD(true);
        } catch (error) {
            console.error("Error fetching job details:", error);
        }
    };

    const handleCloseJD = () => {
        setShowModalJD(false);
        setSelectedJob(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (students.length > 0) {
            const studentId = students[0].id; // Assuming there's only one student
            const textareaValue = newtextareaValue;
            // const dtmRequest = newdtmRequest ;

            const dataToSubmit = {
                student_id: students[0].id,
                student_query: newtextareaValue,
                is_query_type: 'Job'
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
        setShowModal(false); // Close the modal after submitting
    };


    const formatDate1 = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strHours = hours.toString().padStart(2, '0');
        return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
    };

    return (
        <div className="product-table-container-stu">
            <div className="dashboard-tables">
                <h4>Offers Details:</h4>
              
                    <div className="po-table-responsive-t-lms">
                        <table className="placement-table-t">

                        <thead >
                            {/* First Header Row for the Group Titles */}
                            <tr>
                                <th colSpan="3" className="box-size" style={{ textAlign: "center" }}>Job Details</th>
                                <th colSpan="3" className="box-size" style={{ textAlign: "center" }}>Actions</th>
                            </tr>
                            {/* Second Header Row for the Actual Columns */}
                            <tr >
                                <th className="box-size">Interview Date</th>
                                <th className="box-size">Company Name</th>
                                <th className="box-size">Location</th>
                                <th className="box-size">Accept</th>
                                <th className="box-size">Decline</th>
                                <th className="box-size">Query</th>
                            </tr>
                        </thead>
                        <tbody >
                            {Candidates.length > 0 ? (
                                Candidates.map(candidate => (
                                    <tr key={candidate.id} className="box-size">
                                        <td className="box-size">{formatDate1(candidate.job_id__interview_date)}</td>
                                        <td style={{ textDecoration: "underline" }} onClick={() => {
                                            console.log("Candidate Object:", candidate);  // ✅ Debugging
                                            console.log("job_id:", candidate.id);  // ✅ Check if job_id exists
                                            handleShowJD(candidate.job_id__id);  // ✅ Ensure job_id is passed
                                        }}>

                                            {candidate.job_id__company_name}


                                        </td>
                                        {/*}  <td className="box-size">{candidate.job_id__company_name}</td>*/}
                                        <td className="box-size">{candidate.job_id__location}</td>
                                        <td className="box-size">
                                            <button
                                                className='button-to-accept'
                                                onClick={() => handleAccept(candidate.id,candidate.job_id__company_name)}
                                                disabled={!candidate.is_eligible} // Disable if is_eligible is false
                                            >
                                                Accept
                                            </button>
                                        </td>
                                        <td className="box-size">
                                            <button
                                                className='button-to-accept'
                                                onClick={() => handleDecline(candidate.id,candidate.job_id__company_name)}
                                                disabled={!candidate.is_eligible} // Disable if is_eligible is false
                                            >
                                                Decline
                                            </button>
                                        </td>
                                        <td className="box-size">
                                            <button className='button-to-accept' onClick={handleShow}>Query</button>
                                            {/* Modal */}
                                            <Modal show={showModal} onHide={handleClose} centered>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Submit Query</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <Form onSubmit={handleSubmit}>
                                                        <Form.Group controlId="formTextarea">
                                                            <Form.Control
                                                                as="input"
                                                                rows={3}
                                                                value={newtextareaValue}
                                                                name="studentQuery"
                                                                onChange={(e) => setTextareaValue(e.target.value)}
                                                                style={{
                                                                    backgroundColor: "white",
                                                                    color: " #39444e",
                                                                    outline: "none",
                                                                    border: "1px solid #39444e",
                                                                    boxShadow: "none",
                                                                }}
                                                            />
                                                        </Form.Group>
                                                        <Row className="mt-3">
                                                            <Col>
                                                                <Button
                                                                    className='button-ques-save'
                                                                    type="submit"
                                                                    style={{
                                                                        color: "black", backgroundColor: " #F1A128", outline: "none",
                                                                        boxShadow: "none",
                                                                        border: "none",
                                                                    }}
                                                                >
                                                                    Submit
                                                                </Button>
                                                            </Col>
                                                            <Col></Col>
                                                            <Col className='text-right'>
                                                                <Button
                                                                    variant="secondary"
                                                                    onClick={handleClose}
                                                                    className='button-cancel'
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    </Form>
                                                </Modal.Body>
                                            </Modal>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table></div>
            </div>
            <Modal
  show={showModalJD}
  onHide={handleCloseJD}
  className="custom-modal-width-offer"
>
  <Modal.Header closeButton>
    <Modal.Title>  {selectedJob ? (
            <h5><strong>Job Offer for {selectedJob.company_name} - {selectedJob.post_name}</strong></h5>
        ) : "Job Offer Details"}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedJob ? (
      <div className="job-details-container-offer">
        <div className="job-details-grid-offer">
          <p><strong>Company Profile:</strong> {selectedJob.company_profile || "N/A"}</p>
           <p><strong>Intern/Full-time:</strong> {selectedJob.intern_fulltime}</p>
          <p><strong>Job Type:</strong> {selectedJob.job_type}</p>
          <p><strong>On/Off Campus:</strong> {selectedJob.on_off_campus ? "On-Campus" : "Off-Campus"}</p>
          <p><strong>CGPA Requirement:</strong> {selectedJob.cgpa}</p>
          <p><strong>10th Marks:</strong> {selectedJob.marks_10th}</p>
          <p><strong>12th Marks:</strong> {selectedJob.marks_12th}</p>
          <p><strong>Gender:</strong> {selectedJob.gender}</p>
          <p><strong>History of Arrears:</strong> {selectedJob.history_of_arrears}</p>
          <p><strong>Standing Arrears:</strong> {selectedJob.standing_arrears}</p>
          <p><strong>Interview Date:</strong> {new Date(selectedJob.interview_date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> {selectedJob.location}</p>
          <p><strong>No. of Offers Allowed:</strong> {selectedJob.no_of_offers}</p>
          <p><strong>Packages:</strong> {selectedJob.packages}</p>
          <p><strong>Departments:</strong> {selectedJob.departments.join(", ")}</p>
          <p><strong>Skills Required:</strong> {selectedJob.skills.join(", ")}</p>
        </div>
      </div>
    ) : (
      <p>Loading...</p>
    )}
  </Modal.Body>
</Modal>

            <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
        </div >
    );
};

export default Offer;








