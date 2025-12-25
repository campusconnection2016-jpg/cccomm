// OnlineMockTest.js
import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import './Test.css';
import { addTestsApi, getTestsApi,updateTestsApi, deleteTestsApi,getcollegeApi,getdepartmentApi,gettesttypeApi,getqstntypeApi } from '../../api/endpoints';
const OnlineMockTest = () => {
  const [formData, setFormData] = useState({
    test_name: '',
    test_type: '',
    question_type: '',
    students: '',
     dtm_start: '',
     dtm_end: '',
    college_name: '',
    duration: '',
    year: '',
    department: '',
    rules: '',
    start_stop: '',
    need_candidate_info: '',
    remarks: '',
  });
  const [testTypes, setTestTypes] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDropdownOptions();
    fetchTests();
  }, []);
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const [tests, setTests] = useState([]);

  const fetchDropdownOptions = () => {
    // Fetch test types
    gettesttypeApi()
      .then(data => {
        setTestTypes(data);
        console.log("test1",data)
      })
      .catch(error => {
        console.error('Error fetching test types:', error);
      });

    // Fetch question types
    getqstntypeApi()
      .then(data => {
        setQuestionTypes(data);
        console.log("test2",data)
      })
      .catch(error => {
        console.error('Error fetching question types:', error);
      });

    // Fetch colleges
    getcollegeApi()
      .then(data => {
        setColleges(data);
        console.log("test3",data)
      })
      .catch(error => {
        console.error('Error fetching colleges:', error);
      });

    // Fetch departments
    getdepartmentApi()
      .then(data => {
        setDepartments(data);
        console.log("test4",data)
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });
  };

  const fetchTests = () => {
    getTestsApi()
      .then(data => {
        setTests(data);
      })
      .catch(error => {
        console.error('Error fetching tests:', error);
      });
  };
 

 
  const handleSubmit = e => {
    e.preventDefault();
    console.log("test2",formData)
    addTestsApi(formData)
      .then(() => {
        console.log('Test added successfully');
       
        setFormData({
          test_name: '',
          test_type: '',
          question_type: '',
          students: '',
           dtm_start: '',
           dtm_end: '',
          college_name: '',
          duration: '',
          year: '',
          department: '',
          rules: '',
          start_stop: '',
          need_candidate_info: '',
          remarks: '',
        });
      })
      .catch(error => {
        console.error('Error adding test:', error);
      });
  };
  const handleUpdate = async (id) => {
    try {
      const updatedTest = await updateTestsApi(id, formData);
      console.log('Test updated successfully:', updatedTest);
      fetchTests(); // Refresh tests data after updating
    } catch (error) {
      console.error('Error updating test:', error);
    }
  };

  // Function to handle delete operation
  const handleDelete = async (id) => {
    try {
      const deletedTest = await deleteTestsApi(id);
      console.log('Test deleted successfully:', deletedTest);
      fetchTests(); // Refresh tests data after deletion
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };
  return (
    <div>
      <h1>Add New Test</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-columns">
          <div className="column">
            <div>
              <label>Test Name:</label>
              <input type="text" name="test_name" value={formData.test_name} onChange={handleChange} />
            </div>
            <div>
              <label>Test Type:</label>
              <select name="test_type" value={formData.test_type} onChange={handleChange}>
                <option value="">Select Test Type</option>
                {testTypes.map((type,index) => (
                  <option key={index} value={type.test_type}>{type.test_type}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Question Type:</label>
              <select name="question_type" value={formData.question_type} onChange={handleChange}>
                <option value="">Select Question Type</option>
                {questionTypes.map((type,index) => (
                  <option key={index} value={type.question_type}>{type.question_type}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Students:</label>
              <input type="number" name="students" value={formData.students} onChange={handleChange} />
            </div>
            <div>
              <label>Start Date and Time:</label>
              <input type="datetime-local" name=" dtm_start" value={formData. dtm_start} onChange={handleChange} />
            </div>
          </div>
          <div className="column">
            <div>
              <label>End Date and Time:</label>
              <input type="datetime-local" name=" dtm_end" value={formData. dtm_end} onChange={handleChange} />
            </div>
           
           
            <div>
              <label>Duration:</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} />
            </div>
            <div>
              <label>Year:</label>
              <input type="text" name="year" value={formData.year} onChange={handleChange} />
            </div>
            <div>
              <label>College Name:</label>
              <select name="college_name" value={formData.college_name} onChange={handleChange}>
                <option value="">Select College</option>
                {colleges.map((college,index) => (
                  <option key={index} value={college.college}>{college.college}</option>
                ))}
              </select>
            </div>
            <div>
  <label>Department:</label>
  <select name="department" value={formData.department} onChange={handleChange}>
    <option value="">Select Department</option>
    {departments.map((department, index) => (
      <option key={index} value={department.department}>{department.department}</option>
    ))}
  </select>
</div>

            <div>
              <label>Rules:</label>
              <input type="text" name="rules" value={formData.rules} onChange={handleChange} />
            </div>
            <label className="toggle-switch">
            <label>Start/stop</label>
            <input type="checkbox" name="start_stop" checked={formData.start_stop} onChange={handleChange} />
            </label>
            <div>
              <label>Need Candidate Info:</label>
              <input type="checkbox" name="need_candidate_info" checked={formData.need_candidate_info} onChange={handleChange} />
            </div>
            <div>
              <label>Remarks:</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange}></textarea>
            </div>
          </div>
        </div>
        <button type="submit">Add Test</button>
      </form>
      <table className="test-table">
  <thead>
    <tr>
      <th>Test Name</th>
      <th>Test Type</th>
      <th>Question Type</th>
      <th>Students</th>
      <th>Start Date and Time</th>
      <th>End Date and Time</th>
      <th>College Name</th>
      <th>Duration</th>
      <th>Year</th>
      <th>Department</th>
      <th>Rules</th>
      <th>Video On/Off</th>
      <th>Need Candidate Info</th>
      <th>Remarks</th>
      <th>Action</th>
      {/* Add more table headers as needed */}
    </tr>
  </thead>
  <tbody>
    {tests.map(test => (
      <tr key={test.id}>
        <td>{test.test_name}</td>
        <td>{test.test_type}</td>
        <td>{test.question_type}</td>
        <td>{test.students}</td>
        <td>{test. dtm_start}</td>
        <td>{test. dtm_end}</td>
        <td>{test.college_name}</td>
        <td>{test.duration}</td>
        <td>{test.year}</td>
        <td>{test.department}</td>
        <td>{test.rules}</td>
        <td>{test.start_stop}</td>
        <td>{test.need_candidate_info}</td>
        <td>{test.remarks}</td>
        <td>
        <button onClick={() => handleUpdate(test.id)}>Update</button>
        <button onClick={() => handleDelete(test.id)}>Delete</button>
      </td>
        {/* Add more table data cells as needed */}
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
};

export default OnlineMockTest;