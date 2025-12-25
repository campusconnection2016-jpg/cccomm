import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Sidebar from "./trainer/sidebar";
import LearningMaterial from "./trainer/lms/learningmaterial";
import Header from "./header/header";
import { CssBaseline } from "@mui/material";
import ThemeContextProvider from "./themecontext";
import "./app.css";

import { SearchProvider } from "./allsearch/searchcontext";
import TestReport from "./trainer/test/testreport";
import TrainerProfile from "./trainer/database/trainerprofile"; // Import the popup component
import Update_MCQForm from './trainer/questions/update_mcqform';
import Update_CodeForm from './trainer/questions/update_codeform';

import QuesPaperTb from "./trainer/questions/quespapertb";
import TrainerDashboard from "./trainer/dashboard/trainerdashboard";
import InvoiceForm from "./trainer/invoice/invoice";
import { get_Is_Edit_API } from "./api/endpoints";
import InvoiceTB from "./trainer/invoice/invoicetable";
import UpdateInvoice from "./trainer/invoice/update_invoice";
import TrainerFrontPage from "./trainer/database/trainerfrontpage";

const Trainer = ({ username, institute, userRole }) => {
  const [theme, setTheme] = useState("black");
  const [isEdit, setIsEdit] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    get_Is_Edit_API(username)
      .then((data) => {
        setIsEdit(data.is_edit);
        console.log('is_edit is running..');
      })
      .catch((error) => console.error('Error fetching trainer popup:', error));
  }, [username, isEdit]); // Add `username` as a dependency


  const handleEditSuccess = () => {
    setIsEdit(true);
  };


  return (
    <div className="App-header">
      <Router>
        {!isEdit ? (
          <TrainerFrontPage username={username}
            onEditSuccess={handleEditSuccess} />
        ) : (
          <div className={`app ${theme}`}>
            <SearchProvider>
              <div className="content-wrapper">
                <ThemeContextProvider>
                  <CssBaseline />
                  <Header
                    theme={theme}
                    toggleTheme={toggleTheme}
                    username={username}
                    userRole={userRole}
                  />
                  <Sidebar />
                  <main
                    className="main-content shifted"
                    style={{  marginTop: "60px" }}
                  >
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <TrainerDashboard
                            username={username}
                            institute={institute}
                          />
                        }
                      />
                      <Route
                        path="/InvoiceTB"
                        element={<InvoiceTB username={username} />}
                      />
                      <Route
                        path="/lms/upload-video"
                        element={<LearningMaterial username={username} />}
                      />
                      <Route path="/test/report" element={<TestReport />} />
                      <Route
                        path="/questions/question-paper"
                        element={
                          <QuesPaperTb
                            username={username}
                            userRole={userRole}
                          />
                        }
                      />
                      <Route
                        path="/update-mcq-form/:id"
                        element={<Update_MCQForm />}
                      />
                      <Route
                        path="/update-code-form/:id"
                        element={<Update_CodeForm />}
                      />
                      <Route
                        path="/update-invoice/:invoice_no"
                        element={<UpdateInvoice username={username} />}
                      />
                      <Route
                        path="/database/upload-profile"
                        element={
                          <TrainerProfile
                            username={username}
                            userRole={userRole}
                          />
                        }
                      />
                      <Route
                        path="/invoice"
                        element={<InvoiceForm username={username} />}
                      />
                    </Routes>
                  </main>
                </ThemeContextProvider>
              </div>
            </SearchProvider>
          </div>
        )}
      </Router>
    </div>
  );
};

export default Trainer;
