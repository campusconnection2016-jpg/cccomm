import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Modal, Button } from 'react-bootstrap';
import AddTopicsModal from './addtopicmodal';
import {
  get_department_info_cumula_API,
  getBatchnumberClgID_API,updateBatchSkill_API,
  updateTrainingScheduleSnEWAPI,getTrainingSchedulenewdataAPI,
  getTrainingScheduleDetailsAPI,updateTrainingTopicsAPI,
  getCollege_logo_API_Training,fetchFilteredTopics,  getSkillTypesByQuestionType_API,getFoldersBySkillType_API,getqstntypeTrainingApi,
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
import { useParams } from 'react-router-dom';
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



const Updateschedule = ({username,userRole}) => {
  console.log("userup", username)
    console.log("userRoleup", userRole)
    const [showAddTopics, setShowAddTopics] = useState(false);

  const { id } = useParams();
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
  const [fetchedTrainingData, setFetchedTrainingData] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
const [filteredTopics, setFilteredTopics] = useState([]);
const [selectedSkill, setSelectedSkill] = useState(""); // for skill dropdown
const [availableSkills, setAvailableSkills] = useState([]);
const [topicSearchText, setTopicSearchText] = useState(""); // renaming to avoid conflicts
const [apiHolidayDates, setApiHolidayDates] = useState([]);
// ✅ Question Types
const [questionTypes, setQuestionTypes] = useState([]); // from API (list of {id, question_type})
const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]); // selected IDs

// ✅ Skill Types
const [skillTypes, setSkillTypes] = useState([]); // from API (list of {id, skill_type})
const [selectedSkillTypes, setSelectedSkillTypes] = useState([]); // selected IDs

// ✅ Batch–Skill Mappings
const [batchSkillMappings, setBatchSkillMappings] = useState([]); // [{ batchId, skillId }]


  useEffect(() => {
    if (id && collegeList.length) {
      console.log("🚀 Loading training data for ID:", id);
      getTrainingScheduleDetailsAPI(id).then((data) => {
        console.log("✅ Received Training Schedule Data:", data);
        setFetchedTrainingData(data); // Save it to use in next effect
        const selectedCollegeOption = collegeList.find(c => c.value === data.college_id);
        setSelectedCollege(selectedCollegeOption || null);
      });
    }
  }, [id, collegeList]);


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
  

  useEffect(() => {
    console.log("🔁 useEffect Triggered with dependencies:");
    console.log("➡️ id:", id);
    console.log("➡️ collegeList:", collegeList);
    console.log("➡️ departmentList:", departmentList);
    console.log("➡️ batchNumbers:", batchNumbers);
    console.log("➡️ locations:", locations);

    if (
      id &&
      collegeList.length &&
      departmentList.length &&
      batchNumbers.length &&
      locations.length
    ) {
      console.log("🚀 Fetching training schedule details for ID:", id);
      getTrainingScheduleDetailsAPI(id).then((data) => {
        console.log("✅ Training Data fetched:", data);

        // ✅ College
        const selectedCollegeOption = collegeList.find(c => c.value === data.college_id);
        console.log("🎓 Matched College Option:", selectedCollegeOption);
        setSelectedCollege(selectedCollegeOption || null);

        // ✅ Set form basic values
        const newForm = {
          college_id: data.college_id,
          no_of_days: data.no_of_days || '',
          no_of_batch: data.no_of_batch || '',
          location: data.location || '',
          trainer_ids: data.trainer_ids || '',
          topics: data.topics || [],
          trainer_date: data.trainer_date || {},
        };
        console.log("📝 Setting form with values:", newForm);
        setForm(prev => ({ ...prev, ...newForm }));

        // ✅ Location
        setlocat(data.location || '');
        console.log("📍 Location set to:", data.location);
if (data.holiday_dates) {
  const parsedApiHolidays = data.holiday_dates.map(dateStr => new Date(dateStr));
  console.log("📆 Holiday Dates from API:", parsedApiHolidays);
  setApiHolidayDates(parsedApiHolidays);
}

        const deptIds = data.department_id; // Now a real array like [2,3]
const matchedDepts = departmentList.filter(dep => deptIds.includes(dep.value));
handleMultiSelect(matchedDepts, 'department_id');
let years = [];

if (typeof data.year === 'string') {
  years = data.year.split(',').map(y => ({ label: y.trim(), value: y.trim() }));
} 
else if (Array.isArray(data.year)) {
  years = data.year.map(y => ({ label: y.toString(), value: y.toString() }));
} 
else if (typeof data.year === 'number') {
  years = [{ label: data.year.toString(), value: data.year.toString() }];
} 
else {
  years = [];
}

console.log("🎓 Years:", years);
handleMultiSelect(years, 'year');

       // ✅ Batches
        const selectedBatches = batchNumbers.filter(batch => data.batches.includes(batch.value));
        console.log("🎯 Selected Batches:", selectedBatches);
        handleMultiSelect(selectedBatches, 'batches');

        // ✅ Dates
        if (data.start_date) {
          console.log("📅 Start Date:", data.start_date);
          setUpdateStartDate(new Date(data.start_date));
        }
        if (data.end_date) {
          console.log("📅 End Date:", data.end_date);
          setUpdateEndDate(new Date(data.end_date));
          setIsManualEndDate(true);
        }
      });
    }
  }, [id, collegeList, departmentList, batchNumbers, locations]);

// Fetch Question Types and Skill Types once

 // 🔄 Prefill QuestionTypes, SkillTypes, Batch–Skill Mapping
// 🔄 Prefill QuestionTypes, SkillTypes, Batch–Skill Mapping
useEffect(() => {
  if (id) {
    getTrainingScheduleDetailsAPI(id).then(data => {
      console.log("🎯 Training Schedule for Prefill:", data);

      // --- Question Types ---
      if (Array.isArray(data.question_type)) {
        const qtIds = data.question_type.map(qt => qt.id || qt); 
        console.log("✅ Prefilled QuestionTypes:", qtIds);
        setSelectedQuestionTypes(qtIds);
      }

      // --- Skill Types ---
      if (Array.isArray(data.skill_type)) {
        const stIds = data.skill_type.map(st => st.id || st.skill_id || st); 
        console.log("✅ Prefilled SkillTypes:", stIds);
        setSelectedSkillTypes(stIds);
      }

      // --- Batch–Skill ---
      if (Array.isArray(data.batch_skill)) {
        const normalized = data.batch_skill.map(bs => ({
          batchId: bs.batchId || bs.batch_id || bs.batch || null,
          skillId: bs.skillId || bs.skill_id || bs.skill || null,
        }));
        console.log("✅ Prefilled Batch–Skill Mapping:", normalized);
        setBatchSkillMappings(normalized.filter(b => b.batchId && b.skillId));
      }
    });
  }
}, [id]);



  const fetchTopics = async () => {
  try {
    const data = await fetchFilteredTopics(id, selectedSkill, topicSearchText);
    setFilteredTopics(data.topics || []);
    setAvailableSkills(data.available_skills || []);
    console.log("data.skill",data.availableSkills)
  } catch (err) {
    console.error("Failed to fetch topics:", err);
  }
};

// Call fetchTopics when dependencies change
useEffect(() => {
  fetchTopics();
}, [id, selectedSkill, topicSearchText]);
const getCurrentMonthWeekends = () => {
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
};

  const fetchColleges = async (page) => {
    try {
      const collegesData = await getCollege_logo_API_Training(page, searchTerm); // Pass searchTerm here
      setColleges(collegesData.results);
      setTotalPages1(Math.ceil(collegesData.count / pageSize));

    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    fetchColleges(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

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
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

useEffect(() => {
  if (fetchedTrainingData?.topics) {
    setSelectedTopics(fetchedTrainingData.topics);
  }
}, [fetchedTrainingData]);

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
  if (
    updateStartDate &&
    updateNoOfDays &&
    Array.isArray(locationHolidays)
  ) {
    const start = parseDateSafe(updateStartDate);
    if (!start) return;

    const daysToAdd = parseInt(updateNoOfDays);
    const holidaysAsDates = locationHolidays.map(h => parseDateSafe(h)).filter(Boolean);

    const trainingDatesArr = [];
    let current = new Date(start);
    let added = 0;

    while (added < daysToAdd) {
      const isHoliday = holidaysAsDates.some(h => h.toDateString() === current.toDateString());
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;

      if (!isHoliday && !isWeekend) {
        trainingDatesArr.push(new Date(current));
        added++;
      }

      current.setDate(current.getDate() + 1);
    }

    setTrainingDates(trainingDatesArr);

    if (isManualEndDate) {
      const calculatedEndDate = calculateEndDate(start, daysToAdd, holidaysAsDates);
      setUpdateEndDate(calculatedEndDate);
    }

    setHighlightedDates([
      { dates: holidaysAsDates, className: "holiday-date" },
      { dates: trainingDatesArr, className: "training-date" }
    ]);
  }
}, [updateStartDate, updateNoOfDays, locationHolidays, isManualEndDate]);


const batchOptionsWithAll = [{ label: "All Batches", value: "ALL" }, ...batchNumbers];
const departmentOptionsWithAll = [{ label: "All Departments", value: "ALL" }, ...departmentList];

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
useEffect(() => {
  getTrainingSchedulenewdataAPI(id)   // pass schedule_id from route/prop
    .then(data => {
      console.log("📌 Training Schedule Data:", data);

      // Pre-fill Question Types
      setSelectedQuestionTypes(data.question_type_ids || []);

      // Pre-fill Skill Types
      setSelectedSkillTypes(data.skill_type_ids || []);

      // Convert batch_skill JSON → mappings
      const mappings = [];
      Object.entries(data.batch_skill || {}).forEach(([batchName, skills]) => {
        skills.forEach(skill => {
          mappings.push({
            batchId: batchName,     // assuming batchName like "BatchA"
            skillId: skill.skill_type_id
          });
        });
      });
      setBatchSkillMappings(mappings);
    })
    .catch(err => {
      console.error("❌ Error fetching schedule data:", err);
    });
}, [id]);

// Load Question Types initially
useEffect(() => {
  getqstntypeTrainingApi().then(data => {
    console.log("✅ Question Types API Response:", data);
    setQuestionTypes(data || []);
  }).catch(err => {
    console.error("❌ Error fetching Question Types:", err);
  });

  setSkillTypes([]);
  setSelectedQuestionTypes([]);
  setSelectedSkillTypes([]);
}, []);

useEffect(() => {
  console.log("🔄 Selected QuestionTypes:", selectedQuestionTypes);

  if (selectedQuestionTypes.length > 0) {
    Promise.all(
      selectedQuestionTypes.map(qtId =>
        getSkillTypesByQuestionType_API(qtId)
          .then(res => {
            console.log(`✅ SkillTypes API Response for QuestionType ${qtId}:`, res);
            return res;
          })
          .catch(err => {
            console.error(`❌ Error fetching SkillTypes for QuestionType ${qtId}:`, err);
            return [];
          })
      )
    ).then(results => {
      // Flatten and remove duplicates
      const merged = Array.from(
        new Map(results.flat().map(item => [item.id, item])).values()
      );
      console.log("📌 Final merged SkillTypes:", merged);

      setSkillTypes(merged);
    });
  } else {
    console.log("⚠️ No QuestionTypes selected → clearing skillTypes");
    setSkillTypes([]);
    setSelectedSkillTypes([]);
  }
}, [selectedQuestionTypes]);


const handleupdate = async (event) => {
  event.preventDefault(); 
  console.log("🚀 handleupdate triggered");

  try {
    const formData = new FormData();

    // ✅ Required fields
    formData.append('college_id', selectedCollege?.value || '');
    formData.append('dtm_start', updateStartDate ? moment(updateStartDate).format('YYYY-MM-DD') : (fetchedTrainingData?.start_date || ''));
    formData.append('dtm_end', updateEndDate ? moment(updateEndDate).format('YYYY-MM-DD') : (fetchedTrainingData?.end_date || ''));
    formData.append('no_of_batch', form.no_of_batch || fetchedTrainingData?.no_of_batch || '');
    formData.append('no_of_days', form.no_of_days || fetchedTrainingData?.no_of_days || '');
    formData.append('no_of_trainer', form.no_of_batch || fetchedTrainingData?.no_of_trainer || '');

    // ✅ Location (fallback)
    formData.append('location', form.location || fetchedTrainingData?.location || '');

    // ✅ Remarks file (only append if changed)
    if (form.remarks_file) formData.append('remarks_file', form.remarks_file);

    // ✅ Batches
    if ((Array.isArray(form.batches) && form.batches.length > 0)) {
      form.batches.forEach(batch => formData.append('batches', batch));
    } else if (Array.isArray(fetchedTrainingData?.batches)) {
      fetchedTrainingData.batches.forEach(batch => formData.append('batches', batch));
    }

    // ✅ Departments
    if ((Array.isArray(form.department_id) && form.department_id.length > 0)) {
      form.department_id.forEach(dep => formData.append('department_id', dep));
    } else if (Array.isArray(fetchedTrainingData?.department_id)) {
      fetchedTrainingData.department_id.forEach(dep => formData.append('department_id', dep));
    }

    // ✅ Question Types
    if (selectedQuestionTypes?.length) {
      const questionTypePayload = selectedQuestionTypes.map(qtId => {
        const qt = questionTypes.find(q => q.id === qtId);
        return { id: qt?.id || qtId, name: qt?.question_type || "" };
      });
      formData.append('question_type', JSON.stringify(questionTypePayload));
    } else if (fetchedTrainingData?.question_type) {
      formData.append('question_type', JSON.stringify(fetchedTrainingData.question_type));
    }

    // ✅ Skill Types
    if (selectedSkillTypes?.length) {
      const skillTypePayload = selectedSkillTypes.map(stId => {
        const st = skillTypes.find(s => s.id === stId);
        return { id: st?.id || stId, name: st?.skill_type || "" };
      });
      formData.append('skill_type', JSON.stringify(skillTypePayload));
    } else if (fetchedTrainingData?.skill_type) {
      formData.append('skill_type', JSON.stringify(fetchedTrainingData.skill_type));
    }

    // ✅ Years
    if ((Array.isArray(form.year) && form.year.length > 0)) {
      form.year.forEach(yr => formData.append('year', yr));
    } else if (Array.isArray(fetchedTrainingData?.year)) {
      fetchedTrainingData.year.forEach(yr => formData.append('year', yr));
    }

    // ✅ Trainer Date (use new selection OR fallback)
    if (trainingDates.length > 0) {
      const trainer_date_obj = trainingDates.reduce((acc, date, index) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        acc[`Day ${index + 1}`] = formattedDate;
        return acc;
      }, {});
      formData.append('trainer_date', JSON.stringify(trainer_date_obj));
    } else if (fetchedTrainingData?.trainer_date) {
      formData.append('trainer_date', JSON.stringify(fetchedTrainingData.trainer_date));
    }

    // ✅ Topics (use new OR fallback)
    if (form.topics?.length > 0) {
      formData.append('topics', JSON.stringify(form.topics));
    } else if (fetchedTrainingData?.topics?.length > 0) {
      formData.append('topics', JSON.stringify(fetchedTrainingData.topics));
    }

    // ✅ Trainer IDs
    formData.append('trainer_ids', form.trainer_ids || fetchedTrainingData?.trainer_ids || '');

    // 🔄 API Call
    const response = await updateTrainingScheduleSnEWAPI(formData, id);

    if (response?.status === 200 || response?.data?.success) {
      alert("✅ Training schedule updated successfully!");

      // ✅ Step 2: Batch → Skill Map
      const batchSkillMap = {};
      batchSkillMappings.forEach(({ batchId, skillId }) => {
        const skill = skillTypes.find(st => st.id === skillId);
        if (!batchSkillMap[batchId]) batchSkillMap[batchId] = [];
        batchSkillMap[batchId].push({
          skill_type: skill?.skill_type || "",
          skill_type_id: skill?.id || skillId
        });
      });

      console.log("🗂 Batch → Skill Map:", batchSkillMap);

      // ✅ Step 3: Update Batch–Skill API
      const res2 = await updateBatchSkill_API(id, batchSkillMap);
      console.log("✅ Batch-Skill API Response:", res2);

      fetchColleges();
    } else {
      alert("⚠️ Failed to update training schedule.");
      console.error("❌ Server response:", response);
    }
  } catch (err) {
    console.error("❌ Error during update:", err);
    alert("❌ Update failed. Please check console for details.");
  }
};

// Inside your component, before returning JSX
const batchSkillOptions = selectedBatches.flatMap(batch =>
  skillTypes.map(skill => ({
    value: `${batch.value}_${skill.id}`,
    label: `${batch.label} → ${skill.skill_type}`,
    batchId: batch.value,
    skillId: skill.id
  }))
);

  return (
    <div className='form-ques-master'>
      <form onSubmit={handleupdate} >
{/*<Row>   <Col></Col>   <Col></Col>      <Col>
            <button className='button-ques-save' style={{width:"150px"}} onClick={() => setShowTopicModal(true)}>
  Preview Topics
</button>
</Col></Row><p></p>*/}

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
            //  options={batchNumbers}
              onChange={(selected) => handleMultiSelect(selected, 'batches')}
              styles={customStyles}
               components={{ Option: CustomOption }}
               closeMenuOnSelect={false}
              value={batchNumbers.filter(opt => form.batches.includes(opt.value))}
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
              value={departmentList.filter(opt => form.department_id.includes(opt.value))}
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
              value={form.year.map(y => ({ label: y, value: y }))}
            />
          </Col>
          <Col>
            <label>No. of Days:</label><p></p>
            <input
              type="number"
              name="no_of_days"
              value={form.no_of_days}
              className='input-ques-su'
               onChange={(e) => {
    handleInputChange(e);
    setUpdateNoOfDays(e.target.value);
    setIsManualEndDate(true); // mark for recalculation
  }}
             /* onChange={(e) => {
                handleInputChange(e); // updates form.no_of_days
                setUpdateNoOfDays(e.target.value); // ⬅️ you must call this too
              }}*/
            />

          </Col>
          <Col>      <label>Location:</label><p></p>
            <Select
              options={locations.map(loc => ({ label: loc, value: loc }))}
              value={form.location ? { label: form.location, value: form.location } : null} // ✅ This is the fix
              onChange={(selected) => {
                setForm(prev => ({ ...prev, location: selected.value }));
                setlocat(selected.value);
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
          <Col> <label>Topics (.xlsx, .docx, .pdf, .txt):</label><p></p>
            <input type="file" accept=".xlsx,.docx,.pdf,.txt" onChange={handleFileChange} />

          </Col>
          <Col>
            <div >
              <label className="label5-ques" style={{ marginRight: '10px' }}>Start Date</label><p></p>
              <DatePicker
                selected={parseDateSafe(updateStartDate)}
                onChange={(date) => {
    setUpdateStartDate(date);
    setIsManualEndDate(true); // mark for recalculation
  }}
               // onChange={(date) => setUpdateStartDate(date)}
                highlightDates={highlightedDates}
                showTimeSelect
                timeFormat="hh:mm aa"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy, h:mm aa"
                timeCaption="Time"
                className="input-date-custom32"
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
                className="input-date-custom32"
                autoComplete="off"
              />


            </div>
          </Col>

        </Row><p></p>
<Row>
   <Col>
    <div>
      <label>QuestionType</label><p></p>
     <Select
  styles={customStyles}
  options={questionTypes.map(qt => ({ value: qt.id, label: qt.question_type }))}
  components={{ Option: CustomOption }}
  closeMenuOnSelect={false}
  isMulti
  value={selectedQuestionTypes.map(id => {
    const option = questionTypes.find(qt => qt.id === id);
    return option ? { value: option.id, label: option.question_type } : null;
  }).filter(Boolean)}
  onChange={options => setSelectedQuestionTypes(options ? options.map(o => o.value) : [])}
  placeholder="-- Select Question Type(s) --"
/>
    </div>
  </Col>
  <Col>
    <div>
      <label>Skill Type</label><p></p>
    <Select
  styles={customStyles}
  options={skillTypes.map(st => ({ value: st.id, label: st.skill_type }))}
  components={{ Option: CustomOption }}
  closeMenuOnSelect={false}
  isMulti
  value={skillTypes
    .filter(st => selectedSkillTypes.includes(st.id))   // match available skills
    .map(st => ({ value: st.id, label: st.skill_type }))} // convert to {value,label}
  onChange={options =>
    setSelectedSkillTypes(options ? options.map(o => o.value) : [])
  }
  placeholder="-- Select Skill Type(s) --"
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
</Row>
        <Row>

        

     
<Col md={9}>
<div className="topic-container shadow mb-4 bg-white rounded" style={{ border: '1px solid #ccc',marginTop:"10px",padding:"8px" }}>
 {/*} <div className="d-flex justify-content-between align-items-center mb-3">
    
    <button
      className="btn btn-sm btn-secondary"
      onClick={() => setShowTopicModal(false)} // Optional: You can remove this line if you don't want to close it
    >
      Close
    </button>
  </div>*/}

  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
    <select
      value={selectedSkill}
      onChange={(e) => setSelectedSkill(e.target.value)}
      className="form-control"

      style={{ flex: 1,fontSize:"14px" }}
    >
      <option value="">All Skills</option>
      {availableSkills.map((skill) => (
        <option key={skill} value={skill}>
          {skill.charAt(0).toUpperCase() + skill.slice(1)}
        </option>
      ))}
    </select>

    <input
      type="text"
      placeholder="Search topic..."
      className="form-control"
      style={{ flex: 1,fontSize:"14px"  }}
      value={topicSearchText}
      onChange={(e) => setTopicSearchText(e.target.value)}
    />
  </div>

  {/* Topic List */}
  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "10px",
      }}
    >
      {filteredTopics.map((topic, idx) => (
        <label
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#444",
            background: "#f7f7f7",
            padding: "6px 6px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <input
            type="checkbox"
            checked={selectedTopics.includes(topic)}
            onChange={() => {
              setSelectedTopics((prev) =>
                prev.includes(topic)
                  ? prev.filter((t) => t !== topic)
                  : [...prev, topic]
              );
            }}
          />
          {topic}
        </label>
      ))}
    </div>
  </div>
<div className="mt-4 d-flex justify-content-end gap-2">
    <Button variant="success" onClick={() => setShowAddTopics(true)}>Add Topics</Button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setSelectedTopics([])}
        >
          Cancel
        </button>
        <button
          type="button"
          className="button-ques-save"
          onClick={async () => {
            try {
              await updateTrainingTopicsAPI(id, selectedTopics);
              setForm((prevForm) => ({
                ...prevForm,
                topics: selectedTopics,
              }));
               alert("✅ Topics updated successfully.");
              await fetchTopics();
            } catch (error) {
              console.error("❌ Failed to update topics:", error);
              alert("Failed to update topics. Please try again.");
            }
          }}
        >
          Update
        </button>
      </div>
</div>

</Col>
  <Col md={3}>
            <div style={{ display: "flex", flexDirection: "column", width: "241px", marginTop: "10px" }}>

              <label className="label5-ques">Holidays </label>
             <DatePicker
  inline
  highlightDates={[
    {
      dates: [...apiHolidayDates, ...locationHolidays],
      className: "react-datepicker__day--holiday",
    },
    {
      dates: getCurrentMonthWeekends(),
      className: "react-datepicker__day--weekend",
    },
    {
      dates: trainingDates,
      className: "react-datepicker__day--training",
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
    const isHoliday = [...apiHolidayDates, ...locationHolidays].some(
      (d) => new Date(d).toDateString() === date.toDateString()
    );
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isHoliday) return 'react-datepicker__day--holiday';
    if (isWeekend) return 'react-datepicker__day--weekend';
    return undefined;
  }}
/>

            </div></Col>
        </Row><p></p>


        <br /><br />
        <div className='button-container-set'>
          <button className='button-ques-save' onClick={() => navigate(`/training/schedule/`)}>Back</button>
          <button className='button-ques-save' onClick={handleupdate}>Save</button>
          <button className='button-ques-save' onClick={() => navigate(`/edit-training/${id}`)}>Next</button>
        </div>
        <HolidayComponent location={locat} onHolidaysFetched={setGovtHolidays} />


      </form>
 <AddTopicsModal
        show={showAddTopics}
        onClose={() => setShowAddTopics(false)}
       
  onSave={(newTopics) => {
    setSelectedTopics((prev) => [...new Set([...prev, ...newTopics])]);
    setShowAddTopics(false);
  }}
  existingTopics={selectedTopics}

onTopicsAdded={fetchTopics}
        scheduleId={id}
      />
    </div>
  );
};

export default Updateschedule;
