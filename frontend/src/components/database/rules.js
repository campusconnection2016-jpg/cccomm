import React, { useState, useEffect, useContext } from 'react';
import { Pagination, Form } from 'react-bootstrap';
import { addrulesApi, getrulesApi, updaterulesApi, deleterulesApi } from '../../api/endpoints'; // Import your API functions
import { FaEdit, FaTrash, FaWeight } from 'react-icons/fa';
import { SearchContext } from '../../allsearch/searchcontext';
import '../../styles/trainingadmin.css'
import Add from '../../assets/images/add.png';
import ErrorModal from '../auth/errormodal';
import { faLeftLong } from '@fortawesome/free-solid-svg-icons';

const RulesManagement = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ rule_name: '', instruction: '' });
  const [updateRule, setUpdateRule] = useState({ rule_name: '', instruction: '' });
  const [updateRuleId, setUpdateRuleId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const { searchQuery } = useContext(SearchContext);
  const [showError, setShowError] = useState(false);
  const handleCloseError = () => {
    setShowError(false);
};



  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch rules
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const rulesData = await getrulesApi();
        setRules(rulesData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchRules();
  }, []);

  const handleAddRule = async () => {
    if (!newRule.rule_name.trim() || !newRule.instruction.trim()) {
      setErrorMessage('Rule name and instruction are required.');
      setShowError(true);
      return;
    }

    // Check if the new skill name already exists
    const existingSkill = rules.find(
      (skill) => skill.rule_name.toLowerCase() === newRule.rule_name.toLowerCase()
    );
    
    if (existingSkill) {
      setErrorMessage('Rule name already exists.');
      setShowError(true);
      return;
    }
  
    try {
      const response = await addrulesApi(newRule);
      setRules([...rules, response]);
     // alert("Data Added Successfully")
     setErrorMessage('Data Added Successfully');
     setShowError(true);
      setNewRule({ rule_name: '', instruction: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to add rule. Please try again.');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await deleterulesApi(ruleId);
      setRules(rules.filter((rule) => rule.id !== ruleId));
      setErrorMessage('Data Deleted Successfully');
      setShowError(true);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to delete rule. Please try again.');
    }
  };

  const handleUpdateRule = async () => {

    // Check if the new skill name already exists
    const existingSkill = rules.find(
      (skill) => skill.rule_name.toLowerCase() === updateRule.rule_name.toLowerCase()
    );
    
    if (existingSkill) {
      setErrorMessage('Rule name already exists.');
      setShowError(true);
      return;
    }
  
    try {
      const response = await updaterulesApi(updateRuleId, updateRule);
      setRules(rules.map((rule) => (rule.id === updateRuleId ? response : rule)));
      //alert("Data Updated Successfully")
      setErrorMessage('Data Updated Successfully');
      setShowError(true);
      setUpdateRule({ rule_name: '', instruction: '' });
      setShowUpdateForm(false);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to update rule. Please try again.');
    }
  };

  const [searchTerm, setSearchTerm] = useState(""); 
  
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // Reset to first page on search
    };
  
    const filteredrules = rules.filter((rule) =>
      (rule.rule_name && rule.rule_name.toLowerCase().includes(searchTerm.toLowerCase())) 
     // (rule.rule_group && rule.rule_group.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   
    const totalPages = Math.ceil(filteredrules.length / itemsPerPage);
    const currentRules = filteredrules.slice(
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
    <div className='fom-que-setting'>
      <input
        type="text"
        className="search-box1-settings"
        placeholder="Search rule..."
        value={searchTerm}
        onChange={handleSearchChange}
       
      />
      <button className='button-ques-save-add'  onClick={() => {
    setShowAddForm(true);      // Show Add form
    setShowUpdateForm(false); // 🔥 Hide Update form
    //setNewRule({ rule_name: '', instruction: '' }); // optional: reset add form
  }}>
      <img src={Add} style={{ marginRight: "2px" }} className='nextarrow' alt="Add" /> <strong>Add</strong>
      </button>
      <p></p>
      {showAddForm && (
        <div className="popup-container">
          <input
            type="text"
            autocomplete="off"
            value={newRule.rule_name}
            onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
            placeholder="Enter rule name"
            className='input-ques-st'
          />
          <p></p>
          <input
            type="text"
            autocomplete="off"
            value={newRule.instruction}
            onChange={(e) => setNewRule({ ...newRule, instruction: e.target.value })}
            placeholder="Enter instruction"
            className='input-ques-st'
          />
          <p></p>
          <div className='button-container-set'>
            <button className='button-ques-save-st' onClick={handleAddRule}>Save</button>
            <button className='cancel-master' onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showUpdateForm && (
        <div className="popup-container">
          <input
            type="text"
            autocomplete="off"
            value={updateRule.rule_name}
            onChange={(e) => setUpdateRule({ ...updateRule, rule_name: e.target.value })}
            placeholder="Enter updated rule name"
            className='input-ques-st'
          />
          <p></p>
          <input
            type="text"
            autocomplete="off"
            value={updateRule.instruction}
            onChange={(e) => setUpdateRule({ ...updateRule, instruction: e.target.value })}
            placeholder="Enter updated instruction"
            className='input-ques-st'
          />
          <p></p>
          <div className='button-container-set'>
            <button className='button-ques-save-st'  onClick={handleUpdateRule}>Update</button>
            <button className='cancel-master'  onClick={() => setShowUpdateForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/*errorMessage && <p className="error-message">{errorMessage}</p>*/}
      <div className='table-responsive-settings'>
        <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th>Rule Name</th>
              <th>Instruction</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {currentRules
              .filter(content => !searchQuery ||
                (content.rule_name && content.rule_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (content.instruction && content.instruction.toLowerCase().includes(searchQuery.toLowerCase())))
              .map((rule) => (
                <tr key={rule.id}>
                  <td>{rule.rule_name}</td>
                  <td>{rule.instruction}</td>
                  <td>
                    <button className="action-button edit" onClick={() => {
                      setShowUpdateForm(true);
                       setShowAddForm(false);
                      setUpdateRuleId(rule.id);
                      setUpdateRule({ rule_name: rule.rule_name, instruction: rule.instruction });
                    }}>✏️</button>
                  </td>
                  <td>
                    <button className="action-button delete" onClick={() => handleDeleteRule(rule.id)} style={{ color: "orange" }} >🗑</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table><p></p><p></p>
        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
          <Form.Label className="display" >Display:</Form.Label>
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

export default RulesManagement;
