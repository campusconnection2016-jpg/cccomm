import React, { useState, useEffect, useContext } from 'react';
import { addSkillApi, getSkillApi, updateSkillApi, deleteSkillApi } from '../../api/endpoints';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { SearchContext } from '../../allsearch/searchcontext';
import '../../styles/trainingadmin.css'
import { Table, Form, Pagination } from 'react-bootstrap';
import Add from '../../assets/images/add.png';
import ErrorModal from '../auth/errormodal';
const Skill = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ skill_name: '' });
  const [updateSkill, setUpdateSkill] = useState({ skill_name: '' });
  const [updateSkillId, setUpdateSkillId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const { searchQuery } = useContext(SearchContext);
  const [showError, setShowError] = useState(false);
 // const [errorMessage, setErrorMessage] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseError = () => {
    setShowError(false);
};
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsData = await getSkillsWithPagination(currentPage, itemsPerPage);
        setSkills(skillsData);
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('Failed to fetch skills. Please try again.');
      }
    };

    fetchSkills();
  }, [currentPage, itemsPerPage]); // Trigger fetch on page change or items per page change

  const getSkillsWithPagination = async (page, limit) => {
    try {
      const response = await getSkillApi(page, limit);
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleAddSkill = async () => {
    if (isSubmitting) return;

        setIsSubmitting(true); 
    if (!newSkill.skill_name || !newSkill.skill_name.trim()) {
      setErrorMessage('Skill name is required.');
      setShowError(true);
      return;
    }

    // Check if the new skill name already exists
    const existingSkill = skills.find(
      (skill) => skill.skill_name.toLowerCase() === newSkill.skill_name.toLowerCase()
    );
    
    if (existingSkill) {
      setErrorMessage('Skill already exists.');
      setShowError(true);
      setIsSubmitting(false);
      return;
    }
  

    try {
      const response = await addSkillApi(newSkill);
      setSkills([...skills, response]);
     // alert("Data Added Successfully")
     setErrorMessage('Data Added Successfully');
     setShowError(true);

      setNewSkill({ skill_name: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to add skill. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await deleteSkillApi(skillId);
      setSkills(skills.filter((skill) => skill.id !== skillId));
      setErrorMessage('Data Deleted Successfully');
      setShowError(true);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to delete skill. Please try again.');
    }
  };

  const handleUpdateSkill = async () => {

    // Check if the new skill name already exists
    const existingSkill = skills.find(
      (skill) => skill.skill_name.toLowerCase() === updateSkill.skill_name.toLowerCase()
    );
    
    if (existingSkill) {
      setErrorMessage('Skill already exists.');
      setShowError(true);
      setIsSubmitting(false);
      return;
    }
  

    try {
      const response = await updateSkillApi(updateSkillId, updateSkill);
      setSkills(skills.map((skill) => (skill.id === updateSkillId ? response : skill)));
      setErrorMessage('Data Updated Successfully');
      setShowError(true);
      //alert("Data Updated Successfully")
      setUpdateSkill({ skill_name: '' });
      setShowUpdateForm(false);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to update skill. Please try again.');
    }
  };
const [searchTerm, setSearchTerm] = useState(""); 

    const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredSkillTypes = skills.filter((skill) =>
    (skill.skill_name && skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())) 
   // (skill.skill_group && skill.skill_group.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 
  const totalPages = Math.ceil(filteredSkillTypes.length / itemsPerPage);
  const currentSkills = filteredSkillTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
 
  

  const getPaginationItems = () => {
    const items = [];
    let startPage, endPage;
  
    if (totalPages <= 3) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage === 1) {
      startPage = 1;
      endPage = 3;
    } else if (currentPage === totalPages) {
      startPage = totalPages - 2;
      endPage = totalPages;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }
  
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
  
    return items;
  };



  return (
    <div className='form-ques-settings'>
       <input
        type="text"
        className="search-box1-settings"
        placeholder="Search department..."
        value={searchTerm}
        onChange={handleSearchChange}
       
      />
      <button className='button-ques-save-add'  
    onClick={() => {
    setShowAddForm(true);              // Show Add Form
    setShowUpdateForm(false);         // Hide Update Form
   // setNewSkill({ skill_name: '' });  // Optional: Reset Add form
  }}>
        <img src={Add} style={{ marginRight: "2px" }} className='nextarrow' alt="Add Skill" />
        <strong>Add</strong>
      </button>
      <p></p><p></p>
      {showAddForm && (
        <div className="popup-container">
          <input
            type="text"
            autocomplete="off"
            value={newSkill.skill_name}
            onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
            placeholder="Enter skill name"
            className='input-ques-st'
          /><p></p>
          <div className='button-container-set'>
            <button className='button-ques-save-st'  onClick={handleAddSkill}>Save</button>
            <button className='cancel-master'  onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showUpdateForm && (
        <div className="popup-container">
          <input
            type="text"
            autocomplete="off"
            value={updateSkill.skill_name}
            className='input-ques-st'
            onChange={(e) => setUpdateSkill({ ...updateSkill, skill_name: e.target.value })}
            placeholder="Enter updated skill name"
          /><p></p>
          <div className='button-container-set'>
            <button className='button-ques-save-st' style={{ width: "100px" }} onClick={handleUpdateSkill}>Update</button>
            <button className='cancel-master' style={{ width: "100px" }} onClick={() => setShowUpdateForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/*errorMessage && <p className="error-message">{errorMessage}</p>*/}
      <div className='table-responsive-settings'>
      <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th>Skill Name</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {currentSkills
              .filter(content => !searchQuery || (content.skill_name && content.skill_name.toLowerCase().includes(searchQuery.toLowerCase())))
              .map((skill) => (
                <tr key={skill.id}>
                  <td>{skill.skill_name}</td>
                  <td>
                    <button className="action-button edit" onClick={() => {
                      setShowUpdateForm(true);
                       setShowAddForm(false);
                      setUpdateSkillId(skill.id);
                      setUpdateSkill({ skill_name: skill.skill_name });
                    }}>✏️</button>
                  </td>
                  <td>
                    <button className="action-button delete" onClick={() => handleDeleteSkill(skill.id)} style={{ color: "orange" }} >🗑</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <p></p><p></p>
        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
          <Form.Label className='display'>Display:</Form.Label>
          <Form.Control
          className='label-dis'
            style={{ width: "50px",boxShadow: 'none', outline: 'none' }}
            as="select"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page on items per page change
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </Form.Control>
        </Form.Group>

        <Pagination className="pagination-custom" >
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {getPaginationItems()}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
    
    </div>
  );
};

export default Skill;
