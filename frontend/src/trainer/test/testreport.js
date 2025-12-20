import React, { useState, useEffect, useContext } from "react";
import { getTestcandidateReportsApi } from "../../api/endpoints";
import { useParams } from "react-router-dom";
import "../../styles/trainer.css";
import {  Form, Pagination } from "react-bootstrap";
import Download from "../../assets/images/download.png";
import Footer from "../../footer/footer";
import { SearchContext } from "../../allsearch/searchcontext";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
const TestReports = () => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({
    registration_number: "",
    test_name: "",
    college_id: "",
    student_name: "",
    email_id: "",
    mobile_number: "",
    gender: "",
    year: "",
    department_id: "",
    dtm_start: "",
    dtm_end: "",
    total_score: "",
    avg_mark: "",
  });

  const { test_name } = useParams();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };
  useEffect(() => {
    getTestCandidates();
  }, [test_name]);

  const getTestCandidates = () => {
    getTestcandidateReportsApi()
      .then((data) => setTestCandidates(data))
      .catch((error) =>
        console.error("Error fetching test candidates:", error)
      );
  };

  const handleFilterChange = (event, key) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const filterCandidates = () => {
    return testCandidates.filter((candidate) => {
      // Apply field-based filters
      for (let key in filters) {
        if (filters[key] !== "") {
          if (key === "dtm_start" && candidate.dtm_start < filters.dtm_start)
            return false;
          if (key === "dtm_end" && candidate.dtm_end > filters.dtm_end)
            return false;
          if (
            key === "total_score" &&
            !filterByTotalScore(candidate.total_score, filters.total_score)
          )
            return false;
          if (
            key !== "dtm_start" &&
            key !== "dtm_end" &&
            key !== "total_score"
          ) {
            const filterValue = String(filters[key]).toLowerCase();
            const candidateValue = String(candidate[key]).toLowerCase();
            if (candidateValue !== filterValue) return false;
          }
        }
      }

      // Apply global search term
      const searchTerm = searchQuery || search;
      return (
        !searchTerm ||
        Object.values(candidate).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    });
  };

  const filterByTotalScore = (score, filterValue) => {
    if (filterValue === "AA") return score === "AA";
    if (filterValue.startsWith("range:")) {
      const [min, max] = filterValue
        .replace("range:", "")
        .split("-")
        .map(Number);
      const scoreValue = parseFloat(score);
      return !isNaN(scoreValue) && scoreValue >= min && scoreValue <= max;
    }
    return false;
  };

  const generateTotalScoreOptions = () => {
    return [
      "All",
      "AA",
      "0-10",
      "10-20",
      "20-30",
      "30-40",
      "40-50",
      "50-60",
      "60-70",
      "70-80",
      "80-90",
      "90-100",
      "0-50",
      "0-60",
      "0-70",
      "0-80",
      "0-90",
      "0-100",
    ].map((option) => (
      <option
        key={option}
        value={
          option === "All" ? "" : option === "AA" ? "AA" : `range:${option}`
        }
      >
        {option}
      </option>
    ));
  };

  const generateDropdownOptions = (key) => {
    const uniqueValues = [
      ...new Set(testCandidates.map((candidate) => candidate[key])),
    ];
    return uniqueValues
      .filter((option) => option)
      .map((value, index) => (
        <option key={index} value={value}>
          {value}
        </option>
      ));
  };

  const exportToExcel = () => {
    const filteredData = filterCandidates().map(({ id, ...rest }) => rest);
  
    const headerMap = {
      test_name: "Test Name",
      college_id: "College",
      department_id: "Department",
      year: "Year",
      user_name: "Login ID",
      registration_number: "Reg_No",
      student_name: "Candidate",
      email_id: "Email",
      mobile_number: "Contact No",
      gender: "Gender",
      dtm_start: "Start Date",
      dtm_end: "End Date",
      total_score: "Total Score",
      avg_mark: "Avg Mark",
    };
  
    // Process data to match headers
    const wsData = filteredData.map((candidate) => {
      const modifiedCandidate = {};
      Object.keys(headerMap).forEach((key) => {
        modifiedCandidate[headerMap[key]] = candidate[key];
      });
      return modifiedCandidate;
    });
  
    // Create a new ExcelJS workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Report');
  
    // Set up columns in worksheet
    const columns = Object.keys(headerMap).map((key) => ({
      header: headerMap[key],
      key: key,
      width: 20
    }));
    worksheet.columns = columns;
  
    // Add rows to worksheet
    wsData.forEach((row) => {
      worksheet.addRow(row);
    });
  
    // Style header row
    worksheet.getRow(1).font = { bold: true };
  
    // Generate Excel file and trigger download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, 'test_report.xlsx');
    });
  };
  
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filterCandidates().length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = filterCandidates().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const getPaginationItems_OLD = () => {
    let items = [];
    const maxDisplayedPages = 1; // number of pages to display before and after the current page

    if (totalPages <= 1) return items;

    items.push(
      <Pagination.Item
        key={1}
        active={1 === currentPage}
        onClick={() => handlePageChange(1)}
      >
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
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages - maxDisplayedPages - 1) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

    items.push(
      <Pagination.Item
        key={totalPages}
        active={totalPages === currentPage}
        onClick={() => handlePageChange(totalPages)}
      >
        {totalPages}
      </Pagination.Item>
    );

    return items;
  };

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
    <div>
      <div className="table-responsive-trainer">
        <div className="product-table-container">
          <h4>Test Result</h4>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              className="button-ques-save"
              style={{ width: "100px" }}
              onClick={exportToExcel}
            >
              <img src={Download} alt="Download" className="nextarrow" />
              <span>Export</span>
            </button>
            <input
              className="search-box1"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-responsive">
            <table className="product-table">
              <thead className="table-thead">
                <tr>
                  <th>
                    College
                    <br />
                    <select
                      value={filters.college_id}
                      onChange={(e) => handleFilterChange(e, "college_id")}
                    >
                      <option value="">All</option>
                      {generateDropdownOptions("college_id")}
                    </select>
                  </th>
                  <th>
                    Test Name
                    <br />
                    <select
                      value={filters.test_name}
                      onChange={(e) => handleFilterChange(e, "test_name")}
                    >
                      <option value="">All</option>
                      {generateDropdownOptions("test_name")}
                    </select>
                  </th>
                  <th>
                    Year
                    <br />
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange(e, "year")}
                    >
                      <option value="">All</option>
                      {generateDropdownOptions("year")}
                    </select>
                  </th>
                  <th>
                    Department
                    <br />
                    <select
                      value={filters.department_id}
                      onChange={(e) => handleFilterChange(e, "department_id")}
                    >
                      <option value="">All</option>
                      {generateDropdownOptions("department_id")}
                    </select>
                  </th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>
                    Scores
                    <br />
                    <select
                      value={filters.total_score}
                      onChange={(e) => handleFilterChange(e, "total_score")}
                    >
                      {generateTotalScoreOptions()}
                    </select>
                  </th>
                </tr>
              </thead>
              <tbody className="table-tbody">
                {currentData.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.college_id}</td>
                    <td>{candidate.test_name}</td>
                    <td>{candidate.year}</td>
                    <td>{candidate.department_id}</td>
                    <td>{candidate.dtm_start}</td>
                    <td>{candidate.dtm_end}</td>
                    <td>{candidate.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dis-page">
            <Form>
              <Form.Group
                controlId="itemsPerPageSelect"
                style={{ display: "flex" }}
              >
                <Form.Label style={{ marginRight: "10px" }}>
                  Display:
                </Form.Label>
                <Form.Control
                  style={{ width: "50px", boxShadow: "none", outline: "none" }}
                  as="select"
                  className="label-dis"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </Form.Control>
              </Form.Group>
            </Form>
            <Pagination className="pagination-custom">
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
              />
              {getPaginationItems()}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestReports;
