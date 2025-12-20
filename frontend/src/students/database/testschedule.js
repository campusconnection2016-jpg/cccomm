import React, { useState, useEffect } from 'react';
import { Table, Form, Pagination } from 'react-bootstrap';
import { getTestSchedule_Student_API } from '../../api/endpoints';

const TestSchedule = ({ collegeName, username, institute }) => {
    const [testCandidates, setTestCandidates] = useState([]);
    const [filters, setFilters] = useState({
        dtm_start: '',
        dtm_end: '',
    });
    const [searchable, setSearchable] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        getTestCandidates();
    }, [username]);
    console.log("college", institute, username)
    const getTestCandidates = () => {
        getTestSchedule_Student_API(username)
            .then(testCandidatesData => {

                setTestCandidates(testCandidatesData);
                console.log('Test Schedule: ', testCandidatesData);
            })
            .catch(error => {
                console.error('Error fetching test candidates:', error);
            });
    };

    const handleFilterChange = (columnName, value) => {
        setFilters({
            ...filters,
            [columnName]: value
        });
    };

    const filteredTestCandidates = testCandidates.filter(candidate => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key].toLowerCase();
            const candidateValue = candidate[key]?.toLowerCase();
            return candidateValue && candidateValue.includes(filterValue);
        });
    });

    const handleSearchChange = (e) => {
        setSearchable(e.target.value.toLowerCase());
    };

    const searchedTestCandidates = filteredTestCandidates.filter(candidate => {
        return Object.values(candidate).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(searchable)
        );
    });

    const totalPages = Math.ceil(searchedTestCandidates.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const currentData = searchedTestCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
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
                e.key === 'PrintScreen' ||
                (e.ctrlKey && e.shiftKey && e.key === 'S') // Windows Snipping Tool
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
    return (
        <div className="no-select no-right-click">
            <div className="no-screenshot-overlay"></div>
            <div className="product-table-container" style={{ marginLeft: '0px' }}>
                <h5 className='header'>TEST SCHEDULES</h5>
                <input
                    className="search-box"
                    type="text"
                    placeholder="Search..."
                    value={searchable}
                    onChange={handleSearchChange}
                />
                <div className='table-responsive'>
                    <table className="product-table">
                        <thead className="table-thead">
                            <tr>
                                <th>Test Name</th>
                                <th>Question Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Is Completed</th>
                                <th>Total Score</th>
                            </tr>
                        </thead>
                        <tbody className="table-tbody">
                            {currentData.map(candidate => (
                                <tr key={candidate.id} className={candidate.is_active ? 'active-row' : ''}>
                                    <td>{candidate.test_name}</td>
                                    <td>{candidate.question_id__question_paper_name}</td>
                                    <td>{formatDate(candidate.dtm_start)}</td>
                                    <td>{formatDate(candidate.dtm_end)}</td>
                                    <td>{candidate.is_active ? 'Yes' : 'No'}</td>
                                    <td style={{ textAlign: "center" }}>
                                        {candidate.is_active ? candidate.total_score : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div><p></p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Form>
                        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
                            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
                            <Form.Control
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
            </div></div>
    );
};

export default TestSchedule;
