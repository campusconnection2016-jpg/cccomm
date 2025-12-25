//PlacementOfficer.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Sidebar from './placementofficer/sidebar.js'
import Dashboard from './placementofficer/dashboard/dashboard.js'
import { SearchProvider } from './allsearch/searchcontext.js';
import Settings from './placementofficer/database/settings.js';
import Testaccess from './placementofficer/test/testaccess.js'
import './app.css';
import TotalAptitudeTest from './components/dashboard/totalaptitudetest.js';
import TotalTechnicalTest from './components/dashboard/totaltechnicaltest.js';

import { ContextProvider } from './placementofficer/test/context/testtypecontext.js';
import MCQForm from './components/questions/mcqform.js';
import QuesPaperTb from './components/questions/quespapertb.js';
import Update_MCQForm from './components/questions/update_mcqform.js';
import QuestionPaperMCQ from './components/questions/questionpapermcq.js';
import QuestionPaperCode from './components/questions/questionpapercode.js';
import Update_CodeForm from './components/questions/update_codeform.js';
import TestReport from './components/reports/testreport.js';
import UpdateTestAccessForm from './components/test/updatetest.js';
import NonDatabaseForm from './placementofficer/test/nondatabaseform.js';
import TestResult from './components/reports/testresult.js';
import TestReports from './components/reports/testreportold.js';
import TestSchedules from './components/test/testschedules.js';
import AddDBCandidates from './placementofficer/test/addcandidates/adddbcandidates.js';

import FilterCandidatesDownload from './placementofficer/database/filterdb.js';
import Header from './header/header.js';
import { CssBaseline } from '@mui/material';
import ThemeContextProvider from './themecontext.js';
import LMSMap from './components/lms/maplms.js';
import ViewLms from './components/lms/viewlms.js';
//import Lms from './PlacementOfficer/LMS/LearningMaterial'
import LearningMaterial from './placementofficer/lms/learningmaterial.js'
import Uploadjoboffers from './placementofficer/database/uploadjoboffer.js';
import StudentsFeedback from './components/lms/studensfeedback.js';
import TrainerFeedback from './components/lms/trainerfeedback.js';
import StudentList from './placementofficer/database/studentslist.js';
import Uploadstudentdata from './placementofficer/database/uploadtable.js';
import EligibleStudents from './placementofficer/database/eligiblestudents.js';
import LoginCreate from './placementofficer/database/logincreate.js';
import PlacementReport from './placementofficer/reports/placementreport.js';
import UploadStudentProfile from './placementofficer/database/uploadstudent.js';
import MCQForms from './placementofficer/test/mcqquestions.js';
import CodeForms from './placementofficer/test/codingquestions.js';
import PAnnouncement from './placementofficer/announcement/announcement.js';
import StudentResults from './placementofficer/reports/studentresults.js';
import AddQuestionsCode from './components/questions/addquestionscode.js';
import AddQuestions from './components/questions/addquestions.js';
import QuestionPaper from './components/questions/updatequestionpaper.js';
import DepartmentReport from './placementofficer/reports/departmentreport.js';
import Communication from './placementofficer/reports/communicationreport.js';
//import OverallReport from './placementofficer/reports/overallreport.js';
import JobUpdatePage from './placementofficer/database/jobupdatepage.js';
import JobUpdateTable from './placementofficer/database/jobupdatetable.js';
import CumulativeReport from './components/reports/cumulativereport.js';
import AddTestQuestion from './placementofficer/test/addtestquestion.js';
import GrowthReport from './components/reports/growthreport.js';
import { TestQuesProvider } from './placementofficer/test/context/testquescontext.js';
import TestaccessFormAddTest from './placementofficer/test/testaccessformaddtest.js';
import Request from './components/dashboard/request.js';
import TotalCommuncationTest from './components/dashboard/totalcommunication.js';
import TotalCompanyTest from './components/dashboard/totalcompanytest.js';
import TestResultNew from './components/dashboard/testresult.js';
import Testcandidates from './components/dashboard/testcandidates.js';
import AddCodingQuestion from './components/test/addcodingquestion.js';
import AddTestPage from './components/test/addtestpage.js';
import PracticeTable from './components/test/practicetable.js';
import Demo from './components/test/practicequestion.js';
import DayWiseReport from './components/reports/daywisereport.js';
import PracticeTestReport from './components/reports/PracticeTestReport.js';
import PracticeView from './components/reports/practiceviews.js';
import AudioAccess from './components/audiotest/audioaccess.js';
import AudioTestAssign from './components/audiotest/poaudioassigntest.js';

const PlacementOfficer = ({ collegeName, username, institute, userRole }) => {
  const [theme, setTheme] = useState('black');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='App-header' style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Router>
        <div className={`app ${theme}`}>
          <SearchProvider>

            <div className='content-wrapper'>
              <ContextProvider >
                <ThemeContextProvider>
                  <CssBaseline />
                  <Header theme={theme} toggleTheme={toggleTheme} username={username} collegeName={collegeName} institute={institute} userRole={userRole} />
                  <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} username={username} collegeName={collegeName} institute={institute} userRole={userRole} />
                  <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`} style={{ marginTop: '60px' }}>
                    <TestQuesProvider>
                      <Routes>
                        <Route path="/" element={<Dashboard username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        {/*}  <Route path="/lms/upload-video" element={<LearningMaterial />} />*/}

                        <Route path="/question/mcq" element={<QuestionPaperMCQ username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/question/code" element={<QuestionPaperCode username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />

                        <Route path="/question" element={<MCQForm username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/question-paper-table" element={<QuesPaperTb username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/update-mcq-form/:id" element={<Update_MCQForm username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/update-code-form/:id" element={<Update_CodeForm username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />

                        <Route path="/lms/" element={<LearningMaterial username={username} collegeName={collegeName} institute={institute} />} />
                        <Route path="/lms/table/" element={<ViewLms />} />
                        <Route path="/stufeedback/" element={<StudentsFeedback />} />
                        <Route path="/Trainerfeedback/" element={<TrainerFeedback />} />

                        <Route path="/test-report/:test_name/:college_id/" element={<TestReport username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/test-result/:test_name/:college_id/" element={<TestResult username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        {/*}  <Route path="/lms/content-map" element={<ContentMap />} />  */}
                        <Route path="/test-result/placement/" element={<StudentResults username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/announce/" element={<PAnnouncement collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/reports/test-report" element={<TestReports username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/reports/dep-report" element={<DepartmentReport username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/reports/placement-report" element={<Communication username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />

                        <Route path="/add-candidate/:test_name/:college_id/" element={<AddDBCandidates username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        {/*} <Route path="/add/non-db-candidate" element={<AddNonDBCandidates username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />*/}
                        <Route path='/eligible-student/:job_id' element={<StudentList />} />
                        <Route path='/students/eligible-student/:job_id/:round_of_interview' element={<EligibleStudents />} />

                        <Route path="/mcq-form/:id" element={<MCQForms />} />
                        <Route path="/code-form/:id" element={<CodeForms />} />
                        <Route path="/add-questions/code/:id" element={<AddQuestionsCode />} />
                        <Route path="/add-questions/:id" element={<AddQuestions />} />
                        <Route path="/update-paper/:id" element={<QuestionPaper />} />

                        <Route path="/database/upload-offer" element={<Uploadjoboffers username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/database/upload-student" element={<UploadStudentProfile username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />

                        <Route path='/test/test-access' element={<Testaccess username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path='/add/test/question' element={<AddTestQuestion username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/test-access/non-db/" element={<NonDatabaseForm username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/test/test-schedules/" element={<TestSchedules username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                                <Route path="/test-result-new/:test_name/:collegeId/" element={<TestResultNew />}institute={institute} userRole={userRole} collegeName={collegeName} />

                        <Route path="/update-job/:id" element={<JobUpdatePage username={username} collegeName={collegeName} institute={institute} />} />
                        <Route path="/update-test/:test_name" element={<UpdateTestAccessForm username={username} collegeName={collegeName} institute={institute} />} />
                        <Route path="/database/settings" element={<Settings username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/database/login" element={<LoginCreate username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/database/filterdb" element={<FilterCandidatesDownload username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />

                        <Route path="/jobofertable" element={<Uploadstudentdata institute={institute} userRole={userRole} collegeName={collegeName} />} />

                        <Route path="/job-update" element={<JobUpdateTable institute={institute} userRole={userRole} collegeName={collegeName} />} />

                        <Route path="/uploadstudentdata" element={<Uploadjoboffers institute={institute} userRole={userRole} collegeName={collegeName} />} />

                        <Route path="/testaccess" element={<Testaccess institute={institute} userRole={userRole} collegeName={collegeName} />} />
                        <Route path="/cumulative/test/report" element={<CumulativeReport institute={institute} userRole={userRole} collegeName={collegeName} username={username} />} />
                        <Route path="/total-aptitude-test-report/:collegeId" element={<TotalAptitudeTest />} />
                        <Route path="/total-technical-test-report/:collegeId" element={<TotalTechnicalTest />} />

                        <Route path="/growth/test/report" element={<GrowthReport institute={institute} userRole={userRole} collegeName={collegeName} username={username} />} />
                        <Route path='/total-request/:collegeId' element={<Request username={username} collegeName={collegeName} userRole={userRole} institute={institute} ></Request>}> </Route>
                     
                        <Route path="/test/add-test/test-form/" element={<TestaccessFormAddTest username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
  <Route path="/total-commun-test-report/:collegeId" element={<TotalCommuncationTest />} />
                        <Route path="/total-company-test-report/:collegeId" element={<TotalCompanyTest />} />
       <Route path="/test_candidates/:test_name/:collegeId/" element={<Testcandidates  collegeName={collegeName} institute={institute} userRole={userRole}/>} />
                 <Route path="/add-test" element={<AddTestPage username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
               
                 <Route  path="/practice-question" element={<Demo key="practice"/>}/>
                         <Route path="/practice-question-paper" element={<Demo key="practice-paper" userRole={userRole}/>}/>
      <Route path= "/practice/stu/report" element={<PracticeTestReport  collegeName={collegeName} institute={institute} userRole={userRole} username={username}/>} />
                            <Route path= "/practice/stuview/report" element={<PracticeView  collegeName={collegeName} institute={institute} userRole={userRole} username={username}/>} />
                  <Route path="/daywise/test/report" element={<DayWiseReport username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
<Route path="/test/audio/assign/" element={<AudioAccess username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} /> 
<Route
  path="/test/audio/assign-form/"
  element={
    <AudioTestAssign
     username={username} collegeName={collegeName} institute={institute} userRole={userRole}
    />
  }
/>
                        <Route path="/add_coding_question" element={<AddCodingQuestion/>}/>
                        {/*}  <Route path="index.html" element={<Navigate to="/" />} />   */}
                      </Routes>
                    </TestQuesProvider>
                  </div>

                </ThemeContextProvider>
              </ContextProvider>
            </div>
          </SearchProvider>
        </div>
      </Router>
    </div>
  );
};

export default PlacementOfficer;
