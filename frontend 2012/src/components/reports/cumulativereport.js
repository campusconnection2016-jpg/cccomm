import React, { useState, useEffect } from "react";
import Select from "react-select"; // Ensure you have react-select installed
import {
    getCollegeList_Concat_API,
    get_department_info_cumula_API,
    downloadTestReports,get_user_colleges_API,
    exportAudioExcelReport,
    getBatchnumberClgID_API, 
} from "../../api/endpoints";
import { Col, Row } from "react-bootstrap";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "react-datetime/css/react-datetime.css";
import CustomOption from "../test/customoption";


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

const chartTypeOptions = [
    { value: "bar", label: "Bar Chart" },
    { value: "clustered", label: "Clustered Bar Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "line", label: "Line Chart" },

];

const roleOptions = [
    { value: "all", label: "All" },
    { value: "super_admin", label: "Super Admin" },
    { value: "placement_officer", label: "Placement Officer" },
];
const CumulativeReport = ({ collegeName, institute, username,userRole }) => {
    const [collegeList, setCollegeList] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [selectedChartType, setSelectedChartType] = useState(chartTypeOptions[0]);
    const [departmentList, setDepartmentList] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [isCollegeDisabled, setIsCollegeDisabled] = useState(false);
   // const [userRole, setUserRole] = useState("");
    const [selectedRole, setSelectedRole] = useState(roleOptions[0]);
    const [isInactive, setIsInactive] = useState(false);
    console.log("college", collegeName, institute, username,userRole)

    const [triggerFetch, setTriggerFetch] = useState(true);
    
    // Options for the select dropdown
    const questionType = [
        { value: "All", label: "All" },
        { value: "Aptitude", label: "Aptitude" },
        { value: "Softskills", label: "Softskills" },
        { value: "Technical", label: "Technical" },
    ];

    const [selectedQuestionType, setSelectedQuestionType] = useState([]);
    const [batchNumbers, setBatchNumbers] = useState([]);
    const [selectedBatchNo, setSelectedBatchNo] = useState([]);
const [displayDepartments, setDisplayDepartments] = useState([]);
// yearOptions statically:
const yearOptions = [
  { value: 'all', label: 'All Years' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

  

    const [selectedYear, setSelectedYear] = useState([]);
    //const [startDate, setStartDate] = useState("");
   // const [endDate, setEndDate] = useState("");
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        if (triggerFetch) {
            getCollegeList_Concat_API()
                .then((data) => {
                    // Map the API response to the required format
                    const options = data.map((college) => ({
                        value: college.id,
                        label: college.college_group_concat,
                    }));

                    // Prepend the default option
                    const defaultOption = {
                        value: '',
                        label: 'College - College Group',
                    };

                    setCollegeList([defaultOption, ...options]); // Add default option at the beginning
                    // setSelectedCollege(defaultOption); // Set the default option as the initial value

                    // ✅ Only reset trigger after successful data fetch
                    setTriggerFetch(false);
                })
                .catch((error) => console.error("Error fetching college list:", error));
        }
    }, [triggerFetch]);

  useEffect(() => {
    console.log("Initializing user data from props...");
    console.log("Passed Props - Username:", username, "UserRole:", userRole);

    if (userRole === "Placement Officer") {
        console.log("Role: Placement Officer - Selecting college and disabling dropdown.");
        setSelectedCollege({
            value: institute,
            label: collegeName
        });
        setIsCollegeDisabled(true);

    } else if (userRole === "Super admin"|| userRole === "Placement admin") {
        console.log("Role: Super Admin - Allowing college selection.");
        setSelectedCollege(null);
        setIsCollegeDisabled(false);

        getCollegeList_Concat_API()
            .then((data) => {
                const options = data.map((college) => ({
                    value: college.id,
                    label: college.college_group_concat
                }));
                const defaultOption = { value: "", label: "College - College Group" };
                setCollegeList([defaultOption, ...options]);
            })
            .catch((error) => console.error("Error fetching college list:", error));

    } else if (userRole === "Training admin") {
        console.log(`Role: ${userRole} - Fetching allowed colleges via get_user_colleges_API`);

   get_user_colleges_API(username)
    .then((userData) => {
        const allowedCollegeIds = userData.college_ids; // could be strings or numbers
        console.log("Allowed college IDs:", allowedCollegeIds);

        getCollegeList_Concat_API()
            .then((allColleges) => {
                const allowedColleges = allColleges
                    .filter(college => allowedCollegeIds.map(String).includes(String(college.id)))
                    .map(college => ({
                        value: college.id,
                        label: college.college_group_concat
                    }));
                setCollegeList(allowedColleges);
                setSelectedCollege(allowedColleges[0] || null);
                setIsCollegeDisabled(false);
                console.log("Allowed colleges with names:", allowedColleges);
            })
            .catch((error) => console.error("Error fetching all colleges:", error));
    })
    .catch((error) => console.error("Error fetching allowed colleges:", error));
    }
}, [username, userRole, institute, collegeName]);

 
    useEffect(() => {
  if (selectedCollege) {
    const collegeIds = Array.isArray(selectedCollege.value)
      ? selectedCollege.value
      : [selectedCollege.value];

    // departments
    get_department_info_cumula_API(collegeIds)
      .then((data) => {
        if (!Array.isArray(data)) {
          setDepartmentList([]);
          return;
        }

        const options = [
  { value: 'all', label: 'All Departments' },
  ...data.map((dept) => ({
    value: dept.department_id__id,
    label: dept.department_id__department
  }))
];
setDepartmentList(options);

      })
      .catch(() => setDepartmentList([]));

    // batches
    getBatchnumberClgID_API(selectedCollege.value)
      .then((batches) => {
        const batchOptions = [
          { value: 'all', label: 'All Batches' },
          ...batches.batch_numbers.map((batch) => ({
            label: batch,
            value: batch
          }))
        ];
        setBatchNumbers(batchOptions);
      })
      .catch(() => setBatchNumbers([]));
  }
}, [selectedCollege]);

    const handleDownloadold = () => {
        if (!selectedCollege) {
            alert("Please select a college.");
            return;
        }

           const questionTypes = selectedQuestionType?.map(qs => qs.value).join(",") || null;
const departmentIds =
  selectedDepartments.length === departmentList.length
    ? 'all'
    : selectedDepartments.map(dept => dept.value).join(',');

const batchNos =
  selectedBatchNo.length === batchNumbers.length
    ? 'all'
    : selectedBatchNo.map(bt => bt.value).join(',');

const years =
  selectedYear.length === yearOptions.length - 1 // minus All option
    ? 'all'
    : selectedYear.map(yr => yr.value).join(',');

        // Ensure startDate and endDate are valid and format them
        const startDateFormatted = startDate instanceof Date ? startDate.toISOString().split("T")[0] : null;
        const endDateFormatted = endDate instanceof Date ? endDate.toISOString().split("T")[0] : null;

        console.log({
            year: years,
            startDate: startDateFormatted,
            endDate: endDateFormatted,
           questionTypes,
            createdByRole: selectedRole.value,
            batchNos, // Log batch numbers
            inactive: isInactive,
        });

        downloadTestReports(selectedCollege.value, batchNos, departmentIds, years, startDateFormatted, endDateFormatted, questionTypes, selectedRole.value, selectedChartType.value, isInactive);
    };

const handleDownload = () => {
  if (!selectedCollege) {
    alert("Please select a college.");
    return;
  }

  const departmentIds =
    selectedDepartments.length === departmentList.length
      ? 'all'
      : selectedDepartments.map(dept => dept.value).join(',');

  const batchNos =
    selectedBatchNo.length === batchNumbers.length
      ? 'all'
      : selectedBatchNo.map(bt => bt.value).join(',');

  const years =
    selectedYear.length === yearOptions.length - 1
      ? 'all'
      : selectedYear.map(yr => yr.value).join(',');

  const startDateFormatted = startDate instanceof Date ? startDate.toISOString().split("T")[0] : null;
  const endDateFormatted = endDate instanceof Date ? endDate.toISOString().split("T")[0] : null;

  const payload = {
    college_id: selectedCollege?.value || null,
    batchNos,
    departmentIds,
    years,
    startDate: startDateFormatted,
    endDate: endDateFormatted,
    chartType: selectedChartType?.value || null,
  };

  exportAudioExcelReport(payload)
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audio_report.xlsx'); // name the file
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((err) => {
      console.error("Download error:", err);
      alert("Failed to download report.");
    });
};


    return (
        <div style={{ height: "auto" }}>


            <div className="form-ques" style={{ height: "auto" }}>
                <h6>Cumulative Reports</h6><p></p>
                <Row>
                    <Col>
                        <label className="label-ques5">College**</label><p></p>
                        <Select
  options={collegeList}
  value={selectedCollege}
  onChange={(college) => {
    console.log("College Selected:", college);
    // Only set if a valid college is selected
    if (college && college.value !== '') {
      setSelectedCollege(college);
    } else {
      setSelectedCollege(null);
      setDepartmentList([]);
      setBatchNumbers([]);
    }
  }}
  placeholder="Select College"
  styles={customStyles}
  isDisabled={isCollegeDisabled}
/>

                    </Col>
                    <Col>
                        <label className="label-ques5">Batch</label><p></p>
                       <Select
  options={batchNumbers}
  value={selectedBatchNo || []} // ensure array
  onChange={(bt) => setSelectedBatchNo(bt || [])} // always array
  placeholder="Select Batches"
  styles={customStyles}
  components={{ Option: CustomOption }}
  closeMenuOnSelect={false}
  isMulti
/>
</Col>
                    <Col>
                        <label className="label-ques5">Department</label><p></p>
 <Select
  options={departmentList}
  value={displayDepartments || []} // MUST be an array
  onChange={(selected) => {
    if (selected && selected.some(opt => opt.value === 'all')) {
      const realDepartments = departmentList.filter(opt => opt.value !== 'all');
      setSelectedDepartments(realDepartments); // send real IDs to backend
      setDisplayDepartments([{ value: 'all', label: 'All Departments' }]); // show one chip
    } else {
      setSelectedDepartments(selected || []); // always array
      setDisplayDepartments(selected || []);
    }
  }}
  placeholder="Select Department(s)"
  styles={customStyles}
  isMulti
/>



                    </Col>

                </Row>
                <p></p>
                <p></p>

                <Row>
                    <Col>
                        <label className="label-ques5">Year</label><p></p>
                      
<Select
  options={yearOptions}
  value={selectedYear || []} // ensure array
  onChange={(selected) => {
    if (selected && selected.some(opt => opt.value === 'all')) {
      setSelectedYear(yearOptions.filter(opt => opt.value !== 'all'));
    } else {
      setSelectedYear(selected || []);
    }
  }}
  styles={customStyles}
  isMulti
/>

                    </Col>
                    <Col>
                        <label className="label-ques5">StartDate</label><p></p>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select Start Date"
                            className='input-date-custom-cum'
                            styles={customStyles}
                        />

                    </Col>
                    <Col>
                        <label className="label-ques5">EndDate</label><p></p>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select End Date"
                            className='input-date-custom-cum'
                            styles={customStyles}
                        />
                    </Col>

                </Row>

                <p></p>
              {/*}  <Row>
                    <Col>
                        <label className="label-ques5">Skills</label><p></p>
                        <Select
                            options={questionType} // Options to display
                            value={selectedQuestionType} // Selected value(s)
                            onChange={(selected) => setSelectedQuestionType(selected)} // Update state on change
                            placeholder="Select Skill" // Placeholder text
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            closeMenuOnSelect={false}
                            isMulti // Enable multi-select
                        />
                    </Col>

                    <Col>
                        <label className="label-ques5">Assigned Role</label><p></p>
                        <Select
                            options={roleOptions}
                            value={selectedRole}
                            onChange={(role) => setSelectedRole(role)}
                            placeholder="Select Role"

                            styles={customStyles}
                        />
                    </Col>
                    <Col>
                        <label className="label-ques5">Chart Type</label><p></p>
                        <Select
                            options={chartTypeOptions}
                            value={selectedChartType}
                            onChange={(chart) => setSelectedChartType(chart)}
                            placeholder="Select Chart Type"
                            styles={customStyles}
                            style={{ marginLeft: "20px" }}
                        // styles={customStyles}
                        /></Col>

                </Row><p></p>
                <Row>
                    <Col>
                        <label className="label-ques5">Include Inactive</label><p></p>
                        <p></p>
                        <input
                            type="checkbox"
                            checked={isInactive}
                            onChange={(e) => setIsInactive(e.target.checked)}
                        />
                    </Col>
                    <Col></Col>
                    <Col>
                    </Col>
                </Row>*/}
                <Row className="center-button-container">
                    <Col xs="auto">
                        <button onClick={handleDownload} className="downloads-button">
                            Download
                        </button>
                    </Col>
                </Row>


            </div>
        </div>
    );
};

export default CumulativeReport;
