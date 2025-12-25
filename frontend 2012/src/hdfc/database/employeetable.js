import React, { useEffect, useState } from "react";
import { getEmployeesApi } from "../../api/endpoints";
import { useNavigate } from "react-router-dom";
import CustomPagination from "../../api/custompagination";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(page, searchTerm);
  }, [page, searchTerm]);

  const fetchData = async (page, search) => {
    try {
      const res = await getEmployeesApi(page, search);
      setEmployees(res.results);
      setCount(res.count);
    } catch (err) {
      console.error("❌ Error fetching employees:", err);
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="placement-container-t">
      <h6>Employee Details</h6>
      <div style={{ textAlign: "right", marginBottom: "10px" }}>
        <button onClick={() => navigate(-1)} className="button-ques-save">
          Back
        </button>
      </div>
      <input
        className="search-box1"
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPage(1);
        }}
        style={{ marginBottom: "10px", padding: "5px" }}
      />
      <div className="po-table-responsive-t">
        <table className="placement-table-t">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Location</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp, idx) => (
                <tr key={idx}>
                  <td>{emp.emp_id}</td>
                  <td>{emp.name}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.location}</td>
                  <td>{emp.password}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Pagination */}
      <div className="dis-page" style={{ marginTop: "10%" }}>
        <CustomPagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={handlePageChange}
          maxVisiblePages={3}
        />
      </div>
    </div>
  );
};

export default EmployeeTable;
