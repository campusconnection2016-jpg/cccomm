import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getqstntypeTrainingApi, getSkillTypesByQuestionType_API, getFoldersBySkillType_API,addTrainingTopics_API  } from "../../api/endpoints";

const AddTopicsModal = ({ show, onClose, scheduleId,onTopicsAdded }) => {
  const [questionTypes, setQuestionTypes] = useState([]);
  const [skillTypes, setSkillTypes] = useState([]);
  const [folders, setFolders] = useState([]);

  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [selectedSkillType, setSelectedSkillType] = useState("");
  const [selectedFolders, setSelectedFolders] = useState([]);

  // Load Question Types initially
  useEffect(() => {
    if (show) {
      getqstntypeTrainingApi().then(setQuestionTypes);
      setSkillTypes([]);
      setFolders([]);
      setSelectedQuestionType("");
      setSelectedSkillType("");
      setSelectedFolders([]);
    }
  }, [show]);

  // Load Skill Types when Question Type changes
  useEffect(() => {
    if (selectedQuestionType) {
      getSkillTypesByQuestionType_API(selectedQuestionType).then(setSkillTypes);
      setFolders([]);
      setSelectedSkillType("");
    }
  }, [selectedQuestionType]);

  // Load Folders when Skill Type changes
  useEffect(() => {
    if (selectedSkillType) {
      getFoldersBySkillType_API(selectedSkillType).then(setFolders);
    }
  }, [selectedSkillType]);

  const handleFolderCheck = (folderId) => {
    setSelectedFolders(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const handleSave = async () => {
    if (selectedFolders.length === 0) {
      alert("Please select at least one topic.");
      return;
    }

    const result = await addTrainingTopics_API(scheduleId, selectedFolders);
   if (onTopicsAdded) onTopicsAdded(); 
    if (result.success) {
      alert("✅ Topics added successfully!");
      onClose();
    } else {
      alert("❌ Failed to add topics.");
    }
  };

  return (
   <Modal show={show} onHide={onClose} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Add Topics</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    
    {/* Dropdowns in one row */}
    <div className="dropdown-row" style={{marginTop:"-20px"}}>
      <Form.Group className="form-group">
        <Form.Label>Question Type</Form.Label>
        <Form.Select value={selectedQuestionType} onChange={e => setSelectedQuestionType(e.target.value)}>
          <option value="">-- Select Question Type --</option>
          {questionTypes.map(qt => (
            <option key={qt.id} value={qt.id}>{qt.question_type}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="form-group">
        <Form.Label>Skill Type</Form.Label>
        <Form.Select value={selectedSkillType} onChange={e => setSelectedSkillType(e.target.value)}>
          <option value="">-- Select Skill Type --</option>
          {skillTypes.map(st => (
            <option key={st.id} value={st.id}>{st.skill_type}</option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
<p></p>
    {/* Topics in 3 columns */}
    {folders.length > 0 && (
      <div >
        <label>Topics</label>
        <div className="folder-grid" style={{marginTop:"5px"}}>
          {folders.map(folder => (
            <Form.Check
              key={folder.id}
              type="checkbox"
              label={folder.folder_name}
              checked={selectedFolders.includes(folder.id)}
              onChange={() => handleFolderCheck(folder.id)}
            />
          ))}
        </div>
      </div>
    )}
  </Modal.Body>
<div style={{marginTop:"-30px"}}>
  <Modal.Footer>
    <Button variant="secondary" onClick={onClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </Modal.Footer></div>
</Modal>

  );
};

export default AddTopicsModal;
