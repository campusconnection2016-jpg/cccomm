import React, { useState, useEffect, useContext } from "react";
import {
  getTrainerReportApi,
  getDistinct_test_API,
  getTrainersUsernames_API
} from "../../api/endpoints";
import "../../styles/trainingadmin.css";
import { SearchContext } from "../../allsearch/searchcontext";
import Download from "../../assets/images/download.png";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import CustomPagination from "../../api/custompagination";



const TrainerFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [currentTrainerIndex, setCurrentTrainerIndex] = useState(0); // Track the index of the currently displayed trainer
  const [error, setError] = useState(null);
  const { searchQuery } = useContext(SearchContext);
  const [search, setSearch] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = feedback.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(feedback.length / itemsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  // const [filtersSt, setFiltersSt] = useState({});
  const [trainersUsernames, setTrainnerUsernames] = useState([]);


  // Filtering state (you can add more fields as needed)
  const [filtersSt, setFiltersSt] = useState({});


  const [totalPages1, setTotalPages1] = useState(1);
  const [pageSize] = useState(10); // Items per page

  const [distinctValues, setDistinctValues] = useState({

    college_name: [],
    department_name: [],
    trainer_name: [],
    topic: [],

  });

  const handleFilterChange = (key, value) => {
    setFiltersSt((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange1 = (page) => {
    setCurrentPage(page);
  };

  const exportToExcel = async () => {
    const filteredData = feedback.map(({ report_id, ...rest }) => rest); // Exclude id field
  
    const headerMap = {
      college_name: "CollegeName",
      department_name: "DepartmentName",
      year: "Year",
      topic: "Topic",
      subTopic: "SubTopic",
      Trainer_name: "TrainerName",
      dtm_session: "Date",
      Status: "Status",
      no_of_question_solved: "No.Of Questions",
      comments: "Comments",
      activities_done: "Activities Done",
      student_feedback: "Student Feedback",
      infrastructure_feedback: "Infrastructure Feedback",
    };
  
    // Transform data using headerMap
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
  
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Feedback Report");
  
    // Add header row
    const headers = Object.values(headerMap);
    worksheet.addRow(headers);
  
    // Add data rows
    wsData.forEach(item => {
      const row = headers.map(header => item[header] || "");
      worksheet.addRow(row);
    });
  
    // Auto-adjust column widths
    worksheet.columns.forEach(column => {
      let maxLength = 12;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) maxLength = cellLength;
      });
      column.width = maxLength + 2;
    });
  
    // Construct filename
    const college = filtersSt.college_name?.replace(/\s+/g, '') || "AllColleges";
    const trainer = filtersSt.trainer_name?.replace(/\s+/g, '') || "AllTrainers";
    const fileName = `${college}_${trainer}_Trainingreport.xlsx`;
  
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Excel export error:", error);
      alert("Failed to export Excel file.");
    }
  };
  


  useEffect(() => {
    // Fetch trainer data when the component mounts
    fetchFeedback(currentPage, search, filtersSt);
  }, [currentPage, search, filtersSt]);

  const fetchFeedback = async (page) => {
    try {
      const response = await getTrainerReportApi(page, search, filtersSt.topic, filtersSt.college_name, filtersSt.department_name, filtersSt.trainer_name);
      console.log("API Response:", response);

      // Extract unique values for dropdowns
      const uniqueValues = {
        // student_name: [...new Set(response.map((item) => item.student_name))],
        college_name: response.unique_colleges,
        department_name: response.unique_departments,
        trainer_name: response.unique_trainer_usernames,
        topic: response.unique_topics,
      };



      setDistinctValues(uniqueValues);

      console.log("Distinct Values:", distinctValues);

      setFeedback(response.results);
      setTotalPages1(Math.ceil(response.count / pageSize));
    } catch (error) {
      setError("Failed to fetch trainer data");
      console.error(error);
    }
  };

  // Fetch trainers' usernames from the API and update filterOptions
  const fetchTrainerNames = async () => {
    try {
      const response = await getTrainersUsernames_API();
      setTrainnerUsernames(response.usernames || []);
    } catch (error) {
      console.error("Error fetching trainer usernames:", error);
    }
  };



  // Create distinct filter options (if not already created)
  const filterOptions = {
    college_name: [...new Set(feedback.map((item) => item.college_name))],
    department: [...new Set(feedback.map((item) => item.department_name))],
    topic: [...new Set(feedback.map((item) => item.topic))],
    trainer_name: [...new Set(trainersUsernames || [])],
    status: [...new Set(feedback.map((item) => item.status))],
    session_date: [...new Set(feedback.map((item) => item.dtm_of_training))],
  };

  return (
    <div className="form-ques-stufeed">
      <h6>Trainers Report</h6>

      <input
        className="search-box-db-nondb"
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "10px" }}
      />
      <button
        className="button-ques-save"
        onClick={exportToExcel}
        style={{ marginLeft: "40px !important" }}
      >
        <img src={Download} className="nextarrow"></img>
        <span>Export</span>
      </button>

      <div className='po-table-responsive-tf'>
        <table className="placement-table" >
          <thead style={{ textAlign: "center" }}>
            {/* First row: Column Titles */}
            <tr >
              <th className="title-place">College Name</th>
              <th className="title-place">Department</th>
              <th className="title-place">Topic</th>
              <th className="title-place">Trainer Name</th>
              <th className="title-place">Status</th>
              <th className="title-place">Session Date</th>
            </tr>
            {/* Second row: Filter Dropdowns */}
            <tr className="filter-row">
              <th>
                <select
                  className="dropdown-custom"
                  value={filtersSt.college_name}
                  onChange={(e) => handleFilterChange("college_name", e.target.value)}
                >
                  <option value="">All</option>
                  {distinctValues.college_name.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select
                  className="dropdown-custom"
                  value={filtersSt.department_name}
                  onChange={(e) => handleFilterChange("department_name", e.target.value)}
                >
                  <option value="">All</option>
                  {distinctValues.department_name.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select
                  className="dropdown-custom"
                  value={filtersSt.topic}
                  onChange={(e) => handleFilterChange("topic", e.target.value)}
                >
                  <option value="">All</option>
                  {distinctValues.topic.map((top) => (
                    <option key={top} value={top}>
                      {top}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select
                  className="dropdown-custom"
                  value={filtersSt.trainer_name}
                  onChange={(e) => handleFilterChange("trainer_name", e.target.value)}
                >
                  <option value="">All</option>
                  {distinctValues.trainer_name.map((trainer) => (
                    <option key={trainer} value={trainer}>
                      {trainer}
                    </option>
                  ))}
                </select>
              </th>
              <th>

              </th>
              <th>

              </th>
            </tr>
          </thead>
          <tbody  >
            {feedback.length > 0 ? (
              feedback.map((currentTrainer, index) => (
                <tr key={index} className="table-row">
                  <td style={{ textAlign: "center" }}>{currentTrainer.college_name}</td>
                  <td style={{ textAlign: "center" }}>{currentTrainer.department_name}</td>
                  <td style={{ textAlign: "center" }}>{currentTrainer.topic}</td>
                  <td style={{ textAlign: "center" }}>{currentTrainer.trainer_name}</td>
                  <td style={{ textAlign: "center" }}>{currentTrainer.status}</td>
                  <td style={{ textAlign: "center" }}>{currentTrainer.dtm_of_training}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No feedback found
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>

      <p></p>

      <div className='dis-page pagi12' style={{ marginTop: '10%' }}>
        {/* Custom Pagination */}
        <CustomPagination
          totalPages={totalPages1}
          currentPage={currentPage}
          onPageChange={handlePageChange1}
          maxVisiblePages={3} // Limit to 3 visible pages
        />
      </div>

    </div>
  );
};

export default TrainerFeedback;
