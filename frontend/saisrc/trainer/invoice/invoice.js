import React, { useState, useRef, useEffect } from "react";
import {
  getcollegeApi,
  addInvoiceApi,
  Get_Invoice_API,
  getTrainerApi,
  Get_InvoiceWithschedule_API,
  getTrainerByUsername,
} from "../../api/endpoints";
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
import { Col, Row, Form } from "react-bootstrap";
import DatePicker from "react-datepicker"; // Adjust the import according to the library you're using
import Select from "react-select"; // Import Select if using react-select
import "react-datepicker/dist/react-datepicker.css"; // Import styles for DatePicker
import jsPDF from "jspdf";
import "jspdf-autotable";
import ErrorModal from "../../components/auth/errormodal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

import InvoiceTB from "./invoicetable";


function InvoiceForm({ username }) {
  const [formData, setFormData] = useState({
    college_id: null,
    misc_expenses: null,
    travel_expenses: null,
    food_allowance: null,
    misc_expenses_type: "",
    trainer_id: "",
    // dtm_start: "",
    // dtm_end: "",
    overall_feedback: "",
    //food_days: "",
    travel_amount: "",
    print_amount: "",
    // food_amount: "",
    travel_days: "",
    // print_days: "",
    invoice_no: "",
    is_tds_deduction: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null); // New state for invoice details
  const [college, setCollege] = useState([]); // For storing college options
  const [trainer, setTrainer] = useState([]); // For storing trainer options
  const [trainerId, setTrainerId] = useState(""); // For storing selected trainer ID
  const [selectedCollege, setSelectedCollege] = useState(null); // For storing selected college
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState([]);
  const [fileNames, setFileNames] = useState({
    miscExpenses: "",
    travelExpenses: "",
    foodAllowance: "",
  });

  // Create a ref for the file input
  const miscExpensesInputRef = useRef(null);
  const foodAllowanceInputRef = useRef(null);
  const travelExpensesInputRef = useRef(null);
  const handleCloseError = () => {
    setShowError(false);
  };

  const handleFileChange = (e) => {
    // const { name, files } = e.target;
    // setFormData((prevFormData) => ({
    //   ...prevFormData,
    //   [name]: files[0],
    // }));
    const { name, files } = e.target;
    if (files.length > 0) {
      console.log("File selected:", files[0].name);
      setFileNames((prev) => ({
        ...prev,
        [name]: files[0].name,
      }));
    }
  };

  const handleUploadClick = () => {
    if (miscExpensesInputRef.current) {
      // Ensure the ref is defined before triggering the click
      miscExpensesInputRef.current.click();
    } else {
      console.error("The file input ref is not defined.");
    }
  };
  const handleTravelExpensesUploadClick = () => {
    if (travelExpensesInputRef.current) {
      travelExpensesInputRef.current.click();
    } else {
      console.error("The travelExpenses file input ref is not defined.");
    }
  };

  const handleFoodAllowanceUploadClick = () => {
    if (foodAllowanceInputRef.current) {
      foodAllowanceInputRef.current.click();
    } else {
      console.error("The foodAllowance file input ref is not defined.");
    }
  };

  useEffect(() => {
    async function fetchInvoiceDetails() {
      try {
        const data = await getTrainerByUsername(username);
        console.log("API response:", data); // Check the whole response

        if (data && Array.isArray(data) && data.length > 0) {
          const courseSchedule = data[0]; // Assuming you want the first item

          setInvoiceDetails({
            collegeName: courseSchedule.collegeName,
            trainer_name: courseSchedule.trainer_name,
            bank_name: courseSchedule.bank_name,
            branch_name: courseSchedule.branch_name,
            account_no: courseSchedule.account_no,
            ifsc_code: courseSchedule.ifsc_code,
            city: courseSchedule.city,
            pan_number: courseSchedule.pan_number,
            // Start_Date: courseSchedule.Start_Date,
            /// End_Date: courseSchedule.End_Date,
            address: courseSchedule.address,
          });

          // Set invoice details directly from courseSchedule
          setFormData((prevFormData) => ({
            ...prevFormData,
            invoice_no: courseSchedule.invoice_no,
            travel_amount: courseSchedule.travel_amount || "",
            print_amount: courseSchedule.print_amount || "",
            // food_amount: courseSchedule.food_amount || "",
            travel_days: courseSchedule.travel_days || "",
            // print_days: courseSchedule.print_days || "",
            // food_days: courseSchedule.food_days || "",
            // training_days: courseSchedule.training_days || "",
            //  training_amount: courseSchedule.training_amount || "",
            is_tds_deduction: courseSchedule.is_tds_deduction || "",
            misc_expenses: courseSchedule.misc_expenses || "",
            travel_expenses: courseSchedule.travel_expenses || "",
            food_allowance: courseSchedule.food_allowance || "",
            misc_expenses_type: courseSchedule.misc_expenses_type || "",

            overall_feedback: courseSchedule.overall_feedback || "",
          }));

          console.log("Form data set:", formData);
        } else {
          console.error(
            "Error: No course schedule found for the given username."
          );
          setErrorMessage("No course schedule found for the given username.");
          setShowError(true);
        }
      } catch (error) {
        console.error("Error fetching course schedule:", error);
        setErrorMessage("Error fetching course schedule.");
        setShowError(true);
      }
    }

    fetchInvoiceDetails();
  }, [username]);

  console.log("user", username);
  useEffect(() => {
    // Fetch College Data
    getcollegeApi()
      .then((data) => {
        setCollege(
          data.map((item) => ({ value: item.id, label: item.college }))
        );
      })
      .catch((error) => console.error("Error fetching College:", error));

    // Fetch Trainer Data and find trainer ID that matches the username
    getTrainerApi()
      .then((data) => {
        // Set Trainer dropdown options
        setTrainer(
          data.map((item) => ({ value: item.id, label: item.user_name }))
        );

        // Find trainer ID based on the logged-in username
        const matchingTrainer = data.find(
          (trainer) => trainer.user_name === username
        );

        if (matchingTrainer) {
          console.log("Trainer ID for the logged-in user:", matchingTrainer.id);
          // You can set the trainer ID in your state if needed
          setTrainerId(matchingTrainer.id); // Assuming you have a state to store trainer ID
        } else {
          console.log("No matching trainer found for the username:", username);
        }
      })
      .catch((error) => console.error("Error fetching trainers:", error));
  }, [username]);

  useEffect(() => {
    if (selectedCollege && username) {
      console.log("Selected College ID:", selectedCollege.value);
      console.log("Logged-in Username:", username);

      Get_InvoiceWithschedule_API(username, selectedCollege.value)
        .then((data) => {
          console.log("Fetched Invoice with Schedule Data:", data);
          setScheduleData(data.data); // Assuming the API returns a "data" field
          console.log(scheduleData); // Check if travel is "By Trainer"

        })
        .catch((error) =>
          console.error("Error fetching invoice with schedule data:", error)
        );
    }
  }, [selectedCollege, username]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const [errors, setErrors] = useState({});
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    const newErrors = {};
    const formDataWithDefaults = {
      ...formData,
      food_amount: formData.food_amount || '',  // Set to empty string if not provided
      misc_expenses: formData.misc_expenses || '', // Set to empty string if not provided
      travel_amount: formData.travel_amount || '', // Set to empty string if not provided
      travel_days: formData.travel_days || '', // Set to empty string if not provided
    };

    // Check if travel is "By Campus" and set the value to 0 for travel_amount and travel_days
    if (formDataWithDefaults.travel === "By Campus") {
      formDataWithDefaults.travel_amount = 0;
      formDataWithDefaults.travel_days = 0;
    }
    // Conditional validation for file fields based on amount fields

    // Check if there are any validation errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Set errors in state
      setIsSubmitting(false);
      return; // Stop submission due to validation errors
    } else {
      setErrors({});
    }


    // Prepare the data to be submitted, including optional file fields
    const invoiceData = {
      ...formData,
      trainer_id: trainerId, // Add trainer_id
      college_id: selectedCollege ? selectedCollege.value : null, // Add college_id
      misc_expenses: miscExpensesInputRef.current.files[0] || null, // File is optional
      travel_expenses: travelExpensesInputRef.current.files[0] || null, // File is optional
      food_allowance: foodAllowanceInputRef.current.files[0] || null, // File is optional
    };

    console.log("Submitting form data:", invoiceData); // Debug log

    try {
      const result = await addInvoiceApi(invoiceData); // API call to submit data
      // Handle success
      setErrorMessage("Form submitted successfully!");
      navigate("/InvoiceTB");
      setShowError(true);
      setCollege(null);


      setFormData({}); // Reset form data
      e.target.reset(); // Reset form if required
    } catch (error) {
      if (error.response && error.response.status === 400) {
          const errorMsg = error.response.data?.error || "An error occurred.";
          setErrorMessage(errorMsg); // Set error message from backend
      } else {
          setErrorMessage(`Error submitting form: ${error.message}`);
      }
      setShowError(true);
      console.error("Submission error details:", error);
    }
    setIsSubmitting(false); // Reset submission flag
  };




  return (
    <div className="form-ques-invoice">
      <form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <strong className="form-in">Invoice No:</strong>
            <p></p>
            <div>
              <input
                className="invoice-input"
                name="invoice_no"
                placeholder="Invoice No"
                value={formData.invoice_no}
                onChange={handleInputChange}
                required
                style={{
                  backgroundColor: "#39444e",
                  border: "1px solid white",
                  color: "white",
                  padding: "10px",
                  width: "73%",
                  height: "46px",
                  borderRadius: "5px",
                }}
              />
            </div>
          </Col>
          <Col className="flex">
            <div className="add-profile-train" controlId="college_name">
              <label className="label6-ques">College Name**</label>
              <p></p>
              <Select

                className="clg-invoice" // Use class for width control
                options={college}
                value={selectedCollege}
                onChange={setSelectedCollege}
                placeholder="Select College"
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: "#39444e", // Dark background
                    color: "white", // Text color
                    border: "1px solid white", // White border
                    boxShadow: "none", // Remove shadow
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: "white", // Color for the selected value
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: "#39444e", // Background color for dropdown menu
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isSelected ? "#2e3a44" : "#39444e", // Highlight selected option
                    color: "white", // Text color for options
                  }),
                  placeholder: (baseStyles) => ({
                    ...baseStyles,
                    color: "white", // Placeholder text color
                  }),
                  dropdownIndicator: (baseStyles) => ({
                    ...baseStyles,
                    color: "white", // Dropdown arrow color
                  }),
                }}
              />
            </div>
          </Col>

          <Col> <div className="form-group">
            <label className="label5-ques"> TDS Deduction Applicable
            </label><p></p>
            <input
              type="checkbox"
              name="is_tds_deduction"
              checked={formData.is_tds_deduction}
              onChange={(e) =>
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  is_tds_deduction: e.target.checked,
                }))
              }
            />

          </div>
          </Col>

        </Row>
        <p></p>

        <Row md={12}>
          <Col>
            <strong className="form-in">Misc Expenses:</strong>
            <p></p>
            <div
              className="invoice-input-drp"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid white",
                borderRadius: "5px",
                padding: "10px",
                backgroundColor: "#39444e",
                width: "70%",
                height: "80%",
              }}
            >
              <FontAwesomeIcon
                icon={faUpload}
                onClick={handleUploadClick}
                // onClick={() =>
                //   document.querySelector('input[name="misc_expenses"]').click()
                // }
                style={{
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              />

              <input
                type="file"
                name="miscExpenses"
                onChange={handleFileChange}
                ref={miscExpensesInputRef}
                style={{ display: "none" }}
              />
              {/* Display file name */}
              <span style={{ color: "white", marginRight: "10px" }}>
                {fileNames.miscExpenses || "No file selected"}
              </span>
              {/* Custom styled dropdown */}
              <div style={{ position: "relative", flexGrow: 1 }}>
                <select
                  id="misc_expenses_type"
                  name="misc_expenses_type"
                  value={formData.misc_expenses_type}
                  onChange={handleInputChange}
                  style={{
                    appearance: "none",
                    width: "100%",
                    backgroundColor: "#39444e",
                    color: "white",
                    padding: "5px 40px 5px 10px",
                    border: "none",
                    textAlign: "center",
                    outline: "none",
                  }}
                >
                  <option value="">Misc Expenses</option>
                  <option value="Auto">Auto</option>
                  <option value="Courier">Courier</option>
                  <option value="Print">Print</option>
                  <option value="Others">Others</option>
                </select>

                {/* Dropdown icon */}
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    borderTop: "6px solid white",
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                  }}
                ></span>
              </div>
            </div>
          </Col>

          <Col>
            <strong className="form-in">Travel Expenses:</strong>
            <p></p>
            <div
              className="invoice-input-drp"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid white",
                borderRadius: "5px",
                padding: "10px",
                backgroundColor: "#39444e",
                width: "70%",
                height: "80%",
              }}
            >
              <FontAwesomeIcon
                icon={faUpload}
                onClick={handleTravelExpensesUploadClick}
                style={{
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              />
              <input
                type="file"
                name="travelExpenses"
                onChange={handleFileChange}
                ref={travelExpensesInputRef}
                style={{ display: "none" }}
              />
              <span style={{ color: "white", marginRight: "10px" }}>
                {fileNames.travelExpenses || "No file selected"}
              </span>
            </div>
          </Col>

          <Col>
            <strong className="form-in">Food Allowance:</strong>
            <p></p>
            <div
              className="invoice-input-drp"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid white",
                borderRadius: "5px",
                padding: "10px",
                backgroundColor: "#39444e",
                width: "70%",
                height: "80%",
              }}
            >
              <FontAwesomeIcon
                icon={faUpload}
                onClick={handleFoodAllowanceUploadClick}
                style={{
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              />
              <input
                type="file"
                name="foodAllowance"
                onChange={handleFileChange}
                ref={foodAllowanceInputRef}
                style={{ display: "none" }}
              />
              <span style={{ color: "white", marginRight: "10px" }}>
                {fileNames.foodAllowance || "No file selected"}
              </span>
            </div>
          </Col>
        </Row>
        <p></p>

        <Row style={{ gap: "20px" }}>
          <Col>
            <strong className="form-in">Other Expenses</strong>
            <p></p>
            <div>
              <input
                className="invoice-input"
                name="print_amount"
                placeholder="Print Amount"
                value={formData.print_amount}
                onChange={handleInputChange}

                style={{
                  backgroundColor: "#39444e",
                  border: "1px solid white",
                  color: "white",
                  padding: "10px",
                  width: "73%",
                  height: "46px",
                  borderRadius: "5px",
                  marginLeft: "-2px"
                }}
              />

            </div>
            {errors.miscExpenses && <span style={{ color: ' #F1A128' }}>{errors.miscExpenses}</span>}

          </Col>
          <Col>
            <strong className="form-in">Overall Feedback:</strong>
            <p></p>
            <div>
              <textarea
                className="invoice-input"
                name="overall_feedback"
                placeholder="Overall Feedback"
                value={formData.overall_feedback}
                onChange={handleInputChange}
                required
                style={{
                  backgroundColor: "#39444e",
                  border: "1px solid white",
                  color: "white",
                  padding: "10px",
                  width: "73%",
                  height: "46px",
                  borderRadius: "5px",
                  resize: "none",
                  marginLeft: "-7px"
                }}
              />
            </div>
          </Col>
          {scheduleData && scheduleData.length > 0 && scheduleData[0].travel === "By Trainer" ? (
            <Col>
              <strong className="form-in">Travel Days:</strong>
              <p></p>
              <div>
                <textarea
                  className="invoice-input"
                  name="travel_days"
                  placeholder="Travel Days"
                  value={formData.travel_days}
                  onChange={handleInputChange}
                  required
                  style={{
                    backgroundColor: "#39444e",
                    border: "1px solid white",
                    color: "white",
                    padding: "10px",
                    width: "73%",
                    height: "46px",
                    borderRadius: "5px",
                    resize: "none",
                  }}
                />
              </div>
            </Col>
          ) : (
            <Col>
              {/* Empty column to maintain layout structure */}
            </Col>
          )}

          {/*}  <Col>
            <strong className="form-in">Food Expenses:</strong>
            <p></p>
            <div>
              <input
                className="invoice-input"
                name="food_amount"
                placeholder="Food Amount"
                value={formData.food_amount}
                onChange={handleInputChange}
                
                style={{
                  backgroundColor: "#39444e",
                  border: "1px solid white",
                  color: "white",
                  padding: "10px",
                  width: "73%",
                  height: "46px",
                  borderRadius: "5px",
                  marginLeft: "-7px"
                }}
              />

            </div>
            {errors.foodAllowance && <span style={{ color: ' #F1A128' }}>{errors.foodAllowance}</span>}

          </Col>*/}


        </Row>
        <p></p>
        {scheduleData && scheduleData.length > 0 && scheduleData[0].travel === "By Trainer" && (
          <Row>
            <Col className="column">
              <strong className="form-in">Travel Expenses:</strong>
              <p></p>
              <div>
                <input
                  className="invoice-input"
                  name="travel_amount"
                  placeholder="Travel Amount"
                  value={formData.travel_amount}
                  onChange={handleInputChange}
                  style={{
                    backgroundColor: "#39444e",
                    border: "1px solid white",
                    color: "white",
                    padding: "10px",
                    width: "73%",
                    height: "46px", // Even height for all inputs
                    borderRadius: "5px", // Border radius for uniform appearance
                  }}
                />
              </div>
            </Col>
            <Col></Col>
            <Col></Col>
          </Row>
        )}

        {invoiceDetails && (
          <Row style={{ gap: "20px", marginTop: "20px" }}>
            <Col>
              <strong className="form-in">Account No:</strong>
              <p></p>
              <div>
                <input
                  className="invoice-input"
                  name="account_no"
                  placeholder="Account No"
                  value={invoiceDetails.account_no || ""}
                  readOnly
                  style={{
                    backgroundColor: "#39444e",
                    border: "1px solid white",
                    color: "white",
                    padding: "10px",
                    width: "73%",
                    height: "46px",
                    borderRadius: "5px",
                  }}
                />
              </div>
            </Col>
            <Col>
              <strong className="form-in">Address:</strong>
              <p></p>
              <div>
                <input
                  className="invoice-input"
                  name="address"
                  placeholder="Address"
                  value={invoiceDetails.address || ""}
                  readOnly
                  style={{
                    backgroundColor: "#39444e",
                    border: "1px solid white",
                    color: "white",
                    padding: "10px",
                    width: "73%",
                    height: "46px",
                    borderRadius: "5px",
                    marginLeft: "-7px"
                  }}
                />
              </div>
            </Col>
            <Col>
              <strong className="form-in">PAN Number:</strong>
              <p></p>
              <div>
                <input
                  className="invoice-input"
                  name="pan_number"
                  placeholder="PAN Number"
                  value={invoiceDetails.pan_number || ""}
                  readOnly
                  style={{
                    backgroundColor: "#39444e",
                    border: "1px solid white",
                    color: "white",
                    padding: "10px",
                    width: "73%",
                    height: "46px",
                    borderRadius: "5px",
                    marginLeft: "-7px"
                  }}
                />
              </div>
            </Col>
          </Row>
        )}
        <p style={{ height: "50px" }}></p>
        <Row
          className="btns-invoice"
          style={{ gap: "20px", marginTop: "20px" }}
        >


          <Col>
            <div className="button-container-lms">

              <button

                className="button-ques-back btn btn-secondary back-button-lms"
                style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128' }}

              ><img src={Back} className='nextarrow' ></img>
                <span className="button-text">Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="button-invoice-save"
                style={{
                  backgroundColor: "#f1a128", // Yellow background for button
                  border: "1px solid black",
                  color: "black",
                  padding: "10px",
                  width: "100px",
                  height: "46px",
                  borderRadius: "5px",
                }}
              >
                Submit
              </button>

              <button
                onClick={() => navigate("/InvoiceTB")}
                className="button-invoice-save"
                style={{
                  backgroundColor: "#f1a128", // Yellow background for button
                  border: "1px solid black",
                  color: "black",
                  padding: "10px",
                  width: "100px",
                  height: "46px",
                  borderRadius: "5px",
                }}
              >
                <span className="button-text">Next</span><img src={Next} className='nextarrow'></img>

              </button>
            </div>
          </Col>
        </Row>
      </form>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
}

export default InvoiceForm;
