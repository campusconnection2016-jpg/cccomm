import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";
import Form from "react-bootstrap/Form";
import { DeleteAnnouncement_table_API, getAnnouncement_table_API, UpdateAnnouncement_table_API } from "../../api/endpoints";
import ErrorModal from "../auth/errormodal";
import { SearchContext } from "../../allsearch/searchcontext";
import { Modal } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import back from '../../assets/images/backarrow.png';
import '../../styles/trainingadmin.css'

const AnnounceTable = () => {
    const [testcontents, setTestcontents] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { searchQuery } = useContext(SearchContext);
    const [announce, setAnnounce] = useState(null);
    const [announceImage, setAnnounceImage] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedIdDelete, setSelectedIdDelete] = useState(null);
    const navigate = useNavigate();

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return testcontents.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(testcontents.length / itemsPerPage);

    const getPaginationItems = () => {
        const maxPaginationItems = 3;
        let startPage = Math.max(1, currentPage - Math.floor(maxPaginationItems / 2));
        let endPage = Math.min(totalPages, startPage + maxPaginationItems - 1);

        if (endPage - startPage + 1 < maxPaginationItems) {
            startPage = Math.max(1, endPage - maxPaginationItems + 1);
        }

        let items = [];
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
                    {i}
                </Pagination.Item>
            );
        }
        return items;
    };

    const handleCloseError = () => setShowError(false);

    useEffect(() => {
        getTestcontents();
    }, [search, searchQuery]);

    const getTestcontents = async () => {
        try {
            let data = await getAnnouncement_table_API();  // Use let instead of const to allow reassignment

            // Apply search filter if searchQuery exists
            if (searchQuery) {
                data = data.filter(content =>
                    content.announcement && content.announcement.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Apply search filter if search exists
            if (search) {
                data = data.filter(content =>
                    content.announcement && content.announcement.toLowerCase().includes(search.toLowerCase())
                );
            }

            setTestcontents(data);  // Set the filtered data to state
        } catch (error) {
            console.error('Error fetching test contents:', error);
            setErrorMessage('Failed to load announcements.');
            setShowError(true);
        }
    };


    const handleUpdate = async () => {
        console.log('selected id: ', selectedId);
        try {
            const response = await UpdateAnnouncement_table_API([selectedId], announce, announceImage);
            console.log("Update successful:", response);
            setShowModal(false); // Close modal on successful update
            getTestcontents(); // Refresh the table after update
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleFileChange = (e) => {
        setAnnounceImage(e.target.files[0]);
    };

    const handleDelete = async (id) => {
        console.log('id: ', id);
        try {
            // Call API with the correct id (selectedIdDelete)
            const response = await DeleteAnnouncement_table_API([id]);
            console.log("Deleted successful:", response);
            getTestcontents(); // Refresh the table after update
        } catch (error) {
            console.error("Deleted failed:", error);
        }
    };

    const handleNextButtonClick = () => {

        navigate('/announce/'); // Show the Add Student form
    };

    return (
        <div>

            <div className="product-table-container">
                <button className='button-ques-save'
                style={{ marginRight: '20px' }}
                    onClick={handleNextButtonClick}>
                    <img src={back} className='nextarrow' ></img>
                    <span>Back</span></button>
                <input
                    className="search-box1"
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <br /><br />
                <div>
                    <div className='table-container-lms'>
                        <table className="product-table">
                            <thead className="table-thead">
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Announcement</th>
                                    <th style={{ textAlign: 'center' }}>Announcement Image</th>
                                    <th style={{ textAlign: 'center' }}>Update</th>
                                    <th style={{ textAlign: 'center' }}>Delete</th>
                                </tr>
                            </thead>
                            <tbody className="table-tbody">
                                {getPaginatedData().map((content, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: 'center' }}>{content.announcement}</td>
                                        <td style={{ textAlign: 'center' }}>{content.announcement_image ? (
                                                        <img src={`data:image/png;base64,${content.announcement_image}`} alt="College Logo" style={{ width: "70px", height: "auto" }} />
                                                      ) : (
                                                        "--"
                                                      )}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="action-button edit"
                                                onClick={() => {
                                                    setShowModal(true); // Open the modal
                                                    setSelectedId(content.id); // Set the selected ID
                                                    setAnnounce(content.announcement); // Set the announcement text
                                                    setAnnounceImage(content.announcement_image); // Set the announcement image
                                                }}
                                            >
                                                ✏️
                                            </button>

                                            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                                                <Modal.Header closeButton>
                                                    <Modal.Title>Update Form</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <div className="announcement-attachment-container">
                                                        <textarea
                                                            type="text"
                                                            value={announce || ""}
                                                            autoComplete="off"
                                                            onChange={(e) => setAnnounce(e.target.value)}
                                                            placeholder="Enter announcement"
                                                            className="input-ques-announcement"
                                                            style={{ marginRight: "10px" }}
                                                        />
                                                        <div className="file-input-group-clg-announ" style={{ marginLeft: "0%" }}>
                                                            <label htmlFor="announcementImage" className="input-button-ques-mcq-clg">
                                                                Attachment
                                                            </label>
                                                            <input
                                                                type="file"
                                                                id="announcementImage"
                                                                name="announcementImage"
                                                                onChange={handleFileChange}
                                                                className="input-file-ques-mcq-clg"
                                                            />
                                                            {announceImage && typeof announceImage === 'object' && (
                                                                <span className="file-name-clg">{announceImage.name}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className='button-container'>
                                                        <button className='button-ques-save' style={{ width: "100px" }} onClick={handleUpdate}>
                                                            Update
                                                        </button>
                                                        <button className='cancel' style={{ width: "100px" }} onClick={() => setShowModal(false)}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </Modal.Body>
                                            </Modal>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="action-button delete"
                                                style={{ color: 'orange' }}
                                                onClick={() => {
                                                    setSelectedIdDelete(content.id); // Set the selected id first
                                                    handleDelete(content.id); // Then call the delete function
                                                }}
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                    <br /><br />
                    <div className='dis-page'>
                        <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
                            <Form.Label className='display' style={{ marginRight: '10px' }}>Display:</Form.Label>
                            <Form.Control
                                style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
                                as="select"
                                className='label-dis'
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                            </Form.Control>
                        </Form.Group>

                        <Pagination className="pagination-custom" style={{ marginLeft: "1060px", marginTop: "-34px", boxShadow: 'none', outline: 'none' }}>
                            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                            {getPaginationItems()}
                            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </div>
                    <div className='cui-statusbar'></div>
                </div>
            </div>
            <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

        </div>
    );
};

export default AnnounceTable;
