import React, { useState, useEffect, useContext } from 'react';
import '../../styles/trainingadmin.css'
import { Table, Form, Pagination } from 'react-bootstrap';
import { addSkilltypeApi, updateSkilltypeApi, deleteSkilltypeApi, getSkilltypeApi, getqstntypeApi } from '../../api/endpoints';
import DeleteIcon from '../../assets/images/delete.png';
import UpdateIcon from '../../assets/images/update.png';
import { SearchContext } from '../../allsearch/searchcontext';
import Add from '../../assets/images/add.png';
import ErrorModal from '../auth/errormodal';
import Select from 'react-select';


const customStyles = {
  control: (provided, state) => ({
      ...provided,
      backgroundColor: '#39444e',
      color: '#fff', // Text color
      borderColor: state.isFocused ? '' : '#ffff', // Border color on focus
      boxShadow: 'none', // Remove box shadow
      '&:hover': {
          borderColor: state.isFocused ? '#ffff' : '#ffff' // Border color on hover
      },
      '&.css-1a1jibm-control': {
          // Additional styles for the specific class
      },
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px', // Smaller font size

          width: '70%'
      }
  }),
  singleValue: (provided) => ({
      ...provided,
      color: '#ffff', // Text color for selected value
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px' // Smaller font size
      }
  }),
  option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
      color: '#ffff', // Text color
      '&:hover': {
          backgroundColor: '#39444e', // Background color on hover
          color: '#ffff' // Text color on hover
      },
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px',// Smaller font size
          width: '70%'
      }
  }),
  input: (provided) => ({
      ...provided,
      color: '#ffff' // Text color inside input when typing
  }),
  menu: (provided) => ({
      ...provided,
      backgroundColor: '#39444e',
      '@media (max-width: 768px)': { // Adjust for mobile devices
          fontSize: '12px' // Smaller font size
      }
  })

};

const SkillsManagement = () => {
  const [skillTypes, setSkillTypes] = useState([]);
  const [newSkillType, setNewSkillType] = useState('');
  const [updateSkillType, setUpdateSkillType] = useState('');
  const [updateSkillTypeId, setUpdateSkillTypeId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const { searchQuery } = useContext(SearchContext);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [quesTypeID, setQuesTypeID] = useState([]);
   const [selectedQuesTypeID, setSelectedQuesTypeId] = useState(null);
   const [updateQuesType, setUpdateQuesType] = useState(null);
  


  const handleCloseError = () => {
    setShowError(false);
  };
  // Fetch skill types
  useEffect(() => {
    const fetchSkillTypes = async () => {
      try {
        const skillTypesData = await getSkilltypeApi();
        setSkillTypes(skillTypesData);
      } catch (error) {
        console.error('Error:', error);
      }
    };


    getqstntypeApi()
      .then(data => {
        setQuesTypeID(data.map(item => ({ value: item.id, label: item.question_type })));

      })
      .catch(error => console.error('Error fetching rules:', error));

    fetchSkillTypes();
  }, []);

  const handleAddSkillType = async () => {
    if (selectedQuesTypeID.label !== 'Softskills' && !newSkillType.trim()) {
    setErrorMessage('Skill Type is required.');
    setShowError(true);
    return;
  }

  // Check if skill_type AND question_type_id both exist
  const existingSkill = skillTypes.find(
    (skill) =>
      skill.skill_type.toLowerCase() === newSkillType.toLowerCase() &&
      skill.question_type_id === selectedQuesTypeID.value
  );

  if (existingSkill) {
    setErrorMessage('Skill type already exists for this question type.');
    setShowError(true);
    return;
  }

    try {
      const response = await addSkilltypeApi({ skill_type: newSkillType, question_type_id: selectedQuesTypeID.value });
      setSkillTypes([...skillTypes, response]);
      //alert("Data Added Successfully")
      setErrorMessage('Data Added Successfully');
      setShowError(true);

      setNewSkillType('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to add skill type. Please try again.');
    }
  };

  const handleDeleteSkillType = async (skillTypeId) => {
    try {
      await deleteSkilltypeApi(skillTypeId);
      setSkillTypes(skillTypes.filter((type) => type.id !== skillTypeId));
      setErrorMessage('Data Deleted Successfully');
      setShowError(true);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to delete skill type. Please try again.');
    }
  };

  const handleUpdateSkillType = async () => {
  // Check if same skill_type already exists for the same question_type
  const existingSkills = skillTypes.find(
    (skill) =>
      skill.skill_type.toLowerCase() === updateSkillType.toLowerCase() &&
      skill.question_type_id === updateQuesType.value &&   // ✅ also match ques type
      skill.id !== updateSkillTypeId
  );

  if (existingSkills) {
    setErrorMessage('This skill type already exists for the selected question type.');
    setShowError(true);
    return;
  }

  try {
    const response = await updateSkilltypeApi(updateSkillTypeId, { 
      skill_type: updateSkillType, 
      question_type_id: updateQuesType.value 
    });

    setSkillTypes(skillTypes.map((type) => 
      type.id === updateSkillTypeId ? response : type
    ));
    setErrorMessage('Data Updated Successfully');
    setShowError(true);

    setUpdateSkillType('');
    setShowUpdateForm(false);
  } catch (error) {
    console.error('Error:', error);
    setErrorMessage('Failed to update skill type. Please try again.');
  }
};


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  const filteredSkillTypes = skillTypes.filter((skill) =>
    skill.skill_type?.toLowerCase().includes(searchTerm.toLowerCase()) // Avoid null errors
  );

  // 🔹 Pagination Logic
  const totalPages = Math.ceil(filteredSkillTypes.length / itemsPerPage);
  const currentSkillTypes = filteredSkillTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  }; const getPaginationItems = () => {
    const items = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

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
        placeholder="Search SkillTypes..."
        value={searchTerm}
        onChange={handleSearchChange}

      />
      <button className='button-ques-save-add' style={{ marginTop: "30px" }} 
      onClick={() =>{ setShowAddForm(true);setShowUpdateForm(false); // 👈 hide update form
    //setNewSkillType("");
   // setSelectedQuesTypeId(null);
    }}>
        <img src={Add} className='nextarrow' alt="Add" style={{ marginRight: "2px" }} />
        <strong>Add</strong>
      </button>
      <p></p>
      {showAddForm && (
        <div className="popup-container">
          <input
            type="text"
            autocomplete="off"
            className='input-ques-st'
            value={newSkillType}
            onChange={(e) => setNewSkillType(e.target.value)}
            placeholder="Enter Skill Type"
          />
          <p></p>
          <Select
            options={quesTypeID}
            value={selectedQuesTypeID}
            onChange={setSelectedQuesTypeId}
            placeholder="Select Ques Type"
            styles={customStyles}
          />
          <div className='button-container-set'>
            <button className='button-ques-save-st' onClick={handleAddSkillType}>Save</button>
            <button className='cancel-master' onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showUpdateForm && (
        <div className="popup-container">
          <input
            type="text"
            autocomplete="off"
            className='input-ques-st'
            value={updateSkillType}
            onChange={(e) => setUpdateSkillType(e.target.value)}
            placeholder="Enter updated skill type"
          />
          <p></p>
          
          <Select
            options={quesTypeID}
            value={updateQuesType}
            onChange={setUpdateQuesType}
            placeholder="Select Ques Type"
            styles={customStyles}
          />

          <div className='button-container-set'>
            <button className='button-ques-save-st' onClick={handleUpdateSkillType}>Update</button>
            <button className='cancel-master' onClick={() => setShowUpdateForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/*errorMessage && <p className="error-message">{errorMessage}</p>*/}

      <div className='table-responsive-settings'>
        <table className="product-table">
          <thead className="table-thead">
            <tr>
            <th>Ques Type</th>
              <th>Skill Type</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {currentSkillTypes
              .filter(content => !searchQuery || (content.skill_type && content.skill_type.toLowerCase().includes(searchQuery.toLowerCase())))
              .map((type) => (
                <tr key={type.id}>
                  <td>{type.question_type_name}</td>
                  <td>{type.skill_type}</td>
                  <td>
                    <button className="action-button edit" onClick={() => {
                      setShowUpdateForm(true);
                      setShowAddForm(false);
                      setUpdateSkillTypeId(type.id);
                      setUpdateSkillType(type.skill_type);
                      setUpdateQuesType({ value: type.question_type_id, label: type.question_type_name });
                    }}>✏️</button>
                  </td>
                  <td>
                    <button className="action-button delete" style={{ color: "orange" }} onClick={() => handleDeleteSkillType(type.id)}>🗑</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table><p></p>

        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
          <Form.Label className='display'>Display:</Form.Label>
          <Form.Control
            className='label-dis'
            style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
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

export default SkillsManagement;
