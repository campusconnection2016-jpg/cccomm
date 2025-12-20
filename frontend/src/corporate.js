//Corporate.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Sidebar from './corporate/sidebar'

import { SearchProvider } from './allsearch/searchcontext';

import Testaccess from './corporate/test/testaccess'
import './app.css';
import { ContextProvider } from './corporate/test/context/testtypecontext';

import TestReport from './corporate/reports/testreport';
import UpdateTestAccessForm from './corporate/test/updatetest';
import NonDatabaseForm from './corporate/test/nondatabaseform';
import TestResult from './corporate/reports/testresult';
import TestReports from './corporate/reports/testreportold';
import TestSchedules from './corporate/test/testschedules';
import AddDBCandidates from './corporate/test/addcandidates/adddbcandidates';
//import AddNonDBCandidates from './Corporate/Test/AddCandidates/AddNonDBCandidates';
//import  FilterCandidatesDownload from './Corporate/Database/FilterDB';
import Header from './header/header';
import { CssBaseline } from '@mui/material';
import ThemeContextProvider from './themecontext';
// import Uploadjoboffers from './Corporate/Database/UploadJoboffer';

import StudentList from './placementofficer/database/studentslist';

import EligibleStudents from './placementofficer/database/eligiblestudents';


import MCQForms from './corporate/test/mcqquestions';
import CodeForms from './corporate/test/codingquestions';

import StudentResults from './corporate/reports/studentresults';

import DepartmentReport from './corporate/reports/departmentreport';
import OverallReport from './corporate/reports/overallreport';
import Uploadjoboffers from './components/jobpost/joboffer';
import TestaccessForm from './corporate/test/testaccessform';

const Corporate = ({ collegeName, username, institute,userRole }) => {
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
                  <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                  <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`} style={{ marginTop: '60px' }}>
                    <Routes>
                     <Route path="/" element={<TestSchedules username={username} collegeName={collegeName} institute={institute} />} />
                      <Route path="/test-report/:test_name" element={<TestReport username={username} collegeName={collegeName} institute={institute} />} />
                      <Route path="/test-result/:test_name" element={<TestResult username={username} collegeName={collegeName} institute={institute} />} />
                      {/*}  <Route path="/lms/content-map" element={<ContentMap />} />  */}
                      <Route path="/test-result/placement/" element={<StudentResults />} />
                       <Route path="/reports/test-report" element={<TestReports username={username} collegeName={collegeName} institute={institute} />} />
                       <Route path="/reports/dep-report" element={<DepartmentReport username={username} collegeName={collegeName} institute={institute} />} />
                      <Route path="/reports/placement-report" element={<OverallReport username={username} collegeName={collegeName} institute={institute} />} />
                     
                      <Route path="/add-candidate/:test_name" element={<AddDBCandidates username={username} collegeName={collegeName} institute={institute} />} />
                      <Route path='/eligible-student/:job_id' element={<StudentList />} />
                      <Route path='/students/eligible-student/:job_id/:round_of_interview' element={<EligibleStudents />} />

                      <Route path="/mcq-form/:id" element={<MCQForms />} />
                      <Route path="/code-form/:id" element={<CodeForms />} />
                      

                      <Route path="/database/upload-offer" element={<Uploadjoboffers username={username} collegeName={collegeName} institute={institute} />} />
                     
                      <Route path='/test/test-access' element={<TestaccessForm username={username} collegeName={collegeName} institute={institute} />} />
                      <Route path="/test-access/non-db/" element={<NonDatabaseForm username={username} collegeName={collegeName} institute={institute} />} />
                      <Route path="/test/test-schedules/" element={<TestSchedules username={username} collegeName={collegeName} institute={institute} />} />


                      <Route path="/update-test/:test_name" element={<UpdateTestAccessForm username={username} collegeName={collegeName} institute={institute} />} />
                      <Route path="/job" element={<Uploadjoboffers />} />
                     
                
                      {/*}  <Route path="index.html" element={<Navigate to="/" />} />   */}
                    </Routes>
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

export default Corporate;
