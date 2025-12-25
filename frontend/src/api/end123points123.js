import { create } from "@mui/material/styles/createTransitions";
import axios from "axios";
import { format, formatDate } from "date-fns";
import moment from 'moment';

const API_URL = "http://localhost:8000";

//const API_URL = "https://ccportal.co.in";

export function getLoginApi() {
  return axios
    .get(`${API_URL}/api/get/login/`)
    .then((response) => response.data);
}
export function addLoginApi(log) {
  return axios
    .post(`${API_URL}/api/add/login/`, {
      id: null,
      email_id: log.email_id, 
      college_id: log.college_id,
      user_name: log.user_name,
      password: log.password,
      role: log.role,
      dtm_created: log.dtm_created,
      dtm_trainer: log.dtm_trainer,
      remarks:log.remarks,
      mobile_number:log.mobile_number
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export async function updateLoginApi(id, log) {
  return axios
    .put(`${API_URL}/api/update/login/${id}/`, {
      email_id: log.email_id,
      user_name: log.user_name,
      college_id: log.college_id,
      password: log.password,
      role: log.role,
      remarks:log.remarks,
      mobile_number:log.mobile_number
    })
    .then((response) => response.data);
}

export async function updateLoginPasswordApi(userName, log) {
  try {
    const response = await axios.put(
      `${API_URL}/api/update/login/Password/${userName}/`,
      {
        user_name: log.user_name,
        password: log.password,
        email_id:log.email_id,
        mobile_number:log.mobile_number
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating login password:", error);
    throw error; // Propagate the error for higher-level handling
  }
}

export function deleteloginApi(id) {
  return axios
    .patch(`${API_URL}/api/delete/login/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
//--------------------------------Test-------------------------------
export function addTestsApi(test) {
  return axios
    .post(`${API_URL}/api/tests/create/`, {
      id: null,
      test_name: test.test_name,
      test_type_id: test.test_type_id,
      question_type_id: test.question_type_id,

      skill_type_id: test.skill_type_id,
      // course_id: test.course_id,

      //need_candidate_info: test.need_candidate_info,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function getTestsApi() {
  return axios
    .get(`${API_URL}/api/tests/get/`)
    .then((response) => response.data);
}

export async function updateTestsApi(id, test) {
  return axios
    .put(`${API_URL}/api/tests/${id}/`, {
      test_name: test.test_name,
      test_type_id: test.test_type_id,
      question_type_id: test.question_type_id,

      skill_type_id: test.skill_type_id,
      // course_id: test.course_id,

      //need_candidate_info: test.need_candidate_info,
    })
    .then((response) => response.data);
}
export function deleteTestsApi(id) {
  return axios
    .patch(`${API_URL}/api/tests/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
//---------------------------candidate------------------------


export function getcandidatesApi() {
  return axios
    .get(`${API_URL}/api/candidates/`)
    .then((response) => response.data);
}


export async function updatecandidatesApi(id, trainees) {
  const url = `${API_URL}/api/candidates/${id}/`;
  console.log("PUT Request URL: ", url);
  console.log("Payload: ", trainees);

  return axios
    .put(url, {
      college_id: trainees.college_id,
      students_name: trainees.students_name,
      registration_number: trainees.registration_number,
      gender: trainees.gender,
      text: trainees.text,
      email_id: trainees.email_id,
      mobile_number: trainees.mobile_number,
      department_id: trainees.department_id,
      year: trainees.year,
      cgpa: trainees.cgpa,
      skill_id: trainees.skill_id,
      marks_10th: trainees.marks_10th,
      marks_12th: trainees.marks_12th,
      // marks_semester_wise: trainees.marks_semester_wise,
      history_of_arrears: trainees.history_of_arrears,
      standing_arrears: trainees.standing_arrears,
      number_of_offers: trainees.number_of_offers,
      it_of_offers: trainees.it_of_offers,
      core_of_offers: trainees.core_of_offers,

      // user_name: trainees.user_name,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error response data: ", error.response.data);
      throw error;
    });
}

export function deletecandidatesApi(ids) {
  return axios
    .patch(`${API_URL}/api/candidates/delete/`, { ids }) // Send as JSON body
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error deleting candidates:", error);
      throw error;
    });
}

//------------------------------skill------------------------------
export function addSkillApi(skill) {
  return axios
    .post(`${API_URL}/api/skills/create/`, {
      id: null,
      skill_name: skill.skill_name,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error to add Trainees Details:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function getSkillApi() {
  return axios.get(`${API_URL}/api/skills/`).then((response) => response.data);
}

export async function updateSkillApi(id, skill) {
  return axios
    .put(`${API_URL}/api/skills/${id}/`, {
      skill_name: skill.skill_name,
    })
    .then((response) => response.data);
}

export function deleteSkillApi(id) {
  return axios
    .patch(`${API_URL}/api/skills/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
//---------------------------------skill-type---------------------------------
export function addSkilltypeApi(skilltype) {
  return axios
    .post(`${API_URL}/api/skilltypes/create/`, {
      id: null,
      skill_type: skilltype.skill_type,
      question_type_id: skilltype.question_type_id
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error to add Skill type Details:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export function getSkilltypeApi() {
  return axios
    .get(`${API_URL}/api/skilltypes/`)
    .then((response) => response.data);
}

export async function updateSkilltypeApi(id, skilltype) {
  return axios
    .put(`${API_URL}/api/skilltypes/${id}/`, {
      skill_type: skilltype.skill_type,
      question_type_id: skilltype.question_type_id
    })
    .then((response) => response.data);
}


export function deleteSkilltypeApi(id) {
  return axios
    .patch(`${API_URL}/api/skilltypes/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//---------------------------testtype-----------------------------
export function addtesttypeApi(testtype) {
  return axios
    .post(`${API_URL}/api/testtypes/create/`, {
      id: null,
      test_type: testtype.test_type,
      test_type_categories: testtype.test_type_categories,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error to add test trainee Details:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function gettesttypeApi() {
  return axios
    .get(`${API_URL}/api/testtypes/`)
    .then((response) => response.data);
}

export async function updatetesttypeApi(id, testtype) {
  return axios
    .put(`${API_URL}/api/testtypes/${id}/`, {
      test_type: testtype.test_type,
      test_type_categories: testtype.test_type_categories,
    })
    .then((response) => response.data);
}

export function deletetesttypeApi(id) {
  return axios
    .patch(`${API_URL}/api/testtypes/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
//----------------------------question_type-----------------------------
export function addqstntypeApi(qstntype) {
  return axios
    .post(`${API_URL}/api/questiontypes/create/`, {
      id: null,
      question_type: qstntype.question_type,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error to add test trainee Details:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function getqstntypeApi() {
  return axios
    .get(`${API_URL}/api/questiontypes/`)
    .then((response) => response.data);
}

export async function updateqstntypeApi(id, qstntype) {
  return axios
    .put(`${API_URL}/api/questiontypes/${id}/`, {
      question_type: qstntype.question_type,
    })
    .then((response) => response.data);
}

export function deleteqstntypeApi(id) {
  return axios
    .patch(`${API_URL}/api/questiontypes/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
//----------------------------------college-------------------------



export function getcollegeApi() {
  return axios
    .get(`${API_URL}/api/colleges/`)
    .then((response) => response.data);
}



export function deletecollegApi(id) {
  return axios
    .patch(`${API_URL}/api/colleges/delete/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
// --------------------------------------------department-----------------------------
export function adddepartmentApi(department) {
  return axios
    .post(`${API_URL}/api/departments/create/`, {
      id: null,
      department: department.department,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error to add test trainee Details:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function getdepartmentApi() {
  return axios
    .get(`${API_URL}/api/departments/`)
    .then((response) => response.data);
}

export async function updatedepartmentApi(id, department) {
  return axios
    .put(`${API_URL}/api/departments/update/${id}/`, {
      department: department.department,
    })
    .then((response) => response.data);
}

export function deletedepartmentApi(id) {
  return axios
    .patch(`${API_URL}/api/departments/delete/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//_________________________________content___________________________________
export function addcontentApi(content) {
  console.log("Content", content);
  return axios
    .post(`${API_URL}/api/content/create/`, {
      id: null,
      //content_name: content.content_name,
      content_url: content.content_url,
      actual_content: content.actual_content,
      topic: content.topic,
      skill_type_id: content.skill_type_id,
      question_type_id: content.question_type_id,
      worksheet_link: content.worksheet_link,
      // size: content.size,
      //guidelines: content.guidelines,
      // feedback: content.feedback
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error to add test trainee Details:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}


export function getcontentApi(page = 1, searchTerm = "") {
  return axios.get(`${API_URL}/api/content/`, {
    params: { 
      page: page, 
      search: searchTerm 
    }, // Pass `searchTerm` as a query parameter
  }).then((response) => response.data);
}

export async function updatecontentApi(id, content) {
  return axios
    .put(`${API_URL}/api/content/${id}/`, {
      // content_name: content.content_name,
      
      content_url: content.content_url,
      actual_content: content.actual_content,
      worksheet_link:content.worksheet_link,
      topic: content.topic,
      skill_type_id: content.skill_type_id,
      question_type_id: content.question_type_id,
      
    })
    .then((response) => response.data);
}

export function deletecontentApi(id) {
  return axios
    .patch(`${API_URL}/api/content/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
//__________________________Test_candidate_map___________________________


export function getTestcandidateApi(username) {
  return axios
    .get(`${API_URL}/api/testcandidate/`, { params: { username } }) // Pass username as a query param
    .then((response) => response.data);
}

export function deleteTestcadidateApi(test_name, college_id) {
  return axios
    .patch(`${API_URL}/api/testcandidate/${encodeURIComponent(test_name)}/delete/`, { college_id })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//----------------------Course Schedule-------------------//

export function getCourseScheduleApi(page = 1, search = "", topic, college, training_date,source) {
  return axios
    .get(`${API_URL}/api/get/course_schedule/`, {
      params: { 
          page, 
          search, 
          topic,
          college,
          training_date,
          source
      }
  })
    .then((response) => response.data);
}
export function addCourseScheduleApi(log) {
  return axios
    .post(`${API_URL}/api/add/course_schedule/`, {
      id: null,
      student_id: log.student_id,
      course_id: log.course_id,
      trainer_id: log.trainer_id,
      dtm_start: log.dtm_start,
      dtm_end: log.dtm_end,
      course_mode: log.course_mode,
      status: log.status,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export async function updateCourseScheduleApi(id, log) {
  return axios
    .put(`${API_URL}/api/update/course_schedule/${id}/`, {
      student_id: log.student_id,
      course_id: log.course_id,
      trainer_id: log.trainer_id,
      dtm_start: log.dtm_start,
      dtm_end: log.dtm_end,
      course_mode: log.course_mode,
      status: log.status,
    })
    .then((response) => response.data);
}

export function deleteCourseScheduleApi(id) {
  return axios
    .patch(`${API_URL}/api/delete/course_schedule/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//----------------------Attendance Master-------------------//

export function getAttendanceMasterApi() {
  return axios
    .get(`${API_URL}/api/get/attendance_master/`)
    .then((response) => response.data);
}
export function addAttendanceMasterApi(log) {
  return axios
    .post(`${API_URL}/api/add/attendance_master/`, {
      id: null,
      student_id: log.student_id,
      course_id: log.course_id,
      test_id: log.test_id,
      dtm_attendance: log.dtm_attendance,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export async function updateAttendanceMasterApi(id, log) {
  return axios
    .put(`${API_URL}/api/update/attendance_master/${id}/`, {
      student_id: log.student_id,
      course_id: log.course_id,
      test_id: log.test_id,
      dtm_attendance: log.dtm_attendance,
    })
    .then((response) => response.data);
}

export function deleteAttendanceMasterApi(id) {
  return axios
    .patch(`${API_URL}/api/delete/attendance_master/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}


//----------------------------------test-candidate-answer--------------

export function getTestAnswerMapApi(username, test_name) {
  return axios
    .get(`${API_URL}/api/tests-candidates-answers/data/`, {
      params: { username: username, testName: test_name },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching test answers:", error);
      throw error;
    });
}

export function addTestAnswerMapApi(log) {
  return axios
    .post(`${API_URL}/api/tests-candidates-answers/create/`, {
      id: null,
      test_id: log.test_id,
      question_id: log.question_id,
      student_id: log.student_id,
      answer: log.answer,
      result: log.result,
      dtm_start: log.dtm_start,
      dtm_end: log.dtm_end,
      submission_compile_code: log.submission_compile_code,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}



export function addTestAnswerMapApi_Code(log) {
  const { test_name, question_id, student_id, dtm_start, dtm_end, ans, code } =
    log;

  console.log("Endpoint entering.....");
  console.log("log: ", log);

  return axios
    .post(`${API_URL}/api/tests-answer/`, {
      test_name: test_name,
      question_id: question_id,
      student_id: student_id,
      dtm_start: dtm_start,
      dtm_end: dtm_end,
      ans: ans,
      code: code,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding answer:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function addTestAnswerMapApi_Code_Submit(log) {
  const { test_name, question_id, student_id, dtm_start, dtm_end, ans, code } =
    log;

  console.log("Endpoint entering.....");
  console.log("log: ", log);

  return axios
    .post(`${API_URL}/api/tests-answer/submit/`, {
      test_name: test_name,
      question_id: question_id,
      student_id: student_id,
      dtm_start: dtm_start,
      dtm_end: dtm_end,
      ans: ans,
      code: code,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding answer:", error);
      //throw error; // Rethrow the error to propagate it further if needed
    });
}

export async function updateTestAnswerApi(id, log) {
  return axios
    .put(`${API_URL}/api/tests-candidates-answers/${id}/`, {
      test_name: log.test_id,
      question_id: log.question_id,
      student_id: log.student_id,
      answer: log.answer,
      result: log.result,
      dtm_start: log.dtm_start,
      dtm_end: log.dtm_end,
    })
    .then((response) => response.data);
}

export function deleteTestAnswerApi(id) {
  return axios
    .patch(`${API_URL}/api/tests-candidates-answers/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//----------------------------------Course Content Feedback--------------

export function getCourseContentFeedbackApi() {
  return axios
    .get(`${API_URL}/api/get/course_contenet_feedback/`)
    .then((response) => response.data);
}

export async function addCourseContentFeedbackApi(log) {
  try {
    const response = await axios.post(
      `${API_URL}/api/add/course_contenet_feedback/`,
      {
        id: null,
        remarks: log.remarks,
        student_id: log.student_id,
        topic_id: log.topic_id,
        dtm_session: log.dtm_session,
        trainer_id: log.trainer_id,
        feedback: log.feedback,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding feedback:",
      error.response ? error.response.data : error
    );
    throw error; // Rethrow the error to be caught in the handleSubmit function
  }
}

export async function updateCourseContentFeedbackApi(id, log) {
  return axios
    .put(`${API_URL}/api/update/course_contenet_feedback/${id}/`, {
      // course_id: log.course_id,

      student_id: log.student_id,
      topic_id: log.topic_id,
      dtm_session: log.dtm_session,
      trainer_id: log.trainer_id,
      feedback: log.feedback,
      department_id: log.department_id,
    })
    .then((response) => response.data);
}

export function deleteCourseContentFeedbackApi(id) {
  return axios
    .patch(`${API_URL}/api/delete/course_contenet_feedback/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//---------------------------------Import Api's----------------------------------------//
export const TestsExportAPI = async (formData) => {
  const response = await axios.post(
    `${API_URL}/api/test/import_excel/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

//export function TestsExportAPI(formData) {
//return axios.post(`${API_URL}/api/test/import_excel/`, formData, {
//headers: {
// 'Content-Type': 'multipart/form-data',
// },
// });
//}

export function CandidateExportAPI(formData) {
  return axios.post(`${API_URL}/api/Candidate/import_excel/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function QuestionsExportAPI(formData) {
  return axios.post(`${API_URL}/api/question/import_excel/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

//----------------------Trainer_master-------------------------------------------

export function getTrainerApi() {
  return axios
    .get(`${API_URL}/api/trainers/all/`)
    .then((response) => response.data);
}

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export async function addTrainerApi(trainerData) {
  const base64File = await convertToBase64(trainerData.resume); //convert to bytestream
  return await axios
    .post(`${API_URL}/api/trainers/create/`, {
      trainer_name: trainerData.trainer_name,
      state: trainerData.state,
      city: trainerData.city,
      qualification: trainerData.qualification,
      experience: trainerData.experience,
      ready_to_relocate: trainerData.ready_to_relocate,
      mobile_no: trainerData.mobile_no,
      email_id: trainerData.email_id,
      skill_id: trainerData.skill_id,
      languages_known: trainerData.languages_known,
      bank_name: trainerData.bank_name,
      ifsc_code: trainerData.ifsc_code,
      branch_name: trainerData.branch_name,
      account_no: trainerData.account_no,
      resume: base64File,
      user_name: trainerData.user_name.username,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export async function updateTrainerApi(id, log) {
  return axios
    .put(`${API_URL}/api/trainers/${id}/`, {
      trainer_name: log.trainer_name,
      address: log.address,
      city: log.city,
      country: log.country,
      qualification: log.qualification,
      is_active: log.is_active,
      preferred_city: log.preferred_city,
      mobile_no: log.mobile_no,
      email_id: log.email_id,
      skill_id: log.skill_id,
      languages_known: log.languages_known,
      ifsc_code: log.ifsc_code,
      branch_name: log.branch_name,
      account_no: log.account_no,
    })
    .then((response) => response.data);
}

export function deleteTrainerApi(id) {
  return axios
    .patch(`${API_URL}/api/trainers/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//------------------------------rules-----------------------------
export function addrulesApi(rules) {
  return axios
    .post(`${API_URL}/api/rules/create/`, {
      id: null,
      rule_name: rules.rule_name,
      instruction: rules.instruction,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error to add Trainees Details:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function getrulesApi() {
  return axios.get(`${API_URL}/api/rules/`).then((response) => response.data);
}

export async function updaterulesApi(id, rules) {
  return axios
    .put(`${API_URL}/api/rules/${id}/`, {
      rule_name: rules.rule_name,
      instruction: rules.instruction,
    })
    .then((response) => response.data);
}

export function deleterulesApi(id) {
  return axios
    .patch(`${API_URL}/api/rules/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

export function updateTestcadidateApi_is_active(id) {
  return axios
    .patch(`${API_URL}/api/testcandidate/${id}/updateIsActive/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      //throw error;
    });
}

export function updateTestcadidateApi_updatedDatabse(student_id_value) {
  return axios
    .patch(`${API_URL}/api/testcandidate/${student_id_value}/updatedDatabase/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

export function updateTestcadidateApi_submitted(id) {
  return axios
    .patch(`${API_URL}/api/testcandidate/${id}/submitted/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      //throw error;
    });
}

export function updateTestcadidateApi_teststarted(id) {
  return axios
    .patch(`${API_URL}/api/testcandidate/${id}/teststarted/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      //throw error;
    });
}

export async function updateTotalScoreTestcandidateApi(id, test) {
  return axios
    .put(`${API_URL}/api/update/totalScore/${id}/`, {
      total_score: test.total_score,
    })
    .then((response) => response.data);
}

export async function updateAvgMarkTestcandidateApi(id, test) {
  return axios
    .put(`${API_URL}/api/update/avgMark/${id}/`, {
      avg_mark: test.avg_mark,
    })
    .then((response) => response.data);
}

//------------------------Non database testasign-------------------------------//
export function addNonDatabaseTest_API(test) {
  return axios
    .post(`${API_URL}/api/test-candidates-map/non-db/create/`, {
      id: null,
      test_name: test.test_name,
      question_id: test.question_id,
      created_by:test.created_by,
      dtm_start: test.dtm_start,
      dtm_end: test.dtm_end,
      college_id: test.college_id,
      college_name: test.college_name,
      college_group_id: test.college_group_id,
      batch_no: test.batch_no,
      dtm_upload: test.dtm_upload,

      is_camera_on: test.is_camera_on,
      duration: test.duration,
      duration_type: test.duration_type,
      rules_id: test.rules_id,
      need_candidate_info: test.need_candidate_info,

      test_type_id: test.test_type_id,
      question_type_id: test.question_type_id,
      skill_type_id: test.skill_type_id,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}



export function addSelectedTestAssign_API(test) {
  return axios
    .post(`${API_URL}/api/test-assign/selected/`, {
      stu_id: test.stu_id,
      id: null,
      test_name: test.test_name,
      question_id: test.question_id,
      dtm_start: test.dtm_start,
      dtm_end: test.dtm_end,
      dtm_start1: test.dtm_start1,
      dtm_end1: test.dtm_end1,
      is_camera_on: test.is_camera_on,
      duration: test.duration,
      duration_type: test.duration_type,
      rules_id: test.rules_id,
      dtm_created: test.dtm_created,
      need_candidate_info: test.need_candidate_info,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function getBatchNumber() {
  return axios
    .get(`${API_URL}/api/batch_list/`)
    .then((response) => response.data);
}
export function getquestionname() {
  return axios
    .get(`${API_URL}/api/question_name_list/`)
    .then((response) => response.data);
}

export function gettopic() {
  return axios
    .get(`${API_URL}/api/topic_list/`)
    .then((response) => response.data);
}

export function getUniqueTestType() {
  return axios
    .get(`${API_URL}/api/unique_test_type/`)
    .then((response) => response.data);
}

export function getMCQTestType() {
  return axios
    .get(`${API_URL}/api/MCQ_test_type/`)
    .then((response) => response.data);
}

export function getCodingTestType() {
  return axios
    .get(`${API_URL}/api/Coding_test_type/`)
    .then((response) => response.data);
}

export function getUniqueQuestionType() {
  return axios
    .get(`${API_URL}/api/unique_question_type/`)
    .then((response) => response.data);
}

export function getSidebarMenu() {
  return axios
    .get(`${API_URL}/api/sidebar/main_menu/`)
    .then((response) => response.data);
}

export function QuestionsExportCodeAPI(formData) {
  return axios.post(`${API_URL}/api/question/import_excel/code/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function updatecandidatestextApi(id, trainees) {
  return axios
    .put(`${API_URL}/api/candidates/text/update/${id}/`, {
      password: trainees.password,
      text:trainees.text
    })
    .then((response) => response.data);
}

export function addQuestionpaperApi(test) {
  return axios
    .post(`${API_URL}/api/create-question-paper/`, {
      id: null,
      question_paper_name: test.question_paper_name,
      duration_of_test: test.duration_of_test,
      upload_type: test.upload_type,
      no_of_questions: test.no_of_questions,
      test_type: test.test_type,
      topic: test.topic,
      sub_topic: test.sub_topic,
      dtm_crated: test.dtm_created,
      folder_name: test.folder_name,
      is_testcase:test.is_testcase
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error.response.data);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export function getQuestionPaperApi(selectedTestTypeCategoryPass, topic, sub_topic) {
  return axios
    .get(`${API_URL}/api/get-question-paper/`, {
      params: { 
        selectedTestTypeCategoryPass,
        topic,
        sub_topic
      }
    })
    .then((response) => response.data);
}

export function deleteQuestionpaperApi(id) {
  return axios
    .patch(`${API_URL}/api/delete-question-paper/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//--------------------------Last added question paper name-------------------------//

export function getLastQuestionPaperApi() {
  return axios
    .get(`${API_URL}/api/get_last_question_paper/`)
    .then((response) => response.data);
}

//-------------Questions master with image-------------------//

// Function to fetch CSRF token from cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie("csrftoken");

export function addQuestionApi_IO_CSRF(test) {
  console.log("entering endpoint....");
  console.log("endpoint image data: ", test);

  const formData = new FormData();
  formData.append("id", null);
  formData.append("question_name_id", test.question_name_id);
  formData.append("question_text", test.question_text);
  if (test.question_image_data) {
    formData.append("question_image_data", test.question_image_data);
  }
  if (test.option_a_image_data) {
    formData.append("option_a_image_data", test.option_a_image_data);
  }
  if (test.option_b_image_data) {
    formData.append("option_b_image_data", test.option_b_image_data);
  }
  if (test.option_c_image_data) {
    formData.append("option_c_image_data", test.option_c_image_data);
  }
  if (test.option_d_image_data) {
    formData.append("option_d_image_data", test.option_d_image_data);
  }
  if (test.option_e_image_data) {
    formData.append("option_e_image_data", test.option_d_image_data);
  }
  formData.append("option_a", test.option_a);
  formData.append("option_b", test.option_b);
  formData.append("option_c", test.option_c);
  formData.append("option_d", test.option_d);
  formData.append("option_e", test.option_e);
  formData.append("answer", test.answer);
  formData.append("mark", test.mark);
  formData.append("explain_answer", test.explain_answer);
   formData.append("difficulty_level", test.difficulty_level);
  formData.append("mark_method", test.mark_method);
  formData.append("sections", test.sections);

  return axios
    .post(`${API_URL}/api/questions_io/create/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("There was an error creating the question!", error);
    });
}


export async function updateQuestionApi_IO(id, test) {
  return axios
    .put(`${API_URL}/api/questions_io/${id}/`, {
      question_name_id: test.question_name_id,
      question_text: test.question_text,
      question_image_data: test.question_image_data,
      option_a_image_data: test.option_a_image_data,
      option_b_image_data: test.option_b_image_data,
      option_c_image_data: test.option_c_image_data,
      option_d_image_data: test.option_d_image_data,
      option_a: test.option_a,
      option_b: test.option_b,
      option_c: test.option_c,
      option_d: test.option_d,
      answer: test.answer,
      negative_mark: test.negative_mark,
      mark: test.mark,
      explain_answer: test.explain_answer,
      difficulty_level:test.difficulty_level
    })
    .then((response) => response.data);
}

export function deleteQuestionApi_IO(id) {
  return axios
    .patch(`${API_URL}/api/questions_io/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//-------------Questions Code master with image-------------------//

export function addQuestionCodeApi(test) {
  return axios
    .post(`${API_URL}/api/questions_Code/create/`, {
      id: null,
      question_name_id: test.question_name_id,
      question_text: test.question_text,
      question_image_data: test.question_image_data,

      answer: test.answer,
      negative_mark: test.negative_mark,
      mark: test.mark,
      explain_answer: test.explain_answer,
      input_format: test.input_format,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function getQuestionCodeApi() {
  return axios
    .get(`${API_URL}/api/questions_Code/`)
    .then((response) => response.data);
}

export async function updateQuestionCodeApi(id, test) {
  return axios
    .put(`${API_URL}/api/questions_Code/${id}/update/`, {
      question_name_id: test.question_name_id,
      question_text: test.question_text,
      question_image_data: test.question_image_data,

      answer: test.answer,
      negative_mark: test.negative_mark,
      mark: test.mark,
      explain_answer: test.explain_answer,
      input_format: test.input_format,
    })
    .then((response) => response.data);
}

//---------------------getting Questions all where qp id-----------------------//

export function getQuestionsApi_QP_ID(id) {
  return axios
    .get(`${API_URL}/api/questions_all/${id}/`)
    .then((response) => response.data);
}

export function getTestUpdateID_API(test_name) {
  return axios
    .get(`${API_URL}/api/test-update/`, { params: { test_name: test_name } })
    .then((response) => response.data);
}

export function CandidateuserExportAPI(formData) {
  return axios.post(`${API_URL}/api/Candidate/user/import_excel/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function addQuestionApi_code(test) {
  return axios
    .post(`${API_URL}/api/questions_io/create/code/`, {
      id: null,
      question_name_id: test.question_name_id,
      question_text: test.question_text,
      question_image_data: test.question_image_data,

      answer: test.answer,
      mark: test.mark,
      explain_answer: test.explain_answer,
      input_format: test.input_format,
      test_case1:test.test_case1,
      test_case2:test.test_case2,
      test_case3:test.test_case3,
       difficulty_level:test.difficulty_level
      
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export async function updateQuestionApi_IO_code(id, test) {
  console.log("test", test);
  return axios
    .put(`${API_URL}/api/questions_io/${id}/code/`, {
      question_text: test.question_text,
      question_image_data: test.question_image_data,
      option_a_image_data: test.option_a_image_data,
      option_b_image_data: test.option_b_image_data,
      option_c_image_data: test.option_c_image_data,
      option_d_image_data: test.option_d_image_data,
      option_a: test.option_a,
      option_b: test.option_b,
      option_c: test.option_c,
      option_d: test.option_d,
      answer: test.answer,
      input_format: test.input_format,
      explain_answer: test.explain_answer,
      mark: test.mark,
      test_case1:test.test_case1,
      test_case2:test.test_case2,
      test_case3:test.test_case3,
       difficulty_level:test.difficulty_level


    })
    .then((response) => response.data);
}

export async function updateNeedInfoApi(id, test) {
  return axios
    .put(`${API_URL}/api/update/need-info/${id}/`, {
      need_candidate_info: test.need_candidate_info,
      college_id: test.college_id,
      department_id: test.department_id,
      year: test.year,
    })
    .then((response) => response.data);
}

export async function updateClgLogin(id, test) {
  return axios
    .put(`${API_URL}/api/update/clg_login/${id}/`, {
      college_id: test.college_id,
    })
    .then((response) => response.data);
}

export function getCandidateLogin() {
  return axios
    .get(`${API_URL}/api/get_candidate_login/`)
    .then((response) => response.data);
}

export function get_test_name_group_API(page = 1, search = "") {
  <div></div>;
  return axios
    .get(`${API_URL}/api/test_group/test-schedules/`, {
      params: { 
        page: page, 
        search: search 
      }, // Pass `searchTerm` as a query parameter
    })
    .then((response) => response.data);
}


export async function updateTestcandidateApi(test) {
  try {
    console.log("test data: ", test);
    const response = await axios.put(
      `${API_URL}/api/testcandidate/update/`,
      {
        testName: test.testName,
        test_name: test.test_name,
        dtm_start: test.dtm_start,
        dtm_end: test.dtm_end,
        question_id: test.question_id,
        duration: test.duration,
        duration_type: test.duration_type,
        rules_id: test.rules_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating test candidate:", error);
    //  throw error;
  }
}
export function getQuestionApi_IO() {
  return axios
    .get(`${API_URL}/api/questions_io/`)
    .then((response) => response.data);
}


export function getTestcandidateReportsApi() {
  return axios
    .get(`${API_URL}/api/test_reports/`)
    .then((response) => response.data);
}

//----------------------company company-------------------//

export function getcompanyApi() {
  return axios.get(`${API_URL}/api/company/`).then((response) => response.data);
}
export function addcompanyApi(log) {
  return axios
    .post(`${API_URL}/api/company/create/`, {
      id: null,

      company_name: log.company_name,
      company_profile: log.company_profile,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export async function updatecompanyApi(id, log) {
  return axios
    .put(`${API_URL}/api/company/${id}/`, {
      company_name: log.company_name,
      company_profile: log.company_profile,
    })
    .then((response) => response.data);
}

export function deleteCompanyApi(id) {
  return axios
    .patch(`${API_URL}/api/company/delete/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
//______________________________job_master______________________________

export function getjobApi() {
  return axios.get(`${API_URL}/api/job/`).then((response) => response.data);
}
export function addjobApi(log) {
  return axios
    .post(`${API_URL}/api/job/create/New/`, {
      id: null,
      job_type: log.job_type,
      company_name: log.company_name,
      company_profile: log.company_profile,
      no_of_offers: log.no_of_offers,
      post_name: log.post_name,
      intern_fulltime: log.intern_fulltime,
      on_off_campus: log.on_off_campus,
      college_id: log.college_id,
      packages: log.packages,
      department_id: log.department_id,
      skill_id: log.skill_id,
      marks_10th: log.marks_10th,
      marks_12th: log.marks_12th,
      cgpa: log.cgpa,
      year: log.year,
      interview_date: log.interview_date,
      gender: log.gender,
      history_of_arrears: log.history_of_arrears,
      standing_arrears: log.standing_arrears,
      location: log.location,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      throw error; // Rethrow the error to propagate it further if needed
    });
}

export async function updatejobApi(id, log) {
  console.log("Payload being sent:", log); // Debugging payload
  return axios
    .put(`${API_URL}/api/job/update/${id}/`, {
      company_name: log.company_name,
      company_profile: log.company_profile,
      intern_fulltime: log.intern_fulltime,
      on_off_campus: log.on_off_campus,
      post_name:log.post_name,
      no_of_offers:log.no_of_offers,
      job_type: log.job_type,
      department_id: log.department_id,
      skill_id: log.skill_id,
      marks_10th: log.marks_10th,
      marks_12th: log.marks_12th,
      cgpa: log.cgpa,
      year: log.year,
      interview_date: log.interview_date,
      gender: log.gender,
      history_of_arrears: log.history_of_arrears,
      standing_of_arrears: log.standing_of_arrears,
      location: log.location,
    })
    .then((response) => response.data);
}


export function deletejobApi(id) {
  return axios
    .patch(`${API_URL}/api/job/delete/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//________________________________________Training_report_____________________________________//

export function getTrainingReportApi() {
  return axios
    .get(`${API_URL}/api/get-training-report/`)
    .then((response) => response.data);
}

//_________________________Trainer Feedback_________________________

export function getTrainingfeedbackApi() {
  return axios
    .get(`${API_URL}/api/trainer-feedback/get/`)
    .then((response) => response.data);
}

//--------------------------------Compiler-------------------------//

export function addTestAnswerMapApi_Code_Com(log) {
  const {
    test_name,
    question_id,
    student_id,
    dtm_start,
    dtm_end,
    code,
    p_type,
    inputs,
  } = log;

  console.log("Endpoint entering.....");
  console.log("log: ", log);

  return axios
    .post(`${API_URL}/api/tests-answer-com/`, {
      test_name: test_name,
      question_id: question_id,
      student_id: student_id,
      dtm_start: dtm_start,
      dtm_end: dtm_end,
      code: code,
      p_type: p_type,
      inputs: inputs,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding answer:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function addTestAnswerMapApi_Code_Submit_Com(log) {
  const {
    test_name,
    question_id,
    student_id,
    dtm_start,
    dtm_end,
    code,
    p_type,
    inputs,
    output,
    explain_answer,
    mark,
    answer,
    skill_type,
    test_case_results,
    is_test_case,
  } = log;

  console.log("Endpoint entering.....");
  console.log("log: ", log);

  return axios
    .post(`${API_URL}/api/tests-answer-com/submit/`, {
      test_name: test_name,
      question_id: question_id,
      student_id: student_id,
      dtm_start: dtm_start,
      dtm_end: dtm_end,
      code: code,
      p_type: p_type,
      inputs: inputs,
      output: output,
      explain_answer: explain_answer,
      mark: mark,
      answer: answer,
      skill_type: skill_type,
      test_case_results: test_case_results,
      is_test_case: is_test_case,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding answer:", error);
      //throw error; // Rethrow the error to propagate it further if needed
    });
}

export function addTestAnswerMapApi_Code_Submit_Com_prrac(log) {
  const {
    test_name,
    question_id,
    student_id,
    dtm_start,
    dtm_end,
    code,
    p_type,
    inputs,
    output,
    explain_answer,
    mark,
    answer,
    skill_type,
    test_case_results,
    is_test_case,
  } = log;

  console.log("Endpoint entering.....");
  console.log("log: ", log);

  return axios
    .post(`${API_URL}/api/tests-answer-com/submit-practice/`, {
      test_name: test_name,
      question_id: question_id,
      student_id: student_id,
      dtm_start: dtm_start,
      dtm_end: dtm_end,
      code: code,
      p_type: p_type,
      inputs: inputs,
      output: output,
      explain_answer: explain_answer,
      mark: mark,
      answer: answer,
      skill_type: skill_type,
      test_case_results: test_case_results,
      is_test_case: is_test_case,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding answer:", error);
      //throw error; // Rethrow the error to propagate it further if needed
    });
}


export function getLastCompilerOutput(student_id) {
  return axios
    .get(`${API_URL}/api/get-last-compiler-output/${student_id}/`)
    .then((response) => response.data);
}
//--------------------Training admin Dashboard Data ---------------//

//  Total Test Count

export function getTotalTestCount(college_id) {
  return axios
    .get(`${API_URL}/api/distinct-test-name-count/${college_id}/`)
    .then((response) => response.data);
}

// Total company count

export function getTotalCompanyCount() {
  return axios
    .get(`${API_URL}/api/count-company-names/`)
    .then((response) => response.data);
}

export function getDistinctTestNameCount(collegeId) {
  return axios
    .get(`${API_URL}/api/distinct-test-name-count/${collegeId}/`)
    .then((response) => response.data);
}

export function getAvgScoreByDepartment(collegeId, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd"); // Format the date to 'YYYY-MM-DD'
  return axios
    .get(
      `${API_URL}/api/avg-score-by-department/${collegeId}/${formattedDate}/`
    )
    .then((response) => response.data);
}

export function getAvgScoreByDepartmentCoding(collegeId, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd"); // Format the date to 'YYYY-MM-DD'
  return axios
    .get(
      `${API_URL}/api/avg-score-by-department-coding/${collegeId}/${formattedDate}/`
    )
    .then((response) => response.data);
}

export function getMaxScoreByDepartment(collegeId) {
  return axios
    .get(`${API_URL}/api/max-score-by-department/${collegeId}/`)
    .then((response) => response.data);
}

export function getMaxScoreByDepartmentCoding(collegeId) {
  return axios
    .get(`${API_URL}/api/max-score-by-department-coding/${collegeId}/`)
    .then((response) => response.data);
}

export function getDistinctTestNameCountToday() {
  return axios
    .get(`${API_URL}/api/distinct-test-name-count-today/`)
    .then((response) => response.data);
}

export function getAvgTotalPresent() {
  return axios
    .get(`${API_URL}/api/avg-total-present/`)
    .then((response) => response.data);
}

export function getAvgTotalAbsent() {
  return axios
    .get(`${API_URL}/api/avg-total-absent/`)
    .then((response) => response.data);
}

export function upcommingInterviewApi(collegeId, departmentId) {
  return axios
    .get(`${API_URL}/api/interview-schedule/${collegeId}/${departmentId}/`)
    .then((response) => response.data);
}

export function interviewStatusCountApi(collegeId, companyId) {
  return axios
    .get(`${API_URL}/api/interview-status-count/${collegeId}/${companyId}/`)
    .then((response) => response.data);
}

export function interviewResultStudntApi(collegeId) {
  return axios
    .get(`${API_URL}/api/interview-result-stu/${collegeId}/`)
    .then((response) => response.data);
}

export function interviewResultStudntEmailAddressApi(collegeId) {
  return axios
    .get(`${API_URL}/api/interview-result-stu-email/${collegeId}/`)
    .then((response) => response.data);
}

export function totalNoOfOffersApi(collegeId) {
  return axios
    .get(`${API_URL}/api/total-no-of-offers/${collegeId}/`)
    .then((response) => response.data);
}

export function getStudentsRequestApi() {
  return axios
    .get(`${API_URL}/api/pending-requests-count/`)
    .then((response) => response.data);
}

//-------------------------------students dashboard------------------------------//

export function getEventsClgDept(collegeId, departmentId) {
  return axios
    .get(`${API_URL}/api/events/${collegeId}/${departmentId}/`)
    .then((response) => response.data);
}

export function studentCourseProgressApi(student_id) {
  return axios
    .get(`${API_URL}/api/course-progress/${student_id}/`)
    .then((response) => response.data);
}

export function StudentReportDashApi(student_id) {
  return axios
    .get(`${API_URL}/api/tests-by-student/${student_id}/`)
    .then((response) => response.data);
}

export function MCQTestPerformanceApi(student_id) {
  return axios
    .get(`${API_URL}/api/avg-total-score-by-month/${student_id}/`)
    .then((response) => response.data);
}

//_______________________________________tEST__________________________________________________//
export function addTestcandidateApiBatch(test) {
  return axios.post(`${API_URL}/api/test-candidates-map/create/`, {
    id: null,
    test_name: test.test_name,
    question_id: test.question_id,
    created_by:test.created_by,
    question_ids:test.question_ids,
    college_id: test.college_id,
    batch_no: test.batch_no,
    department_id: test.department_id,
    dtm_start: test.dtm_start,
    dtm_end: test.dtm_end,
   
    is_camera_on: test.is_camera_on,
    duration: test.duration,
    duration_type: test.duration_type,
    year: test.year,
    rules_id: test.rules_id,
    need_candidate_info: test.need_candidate_info,
    test_type_id: test.test_type_id,
    question_type_id: test.question_type_id,
    skill_type_id: test.skill_type_id,
    company_name: test.company_name,
      company_email:test.company_email,

  })
    .then(response => response.data)
    .catch(error => {

      // Handle error
      console.error('Error adding Test:', error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}




//-------update lms id-------------------//

export function getLMSIDApi(id) {
  return axios
    .get(`${API_URL}/api/update/lms/${id}/`)
    .then((response) => response.data);
}

export function getLMS_Topic_IDApi(id) {
  return axios
    .get(`${API_URL}/api/topic/lms/${id}/`)
    .then((response) => response.data);
}

export function getTestTypeCategory_testNameApi(test_name) {
  return axios
    .get(`${API_URL}/api/get-test-type-category/${test_name}/`)
    .then((response) => response.data);
}

//-------------------Need Candidate info--students---------------------//

export function getNeedInfoStuApi(username) {
  return axios
    .get(`${API_URL}/api/api/test-candidates/${username}/need-info/`)
    .then((response) => response.data);
}

export function InsertFirstOutput_API(student_id) {
  return axios
    .post(`${API_URL}/api/insert_empty_output/${student_id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

//-----------------Students Dasboard New------------------------------------//

//-----Total Test Taken

export function getTotalTestTaken_API(student_id) {
  return axios
    .get(`${API_URL}/api/active-tests-count/${student_id}/`)
    .then((response) => response.data);
}

//------Total no.of offers

export function getTotalOffers_API(student_id) {
  return axios
    .get(`${API_URL}/api/number-of-offers/${student_id}/`)
    .then((response) => response.data);
}

//-------Request Count

export function getRequestCount_API(student_id) {
  return axios
    .get(`${API_URL}/api/student-requests/count/${student_id}/`)
    .then((response) => response.data);
}

//-------Aptitude Avg Score

export function getAptitudeAvgScore_API(student_id) {
  return axios
    .get(`${API_URL}/api/monthly-avg-total-score/${student_id}/apditute/`)
    .then((response) => response.data);
}

//-------Softskills Avg Score

export function getSoftskill_AvgScore_API(student_id) {
  return axios
    .get(`${API_URL}/api/monthly-avg-total-score/${student_id}/softskill/`)
    .then((response) => response.data);
}

//-------Technical Avg Score

export function getTechnical_AvgScore_API(student_id) {
  return axios
    .get(`${API_URL}/api/monthly-avg-total-score/${student_id}/technical/`)
    .then((response) => response.data);
}

//-------Coding Avg Score

export function getCoding_AvgScore_API(student_id) {
  return axios
    .get(`${API_URL}/api/monthly-avg-total-score/${student_id}/coding/`)
    .then((response) => response.data);
}

export function getOffer_College_id_API(college_id) {
  return axios
    .get(`${API_URL}/api/candidates/all/${college_id}/`)
    .then((response) => response.data);
}

export function getCollege_id_candidateall_API(college_id) {
  return axios
    .get(`${API_URL}/api/candidates/all/${college_id}/`)
    .then((response) => response.data);
}

//------Total no.of offers-----college_id

export function getTotalOffers_college_id_API(college_id) {
  return axios
    .get(`${API_URL}/api/number-of-offers/${college_id}/college_id/`)
    .then((response) => response.data);
}

//-------Request Count

export function getRequestCount_college_id_API(college_id) {
  return axios
    .get(`${API_URL}/api/student-requests/count/${college_id}/college_id/`)
    .then((response) => response.data);
}

//-------Students plan
export function getTestcandidate_MCQ_Api(username) {
  return axios
    .get(`${API_URL}/api/testcandidate/mcq/${username}/`)
    .then((response) => response.data);
}

export function getTestcandidate_CODING_Api(username) {
  return axios
    .get(`${API_URL}/api/testcandidate/coding/${username}/`)
    .then((response) => response.data);
}

//-------PLACEMENT------------------//

export function getReports_College_API(collegeID) {
  return axios
    .get(`${API_URL}/api/tests-reports/${collegeID}/placement/`)
    .then((response) => response.data);
}

export function getTestSchedules_College_API(collegeID, page = 1, search = "") {
  return axios
    .get(`${API_URL}/api/test_group/${collegeID}/test-schedules/`, {
      params: { 
        page: page, 
        search: search 
      }, // Pass `searchTerm` as a query parameter
    })
    .then((response) => response.data);
}


export function getReports_College_UserName_API( testName, page = 1, search = "") {
  return axios
    .get(`${API_URL}/api/tests-reports-candidates/placement/`, {
      params: { 
        test_name: testName,
        page: page, 
        search: search 
      }, // Pass `searchTerm` as a query parameter
    })
    .then(response => {
      console.log("API response data in getReports_College_UserName_API:", response.data); // Log response data here
      return response.data;
    })
    .catch(error => {
      console.error("Error in API request:", error);
      throw error; // Rethrow the error to be caught in the useEffect
    });
  };
  



  export function getTestcandidateReports_candidates_Api(testName,collegeId, page = 1, search = "", toggleState = "all", avgMark = "", filters = {}) {
    return axios
        .get(`${API_URL}/api/tests-reports-candidates/placement/`, {
            params: { 
                test_name: testName, 
                college_id:collegeId,
                page, 
                search, 
                toggle_state: toggleState, 
                avg_mark: avgMark,
                ...filters // Pass additional filters
            }
        })
        .then(response => {
            console.log("API response data:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error in API request:", error);
            throw error;
        });
}




export function getCandidates_Job_API() {
  return axios
    .get(`${API_URL}/api/candidates-by-last-job/`)
    .then((response) => response.data);
}

export function getTestSchedule_Student_API(userName) {
  return axios
    .get(`${API_URL}/api/students-test-schedule/${userName}/`)
    .then((response) => response.data);
}

export function getQuestionApi_Filter_IO(question_id) {
  return axios
    .get(`${API_URL}/api/questions_io/${question_id}/filter/`)
    .then((response) => response.data);
}

export function getQuestionApi_Filter_IO_MCQ(question_id) {
  return axios
    .get(`${API_URL}/api/questions_io/${question_id}/filter/MCQ/`)
    .then((response) => response.data);
}

export function getQuestionApi_Filter_IO_CODE(question_id) {
  return axios
    .get(`${API_URL}/api/questions_io/${question_id}/filter/Code/`)
    .then((response) => response.data);
}

export function getTestcandidate_LIST_Api(testName, college_id) {
  if (college_id) {
    // ✅ With college_id
    return axios
      .get(`${API_URL}/api/test-list/${testName}/${college_id}/`)
      .then((response) => response.data);
  } else {
    // ✅ Without college_id
    return axios
      .get(`${API_URL}/api/test-list/${testName}/`)
      .then((response) => response.data);
  }
}



export function addlmsApiBatch(test) {
  return axios
    .post(`${API_URL}/api/course-schedule-map/`, {
      id: null,

      college_id: test.college_id,
      department_id: test.department_id,
      dtm_start_student: test.dtm_start_student,
      dtm_end_student: test.dtm_end_student,
      dtm_start_trainer: test.dtm_start_trainer,
      dtm_end_trainer: test.dtm_end_trainer,
      dtm_of_training: test.dtm_of_training,
      batch_no:test.batch_no,
      year: test.year,
      topic_id: test.topic_id,
     // trainer_ids: test.trainer_ids,
      batch_no:test.batch_no,
      
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      throw error;// Rethrow the error to propagate it further if needed
    });
}


// ✅ API function with optional filters
export function getStudents_Course_LMS_API(username, questionType = "", skillType = "") {
  return axios
    .get(`${API_URL}/api/course-content/students/`, {
      params: { 
        user_name: username,
        question_type: questionType || "",
        skill_type: skillType || ""
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}


export function deleteQuestionPaperLast_API(questionPaperName) {
  return axios
    .delete(`${API_URL}/api/delete-question-paper/${questionPaperName}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error deleting question paper:", error);
      throw error;
    });
}

export function getTrainer_Course_LMS_API(username) {
  return axios
    .get(`${API_URL}/api/course-content/Trainer/`, {
      params: { user_name: username },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

// Function to fetch student's need_candidate_info from API
export function getcandidates_UserName_Api(username) {
  return axios
    .get(`${API_URL}/api/candidates/username/?user_name=${username}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching student info:", error);
      // throw error; // Optionally handle errors further up the chain
    });
}

// Function to fetch student's need_candidate_info from API
export function getStudentNeedInfo(username) {
  return axios
    .get(`${API_URL}/api/candidate-info/?user_name=${username}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching student info:", error);
      // throw error; // Optionally handle errors further up the chain
    });
}

export function updateCandidateInfo(username, needCandidateInfo) {
  return axios
    .put(`${API_URL}/api/update-candidate-info/`, {
      user_name: username,
      need_candidate_info: needCandidateInfo,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating candidate info:", error);
      throw error; // Optionally handle errors further up the chain
    });
}

export function get_department_info_API(college_IDs) {
  console.log("college_ids endpoints....: ", college_IDs);

  // Convert college_IDs array to an object with repeated keys
  const params = college_IDs.reduce((acc, id) => {
    acc[`college_id`] = id;
    return acc;
  }, {});

  return axios
    .get(`${API_URL}/api/get-department-info/`, { params })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export function get_department_info_API_jd(college_IDs) {
  console.log("college_ids endpoints....: ", college_IDs);

  // Build URLSearchParams correctly
  const params = new URLSearchParams();
  college_IDs.forEach((id) => params.append("college_id", id));

  return axios
    .get(`${API_URL}/api/get-department-info/jd/`, { params })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}


export function get_department_info_LMS_API(college_IDs) {
  console.log("college_ids endpoints....: ", college_IDs);

  // Convert college_IDs array to an object with repeated keys
  const params = college_IDs.reduce((acc, id) => {
    acc[`college_id`] = id;
    return acc;
  }, {});

  return axios
    .get(`${API_URL}/api/get-department-info/LMS/`, { params })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      // throw error;
    });
}

//--------------------Word Import and Export functions----------------//



export function WordImportMCQ_Api(test) {
  console.log("Initial test object: ", test);

  const formData = new FormData();
  formData.append("docx_file", test.file); // Updated field name
  formData.append("question_paper_name", test.question_paper_name);
  formData.append("duration_of_test", test.duration_of_test);
  formData.append("topic", test.topic);
  formData.append("sub_topic", test.sub_topic);
  formData.append("no_of_questions", test.no_of_questions);
  formData.append("upload_type", test.upload_type);
  formData.append("test_type", test.test_type);
  formData.append("folder_name", test.folder_name);

  // Log the FormData key-value pairs
  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  return axios
    .post(`${API_URL}/api/import-mcq-questions/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => {
      console.log("API Response:", response); // Log full response to see details
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        console.error("Error response data:", error.response.data); // Log the error response data
        console.error("Error response status:", error.response.status); // Log the error response status
      } else {
        console.error("Error message:", error.message); // Log the error message if no response
      }
    });
}

export function WordImportCoding_Api(test) {
  console.log("Initial test object: ", test);

  const formData = new FormData();
  formData.append("docfile", test.file); // Updated field name
  formData.append("question_paper_name", test.question_paper_name);
  formData.append("duration_of_test", test.duration_of_test);
  formData.append("topic", test.topic);
  formData.append("sub_topic", test.sub_topic);
  formData.append("no_of_questions", test.no_of_questions);
  formData.append("upload_type", test.upload_type);
  formData.append("test_type", test.test_type);
  formData.append("folder_name", test.folder_name);
//formData.append("is_testcase",test.is_testcase)
// ✅ Convert is_testcase to a proper boolean before sending
formData.append("is_testcase", test.is_testcase ? "true" : "false");

  // Log the FormData key-value pairs
  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  return axios
    .post(`${API_URL}/api/import-coding-questions/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => {
      console.log("API Response:", response); // Log full response to see details
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        console.error("Error response data:", error.response.data); // Log the error response data
        console.error("Error response status:", error.response.status); // Log the error response status
      } else {
        console.error("Error message:", error.message); // Log the error message if no response
      }
    });
}

export function getStudentDetails_API(username) {
  return axios
    .get(`${API_URL}/api/get_candidate_details/`, {
      params: { user_name: username },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

//------------------------College With Logo------------------------------///




export function deleteCollege_logo_API(id) {
  return axios
    .patch(`${API_URL}/api/colleges/deletes/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating College with logo:", error);
      throw error;
    });
}



export function getEligibleStudent_Registered_CountApi() {
  return axios
    .get(`${API_URL}/api/eligible-registered/count/`)
    .then((response) => response.data);
}

export function geteligiblestudentsApi(job_id) {
  return axios
    .get(`${API_URL}/api/eligible-students/`, {
      params: { job_id: job_id },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export function geteligiblestudentsAllApi() {
  return axios
    .get(`${API_URL}/api/eligible-students-list/all/`)
    .then((response) => response.data);
}
export function getdbCandidates_API() {
  return axios
    .get(`${API_URL}/api/db-candidates/`)
    .then((response) => response.data);
}

export function getNonDbCandidates_API() {
  return axios
    .get(`${API_URL}/api/nondb-candidates/`)
    .then((response) => response.data);
}

export async function update_Announcement_API_NEW(id, test) {
  const formData = new FormData();
  formData.append("announcement", test.announcement);
  if (test.announcement_image) {
    formData.append("announcement_image", test.announcement_image);
  }

  return axios
    .post(`${API_URL}/api/eligible-student/update/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating Eligible  student list:", error);
      throw error;
    });
}

export function geteligiblestudentsroundApi(job_id) {
  return axios
    .get(`${API_URL}/api/eligible-students/round/`, {
      params: { round_of_interview: job_id },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export function updateRoundOfInterview_Upload_API(formData) {
  return axios.post(`${API_URL}/api/update-eligible-student-list/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}



export function update_is_acceptApi(id) {
  return axios
    .patch(`${API_URL}/api/update-is-accept/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      //throw error;
    });
}

export function update_is_DeclineApi(id) {
  return axios
    .patch(`${API_URL}/api/update-is-decline/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      //throw error;
    });
}

export function getTestAnswerFilter_API() {
  return axios
    .get(`${API_URL}/api/tests-answer/filters/`)
    .then((response) => response.data);
}

export function getTotalMarks_API(studentId, testName) {
  return axios
    .get(`${API_URL}/api/get_total_marks/${studentId}/${testName}/`)
    .then((response) => response.data);
}

export function deleteTestAnswer_Api(id) {
  return axios
    .delete(`${API_URL}/api/delete-student-answers/${id}/`)
    .then((response) => {
      // Log success if needed or perform any other actions with the response
      console.log("Successfully deleted:", response.data);
      return response.data;
    })
    .catch((error) => {
      // Improved error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);
      throw error;
    });
}

export async function update_MCQ_images_API_NEW(id, test) {
  const formData = new FormData();
  formData.append("question_text", test.question_text);
  formData.append("option_a", test.option_a);
  formData.append("option_b", test.option_b);
  formData.append("option_c", test.option_c);
  formData.append("option_d", test.option_d);
  formData.append("option_e", test.option_e);
  formData.append("answer", test.answer);
  formData.append("mark", test.mark);
  formData.append("sections", test.sections);
  formData.append("mark_method", test.mark_method);


  if (test.question_image_data) {
    formData.append("question_image_data", test.question_image_data);
  }
  if (test.option_a_image_data) {
    formData.append("option_a_image_data", test.option_a_image_data);
  }
  if (test.option_b_image_data) {
    formData.append("option_b_image_data", test.option_b_image_data);
  }
  if (test.option_c_image_data) {
    formData.append("option_c_image_data", test.option_c_image_data);
  }
  if (test.option_d_image_data) {
    formData.append("option_d_image_data", test.option_d_image_data);
  }
  if (test.option_e_image_data) {
    formData.append("option_e_image_data", test.option_e_image_data);
  }

  return axios
    .post(`${API_URL}/api/question_master/${id}/update/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating college:", error);
      throw error;
    });
}

export async function getTrainerByUsername(username) {
  console.log("inside endpoint");
  return await axios
    .get(`${API_URL}/api/trainer/${username}/`)
    .then((response) => response.data);
}

export function getDistinct_Upload_timing_API(id) {
  return axios
    .get(`${API_URL}/api/distinct-dtm-uploads/${id}/`)
    .then((response) => response.data);
}

export function getDistinct_Upload_timing_API_CC(test) {
  console.log('Tests Datas: ', test)
  
  return axios
    .get(`${API_URL}/api/distinct-dtm-uploads/cc/`, {
      params: {
        college_id: test.college_id,
       // college_group_id: test.college_group_id,
        batch_no: test.batch_no,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching distinct upload timings:", error);
      throw error;
    });
}





export function getTestcandidateCameraApi(id) {
  return axios
    .get(`${API_URL}/api/testcandidate/${id}/camera/`)
    .then((response) => response.data);
}

export function getLoginView_API(username, password) {
  return axios
    .post(`${API_URL}/api/login-view/`, {
      username: username,
      password: password,
    })
    .then((response) => response.data) // Returning response.data directly
    .catch((error) => {
      console.error("Error fetching data:", error);
      // throw error; // Throwing the error to be caught in handleLogin
    });
}

export function addLogin_Profile_API(log) {
  return axios
    .post(`${API_URL}/api/add/user-profiles/`, {
      user: {
        username: log.user.username,
        password: log.user.password,
        email: log.user.email,
      },
      role: log.role,
      college_id: log.college_id,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      // Optionally throw the error to propagate it further if needed
      // throw error;
    });
}

export function log_out_API() {
  return axios
    .post(`${API_URL}/api/logout/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error during logout:", error);
      // Optionally throw the error to propagate it further if needed
      throw error;
    });
}

export function getRounds_Students_Count_API(round_of_interview, cmpy_name) {
  return axios
    .get(`${API_URL}/api/rounds/eligible-student-count/`, {
      params: { round_of_interview: round_of_interview, job_name: cmpy_name },
    })
    .then((response) => response.data.count) // Extract count directly
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export async function updateAnnouncement_API(id, test, round_of_interview) {
  console.log(
    "Preparing to send API request for updating announcement with ID:",
    id
  );

  const formData = new FormData();
  formData.append("announcement", test.announcement);
  console.log("Added announcement to FormData:", test.announcement);
  // formData.append('round_of_interview', test.round_of_interview);
  console.log("round updated", test.round_of_interview);
  // Include the logo if it's provided
  if (test.announcement_image) {
    formData.append("announcement_image", test.announcement_image);
    console.log(
      "Added announcement image to FormData:",
      test.announcement_image
    );
  }

  try {
    console.log("Sending PUT request to update announcement");
    const response = await axios.post(
      `${API_URL}/api/eligible-student/update/${id}/${round_of_interview}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrftoken, // Ensure CSRF token is valid
        },
      }
    );

    console.log("PUT request successful, response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
}

export function getEligile_Students_job_Rounds_API(job_id, round_of_interview) {
  return axios
    .get(
      `${API_URL}/api/eligible-students/job-rounds/${job_id}/${round_of_interview}/`
    )
    .then((response) => response.data);
}

export function get_Registered_CountbyCompanyApi(clg_id, dept_name) {
  return axios
    .get(`${API_URL}/api/registered-count-by-company/`, {
      params: { college_id: clg_id, department_name: dept_name },
    })
    .then((response) => response.data);
}

export function get_Round_CountbyIdApi(clg_id, cmpy_name, department_id) {
  return axios
    .get(`${API_URL}/api/round-of-interview-count/`, {
      params: {
        college_id: clg_id,
        company_name: cmpy_name,
        department_name: department_id,
      },
    })
    .then((response) => response.data);
}

export function getDistinctCompany_API() {
  return axios
    .get(`${API_URL}/api/job-companies/`)
    .then((response) => response.data);
}

export async function sendEmailToStudents(job_id_value, round_of_interview) {
  try {
    console.log("Preparing to send API request to send emails");

    // Construct the API URL with the provided job_id_value and round_of_interview_value
    const url = `${API_URL}/api/send-email/${job_id_value}/${round_of_interview}/`;

    // Send the request using axios (GET or POST as per the requirement)
    const response = await axios.get(url, {
      headers: {
        "X-CSRFToken": csrftoken, // Ensure CSRF token is passed, if required
      },
    });

    console.log("Emails sent successfully, response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending emails:", error);
    // throw error;
  }
}

export function get_test_summary_API(clg_id, dtm_start) {
  return axios
    .get(`${API_URL}/api/test-attendance-summary/`, {
      params: { college_id: clg_id, dtm_start: dtm_start },
    })
    .then((response) => response.data);
}

export function addCameraScreenshots_API(test_id, formData) {
  return axios
    .post(`${API_URL}/api/upload-screenshot/${test_id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error during screenshot upload:", error);
      throw error; // Optionally throw the error to propagate it further if needed
    });
}

export function get_studens_announcement_API(student_id) {
  return axios
    .get(`${API_URL}/api/students/announcement/${student_id}/`)
    .then((response) => response.data);
}

export const getEligible_students_ReportAPI = (roundOfInterview, jobName) => {
  return axios
    .get(`${API_URL}/api/eligible-student-reports/`, {
      params: {
        round_of_interview: roundOfInterview,
        job_name: jobName,
      },
    })
    .then((response) => response.data) // Make sure you return the `response.data`
    .catch((error) => {
      console.error("Error in API:", error);
      throw error;
    });
};

export function getRoundOfInterviews_API() {
  return axios.get(`${API_URL}/api/rounds/`).then((response) => response.data);
}

export function getLMSTopicApi() {
  return axios
    .get(`${API_URL}/api/unique-topics-subtopics/`)
    .then((response) => response.data);
}

export function getMaxScoreByDepartment_Placement(collegeId, typeCategory) {
  return axios
    .get(`${API_URL}/api/max-score-by-department/${collegeId}/placement/`, {
      params: { typeCategory: typeCategory },
    })
    .then((response) => response.data);
}

export function getMaxScoreByDepartmentCoding_Placement(
  collegeId,
  typeCategory
) {
  return axios
    .get(
      `${API_URL}/api/max-score-by-department-coding/${collegeId}/placement/`,
      {
        params: { typeCategory: typeCategory },
      }
    )
    .then((response) => response.data);
}
export function getcandidatesRequestsApi() {
  return axios
    .get(`${API_URL}/api/candidates/request/`)
    .then((response) => response.data);
}

export function StudentRequestApi(dataToSubmit) {
  console.log("Data being submitted:", dataToSubmit); // Add this line
  return axios
    .post(`${API_URL}/api/student_request/create/`, dataToSubmit)
    .then((response) => response.data)
    .catch((error) => {
      console.error(
        "Error adding request:",
        error.response ? error.response.data : error.message
      );
      throw error;
    });
}

export function checkStudentRequestStatus(studentId) {
  return axios
    .get(`/api/student_request/${studentId}/check_status/`)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to fetch student request status");
      }
    })
    .catch((error) => {
      console.error("Error fetching student request status:", error);
      throw error;
    });
}

export function getStudentRequestCount() {
  return axios
    .get(`${API_URL}/api/student_request/count/`)
    .then((response) => response.data.count)
    .catch((error) => {
      console.error(
        "Error fetching request count:",
        error.response ? error.response.data : error.message
      );
      throw error;
    });
}

export function getStudentRequests() {
  return axios
    .get(`${API_URL}/api/student_request/list/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(
        "Error fetching student requests:",
        error.response ? error.response.data : error.message
      );
      throw error;
    });
}

export async function updateStudentRequestStatusApi(
  studentId,
  status,
  approvedBy
) {
  return axios
    .put(`${API_URL}/api/student_request/${studentId}/update_status/`, {
      status: status,
      approved_by: approvedBy,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating student request status:", error);
      throw error;
    });
}

export function getTestTypeCategory_API(testType) {
  return axios
    .get(`${API_URL}/api/get-test-type-categories/${testType}/`)
    .then((response) => response.data);
}

//________________________________Trainer_report_____________________________//

export function getTrainerReportApi(page = 1, search = "", topic, college, department_name, trainer_name) {
  return axios
    .get(`${API_URL}/api/trainers_report/`, {
      params: { 
          page, 
          search, 
          topic: topic,
          college_name: college,
          department_name: department_name,
          trainer_name: trainer_name,
      }
  })
    .then((response) => response.data);
}
export function addTrainerReportApi(log) {
  return axios
    .post(`${API_URL}/api/trainers_report/create/`, {
      id: null,
      course_schedule_id: log.course_schedule_id,
      no_of_question_solved: log.no_of_question_solved,
      comments: log.comments,
      status: log.status,
      activities_done: log.activities_done,
      student_feedback: log.student_feedback,
      infrastructure_feedback: log.infrastructure_feedback,
      remarks: log.remarks,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function getTrainers_topic_API(userName) {
  return axios
    .get(`${API_URL}/api/trainers/${userName}/topics/`)
    .then((response) => response.data);
}

export async function updateTrainer_API_NEW(formData, user_names) {
  try {
    const response = await axios.post(
      `${API_URL}/api/trainer/update/${user_names}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrftoken,
        },
      }
    );
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating trainer:", error);
    throw error;
  }
}
export function addTrainer_username_API(userName) {
  return axios
    .post(`${API_URL}/api/add_trainer/user_name/`, {
      user_name: userName,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding login:", error);
    });
}
export const update_is_EditApi = async (username, data) => {
  const response = await fetch(`${API_URL}/api/update-is-edit/${username}/`, {
    method: "PATCH", // Use PATCH method for partial updates
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// api/endpoints.js
export const update_is_TermsApi = async (username, data) => {
  const response = await fetch(`${API_URL}/api/update-is-terms/${username}/`, {
    method: "PATCH", // Use PATCH method for partial updates
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

export function getTrainers_staus(userName) {
  return axios
    .get(`${API_URL}/api/get_trainer_status/${userName}/`)
    .then((response) => response.data);
}

export function getstudentrequest_stausApi(userName) {
  return axios
    .get(`${API_URL}/api/student-requests/accepted/${userName}/`)
    .then((response) => response.data);
}

export async function sendWhatsAppToStudents(job_id, round_of_interview) {
  return axios
    .get(
      `${API_URL}/api/send-whatsapp/job-rounds/${job_id}/${round_of_interview}/`
    )
    .then((response) => response.data);
}

export function addTestAnswerMapApi_MCQ(log) {
  return axios
    .post(`${API_URL}/api/tests-candidates-answers/create/`, {
      id: null,
      test_name: log.test_id,
      question_id: log.question_id,
      student_id: log.student_id,
      answer: log.answer,
      result: log.result,
      dtm_start: log.dtm_start,
      dtm_end: log.dtm_end,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export const getfiltered_StudentsAPI = (
  college,
  department,
  years,
  marks10th,
  marks12th,
  cgpa_score,
  standingarrears,
  historyof_arrears,
  no_of_offers,
  genders
) => {
  // Log the parameters you're sending to the API
  console.log("API Call Parameters:", {
    college_id: college,
    department_id: department,
    year: years,
    gender: genders,
    marks_10th: marks10th,
    marks_12th: marks12th,
    cgpa: cgpa_score,
    standing_arrears: standingarrears,
    history_of_arrears: historyof_arrears,
    number_of_offers: no_of_offers,
  });

  return axios
    .get(`${API_URL}/api/filter-candidates-download/`, {
      params: {
        college_id: college,
        department_id: department,
        year: years,
        gender: genders,
        marks_10th: marks10th,
        marks_12th: marks12th,
        cgpa: cgpa_score,
        standing_arrears: standingarrears,
        history_of_arrears: historyof_arrears,
        number_of_offers: no_of_offers,
      },
    })
    .then((response) => {
      // Log the response data
      console.log("API Response Data:", response.data);
      return response.data; // Return the data after logging
    })
    .catch((error) => {
      // Log the error if the API request fails
      console.error("Error in API:", error);
      throw error; // Rethrow the error after logging it
    });
};

export function getunique_company_countApi(college_id) {
  return axios
    .get(`${API_URL}/api/unique-company-count/${college_id}/`)
    .then((response) => response.data);
}

export function getSkillType_Languages_API(testName) {
  return axios
    .get(`${API_URL}/api/get-skill-type-by-test-name/`, {
      params: { test_name: testName }, // Pass query parameters using 'params'
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching skill type:", error);
      //throw error; // Optionally re-throw the error for further handling
    });
}

export function Trainers_instructionApi(userName) {
  return axios
    .get(`${API_URL}/api/trainers/instruction/`, {
      params: { user_name: userName }, // Pass query parameters using 'params'
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching skill type:", error);
      //throw error; // Optionally re-throw the error for further handling
    });
}

export function getTrainer_Reports_All_Api() {
  return axios
    .get(`${API_URL}/api/trainers/all/reports/`)
    .then((response) => response.data);
}

export function getTrainers_Skills_Api() {
  return axios
    .get(`${API_URL}/api/trainers/skills/`)
    .then((response) => response.data);
}

export function LoginpassApi(userName) {
  console.log(`Requesting login data for userName: ${userName}`); // Debug request
  return axios
    .get(`${API_URL}/api/login/pass/`, {
      params: { user_name: userName }, // Use the correct parameter name
    })
    .then((response) => {
      console.log("API response data:", response.data); // Log the data received from API
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error("API response error:", error.response.data);
        console.error("API response status:", error.response.status);
        console.error("API response headers:", error.response.headers);
      } else if (error.request) {
        // Request was made but no response received
        console.error("API request error:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error in setting up request:", error.message);
      }
      throw error; // Optionally re-throw the error for further handling
    });
}

export function LoginDataApi(userName) {
  console.log(`Requesting login data for userName: ${userName}`); // Debug request
  return axios
    .get(`${API_URL}/api/login/datas/`, {
      params: { user_name: userName }, // Use the correct parameter name
    })
    .then((response) => {
      console.log("API response data:", response.data); // Log the data received from API
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error("API response error:", error.response.data);
        console.error("API response status:", error.response.status);
        console.error("API response headers:", error.response.headers);
      } else if (error.request) {
        // Request was made but no response received
        console.error("API request error:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error in setting up request:", error.message);
      }
      throw error; // Optionally re-throw the error for further handling
    });
}


export function CollegeImportAPI(college, formData) {
  const url = `${API_URL}/api/college/Candidate/import_excel/?college_id=${college}`;

  console.log("Sending request to:", url);
  console.log("Form data:", formData);

  return axios
    .post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      console.log("Response received:", response);
      return response;
    })
    .catch((error) => {
      console.error("Error occurred:", error);
      throw error;
    });
}

export function CollegeUserImportAPI(collegeId, formData) {
  const url = `${API_URL}/api/college/user/import_excel/?college_id=${collegeId}`;

  console.log("Sending request to:", url);
  console.log("Form data:", formData);

  return axios
    .post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      console.log("Response received:", response);
      return response;
    })
    .catch((error) => {
      console.error("Error occurred:", error);
      throw error;
    });
}

export function getRequestStatus_API(studentId) {
  return axios
    .get(`${API_URL}/api/student_request/${studentId}/check_status/`)
    .then((response) => response.data);
}

/*______________________________annoucement_______________________________*/

export function addCCannouncement_API(test) {
  const formData = new FormData();
  formData.append("announcement", test.announcement);
  formData.append("role", test.role);
  formData.append("login_ids", JSON.stringify(test.login_ids));

  if (test.announcement_image) {
    formData.append("announcement_image", test.announcement_image);
  }

  return axios
    .post(`${API_URL}/api/ccannouncement/add/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "There was an error creating the announcement!",
        error.response ? error.response.data : error.message
      );
    });
}

export const getCCannouncement_API = () => {
  return axios
    .get(`${API_URL}/api/ccannouncement/`)
    .then((response) => {
      console.log("API response data in getCollege_logo_API:", response.data); // Log response data here
      return response.data;
    })
    .catch((error) => {
      console.error("Error in API request:", error);
      throw error; // Rethrow the error to be caught in the useEffect
    });
};
export function deleteCCannouncement_API(id) {
  return axios
    .patch(`${API_URL}/api/ccannouncement/delete/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating College with logo:", error);
      throw error;
    });
}

export async function updateCCannouncement_API_NEW(id, test) {
  const formData = new FormData();
  formData.append("id", null);
  formData.append("announcement", test.announcement);
  formData.append("login_id", test.login_id);

  if (test.announcement_image) {
    formData.append("announcement_image", test.announcement_image);
  }

  return axios
    .post(`${API_URL}/api/ccannouncement/update/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating college:", error);
      throw error;
    });
}

export function addPlacementannouncement_API(test) {
  const formData = new FormData();
  formData.append("announcement", test.announcement);
  formData.append("role", test.role);
  formData.append("login_ids", JSON.stringify(test.login_ids));

  // Append candidate_id if available
  if (test.candidate_id) {
    formData.append("candidate_id", test.candidate_id); // Add candidate_id to the formData
  }

  if (test.announcement_image) {
    formData.append("announcement_image", test.announcement_image);
  }

  return axios
    .post(`${API_URL}/api/Placeannouncement/add/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "There was an error creating the announcement!",
        error.response ? error.response.data : error.message
      );
    });
}

export const getRole_API = () => {
  return axios
    .get(`${API_URL}/api/get/login/roles/`)
    .then((response) => {
      console.log("API response data in getCollege_logo_API:", response.data); // Log response data here
      return response.data;
    })
    .catch((error) => {
      console.error("Error in API request:", error);
      throw error; // Rethrow the error to be caught in the useEffect
    });
};

export function getTotalScore_API(id) {
  return axios
    .get(`${API_URL}/api/test-candidate/score/${id}/`)
    .then((response) => response.data);
}

export function getTestReports_API(params) {
  return axios
    .get(`${API_URL}/api/test-reports/`, { params })
    .then((response) => response.data);
}

export function getDistinct_test_API(filters) {
  return axios
    .get(`${API_URL}/api/distinct-tests/`, { params: filters })
    .then((response) => response.data);
}

export function getTestReports_API_Placement(params) {
  return axios
    .get(`${API_URL}/api/test-reports/placement/`, { params })
    .then((response) => response.data);
}

export function get_CC_Test_Reports_Stu_API(params) {
  return axios
    .get(`${API_URL}/api/students-completed-reports/`, { params })
    .then((response) => response.data);
}

export function Update_DB_API(formData) {
  console.log("formData: ", formData);

  return axios.post(`${API_URL}/api/update-db/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function Update_DB_API_placement(formData, collegeId) {
  console.log("formData: ", formData);

  // Construct the URL with the college_id as a query parameter
  const url = `${API_URL}/api/update-db/Placement/?college_id=${collegeId}`;

  return axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function TestReports_Upload_API(formData) {
  return axios.post(`${API_URL}/api/upload-and-import/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function TestReports_Update_API(formData) {
  return axios.post(`${API_URL}/api/update-TestReport/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getjob_All_Api() {
  return axios
    .get(`${API_URL}/api/job-master/count/`)
    .then((response) => response.data);
}

export function getRegistered_All_Api() {
  return axios
    .get(`${API_URL}/api/registered-students-count/`)
    .then((response) => response.data);
}

export function getjob_offer_countApi(college_id) {
  return axios
    .get(`${API_URL}/api/job_offer_count/${college_id}/`)
    .then((response) => response.data);
}

//--------------------------21-09-2024------------------------//

export function getAptitudeTotalCount_API(collegeId) {
  return axios
    .get(`${API_URL}/api/aptitude-test-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getTechnicalTotalCount_API(collegeId) {
  return axios
    .get(`${API_URL}/api/technical-test-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getRequestCount_CC_API(collegeId) {
 // console.log("roles: ", roles);
  return axios
    .get(`${API_URL}/api/request-count/cc/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getAvgAptitude_cc_API(collegeId, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd"); // Format the date to 'YYYY-MM-DD'
  return axios
    .get(`${API_URL}/api/avg-score-department-aptitude/cc/`, {
      params: { college_id: collegeId, dtm_start: formattedDate },
    })
    .then((response) => response.data);
}

export function getAvgCoding_cc_API(collegeId, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd"); // Format the date to 'YYYY-MM-DD'
  return axios
    .get(`${API_URL}/api/avg-score-department-coding/cc/`, {
      params: { college_id: collegeId, dtm_start: formattedDate },
    })
    .then((response) => response.data);
}

export function getClgTopper_MCQ_CC_API(collegeId, testType) {
  return axios
    .get(`${API_URL}/api/clg-topper-mcq/cc/`, {
      params: { college_id: collegeId, test_type: testType },
    })
    .then((response) => response.data);
}


export function getTrainerDetails_cc_API(collegeId) {
  return axios
    .get(`${API_URL}/api/get-trainer-schedule/cc/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getTestDetails_cc_API(collegeId) {
  return axios
    .get(`${API_URL}/api/get-test-details/cc/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getNewUpdates_cc_API(roles, collegeId) {
  return axios
    .get(`${API_URL}/api/get-news-update/cc/`, {
      params: { role: roles, college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getjoboffer_announcement_cc_API( collegeId) {
  return axios
    .get(`${API_URL}/api/get_job_offers_announcement/Po/`, {
      params: {  college_id: collegeId },
    })
    .then((response) => response.data);
}


export function getOfferChart_cc_API(collegeId) {
  return axios
    .get(`${API_URL}/api/get-offer-chart/cc/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getUpcomingInterview_cc_API(collegeId, department_id) {
  return axios
    .get(`${API_URL}/api/get-upcomming-interview/cc/`, {
      params: { college_id: collegeId, department_name: department_id },
    })
    .then((response) => response.data);
}

export function getOfferStatus_cc_API(collegeId, comapny_id) {
  return axios
    .get(`${API_URL}/api/get-offer-status/cc/`, {
      params: { college_id: collegeId, company_name: comapny_id },
    })
    .then((response) => response.data);
}

export function getUniqueCmpy_cc_API(college_id = null) {
  let url = `${API_URL}/api/get-distinct-company/cc/`;
  
  if (college_id) {
    url += `?college_id=${college_id}`;
  }

  return axios.get(url).then((response) => response.data);
}


export function getUniqueCmpy_Count_cc_API(collegeId) {
  return axios
    .get(`${API_URL}/api/get-company-count/cc/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getClgRegistered_API(collegeId) {
  return axios
    .get(`${API_URL}/api/college-reg-students-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getJobOffer_Count_CC_API(collegeId) {
  return axios
    .get(`${API_URL}/api/get-job_offer_count/cc/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getTestAnswers_API(test_name, student_id) {
  return axios
    .get(`${API_URL}/api/get-answers/`, {
      params: { test_name: test_name, student_id: student_id },
    })
    .then((response) => response.data);
}
export function getrequestpla_countApi(college_id) {
  return axios
    .get(`${API_URL}/api/student-requests_placement/count/`, {
      params: { college_id: college_id }
    } )
    .then((response) => response.data);
}

export function getrequestplaementQueryApi(college_id) {
  return axios
    .get(`${API_URL}/api/student-requests/placement/`, {
      params: { college_id: college_id }
    } )
    .then((response) => response.data);
}


export function getEligibleStudentCountApi(college_id) {
  return axios
    .get(`${API_URL}/api/eligible-students/count/?clg_id=${college_id}`)
    .then((response) => response.data);
}

export function getDistinct_test_Place_API(collegeId) {
  return axios
    .get(`${API_URL}/api/distinct-tests/place/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}


export function getQuestionPaperByIdApi(id) {
  return axios
    .get(`${API_URL}/api/question_paper_view/${id}/`)
    .then((response) => response.data);
}

export function AddQuestions_mcq_Api(test) {
  console.log("entering endpoint....");
  console.log("endpoint image data: ", test);

  const formData = new FormData();
  formData.append("id", null);
  formData.append("question_name_id", test.question_name_id);
  formData.append("question_text", test.question_text);
  if (test.question_image_data) {
    formData.append("question_image_data", test.question_image_data);
  }
  if (test.option_a_image_data) {
    formData.append("option_a_image_data", test.option_a_image_data);
  }
  if (test.option_b_image_data) {
    formData.append("option_b_image_data", test.option_b_image_data);
  }
  if (test.option_c_image_data) {
    formData.append("option_c_image_data", test.option_c_image_data);
  }
  if (test.option_d_image_data) {
    formData.append("option_d_image_data", test.option_d_image_data);
  }
  if (test.option_e_image_data) {
    formData.append("option_e_image_data", test.option_e_image_data);
  }
  formData.append("option_a", test.option_a);
  formData.append("option_b", test.option_b);
  formData.append("option_c", test.option_c);
  formData.append("option_d", test.option_d);
  formData.append("option_e", test.option_e);
  formData.append("answer", test.answer);
  formData.append("mark", test.mark);
  formData.append("mark_method", test.mark_method);
  formData.append("explain_answer", test.explain_answer);
  formData.append("sections", test.sections);
  formData.append("difficulty_level", test.difficulty_level);

  return axios
    .post(`${API_URL}/api/mcq/create/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("There was an error creating the question!", error);
    });
}

export function AddQuestions_coding_Api(test) {
  return axios
    .post(`${API_URL}/api/coding/create/`, {
      id: null,
      question_name_id: test.question_name_id,
      question_text: test.question_text,
      question_image_data: test.question_image_data,

      answer: test.answer,
      mark: test.mark,
      explain_answer: test.explain_answer,
      input_format: test.input_format,
        difficulty_level:test.difficulty_level

    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export function addQuestionpaperApi_place(test) {
  return axios
    .post(`${API_URL}/api/create-question-paper/placement/`, {
      id: null,
      question_paper_name: test.question_paper_name,
      duration_of_test: test.duration_of_test,
      upload_type: test.upload_type,
      no_of_questions: test.no_of_questions,
      test_type: test.test_type,
      topic: test.topic,
      sub_topic: test.sub_topic,
      created_by: test.created_by,
      folder_name: test.folder_name,
      is_testcase:test.is_testcase
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error.response.data);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}


export function QuestionsExportAPI_place(formData) {
  return axios.post(
    `${API_URL}/api/question/import_excel/placement/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}

export function WordImportMCQ_Api_place(test) {
  console.log("Initial test object: ", test);

  const formData = new FormData();
  formData.append("docx_file", test.file); // Updated field name
  formData.append("question_paper_name", test.question_paper_name);
  formData.append("duration_of_test", test.duration_of_test);
  formData.append("topic", test.topic);
  formData.append("sub_topic", test.sub_topic);
  formData.append("no_of_questions", test.no_of_questions);
  formData.append("upload_type", test.upload_type);
  formData.append("test_type", test.test_type);
  formData.append("created_by", test.created_by);
  formData.append("folder_name", test.folder_name);

  // Log the FormData key-value pairs
  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  return axios
    .post(`${API_URL}/api/import-mcq-questions/placement/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => {
      console.log("API Response:", response); // Log full response to see details
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        console.error("Error response data:", error.response.data); // Log the error response data
        console.error("Error response status:", error.response.status); // Log the error response status
      } else {
        console.error("Error message:", error.message); // Log the error message if no response
      }
    });
}

export function QuestionsExportCodeAPI_place(formData) {
  return axios.post(
    `${API_URL}/api/question/import_excel/code/placement/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}

export function WordImportCoding_Api_place(test) {
  console.log("Initial test object: ", test);

  const formData = new FormData();
  formData.append("docfile", test.file); // Updated field name
  formData.append("question_paper_name", test.question_paper_name);
  formData.append("duration_of_test", test.duration_of_test);
  formData.append("topic", test.topic);
  formData.append("sub_topic", test.sub_topic);
  formData.append("no_of_questions", test.no_of_questions);
  formData.append("upload_type", test.upload_type);
  formData.append("test_type", test.test_type);
  formData.append("created_by", test.created_by);
  formData.append("is_testcase",test.is_testcase)
  formData.append("folder_name",test.folder_name)
  // Log the FormData key-value pairs
  for (let pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  return axios
    .post(`${API_URL}/api/import-coding-questions/placement/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-CSRFToken": csrftoken,
      },
    })
    .then((response) => {
      console.log("API Response:", response); // Log full response to see details
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        console.error("Error response data:", error.response.data); // Log the error response data
        console.error("Error response status:", error.response.status); // Log the error response status
      } else {
        console.error("Error message:", error.message); // Log the error message if no response
      }
    });
}

export function getQuestionPaperApi_place(collegeName, page = 1, search = "") {
  return axios
    .get(`${API_URL}/api/get-question-paper/placement/`, {
      params: { college_name: collegeName, page, search },
    })
    .then((response) => response.data);
}

export async function updateTestName_TestReports_API(test) {
  try {
    console.log("test data: ", test);
    const response = await axios.put(
      `${API_URL}/api/testcandidate/update/test_reports/`,
      {
        testName: test.testName,
        test_name: test.test_name,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating test master:", error);
    // throw error;
  }
}

export function getdbCandidates_API_place(collegeId) {
  return axios
    .get(`${API_URL}/api/db-candidates/place/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getNonDbCandidates_API_place(collegeId) {
  return axios
    .get(`${API_URL}/api/nondb-candidates/place/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function addInvoiceApi(log) {
  const formData = new FormData();
  formData.append("college_id", log.college_id);
  formData.append("misc_expenses", log.misc_expenses);
  formData.append("travel_expenses", log.travel_expenses);
  formData.append("food_allowance", log.food_allowance);
  formData.append("misc_expenses_type", log.misc_expenses_type);
  formData.append("trainer_id", log.trainer_id);
  formData.append("dtm_start", log.dtm_start);
  formData.append("dtm_end", log.dtm_end);
  formData.append("overall_feedback", log.overall_feedback);
  formData.append("print_amount", log.print_amount);
  formData.append("food_amount", log.food_amount);
  formData.append("travel_amount", log.travel_amount);
  formData.append("travel_days", log.travel_days);
  formData.append("print_days", log.print_days);
  formData.append("food_days", log.food_days);
  formData.append("training_days", log.training_days);
  formData.append("training_amount", log.training_amount);
  formData.append("invoice_no", log.invoice_no);

  return axios
    .post(`${API_URL}/api/create-invoice/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding invoice:", error);
      throw error; // Rethrow the error to propagate it further if needed
    });
}

export function getTrainer_Course_invoice_API(username) {
  return axios
    .get(`${API_URL}/api/course-content/Trainer/invoice/`, {
      params: { user_name: username },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

//--------------------------07-10-2024 (Student Dashboard) ------------------------//

export function Stu_Aptitute_test_API(userName, cat) {
  return axios
    .get(`${API_URL}/api/aptitude-test-count/stu/`, {
      params: { username: userName, categories: cat },
    })
    .then((response) => response.data);
}

export function Stu_Technical_test_API(userName, cat) {
  return axios
    .get(`${API_URL}/api/technical-test-count/stu/`, {
      params: { username: userName, categories: cat },
    })
    .then((response) => response.data);
}

export function Stu_cmpy_test_API(userName) {
  console.log("🌐 Calling backend API for user:", userName);

  return axios
    .get(`${API_URL}/api/cmpy-test-count/stu/`, {
      params: { username: userName },
    })
    .then((response) => {
      console.log("📦 Full Axios response:", response);
      return response.data;
    })
    .catch((error) => {
      console.error("❌ API Error:", error);
      throw error;
    });
}


export function Stu_commun_test_API(userName) {
  return axios
    .get(`${API_URL}/api/commun-test-count/stu/`, {
      params: { username: userName },
    })
    .then((response) => response.data);
}

export function Stu_Offer_Counts_API(userName, offerAccept) {
  return axios
    .get(`${API_URL}/api/offer-counts/stu/`, {
      params: { username: userName, offer: offerAccept },
    })
    .then((response) => response.data);
}

export function Stu_Aptitude_Reports_API(userName, cat, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/aptitute-percentage/stu/`, {
      params: {
        username: userName,
        categories: cat,
        start_date: formattedDate,
      },
    })
    .then((response) => response.data);
}

export function Stu_TestType_Categories_API() {
  return axios
    .get(`${API_URL}/api/tst-type-cate/stu/`)
    .then((response) => response.data);
}

export function Stu_Technical_Reports_API(userName, cat, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/technical-percentage/stu/`, {
      params: {
        username: userName,
        categories: cat,
        start_date: formattedDate,
      },
    })
    .then((response) => response.data);
}

export function Stu_Test_Schedules_API(userName) {
  return axios
    .get(`${API_URL}/api/test-schedules/stu/`, {
      params: { username: userName },
    })
    .then((response) => response.data);
}

export function Stu_Training_Schedules_API(userName) {
  return axios
    .get(`${API_URL}/api/training-schedules/stu/`, {
      params: { username: userName },
    })
    .then((response) => response.data);
}

export function Stu_News_Updates_API(userName) {
  return axios
    .get(`${API_URL}/api/news-updates/stu/`, { params: { username: userName } })
    .then((response) => response.data);
}

export function Stu_Topic_Status_API(userName) {
  return axios
    .get(`${API_URL}/api/topic-status/stu/`, { params: { username: userName } })
    .then((response) => response.data);
}

//---------08-10-2024 (Trainer Dashboard)

export function Trainer_Training_Schedule_API(userName) {
  return axios
    .get(`${API_URL}/api/course-content/Trainer/TrainingSchedule/`, {
      params: { user_name: userName },
    })
    .then((response) => response.data);
}

export function Trainer_Test_Schedule_API(userName) {
  return axios
    .get(`${API_URL}/api/course-content/Trainer/TestSchedule/`, {
      params: { user_name: userName },
    })
    .then((response) => response.data);
}

export function Trainer_Topic_Status_API(userName) {
  return axios
    .get(`${API_URL}/api/course-content/Trainer/status/`, {
      params: { user_name: userName },
    })
    .then((response) => response.data);
}

export function Trainer_Aptitude_Count_API(userName) {
  return axios
    .get(`${API_URL}/api/course-content/Trainer/Test_app/`, {
      params: { user_name: userName },
    })
    .then((response) => response.data);
}

export function Trainer_Technical_Count_API(userName) {
  return axios
    .get(`${API_URL}/api/course-content/Trainer/Test_Tech/`, {
      params: { user_name: userName },
    })
    .then((response) => response.data);
}

export function Trainer_Test_Reports_API(userName, dept, date) {
  const formattedDate = format(date, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/Trainers/Tests_reports/`, {
      params: { user_name: userName, department: dept, date: formattedDate },
    })
    .then((response) => response.data);
}

export function Trainer_Feedback_Report_API(userName, dept, date) {
  const formattedDate = format(date, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/Trainers/feedback_reports/`, {
      params: { user_name: userName, department: dept, date: formattedDate },
    })
    .then((response) => response.data);
}

export function downloadResume(trainerId) {
  return axios
    .get(`${API_URL}/api/download/resume/${trainerId}/`, {
      responseType: "blob", // Important for handling binary data
    })
    .then((response) => {
      // Create a link element to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Set the filename from response headers (or default)
      const filename = response.headers["content-disposition"]
        ? response.headers["content-disposition"].split("filename=")[1]
        : `resume_${trainerId}.pdf`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up the URL object after download
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error downloading resume:", error);
    });
}

//--------09-10-2024 (Attendance)

export function Stu_Attendance_API(userName, collegeName) {
  return axios
    .get(`${API_URL}/api/attendance/stu/new/`, {
      params: { username: userName, college_name: collegeName },
    })
    .then((response) => response.data);
}

export function Trainer_Attendance_API(userName, collegeName) {
  return axios
    .get(`${API_URL}/api/attendance/trainer/new/`, {
      params: { username: userName, college_name: collegeName },
    })
    .then((response) => response.data);
}

export function CC_Attendance_API(collegeId) {
  return axios
    .get(`${API_URL}/api/attendance/cc/new/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function Trainer_College_Name_API(userName) {
  return axios
    .get(`${API_URL}/api/college_name/trainer/`, {
      params: { username: userName },
    })
    .then((response) => response.data);
}

export function Trainer_News_Updates_API(userName) {
  return axios
    .get(`${API_URL}/api/news-updates/trainer/`, {
      params: { username: userName },
    })
    .then((response) => response.data);
}

export function addjoboffersApi(log) {
  // Sanitize data: Only include non-null and non-undefined fields
  const payload = {
    id: null,
    job_type: log.job_type || "", // default empty string if not provided
    company_name: log.company_name,
    company_profile: log.company_profile || "", // default empty string if not provided
    no_of_offers: log.no_of_offers || 0, // default to 0 if not provided
    post_name: log.post_name,
    intern_fulltime: log.intern_fulltime || "", // default empty string if not provided
    on_off_campus: log.on_off_campus ?? false, // default to false if not provided
    college_id: log.college_id,
    packages: log.packages || "", // default empty string if not provided
    department_id: log.department_id,
    skill_id: log.skill_id || [], // default empty array if not provided
    marks_10th: log.marks_10th ?? 0, // default to 0 if not provided
    marks_12th: log.marks_12th ?? 0, // default to 0 if not provided
    cgpa: log.cgpa ?? 0, // default to 0 if not provided
    year: log.year ?? 0, // default to 0 if not provided
    interview_date: log.interview_date ? moment(log.interview_date).format("YYYY-MM-DD HH:mm:ss") : null, // format date or set null
    gender: log.gender || "Not specified", // default value if not provided
    history_of_arrears: log.history_of_arrears ?? 0, // default to 0 if not provided
    standing_arrears: log.standing_arrears ?? 0, // default to 0 if not provided
    location: log.location || "", // default empty string if not provided
  };

  // Send the sanitized payload to the backend
  return axios
    .post(`${API_URL}/api/job-offers/create/`, payload)
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding job offer:", error);
      throw error; // Rethrow the error to propagate it further if needed
    });
}

export function getjobofferscc() {
  return axios
    .get(`${API_URL}/api/job-offers/display/`)
    .then((response) => response.data);
}

export function getInvoiceByIdApi() {
  return axios
    .get(`${API_URL}/api/invoice-data-display/`)
    .then((response) => response.data);
}

export function update_paymentApi(id) {
  return axios
    .patch(`${API_URL}/api/update-payment-status/`, null, {
      params: { id: id },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating payment status:", error);
    });
}
export function updateScheduleDateApi(id, scheduleDate) {
  console.log(
    `API call initiated to update schedule date for invoice ID: ${id}`
  );
  console.log(`Original selected date object:`, scheduleDate);

  const formattedDate = scheduleDate.toISOString();
  console.log(`Formatted schedule date for API (ISO string): ${formattedDate}`);

  return axios
    .patch(`${API_URL}/api/update-schedule-date/${id}/`, {
      schedule_date: formattedDate,
    })
    .then((response) => {
      console.log("API call successful, response data:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error updating schedule date in API:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Server status code:", error.response.status);
      }
      throw error;
    });
}

//-----------------------------15-10-2024-------------------------//

export function Job_Offer_Announcement_Update_API(id, text) {
  return axios
    .get(`${API_URL}/api/announcement/job_offer/`, {
      params: { offer_id: id, announcement: text },
    })
    .then((response) => response.data);
}

export function Job_Offer_Email_API(
  ids,
  postName,
  depts,
  cmpyName,
  attach_file = null
) {
  const formData = new FormData();

  // Append form data
  formData.append("college_ids", ids.join(","));
  formData.append("post_name", postName);
  formData.append("departments", depts);
  formData.append("company_name", cmpyName);

  // If a file is provided, attach it to the FormData
  if (attach_file) {
    formData.append("attach_file", attach_file);
    console.log("Attaching file:", attach_file.name);
  } else {
    console.log("No attachment provided.");
  }

  // Log the form data for debugging purposes
  console.log("Sending FormData:", formData);

  // Use POST for sending data, especially with attachments
  return axios
    .post(`${API_URL}/api/email_sending/job_offer/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      console.log("Email sent successfully, response:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      throw error;
    });
}

export function updatekeypressApi(id, capture_passkey) {
  console.log(
    `API call initiated to update schedule date for invoice ID: ${id}`
  );
  console.log(`Original selected date object:`, capture_passkey);

  return axios
    .patch(`${API_URL}/api/test-keypress/${id}/update/`, {
      capture_passkey: capture_passkey,
    })
    .then((response) => {
      console.log("API call successful, response data:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error updating schedule date in API:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Server status code:", error.response.status);
      }
      throw error;
    });
}

export function getScheduledateID_API(user_name) {
  return axios
    .get(`${API_URL}/api/invoice/schedule_date/`, {
      params: { user_name: user_name },
    })
    .then((response) => response.data);
}
export function Capture_Duration_Update_API(id, text) {
  return axios
    .get(`${API_URL}/api/update/capture_duration/`, {
      params: { id: id, capture_duration: text },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating capture duration:", error);
      throw error; // Rethrow the error to be handled where the function is called
    });
}

export function Get_Last_job_offer_API(id) {
  return axios
    .get(`${API_URL}/api/latest-job-offer/`, {
      params: { college_id: id },
    })
    .then((response) => response.data);
}

export function getClgTotal_IT_Count_API(collegeId) {
  return axios
    .get(`${API_URL}/api/job_type/it/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getClgTotal_Core_Count_API(collegeId) {
  return axios
    .get(`${API_URL}/api/job_type/core/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function check_username_exists_API(name) {
  return axios
    .get(`${API_URL}/api/username/check/`, {
      params: { username: name },
    })
    .then((response) => response.data);
}

export function getAnnouncement_table_API() {
  return axios
    .get(`${API_URL}/api/announcements/get/`)
    .then((response) => response.data);
}

export function UpdateAnnouncement_table_API(
  ids,
  announcement,
  announcementImage
) {
  console.log("announcement image conosle: ", announcementImage);

  const formData = new FormData();
  formData.append("ids", JSON.stringify(ids)); // Convert array to JSON string
  if (announcement) formData.append("announcement", announcement);
  if (announcementImage)
    formData.append("announcement_image", announcementImage);

  return axios
    .put(`${API_URL}/api/announcements/update/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data);
}

export function DeleteAnnouncement_table_API(ids) {
  const formData = new FormData();
  formData.append("ids", JSON.stringify(ids)); // Convert array to JSON string
  return axios
    .put(`${API_URL}/api/announcements/delete/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data);
}

export function Unique_Job_Offers_API(id) {
  return axios
    .get(`${API_URL}/api/job_offers/unique/place/`, {
      params: { college_id: id },
    })
    .then((response) => response.data);
}

export function Get_Instruction_popup_API(name) {
  return axios
    .get(`${API_URL}/api/trainer/popup/get/`, {
      params: { user_name: name },
    })
    .then((response) => response.data);
}

export function Update_Instruction_popup_API(name) {
  return axios
    .put(`${API_URL}/api/trainer/popup/update/`, { user_name: name })
    .then((response) => response.data);
}


/* -------------------------------------new added------------------------------------*/

export async function updatecompanyemailApi(test_name, formData) {
  try {
    const response = await axios.put(
      `${API_URL}/api/update-company-email/`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data' // Ensure proper handling of FormData
        },
        params: {
          test_name: test_name, // Pass test_name as a query parameter
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating company email:", error);
    throw error; // Propagate the error for higher-level handling
  }
}

export async function getCompanyEmailApi(test_name) {
  try {
    const response = await axios.get(`${API_URL}/api/get-company-email/`, {
      params: {
        test_name: test_name // Pass test_name as a query parameter
      }
    });
    return response.data; // Returns the company email or error message
  } catch (error) {
    console.error("Error fetching company email:", error);
    throw error; // Propagate the error for higher-level handling
  }
}

export async function updateTestRoundApi(test_name, formData) {
  try {
    const response = await axios.put(
      `${API_URL}/api/update-test-round/`,
      formData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          test_name: test_name, // Pass test_name as a query parameter
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating test round:", error);
    throw error; // Propagate the error for higher-level handling
  }
}

export function Update_NonDB_API(formData) {
  console.log("formData: ", formData);

  return axios.post(`${API_URL}/api/nondb/excel/update/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function Update_NonDB_PlacementAPI(collegeId, formData) {
  console.log("formData: ", formData);
  console.log("collegeId: ", collegeId);

  return axios.post(`${API_URL}/api/nondb/excel/update/Placement/?college_id=${collegeId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}


export function getClg_Group_API(clg) {
  return axios.get(`${API_URL}/api/college_group/`, {
    params: { college_name: clg }
  })
    .then(response => response.data)
}
export function get_Batches_API(colleges, collegeIds) {
  return axios
      .get(`${API_URL}/api/batches/`, {
          params: { colleges, college_id: collegeIds },
          paramsSerializer: params => {
              const collegeIdsSerialized = params.college_id
                  ? params.college_id.map(id => `college_id=${id}`).join('&')
                  : '';
              const collegesSerialized = params.colleges
                  ? params.colleges.map(college => `colleges=${college}`).join('&')
                  : '';
              return [collegeIdsSerialized, collegesSerialized].filter(Boolean).join('&');
          }
      })
      .then(response => response.data)
      .catch(error => {
          console.error('Error fetching batches:', error);
          return [];
      });
}



export function get_department_info_Test_API(college_IDs) {
  console.log('college_ids endpoints....: ', college_IDs);

  // Convert college_IDs array to query parameters
  const queryString = college_IDs.map(id => `college_id=${encodeURIComponent(id)}`).join('&');

  const url = `${API_URL}/api/get-department-info/test/?${queryString}`;

  console.log('Generated API URL:', url); // Debugging the URL

  return axios.get(url)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}


export const get_department_info_cumula_API = async (collegeIds) => {
  try {
      console.log("Received College IDs:", collegeIds); // ✅ Debugging

      // Ensure collegeIds is an array
      let collegeArray = Array.isArray(collegeIds) ? collegeIds : [collegeIds];

      console.log("Formatted College Array:", collegeArray); // ✅ Debugging

      // Convert to query string
      const queryString = collegeArray
          .map(id => `college_id=${encodeURIComponent(id)}`)
          .join('&');

      console.log("Generated Query String:", queryString); // ✅ Debugging

      const response = await axios.get(`${API_URL}/api/get-department-info/test/cumlative/?${queryString}`);

      console.log("API Response:", response.data); // ✅ Debugging

      if (!Array.isArray(response.data)) {
          console.error("Unexpected API response format:", response.data);
          return []; // Return an empty array if response is invalid
      }

      return response.data; // ✅ Return valid department data
  } catch (error) {
      console.error("API request failed:", error);
      return []; // Prevent crashes
  }
};


export function getcollege_Test_Api() {
  return axios.get(`${API_URL}/api/colleges/test/`)
    .then(response => response.data)
}


export function getDistinct_Upload_timing_API_TEST(college_IDs) {
  // Convert college_IDs array to an object with repeated keys
  const params = college_IDs.reduce((acc, id) => {
    acc[`college_id`] = id;
    return acc;
  }, {});

  return axios.get(`${API_URL}/api/distinct-dtm-uploads/test/`, { params })
    .then(response => response.data)
}


export function getuniquestudentApi(collegeId) {
  return axios
    .get(`${API_URL}/api/unique-students/`, {
      params: { college_id: collegeId }, // Pass the ID directly
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error in API call:", error.response?.data || error.message);
      throw error;
    });
}


export function getCandidatesOverallReportsApi(params = {}) {
  return axios
    .get(`${API_URL}/api/candidates/overall/report/`, { params })
    .then((response) => response.data);
}

export function getAllstuReportsApi(params = {}) {
  return axios
    .get(`${API_URL}/api/stu_all/report/`, { params })
    .then((response) => response.data);
}


export function getdeparmentOverallReportsApi(params = {}) {
  return axios
    .get(`${API_URL}/api/dep/candidates/overall/report/`, { params })
    .then((response) => response.data);
}

export function getdepartmentAllstuReportsApi(params = {}) {
  return axios
    .get(`${API_URL}/api/dep/stu_all/report/`, { params })
    .then((response) => response.data);
}



/*-----------------changes------------------------------------*/

export function addCollege_logo_API(test) {
  console.log('entering endpoint....');
  console.log('endpoint image data: ', test);

  const formData = new FormData();
  formData.append('id', null);
  formData.append('college_group', test.college_group);
  formData.append('college', test.college);
  formData.append('instruction', test.instruction);
  formData.append('spoc_name', test.spoc_name);
  formData.append('spoc_no', test.spoc_no);
  formData.append('email', test.email);
  formData.append('level_of_access', test.level_of_access);
 
  
  if (test.college_logo) {
    formData.append('college_logo', test.college_logo);
  }
  
  formData.append('attendance_url', test.attendance_url);
  return axios.post(`${API_URL}/api/colleges/uploads/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrftoken,
      },
    }
  )
    .then(response => {
      console.log(response.data);
      return response.data;
    })
    .catch(error => {
      console.error('There was an error creating the question!', error);
    });
}

export const getCollege_logo_API_CLG = (page = 1, searchTerm = "") => {
  return axios
    .get(`${API_URL}/api/colleges/list/clg/`, {
      params: { 
        page: page, 
        search: searchTerm 
      }, // Pass `searchTerm` as a query parameter
    })
    .then(response => {
      console.log("API response data in getCollege_logo_API:", response.data); // Log response data here
      return response.data;
    })
    .catch(error => {
      console.error("Error in API request:", error);
      throw error; // Rethrow the error to be caught in the useEffect
    });
};


export const getCollege_logo_API = () => {
  return axios
    .get(`${API_URL}/api/colleges/list/`)
    .then(response => {
      console.log("API response data in getCollege_logo_API:", response.data); // Log response data here
      return response.data;
    })
    .catch(error => {
      console.error("Error in API request:", error);
      throw error; // Rethrow the error to be caught in the useEffect
    });
};




export async function updateCollege_logo_API_NEW(id, formData) {
  console.log("FormData received in API function:");
  formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
  });
  return axios.post(`${API_URL}/api/colleges/updates/${id}/`, formData, {
      headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrftoken,
      },
  })
      .then((response) => response.data)
      .catch((error) => {
          console.error("Error in API request:", error);
          throw error;
      });
}


export function addCorporate_logo_API(test) {
  console.log("Entering the endpoint for adding company...");
  console.log("Initial input data received:", test);

  try {
    // Creating the FormData object
    const formData = new FormData();
    formData.append("id", null);
    formData.append("company_name", test.company_name);
    console.log("Company Name added to FormData:", test.company_name);

    formData.append("company_profile", test.company_profile);
    console.log("Company Profile added to FormData:", test.company_profile);

    formData.append("user_name", test.user_name);
    console.log("User Name added to FormData:", test.user_name);

    formData.append("email_id", test.email_id);
    console.log("Email ID added to FormData:", test.email_id);

    formData.append("mobile_no", test.mobile_no);
    console.log("Mobile Number added to FormData:", test.mobile_no);

    formData.append("password", test.password);
    console.log("Password added to FormData:", test.password);

    if (Array.isArray(test.college_id) && test.college_id.length > 0) {
      test.college_id.forEach((college_id) => {
        if (college_id !== null && college_id !== undefined) {
          formData.append("college_id", college_id);
          console.log("Added college_id:", college_id);
        }
      });
    } else if (test.college_id) {
      formData.append("college_id", test.college_id);
      console.log("Added single college_id:", test.college_id);
    } else {
      console.log("No college IDs provided.");
    }

    
    if (test.company_logo) {
      formData.append("company_logo", test.company_logo);
      console.log("Company Logo file added to FormData:", test.company_logo.name);
    } else {
      console.log("No company logo provided.");
    }

    // Logging FormData for verification
    console.log("Final FormData content:");
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Sending the POST request
    return axios
      .post(`${API_URL}/api/add-company-login/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrftoken,
        },
      })
      .then((response) => {
        console.log("API response received:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error occurred during API request:", error.response?.data || error.message);
        throw error;
      });
  } catch (error) {
    console.error("Unexpected error in addCorporate_logo_API:", error);
    throw error;
  }
}


export const getCorporate_logo_API = () => {
  return axios.get(`${API_URL}/api/corporate/list/`)
    .then(response => {
     // console.log("API response data in getCollege_logo_API:", response.data); // Log response data here
      return response.data;
    })
    .catch(error => {
      console.error("Error in API request:", error);
      throw error; // Rethrow the error to be caught in the useEffect
    });
};


export async function updateCorporate_logo_API_NEW(id, test) {
  const formData = new FormData();
  formData.append('company_name', test.company_name);
  formData.append('company_profile', test.company_profile);
  formData.append('user_name', test.user_name);
  formData.append('email_id', test.email_id);
  formData.append('mobile_no', test.mobile_no);
  formData.append('password', test.password);

  if (test.college_ids && test.college_ids.length > 0) {
    test.college_ids.forEach((college_id) => {
      formData.append("college_id", college_id); // Add each college_id
    });
  }
  console.log("College IDs added to FormData:", test.college_ids);

  if (test.company_logo) {
    formData.append('company_logo', test.company_logo);
  }

  return axios.post(`${API_URL}/api/company/update/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-CSRFToken': csrftoken
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating college:', error);
      throw error;
    });
}


export function deletecorporateApi(id) {
  return axios
    .patch(`${API_URL}/api/corporate/delete/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}


export function getTestSchedules_Corporate_API(collegeID) {
  return axios
    .get(`${API_URL}/api/tests-schedules/corporate/${collegeID}/`)
    .then((response) => response.data);
}

export function getReports_corporate_UserName_API(collegeID, userName) {
  return axios
    .get(
      `${API_URL}/api/tests-reports-candidates/${collegeID}/${userName}/corporate/`
    )
    .then((response) => response.data);
}

export function getCorporate_id_candidateall_API(colleges) {
  // Join the colleges array into a comma-separated string
  const collegeIds = colleges.join(',');

  // Make the API call with the comma-separated string of college IDs
  return axios
    .get(`${API_URL}/api/corporate_cand/all/${collegeIds}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}
export function getReports_Corporate_UserName_API(collegeID, testName) {
  return axios
    .get(
      `${API_URL}/api/tests-reports-candidates/${collegeID}/${testName}/corporate/`
    )
    .then((response) => response.data);
}

export function getCorporate_Collegeid_API(collegeID) {
  return axios
    .get(
      `${API_URL}/api/ids_college/${collegeID}/corporate/`
    )
    .then((response) => response.data);
}


export function getmulti_Collegestu_API(collegeID) {
  return axios
    .get(
      `${API_URL}/api/mul_unique_students/${collegeID}/`
    )
    .then((response) => response.data);
}


export function getCorporateOverallReportsApi(colleges, params = {}) {
  return axios
    .get(`${API_URL}/api/corporate/test_reports/${colleges}/`, { params })
    .then((response) => response.data);

  }

  
export function getAllstucorporateReportsApi(colleges,params = {}) {
  return axios
    .get(`${API_URL}/api/stu_all/report/corporate/${colleges}/`, { params })
    .then((response) => response.data);
}



export function getjobIdApi(id) {
  return axios
    .get(`${API_URL}/api/jobsIds/${id}/`)
    .then((response) => response.data);
}


export function get_Batches_API_COR(collegeNames, collegeIds, departmentIds, year) {
  return axios.get(`${API_URL}/api/batches/cor/`, {
    params: { college_name: collegeNames, college_id: collegeIds, department_id: departmentIds, year },
    paramsSerializer: params => {
      const clgNames = params.college_name ? `college_name=${params.college_name}` : '';
      const collegeParams = Array.isArray(params.college_id)
        ? params.college_id.map(id => `college_id=${id}`).join('&')
        : '';
      const departmentParams = Array.isArray(params.department_id)
        ? params.department_id.map(id => `department_id=${id}`).join('&')
        : '';
      const yearParam = params.year ? `year=${params.year}` : '';
      return [clgNames, collegeParams, departmentParams, yearParam].filter(Boolean).join('&');
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Error fetching batches:', error);
    return [];
  });
}




export function QuestionsExportAPI_COR(formData) {
  console.log('formData: ', formData);
  
  return axios.post(`${API_URL}/api/question/import_excel/cor/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
export function getFolders_Name_API(test_type, topic, subtopic,category) {
  return axios
    .get(`${API_URL}/api/get-folder-name/`, {
      params: { test_type, topic, subtopic,category } // Pass query parameters here
    })
    .then((response) => response.data);
}


export function get_Questions_Folders_Name_API(folder_name, test_type, topic, subtopic,category) {
  return axios
    .get(`${API_URL}/api/get-questions-by-folder/`, {
      params: { folder_name, test_type, topic, subtopic,category } // Pass query parameters here
    })
    .then((response) => response.data);
}




export function getTrainersUsernames_API() {
  return axios
    .get(`${API_URL}/api/trainers-usernames/`)
    .then((response) => response.data);
}




export function QuestionsExportAPI_COR_CODE(formData) {
  console.log('formData: ', formData);
  
  return axios.post(`${API_URL}/api/question/import_excel/cor/code/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}




export function addTestcandidateCORPORATEApiBatch(test) {
  return axios.post(`${API_URL}/api/test-candidates-map/corporate/create/`, {
      test_name: test.test_name,
      question_ids: test.question_id, // Send question IDs
     // college_name: test.college_name,
     // college_group_id: test.college_group_id,
      batch_no: test.batch_no,
     // department_id: test.department_id,
      dtm_start: test.dtm_start,
      dtm_end: test.dtm_end,
      is_camera_on: test.is_camera_on,
      duration: test.duration,
      duration_type: test.duration_type,
     // year: test.year,
      rules_id: test.rules_id,
      need_candidate_info: test.need_candidate_info,
      test_type_id: test.test_type_id,
      question_type_id: test.question_type_id,
      skill_type_id: test.skill_type_id,
      company_name: test.company_name,
      company_email: test.company_email
  })
  .then(response => response.data)
  .catch(error => {
      console.error('Error adding Test:', error);
  });
}



//------------------test report generate pdf---------------------//



export function get_Candidate_Detail_Report_API(candidate_id) {
  return axios
    .get(`${API_URL}/api/candidate-details/`, {
      params: { candidate_id }  // Pass the candidate_id as query parameter
    })
    .then((response) => response.data);
}


export function get_Test_Details_Report_API(test_name, student_id) {
  return axios
    .get(`${API_URL}/api/test-details/`, {
      params: { test_name, student_id }  // Pass test_name and student_id as query parameters
    })
    .then((response) => response.data);
}



export function get_Test_Result_Score_API(test_name, student_id) {
  return axios
    .get(`${API_URL}/api/test-results/score/`, {
      params: { test_name, student_id }  // Pass test_name and student_id as query parameters
    })
    .then((response) => response.data);
}


export function get_Test_Question_Detail_API(test_name, student_id, question_paper_id) {
  return axios
    .get(`${API_URL}/api/test-question-details/`, {
      params: { test_name, student_id, question_paper_id }  // Pass test_name and student_id as query parameters
    })
    .then((response) => response.data);
}


export function get_Skill_Type_API(test_name, student_id) {
  return axios
    .get(`${API_URL}/api/get-skill-type/`, {
      params: { test_name, student_id }  // Pass test_name and student_id as query parameters
    })
    .then((response) => response.data);
}




export function get_CC_Test_Reports_Stu_API_COR(params) {
  return axios
    .get(`${API_URL}/api/students-completed-reports/corporate/`, { params })
    .then((response) => response.data);
}


//-------------------------20-12-2024--------------------------//



export function getTrainer_popup_API(username) {
  return axios
    .get(`${API_URL}/api/trainer_report/popup/`, {
      params: { user_name: username },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export function Get_Invoice_API(invoiceNo, username, collegeId) {
  return axios
    .get(`${API_URL}/api/get-invoice/`, {
      params: {
        invoice_no: invoiceNo,
        trainer_username: username,
        college_id: collegeId,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching invoice data:', error);
      throw error;
    });
}

export const updateInvoiceApi = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/api/update-invoice/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

export const updateCCInvoiceApi = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/api/update-ccinvoice/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

export function Get_InvoiceWithschedule_API( username, collegeId) {
  return axios
    .get(`${API_URL}/api/get-invoice_schedule/`, {
      params: {
        // Pass additional params if needed
        trainer_name: username,
        college_id: collegeId,
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching invoice data:', error);
      throw error;
    });
}

export function deleteinvoiceApi(id) {
  return axios
    .patch(`${API_URL}/api/delete_invoice/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}




export function get_Is_Edit_API(user_name) {
  return axios
    .get(`${API_URL}/api/is_edit/`, {
      params: { user_name }  // Pass test_name and student_id as query parameters
    })
    .then((response) => response.data);
}


export function get_college_Ids_Company_API(user_name) {
  return axios
    .get(`${API_URL}/api/get-college-ids/company/`, {
      params: { user_name }  // Pass test_name and student_id as query parameters
    })
    .then((response) => response.data);
}



export function getDistinct_test_Cor_API(collegeIds) {
  return axios
    .get(`${API_URL}/api/distinct-tests/cor/`, {
      params: { college_id: JSON.stringify(collegeIds) },
    })
    .then((response) => response.data);
}




export function get_Login_By_Username_API(user_name, password) {
  return axios
    .get(`${API_URL}/api/get/login/username/`, {
      params: { user_name: user_name, password: password }  // Pass test_name and student_id as query parameters
    })
    .then((response) => response.data);
}




export function getBatchNumbersByCollege(clg, is_database) {
  return axios
    .get(`${API_URL}/api/get_batch_by_college_id/`, {
      params: { college_id: clg, is_database }  // Pass test_name and student_id as query parameters
    })
    .then((response) => response.data);
}


export function get_Active_Test_Reassign_API(testName) {
  return axios
    .get(`${API_URL}/api/active-test-name/${testName}/`)
    .then((response) => response.data);
}




export function Test_Reassign_API(test) {
  return axios
    .put(`${API_URL}/api/update-test-status/`, {
      user_name: test.stu_id,
      test_name: test.test_name,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}


export function get_Batches_NON_DB_API(colleges, collegeIds) {
  return axios
      .get(`${API_URL}/api/batches/non-db/`, {
          params: { colleges, college_id: collegeIds },
          paramsSerializer: params => {
              const collegeIdsSerialized = params.college_id
                  ? params.college_id.map(id => `college_id=${id}`).join('&')
                  : '';
              const collegesSerialized = params.colleges
                  ? params.colleges.map(college => `colleges=${college}`).join('&')
                  : '';
              return [collegeIdsSerialized, collegesSerialized].filter(Boolean).join('&');
          }
      })
      .then(response => response.data)
      .catch(error => {
          console.error('Error fetching batches:', error);
          return [];
      });
}

export function get_Batches_API_NONDB(colleges, collegeIds) {
  return axios
      .get(`${API_URL}/api/batches-nondb/`, {
          params: { colleges, college_id: collegeIds },
          paramsSerializer: params => {
              const collegeIdsSerialized = params.college_id
                  ? params.college_id.map(id => `college_id=${id}`).join('&')
                  : '';
              const collegesSerialized = params.colleges
                  ? params.colleges.map(college => `colleges=${college}`).join('&')
                  : '';
              return [collegeIdsSerialized, collegesSerialized].filter(Boolean).join('&');
          }
      })
      .then(response => response.data)
      .catch(error => {
          console.error('Error fetching batches:', error);
          return [];
      });
}


export function Get_Screenshots_API(id) {
  return axios
    .get(`${API_URL}/api/get-screenshots/`, {
      params: { test_candidate_id: id }, // Correct way to pass query parameters
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching screenshots:", error); // Updated error message
      throw error; // Rethrow the error if needed
    });
}


// ✅ Function to fetch Aptitude Test Names with optional filters
export function get_test_name_group_API_TotalAptitudeTest(college_id = null, department = null, year = null) {
  let url = `${API_URL}/api/test_group/aptitude-test/`;
  const params = new URLSearchParams();

  if (college_id) params.append("college_id", college_id);
  if (department) params.append("department", department);
  if (year) params.append("year", year);

  return axios.get(`${url}?${params.toString()}`).then(response => response.data);
}

// ✅ Function to fetch Technical Test Names with optional filters
export function get_test_name_group_API_TotalTechnicalTest(college_id = null, department = null, year = null) {
  let url = `${API_URL}/api/test_group/technical-test/`;
  const params = new URLSearchParams();

  if (college_id) params.append("college_id", college_id);
  if (department) params.append("department", department);
  if (year) params.append("year", year);

  return axios.get(`${url}?${params.toString()}`).then(response => response.data);
}

export function getStudents_Course_LMSPlacement_API(collegeId, questionType = "", skillType = "") {
  const endpoint = `${API_URL}/api/course-content/Placement/`;  // ✅ Endpoint

  console.log("📡 Making API request to:", endpoint, {
    college_id: collegeId,
    question_type: questionType,
    skill_type: skillType,
  });

  return axios
    .get(endpoint, {
      params: { 
        college_id: collegeId,
        question_type: questionType || undefined, // only send if not empty
        skill_type: skillType || undefined,       // only send if not empty
      },
    })
    .then((response) => {
      console.log("✅ API request successful, received data:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("❌ API request failed:", error);
      if (error.response) {
        console.error("Error response details:", error.response.data);
      }
      throw error;
    });
}


export function getCourseContentFeedbackcountApi(page = 1, search = "", topic, college, department_name, trainer_name) {
  return axios
    .get(`${API_URL}/api/get/course_contenet_feedback_count/`, {
      params: { 
          page, 
          search, 
          topic: topic,
          college_name: college,
          department_name: department_name,
          trainer_name: trainer_name,
      }
  })
    .then((response) => response.data);
}

export function getTrainerReportStatusApi(collegeName, departmentName, trainerName) {
  return axios
    .get(`${API_URL}/api/get_trainer_report_status/`, {
      params: {
        college_name: collegeName,
        department_name: departmentName,
        trainer_name: trainerName,
      },
    })
    .then((response) => response.data);
}



export function downloadTestReports(collegeId, batchNo, departmentId, years, startDate, endDate, questionType, createdByRole, chartType = 'bar', inactive = false) {
  return axios({
    url: `${API_URL}/api/download-test-reports/`,
    method: 'GET',
    params: { 
      college_id: collegeId, 
      chart_type: chartType, 
      ...(departmentId && departmentId !== "all" && { department_id: departmentId }), 
      ...(questionType && { question_type: questionType }), 
      ...(batchNo && { batch_no: batchNo }), 
      ...(years && { year: years }), 
      ...(startDate && { start_date: startDate }), 
      ...(endDate && { end_date: endDate }),
      ...(createdByRole && { created_by_role: createdByRole }),
      ...(inactive && { inactive: "true" })
    },
    responseType: 'blob',
  })
  .then((response) => {
   const contentDisposition = response.headers['content-disposition'];
console.log("Content-Disposition header:", contentDisposition); // ✅ Debug print

let fileName;

if (contentDisposition) {
  const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
  if (matches != null && matches[1]) {
    fileName = matches[1].replace(/['"]/g, '');
    console.log("Extracted filename from header:", fileName); // ✅ Debug print
  }
}

// Only proceed if backend provides a filename
if (!fileName) {
  console.error("Filename not provided by backend!");
  return;
}


    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  })
  .catch(error => console.error('Error downloading:', error));
}


export function getCollegeList_Concat_API() {
  return axios
    .get(`${API_URL}/api/college-master/concat/`)
    .then((response) => response.data);
}
export function downloadAptituteStu_API(userName, cat, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios({
    url: `${API_URL}/api/download-aptitute-percentage/stu/`,
    method: 'GET',
    params: { 
      username: userName,
      categories: cat,
      start_date: formattedDate, 
    },
    responseType: 'blob',
  })
  .then((response) => {
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'Apti_test_report.xlsx'; // Default filename

    // Extract the filename from the Content-Disposition header
    if (contentDisposition) {
      const matches = /filename="([^"]+)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        fileName = matches[1];
      }
    }

    // Create an object URL and trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Use the dynamic filename
    document.body.appendChild(link);
    link.click();
    link.remove();
  })
  .catch(error => console.error('Error downloading:', error));
}

export function getSubTopic_API(topic) {
  return axios
    .get(`${API_URL}/api/sub_topics/`)
    .then((response) => response.data);
}
export function updateMultipleTestCandidatesStatus(testName, studentIds) {
  console.log("Sending POST request to update-multiple-test-status API");
  console.log("Test Name:", testName);
  console.log("Student IDs to update:", studentIds);

  return axios
    .post(`${API_URL}/api/update-multiple-test-status/New/`, {
      test_name: testName,
      student_ids: studentIds
    })
    .then((response) => {
      console.log("API response:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error updating test candidate status:", error.response?.data || error.message);
      throw error;
    });
}

export function downloadTechnicalStu_API(userName, cat, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios({
    url: `${API_URL}/api/download/technical-percentage/stu/`,
    method: 'GET',
    params: { 
      username: userName,
      categories: cat,
      start_date: formattedDate, 
    },
    responseType: 'blob',
  })
  .then((response) => {
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'Tech_test_report.xlsx'; // Default filename

    // Extract the filename from the Content-Disposition header
    if (contentDisposition) {
      const matches = /filename="([^"]+)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        fileName = matches[1];
      }
    }

    // Create an object URL and trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Use the dynamic filename
    document.body.appendChild(link);
    link.click();
    link.remove();
  })
  .catch(error => console.error('Error downloading:', error));
}

export function updateCandidateFileApi(candidateId, formData) {
  const apiUrl = `${API_URL}/api/update-candidate-file/${candidateId}/`;
  console.log("Sending file update request to:", apiUrl);

  return axios({
    url: apiUrl,
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  })
    .then(response => {
      console.log("File upload response:", response.data);
      return response.data;
    })
    .catch(error => {
      console.error("Error uploading file:", error);
    });
}

export function getNewUpdates_cc_API_PO(roles, collegeId, username) {
  return axios
    .get(`${API_URL}/api/get-news-update/cc/po/`, {
      params: { role: roles, college_id: collegeId, username: username },
    })
    .then((response) => response.data);
}


export function getAllstutestassignedcountApi(params = {}) {
  return axios
    .get(`${API_URL}/api/student-test-summary/`, { params })
    .then((response) => response.data);
}


export function getTestReports_API_Cor(params) {
  return axios
    .get(`${API_URL}/api/test-reports/cor/`, { params })
    .then((response) => response.data);
}
export function getBatchnumberClgID_API(clgID) { 
  return axios
    .get(`${API_URL}/api/get_batch_numbers/${clgID}/`) 
    .then((response) => response.data);
}

export function addTestcandidateApiBatch_Placement(test) {
  return axios.post(`${API_URL}/api/test-candidates-map/create/placement/`, {
    id: null,
    test_name: test.test_name,
    question_id: test.question_id,
    college_id: test.college_id,
    created_by:test.created_by,
    college_group_id: test.college_group_id,
    batch_no: test.batch_no,
    department_id: test.department_id,
    dtm_start: test.dtm_start,
    dtm_end: test.dtm_end,
   
    is_camera_on: test.is_camera_on,
    duration: test.duration,
    duration_type: test.duration_type,
    year: test.year,
    rules_id: test.rules_id,
    need_candidate_info: test.need_candidate_info,
    test_type_id: test.test_type_id,
    question_type_id: test.question_type_id,
    skill_type_id: test.skill_type_id,
    company_name: test.company_name,
      company_email:test.company_email,

  })
    .then(response => response.data)
    .catch(error => {

      // Handle error
      console.error('Error adding Test:', error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}
export function updateAutoTestReassign(testName, studentId) {
  if (!testName || !studentId) {
    console.error("Error: Missing testName or studentId before API call.");
    return;
  }

  console.log("Sending request to updateAutoTestReassign API:", {
    test_name: testName,
    student_id: studentId,
  });

  return axios
    .post(`${API_URL}/api/update_test_reassign/`, { // Ensure correct API URL
      test_name: testName,
      student_id: studentId,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating test candidate status:", error.response?.data || error.message);
      throw error;
    });
}

export function Update_Question_Text_API(params = {}) {
  return axios
    .get(`${API_URL}/api/update_question_text/`, { params })
    .then((response) => response.data);
}
export function updateTestEntries_API(params) {
  return axios
    .post(`${API_URL}/api/update-test-map-entry/`, params, {
      headers: { "Content-Type": "application/json" },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("❌ Error updating test entries:", error.response?.data || error.message);
      throw error;
    });
}

// Fetch database candidates with optional filters
export function getDatabaseCandidateFilter(college_name = null, batch_no = null, department = null, year = null) {
    let url = `${API_URL}/api/get-database-candidate-filter/`;
    const params = new URLSearchParams();

    if (college_name) params.append("college_name", college_name);
    if (batch_no) params.append("batch_no", batch_no);
    if (department) params.append("department", department);
    if (year) params.append("year", year);

    return axios.get(`${url}?${params.toString()}`).then(response => response.data);
}

// Fetch non-database candidates with optional filters
export function getNondatabaseCandidateFilter(college_name = null, batch_no = null) {
    let url = `${API_URL}/api/get-nondatabase-candidate-filter/`;
    const params = new URLSearchParams();

    if (college_name) params.append("college_name", college_name);
    if (batch_no) params.append("batch_no", batch_no);

    return axios.get(`${url}?${params.toString()}`).then(response => response.data);
}

export function get_Batches_API_CLG_ID(collegeIds) {
  console.log('College ids: ', collegeIds);
  return axios
    .get(`${API_URL}/api/batches/clg-id/`, {
      params: { college_id: collegeIds }, // Axios will serialize the list correctly
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching batches:', error);
      return [];
    });
}



export function get_Batches_API_CLG_ID_NDB(collegeIds) {
  console.log('College ids: ', collegeIds);
  return axios
    .get(`${API_URL}/api/batches/clg-id/ndb/`, {
      params: { college_id: collegeIds }, // Axios will serialize the list correctly
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching batches:', error);
      return [];
    });
}


export function getTrainingSchedulesApi() {
  return axios
    .get(`${API_URL}/api/course-schedule/`)
    .then((response) => response.data);
}



//------------------------17-03-2025-------------------------------------


export function QuestionsExportAPI_PO(formData) {
  console.log('formData: ', formData);
  
  return axios.post(`${API_URL}/api/question/import_excel/po/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}


export function QuestionsExportAPI_PO_CODE(formData) {
  console.log('formData: ', formData);
  
  return axios.post(`${API_URL}/api/question/import_excel/po/code/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}



export function getJDApi(job_id) {
  return axios
    .get(`${API_URL}/api/display/job-offer/${job_id}/`)  // ✅ job_id in URL path
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export function downloadTestReportsMonthwise(
  collegeId, batchNo, departmentId, years, reportYear, questionType, createdByRole, chartType = 'bar'
) {
  return axios({
    url: `${API_URL}/api/monthwise-test-reports/`,
    method: 'GET',
    params: { 
      college_id: collegeId, 
      chart_type: chartType, 
      ...(departmentId && departmentId !== "all" && { department_id: departmentId }), 
      ...(questionType && { question_type: questionType }), 
      ...(batchNo && { batch_no: batchNo }),
      ...(years && { year: years }),
      ...(reportYear && { report_year: reportYear }),
      ...(createdByRole && { created_by_role: createdByRole })
    },
    responseType: 'blob',
  })
  .then((response) => {
    const contentDisposition = response.headers['content-disposition'];
    console.log("Content-Disposition header from backend:", contentDisposition); // ✅ Debug

    let fileName;
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '');
        console.log("Extracted filename:", fileName); // ✅ Should include college name
      }
    }

    if (!fileName) {
      fileName = 'monthly_performance_report.xlsx';
      console.warn("Using fallback filename:", fileName);
    }

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);

    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  })
  .catch(error => console.error('Error downloading:', error));
}



export function QuestionsExportPhysicoAPI(formData) {
  return axios.post(`${API_URL}/api/question/import_excel/physico/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function deletejobofferApi(id) {
  return axios
    .patch(`${API_URL}/api/job/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
export function QuestionsExportCodeTestCaseAPI(formData) {
  return axios.post(`${API_URL}/api/question/import_excel/code/testcase/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
export function QuestionsExportCodeAPI_placeTestcase(formData) {
  return axios.post(
    `${API_URL}/api/question/import_excel/code/placement/testcase/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}



export function get_department_info_Test_API_CC(college_IDs) {
  console.log('college_ids endpoints....: ', college_IDs);

    return axios
    .get(`${API_URL}/api/get-department-info/test/cc/`, {
      params: { college_id: college_IDs }, // Axios will serialize the list correctly
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching batches:', error);
      return [];
    });
}
export function get_department_info_College(college_IDs) {
  console.log('college_ids endpoints....: ', college_IDs);

  return axios
    .get(`${API_URL}/api/get-department-info/test/cc/`, {
      params: { 'college_id[]': college_IDs }, // <-- pass param key as 'college_id[]'
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching departments:', error);
      return [];
    });
}

export function get_test_name_group_API_TestReports(college_id = null, department = null, year = null, test_name = null, start_date = null, end_date = null, page = 1) {
  let url = `${API_URL}/api/test_group/testReport/`;
  const params = new URLSearchParams();

  console.log("🔹 Initial API Call Started");

  if (college_id) {
    params.append("college_id", college_id);
    console.log("✅ College ID Passed:", college_id);
  }

  if (department) {
    params.append("department", department);
    console.log("✅ Department ID Passed:", department);
  }

  if (year) {
    params.append("year", year);
    console.log("✅ Year Passed:", year);
  }

  if (test_name) {
    params.append("test_name", test_name);
    console.log("✅ Test Name Passed:", test_name);
  }

  if (start_date) {
    params.append("From_date", start_date);
    console.log("✅ Start Date Passed:", start_date);
  }

  if (end_date) {
    params.append("To_date", end_date);
    console.log("✅ End Date Passed:", end_date);
  }
  params.append("page", page);


  const finalUrl = `${url}?${params.toString()}`;
  console.log("🚀 Final API URL:", finalUrl);

  return axios.get(finalUrl)
    .then(response => {
      console.log("✅ API Response Received:", response.data);
      return response.data;
    })
    .catch(error => {
      console.error("❌ API Request Failed:", error);
      throw error;
    });
}

export function get_Departments_TestReports(college_id = null, year = null, test_name = null) {
  let url = `${API_URL}/api/get/departments/test-report/`;
  const params = new URLSearchParams();

  if (college_id) {
    params.append("college_id", college_id);
  }

  if (year) {
    params.append("year", year);
  }

  if (test_name) {
    params.append("test_name", test_name);
  }

  const finalUrl = `${url}?${params.toString()}`;

  return axios.get(finalUrl)
    .then(response => response.data)
    .catch(error => {
      console.error("❌ API Request Failed:", error);
      throw error;
    });
}


export function get_Colleges_TestReports(department_id = null, year = null, test_name = null) {
  let url = `${API_URL}/api/get/colleges/test-report/`;
  const params = new URLSearchParams();

  if (department_id) {
    params.append("department_id", department_id);
  }

  if (year) {
    params.append("year", year);
  }

  if (test_name) {
    params.append("test_name", test_name);
  }

  const finalUrl = `${url}?${params.toString()}`;

  return axios.get(finalUrl)
    .then(response => response.data)
    .catch(error => {
      console.error("❌ API Request Failed:", error);
      throw error;
    });
}


export function get_Test_Names_TestReports(college_id = null, year = null, department_id = null) {
  let url = `${API_URL}/api/get/test-names/test-report/`;
  const params = new URLSearchParams();

  if (college_id) {
    params.append("college_id", college_id);
  }

  if (year) {
    params.append("year", year);
  }

  if (department_id) {
    params.append("department_id", department_id);
  }

  const finalUrl = `${url}?${params.toString()}`;

  return axios.get(finalUrl)
    .then(response => response.data)
    .catch(error => {
      console.error("❌ API Request Failed:", error);
      throw error;
    });
}


export function get_Departments_PO_Announce_API(college_id = null) {
  let url = `${API_URL}/api/get_departments/college/`;
  const params = new URLSearchParams();

  if (college_id) {
    params.append("college_id", college_id);
  }

  const finalUrl = `${url}?${params.toString()}`;

  return axios.get(finalUrl)
    .then(response => response.data)
    .catch(error => {
      console.error("❌ API Request Failed:", error);
      throw error;
    });
}

export function getMapLms_data_count_API(page = 1, search = "", topic, college) { 
  return axios
    .get(`${API_URL}/api/grouped-course-schedule/`, {
      params: { 
          page, 
          search, 
          topic: topic,
          college: college
      }
  }) // Call the grouped course schedule API
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching grouped course schedule data:", error);
      throw error;
    });
}



export function getRequestQueries_API(collegeId) {
 
  return axios
    .get(`${API_URL}/api/get-student-queries/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function get_test_name_group_API_TotalDepartmentTest(college_id = null, department = null, year = null, from_date = null, to_date = null, test_name = null) {  
  let url = `${API_URL}/api/department-reports-new/`;
  const params = new URLSearchParams();

  if (college_id) params.append("college_id", college_id);
  if (department) params.append("department", department);
  if (year) params.append("year", year);
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);
  if (test_name) params.append("test_name", test_name);  // ✅ Pass test_name

  return axios.get(`${url}?${params.toString()}`).then(response => response.data);
}

export function get_Test_By_Test_Name_API(testName) {
 
  return axios
    .get(`${API_URL}/api/get-test/`, {
      params: { test_name: testName },
    })
    .then((response) => response.data);
}



export function getQuestionApi_Filter_IO_MCQ_Psychometry(question_id) {
  return axios
    .get(`${API_URL}/api/questions_io/${question_id}/filter/MCQ/psychometry/`)
    .then((response) => response.data);
}


export function get_year_PO_Announce_API(college_id = null) {
  let url = `${API_URL}/api/get_year/college/`;
  const params = new URLSearchParams();

  if (college_id) {
    params.append("college_id", college_id);
  }

  const finalUrl = `${url}?${params.toString()}`;

  return axios.get(finalUrl)
    .then(response => response.data)
    .catch(error => {
      console.error("❌ API Request Failed:", error);
      throw error;
    });
}

export function get_Skill_Ques_API() {
  return axios
    .get(`${API_URL}/api/grouped-skill-types/`)
    .then((response) => response.data);
}


export async function updateTotalScoreAvg_API(id, test) {
  return axios
    .put(`${API_URL}/api/update/totalScore/${id}/psy/`, {
      total_score: test.total_score,
      avg_mark: test.avg_mark,

    })
    .then((response) => response.data);
}



export function addTestAnswerMapApi_MCQ_PSY(log) {
  return axios
    .post(`${API_URL}/api/tests-candidates-answers/create/`, {
      id: null,
      test_name: log.test_id,
      question_id: log.question_id,
      student_id: log.student_id,
      answer: log.answer,
      result: log.result,
      dtm_start: log.dtm_start,
      dtm_end: log.dtm_end,
      compile_code_editor: log.compile_code_editor,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding login:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}



export async function updateTestAnswerApi_PSY(id, log) {
  return axios
    .put(`${API_URL}/api/tests-candidates-answers/${id}/`, {
      test_name: log.test_id,
      question_id: log.question_id,
      student_id: log.student_id,
      answer: log.answer,
      result: log.result,
      dtm_start: log.dtm_start,
      dtm_end: log.dtm_end,
      compile_code_editor: log.compile_code_editor,
    })
    .then((response) => response.data);
}


export function getViewResults_po_API(collegeID, testName) {
  return axios
    .get(`${API_URL}/api/tests-reports-candidates/po/`, {
      params: {
        college_id: collegeID,
        test_name: testName
      }
    })
    .then((response) => response.data);
}
export function getViewResults_CC_API(collegeID,testName) {
  return axios
    .get(`${API_URL}/api/tests-reports-candidates/po/`, {
      params: {
        college_id: collegeID,
        test_name: testName
      }
    })
    .then((response) => response.data);
}



export function getcandidatesApi_MCQ(user_name) {
  return axios
    .get(`${API_URL}/api/candidates/mcq/`, {
      params: { user_name: user_name }, // Fix params syntax
    })
    .then((response) => response.data);
}



export function getStu_Details_Report_API(params = {}) {
  return axios
    .get(`${API_URL}/api/stu-detail/report/`, { params })
    .then((response) => response.data);
}

export function getDepart_Report_dropDown_Po_API(college) { 
  return axios
    .get(`${API_URL}/api/dept/by/clg/report/po/`, {
      params: { 
          college_id: college
      }
  }) // Call the grouped course schedule API
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching dept drop down data:", error);
      throw error;
    });
}

export function getTest_Name_DropDown_PO_API(college, department, year) { 
  return axios.get(`${API_URL}/api/tests/dept/report/po/`, {
    params: { 
      college_id: college,
      ...(department && { department_id: department }),
      ...(year && { year: year })
    }
  })
  .then((response) => response.data)
  .catch((error) => {
    console.error("Error fetching test name drop down data:", error);
    throw error;
  });
}



export function get_Department_Report_API(page = 1, search = "", college, department, year) { 
  return axios
    .get(`${API_URL}/api/students/feedback/`, {
      params: { 
          page, 
          search, 
          college_id: college,
           ...(department ? { department_id: department } : {}),
    ...(year ? { year: year } : {})
       
      }
  }) // Call the grouped course schedule API
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching feedback details in dept report data:", error);
      throw error;
    });
}

export function get_Individual_Department_Report_API({
  page = 1,
  search = "",
  college,
  department,
  year,
  testName
}) {
  console.log("📦 get_Individual_Department_Report_API called with params:");
  console.log("➡️ page:", page);
  console.log("➡️ search:", search);
  console.log("➡️ college:", college);
  console.log("➡️ department:", department);
  console.log("➡️ year:", year);
  console.log("➡️ testName:", testName);

  return axios
    .get(`${API_URL}/api/dep-indi-reports/po/`, {
      params: {
        page,
        search,
        college_id: college,
        department_id: department,
        year,
        test_name: testName
      }
    })
    .then(res => {
      console.log("✅ API response received:");
      console.log(res.data);
      return res.data;
    })
    .catch(error => {
      console.error("❌ Error fetching feedback details in dept report data:", error);
      throw error;
    });
}


export async function update_Training_API(id, formData) {
  console.log("FormData received in API function:");
  formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
  });
  return axios.post(`${API_URL}/api/colleges/updates/Training/${id}/`, formData, {
      headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrftoken,
      },
  })
      .then((response) => response.data)
      .catch((error) => {
          console.error("Error in API request:", error);
          throw error;
      });
}

export function get_Distinct_Batches_API(collegeID) {
  return axios
    .get(
      `${API_URL}/api/candidates/batches/${collegeID}/`
    )
    .then((response) => response.data);
}


export function getcompanyTotalCount_API(collegeId) {
  return axios
    .get(`${API_URL}/api/company-test-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}


export function getcommunTotalCount_API(collegeId) {
  return axios
    .get(`${API_URL}/api/communication-test-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}
export const getCollege_logo_API_Training= (page = 1, searchTerm = "") => {
  return axios
    .get(`${API_URL}/api/colleges/list/Training/`, {
      params: { 
        page: page, 
        search: searchTerm 
      }, // Pass `searchTerm` as a query parameter
    })
    .then(response => {
      console.log("API response data in getCollege_logo_API:", response.data); // Log response data here
      return response.data;
    })
    .catch(error => {
      console.error("Error in API request:", error);
      throw error; // Rethrow the error to be caught in the useEffect
    });
};

export function get_Distinct_Batchesfrom_college_API(collegeID) {
  return axios
    .get(
      `${API_URL}/api/college/batches/${collegeID}/`
    )
    .then((response) => response.data);
}


export function getdisplay_training_API(collegeId) {
  return axios
    .get(`${API_URL}/api/assign-topics/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}
export async function update_Trainingdates_API(collegeID, formData) { 
  // Make sure to send POST request, not PATCH
  return axios.post(`${API_URL}/api/update-trainer-date/${collegeID}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',  // because you are sending FormData
    },
  });
}


export function get_skillType(question__type_id = null) {
  let url = `${API_URL}/api/skill-types/`;
  const params = new URLSearchParams();

  if (question__type_id) {
    params.append("question__type_id", question__type_id);
  }

  const finalUrl = `${url}?${params.toString()}`;

  return axios.get(finalUrl)
    .then(response => response.data)
    .catch(error => {
      console.error("❌ API Request Failed:", error);
      throw error;
    });
}

export function get_TrainerSkillType(question__type_id = null, skill_type = null) {
  const url = `${API_URL}/api/get_filtered_trainers/`;

  return axios.get(url, {
    params: {
      ...(question__type_id && { question__type_id }),
      ...(skill_type && { skill_type }),
    },
    headers: {
      "X-CSRFToken": csrftoken, // same as uploadTrainingScheduleAPI if backend requires CSRF
    },
  })
  .then(response => response.data)
  .catch(error => {
    console.error("❌ API Request Failed:", error);
    throw error;
  });
}
export function uploadTrainingScheduleAPI(formData, college_id) {
  return axios.post(`${API_URL}/api/add-training-schedule/?college_id=${college_id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-CSRFToken': csrftoken,
    },
  })
  .then(response => response)
  .catch(error => {
    console.error('Upload error:', error);
    throw error;
  });
}
export const getDepartmentsByBatchAndCollege_API = (collegeId, batchNoCSV) => {
  return axios.get(`${API_URL}/api/departments-by-batch-college/`, {
    params: {
      college_id: collegeId,
      batch_no: batchNoCSV
    }
  }).then(res => res.data);
};

export async function createBatch_API(payload) {
  const response = await fetch(`${API_URL}/api/create-batch/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update batch");
  }

  return response.json();
}
export const getRegNoRange_API = async (college_id) => {
  const res = await fetch(`${API_URL}/api/get-registration-number-range/?college_id=${college_id}`);
  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Server returned error HTML:", errorText);
    throw new Error("Server error: " + res.status);
  }

  if (!contentType || !contentType.includes("application/json")) {
    const html = await res.text();
    console.error("❌ Unexpected response:", html);
    throw new Error("Expected JSON but received HTML");
  }

  return res.json(); // Safely parse JSON
};

export const getSkillTypesByQuestionType_API = (question_type_id) => {
  return axios
    .get(`${API_URL}/api/get-skill-types/?question_type_id=${question_type_id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("❌ Error fetching skill types:", err.message);
      return [];
    });
};

export const getTrainersBySkill_API = async (skillIdsCSV) => {
  const response = await axios.get(`${API_URL}/api/get-trainers/by_skill/?skill_type=${skillIdsCSV}`);
  return response.data;
};

export function updateTrainingScheduleAPI(formData, id) {
  return axios.put(`${API_URL}/api/update-training-fields/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-CSRFToken': csrftoken,
    },
  })
  .then(response => response)
  .catch(error => {
    console.error('Upload error:', error);
    throw error;
  });
}

export function assignTopicsToTrainerAPI(training_id, batch) {
  return axios.get(`${API_URL}/api/assign-topics/`, {
    params: {
      training_id: training_id,
      batch: batch || 'all'
    }
  });
}


export function addTrainerwithskillApi(test) {
  return axios
    .post(`${API_URL}/api/add-trainer/login/`, {
      id: null,

      trainer_name: test.trainer_name,
      user_name: test.user_name,
      skill_type: test.skill_type,
      password: test.password,
     
    })
    .then((response) => response.data)
    .catch((error) => {
      // Handle error
      console.error("Error adding Test:", error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export function scheduleTestAPI({
  training_id,
  test_type_id,        // Array or single ID
  question_type_id,    // Array or single ID
  skill_type_ids,      // Array or CSV string
  start_time,
  end_time,
  test_on_training_day,
  duration_of_test,
  is_testcase,
}) {
  const params = new URLSearchParams();

  if (!training_id || !start_time || !end_time) {
    throw new Error("training_id, start_time, and end_time are required");
  }

  params.append("training_id", training_id);
  params.append("start_time", start_time);
  params.append("end_time", end_time);

  if (test_type_id) {
    const testTypeCsv = Array.isArray(test_type_id)
      ? test_type_id.join(",")
      : test_type_id;
    params.append("test_type_id", testTypeCsv);
  }

  if (question_type_id) {
    const questionTypeCsv = Array.isArray(question_type_id)
      ? question_type_id.join(",")
      : question_type_id;
    params.append("question_type_id", questionTypeCsv);
  }

  if (skill_type_ids) {
    const skillCsv = Array.isArray(skill_type_ids)
      ? skill_type_ids.join(",")
      : skill_type_ids;
    params.append("skill_type_id", skillCsv);
  }

  if (test_on_training_day) {
    params.append("schedule_day_option", test_on_training_day);
  }

  if (duration_of_test !== undefined && duration_of_test !== null) {
    params.append("duration_of_test", duration_of_test);
  }

  if (typeof is_testcase !== "undefined") {
    params.append("is_testcase", is_testcase ? "true" : "false");
  }

  const url = `${API_URL}/api/schedule_automate/?${params.toString()}`;

  console.log("Debug ➤ Scheduling test with URL:", url);

  return axios
    .get(url)
    .then((response) => response.data)
    .catch((error) => {
      console.error("❌ Error scheduling test:", error);
      throw error;
    });
}


export function getAssessmentTestTypesAPI() {
  return axios.get(`${API_URL}/api/get-assessment-test-types/`)
    .then((res) => res.data);
}
export function get_department_in_API(college_IDs) {
  console.log("college_ids endpoints....: ", college_IDs);

  const ids = Array.isArray(college_IDs) ? college_IDs : [college_IDs];

  const params = ids.reduce((acc, id) => {
    acc[`college_id`] = id;
    return acc;
  }, {});

  return axios
    .get(`${API_URL}/api/get-department-info/LMS/`, { params })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

export const createCourseFeedback = async (feedbackData) => {
  try {
    const response = await axios.post(`${API_URL}/api/create-feedback/`, feedbackData);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating feedback:", error);
    throw error;
  }
};
export const getStudentId_API = (username) => {
  return axios
    .get(`${API_URL}/api/get_student_id/`, {
      params: { user_name: username }
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error("❌ Error fetching student ID:", err.message);
      throw err;
    });
};
export async function updateStudentFeedbackApi(id, log) {
  try {
    const response = await axios.put(`${API_URL}/api/update-feedback/${id}/`, {
      feedback: log.feedback,
      remarks: log.remarks,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating login password:", error);
    throw error; // Propagate the error for higher-level handling
  }
}
export function addTrainerTrainingReportApi(log) {
  let course_schedule_id = log.course_schedule_id;
  
  // If course_schedule_id is an array, take the first element
  if (Array.isArray(course_schedule_id)) {
    course_schedule_id = course_schedule_id[0];
  }

  return axios
    .post(`${API_URL}/api/trainers_report/Training/create/`, {
      id: null,
      course_schedule_id: course_schedule_id,  // now always a number or null
      no_of_question_solved: log.no_of_question_solved,
      comments: log.comments,
      status: log.status,
      activities_done: log.activities_done,
      student_feedback: log.student_feedback,
      infrastructure_feedback: log.infrastructure_feedback,
      remarks: log.remarks,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding login:", error);
    });
}

export const getTrainingScheduleDetails_API = async (trainingId) => {
  const response = await axios.get(`${API_URL}/api/get_training_schedule/${trainingId}/`);
  return response.data;
};
export const getAssignedTopicsByTrainingId_API = async (training_id) => {
  const res = await axios.get(`${API_URL}/api/get-assigned-topics/${training_id}/`);
  return res.data;
};

export function updateTrainingScheduleSnEWAPI(formData, training_id) {
  return axios.post(`${API_URL}/api/update-training-schedule/${training_id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-CSRFToken': csrftoken,  // Include CSRF token if needed
    },
  })
  .then(response => response)
  .catch(error => {
    console.error('Update error:', error);
    throw error;
  });
}
export function getTrainingScheduleDetailsAPI(training_id) {
  return axios.get(`${API_URL}/api/get-training-schedule-details/${training_id}/`)
    .then(response => response.data)
    .catch(error => {
      console.error('❌ Error fetching training schedule:', error);
      throw error;
    });
}

export function getGroupedQuestionPapersApi() {
  return axios
    .get(`${API_URL}/api/question-paper/grouped/`)
    .then(response => response.data)
    .catch(error => {
      console.error("Failed to fetch question paper options:", error);
      throw error;
    });
}


export const getCollegeCodes = async () => {
  return axios.get(`${API_URL}/api/colleges-code/`);
};

export const questioncount = async () => {
  return axios.get(`${API_URL}/api/question-count/`);
};

// Add a new test master (Add Test)


export function addTestcandidateApiBatch_PlacementNew(test) {
  return axios.post(`${API_URL}/api/test-candidates-map/create/placement/`, {
    id: null,
    test_name: test.test_name,
    question_id: test.question_id,
    college_id: test.college_id,
    created_by:test.created_by,
    college_group_id: test.college_group_id,
    batch_no: test.batch_no,
    department_id: test.department_id,
    dtm_start: test.dtm_start,
    dtm_end: test.dtm_end,
   
    is_camera_on: test.is_camera_on,
    duration: test.duration,
    duration_type: test.duration_type,
    year: test.year,
    rules_id: test.rules_id,
    need_candidate_info: test.need_candidate_info,
    test_type_id: test.test_type_id,
    question_type_id: test.question_type_id,
    skill_type_id: test.skill_type_id,
    company_name: test.company_name,
      company_email:test.company_email,

  })
    .then(response => response.data)
    .catch(error => {

      // Handle error
      console.error('Error adding Test:', error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export const addCodingQuestionUploadApi = (payload) =>
  axios.post(`${API_URL}/api/add/codingquestionupload/`, payload);

// Get Practice Test Type ID by test_type (e.g., MCQTest, CodingTest)
export const getPracticeTestTypeId_API = async (test_type) => {
  try {
    const response = await axios.get(`${API_URL}/api/get-practice-test-id/`, {
      params: { test_type },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching PracticeTest ID:", error);
    throw error;
  }
};

export const getQuestionSkillIds_API = async (question_type, skill_type) => {
  return axios.get(`${API_URL}/api/get-question-skill-ids/`, {
    params: { question_type, skill_type }
  }).then(res => res.data);
};

export const getQuestionPaperWithTestDetails_API = async (testTypeId, questionTypeId, skillTypeId) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/get-question-paper-details/`,
      {
        params: {
          test_type_id: testTypeId,
          question_type_id: questionTypeId,
          skill_type_id: skillTypeId,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching question paper details:", err.response?.data || err.message);
    throw err;
  }
};

export const getDifficultyLevelCounts_API = async (question_paper_id) => {
  console.log("📥 Starting API call to get difficulty counts...");
  console.log("🆔 question_paper_id:", question_paper_id);
  console.log("🌍 API URL:", `${API_URL}/api/get-difficulty-counts/`);

  try {
    const response = await axios.get(`${API_URL}/api/get-difficulty-counts/`, {
      params: { question_paper_id }, // No folder_name now
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("✅ API call successful. Response:");
    console.log(response.data);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("❌ Server responded with status code:", error.response.status);
      console.error("❌ Response data:", error.response.data);
    } else if (error.request) {
      console.error("❌ Request was made but no response received:", error.request);
    } else {
      console.error("❌ Error setting up request:", error.message);
    }

    console.error("❌ Full error object:", error);
    throw error;
  }
};
export const assignQuestions_API = async (payload) => {
  try {
    console.log("🚀 API Call: assignQuestions_API");
    console.log("📦 Payload to be sent:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${API_URL}/api/assign-questions/practicetest/`, // Make sure this endpoint matches Django URL
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("✅ API Response:", response.data);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("❌ Error Response from Backend:");
      console.error("🔢 Status:", error.response.status);
      console.error("📄 Response Data:", error.response.data);
      console.error("🧾 Headers:", error.response.headers);
    } else if (error.request) {
      console.error("❌ No response received:");
      console.error("📡 Request:", error.request);
    } else {
      console.error("❌ Error setting up request:", error.message);
    }

    console.error("🧵 Full Error Object:", error);
    throw error;
  }
};



export function getTestcandidate_MCQTestId_Api(test_candidate_id) {
  return axios
    .get(`${API_URL}/api/testcandidate/mcq/testids/${test_candidate_id}/`)
    .then((response) => response.data);
}

export function getQuestionApi_Filter_IO_PracticeMCQ(test_name) {
  return axios
    .get(`${API_URL}/api/questions_io/${test_name}/filter/MCQ/practice/`)
    .then((response) => response.data);
}

export function getQuestionApi_Filter_IO_CODE_practice(test_name) {
  return axios
    .get(`${API_URL}/api/questions_io/${test_name}/filter/Code/practice/`)
    .then((response) => response.data);
}

export function incrementAttemptCount_API(data) {
  return axios
    .post(`${API_URL}/api/increment-attempt-count/`, data)
    .then((response) => {
      console.log("✅ Attempt incremented response:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("❌ Error incrementing attempt count:", error.response?.data || error.message);
    });
}

export const getQuestionGroupsByDifficulty_API = async (folderName, topic, sub_topic) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/get-question-groups-by-difficulty/`,
      {
        folder_name: folderName,
        topic: topic,
        sub_topic
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return res.data;
  } catch (err) {
    console.error("Error fetching test groups by difficulty:", err.response?.data || err.message);
    throw err;
  }
};

export function get_Skill_Ques_FolderAPI() {
  return axios
    .get(`${API_URL}/api/grouped-skill-types/folders/`)
    .then((response) => response.data);
}
// src/api/index.js or wherever you manage APIs

export function getStudentTestAttemptsAPI(studentId) {
  return axios
    .get(`${API_URL}/api/student-test-attempts/`, {
      params: { student_id: studentId },
    })
    .then((response) => response.data);
}

export function updateTestStatus_API(payload) {
  return axios
    .post(`${API_URL}/api/update-test-status/request/`, payload)
    .then((res) => res.data);
}

export function updateStuAvgMarkAPI(test_name, student_id, avg_mark) {
  return axios
    .post(`${API_URL}/api/update-stu-avg-mark/`, {
      test_name,
      student_id,
      avg_mark,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("❌ Error updating student average mark:", error);
      throw error;
    });
}

export function updateTrainerBatchesApi(data) {
  return axios.post(`${API_URL}/api/update-trainer-batches/`, data);
}
// api/testMapping.js or api/index.js
export function createTestCandidateMap(mappingPayload) {
  return axios.post(
    `${API_URL}/api/test-candidates-map/create/New/`,
    mappingPayload,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  ).then((res) => res.data);
}

export function createTestMaster(payload) {
  return axios
    .post(`${API_URL}/api/test_master/New/`, payload, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then((res) => res.data);
}

export function addQuestionUploadold(questionPayload) {
  return axios.post(
    `${API_URL}/api/add/questionupload/New/`,
    questionPayload,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  ).then((res) => res.data);
}
export const addQuestionUpload = (payload) =>
  axios.post(`${API_URL}/api/add/questionupload/New/`, payload);


export function getRequestedStudentTestNames_API() {
  return axios
    .get(`${API_URL}/api/test-candidates/requested/`)
    .then(response => response.data)
    .catch(error => {
      console.error("Failed to fetch question paper options:", error);
      throw error;
    });
}

export function reassignTestCandidate_API({ id, action }) {
  return axios.post(`${API_URL}/api/test-candidates/re-assigned/`, {
    id,
    action,
  });
}
export function EmployeeUploadAPI(formData) {
  console.log("🔄 Sending request to backend with form data:", formData);
  return axios.post(`${API_URL}/api/employees/upload/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getQuestionApi_HDFCAPI(test_name) {
  return axios
    .get(`${API_URL}/api/questions_io/${test_name}/filter/hdfc_test/`)
    .then((response) => response.data);
}
export function assignTestToEmployees(data) {
  return axios
    .post(`${API_URL}/api/assign-test-to-employees/`, data)
    .then((response) => response.data);
}

export function submitEmployeeAnswer(data) {
  return axios
    .post(`${API_URL}/api/employee/answer/create/`, data)
    .then((response) => response.data);
}

export function getEmployeeAnswers(username, testName) {
  return axios
    .get(`${API_URL}/api/employee/answers/display/`, {
      params: { username, testName }
    })
    .then((response) => response.data);
}

export function updateTestempApi_is_active(id) {
  return axios
    .patch(`${API_URL}/api/testemp/${id}/IsActive/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      //throw error;
    });
}

export function updateEmployeeTestScore(data) {
  return axios.post(`${API_URL}/api/update-employee-test-score/`, data)
    .then((res) => res.data);
}

export function getEmployeeDropdown() {
  return axios
    .get(`${API_URL}/api/employees/dropdown/`)
    .then((response) => response.data);
}
export function getLocationDropdown() {
  return axios.get(`${API_URL}/api/employees/locations/`).then((res) => res.data);
}

export function getTestAssignmentSummaryApi(page = 1, searchTerm = "") {
  return axios.get(`${API_URL}/api/test-assignment-summary/`, {
    params: { 
      page: page, 
      search: searchTerm 
    },
  }).then((response) => response.data);
}

export function createEmployeeApi(payload) {
  return axios.post(`${API_URL}/api/create-employee/`, payload)
    .then((res) => res.data);
}

export function getEmployeesApi(page = 1, search = "") {
  return axios.get(`${API_URL}/api/get/employees/`, {
    params: { page, search }
  }).then((res) => res.data);
}
export function getAttendedTestDetailsApi(testName) {
  return axios
    .get(`${API_URL}/api/test-attended-details/`, {
      params: { test_name: testName },
    })
    .then((res) => res.data);
}
export function getEmpUpcommingTest_API(username) {
  return axios
    .get(`${API_URL}/api/upcomming/mcq/emp/${username}/`)
    .then((response) => response.data);
}


export function getEmployeeByUsername(user_name) {
  return axios
    .get(`${API_URL}/api/employee/update/`, {
      params: { user_name },
    })
    .then((res) => res.data);
}
export function updateEmployeeByUsername(username, formData) {
  return axios
    .put(`${API_URL}/api/employee/update/`, formData, {
      params: { user_name: username }
    })
    .then((res) => res.data);
}

export function getFolderMaster_API() {
  return axios
    .get(`${API_URL}/api/folder/masters/`)
    .then((response) => response.data);
}

export function updateSelectedStudentsAPI(payload) {
  return axios.post(`${API_URL}/api/update-selected-students/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function getStudentsByInterviewDate(job_id) {
  return axios.get(`${API_URL}/api/eligible-students/interview-date/${job_id}/`);
}

export function removeStudentsFromRoundAPI(payload) {
  return axios.post(`${API_URL}/api/students/remove_round/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// ✅ Function to fetch Aptitude Test Names with optional filters
export function get_test_name_group_API_TotalcommunicationTest(college_id = null, department = null, year = null) {
  let url = `${API_URL}/api/test_group/commun-test/`;
  const params = new URLSearchParams();

  if (college_id) params.append("college_id", college_id);
  if (department) params.append("department", department);
  if (year) params.append("year", year);

  return axios.get(`${url}?${params.toString()}`).then(response => response.data);
}

export function get_test_name_group_API_TotalcompanyTest(college_id = null, department = null, year = null) {
  let url = `${API_URL}/api/test_group/company-test/`;
  const params = new URLSearchParams();

  if (college_id) params.append("college_id", college_id);
  if (department) params.append("department", department);
  if (year) params.append("year", year);

  return axios.get(`${url}?${params.toString()}`).then(response => response.data);
}

export function fetchFilteredTopics(trainingId, skill = '', search = '') {
  const params = new URLSearchParams();
  params.append('training_id', trainingId);
  if (skill) params.append('skill', skill);
  if (search) params.append('search', search);

  return axios.get(`${API_URL}/api/get_filtered_topics/?${params.toString()}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Fetch topics error:', error);
      throw error;
    });
}

export function updateTrainingTopicsAPI(trainingId, selectedTopics) {
  return axios.post(`${API_URL}/api/update_topics/${trainingId}/`, {
    topics: selectedTopics,
  });
}
export function addcandidateApi(trainees) {
  console.log("📤 Sending data to backend:", trainees);

  return axios
    .post(`${API_URL}/api/candidates/create/New/`, {
      id: null,
      skill_id: trainees.skill_id,
      college_id: trainees.college_id,
      students_name: trainees.students_name,
      user_name: trainees.user_name,
      registration_number: trainees.registration_number,
      gender: trainees.gender,
      text: trainees.text,
      email_id: trainees.email_id,
      mobile_number: trainees.mobile_number,
      department_id: trainees.department_id,
      year: trainees.year,
      cgpa: trainees.cgpa,
      marks_10th: trainees.marks_10th,
      marks_12th: trainees.marks_12th,
      history_of_arrears: trainees.history_of_arrears,
      standing_arrears: trainees.standing_arrears,
      number_of_offers: trainees.number_of_offers,
      it_of_offers: trainees.it_of_offers,
      core_of_offers: trainees.core_of_offers,
      batch_no: trainees.batch_no,
      password:trainees.password
    })
    .then((response) => {
      console.log("✅ Success response from backend:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("❌ Error from backend:", error?.response?.data || error.message);
      throw error;
    });
}

export function getAllTopics() {
  return axios
    .get(`${API_URL}/api/topics/`)
    .then((response) => response.data);
}



export function getFolderBySubTopicId() { //with help of this api we can find all id , please check views ,
  return axios
    .get(`${API_URL}/api/folder_master/`)
    .then((response) => response.data);
}

export function getSkillTypesByQuestionTypeId(topicId) {
  return axios.get(`${API_URL}/api/skill_types/${topicId}/`).then(res => res.data);
}

export const getTestsByTypeAndDifficulty_API = async ({
  topic,
  test_type,
  sub_topic,
  folder_name,
  is_testcase,
  time,
  student_id,difficulty_level,
}) => {
  console.log("🚀 [API CALL START] getTestsByTypeAndDifficulty_API");

  try {
    console.log("📌 Step 1: Preparing request payload...");
    const payload = {
      topic,
      test_type,
      sub_topic,
      folder_name,
      is_testcase,
      time,
      student_id,  difficulty_level, 
    };
    console.log("➡️ Request Payload:", payload);

    console.log("📌 Step 2: Sending POST request to API...");
    const res = await axios.post(
      `${API_URL}/api/get-tests-by-type-and-difficulty/`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Step 3: API responded successfully");
    console.log("📥 Full Response:", res);
    console.log("📦 Response Data:", res.data);

    console.log("🎯 [API CALL END] getTestsByTypeAndDifficulty_API");
    return res.data;
  } catch (err) {
    console.log("❌ Step 4: Error caught in API call");

    if (err.response) {
      console.error("⚠️ API Error Response Data:", err.response.data);
      console.error("⚠️ API Error Status:", err.response.status);
      console.error("⚠️ API Error Headers:", err.response.headers);
    } else if (err.request) {
      console.error("⚠️ No response received from API. Request:", err.request);
    } else {
      console.error("⚠️ Error setting up API request:", err.message);
    }

    console.log("🔴 [API CALL FAILED] getTestsByTypeAndDifficulty_API");
    throw err;
  }
};





export const getCandidateDetails_API = async () => {
  return axios.get(`${API_URL}/api/candidates/details/`);
};


// New POST API to send assign data
export const sendAssignData_API = async (data) => {
  return axios.post(`${API_URL}/api/practice/assign/`, data);
};

export function getTestcandidate_CODINGPractice_Api(id) {
  return axios
    .get(`${API_URL}/api/testcandidate/codingpractice/${id}/`)
    .then((response) => response.data);
}
export function getqstntypeTrainingApi() {
  return axios
    .get(`${API_URL}/api/questiontypes/Training/`)
    .then((response) => response.data);
}

export const sendAssignTestData_API_superadmin = async (data) => {
  return axios.post(`${API_URL}/api/practice/assign/test`,data);
};

export function deleteTrainingscheduleApi(id) {
  return axios
    .patch(`${API_URL}/api/training_shedule/delete/${id}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}
export function addfolderApi(skilltype) {
  return axios
    .post(`${API_URL}/api/folder_name/create/`, {
      folder_name: skilltype.folder_name,
      skill_type_id: skilltype.skill_type_id,
      folder_logo_upload: skilltype.folder_logo || null,
      syllabus: skilltype.syllabus || null
    })
    .then(res => res.data)
    .catch(err => {
      if (err.response?.data?.detail === "exists") {
        return { exists: true };  // ✅ custom flag
      }
      throw err;
    });
}
export function getfolderApi() {
  return axios
    .get(`${API_URL}/api/folder_name/`)
    .then((response) => response.data);
}

export function updatefolderApi(id, skilltype) {
  return axios
    .put(`${API_URL}/api/folder_name/${id}/`, {
      folder_name: skilltype.folder_name,
      skill_type_id: skilltype.skill_type_id,
      folder_logo_upload: skilltype.folder_logo || null,
      syllabus: skilltype.syllabus || null
    })
    .then(res => res.data)
    .catch(err => {
      if (err.response?.data?.detail === "exists") {
        return { exists: true };  // ✅ custom flag
      }
      throw err;
    });
}


export function deletefolderApi(id) {
  return axios
    .patch(`${API_URL}/api/folder_name/${id}/delete/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tests:", error);
      throw error;
    });
}

export function updateMultipleTestreassignemp(testName, employeeIds) {
  console.log("Sending POST request to update-emp_reassign API");
  console.log("Test Name:", testName);
  console.log("emp IDs to update:", employeeIds);

  return axios
    .post(`${API_URL}/api/update-employee_reassign/New/`, {
      test_name: testName,
      employee_ids: employeeIds, // ✅ match backend key
    })
    .then((response) => {
      console.log("API response:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Error updating test candidate status:",
        error.response?.data || error.message
      );
      throw error;
    });
}

export const requestReassign_API = (payload) => {
  return axios.post(`${API_URL}/api/request-reassign/`, payload);
};

export const getPlacementOfficersByBranch = async (college_id) => {
    const response = await axios.get(`${API_URL}/api/placement-officers/by-college/${college_id}/`);
    return response.data;
};

export const requestAssignPermission_API = async (payload) => {
  return await axios.post( `${API_URL}/api/student/request-company-test/`, payload); // <-- adjust endpoint as per backend
};

export const filterCompanyTest_API = async (student_id) => {
  return await axios.get(`${API_URL}/api/filter-company-test/`, {
    params: { student_id }  // send as query param
  });
};
export function getPracticeTestReport_API({ college_id, department, year,test_name, search, page, page_size }) {
  return axios
    .get(`${API_URL}/api/stu-practice-test-report/`, {
      params: {
        college_id,
        department,
        year,
        test_name,
        search,
        page,
        page_size
      }
    })
    .then((response) => response.data);
}
export function getDayWiseReportAPI(
  college_id = null,
  department_id = null,
  year = null,
  test_name = null,
  date = null,
  search = null,
  page = 1,
  page_size = 10,
  export_all = false
) {
  let url = `${API_URL}/api/daywise-report/`;
  const params = new URLSearchParams();

  console.log("🔹 DayWiseReport API Call Started");

  if (college_id) {
    params.append("college_id", college_id);
    console.log("✅ College ID Passed:", college_id);
  }

  if (department_id) {
    params.append("department_id", department_id);
    console.log("✅ Department ID Passed:", department_id);
  }

  if (year) {
    params.append("year", year);
    console.log("✅ Year Passed:", year);
  }

  if (test_name) {
    params.append("test_name", test_name);
    console.log("✅ Test Name Passed:", test_name);
  }

  if (date) {
    params.append("date", date);
    console.log("✅ Date Passed:", date);
  }

  if (search) {
    params.append("search", search);
    console.log("✅ Search Query Passed:", search);
  }

  params.append("page", page);
  params.append("page_size", page_size);
 if (export_all) params.append("export", "1");
  const finalUrl = `${url}?${params.toString()}`;
  console.log("🚀 Final DayWiseReport API URL:", finalUrl);

  return axios
    .get(finalUrl)
    .then((response) => {
      console.log("✅ API Response Received:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("❌ API Request Failed:", error);
      throw error;
    });
}

export function get_Report_Filter_Options(college_id = null, department_id = null, date = null) {
  const url = `${API_URL}/api/report-filters/`;

  return axios.get(url, {
    params: {
      college_id: college_id || undefined,
      department_id: department_id || undefined,
      date: date || undefined,  // 👈 will only be sent if not null/undefined
    },
  })
  .then(response => response.data)
  .catch(error => {
    console.error("❌ API Request Failed:", error);
    throw error;
  });
}
export const getFoldersBySkillType_API = (skill_type_id) => {
  return axios
    .get(`${API_URL}/api/get-folders-by-skilltype/?skill_type_id=${skill_type_id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("❌ Error fetching folders by skill type:", err.message);
      return [];
    });
};

// endpoints.js
export const addTrainingTopics_API = (training_id, folder_ids) => {
  return axios
    .post(`${API_URL}/api/add-training-topics/${training_id}/`, { folder_ids })
    .then(res => res.data)
    .catch(err => {
      console.error("❌ Error adding training topics:", err.message);
      return { success: false };
    });
};


export const updateBatchSkill_API = (training_id, batchSkillMap) => {
  return axios.patch(
    `${API_URL}/api/training-schedule/${training_id}/update-batch-skill/`,
    { batch_skill: batchSkillMap }
  );
};

export function getTrainingSchedulenewdataAPI(training_id) {
  return axios.get(`${API_URL}/api/get-training-schedule-temp-data/${training_id}/`)
    .then(response => response.data)
    .catch(error => {
      console.error('❌ Error fetching training schedule:', error);
      throw error;
    });
}

export function getDropdownFilters_API({ college_id }) {
  return axios
    .get(`${API_URL}/api/get-dropdown-filters/`, {
      params: { college_id }
    })
    .then((response) => response.data);
}

// ✅ Join selectedYears into comma-separated string: "1,2,3"
export function downloadTopicsExcel(selectedYears) {  
  const yearValues = selectedYears.map((y) => y.value);           // ["1", "2", "3"]
  const yearParam = yearValues.join(",");                         // "1,2,3"

  console.log("📤 Selected year values (joined):", yearParam);

  return axios.get(`${API_URL}/api/get-year-wise-topic-filters/`, {
    params: { year: yearParam },  // ✅ Sends ?year=1,2,3
    responseType: "blob",
  });
}

export function getFolderBySubTopicTestId() { //with help of this api we can find all id , please check views ,
  return axios
    .get(`${API_URL}/api/folder_master/Test/`)
    .then((response) => response.data);
}
export function get_test_name_group_Multiple_API(page = 1, search = "", collegeIds = []) {
  console.log("➡️ [STEP A] Entered get_test_name_group_Multiple_API");
  console.log("➡️ [STEP B] Input Params → page:", page, "search:", search, "collegeIds:", collegeIds);

  const url = `${API_URL}/api/get_group_test_name_multiple/`;
  const params = {
    page,
    search,
    college_ids: collegeIds.join(","), // pass multiple colleges
  };

  console.log("➡️ [STEP C] Final Request URL:", url);
  console.log("➡️ [STEP D] Request Params:", params);

  return axios
    .get(url, { params })
    .then((response) => {
      console.log("➡️ [STEP E] ✅ API call successful");
      console.log("➡️ [STEP F] Raw Response:", response);
      console.log("➡️ [STEP G] Response Data:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("❌ [STEP H] API call failed:", error);
      throw error; // rethrow for caller
    });
}

export function get_user_colleges_API(username) {
  return axios
    .get(`${API_URL}/api/get-user-colleges/`, {
      params: { username }, // pass as query param
    })
    .then((response) => response.data);
}

export function check_user_status_API(username) {
  return axios
    .get(`${API_URL}/api/check-user-status/`, {
      params: { username }, // query param
    })
    .then((response) => response.data);
}
export function send_otp_API(username) {
  console.log("➡️ Sending POST /api/send-otp/ with username:", username);
  return axios.post(
    `${API_URL}/api/send-otp/`,
    { username },
    { headers: { "Content-Type": "application/json" } } // important!
  )
  .then((response) => {
    console.log("📨 send-otp API response:", response.data);
    return response.data;
  })
  .catch((err) => {
    console.error("🚨 send-otp API error:", err.response?.data || err);
    throw err;
  });
}

export function verify_otp_API(username, otp) {
  return axios
    .post(`${API_URL}/api/verify-otp/`, { username, otp }) // POST with JSON body
    .then((response) => response.data);
}

export function getcontenttoolApi(
  page = 1,
  searchTerm = "",
  collegeId = null,
  questionType = "",
  skillType = ""
) {
  return axios
    .get(`${API_URL}/api/content/tool_access/`, {
      params: { 
        page: page,
        search: searchTerm,
        college_id: collegeId,      // ✅ Required
        question_type: questionType, // ✅ New param
        skill_type: skillType        // ✅ New param
      },
    })
    .then((response) => response.data);
}
// ✅ Fetch all student requests by user_name
export function getStudentRequestsByUserNameApi(user_name) {
  return axios
    .get(`${API_URL}/api/student-requests/user/${user_name}/`)
    .then((response) => response.data);
}


export const requestCompanyAssignPermission_API = async (payload) => {
  return await axios.post( `${API_URL}/api/student/request-company/`, payload); // <-- adjust endpoint as per backend
};


export function getPracticegroupTestReport_API({ college_id, department, year, search, page, page_size }) {
  return axios
    .get(`${API_URL}/api/stu-practicegroup-test-report/`, {
      params: {
        college_id,
        department,
        year,
        search,
        page,
        page_size
      }
    })
    .then((response) => response.data);
}

export function getSubTopicsByTopicIdModal(topicId) {
  return axios
    .get(`${API_URL}/api/topics/${topicId}/sub_topics/Modal/`)
    .then((response) => response.data);
}


export function getSubTopicsByTopicId(topicId) {
  return axios
    .get(`${API_URL}/api/topics/${topicId}/sub_topics/`)
    .then((response) => response.data);
}


export async function updateTestMAsterTestNameApi(test) {
  try {
    const response = await axios.put(
      `${API_URL}/api/testcandidate/update/test_master/`,
      {
        testName: test.testName,
        test_name: test.test_name,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Pass backend message to frontend
      throw new Error(error.response.data.detail || "Test name already exists");
    }
    throw error;
  }
}

export function getUserCredentials(username) { 
  return axios
    .post(`${API_URL}/api/send/email/`, { user_name: username })
    .then((response) => response.data);
}


export function getUserRoleAccess(collegeId, username) {
  return axios
    .get(`${API_URL}/api/get_user_role_access/`, {
      params: { college_id: collegeId, user_name: username },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching user role and access:", error);
      throw error;
    });
}
export function sendDailyEmailReportAPI() {
  return axios
    .get(`${API_URL}/api/capture-first-login-email/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("❌ Error sending daily email report:", error);
      throw error;
    });
}
export const startReassignedExamApi = async (examData) => {
  try {
    const response = await fetch(`${API_URL}api/start-reassigned-exam/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in startReassignedExamApi:', error);
    throw error;
  }
};

export function ReassignTestCandidatesRefresh(testName, studentIds) {
  console.log("Sending POST request to update-multiple-test-status API");
  console.log("Test Name:", testName);
  console.log("Student IDs to update:", studentIds);

  // ✅ Always send as array
  const payload = {
    test_name: testName,
    student_ids: Array.isArray(studentIds) ? studentIds : [studentIds],
  };

  return axios
    .post(`${API_URL}/api/reassign-test-status/refresh/`, payload)
    .then((response) => {
      console.log("API response:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Error updating test candidate status:",
        error.response?.data || error.message
      );
      throw error;
    });
}
export function updateMoveTabCountApi(data) {
  return axios
    .put(`${API_URL}/api/update_movetab_test/`, data)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating tab move count:", error);
      throw error;
    });
}

export function runNodeApi(code) {
  return axios
    .post(`${API_URL}/api/run-node/`, { code })
    .then((response) => response.data);
}

// Call run-springboot endpoint with POST request and send code
export function runSpringbootApi(code) {
  return axios
    .post(`${API_URL}/api/run-springboot/`, { code })
    .then((response) => response.data);
}
// Call MATLAB compiler endpoint
export function runMatlabApi(code, customInput = "") {
  return axios
    .post(`${API_URL}/api/matlab-compiler/`, { code, inputs: customInput })
    .then((response) => response.data);
}

// Call VLSI compiler endpoint
export function runVlsiApi(code) {
  return axios
    .post(`${API_URL}/api/vlsi-compiler/`, { code })
    .then((response) => response.data);
}

export function runcsharpApi(code) {
  return axios
    .post(`${API_URL}/api/run-csharp/`, { code })
    .then((response) => response.data);
}

export function runphpApi(code) {
  return axios
    .post(`${API_URL}/api/run-php/`, { code })
    .then((response) => response.data);
}

export function updateTotalAndAvgMarksApi(test_name, student_id) {
  console.log("🟡 [updateTotalAndAvgMarksApi] Called...");
  console.log("📨 API Endpoint:", `${API_URL}/api/update-total-avg-marks/`);
  console.log("📦 Request Payload:", { test_name, student_id });

  return axios
    .post(`${API_URL}/api/update-total-avg-marks/`, { test_name, student_id })
    .then((response) => {
      console.log("✅ [updateTotalAndAvgMarksApi] Response Status:", response.status);
      console.log("✅ [updateTotalAndAvgMarksApi] Response Data:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("❌ [updateTotalAndAvgMarksApi] Error updating total and avg marks:", error);

      if (error.response) {
        console.error("🔺 Response Status:", error.response.status);
        console.error("🔺 Response Data:", error.response.data);
        console.error("🔺 Response Headers:", error.response.headers);
      } else if (error.request) {
        console.error("⚠️ No response received. Request details:", error.request);
      } else {
        console.error("🚨 Request setup error:", error.message);
      }

      console.log("❗ [updateTotalAndAvgMarksApi] Full Error Object:", error);
      throw error;
    });
}



export function updateTotalAndAvgMarksdeleteanswerApi(test_name, student_id) {
  return axios
    .post(`${API_URL}/api/update-total-avg-marks-delete-answer/`, { test_name, student_id })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating total and avg marks:", error);
      throw error;
    });
}



export function runmysqlApi(code) {
  return axios
    .post(`${API_URL}/api/run-mysql/`, { code })
    .then((response) => response.data)
    .catch((error) => {
      console.error("MySQL API Error:", error);
      return { output: "Error running SQL query." };
    });
}
// monu
export function runJQueryApi(code) {
  return axios
    .post(`${API_URL}/api/run-jquery/`, { code })
    .then((res) => res.data)
    .catch((err) => {
      console.error("runJQueryApi error", err);
      return { output: "", error: err.message || "Error running jQuery code." };
    });
}

export function getActiveAudioTestsApi(user_name) {
  return axios
    .get(`${API_URL}/api/active-audio-tests/`, {
      params: { username: user_name }, // send as query param
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching active audio tests:", error);
      throw error;
    });
}


export function getActiveTestsDetailsApi(test_name,user_name) {
  return axios
    .get(`${API_URL}/api/audio-test-details/`, {
      params: { test_name: test_name, username: user_name }, // send as query param
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching active audio tests:", error);
      throw error;
    });
}


export function uploadCommunicationTestApi(formData) {
  return axios
    .post(`${API_URL}/api/upload-communication-questions/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("❌ Error uploading communication test:", error);
      throw error;
    });
}


export function downloadTemplateApi() {
  return axios
    .get(`${API_URL}/api/download-template/`, {
      responseType: "blob", // Important for file download
    })
    .then((response) => {
      // Create blob URL for download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "communication_test_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return response.data;
    })
    .catch((error) => {
      console.error("❌ Error downloading template:", error);
      throw error;
    });
}

export function addOrUpdateResultApi(log) {
  return axios
    .post(`${API_URL}/api/add_or_update_result/`, {
      student_id: log.student_id,
      test_name: log.test_name,
      question_id: log.question_id,
      answer: log.answer,
      dtm_start: log.dtm_start,
      dtm_end: log.dtm_end,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error saving or updating result:", error);
      throw error;
    });
}
// Fetch only Audio-related test types
export function getAudioTestTypesApi() {
  return axios
    .get(`${API_URL}/api/audio-test-types/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("❌ Error fetching audio tests:", error);
      throw error;
    });
}


export function addTestcandidateApiBatchAudio(test) {
  return axios.post(`${API_URL}/api/test-candidates-map/create/Audio/`, {
    id: null,
    test_name: test.test_name,
    question_id: test.question_id,
    created_by:test.created_by,
    question_ids:test.question_ids,
    college_id: test.college_id,
    batch_no: test.batch_no,
    department_id: test.department_id,
    dtm_start: test.dtm_start,
    dtm_end: test.dtm_end,
   
    is_camera_on: test.is_camera_on,
    duration: test.duration,
    duration_type: test.duration_type,
    year: test.year,
    rules_id: test.rules_id,
    need_candidate_info: test.need_candidate_info,
    test_type_id: test.test_type_id,
    question_type_id: test.question_type_id,
    skill_type_id: test.skill_type_id,
    company_name: test.company_name,
      company_email:test.company_email,

  })
    .then(response => response.data)
    .catch(error => {

      // Handle error
      console.error('Error adding Test:', error);
      //throw error;// Rethrow the error to propagate it further if needed
    });
}

export async function updateQuestionPaperApi(id, content) {
  // Log the request payload to ensure the data being sent is correct
  console.log("Request payload to update question paper:", {
    question_paper_name: content.question_paper_name,
    duration_of_test: content.duration_of_test,
    sub_topic: content.sub_topic,
    folder_name: content.folder_name,
    topic: content.topic,
    remarks: content.remarks,
    audio_text: content.audio_text  
  });

  return axios
    .put(`${API_URL}/api/update-question-paperss/${id}/`, {
      question_paper_name: content.question_paper_name,
      duration_of_test: content.duration_of_test,
      sub_topic: content.sub_topic,
      folder_name: content.folder_name,
      topic: content.topic,
      remarks: content.remarks,audio_text: content.audio_text 
    })
    .then((response) => response.data)
    .catch((error) => {
      // Log error if the API request fails
      console.error("Error in updating question paper:", error);
      throw error;  // Rethrow so it can be handled in the calling function
    });
}

export function translateTextApi(payload) {

  return axios.post(`${API_URL}/api/translate/`, payload);
}
export const translateVoiceApi = (data) =>
  axios.post(`${API_URL}/api/translate-voice/`, data, {
    responseType: "blob",
  });

export function getSkillTypeByTestNameApi(test_name) {
  return axios
    .post(`${API_URL}/api/get-skill-type-by-test/`, {
      test_name: test_name,
    })
    .then((response) => response.data);
}

export function logSkillTypeQuestionApi(skill_type, question_text) {
  return axios.post(`${API_URL}/api/log-skilltype-question/`, {
    skill_type,
    question_text,
  });
}

export function getlisteningCount_API(collegeId) {
  return axios
    .get(`${API_URL}/api/Listening-test-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}

export function getReadingCount_API(collegeId) {
  return axios
    .get(`${API_URL}/api/reading-test-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}
export function getSpeakingCount_API(collegeId) {
  return axios
    .get(`${API_URL}/api/speaking-test-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}
export function getWritingCount_API(collegeId) {
  return axios
    .get(`${API_URL}/api/writing-test-count/`, {
      params: { college_id: collegeId },
    })
    .then((response) => response.data);
}
export function getAvgListening_cc_API(collegeId, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/avg-score/listening/`, {
      params: { college_id: collegeId, dtm_start: formattedDate },
    })
    .then((response) => response.data);
}
export function getAvgSpeaking_cc_API(collegeId, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/avg-score/speaking/`, {
      params: { college_id: collegeId, dtm_start: formattedDate },
    })
    .then((response) => response.data);
}
export function getAvgReading_cc_API(collegeId, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/avg-score/reading/`, {
      params: { college_id: collegeId, dtm_start: formattedDate },
    })
    .then((response) => response.data);
}
export function getAvgWriting_cc_API(collegeId, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/avg-score/writing/`, {
      params: { college_id: collegeId, dtm_start: formattedDate },
    })
    .then((response) => response.data);
}

export function getClgTopper_all_CC_API(collegeId, test_type, test_type_categories) {

  console.log("📦 getClgTopper_all_CC_API CALLED");
  console.log("➡️ collegeId:", collegeId);
  console.log("➡️ test_type:", test_type);
  console.log("➡️ test_type_categories:", test_type_categories);

  const params = {
    college_id: collegeId,
    test_type: test_type,
    ...(test_type_categories ? { test_type_categories } : {})
  };

  console.log("📤 FINAL PARAMS SENT TO BACKEND:", params);

  return axios
    .get(`${API_URL}/api/clg-topper-all/cc/`, { params })
    .then((res) => {
      console.log("✅ BACKEND RESPONSE STATUS:", res.status);
      console.log("✅ BACKEND RESPONSE DATA:", res.data);

      if (!Array.isArray(res.data)) {
        console.warn("⚠️ Response is NOT an array:", res.data);
      } else {
        console.log("📊 Response length:", res.data.length);
      }

      return res.data;
    })
    .catch((error) => {
      console.error("❌ API ERROR OCCURRED");

      if (error.response) {
        console.error("❌ ERROR STATUS:", error.response.status);
        console.error("❌ ERROR DATA:", error.response.data);
      } else if (error.request) {
        console.error("❌ NO RESPONSE RECEIVED:", error.request);
      } else {
        console.error("❌ AXIOS ERROR MESSAGE:", error.message);
      }

      throw error;
    });
}

export function Stu_listen_test_API(userName) {
  return axios
    .get(`${API_URL}/api/liten-test-count/stu/`, {
      params: { username: userName},
    })
    .then((response) => response.data);
}


export function Stu_speak_test_API(userName) {
  return axios
    .get(`${API_URL}/api/speak-test-count/stu/`, {
      params: { username: userName },
    })
    .then((response) => response.data);
}


export function Stu_read_test_API(userName) {
  return axios
    .get(`${API_URL}/api/reading-test-count/stu/`, {
      params: { username: userName },
    })
    .then((response) => response.data);
}


export function Stu_write_test_API(userName) {
  return axios
    .get(`${API_URL}/api/writing-test-count/stu/`, {
      params: { username: userName },
    })
    .then((response) => response.data);
}
export function Stu_Communicationall_Reports_API(userName, cat, dtmStart) {
  const formattedDate = format(dtmStart, "yyyy-MM-dd");
  return axios
    .get(`${API_URL}/api/get_student_skill_percentage/`, {
      params: {
        username: userName,
        categories: cat,
        start_date: formattedDate,
      },
    })
    .then((response) => response.data);
}

export function Communication_student_test_summary_API(studentName) {
  return axios
    .get(`${API_URL}/api/student-test-summary/commun/`, {
      params: { student_name: studentName },
    })
    .then((response) => response.data);
}
export function logAudioTestStartApi(payload) {
  return axios.post(`${API_URL}/api/log-audio-test-start/`, payload);
}

// endpoints.js
export const exportAudioExcelReport = (payload) => {
  return axios.get(`${API_URL}/api/reports/audio/excel/`, {
    params: payload,       // send payload as query parameters
    responseType: 'blob',  // required for file download
  });
};
export function get_Departmentaudio_Report_API(page = 1, search = "", college, department, year) { 
  return axios
    .get(`${API_URL}/api/department-repo/feedback/`, {
      params: { 
          page, 
          search, 
          college_id: college,
           ...(department ? { department_id: department } : {}),
    ...(year ? { year: year } : {})
       
      }
  }) // Call the grouped course schedule API
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching feedback details in dept report data:", error);
      throw error;
    });
}
export function getAudioCategoryQuestionsApi(categoryName, communication_category) {
  return axios
    .get(
      `${API_URL}/api/audio-category-questions/${encodeURIComponent(categoryName)}/`,
      {
        params: {
          communication_category: communication_category, // ✅ ADD
        },
      }
    )
    .then((response) => response.data);
}