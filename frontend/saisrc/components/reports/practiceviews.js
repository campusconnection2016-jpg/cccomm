import React, { useState, useEffect } from "react";
import { getPracticeTestReport_API } from "../../api/endpoints";
import CustomPagination from "../../api/custompagination";
import ExcelJS from "exceljs";
import { useLocation, useNavigate } from "react-router-dom"; 
const PracticeView = ({ userRole, institute }) => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
const navigate = useNavigate();   // ✅ initialize navigate

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const collegeId = queryParams.get("college_id");
  const department = queryParams.get("department");
  const year = queryParams.get("year");
const testName = queryParams.get("test_name");
  // Fetch data when filters change
  useEffect(() => {
    fetchReportData();
  }, [currentPage, searchTerm, collegeId, department, year]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await getPracticeTestReport_API({
        page: currentPage,
        search: searchTerm,
        college_id: userRole === "Placement Officer" ? institute : collegeId,
        department,
        year,
        test_name: testName, 
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

  const exportToExcel = async () => {
    try {
      let page = 1;
      let allData = [];
      let hasMore = true;

      while (hasMore) {
        const res = await getPracticeTestReport_API({
          page,
          search: searchTerm,
          college_id: userRole === "Placement Officer" ? institute : collegeId,
          department,
          year,
          test_name: testName, 
        });

        if (res?.results?.length) {
          allData = [...allData, ...res.results];
          hasMore = !!res.next;
          page++;
        } else {
          hasMore = false;
        }
      }

      allData.sort((a, b) => {
        const regA = a.registration_number?.toString() || "";
        const regB = b.registration_number?.toString() || "";
        return sortOrder === "asc"
          ? regA.localeCompare(regB, undefined, { numeric: true })
          : regB.localeCompare(regA, undefined, { numeric: true });
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Practice Test Report");
      const header = [
        "Test Name",
        "College ID",
        "Department",
        "Year",
        "Student Name",
        "Registration No",
        "Email",
        "Mobile",
        "User Name",
        "Capture Duration",
        "Average Mark",
        "Reassigned",
        "Attempt Count",
      ];
      worksheet.addRow(header);

      allData.forEach((item) => {
        worksheet.addRow([
          item.test_name,
          item.college_id,
          item.department_id,
          item.year || "",
          item.student_name,
          item.registration_number,
          item.email_id,
          item.mobile_number,
          item.user_name,
          item.capture_duration,
          item.avg_mark,
          item.is_reassigned ? "Yes" : "No",
          item.attempt_count,
        ]);
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(maxLength, cell.value ? cell.value.toString().length : 0);
        });
        col.width = maxLength + 2;
      });

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortByRegNo = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const sortedData = [...data].sort((a, b) => {
    const regA = a.registration_number?.toString() || "";
    const regB = b.registration_number?.toString() || "";
    return sortOrder === "asc"
      ? regA.localeCompare(regB, undefined, { numeric: true })
      : regB.localeCompare(regA, undefined, { numeric: true });
  });

  return (
    <div className="placement-container" style={{ maxWidth: "100%", marginTop: "-17px" }}>
      <h6>Students Practice Test Report</h6>

      {/* Search + Download */}
      <div className="row mb-3 align-items-center">
        <div className="col">
       <button
         onClick={() => navigate("/practice/stu/report")}
         className="button-ques-save"
       >
         ← Back
       </button>
     </div>
        <div className="col">
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            style={{ background: "transparent", color: "white" }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-auto">
          <button onClick={exportToExcel} className="button-ques-save">
            Download
          </button>
        </div>
      </div>

      {/* Table */}
    <div className="po-table-responsive-t-Reports">
                    <table className="placement-table-t">

          <thead >
            <tr>
              <th style={{ textAlign: "center" }}>Student Name</th>
              <th
                onClick={handleSortByRegNo}
                style={{ cursor: "pointer", textAlign: "center" }}
              >
                Reg No {sortOrder === "asc" ? "▲" : "▼"}
              </th>
             {/*} <th style={{ textAlign: "center" }}>Test Name</th>*/}
              <th style={{ textAlign: "center" }}>Average</th>
              <th style={{ textAlign: "center" }}>No of Attempt</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: "center" }}>{item.student_name}</td>
                <td style={{ textAlign: "center" }}>{item.registration_number}</td>
              {/*}  <td style={{ textAlign: "center" }}>{item.test_name}</td>*/}
                <td style={{ textAlign: "center" }}>{item.avg_mark}</td>
                <td style={{ textAlign: "center" }}>{item.attempt_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
<p></p>
      {/* Pagination */}
      <div className="dis-page pagi12" style={{ marginTop: "10%" }}>
        <CustomPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          maxVisiblePages={3}
        />
      </div>
    </div>
  );
};

export default PracticeView;
