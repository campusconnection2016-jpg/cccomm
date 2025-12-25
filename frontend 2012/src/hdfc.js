// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Sidebar from './hdfc/sidebar.js'
import { SearchProvider } from './allsearch/searchcontext.js';
import './app.css'
import Footer from './footer/footer.js';
import { ContextProvider } from './components/test/context/testtypecontext.js'; 
import Header from './header/header.js';
import { CssBaseline } from '@mui/material';
import ThemeContextProvider from './themecontext.js';
import { TestQuesProvider } from './placementofficer/test/context/testquescontext.js';

import EmployeeUpload from './hdfc/database/employeeupload.js';
import AddTest from './hdfc/test/addtest.js';
import HdfcTestSchedules from './hdfc/test/hdfctestschedules.js';
import EmployeeTable from './hdfc/database/employeetable.js';

const Hdfc = ({ collegeName, username, userRole, institute }) => {
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
                                    <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                                    <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`} style={{ marginTop: '60px' }}>
                                        <TestQuesProvider>
                                            <Routes>
                                                  <Route path="/employeetable" element={<EmployeeTable />} />   
                                                <Route path="/upload-employees" element={<EmployeeUpload />} />
                                              <Route path="/" element={<HdfcTestSchedules />} />
                                                <Route path="/test/test-schedules/" element={<HdfcTestSchedules />} />
<Route path="/test/add-test/test-form/:test_type" element={<AddTest />} />

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

export default Hdfc;
