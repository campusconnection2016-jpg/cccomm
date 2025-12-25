import React, { useContext, useState, useEffect } from 'react';
import { SearchContext } from '../../allsearch/searchcontext';
import { Table, Form, Pagination } from 'react-bootstrap';
import '../../styles/placement.css';
import {
  getEligibleStudentCountApi,
  updateRoundOfInterview_Upload_API,
  geteligiblestudentsApi,
  update_Announcement_API_NEW,
  geteligiblestudentsroundApi,
  getRounds_Students_Count_API,
  getcollegeApi,
  updateAnnouncement_API,
  getEligile_Students_job_Rounds_API,
  sendEmailToStudents,
  sendWhatsAppToStudents,
  deletejobofferApi
} from '../../api/endpoints';

import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faBullhorn, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button } from 'react-bootstrap';
import ExcelJS from 'exceljs';
import ErrorModal from '../../components/auth/errormodal';
import Uploadjoboffers from './uploadjoboffer';
import back from '../../assets/images/backarrow.png';
import { useNavigate } from 'react-router-dom';


const FilterDropdown = ({ options, selectedValue, onChange }) => {
  return (
    <select
      value={selectedValue || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ backgroundColor: 'White', borderRadius: '5px', display: 'flex', width: '80px' }}
    >
      <option value="">All</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};


const exportToExcel = (stu_list) => {
  console.log('stu_list: ', stu_list);
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Eligible Students List');

  const header = [
    { header: 'Student Name', key: 'students_name', width: 40 },
    { header: 'Reg No**', key: 'registration_number', width: 20 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Mobile No', key: 'mobile_number', width: 20 },
    { header: 'Email', key: 'email_id', width: 20 },
    { header: 'Year', key: 'year', width: 20 },
    { header: 'CGPA', key: 'cgpa', width: 20 },
    { header: '10th Marks', key: 'marks_10th', width: 20 },
    { header: '12th Marks', key: 'marks_12th', width: 20 },
    { header: 'History Of Arrears', key: 'history_of_arrears', width: 20 },
    { header: 'Standing Arrears', key: 'standing_arrears', width: 20 },
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
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } }, // Black border
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add rows to the worksheet
  stu_list.forEach(student => {
    worksheet.addRow({
      'students_name': student.students_id__students_name,
      'registration_number': student.students_id__registration_number,
      'department': student.students_id__department_id__department,
      'mobile_number': student.students_id__mobile_number,
      'email_id': student.students_id__email_id,
      'year': student.students_id__year,
      'cgpa': student.students_id__cgpa,
      'marks_10th': student.students_id__marks_10th,
      'marks_12th': student.students_id__marks_12th,
      'history_of_arrears': student.students_id__history_of_arrears,
      'standing_arrears': student.students_id__standing_arrears,
    });
  });

  // Save workbook as Excel file
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Eligible_Students_List.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }).catch(error => {
    console.error('Error exporting to Excel:', error);
  });
};


const Uploadstudentdata = ({ institute, collegeName }) => {
  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({});
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [updateannounce_Logo, setupdateannounce_Logo] = useState('');
  const [updateannounceId, setupdateannounceId] = useState(null);
  const [updateannounce, setupdateannounce] = useState('');

  const [roundSelections, setRoundSelections] = useState({});
  const [students, setstudents] = useState([]);
  const [collegeId, setCollegeId] = useState(null);
  const [showAddstudent, setshowAddstudent] = useState(false);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);  // Track selected rows
  const [selectAll, setSelectAll] = useState(false); // Track master checkbox

  const handleBackClick = () => {
    navigate('/uploadstudentdata'); // This is the route that points to the Uploadstudentdata component.
  };
  
  useEffect(() => {
    const fetchCollegeId = async () => {
      try {
        console.log("Fetching college list...");
        const data = await getcollegeApi();
        console.log("API response data:", data);

        if (Array.isArray(data)) {
          // Find the matching college
          const matchingCollege = data.find(college => college.college.trim() === collegeName.trim());
          if (matchingCollege) {
            console.log("Matching college:", matchingCollege);
            setCollegeId(matchingCollege.id);
          } else {
            console.warn("No matching college found for:", collegeName);
            setErrorMessage('College not found');
            setShowError(true);
          }
        } else {
          console.warn("Unexpected response structure: Expected an array.");
          setErrorMessage('Unexpected response structure: Expected an array.');
          setShowError(true);
        }
      } catch (error) {
        console.error("Error fetching college data:", error);
        setErrorMessage('Error fetching college data');
        setShowError(true);
      }
    };

    fetchCollegeId();
  }, [collegeName]);
  useEffect(() => {
    if (collegeId) { // Ensure collegeId is defined before calling the function
      fetchTraineeData(collegeId);
    }
  }, [collegeId, students]); // Depend on collegeId instead of students


  const fetchTraineeData = (collegeId) => {
    //console.log("collegeid",collegeId)
    getEligibleStudentCountApi(collegeId)
      .then(data => {
        setstudents(data);
        // console.log('students: ', data);
      })
      .catch(error => {
        console.error('Error fetching trainee data:', error);
      });
  };

  const handleFileChangeLogo = (e) => {
    setupdateannounce_Logo(e.target.files[0]);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [colleges, setstudent] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const roundOptions = ['Interview Date', 'Registered', 'Preplacement Talk', 'Round1', 'Round2', 'Round3', 'Round4', 'Round5', 'Offer',];
  const [shortlistedCounts, setShortlistedCounts] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [jobIdUpload, setJobIdUpload] = useState(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState(null);

  const handleSendWhatsApp = async (item) => {
    const job_id = item.job_id__id;
    const round_of_interview = roundSelections[job_id];

    if (!round_of_interview) {
      alert("Please select a round before sending a WhatsApp message.");
      return;
    }

    try {
      console.log(
        "Sending WhatsApp message for job ID:",
        job_id,
        "and round:",
        round_of_interview
      );
      console.log("testing========================");
      // Call the sendWhatsAppToStudents API
      const response = await sendWhatsAppToStudents(job_id, round_of_interview);

      // Check if the WhatsApp message was sent successfully
      if (response.message === "WhatsApp messages triggered successfully") {
        alert("WhatsApp message triggered successfully.");
      } else {
        alert(response.message || "Failed to send WhatsApp message.");
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      alert(
        "An error occurred while sending the WhatsApp message. Please try again."
      );
    }
  };

  const fetchstudentslist = async () => {
    try {
      const collegesData = await geteligiblestudentsApi();
      setstudent(collegesData);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleSendEmail = async (item) => {
    const job_id_value = item.job_id__id;
    const round_of_interview = roundSelections[job_id_value];

    if (!round_of_interview) {
      setErrorMessage('Please select a round of interview before sending an email.');
      setShowError(true);

      return;
    }

    try {
      console.log("Sending email for job ID:", job_id_value, "and round:", round_of_interview);

      // Call the sendEmailToStudents API
      const response = await sendEmailToStudents(job_id_value, round_of_interview);

      // Check if the email was sent successfully
      if (response.message === "Emails sent successfully") {
        // alert('Email sent successfully.');
        setErrorMessage('Email sent successfully.');
        setShowError(true);
      } else {
        setErrorMessage(response.message || 'Failed to send email.');
        setShowError(true);
        // alert(response.message || 'Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setErrorMessage('An error occurred while sending the email. Please try again.');
      setShowError(true);

      //alert('An error occurred while sending the email. Please try again.');
    }
  };



  const handleFileChanges = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    console.log("Upload button clicked");

    if (!uploadFile) {
      console.log("No file selected");
      setErrorMessage('Please select a file');
      setShowError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('round_of_interview', selectedOption || '');
    formData.append('job_id', jobIdUpload);

    console.log("FormData prepared:");
    console.log("File: ", uploadFile);
    console.log("Round of Interview: ", selectedOption);
    console.log("Job ID: ", jobIdUpload);

    try {
      const response = await updateRoundOfInterview_Upload_API(formData);
      console.log("Response received from API:", response);

      setErrorMessage(response.data.success || 'Data uploaded successfully');
      setShowError(true);

      handleRoundSelectionChange(jobIdUpload, selectedOption, selectedCompanyName);
      handleCloseUploadModal();

    } catch (error) {
      console.log("Error occurred during API call");
      let errorMsg1 = 'An unexpected error occurred.';
      if (error.response) {
        const errorData = error.response.data;
        console.log('Error response data: ', errorData);
        errorMsg1 = Array.isArray(errorData.error)
          ? errorData.error.join(', ')
          : errorData.error || errorData;
        setErrorMsg(errorMsg1);
      }
      setErrorMessage(errorMsg1);
      setShowError(true);
    }


  };




  const handleExport = async (job_id, round_of_interview) => {
    if (!job_id || !round_of_interview) {
      console.error('Invalid parameters:', job_id, round_of_interview);
      return;
    }

    try {
      console.log('job_id: ', job_id);
      console.log('round_of_interview: ', round_of_interview);

      const stu_datas = await getEligile_Students_job_Rounds_API(job_id, round_of_interview);
      console.log('stu_datas: ', stu_datas);

      exportToExcel(stu_datas);
    } catch (error) {
      console.error('Error exporting code:', error);
    }
  };


  // Define filter options for each column
  const filterOptions = {
    job_id__company_name: [...new Set(students.map((student) => student.job_id__company_name))],

  };

  const handleAnnouncementClick = (item) => {
    console.log("Selected student:", item);
    setSelectedStudent(item);
    setupdateannounceId(item.job_id__id); // Make sure the ID is set correctly
    console.log("Set announcement ID:", item.job_id__id); // Log the ID to verify it's correct
    setShowAnnouncementModal(true);
  };

  const handleUploadClick = (student) => {
    console.log('selected upload: ', student);
    setJobIdUpload(student.job_id__id);
    console.log('job_id: ', student.job_id__id);
    setSelectedCompanyName(student.job_id__company_name);
    setErrorMsg(null);

    setSelectedStudent(student);
    setShowUploadModal(true);
  };

  const handleCloseAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setupdateannounce('');
  };


  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
  };

  const handleUpdateannouncement = async (event) => {
    event.preventDefault();

    console.log("ID before API call:", updateannounceId); // Log the ID to check if it's valid

    if (!updateannounceId) {
      setErrorMessage('Announcement ID is missing. Cannot update.');
      setShowError(true);
      console.error("Error: Announcement ID is null or undefined");
      return;
    }

    if (!updateannounce) {
      setErrorMessage('Please enter the announcement');
      setShowError(true);
      return;
    }

    const formData = new FormData();
    formData.append('announcement', updateannounce);
    // formData.append('round_of_interview', selectedOption);
    console.log("test", selectedOption)

    if (updateannounce_Logo) {
      formData.append('announcement_image', updateannounce_Logo);
    }

    try {
      console.log("Calling API to update announcement with ID:", updateannounceId);
      const response = await updateAnnouncement_API(updateannounceId, {
        announcement: updateannounce,
        announcement_image: updateannounce_Logo,
        // round_of_interview:selectedOption
      }, selectedOption,);

      console.log("API call successful, response:", response);
      setErrorMessage('Announcement updated successfully');
      setShowError(true);

      // Clear form fields after success
      setupdateannounce('');
      setupdateannounce_Logo(null);
      handleCloseAnnouncementModal();

      // Optionally, refresh the data list if necessary
      fetchstudentslist();
    } catch (error) {
      console.error('Error updating announcement:', error);
      setErrorMessage('Failed to update announcement. Please try again.');
      setShowError(true);
    }
  };



  useEffect(() => {
    setFilteredStudents(filterCandidates());
  }, [filters, students]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    setCurrentPage(1); // Reset page to 1 when filters change
  };

  // Function to filter data based on all active filters
  const filterCandidates = () => {
    return students.filter((item) => {
      return Object.entries(filters).every(([key, value]) =>
        !value || (item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase()))
      );
    });
  };

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginationItems = () => {
    const items = [];
    let startPage, endPage;

    if (totalPages <= 3) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage === 1) {
      startPage = 1;
      endPage = 3;
    } else if (currentPage === totalPages) {
      startPage = totalPages - 2;
      endPage = totalPages;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return items;
  };


  const handleRoundSelectionChange = (itemId, roundValue, companyName) => {
    console.log('itemId: ', itemId);

    // Update roundSelections state
    setRoundSelections(prevSelections => ({
      ...prevSelections,
      [itemId]: roundValue,  // Store the selected round for the specific itemId
    }));

    setSelectedOption(roundValue);

    // Make the API call using the selected round and company name
    getRounds_Students_Count_API(roundValue, companyName)
      .then(count => {
        // Update state for this specific item ID
        setShortlistedCounts(prevCounts => ({
          ...prevCounts,
          [itemId]: count,  // Store the count using itemId as the key
        }));
      })
      .catch(error => {
        console.error('Error fetching shortlisted count:', error);
      });
  };

  const handleAddJob = () => {
    navigate('/database/upload-offer');
  };



  const exportExcelSample = (sample) => {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Questions');


    const header = [
      { header: 'Student Name', key: 'Student_Name', width: 30 },
      { header: 'Reg No**', key: 'reg_no', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Mobile No', key: 'mobile_no', width: 20 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Year', key: 'year', width: 15 },
      { header: 'CGPA', key: 'cgpa', width: 15 },
      { header: '10th Marks', key: 'marks_10th', width: 15 },
      { header: '12th Marks', key: 'marks_12th', width: 15 },
      { header: 'History Of Arrears', key: 'history_of_arrears', width: 20 },
      { header: 'Standing Arrears', key: 'standing_arrears', width: 20 },
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
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } }, // Black border
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });

    // Filter out unwanted fields and add rows to the worksheet
    sample.forEach(({ id, input_format, view_hint, question_id, negative_mark, ...rest }) => {
      worksheet.addRow(rest);
    });

    // Save workbook as Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Sample_Format.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Error exporting to Excel:', error);
    });

  };


  // Define a constant sample question
  const sampleData = [
    {
      Student_Name: 'Anu Priya',
      reg_no: 'REG101',
      department: 'CSE',
      mobile_no: '942819385',
      email: 'abc@gmail.com',
      year: '2',
      cgpa: '5.9',
      marks_10th: '90',
      marks_12th: '89',
      history_of_arrears: '1',
      standing_arrears: '1',
    }
  ];


  const handleExportSample = async () => {
    try {
      exportExcelSample(sampleData); // Use sampleQuestion for export
    } catch (error) {
      console.error('Error exporting code:', error);
    }
  };

  const handleUpdateClick = (job_id__id) => {
    // Navigate to the UpdateJob page and pass the job ID as a URL parameter
    navigate(`/update-job/${job_id__id}`);
  };
  const handleRowSelect = (jobId) => {
    setSelectedRows((prevSelected) =>
        prevSelected.includes(jobId)
            ? prevSelected.filter((id) => id !== jobId)
            : [...prevSelected, jobId]
    );
};

// ✅ Handle master checkbox select/deselect
const handleSelectAll = () => {
    if (selectAll) {
        setSelectedRows([]);  // Deselect all
    } else {
        setSelectedRows(currentData.map((item) => item.job_id__id)); // Select all
    }
    setSelectAll(!selectAll);
};

const handleDeleteSelected = async () => {
  if (selectedRows.length === 0) {
      alert("Please select at least one row to delete.");
      return;
  }

  const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedRows.length} selected job(s)?`);
  if (!confirmDelete) return;

  try {
      // ✅ Call the delete API for each job ID
      await Promise.all(selectedRows.map((jobId) => deletejobofferApi(jobId)));

      setErrorMessage("Selected jobs deleted successfully!");

      // ✅ Remove deleted rows from UI
      setSelectedRows([]);
  } catch (error) {
      console.error("❌ Error deleting jobs:", error);
      setErrorMessage("Failed to delete selected jobs. Check console for details.");
  }
};

const handleSendWhatsAppsendold = () => {
  const numbers = ['9944539581', '9884488825', '7358164356','7339440416'];
  const message = encodeURIComponent("Hello Everyone, Welcome To Campus Connection");

  numbers.forEach((num) => {
    const url = `https://wa.me/${num}?text=${message}`;
    window.open(url, '_blank');
  });
};

const handleSendWhatsAppsend = () => {
  const numbers = ['9944539581', '9884488825', '7358164356', '7339440416'];
  const message = encodeURIComponent("Hello Everyone, Welcome To Campus Connection");

  numbers.forEach((num, index) => {
    setTimeout(() => {
      const url = `https://wa.me/${num}?text=${message}`;
      window.open(url, '_blank');
    }, index * 1000); // 1 second delay between each
  });
};


  return (
    <div className="placement-container">
       <button className='button-ques-save' style={{ width: "100px", marginRight:"15px" }} onClick={handleBackClick}><img src={back} className='nextarrow' ></img>Back</button>
      <button className='button-ques-save-add' style={{ width: "100px", marginRight:"15px" }} onClick={handleExportSample}>Sample</button>
      <button className='button-ques-save-add' style={{ width: "100px",   }} onClick={handleDeleteSelected}>
                Delete 
            </button>
      {/*} <div >
       <JobUpdateTable collegeName={collegeName}></JobUpdateTable>
      </div>*/}
      <div className="po-table-responsive-jp-data">

        <table className="placement-table">
          <thead >
            <tr>
            <th>
                                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} /> {/* Master Checkbox */}
                            </th>
              <th>
                Company
                <FilterDropdown
                  options={filterOptions.job_id__company_name}
                  selectedValue={filters.job_id__company_name}
                  onChange={(value) => handleFilterChange('job_id__company_name', value)}
                />
              </th>
              <th>Eligible Students</th>
              <th>Round of Interview</th>
              <th>ShortListed Students</th>
              <th>Upload</th>
              <th>
                Download
              </th>
              <th>Announcement</th>
              <th>Whatsapp</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody >
            {currentData.map((item) => (
              <tr key={item.job_id__id} style={{ padding: '30px', textAlign: "center" }}>
                 <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(item.job_id__id)}
                                        onChange={() => handleRowSelect(item.job_id__id)}
                                    />
                                </td>
                <td style={{ textAlign: "left", textDecoration:"underline" }} onClick={() => handleUpdateClick(item.job_id__id)}>{item.job_id__company_name}</td>
                {/*<td>{item.student_count}</td>*/}
                <td style={{ textAlign: "center" }}>
                  <Link to={`/eligible-student/${item.job_id__id}`} style={{ color: "white" }}>
                    {item.student_count}
                  </Link>
                </td>
                <td style={{ textAlign: "center" }}>
                  <Form.Control
                    as="select"
                    value={roundSelections[item.job_id__id] || ''}  // Bind to specific item.id
                    onChange={(e) => handleRoundSelectionChange(item.job_id__id, e.target.value, item.job_id__company_name)}
                  >
                    <option value="">Select Round</option>
                    {roundOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </Form.Control>
                </td>

                <td style={{ textAlign: "center" }}>
                  {/* Display count only for this item */}
                  <Link to={`/students/eligible-student/${item.job_id__id}/${roundSelections[item.job_id__id]}`} style={{ color: "white" }}>
                    {shortlistedCounts[item.job_id__id] !== undefined ? shortlistedCounts[item.job_id__id] : "N/A"}
                  </Link>
                </td>
                <td>
                  <FontAwesomeIcon icon={faUpload} style={{ fontSize: "24px" }} onClick={() => handleUploadClick(item)} />
                </td>
                <td style={{ textAlign: "center" }}>
                  <FontAwesomeIcon
                    style={{ fontSize: "24px" }}
                    icon={faDownload}
                    onClick={() => handleExport(item.job_id__id, roundSelections[item.job_id__id] || 'Interview Date')}

                  // onClick={() => handleExport(item.job_id__id, roundSelections[item.job_id__id])} // Pass relevant parameters
                  />
                </td>
                <td style={{ textAlign: "center" }} onClick={() => handleAnnouncementClick(item)}><FontAwesomeIcon style={{ fontSize: "24px" }} icon={faBullhorn} /></td>
                <td style={{ textAlign: "center" }} onClick={() => handleSendWhatsApp(item)}>
                <FaWhatsapp style={{ fontSize: "24px" }} ></FaWhatsapp></td>
                <td style={{ textAlign: "center" }}>
                  <FontAwesomeIcon
                    style={{ fontSize: "24px" }}
                    icon={faEnvelope}
                    onClick={() => handleSendEmail(item)}  // Call the handleSendEmail function on click
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p></p>
        <Modal show={showAnnouncementModal} onHide={handleCloseAnnouncementModal}>
          <Modal.Header closeButton style={{ borderBottom: "none", padding: "1.5rem 2rem", position: "relative" }}>
            {/* Close button area expanded */}
            <span className="close-button-overlay" onClick={handleCloseAnnouncementModal}></span>
          </Modal.Header>
          <Modal.Body style={{ marginTop: "-31px" }}>
            <Form>
              <Form.Group controlId="formAnnouncement">
                <Form.Label>Announcement</Form.Label>

                <textarea
                  autoComplete="off"
                  type="text"
                  value={updateannounce}
                  className='input-ques-clg'
                  onChange={(e) => setupdateannounce(e.target.value)}
                  placeholder="Enter Announcements...."
                />
                <p></p>
                <div className="file-input-group-clg1">
                  <label htmlFor="announceimg" className="input-button-ques-mcq-clg">Choose Image</label>
                  <input
                    type="file"
                    id="announceimg"
                    name="announceimg"
                    onChange={handleFileChangeLogo}
                    className="input-file-ques-mcq-clg"
                  />
                  {updateannounce_Logo && typeof updateannounce_Logo === 'string' && (
                    <img src={`data:image/jpeg;base64,${updateannounce_Logo}`} alt="Current logo" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  )}
                  {updateannounce_Logo && typeof updateannounce_Logo !== 'string' && (
                    <span className="file-name-clg">{updateannounce_Logo.name}</span>
                  )}
                </div>

              </Form.Group><p></p>
              <button className='button-po-save' onClick={handleUpdateannouncement} style={{ border: "none", float: "right" }}>
                Submit
              </button>
            </Form>
          </Modal.Body>
        </Modal>
        <div style={{ width: "400px" }}>
          <Modal show={showUploadModal} onHide={handleCloseUploadModal} >

            <Modal.Header closeButton style={{ borderBottom: "none", padding: "2.5rem" }}>
              {/* Close button area expanded */}
              <span className="close-button-overlay" onClick={handleCloseUploadModal}></span>
            </Modal.Header>

            <Modal.Body style={{ marginTop: "-31px" }}>
              <Form>
                <Form.Group controlId="formFile">
                  <Form.Label>Upload File</Form.Label>
                  <input
                    type="file"
                    className='input-ques-clg'
                    onChange={handleFileChanges}
                  />
                </Form.Group>
                <p></p>
                <button
                  type="button"  // Change this to "button" to prevent form submission
                  className='button-po-save'
                  style={{ border: "none", float: "right" }}
                  onClick={(e) => handleUpload(e)}>
                  Upload
                </button>
                {/* Conditionally render the error message below the upload button */}
                {showError && (
                  <div style={{ color: 'red', marginTop: '10px' }}>
                    {errorMsg}
                  </div>
                )}
              </Form>
            </Modal.Body>
          </Modal></div>
      </div>
      <div className='placement-display-pagination'>
          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
            <Form.Control className='label-dis-placement' style={{ width: "50px", boxShadow: 'none', outline: 'none' }} as="select" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>
        <Pagination className="pagination-custom-placement">
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {getPaginationItems()}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default Uploadstudentdata;
