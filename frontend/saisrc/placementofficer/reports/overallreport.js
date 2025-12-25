import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Ensure you import this
import '../../styles/placement.css';
import { getAllstuReportsApi, getCandidatesOverallReportsApi, getAllstutestassignedcountApi, getuniquestudentApi, getcollegeApi, getCollege_logo_API, getStu_Details_Report_API, } from '../../api/endpoints';
// Import xlsx
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useState, useEffect } from 'react';
import logo from '../../assets/images/logo.jpg';
import Select from 'react-select';
import CustomOption from '../../components/test/customoption';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#39444e',
    color: '#fff', // Text color
    borderColor: state.isFocused ? '' : '#ffff', // Border color on focus
    boxShadow: 'none', // Remove box shadow
    '&:hover': {
      borderColor: state.isFocused ? '#ffff' : '#ffff' // Border color on hover
    },
    '&.css-1a1jibm-control': {
      // Additional styles for the specific class
    },
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px', // Smaller font size

      width: '150px'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#ffff', // Text color for selected value
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px' // Smaller font size
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
    color: '#ffff', // Text color
    '&:hover': {
      backgroundColor: '#39444e', // Background color on hover
      color: '#ffff' // Text color on hover
    },
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px',// Smaller font size
      width: '150px'
    }
  }),
  input: (provided) => ({
    ...provided,
    color: '#ffff' // Text color inside input when typing
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#39444e',
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px' // Smaller font size
    }
  })

};


const OverallReport = ({ collegeName, institute }) => {
  // ✅ State Variables
  const [filters, setFilters] = useState({
    student_name: '',
    from_date: null,
    to_date: null,
    college_name: collegeName || '',
  });
  const [students, setStudents] = useState([]);
  const [studentReport, setStudentReport] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [testData, setTestData] = useState([]);
  const [search, setSearch] = useState('');
  const [collegeId, setCollegeId] = useState(institute);
  const [collegeLogo, setCollegeLogo] = useState(null);
  const [studentAssignedReport, setStudentAssignedReport] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);


  useEffect(() => {
    fetchUniqueStudents();
  }, [collegeId]);

  // ✅ Fetch Unique Students
  const fetchUniqueStudents = async () => {
    try {
      if (!collegeId) return;
      const response = await getuniquestudentApi(institute);
      setStudents(response);
    } catch (error) {
      console.error("Error fetching unique students:", error);
    }
  };
  // ✅ Fetch Unique Students
  const fetchStudentDetails = async (stuID) => {
    try {
      if (!collegeId) return;
      const response = await getStu_Details_Report_API({ student_id: stuID });
      console.log("Student Details API Response:", response);
      setStudentDetails(response);
    } catch (error) {
      console.error("Error fetching unique students:", error);
    }
  };

const handleDateChange = (date, field) => {
  setFilters((prevFilters) => ({
    ...prevFilters,
    [field]: date,
  }));

  // Optionally trigger API fetch if student is already selected
  if (selectedStudentId) {
    fetchStudentReport(selectedStudentId, 
      field === "from_date" ? date : filters.from_date,
      field === "to_date" ? date : filters.to_date
    );
  }
};

  // ✅ Handle Date Change
/*  const handleDateChange = (date, field) => {
    if (field === "from_date") {
      setSelectedFromDate(date);
    } else if (field === "to_date") {
      setSelectedToDate(date);
    }

    fetchStudentReport(selectedStudentId, selectedFromDate, selectedToDate);
  };
*/

  const processTestData = (allStudentReports) => {
    const technicalSkills = ["Python", "C", "C++", "JAVA", "All Languages"];
    const aptitudeSkills = ["Quants", "Logical", "Verbal", "Aptitude"];

    return allStudentReports.map(test => {
      let Quants_score = test.skill_type === "Quants" ? test.avg_mark : "N/A";
      let logical_score = test.skill_type === "Logical" ? test.avg_mark : "N/A";
      let verbal_score = test.skill_type === "Verbal" ? test.avg_mark : "N/A";
      let Aptitude_score = aptitudeSkills.includes(test.skill_type) ? test.avg_mark : "N/A";
      let Technical_score = technicalSkills.includes(test.skill_type) ? test.avg_mark : "N/A";

      if (!aptitudeSkills.includes(test.skill_type) && !technicalSkills.includes(test.skill_type)) {
        if (test.question_type === "Technical") {
          Technical_score = test.avg_mark;
        } else if (test.question_type === "Aptitude") {
          Aptitude_score = test.avg_mark;
        }
      }

      return {
        dtm_end: test.dtm_end,
        feedback: test.feedback,
        test_name: test.test_name,
        Quants_score,
        logical_score,
        verbal_score,
        Aptitude_score,
        Technical_score,
      };
    });
  };


const fetchOverallReport = async (params) => {
  return await getCandidatesOverallReportsApi(params);
};

const fetchAllStudentReports = async (params) => {
  return await getAllstuReportsApi(params);
};

const fetchAssignedTestCount = async (params) => {
  return await getAllstutestassignedcountApi(params);
};

const fetchOverallData = async (params) => {
  try {
    const overallResponse = await fetchOverallReport(params);
    console.log("Overall Report API Response:", overallResponse);
    setStudentReport(overallResponse.length > 0 ? overallResponse[0] : null);
  } catch (error) {
    console.error("Error fetching overall report:", error);
    setStudentReport(null);
  }
};

const fetchAllStudentReportsData = async (params) => {
  try {
    const allStudentReportsResponse = await fetchAllStudentReports(params);
    console.log("All Student Reports API Response:", allStudentReportsResponse);
    if (allStudentReportsResponse && allStudentReportsResponse.length > 0) {
      const processedTestData = processTestData(allStudentReportsResponse);
      setTestData(processedTestData);
      console.log("Processed Test Data:", processedTestData);
    } else {
      console.warn("No test reports found for this student.");
      setTestData([]);
    }
  } catch (error) {
    console.error("Error fetching all student reports:", error);
    setTestData([]);
  }
};

const fetchAssignedTestData = async (params) => {
  try {
    const assignedResponse = await fetchAssignedTestCount(params);
    console.log("Assigned Test Count API Response:", assignedResponse);
    setStudentAssignedReport(assignedResponse.length > 0 ? assignedResponse[0] : null);
  } catch (error) {
    console.error("Error fetching assigned test count:", error);
    setStudentAssignedReport(null);
  }
};

const fetchStudentReport = async (studentId, fromDate, toDate) => {
  if (!collegeId || !studentId) {
    console.warn("Insufficient data to fetch reports");
    return;
  }

  const params = {
    student_id: studentId,
    from_date: fromDate ? fromDate.toISOString().split('T')[0] : null,
    to_date: toDate ? toDate.toISOString().split('T')[0] : null,
    college_id: collegeId,
  };

  // Trigger the separate data-fetching functions
  fetchOverallData(params);
  fetchAllStudentReportsData(params);
  fetchAssignedTestData(params);
};



  const exportCombinedDataAsPDF = () => {
    const doc = new jsPDF();

    const imgWidth = 40; // Logo width
    const imgHeight = 30; // Logo height
    const marginX = 10; // Left margin
    const marginY = 10; // Top margin
    const pageWidth = doc.internal.pageSize.width;

    // ✅ Convert college_logo to Base64 if needed
    let collegeLogoData = "";
    if (collegeLogo) {
      collegeLogoData = collegeLogo.startsWith("data:image")
        ? collegeLogo
        : `data:image/png;base64,${collegeLogo}`;
    }

    // ✅ **Campus Connection Logo (Left-Aligned)**
    doc.addImage(logo, 'JPEG', marginX, marginY, imgWidth, imgHeight);

    // ✅ **Campus Connection Name (Aligned to the Right of Logo)**
    doc.setFontSize(18);
    doc.text("Campus Connection", marginX + imgWidth + 18, marginY + imgHeight / 2 + 3);

    // ✅ **College Logo (Right-Aligned)**
    if (collegeLogoData) {
      doc.addImage(collegeLogoData, "PNG", pageWidth - imgWidth - marginX, marginY, imgWidth, imgHeight);
    }

    // ✅ **College Name (Directly Below "Campus Connection" Text)**
    doc.setFontSize(14);
    doc.text(collegeName || "", marginX + imgWidth + 20, marginY + imgHeight + 10);

    // ✅ **Student Details Table**
    const assignedTests = studentAssignedReport?.total_assigned_tests || "N/A";
    const attendedTests = studentAssignedReport?.total_attended_tests || "N/A";

    const studentDetails = [
      ["Student Name", studentReport?.student_name || "N/A"],
      ["Register No", studentReport?.reg_no || "N/A"],
      ["Year", studentReport?.year || "N/A"],
      ["Department", studentReport?.department || "N/A"],
      ["Total Assigned Tests", assignedTests],
      ["Total Attended Tests", attendedTests],
      ["Total Aptitude Tests Taken", studentReport?.["Total Aptitude Tests Taken"] || "N/A"],
      ["Aptitude Average", `${studentReport?.["Aptitude Average"] || "N/A"}%`],
      ["Total Technical Tests Taken", studentReport?.["Total Technical Tests Taken"] || "N/A"],
      ["Technical Average", `${studentReport?.["Technical Average"] || "N/A"}%`],
      ["Total Quants Tests Taken", studentReport?.["Total Quants Tests Taken"] || "N/A"],
      ["Quants Average", `${studentReport?.["Quants Average"] || "N/A"}%`],
      ["Total Logical Tests Taken", studentReport?.["Total Logical Tests Taken"] || "N/A"],
      ["Logical Average", `${studentReport?.["Logical Average"] || "N/A"}%`],
    ];

    doc.autoTable({
      startY: marginY + imgHeight + 30,
      body: studentDetails,
      theme: "grid",
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 }, 1: { cellWidth: 110 } },
    });

    // ✅ **Test Data Table**
    const nextTableStartY = doc.lastAutoTable.finalY + 10;
    doc.text("Test Data", marginX, nextTableStartY);

    const testDataArray = testData.map((test) => [
      test.dtm_end || "N/A",
      test.Quants_score || "N/A",
      test.logical_score || "N/A",
      test.verbal_score || "N/A",
      test.Aptitude_score || "N/A",
      test.Technical_score || "N/A",
      test.feedback || "N/A",
    ]);

    doc.autoTable({
      startY: nextTableStartY + 5,
      head: [["Test Date", "Quants Score", "Logical Score", "Verbal Score", "Aptitude Score", "Technical Score", "Feedback"]],
      body: testDataArray,
      theme: "grid",
      styles: { fontSize: 10, halign: "center" },
    });

    // ✅ **Save the PDF**
    const fileName = `${studentReport?.student_name || "Student"}_${collegeName || "Report"}.pdf`;
    doc.save(fileName);
  };


  const defaultReport = {
    student_name: 'N/A',
    reg_no: 'N/A',
    year: 'N/A',
    department: 'N/A',
    'Total Aptitude Tests Taken': 'N/A',
    'Aptitude Average': 'N/A',
    'Total Technical Tests Taken': 'N/A',
    'Technical Average': 'N/A',
    'Total Quants Tests Taken': 'N/A',
    'Quants Average': 'N/A',
    'Total Logical Tests Taken': 'N/A',
    'Logical Average': 'N/A',
  };

  const reportData = studentReport || defaultReport;


  const defaultStuDetails = {
    student_name: 'N/A',
    reg_no: 'N/A',
    year: 'N/A',
    department: 'N/A'
  };

  const getStuDetails = studentDetails ? studentDetails : defaultStuDetails;


  const filteredStudentsNew = [
    {
      value: "default",
      label: "Student_name - Reg_no", // Default option
      isDisabled: true, // Ensure it's not selectable
    },
    ...students.map(student => ({
      value: student.student_id,
      label: `${student.students_name} - ${student.registration_number}`,
    })),
  ];
const headerData = {
  student_name: studentDetails?.student_name || studentReport?.student_name || 'N/A',
  reg_no: studentDetails?.registration_number || studentReport?.reg_no || 'N/A',
  year: studentDetails?.year || studentReport?.year || 'N/A',
  department: studentDetails?.department || studentReport?.department || 'N/A'
};

const handleStudentChangeNew = (selectedOption) => {
  if (!selectedOption) return;

  const studentId = selectedOption.value;

  // set basic name/regno immediately for header
  const [name, regno] = selectedOption.label.split(' - ');
  setStudentDetails((prev) => ({
    ...prev,
    student_name: name,
    registration_number: regno
  }));

  setSelectedStudentId(studentId);

  // now fetch full details (year, department, etc.)
  fetchStudentDetails(studentId);

  // and fetch the report
  fetchStudentReport(studentId, selectedFromDate, selectedToDate);
};


  return (
    <div className="product-table-container">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h5>
          <pre>
            {getStuDetails.student_name || 'N/A'} - {getStuDetails.registration_number || 'N/A'} - {getStuDetails.year || 'N/A'}Yr - {getStuDetails.department || 'N/A'} - Student Report
          </pre>
        </h5>

        {/* 🔹 Search Box */}



        <button
          onClick={exportCombinedDataAsPDF} // ✅ No `this`

          className="button-ques-save"
        >
          Export
        </button>
      </div>

      {/* 🔹 Filters Section */}
      <div className="form-container">
        <div className="form-field">
          <label style={{ marginRight: "10px" }}>Student Name:</label>

          <Select
            options={filteredStudentsNew}
            onChange={handleStudentChangeNew}
            placeholder="Select a Student name or Reg No."
            styles={customStyles}
            isClearable={false}
            closeMenuOnSelect={true}
          />
        </div>

        <div className="form-field">
          <label style={{ marginRight: "10px", marginLeft: "20px" }}>From Date:</label>
          <DatePicker
  selected={filters.from_date}
  onChange={(date) => handleDateChange(date, "from_date")}
  dateFormat="dd-MM-yyyy"
  className="input-date-custom-reports"
/>
         
        </div>

        <div className="form-field">
          <label style={{ marginRight: "10px", marginLeft: "20px" }}>To Date:</label>
          <DatePicker
            selected={filters.to_date}
            onChange={(date) => handleDateChange(date, "to_date")}
            dateFormat="dd-MM-yyyy"
            className="input-date-custom-reports"
          />
        </div>

      </div>

      {/* 🔹 Student Report Display */}
      <div className="student-report-container">
        <div className="report-column">


          <div>
            {studentAssignedReport && (
              <>
                <p><strong>Total Assigned Tests:</strong> {studentAssignedReport.total_assigned_tests}</p>
                <p><strong>Total Attended Tests:</strong> {studentAssignedReport.total_attended_tests}</p>
              </>
            )}     <p><strong>No Of Aptitude Test Taken:</strong> {reportData["Total Aptitude Tests Taken"]}</p>
            <p><strong>No Of Technical Test Taken:</strong> {reportData["Total Technical Tests Taken"]}</p>

          </div>

        </div>

        <div className="report-column">
          <p><strong>No Of Quants Test Taken:</strong> {reportData["Total Quants Tests Taken"]}</p>
          <p><strong>No Of Logical Test Taken:</strong> {reportData["Total Logical Tests Taken"]}</p>
          <p><strong>Aptitude Average:</strong> {reportData["Aptitude Average"]}%</p>
          <p><strong>Technical Average:</strong> {reportData["Technical Average"]}%</p>


        </div>

        <div className="report-column">
          <p><strong>Quants Average:</strong> {reportData["Quants Average"]}%</p>
          <p><strong>Logical Average:</strong> {reportData["Logical Average"]}%</p>
          <p><strong>Overall Average:</strong> {reportData["overall_average"]}%</p>
          <p><strong>Overall Feedback:</strong> {reportData["feedback"]}</p>
        </div>
      </div>

      {/* 🔹 Test Data Table */}
      <div className="table-responsive-overallreports">
        <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", marginTop: "20px", textAlign: "center" }}>
          <thead>
            <tr>
              <th>Test Date</th>
              <th>Test Name</th>
              <th>Quants Score</th>
              <th>Logical Score</th>
              <th>Verbal Score</th>
              <th>Aptitude Score</th>
              <th>Technical Score</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {testData.length > 0 ? (
              testData.map((test, index) => (
                <tr key={index}>
                  <td>{test.dtm_end}</td>
                  <td>{test.test_name}</td>
                  <td>{test.Quants_score !== "N/A" ? test.Quants_score : "-"}</td>
                  <td>{test.logical_score !== "N/A" ? test.logical_score : "-"}</td>
                  <td>{test.verbal_score !== "N/A" ? test.verbal_score : "-"}</td>
                  <td>{test.Aptitude_score !== "N/A" ? test.Aptitude_score : "-"}</td>
                  <td>{test.Technical_score !== "N/A" ? test.Technical_score : "-"}</td>
                  <td>{test.feedback}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No test data found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}


export default OverallReport;
