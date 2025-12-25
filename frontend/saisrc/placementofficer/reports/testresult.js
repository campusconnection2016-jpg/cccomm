import React, { useState, useEffect, useContext } from 'react';
import { getViewResults_po_API, updateMultipleTestCandidatesStatus } from '../../api/endpoints';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useParams, Link } from 'react-router-dom';
import '../../styles/placement.css';
import { Form, Pagination } from 'react-bootstrap';
import Download from '../../assets/images/download.png';
import { SearchContext } from '../../allsearch/searchcontext';
import back from "../../assets/images/backarrow.png";
const TestResult = ({ institute }) => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [search, setSearch] = useState('');

  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({
    user_name: '',
    student_name: '',
    email_id: '',
    mobile_number: '',
    gender: '',
    year: '',
    department_id: '',
    college: '',
    total_score: '',
    test_name: '',
   
    dtm_end: '',    // New filter for dtm_end
    is_active: true,
    avg_mark: '',
  });
  const { test_name } = useParams();
  console.log("print test", test_name)
  // const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const [filteredCount, setFilteredCount] = useState(0);
const [sortOrder, setSortOrder] = useState('asc'); // or 'desc'
const [filtered, setFilteredDatas] = useState([]);


  useEffect(() => {
    getTestCandidates();
  }, [test_name, search, searchQuery]); // Run once on component mount
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


  const getTestCandidates = () => {
    getViewResults_po_API(institute, test_name)
      .then(data => {
        const filteredDatas = data.filter((item) => {

          const matchesSearchQuery = searchQuery
            ? (item.user_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.student_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.department_id__department?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.password?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.year?.toLowerCase() || "").includes(searchQuery.toLowerCase())
            : true;


          const matchesSearch = search
            ? (item.user_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.students_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.department_id__department?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.password?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.year?.toLowerCase() || "").includes(search.toLowerCase())
            : true;

          return matchesSearchQuery && matchesSearch;
        });


        setTestCandidates(filteredDatas);
       
       // setTestCandidates(data);
        console.log("filter", data)
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


  const exportToExcel = async () => {
    const filteredData = filterCandidates().map(({
      id, test_id, test_type, skill_type_id, student_id, question_id,
      question_name, is_actual_test, is_active, need_candidate_info,
      instruction, attempt_count, rules, topic, duration, ...rest
    }) => rest);
  
    const headerMap = {
      student_name: 'Candidate',
      user_name: 'Reg_No',
      email_id: 'Email',
      mobile_number: 'Contact No',
      department_id: 'Department',
      year: 'Year',
      avg_mark: 'Avg Mark',
      capture_duration: 'Capture Duration',
      user_name_test: 'Student_Start_Date',
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
  
    const startDate = formatDate(firstCandidate?.user_name);
    const fileName = `${testName}_${year}_${startDate}.xlsx`;
    const sheetName = `${year} Report`;
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
  
    // Define headers
    const columns = Object.values(headerMap).map(header => ({
      header,
      key: header,
      width: 20
    }));
    worksheet.columns = columns;
  
    // Add rows
    wsData.forEach(row => {
      worksheet.addRow(row);
    });
  
    // Generate and save Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
      (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.user_name && typeof item.user_name === 'string' && item.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(item =>
      !search ||
      (item.user_name && item.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(search.toLowerCase())) ||
      (item.year && typeof item.year === 'string' && item.year.toLowerCase().includes(search.toLowerCase())) ||
      (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(search.toLowerCase())) ||
      (item.avg_mark && typeof item.avg_mark === 'string' && item.avg_mark.toLowerCase().includes(search.toLowerCase())) ||
      (item.user_name && typeof item.user_name === 'string' && item.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(search.toLowerCase()))
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
  const uniqueRegistrationNos = [...new Set(testCandidates.map(c => c.user_name))];
  const uniqueDepartments = [...new Set(testCandidates.map(c => c.department_id))];
  const uniqueYears = [...new Set(testCandidates.map(c => c.year))];

  return (
    <div >
      <div className="placement-container">
        <h4>Test Result</h4>
        <div className="po-control-panel">
          {/* Left Group: Back + Search */}
          <div className="po-left-group">
            <Link to="/test/test-schedules/" style={{ color: "black", textDecoration: "none" }}>
              <button className="button-po-save">
                <img src={back} className="nextarrow" alt="Back" /> Back
              </button>
            </Link>

            <input
              className="po-search-box"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right Group: Export + Reassign */}
          <div className="po-right-group">
            <button className="button-po-save" onClick={exportToExcel}>
              <img src={Download} className="nextarrow" alt="Download" />
              <span>Export</span>
            </button>

            <button onClick={handleReassign} className="button-po-save">
              Reassign
            </button>
          </div>
        </div>


        <p
          className="filtered-count"
        //style={{ flexShrink: "0", margin: "0", fontWeight: "bold" }}
        >
          No of Candidates: {filteredCount}
        </p>
        <div className='po-table-responsive-test-attend-candidates'>
          <table className="placement-table" >
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                  /></th>
                <th style={{ textAlign: "center" }}>
                  <select value={filters.student_name || ''} onChange={(e) => handleFiltersChange(e, "student_name")}
                    className="po-dropdown-custom" >
                    <option value="" >Candidate</option>
                    {uniqueCandidates.map(name => <option key={name} value={name}  >{name}</option>)}
                  </select>
                </th>
                <th style={{ textAlign: "center" }}><select value={filters.user_name || ''} onChange={(e) => handleFiltersChange(e, "user_name")}
                  className="po-dropdown-custom" >
                  <option value="" >LoginID</option>
                  {uniqueRegistrationNos.map(reg => <option key={reg} value={reg} >{reg}</option>)}
                </select></th>

                <th style={{ textAlign: "center" }}><select value={filters.department_id || ''} onChange={(e) => handleFiltersChange(e, "department_id")} className="po-dropdown-custom"
                >
                  <option value="" > Department</option>
                  {uniqueDepartments.map(dept => <option key={dept} value={dept} >{dept}</option>)}
                </select></th>
                <th style={{ textAlign: "center" }}><select value={filters.year || ''} onChange={(e) => handleFiltersChange(e, "year")}
                  className="po-dropdown-custom" >
                  <option value="" > Year</option>
                  {uniqueYears.map(year => <option key={year} value={year} >{year}</option>)}
                </select></th>

                <th style={{ textAlign: "center" }}>

                  <input
                    type="text"
                    value={filters.avg_mark || ""}
                    className="po-dropdown-custom"
                    onChange={(e) => handleFiltersChange(e, "avg_mark")}
                    placeholder=">20,<30,20-30"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData
              
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
                    <td style={{ textAlign: "center" }}>{candidate.user_name}</td>

                    <td style={{ textAlign: "center" }}>{candidate.department_id}</td>
                    <td style={{ textAlign: "center" }}>{candidate.year}</td>

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

export default TestResult;
