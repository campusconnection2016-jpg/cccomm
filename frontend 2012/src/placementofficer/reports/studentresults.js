
import React, { useState, useEffect, useContext } from 'react';
import {

  get_CC_Test_Reports_Stu_API, updateMultipleTestCandidatesStatus
} from '../../api/endpoints';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { useParams } from 'react-router-dom';
import '../../styles/trainingadmin.css';
import { Table, Form, Pagination } from 'react-bootstrap';
import Download from '../../assets/images/download.png'
import Footer from '../../footer/footer';
import { SearchContext } from '../../allsearch/searchcontext';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import back from "../../assets/images/backarrow.png";
const StudentResults = () => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [searches, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const [filteredCount, setFilteredCount] = useState(0);

  const [triggerFetch, setTriggerFetch] = useState(true);

  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({
    registration_number: '',
    student_name: '',
    email_id: '',
    mobile_number: '',
    year: '',
    year: '',
    department_id: '',
    college: '',
    total_score: '',
    test_name: '',
    dtm_start: '', // New filter for dtm_start
    dtm_end: '',    // New filter for dtm_end
    is_active: true,
    avg_mark: '',
  });


  const { search } = useLocation();

  // Parse query parameters
  const queryParams = new URLSearchParams(search);
  const filtersParams = {
    test_name: queryParams.get('test_name'),
    college_id: queryParams.get('college_id'),
    department_id: queryParams.get('department_id'),
    year: queryParams.get('year'),
  };
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Use filters as needed in your component logic
  // console.log("Filters:", filtersParams);


  useEffect(() => {
    getTestCandidates();
  }, [triggerFetch, filtersParams, search, searchQuery]); // Run once on component mount

  const getTestCandidates = () => {
    if (triggerFetch) {
      get_CC_Test_Reports_Stu_API(filtersParams)
        .then(data => {

          setTestCandidates(data);
          // console.log("filter", data)
          // ✅ Only reset trigger after successful data fetch
          setTriggerFetch(false);
        })
        .catch(error => console.error('Error fetching test candidates:', error));
    }
  };

  const handleFilterChange = (event, key) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleFiltersChange = (event, key) => {
    setFilters({
      ...filters,
      [key]: event.target.value
    });
  };

  const filterCandidates = () => {
    let filtered = testCandidates.filter(candidate => {
      for (let key in filters) {
        if (filters[key] !== '') {
          if (key === 'avg_mark') {
            const filterValues = filters[key].trim().split(",").map(val => val.trim());
            const avgMark = Number(candidate.avg_mark);
            let matchFound = false;

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
                const exactValue = Number(filter);
                if (avgMark === exactValue) matchFound = true;
              }
            }

            if (!matchFound) return false;
          } else {
            const filterValue = String(filters[key]).toLowerCase();
            const candidateValue = String(candidate[key]).toLowerCase();
            if (candidateValue !== filterValue) return false;
          }
        }
      }
      return candidate.is_active === true;
    });

    // ✅ Apply sorting AFTER filtering
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = String(a[sortConfig.key]).toLowerCase();
        const valB = String(b[sortConfig.key]).toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };


  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const generateDropdownOptions = (key) => {
    const uniqueValues = [...new Set(testCandidates.map(candidate => candidate[key]))];
    return uniqueValues.map((value, index) => (
      <option key={index} value={value}>{value}</option>
    ));
  };
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
      const testName = filtersParams.test_name; // Get test_name from filtersParams
      console.log('testname', testName)
      await updateMultipleTestCandidatesStatus(testName, Array.from(selectedStudents)); // Convert Set to array
      getTestCandidates();  // Refresh the list
      alert("Selected students reassigned successfully!");
      setSelectedStudents(new Set());  // Clear selections
    } catch (error) {
      console.error("Error updating students:", error);
      alert("Failed to reassign students.");
    }
  };


  const exportToExcel = async () => {
    const filteredData = filterCandidates().map(({
      id, test_id, test_type, skill_type_id, student_id, question_id,
      question_name, is_actual_test, is_active, need_candidate_info,
      instruction, attempt_count, rules, topic, duration, ...rest
    }) => rest); // Exclude unwanted fields

    const headerMap = {
      student_name: 'Candidate',
      registration_number: 'Reg_No',
      email_id: 'Email',
      mobile_number: 'Contact No',
      department: 'Department',
      user_name: 'Login ID',
      avg_mark: 'Avg Mark',
      capture_duration: 'Capture Duration',
      dtm_start_test: 'Student_Start_Date',
      // 'year' is handled separately
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

    // Map candidate data
    const wsData = filteredData.map(candidate => {
      let modified = {};
      for (let key in headerMap) {
        modified[headerMap[key]] = candidate[key] || '';
      }
      if (candidate.year !== undefined) {
        modified['Year'] = getYearString(candidate.year);
      }
      return modified;
    });

    if (wsData.length === 0) {
      alert("No valid data to export!");
      return;
    }

    const firstCandidate = filteredData[0];
    const testName = firstCandidate?.test_name?.replace(/\s+/g, '') || "Test";
    const yearString = getYearString(firstCandidate?.year) || "Year";

    const formatDate = (dateStr) => {
      if (!dateStr || typeof dateStr !== "string") return "01_01_2025";
      const parsed = new Date(dateStr.replace(/-/g, "/"));
      return isNaN(parsed) ? "01_01_2025" :
        `${String(parsed.getDate()).padStart(2, '0')}_${String(parsed.getMonth() + 1).padStart(2, '0')}_${parsed.getFullYear()}`;
    };

    const startDate = formatDate(firstCandidate?.dtm_start);
    const fileName = `${testName}_${yearString}_${startDate}.xlsx`;
    const sheetName = `${yearString} Report`;

    // Initialize workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Define headers
    const columns = Object.keys(wsData[0]).map(key => ({
      header: key,
      key: key,
      width: 20
    }));
    worksheet.columns = columns;

    // Add rows
    wsData.forEach(row => worksheet.addRow(row));

    // Export the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  };


  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
  }, [search, searchQuery]);

  // Filter search results
  const filteredData = filterCandidates()
    .filter(item =>
      !searchQuery ||
      (item.registration_number && item.registration_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.registration_number && typeof item.registration_number === 'string' && item.registration_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(item =>
      !searches ||
      (item.registration_number && item.registration_number.toLowerCase().includes(searches.toLowerCase())) ||
      (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(searches.toLowerCase())) ||
      (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(searches.toLowerCase())) ||
      (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(searches.toLowerCase())) ||
      (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(searches.toLowerCase())) ||
      (item.registration_number && typeof item.registration_number === 'string' && item.registration_number.toLowerCase().includes(searches.toLowerCase())) ||
      (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searches.toLowerCase()))
    )
  useEffect(() => {
    setFilteredCount(filteredData.length);
  }, [filteredData]);

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



  return (
    <div>
      <div className="placement-container">
        <h4>Test Report</h4>
        <div style={{ display: 'flex' }} className='action-container2'>
          <Link to="/reports/test-report" style={{ color: "black", textDecoration: "none" }}>
            <button className="button-po-save">
              <img src={back} className="nextarrow" alt="Back" /> Back
            </button>
          </Link>
          <button className="button-po-save" onClick={exportToExcel} style={{ width: "100px" }}><img src={Download} className='nextarrow'></img><span>Export</span></button>
          <input
            className="po-search-box"
            type="text"
            placeholder="Search..."
            value={searches}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={handleReassign} className="button-po-save">
            Reassign
          </button>
        </div>
        <div className='po-table-responsive-stu-res'>
          <table className="placement-table" >
            <thead >
              <tr>
                <th style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                  /></th>
                <th style={{ textAlign: "center", cursor: 'pointer' }} onClick={() => handleSort('registration_number')}>
                  <select value={filters.registration_number} className='dropdown-custom' onChange={(e) => handleFilterChange(e, 'registration_number')} >
                    <option value=""> Reg No {sortConfig.key === 'registration_number' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </option>
                    {generateDropdownOptions('registration_number')}
                  </select>

                </th>                <th style={{ textAlign: "center" }}>Candidate </th>
                <th style={{ textAlign: "center" }}>
                  <select value={filters.department_id} className='dropdown-custom' onChange={(e) => handleFilterChange(e, 'department_id')} >
                    <option value="">All Department</option>
                    {generateDropdownOptions('department_id')}
                  </select></th>
                <th style={{ textAlign: "center" }}>
                  <select value={filters.year} className='dropdown-custom' onChange={(e) => handleFilterChange(e, 'year')}  >
                    <option value="">All Year</option>
                    {generateDropdownOptions('year')}
                  </select></th>

                {/*} <th style={{ textAlign: "center" }}>Start Date</th>
                <th style={{ textAlign: "center" }}>End Date</th>*/}


                <th style={{ textAlign: "center" }}>
                  <input
                    type="text"
                    className='po-input-ques'
                    value={filters.avg_mark || ""}
                    onChange={(e) => handleFiltersChange(e, "avg_mark")}
                    placeholder=">20,<30,20-30"
                  // style={{ backgroundColor: "white", borderRadius: "5px", width: "90px", textAlign: "center" }}
                  />
                </th>

              </tr>
            </thead>
            <tbody >
              {currentData
                .filter(item =>
                  !searchQuery ||
                  (item.registration_number && item.registration_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.test_name && typeof item.test_name === 'string' && item.test_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .filter(item =>
                  !searches ||
                  (item.registration_number && item.registration_number.toLowerCase().includes(searches.toLowerCase())) ||
                  (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(searches.toLowerCase())) ||
                  (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(searches.toLowerCase())) ||
                  (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(searches.toLowerCase())) ||
                  (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(searches.toLowerCase())) ||
                  (item.test_name && typeof item.test_name === 'string' && item.test_name.toLowerCase().includes(searches.toLowerCase())) ||
                  (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searches.toLowerCase()))
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
                    <td style={{ textAlign: "center" }}>{candidate.registration_number}</td>
                    <td style={{ textAlign: "center" }}>{candidate.student_name}</td>
                    <td style={{ textAlign: "center" }}>{candidate.department_id}</td>
                    <td style={{ textAlign: "center" }}>{candidate.year}</td>
                    {/*}  <td style={{ textAlign: "center" }}>{candidate.test_name}</td>
                    <td style={{ textAlign: "center" }}>{candidate.dtm_end}</td>*/}

                    <td style={{ textAlign: "center" }}>{candidate.avg_mark}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p></p>
        <div className='placement-display-pagination'>
          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
            <Form.Control style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
              as="select"
              className='label-dis-placement'
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>
          <Pagination className="pagination-custom-placement">
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

export default StudentResults;
