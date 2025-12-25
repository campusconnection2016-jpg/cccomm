import { useParams } from 'react-router-dom';
import React from 'react';

import { useEffect, useState } from 'react';
import {
  get_department_info_cumula_API,
  getBatchnumberClgID_API,
  getCollege_logo_API_Training,
  createBatch_API,
  getRegNoRange_API,
  getDepartmentsByBatchAndCollege_API,
  getqstntypeTrainingApi,
  getSkillTypesByQuestionType_API,
  getTrainersBySkill_API,
  updateTrainingScheduleAPI,
  assignTopicsToTrainerAPI,
  addTrainerwithskillApi,
  scheduleTestAPI,
  getAssessmentTestTypesAPI,
  getTrainingScheduleDetails_API,
  getAssignedTopicsByTrainingId_API,getTrainingSchedulenewdataAPI
} from "../../api/endpoints";
import 'bootstrap-icons/font/bootstrap-icons.css';

import Select from 'react-select';
import CustomOption from '../test/customoption';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

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

      width: '150px'
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
      width: '150px'
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


const UpdateTraining = () => {
  const { id } = useParams();
  const [collegeId, setCollegeId] = useState(null);
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [departmentListByBatch, setDepartmentListByBatch] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [assignedTopics, setAssignedTopics] = useState([]);  // state for displaying assigned data
const [allowExtraTrainers, setAllowExtraTrainers] = useState(false);

  const navigate = useNavigate();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const meridianOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ];

  // States
  const [startHour, setStartHour] = useState('');
  const [startMeridian, setStartMeridian] = useState(meridianOptions[0]);
  const [endHour, setEndHour] = useState('');
  const [endMeridian, setEndMeridian] = useState(meridianOptions[0]);
  const [formData, setFormData] = useState({
    batch_no: '',
    department_id: '',
    reg_start: '',
    reg_end: ''
  });
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [newTrainer, setNewTrainer] = useState({
    trainer_name: '',
    user_name: '',
    password: '',
    skill_type: [],
  });
  const [duration, setduration] = useState('');
  const [isTestcase, setIsTestcase] = useState(false);

  const [scheduleDayOption, setScheduleDayOption] = useState('on_day');
  const [startMinute, setStartMinute] = useState('0');
  const [endMinute, setEndMinute] = useState('0');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
useEffect(() => {
  const fetchCollegeId = async () => {
    try {
      const response = await getCollege_logo_API_Training();
      const trainingItem = response?.results?.find((item) => item.id === parseInt(id));

      if (trainingItem?.college_id) {
        setCollegeId(trainingItem.college_id);
      }

      if (trainingItem?.trainers?.length) {
        console.log("✅ Fetched Trainers from college API:", trainingItem.trainers);

        const trainerUsernames = trainingItem.trainers.map(t => t.user_name);
        setSelectedTrainers(trainerUsernames);
        setTrainers(trainingItem.trainers);
      } else {
        console.warn("⚠️ No trainers found in API response.");
      }
    } catch (error) {
      console.error("❌ Error fetching college ID or trainers:", error);
    }
  };
  fetchCollegeId();
}, [id]);


  useEffect(() => {
    if (collegeId) {
      get_department_info_cumula_API(collegeId)
        .then((res) => {
          const normalized = res.map(item => ({
            id: item.department_id__id,
            department: item.department_id__department
          }));
          console.log("🔧 Normalized departments:", normalized);
          setDepartmentOptions(normalized);
        })
        .catch((err) => {
          console.error("❌ Error fetching departments:", err.message);
          setDepartmentOptions([]);
        });
    }
  }, [collegeId]);


  useEffect(() => {
    if (collegeId) {
      getRegNoRange_API(collegeId)
        .then((res) => {
          console.log("📥 Registration range:", res);
          setFormData(prev => ({
            ...prev,
            reg_start: res.min_registration_number,
            reg_end: res.max_registration_number
          }));
        })
        .catch((err) => {
          console.error("❌ Error fetching reg no range:", err.message);
        });
    }
  }, [collegeId]);


  const submitBatchUpdate = async () => {
    try {
      const payload = {
        ...formData,
        college_id: collegeId
      };
      const response = await createBatch_API(payload);
      alert(response.message);
      setShowModal(false);

      // ✅ Clear the form after submission
      setFormData({
        batch_no: '',
        department_id: '',
        reg_start: '',
        reg_end: ''
      });

      // ✅ Re-fetch batch numbers
      const batches = await getBatchnumberClgID_API(collegeId);
      const options = batches.batch_numbers.map((b) => ({ label: b, value: b }));
      setBatchNumbers(options);

    } catch (error) {
      console.error("❌ Error updating batch:", error.message);
      alert("Failed to update batch.");
    }
  };

  // ✅ 1. Load question types initially
  useEffect(() => {
    console.log("📌 useEffect: Fetching question types...");
    getqstntypeTrainingApi()
      .then((res) => {
        console.log("🎯 Question types with skills fetched:", res);
        setQuestionTypes(res);
      })
      .catch((err) => {
        console.error("❌ Error fetching question types:", err.message);
      });
  }, []);

  // ✅ 2. Format question types for dropdown
  const questionTypeOptions = questionTypes.map(qt => ({
    value: qt.id,
    label: qt.question_type
  }));

  // ✅ 3. Fetch trainers based on selected skill types
  const fetchTrainersForSkills = async (skillNames) => {
    console.log("📌 fetchTrainersForSkills called with:", skillNames);

    if (skillNames.length === 0) {
      console.log("⚠️ No skills selected, clearing trainer list.");
      setTrainers([]);
      return;
    }

    const query = skillNames.join(",");
    console.log("🔍 Sending query to API:", query);

    try {
      const res = await getTrainersBySkill_API(query); // Ensure API supports comma-separated skill names
      console.log("✅ Trainers fetched for selected skills:", res);

      const unique = [];
      const seen = new Set();

      res.forEach(t => {
        const key = t.user_name || t.trainer_name;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(t);
        }
      });

      console.log("🧹 Unique trainers after filtering duplicates:", unique);
      setTrainers(unique);
    } catch (error) {
      console.error("❌ Error fetching trainers by skill:", error.message);
    }
  };

  // ✅ 4. Trigger trainer fetch when selectedSkills change
  useEffect(() => {
    console.log("🔁 useEffect: selectedSkills changed to:", selectedSkills);
    fetchTrainersForSkills(selectedSkills);
  }, [selectedSkills]);
 // ✅ 5. Handle multiselect changes
  const handleMultiSelectOLD = (selectedOptions, fieldName) => {
    console.log(`📥 handleMultiSelect triggered for field: ${fieldName}`, selectedOptions);

    const values = selectedOptions.map(option => option.value);

    if (fieldName === 'trainers') {
      console.log("📝 Setting selected trainer IDs:", values);
      setSelectedTrainers(values); // These are trainer IDs
    }
  };
const trainerOptions = (trainers || [])
  .filter(t => t && t.id && t.trainer_name) // filter out incomplete records
  .map((t) => ({
    value: t.id,
    label: `${t.trainer_name} (${(t.skill_type || []).join(", ")})`,
    user_name: t.user_name
  }));

const handleMultiSelect = (selectedOptions, field) => {
  const selectedValues = selectedOptions.map(opt => opt.user_name); // Assuming API wants user_name

  if (field === 'trainers') {
    const maxAllowed = selectedBatch.length; // no_of_batch logic

    if (selectedValues.length > maxAllowed) {
      alert(`❌ You can only select ${maxAllowed} trainers for ${maxAllowed} batch${maxAllowed > 1 ? 'es' : ''}.`);
      return; // Prevent setting
    }

    setSelectedTrainers(selectedValues);
  }
};

useEffect(() => { 
  if (!id) return;

  getTrainingScheduleDetails_API(id)
    .then((data) => {
      setSelectedBatch(data.batches || []);
      setSelectedDepartmentId(data.departments?.[0]?.id || '');

      const trainerUsernames = Array.isArray(data.trainers)
        ? data.trainers.map((t) => t.user_name)
        : [];
      setSelectedTrainers(trainerUsernames);

     {/*} if (Array.isArray(data.trainers)) {
        setTrainers(data.trainers);

        const uniqueSkills = new Set();
        data.trainers.forEach((trainer) => {
          (trainer.skill_type || []).forEach((skill) => uniqueSkills.add(skill));
        });

        const skillOptions = [...uniqueSkills].map((skill, index) => ({
          id: `${index}`,
          skill_type: skill,
        }));
        setSkills(skillOptions);
        setSelectedSkills(skillOptions.map((s) => s.id));
      } else {
        console.warn("⚠️ No trainers returned from training schedule API.");
      }

      const prefilledQType = data.question_types?.[0];
      if (prefilledQType) {
        const matched = questionTypes.find(
          (q) => q.question_type === prefilledQType
        );
        if (matched) {
          setSelectedQuestionType(matched.id);
        }
      }*/}
    })
    .catch((err) => {
      console.error("❌ Failed to load training schedule details:", err);
    });
}, [id, questionTypes]);

useEffect(() => {
  if (!id) return;

  getTrainingSchedulenewdataAPI(id)
    .then((data) => {
      console.log("📌 Prefill Training Schedule Data:", data);
      // ✅ Prefill Question Type (from API field `question_type_ids`)
      if (Array.isArray(data.question_type_ids) && data.question_type_ids.length > 0) {
  setSelectedQuestionType(data.question_type_ids.map(String)); // store all IDs as strings
}

      // ✅ Prefill Skill Types (from API field `skill_type_ids`)
      if (Array.isArray(data.skill_type_ids)) {
        setSelectedSkills(data.skill_type_ids.map(String)); // checkbox stores as string ids
      }

      // ✅ Preload Skills list for rendering checkboxes
      if (Array.isArray(data.skill_type)) {
        setSkills(data.skill_type); // skill_type already comes with {id, skill_type}
      }
    })
    .catch((err) => {
      console.error("❌ Failed to load training schedule:", err);
    });
}, [id]);


  useEffect(() => {
    if (id) {
      getAssignedTopicsByTrainingId_API(id)
        .then((res) => {
          setAssignedTopics(res.assigned_data || []);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch assigned topics:", err);
        });
    }
  }, [id]);


  useEffect(() => {
    if (collegeId) {
      getBatchnumberClgID_API(collegeId)
        .then((batches) => {
          const options = batches.batch_numbers.map((b) => ({ label: b, value: b }));
          setBatchNumbers(options);
        })
        .catch((err) => {
          console.error("❌ Error loading batch numbers:", err);
        });
    }
  }, [collegeId]);

 useEffect(() => {
  if (collegeId && selectedBatch) {
    const joinedBatch = selectedBatch.join(',');
    console.log("📦 Fetching departments for batches:", joinedBatch, "collegeId:", collegeId);

    getDepartmentsByBatchAndCollege_API(collegeId, joinedBatch)
      .then((res) => {
        console.log("✅ Departments fetched:", res.departments);
        setDepartmentListByBatch(res.departments || []);
      })
      .catch((err) => {
        console.error("❌ Error loading departments:", err);
        setDepartmentListByBatch([]);
      });
  }
}, [selectedBatch, collegeId]);

  const [assessmentTestTypes, setAssessmentTestTypes] = useState([]);
  const [selectedTestType, setSelectedTestType] = useState([]);
  useEffect(() => {
    getAssessmentTestTypesAPI()
      .then(setAssessmentTestTypes)
      .catch(err => console.error("❌ Error:", err));
  }, []);

  const handleTrainingScheduleUpdate = async () => {
    try {
      console.log("🚀 Starting training schedule update...");

      const formData = new FormData();

      console.log("📦 Appending selected batches:", selectedBatch);
      formData.append("batches", JSON.stringify(selectedBatch));

      if (selectedDepartmentId) {
        console.log("🏫 Appending selected department ID:", selectedDepartmentId);
        formData.append("department_id", selectedDepartmentId);
      }

      // If selectedTrainers contains user_name
const selectedTrainerObjects = trainerOptions.filter(opt =>
  selectedTrainers.includes(opt.user_name)
);

      console.log("👥 Selected trainer objects:", selectedTrainerObjects);

      const trainerIds = selectedTrainerObjects.map(opt => opt.value);
      const trainerNames = selectedTrainerObjects.map(opt => opt.label);

      console.log("🔢 Trainer IDs:", trainerIds);
      console.log("📝 Trainer Names:", trainerNames);

      formData.append("trainer_ids", JSON.stringify(trainerIds));
      formData.append("trainers", JSON.stringify(trainerNames));

      console.log("📤 Sending data to update API...");
      const response = await updateTrainingScheduleAPI(formData, id);
      console.log("✅ Update API response:", response);

      if (response?.status === 200) {
        alert(response?.data?.message || "Training schedule updated successfully.");
        console.log("✅ Training schedule updated.");

        console.log("📤 Calling assignTopicsToTrainerAPI...");
        const assignResponse = await assignTopicsToTrainerAPI(id);
        console.log("📥 Assign API Response:", assignResponse);

        if (assignResponse?.status === 200 && assignResponse.data?.assigned_data) {
        alert("✅ Topics assigned successfully.");
      } else if (assignResponse?.status === 400 && assignResponse.data?.missing_topics) {
        const missing = assignResponse.data.missing_topics.join(", ");
        console.warn("❌ Missing topics in content_master:", missing);
        alert(`❌ These topics are missing in content master:\n${missing}`);
      } else {
        console.warn("⚠️ Assign API returned no data or unexpected error.");
      }


        console.log("📥 Fetching assigned topics...");
        const fetchedAssign = await getAssignedTopicsByTrainingId_API(id);
        console.log("📋 Assigned topics fetched:", fetchedAssign);

        if (fetchedAssign?.assigned_data) {
          setAssignedTopics(fetchedAssign.assigned_data);
          console.log("📌 Assigned topics set.");
        }

        // ✅ Schedule test section
        // ✅ Schedule test section
try {
  const testPayload = {
    training_id: id,
    test_type_id: selectedTestType,
    start_time: `${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')} ${startMeridian.value}`,
    end_time: `${endHour.padStart(2, '0')}:${endMinute.padStart(2, '0')} ${endMeridian.value}`,
    schedule_day_option: scheduleDayOption,
   // duration_of_test: duration,
    is_testcase: isTestcase,
    question_type_id: selectedQuestionType, 
     skill_type_ids: selectedSkills,   // ✅ Added
  //skill_type_id: selectedSkills.join(","),
  };

  console.log("🧪 Scheduling test with payload:", testPayload);

  // Make the API call
  const response = await scheduleTestAPI(testPayload);

  // ✅ Check if response has `message` key (successful case)
  if (response?.message) {
    console.log("✅ Test scheduled successfully:", response.message);
    alert(response.message);
  }
  // ❌ Check if response has missing topics
  else if (response?.missing_topics) {
    const missingTopics = response.missing_topics.join(", ");
    console.warn("⚠️ Missing topics for questions:", missingTopics);
    alert(`❌ These topics are missing questions in question master:\n${missingTopics}`);
  }
  // ❌ Catch-all for other unexpected formats
  else {
    console.error("⚠️ Unexpected test scheduling response:", response);
    alert("⚠️ Failed to schedule test due to unexpected issue.");
  }

} catch (testError) {
  console.error("❌ Error occurred while scheduling test:", testError);

  const errorData = testError?.response?.data;

  if (errorData?.missing_topics) {
    const missing = errorData.missing_topics.join(", ");
    alert(`❌ These topics are missing questions in question master:\n${missing}`);
  } else if (errorData?.error) {
    alert(`❌ Error: ${errorData.error}`);
  } else {
    alert("❌ Test scheduling failed due to unexpected error.");
  }
}


      } else {
        console.error("❌ Update failed. Response:", response);
        alert("❌ Update failed.");
        setAssignedTopics([]);
      }
    }  catch (error) {
  console.error("❌ Error in handleTrainingScheduleUpdate:", error);

  // Show missing topics if available in error response
  const errorData = error?.response?.data;

  if (errorData?.missing_topics) {
    const missing = errorData.missing_topics.join(", ");
    alert(`❌ These topics are missing in content master:\n${missing}`);
    console.warn("❌ Missing topics:", missing);
  } else if (errorData?.error) {
    alert(`❌ Error: ${errorData.error}`);
  } else {
    alert("❌ Failed to update training schedule or assign topics.");
  }

  setAssignedTopics([]);
}

  };


  return (
    <div className='form-ques-master' style={{  margin: "0 auto" }} >
      <div className="d-flex flex-wrap gap-4 mt-4">
        {/* Left Container: Batch & Department */}
        <div className="p-3 rounded shadow-sm" style={{ flex: 1, minWidth: '300px', background: 'rgb(55, 63, 70)', boxShadow: '0 4px 8px rgba(60, 59, 59, 0.2)' }}>


          <Form.Group controlId="multi_batch" className="mb-3">
            <Button
              variant="link"
              onClick={() => setShowModal(true)}
              style={{ color: '#fff', marginLeft: '10px' }}
            >
              <i className="bi bi-plus-circle"></i> {/* Bootstrap icon */}
            </Button>

            <Form.Label><strong> Batch (Multi-Select)</strong></Form.Label>
            <Select
              isMulti
              options={batchNumbers}
              value={batchNumbers.filter(opt => selectedBatch.includes(opt.value))}
              onChange={(selectedOptions) => {
                const values = selectedOptions.map(opt => opt.value);
                setSelectedBatch(values);
              }}
              placeholder="Select Batch Numbers"
              styles={customStyles}
              components={{ Option: CustomOption }}
     closeMenuOnSelect={false}
            />

          </Form.Group>

        {selectedBatch.length > 0 && (
  <div className="mt-3">
    <Form.Label><strong>Departments for Selected Batch(es):</strong></Form.Label>
    <div
      className="department-container-sch"    >
      <ul
       
      >
        {departmentListByBatch.map((dept) => (
          <li key={dept.id} style={{ padding: '4px 0', fontSize: '14px' }}>
            {dept.department}
          </li>
        ))}
      </ul>
    </div>
  </div>
)}
<Form.Group controlId="question_type_id" className="mb-3"> 
  <Form.Label><strong>Question Type</strong></Form.Label>
  <Select
    isMulti
    options={questionTypeOptions}
    value={questionTypeOptions.filter(opt => selectedQuestionType.includes(String(opt.value)))}
    onChange={(selectedOptions) => {
      const selectedIds = selectedOptions ? selectedOptions.map(opt => String(opt.value)) : [];
      const selectedLabels = selectedOptions ? selectedOptions.map(opt => opt.label) : [];

      setSelectedQuestionType(selectedIds);

      // Reset related fields
      setSelectedSkills([]);
      setSkills([]);
      setSelectedTrainers([]);
      setTrainers([]);

      // 🔹 Auto-select Test Type(s)
      let newTestTypes = [...selectedTestType];

      if (selectedLabels.includes("Aptitude")) {
        const mcqOption = assessmentTestTypes.find(opt => opt.label === "MCQ Test");
        if (mcqOption && !newTestTypes.includes(mcqOption.value)) {
          newTestTypes.push(mcqOption.value);
        }
      }

      if (selectedLabels.includes("Technical")) {
        const codingOption = assessmentTestTypes.find(opt => opt.label === "Coding Test");
        if (codingOption && !newTestTypes.includes(codingOption.value)) {
          newTestTypes.push(codingOption.value);
        }
      }

      setSelectedTestType(newTestTypes);

      // 🔹 Fetch skills for all selected question types
      if (selectedIds.length > 0) {
        Promise.all(selectedIds.map(id => getSkillTypesByQuestionType_API(id)))
          .then(results => {
            const merged = Array.from(new Map(
              results.flat().map(item => [item.id, item])
            ).values());
            setSkills(merged);
          });
      }
    }}
    placeholder="-- Select Question Types --"
    styles={customStyles}
  />
</Form.Group>



          <Form.Group controlId="skill_type_id" className="mb-3">
            <Form.Label><strong>Skills</strong></Form.Label>
            <div>
              {skills.map((skill) => (
                <Form.Check
                  key={skill.id}
                  type="checkbox"
                  label={skill.skill_type}
                  value={skill.id}
                  checked={selectedSkills.includes(String(skill.id))}
                  onChange={(e) => {
                    const skillId = e.target.value;
                    const updatedSkills = e.target.checked
                      ? [...selectedSkills, skillId]
                      : selectedSkills.filter((id) => id !== skillId);

                    setSelectedSkills(updatedSkills);
                    setSelectedTrainers([]); // ✅ Clear selected trainers
                  }}
                />
              ))}
            </div>
          </Form.Group>
         <Form.Group controlId="trainer" className="mb-3">
  <div className="d-flex align-items-center justify-content-between">
    <Form.Label><strong>Trainer</strong></Form.Label>
    <div>
      <Button
        variant="link"
        onClick={() => setShowAddTrainerModal(true)}
        style={{ color: '#fff', marginRight: '10px' }}
      >
        <i className="bi bi-plus-circle"></i>
      </Button>
      
    </div>
  </div>

<Select
  options={trainerOptions}
  value={trainerOptions.filter(opt => selectedTrainers.includes(opt.user_name))} // Match by user_name if that's what you store
  onChange={(selectedOptions) => handleMultiSelect(selectedOptions, 'trainers')}
  isMulti
  placeholder="Select Trainers"
  styles={customStyles}
  components={{ Option: CustomOption }}
  closeMenuOnSelect={false}
/>


</Form.Group>


        </div>

        {/* Right Container: Question Type, Skills, Trainers */}
        <div className="p-3 rounded shadow-sm" style={{ flex: 1, minWidth: '300px', background: 'rgb(55, 63, 70)', boxShadow: '0 4px 8px rgba(60, 59, 59, 0.2)' }}>
         <Form.Group controlId="test_type_id" className="mb-3">
  <Form.Label><strong>Test Type (Assessment Only)</strong></Form.Label>
  <Select
    isMulti
    options={assessmentTestTypes}
    styles={customStyles}
    value={assessmentTestTypes.filter(opt => selectedTestType.includes(String(opt.value)))}
    onChange={(selectedOptions) => {
      const selectedIds = selectedOptions ? selectedOptions.map(opt => String(opt.value)) : [];
      setSelectedTestType(selectedIds);
    }}
    placeholder="Select Test"
  />
</Form.Group>

          <p></p>
         {assessmentTestTypes.find(opt => opt.value === selectedTestType)?.label === "Coding Test" && (
  <Form.Group controlId="is_testcase" className="mb-3">
    <Form.Check
      type="checkbox"
      label="Is Test Case "
      checked={isTestcase}
      onChange={(e) => setIsTestcase(e.target.checked)}
    />
  </Form.Group>
)}

         <Form.Group controlId="time_range" className="mb-3">
  <Form.Label><strong>Start & End Time</strong></Form.Label>
  <div className="row">

    {/* Start Time Block */}
 <div className="col-md-6" style={{ marginBottom: "12px", width: "100%" }}>
     
      <div className="d-flex gap-2 align-items-center" style={{ width: "100%" }}>
        <input
          type="number"
          min={1}
          max={12}
          value={startHour}
          onChange={(e) => setStartHour(e.target.value)}
          placeholder=" Start Hour"
          className="input-ques"
          style={{ flex: 1 }}
        />
        :
        <input
          type="number"
          min={0}
          max={59}
          value={startMinute}
          onChange={(e) => setStartMinute(e.target.value)}
          placeholder="Minute"
          className="input-ques"
          style={{ flex: 1 }}
        />
        <div style={{ flex: 1 }}>
          <Select
            options={meridianOptions}
            value={startMeridian}
            onChange={setStartMeridian}
            styles={customStyles}
          />
        </div>
      </div>
    </div>

    {/* End Time Block */}
    <div className="col-md-6 mt-3 mt-md-0" style={{ width: "100%" }}>
     
      <div className="d-flex gap-2 align-items-center">
        <input
          type="number"
          min={1}
          max={12}
          value={endHour}
          onChange={(e) => setEndHour(e.target.value)}
          placeholder="End Hour"
          className="input-ques"
          style={{ flex: 1 }}
        />
        :
        <input
          type="number"
          min={0}
          max={59}
          value={endMinute}
          onChange={(e) => setEndMinute(e.target.value)}
          placeholder="Minute"
          className="input-ques"
          style={{ flex: 1 }}
        />
        <div style={{ flex: 1 }}>
          <Select
            options={meridianOptions}
            value={endMeridian}
            onChange={setEndMeridian}
            styles={customStyles}
          />
        </div>
      </div>
    </div>

  </div>
</Form.Group>

          <Form.Group controlId="schedule_day_option" className="mb-3">
            <Form.Label><strong>Schedule Test On</strong></Form.Label>
            <Select
              options={[
                { label: 'On Day', value: 'on_day' },
                { label: 'Next Day', value: 'next_day' },
                { label: 'Two Days Later', value: 'two_days_later' },
              ]}
              value={{
                label:
                  scheduleDayOption === 'on_day'
                    ? 'On Day'
                    : scheduleDayOption === 'next_day'
                      ? 'Next Day'
                      : 'Two Days Later',
                value: scheduleDayOption,
              }}
              onChange={(selected) => setScheduleDayOption(selected.value)}
              styles={customStyles}
            />
          </Form.Group>

          {/* New: No. of Questions */}
         {/*} <Form.Group controlId="duration_of_test" className="mb-3">
            <Form.Label><strong>Duration of Test</strong></Form.Label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setduration(e.target.value)}
              className="input-ques"
              placeholder="Enter number of questions"
            />
          </Form.Group>*/}
          <p></p>
          {/* New: Is Test Case (Only for Coding Tests) */}
         

        </div>


      </div>
      <p></p>
      <div className='button-container-set'>
        <button className='button-ques-save' onClick={() => navigate(`/edit-schedule/${id}`)}>Back</button>
        <button className='button-ques-save' onClick={handleTrainingScheduleUpdate}>
          Update
        </button>
      </div>

      {assignedTopics.length > 0 && (
        <div className="mt-4 p-3 rounded shadow-sm" style={{ background: '#39444e', color: "white" }}>
          <h5>📋 Assigned Topics Schedule:</h5>
          <div style={{ overflowX: "auto" }}>
            <table className="table schedule-table" >
              <thead>
                <tr>
                  <th>Date</th>
                  {[...new Set(assignedTopics.map(item => item.batch))].map(batch => (
                    <React.Fragment key={batch}>
                      <th colSpan={2}>{batch}</th>
                    </React.Fragment>
                  ))}
                </tr>
                <tr style={{ backgroundColor: '#1f252a' }}>
                  <th></th>
                  {[...new Set(assignedTopics.map(item => item.batch))].map(batch => (
                    <React.Fragment key={batch}>
                      <th>FN</th>
                      <th>AN</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...new Set(assignedTopics.map(item => item.date))].map(date => (
                  <tr key={date}>
                    <td><strong>{date}</strong></td>
                    {[...new Set(assignedTopics.map(item => item.batch))].flatMap(batch =>
                      ["FN", "AN"].map(session => {
                        const slot = assignedTopics.find(
                          item => item.date === date && item.batch === batch && item.session === session
                        );
                        return (
                          <td key={`${batch}-${session}-${date}`} >
                            {slot ? (
                              <>
                                <div style={{ fontWeight: "bold", color: "#b30000" }}>{slot.trainer}</div>
                               <div>
  {slot.topics.map((topic, index) => (
    <span key={index}>
      {topic}{index < slot.topics.length - 1 && " , "}
    </span>
  ))}
</div>

                              </>
                            ) : "-"}
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal show={showAddTrainerModal} onHide={() => setShowAddTrainerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Trainer</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group controlId="trainer_name">
                  <Form.Label>Trainer Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTrainer.trainer_name}
                    onChange={(e) => setNewTrainer({ ...newTrainer, trainer_name: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="user_name">
                  <Form.Label>User Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTrainer.user_name}
                    onChange={(e) => setNewTrainer({ ...newTrainer, user_name: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newTrainer.password}
                    onChange={(e) => setNewTrainer({ ...newTrainer, password: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="skill_type" >
                  <Form.Label>Skill Type</Form.Label>
                  {skills.map((skill) => (
                    <Form.Check
                      key={skill.id}
                      type="checkbox"
                      label={skill.skill_type}
                      value={skill.id}
                      checked={newTrainer.skill_type.includes(skill.id)}
                      onChange={(e) => {
                        const id = skill.id;
                        const updated = e.target.checked
                          ? [...newTrainer.skill_type, id]
                          : newTrainer.skill_type.filter((s) => s !== id);
                        setNewTrainer({ ...newTrainer, skill_type: updated });
                      }}
                    />
                  ))}
                </Form.Group></Col>
            </Row>


          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="success"
            onClick={async () => {
              try {
                const res = await addTrainerwithskillApi(newTrainer);
                alert('Trainer added successfully');
                setShowAddTrainerModal(false);
                fetchTrainersForSkills(selectedSkills); // refresh trainers
              } catch (err) {
                console.error('❌ Error adding trainer:', err);
                alert('Error adding trainer');
              }
            }}
          >
            Add Trainer
          </Button>
          <Button variant="secondary" onClick={() => setShowAddTrainerModal(false)}>
            Cancel
          </Button>

        </Modal.Footer>
      </Modal>


      {/* React Bootstrap Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Batch for Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row><Col md={6}>
              <Form.Group controlId="batch_no" className="mb-3">
                <Form.Label>Batch No</Form.Label>
                <Form.Control
                  type="text"
                  name="batch_no"
                  value={formData.batch_no}
                  onChange={handleInputChange}
                />
              </Form.Group></Col>
              <Col md={6}>
                <Form.Group controlId="department_id" className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Department --</option>
                    {departmentOptions.map((dept, idx) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department}
                      </option>

                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row><Col md={6}>
              <Form.Group controlId="reg_start" className="mb-3">
                <Form.Label>Reg No Start</Form.Label>
                <Form.Control
                  type="text"
                  name="reg_start"
                  value={formData.reg_start}
                  onChange={handleInputChange} // ✅ Allow editing
                />
              </Form.Group></Col>
              <Col md={6}>
                <Form.Group controlId="reg_end" className="mb-3">
                  <Form.Label>Reg No End</Form.Label>
                  <Form.Control
                    type="text"
                    name="reg_end"
                    value={formData.reg_end}
                    onChange={handleInputChange} // ✅ Allow editing
                  />
                </Form.Group>
              </Col></Row>


          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={submitBatchUpdate}>
            Submit
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UpdateTraining;
