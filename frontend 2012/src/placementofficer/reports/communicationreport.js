import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  Communication_student_test_summary_API,
  getuniquestudentApi,
} from "../../api/endpoints";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
const CATEGORY_LABELS = {
  AudioTyping: "Listening",
  AudioMCQ: "Reading",
  TypingBlank: "Writing",
  Pronunciation: "Speaking",
};

const defaultStuDetails = {
  student_name: "N/A",
  registration_number: "N/A",
  year: "N/A",
  department: "N/A",
};

function Communication({ institute }) {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [data, setData] = useState(null);
 const [studentReport, setStudentReport] = useState(null);
 
  // =========================
  // FETCH STUDENTS
  // =========================
  useEffect(() => {
    if (institute) {
      getuniquestudentApi(institute)
        .then((res) => {
          setStudents(res || []);
        })
        .catch((err) => {
          console.error("Error fetching students:", err);
        });
    }
  }, [institute]);

  // =========================
  // FETCH REPORT
  // =========================
  useEffect(() => {
    if (studentName) {
      Communication_student_test_summary_API(studentName)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.error("Error fetching report:", err);
        });
    }
  }, [studentName]);

  // =========================
  // DROPDOWN OPTIONS
  // =========================
  const studentOptions = students.map((stu) => ({
    label: stu.students_name,
    value: stu.students_name,
  }));

  const handleStudentChange = (option) => {
    setStudentName(option ? option.value : "");
    setData(null);
  };
const studentDetails = data
    ? {
        student_name: data.student_name,
        registration_number: data.registration_number,
        year: data.year,
        department: data.department,
      }
    : defaultStuDetails;


const exportReportAsPDF = () => {
  if (!data) return alert("Please select a student first.");

  const pdf = new jsPDF("p", "pt", "a4");
  const margin = 20;

  // --- HEADER ---
  pdf.setFontSize(14);
  pdf.text(
    `${studentDetails.student_name} - ${studentDetails.registration_number} - ${studentDetails.year}Yr - ${studentDetails.department} - Student Report`,
    margin,
    30
  );

  // --- SUMMARY CARDS ---
  pdf.setFontSize(12);
  let y = 50;
  pdf.text(`Total Assigned Tests: ${data.total_assigned_tests}`, margin, y);
  y += 15;
  pdf.text(`Total Attended Tests: ${data.total_attended_tests}`, margin, y);
  y += 15;

  data.category_wise.forEach((cat) => {
    pdf.text(
      `Assigned ${CATEGORY_LABELS[cat.category] || cat.category}: ${cat.assigned_tests}`,
      margin,
      y
    );
    y += 15;
  });

  data.category_wise.forEach((cat) => {
    pdf.text(
      `Tests Taken ${CATEGORY_LABELS[cat.category] || cat.category}: ${cat.attended_tests}`,
      margin,
      y
    );
    y += 15;
  });

  pdf.text(`Overall Average: ${data.overall_avg_mark}%`, margin, y);
  y += 15;
  pdf.text(
    `Overall Feedback: ${data.overall_avg_mark < 40 ? "Need Improvement" : "Good"}`,
    margin,
    y
  );
  y += 25;

  // --- CATEGORY DETAILS TABLE ---
  const tableColumns = ["Test Date", "Test Name", "Category", "Average Score", "Feedback"];
  const tableRows = [];

  data.category_test_details.forEach((cat) => {
    cat.tests.forEach((test) => {
      tableRows.push([
        test.test_date ? new Date(test.test_date).toLocaleDateString() : "-",
        test.test_name,
        CATEGORY_LABELS[cat.category] || cat.category,
        test.avg_mark,
        test.avg_mark < 40 ? "Need Improvement" : "Good",
      ]);
    });
  });

  pdf.autoTable({
  startY: y,
  head: [tableColumns],
  body: tableRows,
  styles: {
    fontSize: 10,
    cellPadding: 4, // adds padding inside each cell
    overflow: 'linebreak', // wraps text if too long
    valign: 'middle', // vertical alignment
  },
  headStyles: {
    fillColor: [52, 58, 64], // dark header
    textColor: 255,
    halign: 'center',
  },
  columnStyles: {
    0: { cellWidth: 70, halign: 'center' }, // Test Date
    1: { cellWidth: 130, halign: 'left' },  // Test Name
    2: { cellWidth: 80, halign: 'center' }, // Category
    3: { cellWidth: 70, halign: 'center' }, // Average Score
    4: { cellWidth: 90, halign: 'center' }, // Feedback
  },
  alternateRowStyles: { fillColor: [240, 240, 240] }, // light gray for alternate rows
  tableLineWidth: 0.5,
  tableLineColor: 200,
});


  pdf.save(`${studentDetails.student_name}_report.pdf`);
};

  return (
   <div className="product-table-container">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h5>
          <pre>
            {studentDetails.student_name} - {studentDetails.registration_number} -{" "}
            {studentDetails.year}Yr - {studentDetails.department} - Student Report
          </pre>
        </h5>

       <button
          onClick={exportReportAsPDF} // ✅ No `this`

          className="button-ques-save"
        >
          Export
        </button>  </div>
<p>

</p>
      {/* ================= FILTER ================= */}
     <div id="student-report-section">
       <div className="form-container">
        <div className="form-field">
          <label style={{ marginRight: "10px" }}>Student Name:</label>

        <Select
          options={studentOptions}
          onChange={handleStudentChange}
          placeholder="Select Student Name or Reg No"
          styles={customStyles}
          isClearable
        />
        </div>
        <div className="form-field"></div>
        <div className="form-field"></div>
      </div>

      {/* ================= REPORT ================= */}
      {data && (
        <>
          {/* ===== SUMMARY CARDS ===== */}
        <div className="student-report-container">

  {/* ================= COLUMN 1 ================= */}
  <div className="report-column">
    <p>
      <strong>Total Assigned Tests:</strong>{" "}
      {data.total_assigned_tests}
    </p>

    <p>
      <strong>Total Attended Tests:</strong>{" "}
      {data.total_attended_tests}
    </p>

    {/* Assigned count per skill */}
    {data.category_wise.map((cat) => (
      <p key={cat.category}>
        <strong>
         No of Assigned {CATEGORY_LABELS[cat.category] || cat.category} :
        </strong>{" "}
        {cat.assigned_tests}
      </p>
    ))}
  </div>

  {/* ================= COLUMN 2 ================= */}
  <div className="report-column">
    {data.category_wise.map((cat) => (
      <p key={cat.category}>
        <strong>
          {CATEGORY_LABELS[cat.category] || cat.category} Test Taken:
        </strong>{" "}
        {cat.attended_tests}
      </p>
    ))}
  </div>

  {/* ================= COLUMN 3 ================= */}
  <div className="report-column">
    <p>
      <strong>Overall Average:</strong>{" "}
      {data.overall_avg_mark}%
    </p>

    <p>
      <strong>Overall Feedback:</strong>{" "}
      {data.overall_avg_mark < 40
        ? "Need Improvement"
        : "Good"}
    </p>
  </div>

</div>


          {/* ===== CATEGORY DETAILS TABLE ===== */}
         <div className="table-responsive-overallreports">
        <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", marginTop: "20px", textAlign: "center" }}>
          <thead>
                <tr>
                  <th>Test Date</th>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Average Score</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {data.category_test_details.map((cat) =>
                  cat.tests.map((test, index) => (
                    <tr key={`${cat.category}-${index}`}>
                      <td>
                        {test.test_date
                          ? new Date(test.test_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>{test.test_name}</td>
                      <td>{cat.category}</td>
                      <td>{test.avg_mark}</td>
                      <td>
                        {test.avg_mark < 40
                          ? "Need Improvement"
                          : "Good"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
}

export default Communication;
