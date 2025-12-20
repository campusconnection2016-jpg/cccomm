import "react-datepicker/dist/react-datepicker.css"; // Ensure you import this
import '../../styles/placement.css';
import { get_Department_Report_API,get_Departmentaudio_Report_API,
  getTest_Name_DropDown_PO_API, getDepart_Report_dropDown_Po_API,get_Individual_Department_Report_API} from '../../api/endpoints';
import React, { useState, useEffect } from "react";
import { Form, Pagination } from 'react-bootstrap';
import CustomPagination from "../../api/custompagination";
import ExcelJS from 'exceljs';
const DepartmentReport = ({institute }) => {
  const [filters, setFilters] = useState({
  
    year: '',
    test_name: localStorage.getItem("selectedTestName") || "ALL",

   // test_name: '',
  });
  const [individualReportData, setIndividualReportData] = useState([]);
const [searchQuery, setSearchQuery] = useState('');

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [collegeId, setCollegeId] = useState(null);
  const [testData, setTestData] = useState([]);
  const [testNames, setTestNames] = useState([]); // Store test names
   const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
 const [pageSize] = useState(10);
  useEffect(() => {
  if (institute) {
    setCollegeId(institute); // Ensure collegeId state gets updated from prop
    fetchDepartments();       // Trigger department fetch here
  }
}, [institute]);


 const fetchDepartments = async () => {
  try {
    if (!institute) {
      console.warn("No college ID (institute) provided.");
      return;
    }

    const data = await getDepart_Report_dropDown_Po_API(institute); // pass the college_id
    console.log("Fetched departments:", data); // ✅ Console log added

    setDepartments(data.departments || []);
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};

useEffect(() => {
  if (collegeId ) {
    fetchTestNames();
  }
}, [collegeId, selectedDepartment, filters.year]);


const fetchTestNames = async () => {
  try {
    console.log("⏳ Step 1: Attempting to fetch test names...");
    console.log("📦 Payload being sent to API:", {
      collegeId,
      department_id: selectedDepartment,
      year: filters.year,
    });

    // Call the API
    const data = await getTest_Name_DropDown_PO_API(
  collegeId,
  selectedDepartment || undefined,
  filters.year || undefined
);


    console.log("✅ Step 2: API response received:", data);

    // Check if the expected 'test_names' array exists
    if (data && Array.isArray(data.test_names)) {
      console.log("🧩 Step 3: Extracting test names from response:", data.test_names);
      setTestNames(data.test_names);
    } else {
      console.warn("⚠️ Step 4: 'test_names' is not an array or is missing:", data);
      setTestNames([]);
    }

  } catch (error) {
    console.error("❌ Step 5: Error occurred while fetching test names:", error);
  }
};
useEffect(() => {
  if (collegeId && selectedDepartment ) {
    getDepartmentReport(currentPage);
  }
}, [collegeId, selectedDepartment, filters.year, filters.test_name, currentPage]);
const getDepartmentReportold = async (page = 1) => {
  try {
    const testNameToSend = (filters.test_name && filters.test_name !== "ALL") ? filters.test_name : "";

    const data = await get_Department_Report_API(
    
      page,
      searchQuery,
      collegeId,
      selectedDepartment,
      filters.year,
      testNameToSend
    );
    
    setTestData(data.results);
    console.log("dep_report",data.result)
    setTotalPages(Math.ceil(data.count / pageSize));
  } catch (error) {
    console.error("Error fetching department report:", error);
  }
};

const getDepartmentReport = async (page = 1) => {
  try {
    const testNameToSend =
      filters.test_name && filters.test_name !== "ALL"
        ? filters.test_name
        : "";

    const data = await get_Departmentaudio_Report_API(
      page,
      searchQuery,
      collegeId,
      selectedDepartment,
      filters.year,
      testNameToSend
    );

    console.log("🟢 Raw API response:", data);

    let finalResults = [];

    if (Array.isArray(data)) {
      finalResults = data;
      setTotalPages(1);
    } else if (Array.isArray(data?.results)) {
      finalResults = data.results;
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
    }

    console.log("🟢 finalResults:", finalResults);
    setTestData(finalResults);

  } catch (error) {
    console.error("🔴 Error fetching department report:", error);
    setTestData([]);
  }
};


useEffect(() => {
  
  if (
    collegeId &&
    selectedDepartment &&
    filters.year &&
    filters.test_name &&
    filters.test_name !== "ALL"
  ) {
    fetchIndividualDepartmentReport();
  }
}, [collegeId, selectedDepartment, filters.year, filters.test_name]);

const fetchIndividualDepartmentReport = async (page = 1) => {
  try {
   
    const data = await get_Individual_Department_Report_API({
   page,
  college: collegeId,
  department: selectedDepartment,
  year: filters.year,
  testName: filters.test_name,
  searchQuery,
});

   console.log("🎯 Individual Department Report:", data);
    setIndividualReportData(data.results || []);
  } catch (error) {
    console.error("❌ Error fetching individual department report:", error);
    setIndividualReportData([]);
  }
};
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);

useEffect(() => {
  if (!collegeId || !selectedDepartment || !filters.year) return;

  if (filters.test_name === "ALL" || !filters.test_name) {
    getDepartmentReport(currentPage); // General department report
  } else {
    fetchIndividualDepartmentReport(currentPage); // Individual report
  }
}, [collegeId, selectedDepartment, filters.year, filters.test_name, currentPage, searchQuery]);

 const currentData = testData;  // already backend-paginated
const [totalPages, setTotalPages] = useState(1);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


const getDepartmentName = () => {
  if (!selectedDepartment) return "All Departments";

  const dept = departments.find(d => String(d.department_id) === String(selectedDepartment));
  return dept ? dept.department_id__department : "All Departments";
};

  const getYearLabel = () => {
    switch (filters.year) {
      case "1": return "1st Yr";
      case "2": return "2nd Yr";
      case "3": return "3rd Yr";
      case "4": return "4th Yr";
      default: return "All Years";
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const exportToExcel = async (filteredData, fileName = 'Report.xlsx') => {
  if (!Array.isArray(filteredData) || filteredData.length === 0) {
    console.error("❌ No data available for export");
    return;
  }

  // 1. Create a workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // 2. Column name mapping
  const headerMap = {
    student_id__students_name: "Student Name",
    student_id__registration_number: "Reg No",
    total_tests_taken: "Total Tests Taken",
  aptitude_avg: "Aptitude Avg",
  technical_avg: "Technical Avg",
  softskills_avg: "Softskills Avg",
  overall_avg: "Overall Avg",
  feedback: "Feedback"
  };

  // 3. Get headers excluding "student_id" and replacing mapped names
  const headers = Object.keys(filteredData[0])
    .filter(key => key !== "student_id")
    .map(key => headerMap[key] || key);

  // Add headers to worksheet
  worksheet.addRow(headers);

  // 4. Add data rows in the same header order
  filteredData.forEach(row => {
    const rowData = Object.keys(filteredData[0])
      .filter(key => key !== "student_id")
      .map(key => row[key]);
    worksheet.addRow(rowData);
  });

  // 5. Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: 'center' };

  // 6. Generate buffer & download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="product-table-container">
       <div className="form-cont-dept">
       <h5>{getDepartmentName()} - {getYearLabel()} Report</h5>
      {/*}  <input
  type="text"
  placeholder="Search by student name or reg no"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
  className="search-bar"
  style={{
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    minWidth: '250px'
  }}
/>
<button onClick={handleSearch} className="btn btn-primary" style={{ marginLeft: '10px' }}>
  Search
</button>*/}


       </div>
           
      <div className="form-cont-dept">
        <div className="form-field-dep">
          <label>Department </label><p></p>
         <select
  className="dropdown-custom-repo"
  value={selectedDepartment}
 onChange={(e) => {
  console.log("Department changed to:", e.target.value);
  setSelectedDepartment(e.target.value);
}}

>
  <option value="">Select Department</option>
  {departments.map((dept) => (
    <option key={dept.department_id} value={dept.department_id}>
      {dept.department_id__department}
    </option>
  ))}
</select>


        </div>
        <div className="form-field-dep">
  <label>Year </label><p></p>
<select
  className="dropdown-custom-repo"
 
  value={filters.year}
  onChange={(e) =>
    setFilters((prev) => ({ ...prev, year: e.target.value }))
  }
>
  <option value="">All</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
</select>

</div>
<div className="form-field-dep">
          <label>Test Name</label><p></p>
       <select
  className="dropdown-custom-repo"
  value={filters.test_name}
  onChange={(e) =>
    setFilters((prev) => ({ ...prev, test_name: e.target.value }))
  }
>
  <option value="ALL">ALL</option>
  {testNames.map((test, index) => (
    <option key={index} value={test}>
      {test}
    </option>
  ))}
</select>
     </div>
<button
  onClick={() => {
    if (filters.test_name === "ALL" || !filters.test_name) {
      exportToExcel(currentData, 'DepartmentReport.xlsx');
    } else {
      exportToExcel(individualReportData, 'IndividualReport.xlsx');
    }
  }}
  className="button-ques-save"
>
  Download
</button>

      </div>
     <div className='po-table-responsive-test-attend-candidates'>
  {filters.test_name === "ALL" || !filters.test_name ? (
    // ✅ First Table: General Department Report
    <table className="placement-table">
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Student Name</th>
          <th style={{ textAlign: "left" }}>RegNo</th>
        {/*}  <th style={{ textAlign: "center" }}>TestsTaken</th>
          <th style={{ textAlign: "center" }}>Aptitude Average</th>
          <th style={{ textAlign: "center" }}>Tech Average</th>
          <th style={{ textAlign: "center" }}>Softskills Average</th>
          <th style={{ textAlign: "center" }}>Average</th>*/}
          <th style={{ textAlign: "center" }}>Listening Avg</th>
      <th style={{ textAlign: "center" }}>Speaking Avg</th>
      <th style={{ textAlign: "center" }}>Reading Avg</th>
      <th style={{ textAlign: "center" }}>Writing Avg</th>
      <th style={{ textAlign: "center" }}>Overall Avg</th>
      <th style={{ textAlign: "center" }}>Feedback</th>
        </tr>
      </thead>
      <tbody>
        {currentData.length > 0 ? (
          currentData.map((test, index) => (
            <tr key={index}>
              <td style={{ textAlign: "left" }}>{test.students_name}</td>
              <td style={{ textAlign: "left" }}>{test.registration_number}</td>
             {/*} <td style={{ textAlign: "center" }}>{test.total_tests_taken}</td>
              <td style={{ textAlign: "center" }}>{test.aptitude_avg}</td>
              <td style={{ textAlign: "center" }}>{test.technical_avg}</td>
              <td style={{ textAlign: "center" }}>{test.softskills_avg}</td>
              <td style={{ textAlign: "center" }}>{test.overall_avg}</td>*/}
              <td style={{ textAlign: "center" }}>
            {test["Listening Avg"] ?? 0}
          </td>

          <td style={{ textAlign: "center" }}>
            {test["Speaking Total Avg"] ?? 0}
          </td>

          <td style={{ textAlign: "center" }}>
            {test["Reading Total Avg"] ?? 0}
          </td>

          <td style={{ textAlign: "center" }}>
            {test["Writing Total Avg"] ?? 0}
          </td>

          <td style={{ textAlign: "center" }}>
            {test.overall_avg ?? 0}
          </td>

          <td style={{ textAlign: "center" }}>
            {test.feedback}
          </td>
            </tr>
          ))
        ) : (
          <tr><td colSpan="7" style={{ textAlign: "center" }}>No data available</td></tr>
        )}
      </tbody>
    </table>
  ) : (
    // ✅ Second Table: Individual Department Report (when test_name selected)
  <table className="placement-table">
  <thead>
    <tr>
      <th style={{ textAlign: "left" }}>Student Name</th>
      <th style={{ textAlign: "left" }}>RegNo</th>
    
      <th style={{ textAlign: "center" }}>Test Start Date</th>
      <th style={{ textAlign: "center" }}>Duration</th>
      <th style={{ textAlign: "center" }}>Average Mark</th>
     
    </tr>
  </thead>
  <tbody>
    {individualReportData.length > 0 ? (
      individualReportData.map((student, index) => (
        <tr key={index}>
          <td style={{ textAlign: "left" }}>{student.student_name}</td>
          <td style={{ textAlign: "left" }}>{student.registration_number}</td>
        
          <td style={{ textAlign: "center" }}>{student.dtm_start_test}</td>
          <td style={{ textAlign: "center" }}>{student.capture_duration}</td>
          <td style={{ textAlign: "center" }}>{student.avg_mark}</td>
         
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="7" style={{ textAlign: "center" }}>No data available for selected test</td>
      </tr>
    )}
  </tbody>
</table>

  )}
</div>

     
<p></p>

         <div className='dis-page' style={{ marginTop: '10%' }}>
                               {/* Custom Pagination */}
                               <CustomPagination
                                   totalPages={totalPages}
                                   currentPage={currentPage}
                                   onPageChange={handlePageChange}
                                   maxVisiblePages={3} // Limit to 3 visible pages
                               />
                           </div>
    </div>
  );
};

export default DepartmentReport;
