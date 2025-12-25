import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/placement.css";

import {
  getAllstuReportsApi,
  getCorporate_logo_API,
  getCorporateOverallReportsApi,
  getmulti_Collegestu_API,
} from "../../api/endpoints";

import jsPDF from "jspdf";
import "jspdf-autotable";

class OverallReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        student_name: "",
        from_date: null,
        to_date: null,
        user_name: props.username || "",
        college_name: props.collegeName || "",
      },
      students: [],
      colleges: [], // ✅ FIXED
      studentReport: null,
      testData: [],
      search: "",
    };
  }

  componentDidMount() {
    this.fetchCollegesAndReports();
  }

  fetchCollegesAndReports = async () => {
    try {
      const corporateData = await getCorporate_logo_API(
        this.state.filters.user_name
      );

      const fetchedColleges = [];

      if (Array.isArray(corporateData)) {
        corporateData.forEach((data) => {
          if (
            data.user_name === this.state.filters.user_name &&
            Array.isArray(data.colleges)
          ) {
            data.colleges.forEach((college) => {
              if (college.id) fetchedColleges.push(college.id);
            });
          }
        });
      }

      if (fetchedColleges.length === 0) return;

      const students = await getmulti_Collegestu_API(
        fetchedColleges.join(",")
      );

      this.setState({
        students,
        colleges: fetchedColleges, // ✅ FIXED
      });
    } catch (error) {
      console.error("Error fetching colleges/students:", error);
    }
  };

  handleDateChange = (date, field) => {
    this.setState(
      (prev) => ({
        filters: { ...prev.filters, [field]: date },
      }),
      this.fetchStudentReport
    );
  };

  handleStudentChange = (e) => {
    this.setState(
      (prev) => ({
        filters: { ...prev.filters, student_name: e.target.value },
      }),
      this.fetchStudentReport
    );
  };

  handleSearchChange = (e) => {
    this.setState({ search: e.target.value }, this.fetchStudentReport);
  };

  filterStudents = () => {
    const { search, students } = this.state;
    return students.filter((s) => {
      const name = s.students_name?.toLowerCase() || "";
      const reg = s.registration_number?.toLowerCase() || "";
      return (
        name.includes(search.toLowerCase()) ||
        reg.includes(search.toLowerCase())
      );
    });
  };

  fetchStudentReport = () => {
    const { student_name, from_date, to_date } = this.state.filters;
    const { colleges, search } = this.state;

    if (!colleges.length) return;

    const params = {
      student_name,
      from_date: from_date
        ? from_date.toISOString().split("T")[0]
        : null,
      to_date: to_date ? to_date.toISOString().split("T")[0] : null,
      search,
      colleges: colleges.join(","),
    };

    getCorporateOverallReportsApi(params)
      .then((res) =>
        this.setState({ studentReport: res?.length ? res[0] : null })
      )
      .catch(console.error);

    getAllstuReportsApi(params)
      .then((res) => this.setState({ testData: res || [] }))
      .catch(console.error);
  };

  exportCombinedDataAsPDF = () => {
    const { studentReport, testData } = this.state;
    if (!studentReport) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Overall Report", 14, 15);

    const details = [
      ["Student Name", studentReport.student_name || "N/A"],
      ["Register No", studentReport.reg_no || "N/A"],
      ["Year", studentReport.year || "N/A"],
      ["Department", studentReport.department || "N/A"],
      ["Aptitude Avg", `${studentReport["Aptitude Average"] || "N/A"}%`],
      ["Technical Avg", `${studentReport["Technical Average"] || "N/A"}%`],
      ["Quants Avg", `${studentReport["Quants Average"] || "N/A"}%`],
      ["Logical Avg", `${studentReport["Logical Average"] || "N/A"}%`],
      ["Overall Avg", `${studentReport.overall_average || "N/A"}%`],
    ];

    doc.autoTable({
      startY: 20,
      body: details,
      theme: "grid",
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });

    const y = doc.lastAutoTable.finalY + 10;

    const rows = testData.map((t) => [
      t.dtm_end || "N/A",
      t.Quants_score || "N/A",
      t.logical_score || "N/A",
      t.verbal_score || "N/A",
      t.Aptitude_score || "N/A",
      t.Technical_score || "N/A",
      t.feedback || "N/A",
    ]);

    doc.text("Test Details", 14, y);

    doc.autoTable({
      startY: y + 5,
      head: [
        [
          "Date",
          "Quants",
          "Logical",
          "Verbal",
          "Aptitude",
          "Technical",
          "Feedback",
        ],
      ],
      body: rows,
      theme: "grid",
      styles: { fontSize: 9, halign: "center" },
    });

    doc.save("Overall_Report.pdf");
  };

  render() {
    const { filters, studentReport, testData, search } = this.state;
    const students = this.filterStudents();

    return (
      <div className="product-table-container">
        <h2>Overall Report</h2>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <input
            className="search-box"
            placeholder="Search..."
            value={search}
            onChange={this.handleSearchChange}
          />
          <button
            onClick={this.exportCombinedDataAsPDF}
            className="button-ques-save"
          >
            Export PDF
          </button>
        </div>

        <div className="form-container">
          <select value={filters.student_name} onChange={this.handleStudentChange}>
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.registration_number} value={s.students_name}>
                {s.students_name} - {s.registration_number}
              </option>
            ))}
          </select>

          <DatePicker
            selected={filters.from_date}
            onChange={(d) => this.handleDateChange(d, "from_date")}
            placeholderText="From Date"
          />

          <DatePicker
            selected={filters.to_date}
            onChange={(d) => this.handleDateChange(d, "to_date")}
            placeholderText="To Date"
          />
        </div>

        {studentReport && (
          <div className="table-responsive-overallreports">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Quants</th>
                  <th>Logical</th>
                  <th>Verbal</th>
                  <th>Aptitude</th>
                  <th>Technical</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {testData.map((t, i) => (
                  <tr key={i}>
                    <td>{t.dtm_end}</td>
                    <td>{t.Quants_score}</td>
                    <td>{t.logical_score}</td>
                    <td>{t.verbal_score}</td>
                    <td>{t.Aptitude_score}</td>
                    <td>{t.Technical_score}</td>
                    <td>{t.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default OverallReport;
