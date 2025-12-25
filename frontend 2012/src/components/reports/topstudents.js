import React, { useState, useEffect, useContext } from 'react';
import {

  updatecompanyemailApi,
  updateTestRoundApi,
  getCompanyEmailApi,
  get_CC_Test_Reports_Stu_API,
  get_Candidate_Detail_Report_API,
  get_Test_Details_Report_API,
  get_Test_Result_Score_API,
  get_Test_Question_Detail_API,
  get_Skill_Type_API,
  Get_Screenshots_API, updateMultipleTestCandidatesStatus
} from '../../api/endpoints';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // Needed to trigger download in browser

import { useParams, Link } from 'react-router-dom';
import '../../styles/trainingadmin.css';
import { Table, Form, Pagination } from 'react-bootstrap';
import Download from '../../assets/images/download.png';
import Footer from '../../footer/footer';
import { SearchContext } from '../../allsearch/searchcontext';
import { useLocation } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import ErrorModal from '../auth/errormodal'
import back from "../../assets/images/backarrow.png";
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import archery from '../../assets/images/archery.png';  // score out of 
import passFail from '../../assets/images/pass-fail.png';  // Failed in the assessment 
import tableProblems from '../../assets/images/tables-prblms.png'; // problems attempted
import clock from '../../assets/images/clock.png';  // time taken 
import inviteTime from '../../assets/images/invite-time.png'; // invite time 
import startCalendar from '../../assets/images/start-calendar.png';  // test start time 
import endCalendar from '../../assets/images/end-calendar.png';  // test end time

const TopStudents = () => {
  const [testName, setTestName] = useState(''); // Store test name for modal update

  const [testCandidates, setTestCandidates] = useState([]);
  const [searches, setSearches] = useState('');
  const [topN, setTopN] = useState(''); // State for Top N input
  const [showModal, setShowModal] = useState(false); // Modal state
  const [companyEmail, setCompanyEmail] = useState(''); // State for company email
  const [companyName, setCompanyName] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [Round, setRound] = useState(''); // State for company email
  const [modalPurpose, setModalPurpose] = useState(''); // 'sendMail' or 'sendReport'
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  const [filteredCount, setFilteredCount] = useState(0);

  const [triggerFetch, setTriggerFetch] = useState(true);

  const roundOptions = [
    'select', 'Preplacement Talk',
    'Round1', 'Round2', 'Round3', 'Round4', 'Round5', 'Offer'
  ];
  const [showReportModal, setShowReportModal] = useState(false); // Modal state for report

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
    dtm_start: '',
    dtm_end: '',
    is_active: true,
    avg_mark: '',
  });

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const filtersParams = {
    test_name: queryParams.get('test_name'),
    college_id: queryParams.get('college_id'),
    department_id: queryParams.get('department_id'),
    year: queryParams.get('year'),
  };

  console.log('filtersParams: :', filtersParams)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });


  const [studentIds, setStudentIds] = useState([]);


  const [studentDetail, setStudentDetail] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [solutions, setSolutions] = useState(null);
  const [detailedReport, setDetailedReport] = useState(null);
  const [techno, setTechno] = useState(null);
  const [screenshots, setScreenshots] = useState(null);



  const getStudentTestDetails = (test_name, student_id, question_paper_id, test_id) => {

    console.log('Test_name: ', test_name);
    console.log('student_id: ', student_id);
    console.log('question_paper_id: ', question_paper_id);
    console.log('test_id: ', test_id);


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

  /* const handleSendReport = () => {
     const capturedStudentIds = filteredData.map(candidate => candidate.student_id);
     setStudentIds(capturedStudentIds); // Update state with captured student IDs
     console.log("Captured Student IDs:", capturedStudentIds); // Log captured student IDs
   
     // Call the function to send the report immediately after capturing IDs
     handleUpdateplacementReport(capturedStudentIds); // Pass the captured IDs to handleUpdateplacementReport
   
     setShowReportModal(true); // Show the modal after capturing student IDs
   };
   
   const handleUpdateplacementReport = async () => {
     const testName = filtersParams.test_name;
     console.log("Test Name:", testName);
     console.log("Student IDs for report:", studentIds);
   
     try {
       const formData = new FormData();
       formData.append("student_ids", JSON.stringify(studentIds));
       formData.append("company_name", companyName);
       formData.append("round_of_interview", Round);
   
       // Call the API and get the response
       const response = await updateTestRoundApi(testName, formData);
   
       // Log the response to check its structure
       console.log("API Response:", response);
   
       // Check the response data for success message
       if (response && response.success) {
         setShowReportModal(false); // Close modal after successful update
         alert("Report sent successfully to Placement Officer");
       } else {
         console.error("Failed to update filtered student ids round:", response);
       }
     } catch (error) {
       console.error("Error updating test round:", error);
     }
   };*/

  // Handles the "Send Report" button click
  const handleSendReport = () => {
    const capturedStudentIds = filteredData.map((candidate) => candidate.student_id);
    setStudentIds(capturedStudentIds); // Update state with captured student IDs
    setShowReportModal(true); // Open the modal
  };

  // Handles the "Send Report" button in the modal
  const handleUpdateplacementReport = async () => {
    const testName = filtersParams.test_name; // Retrieve the test name from filters
    console.log("Test Name:", testName);
    console.log("Student IDs for report:", studentIds);

    try {
      const formData = new FormData();
      formData.append("student_ids", JSON.stringify(studentIds));
      formData.append("company_name", companyName);
      formData.append("round_of_interview", Round);

      // Call the API
      const response = await updateTestRoundApi(testName, formData);

      if (response && response.success) {
        setShowReportModal(false); // Close the modal after success
        //  alert("Report sent successfully to Placement Officer");
        setErrorMessage("Report sent successfully to Placement Officer");
      } else {
        console.error("Failed to update:", response);
      }
    } catch (error) {
      console.error("Error updating test round:", error);
    }
  };

  // useEffect(() => {
  // if (studentIds.length > 0 && !showReportModal) {
  // handleUpdateplacementReport();
  // }
  //  }, [showReportModal]); // Remove dependency on studentIds


  const handleCloseError = () => {
    setShowError(false);
  };
  useEffect(() => {
    getTestCandidates();
  }, [filtersParams]);

  useEffect(() => {
    const fetchData = async () => {
      const testName = filtersParams.test_name;
      if (testName) {
        try {
          const response = await getCompanyEmailApi(testName);
          if (response && response.company_email && response.round_of_interview) {
            setCompanyEmail(response.company_email);
            setCompanyName(response.company_name);
            setRound(response.round_of_interview);
            setStudentIds(response.student_ids || []);
            // setTestName(testName);  // Set testName if necessary
          } else {
            console.error("API response is missing required fields.");
          }
        } catch (error) {
          console.error("Error fetching company email:", error);
        }
      }
    };
    fetchData();
  }, [filtersParams.test_name]);  // Fetch data when test_name changes


  const handleSendMail = async () => {
    const testName = filtersParams.test_name;
    setShowModal(true); // Opens the modal

    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("TestResults");

      // Add headers dynamically from filteredData keys
      if (filteredData.length === 0) {
        console.error("No data available for export");
        return;
      }

      const headers = Object.keys(filteredData[0]);
      worksheet.addRow(headers);

      // Add row data
      filteredData.forEach(row => {
        worksheet.addRow(headers.map(key => row[key]));
      });

      // Auto width for each column
      worksheet.columns.forEach(column => {
        let maxLength = 12;
        column.eachCell({ includeEmpty: true }, cell => {
          const valLength = (cell.value || "").toString().length;
          if (valLength > maxLength) maxLength = valLength;
        });
        column.width = maxLength + 2;
      });

      // Convert workbook to binary buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const excelFile = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Prepare FormData
      const formData = new FormData();
      formData.append("excel_file", excelFile, "TestResults.xlsx");
      formData.append("company_email", companyEmail);
      formData.append("company_name", companyName);
      formData.append("round_of_interview", Round);

      // Send API request
      await updatecompanyemailApi(testName, formData);
      setErrorMessage("Email sent successfully");
      setShowError(true);
    } catch (error) {
      console.error("Error sending mail:", error);
      setErrorMessage("Failed to send email.");
      setShowError(true);
    }
  };


  // Open the modal explicitly when updating company email
  const handleUpdateEmail = () => {
    if (companyEmail) {
      setShowModal(false); // Close modal when email is updated
      handleSendMail(); // Attempt to send mail with updated email
    } else {
      // alert("Please enter a valid company email.");
      setErrorMessage("Please enter a valid company email.");
    }
  };

  const getTestCandidates = () => {
    if (triggerFetch) {
      get_CC_Test_Reports_Stu_API(filtersParams)
        .then(data => {
          setTestCandidates(data);
          console.log("filter", data);
          // ✅ Only reset trigger after successful data fetch
          setTriggerFetch(false);
        })
        .catch(error => console.error('Error fetching test candidates:', error));

    }
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

 const exportToExcel = async () => {
  // ✅ If no students are selected
  if (selectedStudents.size === 0) {
    alert("Please select at least one row to export!");
    return;
  }

  // ✅ Get only selected data
  const selectedData = filteredData.filter(candidate =>
    selectedStudents.has(candidate.student_id)
  );

  if (selectedData.length === 0) {
    alert("No valid selected data to export!");
    return;
  }

  const headerMap = {
    test_name: 'Test Name',
    student_name: 'Candidate',
    registration_number: 'Reg_No',
    email_id: 'Email',
    mobile_number: 'Contact No',
    department_id: 'Department',
    year: 'Year',
    user_name: 'Login ID',
    avg_mark: 'Avg Mark',
    capture_duration: 'Capture Duration',
    dtm_start_test: 'Student_Start_Date',
    dtm_start: 'Test Start Date',
    dtm_end: 'Test End Date',
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

  const wsData = selectedData.map(data => {
    let modifiedCandidate = {};
    for (let key in headerMap) {
      if (key === 'year') {
        modifiedCandidate[headerMap[key]] = getYearString(data[key]);
      } else {
        modifiedCandidate[headerMap[key]] = data[key] || '';
      }
    }
    return modifiedCandidate;
  });

  const testName = wsData[0]['Test Name']?.replace(/\s+/g, '') || "Test";
  const year = wsData[0]['Year']?.replace(/\s+/g, '') || "Year";

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return "01_01_2025";
    const parsedDate = new Date(dateStr.replace(/-/g, "/"));
    return isNaN(parsedDate)
      ? "01_01_2025"
      : `${String(parsedDate.getDate()).padStart(2, '0')}_${String(parsedDate.getMonth() + 1).padStart(2, '0')}_${parsedDate.getFullYear()}`;
  };

  const startDate = formatDate(wsData[0]['Test Start Date']);
  const fileName = `${testName}_${year}_${startDate}.xlsx`;
  const sheetName = `${year} Report`;

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add headers
    const headers = Object.values(headerMap);
    worksheet.addRow(headers);

    // Add selected rows
    wsData.forEach(item => {
      const row = headers.map(header => item[header]);
      worksheet.addRow(row);
    });

    // Auto column width
    worksheet.columns.forEach(col => {
      let maxLength = 12;
      col.eachCell({ includeEmpty: true }, cell => {
        const val = cell.value || '';
        const length = val.toString().length;
        if (length > maxLength) maxLength = length;
      });
      col.width = maxLength + 2;
    });

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



const filteredData = filterCandidates()
  .sort((a, b) => (Number(b.avg_mark) || 0) - (Number(a.avg_mark) || 0))
  .filter((item) => {
    const userName = item.user_name?.toLowerCase() || '';
    const StuName = item.student_name?.toLowerCase() || '';
    const gen = item.gender?.toLowerCase() || '';
    const deptId = item.department_id?.toLowerCase() || '';
    const totScore = item.avg_mark?.toString() || '';
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
  })
  // 🔹 Finally, limit to Top N (if entered)
  .slice(0, topN && Number(topN) > 0 ? Number(topN) : testCandidates.length);



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
    if (!filtersParams.test_name) {
      alert("Test Name is required!");
      return;
    }

    if (selectedStudents.size === 0) {
      alert("No students selected for reassignment!");
      return;
    }

    try {
      await updateMultipleTestCandidatesStatus(filtersParams.test_name, Array.from(selectedStudents)); // Convert Set to array
      getTestCandidates();  // Refresh the list
      alert("Selected students reassigned successfully!");
      setSelectedStudents(new Set());  // Clear selections
    } catch (error) {
      console.error("Error updating students:", error);
      alert("Failed to reassign students.");
    }
  };



  const uniqueCandidates = [...new Set(testCandidates.map(c => c.student_name))];
  const uniqueRegistrationNos = [...new Set(testCandidates.map(c => c.registration_number))];
  const uniqueDepartments = [...new Set(testCandidates.map(c => c.department_id))];
  const uniqueYears = [...new Set(testCandidates.map(c => c.year))];

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  console.log('Filtered data: ', filteredData);
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
        <h6 >Test Report</h6>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/reports" style={{ color: "black", textDecoration: "none" }}>
            <button
              className="button-ques-save"
              style={{ width: "120px", padding: "10px", textAlign: "center" }}
            >
              <img src={back} className="nextarrow" alt="Back" /> Back
            </button>
          </Link>

          <input
            className="search-box1"
            type="text"
            placeholder="Search..."
            value={searches}
            onChange={(e) => setSearches(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <span>Top Students:</span>
         <input
  className="search-box1"
  type="number"
  placeholder="Top N Students"
  value={topN}
  onChange={(e) => setTopN(e.target.value)}
  style={{ width: '70px', marginRight: "10px" }}
/>

          <button className="button-ques-save-topscore" onClick={exportToExcel} style={{ width: "105px" }}>
            <img src={Download} className='nextarrow' alt="Download Icon" />
            <span>Export</span>
          </button>
          <button className="button-ques-save-topscore" onClick={handleSendMail} style={{ width: "105px" }}>
            <span>SendMail</span>
          </button>
          <button className="button-ques-save-topscore" onClick={handleSendReport} style={{ width: "120px" }}>
            <span>SendReport</span>
          </button>
          <button
            onClick={handleReassign}
            className="reassign-btn"
          >
            Reassign
          </button>

        </div>
        <div className="po-table-responsive-t">
          <table className="placement-table-t">


            <thead >
              <tr>
                <th style={{ textAlign: "left" }}>
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

                <th style={{ textAlign: "center", cursor: 'pointer' }} onClick={() => handleSort('registration_number')}><select value={filters.registration_number || ''} onChange={(e) => handleFiltersChange(e, "registration_number")}
                  className="dropdown-custom" >
                  <option value="" >Reg No {sortConfig.key === 'registration_number' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</option>
                  {uniqueRegistrationNos.map(reg => <option key={reg} value={reg} >{reg}</option>)}
                </select></th>

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
            <tbody >
              {currentData.map(candidate => (
                <tr key={candidate.id} className={candidate.is_active ? 'active-row' : ''}>
                  <td style={{ textAlign: "left" }}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(candidate.student_id)}
                      onChange={() => handleCheckboxChange(candidate.student_id)}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {/* Add onClick here only for the student name column */}
                    <span
                      style={{ cursor: 'pointer', color: 'white', textDecoration: 'underline' }}
                      onClick={() => getStudentTestDetails(candidate.test_name, candidate.student_id, candidate.question_id_id, candidate.id)}
                    >
                      {candidate.student_name}
                    </span>

                  </td>
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

      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton style={{ borderTop: "none", borderBottom: "none" }}>
          <Modal.Title>Update Company Email</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ borderTop: "none", borderBottom: "none" }}>
          <Form style={{ borderTop: "none", borderBottom: "none" }}>
            <div controlId="companyName">
              <label className="lable5-ques">Company Name</label><p></p>
              <input
                type="text"
                value={companyName} // This will show the fetched company email
                className="input-ques-email"
                onChange={(e) => setCompanyName(e.target.value)} // Updates state on change
                placeholder=""
              />
            </div>
            <div controlId="companyEmail">
              <label className="lable5-ques">Company Email</label><p></p>
              <input
                type="email"
                value={companyEmail} // This will show the fetched company email
                className="input-ques-email"
                onChange={(e) => setCompanyEmail(e.target.value)} // Updates state on change
                placeholder=""
              />
            </div>
            <p></p>
            <div controlId="Round">
              <label className="lable5-ques">Round Selected</label>
              <p></p>
              <select
                value={Round} // This will show the fetched round value
                className="input-ques-email"
                onChange={(e) => setRound(e.target.value)} // Updates state on change
              >
                {roundOptions.map((round, index) => (
                  <option key={index} value={round}>
                    {round}
                  </option>
                ))}
              </select>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", borderBottom: "none" }}>
          {/*} <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>*/}
          <button className="button-ques-save-topscore" style={{ border: "none" }} onClick={handleUpdateEmail}>
            sendmail
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton style={{ borderTop: "none", borderBottom: "none" }}>
          <Modal.Title>Send Report to Placement Officer</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ borderTop: "none", borderBottom: "none" }}>

          <div controlId="companyName">
            <label className="lable5-ques">Company Name</label><p></p>
            <input
              type="text"
              value={companyName} // This will show the fetched company email
              className="input-ques-email"
              onChange={(e) => setCompanyName(e.target.value)} // Updates state on change
              placeholder=""
            />
          </div>
          <div controlId="Round">
            <label className="lable5-ques">Round Selected</label>
            <p></p>
            <select
              value={Round} // This will show the fetched round value
              className="input-ques-email"
              onChange={(e) => setRound(e.target.value)} // Updates state on change
            >
              {roundOptions.map((round, index) => (
                <option key={index} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Cancel
          </Button>

          <button className="button-ques-save-topscore" style={{ border: "none" }} onClick={handleUpdateplacementReport}>
            Send Report
          </button>
        </Modal.Footer>
      </Modal>
      {showError && (
        <div className="error-notification">
          <p>{errorMessage}</p>
          <button onClick={handleCloseError}>Close</button>
        </div>)}

      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default TopStudents;
