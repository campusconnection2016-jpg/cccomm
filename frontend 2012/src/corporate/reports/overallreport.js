import React, { Component } from 'react';
import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css"; // Ensure you import this
import '../../styles/placement.css';
import { getAllstuReportsApi,getCorporate_logo_API,getCorporateOverallReportsApi,getmulti_Collegestu_API ,getcollegeApi} from '../../api/endpoints';
 // Import xlsx
import jsPDF from "jspdf";
import "jspdf-autotable";
class OverallReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        student_name: '',
        from_date: null,
        to_date: null,
        user_name:props.username||'',
        college_name: props.collegeName || '',
      },
      students: [],  // We will store unique students here
      studentReport: null,  // Initially no student report
      testData: [], // Store the test data for the selected student
      search: '', // Search query

    };
  }
 
  fetchCollegesAndReports = async () => {
    try {
      // Fetch corporate data to get college IDs
      const corporateData = await getCorporate_logo_API(this.state.filters.user_name);

      // Extract college IDs where user_name matches the provided username
      const fetchedColleges = [];
      if (Array.isArray(corporateData)) {
        corporateData.forEach(data => {
          if (data.user_name === this.state.filters.user_name && data.colleges && Array.isArray(data.colleges)) {
            data.colleges.forEach(college => {
              if (college.id) fetchedColleges.push(college.id);
            });
          }
        });
      }

      if (fetchedColleges.length > 0) {
        // Call the new API to fetch students using the college IDs
        const students = await getmulti_Collegestu_API(fetchedColleges.join(','));

        // Update the students state with the fetched data
        this.setState({ students });

        console.log("Fetched unique students for colleges:", students);
      } else {
        console.warn("No colleges found for the given username.");
        this.setState({ showError: true, errorMessage: "No colleges associated with the provided username." });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      this.setState({ showError: true, errorMessage: "An error occurred while fetching data." });
    }
  };

  componentDidMount() {
    console.log("Component did mount. Initiating fetch for college IDs...");
    this.fetchCollegesAndReports();
  }

  // Handle date change
  handleDateChange = (date, field) => {
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        [field]: date,
      },
    }), () => {
      // Fetch the report when date or student selection changes
      this.fetchStudentReport();
    });
  };

  // Handle student selection change
  handleStudentChange = (e) => {
    this.setState({
      filters: {
        ...this.state.filters,
        student_name: e.target.value,
      },
    }, () => {
      // Fetch the report when date or student selection changes
      this.fetchStudentReport();
    });
  };

  // Handle search query change
  handleSearchChange = (e) => {
    const search = e.target.value;
    this.setState({ search }, () => {
      // Update the student dropdown and fetch filtered data
      this.filterStudents();
      this.fetchStudentReport();
    });
  };

  // Filter students based on search query
  filterStudents = () => {
    const { search } = this.state;
    return this.state.students.filter((student) => {
      // Ensure the values are not null or undefined before calling .toLowerCase()
      const studentName = student.students_name ? student.students_name.toLowerCase() : '';
      const regNo = student.registration_number ? student.registration_number.toLowerCase() : '';
  
      return studentName.includes(search.toLowerCase()) || regNo.includes(search.toLowerCase());
    });
  };

  
 // Fetch report based on selected filters
 fetchStudentReport = () => {
  const { student_name, from_date, to_date } = this.state.filters;
  const { colleges } = this.state;  // Array of college IDs

  // Prepare the parameters
  const params = {
    student_name: student_name,
    from_date: from_date ? from_date.toISOString().split('T')[0] : null,
    to_date: to_date ? to_date.toISOString().split('T')[0] : null,
    search: this.state.search, // Search query
    colleges: colleges.join(','), // Pass the multiple college IDs as a comma-separated string
  };

  // Fetch the overall report for the student using the imported API function
  getCorporateOverallReportsApi(params)
    .then((response) => {
      this.setState({ studentReport: response.length > 0 ? response[0] : null });
    })
    .catch((error) => console.error('Error fetching filtered data:', error));

  // Fetch the detailed test data for the selected student using the imported API function
  getAllstuReportsApi(params)
    .then((response) => {
      this.setState({ testData: response });  // Store the test data
    })
    .catch((error) => console.error('Error fetching test data:', error));
};

exportCombinedDataAsPDF = () => {
  const { studentReport, testData } = this.state;

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text("Student Report", 14, 15);

  // Create Student Report details in a two-column format with borders
  const studentDetails = [
    ["Student Name", studentReport.student_name || "N/A"],
    ["Register No", studentReport.reg_no || "N/A"],
    ["Year", studentReport.year || "N/A"],
    ["Department", studentReport.department || "N/A"],
    ["Total Aptitude Tests Taken", studentReport["Total Aptitude Tests Taken"] || "N/A"],
    ["Aptitude Average", `${studentReport["Aptitude Average"] || "N/A"}%`],
    ["Total Technical Tests Taken", studentReport["Total Technical Tests Taken"] || "N/A"],
    ["Technical Average", `${studentReport["Technical Average"] || "N/A"}%`],
    ["Total Quants Tests Taken", studentReport["Total Quants Tests Taken"] || "N/A"],
    ["Quants Average", `${studentReport["Quants Average"] || "N/A"}%`],
    ["Total Logical Tests Taken", studentReport["Total Logical Tests Taken"] || "N/A"],
    ["Logical Average", `${studentReport["Logical Average"] || "N/A"}%`],
   
  ];

  doc.autoTable({
    startY: 20,
    body: studentDetails,
    theme: "grid", // Adds borders to the table
    styles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 70 }, // First column with labels
      1: { cellWidth: 110 }, // Second column with values
    },
  });

  // Dynamically calculate the Y position for the next table
  const nextTableStartY = doc.lastAutoTable.finalY + 10; // Add some space after the details table

  // Add Test Data Table
  const testDataArray = testData.map((test) => [
    test.dtm_end || "N/A",
    test.Quants_score || "N/A",
    test.logical_score || "N/A",
    test.verbal_score || "N/A",
    test.Aptitude_score || "N/A",
    test.Technical_score || "N/A",
    test.feedback || "N/A",
  ]);

  doc.text("Test Data", 14, nextTableStartY);

  doc.autoTable({
    startY: nextTableStartY + 5,
    head: [
      [
        "Test Date",
        "Quants Score",
        "Logical Score",
        "Verbal Score",
        "Aptitude Score",
        "Technical Score",
        "Feedback",
      ],
    ],
    body: testDataArray,
    theme: "grid",
    styles: {
      fontSize: 10,
      halign: "center", // Center align text
    },
  });

  // Save the PDF
  doc.save("Combined_Report.pdf");
};


  render() {
    const { filters, studentReport, testData, search } = this.state;
    const filteredStudents = this.filterStudents();  // Filtered list based on search

    // Default studentReport if not selected
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

    return (
      <div className="product-table-container">
        <h2>Overall Report</h2>
        
        {/* Search Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <input
            className="search-box"
            type="text"
            placeholder="Search..."
            value={search}
            onChange={this.handleSearchChange}  // Handle search change
          />
            <button
        onClick={this.exportCombinedDataAsPDF}
        style={{ marginTop: "20px" }}
        className="button-ques-save"
      >
        Export
      </button>
        </div>
       
        <p></p>
        {/* Filters Section */}
        <div className="form-container">
          <div className="form-field">
            <label style={{ marginRight: '10px' }}>Student Name:</label>
            <select
              name="student_name"
              value={filters.student_name}
              onChange={this.handleStudentChange}
            >
              <option value="">Select Student</option>
              {filteredStudents.map((student) => (
                <option key={student.registration_number} value={student.students_name}>
                  {student.students_name} - {student.registration_number}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label style={{ marginRight: '10px', marginLeft: '20px' }}>From Date:</label>
            <DatePicker
              name="from_date"
              selected={filters.from_date}
              onChange={(date) => this.handleDateChange(date, 'from_date')}
              dateFormat="dd-MM-yyyy"
              className="input-date-custom-rep"
            />
          </div>

          <div className="form-field">
            <label style={{ marginRight: '10px', marginLeft: '20px' }}>To Date:</label>
            <DatePicker
              name="to_date"
              selected={filters.to_date}
              onChange={(date) => this.handleDateChange(date, 'to_date')}
              dateFormat="dd-MM-yyyy"
              className="input-date-custom-rep"
            />
          </div>
        </div>

        {/* Display the student data after the report is fetched */}
        <div>
          <div className="student-report-container">
            <div className="report-column">
              <p><strong>Name:</strong> {reportData.student_name}</p>
              <p><strong>Register No:</strong> {reportData.reg_no}</p>
              <p><strong>Year:</strong> {reportData.year}</p>
              <p><strong>Department:</strong> {reportData.department}</p>
              <p><strong>Total Assigned Tests:</strong> {reportData.total_assigned_tests}</p>
            </div>
            <div className="report-column">
              <p><strong>No Of Aptitude Test Taken:</strong> {reportData['Total Aptitude Tests Taken']}</p>
              <p><strong>No Of Technical Test Taken:</strong> {reportData['Total Technical Tests Taken']}</p>
              <p><strong>No Of Quants Test Taken:</strong> {reportData['Total Quants Tests Taken']}</p>
              <p><strong>No Of Logical Test Taken:</strong> {reportData['Total Logical Tests Taken']}</p>
              <p><strong>Total No Of Test Taken:</strong> {reportData['total_tests_taken']}</p>
            </div>
            <div className="report-column">
              <p><strong>Aptitude Average:</strong> {reportData['Aptitude Average']}%</p>
              <p><strong>Technical Average:</strong> {reportData['Technical Average']}%</p>
              <p><strong>Quants Average:</strong> {reportData['Quants Average']}%</p>
              <p><strong>Logical Average:</strong> {reportData['Logical Average']}%</p>
              <p><strong>Overall Average:</strong> {reportData['overall_average']}%</p>
              <p><strong>Overall Feedback:</strong> {reportData['feedback']}</p>
            </div>
          </div>

          {/* Test Data Table */}
          <div className='table-responsive-overallreports'>
        
          <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', marginTop: '20px',textAlign:"center" }}>
            <thead>
              <tr>
               
                <th>Test Date</th>
                <th>Quants Score</th>
                <th>Logical Score</th>
                <th>Verbal Score</th>
                <th>Aptitude Score</th>
                <th>Technical Score</th>
               
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {testData.map((test, index) => (
                <tr key={index}>
                 
                  <td>{test.dtm_end}</td>
                  <td>{test.Quants_score}</td>
                  <td>{test.logical_score || 'N/A'}</td>
                  <td>{test.verbal_score || 'N/A'}</td>
                  <td>{test.Aptitude_score || 'N/A'}</td>
                  <td>{test.Technical_score || 'N/A'}</td>
                 
                  <td>{test.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table></div>

        </div>
      </div>
    );
  }
}

export default OverallReport;
