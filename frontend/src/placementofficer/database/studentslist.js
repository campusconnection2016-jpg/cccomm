import React, { useContext, useState, useEffect } from 'react';
import { SearchContext } from '../../allsearch/searchcontext';
import { Table, Form, Pagination } from 'react-bootstrap';
import '../../styles/placement.css';
import back from '../../assets/images/backarrow.png'
import { useNavigate } from 'react-router-dom';
import { geteligiblestudentsApi} from '../../api/endpoints';
import { useParams } from 'react-router-dom';


const StudentList = () => {
  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({});
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setstudents] = useState([]);
  const { job_id } = useParams();
  console.log("print  job_id",job_id)
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/uploadstudentdata'); // This is the route that points to the Uploadstudentdata component.
  };
  useEffect(() => {
    fetchTraineeData();
  }, [job_id]);

  const fetchTraineeData = () => {
    geteligiblestudentsApi(job_id)
      .then(data => {
        setstudents(data);
        console.log('students: ', data);
      })
      .catch(error => {
        console.error('Error fetching trainee data:', error);
      });
  };

  // Define filter options for each column
 
  

  useEffect(() => {
    setFilteredStudents(filterCandidates());
  }, [filters, students]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    setCurrentPage(1); // Reset page to 1 when filters change
  };
 // Define filter options for each column
 const filterOptions = {
  department_id__department: [...new Set(students.map((student) => student.students_id__department_id__department))],
  registration_number: [...new Set(students.map((student) => student.students_id__registration_number))],
  students_name: [...new Set(students.map((student) => student.students_id__students_name))],
};

  // Function to filter data based on all active filters
  const filterCandidates = () => {
    return students.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        const studentValue = item[key];
        return !value || (studentValue && studentValue.toString().toLowerCase().includes(value.toLowerCase()));
      });
    });
  };
  
  
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  return (
    <div className="product-table-container">
      <button className='button-ques-save' onClick={handleBackClick}><img src={back} className='nextarrow' ></img>
      <span>Back</span></button>
      <div className="test-access-table-wrapper">
        <table className="product-table">
          <thead className="table-thead">
            <tr>
             
            
              <th>
  
  <select
    value={filters.students_name || ""}
    //style={{ width: "150px" }}
    onChange={(e) => handleFilterChange("students_name", e.target.value)}
    className="dropdown-custom"
  >
    <option value="">All Students</option>
    {filterOptions.students_name.map((name) => (
      <option key={name} value={name}>{name}</option>
    ))}
  </select>
</th>

             
              <th>
              
                <select
  value={filters.department_id__department || ""}
  
  onChange={(e) => handleFilterChange("department_id__department", e.target.value)}
  className="dropdown-custom"
>
  <option value="">All Departments</option>
  {filterOptions.department_id__department.map((dept) => (
    <option key={dept} value={dept}>
      {dept}
    </option>
  ))}
</select>
</th>
            <th>
            <select
    value={filters.registration_number || ""}
   
    onChange={(e) => handleFilterChange("registration_number", e.target.value)}
    className="dropdown-custom"
  >
    <option value="">All Reg Nos</option>
    {filterOptions.registration_number.map((reg) => (
      <option key={reg} value={reg}>{reg}</option>
    ))}
  </select>
  
  

</th>
              
              <th>Mobile No</th>
              <th>Email</th>
             
              <th>CGPA</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {currentData.map((item) => (
              <tr key={item.id} className="test-access-table-row" style={{ padding: '30px' }}>
                <td>{item.students_id__students_name}</td>
                <td>{item.students_id__department_id__department}</td>
               
                <td>{item.students_id__registration_number}</td>
               
                <td>{item.students_id__mobile_number}</td>
                
                <td>{item.students_id__email_id}</td>
                <td>{item.students_id__cgpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p></p>
      </div>
      <div className='dis-page'>
        <Form>
          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
            <Form.Control  className='label-dis'
                as="select" style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
               value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>
        </Form>
        <Pagination className="pagination-custom">
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {getPaginationItems()}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
    </div>
  );
};

export default StudentList;
