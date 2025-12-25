import React, { useEffect, useState } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
//import './uploadstudent.css'
import { getcollegeApi, getdepartmentApi, addcandidateApi, getSkillApi, addLoginApi, addLogin_Profile_API ,
    getcollege_Test_Api,
  getCollegeList_Concat_API,
  get_user_colleges_API,
} from '../../api/endpoints';
//import AddQuestionPage from '../Test/question/AddQuestionPage'
import ExcelUser from '../../assets/nondb.xlsx'
import Select, { components } from 'react-select';
import CustomOption from '../test/customoption';
import Uploadstudentdata from './uploadtable';
import ImportCandidate from './importstudent';
import Importuser from './importuser'

import back from '../../assets/images/backarrow.png'
import '../../styles/trainingadmin.css'
import Download from '../../assets/images/download.png'

import Next from '../../assets/images/nextarrow.png'
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import ErrorModal from '../auth/errormodal';
import DataTable from './databasetable';


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

            width: '98%'
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
            width: '98%'
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

const UploadStudentProfile = ({username,userRole}) => {
    //  console.log("userpro", username)
    // console.log("userRolepro", userRole)
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCloseError = () => {
        setShowError(false);
    };
    const exportToExcel = () => {
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Students_Database');

        // Define header row with styling and mandatory columns with asterisks
        const header = [
            { header: 'College Name**', key: 'college_id__college', width: 30 },
            { header: 'College Branch', key: 'college_id__college_group', width: 30 },
            { header: 'Batch', key: 'batch_no', width: 30 },
            { header: 'Student Name', key: 'students_name', width: 30 },
            { header: 'User Name**', key: 'user_name', width: 30 },
            { header: 'Reg No', key: 'registration_number', width: 10 },
            { header: 'Gender', key: 'gender', width: 10 },
            { header: 'Email ID', key: 'email_id', width: 20 },
            { header: 'Mobile Number', key: 'mobile_number', width: 15 },
            { header: 'Year**', key: 'year', width: 10 },
            { header: 'CGPA', key: 'cgpa', width: 10 },
            { header: 'Department**', key: 'department_id__department', width: 15 },
            { header: '10th Mark', key: 'marks_10th', width: 10 },
            { header: '12th Mark', key: 'marks_12th', width: 10 },
            // { header: 'Semaster Wise', key: 'marks_semester_wise', width: 10 },
            { header: 'History Of Arrears', key: 'history_of_arrears', width: 10 },
            { header: 'Standing Arrears', key: 'standing_arrears', width: 10 },
            { header: 'No.Of.IT Offers', key: 'it_of_offers', width: 10 },
            { header: 'No.Of.Core Offers', key: 'core_of_offers', width: 10 },
            { header: 'No.Of.Offers', key: 'number_of_offers', width: 10 },
            { header: 'Password**', key: 'password', width: 15 }
        ];

        // Add the header row
        worksheet.columns = header;

        // Apply orange background color and black text color to header cells
        worksheet.getRow(1).eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFA500' } // Orange color
            };
            cell.font = {
                color: { argb: '00000000' }, // Black color
                bold: true
            };
        });

        // Define sample student data
        const sampleStudents = [

            {
                college_id__college: 'VMIT',
                college_id__college_group: 'VMIT Branch1',
                batch_no: 'Batch0001',
                students_name: 'Jane Smith',
                user_name: 'janesmith',
                registration_number: '67890',
                gender: 'Female',
                email_id: 'janesmith@example.com',
                mobile_number: '9876543021',
                year: '2',
                cgpa: '9.0',
                department_id__department: 'ECE',
                marks_10th: '90',
                marks_12th: '92',
                history_of_arrears: '1',
                standing_arrears: '0',
                it_of_offers: '1',
                core_of_offers: '2',
                number_of_offers: '3',
                password: '1234'
            }
        ];

        // Remove 'id', 'college_name_id', 'department_name_id', and 'skill_id' fields from student data
        const studentsWithoutId = sampleStudents.map(({ id, college_name_id, department_name_id, marks_semester_wise, skill_id, ...rest }) => ({
            ...rest,
            number_of_offers: rest.it_of_offers + rest.core_of_offers, // Calculate number_of_offers
            // Add password field with empty value
        }));

        // Add the sample students data to the worksheet
        studentsWithoutId.forEach(student => {
            worksheet.addRow(student);
        });

        // Save workbook as Excel file
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Sample_Students_Database.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        }).catch(error => {
            console.error('Error exporting to Excel:', error);
        });
    };
    const handleExportMCQ = () => {
        // Path to the document in the public/assets directory
        const documentUrl = ExcelUser; // This path should correspond to the public URL

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl; // Path to the file
        link.download = 'NonDatabase.xlsx'; // Name of the file when downloaded

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };
    const [selection, setSelection] = useState('Database'); // Default selection

    const handleSelectionChange = (value) => {
        setSelection(value);
    };


    const [college, setCollege] = useState([]);

    const [department, setDepartment] = useState([]);

    const [selectedCollege, setSelectedCollege] = useState(null);
    const [skill, setSkill] = useState([]);

    const [formErrors, setFormErrors] = useState({});


    const [selectedskill, setSelectedskill] = useState(null);

    // const [selectedCourseName, setSelectedCourseName] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [role, setRole] = useState(null);
    const [students, setstudents] = useState([]);
    const [showAddstudent, setshowAddstudent] = useState(false); // State variable to track visibility
    const [marks10th, setMarks10th] = useState(0);
    const [marks12th, setMarks12th] = useState(0);
    const [cgpa, setCgpa] = useState(0);
    const [marksSemesterWise, setMarksSemesterWise] = useState(0);
    const [mobileNumber, setMobileNumber] = useState('');

    const validateMobileNumber = (value) => {
        const mobilePattern = /^[6789][0-9]{9}$/;
        if (!mobilePattern.test(value)) {
            return 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
        }
        return '';
    };
    const handleNextButtonClick = () => {
        setshowAddstudent(true); // Show the Add Student form
    };

    const handlePreviousButtonClick = () => {
        setshowAddstudent(false); // Show the table
    };
    const [collegeGroups, setCollegeGroups] = useState([]);
    const [selectedCollegeGroup, setSelectedCollegeGroup] = useState(null);
    useEffect(() => {


        getcollegeApi()
            .then(data => {
                const formattedData = data.map(item => ({
                    value: item.id,
                    label: item.college,
                    group: item.college_group || null, // Include college_group if available
                }));
                setCollege(formattedData);
            })
            .catch(error => console.error('Error fetching College:', error));

        getSkillApi()
            .then(data => {
                // Log data to ensure it's correctly received
                console.log("Skills data:", data);

               
                const noneOption = { value: '', label: 'None' };

                // Map data to match Select component requirements
                const formattedSkills = data.map(item => ({
                    value: item.id,
                    label: item.skill_name
                }));

                // Include "None" option at the beginning
                formattedSkills.unshift(noneOption);

                setSkill(formattedSkills);
            })
            .catch(error => console.error('Error fetching Skills:', error));


        //Fetch Department  
        getdepartmentApi()
            .then(data => {
                console.log("Department data:", data); // Log received data
                setDepartment(data.map(item => ({ value: item.id, label: item.department })));
            })
            .catch(error => console.error('Error fetching  Department :', error));




    }, []);

    const [collegeIds, setCollegeIds] = useState([]); // for Training admin
    
      // State to store college ID
    const [userColleges, setUserColleges] = useState([]); // store dropdown options
    
    useEffect(() => {
      // helper: merge concat list with codes from base list
      const mergeWithCodes = async (list) => {
        const base = await getcollege_Test_Api(); // has id, college_code
        const codeMap = new Map(base.map((b) => [Number(b.id), b.college]));
        return list.map((c) => ({
          value: Number(c.id),
          label: c.college_group_concat,
          code: codeMap.get(Number(c.id)) || "", // <-- keep code here
        }));
      };
    
    
      // ✅ Case 2: Training admin → show only assigned colleges
      if (userRole === "Training admin") {
        get_user_colleges_API(username)
          .then(async (userData) => {
            const ids = (userData?.college_ids || []).map((x) => Number(x));
            setCollegeIds(ids);
    
            const concatList = await getCollegeList_Concat_API();
            const filtered = concatList.filter((c) => ids.includes(Number(c.id)));
            const withCodes = await mergeWithCodes(filtered);
            setUserColleges(withCodes);
          })
          .catch((error) => {
            console.error("❌ Error fetching user colleges:", error);
          });
      } else {
        // ✅ Case 3: other roles → show all colleges with concat labels
        Promise.all([getCollegeList_Concat_API(), getcollege_Test_Api()])
          .then(([concatList, base]) => {
            const codeMap = new Map(base.map((b) => [Number(b.id), b.college_code]));
            const all = concatList.map((c) => ({
              value: Number(c.id),
              label: c.college_group_concat,
              code: codeMap.get(Number(c.id)) || "",
            }));
            setUserColleges(all);
          })
          .catch((error) => {
            console.error("❌ Error fetching all colleges:", error);
          });
      }
    }, [username, userRole]);
    



    const handleItOffersChange = (e) => {
        const itOffers = parseInt(e.target.value, 10) || 0;
        const coreOffers = parseInt(document.querySelector('[name="core_of_offers"]').value, 10) || 0;
        const totalOffers = itOffers + coreOffers;
        document.querySelector('[name="number_of_offers"]').value = totalOffers;
    };

    const handleCoreOffersChange = (e) => {
        const coreOffers = parseInt(e.target.value, 10) || 0;
        const itOffers = parseInt(document.querySelector('[name="it_of_offers"]').value, 10) || 0;
        const totalOffers = itOffers + coreOffers;
        document.querySelector('[name="number_of_offers"]').value = totalOffers;
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile_number') {
            setMobileNumber(value);
            const error = validateMobileNumber(value);
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                mobile_number: error,
            }));
        }
    };

    const handleCollegeChange = (selectedOption) => {
        setSelectedCollege(selectedOption);

        // Filter college groups for the selected college name
        const groups = college.filter(item => item.label === selectedOption.label && item.group).map(item => ({
            value: item.group,
            label: item.group,
        }));

        if (groups.length > 0) {
            setCollegeGroups(groups); // Show the college_group dropdown
        } else {
            setCollegeGroups([]); // Hide the college_group dropdown
            setSelectedCollegeGroup(null); // Reset the selected group
        }
    };

   
const handleSubmit = (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  setIsSubmitting(true);

  const formData = new FormData(e.target);

  let mobileNumber = formData.get('mobile_number');
  if (!mobileNumber) {
    mobileNumber = null;
  } else {
    const mobileError = validateMobileNumber(mobileNumber);
    if (mobileError) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        mobile_number: mobileError,
      }));
      setErrorMessage(mobileError);
      setShowError(true);
      setIsSubmitting(false); // ✅ also here in case of early return
      return;
    }
  }

  let skill_values;
  if (selectedskill && selectedskill.some(skill => skill.value === '')) {
    skill_values = [];
  } else {
    skill_values = selectedskill ? selectedskill.map(skill => skill.value) : null;
  }

  const studentprofile = {
    students_name: formData.get('students_name') || null,
    registration_number: formData.get('registration_number') || null,
    gender: formData.get('gender') || null,
    user_name: formData.get('user_name'),
    email_id: formData.get('email_id') || null,
    mobile_number: formData.get('mobile_number') || null,
    college_id: selectedCollege ? selectedCollege.value : null,
    skill_id: skill_values || null,
    cgpa: cgpa || null,
    year: formData.get('year'),
    batch_no: formData.get('batch_no') || null,
    department_id: selectedDepartment ? selectedDepartment.value : null,
    marks_10th: marks10th || null,
    marks_12th: marks12th || null,
    history_of_arrears: formData.get('history_of_arrears') || null,
    text: formData.get('text') || null,
    standing_arrears: formData.get('standing_arrears') || null,
    number_of_offers: formData.get('number_of_offers') || null,
    it_of_offers: formData.get('it_of_offers') || null,
    core_of_offers: formData.get('core_of_offers') || null,
     password: formData.get('password') || null,
  };

  addcandidateApi(studentprofile)
    .then((result) => {
      setErrorMessage(result?.message || 'Profile Added Successfully');
      setShowError(true);
 console.log("✅ Profile added:", result);
      e.target.reset();
      setSelectedskill(null);
      setSelectedCollege(null);
      setSelectedDepartment(null);
      setSelectedCollegeGroup(null);
      setMobileNumber(null);
      setMarks10th(35);
      setMarks12th(35);
    })
    .catch((error) => {
      let backendError = "Failed to add profile";
      if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          backendError = data;
        } else if (data.error) {
          backendError = data.error;
        } else if (typeof data === 'object') {
          backendError = Object.values(data).flat().join(', ');
        console.error("❌ Failed to add profile:", backendError);
        }
      }

      setErrorMessage(backendError);
      setShowError(true);
    })
    .finally(() => {
      setIsSubmitting(false); // ✅ only reset after all async handling is done
    });
};


    // ... (rest of the component code)

    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    return (
        <div>
            <div>
                {!showAddstudent ? (
                    <div >
                        <div className='form-ques-database' style={{ height: "300px" }}>
                            <div className={`parent-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} >

                                <div className="sp-div-db1">
                                    <select className="sp-select" value={selection} onChange={(e) => handleSelectionChange(e.target.value)}  >
                                        <option value="Database">Database</option>
                                        <option value="NonDatabase">NonDatabase</option>
                                    </select>

                                    {selection === 'Database' ? (
                                        <div className="sp-inner-div-database1"  >
                                            <ImportCandidate className='importusers' />
                                            <button className="button-data button-spacing" onClick={exportToExcel} style={{ width: "102px" }}><img src={Download} className='nextarrow'></img><span>Sample</span></button>


                                            <button className="button-data button-spacing" onClick={handleNextButtonClick} style={{ width: "102px" }}><span>Next</span><img src={Next} className='nextarrow'></img></button>
                                        </div>
                                    ) : selection === 'NonDatabase' ? (
                                        <div className="sp-inner-div-database" >
                                            <Importuser className='importusers' />
                                            <button className="button-data button-spacing spaces1" onClick={handleExportMCQ} style={{ width: "102px" }}><img src={Download} className='nextarrow'></img><span>Sample</span></button>
                                            <button className="button-data button-spacing spaces" onClick={handleNextButtonClick} style={{ width: "102px" }}><span>Next</span><img src={Next} className='nextarrow'></img></button>
                                        </div>
                                    ) : null}
                                </div></div>
                        </div>
                        <p></p>
                        <div className='form-ques-profile'>
                            <div className='header'>
                                <h4 className='h4'>Add Students Profile</h4>
                            </div>
                            <p></p>
                            <div className='boxshadow'>


                                <Form onSubmit={handleSubmit}>
                                    <p></p>


                                    <Row >
                                       
                                        <Col>
                                            <div className="add-profile" controlId="college_name">
                                                <label className="label6-ques">College Name**</label>
                                                <p></p>
                                                <Select
                                                    options={userColleges}
                                                    value={selectedCollege}
                                                    onChange={handleCollegeChange}
                                                    placeholder="Select College"
                                                    styles={customStyles}
                                                />
                                            </div>
                                        </Col>

                                        {collegeGroups.length > 0 && (
                                            <Col>
                                                <div className="add-profile" controlId="college_group">
                                                    <label className="label6-ques">College Branch**</label>
                                                    <p></p>
                                                    <Select
                                                        options={collegeGroups}
                                                        value={selectedCollegeGroup}
                                                        onChange={setSelectedCollegeGroup}
                                                        placeholder="Select College Group"
                                                        styles={customStyles}
                                                    />
                                                </div>
                                            </Col>
                                        )}

                                        <Col>
                                            <div className='add-profile' controlId='batch_no'>
                                                <label className='label7-ques' >Batch No</label><p></p>

                                                <input className="input-ques" autocomplete="off" type="text" name="batch_no" placeholder="" />
                                            </div>
                                        </Col>



                                    </Row>

                                    <p></p>
                                    <Row>
                                        <Col>
                                            <div className='add-profile' controlId='department'>
                                                <label className='label6-ques'>Department**</label><p></p>
                                                <Select
                                                    options={department}
                                                    value={selectedDepartment}
                                                    onChange={setSelectedDepartment}
                                                    placeholder="Select department"

                                                    styles={customStyles}
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='year'>
                                                <label className='label6-ques'>Year**</label> <p></p>
                                                <select as="select" name="year" className="input-ques" required>
                                                    <option value="">Select Year</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>

                                                </select>

                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='students_name'>
                                                <label className='label7-ques' >Student Name</label><p></p>

                                                <input className="input-ques" autocomplete="off" type="text" name="students_name" placeholder="" />
                                            </div>
                                        </Col>

                                    </Row><p></p>
                                    <Row>


                                        <Col>
                                            <div className='add-profile' controlId='registration_number'>
                                                <label className='label6-ques'>Reg Number</label><p></p>

                                                <input type="text" className="input-ques" autocomplete="off" name="registration_number" placeholder="" />
                                            </div>
                                        </Col>

                                        <Col>
                                            <div className='add-profile' controlId='mobile_number'>
                                                <label className='label7-ques'>Mobile Number</label>
                                                <p></p>
                                                <input
                                                    type="text"

                                                    className="input-ques"
                                                    autocomplete="off"
                                                    name="mobile_number"
                                                    value={mobileNumber}
                                                    onChange={handleInputChange}

                                                    placeholder=""
                                                />
                                                {formErrors.mobile_number && (
                                                    <p style={{ color: '#F1A128', fontSize: "12px" }}>{formErrors.mobile_number}</p>
                                                )}
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='skill_id'>
                                                <label className='label6-ques'>Skills**</label><p></p>
                                                <Select
                                                    options={skill}
                                                    value={selectedskill}
                                                    onChange={setSelectedskill}
                                                    placeholder="Select skill"
                                                    isMulti
                                                    styles={customStyles}  // Verify that customStyles is not causing issues
                                                    components={{ Option: CustomOption }}
                                                    closeMenuOnSelect={false} // Keep the menu open when selecting multiple options
                                                />
                                            </div>
                                        </Col>
                                       
                                    </Row>
                                    <p></p>
                                    <Row >

                                        <Col>
                                            <div className='add-profile' controlId='marks_10th'>
                                                <label className='label6-ques'>10th Mark</label><p></p>
                                                <input
                                                    type="range"
                                                    name="marks_10th"
                                                    min="35"
                                                    max="100"

                                                    step="1"
                                                    value={marks10th}
                                                    
                                                    onChange={(e) => setMarks10th(e.target.value)}
                                                />
                                                <Form.Text style={{ color: "#94a0ad" }}>{marks10th}</Form.Text>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='marks_12th'>
                                                <label className='label7-ques'>12th Mark</label><p></p>
                                                <input
                                                    type="range"
                                                    name="marks_12th"
                                                    min="35"

                                                    max="100"
                                                    step="1"
                                                    value={marks12th}
                                                    onChange={(e) => setMarks12th(e.target.value)}
                                                />
                                                <Form.Text style={{ color: "#94a0ad" }}>{marks12th}</Form.Text>
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='cgpa'>
                                                <label className='label6-ques'>CGPA</label><p></p>
                                                <input
                                                    type="range"
                                                    name="cgpa"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    value={cgpa}
                                                    onChange={(e) => setCgpa(e.target.value)}
                                                />
                                                <Form.Text style={{ color: "#94a0ad" }}>{cgpa}</Form.Text>
                                            </div>
                                        </Col>
                                    </Row>

                                    <p></p>
                                    <Row >
                                        <Col>
                                            <div className='add-profile' controlId='gender'>
                                                <label className='label6-ques'>Gender</label> <p></p>
                                                <select name="gender" className="input-ques" >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>

                                            </div>
                                        </Col>

                                        <Col>
                                            <div className='add-profile' controlId='history_of_arrears'>
                                                <label className='label6-ques'>History of Arrears</label><p></p>
                                                <input type="number" autocomplete="off" className="input-ques" min="0" max="100"
                                                    step="1" name="history_of_arrears" placeholder="" />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='standing_arrears'>
                                                <label className='label7-ques'>Standing Arrears</label><p></p>
                                                <input type="number" autocomplete="off" className="input-ques" min="0" max="100"
                                                    step="1" name="standing_arrears" placeholder="" />
                                            </div>
                                        </Col>
                                    </Row>
                                    <p></p>

                                    <Row>
                                        <Col>
                                            <div className='add-profile' controlId='it_of_offers'>
                                                <label className='label6-ques'>No Of IT Offers</label>
                                                <p></p>
                                                <input
                                                    type="number"
                                                    autocomplete="off"
                                                    className="input-ques"
                                                    min="0"
                                                    max='100'
                                                    step='1'
                                                    name="it_of_offers"
                                                    onChange={handleItOffersChange}
                                                    placeholder=""
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='core_of_offers'>
                                                <label className='label7-ques'>No Of Core Offers</label>
                                                <p></p>
                                                <input
                                                    type="number"
                                                    autocomplete="off"
                                                    className="input-ques"
                                                    min="0"
                                                    max='100'
                                                    step='1'
                                                    name="core_of_offers"
                                                    onChange={handleCoreOffersChange}
                                                    placeholder=""
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='number_of_offers'>
                                                <label className='label7-ques'>Total No Of Offers</label>
                                                <p></p>
                                                <input
                                                    type="number"
                                                    autocomplete="off"
                                                    className="input-ques"
                                                    min="0"

                                                    max='100'
                                                    step='1'
                                                    name="number_of_offers"
                                                    readOnly
                                                    placeholder=""
                                                />
                                            </div>
                                        </Col>
                                    </Row><p></p>
                                    <Row >




                                        <Col>
                                            <div className='add-profile' controlId='user_name'>
                                                <label className='label6-ques'>User Name**</label> <p></p>

                                                <input type="text" name="user_name" autocomplete="off" className="input-ques" required placeholder="" />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='add-profile' controlId='Password'>
                                                <label className='label7-ques'>Password**</label> <p></p>

                                                <input type="text" name="password" autocomplete="off" className="input-ques" required placeholder="" />
                                            </div>
                                        </Col>

                                        <Col></Col>
                                    </Row><p></p>


                                    <p style={{ height: "40px" }}></p><p></p><p></p>

                                    <Row>
                                        <Col>
                                            <div className="button-container-lms">
                                                <button

                                                    className="button-ques-save btn btn-secondary back-button-lms"
                                                    style={{
                                                        width: "100px",
                                                        color: 'black',
                                                        height: '50px',
                                                        backgroundColor: '#F1A128',
                                                        cursor: 'not-allowed'
                                                    }}
                                                    disabled
                                                ><img src={back} className='nextarrow' ></img>
                                                    <span className="button-text">Back</span>
                                                </button>

                                                <button
                                                    disabled={isSubmitting}
                                                    type="submit"
                                                    style={{
                                                        width: "100px",
                                                    }}
                                                    className='button-ques-save save-button-lms'>
                                                    Save
                                                </button>

                                                <button

                                                    className="button-ques-save btn btn-secondary back-button-lms"
                                                    style={{
                                                        width: "100px",
                                                        color: 'black',
                                                        height: '50px',
                                                        backgroundColor: '#F1A128',
                                                        cursor: 'not-allowed'
                                                    }}
                                                    disabled>
                                                    <span className="button-text">Next</span>
                                                    <img src={Next} className='nextarrow'></img>
                                                </button>

                                            </div>
                                        </Col>

                                    </Row>
                                    <p></p>
                                </Form>

                                <p></p>
                            </div>
                        </div>


                    </div>
                ) : (
                    <div>
                        <button onClick={handlePreviousButtonClick} className='button-ques-save'><img src={back} className='nextarrow' ></img>
                            <span>Back</span></button>
                         {/*}   <DataTable students={students} ></DataTable>*/}
                        <DataTable username={username} userRole={userRole} />
                    </div>
                )}
            </div><p style={{ height: "50px" }}></p>
            {/*  <Footer></Footer>*/}
            <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

        </div>

    );

};

export default UploadStudentProfile;