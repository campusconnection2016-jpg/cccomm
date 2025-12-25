import React, { useState, useEffect, useContext } from 'react';
import { Pagination, Form } from 'react-bootstrap';
import { JobUpdateTableApi, getjobApi } from '../../api/endpoints';
import { SearchContext } from '../../allsearch/searchcontext';
import '../../styles/placement.css';
import { useNavigate } from 'react-router-dom';
import ErrorModal from '../../components/auth/errormodal';
const JobUpdateTable = ({ collegeName,institute }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const { searchQuery } = useContext(SearchContext);
  const [error, setError] = useState(null);
  const [job, setjob] = useState([]);
  const [showError, setShowError] = useState(false);
  const handleCloseError = () => {
    setShowError(false);
  };
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentjob = job.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(job.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginationItems = () => {
    let items = [];
    const maxDisplayedPages = 1; // number of pages to display before and after the current page

    if (totalPages <= 1) return items;

    items.push(
      <Pagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>
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
        <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
          {page}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages - maxDisplayedPages - 1) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" />);
    }

    items.push(
      <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>
        {totalPages}
      </Pagination.Item>
    );

    return items;
  };


  useEffect(() => {
    const fetchjobs = async () => {
      try {
        const response = await getjobApi();
        console.log('Response job: ', response);
        console.log('College Name: ', collegeName);

        if (response && Array.isArray(response)) {
          // Filter jobs by collegeName
          const filteredJobs = response.filter(job => job.colleges.includes(collegeName));
          console.log('filtered Job: ', filteredJobs);

          setjob(filteredJobs);
        } else {
          setjob([]); // Set to empty array if response is not valid
        }
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('Failed to fetch job data');
        setShowError(true);
      }
    };

    fetchjobs();
  }, [collegeName]);

  const handleUpdateClick = (id) => {
    // Navigate to the UpdateJob page and pass the job ID as a URL parameter
    navigate(`/update-job/${id}`);
  };

  const handleShowOffers = () => {
    navigate("/uploadstudentdata");
  };
  return (
    <div className="placement-container">
      <button
        className="button-po-save"
        style={{ marginRight: "20px", width: "112px" }}
        onClick={handleShowOffers}
      >
        <span>Back</span>
      </button>


      <div className='po-table-responsive-jp'>
        <table className="placement-table">
          <thead>
            <tr>
              <th>CompanyName</th>
              <th>Designation</th>
              <th>update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody >
            {console.log("Current job data for display:", currentjob)}
            {currentjob
              .map((department) => (
                <tr key={department.id}>
                  <td>{department.company_name}</td>
                  <td>{department.post_name}</td>
                  <td>
                    <td>
                      <button className="po-action-button edit" onClick={() => handleUpdateClick(department.id)} >✏️</button>
                    </td>
                  </td>
                  <td>
                    🗑
                  </td>
                </tr>
              ))}
          </tbody>
        </table></div>

      <div className='placement-display-pagination'>
        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex', marginTop: '10px' }}>
          <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
          <Form.Control
                            className='label-dis-placement'
            style={{
              width: "40px",
              boxShadow: "none",
              outline: "none",
              height: "40px",
              marginTop: "63px",
            }}
            as="select"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page on items per page change
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </Form.Control>
        </Form.Group>
        <Pagination className="pagination-custom-placement" style={{ marginLeft: "700px", marginTop: '-34px', boxShadow: 'none', outline: 'none' }}>
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {getPaginationItems()}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>

      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default JobUpdateTable;
