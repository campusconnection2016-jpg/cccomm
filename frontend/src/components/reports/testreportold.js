import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Pagination } from 'react-bootstrap';
import {

    get_test_name_group_API_TestReports,
   get_user_colleges_API,
    get_Departments_TestReports,
    get_Test_Names_TestReports,
    get_Colleges_TestReports
} from '../../api/endpoints';

import { Link } from 'react-router-dom';
import '../../styles/global.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { SearchContext } from '../../allsearch/searchcontext';
import UploadTestReport from './uploadtestReport';
import DatePicker from 'react-datepicker';

import CustomPagination from '../../api/custompagination';

const TestReports = ({ institute, userRole,username }) => {
    const [testCandidates, setTestCandidates] = useState([]);
    const [testCandidatesUnique, setTestCandidatesUnique] = useState([]);
    const [isUnique, setIsUnique] = useState(true);
    const [searchable, setSearchable] = useState('');
    const { searchQuery } = useContext(SearchContext);
    // const { collegeId } = useParams();
    const [testNameFilter, setTestNameFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [topicFilter, setTopicFilter] = useState("");
    const [collegeNameFilter, setCollegeNameFilter] = useState("");
    const [departments, setDepartments] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [testNames, setTestNames] = useState([]);
    // console.log("collegeId",institute)  ;
    // console.log("user_role",userRole)
    const [fromDateFilter, setFromDateFilter] = useState("");
    const [toDateFilter, setToDateFilter] = useState("");


    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages1, setTotalPages1] = useState(1);
    const [pageSize] = useState(10); // Items per page


    useEffect(() => {
        getTestCandidates();  // ✅ Fetch data when filters change
        getTestCandidatesFilter();
    }, [collegeNameFilter, departmentFilter, yearFilter, testNameFilter, fromDateFilter, toDateFilter]);



    // Fetch colleges when component mounts
    useEffect(() => {
        getTestCandidates(currentPage);
    }, [currentPage]);


    const handlePageChange1 = (page) => {
        setCurrentPage(page);
    };
const getTestCandidates = (page) => {
    console.log("➡️ STEP 1: getTestCandidates called");
    console.log("User Role:", userRole, "Username:", username);

    let collegeIdToSend = userRole === "Placement Officer" ? institute : null;
    let departmentIdToSend = departmentFilter || null;
    let yearToSend = yearFilter?.trim() || null;
    let testNameToSend = testNameFilter?.trim() || null;

    // Add 1 day to fromDateFilter
    let adjustedFromDate = fromDateFilter ? new Date(fromDateFilter) : null;
    if (adjustedFromDate) adjustedFromDate.setDate(adjustedFromDate.getDate() + 1);
    let fromDateToSend = adjustedFromDate ? adjustedFromDate.toISOString().split("T")[0] : null;
    let toDateToSend = toDateFilter ? toDateFilter.toISOString().split("T")[0] : null;

    // ✅ For Super Admin, get ID from selected college
    if (userRole === "Super admin" && collegeNameFilter) {
        let selectedCollege = colleges.find(college => college.college_id__college === collegeNameFilter);
        if (selectedCollege) {
            collegeIdToSend = selectedCollege.college_id__id || selectedCollege.college_id;
        }
    }

    console.log("➡️ STEP 2: Fetching test data from API");

    get_test_name_group_API_TestReports(
        collegeIdToSend || null,
        departmentIdToSend || null,
        yearToSend || null,
        testNameToSend || null,
        fromDateToSend || null,
        toDateToSend || null,
        page
    )
    .then((data) => {
        console.log("➡️ STEP 3: API Response:", data);

        if (userRole === "Training admin" || userRole === "Placement admin") {
            console.log("➡️ STEP 4: Filtering data for allowed colleges");

            // Get allowed college IDs for this user
           get_user_colleges_API(username)
  .then((userData) => {
      const allowedCollegeIds = userData.college_ids || [];
      console.log("➡️ STEP 5: Allowed college IDs:", allowedCollegeIds);

      // Convert types to match
      const filteredResults = data.results.filter(item =>
          allowedCollegeIds.map(Number).includes(Number(item.college_id))
      );

      setTestCandidates(filteredResults);
      setTotalPages1(Math.ceil(filteredResults.length / pageSize));
      console.log("➡️ STEP 6: ✅ Filtered Test Candidates count:", filteredResults.length);
  })
  .catch((error) => {
      console.error("❌ Error fetching allowed colleges:", error);
  });

        } else {
            // Other roles use full data
            setTestCandidates(data.results);
            setTotalPages1(Math.ceil(data.count / pageSize));
            console.log("➡️ STEP 4: ✅ Test Candidates count:", data.results.length);
        }
    })
    .catch((error) => {
        console.error("❌ Error fetching test candidates:", error);
    });
};


const getTestCandidatesFilter = () => {
    let collegeIdToSend = userRole === "Placement Officer" ? institute : null;
    let departmentIdToSend = null;
    let yearToSend = yearFilter?.trim() || null;
    let testNameToSend = testNameFilter?.trim() || null;

    // ✅ Super Admin college filter
    if (userRole === "Super admin" && collegeNameFilter) {
        let selectedCollege = colleges.find(college => college.college_id__college === collegeNameFilter);
        if (selectedCollege) {
            collegeIdToSend = selectedCollege.college_id__id || selectedCollege.college_id;
        }
    }

    if (departmentFilter) {
        departmentIdToSend = departmentFilter;
    }

    get_Colleges_TestReports(
        departmentIdToSend || null,
        yearToSend || null,
        testNameToSend || null
    )
    .then((data) => {
        setColleges(data);
    })
    .catch((error) =>
        console.error("Error fetching colleges:", error)
    );

    get_Departments_TestReports(
        collegeIdToSend || null,
        yearToSend || null,
        testNameToSend || null
    )
    .then((data) => {
        setDepartments(data);
    })
    .catch((error) =>
        console.error("Error fetching departments:", error)
    );

    get_Test_Names_TestReports(
        collegeIdToSend || null,
        yearToSend || null,
        departmentIdToSend || null
    )
    .then((data) => {
        setTestNames(data);
    })
    .catch((error) =>
        console.error("Error fetching test names:", error)
    );
};


    useEffect(() => {
        setCurrentPage(1); // Reset to first page on search
    }, [searchable, searchQuery, testNameFilter, departmentFilter, yearFilter, collegeNameFilter]);

    const uniqueCollegeNames = [...new Set(testCandidatesUnique.map((item) => item.college_name))];

    const uniqueTestNames = [...new Set(testCandidatesUnique.map((item) => item.test_name))];
    const uniqueDepartments = departments.map((dept) => dept.department);
 // ✅ Dynamically extract all unique years from current data
const uniqueYears = [...new Set(
    testCandidates.flatMap(item =>
        item.year
            ? item.year.split(",").map(y => y.trim())
            : []
    )
)].sort((a, b) => Number(a) - Number(b));


    // ✅ Ensure all options always appear in dropdowns



    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination values


    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = testCandidates.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(testCandidates.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);



    const refreshTestCandidates = () => {
        getTestCandidates(); // Fetch updated data
    };


const filteredData = testCandidates.filter(item => {
    // --- Date Filter ---
    const fromDate = fromDateFilter ? new Date(fromDateFilter.setHours(0, 0, 0, 0)) : null;
    const toDate = toDateFilter ? new Date(toDateFilter.setHours(23, 59, 59, 999)) : null;
    const testDateEnd = new Date(item.dtm_end);

    const isInDateRange =
        (!fromDate || testDateEnd >= fromDate) &&
        (!toDate || testDateEnd <= toDate);

    // --- Year Filter (final working fix) ---
    const itemYears = (item.year || "")
        .split(",")              // split by comma
        .map(y => y.trim())      // remove spaces
        .filter(y => y.length > 0); // ignore blanks

    const yearMatch =
        !yearFilter || itemYears.includes(yearFilter.trim()); // ✅ exact match ignoring spaces

    // --- Department Filter ---
    const departmentMatch =
        !departmentFilter ||
        item.department_name ===
            departments.find(d => d.department_id === departmentFilter)?.department_id__department;

    // --- College Filter ---
    const collegeMatch =
        !collegeNameFilter || item.college_name === collegeNameFilter;

    // --- Test Name Filter ---
    const testNameMatch =
        !testNameFilter || item.test_name === testNameFilter;

    // --- Combine all filters ---
    return (
        isInDateRange &&
        yearMatch &&
        departmentMatch &&
        testNameMatch &&
        collegeMatch &&
        (!searchQuery ||
            (item.test_name &&
                item.test_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.college_name &&
                item.college_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.department_name &&
                item.department_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.year &&
                item.year.toLowerCase().includes(searchQuery.toLowerCase())))
    );
});




 const exportToExcel = async () => {
    let allData = [];

    // ---- prepare all filters ----
    let collegeIdToSend = userRole === "Placement Officer" ? institute : null;
    let departmentIdToSend = departmentFilter || null;
    let yearToSend = yearFilter?.trim() || null;
    let testNameToSend = testNameFilter?.trim() || null;

    // Fix: resolve collegeIdToSend properly (same as getTestCandidates)
    if (userRole === "Super admin" && collegeNameFilter) {
        let selectedCollege = colleges.find(college => college.college_id__college === collegeNameFilter);
        if (selectedCollege) {
            collegeIdToSend = selectedCollege.college_id__id || selectedCollege.college_id;
        }
    }

    let fromDateToSend = fromDateFilter ? new Date(fromDateFilter).toISOString().split("T")[0] : null;
    let toDateToSend = toDateFilter ? new Date(toDateFilter).toISOString().split("T")[0] : null;

    // ---- fetch all pages ----
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const data = await get_test_name_group_API_TestReports(
            collegeIdToSend || null,
            departmentIdToSend || null,
            yearToSend || null,
            testNameToSend || null,
            fromDateToSend || null,
            toDateToSend || null,
            page
        );

        if (data?.results?.length > 0) {
            allData = [...allData, ...data.results];
            page++;
            hasMore = !!data.next;
        } else {
            hasMore = false;
        }
    }

    if (allData.length === 0) {
        alert("No data available to export for selected filters!");
        return;
    }

    // ---- export section ----
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Report");

    const transformedData = allData.map(item => ({
        "College": item.college_name,
        "Department": item.department_name,
        "Year": item.year,
        "Test Name": item.test_name,
        "Start Date": new Date(item.dtm_start).toLocaleDateString("en-GB"),
        "End Date": new Date(item.dtm_end).toLocaleDateString("en-GB"),
        "Total Assigned": item.student_count,
        "Total Attended": item.active_student_count
    }));

    worksheet.addRow(Object.keys(transformedData[0]));
    transformedData.forEach(row => worksheet.addRow(Object.values(row)));

    worksheet.columns.forEach(column => {
        let maxLength = 12;
        column.eachCell({ includeEmpty: true }, cell => {
            const valLength = (cell.value || "").toString().length;
            if (valLength > maxLength) maxLength = valLength;
        });
        column.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const testName = testNameFilter || "AllTests";
    const collegeName = collegeNameFilter || "AllColleges";
    const fileName = `${collegeName}_${testName}_Report.xlsx`;
    saveAs(blob, fileName);
};



    // Helper function to format date
    const formatDate = (date, format) => {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        if (!date) return "";
        const parsedDate = new Date(date);
        return parsedDate.toLocaleDateString("en-GB", options).replace(/\//g, "-");
    };




    return (
        <div className="placement-container-t">


            <div className="product-container-t">
               
                {userRole === "Super admin" && (
                    <>
                        <UploadTestReport onUploadSuccess={refreshTestCandidates} />
                        <p></p>
                    </>
                )}

                <div className='upload-repo'
                    style={{ display: 'flex', borderRadius: '8px', border: '1px solid', width: 'fit-content' }}>

                    <div className="date-filters">
                        <div className="date-picker-container">
                            <div style={{ marginRight: "10px" }}></div>
                            <label style={{ marginRight: "10px" }}>From Date:</label>
                            <DatePicker
                                name="from_date"
                                selected={fromDateFilter}
                                onChange={(date) => {
                                    if (date) {
                                        // Only set the date if it's not null
                                        const startOfDay = new Date(date.setHours(0, 0, 0, 0)); // Set to start of day
                                        setFromDateFilter(startOfDay);
                                    } else {
                                        // Handle the case when the date is cleared
                                        setFromDateFilter(null);
                                    }
                                }}
                                dateFormat="dd-MM-yyyy"
                                className="input-date-custom-rep"
                            />



                            <label style={{ marginRight: "10px" }}>To Date:</label>

                            <DatePicker
                                name='to_date'
                                selected={toDateFilter}
                                onChange={(date) => {
                                    if (date) {
                                        const endOfDay = new Date(date.setHours(23, 59, 59, 999)); // Set to end of day
                                        setToDateFilter(endOfDay);
                                    } else {
                                        // Handle the case when the date is cleared
                                        setToDateFilter(null);
                                    }
                                }}
                                dateFormat="dd-MM-yyyy"
                                className='input-date-custom-rep'
                            />

                            <button onClick={exportToExcel} className="button-ques-save-down-re" >Download</button>
                        </div>
                    </div>
                </div>

                <div className="po-table-responsive-t-Reports">
                    <table className="placement-table-t" >

                        <thead  style={{ textAlign: "center" }}>
                            <tr>
                                {userRole !== "Placement Officer" && (
                                    <th style={{ textAlign: "center" }}>CollegeName
                                    </th>)}
                                <th style={{ width: "200px", textAlign: "center" }}>
                                    Test Name

                                </th>
                                <th style={{ textAlign: "center" }}>
                                    Department Name

                                </th>
                                <th style={{ textAlign: "center" }}>
                                    Year

                                </th>


                                <th style={{ textAlign: "center" }}>Total Students</th>
                            </tr>
                            <tr>
                               {(userRole === "Super admin"|| userRole === "Training admin" ) && (
    <th style={{ textAlign: "center" }}>
        <select
            className="dropdown-custom college-name-dropdown"
            value={collegeNameFilter}
            onChange={(e) => setCollegeNameFilter(e.target.value)}
        >
            <option value="">All</option>
            {colleges.map((name) => (
                <option key={name.id} value={name.college_id__college}>
                    {name.college_id__college}
                </option>
            ))}
        </select>
    </th>
)}

                                <th style={{ textAlign: "center" }}>

                                    <select className="dropdown-custom college-name-dropdown" value={testNameFilter} onChange={(e) => setTestNameFilter(e.target.value)}>
                                        <option value="">All</option>

                                        {testNames.map((test) => (
                                            <option key={test.test_name} value={test.test_name}>
                                                {test.test_name}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                                <th style={{ textAlign: "center" }}>
                                    <select
                                        className="dropdown-custom"
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.department_id}>
                                                {dept.department_id__department}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                                <th style={{ textAlign: "center" }}>
                                   <select
  className="dropdown-custom"
  value={yearFilter}
  onChange={(e) => setYearFilter(e.target.value)}
>
  <option value="">All</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
</select>

                                </th>

                                <th style={{ textAlign: "center" }}></th>

                            </tr>

                        </thead>

                        <tbody  >
                            {testCandidates
                                .map((item) => (
                                    <tr key={item.id} className="table-row">
                                        {userRole !== "Placement Officer" && (<td style={{ textAlign: "center" }}>{item.college_name}</td>)}
                                        <td style={{ textAlign: "center" }}>{item.test_name}</td>

                                        <td style={{ textAlign: "center" }}>{item.department_name}</td>
                                        <td style={{ textAlign: "center" }}>
                                            {item.year?.replace(/^,/, "")}
                                        </td>



                                        <td style={{ textAlign: 'center' }}>
                                            <Link
                                                to={userRole === "Placement Officer" ? `/test-result/placement/?test_name=${encodeURIComponent(item.test_name)}&college_id=${encodeURIComponent(item.college_name)}&department_id=${encodeURIComponent(item.department_name || "All")}&year=${encodeURIComponent(item.year)}` :
                                                    `/test-result/top/?test_name=${encodeURIComponent(item.test_name)}&college_id=${encodeURIComponent(item.college_name)}&department_id=${encodeURIComponent(item.department_name)}&year=${encodeURIComponent(item.year)}`}
                                                style={{ color: "white" }}
                                            >      {item.active_student_count}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <p ></p>




                <div className='dis-page pagi12' style={{ marginTop: '50px' }}>
                    {/* Custom Pagination */}
                    <CustomPagination
                        totalPages={totalPages1}
                        currentPage={currentPage}
                        onPageChange={handlePageChange1}
                        maxVisiblePages={3} // Limit to 3 visible pages
                    />
                </div>

            </div>
        </div>
    );
};

export default TestReports;

