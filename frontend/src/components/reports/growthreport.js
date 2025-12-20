import React, { useState, useEffect } from "react";
import Select from "react-select"; // Ensure you have react-select installed
import {
    getCollegeList_Concat_API,
    get_department_info_cumula_API,
    get_user_colleges_API,
    getBatchnumberClgID_API, getLoginApi, downloadTestReportsMonthwise
} from "../../api/endpoints";
import { Col, Row } from "react-bootstrap";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "react-datetime/css/react-datetime.css";
import CustomOption from "../test/customoption";


import { setYear, getYear } from "date-fns";

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
const GrowthReport = ({ collegeName, institute, username ,userRole}) => {
    const [collegeList, setCollegeList] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [selectedChartType, setSelectedChartType] = useState(chartTypeOptions[0]);
    const [departmentList, setDepartmentList] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [isCollegeDisabled, setIsCollegeDisabled] = useState(false);
   // const [userRole, setUserRole] = useState("");
    const [selectedRole, setSelectedRole] = useState(roleOptions[0]);
    const [selectedReportYear, setSelectedReportYear] = useState(null); // Store selected year

    const [triggerFetch, setTriggerFetch] = useState(true);
    console.log("college", collegeName, institute, username)
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

    const yearOptions = [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
    ];

    const [selectedYear, setSelectedYear] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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
   
       } else if (userRole === "Training admin" ) {
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
            console.log("Fetching departments for College ID:", selectedCollege.value);

            // Convert to an array if needed
            const collegeIds = Array.isArray(selectedCollege.value) ? selectedCollege.value : [selectedCollege.value];

            get_department_info_cumula_API(collegeIds)
                .then((data) => {
                    console.log("Raw API Response:", data); // ✅ Debugging

                    if (!Array.isArray(data)) {
                        console.error("API response is not an array:", data);
                        setDepartmentList([]); // Prevent errors
                        return;
                    }

                    const options = data.map((dept) => ({
                        value: dept.department_id__id,
                        label: dept.department_id__department
                    }));

                    console.log("Formatted Department Options:", options); // ✅ Debugging

                    setDepartmentList(options);
                })
                .catch((error) => {
                    console.error("Error fetching departments:", error);
                    setDepartmentList([]);
                });



            getBatchnumberClgID_API(selectedCollege.value)
                .then((batches) => {
                    console.log('Batch Numbers:', batches);

                    // Map the response to the format expected by react-select
                    const options = batches.batch_numbers.map((batch) => ({
                        label: batch,
                        value: batch,
                    }));
                    setBatchNumbers(options);


                    // Map the response to the format expected by react-select
                    // const options = [
                    //     { label: "All", value: "all" }, // Add the "All" option
                    //     ...batches.batch_numbers.map((batch) => ({
                    //         label: batch,
                    //         value: batch,
                    //     })),
                    // ];


                })
                .catch((error) => {
                    console.error('Error fetching batch numbers:', error);
                });
        }
    }, [selectedCollege]);

    const handleDownloadmonthwise = () => {
        if (!selectedCollege) {
            alert("Please select a college.");
            return;
        }

        // Extract optional parameters safely
        const departmentIds = selectedDepartments?.map(dept => dept.value).join(",") || null;
        const questionTypes = selectedQuestionType?.map(qs => qs.value).join(",") || null;
        const batchNos = selectedBatchNo?.map(bt => bt.value).join(",") || null;
        const years = selectedYear?.map(yr => yr.value).join(",") || null;
        const reportYear = selectedReportYear ? getYear(selectedReportYear) : null; // Extract year

        console.log({
            year: years,
            reportYear, // Log report year
            questionTypes,
            createdByRole: selectedRole.value,
            batchNos,
        });

        // Pass reportYear to API
        downloadTestReportsMonthwise(
            selectedCollege.value, batchNos, departmentIds, years, reportYear, questionTypes, selectedRole.value, selectedChartType.value
        );
    };

    return (
        <div style={{ height: "auto" }}>


            <div className="form-ques" style={{ height: "auto" }}>
                <h6>Growth Reports</h6><p></p>
                <Row>
                    <Col>
                        <label className="label-ques5">College**</label><p></p>
                        <Select
                            options={collegeList}
                            value={selectedCollege}
                            onChange={(college) => {
                                console.log("College Selected:", college);
                                setSelectedCollege(college);
                            }}
                            placeholder="Select College"
                            styles={customStyles}
                            isDisabled={isCollegeDisabled} // Enable only for Super Admin
                        />
                    </Col>
                    <Col>
                        <label className="label-ques5">Batch</label><p></p>
                        <Select
                            options={batchNumbers}
                            value={selectedBatchNo}
                            onChange={(bt) => setSelectedBatchNo(bt)}
                            placeholder="Select Batches"
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            closeMenuOnSelect={false}
                            isMulti // Allows selecting multiple batches
                        /></Col>
                    <Col>
                        <label className="label-ques5">Department</label><p></p>
                        <Select
                            options={departmentList}
                            value={selectedDepartments}
                            onChange={setSelectedDepartments}
                            placeholder="Select Department(s)"
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            closeMenuOnSelect={false}
                            isMulti // Enable multi-selection
                        />
                    </Col>

                </Row>
                <p></p>
                <p></p>

                <Row>
                    <Col>
                        <label className="label-ques5">Student Year</label><p></p>
                        <Select
                            options={yearOptions}
                            value={selectedYear}
                            onChange={(selected) => setSelectedYear(selected)}
                            placeholder="Select Year"
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            closeMenuOnSelect={false}
                            isMulti
                        />
                    </Col>
                    <Col>
                        <label className="label-ques5">Report Year**</label>
                        <p></p>
                        <DatePicker
                            selected={selectedReportYear}
                            onChange={(date) => setSelectedReportYear(date)}
                            showYearPicker // Only allow year selection
                            dateFormat="yyyy" // Display year format
                            placeholderText="Select Year"
                            className="input-date-custom-cum"
                            styles={customStyles}
                        />
                    </Col>
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
                </Row>

                <p></p>
                <Row>


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

                    <Col></Col>
                    <Col></Col>
                </Row><p></p>
                <Row className="center-button-container">
                    <Col xs="auto">
                        <button onClick={handleDownloadmonthwise} className="downloads-button">
                            Download
                        </button>
                    </Col>
                </Row>


            </div>
        </div>
    );
};

export default GrowthReport;
