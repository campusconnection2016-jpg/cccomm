import React, { Component } from 'react';
import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css"; // Ensure you import this
import '../../styles/placement.css';
import { getdepartmentAllstuReportsApi, getdeparmentOverallReportsApi, getcollegeApi, getdepartmentApi } from '../../api/endpoints';
// Import xlsx
import jsPDF from "jspdf";
import "jspdf-autotable";

class DepartmentReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        student_name: '',
        from_date: null,
        to_date: null,
        college_name: props.collegeName || '',
      },
      students: [],  // We will store unique students here
      studentReport: [],  // Initially no student report
      testData: [], // Store the test data for the selected student
      search: '', // Search query
      currentIndex: 0,  // The current index for pagination
      reportDataList: [], // The array containing all report data
      selectedDepartment: '', // For storing selected department
      departments: [],

    };
    this.handleDepartmentChange = this.handleDepartmentChange.bind(this);
    this.fetchDepartments = this.fetchDepartments.bind(this);
  }
  handlePrevious = () => {
    this.setState((prevState) => {
      if (prevState.currentIndex > 0) {
        return { currentIndex: prevState.currentIndex - 1 };
      }
      return null;  // Prevent going below 0
    });
  };

  // Function to handle the next page click
  handleNext = () => {
    this.setState((prevState) => {
      if (prevState.currentIndex < prevState.reportDataList.length - 1) {
        return { currentIndex: prevState.currentIndex + 1 };
      }
      return null;  // Prevent going beyond the last index
    });
  };

  fetchCollegeId = async () => {
    try {
      console.log("Fetching college list...");
      const data = await getcollegeApi(); // Call your API to get the college list
      console.log("API response for colleges:", data);

      const { college_name } = this.state.filters;
      console.log("Filter - College Name:", college_name);

      if (Array.isArray(data)) {
        console.log("College data is an array. Searching for matching college...");
        const matchingCollege = data.find(
          (college) => college.college.trim() === college_name.trim()
        );

        if (matchingCollege) {
          console.log("Matching college found:", matchingCollege);

          // Update state and fetch students only after state is updated
          this.setState({ college_id: matchingCollege.id }, () => {
            console.log("College ID set in state:", this.state.college_id);
            console.log("Fetching unique students...");

          });
        } else {

          console.warn("No matching college found for:", college_name);
        }
      } else {
        console.warn("Unexpected response structure: Expected an array.");
      }
    } catch (error) {
      console.error("Error fetching college data:", error);
    }
  };

  componentDidMount() {
    console.log("Component did mount. Initiating fetch for college ID...");
    this.fetchCollegeId();
    this.fetchDepartments();
  }

  fetchDepartments = async () => {
    try {
      console.log('Fetching departments from API...'); // Debug: Step 1
      const departments = await getdepartmentApi(); // Call the API function
      console.log('API Response:', departments); // Debug: Step 2 (Check if API response is correct)

      if (Array.isArray(departments) && departments.length > 0) {
        this.setState({ departments }, () =>
          console.log('Departments updated in state:', this.state.departments) // Debug: Step 3
        );
      } else {
        console.warn('No departments found or invalid response format:', departments); // Debug: Step 4
        this.setState({ departments: [] });
      }
    } catch (error) {
      console.error('Error fetching departments:', error); // Debug: Step 5
    }
  };

  handleDepartmentChange = (event) => {
    const selectedValue = event.target.value;
    console.log('Selected department:', selectedValue); // Debug
    this.setState({ selectedDepartment: selectedValue }, () => {
      this.fetchStudentReport(); // Re-fetch report with updated department
    });
  };

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
    const { search, selectedDepartment, students } = this.state;

    return students.filter((student) => {
      // Ensure the values are not null or undefined before calling .toLowerCase()
      const studentName = student.students_name ? student.students_name.toLowerCase() : '';
      const regNo = student.registration_number ? student.registration_number.toLowerCase() : '';
      const departmentMatch = selectedDepartment ? student.department === selectedDepartment : true;

      return (
        (studentName.includes(search.toLowerCase()) || regNo.includes(search.toLowerCase())) &&
        departmentMatch
      );
    });
  };

  fetchStudentReport = () => {
    const { student_name, from_date, to_date } = this.state.filters;
    const { selectedDepartment, college_id } = this.state;

    const params = {
      student_name: student_name || "",
      from_date: from_date ? from_date.toISOString().split('T')[0] : null,
      to_date: to_date ? to_date.toISOString().split('T')[0] : null,
      search: this.state.search || "",
      college_id: college_id || null,
      department: selectedDepartment || null,
    };

    console.log("Fetching report with params:", params);

    // Fetch overall department report
    getdeparmentOverallReportsApi(params)
      .then((response) => {
        console.log('Raw report1 Response:', response);

        // Ensure department ID is consistently filtered
        const filteredData = selectedDepartment
          ? response.filter((item) => String(item.department_id) === String(selectedDepartment))
          : response;

        console.log('Filtered Report1 Data:', filteredData);

        this.setState({
          reportDataList: filteredData,
          currentIndex: 0,
        });
      })
      .catch((error) => console.error('Error fetching filtered data:', error));

    // Fetch all student reports
    getdepartmentAllstuReportsApi(params)
      .then((response) => {
        console.log('Raw report2 Response:', response);

        // Ensure department filtering is consistent
        const filteredData = selectedDepartment
          ? response.filter((item) => String(item.department_id) === String(selectedDepartment))
          : response;

        console.log('Filtered Test Data:', filteredData);

        this.setState({ testData: filteredData });
      })
      .catch((error) => console.error('Error fetching test data:', error));
  };

  exportCombinedDataAsPDF = () => {
    const { reportDataList, testData } = this.state;

    // Initialize the jsPDF instance
    const doc = new jsPDF();

    // Loop through all student reports
    reportDataList.forEach((studentReport, index) => {
      // Add title for each student's report
      doc.setFontSize(18);
      doc.text(`Student Report (${index + 1})`, 14, 15);

      // Prepare the student details as 3-column data
      const studentDetails = [
        ["Student Name:", studentReport.student_name || "N/A", "Register No:", studentReport.reg_no || "N/A"],
        ["Year:", studentReport.year || "N/A", "Department:", studentReport.department || "N/A"],
        ["Total Aptitude Tests:", studentReport["Total Aptitude Tests Taken"] || "N/A", "Aptitude Avg:", `${studentReport["Aptitude Average"] || "N/A"}%`],
        ["Total Technical Tests:", studentReport["Total Technical Tests Taken"] || "N/A", "Technical Avg:", `${studentReport["Technical Average"] || "N/A"}%`],
        ["Total Quants Tests:", studentReport["Total Quants Tests Taken"] || "N/A", "Quants Avg:", `${studentReport["Quants Average"] || "N/A"}%`],
        ["Total Logical Tests:", studentReport["Total Logical Tests Taken"] || "N/A", "Logical Avg:", `${studentReport["Logical Average"] || "N/A"}%`],
      ];

      // Render the details as a 3-column table with borders
      doc.autoTable({
        startY: 25,
        body: studentDetails,
        theme: "grid", // Add borders to all cells
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: "left",
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 50 }, // First column
          1: { cellWidth: 50 }, // Second column
          2: { fontStyle: "bold", cellWidth: 50 }, // Third column
          3: { cellWidth: 50 }, // Fourth column
        },
      });

      // Filter test data for the current student
      const studentTestData = testData.filter(
        (test) => test.student_name === studentReport.student_name
      );

      // Add test data as a table if available
      if (studentTestData.length > 0) {
        doc.text("Test Data", 14, doc.lastAutoTable.finalY + 10);

        const testDataArray = studentTestData.map((test) => [
          test.dtm_end || "N/A",
          test.Quants_score || "N/A",
          test.logical_score || "N/A",
          test.verbal_score || "N/A",
          test.Aptitude_score || "N/A",
          test.Technical_score || "N/A",
          test.feedback || "N/A",
        ]);

        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 15,
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
            halign: "center",
          },
        });
      }

      // Add a page break for all but the last student's report
      if (index < reportDataList.length - 1) {
        doc.addPage();
      }
    });

    // Save the PDF
    doc.save("Combined_Report.pdf");
  };


  render() {
    const { filters, studentReport, testData, search, currentIndex, reportDataList, // Track selected department
      departments, selectedDepartment } = this.state;
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

    const currentReport = reportDataList[currentIndex] || {}; // Get the current report based on currentIndex
    const reportData = reportDataList.length > 0
      ? reportDataList[currentIndex]
      : defaultReport;
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
              className="department-filter"
              value={selectedDepartment}
              onChange={this.handleDepartmentChange}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="">All Departments</option>
              {departments.map((department, index) => (
                <option key={index} value={department.id}>
                  {department.department}
                </option>
              ))}
            </select></div>
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
            <p></p>
            <div className="pagination-buttons" >
              <button onClick={this.handlePrevious} className='button-ques-save-ss' disabled={currentIndex === 0}>Previous</button>
              <button onClick={this.handleNext} className='button-ques-save-ss' style={{ marginRight: "50px" }} disabled={currentIndex === reportDataList.length - 1}>Next</button>
            </div>
          </div>


          {/* Test Data Table */}

          <div className='table-responsive-overallreports'>

            <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', marginTop: '20px', textAlign: "center" }}>
              <thead>
                <tr>
                  <th>StudentName</th>
                  <th>Department</th>
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
                {testData
                  .map((test, index) => (
                    <tr key={index}>
                      <td>{test.student_name}</td>
                      <td>{test.department}</td>
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

export default DepartmentReport;
