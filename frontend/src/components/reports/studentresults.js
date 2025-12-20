
import React, { useState, useEffect, useContext } from 'react';
import {
 
  get_CC_Test_Reports_Stu_API
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

const StudentResults = () => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [searches, setSearches] = useState('');

  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({
    registration_number: '',
    student_name: '',
    email_id: '',
    mobile_number: '',
    gender: '',
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

  // Use filters as needed in your component logic
  // console.log("Filters:", filtersParams);


  useEffect(() => {
    getTestCandidates();
  }, [filtersParams]); // Run once on component mount

  const getTestCandidates = () => {
    get_CC_Test_Reports_Stu_API(filtersParams)
      .then(data => {
        setTestCandidates(data);
        console.log("filter", data)
      })
      .catch(error => console.error('Error fetching test candidates:', error));
  };

  const handleFilterChange = (event, key) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const filterCandidates = () => {
    return testCandidates.filter(candidate => {
      for (let key in filters) {
        if (filters[key] !== '') {
          if (key === 'total_score') {
            const [min, max] = filters[key].split('-').map(Number);
            if (candidate.total_score < min || candidate.total_score > max) {
              return false;
            }
          } else {
            const filterValue = String(filters[key]).toLowerCase(); // Convert filter value to lowercase string
            const candidateValue = String(candidate[key]).toLowerCase(); // Convert candidate value to lowercase string
            if (candidateValue !== filterValue) {
              return false;
            }
          }
        }
      }
      // Check if the is_active property is true
      return candidate.is_active === true;
    });
  };

  const generateTotalScoreOptions = () => {
    const ranges = ['0-10', '10-20','20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100', '0-50', '0-60', '0-70', '0-80', '0-90', '0-100', '40-100','50-100','60-100','70-100','80-100','90-100'];
    return ranges.map((value, index) => (
      <option key={index} value={value}>{value}</option>
    ));
  };

  const generateDropdownOptions = (key) => {
    const uniqueValues = [...new Set(testCandidates.map(candidate => candidate[key]))];
    return uniqueValues.map((value, index) => (
      <option key={index} value={value}>{value}</option>
    ));
  };

  const generateAvgMarkOptions = () => {
    const ranges = Array.from({ length: 10 }, (_, i) => `${i * 10}-${(i + 1) * 10}`); // ['0-10', '10-20', ..., '90-100']
    return ranges.map((value, index) => (
      <option key={index} value={value}>{value}</option>
    ));
  };

  const exportToExcel = async () => {  // Mark this function as async
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
        department: 'Department',
        user_name: 'Login ID',
        avg_mark: 'Avg Mark',
        capture_duration: 'Capture Duration',
        dtm_start_test: 'Student_Start_Date',
        dtm_start: 'Test Start Date',
        dtm_end: 'Test End Date',
        year: 'Year'
    };

    const getYearString = (year) => {
        const yearMap = {
            4: 'Final Year',
            3: '3rd Year',
            2: '2nd Year',
            1: '1st Year'
        };
        return yearMap[year] || 'Unknown Year'; // Default if value is missing or invalid
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
        if (!dateStr || typeof dateStr !== "string") return "01_01_2025"; // Default if missing
        const parsedDate = new Date(dateStr.replace(/-/g, "/"));
        return isNaN(parsedDate) ? "01_01_2025" : 
            `${String(parsedDate.getDate()).padStart(2, '0')}_${String(parsedDate.getMonth() + 1).padStart(2, '0')}_${parsedDate.getFullYear()}`;
    };

    const startDate = formatDate(firstCandidate?.dtm_start);

    // Filename format: TestName_Year_StartDate.xlsx
    const fileName = `${testName}_${year}_${startDate}.xlsx`;
    const sheetName = `${testName}_${year} Report`;

    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        // Add header row
        const headers = Object.values(headerMap);
        worksheet.addRow(headers);

        // Add data rows
        wsData.forEach(item => {
            const row = headers.map(header => item[header]);
            worksheet.addRow(row);
        });

        // Auto width for columns
        worksheet.columns.forEach(col => {
            let maxLength = 12;
            col.eachCell({ includeEmpty: true }, cell => {
                const val = cell.value || '';
                const length = val.toString().length;
                if (length > maxLength) maxLength = length;
            });
            col.width = maxLength + 2;
        });

        // Generate Excel file and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, fileName);

    } catch (error) {
        console.error("Error exporting Excel:", error);
        alert("Failed to export Excel file.");
    }
};


  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  {/*}
  const totalPages = Math.ceil(filterCandidates().length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = filterCandidates().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
*/}

// Filter candidates by search input
const filteredData = filterCandidates().filter((item) => {
  // Ensure values are strings before calling toLowerCase
  const userName = item.user_name?.toLowerCase() || '';
  const StuName = item.student_name?.toLowerCase() || '';
  const gen = item.gender?.toLowerCase() || '';
  const deptId = item.department_id?.toLowerCase() || '';
  const totScore = item.total_score?.toString() || ''; // Convert number to string
  const startDate = item.dtm_start?.toLowerCase() || '';
  const endDate = item.dtm_end?.toLowerCase() || '';

  const combinedSearch = searches || searchQuery;
  return (
    userName.includes(combinedSearch.toLowerCase()) ||
    StuName.includes(combinedSearch.toLowerCase()) ||
    gen.includes(combinedSearch.toLowerCase()) ||
    deptId.includes(combinedSearch.toLowerCase()) ||
    totScore.includes(combinedSearch.toLowerCase()) ||
    startDate.includes(combinedSearch.toLowerCase()) ||
    endDate.includes(combinedSearch.toLowerCase()) 
  );
});

// Reset to the first page whenever filters or searches change
useEffect(() => {
  setCurrentPage(1); // Reset to the first page when filters or searches change
}, [filters, searches, searchQuery]);


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
      <div className="product-table-container">
        <h6 >Test Results</h6>
        <div style={{ display: 'flex' }}>
          <button className="button-ques-save" onClick={exportToExcel} style={{ width: "100px", marginRight: '20px' }}><img src={Download} className='nextarrow'></img><span>Export</span></button>
          <input
            className="search-box1"
            type="text"
            placeholder="Search..."
            value={searches}
            onChange={(e) => setSearches(e.target.value)}
          />
        </div>
        <div className='table-responsive-train'>
          <table className="product-table" >
            <thead className="table-thead">
              <tr>
                <th style={{ textAlign: "center" }}>Login ID</th>
                <th style={{ textAlign: "center" }}>Candidate </th>
                <th style={{ textAlign: "center" }}>Department <br></br>
                  <select value={filters.department_id} onChange={(e) => handleFilterChange(e, 'department_id')} style={{ backgroundColor: 'white', borderRadius: '5px', width: "90px" }} >
                    <option value="">All</option>
                    {generateDropdownOptions('department_id')}
                  </select></th>
                <th style={{ textAlign: "center" }}>Gender <br></br>
                  <select value={filters.gender} onChange={(e) => handleFilterChange(e, 'gender')} style={{ backgroundColor: 'white', borderRadius: '5px', width: "70px" }} >
                    <option value="">All</option>
                    {generateDropdownOptions('gender')}
                  </select></th>

                <th style={{ textAlign: "center" }}>Start Date</th>
                <th style={{ textAlign: "center" }}>End Date</th>


                <th style={{ textAlign: "center" }}>Total Score <br></br>
                  <select value={filters.total_score} onChange={(e) => handleFilterChange(e, 'total_score')} style={{ backgroundColor: 'white', borderRadius: '5px', width: "90px" }} >
                    <option value="">All</option>
                    {generateTotalScoreOptions()}
                  </select></th>
              </tr>
            </thead>
            <tbody className="table-tbody-add">
              {currentData
                .map(candidate => (
                  <tr key={candidate.id} className={candidate.is_active ? 'active-row' : ''}>
                    <td style={{ textAlign: "center" }}>{candidate.user_name}</td>
                    <td style={{ textAlign: "center" }}>{candidate.student_name}</td>
                    <td style={{ textAlign: "center" }}>{candidate.department_id}</td>
                    <td style={{ textAlign: "center" }}>{candidate.gender}</td>
                    <td style={{ textAlign: "center" }}>{candidate.dtm_start}</td>
                    <td style={{ textAlign: "center" }}>{candidate.dtm_end}</td>

                    <td style={{ textAlign: "center" }}>{candidate.total_score}</td>
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

export default StudentResults;
