import React, { useState, useEffect } from 'react';
import { Form, Pagination, Button } from 'react-bootstrap';
import { getDistinctCompany_API, getEligible_students_ReportAPI, getRoundOfInterviews_API } from '../../api/endpoints';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const PlacementReport = () => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [company_name, setcompany_name] = useState('');
  const [round_of_interview, setround_of_interview] = useState('');
  const [companyList, setCompanyList] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [interviewRounds, setInterviewRounds] = useState([]);

  // Fetch company names and interview rounds on component mount
  useEffect(() => {
    getDistinctCompany_API()
      .then(data => {
        setCompanyList(data);
      })
      .catch(error => {
        console.error('Error fetching company names:', error);
      });

    getRoundOfInterviews_API()
      .then(data => {
        if (Array.isArray(data)) {
          setInterviewRounds(data);
        } else if (data && Array.isArray(data.rounds)) {
          setInterviewRounds(data.rounds);
        } else {
          setInterviewRounds([]);
        }
      })
      .catch(error => {
        console.error('Error fetching interview rounds:', error);
        setInterviewRounds([]);
      });
  }, []);

  // Fetch test candidates when company_name or round_of_interview changes
  useEffect(() => {
    if (company_name && round_of_interview) {
      getTestCandidates();
    }
  }, [company_name, round_of_interview]);

  // Function to fetch test candidates
  const getTestCandidates = () => {
    getEligible_students_ReportAPI(round_of_interview, company_name)
      .then(data => {
        if (data && data.students) {
          setTestCandidates(data.students);
        } else {
          setTestCandidates([]);
        }
      })
      .catch(error => {
        console.error('Error fetching test candidates:', error);
        setTestCandidates([]);
      });
  };

  // Export function to download Excel file
 
  const exportToExcel = async () => {
    const dataToExport = testCandidates.map((item) => ({
      Company: item.job_id__company_name,
      Name: item.students_id__students_name,
      Department: item.students_id__department_id__department,
      Email: item.students_id__email_id,
      Mobile: item.students_id__mobile_number,
      CGPA: item.students_id__cgpa,
      Mark_10th: item.students_id__marks_10th,
      Mark_12th: item.students_id__marks_12th,
      History_of_arrears: item.students_id__history_of_arrears,
      Standing_arrears: item.students_id__standing_arrears,
      Gender: item.students_id__gender
    }));
  
    if (dataToExport.length === 0) {
      alert("No data available to export!");
      return;
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('TestCandidates');
  
    // Define worksheet columns from keys
    const columns = Object.keys(dataToExport[0]).map(key => ({
      header: key,
      key: key,
      width: 20
    }));
    worksheet.columns = columns;
  
    // Add data rows
    dataToExport.forEach(row => {
      worksheet.addRow(row);
    });
  
    // Optional: Style header row
    worksheet.getRow(1).font = { bold: true };
  
    // Generate Excel buffer and save
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `Eligible_Students_${company_name}_${round_of_interview}.xlsx`;
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  
    saveAs(blob, fileName);
  };
  

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = testCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(testCandidates.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Optionally fetch data for the new page here
    }
  };
const getPaginationItems = () => {
  const items = [];
  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }
  return items;
};


  return (
    <div>
      <div className="product-table-container-place-off">
        <div style={{ display: 'flex', marginBottom: '20px' }} className='report-place'>
          <Form.Control
            as="select"
            className="select-field"
            value={company_name}
            onChange={(e) => setcompany_name(e.target.value)}
            style={{ marginRight: '10px', width: '200px' }}
          >
            <option value="">Select Company</option>
            {companyList.map((company, index) => (
              <option key={index} value={company.company_name}>
                {company.company_name}
              </option>
            ))}
          </Form.Control>

          <Form.Control
            as="select"
            className="select-field"
            value={round_of_interview}
            onChange={(e) => setround_of_interview(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Select Round of Interview</option>
            {interviewRounds.length > 0 ? (
              interviewRounds.map((round, index) => (
                <option key={index} value={round.round || round}>
                  {round.round || round}
                </option>
              ))
            ) : (
              <option value="" disabled>No interview rounds available</option>
            )}
          </Form.Control>

          <button
           className='button-ques-save'
            onClick={exportToExcel}
            disabled={testCandidates.length === 0}
            style={{ marginLeft: '10px' }}
          >
            Export 
          </button>
        </div>
<div className='table-responsive-table'>
        <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th style={{ textAlign: "center" }}>Name</th>
              <th style={{ textAlign: "center" }}>Department</th>
              <th style={{ textAlign: "center" }}>Email ID</th>
              <th style={{ textAlign: "center" }}>Mobile No</th>
              <th style={{ textAlign: "center" }}>CGPA</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {testCandidates.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No data available</td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={index} className="table-row">
                  <td style={{ textAlign: "center" }}>{item.students_id__students_name}</td>
                  <td style={{ textAlign: "center" }}>{item.students_id__department_id__department}</td>
                  <td style={{ textAlign: "center" }}>{item.students_id__email_id}</td>
                  <td style={{ textAlign: "center" }}>{item.students_id__mobile_number}</td>
                  <td style={{ textAlign: "center" }}>{item.students_id__cgpa}</td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>

        <div className="dis-page">
          <Form>
            <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
              <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
              <Form.Control
                as="select"
                value={itemsPerPage}
                className='label-dis'
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                style={{ width: '50px', boxShadow: 'none', outline: 'none', height: '50px' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </Form.Control>
            </Form.Group>
          </Form>
 {/* Table rendering here */}
<Pagination className="pagination-custom" style={{ justifyContent: 'center', marginTop: '20px' }}>
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
      </div>
    </div>
  );
};

export default PlacementReport;
