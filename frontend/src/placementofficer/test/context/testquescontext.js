// Context.js
import React, { createContext, useState, useContext } from 'react';

const TestQuesContext = createContext();

export const TestQuesProvider = ({ children }) => {
  const [questionPaperCon, setQuestionPaperCon] = useState(null);
  const [topicCon, setTopicCon] = useState(null);
  const [subTopicCon, setSubtopicCon] = useState(null);
  const [isTestAddQues, setIsTestAddQues] = useState(false);


  return (
    <TestQuesContext.Provider value={{ questionPaperCon, setQuestionPaperCon, topicCon, setTopicCon, subTopicCon, setSubtopicCon, isTestAddQues, setIsTestAddQues }}>
      {children}
    </TestQuesContext.Provider>
  );
};

export const useTestQuesContext = () => useContext(TestQuesContext);
