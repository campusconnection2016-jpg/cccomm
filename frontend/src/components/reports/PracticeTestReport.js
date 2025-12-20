import React, { useState, useEffect } from "react";
import { getPracticegroupTestReport_API,getDropdownFilters_API } from "../../api/endpoints";
import CustomPagination from "../../api/custompagination";
import ExcelJS from "exceljs";
import { useNavigate } from "react-router-dom";

const PracticeTestReport = ({userRole,institute,collegeName}) => {
 console.log("userrole,institute,collegeName",userRole,institute,collegeName)
    const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const navigate = useNavigate();

const handleViewResult = (testName, collegeId, dept, year) => {
  console.log("📌 Navigating to PracticeView with params:", {
    testName,
    collegeId,
    dept,
    year,
  });

  navigate(
    `/practice/stuview/report?college_id=${collegeId}&department=${dept}&year=${year}&test_name=${encodeURIComponent(
      testName
    )}`
  );
};


   useEffect(() => {
    if (userRole === "Placement Officer") {
      setCollegeId(institute);
    }
  }, [userRole, institute]);


useEffect(() => {
  const fetchAllFilters = async () => {
    try {
      console.log("📌 Fetching ALL dropdown filters (no college_id)...");
      const res = await getDropdownFilters_API();
      console.log("✅ Dropdown filters response:", res);

      if (res) {
        setCollegeOptions(res.colleges || []);
        setDepartmentOptions(res.departments || []);
        setYearOptions(res.years || []);

        console.log("🎓 Colleges set:", res.colleges);
        console.log("🏫 Departments set:", res.departments);
        console.log("📅 Years set:", res.years);
      }
    } catch (err) {
      console.error("❌ Error fetching dropdown filters:", err);
    }
  };

  fetchAllFilters();
}, []);

// Fetch table data whenever filters change
useEffect(() => {
  fetchReportData();
}, [currentPage, searchTerm, collegeId, department, year]);

useEffect(() => {
  const fetchDepartmentYearForCollege = async () => {
    if (!collegeId) return;

    try {
      console.log(`📌 Fetching dept/year for collegeId: ${collegeId}`);
      const res = await getDropdownFilters_API({ college_id: collegeId });

      if (res) {
        setDepartmentOptions(res.departments || []);
        setYearOptions(res.years || []);
      } else {
        setDepartmentOptions([]);
        setYearOptions([]);
      }
    } catch (err) {
      console.error("❌ Error fetching department/year filters:", err);
      setDepartmentOptions([]);
      setYearOptions([]);
    }
  };

  fetchDepartmentYearForCollege();
}, [collegeId]);

 const fetchReportData = async () => {
  try {
    setLoading(true);

    const response = await getPracticegroupTestReport_API({
      page: currentPage,
      search: searchTerm,
 college_id: userRole === "Placement Officer" ? institute : collegeId, // Always pass institute for PO
 
      //college_id: collegeId,
      department: department,
      year: year,
    });

    if (response?.results) {
      setData(response.results);
      setTotalPages(Math.ceil(response.count / 10));
    } else {
      setData([]);
      setTotalPages(1);
    }
  } catch (error) {
    console.error("❌ Error fetching practice test report:", error);
  } finally {
    setLoading(false);
  }
};

// Runs once on mount — gets ALL dropdown data
const fetchFilterOptions = async () => {
    let page = 1;
    let hasMore = true;
    const colleges = new Set();
    const departments = new Set();
    const years = new Set();

    while (hasMore) {
      const res = await getPracticegroupTestReport_API({ page });
      if (res?.results) {
        res.results.forEach((item) => {
          if (item.collegeId && item.college_id) {
            colleges.add(JSON.stringify({ id: item.collegeId, name: item.college_id }));
          }
          if (item.department_id) {
            departments.add(item.department_id);
          }
          if (item.year) {
            years.add(item.year);
          }
        });
        hasMore = !!res.next;
        page++;
      } else {
        hasMore = false;
      }
    }

    setCollegeOptions(Array.from(colleges).map((c) => JSON.parse(c)));
    setDepartmentOptions(Array.from(departments));
    setYearOptions(Array.from(years).sort());
  };

 useEffect(() => {
  if (userRole !== "Placement Officer") {
    fetchFilterOptions();
  }
}, [userRole]);


  useEffect(() => {
    fetchReportData();
  }, [currentPage, searchTerm, collegeId, department, year]);

const exportToExcel = async () => {
  try {
    let page = 1;
    let allData = [];
    let hasMore = true;

    while (hasMore) {
      const res = await getPracticegroupTestReport_API({
        page,
        search: searchTerm,
        college_id: userRole === "Placement Officer" ? institute : collegeId,
        department,
        year
      });

      if (res?.results?.length) {
        allData = [...allData, ...res.results];
        hasMore = !!res.next;
        page++;
      } else {
        hasMore = false;
      }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Practice Test Report");

    // Build headers dynamically based on role (same as your table)
    const header = [];
    if (userRole !== "Placement Officer") header.push("College Name");
    header.push("Test Name");
    header.push("Attended Count");
    worksheet.addRow(header);

    // Add rows
    allData.forEach((item) => {
      const row = [];
      if (userRole !== "Placement Officer") row.push(item.college_id);
      row.push(item.test_name);
      row.push(item.attended_count);
      worksheet.addRow(row);
    });

    // Styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(
          maxLength,
          cell.value ? cell.value.toString().length : 0
        );
      });
      col.width = maxLength + 2;
    });

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "PracticeTestReport.xlsx";
    link.click();
  } catch (err) {
    console.error("Error exporting Excel:", err);
  }
};


// Sorting handler
useEffect(() => {
    fetchReportData();
  }, [currentPage, searchTerm, collegeId, department, year]);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleCollegeChange = (e) => setCollegeId(e.target.value);
  const handleDepartmentChange = (e) => setDepartment(e.target.value);
  const handleYearChange = (e) => setYear(e.target.value);
 
  const sortedData = data; // no extra sorting

  return (
    <div className="product-table-container" style={{maxWidth:"100%",marginTop:"-17px"}}>
      <h6>Students Practice Test Report</h6>

      {/* Filters */}
      <div className="row mb-3 align-items-center">
        <div className="col">

          <input
            type="text"
            placeholder="Search..."
            className="form-control" style={{background:"transparent",color:"white"}}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
       {userRole !== "Placement Officer" && (
  <div className="col">
     <select
              className="dropdown-custom college-name-dropdown"
              value={collegeId}
              onChange={handleCollegeChange}
            >
              <option value="">All Colleges</option>
              {collegeOptions.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
  </div>
)}

       <div className="col">
          <select className="dropdown-custom college-name-dropdown" value={department} onChange={handleDepartmentChange}>
            <option value="">All Departments</option>
            {departmentOptions.map((dept, idx) => (
              <option key={idx} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="col">
          <select className="dropdown-custom" value={year} onChange={handleYearChange}>
            <option value="">All Years</option>
            {yearOptions.map((yr, idx) => (
              <option key={idx} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
           <button onClick={exportToExcel} className="button-ques-save">Download </button>
        
      </div>
 <div className="po-table-responsive-t-Reports">
                    <table className="placement-table-t">

             <thead >
            <tr>
               {userRole !== "Placement Officer" && (
               <th style={{textAlign:"center"}}>CollegeName </th>)}
             <th style={{textAlign:"center"}}>TestName </th>
              <th style={{textAlign:"center"}}>View Result</th>
              
             </tr>
          </thead>
          <tbody>
           {sortedData.map((item, idx) => (
              <tr key={idx}>
                  {userRole !== "Placement Officer" && ( <td style={{textAlign:"center"}}>{item.college_id}</td>
                  )}
                 <td style={{textAlign:"center"}}>{item.test_name}</td>
                
                <td style={{textAlign:"center",textDecoration:"underline",cursor:"pointer"}}  onClick={() =>
          handleViewResult(item.test_name, item.collegeId, department, year)
        }>{item.attended_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     
      
       <div className='dis-page' style={{ marginTop: '10%' }}>
                          {/* Custom Pagination */}
                          <CustomPagination
                              totalPages={totalPages}
                              currentPage={currentPage}
                             onPageChange={setCurrentPage}
                              maxVisiblePages={3} // Limit to 3 visible pages
                          />
                      </div>
    </div>
  );
};

export default PracticeTestReport;
