import React, { useState, useEffect, useContext } from 'react';
import { getCourseContentFeedbackcountApi, getDistinct_test_API } from '../../api/endpoints';
import '../../styles/trainingadmin.css';
import back from '../../assets/images/backarrow.png';
import { Table, Form, Pagination } from 'react-bootstrap';
import Next from '../../assets/images/nextarrow.png';
import { SearchContext } from '../../allsearch/searchcontext';
import Download from '../../assets/images/download.png'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CustomPagination from '../../api/custompagination';
const StudentsFeedback = () => {
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
  const navigate = useNavigate();


  const [totalPages1, setTotalPages1] = useState(1);
  const [pageSize] = useState(10); // Items per page

  const [distinctValues, setDistinctValues] = useState({

    college_name: [],
    department_name: [],
    trainer_name: [],
    topic: [],

  });



  useEffect(() => {
    // Fetch trainer data when the component mounts or when filters change
    fetchFeedback(currentPage, search, filtersSt);
  }, [currentPage, search, filtersSt]);

  const handlePageChange1 = (page) => {
    setCurrentPage(page);
  };


  const fetchFeedback = async (page) => {
    try {
      const response = await getCourseContentFeedbackcountApi(page, search, filtersSt.topic, filtersSt.college_name, filtersSt.department_name, filtersSt.trainer_name);


      // Extract unique values for dropdowns
      const uniqueValues = {
        // student_name: [...new Set(response.map((item) => item.student_name))],
        college_name: response.unique_colleges,
        department_name: response.unique_departments,
        trainer_name: response.unique_trainer_usernames,
        topic: response.unique_topics,
      };

      setDistinctValues(uniqueValues);

      setFeedback(response.results);
      setTotalPages1(Math.ceil(response.count / pageSize));

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
    const filteredData = feedback.map(({ id, department_id, trainer_name, topic_id, skill_id, dtm_created, college_id, ...rest }) => rest); // Remove unwanted fields
  
    const headerMap = {
      college_name: "CollegeName",
      department_name: "DepartmentName",
      topic: "Topic",
      dtm_session: "Date",
      student_count: "Candidates",
    };
  
    // Process data using headerMap
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
      alert("No valid data to export!");
      return;
    }
  
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Feedback Report");
  
    const headers = Object.values(headerMap);
    worksheet.addRow(headers);
  
    // Add rows
    wsData.forEach(rowData => {
      const row = headers.map(header => rowData[header] || "");
      worksheet.addRow(row);
    });
  
    // Auto-size columns
    worksheet.columns.forEach(col => {
      let maxLength = 12;
      col.eachCell({ includeEmpty: true }, cell => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      col.width = maxLength + 2;
    });
  
    // Construct filename
    const college = filtersSt.college_name?.replace(/\s+/g, '') || "AllColleges";
    const trainer = filtersSt.trainer_name?.replace(/\s+/g, '') || "AllTrainers";
    const fileName = `${college}_${trainer}_StudentsReport.xlsx`;
  
    // Save the file
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Failed to export Excel file.");
    }
  };
  



  const handleViewFeedback = (college, department, topic, trainer, session) => {
    navigate(`/student-feedback?college=${college}&department=${department}&topic=${topic}&trainer=${trainer}&session=${session}`);
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

        <button className="button-ques-save" onClick={exportToExcel} style={{ width: "100px", marginRight: '20px' }}><img src={Download} className='nextarrow'></img><span>Export</span></button>
      </div><p></p>
      <div className='po-table-responsive-test-schedule'>
        <table className="placement-table" >
          <thead style={{ textAlign: "center" }}>
            <tr >

              <th style={{ textAlign: "center" }}>

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
              <th style={{ textAlign: "center" }}>

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

              <th style={{ textAlign: "center" }}>

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

              <th style={{ textAlign: "center" }}>

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

              <th style={{ textAlign: "center" }}>Session Date</th>
              <th style={{ textAlign: "center" }}>Student Count</th>
            </tr>
          </thead>
          <tbody >
            {feedback.length > 0 ? (
              feedback.map((trainer, index) => (
                <tr key={index}>

                  <td style={{ textAlign: "center" }}>{trainer.college_name}</td>
                  <td style={{ textAlign: "center" }}>{trainer.department_name}</td>

                  <td style={{ textAlign: "center" }}>{trainer.topic}</td>

                  <td style={{ textAlign: "center" }}>{trainer.trainer_name}</td>

                  <td style={{ textAlign: "center" }}>{trainer.dtm_session}</td>

                  <td style={{ textAlign: "center" }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior
                        handleViewFeedback(
                          trainer.college_name,
                          trainer.department_name,
                          trainer.topic,
                          trainer.trainer_name,
                          trainer.dtm_session
                        );
                      }}
                      style={{ color: 'white', textAlign: "center", cursor: 'pointer', textDecoration: 'underline' }} // Link styling
                    >
                      {trainer.student_count}
                    </a>
                  </td>
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
      <p></p>


      <div className='dis-page' style={{ marginTop: '10%' }}>
        {/* Custom Pagination */}
        <CustomPagination
          totalPages={totalPages1}
          currentPage={currentPage}
          onPageChange={handlePageChange1}
          maxVisiblePages={3} // Limit to 3 visible pages
        />
      </div>

      
    </div >
  );
};

export default StudentsFeedback;
