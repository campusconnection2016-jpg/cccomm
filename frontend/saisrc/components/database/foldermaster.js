import React, { useState, useEffect, useContext } from 'react';
import '../../styles/trainingadmin.css'
import { Table, Form, Pagination } from 'react-bootstrap';
import { addfolderApi, updatefolderApi, deletefolderApi, getSkilltypeApi, getfolderApi } from '../../api/endpoints';
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
      color: '#fff',
      borderColor: state.isFocused ? '' : '#ffff',
      boxShadow: 'none',
      '&:hover': {
          borderColor: state.isFocused ? '#ffff' : '#ffff'
      },
      '@media (max-width: 768px)': {
          fontSize: '12px',
          width: '70%'
      }
  }),
  singleValue: (provided) => ({
      ...provided,
      color: '#ffff',
      '@media (max-width: 768px)': {
          fontSize: '12px'
      }
  }),
  option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
      color: '#ffff',
      '&:hover': {
          backgroundColor: '#39444e',
          color: '#ffff'
      },
      '@media (max-width: 768px)': {
          fontSize: '12px',
          width: '70%'
      }
  }),
  input: (provided) => ({
      ...provided,
      color: '#ffff'
  }),
  menu: (provided) => ({
      ...provided,
      backgroundColor: '#39444e',
      '@media (max-width: 768px)': {
          fontSize: '12px'
      }
  })
};

const FolderManagement = () => {
  const [folders, setfolders] = useState([]);
  const [newfolder, setNewfolder] = useState('');
  const [updatefolder, setUpdatefolder] = useState('');
  const [updatefolderId, setUpdatefolderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const { searchQuery } = useContext(SearchContext);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  const [skilltypeID, setskilltypeID] = useState([]);
  const [selectedskilltypeID, setSelectedskilltypeID] = useState(null);
  const [updateskillType, setupdateskillType] = useState(null);
  const [questionTypeOptions, setQuestionTypeOptions] = useState([]);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [filteredSkillTypes, setFilteredSkillTypes] = useState([]);
  const [allSkillTypes, setAllSkillTypes] = useState([]);

  const [updateQuesType, setUpdateQuesType] = useState(null);
  const [updateSkillTypeID, setUpdateSkillTypeID] = useState(null);

  // New states for logo
  const [newFolderLogo, setNewFolderLogo] = useState(null);
  const [updateFolderLogo, setUpdateFolderLogo] = useState(null);

  // New states for syllabus
  const [newSyllabus, setNewSyllabus] = useState('');
  const [updateSyllabus, setUpdateSyllabus] = useState('');

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleNewFolderLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setNewFolderLogo(base64);
      } catch (err) {
        console.error('Error converting file to base64:', err);
      }
    } else {
      setNewFolderLogo(null);
    }
  };

  const handleUpdateFolderLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setUpdateFolderLogo(base64);
      } catch (err) {
        console.error('Error converting file to base64:', err);
      }
    } else {
      setUpdateFolderLogo(null);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const skillTypeData = await getSkilltypeApi();
        setAllSkillTypes(skillTypeData);
        setskilltypeID(skillTypeData);

        const questionTypes = Array.from(
          new Map(skillTypeData.map(item => [item.question_type_id, item.question_type_name]))
        ).map(([id, name]) => ({ value: id, label: name }));

        setQuestionTypeOptions(questionTypes);

        const foldersData = await getfolderApi();
        const enrichedFolders = foldersData.map(folder => {
          const skillObj = skillTypeData.find(s => s.id === folder.skill_type_id);
          return {
            ...folder,
            question_type_id: skillObj?.question_type_id || null,
            question_type_name: skillObj?.question_type_name || '',
          };
        });

        setfolders(enrichedFolders);
      } catch (error) {
        console.error("❌ Error fetching data", error);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    if (selectedQuestionType) {
      const filtered = skilltypeID
        .filter(item => item.question_type_id === selectedQuestionType.value)
        .map(item => ({ value: item.id, label: item.skill_type }));
      setFilteredSkillTypes(filtered);
      setSelectedskilltypeID(null);
    }
  }, [selectedQuestionType, skilltypeID]);

  useEffect(() => {
    if (updateQuesType) {
      const filtered = allSkillTypes
        .filter(item => item.question_type_id === updateQuesType.value)
        .map(item => ({
          value: String(item.id),
          label: item.skill_type,
        }));
      setFilteredSkillTypes(filtered);
    }
  }, [updateQuesType, allSkillTypes]);

  const handleEditClick = (type) => {
    setShowUpdateForm(true);
    setShowAddForm(false);
    setUpdatefolderId(type.id);
    setUpdatefolder(type.folder_name);

    const selectedQuesType = questionTypeOptions.find(
      (q) => String(q.value) === String(type.question_type_id)
    );
    setUpdateQuesType(selectedQuesType || null);
    setUpdateSkillTypeID(String(type.skill_type_id));
    setUpdateFolderLogo(type.folder_logo || null);
    setUpdateSyllabus(type.syllabus || '');
  };

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleAddfolder = async () => {
    if (!newfolder.trim()) {
      setErrorMessage('Folder name cannot be empty.');
      setShowError(true);
      return;
    }
    if (!selectedQuestionType || !selectedQuestionType.value) {
      setErrorMessage('Please select a question type.');
      setShowError(true);
      return;
    }
    if (!selectedskilltypeID || !selectedskilltypeID.value) {
      setErrorMessage('Please select a skill type.');
      setShowError(true);
      return;
    }

    const payload = {
      folder_name: newfolder,
      skill_type_id: selectedskilltypeID.value,
      folder_logo: newFolderLogo,
      syllabus: newSyllabus
    };

    

    try {
      const response = await addfolderApi(payload);
      const newItem = {
        ...response,
        syllabus: response.syllabus, 
        skill_type_name: selectedskilltypeID.label,
        question_type_id: selectedQuestionType.value,
        question_type_name: selectedQuestionType.label,
      };

      setfolders([...folders, newItem]);
      setErrorMessage('Data Added Successfully');
      setShowError(true);
      setNewfolder('');
      setNewFolderLogo(null);
      setNewSyllabus('');
      setShowAddForm(false);
    } catch (error) {
      console.error('❌ Error:', error);
      setErrorMessage('Failed to add folder. Please try again.');
      setShowError(true);
    }
  };

  const handleUpdatefolder = async () => {
    if (!updatefolder.trim()) {
      setErrorMessage('Folder name cannot be empty.');
      setShowError(true);
      return;
    }

    const payload = {
      folder_name: updatefolder,
      skill_type_id: updateSkillTypeID,
      folder_logo: updateFolderLogo,
      syllabus: updateSyllabus
    };

    try {
      const response = await updatefolderApi(updatefolderId, payload);
      const updatedItem = {
        ...response,
        skill_type_name: filteredSkillTypes.find(s => s.value === updateSkillTypeID)?.label || '',
        question_type_id: updateQuesType.value,
        question_type_name: updateQuesType.label,
      };

      setfolders((prev) =>
        prev.map(item => item.id === updatefolderId ? updatedItem : item)
      );

      setErrorMessage('Folder updated successfully.');
      setShowError(true);

      setUpdatefolder('');
      setUpdatefolderId(null);
      setupdateskillType(null);
      setUpdateQuesType(null);
      setUpdateSkillTypeID(null);
      setUpdateFolderLogo(null);
      setUpdateSyllabus('');
      setShowUpdateForm(false);
    } catch (error) {
      console.error("❌ Error updating folder:", error);
      setErrorMessage('Exists data or Update failed. Please try again.');
      setShowError(true);
    }
  };

  const handleDeletefolder = async (folderId) => {
    try {
      await deletefolderApi(folderId);
      setfolders(folders.filter((type) => type.id !== folderId));
      setErrorMessage('Data Deleted Successfully');
      setShowError(true);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to delete skill type. Please try again.');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const filteredfolders = folders.filter((skill) =>
    skill.folder_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredfolders.length / itemsPerPage);
  const currentfolders = filteredfolders.slice(
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
    <div className='form-ques-settings'>
      <input
        type="text"
        className="search-box1-settings"
        placeholder="Search folders..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button
        className='button-ques-save-add'
        style={{ marginTop: "30px" }}
        onClick={() => {
          setShowAddForm(true);
          setShowUpdateForm(false);
          setNewfolder('');
          setSelectedskilltypeID(null);
          setSelectedQuestionType(null);
          setNewFolderLogo(null);
          setNewSyllabus('');
        }}
      >
        <img src={Add} className='nextarrow' alt="Add" style={{ marginRight: "2px" }} />
        <strong>Add</strong>
      </button>
      <p></p>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="popup-container">
          <label>Folder Name</label>
          <input
            type="text"
            autoComplete="off"
            className='input-ques-st'
            value={newfolder}
            onChange={(e) => setNewfolder(e.target.value)}
            placeholder="Enter Folder Name"
          />
          <p></p>

          <label>Question Type</label>
          <Select
            options={questionTypeOptions}
            value={selectedQuestionType}
            onChange={setSelectedQuestionType}
            placeholder="Select Question Type"
            styles={customStyles}
          />
          <p></p>

          <label>Skill Type</label>
          <Select
            options={filteredSkillTypes}
            value={selectedskilltypeID}
            onChange={setSelectedskilltypeID}
            placeholder="Select Skill Type"
            styles={customStyles}
            isDisabled={!selectedQuestionType}
          />
          <p></p>

          <label>Logo : </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleNewFolderLogoChange}
          />
          <p></p>

          <label>Syllabus (Embed Code)</label>
          <textarea
            className='input-ques-st'
            value={newSyllabus}
            onChange={(e) => setNewSyllabus(e.target.value)}
            placeholder="Paste embed code or text"
          />
          <p></p>

          <div className='button-container-set'>
            <button className='button-ques-save-st' onClick={handleAddfolder}>Save</button>
            <button className='cancel-master' onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* UPDATE FORM */}
      {showUpdateForm && (
        <div className="popup-container">
          <label>Folder Name</label>
          <input
            type="text"
            autoComplete="off"
            className='input-ques-st'
            value={updatefolder}
            onChange={(e) => setUpdatefolder(e.target.value)}
            placeholder="Enter updated folder name"
          />
          <p></p>

          <label>Question Type</label>
          <Select
            options={questionTypeOptions}
            value={questionTypeOptions.find(
              (opt) => String(opt.value) === String(updateQuesType?.value)
            ) || null}
            placeholder="Select Question Type"
            onChange={(selected) => {
              setUpdateQuesType(selected);
              setUpdateSkillTypeID(null);
            }}
            styles={customStyles}
          />
          <p></p>

          <label>Skill Type</label>
          <Select
            options={filteredSkillTypes}
            value={
              filteredSkillTypes.find(
                (opt) => String(opt.value) === String(updateSkillTypeID)
              ) || null
            }
            onChange={(selected) => setUpdateSkillTypeID(selected?.value)}
            placeholder="Select Skill Type"
            styles={customStyles}
            isDisabled={!updateQuesType}
          />
          <p></p>

          <label>Logo : </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpdateFolderLogoChange}
          />
          {updateFolderLogo && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={`data:image/png;base64,${updateFolderLogo}`}
                alt="Folder Logo Preview"
                style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid #ccc' }}
              />
            </div>
          )}
          <p></p>

          <label>Syllabus (Embed Code)</label>
          <textarea
            className='input-ques-st'
            value={updateSyllabus}
            onChange={(e) => setUpdateSyllabus(e.target.value)}
            placeholder="Edit embed code or text"
          />
          <p></p>

          <div className='button-container-set'>
            <button className='button-ques-save-st' onClick={handleUpdatefolder}>Update</button>
            <button className='cancel-master' onClick={() => setShowUpdateForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className='table-responsive-settings'>
        <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th>Skill Type</th>
              <th>Folder Name</th>
              <th>Logo</th>
              <th>Syllabus</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {currentfolders
              .filter(content => !searchQuery || (content.folder_name && content.folder_name.toLowerCase().includes(searchQuery.toLowerCase())))
              .map((type) => (
                <tr key={type.id}>
                  <td>{type.skill_type_name}</td>
                  <td>{type.folder_name}</td>
                  <td>
                    {type.folder_logo ? (
                      <img
                        src={`data:image/png;base64,${type.folder_logo}`}
                        alt="Folder Logo"
                        style={{ width: 40, height: 40, objectFit: 'contain' }}
                      />
                    ) : (
                      <span>No logo</span>
                    )}
                  </td>
                  <td>{type.syllabus ? "Uploaded" : "Not uploaded"}</td>
                  <td>
                    <button className="action-button edit" onClick={() => handleEditClick(type)}>✏️</button>
                  </td>
                  <td>
                    <button className="action-button delete" style={{ color: "orange" }} onClick={() => handleDeletefolder(type.id)}>🗑</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <p></p>

        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
          <Form.Label className='display'>Display:</Form.Label>
          <Form.Control
            className='label-dis'
            style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
            as="select"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
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
    </div >
  );
};

export default FolderManagement;
