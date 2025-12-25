import React, { useEffect, useState } from "react";
import { getTestAssignmentSummaryApi } from "../../../api/endpoints";
import CustomPagination from "../../../api/custompagination";
import { useNavigate } from "react-router-dom";
const HdfcTestSchedules = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
 const navigate = useNavigate(); 
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchData = async (page, search) => {
    try {
      const res = await getTestAssignmentSummaryApi(page, search);
      setData(res.results || []);
      setTotalCount(res.count || 0);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
   <div className="placement-container-t">
      <h6>Test Schedules</h6>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search by test name"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // reset to page 1 on search
        }}
         className="search-box1"
      />

   <div className="po-table-responsive-t-Reports">
                        <table className="placement-table-t">
     <thead>
          <tr>
            <th>Test Name</th>
             <th>StartDate</th>
            <th>Total Assigned</th>
            <th>Total Attended</th>
           
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((item, idx) => (
              <tr key={idx}>
                <td >{item.test_name}</td>
                 <td >{item.latest_assigned ? new Date(item.latest_assigned).toLocaleString() : "-"}</td>
                <td style={{ textAlign: "center" }}>{item.total_assigned}</td>
                <td
  style={{ textAlign: "center", color: "white", cursor: "pointer", textDecoration: "underline" }}
  onClick={() => navigate(`/test-attended/${item.test_name}`)}
>
  {item.total_attended}
</td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No data found</td>
            </tr>
          )}
        </tbody>
      </table>
</div>
      {/* 🔢 Custom Pagination */}
      <div className="dis-page" style={{ marginTop: "10%" }}>
        <CustomPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          maxVisiblePages={3}
        />
      </div>
    </div>
  );
};

export default HdfcTestSchedules;
