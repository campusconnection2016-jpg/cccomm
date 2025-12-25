import React, { useEffect, useState, useContext, useRef } from "react";
import { Row, Col, Form, Button, Modal } from "react-bootstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import "../../api/loading.css";
import {
  addTestcandidateApiBatchAudio,
  getCollegeList_Concat_API,
  get_user_colleges_API,
  getcollege_Test_Api,
  getQuestionPaperApi,
  getrulesApi,
  gettesttypeApi,
  getSkilltypeApi,
  getqstntypeApi,
  get_department_info_Test_API_CC,
  get_Batches_API_CLG_ID,
  getTestsApi,
} from "../../api/endpoints";
import {
  TestTypeContext,
  TestTypeCategoriesContext,
  QuestionTypeContext,  
  SkillTypeContext,
} from "../test/context/testtypecontext";


import { useTestQuesContext } from "../../placementofficer/test/context/testquescontext";
import ErrorModal from "../auth/errormodal";
import QuestionPaperMCQTest from "../questions/questionpapermcqtest";
import QuestionPaperCodeTest from "../questions/questionpapercodetest";
import Back from "../../assets/images/backarrow.png";
import Next from "../../assets/images/nextarrow.png";

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#39444e",
    color: "#fff",
    borderColor: "#ffff",
    boxShadow: "none",
  }),
  singleValue: (provided) => ({ ...provided, color: "#fff" }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#39444e" : "#39444e",
    color: "#fff",
  }),
  menu: (provided) => ({ ...provided, backgroundColor: "#39444e" }),
  input: (provided) => ({ ...provided, color: "#fff" }),
};

const AudioTestAssign = ({ userRole, username,collegeName, institute }) => {

  console.log("aa gya h",userRole, username,collegeName, institute);
  const navigate = useNavigate();
  const [detectedQuestionTypeId, setDetectedQuestionTypeId] = useState(null);
const [detectedSkillTypeId, setDetectedSkillTypeId] = useState(null);

  const location = useLocation();
  const {
    test_type_id,
    question_paper_id,
    question_paper_name,
    test_type,
    topic,
    sub_topic,
  } = location.state || {};

  const { selectedTestType } = useContext(TestTypeContext);
  const { selectedTestTypeCategory } = useContext(TestTypeCategoriesContext);
  const { selectedQuestionType } = useContext(QuestionTypeContext);
  const { selectedSkillType } = useContext(SkillTypeContext);
  const { setQuestionPaperCon } = useTestQuesContext();

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(null);
  const [collegeList, setCollegeList] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [selectedBatchNo, setSelectedBatchNo] = useState([]);
  const [userColleges, setUserColleges] = useState([]);
  const [collegeIds, setCollegeIds] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [testName, setTestName] = useState("");
  const [durationType, setDurationType] = useState("QuestionTime");
  const [duration, setDuration] = useState(0);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(
    new Date(Date.now() + 48 * 60 * 60 * 1000)
  );
  const [selectedYear, setSelectedYear] = useState([]);
  const [needCandidateInfo, setNeedCandidateInfo] = useState(true);
  const [camera, setCamera] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [Cemail, setCemail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const years = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
  ];

  const handleCloseError = () => setShowError(false);

// ✅ Auto select college from dropdown & lock it
useEffect(() => {
  if (!collegeName || userColleges.length === 0) return;

  const matchedCollege = userColleges.find(
    (c) => c.label === collegeName
  );

  if (matchedCollege) {
    setSelectedColleges([matchedCollege]);
  }
}, [collegeName, userColleges]);

  
  // ✅ Fetch Colleges (with Training Admin filter)
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        if (userRole === "Training admin") {
          const userData = await get_user_colleges_API(username);
          const ids = (userData?.college_ids || []).map(Number);
          setCollegeIds(ids);

          const all = await getCollegeList_Concat_API();
          const filtered = all.filter((c) => ids.includes(Number(c.id)));
          const base = await getcollege_Test_Api();
          const codeMap = new Map(base.map((b) => [Number(b.id), b.college_code]));
          const merged = filtered.map((c) => ({
            value: Number(c.id),
            label: c.college_group_concat,
            code: codeMap.get(Number(c.id)) || "",
          }));
          setUserColleges(merged);
        } else {
          const [concatList, base] = await Promise.all([
            getCollegeList_Concat_API(),
            getcollege_Test_Api(),
          ]);
          const codeMap = new Map(base.map((b) => [Number(b.id), b.college_code]));
          const merged = concatList.map((c) => ({
            value: Number(c.id),
            label: c.college_group_concat,
            code: codeMap.get(Number(c.id)) || "",
          }));
          setUserColleges(merged);
        }
      } catch (err) {
        console.error("❌ Error fetching colleges:", err);
      }
    };
    fetchColleges();
  }, [userRole, username]);

  // ✅ Fetch Question Papers
 // ✅ Fetch Question Papers + Auto-detect question_type_id and skill_type_id
useEffect(() => {
  const fetchQuestions = async () => {
    try {
      const data = await getQuestionPaperApi(test_type, topic, sub_topic);

      console.log("🎯 API Response (Question Papers):", data);
      console.log("🧩 Topic → Question Type:", topic);
      console.log("🧠 Subtopic → Skill Type:", sub_topic);

      const mapped = data.map((q) => ({
        value: q.id,
        label: q.question_paper_name,
        duration_of_test: q.duration_of_test,
        question_type_id: q.question_type_id || null,
        skill_type_id: q.skill_type_id || null,
      }));

      setQuestions(mapped);

      const match =
        mapped.find((q) => q.value === question_paper_id) ||
        mapped.find((q) => q.label === question_paper_name);

      if (match) {
        setSelectedQuestions(match);
        setDuration(match.duration_of_test || 0);
        setDetectedQuestionTypeId(match.question_type_id || null);
        setDetectedSkillTypeId(match.skill_type_id || null);
        console.log("✅ Matched Paper:", match.label);
        console.log("➡️ Detected question_type_id:", match.question_type_id);
        console.log("➡️ Detected skill_type_id:", match.skill_type_id);
      } else if (mapped.length > 0) {
        const first = mapped[0];
        setDetectedQuestionTypeId(first.question_type_id || null);
        setDetectedSkillTypeId(first.skill_type_id || null);
        console.log("ℹ️ Defaulting to first paper:", first.label);
        console.log("➡️ question_type_id:", first.question_type_id);
        console.log("➡️ skill_type_id:", first.skill_type_id);
      } else {
        console.warn("⚠️ No question papers found for topic/subtopic combination.");
      }
    } catch (err) {
      console.error("❌ Error fetching question papers:", err);
    }
  };

  fetchQuestions();
}, [test_type, topic, sub_topic, question_paper_id, question_paper_name]);

  // ✅ Fetch Rules & Auto-match rule by test_type_id
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const [rulesData, testTypes] = await Promise.all([
          getrulesApi(),
          gettesttypeApi(),
        ]);
        setRules(
          rulesData.map((r) => ({ value: r.id, label: r.rule_name }))
        );
        const match = testTypes.find((t) => t.id === test_type_id);
        if (match) {
          const ruleMatch = rulesData.find(
            (r) => r.rule_name === match.test_type
          );
          if (ruleMatch)
            setSelectedRule({
              value: ruleMatch.id,
              label: ruleMatch.rule_name,
            });
        }
      } catch (err) {
        console.error("❌ Error fetching rules:", err);
      }
    };
    fetchRules();
  }, [test_type_id]);

  // ✅ Fetch Departments & Batches when college changes
  useEffect(() => {
    const collegeIds = selectedColleges.map((c) => c.value);
    if (collegeIds.length === 0) return;

    get_department_info_Test_API_CC(collegeIds)
      .then((data) =>
        setDepartments(
          data.map((d) => ({
            value: d.department_id__id,
            label: d.department_id__department,
          }))
        )
      )
      .catch((e) => console.error("Error fetching departments:", e));

    get_Batches_API_CLG_ID(collegeIds)
      .then((batches) =>
        setBatchNumbers(
          batches.map((b) => ({ label: b.batch_no, value: b.batch_no }))
        )
      )
      .catch((e) => console.error("Error fetching batches:", e));
  }, [selectedColleges]);

  // ✅ Generate Test Name Automatically
  useEffect(() => {
    const date = moment(startDateTime).format("DD-MM");
    const year = selectedYear.map((y) => y.value).join(",");
    const qType = selectedQuestionType?.substring(0, 3) || "";
    const sType = selectedSkillType?.substring(0, 3) || "";
    const qLabel = selectedQuestions?.label || "Paper";
    const codes = selectedColleges
      .map((c) => userColleges.find((u) => u.value === c.value)?.code)
      .filter(Boolean)
      .join(",");

    setTestName(`${codes}_${year}yr_${qType}_${sType}_${qLabel}_${date}`);
  }, [
    startDateTime,
    selectedYear,
    selectedColleges,
    selectedQuestions,
    selectedQuestionType,
    selectedSkillType,
    userColleges,
  ]);

  // ✅ Form Submit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  setIsSubmitting(true);

  const formData = new FormData(e.target);
  const test_name = formData.get("test_name");

  if (test_name.includes("/")) {
    setErrorMessage("Test name cannot contain '/'.");
    setShowError(true);
    setIsSubmitting(false);
    return;
  }

  const existing = await getTestsApi();
  if (
    existing.some(
      (t) => t.test_name.trim().toLowerCase() === test_name.trim().toLowerCase()
    )
  ) {
    setErrorMessage("Test name already exists!");
    setShowError(true);
    setIsSubmitting(false);
    return;
  }

  if (!startDateTime || !endDateTime) {
    setErrorMessage("Start and End Date are required.");
    setShowError(true);
    setIsSubmitting(false);
    return;
  }

  try {
    const tTypes = await gettesttypeApi();

    let finalQuestionTypeId = detectedQuestionTypeId;
    let finalSkillTypeId = detectedSkillTypeId;

    if (!finalQuestionTypeId) {
      const qTypes = await getqstntypeApi();
      const matchedQ = qTypes.find(
        (q) => q.question_type === topic // ✅ use topic for question type
      );
      finalQuestionTypeId = matchedQ?.id || null;
    }

    if (!finalSkillTypeId) {
      const sTypes = await getSkilltypeApi();
      const matchedS = sTypes.find(
        (s) => s.skill_type === sub_topic // ✅ use subtopic for skill type
      );
      finalSkillTypeId = matchedS?.id || null;
    }

    console.log("🧠 Final Type IDs Before Submit:");
    console.log("➡️ question_type_id:", finalQuestionTypeId);
    console.log("➡️ skill_type_id:", finalSkillTypeId);

    const pracOnlineTest = {
      college_id: selectedColleges.map((c) => c.value),
      department_id: selectedDepartments.map((d) => d.value),
      batch_no: selectedBatchNo.map((b) => b.value),
      year: selectedYear.map((y) => y.value),
      test_name,
      test_type_id: test_type_id,
      question_id: selectedQuestions?.value,
      question_type_id: finalQuestionTypeId,
      skill_type_id: finalSkillTypeId, // ✅ optional
      rules_id: selectedRule?.value,
      duration_type: durationType,
      duration: duration,
      need_candidate_info: needCandidateInfo,
      is_camera_on: camera,
      dtm_start: moment(startDateTime).format("YYYY-MM-DD HH:mm:ss"),
      dtm_end: moment(endDateTime).format("YYYY-MM-DD HH:mm:ss"),
      company_name: companyName,
      company_email: Cemail,
      created_by:
        typeof username === "object" ? username.username : username || "System",
    };

    console.log("📤 Submitting payload:", pracOnlineTest);

    await addTestcandidateApiBatchAudio(pracOnlineTest);
    setErrorMessage("✅ Test Assigned Successfully!");
    setShowError(true);
   navigate("/test/test-schedules/");
    setQuestionPaperCon(null);
  } catch (err) {
    console.error("❌ Error submitting test:", err);
    setErrorMessage("Error while assigning test.");
    setShowError(true);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="form-ques-compo">
      <div className="form-ques-testmcq">
        <form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <label className="label5-ques">Question Paper</label><p></p>
              <Select
                options={questions}
                value={selectedQuestions}
                onChange={(q) => {
                  setSelectedQuestions(q);
                  setDuration(q?.duration_of_test || 0);
                }}
                styles={customStyles}
                placeholder="Select Question Paper"
              />
            </Col>
            <Col>
              <label className="label5-ques">College</label><p></p>
             <Select
  isMulti
  options={userColleges}
  value={selectedColleges}
  onChange={setSelectedColleges}
  styles={customStyles}
  placeholder="Select College"
  isDisabled={!!collegeName}   // 🔒 non-editable when collegeName exists
/>

            </Col>
          </Row><p></p>

          <Row>
            <Col>
              <label className="label5-ques">Department</label><p></p>
              <Select
                isMulti
                options={departments}
                value={selectedDepartments}
                onChange={setSelectedDepartments}
                styles={customStyles}
              />
            </Col>
            <Col>
              <label className="label5-ques">Year</label><p></p>
              <Select
                isMulti
                options={years}
                value={selectedYear}
                onChange={setSelectedYear}
                styles={customStyles}
              />
            </Col>
          </Row>
<p></p>
          <Row>
            <Col>
              <label className="label5-ques">Start Date</label><p></p>
              <DatePicker
                selected={startDateTime}
                onChange={setStartDateTime}
                showTimeSelect
                dateFormat="dd-MM-yyyy, h:mm aa"
                className="input-date-custom"
              />
            </Col>
            <Col>
              <label className="label5-ques">End Date</label><p></p>
              <DatePicker
                selected={endDateTime}
                onChange={setEndDateTime}
                showTimeSelect
                dateFormat="dd-MM-yyyy, h:mm aa"
                className="input-date-custom"
              />
            </Col>
          </Row>
<p></p>
          <Row>
            <Col>
              <label className="label5-ques">Test Name</label><p></p>
              <input
                type="text"
                name="test_name"
                className="input-ques-test-name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                required
              />
            </Col>
            <Col>
              <label className="label5-ques">Rule</label><p></p>
              <Select
                options={rules}
                value={selectedRule}
                onChange={setSelectedRule}
                styles={customStyles}
              />
            </Col>
          </Row>
<p></p>
          <Row>
            <Col>
              <Form.Check
                type="checkbox"
                label="Need Candidate Info"
                checked={needCandidateInfo}
                onChange={(e) => setNeedCandidateInfo(e.target.checked)}
              />
            </Col>
            <Col>
              <Form.Check
                type="checkbox"
                label="Camera ON"
                checked={camera}
                onChange={(e) => setCamera(e.target.checked)}
              />
            </Col>
          </Row>
<p style={{height:"50px"}}></p>
         
           <Row>
                                             <Col>
         
                                                 <div className="button-container-lms">
                                                     <button
                                                         
         
                                                         className="button-ques-back btn btn-secondary back-button-lms"
                                                         style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128' }}
         
                                                     ><img src={Back} className='nextarrow' ></img>
                                                         <span className="button-text">Back</span>
                                                     </button>
                                                     <button type="submit" className='button-ques-save save-button-lms' disabled={isSubmitting} style={{ width: "100px" }}>
                                                         Save
                                                     </button>
                                                     <button  className="button-ques-back btn btn-secondary back-button-lms"
                                                         style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128', cursor: 'not-allowed' }}
                                                         disabled >
                                                         <span className="button-text">Next</span><img src={Next} className='nextarrow'></img>
         
                                                     </button>
                                                 </div>
                                             </Col>
                                         </Row>
        </form>
      </div>

      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default AudioTestAssign;
