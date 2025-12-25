import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import {
 
  assignTestToEmployees,
  getEmployeeDropdown,
  getLocationDropdown,
} from "../../api/endpoints";
import { Col, Row, Form, Button, Modal } from 'react-bootstrap';
import CustomOption from '../../components/test/customoption'
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
const AddTest = () => {
  const { test_type } = useParams();

  const [employeeList, setEmployeeList] = useState([]);
  const [locationList, setLocationList] = useState([]);

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [startDateTime, setStartDateTime] = useState(null);

  useEffect(() => {
    getEmployeeDropdown().then((data) => {
      const options = data.map((emp) => ({
        value: emp.emp_id,
        label: `${emp.name} (${emp.emp_id})`,
      }));
      setEmployeeList(options);
    });

    getLocationDropdown().then((data) => {
      const options = data.map((loc) => ({
        value: loc,
        label: loc,
      }));
      setLocationList(options);
    });
  }, []);

  const handleAssignTest = async () => {
    if (!startDateTime || !test_type) {
      alert("Please select test date and test type.");
      return;
    }

    const payload = {
      test_type,
      test_date: startDateTime.toISOString().split("T")[0],
    };

    if (selectedEmployees.length > 0) {
      payload.employee_ids = selectedEmployees.map((emp) => emp.value);
    } else if (selectedLocations.length > 0) {
      // Send only first location (if only one allowed), or handle multi-location server-side
      payload.location = selectedLocations.map((loc) => loc.value);  // ✅ Send as array

     // payload.location = selectedLocations.map((loc) => loc.value).join(",");
    } else {
      alert("Select at least one employee or location.");
      return;
    }

    try {
      const res = await assignTestToEmployees(payload);
      alert(res.message);
    } catch (err) {
      alert("Failed to assign test: " + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className='form-ques-compo' >
    <div>
      <h6>Assign  Test</h6><p></p>

      <div
        className="form-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Location Multi-Select */}
        <Row>
        <div>
          <label>Select Location(s):</label><p></p>
          <Select
            isMulti
            options={locationList}
            value={selectedLocations}
            onChange={setSelectedLocations}
            classNamePrefix="select"
            placeholder="Select location(s)..."
             components={{ Option: CustomOption }}
             closeMenuOnSelect={false}
             styles={customStyles}
          />
        </div>
</Row><p></p>
<Row>
        {/* Employee Multi-Select */}
        <div>
          <label>Select Employee(s):</label><p></p>
          <Select
            isMulti
            options={employeeList}
            value={selectedEmployees}
            onChange={setSelectedEmployees}
            classNamePrefix="select"
            placeholder="Select employee(s)..."
             components={{ Option: CustomOption }}
             closeMenuOnSelect={false}
             styles={customStyles}
          />
        </div>
</Row><p></p>

        {/* Test Date Picker */}
        <Row>
        <div>
          <label>Test Date & Time:</label><p></p>
          <DatePicker
            name="test_date"
            selected={startDateTime}
            onChange={(date) => setStartDateTime(date)}
            timeFormat="hh:mm aa"
            timeIntervals={15}
            dateFormat="dd-MM-yyyy, h:mm aa"
            showTimeSelect
           
            autoComplete="off"
            className='input-date-custom'
                                                styles={customStyles}
            required
          />
        </div></Row><p></p>
      </div>

      <br />
      <button onClick={handleAssignTest} className="button-ques-save">
        Assign Test
      </button>
      </div> 
    </div>
  );
};

export default AddTest;
