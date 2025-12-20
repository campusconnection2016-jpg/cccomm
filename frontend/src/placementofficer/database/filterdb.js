import React, { useState, useEffect } from 'react';
import {
    getfiltered_StudentsAPI, getdepartmentApi,
    get_department_info_API,
    get_Batches_API,
    getClg_Group_API, getcollegeApi
} from '../../api/endpoints'; // Assuming your API call is in a separate file
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Select from 'react-select';
import CustomOption from '../test/customoption';
import { Container, Card, Col, Row, Form, Button } from 'react-bootstrap';
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

            width: '110%'
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
            width: '110%'
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
const FilterCandidatesDownload = ({ collegeName, institute }) => {
    const [collegeId, setCollegeId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [collegeOptions, setCollegeOptions] = useState([]); // Add state for colleges
    const [year, setYear] = useState('');
    const [marks10th, setMarks10th] = useState('');
    const [marks12th, setMarks12th] = useState('');
    const [cgpaScore, setCgpaScore] = useState('');
    const [standingArrears, setStandingArrears] = useState('');
    const [historyOfArrears, setHistoryOfArrears] = useState('');
    const [noOfOffers, setNoOfOffers] = useState('');
    const [gender, setGender] = useState('');
    const [skillOptions, setSkillOptions] = useState([]);
    const [departmentIds, setDepartmentIds] = useState([]);

    const [collegeGroups, setCollegeGroups] = useState([]);
    useEffect(() => {
        if (collegeName) {
            getcollegeApi()
                .then(data => {
                    setCollegeOptions(data); // Store all college data
                    const college = data.find(item => item.college === collegeName);
                    if (college) {
                        setCollegeId(Number(college.id));
                    }
                })
                .catch(error => console.error('Error fetching College:', error));
        }

    }, [collegeName]);
    useEffect(() => {
        const fetchCollegeData = async () => {
            try {
                if (!collegeName) {
                    console.warn('⚠️ College name is empty.');
                    return;
                }

                // Fetch college groups for the selected college
                const groupData = await getClg_Group_API(collegeName);
                console.log('📄 College Group API Response:', groupData);

                // Ensure response has college_code
                const formattedGroups = groupData.map(item => ({
                    value: item.id,
                    label: item.college_group,
                    collegeId: collegeName,
                    collegeCode: item.college_code, // Ensure we get college_code
                }));

                console.log('✅ Formatted Groups:', formattedGroups);
                setCollegeGroups(formattedGroups);

                // Fetch batches for the selected college

            } catch (error) {
                console.error('❌ Error fetching college data:', error);
            }
        };

        fetchCollegeData();
    }, []);

    useEffect(() => {
        getcollegeApi()
            .then(data => {
                const matchedCollege = data.find(item => item.college === collegeName.trim());
                if (matchedCollege) {
                    setCollegeId([matchedCollege.id]); // Make sure collegeId is set as an array
                    console.log('Matched College ID:', matchedCollege.id);

                    // Fetch departments for the matched college
                    get_department_info_API([institute])
                        .then(departmentData => {
                            const departmentOptions = departmentData.map(item => ({
                                value: item.department_id_value,
                                label: item.department_name_value,
                            }));
                            setDepartmentOptions([{ value: 'all', label: 'All' }, ...departmentOptions]);
                        })
                        .catch(error => console.error('Error fetching departments:', error));
                } else {
                    console.error('College name not found in fetched data');
                }
            })
            .catch(error => console.error('Error fetching colleges:', error));
    }, [collegeName]);


    const handleDownload = async (event) => {
        event.preventDefault();
      const tenth = Number(marks10th) || 0;
    const twelfth = Number(marks12th) || 0;

    // ✅ Allow if empty or 0, block only if filled (< 35)
    if ((marks10th && tenth < 35) || (marks12th && twelfth < 35)) {
        alert("❌ Download not allowed. 10th and 12th marks must each be at least 35 if provided.");
        return;
    }
        try {
            console.log('Starting download process...');
            console.log('Current filter values:');
            console.log('College ID:', collegeId);
            console.log('Department IDs:', departmentIds);
            console.log('Year:', year);
            console.log('Marks (10th):', marks10th);
            console.log('Marks (12th):', marks12th);
            console.log('CGPA:', cgpaScore);
            console.log('Standing Arrears:', standingArrears);
            console.log('History of Arrears:', historyOfArrears);
            console.log('Number of Offers:', noOfOffers);
            console.log('Gender:', gender);

            let allData = [];

            if (departmentIds.includes("all") || departmentIds.length === 0) {
                // ✅ Case 1: All departments
                const data = await getfiltered_StudentsAPI(
                    Number(collegeId),
                    "", // all
                    year,
                    marks10th,
                    marks12th,
                    cgpaScore,
                    standingArrears,
                    historyOfArrears,
                    noOfOffers,
                    gender
                );
                allData = data;
            } else if (departmentIds.length === 1) {
                // ✅ Case 2: Single department
                const data = await getfiltered_StudentsAPI(
                    Number(collegeId),
                    String(departmentIds[0]), // just one id
                    year,
                    marks10th,
                    marks12th,
                    cgpaScore,
                    standingArrears,
                    historyOfArrears,
                    noOfOffers,
                    gender
                );
                allData = data;
            } else {
                // ✅ Case 3: Multiple departments → fetch separately and merge
                for (const deptId of departmentIds) {
                    const data = await getfiltered_StudentsAPI(
                        Number(collegeId),
                        String(deptId), // call API with single department id
                        year,
                        marks10th,
                        marks12th,
                        cgpaScore,
                        standingArrears,
                        historyOfArrears,
                        noOfOffers,
                        gender
                    );
                    allData = [...allData, ...data];
                }
            }

            const collegeNameMap = collegeOptions.reduce((acc, item) => {
                acc[item.id] = item.college;
                return acc;
            }, {});

            const departmentNameMap = departmentOptions.reduce((acc, item) => {
                acc[item.value] = item.label;
                return acc;
            }, {});

            const updatedData = allData.map((item) => ({
                ...item,
                college_name: collegeNameMap[item.college_id] || "Unknown",
                department_name: departmentNameMap[item.department_id] || "Unknown",
            }));

            const finalData = updatedData.map(
                ({ college_id, department_id, id, skill_id, ...rest }) => rest
            );

            console.log("Filtered student data received from API:", finalData);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Filtered Candidates");

            // Set up columns
            const columns = Object.keys(finalData[0] || {}).map((key) => ({
                header: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                key: key,
                width: 20,
            }));
            worksheet.columns = columns;

            // Add rows
            finalData.forEach((row) => {
                worksheet.addRow(row);
            });

            // Style header row
            worksheet.getRow(1).font = { bold: true };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(blob, "filtered_candidates.xlsx");
            console.log("Download completed.");
        } catch (error) {
            console.error("Error fetching and downloading data:", error);
        }
    };

    return (
        <div className='form-ques-eligible'>
            <h6>Download Eligible Students</h6>
            <form >
                <Row md={12}>
                    <Col>
                        {/*} <div controlId='department'>
                            <label className='label6-ques'>Department</label><p></p>
                            <Select
                                options={departmentOptions}
                                onChange={handleDepartmentChange}
                                placeholder="Select department"
                                styles={customStyles} // Define custom styles if needed
                            />
                        </div>*/}
                        <Col>
                        <div className='department-student' >
                            <label className='label6-ques'>Department**</label><p></p>
                            <Select
                                options={departmentOptions}
                                isMulti
                                onChange={(selectedOptions) => {
                                    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                    setDepartmentIds(selectedIds);
                                }}
                                components={{ Option: CustomOption }}
                                closeMenuOnSelect={false}
                                placeholder="Select departments"
                                styles={customStyles} // Define custom styles if needed
                            /></div>
                        </Col>

                    </Col>
                    <Col>
                        <label className='label5-ques'>Year**</label><p></p>
                        <select
                            className='input-ques'
                            value={year}
                            onChange={(e) => {
                                console.log('Year selected:', e.target.value);
                                setYear(e.target.value);
                            }}
                        >
                            <option value="">Select Year</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </Col>

                    <Col>
                        <label className='label5-ques'>Gender</label><p></p>
                        <select
                            className='input-ques'
                            value={gender}
                            onChange={(e) => {
                                console.log('Gender input changed:', e.target.value);
                                setGender(e.target.value);
                            }}
                        >
                            <option value="">Select Gender</option>
                            <option value="Both">Both</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </Col>
                </Row><p></p>
                <Row md={12}>
                    <Col>
                        <label className='label5-ques'>Marks (10th)</label><p></p>
                        <input
                            type="number"
                            className='input-ques'
                            max='100'
                            min='35'

                            value={marks10th}
                            onChange={(e) => {
                                console.log('Marks (10th) input changed:', e.target.value);
                                setMarks10th(e.target.value);
                                let value = Number(e.target.value);
                                if (value >= 35 && value <= 100) {
                                    setMarks10th(value);
                                }
                            }}
                        />
                        {(marks10th < 35 || marks10th > 100) && <small style={{ color: 'orange' }}>Marks must be between 35 and 100</small>}

                    </Col>
                    <Col>
                        <label className='label5-ques'>Marks (12th)</label><p></p>
                        <input
                            type="number"
                            className='input-ques'
                            max='100'
                            min='35'
                            value={marks12th}
                            onChange={(e) => {
                                console.log('Marks (12th) input changed:', e.target.value);
                                setMarks12th(e.target.value);
                                let value = Number(e.target.value);
                                if (value >= 35 && value <= 100) {
                                    setMarks12th(value);
                                }
                            }}
                        />
                        {(marks12th < 35 || marks12th > 100) && <small style={{ color: 'orange' }}>Marks must be between 35 and 100</small>}
                    </Col>
                    <Col>
                        <label className='label5-ques'>CGPA</label><p></p>
                        <input
                            type="number"
                            step="0.01"
                            max='10'
                            min='0'
                            className='input-ques'
                            value={cgpaScore}
                            onChange={(e) => {
                                console.log('CGPA input changed:', e.target.value);
                                setCgpaScore(e.target.value);
                                let value = parseFloat(e.target.value);
                                if (value >= 0 && value <= 10) {
                                    setCgpaScore(value);
                                }
                            }}
                        />
                        {(cgpaScore > 10 || cgpaScore < 0) && <small style={{ color: 'orange' }}>CGPA must be between 0 and 10</small>}

                    </Col>
                </Row><p></p>
                <Row>
                    <Col>
                        <label className='label5-ques'>Standing Arrears</label><p></p>
                        <input
                            type="number"
                            className='input-ques'
                            value={standingArrears}
                            min='0'
                            max='100'
                            onChange={(e) => {
                                console.log('Standing Arrears input changed:', e.target.value);
                                setStandingArrears(e.target.value);
                                let value = Number(e.target.value);
                                if (value >= 0) {
                                    setStandingArrears(value);
                                }
                            }}
                        />
                    </Col>
                    <Col>
                        <label className='label5-ques'>History of Arrears</label><p></p>
                        <input
                            type="number"
                            className='input-ques'
                            value={historyOfArrears}
                            min='0'
                            max='100'
                            onChange={(e) => {
                                console.log('History of Arrears input changed:', e.target.value);
                                setHistoryOfArrears(e.target.value);
                                let value = Number(e.target.value);
                                if (value >= 0) {
                                    setHistoryOfArrears(value);
                                }
                            }}
                        />
                    </Col>
                    <Col>
                        <label className='label5-ques'>Number of Offers</label><p></p>
                        <input
                            type="number"
                            className='input-ques'
                            value={noOfOffers}
                            min='0'
                            max='100'
                            onChange={(e) => {
                                console.log('Number of Offers input changed:', e.target.value);
                                setNoOfOffers(e.target.value);
                                let value = Number(e.target.value);
                                if (value >= 0) {
                                    setNoOfOffers(value);
                                }
                            }}
                        />
                    </Col>
                </Row><p></p>
                <button
                    className='button-ques-save'
                    type="button" // Change to "button" to prevent form submission
                    onClick={handleDownload}
                    style={{ width: "100px" }}
                >
                    Download
                </button>
            </form>
        </div>
    );
};

export default FilterCandidatesDownload;
