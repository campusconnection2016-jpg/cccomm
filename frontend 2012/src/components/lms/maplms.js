import React, { useEffect, useState, useRef, useContext } from "react";
import { Col, Row } from "react-bootstrap";
import Select, { components } from "react-select";
import CustomOption from "../test/customoption";
import {
  addlmsApiBatch,
 
  updateTrainerBatchesApi,
  getcollegeApi,
  getTrainerApi,
  
  getSubTopic_API,
  getcandidatesApi,
  getBatchnumberClgID_API,
  get_department_info_LMS_API,

  getcollege_Test_Api,
  getCollegeList_Concat_API,
  get_user_colleges_API,
} from "../../api/endpoints";
import { Modal, Button, Form } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa'; // npm install react-icons

import Next from "../../assets/images/nextarrow.png";
import Back from "../../assets/images/backarrow.png";
import ErrorModal from "../auth/errormodal";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "react-datetime/css/react-datetime.css";
import "../../styles/trainingadmin.css";
import { useNavigate } from "react-router-dom";


const customStyles = {
  control: (provided, state) => ({
      ...provided,
      backgroundColor: '#39444e',
      color: '#fff', // Text color
      borderColor: state.isFocused ? '' : '#ffff', // Border color on focus
      boxShadow: 'none', // Remove box shadow
      '&:hover': {
          borderColor: state.isFocused ? '#ffff' : '#ffff' // Border color on hover
      },
      '&.css-1a1jibm-control': {
          // Additional styles for the specific class
      },
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px', // Smaller font size

          width: '70%'
      }
  }),
  singleValue: (provided) => ({
      ...provided,
      color: '#ffff', // Text color for selected value
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px' // Smaller font size
      }
  }),
  option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
      color: '#ffff', // Text color
      '&:hover': {
          backgroundColor: '#39444e', // Background color on hover
          color: '#ffff' // Text color on hover
      },
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px',// Smaller font size
          width: '70%'
      }
  }),
  input: (provided) => ({
      ...provided,
      color: '#ffff' // Text color inside input when typing
  }),
  menu: (provided) => ({
      ...provided,
      backgroundColor: '#39444e',
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px' // Smaller font size
      }
  })
  
};

const LMSMap = ({username, userRole}) => {
  console.log("userlms", username)
    console.log("userRolelms", userRole)
  const navigate = useNavigate();

  const selectOptionRef = useRef(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseError = () => {
    setShowError(false);
  };
  const [college, setCollege] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [trainer, setTrainer] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState(null);
  const [topic, setTopic] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [subtopic, setSubtopic] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState([]);

  const [selectedColleges, setSelectedColleges] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
const [selectedYears, setSelectedYears] = useState([]);

  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  // const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [trainerEndDateTime, setTrainerEndDateTime] = useState("");
  const [trainerStartDateTime, setTrainerStartDateTime] = useState("");
const [selectedBatches, setSelectedBatches] = useState([]);
  const [trainerTrainingDateTime, setTrainerTrainingDateTime] = useState("");
 const [batchNumbers, setBatchNumbers] = useState([]);
 const [showTrainerModal, setShowTrainerModal] = useState(false);

const [batchNo, setBatchNo] = useState('');


const handleTrainerModalOpen = () => setShowTrainerModal(true);
const handleTrainerModalClose = () => setShowTrainerModal(false);



const [collegeIds, setCollegeIds] = useState([]); // for Training admin

  // State to store college ID
const [userColleges, setUserColleges] = useState([]); // store dropdown options

useEffect(() => {
  // helper: merge concat list with codes from base list
  const mergeWithCodes = async (list) => {
    const base = await getcollege_Test_Api(); // has id, college_code
    const codeMap = new Map(base.map((b) => [Number(b.id), b.college]));
    return list.map((c) => ({
      value: Number(c.id),
      label: c.college_group_concat,
      code: codeMap.get(Number(c.id)) || "", // <-- keep code here
    }));
  };


  // ✅ Case 2: Training admin → show only assigned colleges
  if (userRole === "Training admin") {
    get_user_colleges_API(username)
      .then(async (userData) => {
        const ids = (userData?.college_ids || []).map((x) => Number(x));
        setCollegeIds(ids);

        const concatList = await getCollegeList_Concat_API();
        const filtered = concatList.filter((c) => ids.includes(Number(c.id)));
        const withCodes = await mergeWithCodes(filtered);
        setUserColleges(withCodes);
      })
      .catch((error) => {
        console.error("❌ Error fetching user colleges:", error);
      });
  } else {
    // ✅ Case 3: other roles → show all colleges with concat labels
    Promise.all([getCollegeList_Concat_API(), getcollege_Test_Api()])
      .then(([concatList, base]) => {
        const codeMap = new Map(base.map((b) => [Number(b.id), b.college_code]));
        const all = concatList.map((c) => ({
          value: Number(c.id),
          label: c.college_group_concat,
          code: codeMap.get(Number(c.id)) || "",
        }));
        setUserColleges(all);
      })
      .catch((error) => {
        console.error("❌ Error fetching all colleges:", error);
      });
  }
}, [username, userRole]);


  useEffect(() => {
    getcollegeApi()
      .then((data) => {
        const collegeOptions = data.map((item) => ({
          value: item.id,
          label: item.college,
        }));
        setCollege([{ value: "all", label: "All" }, ...collegeOptions]);
      })
      .catch((error) => console.error("Error fetching College:", error));

    getSubTopic_API()
      .then((data) => {
        const subtopics = data.map((item) => ({
          value: item.id, // Adjust the property name accordingly
          label: item.topic, // Adjust the property name accordingly
        }));
        setSubtopic(subtopics);
        setSelectedSubtopic([]); // Reset selected subtopic
      })
      .catch((error) => console.error("Error fetching topics:", error));

    getTrainerApi()
      .then((data) => {
        setTrainer(
          data.map((item) => ({ value: item.id, label: item.user_name }))
        );
      })
      .catch((error) => console.error("Error fetching trainers:", error));
  }, []);

  // Fetch department data when selectedColleges changes
 useEffect(() => {
  console.log("🎯 useEffect triggered due to selectedColleges change");

  const filteredColleges = selectedColleges.filter(
    (college) => college.value !== "all"
  );
  const collegeIds = filteredColleges.map((college) => college.value);

  console.log("🏫 Filtered College IDs:", collegeIds);

  // Fetch departments based on selected college IDs
  console.log("📡 Fetching department info...");
  get_department_info_LMS_API(collegeIds)
    .then((data) => {
      console.log("✅ Department data received:", data);

      const departmentOptions = data.map((item) => ({
        value: item.department_id_value,
        label: item.department_name_value,
      }));

      console.log("📋 Formatted department options:", departmentOptions);

      setDepartments([{ value: "all", label: "All" }, ...departmentOptions]);
    })
    .catch((error) =>
      console.error("❌ Error fetching departments:", error)
    );

  // Fetch batch numbers based on selected college IDs
  console.log("📡 Fetching batch numbers...");
  getBatchnumberClgID_API(collegeIds)
    .then((batches) => {
      console.log("✅ Batch numbers received:", batches);

      const options = batches.batch_numbers.map((b) => ({
        label: b,
        value: b,
      }));

      console.log("📋 Formatted batch options:", options);

      setBatchNumbers(options);
    })
    .catch((error) => {
      console.error("❌ Error fetching batch numbers:", error);
      setBatchNumbers([]);
    });
}, [selectedColleges]);

  useEffect(() => {
    if (trainerTrainingDateTime) {
      setStartDateTime(trainerTrainingDateTime);
      setEndDateTime(moment(trainerTrainingDateTime).add(1, "year").toDate());
      setTrainerStartDateTime(
        moment(trainerTrainingDateTime).subtract(3, "days").toDate()
      );
      setTrainerEndDateTime(
        moment(trainerTrainingDateTime).set({ hour: 18, minute: 0 }).toDate()
      );
      // setTrainerEndDateTime(moment(trainerTrainingDateTime).set({ hour: 14, minute: 40 }).toDate());
    }
  }, [trainerTrainingDateTime]);

  const handleCollegeChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === "all")) {
      setSelectedColleges(college.filter((option) => option.value !== "all"));
    } else {
      setSelectedColleges(selectedOptions);
    }
  };

  const handleDepartmentsChange = (selectedOptions) => {
    if (selectedOptions.some(option => option.value === 'all')) {
    setSelectedDepartments([{ value: 'all', label: 'All' }]);
}
 else {
        setSelectedDepartments(selectedOptions);
    }
};
const handleMultiSelect = (selected, type) => {
  if (type === 'batches') {
    setSelectedBatches(selected);
  }
  // handle others...
};

 
  const handleSubTopicsChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === "all")) {
      setSelectedSubtopic(subtopic.filter((option) => option.value !== "all"));
    } else {
      setSelectedSubtopic(selectedOptions);
    }
  };
  const handleTrainerChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === "all")) {
      setSelectedTrainers(trainer.filter((option) => option.value !== "all"));
    } else {
      setSelectedTrainers(selectedOptions);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.target);

    try {
      const filteredColleges = selectedColleges.filter(
        (college) => college.value !== "all"
      );
     const filteredDepartments = selectedDepartments.filter(
  (department) => department.value !== "all"
);


      const filteredSubtopics = selectedSubtopic.filter(
        (subtopics) => subtopics.value !== "all"
      );
      //const filteredTrainers = selectedTrainers.filter(
       // (trainer) => trainer.value !== "all"
     // );
     // const year = formData.get("year");
     const years = selectedYears.map((y) => y.value);

   const batchNos = selectedBatches.filter(b => b.value !== "all").map(b => b.value);

      const MappingResult = {
        college_id: filteredColleges.map((college) => college.value),
        department_id: filteredDepartments.map(
          (department) => department.value
        ),
        year: selectedYears.map((y) => y.value),
          batch_no: batchNos,
       // trainer_id: filteredTrainers.map((trainer) => trainer.value), // Array of trainer IDs
        //  trainer_id: selectedTrainer.value,
       // trainer_payment: formData.get("trainer_payment"),
        topic_id: filteredSubtopics.map((subtopics) => subtopics.value),
        dtm_start_student: moment(startDateTime).format("YYYY-MM-DD HH:mm:ss"),
        dtm_end_student: moment(endDateTime).format("YYYY-MM-DD HH:mm:ss"),
        dtm_start_trainer: moment(trainerStartDateTime).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        dtm_end_trainer: moment(trainerEndDateTime).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        dtm_of_training: moment(trainerTrainingDateTime).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
       
      };

      console.log("MappingResult: ", MappingResult);

      await addlmsApiBatch(MappingResult);
      // alert('LMS Mapping Successfully');
      setErrorMessage("LMS Mapped Successfully");
      setShowError(true);
      setSelectedColleges([]);
      setSelectedDepartments([]);
      setSelectedBatches([]);
      setSelectedYears([]);
      setSelectedTopic([]);
      setSelectedTrainers([]);
      
      setEndDateTime(null);
      setStartDateTime(null);
      e.target.reset();
      navigate("/lms/table/");
    } catch (error) {
      setErrorMessage("LMS Not Mapped");
      setShowError(true);
      console.error("An error occurred while assigning the test:", error);
      // alert('LMS Not Mapped');
    } finally {
      setIsSubmitting(false); // Re-enable the button after processing
    }
  };
const handleTrainerSubmit = async (e) => {
  e.preventDefault();

  const user_names = selectedTrainers.map((t) => t.label); // assuming label = user_name

  const payload = {
    user_names,
    batch_no: batchNo,
  };

  try {
    await updateTrainerBatchesApi(payload);
    alert("Batch updated for selected trainers!");
    setSelectedTrainers([]);
    setBatchNo('');
    setShowTrainerModal(false);
  } catch (error) {
    console.error("Batch update failed:", error);
    alert("Failed to update batch");
  }
};


  const onNextButtonClick = () => {
    navigate("/lms/table/"); // Navigate to ViewLms
  };

  return (
    <div className="form-ques-training-map">
      <div className="form-ques-map">
        <div>
          <Row>
            <Col>
              <form onSubmit={handleSubmit} className="form-ques">
                <br />
                <Row md={12}>
                  <Col>
                    <div className="CollegeName1" controlId="college_name">
                      <label className="label5-ques">College Name</label>
                      <p></p>
                      <Select
                        isMulti
                        options={userColleges}
                        value={selectedColleges}
                        onChange={handleCollegeChange}
                        styles={customStyles}
                        components={{ Option: CustomOption }}
                        closeMenuOnSelect={false}
                      />
                    </div>
                  </Col>
                   <Col>
                    <div  className="DepartmentName1">
    <label>Batches:</label>
    <button  size="sm" style={{color:"white",background:"transparent",border:"1px white"}}onClick={handleTrainerModalOpen}>
      <FaPlus />
    </button>
 
  <p></p>
                      <Select
                          isMulti
                          options={batchNumbers}
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            closeMenuOnSelect={false}
                          onChange={(selected) => handleMultiSelect(selected, 'batches')}
                        />
                         </div></Col>
                  <Col>
                    <div
                      className="DepartmentName1"
                      controlId="department_name"
                    >
                      <label className="label5-ques">Department Name</label>
                      <p></p>
                      <Select
                        isMulti
                        options={departments}
                        value={selectedDepartments}
                        onChange={handleDepartmentsChange}
                        styles={customStyles}
                        components={{ Option: CustomOption }}
                        closeMenuOnSelect={false}
                      />
                    </div>
                  </Col>
                 
                </Row>
                <p></p>
                <Row md={12}>
                <Col>
  <div className="DepartmentName1" controlId="year">
    <label className="label5-ques">Year</label>
    <p></p>
    <Select
      isMulti
      name="year"
      options={[
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
      ]}
      value={selectedYears}
      onChange={(selected) => setSelectedYears(selected)}
      styles={customStyles}
      closeMenuOnSelect={false}
    />
  </div>
</Col>

                  <Col>
                    <div className="QuestionName" controlId="topic_id">
                      <label className="label5-ques">Topic</label>
                      <p></p>
                      <Select
                        isMulti
                        options={subtopic}
                        value={selectedSubtopic}
                        onChange={handleSubTopicsChange}
                        placeholder="Select Sub Topic"
                        styles={customStyles}
                        components={{ Option: CustomOption }}
                        closeMenuOnSelect={false}
                      />
                    </div>
                  </Col>
                 
                {/*}  <Col>
                    <div className="trainer" controlId="trainer_id">
                      <label className="label5-ques">Trainer Name</label>
                      <p></p>
                      <Select
                        isMulti
                        options={trainer}
                        value={selectedTrainers}
                        onChange={handleTrainerChange}
                        placeholder="Select Trainer"
                        styles={customStyles}
                        className="trainer-name"
                        components={{ Option: CustomOption }}
                        closeMenuOnSelect={false}
                      />
                    </div>
                  </Col>*/}
                    <Col>
                    <div className="datetime" controlId="dtm_of_training">
                      <label className="label5-ques">Date of Training</label>
                      <p></p>
                      <DatePicker
                        selected={trainerTrainingDateTime}
                        onChange={(date) => setTrainerTrainingDateTime(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd-MM-yyyy, h:mm aa"
                        className="input-date-custom"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </Col>
                </Row>
                <p></p>
                <Row md={12}>
                
                  <Col>
                    <div className="datetime" controlId="dtm_start_student">
                      <label className="label5-ques">Students Start Date</label>
                      <p></p>
                      <DatePicker
                        selected={startDateTime}
                        onChange={(date) => setStartDateTime(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd-MM-yyyy, h:mm aa"
                        className="input-date-custom"
                        required
                       // readOnly
                      />
                    </div>
                  </Col>
                  <Col>
                    <div className="datetime" controlId="dtm_end_student">
                      <label className="label5-ques"> Students End Date</label>
                      <p></p>
                      <DatePicker
                        selected={endDateTime}
                        onChange={(date) => setEndDateTime(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd-MM-yyyy, h:mm aa"
                        className="input-date-custom"
                        required
                       // readOnly
                      />
                    </div>
                  </Col>
                   <Col>
                    <div className="datetime" controlId="dtm_start_trainer">
                      <label className="label5-ques">Trainer Start Date</label>
                      <p></p>
                      <DatePicker
                        selected={trainerStartDateTime}
                        onChange={(date) => setTrainerStartDateTime(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd-MM-yyyy, h:mm aa"
                        className="input-date-custom"
                        required
                       // readOnly
                      />
                    </div>
                  </Col>

                </Row>
                <p></p>
                <Row md={12}>
                
                  <Col>
                    <div className="datetime" controlId="dtm_end_trainer">
                      <label className="label5-ques">Trainer End Date</label>
                      <p></p>
                      <DatePicker
                        selected={trainerEndDateTime}
                        onChange={(date) => setTrainerEndDateTime(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd-MM-yyyy, h:mm aa"
                        className="input-date-custom"
                        required
                       // readOnly
                      />
                    </div>
                  </Col>
                  <Col></Col>
                  <Col></Col>
                 {/* <Col>
                    <div className="datetime" controlId="trainer_payment">
                      <label className="label5-ques">Trainer Payment</label>
                      <p></p>
                      <input
                        type="number"
                        max="10000"
                        min="100" // Ensures a minimum of three digits
                        className="payment"
                        name="trainer_payment"
                        required
                        placeholder=""
                        autoComplete="off"
                        onInput={(e) => {
                          // Ensure the number has three or more digits and is within the 100-10000 range
                          if (e.target.value < 100 || e.target.value > 10000) {
                            e.target.setCustomValidity(
                              "Payment must be a three or more digit number between 100 and 10000."
                            );
                          } else {
                            e.target.setCustomValidity(""); // Clear any validation message
                          }
                        }}
                      />
                    </div>

                    {/* <div className='datetime' controlId='trainer_payment'>
                                            <label className='label5-ques' >Trainer Payment</label><p></p>
                                            <input type="number"
                                            max='10000'
                                            min='0'
                                             className='payment' name="trainer_payment" required placeholder="" autocomplete="off" />

                                        </div> 
                  </Col>*/}
                </Row><p></p>
              {/*}  <Row md={12}>
               
                <Col>
                  <div className="food-options" controlId="food">
                    <label className="label5-ques">Food Arrangement</label>
                    <p></p>
                    <div>
                      <input
                        type="radio"
                        id="food_by_campus"
                        name="food"
                        value="By Campus"
                        required
                      />
                      <label htmlFor="food_by_campus">By Campus</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="food_by_college"
                        name="food"
                        value="By College"
                        required
                      />
                      <label htmlFor="food_by_college">By College</label>
                    </div>
                  </div>
                </Col>

               
                <Col>
                  <div className="travel-options" controlId="travel">
                    <label className="label5-ques">Travel Arrangement</label>
                    <p></p>
                    <div>
                      <input
                        type="radio"
                        id="travel_by_campus"
                        name="travel"
                        value="By Campus"
                        required
                      />
                      <label htmlFor="travel_by_campus">By Campus</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="travel_by_trainer"
                        name="travel"
                        value="By Trainer"
                        required
                      />
                      <label htmlFor="travel_by_trainer">By Trainer</label>
                    </div>
                  </div>
                </Col>
                <Col></Col>
              </Row>*/}
                <p style={{ height: "50px" }}></p>
                <p></p>
                <Row>
                  <Col>
                    <div className="button-container-lms">
                      <button
  className="button-ques-back btn btn-secondary back-button-lms"
  style={{
    width: "100px",
    color: "black",
    height: "50px",
    backgroundColor: "#F1A128",
  }}
  // onClick={() => navigate(-1)} 
  onClick={() => navigate("/lms/")}
>
  <img src={Back} className="nextarrow" alt="back" />
  <span className="button-text">Back</span>
</button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="button-ques-save save-button-lms"
                        style={{ width: "100px" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={onNextButtonClick}
                        className="button-ques-save save-button-lms"
                        style={{
                            width: "100px",
                            color: 'black',
                            height: '50px',
                            backgroundColor: '#F1A128',

                        }} 
                      >
                        <span className="button-text">Next</span>
                        <img src={Next} className="nextarrow"></img>
                      </button>
                    </div>
                  </Col>
                </Row>
                <p></p>
              </form>
            </Col>
          </Row>
        </div>
      </div>
      <Modal show={showTrainerModal} onHide={handleTrainerModalClose} centered>
  <Modal.Header closeButton>
    <Modal.Title>Update Trainer Batches</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleTrainerSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Select Trainers</Form.Label>
        <Select
          isMulti
          options={trainer}
          value={selectedTrainers}
          onChange={handleTrainerChange}
          placeholder="Select Trainer(s)"
        
          
          components={{ Option: CustomOption }}
          closeMenuOnSelect={false}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Batch No</Form.Label>
        <Form.Control
          type="text"
          value={batchNo}
          onChange={(e) => setBatchNo(e.target.value)}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit">Update</Button>
    </Form>
  </Modal.Body>
</Modal>

      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default LMSMap;
