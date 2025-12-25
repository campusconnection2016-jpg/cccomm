import React, { useEffect, useState } from 'react';
import { getEmployeeByUsername, updateEmployeeByUsername } from '../../api/endpoints';
import { Row, Col, Form, Button } from 'react-bootstrap'
const UpdateForm = ({ username, onUploadComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    emp_id: '',
    email_id: '',
    mobile_no: '',
    location: '',
    designation: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (username) {
      fetchEmployeeDetails();
    }
  }, [username]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await getEmployeeByUsername(username);
      setFormData(res);
    } catch (err) {
      console.error("❌ Error fetching employee:", err);
      setMessage('Employee not found.');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await updateEmployeeByUsername(username, formData);
      setMessage(res.message || 'Update successful!');
      if (onUploadComplete) {
        onUploadComplete(); // back to dashboard
      }
    } catch (err) {
      console.error("❌ Update failed:", err);
      setMessage('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-ques-emp-db" style={{ height: "auto" }}>
      <h6>Update Employee Info</h6><p></p>
     
     <form onSubmit={handleSubmit}>
  <Row className="mb-3">
    <Col md={4}>
      <Form.Group controlId="formName">
        <label>Name</label><p></p>
        <input
          type="text"
          className='input-ques'
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Enter name"
        />
      </Form.Group>
    </Col>
    <Col md={4}>
      <Form.Group controlId="formEmpId">
        <label>Employee ID</label><p></p>
        <input
          type="text"
          name="emp_id"
           className='input-ques'
          value={formData.emp_id || ''}
          onChange={handleChange}
         disabled

        />
      </Form.Group>
    </Col>
    <Col md={4}>
      <Form.Group controlId="formEmail">
        <label>Email</label><p></p>
        <input
          type="email"
          name="email_id"
           className='input-ques'
          value={formData.email_id || ''}
          onChange={handleChange}
          placeholder="Enter email"
        />
      </Form.Group>
    </Col>
  </Row>

  <Row className="mb-3">
    <Col md={4}>
      <Form.Group controlId="formMobile">
        <label>Mobile No</label><p></p>
        <input
          type="text"
          name="mobile_no"
           className='input-ques'
          value={formData.mobile_no || ''}
          onChange={handleChange}
          placeholder="Enter mobile number"
        />
      </Form.Group>
    </Col>
    <Col md={4}>
      <Form.Group controlId="formLocation">
        <label>Location</label><p></p>
        <input
          type="text"
          name="location"
           className='input-ques'
          value={formData.location || ''}
          onChange={handleChange}
          placeholder="Enter location"
        />
      </Form.Group>
    </Col>
    <Col md={4}>
      <Form.Group controlId="formDesignation">
        <label>Designation</label><p></p>
        <input
          type="text"
          name="designation"
           className='input-ques'
          value={formData.designation || ''}
          onChange={handleChange}
          placeholder="Enter designation"
        />
      </Form.Group>
    </Col>
  </Row>  <p></p>      
  <button type="submit" className='button-ques-save' disabled={loading}>
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
      <p></p>
       {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateForm;
