import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { Col, Row, Form, Button, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Next from '../../assets/images/nextarrow.png'
import 'react-datepicker/dist/react-datepicker.css';
import { FaRegCalendarAlt } from 'react-icons/fa';
import {
  getCollegeList_Concat_API,
  get_user_colleges_API,
  get_department_info_Test_API_CC,
  get_Batches_API_CLG_ID,
  getrulesApi,
  getCollegeCodes,
  sendAssignTestData_API_superadmin,
  getTestsByTypeAndDifficulty_API
} from '../../api/endpoints';
import CustomOption from './customoption';


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

            width: '97%'
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

const fetchCollegeCode = async (collegeName) => {
  console.log('Fetching college code for:', collegeName);
  try {
    const res = await getCollegeCodes();
    const data = res.data;
    if (Array.isArray(data)) {
      const found = data.find(
        c => c.college && c.college.trim().toLowerCase() === collegeName.trim().toLowerCase()
      );
      return found ? found.college_code : '';
    }
    return '';
  } catch (error) {
    console.error('Error fetching college codes:', error);
    return '';
  }
};

const yearOptions = [
  { value: 'all', label: 'All' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' }
];

function formatDateTime(dt) {
  if (!dt) return null;
  const pad = n => String(n).padStart(2, '0');
  return (
    dt.getFullYear() +
    '-' +
    pad(dt.getMonth() + 1) +
    '-' +
    pad(dt.getDate()) +
    'T' +
    pad(dt.getHours()) +
    ':' +
    pad(dt.getMinutes()) +
    ':' +
    pad(dt.getSeconds())
  );
}

const CalendarInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div style={{ position: 'relative', width: '100%' }}>
    <input
      style={{
        width: '100%',
        background: '#3d474f',
        color: 'white',
        border: '1px solid #4a5660',
        borderRadius: '6px',
        padding: '12px 40px 12px 16px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
      }}
      onClick={onClick}
      ref={ref}
      value={value}
      readOnly
      placeholder={placeholder}
    />
    <FaRegCalendarAlt
      style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#a0a0a0',
        pointerEvents: 'none'
      }}
      size={18}
    />
  </div>
));

function replaceOrAppendDifficultyToken(baseName = '', newDiff) {
  if (!baseName) return newDiff || '';
  if (!newDiff) return baseName;

  const keywords = ["Easy", "Intermediate", "Difficulty", "Challenging"];
  const sepRegex = /[_\-\s\(\)\[\]\.]/;

  for (let k of keywords) {
    const regex = new RegExp(k, 'i');
    const match = baseName.match(regex);
    if (match) {
      const idx = match.index;
      const mlen = match[0].length;
      const before = idx > 0 ? baseName[idx - 1] : null;
      const after = baseName[idx + mlen] || null;

      const beforeOk = before === null || sepRegex.test(before);
      const afterOk = after === null || sepRegex.test(after);
      if (beforeOk && afterOk) {
        const replaced = baseName.slice(0, idx) + newDiff + baseName.slice(idx + mlen);
        return replaced.replace(/__+/g, '_').replace(/^_+|_+$/g, '');
      }
    }
  }

  let cleaned = baseName.trim();
  if (!cleaned.endsWith('_')) cleaned = `${cleaned}_${newDiff}`;
  else cleaned = `${cleaned}${newDiff}`;
  return cleaned.replace(/__+/g, '_').replace(/^_+|_+$/g, '');
}

const AddTestPage = ({ institute, collegeName, username, userRole }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location || {};

  const [selectedDifficulty, setSelectedDifficulty] = useState(state?.selectedDifficulty || "");
  const allDifficultyLevels = state?.difficultyLevels || [];

  const [collegeCodesMap, setCollegeCodesMap] = useState({});

  const [testFormData, setTestFormData] = useState({
    test_name: state?.testName || '',
    test_type: state?.test_type || '',
    skill_type: state?.sub_topic || '',
    question_type: state?.topic || '',
    folder_name: state?.folder_name || '',
    question_ids: state?.question_ids || [],
    is_testcase: state?.is_testcase || false,
    time: state?.time || '',
  });

  const [extraFields, setExtraFields] = useState({
    no_of_questions: '',
    duration: '',
    college: [],
    branch: [],
    department: [],
    year: [],
    rule: null,
    need_candidate_info: true,
    is_camera_on: false,
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [collegeList, setCollegeList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [ruleList, setRuleList] = useState([]);
  const [isTestcase, setIsTestcase] = useState(false);
  const [userColleges, setUserColleges] = useState([]);

  const prevDifficultyRef = useRef(selectedDifficulty || "");
  const prevDurationRef = useRef(extraFields.duration || "");
  const prevTestNameRef = useRef(testFormData.test_name || "");
  const prevNoOfQuestionsRef = useRef(extraFields.no_of_questions || "");

  const handleTestcaseChange = (e) => {
    setIsTestcase(e.target.checked);
  };

  const handleDifficultyChange = (e) => {
    const newDifficulty = e.target.value;

    prevDifficultyRef.current = selectedDifficulty || "";
    prevTestNameRef.current = testFormData.test_name || "";

    setSelectedDifficulty(newDifficulty);

    const currentName = testFormData.test_name || "";
    const updatedName = replaceOrAppendDifficultyToken(currentName, newDifficulty);
    setTestFormData((prev) => ({ ...prev, test_name: updatedName }));
    console.log(`🔄 Attempting difficulty change to: ${newDifficulty}, test name -> ${updatedName}`);

    const payload = {
      topic: testFormData.question_type,
      test_type: testFormData.test_type,
      sub_topic: testFormData.skill_type,
      folder_name: testFormData.folder_name,
      is_testcase: isTestcase,
      time: extraFields.duration || prevDurationRef.current,
      student_id: username || null,
      difficulty_level: newDifficulty,
    };

    getTestsByTypeAndDifficulty_API(payload)
      .then((data) => {
        if (data && data.difficulty_level_distribution) {
          let allIds = [];
          Object.values(data.difficulty_level_distribution).forEach((group) => {
            group.test_groups.forEach((tg) => {
              allIds = [...allIds, ...tg.question_ids];
            });
          });

          const questionsPerTest = data.questions_per_test || extraFields.no_of_questions || prevNoOfQuestionsRef.current;
          const limitedIds = allIds.slice(0, questionsPerTest);

          console.log("🔥 API Response (Difficulty):", data);
          console.log("🎯 New Limited Question IDs:", limitedIds);

          setTestFormData((prev) => {
            const updated = { ...prev, question_ids: limitedIds };
            console.log("✅ Final question_ids in state (after difficulty change):", updated.question_ids);
            return updated;
          });
          setExtraFields((prev) => ({ ...prev, no_of_questions: questionsPerTest }));

          prevDifficultyRef.current = newDifficulty;
          prevNoOfQuestionsRef.current = questionsPerTest;
          prevTestNameRef.current = updatedName;
        } else {
          alert("Not enough questions to generate tests for given criteria");
          setSelectedDifficulty(prevDifficultyRef.current || "");
          setTestFormData((prev) => ({ ...prev, test_name: prevTestNameRef.current || "" }));
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching questions by difficulty:", err);
        if (err.response?.data?.error) {
          alert(err.response.data.error);
        } else {
          alert("Failed to fetch questions. Please try again.");
        }
        setSelectedDifficulty(prevDifficultyRef.current || "");
        setTestFormData((prev) => ({ ...prev, test_name: prevTestNameRef.current || "" }));
      });
  };

  const getDefaultQuestions = (testType, duration) => {
    if (testType === "MCQ Test") {
      switch (duration) {
        case "15": return "10";
        case "30": return "25";
        case "45": return "40";
        case "60": return "55";
        default: return "";
      }
    } else if (testType === "Coding Test") {
      switch (duration) {
        case "15": return "1";
        case "30": return "2";
        case "45": return "3";
        case "60": return "4";
        default: return "";
      }
    }
    return "";
  };

  useEffect(() => {
    if (!username) return;

    if (userRole === "Training admin") {
      get_user_colleges_API(username)
        .then((userData) => {
          const collegeIds = userData.college_ids;
          return getCollegeList_Concat_API().then((collegeList) => {
            const matchedColleges = collegeList
              .filter((college) => collegeIds.includes(String(college.id)))
              .map((college) => ({
                value: college.id,
                label: college.college_group_concat,
              }));
            setUserColleges(matchedColleges);
          });
        })
        .catch((error) => {
          console.error("❌ Error fetching user colleges:", error);
        });
    } else {
      getCollegeList_Concat_API()
        .then((collegeList) => {
          const allColleges = collegeList.map((college) => ({
            value: college.id,
            label: college.college_group_concat,
          }));
          setUserColleges(allColleges);
        })
        .catch((error) => {
          console.error("❌ Error fetching all colleges:", error);
        });
    }
  }, [username, userRole]);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 22, 0, 0, 0);
    setStartDate(start);
    setEndDate(end);
  }, []);

  useEffect(() => {
    if (startDate) {
      const newEnd = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
      if (!endDate || endDate <= startDate) {
        setEndDate(newEnd);
      }
    }
  }, [startDate]);

  useEffect(() => {
    getCollegeList_Concat_API()
      .then(data => {
        setCollegeList(data.map(c => ({
          value: c.id,
          label: c.college_group_concat
        })));
      })
      .catch(() => setCollegeList([]));
  }, []);

  useEffect(() => {
    if (userRole === "Placement Officer" && institute && collegeName) {
      setExtraFields(fields => ({
        ...fields,
        college: [{
          value: institute,
          label: collegeName
        }]
      }));
    }
  }, [userRole, institute, collegeName]);

  useEffect(() => {
    if (!extraFields.college.length) {
      setBranchList([]);
      setDepartmentList([]);
      setExtraFields(fields => ({ ...fields, branch: [], department: [] }));
      return;
    }
    const collegeIds = extraFields.college.map(clg => clg.value);
    get_Batches_API_CLG_ID(collegeIds)
      .then(batches => {
        const branches = batches.map(b => ({ value: b.batch_no, label: b.batch_no }));
        setBranchList(branches);
        if (!branches.length) {
          setExtraFields(fields => ({ ...fields, branch: [] }));
        }
      })
      .catch(() => setBranchList([]));

    get_department_info_Test_API_CC(collegeIds)
      .then(depts => {
        const departmentOptions = depts.map(d => ({
          value: d.department_id__id,
          label: d.department_id__department
        }));
        setDepartmentList([{ value: 'all', label: 'All' }, ...departmentOptions]);
      })
      .catch(() => setDepartmentList([]));
  }, [extraFields.college]);

  useEffect(() => {
    getrulesApi()
      .then(data => {
        const rules = data.map(r => ({ value: r.id, label: r.rule_name }));
        setRuleList(rules);

        if (testFormData.test_type) {
          const matchedRule = rules.find(rule =>
            rule.label.trim().toLowerCase() === testFormData.test_type.trim().toLowerCase()
          );
          setExtraFields(fields => ({ ...fields, rule: matchedRule || null }));
        }
      })
      .catch(() => setRuleList([]));
  }, [testFormData.test_type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExtraChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name !== 'duration') {
      setExtraFields(prev => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "duration") {
      const newDuration = value;
      const defaultQues = getDefaultQuestions(testFormData.test_type, newDuration);

      prevDurationRef.current = extraFields.duration || "";
      prevNoOfQuestionsRef.current = extraFields.no_of_questions || "";

      setExtraFields(prev => ({ ...prev, duration: newDuration, no_of_questions: defaultQues }));

      const payload = {
        topic: testFormData.question_type,
        test_type: testFormData.test_type,
        sub_topic: testFormData.skill_type,
        folder_name: testFormData.folder_name,
        is_testcase: isTestcase,
        time: newDuration,
        student_id: username || null,
        difficulty_level: selectedDifficulty,
      };

      getTestsByTypeAndDifficulty_API(payload)
        .then((data) => {
          if (data && data.difficulty_level_distribution) {
            let allIds = [];
            Object.values(data.difficulty_level_distribution).forEach((group) => {
              group.test_groups.forEach((tg) => {
                allIds = [...allIds, ...tg.question_ids];
              });
            });

            const questionsPerTest = data.questions_per_test || defaultQues;
            const limitedIds = allIds.slice(0, questionsPerTest);

            setTestFormData((prev) => {
              const updated = { ...prev, question_ids: limitedIds };
              console.log("✅ Final question_ids in state (after duration change):", updated.question_ids);
              return updated;
            });
            setExtraFields((prev) => ({ ...prev, no_of_questions: questionsPerTest }));

            prevDurationRef.current = newDuration;
            prevNoOfQuestionsRef.current = questionsPerTest;
          } else {
            console.warn("⚠️ Not enough questions for given criteria (duration)");
            alert("Not enough questions to generate tests for given criteria");
            setExtraFields((prev) => ({
              ...prev,
              duration: prevDurationRef.current || "",
              no_of_questions: prevNoOfQuestionsRef.current || ""
            }));
          }
        })
        .catch((err) => {
          console.error("❌ Error fetching updated questions:", err);
          if (err.response?.data?.error) {
            alert(err.response.data.error);
          } else {
            alert("Failed to fetch questions. Please try again.");
          }
          setExtraFields((prev) => ({
            ...prev,
            duration: prevDurationRef.current || "",
            no_of_questions: prevNoOfQuestionsRef.current || ""
          }));
        });

      return;
    }

    setExtraFields(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

 const handleSelectChange = async (selected, actionMeta) => {
  if (actionMeta.name === "college" && selected && selected.length > 0) {
    // Update the selected colleges
    setExtraFields(prev => ({ ...prev, [actionMeta.name]: selected || [] }));

    // Only fetch and use college code if exactly one college is selected
    let collegeCode = '';
    if (selected.length === 1) {
      const collegeLabel = selected[0].label || selected[0].value;
      try {
        collegeCode = await fetchCollegeCode(collegeLabel);
        setCollegeCodesMap((prev) => ({ ...prev, [collegeLabel]: collegeCode }));
      } catch {
        collegeCode = '';
      }
    }

    // Update test name if testName and startDate are available
    if ((state?.testName || testFormData.test_name) && startDate) {
      const day = String(startDate.getDate()).padStart(2, '0');
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const datePart = `${day}${month}`;

      const baseName = state?.testName || testFormData.test_name || '';
      const nameWithDifficulty = replaceOrAppendDifficultyToken(baseName, selectedDifficulty);

      // Add college code only when one college selected
      let newTestName =
        selected.length === 1
          ? `${collegeCode}_${nameWithDifficulty}_${datePart}`
          : `${nameWithDifficulty}_${datePart}`;

      // Clean up extra underscores
      newTestName = newTestName.replace(/__+/g, '_').replace(/^_+|_+$/g, '');

      // Set the new test name
      setTestFormData(prev => ({ ...prev, test_name: newTestName }));
    }
  } else {
    // For other selects (branch, department, etc.)
    setExtraFields(prev => ({ ...prev, [actionMeta.name]: selected || [] }));
  }
};

  const handleDepartmentsChange = (selectedOptions) => {
    if (!selectedOptions) {
      setSelectedDepartments([]);
      return;
    }
    if (selectedOptions.some(option => option.value === 'all')) {
      setSelectedDepartments([{ value: 'all', label: 'All' }]);
    } else {
      setSelectedDepartments(selectedOptions);
    }
  };

  const handleYearChange = (selectedOptions) => {
    if (!selectedOptions) {
      setSelectedYear([]);
      return;
    }
    const selectedValues = selectedOptions.map(option => option.value);
    if (selectedValues.includes('all')) {
      setSelectedYear(yearOptions.filter(year => year.value !== 'all'));
    } else {
      setSelectedYear(selectedOptions);
    }
  };

  const handleRuleChange = (selected) => {
    setExtraFields(prev => ({ ...prev, rule: selected }));
  };

  const handleStartChange = async (date) => {
    setStartDate(date);
    if (!endDate || endDate <= date) {
      setEndDate(new Date(date.getTime() + 4 * 60 * 60 * 1000));
    }
    if (extraFields.college.length > 0 && (state?.testName || testFormData.test_name)) {
      const collegeLabel = extraFields.college[0]?.label || extraFields.college[0]?.value || '';
      let collegeCode = collegeCodesMap[collegeLabel];
      if (!collegeCode) {
        collegeCode = await fetchCollegeCode(collegeLabel);
        setCollegeCodesMap((prev) => ({ ...prev, [collegeLabel]: collegeCode }));
      }
      const baseName = state?.testName || testFormData.test_name || '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const datePart = `${day}${month}`;

      const nameWithDifficulty = replaceOrAppendDifficultyToken(baseName, selectedDifficulty);
      let newTestName = `${collegeCode}_${nameWithDifficulty}_${datePart}`;
      newTestName = newTestName.replace(/__+/g, '_').replace(/^_+|_+$/g, '');

      setTestFormData(prev => ({ ...prev, test_name: newTestName }));
    }
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  useEffect(() => {
    if (state?.time) {
      const durationInt = parseInt(state.time.replace(/\D/g, ''), 10);
      setExtraFields(prev => ({ ...prev, duration: isNaN(durationInt) ? '' : durationInt.toString() }));
    }
    if (Array.isArray(state?.question_ids)) {
      setExtraFields(prev => ({ ...prev, no_of_questions: state.question_ids.length.toString() }));
    }
    if (state?.college && state.college.length > 0) {
      const collegeFromNav = state.college[0];
      const collegeName = collegeFromNav?.label || collegeFromNav?.value || '';
      const updateCodeAndName = async () => {
        let code = await fetchCollegeCode(collegeName);
        setCollegeCodesMap((prev) => ({ ...prev, [collegeName]: code }));
        if (collegeName && state.testName && startDate) {
          const day = String(startDate.getDate()).padStart(2, '0');
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const datePart = `${day}${month}`;
          const baseWithDifficulty = replaceOrAppendDifficultyToken(state.testName, selectedDifficulty);
          const newTestName = `${code}_${baseWithDifficulty}_${datePart}`.replace(/__+/g, '_').replace(/^_+|_+$/g, '');
          setTestFormData(prev => ({ ...prev, test_name: newTestName }));
          setExtraFields(prev => ({ ...prev, college: state.college }));
        }
      };
      updateCodeAndName();
    }
  }, [state, startDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const college_id = extraFields.college.map(c => c.value);
      const filteredDepartments = selectedDepartments.filter(department => department.value !== 'all');
      const department_id = filteredDepartments?.map(department => department.value) || [];
      const batch_no = extraFields.branch.map(b => b.value);
      const year = selectedYear?.map(y => y.value) || [];
      const rules_id = extraFields.rule ? extraFields.rule.value : null;

      const payload = {
        test_name: testFormData.test_name,
        test_type: state?.test_type || '',
        test_type_categories: state?.test_type_categories || '',
        skill_type: state?.sub_topic || '',
        question_type: state?.topic || '',
        folder_name: state?.folder_name || '',
        created_by: 'System',
        question_ids: testFormData.question_ids || [],
        is_testcase: state?.is_testcase || false,
        college_id,
        batch_no,
        department_id,
        dtm_start: formatDateTime(startDate),
        dtm_end: formatDateTime(endDate),
        is_camera_on: extraFields.is_camera_on,
        duration_type: "QuestionTime",
        year,
        rules_id,
        need_candidate_info: extraFields.need_candidate_info,
        duration: extraFields.duration,
        no_of_question: extraFields.no_of_questions,
      };
      console.log("📌 test_type_categories:", payload.test_type_categories);
      console.log("🚀 Final question_ids before sending to API:", payload.question_ids);
      await sendAssignTestData_API_superadmin(payload);
      alert('Test data sent successfully!');
      navigate('/test/test-schedules/');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to send test data.');
      }
      setIsSubmitting(false);
    }
  };

  const labelStyle = { 
    color: '#fff', 
    fontSize: '14px', 
    fontWeight: '500', 
    marginBottom: '8px', 
    display: 'block' 
  };
  
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#3d474f',
    border: '1px solid #4a5660',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#3d474f',
    border: '1px solid #4a5660',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box'
  };

  const fieldStyle = { marginBottom: '24px' };

  return (
  <div
    style={{
      marginTop: '1px',
      width: '100%',
      overflowX: 'hidden',
      background: '#2a3238',
      minHeight: '100vh',
      padding: '20px',
    }}
  >
    <div
      style={{
        background: '#323b44',
        padding: window.innerWidth <= 400 ? '15px' : '30px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: window.innerWidth <= 400 ? '100%' : '1200px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          color: '#fff',
          fontSize: window.innerWidth <= 400 ? '20px' : '24px',
          fontWeight: '600',
          marginBottom: '30px',
          marginTop: '0',
          textAlign: window.innerWidth <= 400 ? 'center' : 'left',
        }}
      >

        Add Test
      </h2>

      {/* Duration */}
      <Row md={12}>
        <Col>
        <div>
          <label className='label5-ques'>Duration (minutes):</label><p></p>
          <select
            name="duration"
            value={extraFields.duration}
            onChange={handleExtraChange}
              className='input-ques-test-name'
                                              
            
          >
            <option value="">Select Duration</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="60">60</option>
          </select>
        </div>
</Col>
<Col>
        {/* No of Questions */}
        <div >
          <label className='label5-ques'>No of Questions:</label><p></p>
          <input
            type="text"
              className='input-ques-test-name'
                                              
            name="no_of_questions"
            value={extraFields.no_of_questions}
            onChange={handleExtraChange}
           
            placeholder="Number of Questions"
            readOnly
          />
        </div></Col>
        {/* Difficulty Level */}
          {allDifficultyLevels.length > 0 && (
            <Col>
            <div >
             
              <label className='label5-ques'>Difficulty Level:</label><p></p>
              <select
                className='input-ques-test-name'
                                              
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
                
              >
                <option value="">Select Difficulty</option>
                {allDifficultyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
             
            </div>
             </Col>
          )}
          </Row>
       <p></p>
          <Row>
             <Col> 
            
         
            <div>
              <label className='label5-ques'>
                College Name:<span style={{ color: '#e74c3c' }}>*</span>
              </label><p></p>
            <Select
  isMulti
  name="college"
  options={userColleges}
  value={extraFields.college}
  onChange={userRole === "Placement Officer" ? () => {} : handleSelectChange}
  styles={customStyles}
  placeholder="Select College(s)"
  components={{ Option: CustomOption }}
  isDisabled={userRole === "Placement Officer"} 
/>


            </div>
         
</Col>
          <Col>  <div >
            <label className='label5-ques'>Branch:</label><p></p>
            <Select
              isMulti
              name="branch"
              options={branchList}
              value={extraFields.branch}
              onChange={handleSelectChange}
              styles={customStyles}
              placeholder="Select Branch"
            />
          </div>
</Col>
         
           
     
            <Col>{/* Department */}
          <div >
            <label>Department:</label><p></p>
            <Select
              isMulti
              name="department"
              options={departmentList}
              value={selectedDepartments}
              onChange={handleDepartmentsChange}
              styles={customStyles}
              placeholder="Select Department(s)"
            />
          </div>
</Col>
            
          </Row><p></p>
          

          
          {/* Year */}
         
 <Row><Col> <div >
            <label className='label5-ques'>Year:</label><p></p>
            <Select
              isMulti
              name="year"
              options={yearOptions}
              value={selectedYear}
              onChange={handleYearChange}
              styles={customStyles}
              placeholder="Select Year(s)"
            />
          </div></Col>
            <Col> <div >
              <label className='label5-ques'>Start Date & Time:</label><p></p>
              <DatePicker
                selected={startDate}
                onChange={handleStartChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy, h:mm aa"
                customInput={<CalendarInput />}
                placeholderText="Select Start Date"
              />
            </div>
          

          {/* End Date */}
          
            </Col>
            <Col>
            <div >
            <label className='label5-ques'>End Date & Time:</label><p></p>
            <DatePicker
              selected={endDate}
              onChange={handleEndChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd-MM-yyyy, h:mm aa"
              customInput={<CalendarInput />}
              placeholderText="Select End Date"
              minDate={startDate}
            />
          </div></Col>
           
          </Row><p></p>
          <Row>
             <Col>
            <div >
          <label className='label5-ques'>
            Test Name:<span style={{ color: '#e74c3c' }}>*</span>
          </label><p></p>
          <input
            className='input-ques-test-name'
                                              
            type="text"
            name="test_name"
            value={testFormData.test_name}
            onChange={handleInputChange}  
            placeholder="Test Name"
          />
        </div></Col>
            <Col>
             <div >
            <label className='label5-ques'>Rule:</label><p></p>
            <Select
              name="rule"
              options={ruleList}
              value={extraFields.rule}
              onChange={handleRuleChange}
              styles={customStyles}
              placeholder="Select Rule"
            />
          </div></Col>
           <Col>
           <div >
        <label
          
        > Need Candidate Info
        </label><p></p>
          <input
            type="checkbox"
            name="need_candidate_info"
            checked={extraFields.need_candidate_info}
            onChange={handleExtraChange}
            
          />
         
      </div></Col>

          </Row><p></p>
          {/* Start Date - Show on desktop only */}
         
        </div>

     
     
 
      

      {testFormData.test_type === 'Coding Test' && (
        <div >
          <label
            style={{
              ...labelStyle,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={isTestcase}
              onChange={handleTestcaseChange}
              style={{
                marginRight: '8px',
                cursor: 'pointer',
                width: '16px',
                height: '16px',
              }}
            />
            Include Test Cases
          </label><p></p>
        </div>
        )}
<p></p>
   {/* Buttons */}
<div
 className="button-container-lms" 
>
  <button
    onClick={() => navigate('/test/test-schedules/')}
    type="button"
    className="button-ques-back btn btn-secondary back-button-lms"
       style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128' }}
                                        
  >
    Back
  </button>

  <button
    onClick={handleSubmit}
    disabled={isSubmitting}
   className='button-ques-save save-button-lms'
  >
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
   <button className="button-ques-back btn btn-secondary back-button-lms"
                                                  style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128', cursor: 'not-allowed' }}
                                                  disabled >
                                                  <span className="button-text">Next</span><img src={Next} className='nextarrow'></img>
  
                                              </button>
</div>
    </div>      
   
  );
};

export default AddTestPage;