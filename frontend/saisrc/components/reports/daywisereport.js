import React, { useEffect, useState } from "react";
import { getDayWiseReportAPI,get_user_colleges_API, get_Report_Filter_Options } from "../../api/endpoints";
import CustomPagination from "../../api/custompagination";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DayWiseReport = ({userRole,institute,collegeName,username}) => {
   console.log("userrole,institute,collegeName",userRole,institute,collegeName)
 
  const [filters, setFilters] = useState({
   
     college_id: userRole === "Placement Officer" ? institute : "",
    department_id: "",
    year: "",
    test_name: "",
    date: "",
    search: "",
  });

  const [collegeOptions, setCollegeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
 const [rowCount, setRowCount] = useState(0);
 const [testNameOptions, setTestNameOptions] = useState([]);

  useEffect(() => {
  if (userRole === "Placement Officer") {
    setFilters((prev) => ({
      ...prev,
      college_id: institute, // automatically set
    }));
  }
}, [userRole, institute]);
const [collegeIds, setCollegeIds] = useState([]); // for Training admin

  // 🔹 Fetch collegeIds for Training admin
  useEffect(() => {
    if (username && userRole === "Training admin") {
      get_user_colleges_API(username)
        .then((data) => {
          if (data && data.college_ids) {
            const numericIds = data.college_ids.map((id) => Number(id));
            setCollegeIds(numericIds);
            console.log("🎯 Training admin collegeIds:", numericIds);

            // If only one college, set it as selected automatically
            if (numericIds.length === 1) {
              setFilters((prev) => ({ ...prev, college_id: numericIds[0] }));
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching user colleges:", err);
        });
    }
  }, [username, userRole]);

  // 🔹 Fetch filter options based on role & college
  const fetchFilterOptions = async () => {
    try {
      const collegeIdToUse =
        userRole === "Placement Officer"
          ? institute
          : userRole === "Training admin"
          ? null // We'll filter dropdown manually using collegeIds
          : filters.college_id || null;

      const res = await get_Report_Filter_Options(
        collegeIdToUse,
        filters.department_id || null,
        filters.date || null
      );

      // Filter colleges for Training admin
      const filteredColleges =
        userRole === "Training admin" && collegeIds.length > 0
          ? res.colleges.filter((c) => collegeIds.includes(c.id))
          : res.colleges;

      setCollegeOptions(filteredColleges || []);
      setDepartmentOptions(res.departments || []);
      setYearOptions(res.years || []);
      setTestNameOptions(res.test_names || []);
      console.log("✅ Filter options loaded:", filteredColleges);
    } catch (err) {
      console.error("❌ Error fetching filter options:", err);
    }
  };

  // 🔹 Fetch main table data
  const fetchData = async () => {
    try {
      const collegeIdToUse =
        userRole === "Placement Officer"
          ? institute
          : userRole === "Training admin"
          ? null // API returns all, we'll filter manually
          : filters.college_id || null;

      const response = await getDayWiseReportAPI(
        collegeIdToUse,
        filters.department_id || null,
        filters.year || null,
        filters.test_name || null,
        filters.date || null,
        filters.search || null,
        currentPage,
        10
      );

      let tableData = Array.isArray(response.results?.data)
        ? response.results.data
        : response.data || [];

      // 🔹 Training admin → filter by allowed collegeIds
      if (userRole === "Training admin" && collegeIds.length > 0) {
        tableData = tableData.filter((item) => collegeIds.includes(item.college_id));
        console.log("Filtered tableData for Training admin:", tableData);
      }

      setData(tableData || []);
      const totalCount = response.results?.count || response.count || 0;
      setRowCount(totalCount);
      setTotalPages(Math.ceil(totalCount / 10));
    } catch (error) {
      console.error("❌ Error fetching Day Wise Report:", error);
    }
  };
useEffect(() => {
  // Only fetch data if Training admin has collegeIds
  if (userRole === "Training admin") {
    if (collegeIds.length > 0) {
      fetchFilterOptions();
      fetchData();
    }
  } else {
    // Placement Officer / Super Admin
    fetchFilterOptions();
    fetchData();
  }
}, [filters, collegeIds, userRole, currentPage]);


  const [startDate, setStartDate] = useState(null); // Date object for DatePicker

// When startDate changes, update filters.date string in yyyy-MM-dd format
useEffect(() => {
  if (startDate) {
    const yyyy = startDate.getFullYear();
    const mm = String(startDate.getMonth() + 1).padStart(2, "0");
    const dd = String(startDate.getDate()).padStart(2, "0");
    setFilters(prev => ({ ...prev, date: `${yyyy}-${mm}-${dd}` }));
  } else {
    setFilters(prev => ({ ...prev, date: "" }));
  }
}, [startDate]);

// On filter reset or initial load, sync startDate with filters.date string
useEffect(() => {
  if (filters.date) {
    const parts = filters.date.split("-");
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    setStartDate(d);
  } else {
    setStartDate(null);
  }
}, [filters.date]);
const exportToExcel = async () => {
    try {
      // Fetch ALL rows without pagination
      const response = await getDayWiseReportAPI(
        filters.college_id || null,
        filters.department_id || null,
        filters.year || null,
        filters.test_name || null,
        filters.date || null,
        filters.search || null,
        1,
        rowCount ,// fetch all
        true
      );

      const exportData = Array.isArray(response.results?.data)
        ? response.results.data
        : response.data || [];

      if (exportData.length === 0) {
        alert("No data to export");
        return;
      }

      // Create workbook & sheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Day Wise Report");

      // Define columns
      worksheet.columns = [
        { header: "College", key: "college_name", width: 25 },
        { header: "Department", key: "department", width: 25 },
        { header: "Year", key: "year", width: 10 },
        { header: "Test Name", key: "test_name", width: 25 },
        { header: "Student Name", key: "students_name", width: 25 },
        { header: "Reg No", key: "reg_no", width: 15 },
        
        { header: "Mark", key: "avg_mark", width: 10 },
        { header: "Student Start Date", key: "dtm_start_test", width: 20 },
         { header: "Test Assigned Date", key: "dtm_start", width: 10 },
        { header: "Duration Taken", key: "capture_duration", width: 20 },

      ];

      // Add rows
      exportData.forEach((row) => {
        worksheet.addRow(row);
      });

      // Style header
      worksheet.getRow(1).font = { bold: true };

      // Export file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "DayWiseReport.xlsx");
    } catch (err) {
      console.error("❌ Error exporting Excel:", err);
    }
  };
  // Load filters on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Refetch departments/years when college changes
//  useEffect(() => {
  //  if (filters.college_id) {
     // fetchFilterOptions(filters.college_id);
   // }
  //}, [filters.college_id]);
  useEffect(() => {
  const collegeIdToUse = userRole === "Placement Officer" ? institute : filters.college_id;
  fetchFilterOptions(collegeIdToUse, filters.department_id);
}, [filters.college_id, filters.department_id, filters.date, userRole, institute]);

useEffect(() => {
  fetchData();
}, [currentPage, filters, userRole, institute]);


  // Handle filter changes
const handleFilterChange = (e) => {
  const { name, value } = e.target;

  if (userRole === "Placement Officer" && name === "college_id") return;

  setFilters((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  return (
    <div className="product-table-container">
      <h6>📅 Day Wise Report</h6>

<div
   className="filters"
>
  <input
    type="text"
    name="search"
    placeholder="Search"
    value={filters.search}
    onChange={handleFilterChange}
    className="search-box1"
     // optional styling
  />

  <button onClick={exportToExcel} className="button-ques-save">
    Download
  </button>

  <div>
  <h4>No of Students {rowCount} </h4>  
  </div>
</div>

      {/* Filters */}
     <div
  className="filters"
 
>
  <DatePicker
    selected={startDate}
    onChange={(date) => setStartDate(date)}
    dateFormat="yyyy-MM-dd"
    placeholderText="Select Start Date"
    className="input-date-custom-day"
    style={{
      minWidth: "160px",
      maxWidth: "180px",
      height: "35px",
      padding: "5px 10px",
      fontSize: "14px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    }}
  />
{userRole !== "Placement Officer" && (
  <select
    name="college_id"
    onChange={handleFilterChange}
    value={filters.college_id}
     style={{
      minWidth: "180px",
      maxWidth: "180px",
      height: "35px",
      padding: "5px 10px",
      fontSize: "14px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      backgroundColor: "#39444e",
      color: "#fff",
    }}
  >
    <option value=""> All College</option>
    {collegeOptions.map((college) => (
      <option key={college.id} value={college.id}>
        {college.name}
      </option>
    ))}
  </select>)}

  <select
    name="department_id"
    onChange={handleFilterChange}
    value={filters.department_id}
     style={{
      minWidth: "180px",
      maxWidth: "180px",
      height: "35px",
      padding: "5px 10px",
      fontSize: "14px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      backgroundColor: "#39444e",
      color: "#fff",
    }}>
    <option value="">All Department</option>
    {departmentOptions.map((dept) => (
      <option key={dept.id} value={dept.id}>
        {dept.name}
      </option>
    ))}
  </select>

  <select
    name="year"
    onChange={handleFilterChange}
    value={filters.year}
     style={{
      minWidth: "113px",
      maxWidth: "140px",
      height: "35px",
      padding: "5px 10px",
      fontSize: "14px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      backgroundColor: "#39444e",
      color: "#fff",
    }}
  >
    <option value="">All Year</option>
    {yearOptions.map((yr) => (
      <option key={yr} value={yr}>
        {yr}
      </option>
    ))}
  </select>
<select
  name="test_name"
  onChange={handleFilterChange}
  value={filters.test_name}
 style={{
      minWidth: "180px",
      maxWidth: "200px",
      height: "35px",
      padding: "5px 10px",
      fontSize: "14px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      backgroundColor: "#39444e",
      color: "#fff",
    }}
>
  <option value="">All Test Name</option>
  {testNameOptions.map((name, index) => (
    <option key={index} value={name}>
      {name}
    </option>
  ))}
</select>


</div>

  <div className="po-table-responsive-t-Reports">
                    <table className="placement-table-t">

                        <thead  style={{ textAlign: "center" }}>
                <tr>
                   <th style={{textAlign:"center"}}>Department</th>
           {/*} <th>Year</th>*/}
            <th style={{textAlign:"center"}}>Test Name</th>
            <th style={{textAlign:"center"}}>StudentName</th>
            <th style={{textAlign:"center"}}>Reg No</th>
           
           
            <th style={{textAlign:"center"}}>Mark</th>
           
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx}>
                <td style={{textAlign:"center"}}>{row.department}</td>
             {/*}   <td>{row.year}</td>*/}
                <td style={{textAlign:"center"}}>{row.test_name}</td>
                 <td style={{textAlign:"center"}}>{row.students_name}</td>
                 <td style={{textAlign:"center"}}>{row.reg_no}</td>
                
                 <td style={{textAlign:"center"}}>{row.avg_mark}</td>
                
               
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No Data Found</td>
            </tr>
          )}
        </tbody>
      </table>
</div>
      {/* Pagination */}
        <div className='dis-page' style={{ marginTop: '10%' }}>
            
        <CustomPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          maxVisiblePages={3}
        />
      </div>
    </div>
  );
};

export default DayWiseReport;
