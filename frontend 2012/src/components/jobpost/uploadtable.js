import React, { useContext, useState, useEffect } from 'react';
import { SearchContext } from '../../allsearch/searchcontext';
import { Form, Pagination } from 'react-bootstrap';
import '../../styles/placement.css';
import {
  getjobofferscc,
  Job_Offer_Announcement_Update_API,
  Job_Offer_Email_API,deletejobofferApi

} from '../../api/endpoints';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import ErrorModal from '../auth/errormodal';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import back from "../../assets/images/backarrow.png";
import Uploadjoboffers from './joboffer'
const JobTable = () => {
  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({});
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [students, setstudents] = useState([]);


  const [showEmailModal, setShowEmailModal] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Store the selected item when "Email" is clicked
  const [showFileInput, setShowFileInput] = useState(false);

  const navigate = useNavigate();

  const handleCloseError = () => {
    setShowError(false);
  };

  const fetchTraineeData = () => {
    getjobofferscc()
      .then(data => {
        console.log("Fetched Data: ", data);  // Log the fetched data
        setstudents(data);
        setFilteredStudents(data);  // Update the filtered students as well
      })
      .catch(error => {
        console.error('Error fetching trainee data:', error);
      });
  };

  useEffect(() => {
    fetchTraineeData();  // Fetch data when component mounts
  }, []);

  useEffect(() => {
    setFilteredStudents(students);  // Update filtered students when students change
  }, [students]);


  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
 const [selectedRows, setSelectedRows] = useState([]);  // Track selected rows
  const [selectAll, setSelectAll] = useState(false); // Track master checkbox

  const handleRowSelect = (jobId) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(jobId)
        ? prevSelected.filter((id) => id !== jobId) // Deselect
        : [...prevSelected, jobId] // Select
    );
  };

  // ✅ Handle master checkbox select/deselect
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(currentData.map((item) => item.id)); // Select only current table rows
    }
    setSelectAll(!selectAll);
  };

  // ✅ Handle deleting selected rows
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one row to delete.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedRows.length} selected job(s)?`
    );
    if (!confirmDelete) return;

    try {
      // ✅ Delete API call for each selected job ID
      await Promise.all(selectedRows.map((jobId) => deletejobofferApi(jobId)));

      setErrorMessage("Selected jobs deleted successfully!");
      setShowError(true);
      fetchTraineeData();
     
      // ✅ Remove deleted rows from the table UI
      const updatedData = currentData.filter(
        (item) => !selectedRows.includes(item.id)
      );

      setSelectedRows([]); // Clear selection after deletion
    } catch (error) {
      console.error("❌ Error deleting jobs:", error);
      setErrorMessage("Failed to delete selected jobs. Check console for details.");
      setShowError(true);
    }
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
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

  const handleAnnouncementClick = (item) => {
    const formattedAnnouncement = `${item.colleges && Array.isArray(item.colleges) ? item.colleges.join(", ") : item.colleges} - ${item.company_name} - ${item.post_name}`;

    // Call the API to update the announcement
    Job_Offer_Announcement_Update_API(item.id, formattedAnnouncement)
      .then(response => {
        if (response.status === 'success') {  // Use strict equality for comparison
          setErrorMessage(response.message);  // Display the success message from the response
          setShowError(true);
          console.log('Announcement updated successfully:', response);
          // Optionally, you can perform other actions, like refreshing the data
        }
      })
      .catch(error => {
        console.error('Error updating announcement:', error);
        setErrorMessage('Failed to update the announcement.');
        setShowError(true);  // Show error modal in case of failure
      });
  };



  const handleShowModal = (item) => {
    setSelectedItem(item);
    setShowEmailModal(true); // Show modal on Email icon click
  };

  const handleCloseModal = () => {
    setShowEmailModal(false); // Close modal
    setShowFileInput(false);  // Reset file input
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleYesClick = () => {
    setShowFileInput(true); // Show file input if "Yes" is clicked
  };

  const handleNoClick = () => {
    setShowEmailModal(false); // Close modal
    sendEmailToPlacement(selectedItem);  // Directly send email if "No" is clicked
  };

  const handleFileSubmit = () => {
    if (file && selectedItem) {
      // Perform file upload logic if necessary and then send the email
      sendEmailToPlacement(selectedItem, file);
    }
    handleCloseModal(); // Close modal after submitting
  };


  const sendEmailToPlacement = (item, attachment = null) => {
    // Use the correct property name `college_ids`
    const collegeIds = item.college_ids ? item.college_ids : [];
    const postName = item.post_name;
    const departments = item.departments ? item.departments.join(', ') : '';
    const companyName = item.company_name;


    let attach_file = null;
    if (attachment) {
      attach_file = attachment;  // Assign the attachment to the variable
    }

    console.log('Sending email to placement...');
    console.log('College IDs:', collegeIds);
    console.log('Post Name:', postName);
    console.log('Departments:', departments);
    console.log('Company Name:', companyName);
    console.log('attach_file Name:', attach_file);

    // Call the Job_Offer_Email_API function
    Job_Offer_Email_API(collegeIds, postName, departments, companyName, attach_file)
      .then(response => { // Use strict equality for comparison
        setErrorMessage('Email sent successfully');  // Display the success message from the response
        setShowError(true);
        console.log('Email sent successfully:', response);
        // Optionally, handle success UI updates or notifications here
      })
      .catch(error => {
        console.error('Error sending email:', error);
        // Optionally, handle error UI updates or notifications here
      });
  };

  const handleUpdateClick = (id) => {
    // Navigate to the UpdateJob page and pass the job ID as a URL parameter
    navigate(`/update-job/${id}`);
  };

 
  return (
    <div className="product-table-container">


      <div className="test-access-table-wrapper">
        
      <button className='button-ques-save-add' style={{ width: "100px",   }} onClick={handleDeleteSelected}>
                Delete 
            </button>
        <table className="placement-table">
          <thead >
            <tr>
            <th>
                                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} /> {/* Master Checkbox */}
                            </th>
              <th style={{ textAlign: "center" }}>
                Company

              </th>
              <th style={{ textAlign: "center" }}>Colleges</th>
              <th style={{ textAlign: "center" }}>Department</th>
              <th style={{ textAlign: "center" }}>Designation</th>
              <th style={{ textAlign: "center" }}>Announcement</th>
              <th style={{ textAlign: "center" }}>Email</th>

            </tr>
          </thead>
          <tbody >
            {currentData.map((item) => (
              <tr key={item.id} style={{ padding: '30px', textAlign: "center" }}>
                 <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleRowSelect(item.id)}
                    />
                  </td>
                <td style={{ textAlign: "center", textDecoration:"underline" }} onClick={() => handleUpdateClick(item.id)}>{item.company_name}</td>
                {/*<td>{item.student_count}</td>*/}
                <td style={{ textAlign: "center" }}>
                  {item.colleges && Array.isArray(item.colleges) ? item.colleges.join(", ") : item.colleges}
                </td>
                <td style={{ textAlign: "center" }}>
                  {item.departments && Array.isArray(item.departments) ? item.departments.join(", ") : item.departments}
                </td>


                <td style={{ textAlign: "center" }}>
                  {item.post_name}
                </td>
                <td style={{ textAlign: "center" }} onClick={() => handleAnnouncementClick(item)}>
                  <FontAwesomeIcon style={{ fontSize: "24px" }} icon={faBullhorn}  className="icon-bullhorn"/>
                </td>
                <td style={{ textAlign: "center" }}>
                  <FontAwesomeIcon
                    style={{ fontSize: "24px" }}
                    icon={faEnvelope}
                    onClick={() => handleShowModal(item)} // Pass the item to the function
                    className="icon-envelope"
                  />
                </td>




              </tr>
            ))}
          </tbody>
        </table>
        <p></p>

      </div>


      {/* Modal to confirm email sending */}
      <Modal show={showEmailModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 'bold' }} >Confirm Email</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontWeight: 'bold' }}>
          Are you sure, Do you need to attach a file for this Job posting?
          <p></p>
          {showFileInput && (
            <div>
              <input type="file" onChange={handleFileChange} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!showFileInput && (
            <>
              <Button className='button-ques-save' style={{ border: "none", marginRight: '10px', fontWeight: 'bold' }} onClick={handleNoClick}>No</Button>
              <Button className='button-ques-save' style={{ border: "none", fontWeight: 'bold' }} onClick={handleYesClick}>Yes</Button>
            </>
          )}
          {showFileInput && (
            <Button className='button-ques-save' style={{ border: "none", fontWeight: 'bold' }} onClick={handleFileSubmit}>Submit</Button>
          )}
        </Modal.Footer>
      </Modal>

      <div className='dis-page'>
        <Form>
          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
            <Form.Control className='label-dis' style={{ width: "50px", boxShadow: 'none', outline: 'none' }} as="select" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
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
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default JobTable;
