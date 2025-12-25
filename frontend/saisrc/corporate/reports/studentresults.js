
import React, { useState, useEffect, useContext } from 'react';
import {
 
  get_CC_Test_Reports_Stu_API_COR,
  get_Candidate_Detail_Report_API,
  get_Skill_Type_API,
  get_Test_Details_Report_API,
  get_Test_Question_Detail_API,
  get_Test_Result_Score_API,
  Get_Screenshots_API
} from '../../api/endpoints';
import ExcelJS from 'exceljs';

import '../../styles/trainingadmin.css';
import { Table, Form, Pagination } from 'react-bootstrap';
import Download from '../../assets/images/download.png'
import { SearchContext } from '../../allsearch/searchcontext';
import { useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';

import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import archery from '../../assets/images/archery.png';  // score out of 
import passFail from '../../assets/images/pass-fail.png';  // Failed in the assessment 
import tableProblems from '../../assets/images/tables-prblms.png'; // problems attempted
import clock from '../../assets/images/clock.png';  // time taken 
import inviteTime from '../../assets/images/invite-time.png'; // invite time 
import startCalendar from '../../assets/images/start-calendar.png';  // test start time 
import endCalendar from '../../assets/images/end-calendar.png';  // test end time


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

  const [studentDetail, setStudentDetail] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [solutions, setSolutions] = useState(null);
  const [detailedReport, setDetailedReport] = useState(null);
  const [techno, setTechno] = useState(null);
  const [screenshots, setScreenshots] = useState(null);

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
    get_CC_Test_Reports_Stu_API_COR(filtersParams)
      .then(data => {
        setTestCandidates(data);
        //  console.log("filter", data)
      })
      .catch(error => console.error('Error fetching test candidates:', error));
  };


  const getStudentTestDetails = (test_name, student_id, question_paper_id, test_id) => {
    Promise.all([
      get_Candidate_Detail_Report_API(student_id),
      get_Test_Details_Report_API(test_name, student_id),
      get_Test_Result_Score_API(test_name, student_id),
      get_Test_Question_Detail_API(test_name, student_id, question_paper_id),
      get_Skill_Type_API(test_name, student_id),
      Get_Screenshots_API(test_id),
    ])
      .then(([studentDetail, testDetail, solutions, detailedReport, techno, screenshots]) => {
        setStudentDetail(studentDetail);
        setTestDetail(testDetail);
        setSolutions(solutions.results);
        setDetailedReport(detailedReport.results);
        setTechno(techno);
        setScreenshots(screenshots)

        console.log("Student Details:", studentDetail);
        console.log("Test Details:", testDetail);
        console.log("Solutions:", solutions);
        console.log("Detailed Report:", detailedReport);
        console.log("Techno:", techno);
        console.log("screenshots:", screenshots);

        generatePDF(techno, studentDetail, testDetail, solutions.results, detailedReport.results, screenshots);
      })
      .catch(error => console.error("Error fetching test details:", error));
  };



  const PAGE_HEIGHT = 260; // Safe Y-coordinate limit
  const LINE_HEIGHT = 10;  // Standard line height

  // Helper to check for page overflow and reset Y position
  const checkPageOverflow = (currentY, heightToAdd, doc) => {
    if (currentY + heightToAdd > PAGE_HEIGHT) {
      doc.addPage();
      return 20; // Reset Y-coordinate for new page
    }
    return currentY;
  };

  // Helper to render multi-line text with overflow handling
  const renderMultiLineText = (text, y, doc) => {
    const lines = doc.splitTextToSize(text, 160); // Wrap text to 160 width
    lines.forEach((line) => {
      y = checkPageOverflow(y, LINE_HEIGHT, doc);
      doc.text(line, 20, y);
      y += LINE_HEIGHT;
    });
    return y;
  };

  // Helper to render code blocks with pagination
  const renderPaginatedCode = (code, y, doc) => {
    const lines = doc.splitTextToSize(code, 160); // Wrap text to 160 width
    lines.forEach((line) => {
      y = checkPageOverflow(y, LINE_HEIGHT, doc);
      doc.text(line, 20, y);
      y += LINE_HEIGHT;
    });
    return y;
  };
  const generatePDF = (techno, studentDetail, testDetail, solutions, detailedReport, screenshots) => {
    const doc = new jsPDF();

    // Title Page
    doc.setFontSize(30);
    doc.text(`${studentDetail.students_name}`, 20, 30);
    doc.setFontSize(16);
    const collegeGroupText = studentDetail.college_group ? ` - ${studentDetail.college_group}` : '';
    doc.text(`${studentDetail.college_name}${collegeGroupText}`, 20, 50);
    doc.setFontSize(12);
    doc.text(`Submitted on ${new Date().toLocaleString()}`, 20, 70);
    doc.setFontSize(8);
    doc.text("Powered by DoSelect", 20, 280);

    // Test Result Section
    doc.addPage();
    doc.setFontSize(12); // Reduced font size for normal text

    // 1st Row - 1st Column
    doc.addImage(archery, 'PNG', 20, 30, 15, 15); // Smaller image size

    // Bold text for dynamic values
    doc.setFont('helvetica', 'bold');
    doc.text(`${testDetail.your_score}`, 40, 40); // Bold score

    // Normal text for static part
    const scoreTextWidth = doc.getTextWidth(`${testDetail.your_score}`); // Get width of the bold text
    doc.setFont('helvetica', 'normal');
    doc.text(` scored out of `, 40 + scoreTextWidth, 40); // Adjust position for non-bold text

    // Bold text for total score
    const staticTextWidth1 = doc.getTextWidth(` scored out of `); // Get width of the static text
    doc.setFont('helvetica', 'bold');
    doc.text(`${testDetail.total_score}`, 40 + scoreTextWidth + staticTextWidth1, 40); // Bold total score


    // 1st Row - 2nd Column
    doc.addImage(passFail, 'PNG', 120, 30, 15, 15); // Smaller image size
    doc.setFont('helvetica', 'bold'); // Bold text
    doc.text(`Failed in the assessment`, 140, 35); // Adjusted position
    doc.setFont('helvetica', 'normal'); // Normal text
    doc.text(`(Cut-off score >= 50%)`, 140, 45); // Adjusted position

    // 2nd Row - 1st Column
    doc.addImage(tableProblems, 'PNG', 20, 60, 13, 13); // Smaller image size

    // Bold text for attended questions
    doc.setFont('helvetica', 'bold');
    doc.text(`${testDetail.attended_questions}`, 40, 70); // Bold attended questions

    // Normal text for static part
    const attendedQuestionsWidth = doc.getTextWidth(`${testDetail.attended_questions}`); // Get width of the bold text
    doc.setFont('helvetica', 'normal');
    doc.text(` problems attempted out of `, 40 + attendedQuestionsWidth, 70); // Adjust position for non-bold text

    // Bold text for total questions
    const staticTextWidth2 = doc.getTextWidth(` problems attempted out of `); // Get width of the static text
    doc.setFont('helvetica', 'bold');
    doc.text(`${testDetail.total_questions}`, 40 + attendedQuestionsWidth + staticTextWidth2, 70); // Bold total questions

    //-----------------------------------------------------------------------------------------//


    // Test Time Analysis
    let y = 100;
    doc.setFontSize(20);
    doc.text('Test Time Analysis', 20, y);
    y += 15;

    // Set for columns: First column starts at x = 20, second column starts at x = 120
    let column1X = 20;
    let column2X = 120;

    doc.setFontSize(12);

    // Column 1 - First row (Time Taken)
    y = checkPageOverflow(y, 25, doc); // Check for page overflow before adding content
    doc.addImage(clock, 'PNG', column1X, y, 15, 15); // Image
    doc.setFont('helvetica', 'bold'); // Bold style for time
    doc.text(`${testDetail.time_taken}`, column1X + 20, y + 5); // Time in bold
    doc.setFont('helvetica', 'normal'); // Normal style for description
    doc.text(`time taken for completion`, column1X + 20, y + 15); // Description in normal font

    // Column 2 - First row (Invite Time)
    doc.addImage(inviteTime, 'PNG', column2X, y - 3, 22, 22); // Image (y remains the same as first column)
    doc.setFont('helvetica', 'bold'); // Bold style for date
    doc.text(`${formatDate1(testDetail.test_invite_time)}`, column2X + 20, y + 5); // Date in bold
    doc.setFont('helvetica', 'normal'); // Normal style for description
    doc.text(`test invite time`, column2X + 22, y + 15); // Description (second line)
    y += 30; // Adjust spacing for the next row

    // Column 1 - Second row (Start Time)
    y = checkPageOverflow(y, 30, doc); // Ensure no overflow
    doc.addImage(startCalendar, 'PNG', column1X, y - 3, 25, 25); // Image
    doc.setFont('helvetica', 'bold'); // Bold style for date
    doc.text(`${formatDate1(testDetail.test_start_time)}`, column1X + 20, y + 5); // Date in bold
    doc.setFont('helvetica', 'normal'); // Normal style for description
    doc.text(`test start time`, column1X + 22, y + 15); // Description in normal font

    // Column 2 - Second row (End Time)
    doc.addImage(endCalendar, 'PNG', column2X, y - 3, 25, 25); // Image (y remains the same as first column)
    doc.setFont('helvetica', 'bold'); // Bold style for date
    doc.text(`${formatDate1(testDetail.test_end_time)}`, column2X + 20, y + 5); // Date in bold
    doc.setFont('helvetica', 'normal'); // Normal style for description
    doc.text(`test end time`, column2X + 22, y + 15); // Description (second line)
    y += 25; // Adjust spacing for the next section



    //----------------------------------------------------------------------------------//

    // Solutions Section
    // doc.addPage();
    y += 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold'); // Set font to bold
    doc.text('Solutions', 20, y);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    y += 10;

    // Table setup
    const startX = 20;
    const tableWidth = 175; // Adjust to fit all columns
    const colWidths = [70, 50, 38, 30]; // Column widths for Problem Name, Problem Type, Status, Score
    const headerHeight = 10;
    const rowHeight = 15;

    // Draw table headers
    doc.rect(startX, y, tableWidth, headerHeight); // Header rectangle
    doc.text('Problem Name', startX + 5, y + 7); // Header text
    doc.text('Problem Type', startX + colWidths[0] + 5, y + 7);
    doc.text('Status', startX + colWidths[0] + colWidths[1] + 5, y + 7);
    doc.text('Score', startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, y + 7);

    y += headerHeight;

    // Draw rows for solutions
    solutions.forEach((solution) => {
      doc.rect(startX, y, tableWidth, rowHeight); // Draw rectangle for the row
      doc.text(solution.annotated_question_text.substring(0, 25), startX + 5, y + 10); // Problem Name
      doc.text(solution.test_type, startX + colWidths[0] + 5, y + 10); // Problem Type
      doc.setTextColor(solution.status === 'Accepted' ? 'green' : 'red');
      doc.text(solution.status, startX + colWidths[0] + colWidths[1] + 5, y + 10); // Status
      doc.setTextColor('black');
      doc.text(`${solution.your_score}/${solution.question_mark}`, startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, y + 10); // Score

      y += rowHeight; // Move to the next row
    });

    // Draw vertical grid lines for the table
    let x = startX;
    colWidths.forEach((colWidth) => {
      doc.line(x, y - solutions.length * rowHeight - headerHeight, x, y); // Draw vertical line
      x += colWidth;
    });

    // Ensure the last vertical line is drawn for the Score column
    doc.line(startX + tableWidth, y - solutions.length * rowHeight - headerHeight, startX + tableWidth, y);


    // Screenshots

    if (screenshots.length > 0) {
      y += 20; // Initialize y-coordinate
      doc.setFontSize(16);
      doc.text("Screenshots", 20, y);
      y += 10; // Increase spacing after title
    
      const imageWidth = 50; // Width of each image
      const imageHeight = 50; // Height of each image
      const margin = 10; // Space between images
      let x = 20; // Initial x-coordinate for the first image
    
      screenshots.forEach((screenshot, index) => {
        // Ensure there's space for the image
        y = checkPageOverflow(y, imageHeight + margin, doc); // Check if we have space for the current image
    
        if (typeof screenshot === "string") {
          // Add image at the current x, y position with reduced size
          doc.addImage(screenshot, "JPEG", x, y, imageWidth, imageHeight); 
    
          // Update x position for next image
          x += imageWidth + margin;
    
          // If 3 images are in one row, move to the next row
          if ((index + 1) % 3 === 0) {
            x = 20; // Reset x to start a new row
            y += imageHeight + margin; // Move down for the next row of images
          }
        } else {
          console.error(`Screenshot ${index} is not a valid Base64 string.`);
        }
      });
    }
    
    



    // Technology Section
    // doc.addPage();
    y += 30; // Add some spacing after the solutions table
    doc.setFontSize(16);
    doc.text('Technology Used', 20, y);
    doc.setFontSize(12);
    y += 10;
    y = renderMultiLineText(techno.skill_type, y, doc);


    // Detailed Report Section
    detailedReport.forEach((report, index) => {
      // doc.addPage();
      y += 20;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold'); // Set font to bold
      doc.text(`Problem ${index + 1}: ${report.question_text}`, 20, y);
      y += 20;

      // Input Format
      doc.setFont('helvetica', 'bold'); // Set font to bold
      doc.text('Input Format:', 20, y);
      doc.setFontSize(10); // Reduced font size for normal text
      doc.setFont('helvetica', 'normal'); // Reset font to normal
      y += 10;
      y = renderMultiLineText(report.input_format, y, doc);

      // Output Format
      doc.setFont('helvetica', 'bold'); // Set font to bold
      doc.setFontSize(12); // Headings font size
      doc.text('Output Format:', 20, y);
      doc.setFontSize(10); // Reduced font size for normal text
      doc.setFont('helvetica', 'normal'); // Reset font to normal
      y += 10;
      y = renderMultiLineText(report.correct_answer, y, doc);

      // Sample Code
      doc.setFont('helvetica', 'bold'); // Set font to bold
      doc.setFontSize(12); // Headings font size
      doc.text('Sample Code:', 20, y);
      doc.setFontSize(10); // Reduced font size for normal text
      doc.setFont('helvetica', 'normal'); // Reset font to normal
      y += 10;
      y = renderPaginatedCode(report.sample_code, y, doc);

      // Solution
      doc.setFont('helvetica', 'bold'); // Set font to bold
      doc.setFontSize(12); // Headings font size
      doc.text('Solution:', 20, y);
      doc.setFontSize(10); // Reduced font size for normal text
      doc.setFont('helvetica', 'normal'); // Reset font to normal
      y += 10;

      // Score
      doc.text(`Score: ${report.your_score}/${report.question_mark}`, 20, y);
      y += 10;

      // Submitted Code
      doc.setFont('helvetica', 'bold'); // Set font to bold
      doc.setFontSize(12); // Headings font size
      doc.text('Submitted Code:', 20, y);
      doc.setFontSize(10); // Reduced font size for normal text
      doc.setFont('helvetica', 'normal'); // Reset font to normal
      y += 10;
      y = renderPaginatedCode(report.submitted_code, y, doc);
    });



    // Final Footer
    doc.setFontSize(8);
    doc.text("Powered by DoSelect", 20, 280);

    doc.save(`${studentDetail.students_name}_Report.pdf`);
  };


  const formatDate1 = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = hours.toString().padStart(2, "0");
    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
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
    const ranges = ['0-10', '10-20', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100', '0-50', '0-60', '0-70', '0-80', '0-90', '0-100'];
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

  const exportToExcel = () => {
    const filteredData = filterCandidates().map(({ id, test_id, test_type, skill_type_id, student_id, question_id, question_name, is_actual_test, is_active, need_candidate_info, instruction, attempt_count, rules, topic, duration, ...rest }) => rest); // Exclude id field
  
    const headerMap = {
      user_name: 'Login ID',
      registration_number: 'Reg_No',
      student_name: 'Candidate',
      email_id: 'Email',
      mobile_number: 'Contact No',
      gender: 'Gender',
      year: 'Year',
      department: 'Department',
      college: 'College',
      dtm_start: 'Start Date',
      dtm_end: 'End Date',
      total_score: 'Total Score',
      avg_mark: 'Avg Mark'
    };
  
    const wsData = filteredData.map(candidate => {
      const modifiedCandidate = {};
      for (let key in candidate) {
        if (headerMap[key]) {
          modifiedCandidate[headerMap[key]] = candidate[key];
        } else {
          modifiedCandidate[key] = candidate[key];
        }
      }
      return modifiedCandidate;
    });
  
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Report');
  
    // Set the header row
    const header = Object.values(headerMap);
    worksheet.addRow(header);
  
    // Add the data rows
    wsData.forEach(candidate => {
      const row = Object.values(candidate);
      worksheet.addRow(row);
    });
  
    // Write the Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = 'test_report.xlsx';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }).catch(error => {
      console.error('Error exporting to Excel:', error);
    });
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

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filterCandidates().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filterCandidates().length / itemsPerPage);
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
        <h4>Test Result</h4>
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
        <div className='table-responsive'>
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
                .filter(item =>
                  !searchQuery ||
                  (item.user_name && item.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.gender && typeof item.gender === 'string' && item.gender.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.total_score && typeof item.total_score === 'string' && item.total_score.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.dtm_start && typeof item.dtm_start === 'string' && item.dtm_start.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .filter(item =>
                  !searches ||
                  (item.user_name && item.user_name.toLowerCase().includes(search.toLowerCase())) ||
                  (item.student_name && typeof item.student_name === 'string' && item.student_name.toLowerCase().includes(search.toLowerCase())) ||
                  (item.gender && typeof item.gender === 'string' && item.gender.toLowerCase().includes(search.toLowerCase())) ||
                  (item.department_id && typeof item.department_id === 'string' && item.department_id.toLowerCase().includes(search.toLowerCase())) ||
                  (item.total_score && typeof item.total_score === 'string' && item.total_score.toLowerCase().includes(search.toLowerCase())) ||
                  (item.dtm_start && typeof item.dtm_start === 'string' && item.dtm_start.toLowerCase().includes(search.toLowerCase())) ||
                  (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(search.toLowerCase()))
                )
                .map(candidate => (
                  <tr key={candidate.id} className={candidate.is_active ? 'active-row' : ''}>
                    <td style={{ textAlign: "center" }}>{candidate.user_name}</td>
                    <td style={{ textAlign: "center" }}>
                      {/* Add onClick here only for the student name column */}
                      <span
                        style={{ cursor: 'pointer', color: 'white', textDecoration: 'underline' }}
                        onClick={() => getStudentTestDetails(candidate.test_name, candidate.student_id, candidate.question_id_id, candidate.id)}
                      >
                        {candidate.student_name}
                      </span>

                    </td>
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
