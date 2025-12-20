import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Sidebar from "./employee/sidebar";
import Footer from "./footer/footer";

import "./app.css";
import {
    getStudentNeedInfo,
} from "./api/endpoints";
//import { ContextProvider } from './Components/Test/context/TestTypeContext';
import Header from "./header/header";
import EmployeeAttendTest from "./employee/test/empattendtest";
import UpdateForm from "./employee/database/updateform";
import ThemeContextProvider from "./themecontext";
import { SearchProvider } from "./allsearch/searchcontext";
import { TestProvider } from "./students/test/contextsub/context";



const Employee = ({ collegeName, username, institute, userRole }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [needInfo, setNeedInfo] = useState(false);
    const [studentsNeedInfoData, setStudentsNeedInfoData] = useState([]);
    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    useEffect(() => {
        // Fetch student's need_candidate_info when the component mounts
        getStudentNeedInfo(username)
            .then((data) => {
                setNeedInfo(data.need_candidate_info);
                setStudentsNeedInfoData(data);
                // console.log('setNeedInfo: ', data);
            })
            .catch((error) => {
                // Handle error if needed
                console.error("Error fetching need info:", error);
            });
    }, [username]);

    const handleUploadComplete = () => {
        setNeedInfo(false); // switch to main dashboard after upload
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const enableSidebar = () => {
        setIsSidebarOpen(true);
    };

    const disableSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div
            className="App-header"
            style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
            <Router>
                <div className={`app ${theme}`}>
                    <SearchProvider>
                        {needInfo === true ? (
                            <UpdateForm username={username}
                                collegeName={collegeName}
                                institute={institute}
                                onUploadComplete={handleUploadComplete}
                            />
                        ) : (
                            <div>
                                <ThemeContextProvider>
                                    <Header
                                        theme={theme}
                                        toggleTheme={toggleTheme}
                                        username={username}
                                        userRole={userRole}
                                        collegeName={collegeName}
                                    />
                                    <Sidebar
                                        isSidebarOpen={isSidebarOpen}
                                        toggleSidebar={toggleSidebar}
                                    />
                                    <div
                                        className={`main-content ${isSidebarOpen ? "shifted" : ""}`}
                                        style={{ marginTop: "60px" }}
                                    >
                                        <TestProvider>
                                            <Routes>

                                                <Route
                                                    path="/test/ts-online"
                                                    element={
                                                        <EmployeeAttendTest
                                                            username={username}
                                                            collegeName={collegeName}
                                                            isSidebarOpen={isSidebarOpen}
                                                            disableSidebar={disableSidebar}
                                                            enableSidebar={enableSidebar}
                                                        />
                                                    }
                                                />
                                                <Route path="/" element={<UpdateForm  username={username} />} />

<Route path="/register/employee/" element={<UpdateForm  username={username} />} />

                                                {/*}  <Route path="index.html" element={<Navigate to="/" />} />   */}
                                            </Routes>
                                        </TestProvider>
                                    </div>
                                </ThemeContextProvider>
                            </div>
                        )}
                    </SearchProvider>
                </div>
            </Router>
            <Footer />
        </div>
    );
};

export default Employee;
