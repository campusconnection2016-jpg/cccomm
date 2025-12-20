import React, { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../allsearch/searchcontext";
import { Table, Form, Pagination } from "react-bootstrap";
import "../../styles/trainingadmin.css";
import {
  getNondatabaseCandidateFilter,
  getDatabaseCandidateFilter, deletecandidatesApi,get_user_colleges_API
} from "../../api/endpoints";
import Download from '../../assets/images/download.png';
import { useNavigate } from "react-router-dom";

const DataTable = ({username,userRole}) => {
  const { searchQuery } = useContext(SearchContext);
  const [dbcandidates, setDbCandidates] = useState([]);
  const [nonDbcandidates, setNonDbCandidates] = useState([]);
  const [allCollegeOptions, setAllCollegeOptions] = useState([]);

  const [filters, setFilters] = useState({

    college_name: "",
    batch_no: "All",
    department: "All",
    year: "All",
  });



  const navigate = useNavigate();

  const openUploadStudentData = (collegeName, candidateType, uploadTime) => {
    navigate(`/upload-student-data`, {
      state: { collegeName, candidateType, uploadTime },
    });
  };
  const [selectedCandidateType, setSelectedCandidateType] = useState("Db Candidates");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
const [collegeIds, setCollegeIds] = useState([]);
useEffect(() => {
  if (username && userRole === "Training admin") {
    get_user_colleges_API(username)
      .then((data) => {
        if (data && data.college_ids) {
          const numericIds = data.college_ids.map(id => Number(id));
          setCollegeIds(numericIds);
          console.log("🎯 collegeIds set to:", numericIds);
        }
      })
      .catch((err) => {
        console.error("Error fetching user colleges:", err);
      });
  }
}, [username, userRole]);


// 🔹 Run fetches based on role
useEffect(() => {
  console.log("🔹 useEffect: Running fetches based on role", { userRole, collegeIds });
  if (userRole === "Training admin") {
    if (collegeIds.length > 0) {
      console.log("✅ Training admin → Fetching DB & Non-DB candidates for allowed colleges");
      fetchDbCandidates(filters);
      fetchNonDbCandidates(filters);
    } else {
      console.warn("⚠️ Training admin → No collegeIds available yet, skipping fetch");
    }
  } else {
    console.log("✅ Super Admin or Placement Admin → Fetching all DB & Non-DB candidates");
    fetchDbCandidates(filters);
    fetchNonDbCandidates(filters);
  }
}, [filters, userRole, collegeIds]);

const fetchDbCandidates = (updatedFilters) => {
  console.log("🔹 fetchDbCandidates called with filters:", updatedFilters);
  getDatabaseCandidateFilter(
    updatedFilters.college_name,
    updatedFilters.department,
    updatedFilters.year,
    updatedFilters.batch_no
  )
    .then((data) => {
      console.log("✅ DB candidates fetched:", data);

      // 🔹 Filter if Training admin
      let filteredData = data;
      if (userRole === "Training admin" && collegeIds.length > 0) {
        filteredData = data.filter((item) => {
          const match = collegeIds.includes(item.college_id);
          console.log(`Checking college_id ${item.college_id} → allowed: ${match}`);
          return match;
        });
      }

      console.log("🎯 Filtered DB candidates:", filteredData);
      setDbCandidates(filteredData);

      // Extract unique college names for dropdown
      const uniqueColleges = Array.from(
        new Set(
          filteredData.map(
            (item) =>
              `${item.college_id__college} (${item.college_id__college_group || "N/A"})`
          )
        )
      );
      console.log("📌 Unique colleges for dropdown:", uniqueColleges);
      setAllCollegeOptions(uniqueColleges);
    })
    .catch((error) => {
      console.error("❌ Error fetching DB candidates:", error);
    });
};

const fetchNonDbCandidates = (updatedFilters) => {
  console.log("🔹 fetchNonDbCandidates called with filters:", updatedFilters);
  getNondatabaseCandidateFilter(
    updatedFilters.college_name,
    updatedFilters.batch_no
  )
    .then((data) => {
      console.log("✅ Non-DB candidates fetched:", data);

      // 🔹 Filter if Training admin
      let filteredData = data;
      if (userRole === "Training admin" && collegeIds.length > 0) {
        filteredData = data.filter((item) => {
          const match = collegeIds.includes(item.college_id);
          console.log(`Checking college_id ${item.college_id} → allowed: ${match}`);
          return match;
        });
      }

      console.log("🎯 Filtered Non-DB candidates:", filteredData);
      setNonDbCandidates(filteredData);
    })
    .catch((error) => {
      console.error("❌ Error fetching Non-DB candidates:", error);
    });
};

      
  // Grouping Data by College
  const groupCandidates = (candidates) => {
    return candidates.reduce((acc, item) => {
      const key = `${item.college_id__college} (${item.college_id__college_group || "N/A"})`;
      if (!acc[key]) acc[key] = { ...item, user_count: 0 };
      acc[key].user_count += item.user_count;
      return acc;
    }, {});
  };

  const groupedDbCandidates = groupCandidates(dbcandidates);
  const groupedNonDbCandidates = groupCandidates(nonDbcandidates);

  const uniqueDbCollegeData = Object.values(groupedDbCandidates);
  const uniqueNonDbCollegeData = Object.values(groupedNonDbCandidates);

  // ✅ Apply Filters & Search Before Pagination
  const filteredData =
    selectedCandidateType === "Db Candidates"
      ? uniqueDbCollegeData.filter((item) => {
        const collegeName = item.college_id__college || ""; // Ensure it's never null
        const collegeGroup = item.college_id__college_group || "N/A";

        const matchesCollege = filters.college_name
          ? `${collegeName} (${collegeGroup})`.includes(filters.college_name)
          : true;

        const matchesSearch = search
          ? collegeName.toLowerCase().includes(search.toLowerCase()) ||
          item.user_count?.toString().includes(search)
          : true;

        return matchesCollege && matchesSearch;
      })
      : uniqueNonDbCollegeData.filter((item) => {
        const collegeName = item.college_id__college || ""; // Ensure it's never null
        const collegeGroup = item.college_id__college_group || "N/A";

        const matchesCollege = filters.college_name
          ? `${collegeName} (${collegeGroup})`.includes(filters.college_name)
          : true;

        const matchesSearch = search
          ? collegeName.toLowerCase().includes(search.toLowerCase()) ||
          item.user_count?.toString().includes(search)
          : true;

        return matchesCollege && matchesSearch;
      });

  console.log("Filtered Data:", filteredData); // ✅ Debugging filtered data output

  // ✅ Apply Pagination AFTER Filtering
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);


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

  return (
    <div className="product-table-container">
     
      
      <div className="candidate-type-dropdown">
        {/* 🔍 Search Input */}
        <input
          className="search-box-db-nondb"
          type="text"
          placeholder="Search by College or Student Count..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Candidate Type Dropdown */}
        <select
          className="sp-candidates-db-nondb"
          value={selectedCandidateType}
          onChange={(e) => setSelectedCandidateType(e.target.value)}
        >
          <option value="Db Candidates">DB Candidates</option>
          <option value="Non-Db Candidates">Non-DB Candidates</option>
        </select>
      </div>



      <div className="test-access-table-wrapper-detail">
        <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th style={{ textAlign: "center" }}>College Name

              </th>
              {selectedCandidateType === "Db Candidates" && <th style={{ textAlign: "center" }}>Total Students</th>}
              {selectedCandidateType === "Non-Db Candidates" && (
                <>
                {/*}  <th style={{ textAlign: "center" }}>Upload Time</th>  */}
                  <th style={{ textAlign: "center" }}>Total Students</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="table-tbody">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: "center" }}>
                    {item.college_id__college} ({item.college_id__college_group || "N/A"})
                  </td>
                  {selectedCandidateType === "Db Candidates" && (
                    <td style={{ textAlign: "center" }}>
                      <span
                        onClick={() =>
                          openUploadStudentData(
                            item.college_id__college,
                            selectedCandidateType,
                            selectedCandidateType === "Non-Db Candidates" ? item.dtm_upload : null
                          )
                        }
                        style={{ cursor: "pointer", textDecoration: "underline", color: "white" }}
                      >
                        {item.user_count}
                      </span>
                    </td>
                  )}
                  {selectedCandidateType === "Non-Db Candidates" && (
                    <>
                    {/*}  <td style={{ textAlign: "center" }}>{item.dtm_upload || "N/A"}</td> */}
                      <td style={{ textAlign: "center" }}>
                        <span
                          onClick={() =>
                            openUploadStudentData(
                              item.college_id__college,
                              selectedCandidateType,
                              selectedCandidateType === "Non-Db Candidates" ? item.dtm_upload : null
                            )
                          }
                          style={{ cursor: "pointer", textDecoration: "underline", color: "white" }}
                        >
                          {item.user_count}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>Loading..</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ height: "50px" }}></p>
      {/* Pagination */}

      <div className='placement-display-pagination'>
        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
          <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
          <Form.Control
            className='label-dis-placement'
            style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
            as="select"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </Form.Control>
        </Form.Group>
        <Pagination className="pagination-custom-placement">
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {getPaginationItems()}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>


      </div>
    </div>
  );
};

export default DataTable;
