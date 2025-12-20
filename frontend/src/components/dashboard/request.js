
import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Pagination } from 'react-bootstrap';
import { getRequestQueries_API, updateStudentRequestStatusApi } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import '../../styles/global.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure this import if using npm
import { SearchContext } from '../../allsearch/searchcontext';
import { useParams } from "react-router-dom";

const Request = () => {
    const [testCandidates, setTestCandidates] = useState([]);
    const [searchable, setSearchable] = useState('');
    const { searchQuery } = useContext(SearchContext);
    const [testNameFilter, setTestNameFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [statusFilter, setstatusFilter] = useState("");
    const [topicFilter, setTopicFilter] = useState("");

    const [studentRequests, setStudentRequests] = useState([]);

    const { collegeId } = useParams();

    useEffect(() => {
        getTestCandidates();
        console.log("College ID from URL Params:", collegeId);
    }, [collegeId]);

    const getTestCandidates = () => {
        console.log("Fetching test candidates...");

        const queryParam = collegeId === "all" ? null : collegeId;
        console.log("Query Parameter:", queryParam);

        getRequestQueries_API(queryParam)
            .then((data) => {
                console.log("Raw Fetched Data:", data); // Log entire response

                if (Array.isArray(data)) {
                    console.log("Setting testCandidates state:", data);
                    setTestCandidates(data);
                } else if (data && Array.isArray(data.results)) {
                    console.log("Setting testCandidates state from results:", data.results);
                    setTestCandidates(data.results); // Handle paginated API responses
                } else {
                    console.error("Unexpected data format:", data);
                }
            })
            .catch((error) => {
                console.error("Error fetching test candidates:", error);
            });
    };
    useEffect(() => {
        console.log("Rendering table with testCandidates:", testCandidates);
    }, [testCandidates]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page on search
    }, [searchable, searchQuery, testNameFilter, departmentFilter, statusFilter, topicFilter]);

    // Filter search results
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
            (!testNameFilter || item.student_name === testNameFilter) &&
            (!departmentFilter || (item.student_query && item.student_query.split(", ").includes(departmentFilter))) &&  // ✅ Fixed department filter
            //  (!statusFilter || (item.status && item.status.toString() === statusFilter)) &&  // ✅ Fixed status filter
            (!statusFilter || (
                item.status &&
                statusFilter.split(",").some(status => item.status.split(", ").includes(status.trim()))
            )) &&
            (!topicFilter || item.is_query_type === topicFilter)
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

    const handleDecline = async (studentId) => {
        console.log(`Declining request for Student ID: ${studentId}`);
        try {
            await updateStudentRequestStatusApi(studentId, "Declined");

            setTestCandidates((prevCandidates) => {
                const updatedCandidates = prevCandidates.filter(candidate => candidate.student_id !== studentId);
                console.log("Updated Candidates after Decline:", updatedCandidates);
                return updatedCandidates;
            });

        } catch (error) {
            console.error(`Failed to decline request with Student ID: ${studentId}`, error);
        }
    };

    const handleAccept = async (studentId) => {
        console.log(`Accepting request for Student ID: ${studentId}`);
        try {
            await updateStudentRequestStatusApi(studentId, "Accepted", 'PO');

            setTestCandidates((prevCandidates) => {
                const updatedCandidates = prevCandidates.filter(candidate => candidate.student_id !== studentId);
                console.log("Updated Candidates after Accept:", updatedCandidates);
                return updatedCandidates;
            });

        } catch (error) {
            console.error(`Failed to accept request with Student ID: ${studentId}`, error);
        }
    };


    return (
        <div className='table-testschedule'>
            <div className="product-table-container">
                <h6>Queries</h6>

                <input
                    className="search-box1"
                    type="text"
                    placeholder="Search..."
                    value={searchable}
                    onChange={(e) => setSearchable(e.target.value)}
                />

                <div className='table-responsive-schedule'>
                    <table className="product-table" >

                        <thead className="table-thead" style={{ textAlign: "center" }}>
                            <tr>
                                <th style={{ width: "200px", textAlign: "center" }}>
                                    StudentName

                                </th>
                                <th style={{ textAlign: "center" }}>
                                    Queries

                                </th>
                                <th style={{ textAlign: "center" }}>
                                    status

                                </th>
                                <th style={{ textAlign: "center" }}>
                                    Requested Date
                                </th>
                               {/*} <th style={{ textAlign: "center" }}>Accept</th>
                                <th style={{ textAlign: "center" }}>Decline</th>
                            */}</tr>

                        </thead>
                        <tbody>
                            {testCandidates.length > 0 ? (
                                currentData.map((candidate, index) => {
                                    console.log("Rendering Row:", candidate); // Debugging Each Row
                                    return (
                                        <tr key={candidate.id || index}>

                                            <td style={{ textAlign: "center" }}>{candidate.student_name}</td>
                                            <td style={{ textAlign: "center" }}>{candidate.student_query}</td>
                                            <td style={{ textAlign: "center" }}>{candidate.status}</td>



                                            <td style={{ textAlign: "center" }}>{new Date(candidate.dtm_request).toLocaleString()}</td>
                                          {/*}  <td>
                                                <button className='button-ques-save' onClick={() => handleAccept(candidate.student_id)}>Accept</button>
                                            </td>
                                            <td>
                                                <button className='button-ques-save' onClick={() => handleDecline(candidate.student_id)}>Decline</button>
                                            </td>*/}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6">No Data Available</td>
                                </tr>
                            )}
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

export default Request;







