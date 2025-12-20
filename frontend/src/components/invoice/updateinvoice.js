import React, { useEffect, useState ,useRef} from "react";
import { useParams } from "react-router-dom";
import { Get_Invoice_API, updateCCInvoiceApi, getcollegeApi } from "../../api/endpoints";
import { Col ,Row} from "react-bootstrap";
import Next from '../../assets/images/nextarrow.png'
import Back from '../../assets/images/backarrow.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import ErrorModal from '../auth/errormodal';
const UpdateInvoice = () => {
  const { invoice_no } = useParams(); // Get the invoice_no from the URL
   const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    invoice_no: "",
    college_id: "",
    training_days: "",
    training_amount: "",
    misc_expenses: null,
    travel_expenses: null,
    food_allowance: null,
    misc_expenses_type: "",
    overall_feedback: "",
    travel_amount: "",
    print_amount: "",
    travel_days: "",
    food_amount:"",
    is_tds_deduct:false,
    
  });
  const miscExpensesInputRef = useRef(null);
  const travelExpensesInputRef = useRef(null);
  const foodAllowanceInputRef = useRef(null);
 const [showError, setShowError] = useState(false);
 const [errorMessage, setErrorMessage] = useState('');

  const [fileNames, setFileNames] = useState({
    miscExpenses: "",
    travelExpenses: "",
    foodAllowance: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colleges, setColleges] = useState([]);
  const handleCloseError = () => {
    setShowError(false);
  };
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    setInvoiceData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };
  
  useEffect(() => {
    console.log("Starting to fetch invoice data...");

    const fetchInvoiceData = async () => {
      try {
        const response = await Get_Invoice_API(invoice_no);
        console.log("Fetched invoice data:", response);

        if (response.success && response.data.length > 0) {
          const invoice = response.data[0];
          setInvoiceData({
            invoice_no: invoice.invoice_no || "",
            college_id: invoice.college_id || "",
            training_days: invoice.training_days || "",
            training_amount: invoice.training_amount || "",
            misc_expenses: invoice.misc_expenses || "",
            travel_expenses: invoice.travel_expenses || "",
            food_allowance: invoice.food_allowance || "",
            misc_expenses_type: invoice.misc_expenses_type || "",
            overall_feedback: invoice.overall_feedback || "",
            travel_amount: invoice.travel_amount || "",
            print_amount: invoice.print_amount || "",
            travel_days: invoice.travel_days || "",
            food_amount:invoice.food_amount||"",
            is_tds_deduct:invoice.is_tds_deduct,
          });
        } else {
          setError("No invoice data found.");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        setError("Failed to fetch invoice data.");
        setLoading(false);
      }
    };

    const fetchColleges = async () => {
      try {
        const data = await getcollegeApi();
        setColleges(data);
      } catch (error) {
        console.error("Error fetching college data:", error);
      }
    };

    fetchInvoiceData();
    fetchColleges();
  }, [invoice_no]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setInvoiceData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  

  const handleUpdate = async () => {
    const formData = new FormData();
    
    Object.keys(invoiceData).forEach((key) => {
      // Check if the key is `is_tds_deduct` and handle it explicitly
      if (key === "is_tds_deduct") {
        formData.append(key, invoiceData[key] ? "True ": "False");
      } else {
        formData.append(key, invoiceData[key]);
      }
    });
  
    try {
      const response = await updateCCInvoiceApi(formData); // Pass `formData` here
      if (response.success) {
        setErrorMessage("Invoice updated successfully!");
      setShowError(true);
      
       
      } else {
        setError("Failed to update invoice.");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      setError("Failed to update invoice.");
    }
  };
  

  return (
    <div className="form-ques">
      <h6>Update Invoice</h6>
      <form className="form-ques">
        <Row>
          <Col><div>
          <label className="label5-ques">Invoice No</label><p></p>
          <input type="text" name="invoice_no" className="input-ques"  value={invoiceData.invoice_no} disabled />
        </div></Col> 
        <Col>
            <div controlId="college" className="add-profile">
              <label className="label5-ques">
                College Name
              </label>
              <p></p>
              <select
                className="input-ques"
                name="college_id"
                value={invoiceData.college_id || ""}
                onChange={handleChange}
              >
                <option value="">Select College</option>
                {colleges.map((clg) => (
                  <option key={clg.id} value={clg.id}>
                    {clg.college}
                  </option>
                ))}
              </select>
            </div>
          </Col>
          <Col>
          <div>
          <label className="label5-ques">Training Days:</label>
        <p></p>  
        <input
            type="number"
            name="training_days"
            className="input-ques"
            value={invoiceData.training_days}
            onChange={handleChange}
          
          />
        </div></Col>
        </Row>
        
      <p></p>
       <p></p>
        <Row>
        <Col> <div>
          <label className="label5-ques">Training Amount</label>
         <p></p>
          <input
            type="number"
            className="input-ques"
            name="training_amount"
            value={invoiceData.training_amount}
            onChange={handleChange}
           
          />
        </div></Col>
         
          <Col> <div>
          <label className="label5-ques">Food Allowance</label>
         <p></p>
          <input
            type="number"
            name="food_amount"
            className="input-ques"
            value={invoiceData.food_amount}
            onChange={handleChange}
            
          />
        </div></Col>
        <Col>  <div>
          <label>Travel Days:</label>
          <p></p>
          <input
            type="number"
            name="travel_days"
            className="input-ques"
            value={invoiceData.travel_days}
            onChange={handleChange}
           
          />
        </div></Col>
          
        </Row>
       
       <p></p>
        <Row>
          <Col> <div>
          <label className="label5-ques">Travel Amount</label>
          <p></p>
          <input
            type="number"
            name="travel_amount"
            className="input-ques"
            value={invoiceData.travel_amount}
            onChange={handleChange}
            
          />
        </div></Col>
          <Col> <div>
          <label className="label5-ques">Other Expenses</label><p></p>
          <input
            type="number"
            name="print_amount"
            className="input-ques"
            value={invoiceData.print_amount}
            onChange={handleChange}
           
          />
        </div></Col>
          <Col>
          <div>
          <label className="label5-ques">Overall Feedback</label><p></p>
          <input
            type="text"
            name="overall_feedback"
            className="input-ques"
            value={invoiceData.overall_feedback}
            onChange={handleChange}
           
          />
        </div></Col>
        </Row>
       
       <p></p>
    <Row md={12}>
<Col >
<div>
  <label className="label5-ques">Misc Expenses</label><p></p>
  <input
    type="file"
    name="misc_expenses"
    onChange={(e) => handleFileChange(e, 'misc_expenses')}
  /></div></Col>
  <Col >
  
<div>
  <label className="label5-ques">Travel Expenses</label><p></p>
  <input
    type="file"
    name="travel_expenses"
    onChange={(e) => handleFileChange(e, 'travel_expenses')}
  />
</div></Col>
<Col >

<div>
  <label className="label5-ques">Food Allowance</label><p></p>
  <input
    type="file"
    name="food_allowance"
    onChange={(e) => handleFileChange(e, 'food_allowance')}
  />
</div>
</Col>
      </Row> <p style={{height:"20px"}}></p>
      <Row>
<Col><div>
  <label className="label5-ques"> TDS Deduction Applicable
  </label>
    <input
      type="checkbox"
      name="is_tds_deduct"
      checked={invoiceData.is_tds_deduct}
      onChange={(e) =>
        setInvoiceData((prev) => ({
          ...prev,
          is_tds_deduct: e.target.checked,
        }))
      }
    />
   
</div>
</Col>
      </Row>

<p style={{height:"50px"}}></p>
 <Row>
                                    <Col>
                                    <div className="button-container-lms">
                                    
                                     <button
                                                                       onClick={() => navigate("/InvoiceTB")} 
                                              className="button-ques-back btn btn-secondary back-button-lms"
                                                                                    style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128' }}
                                    
                                                                                ><img src={Back} className='nextarrow' ></img>
                                                                                    <span className="button-text">Back</span>
                                                                           </button>
                                                                                <button type="button" className='button-ques-save' onClick={handleUpdate}>
   Update
        </button>
        
         <button  className="button-ques-back btn btn-secondary back-button-lms"
                                                        style={{ width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128', cursor: 'not-allowed' }}
                                                        disabled >
                                                        <span className="button-text">Next</span><img src={Next} className='nextarrow'></img>
        
                                                    </button>
        </div></Col>

       </Row>
      </form>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
-
    </div>
  );
};

export default UpdateInvoice;
