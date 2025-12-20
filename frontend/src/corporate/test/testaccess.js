import React, { useState, useEffect, useContext } from 'react';
//import { Table } from 'react-bootstrap';
import TestaccessForm from './testaccessform';
import { deleteTestcadidateApi, get_test_name_group_API } from '../../api/endpoints';
import Footer from '../../footer/footer';
import { SearchContext } from '../../allsearch/searchcontext';
import { Table, Form, Pagination } from 'react-bootstrap';
import '../../styles/placement.css';
import { testNameContext } from './context/testtypecontext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';
import ErrorModal from '../../components/auth/errormodal';
const Testaccess = ({ collegeName, username, institute }) => {
  const [testCandidates, setTestCandidates] = useState([]);
  const [showAddTest, setShowAddTest] = useState(true); // State variable to track visibility
  const { searchQuery } = useContext(SearchContext);
  const [test_nameSearch, setTestNameSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { setTestName } = useContext(testNameContext);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
 
  const handleCloseError = () => {
    setShowError(false);
};
  const handleNextButtonClick = () => {
    setShowAddTest(false); // Hide Add Test container
  };

  useEffect(() => {
    getTestCandidates();
  }, [testCandidates]); // Run once on component mount

  const getTestCandidates = () => {
    get_test_name_group_API()
      .then(data => {
        setTestCandidates(data);
      })
      .catch(error => console.error('Error fetching test candidates:', error));
  };

  const handleGetTestName = (tName) => {
    setTestName(tName);
    console.log('Set test name: ', tName);
};


  // Function to group by test_name, startDate, endDate, and question_name
  const groupByTestDetails = testCandidates => {
    return testCandidates.reduce((acc, candidate) => {
      const { test_name, dtm_start, dtm_end, question_paper_name } = candidate;
      const key = `${test_name}-${dtm_start}-${dtm_end}-${question_paper_name}`;
      if (!acc[key]) {
        acc[key] = {
          test_name,
          dtm_start,
          dtm_end,
          question_paper_name,
          student_count: 0,
          candidates: [],
        };
      }
      acc[key].student_count++;
      acc[key].candidates.push(candidate);
      return acc;
    }, {});
  };

  const groupedByTestDetails = groupByTestDetails(testCandidates);
  const handleDelete = (test_name) => {
    console.log('test_name: ', test_name);
    deleteTestcadidateApi(test_name)
        .then(() => {
          setErrorMessage('Test candidate deleted successfully');
          setShowError(true);
            //alert('Test candidate deleted successfully');
            getTestCandidates(); // Refresh the data
        })
        .catch(error => {
            console.error('Error deleting test candidate:', error);
           // alert('Failed to delete test candidate');
           setErrorMessage('Failed to delete test candidate');
           setShowError(true);
        });
};

  const totalPages = Math.ceil(testCandidates.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = testCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    
    <div>
      {showAddTest && (
        <div>
          <TestaccessForm onNextButtonClick={handleNextButtonClick} institute={institute} username={username} collegeName={collegeName} />
          <br />
          <br />
         
        </div>
      )}

      {!showAddTest && (
        <div className="product-table-container">
          <h4>Test Schedule</h4>

          <input
            className="search-box1"
            type="text"
            placeholder="Search..."
            value={test_nameSearch}
            onChange={(e) => setTestNameSearch(e.target.value)}
          />
          <table className="product-table" >
            <thead className="table-thead">
              <tr>
                <th>Test Name</th>
                <th>Question Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Cadidates</th>
                <th>Add</th>
                <th>View Results</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody className="table-tbody">
            {currentData
                .filter(item =>
                  !searchQuery ||
                  (item.test_name && item.test_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.question_paper_name && typeof item.question_paper_name === 'string' && item.question_paper_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.dtm_start && typeof item.dtm_start === 'string' && item.dtm_start.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .filter(item =>
                  !test_nameSearch ||
                  (item.test_name && item.test_name.toLowerCase().includes(test_nameSearch.toLowerCase())) ||
                  (item.question_paper_name && typeof item.question_paper_name === 'string' && item.question_paper_name.toLowerCase().includes(test_nameSearch.toLowerCase())) ||
                  (item.dtm_start && typeof item.dtm_start === 'string' && item.dtm_start.toLowerCase().includes(test_nameSearch.toLowerCase())) ||
                  (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(test_nameSearch.toLowerCase()))
                )
                .map((item) => (
                <tr key={item.id} className="table-row">
                  <td>
                    <Link to='/update-test/' onClick={()=> handleGetTestName(item.test_name)} style={{color:"white"}}>{item.test_name}</Link>
                  </td>
                  <td>{item.question_paper_name}</td>
                  <td>{item.dtm_start}</td>
                  <td>{item.dtm_end}</td>
                  <td style={{textAlign:"center"}}>
                    <Link to={`/test-report/${item.test_name}`} style={{color:"white"}}>
                      {item.student_count}
                    </Link>
                  </td>
                  <td>
                            <Link to={`/add-candidate/${item.test_name}`}>
        <button className="action-button add">
          <i className="fas fa-plus plus-icon"></i>
        </button>
                            </Link>
                            </td>
                  <td>
                    <Link to={`/test-result/${item.test_name}`} style={{color:"white"}}>
                      <button className="action-button view" style={{color:"white"}}>👁</button>
                    </Link>
                  </td>
                  <td>
                    <button className="action-button delete" style={{color:"orange"}} onClick={() => handleDelete(item.test_name)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table><p></p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form>
              <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
                <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
                <Form.Control style={{width:"50px",boxShadow: 'none', outline: 'none'}}
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
            <Pagination className="pagination-custom" style={{marginTop:"-2px", boxShadow: 'none', outline: 'none'}}>
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isFirstFive = page <= 3;
                const isLastFive = page > totalPages - 3;
                const isInRange = page >= currentPage - 2 && page <= currentPage + 2;

                if (isFirstFive || isInRange || isLastFive) {
                  return (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                } else if ((page === 6 && totalPages > 10) || (page === totalPages - 1)) {
                  return <Pagination.Ellipsis key="ellipsis" />;
                }

                return null;
              })}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </div>)}
        <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
     
    </div >
  );
};

export default Testaccess;
