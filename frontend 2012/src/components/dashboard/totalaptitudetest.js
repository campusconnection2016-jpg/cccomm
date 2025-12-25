
import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Pagination } from 'react-bootstrap';
import { useLocation, useNavigate } from "react-router-dom";
import { get_test_name_group_API_TotalAptitudeTest } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import '../../styles/global.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure this import if using npm
import { SearchContext } from '../../allsearch/searchcontext';
import { useParams } from "react-router-dom";
import back from "../../assets/images/backarrow.png";
const TotalAptitudeTest = () => {
    const [testCandidates, setTestCandidates] = useState([]);
    const [searchable, setSearchable] = useState('');
    const { searchQuery } = useContext(SearchContext);
    const { collegeId } = useParams();
    const [testNameFilter, setTestNameFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [topicFilter, setTopicFilter] = useState("");

    useEffect(() => {
        getTestCandidates();
    }, [collegeId, departmentFilter, yearFilter]);

    const getTestCandidates = () => {
        get_test_name_group_API_TotalAptitudeTest(
            collegeId === "all" ? null : collegeId,
            departmentFilter || null,  // ✅ Pass department only if selected
            yearFilter || null  // ✅ Pass year only if selected
        )
            .then((data) => {
                setTestCandidates(data);
            })
            .catch((error) => console.error("Error fetching test candidates:", error));
    };


    useEffect(() => {
        setCurrentPage(1); // Reset to first page on search
    }, [searchable, searchQuery, testNameFilter, departmentFilter, yearFilter, topicFilter]);

    const uniqueTestNames = [...new Set(testCandidates.map((item) => item.test_name))];
    const uniqueDepartments = [...new Set(
        testCandidates.flatMap((item) => (item.department_name ? item.department_name.split(", ") : []))
    )];
    const uniqueYears = [...new Set(
        testCandidates.flatMap((item) => (item.year ? item.year.split(", ") : []))
    )];
    const uniqueTopics = [...new Set(testCandidates.map((item) => item.skill_type))];

    // ✅ **Corrected Filtering Logic**
    const filteredData = testCandidates
        .filter((item) =>
            !searchQuery || Object.values(item).some((val) =>
                val?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .filter((item) =>
            !searchable || Object.values(item).some((val) =>
                val?.toString().toLowerCase().includes(searchable.toLowerCase()))
        )
        .filter((item) =>
            (!testNameFilter || item.test_name === testNameFilter) &&
            (!departmentFilter || (item.department_name && item.department_name.split(", ").includes(departmentFilter))) &&  // ✅ Fixed department filter
            // (!yearFilter || (item.year && item.year.toString() === yearFilter)) &&  // ✅ Fixed year filter
            (!yearFilter || (
                item.year &&
                yearFilter.split(",").some(year => item.year.split(", ").includes(year.trim()))
            )) &&
            (!topicFilter || item.skill_type === topicFilter)
        );
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination values


    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
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
 const navigate = useNavigate();

  const handleBack = () => {
    // Navigate to root ("/") which renders Dashboard
    navigate('/');
  };
    return (
        <div className='table-testschedule'>
            <div className="product-table-container">
                  
                <h6>Total Atitude Test Report</h6>

                <input
                    className="search-box1"
                    type="text"
                    placeholder="Search..."
                    value={searchable}
                    onChange={(e) => setSearchable(e.target.value)}
                />
                    <button
                      className="button-ques-save"
                      style={{ width: "110px", padding: "10px", textAlign: "center",float:"right",marginTop:"-10px" }}
                      onClick={handleBack}
                    >
                      <img src={back} className="nextarrow" alt="Back" /> Back
                    </button>
                <div className='table-responsive-schedule'>
                    <table className="product-table" >

                        <thead className="table-thead" style={{ textAlign: "center" }}>
                            <tr>
                                <th style={{ width: "200px", textAlign: "center" }}>
                                    Test Name

                                </th>
                                <th style={{ textAlign: "center" }}>
                                    Department Name

                                </th>
                                <th style={{ textAlign: "center" }}>
                                    Year

                                </th>
                                <th style={{ textAlign: "center" }}>
                                    Topic

                                </th>
                                <th style={{ textAlign: "center" }}>Candidates</th>
                                <th style={{ textAlign: "center" }}>View Results</th>
                            </tr>
                            <tr>
                                <th style={{ textAlign: "center" }}>
                                    <select className="dropdown-custom" value={testNameFilter} onChange={(e) => setTestNameFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {uniqueTestNames.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </th>
                                <th style={{ textAlign: "center" }}>
                                    <select className="dropdown-custom" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {uniqueDepartments.map((dept) => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </th>
                                <th style={{ textAlign: "center" }}>
                                    <select className="dropdown-custom" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {uniqueYears.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </th>
                                <th style={{ textAlign: "center" }}>
                                    <select className="dropdown-custom" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {uniqueTopics.map((topic) => (
                                            <option key={topic} value={topic}>{topic}</option>
                                        ))}
                                    </select>
                                </th>
                                <th></th>
                                <th></th>
                            </tr>

                        </thead>

                        <tbody className="table-tbody" style={{ fontSize: '14px' }} >
                            {currentData
                                .map((item) => (
                                    <tr key={item.id} className="table-row">
                                        <td style={{ textAlign: "center" }}>{item.test_name}</td>
                                        <td style={{ textAlign: "center" }}>{item.department_name?.replace(/^,*/, '').trim()}</td>
                                        <td style={{ textAlign: "center" }}>{item.year?.replace(/^,*/, '').trim()}</td>
                                        <td style={{ textAlign: "center" }}>{item.skill_type}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <Link to={`/test_candidates/${item.test_name}/${item.college_id}/`} state={{ origin: "TotalAptitudeTest" }}  style={{ color: "white" }}>
                                                {item.student_count}
                                            </Link>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Link
                                                to={`/test-result-new/${item.test_name}/${item.college_id}/`}
                                                state={{ origin: "TotalAptitudeTest" }}
                                                style={{ color: "white" }}
                                            >
                                                {item.active_student_count}
                                            </Link>
                                        </td>

                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <p></p>
                <div className='dis-page'>
                    <Form>
                        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
                            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
                            <Form.Control
                                className='label-dis'
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
                    </Form>
                    <Pagination className="pagination-custom">
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

export default TotalAptitudeTest;







