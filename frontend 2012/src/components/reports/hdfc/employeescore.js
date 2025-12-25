import React, { useEffect, useState } from "react";
import {
  getAttendedTestDetailsApi,
  updateMultipleTestreassignemp,
} from "../../../api/endpoints";
import { useParams, useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";

const TestAttendedTable = () => {
  const { testName } = useParams(); // ✅ Read from URL
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [newTestName, setNewTestName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (testName) {
      getAttendedTestDetailsApi(testName)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          console.error("❌ Error fetching attended test data:", err);
        });
    }
  }, [testName]);

  const handleCheckboxChange = (empId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(empId)
        ? prevSelected.filter((id) => id !== empId)
        : [...prevSelected, empId]
    );
  };

 const handleReassign = async () => {
  if (selectedEmployees.length === 0) {
    alert("Please select at least one employee.");
    return;
  }

  try {
    await updateMultipleTestreassignemp(
      decodeURIComponent(testName),
      selectedEmployees
    );

    alert("✅ Reassignment successful!");
    setSelectedEmployees([]);

    // 🔁 Fetch updated data to remove reassigned employees from the table
    const updatedData = await getAttendedTestDetailsApi(testName);
    setData(updatedData);

  } catch (err) {
    console.error("❌ Reassignment failed:", err);
    alert("Error during reassignment.");
  }
};


  const handleExport = async () => {
    if (!data.length) return;

    const sortedData = [...data].sort((a, b) => {
      if (!a.emp_id || !b.emp_id) return 0;
      return a.emp_id.localeCompare(b.emp_id);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attended Students");

    worksheet.columns = [
      { header: "Emp ID", key: "emp_id", width: 15 },
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email_id", width: 25 },
      { header: "Mobile No", key: "mobile_no", width: 15 },
      { header: "Location", key: "location", width: 20 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Total Score", key: "total_score", width: 15 },
      { header: "Average Mark", key: "avg_mark", width: 15 },
    ];

    sortedData.forEach(emp => {
      worksheet.addRow(emp);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${testName}_Report.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="placement-container-t">
      <div className="top-action-bar">
        <button onClick={() => navigate(-1)} className="button-ques-save">Back</button>
        <input
          type="text"
          className="search-box21"
          placeholder="Search by Emp ID, Name, Location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "5px" }}
        />
        <div style={{ marginRight: "10px" }}>
  <button onClick={handleReassign} className="button-ques-save">
    Reassign 
  </button>
</div>

        <button onClick={handleExport} className="button-ques-save">Export</button>
      </div>

      {/* Reassign Controls */}
      

      <div className="po-table-responsive-t-Reports">
        <h6>{decodeURIComponent(testName)} Report</h6>

        <table className="placement-table-t">
          <thead>
            <tr>
              <th>Select</th>
              <th style={{ textAlign: "center" }}>Emp ID</th>
              <th style={{ textAlign: "center" }}>Name</th>
              <th style={{ textAlign: "center" }}>Location</th>
              <th style={{ textAlign: "center" }}>Designation</th>
              <th style={{ textAlign: "center" }}>Total Score</th>
              <th style={{ textAlign: "center" }}>Average Mark</th>
            </tr>
          </thead>
          <tbody>
            {data.filter(emp =>
              emp.emp_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              emp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
            ).length > 0 ? (
              data
                .filter(emp =>
                  emp.emp_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  emp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((emp, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.emp_id)}
                        onChange={() => handleCheckboxChange(emp.emp_id)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{emp.emp_id}</td>
                    <td style={{ textAlign: "center" }}>{emp.name}</td>
                    <td style={{ textAlign: "center" }}>{emp.location}</td>
                    <td style={{ textAlign: "center" }}>{emp.designation}</td>
                    <td style={{ textAlign: "center" }}>{emp.total_score}</td>
                    <td style={{ textAlign: "center" }}>{emp.avg_mark}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  {searchTerm ? "No matching results." : "No attended students found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestAttendedTable;
