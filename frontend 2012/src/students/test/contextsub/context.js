// Context.js
import React, { createContext, useState, useContext } from 'react';

const TestContext = createContext();

export const TestProvider = ({ children }) => {
  const [questionIdCon, setQuestionIdCon] = useState(null);
  const [testIdCon, setTestIdCon] = useState(null);
  const [studentIdCon, setStudentIdCon] = useState(null);
  const [selectedQuestionsCon, setSelectedQuestionsCon] = useState(null);
  const [testStartTimeCon, setTestStartTimeCon] = useState(null);
  const [outputWinAns, setOutputWinans] = useState(null);
  const [codeWindow, setCodeWindow] = useState(null);
  const [languageSelected, setLanguageSelected] = useState(null);
  const [customInputCom, setCustomInputCom] = useState(null);
  const [outputWindowCom, setOutputWindowCom] = useState(null);
  const [skillTypeLanguage, setSkillTypeLanguage] = useState(null);
  const [isTestCase, setIsTestCase] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [testCasesResults, setTestCasesResults] = useState([]);


  return (
    <TestContext.Provider value={{ questionIdCon, setQuestionIdCon, testIdCon, setTestIdCon, studentIdCon, setStudentIdCon, selectedQuestionsCon, setSelectedQuestionsCon, testStartTimeCon, setTestStartTimeCon, outputWinAns, setOutputWinans, codeWindow, setCodeWindow, languageSelected, setLanguageSelected, customInputCom, setCustomInputCom, outputWindowCom, setOutputWindowCom, skillTypeLanguage, setSkillTypeLanguage, isTestCase, setIsTestCase, testCases, setTestCases, testCasesResults, setTestCasesResults }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => useContext(TestContext);
