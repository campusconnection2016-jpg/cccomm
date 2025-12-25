import React, { useState, useEffect, useContext } from "react";
import { Table, Form, Pagination } from "react-bootstrap";
import { getTestSchedule_Student_API } from "../../api/endpoints"; // Adjust import as needed
import { Link } from "react-router-dom";
import { SearchContext } from "../../allsearch/searchcontext";

const TestSchedule = ({ collegeName, username, institute }) => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [filters, setFilters] = useState({
    dtm_start: "",
    dtm_end: "",
  });
  const [searchable, setSearchable] = useState("");
  const [search, setSearch] = useState("");
  const { searchQuery } = useContext(SearchContext);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getTestCandidates();
  }, [collegeName, username, institute]);

  const getTestCandidates = () => {
    getTestSchedule_Student_API(username)
      .then((testCandidatesData) => {
        setTestCandidates(testCandidatesData);
        console.log("Test Schedule: ", testCandidatesData);
      })
      .catch((error) => {
        console.error("Error fetching test candidates:", error);
      });
  };

  const searchTerm = searchQuery || searchable;
  const filteredTestCandidates = testCandidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      !searchTerm || // If no search term, return all candidates
      Object.values(candidate).some((value) =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  });

  // const filteredTestCandidates = testCandidates.filter(candidate => {
  //     const searchLower = searchable.toLowerCase();
  //     return (
  //         candidate.test_name?.toLowerCase().includes(searchLower) ||
  //         candidate.question_id__question_paper_name?.toLowerCase().includes(searchLower) ||
  //         candidate.dtm_start?.toLowerCase().includes(searchLower) ||
  //         candidate.dtm_end?.toLowerCase().includes(searchLower) ||
  //         candidate.total_score?.toString().toLowerCase().includes(searchLower)
  //     );
  // });

  const handleSearchChange = (e) => {
    setSearchable(e.target.value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredTestCandidates.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTestCandidates.length / itemsPerPage);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Disable copy events
    const handleCopy = (e) => {
      e.preventDefault();
    };

    // Optionally, disable screenshot (making it more difficult)
    const handleKeyDown = (e) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.shiftKey && e.key === "S") // Windows Snipping Tool
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getTestLink = (testType) => {
    switch (testType) {
      case "MCQ Test":
        return "/test/ts-online";
      case "Coding Test":
        return "/test/ts-code";
      default:
        return "#"; // Default or fallback link
    }
  };

  return (
    <div className="no-select no-right-click">
      <div className="no-screenshot-overlay"></div>
      <div
        className="product-table-container-stu"
        style={{ marginLeft: "0px" }}
      >
        <h5 className="header">TEST SCHEDULES</h5>
        <input
          className="search-box"
          type="text"
          placeholder="Search..."
          value={searchable}
          onChange={handleSearchChange}
        />
        <div className="po-table-responsive-t-lms">
          <table className="placement-table-t">
            <thead >
              <tr>
                <th>Test Name</th>
               {/*} <th>Question Name</th>*/}
                <th>Start Date</th>
                <th>End Date</th>
                <th>Is Completed</th>
               
              </tr>
            </thead>
            <tbody >
              {currentData.map((candidate) => (
                <tr
                  key={candidate.id}
                  className={candidate.is_active ? "active-row" : ""}
                >
                  <td>
                    <Link
                      to={getTestLink(candidate.question_id__test_type)}
                      style={{ color: "white" }}
                    >
                      {
      candidate.test_name?.includes('_') 
        ? candidate.test_name.split('_').slice(2).join('_') 
        : candidate.test_name
    }
                    </Link>
                  </td>
                {/*}  <td>{candidate.question_id__question_paper_name}</td>*/}
                  <td>{formatDate(candidate.dtm_start)}</td>
                  <td>{formatDate(candidate.dtm_end)}</td>
                  <td>{candidate.is_active ? "Yes" : "No"}</td>
                 {/*} <td style={{ textAlign: "center" }}>
                    {candidate.is_active ? candidate.total_score : "-"}
                  </td>*/}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p></p>
        <div className="dis-page">
          <Form>
            <Form.Group
              controlId="itemsPerPageSelect"
              style={{ display: "flex" }}
            >
              <Form.Label style={{ marginRight: "10px" }}>Display:</Form.Label>
              <Form.Control
                as="select"
                className="label-dis"
                style={{ width: "50px", boxShadow: "none", outline: "none" }}
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </Form.Control>
            </Form.Group>
          </Form>
          <Pagination
            className="pagination-custom"
            style={{ marginTop: "-2px" }}
          >
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
    </div>
  );
};

export default TestSchedule;
