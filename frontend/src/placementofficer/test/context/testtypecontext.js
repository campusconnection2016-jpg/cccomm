import React, { createContext, useState } from 'react';


// Create contexts
export const TestTypeContext = createContext();
export const TestTypeCategoriesContext = createContext();
export const QuestionTypeContext = createContext();
export const SkillTypeContext = createContext();
export const testNameContext = createContext();

// Provider component
export const ContextProvider = ({ children }) => {
  // State for each context
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedTestTypeCategory, setSelectedTestTypeCategory] = useState(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [selectedSkillType, setSelectedSkillType] = useState(null);
  const [testName, setTestName] = useState(null);

  return (
    <TestTypeContext.Provider value={{ selectedTestType, setSelectedTestType }}>
      <TestTypeCategoriesContext.Provider value={{ selectedTestTypeCategory, setSelectedTestTypeCategory }}>
        <QuestionTypeContext.Provider value={{ selectedQuestionType, setSelectedQuestionType }}>
          <SkillTypeContext.Provider value={{ selectedSkillType, setSelectedSkillType }}>
            <testNameContext.Provider value={{ testName, setTestName }}>
              {children}
            </testNameContext.Provider>
          </SkillTypeContext.Provider>
        </QuestionTypeContext.Provider>
      </TestTypeCategoriesContext.Provider>
    </TestTypeContext.Provider>
  );
};
