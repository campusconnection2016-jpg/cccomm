import React, { useState } from "react";
import { createEmployeeApi } from "../../api/endpoints";
import { Row, Col } from "react-bootstrap";
const EmployeeForm = () => {
  const [formData, setFormData] = useState({
    emp_id: "",
    password: "",
    name: "",
    designation: "",
    location: "",
    mobile_no: "",
    email_id: "",
    created_by: "",
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emp_id || !formData.password) {
      setMessage("❗ emp_id and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createEmployeeApi(formData);
      setMessage("✅ Employee created successfully!");
      setFormData({
        emp_id: "",
        password: "",
        name: "",
        designation: "",
        location: "",
        mobile_no: "",
        email_id: "",
        created_by: "",
      });
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.detail || "Failed to create employee."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
   <div>
      <h6>Add New Employee</h6><p></p>
      <form onSubmit={handleSubmit} className="employee-form">

        {/* Row 1 */}
        <Row className="mb-3">
          <Col md={4}>
            <label>Employee ID*</label><p></p>
            <input type="text" name="emp_id" value={formData.emp_id} onChange={handleChange} className="input-ques" required />
          </Col>
          <Col md={4}>
            <label>Password*</label><p></p>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-ques" required />
          </Col>
          <Col md={4}>
            <label>Name</label><p></p>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-ques" />
          </Col>
        </Row>

        {/* Row 2 */}
        <Row className="mb-3">
          <Col md={4}>
            <label>Designation</label><p></p>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="input-ques" />
          </Col>
          <Col md={4}>
            <label>Location</label><p></p>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-ques" />
          </Col>
          <Col md={4}>
            <label>Mobile No</label><p></p>
            <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleChange} className="input-ques" />
          </Col>
        </Row>

        {/* Row 3 */}
        <Row className="mb-3">
          <Col md={4}>
            <label>Email</label><p></p>
            <input type="email" name="email_id" value={formData.email_id} onChange={handleChange} className="input-ques" />
          </Col>
          <Col md={4}>
            <label>Created By</label><p></p>
            <input type="text" name="created_by" value={formData.created_by} onChange={handleChange} className="input-ques" />
          </Col>
        </Row>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
  <button type="submit" disabled={submitting} className='button-ques-save' >
    {submitting ? "Submitting..." : "Submit"}
  </button>
</div>

      </form>

      {message && (
        <p style={{ marginTop: "10px", color: message.includes("❌") ? "orange" : "white" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EmployeeForm;
