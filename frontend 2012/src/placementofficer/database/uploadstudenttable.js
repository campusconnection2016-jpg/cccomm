import React, { useContext, useState, useEffect } from 'react';
import { SearchContext } from '../../allsearch/searchcontext';
import { Table, Form, Pagination } from 'react-bootstrap';
import '../../styles/placement.css';
import { getNonDbCandidates_API_place, getdbCandidates_API_place, getcollegeApi } from '../../api/endpoints';
import moment from 'moment-timezone';
import Download from '../../assets/images/download.png';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
const FilterDropdown = ({ options, selectedValue, onChange, className }) => {
  return (
    <select
      value={selectedValue || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`filter-dropdown ${className}`}
    >
      <option value="">All</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};


const Uploadstudentdata = ({ institute }) => {
  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({});
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dbcandidates, setDbCandidates] = useState([]);
  const [nonDbcandidates, setNonDbCandidates] = useState([]);
  const [selectedCandidateType, setSelectedCandidateType] = useState('Db Candidates');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDbCandidates();
    fetchNonDbCandidates();
  }, [searchQuery, search]);

  useEffect(() => {
    setFilteredStudents(filterCandidates());
    setCurrentPage(1);
  }, [filters, dbcandidates, nonDbcandidates, selectedCandidateType]);

  const fetchDbCandidates = () => {
    getdbCandidates_API_place(institute)
      .then(data => {
        const filteredStudentsDb = data.filter(item =>
          (searchQuery ? (
            (item.college_id__college?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.students_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.department_id__department?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.year?.toLowerCase() || '').includes(searchQuery.toLowerCase())
          ) : true) &&
          (search ? (
            (item.college_id__college?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.user_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.students_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.department_id__department?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.year?.toLowerCase() || '').includes(search.toLowerCase())
          ) : true)
        );
        setDbCandidates(filteredStudentsDb);
        console.log('setDbCandidates: ', data);
      })
      .catch(error => {
        console.error('Error fetching dbCandidates data:', error);
      });
  };

  const fetchNonDbCandidates = () => {
    getNonDbCandidates_API_place(institute)
      .then(data => {
        const filteredStudentsNonDb = data.filter(item =>
          (searchQuery ? (
            (item.college_id__college?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.password?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.dtm_upload?.toLowerCase() || '').includes(searchQuery.toLowerCase())
          ) : true) &&
          (search ? (
            (item.college_id__college?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.user_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.password?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.dtm_upload?.toLowerCase() || '').includes(search.toLowerCase())
          ) : true)
        );
        setNonDbCandidates(filteredStudentsNonDb);
        console.log('Filtered Non-Db Candidates:', filteredStudentsNonDb);
      })
      .catch(error => {
        console.error('Error fetching nonDbCandidates data:', error);
      });
  };

  const exportToExcel_Db = async () => {
    console.log("Exporting Db Candidates to Excel using ExcelJS...");
  
    const filteredData = filteredStudents.map(({ id, college_id, college_id__college, college_id__college_group, ...rest }) => rest); // Exclude id field
  
    const headerMap = {
      batch_no: 'Batch No',
      students_name: 'Student Name',
      user_name: 'User Name**',
      registration_number: 'Reg No',
      gender: 'Gender',
      email_id: 'Email ID',
      mobile_number: 'Mobile Number',
      year: 'Year**',
      cgpa: 'CGPA',
      department_id__department: 'Department**',
      marks_10th: '10th Mark',
      marks_12th: '12th Mark',
      history_of_arrears: 'History Of Arrears',
      standing_arrears: 'Standing Arrears',
      it_of_offers: 'No.Of.IT Offers',
      core_of_offers: 'No.Of.Core Offers',
      number_of_offers: 'No.Of.Offers',
      password: 'Password**',
    };
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DB');
  
    // Set up the header row
    const headers = Object.values(headerMap);
    worksheet.addRow(headers);
  
    // Add data rows
    filteredData.forEach((student) => {
      const row = [];
      for (let key in headerMap) {
        row.push(student[key] ?? '');
      }
      worksheet.addRow(row);
    });
  
    // Auto-width for columns
    worksheet.columns.forEach(column => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, (cell.value || '').toString().length);
      });
      column.width = maxLength + 2;
    });
  
    // Generate and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'DB_Data.xlsx');
  };
  
  const exportToExcel_Non_Db = async () => {
    console.log("Exporting Non-Db Candidates to Excel using ExcelJS...");
  
    const filteredData = filteredStudents.map(({ college_id__id, dtm_upload, college, college_id__college, college_group, ...rest }) => rest); // Exclude unwanted fields
  
    const headerMap = {
      user_name: 'user_name',
      password: 'password',
      batch_no: 'batch_no',
    };
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Non DB');
  
    // Set header row
    const headers = Object.values(headerMap);
    worksheet.addRow(headers);
  
    // Add data rows
    filteredData.forEach((student) => {
      const row = [];
      for (let key in headerMap) {
        row.push(student[key] ?? '');
      }
      worksheet.addRow(row);
    });
  
    // Optional: Auto-resize columns
    worksheet.columns.forEach(column => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, cell => {
        maxLength = Math.max(maxLength, (cell.value || '').toString().length);
      });
      column.width = maxLength + 2;
    });
  
    // Generate Excel and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Non_DB.xlsx');
  };
  

  // Function to handle the export button click
  const handleExport = () => {
    if (selectedCandidateType === "Db Candidates") {
      exportToExcel_Db();
    } else {
      exportToExcel_Non_Db();
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };


  const handleCandidateTypeChange = (value) => {
    setSelectedCandidateType(value);
    setFilters({});
    setCurrentPage(1);
  };

  const filterCandidates = () => {
  const candidates = selectedCandidateType === 'Db Candidates' ? dbcandidates : nonDbcandidates;
  return candidates.filter((item) => {
    return Object.entries(filters).every(([key, value]) =>
      !value || (item[key] && item[key].toString().toLowerCase() === value.toLowerCase())
    );
  });
};


  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const filterOptions = {
    college_id__college: [...new Set((selectedCandidateType === 'Db Candidates' ? dbcandidates : nonDbcandidates).map((candidate) => candidate.college_id__college))],
    department_id__department: [...new Set((selectedCandidateType === 'Db Candidates' ? dbcandidates : nonDbcandidates).map((candidate) => candidate.department_id__department))],
  };



  const formatDate = (dateString) => {
    if (!dateString) {
      return null; // Return null if dateString is null or undefined
    }

    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = hours.toString().padStart(2, '0');

    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
  };

  const formatDate1 = (dateString) => {
    if (!dateString) {
      return null; // Return null if dateString is null or undefined
    }

    const localDate = moment(dateString).local();
    return localDate.format('DD/MM/YYYY hh:mm A');
  };

  return (
    <div className="product-table-container-selectoff">
      <div className="candidate-type-dropdown">
        <input
          className="search-box-db-nondb"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="sp-candidates-db-nondb"
          value={selectedCandidateType}
          onChange={(e) => handleCandidateTypeChange(e.target.value)}
        >
          <option value="Db Candidates">Db Candidates</option>
          <option value="Non-Db Candidates">Non-Db Candidates</option>
        </select>
        <button className="button-ques-save" style={{ width: "100px", marginLeft: '10px' }} onClick={handleExport}>
          <img src={Download} className='nextarrow'></img><span>Export</span>
        </button>
      </div>
      <div className="po-table-responsive-stu-data">
        <table className="placement-table">
          <thead >
            <tr>
              {selectedCandidateType === 'Db Candidates' && (
                <>

                  <th>Login ID</th>

                  <th>Student Name</th>
                  <th>
                    Department
                    <FilterDropdown
                      options={filterOptions.department_id__department}
                      selectedValue={filters.department_id__department}
                      onChange={(value) => handleFilterChange('department_id__department', value)}
                      className="dropdown-department"
                    />
                  </th>
                  <th>Year</th>
                   <th>Password</th>
                </>
              )}
              {selectedCandidateType === 'Non-Db Candidates' && (
                <>

                  <th>User Name</th>
                  <th>Password</th>
                  <th>Upload Time</th>
                </>
              )}
            </tr>
          </thead>
          <tbody >
            {currentData.map((item) => (
              <tr key={item.id} style={{ padding: '30px' }}>
                {selectedCandidateType === 'Db Candidates' && (
                  <>
                    <td>{item.user_name}</td>
                    <td>{item.students_name}</td>
                    <td>{item.department_id__department}</td>
                    <td>{item.year}</td>
                     <td>{item.password}</td>
                  </>
                )}
                {selectedCandidateType === 'Non-Db Candidates' && (
                  <>
                    <td>{item.user_name}</td>
                    <td>{item.password}</td>
                    <td>{formatDate1(item.dtm_upload)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p></p>
      </div>
      <div className='placement-display-pagination'>
        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
          <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
          <Form.Control as="select" className='label-dis-placement' style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
            value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
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
    </div>
  );
};



export default Uploadstudentdata;
