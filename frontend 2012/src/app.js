// App.js
import InvoiceTB from './components/invoice/invoice.js'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Sidebar from './components/sidebar.js'
import Dashboard from './components/dashboard/dashboard.js';
import JobUpdatePage from './placementofficer/database/jobupdatepage.js';
import CumulativeReport from './components/reports/cumulativereport.js';
//import LearningMaterial from './components/lms/learningmaterial.js';
import { SearchProvider } from './allsearch/searchcontext.js';
import UploadStudentProfile from './components/database/uploadstudent.js';
import Settings from './components/database/settings.js';
import Testaccess from './components/test/testaccess.js'
import './app.css'
//import Lmsvideo from './components/LMS/Lmsvideo';
import LoginCreate from './components/database/logincreate.js';
import Footer from './footer/footer.js';
import TrainingTest from './components/database/trainingtest.js';
import { ContextProvider } from './components/test/context/testtypecontext.js';
import MCQForm from './components/questions/mcqform.js';
import QuesPaperTb from './components/questions/quespapertb.js';
import Update_MCQForm from './components/questions/update_mcqform.js';
import QuestionPaperMCQ from './components/questions/questionpapermcq.js';
import QuestionPaperCode from './components/questions/questionpapercode.js';
import Update_CodeForm from './components/questions/update_codeform.js';
import TestReport from './components/reports/testreport.js';
import UpdateTestAccessForm from './components/test/updatetest.js';
import NonDatabaseForm from './components/test/nondatabaseform.js';
import TestResult from './components/reports/testresult.js';
import TestResultNew from './components/dashboard/testresult.js';
import TestReports from './components/reports/testreportold.js';
import TestSchedules from './components/test/testschedules.js';
import AddDBCandidates from './components/test/addcandidates/adddbcandidates.js';

import Lms from './components/lms/lms.js';
import UpdateLogin from './components/database/updatelogin.js'
import Header from './header/header.js';
import { CssBaseline } from '@mui/material';
import ThemeContextProvider from './themecontext.js';
import LMSMap from './components/lms/maplms.js';
import ViewLms from './components/lms/viewlms.js';
import BinaryToImage from './components/questions/binarytoimage.js';
import TrainerList from './components/database/trainerlist.js';
import StudentsFeedback from './components/lms/studensfeedback.js';
import TrainerFeedback from './components/lms/trainerfeedback.js';
import CCAnnouncement from './components/announcement/announcement.js';
import StudentResults from './components/reports/studentresults.js';
import AddQuestions from './components/questions/addquestions.js';
import AddQuestionsCode from './components/questions/addquestionscode.js';
import QuestionPaper from './components/questions/updatequestionpaper.js';
import Uploadjoboffers from './components/jobpost/joboffer.js';
import AnnounceTable from './components/announcement/announcetable.js';
import TopStudents from './components/reports/topstudents.js'
import UpdateInvoice from './components/invoice/updateinvoice.js';
import TrainerView from './components/database/trainerviews.js';
import TotalAptitudeTest from './components/dashboard/totalaptitudetest.js';
import TotalTechnicalTest from './components/dashboard/totaltechnicaltest.js';
import StudentList from './components/lms/studentcount.js';
import Uploadstudentdata from './components/database/uploadtable.js';
import DataTable from './components/database/databasetable.js';
import ViewMapLms from './components/lms/maplmstable.js';
import GrowthReport from './components/reports/growthreport.js';
import { TestQuesProvider } from './placementofficer/test/context/testquescontext.js';
import Request from './components/dashboard/request.js';
import LMSAccess from './components/lms/lmsaccess.js';
import TestaccessFormAddTest from './components/test/testaccessformaddtest.js';
import UpdateTraining from './components/database/updatetraining.js';
import Updateschedule from './components/database/updateschedule.js';
import Demo from './components/test/practicequestion';
import AddTestPage from './components/test/addtestpage';
import AddCodingQuestion from './components/test/addcodingquestion';
import EmployeeUpload from './hdfc/database/employeeupload.js';
import HdfcTestSchedules from './components/reports/hdfc/hdfcshedule.js';
import TestAttendedTable from './components/reports/hdfc/employeescore.js';
import EmployeeTable from './hdfc/database/employeetable.js';
import QuestionPaperMCQTest from './components/questions/questionpapermcqtest.js';
import QuestionPaperCodeTest from './components/questions/questionpapercodetest.js';
import TrainingScheduleForm from './components/database/trainingschedule.js';
import TotalCommuncationTest from './components/dashboard/totalcommunication.js';
import TotalCompanyTest from './components/dashboard/totalcompanytest.js';
import Testcandidates from './components/dashboard/testcandidates.js';
import PracticeTestReport from './components/reports/PracticeTestReport.js';
import DayWiseReport from './components/reports/daywisereport.js';
import PracticeView from './components/reports/practiceviews.js';
import UploadCommunicationTest from './components/questions/UploadCommunicationTest.js';
import AudioAccess from './components/audiotest/audioaccess.js';
import AudioTestAssign from './components/audiotest/audioassigntest.js';

const App = ({ collegeName, username, userRole, institute }) => {
  const [theme, setTheme] = useState('black');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  //  const [selectedFolder, setSelectedFolder] = useState(null);

  // const [questionPaperPass, setQuestionPaperPass] = useState(null);
  //  const [questionIdPass, setQuestionsIdPass] = useState(null);


  return (
    <div className='App-header' style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Router>
        <div className={`app ${theme}`}>
          <SearchProvider>

            <div className='content-wrapper'>
              <ContextProvider >
                <ThemeContextProvider>
                  <CssBaseline />
                  <Header theme={theme} toggleTheme={toggleTheme} username={username} userRole={userRole} institute={institute} />
                  <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} username={username} userRole={userRole} />
                 <div
                    className={`main-content ${isSidebarOpen ? "shifted" : ""}`}
                    style={{ marginTop: "60px" }}
                  >                    <TestQuesProvider>
                      <Routes>
                        <Route path="/" element={<Dashboard userRole={userRole} username={username} />} />
                       {/*} <Route path="/lms/upload-video" element={<LearningMaterial />} />*/}
                       <Route path="/lms/upload-video" element={<LMSAccess />} />
                        <Route path="/lms/" element={<Lms />} />
                        <Route path="/lms/map/" element={<LMSMap />} />
                        <Route path='/lms/table/' element={<ViewMapLms />} />
                        <Route path="/lms/table/count/" element={<ViewLms />} />
                        <Route path="/invoice/" element={<InvoiceTB />} />
                        <Route path="/update-job/:id" element={<JobUpdatePage username={username} collegeName={collegeName} institute={institute} />} />

                        <Route path="/question/mcq" element={<QuestionPaperMCQ username={username} collegeName={collegeName} userRole={userRole} institute={institute} />} />
                        <Route path="/question/code" element={<QuestionPaperCode username={username} collegeName={collegeName} userRole={userRole} institute={institute} />} />
                        <Route path="/update_users/:user_name" element={<UpdateLogin username={username} collegeName={collegeName} userRole={userRole} institute={institute}/>} />

                        <Route path="/question" element={<MCQForm />} />
                        <Route path="/question-paper-table" element={<QuesPaperTb username={username} collegeName={collegeName} userRole={userRole} institute={institute} />} />
                        <Route path="/update-mcq-form/:id" element={<Update_MCQForm />} />
                        <Route path="/update-code-form/:id" element={<Update_CodeForm />} />
                        <Route path="/add-questions/:id" element={<AddQuestions />} />
                        <Route path="/add-questions/code/:id" element={<AddQuestionsCode />} />
                        <Route path="/update-paper/:id" element={<QuestionPaper />} />

                        <Route path="/test-report/:test_name/:college_id/" element={<TestReport institute={institute} userRole={userRole} collegeName={collegeName}  />} />
                        <Route path="/test-result/:test_name/:college_id/" element={<TestResult />} />
                          <Route path="/test-result-new/:test_name/:collegeId/" element={<TestResultNew />}institute={institute} userRole={userRole} collegeName={collegeName} />
                        {/*}  <Route path="/lms/content-map" element={<ContentMap />} />  */}

                        <Route path="/jobofertable" element={<Uploadstudentdata institute={institute} userRole={userRole} collegeName={collegeName} />} />

                        <Route path="/reports" element={<TestReports   collegeName={collegeName} institute={institute} userRole={userRole} username={username}/>} />
                        <Route path="/job" element={<Uploadjoboffers />} />

                        <Route path="/add-candidate/:test_name/:college_id/" element={<AddDBCandidates username={username} />} />
                        {/*}  <Route path="/add/non-db-candidate" element={<AddNonDBCandidates />} />*/}


                        <Route path="/testaccess" element={<Testaccess username={username} userRole={userRole} />} />
                        <Route path="/database/upload-student" element={<UploadStudentProfile username={username} userRole={userRole}/>} />
                        <Route path="/upload-student-data" element={<Uploadstudentdata username={username} userRole={userRole}/>} />
                        <Route path="/data-table" element={<DataTable />} />

                        <Route path="test/audio/" element={<Testaccess username={username} userRole={userRole} />} />
                        <Route path="/test/test-access" element={<Testaccess username={username} userRole={userRole} />} />
                        <Route path="/test-access/non-db/" element={<NonDatabaseForm username={username} />} />
                        <Route path="/test/test-schedules/" element={<TestSchedules username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/testschedule/" element={<TestSchedules username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
                        <Route path="/test/test-schedules/add/" element={<TestSchedules  collegeName={collegeName} institute={institute} userRole={userRole} username={username} />} />

                        <Route path="/update-test/:test_name" element={<UpdateTestAccessForm username={username} />} />
                        <Route path="/database/settings" element={<Settings />} />
                        <Route path="/database/login" element={<LoginCreate username={username} collegeName={collegeName} userRole={userRole} institute={institute} />} />

                        <Route path="/stufeedback/" element={<StudentsFeedback />} />
                        <Route path="/Trainerfeedback/" element={<TrainerFeedback />} />

                        <Route path="/database/upload-trainer" element={<TrainerList />} />
                        <Route path="/test-result/cc/" element={<StudentResults />} />
                        <Route path="/test-result/top/" element={<TopStudents />} />
                        <Route path="/update-invoice/:invoice_no" element={<UpdateInvoice username={username} />} />

                        <Route path="/announce/" element={<CCAnnouncement />} />
                        <Route path="/binary/to/image" element={<BinaryToImage />} />
                        {/*}  <Route path="index.html" element={<Navigate to="/" />} />   */}
                        <Route path="/announce/table/" element={<AnnounceTable />} />
                        <Route path="/trainer-details/:trainerid" element={<TrainerView username={username} />} />

                        <Route path="/total-aptitude-test-report/:collegeId" element={<TotalAptitudeTest />} />
                        <Route path="/total-technical-test-report/:collegeId" element={<TotalTechnicalTest />} />
                       <Route path='/total-request/:collegeId' element={<Request username={username} collegeName={collegeName} userRole={userRole} institute={institute} ></Request>}> </Route>
                        <Route path="/student-feedback" element={<StudentList />} />
                        <Route path="/cumulative/test/report" element={<CumulativeReport username={username} userRole={userRole} />} />
                        <Route path="/growth/test/report" element={<GrowthReport username={username} userRole={userRole}/>} />

                        <Route path="/test/add-test/test-form/" element={<TestaccessFormAddTest username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
 <Route path="/test/training/:collegeId" element={<TrainingTest username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
 <Route path="/edit-training/:id" element={<UpdateTraining username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
 <Route path="/edit-schedule/:id" element={<Updateschedule username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
<Route path="/demo" element={<Demo />} />
                              <Route path="/add-test" element={<AddTestPage username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />
         
                        <Route path="/add_coding_question" element={<AddCodingQuestion />} />
                        <Route path="/upload-employees" element={<EmployeeUpload />} />
                        <Route path="/training/schedule/" element={<TrainingScheduleForm />} />
<Route path="/hdfc/test/report" element={<HdfcTestSchedules />} />
<Route path="/test-attended/:testName" element={<TestAttendedTable />} />
   <Route path="/employeetable" element={<EmployeeTable />} />   
     <Route path="/total-commun-test-report/:collegeId" element={<TotalCommuncationTest />} />
                        <Route path="/total-company-test-report/:collegeId" element={<TotalCompanyTest />} />
                        <Route path="/test_candidates/:test_name/:collegeId/" element={<Testcandidates  collegeName={collegeName} institute={institute} userRole={userRole}/>} />
                    <Route path="/daywise/test/report" element={<DayWiseReport username={username} collegeName={collegeName} institute={institute} userRole={userRole} />} />

                             <Route path= "/practice/stu/report" element={<PracticeTestReport  collegeName={collegeName} institute={institute} userRole={userRole} username={username}/>} />
                                <Route path= "/practice/stuview/report" element={<PracticeView  collegeName={collegeName} institute={institute} userRole={userRole} username={username}/>} />
             <Route path="/question/mcq/test" element={<QuestionPaperMCQTest username={username} collegeName={collegeName} userRole={userRole} institute={institute} />} />
                        <Route path="/question/code/test" element={<QuestionPaperCodeTest username={username} collegeName={collegeName} userRole={userRole} institute={institute} />} />
                      <Route path="/question/communication/" element={<UploadCommunicationTest />} />
                   <Route path="/test/audio/assign/" element={<AudioAccess username={username} collegeName={collegeName} userRole={userRole} institute={institute}/>} />
                     <Route path="/test/audio/assign-form/" element={<AudioTestAssign username={username} collegeName={collegeName} userRole={userRole} institute={institute}/>} />
                                      
                      </Routes>
                    </TestQuesProvider>
                  </div>

                </ThemeContextProvider>
              </ContextProvider>
            </div>
          </SearchProvider>
        </div>
      </Router>
      <Footer />
    </div>
  );
};

export default App;
