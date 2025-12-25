import React, { useState } from 'react';
import '../../styles/global.css'
import QuestionsManagement from '../../components/database/questiontype'
import SkillsManagement from '../../components/database/skilltype';
import TestTypeManagement from '../../components/database/testtype';

import DepartmentManagement from '../../components/database/departmentmaster';
import Skill from '../../components/database/skillsmaster';


import RulesManagement from '../../components/database/rules';


const Buttons = ({ collegeName }) => {
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonClick = (buttonName) => {
    console.log(`${buttonName} button clicked`);
    setActiveButton(buttonName);
  };

  return (
    <div className='form-ques-master' >
      <>
        <div className="header">
          <h5 >Choose the Master Table here!</h5>
        </div>

        <br></br><p></p>
        <div>
          <select onChange={(e) => handleButtonClick(e.target.value)} className="input-ques" >
            <option value="" >Select Option</option>
             {/*}   <option value="Skill Type">Skill Type</option>
            <option value="Test Type">Test Type</option>
            <option value="Question Type">Question Type</option>  */}
<option value="Rules">Rules</option>
          {/*}  <option value="Department Master">Department Master</option>*/}
            <option value="Skill Master">Skill Master</option>


            
          </select></div>
        <div style={{ height: "120px" }}></div>
        <div className="button-group" style={{ marginLeft: "0px", marginTop: "-90px" }}>
       {/*}    {activeButton === 'Question Type' && <QuestionsManagement />}
          {activeButton === 'Skill Type' && <SkillsManagement />}
          {activeButton === 'Test Type' && <TestTypeManagement />}

         {activeButton === 'Department Master' && <DepartmentManagement />}*/}
{activeButton === 'Rules' && <RulesManagement />}
          {activeButton === 'Skill Master' && <Skill />}

          
        </div>
      </></div>
  );
};

export default Buttons;
