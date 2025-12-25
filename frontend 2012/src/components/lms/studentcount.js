import React, { useState, useEffect, useContext } from 'react';
import { getCourseContentFeedbackApi, getDistinct_test_API } from '../../api/endpoints';
import '../../styles/trainingadmin.css';
import back from '../../assets/images/backarrow.png';
import { Table, Form, Pagination } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { SearchContext } from '../../allsearch/searchcontext';
import Download from '../../assets/images/download.png'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Back from "../../assets/images/backarrow.png";
//import { useParams } from 'react-router-dom';
import { useLocation } from "react-router-dom";
const StudentList = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [currentTrainerIndex, setCurrentTrainerIndex] = useState(0); // Track the index of the currently displayed trainer
  const [error, setError] = useState(null);
  const [trainerNameFilter, setTrainerNameFilter] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState('');
  const { searchQuery } = useContext(SearchContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = feedback.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(feedback.length / itemsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const [filtersSt, setFiltersSt] = useState({});
  const [search, setSearch] = useState('');
  const [distinctValues, setDistinctValues] = useState({
    student_name: [],
    college_name: [],
    department_name: [],
    trainer_name: [],
    topic: [],
    feedback: [],  // Ensure feedback is included
});
const location = useLocation();
    
// Extract query parameters
const queryParams = new URLSearchParams(location.search);
const college = queryParams.get("college");
const department = queryParams.get("department");
const topic = queryParams.get("topic");
const trainer = queryParams.get("trainer");
const session = queryParams.get("session");
  const getPaginationItems = () => {
    const items = [];
    let startPage, endPage;

    if (totalPages <= 3) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage === 1) {
      startPage = 1;
      endPage = 3;
    } else if (currentPage === totalPages) {
      startPage = totalPages - 2;
      endPage = totalPages;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

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


  useEffect(() => {
    // Fetch trainer data when the component mounts or when filters change
    fetchFeedback();
  }, [trainerNameFilter, feedbackFilter, searchQuery, search, filtersSt]);

  const fetchFeedback = async () => {
    try {
        const response = await getCourseContentFeedbackApi();

        // Declare `trainer` with `let` to allow reassignment
        let currentTrainer = trainer;
        if (currentTrainer === 'null') {
            currentTrainer = null; // Reassign only if trainer is the string "null"
        }

        // Apply filtering logic
        const filteredData = response.filter((item) =>
            item.college_name === college &&
            item.department_name === department &&
            item.topic === topic &&
            item.dtm_session === session &&
            (currentTrainer == null ? item.trainer_name == null : item.trainer_name === currentTrainer)
        );

        console.log('Filtered Data...: ', filteredData);


        // Extract unique values for dropdowns
        const uniqueValues = {
            student_name: [...new Set(filteredData.map((item) => item.student_name))],
            college_name: [...new Set(filteredData.map((item) => item.college_name))],
            department_name: [...new Set(filteredData.map((item) => item.department_name))],
            trainer_name: [...new Set(filteredData.map((item) => item.trainer_name))],
            topic: [...new Set(filteredData.map((item) => item.topic))],
            feedback: [...new Set(filteredData.map((item) => item.feedback))], // New Feedback Filter
        };

        setDistinctValues(uniqueValues);

        // Apply additional filters stored in `filtersSt`
        const filteredFeedback = filteredData.filter((item) =>
            Object.keys(filtersSt).every((key) =>
                filtersSt[key] ? item[key] === filtersSt[key] : true
            )
        );

        setFeedback(filteredFeedback);
    } catch (error) {
        console.error("Failed to fetch feedback data", error);
    }
};

 
  const handleFilterChange = (key, value) => {
    setFiltersSt((prev) => ({ ...prev, [key]: value }));
  };


  // Place useEffect at the component level
  useEffect(() => {
    fetchFeedback();
  }, [trainerNameFilter, feedbackFilter, searchQuery, search, filtersSt]);
const exportToExcel = async () => {
  // Strip out fields you don’t want to export
  const filteredData = feedback.map(
    ({ id, department_id, topic_id, skill_id, dtm_created, college_id, ...rest }) => rest
  );

  // Map of your API keys to Excel column headers
  const headerMap = {
    college_name: "CollegeName",
    department_name: "DepartmentName",
    student_name: "Candidate",
    topic: "Topic",
    dtm_session: "Date",
    feedback: "Feedback",
    remarks: "Remarks",
  };

  // Transform each record to use Excel column headers
  const wsData = filteredData.map(candidate => {
    const modifiedCandidate = {};
    for (let key in candidate) {
      if (headerMap[key]) {
        modifiedCandidate[headerMap[key]] = candidate[key];
      }
    }
    return modifiedCandidate;
  });

  if (wsData.length === 0) {
    alert("No data available for export!");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Feedback Report");

  // Define columns with headers/keys
  worksheet.columns = Object.values(headerMap).map(header => ({
    header,
    key: header,
    width: header.length + 5,
  }));

  // Add data rows
  wsData.forEach(data => worksheet.addRow(data));

  // Auto-adjust column widths
  worksheet.columns.forEach(column => {
    let maxLength = column.header ? column.header.length : 10;
    column.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, cellValue.length);
    });
    column.width = maxLength + 2;
  });

  // ✅ Get college name from feedback data
  let collegeName = "UnknownCollege";
  if (feedback.length > 0 && feedback[0].college_name) {
    collegeName = feedback[0].college_name.replace(/\s+/g, '');
  }

  // ✅ Trainer name still comes from filters (if available)
  const trainerName = filtersSt.trainer_name?.replace(/\s+/g, '') || "AllTrainers";

  // ✅ Construct the filename dynamically
  const fileName = `${collegeName}_${trainerName}_StudentsReport.xlsx`;

  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
  } catch (error) {
    console.error("Error generating Excel:", error);
    alert("Failed to export Excel file.");
  }
};

 
  return (
    <div className="form-ques-stufeed">
      <h6>Student's  feedback</h6>
      {/*}  {error && <p>{error}</p>}   */}
      <div className="filter-container">
        <input
          className="search-box-db-nondb"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
 <button
                  className="button-ques-save"
                  style={{ width: "100px",marginRight:"10px" }}
                  onClick={() => navigate("/stufeedback/")} 
                >
                  <img src={Back} className="nextarrow"></img> Back
                </button>
        <button className="button-ques-save" onClick={exportToExcel} style={{ width: "100px", marginRight: '20px' }}><img src={Download} className='nextarrow'></img><span>Export</span></button>
      </div><p></p>
      <div className="table-responsive-feed">
      <table className="product-table">
      <thead className="table-thead" style={{ textAlign: "center" }}>
        <tr className="header-row">
          
         <th style={{textAlign:"center"}}>
           
            <select
              value={filtersSt.college_name || ""}
              className='dropdown-custom'
              onChange={(e) => handleFilterChange("college_name", e.target.value)}
            >
              <option value="">College</option>
              {distinctValues.college_name.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </th>
          <th style={{textAlign:"center"}}>
           
            <select className='dropdown-custom'
              value={filtersSt.department_name || ""}
              onChange={(e) => handleFilterChange("department_name", e.target.value)}
            >
              <option value=""> Department</option>
              {distinctValues.department_name.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </th>
          <th style={{textAlign:"center"}}><select className='dropdown-custom'
        value={filtersSt.student_name || ""}
        onChange={(e) => handleFilterChange("student_name", e.target.value)}
      >
        <option value="">Students</option>
        {distinctValues.student_name.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select></th>
         <th style={{textAlign:"center"}}>
           
            <select className='dropdown-custom'
              value={filtersSt.topic || ""}
              onChange={(e) => handleFilterChange("topic", e.target.value)}
            >
              <option value="">Topics</option>
              {distinctValues.topic.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </th>
        
          <th style={{textAlign:"center"}}>
            
            <select className='dropdown-custom'
              value={filtersSt.trainer_name || ""}
              onChange={(e) => handleFilterChange("trainer_name", e.target.value)}
            >
              <option value="">Trainer</option>
              {distinctValues.trainer_name.map((trainer) => (
                <option key={trainer} value={trainer}>
                  {trainer}
                </option>
              ))}
            </select>
          </th>
          <th style={{textAlign:"center"}}><select className='dropdown-custom'
        value={filtersSt.feedback || ""}
        onChange={(e) => handleFilterChange("feedback", e.target.value)}
      >
        <option value="">Feedback</option>
        {distinctValues.feedback.map((fb) => (
          <option key={fb} value={fb}>
            {fb}
          </option>
        ))}
      </select></th>
        {/*}  <th>Session Date</th>*/}
          
        </tr>
      </thead>
      <tbody className="table-tbody">
        {feedback.length > 0 ? (
          feedback.map((trainer, index) => (
            <tr key={index}>
             
              <td style={{textAlign:"center"}}>{trainer.college_name}</td>
              <td style={{textAlign:"center"}}>{trainer.department_name}</td>
              <td style={{textAlign:"center"}}>{trainer.student_name}</td>
              <td style={{textAlign:"center"}}>{trainer.topic}</td>
           
              <td style={{textAlign:"center"}}>{trainer.trainer_name}</td>
              <td style={{textAlign:"center"}}>{trainer.feedback}</td>
             {/*} <td>{trainer.dtm_session}</td>*/}
              
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} style={{ textAlign: "center" }}>No feedback found</td>
          </tr>
        )}
      </tbody>
    </table>


      </div>

      <div className='dis-page'>
        <Form>
          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
            <Form.Control
              className='label-dis'
              style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
              as="select"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>
        </Form>
        <Pagination className="pagination-custom">
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {getPaginationItems()}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </div >
  );
};

export default StudentList;
