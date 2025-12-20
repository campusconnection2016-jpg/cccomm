import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
  get_department_info_cumula_API,
  getBatchnumberClgID_API,downloadTopicsExcel,
  uploadTrainingScheduleAPI,updateBatchSkill_API,
  getCollege_logo_API_Training,deleteTrainingscheduleApi,getSkillTypesByQuestionType_API,getFoldersBySkillType_API,getqstntypeTrainingApi,

  getCollegeList_Concat_API,
  getcollege_Test_Api,
  get_user_colleges_API,
} from "../../api/endpoints";


import { Col, Row } from "react-bootstrap";
import HolidayComponent from './holidays';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import "react-datetime/css/react-datetime.css";
import CustomOption from '../test/customoption';
import CustomPagination from '../../api/custompagination';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
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


const TrainingScheduleForm = ({username, userRole}) => {
  //  console.log("usertra", username)
  //   console.log("userRoletra", userRole)
  const [collegeList, setCollegeList] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);

  const [departmentList, setDepartmentList] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationHolidays, setLocationHolidays] = useState([]);

  const [govtHolidays, setGovtHolidays] = useState([]); // for selected location's holidays

  const [locat, setlocat] = useState('');
  const [updateStartDate, setUpdateStartDate] = useState('');
  const [updateEndDate, setUpdateEndDate] = useState(null);
  const [updateNoOfDays, setUpdateNoOfDays] = useState('');
  const [trainingDates, setTrainingDates] = useState([]);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [updateNoOfBatch, setUpdateNoOfBatch] = useState(0);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search input
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages1, setTotalPages1] = useState(1);
  const [pageSize] = useState(10); // Items per page
  const navigate = useNavigate();
  const [triggerFetch, setTriggerFetch] = useState(true);
  const [tempId, setTempId] = useState(null); // For storing temp ID
   const batchOptionsWithAll = [{ label: "All Batches", value: "ALL" }, ...batchNumbers];
const departmentOptionsWithAll = [{ label: "All Departments", value: "ALL" }, ...departmentList];
const [questionTypes, setQuestionTypes] = useState([]);
const [skillTypes, setSkillTypes] = useState([]);
const [batchSkillMappings, setBatchSkillMappings] = useState([]);
const [batchSkillSelections, setBatchSkillSelections] = useState({});

const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]); // array
const [selectedSkillTypes, setSelectedSkillTypes] = useState([]);       // array

const [collegeIds, setCollegeIds] = useState([]); // for Training admin
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


  // Load Question Types initially
useEffect(() => {
  getqstntypeTrainingApi().then(setQuestionTypes);
  setSkillTypes([]);
  setSelectedQuestionTypes([]);
  setSelectedSkillTypes([]);
}, []);

useEffect(() => {
  if (selectedQuestionTypes.length > 0) {
    Promise.all(
      selectedQuestionTypes.map(qtId =>
        getSkillTypesByQuestionType_API(qtId)
      )
    ).then(results => {
      // Flatten and remove duplicates
      const merged = Array.from(new Map(
        results.flat().map(item => [item.id, item])
      ).values());
      setSkillTypes(merged);
    });
    setSelectedSkillTypes([]);
  } else {
    setSkillTypes([]);
  }
}, [selectedQuestionTypes]);


  const fetchColleges = async (page) => {
    try {
      const collegesData = await getCollege_logo_API_Training(page, searchTerm); // Pass searchTerm here
      setColleges(collegesData.results);
      setTotalPages1(Math.ceil(collegesData.count / pageSize));

    } catch (error) {
      console.error("Error:", error);
    }
  };
 const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this training schedule?")) {
    try {
      await deleteTrainingscheduleApi(id);
      alert("Training schedule deleted successfully!");

      // 👇 Refresh current page data properly
      fetchColleges(currentPage); 
    } catch (error) {
      console.error("Error deleting training schedule:", error);
      alert("Failed to delete training schedule.");
    }
  }
};


  useEffect(() => {
    fetchColleges(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handlePageChange1 = (page) => {
    setCurrentPage(page);
  };

  const [form, setForm] = useState({
    college_id: '',
    no_of_days: '',
    location: '',
    no_of_batch: '',
    no_of_trainer: '',
    department_id: [],
    year: [],
    batches: [],
    trainers: [],
    topics: [],
    no_of_topics: '',
    trainer_date: {},
    trainer_ids: '',
    remarks_file: null,
  });
  const [isManualEndDate, setIsManualEndDate] = useState(false);

  const yearOptions = ['1', '2', '3', '4'];

  // Fetch college list
  useEffect(() => {
    if (triggerFetch) {
      getCollegeList_Concat_API()
        .then((data) => {
          const options = data.map((college) => ({
            value: college.id,
            label: college.college_group_concat,
          }));
          setCollegeList([{ value: '', label: 'College - College Group' }, ...options]);

          // ✅ Only reset trigger after successful data fetch
          setTriggerFetch(false);
        })
        .catch((error) => console.error("Error fetching college list:", error));
    }
  }, [triggerFetch]);

  // When college is selected: fetch department + batch
  useEffect(() => {
    if (selectedCollege) {
      const collegeId = selectedCollege.value;
      setForm(prev => ({ ...prev, college_id: collegeId }));

      get_department_info_cumula_API([collegeId])
        .then((data) => {
          const options = Array.isArray(data)
            ? data.map((d) => ({
              value: d.department_id__id,
              label: d.department_id__department,
            }))
            : [];
          setDepartmentList(options);
        })
        .catch(() => setDepartmentList([]));

      getBatchnumberClgID_API(collegeId)
        .then((batches) => {
          const options = batches.batch_numbers.map((b) => ({
            label: b,
            value: b,
          }));
          setBatchNumbers(options);
        })
        .catch(() => setBatchNumbers([]));
    }
  }, [selectedCollege]);
  // 🔄 Fetch Holidays Once on Mount
  useEffect(() => {
    console.log("📥 Fetching holiday JSON from /data/tn-holidays-2025.json");
    fetch("/data/tn-holidays-2025.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("❌ File not found or fetch failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("✅ Holiday JSON fetched successfully:", data);

        const locationKeys = Object.keys(data);
        console.log("📍 Extracted locations:", locationKeys);
        setLocations(locationKeys);

        const parsedHolidayMap = {};
        Object.entries(data).forEach(([location, holidays]) => {
          parsedHolidayMap[location] = holidays.map(dateStr => new Date(dateStr));
          console.log(`📅 Holidays parsed for location "${location}":`, parsedHolidayMap[location].map(d => d.toDateString()));
        });

        setGovtHolidays(parsedHolidayMap);
        console.log("✅ Mapped holidays set to state");
      })
      .catch((error) => {
        console.error("❌ Error loading JSON file:", error);
      });
  }, []);
  const parseDateSafe = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  };

  const calculateEndDate = (startDate, daysToAdd, holidays) => {
    let currentDate = new Date(startDate);
    let addedDays = 0;

    console.log("🚀 Calculating End Date...");
    console.log("👉 Start Date:", currentDate.toDateString());
    console.log("🧾 Days to Add:", daysToAdd);
    console.log("🏖️ Holidays:", holidays.map(h => h.toDateString()));

    while (addedDays < daysToAdd) {
      const currentDateStr = currentDate.toDateString();
      const isHoliday = holidays.some(h => h.toDateString() === currentDateStr);
      const isSunday = currentDate.getDay() === 0; // Only skip Sundays (0 = Sunday)

      console.log(`➡️  ${currentDate.toDateString()} | Sunday: ${isSunday} | Holiday: ${isHoliday}`);

      if (!isHoliday && !isSunday) {
        addedDays++;
        console.log(`✅ Counted as training day: ${currentDate.toDateString()} (${addedDays}/${daysToAdd})`);
      } else {
        console.log(`⏩ Skipped: ${currentDate.toDateString()}`);
      }

      if (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    console.log("✅ Final End Date:", currentDate.toDateString());
    return currentDate;
  };


  useEffect(() => {
    console.log("🟡 Triggered training calculation useEffect");

    if (updateStartDate && updateNoOfDays && Array.isArray(locationHolidays)) {
      const start = parseDateSafe(updateStartDate);
      if (!start) {
        console.error("⛔ Invalid start date provided:", updateStartDate);
        return;
      }

      console.log("📌 Start Date:", start.toDateString());
      const daysToAdd = parseInt(updateNoOfDays);
      console.log("📐 Number of training days to calculate:", daysToAdd);

      const holidaysAsDates = locationHolidays.map(h => parseDateSafe(h)).filter(Boolean);
      console.log("🎯 Parsed holidays:", holidaysAsDates.map(h => h.toDateString()));

      const trainingDatesArr = [];
      let current = new Date(start);
      let added = 0;

      while (added < daysToAdd) {
        const isHoliday = holidaysAsDates.some(h => h.toDateString() === current.toDateString());
        const isWeekend = current.getDay() === 0 || current.getDay() === 6;

        console.log(`🧭 Evaluating ${current.toDateString()} | Weekend: ${isWeekend}, Holiday: ${isHoliday}`);

        if (!isHoliday && !isWeekend) {
          trainingDatesArr.push(new Date(current));
          added++;
          console.log(`✅ Added Training Day (${added}/${daysToAdd}): ${current.toDateString()}`);
        } else {
          console.log(`⛔ Skipped Day: ${current.toDateString()} (Weekend/Holiday)`);
        }

        current.setDate(current.getDate() + 1);
      }

      console.log("📅 Final Training Dates:", trainingDatesArr.map(d => d.toDateString()));
      setTrainingDates(trainingDatesArr);

      const calculatedEndDate = calculateEndDate(start, daysToAdd, holidaysAsDates);
      setUpdateEndDate(calculatedEndDate);

      setHighlightedDates([
        { dates: holidaysAsDates, className: "holiday-date" },
        { dates: trainingDatesArr, className: "training-date" }
      ]);
      console.log("🌈 Highlighted dates updated");
    } else {
      console.warn("⚠️ Required inputs missing or invalid:", {
        updateStartDate,
        updateNoOfDays,
        locationHolidays
      });
    }
  }, [updateStartDate, updateNoOfDays, locationHolidays]);

  const handleMultiSelect = (selectedOptions, fieldName) => {
  const allOptionSelected = selectedOptions?.some(option => option.value === "ALL");
  let values = [];

  if (fieldName === 'batches') {
    const allValues = batchNumbers.map(option => option.value);
    values = allOptionSelected ? allValues : selectedOptions.map(opt => opt.value);
    setSelectedBatches(
      allOptionSelected ? batchNumbers : selectedOptions
    );
    setUpdateNoOfBatch(values.length);
  }

  if (fieldName === 'department_id') {
    const allValues = departmentList.map(option => option.value);
    values = allOptionSelected ? allValues : selectedOptions.map(opt => opt.value);
    setSelectedDepartments(
      allOptionSelected ? departmentList : selectedOptions
    );
  }

  if (fieldName === 'year') {
    values = selectedOptions.map(option => option.value);
    setSelectedYears(selectedOptions);
  }

  setForm((prevForm) => ({
    ...prevForm,
    [fieldName]: values,
    ...(fieldName === 'batches' && { no_of_batch: values.length })
  }));
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, remarks_file: e.target.files[0] }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent page refresh

    try {
      const formData = new FormData();

      // Required fields
      formData.append('college_id', selectedCollege?.value || '');
      formData.append('dtm_start', updateStartDate ? moment(updateStartDate).format('YYYY-MM-DD') : '');
      formData.append('dtm_end', updateEndDate ? moment(updateEndDate).format('YYYY-MM-DD') : '');
      formData.append('no_of_batch', updateNoOfBatch || '');
      formData.append('no_of_days', updateNoOfDays || '');
      formData.append('no_of_trainer', updateNoOfBatch || ''); // Auto-match batch count

      // Optional: Location
      if (locat) {
        formData.append('location', locat);
      }

      // Optional: Remarks file
      if (form?.remarks_file) {
        formData.append('remarks_file', form.remarks_file);
      }

      // Optional: Batches
      if (selectedBatches?.length) {
        selectedBatches.forEach(batch => {
          if (batch?.value) formData.append('batches', batch.value);
        });
      }

      // Optional: Departments
      if (selectedDepartments?.length) {
        selectedDepartments.forEach(dep => {
          if (dep?.value) formData.append('department_id', dep.value);
        });
      }

      // Optional: Years
      if (selectedYears?.length) {
        selectedYears.forEach(yr => {
          if (yr?.value) formData.append('year', yr.value);
        });
      }
     // ✅ Question Types with ID + Name
if (selectedQuestionTypes?.length) {
  const questionTypePayload = selectedQuestionTypes.map(qtId => {
    const qt = questionTypes.find(q => q.id === qtId);
    return {
      id: qt?.id || qtId,
      name: qt?.question_type || ""  // adjust field name from your API
    };
  });
  formData.append('question_type', JSON.stringify(questionTypePayload));
}

// ✅ Skill Types with ID + Name
if (selectedSkillTypes?.length) {
  const skillTypePayload = selectedSkillTypes.map(stId => {
    const st = skillTypes.find(s => s.id === stId);
    return {
      id: st?.id || stId,
      name: st?.skill_type || ""  // adjust field name
    };
  });
  formData.append('skill_type', JSON.stringify(skillTypePayload));
}

      // Required: trainer_date JSON
      const trainer_date_obj = trainingDates.reduce((acc, date, index) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        acc[`Day ${index + 1}`] = formattedDate;
        return acc;
      }, {});
      formData.append('trainer_date', JSON.stringify(trainer_date_obj));

      const response = await uploadTrainingScheduleAPI(formData, selectedCollege?.value);

      if (response?.status === 200 || response?.data?.success) {
        alert("✅ Training schedule submitted successfully!");
      console.log("📌 Selected Batches:", selectedBatches);
  console.log("📌 Selected Skill Types:", selectedSkillTypes);
  console.log("📌 Selected Question Types:", selectedQuestionTypes);
      const newTempId = response.data.id;
      setTempId(newTempId);
// Step 2: Build batch → skill map with id + name
// ✅ Step 2: Build batch → skill map
      const batchSkillMap = {};
      batchSkillMappings.forEach(({ batchId, skillId }) => {
        const skill = skillTypes.find(st => st.id === skillId);
        if (!batchSkillMap[batchId]) {
          batchSkillMap[batchId] = [];
        }
        batchSkillMap[batchId].push({
          skill_type: skill?.skill_type || "",
          skill_type_id: skill?.id || skillId
        });
      });

      console.log("🗂 Correct Batch → Skill Map:", batchSkillMap);

      // ✅ Step 3: Send JSON payload to batch-skill API
      const res2 = await updateBatchSkill_API(newTempId, batchSkillMap);
      //const res2 = await updateBatchSkill_API(
      //  newTempId,
      //  JSON.stringify(batchSkillMap) // 👈 ensure JSON is sent
      //);
//
      console.log("✅ Batch-Skill API Response:", res2);
      fetchColleges();
       } else {
        alert("⚠️ Failed to submit training schedule.");
        console.error("Server response:", response);
      }
    } catch (err) {
      console.error("❌ Error during form submission:", err);
      alert("❌ Submission failed. Please check console for details.");
    }
  };

const handleDownload = async () => {
  try {
    if (!selectedYears || selectedYears.length === 0) {
      console.warn("⚠️ No years selected!");
      return;
    }

    // ✅ Print each selected year
    selectedYears.forEach((year, index) => {
      console.log(`✅ Year[${index}] selected:`, year);
    });

    const response = await downloadTopicsExcel(selectedYears);

    console.log("📥 API Response received:", response);

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "topics.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("❌ Error downloading topics Excel:", error);
  }
};


  return (

    <div >
      <div className='form-ques-master'>
       
      <form onSubmit={handleSubmit} className='form-ques-master'>


        <Row>
          <Col>
            <label>College:</label><p></p>
            <Select options={userColleges}
              styles={customStyles}
              onChange={setSelectedCollege} value={selectedCollege} />

          </Col>
          <Col>
            <label>Batches:</label><p></p>
            <Select
              isMulti
               options={batchOptionsWithAll}
             // options={batchNumbers}
              styles={customStyles}
               components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
              onChange={(selected) => handleMultiSelect(selected, 'batches')}
            /></Col>
          <Col>
            <label>Departments:</label><p></p>
            <Select
              isMulti
              options={departmentOptionsWithAll}

              //options={departmentList}
              styles={customStyles}
              components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
              onChange={(selected) => handleMultiSelect(selected, 'department_id')}
            /></Col>
        </Row><p></p>

        <Row>
          <Col><label>Year(s):</label><p></p>
            <Select
              isMulti
              styles={customStyles}
              components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
              options={yearOptions.map((y) => ({ label: y, value: y }))}
              onChange={(selected) => handleMultiSelect(selected, 'year')}
            /></Col>


          <Col>
            <label>No. of Days:</label><p></p>
            <input
              type="number"
              name="no_of_days"
              value={form.no_of_days}
              className='input-ques-su'
              onChange={(e) => {
                handleInputChange(e); // updates form.no_of_days
                setUpdateNoOfDays(e.target.value); // ✅ add this line to trigger calculations
              }}
            />

          </Col>
          <Col>      <label>Location:</label><p></p>
            <Select
              options={locations.map(loc => ({ label: loc, value: loc }))}
              onChange={(selected) => {
                setForm(prev => ({ ...prev, location: selected.value }));
                setlocat(selected.value); // if you're using it elsewhere
                if (govtHolidays[selected.value]) {
                  setLocationHolidays(govtHolidays[selected.value]);
                } else {
                  setLocationHolidays([]);
                }
              }}
              styles={customStyles}
            />
          </Col>
        </Row>  <p></p>

        <Row>
          {/*<Col>  <label>No. of Batches:</label><p></p>
      <input type="number" name="no_of_batch" 
      className='input-ques' value={form.no_of_batch} onChange={handleInputChange} />
</Col>*/}
         
          <Col>
  <div>
    <label>Topic</label><p></p>
    <Select
      styles={customStyles}
      options={questionTypes.map(qt => ({
        value: qt.id,
        label: qt.question_type
      }))}
      components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
      value={selectedQuestionTypes.map(id => ({
        value: id,
        label: questionTypes.find(qt => qt.id === id)?.question_type || ""
      }))}
      onChange={options => setSelectedQuestionTypes(options ? options.map(o => o.value) : [])}
      placeholder="-- Select Question Type(s) --"
      isClearable
      isMulti
    />
  </div>
</Col>
<Col>
  <div>
    <label>Skill Type</label><p></p>
    <Select
      styles={customStyles}
      options={skillTypes.map(st => ({
        value: st.id,
        label: st.skill_type
      }))}
      components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
      value={selectedSkillTypes.map(id => ({
        value: id,
        label: skillTypes.find(st => st.id === id)?.skill_type || ""
      }))}
      onChange={options => setSelectedSkillTypes(options ? options.map(o => o.value) : [])}
      placeholder="-- Select Skill Type(s) --"
      isClearable
      isMulti
    />
  </div>
</Col>
  <Col>
  <div>
    <label>Batch–Skill Mapping</label><p></p>
  <Select
  isMulti
  styles={customStyles}
  components={{ Option: CustomOption }}
  closeMenuOnSelect={false}
  options={selectedBatches.flatMap(batch =>
    skillTypes
      .filter(skill => selectedSkillTypes.includes(skill.id)) // ✅ only selected skills
      .map(skill => ({
        value: `${batch.value}_${skill.id}`,
        label: `${batch.label} → ${skill.skill_type}`,
        batchId: batch.value,
        skillId: skill.id
      }))
  )}
  value={batchSkillMappings.map(({ batchId, skillId }) => {
    const batch = selectedBatches.find(b => b.value === batchId);
    const skill = skillTypes.find(s => s.id === skillId);
    return {
      value: `${batchId}_${skillId}`,
      label: `${batch?.label ?? batchId} → ${skill?.skill_type ?? skillId}`,
      batchId,
      skillId
    };
  })}
  onChange={(options) => {
    const mappings = (options ?? []).map(opt => ({
      batchId: opt.batchId,
      skillId: opt.skillId
    }));
    console.log("📌 Batch–Skill Mappings:", mappings);
    setBatchSkillMappings(mappings);
  }}
  placeholder="-- Select Batch → Skills --"
/>



  </div>

</Col>

    </Row><p></p>
<Row>
 <Col> <label>Topics (.xlsx, .docx, .pdf, .txt):</label><p></p>
            <input type="file" accept=".xlsx,.docx,.pdf,.txt" onChange={handleFileChange} />

          </Col>

   <Col>
            <div >
              <label className="label5-ques" style={{ marginRight: '10px' }}>Start Date</label><p></p>
              <DatePicker
                selected={parseDateSafe(updateStartDate)}
                onChange={(date) => setUpdateStartDate(date)}
                highlightDates={highlightedDates}
                showTimeSelect
                timeFormat="hh:mm aa"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy, h:mm aa"
                timeCaption="Time"
                className="input-date-custom"
                autoComplete="off"

              />


            </div>
          </Col>
          <Col>

            <div >
              <label className="label5-ques" style={{ marginRight: '10px' }}>End Date </label><p></p>
              <DatePicker
                selected={updateEndDate}
                onChange={(date) => {
                  setUpdateEndDate(date);
                  setIsManualEndDate(true);
                }}
                highlightDates={highlightedDates}
                showTimeSelect
                timeFormat="hh:mm aa"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy, h:mm aa"
                timeCaption="Time"
                className="input-date-custom"
                autoComplete="off"
              />


            </div>
          </Col>
          

  
</Row>
<p>

</p>
<Row>
   <Col>
            <div classname='responsive-holiday-box'>

              <label className="label5-ques">Holidays </label><p></p>
              <DatePicker
                inline
                highlightDates={[
                  {
                    "react-datepicker__day--holiday": locationHolidays.map(date => new Date(date)),
                  },
                  {
                    "react-datepicker__day--weekend": (() => {
                      const weekends = [];
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = now.getMonth();
                      for (let i = 1; i <= 31; i++) {
                        const date = new Date(year, month, i);
                        if (date.getMonth() === month && (date.getDay() === 0 || date.getDay() === 6)) {
                          weekends.push(date);
                        }
                      }
                      return weekends;
                    })()
                  }
                ]}
                onChange={(date) => {
                  const dateString = new Date(date).toDateString();
                  const exists = locationHolidays.some(
                    (d) => new Date(d).toDateString() === dateString
                  );
                  let updated;
                  if (exists) {
                    updated = locationHolidays.filter(
                      (d) => new Date(d).toDateString() !== dateString
                    );
                    console.log("Removed holiday:", dateString);
                  } else {
                    updated = [...locationHolidays, date];
                    console.log("Added holiday:", dateString);
                  }
                  setLocationHolidays(updated);
                }}
                dayClassName={(date) => {
                  const isHoliday = locationHolidays.some(
                    (d) => new Date(d).toDateString() === date.toDateString()
                  );
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  if (isHoliday) return 'react-datepicker__day--holiday';
                  if (isWeekend) return 'react-datepicker__day--weekend';
                  return undefined;
                }}
              />
            </div></Col>
</Row>

        <br /><br />
        <div className='button-container-set'>
                     
  <button type="button" className='button-ques-save'onClick={handleDownload}>
    Download
  </button>

          <button className='button-ques-save' onClick={handleSubmit}>Save</button>
         
          <button className='button-ques-save'   disabled={!tempId} onClick={() => navigate(`/edit-schedule/${tempId}`)}>Next</button>
        </div>
        <HolidayComponent location={locat} onHolidaysFetched={setGovtHolidays} />


      </form>
       <div className="po-table-responsive-t-Reports">
                    <table className="placement-table-t" >

                    <thead >
            <tr>
              <th>TrainingName</th>
              <th>College</th>


              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody >
            {colleges
              .map((college) => (
                <tr key={college.id}>
                  <td>{college.training_name}</td>
                  <td>{college.college}</td>

                  <td>
                    <button className="action-button edit" onClick={() => navigate(`/edit-schedule/${college.id}`)}>✏️</button>
                  </td>
                 <td>
  <button
    className="action-button delete"
    style={{ color: "orange" }}
    onClick={() => handleDelete(college.id)}
  >
    🗑
  </button>
</td>

                </tr>
              ))}
          </tbody>
        </table><p></p><p></p>



        <div className='dis-page' style={{ marginTop: '10%' }}>
          {/* Custom Pagination */}
          <CustomPagination
            totalPages={totalPages1}
            currentPage={currentPage}
            onPageChange={handlePageChange1}
            maxVisiblePages={3} // Limit to 3 visible pages
          />
        </div>

      </div>

      </div>
    </div>
  );
};

export default TrainingScheduleForm;

