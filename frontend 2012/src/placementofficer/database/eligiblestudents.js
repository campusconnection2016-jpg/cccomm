import React, { useContext, useState, useEffect } from 'react';
import { SearchContext } from '../../allsearch/searchcontext';
import { Table, Form, Pagination } from 'react-bootstrap';
import '../../styles/placement.css';
import back from '../../assets/images/backarrow.png'
import { useNavigate } from 'react-router-dom';
import { getEligile_Students_job_Rounds_API,removeStudentsFromRoundAPI,updateSelectedStudentsAPI,getStudentsByInterviewDate } from '../../api/endpoints';
import { useParams } from 'react-router-dom';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


const EligibleStudents = ({collegeName}) => {
  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({});
  const [filteredStudents, setFilteredStudents] = useState([]);
 
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setstudents] = useState([]);
  const { job_id } = useParams();
  const { round_of_interview } = useParams();
  console.log("print  job_id",job_id);
  const [searchTerm, setSearchTerm] = useState("");
const roundOptions = [
  'Interview Date', 'Registered', 'Preplacement Talk',
  'Round1', 'Round2', 'Round3', 'Round4', 'Round5', 'Offer'
];

const [selectedRound, setSelectedRound] = useState(round_of_interview || '');

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/jobofertable"); // This is the route that points to the Uploadstudentdata component.
  };
  const [selectedStudents, setSelectedStudents] = useState([]);
const [isInterviewMode, setIsInterviewMode] = useState(false);

  useEffect(() => {
    fetchTraineeData();
  }, [job_id]);

  const fetchTraineeData = () => {
    getEligile_Students_job_Rounds_API(job_id, round_of_interview)
      .then(data => {
        setstudents(data);
        console.log('students: ', data);
      })
      .catch(error => {
        console.error('Error fetching trainee data:', error);
      });
  };

  // Define filter options for each column
 
  

  useEffect(() => {
    setFilteredStudents(filterCandidates());
  }, [filters, students]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };
  
 const [filterOptions, setFilterOptions] = useState({
  department_id__department: [],
  year: [],
  student_name: [],
  registration_number: [],
  mobile_number:[],
  email_id:[]
});
 
  const handleCheckboxChange = (id) => {
  setSelectedStudents(prev => 
    prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
  );
};
const handleAddStudents = async () => {
  console.log("🟡 Step 1: Add button clicked. Starting to fetch Interview Date students...");

  try {
    const response = await getStudentsByInterviewDate(job_id);
    console.log("🟢 Step 2: API call success. Raw data:", response);

    const validData = Array.isArray(response.data) ? response.data : [];
    console.log(`🟢 Step 3: Valid student count = ${validData.length}`);

    setstudents(validData);              // ✅ Fix: set actual data
    setFilteredStudents(validData);     // Update filtered students immediately
    console.log("🟢 Step 4: Students + Filtered students updated.");

    setIsInterviewMode(true);
    console.log("🟢 Step 5: Interview mode set to TRUE");

    setSelectedStudents([]);
    console.log("🟢 Step 6: Cleared previously selected students");

    console.log("✅ Step 7: Interview Date students loaded and ready to display.");
  } catch (error) {
    console.error("❌ Step X: Failed to load interview date students", error);
    alert("❌ Failed to fetch interview students");
  }
};

const handleConfirmAddStudents = async () => {
  try {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    if (!selectedRound) {
      alert("Please select a round.");
      return;
    }

    const payload = {
      student_ids: selectedStudents,
      // round_of_interview: round_of_interview,
      round_of_interview: selectedRound,
      job_id: job_id,
    };

    const response = await updateSelectedStudentsAPI(payload);
    alert("✅ Selected students updated to the new round.");
    console.log("Updated response:", response.data);

    fetchTraineeData();
    setIsInterviewMode(false);
    setSelectedStudents([]);
   // setSelectedRound('');
  } catch (error) {
    console.error("❌ Error updating selected students:", error);
    alert("Failed to update students.");
  }
};
 const handleRemoveStudents = async () => {
  if (selectedStudents.length === 0) {
    alert("Please select at least one student to remove.");
    return;
  }

  try {
    const payload = {
      student_ids: selectedStudents,
      job_id: job_id,
      current_round: round_of_interview,  // From useParams()
    };

    const response = await removeStudentsFromRoundAPI(payload); // Your new backend API
    alert("✅ Students removed from current round.");
    fetchTraineeData();
    setSelectedStudents([]);
  } catch (error) {
    console.error("❌ Failed to remove students from round:", error);
    alert("Failed to remove students from round.");
  }
};


useEffect(() => {
  if (!Array.isArray(students)) return;

  setFilterOptions({
    department_id__department: [
      ...new Set(students.map(item => item.students_id__department_id__department).filter(Boolean))
    ],
    year: [
      ...new Set(students.map(item => item.students_id__year).filter(Boolean))
    ],
    student_name: [
      ...new Set(students.map(item => item.students_id__students_name).filter(Boolean))
    ],
    registration_number: [
      ...new Set(students.map(item => item.students_id__registration_number).filter(Boolean))
    ],
     mobile_number: [
      ...new Set(students.map(item => item.students_id__mobile_number).filter(Boolean))
    ],
     email_id: [
      ...new Set(students.map(item => item.students_id__email_id).filter(Boolean))
    ]
  });
}, [students]);

useEffect(() => {
  setFilteredStudents(filterCandidates());
}, [filters, students, searchTerm]);
const filterCandidates = () => {
  if (!Array.isArray(students)) return [];

  return students.filter((item) => {
    const matchSearch =
      item.students_id__students_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.students_id__registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.students_id__email_id?.toLowerCase().includes(searchTerm.toLowerCase())||
        item.students_id__mobile_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;

      if (key === "department") {
        return item.students_id__department_id__department
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      }

      if (key === "year") {
        return item.students_id__year?.toString() === value.toString();
      }

      if (key === "student_name") {
        return item.students_id__students_name?.toLowerCase() === value.toLowerCase();
      }

      if (key === "registration_number") {
        return item.students_id__registration_number?.toLowerCase() === value.toLowerCase();
      }
       if (key === "mobile_number") {
        return item.students_id__mobile_number?.toLowerCase() === value.toLowerCase();
      }
       if (key === "email_id") {
        return item.students_id__email_id?.toLowerCase() === value.toLowerCase();
      }

      return true;
    });

    return matchSearch && matchFilters;
  });
};


  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPaginationItems = () => {
    let items = [];
    const maxDisplayedPages = 1; // number of pages to display before and after the current page

    if (totalPages <= 1) return items;

    items.push(
      <Pagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>
        1
      </Pagination.Item>
    );

    if (currentPage > maxDisplayedPages + 2) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" />);
    }

    let startPage = Math.max(2, currentPage - maxDisplayedPages);
    let endPage = Math.min(totalPages - 1, currentPage + maxDisplayedPages);

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
          {page}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages - maxDisplayedPages - 1) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

    items.push(
      <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>
        {totalPages}
      </Pagination.Item>
    );

    return items;
  };

  const handleDownload = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Eligible Students");

  // Set the header
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
  worksheet.columns = header;

  // Add data rows
  filteredStudents.forEach((item) => {
    worksheet.addRow({
      Student_Name: item.students_id__students_name || "",
      reg_no: item.students_id__registration_number || "",
      department: item.students_id__department_id__department || "",
      mobile_no: item.students_id__mobile_number || "",
      email: item.students_id__email_id || "",
      year: item.students_id__year || "",
      cgpa: item.students_id__cgpa || "",
      marks_10th: item.students_id__marks_10th || "",
      marks_12th: item.students_id__marks_12th || "",
      history_of_arrears: item.students_id__history_of_arrears ?? "",
      standing_arrears: item.students_id__standing_arrears ?? "",
    });
  });

  // Download Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "eligible_students.xlsx");
};

  return (
    <div className="product-table-container">
     <div style={{
  display: 'flex',
  justifyContent: 'space-between',  // 👈 Pushes left and right content
  alignItems: 'center',
  flexWrap: 'wrap', 
}}>
  <input
    type="text"
    placeholder="🔍 Search by name, reg no, email..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className='search-box1'
    style={{
      padding: "6px",
      width: "300px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      outline: "none"
    }}
  />

    <Form.Control
  as="select"
   disabled
  value={selectedRound}
  onChange={(e) => setSelectedRound(e.target.value)}
  style={{ display: "inline-block", width: "200px", marginRight: "10px" }}
>
  <option value="">Select Round</option>
  {roundOptions.map((round, index) => (
    <option key={index} value={round}>
      {round}
    </option>
  ))}
</Form.Control>

 
       

  <button className="button-ques-save" onClick={handleAddStudents} style={{marginRight:"10px"}}>Show All </button>
 {/* {isInterviewMode && (
 )}*/}
  <button
    className="button-ques-save"
   style={{marginRight:"10px"}}
    onClick={handleConfirmAddStudents}
  >
     Add
  </button>
 <button
  className="button-ques-save"
  style={{ marginRight: '10px' }}
  onClick={handleRemoveStudents}
>
  Remove
</button>
<p ></p>

 <div style={{
  display: 'flex',
  justifyContent: 'space-between',  // 👈 Pushes left and right content
  alignItems: 'center',
  flexWrap: 'wrap', 
}}>
  <button
    className="button-ques-save"
    style={{ marginRight: "10px" }}
    onClick={handleBackClick}
  >
    <img src={back} className="nextarrow" alt="back" />
    <span>Back</span>
  </button>

  <button
    className="button-ques-save"
    onClick={handleDownload}
    style={{ marginRight: "10px" }}
  >
    ⬇ Download
  </button>

  <p style={{ fontWeight: "bold", margin: 0 }}>
    No.Of.Students: {filteredStudents.length}
  </p>
</div>


</div>
<p></p>


      <div className="test-access-table-wrapper" style={{marginTop:"-16px"}}>
        <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th >
     <input
  type="checkbox"
  onChange={(e) => {
    const isChecked = e.target.checked;
    const allIds = currentData.map((item) => item.students_id?.id);
    setSelectedStudents(isChecked ? allIds : []);
  }}
  checked={
    currentData.length > 0 &&
    currentData.every((item) => selectedStudents.includes(item.students_id?.id))
  }
/>

    </th>
              <th style={{textAlign:"center"}}>Student Name</th>
              <th style={{textAlign:"center"}}>
                Department
               



              </th>
          
              <th style={{textAlign:"center"}}>Reg No</th>
              <th style={{textAlign:"center"}}>Mobile No</th>
              <th style={{textAlign:"center"}}>Email</th>
            </tr>
          <tr>
  <th></th>
  <th style={{ textAlign: "center" }}>
    <select
      value={filters.student_name || ""}
      
      onChange={(e) => handleFilterChange("student_name", e.target.value)}
      className="dropdown-custom"
    >
      <option value="">All Names</option>
      {filterOptions.student_name.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  </th>

 

  <th style={{ textAlign: "center" }}>
    <select
      value={filters.department || ""}
     
      onChange={(e) => handleFilterChange("department", e.target.value)}
      className="dropdown-custom"
    >
      <option value="">All Departments</option>
      {filterOptions.department_id__department.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>
  </th>
 <th style={{ textAlign: "center" }}>
    <select
      value={filters.registration_number || ""}
     
      onChange={(e) => handleFilterChange("registration_number", e.target.value)}
      className="dropdown-custom"
    >
      <option value="">All Reg. Nos</option>
      {filterOptions.registration_number.map((reg) => (
        <option key={reg} value={reg}>
          {reg}
        </option>
      ))}
    </select>
  </th>
 

  <th style={{ textAlign: "center" }}>
    <select
      value={filters.mobile_number || ""}
     
      onChange={(e) => handleFilterChange("mobile_number", e.target.value)}
      className="dropdown-custom"
    >
      <option value="">Select Mobile </option>
      {filterOptions.mobile_number.map((reg) => (
        <option key={reg} value={reg}>
          {reg}
        </option>
      ))}
    </select>
  </th>
  <th style={{ textAlign: "center" }}>
    <select
      value={filters.email_id || ""}
      style={{ width: "200px" }}
      onChange={(e) => handleFilterChange("email_id", e.target.value)}
      className="dropdown-custom"
    >
      <option value="">All EmailID</option>
      {filterOptions.email_id.map((reg) => (
        <option key={reg} value={reg}>
          {reg}
        </option>
      ))}
    </select>
  </th>
</tr>

          </thead>
          <tbody className="table-tbody">
           {currentData.map((item) => {
  const studentId = item.students_id__id;

  console.log("Rendered student ID:", studentId);
  return (
    <tr key={studentId} className="test-access-table-row" style={{ padding: '30px' }}>
      <td>
         <input
          type="checkbox"
          checked={selectedStudents.includes(studentId)}
          onChange={() => handleCheckboxChange(studentId)}
        />
      </td>
      <td style={{ textAlign: "center" }}>{item.students_id__students_name}</td>
      <td style={{ textAlign: "center" }}>{item.students_id__department_id__department}</td>
      <td style={{ textAlign: "center" }}>{item.students_id__registration_number}</td>
      <td style={{ textAlign: "center" }}>{item.students_id__mobile_number}</td>
      <td style={{ textAlign: "center" }}>{item.students_id__email_id}</td>
    </tr>
  );
})}

          </tbody>
        </table>
        <p></p>
      </div>
      <div className='dis-page'>
        <Form>
          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
            <Form.Control  className='label-dis'
                as="select" style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
               value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>
        </Form>
        <Pagination className="pagination-custom" >
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {getPaginationItems()}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
    </div>
  );
};

export default EligibleStudents;
