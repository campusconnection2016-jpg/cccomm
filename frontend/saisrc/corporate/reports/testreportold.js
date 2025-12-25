import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Pagination } from 'react-bootstrap';
import { getTestReports_API_Cor, getDistinct_test_Cor_API, get_college_Ids_Company_API } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import '../../styles/global.css';
import { testNameContext } from '../test/context/testtypecontext';
import ErrorModal from '../../components/auth/errormodal';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { SearchContext } from '../../allsearch/searchcontext';

const TestReports = ({ institute, username }) => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [distinctTests, setDistinctTests] = useState({});
  const [filters, setFilters] = useState({
    test_name: '',
    college_id: [],
    department_id: '',
    year: ''
  });

  const { setTestName } = useContext(testNameContext);
  const { searchQuery } = useContext(SearchContext);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [placeholder, setPlaceholder] = useState("Select Test Name");
  const [placeholderDept, setPlaceholderDept] = useState("Select Department");
  const [placeholderYear, setPlaceholderYear] = useState("Select Year");
  const [searchable, setSearchable] = useState('');

  const handleCloseError = () => {
    setShowError(false);
  };

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Update the current data based on filtered candidates
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = testCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(testCandidates.length / itemsPerPage);

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
    <div>
      <div className='table-testschedule'>
        <div className="product-table-container-repo-off">
          <h4>Test Report</h4>
          <input
            className="search-box1"
            type="text"
            placeholder="Search..."
            value={searchable}
            onChange={(e) => setSearchable(e.target.value)}
          />
          <div className='table-responsive2'>
            <table className="product-table">
              <thead className="table-thead" style={{ textAlign: "center" }}>
                <tr className='header-row'>
                  <th style={{ textAlign: "center" }} className='title-place'>
                    <select
                      name="test_name"
                      value={filters.test_name}
                      className="dropdown-custom"
                      style={{ width: "500px" }}
                      onFocus={() => setPlaceholder("All Tests")}
                    >
                      <option value="">{placeholder}</option>
                      {distinctTests.distinct_test_names?.map(test => (
                        <option key={test.test_name} value={test.test_name}>
                          {test.test_name}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th style={{ textAlign: "center" }} className='title-place'>
                    <select
                      name="department_id"
                      value={filters.department_id}
                      className="dropdown-custom"
                      style={{ width: "200px" }}
                      onFocus={() => setPlaceholderDept("All Departments")}
                    >
                      <option value="">{placeholderDept}</option>
                      {distinctTests.distinct_departments?.map(department => (
                        <option key={department.department_id} value={department.department_id}>
                          {department.department_name}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th style={{ textAlign: "center" }} className='title-place'>
                    <select
                      name="year"
                      value={filters.year}
                      className="dropdown-custom"
                      style={{ width: "200px" }}
                      onFocus={() => setPlaceholderYear("All Years")}
                    >
                      <option value="">{placeholderYear}</option>
                      {distinctTests.distinct_years?.map(year => (
                        <option key={year.year} value={year.year}>
                          {year.year}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th style={{ textAlign: "center" }}>Student Count</th>
                </tr>
              </thead>
              <tbody className="table-tbody" style={{ fontSize: '14px' }}>
                {currentData.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td style={{ textAlign: "center" }}>{item.test_name}</td>
                    <td style={{ textAlign: "center" }}>{item.department_name}</td>
                    <td style={{ textAlign: "center" }}>{item.year}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Link to={`/test-result/placement/?test_name=${encodeURIComponent(item.test_name)}&college_id=${encodeURIComponent(item.college_name)}&department_id=${encodeURIComponent(item.department_name)}&year=${encodeURIComponent(item.year)}`} style={{ color: "white" }}>
                        {item.total_students}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
    </div>
  );
};

export default TestReports;
