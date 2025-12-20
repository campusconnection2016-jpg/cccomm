
import React, { useState, useEffect, useContext } from 'react';
import {

  getViewResults_CC_API,
  updateMultipleTestCandidatesStatus
} from '../../api/endpoints';

import { useParams, Link } from 'react-router-dom';
import '../../styles/trainingadmin.css';
import { Table, Form, Pagination } from 'react-bootstrap';
import Download from '../../assets/images/download.png'
import Footer from '../../footer/footer';
import { SearchContext } from '../../allsearch/searchcontext';
import { useLocation, useNavigate } from "react-router-dom";
import back from "../../assets/images/backarrow.png";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
const TestResultNew = () => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [search, setSearch] = useState('');

  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({
    registration_number: '',
    student_name: '',
    email_id: '',
    mobile_number: '',

    year: '',
    department_id: '',
    college: '',
    //total_score: '',
    test_name: '',
    // dtm_start: '', // New filter for dtm_start
    // dtm_end: '',    // New filter for dtm_end
    is_active: true,
    avg_mark: '',
  });
  const { test_name,college_id } = useParams();
  console.log("print test", test_name)
  // const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const [filteredCount, setFilteredCount] = useState(0);
const [sortOrder, setSortOrder] = useState('asc'); // or 'desc'
const [filtered, setFilteredDatas] = useState([]);


  useEffect(() => {
    getTestCandidates();
  }, [test_name]); // Run once on component mount
  const handleCheckboxChange = (studentId) => {
    setSelectedStudents(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(studentId)) {
        newSelected.delete(studentId);
      } else {
        newSelected.add(studentId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredData.length) {
      setSelectedStudents(new Set()); // Deselect all
    } else {
      setSelectedStudents(new Set(filteredData.map(candidate => candidate.student_id))); // Select all across pages
    }
  };

  const handleReassign = async () => {
    if (selectedStudents.size === 0) {
      alert("No students selected for reassignment!");
      return;
    }

    try {
      await updateMultipleTestCandidatesStatus(test_name, Array.from(selectedStudents)); // Convert Set to array
      getTestCandidates();  // Refresh the list
      alert("Selected students reassigned successfully!");
      setSelectedStudents(new Set());  // Clear selections
    } catch (error) {
      console.error("Error updating students:", error);
      alert("Failed to reassign students.");
    }
  };


 const [collegeId, setCollegeId] = useState(null); // 👈 add state at top

const getTestCandidates = () => {
  getViewResults_CC_API(college_id,test_name)
    .then(data => {
      const sorted = [...data].sort((a, b) => {
        const regA = a.registration_number?.toString().toLowerCase();
        const regB = b.registration_number?.toString().toLowerCase();
        if (regA < regB) return -1;
        if (regA > regB) return 1;
        return 0;
      });

      setTestCandidates(sorted);
      setFilteredDatas(sorted);

      if (data.length > 0) {
        console.log('data...: ', data[0]);
        setCollegeId(data[0].collegeId); // 👈 extract and store college_id
      }
    })
    .catch(error => console.error('Error fetching test candidates:', error));
};

  const handleFiltersChange = (event, key) => {
    setFilters({
      ...filters,
      [key]: event.target.value
    });
  };

  const filterCandidates = () => {
    return testCandidates.filter(candidate => {
      for (let key in filters) {
        if (filters[key] !== '') {
          if (key === 'avg_mark') {
            const filterValues = filters[key].trim().split(",").map(val => val.trim()); // Split multiple conditions
            const avgMark = Number(candidate.avg_mark);
            let matchFound = false; // To check if at least one condition matches

            for (let filter of filterValues) {
              if (filter.startsWith(">")) {
                const min = Number(filter.substring(1));
                if (avgMark > min) matchFound = true;
              } else if (filter.startsWith("<")) {
                const max = Number(filter.substring(1));
                if (avgMark < max) matchFound = true;
              } else if (filter.includes("-")) {
                const [min, max] = filter.split("-").map(Number);
                if (avgMark >= min && avgMark <= max) matchFound = true;
              } else {
                // Exact match
                const exactValue = Number(filter);
                if (avgMark === exactValue) matchFound = true;
              }
            }

            if (!matchFound) return false; // If no condition matches, exclude the candidate
          } else {
            const filterValue = String(filters[key]).toLowerCase();
            const candidateValue = String(candidate[key]).toLowerCase();
            if (candidateValue !== filterValue) return false;
          }
        }
      }
      return candidate.is_active === true; // Only show active candidates
    });
  };
const sortByRegNo = () => {
  const sorted = [...filtered].sort((a, b) => {
    const regA = a.registration_number?.toString().toLowerCase();
    const regB = b.registration_number?.toString().toLowerCase();

    if (regA < regB) return sortOrder === 'asc' ? -1 : 1;
    if (regA > regB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  setFilteredDatas(sorted);
  setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
};

 
  const exportToExcel = async () => {
    const filteredData = filterCandidates().map(({
      id, test_id, test_type, skill_type_id, student_id, question_id,
      question_name, is_actual_test, is_active, need_candidate_info,
      instruction, attempt_count, rules, topic, duration, ...rest
    }) => rest); // Exclude unnecessary fields
  
    const headerMap = {
      student_name: 'Candidate',
      registration_number: 'Reg_No',
      email_id: 'Email',
      mobile_number: 'Contact No',
      department_id: 'Department',
      year: "Year",
      user_name: 'Login ID',
      avg_mark: 'Avg Mark',
      capture_duration: 'Capture Duration',
      dtm_start_test: 'Student_Start_Date',
    };
  
    const getYearString = (year) => {
      const yearMap = {
        4: 'Final Year',
        3: '3rd Year',
        2: '2nd Year',
        1: '1st Year'
      };
      return yearMap[year] || 'Unknown Year';
    };
  
    const wsData = filteredData.map(candidate => {
      let modifiedCandidate = {};
      for (let key in headerMap) {
        if (key === 'year') {
          modifiedCandidate[headerMap[key]] = getYearString(candidate[key]);
        } else {
          modifiedCandidate[headerMap[key]] = candidate[key] || '';
        }
      }
      return modifiedCandidate;
    });
  
    if (wsData.length === 0) {
      alert("No valid data to export!");
      return;
    }
  
    const firstCandidate = filteredData[0];
    const testName = firstCandidate?.test_name?.replace(/\s+/g, '') || "Test";
    const year = getYearString(firstCandidate?.year) || "Year";
  
    const formatDate = (dateStr) => {
      if (!dateStr || typeof dateStr !== "string") return "01_01_2025";
      const parsedDate = new Date(dateStr.replace(/-/g, "/"));
      return isNaN(parsedDate) ? "01_01_2025" :
        `${String(parsedDate.getDate()).padStart(2, '0')}_${String(parsedDate.getMonth() + 1).padStart(2, '0')}_${parsedDate.getFullYear()}`;
    };
  
    const startDate = formatDate(firstCandidate?.dtm_start);
    const fileName = `${testName}_${year}.xlsx`;
    const sheetName = `${year} Report`;
  
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
  
    // Add headers
    const headers = Object.keys(wsData[0]);
    worksheet.addRow(headers);
  
    // Add rows
    wsData.forEach(row => {
      worksheet.addRow(Object.values(row));
    });
  
    // Auto-resize columns
    worksheet.columns.forEach(column => {
      let maxLength = 12;
      column.eachCell({ includeEmpty: true }, cell => {
        const valLength = (cell.value || "").toString().length;
        if (valLength > maxLength) maxLength = valLength;
      });
      column.width = maxLength + 2;
    });
  
    // Generate and save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(blob, fileName);
  };
  


  // When searchable or searchQuery changes, reset to page 1
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
  }, [search, searchQuery]);

  // Filter search results
  const filteredData = filterCandidates()
    .filter(item =>
      !searchQuery ||
      (item.user_name && item.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(searchQuery.toLowerCase()))

    )
    .filter(item =>
      !search ||
      (item.user_name && item.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(search.toLowerCase())) ||
      (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(search.toLowerCase())) ||
      (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(search.toLowerCase())) ||
      (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(search.toLowerCase()))
    )
  useEffect(() => {
    setFilteredCount(filteredData.length);
  }, [filteredData]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

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

  const uniqueCandidates = [...new Set(testCandidates.map(c => c.student_name))];
  const uniqueRegistrationNos = [...new Set(testCandidates.map(c => c.registration_number))];
  const uniqueDepartments = [...new Set(testCandidates.map(c => c.department_id))];
  const uniqueYears = [...new Set(testCandidates.map(c => c.year))];
const location = useLocation();
  const navigate = useNavigate();

  const origin = location.state?.origin; // 'aptitude' or 'technical'

  console.log('origin: ', origin);
const handleBack = () => {
    if (origin === "TotalAptitudeTest") {
      navigate(`/total-aptitude-test-report/${collegeId}`);
    } else if (origin === "TotalTechnicalTest") {
      navigate(`/total-technical-test-report/${collegeId}`);
     
    }
     else if (origin === "TotalCommunicationTest") {
      navigate(`/total-commun-test-report/${collegeId}`);
     } 
      else if (origin === "TotalCompanyTest") {
      navigate(`/total-company-test-report/${collegeId}`);
     } 
    else {
      navigate("/test/test-schedules"); // fallback
    }
  };
  return (
    <div >
      <div className="product-table-container">
        <h6>Test Result</h6>
        <div
          className="control-panel"

        >
          <button
      className="button-ques-save"
      style={{ width: "110px", padding: "10px", textAlign: "center" }}
      onClick={handleBack}
    >
      <img src={back} className="nextarrow" alt="Back" /> Back
    </button>

          <input
            className="search-box1-reassign"
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              //flexGrow: "1",
              width: "250px"

            }}
          />

          <button
            className="button-ques-save"
            onClick={exportToExcel}
          >
            <img src={Download} className="nextarrow" alt="Download" />
            <span>Export</span>
          </button>

          <button
            onClick={handleReassign}
            className="reassign-btn"
          >
            Reassign
          </button>

        </div>

        <p
          className="filtered-count"
        //style={{ flexShrink: "0", margin: "0", fontWeight: "bold" }}
        >
          No of Candidates: {filteredCount}
        </p>
        <div className='table-responsive-results'>
          <table className="product-table" >
            <thead className="table-thead">
              <tr>
                <th style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                  /></th>
                <th style={{ textAlign: "center" }}>
                  <select value={filters.student_name || ''} onChange={(e) => handleFiltersChange(e, "student_name")}
                    className="dropdown-custom" >
                    <option value="" >Candidate</option>
                    {uniqueCandidates.map(name => <option key={name} value={name}  >{name}</option>)}
                  </select>
                </th>
               <th style={{ textAlign: "center", cursor: 'pointer' }} onClick={sortByRegNo}>
  <select value={filters.registration_number || ''} onChange={(e) => handleFiltersChange(e, "registration_number")}
                  className="dropdown-custom" >
                  <option value="" >Reg No {sortOrder === 'asc' ? '▲' : '▼'}</option>
                  {uniqueRegistrationNos.map(reg => <option key={reg} value={reg} >{reg}</option>)}
                </select>
</th>


                <th style={{ textAlign: "center" }}><select value={filters.department_id || ''} onChange={(e) => handleFiltersChange(e, "department_id")} className="dropdown-custom"
                >
                  <option value="" > Department</option>
                  {uniqueDepartments.map(dept => <option key={dept} value={dept} >{dept}</option>)}
                </select></th>
                <th style={{ textAlign: "center" }}><select value={filters.year || ''} onChange={(e) => handleFiltersChange(e, "year")}
                  className="dropdown-custom" >
                  <option value="" > Year</option>
                  {uniqueYears.map(year => <option key={year} value={year} >{year}</option>)}
                </select></th>

                <th style={{ textAlign: "center" }}>

                  <input
                    type="text"
                    value={filters.avg_mark || ""}
                    className="dropdown-custom"
                    onChange={(e) => handleFiltersChange(e, "avg_mark")}
                    placeholder=">20,<30,20-30"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="table-tbody">
              {currentData
                .filter(item =>
                  !searchQuery ||
                  (item.user_name && item.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.dtm_start && typeof item.dtm_start === 'string' && item.dtm_start.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .filter(item =>
                  !search ||
                  (item.user_name && item.user_name.toLowerCase().includes(search.toLowerCase())) ||
                  (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(search.toLowerCase())) ||
                  (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(search.toLowerCase())) ||
                  (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(search.toLowerCase())) ||
                  (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(search.toLowerCase())) ||
                  (item.dtm_start && typeof item.dtm_start === 'string' && item.dtm_start.toLowerCase().includes(search.toLowerCase())) ||
                  (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(search.toLowerCase()))
                )
                .map(candidate => (
                  <tr key={candidate.id} className={candidate.is_active ? 'active-row' : ''}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(candidate.student_id)}
                        onChange={() => handleCheckboxChange(candidate.student_id)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{candidate.student_name}</td>
                    <td style={{ textAlign: "center" }}>{candidate.registration_number}</td>

                    <td style={{ textAlign: "center" }}>{candidate.department_id}</td>
                    <td style={{ textAlign: "center" }}>{candidate.year}</td>

                    <td style={{ textAlign: "center" }}>{candidate.avg_mark}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p></p>
        <div className='dis-page'>
          <Form>
            <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
              <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
              <Form.Control style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
                as="select"
                className='label-dis'
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
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {getPaginationItems()}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      </div><p style={{ height: "50px" }}></p>
      {/*  <Footer></Footer>*/}
    </div>

  );
};

export default TestResultNew;
