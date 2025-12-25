import React, { useState } from 'react';
import '../../styles/trainingadmin.css'
import QuestionsManagement from './questiontype';
import SkillsManagement from './skilltype';
import TestTypeManagement from './testtype';
import CollegeManagement from './collegemaster';
import DepartmentManagement from './departmentmaster';
import Skill from './skillsmaster';
import RulesManagement from './rules';
import CorporateManagement from './corporatemanage';
import Trainingschedule from './trainingschedule';
import FolderManagement from './foldermaster';
const Buttons = () => {
    const [activeButton, setActiveButton] = useState(null);

    const handleButtonClick = (buttonName) => {
        console.log(`${buttonName} button clicked`);
        setActiveButton(buttonName);
    };

    return (
        <div className='form-ques-master' >
        <>
        <div className="header">
        <h6 >Choose the Master Table here!</h6>
        </div>
        
        <br></br><p></p>
        <div>
            <select onChange={(e) => handleButtonClick(e.target.value)} className="input-ques-settings" >
                <option value="" >Select Option</option>
                <option value="Skill Type">Skill Type</option>
                <option value="Test Type">Test Type</option>
                <option value="Question Type">Question Type</option>
                <option value="College Master">College Master</option>
                <option value="Department Master">Department Master</option>
              <option value="Skill Master">Students Skill</option>
              <option value="Company Master">Company Master</option>
               <option value="Folder Master">Folder Master</option> 
               {/* <option value="course Master">Course Master</option> 
                <option value="Topic Master">Topic Master</option>*/} 
              {/*}   <option value="Training schedule">Training schedule</option>*/}
                <option value="Rules">Rules</option>
            </select></div>
<div style={{height:"120px"}}></div>
            <div className="button-group" style={{marginLeft:"0px",marginTop:"-90px"}}>
                {activeButton === 'Question Type' && <QuestionsManagement />}
                {activeButton === 'Skill Type' && <SkillsManagement />}
                {activeButton === 'Test Type' && <TestTypeManagement />}
                {activeButton === 'College Master' && <CollegeManagement />}
                {activeButton === 'Department Master' && <DepartmentManagement />}
                {activeButton === 'Company Master' && <CorporateManagement />}
              {activeButton === 'Skill Master' && <Skill />}
 {activeButton==='Training schedule'&& <Trainingschedule></Trainingschedule>}
                {activeButton === 'Rules' && <RulesManagement />}
                {activeButton==='Folder Master'&& <FolderManagement></FolderManagement>}
            </div>
        </></div>
    );
};

export default Buttons;
