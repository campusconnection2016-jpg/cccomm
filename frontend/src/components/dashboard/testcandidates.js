import React, { useState, useEffect, useContext } from 'react';
import {
 
  getTestcandidateReports_candidates_Api, getReports_College_UserName_API, updateMultipleTestCandidatesStatus
} from '../../api/endpoints';
import { useLocation, useNavigate } from "react-router-dom";

import { useParams, Link } from 'react-router-dom';
import { Table, Form, Pagination } from 'react-bootstrap';
import '../../styles/trainingadmin.css';
import Download from '../../assets/images/download.png'
import Footer from '../../footer/footer';
import { SearchContext } from '../../allsearch/searchcontext';
import back from "../../assets/images/backarrow.png";
import '../../styles/po.css';
import CustomPagination from '../../api/custompagination';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Testcandidates = ({ institute, userRole }) => {
    console.log('institute:', institute);
const [collegeId, setCollegeId] = useState(null);
  const [testCandidates, setTestCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const { searchQuery } = useContext(SearchContext);
  const [toggleState, setToggleState] = useState('all');
  const [filters, setFilters] = useState({
    registration_number: '',
    student_name: '',
    year: '',
    avg_mark: '',
    gender: '',
    year: '',
    department: '',
    college: '',
    total_score: '',
    dtm_start: '', // New filter for dtm_start
    dtm_end: '',    // New filter for dtm_end

    is_active: null,
    is_reassigned: null,
    attempt_count: '',
  });
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const [filteredCount, setFilteredCount] = useState(0);

  const { test_name ,college_id} = useParams();
    const [totalPages1, setTotalPages1] = useState(1);
    const [pageSize] = useState(10); // Items per page
    const [currentPage, setCurrentPage] = useState(1);
const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const [uniqueCandidates, setUniqueCandidates] = useState([]);
  const [uniqueRegistrationNos, setUniqueRegistrationNos] = useState([]);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueYears, setUniqueYears] = useState([]);

  const getTestCandidates = (page) => {
  const avgMarkFilter = filters.avg_mark ? filters.avg_mark : "";

  const additionalFilters = {
    student_name: filters.student_name || "",
    user_name: filters.user_name || "",
    department_id: filters.department_id || "",
    year: filters.year || ""
  };

  

  if (userRole === "Placement Officer" || userRole === "Super admin") {
    const status = toggleState === "all" ? "" : toggleState;

    getTestcandidateReports_candidates_Api(test_name, college_id, page, search, status, avgMarkFilter, additionalFilters)
      .then(data => {
        setTestCandidates(data.results || []);
        setUniqueCandidates(data.student_name || []);
        setUniqueRegistrationNos(data.user_name || []);
        setUniqueDepartments(data.Department || []);
        setUniqueYears(data.year || []);
        if (data.results && data.results.length > 0 && data.results[0].collegeId) {
          setCollegeId(data.results[0].collegeId); // ✅ Extracted from API result
        }
        setTotalPages1(Math.ceil(data.count / pageSize));
        

      })
      .catch(error => console.error('Error fetching test candidates:', error));
  }
};

  
  
    // Fetch colleges when component mounts
    useEffect(() => {
      getTestCandidates(currentPage, search);
    }, [currentPage, search, toggleState, filters]);
  
  
    const handlePageChange1 = (page) => {
      setCurrentPage(page);
    };
  


const handleSort = (key) => {
  let direction = 'asc';
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }
  setSortConfig({ key, direction });
};

  const handleFiltersChange = (event, key) => {
    setFilters({
      ...filters,
      [key]: event.target.value
    });
  };
const fetchAllTestCandidates = async () => {
  const allCandidates = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const avgMarkFilter = filters.avg_mark || "";
    const additionalFilters = {
      student_name: filters.student_name || "",
      user_name: filters.user_name || "",
      department_id: filters.department_id || "",
      year: filters.year || ""
    };

    let data;
    if (userRole === "Placement Officer") {
      data = await getReports_College_UserName_API(institute, test_name, page, search);
    } else {
      const status = toggleState === "all" ? "" : toggleState;
      data = await getTestcandidateReports_candidates_Api(test_name, college_id, page, search, status, avgMarkFilter, additionalFilters);
    }

    allCandidates.push(...(data.results || []));
    const total = data.count || 0;
    const totalPages = Math.ceil(total / pageSize);
    hasMore = page < totalPages;
    page += 1;
  }

  return allCandidates;
};

 const exportToExcel = async () => {
  const allData = await fetchAllTestCandidates();

  const filterAllCandidates = () => {
    if (toggleState === 'all') return allData;

    return allData.filter(candidate => {
      const isActiveMatch =
        (toggleState === 'active' && candidate.is_active) ||
        (toggleState === 'inactive' && !candidate.is_active) ||
        (toggleState === 'reassigned' && candidate.is_reassigned);

      if (!isActiveMatch) return false;

      for (let key in filters) {
        const filterValue = filters[key];
        if (!filterValue) continue;

        if (key === 'avg_mark') {
          const avgMark = Number(candidate.avg_mark);
          if (isNaN(avgMark)) return false;

          const filterValues = filterValue.trim().split(",").map(val => val.trim());
          let matchFound = false;

          for (let filter of filterValues) {
            if (filter.startsWith(">")) {
              if (avgMark > Number(filter.substring(1))) matchFound = true;
            } else if (filter.startsWith("<")) {
              if (avgMark < Number(filter.substring(1))) matchFound = true;
            } else if (filter.includes("-")) {
              const [min, max] = filter.split("-").map(Number);
              if (avgMark >= min && avgMark <= max) matchFound = true;
            } else {
              if (avgMark === Number(filter)) matchFound = true;
            }
          }

          if (!matchFound) return false;
        } else {
          const candidateValue = String(candidate[key] || '').toLowerCase();
          const filterValueStr = String(filterValue).toLowerCase();
          if (candidateValue !== filterValueStr) return false;
        }
      }

      return true;
    });
  };

  const filteredData = filterAllCandidates().map(({
    id, test_id, test_type, skill_type_id, student_id, question_id, question_name,
    is_actual_test, is_active, need_candidate_info, instruction,
    rules, topic, duration, total_score, email_id, mobile_number,
    gender, dtm_start, dtm_end, is_reassigned, ...rest
  }) => rest);

  const headerMap = {
    student_name: 'Candidate',
    user_name: 'Login ID',
    registration_number: 'Reg_No',
    department: 'Department',
    year: 'Year',
    college: 'College',
    test_name: 'TestName',
    avg_mark: 'Average',
    attempt_count: "No of Attempt"
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
const sortKey = sortConfig?.key || 'user_name';
const direction = sortConfig?.direction || 'asc';

filteredData.sort((a, b) => {
  const valA = String(a[sortKey] || '').toLowerCase();
  const valB = String(b[sortKey] || '').toLowerCase();

  if (valA < valB) return direction === 'asc' ? -1 : 1;
  if (valA > valB) return direction === 'asc' ? 1 : -1;
  return 0;
});


  const processedData = filteredData.map(candidate => {
    const row = [];
    for (let key in headerMap) {
      if (key === 'year') {
        row.push(getYearString(candidate[key]));
      } else {
        row.push(candidate[key] ?? '');
      }
    }
    return row;
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  worksheet.addRow(Object.values(headerMap));
  processedData.forEach(row => worksheet.addRow(row));

  worksheet.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, cell => {
      maxLength = Math.max(maxLength, (cell.value || '').toString().length);
    });
    column.width = maxLength + 2;
  });

  const yearIndex = Object.keys(headerMap).indexOf('year');
  const yearLabel = processedData[0]?.[yearIndex]?.replace(/\s+/g, '') || "Year";
  const testName = filteredData[0]?.test_name || 'Test_Report';

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${testName}_${yearLabel}_report.xlsx`);
};

const handleCheckboxChange = (id) => {
  console.log("Checkbox clicked for student ID:", id);
  setSelectedStudents(prev => {
    const newSelected = new Set(prev);
    if (newSelected.has(id)) {
      console.log("Student already selected. Removing:", id);
      newSelected.delete(id);
    } else {
      console.log("Adding student to selection:", id);
      newSelected.add(id);
    }
    console.log("Updated selected students set:", Array.from(newSelected));
    return newSelected;
  });
};

const handleSelectAll = () => {
  const filteredStudents = testCandidates;
  console.log("Selecting all. Total students in list:", filteredStudents.length);
  if (selectedStudents.size === filteredStudents.length) {
    console.log("All students are already selected. Clearing selection.");
    setSelectedStudents(new Set());
  } else {
    const newSet = new Set(filteredStudents.map(item => item.student_id));
    console.log("Selecting all students. New selection set:", Array.from(newSet));
    setSelectedStudents(newSet);
  }
};

const handleReassign = async () => {
  if (selectedStudents.size === 0) {
    alert("No students selected.");
    return;
  }

  const studentIdsArray = Array.from(selectedStudents);
  
  try {
    const response = await updateMultipleTestCandidatesStatus(test_name, studentIdsArray);
    console.log("Reassign successful:", response);
    alert("Test Reassign successfully")

    // ✅ REFRESH DATA HERE
    getTestCandidates(currentPage);

    // Optionally clear selected students
    setSelectedStudents(new Set());
    
  } catch (error) {
    console.error("Error during reassign:", error);
    alert("Failed to reassign students.");
  }
};

const getSortedCandidates = () => {
  // Clone to avoid mutating original state
  let sorted = [...testCandidates];

  if (sortConfig?.key) {
    sorted.sort((a, b) => {
      const valA = String(a[sortConfig.key] || '').toLowerCase();
      const valB = String(b[sortConfig.key] || '').toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return sorted;
};
const location = useLocation();
  const navigate = useNavigate();

  const origin = location.state?.origin; // 'aptitude' or 'technical'

console.log('origin:', origin);
console.log('collegeId:', collegeId);

const handleBack = () => {
  console.log('handleBack triggered');

  if (origin === "TotalAptitudeTest") {
    console.log('Navigating to TotalAptitudeTest');
    navigate(`/total-aptitude-test-report/${collegeId}`);
  } else if (origin === "TotalTechnicalTest") {
    console.log('Navigating to TotalTechnicalTest');
    navigate(`/total-technical-test-report/${collegeId}`);
  } else if (origin === "TotalCommunicationTest") {
    console.log('Navigating to TotalCommunicationTest');
    navigate(`/total-commun-test-report/${collegeId}`);
  } else if (origin === "TotalCompanyTest") {
    console.log('Navigating to TotalCompanyTest');
    navigate(`/total-company-test-report/${collegeId}`);
  } else {
    console.log('Navigating to fallback test schedules');
    navigate("/test/test-schedules");
  }
};

  return (
    <div>
      <div className="placement-container">

        <div style={{ display: 'flex' }} className='action-container4'>
         
            <button
              className="button-po-save"
              style={{ float: "left" }}
              onClick={handleBack}
            >
              <img src={back} className="nextarrow"></img>{" "}
              Back </button>
        

          <input
            className="search-box1"
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="po-add-products-button" style={{ width: "114px" }} onClick={exportToExcel}><img src={Download} className='nextarrow'></img><span>Export</span></button>

          <div className="toggle-filter">

            <select
              value={toggleState}
              onChange={(e) => setToggleState(e.target.value)}
              className="dropdown-custom"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="reassigned">Reassigned</option>
            </select>
          </div>
          <button onClick={handleReassign} className="button-po-save" style={{ width: "100px" }}>
            Reassign
          </button>
        </div>

        <div className='po-table-responsive-test-assign-candidates'>
          <table className="placement-table" >
            <thead >
              <tr>
                <th >
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === testCandidates.length && testCandidates.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ textAlign: "center" }}>
                  <select value={filters.student_name || ''} onChange={(e) => handleFiltersChange(e, "student_name")}
                    className="po-dropdown-custom" >
                    <option value="" >Candidate</option>
                    {uniqueCandidates.map(name => <option key={name} value={name}  >{name}</option>)}
                  </select>
                </th>
                <th style={{ textAlign: "center", cursor: "pointer" }}
  onClick={() => handleSort("user_name")}><select value={filters.user_name || ''} onChange={(e) => handleFiltersChange(e, "user_name")}
                  className="po-dropdown-custom" >
                  <option value="" > LoginID {sortConfig.key === 'user_name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
</option>
                  {uniqueRegistrationNos.map(reg => <option key={reg} value={reg} >{reg}</option>)}
                </select></th>

                <th style={{ textAlign: "center" }}><select value={filters.department_id || ''} onChange={(e) =>  handleFiltersChange(e, "department_id")} className="po-dropdown-custom"
                >
                  <option value="" > Department</option>
                  {uniqueDepartments.map(dept => <option key={dept} value={dept} >{dept}</option>)}
                </select></th>
                <th style={{ textAlign: "center" }}><select value={filters.year || ''} onChange={(e) => handleFiltersChange(e, "year")}
                  className="po-dropdown-custom" >
                  <option value="" > Year</option>
                  {uniqueYears.map(year => <option key={year} value={year} >{year}</option>)}
                </select></th>

                {(toggleState === 'active' || toggleState === '' || toggleState === 'reassigned') && (
                  <th style={{ textAlign: "center" }}>
                    <input
                      type="text"
                      value={filters.avg_mark || ""}
                      className="po-dropdown-custom"
                      onChange={(e) => handleFiltersChange(e, "avg_mark")}
                      placeholder=">20,<30,20-30"
                    />
                  </th>)}
                {/*}   <th style={{ textAlign: "center" }}>Is active</th>
             */}
                {(toggleState === 'reassigned' || toggleState === 'inactive') && (<th style={{ textAlign: "center" }}>Attempt</th>)}
              </tr>

            </thead>
            <tbody>
              {getSortedCandidates()

                .map((item) => (
                  <tr key={item.id} style={{ color: item.is_active ? 'Orange' : 'white', fontWeight: item.is_active ? 'bold' : '' }} >
                    <td>
                      <input
        type="checkbox"
        checked={selectedStudents.has(item.student_id)}
        onChange={() => handleCheckboxChange(item.student_id)}
      />
                    </td>

                    <td style={{ textAlign: "center" }}>{item.student_name}</td>
                    <td style={{ textAlign: "center" }}>{item.user_name}</td>

                    <td style={{ textAlign: "center" }}>{item.department_id}</td>
                    <td style={{ textAlign: "center" }}>{item.year}</td>
                    {(toggleState === 'active' || toggleState === 'all' || toggleState === 'reassigned') && (
                      <td style={{ textAlign: "center" }}>{item.avg_mark}</td>
                    )}

                    {(toggleState === 'reassigned' || toggleState === 'inactive') && (<td style={{ textAlign: "center" }}>{item.attempt_count}</td>)}
                    {/*}  <td style={{ textAlign: "center" }}> {item.is_active ? 'Active' : 'Inactive'}</td>
*/}
                  </tr>
                ))}
            </tbody>
          </table></div><p></p>
          
          
          
                  <div className='dis-page' style={{ marginTop: '10%' }}>
                    {/* Custom Pagination */}
                    <CustomPagination
                      totalPages={totalPages1}
                      currentPage={currentPage}
                      onPageChange={handlePageChange1}
                      maxVisiblePages={3} // Limit to 3 visible pages
                    />
                  </div>


      </div ><p style={{ height: "50px" }}></p>
      {/*  <Footer></Footer>*/}
    </div>

  );
};

export default Testcandidates;