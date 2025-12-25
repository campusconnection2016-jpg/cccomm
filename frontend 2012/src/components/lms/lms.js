import React, { useState, useEffect, useContext, useRef } from 'react';
import { Modal, Button, Table, Form, Pagination } from 'react-bootstrap';

import { getcontentApi } from '../../api/endpoints';
import { FaPlay, FaExpand, FaCompress } from 'react-icons/fa';

//import DocumentViewer from './DocumentViewer';
import { SearchContext } from '../../allsearch/searchcontext';
import Back from '../../assets/images/backarrow.png'
import { deletecontentApi } from '../../api/endpoints';
import UpdateLMS from './updatelms';
import "../../styles/trainingadmin.css";
import CustomPagination from '../../api/custompagination';
//import Popup from './dummy';
const Lms = () => {
    const [testcontents, setTestcontents] = useState([]);
    const [selectedContentType, setSelectedContentType] = useState('All');
    const [showModal1, setShowModal1] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const videoRef = useRef(null);
    const [showAddlms, setShowAddlms] = useState(true);
    const [search, setSearch] = useState('');
    const { searchQuery } = useContext(SearchContext);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
    const [selectedDocUrl, setSelectedDocUrl] = useState('');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [sub_topic, setsubtopic] = useState('');
    const [filteredContents, setFilteredContents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [showUpdateForm, setShowUpdateform] = useState(false);
    const [lmsId, setLmsId] = useState(null);
    
       const [totalPages1, setTotalPages1] = useState(1);
      const [pageSize] = useState(10); // Items per page
    
    
    const handleUpdateFormIsOpen = (id) => {
        setShowUpdateform(true);
        setLmsId(id);
        console.log(id);
    }
 


    useEffect(() => {
        getTestcontents(currentPage, search);
    }, [currentPage, search]);
    
    
      const handlePageChange1 = (page) => {
        setCurrentPage(page);
      };
      const [collegesData, setCollegesData] = useState({ count: 0 });
 
      const getTestcontents = (page) => { 
        getcontentApi(page, search)
            .then(data => {
                setTestcontents(data.results);
                setCollegesData(data); // Assuming data contains the necessary count property
                setTotalPages1(Math.ceil(data.count / pageSize)); // Use the data directly here
            })
            .catch(error => console.error('Error fetching test contents:', error));
    };
    const handlePlayVideo = (videoUrl) => {
        setSelectedVideoUrl(videoUrl);
        setShowModal1(true);
    };
    /*
        const handleOpenDocument = (docUrl) => {
            setSelectedDocUrl(docUrl);
            setShowDocumentModal(true);
        };*/
    const [selectedDocEmbed, setSelectedDocEmbed] = useState('');
    const handleOpenDocument = (embedCode) => {
        setSelectedDocEmbed(embedCode);
        setShowDocumentModal(true);
    };

 const handleDelete = async (id) => {
    try {
        await deletecontentApi(id);
        
        // Immediately update the displayed content
        setTestcontents(prev => prev.filter(content => content.id !== id));

        // Optionally re-fetch to ensure data is synced from backend
        const updatedData = await getcontentApi(currentPage, search);
        setTestcontents(updatedData.results);
        setCollegesData(updatedData);
        setTotalPages1(Math.ceil(updatedData.count / pageSize));

        alert("Content deleted Successfully");
    } catch (error) {
        console.error('Error deleting content:', error);
    }
};

    const toggleFullScreen = () => {
        const elem = videoRef.current;
        if (!isFullScreen) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
            }
        } else {
            if (document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }
        setIsFullScreen(!isFullScreen);
    };

    const handleContentTypeFilterChange = (contentType) => {
        setSelectedContentType(contentType);
    };

    return (
        <div >
            {showUpdateForm === true ? (<UpdateLMS lmsId={lmsId}  onNextButtonClick={() => {
    setShowUpdateform(false);
    getTestcontents(currentPage, search); // Refresh data after update
  }} />) :
                (
                    <div >



                        <div className="placement-container-t">
                            <h6>Content Master</h6><p></p>
                            <br />

                            <input
                                className="search-box1"
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <p></p><p></p>
                            <div >
                                <div className="po-table-responsive-stu-data">
                                    <table className="placement-table-t">
                                        <thead >
                                            <tr>

                                                <th>Topic</th>
                                                <th
                                                    style={{ textAlign: "center" }}
                                                >Content URL</th>
                                                <th>Actual Content</th>
                                                <th>WorkSheet</th>

                                                {/*} <th>Validity Date</th>*/}
                                                {/*} <th>Update</th>*/}
                                                <th>Update</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {testcontents
                                                .map(content => (
                                                    <tr key={content.id}>

                                                        <td>{content.topic}</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {content.content_url ? (
                                                                <Button variant="link" onClick={() => handlePlayVideo(content.content_url)} style={{ color: 'white' }} className="play-video">
                                                                    <FaPlay style={{ color: 'white' }} /><span > Play </span>
                                                                </Button>
                                                            ) : (
                                                                <Button variant="link" disabled style={{ color: '#a7b3ba' }} className="play-video">
                                                                    <FaPlay style={{ color: '#a7b3ba' }} /><span  > Play </span>
                                                                </Button>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {content.actual_content ? (
                                                                <Button variant="link" onClick={() => handleOpenDocument(content.actual_content)} style={{ color: 'white' }} >
                                                                    Open File
                                                                </Button>
                                                            ) : (
                                                                <Button variant="link" disabled style={{ color: '#a7b3ba' }}>
                                                                    Open File
                                                                </Button>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {content.worksheet_link ? (
                                                                <Button
                                                                    variant="link"
                                                                    onClick={() => handleOpenDocument(content.worksheet_link)}
                                                                    style={{ color: 'white' }}>
                                                                    Open File
                                                                </Button>
                                                            ) : (
                                                                <Button variant="link" disabled style={{ color: '#a7b3ba' }}>
                                                                    Open File
                                                                </Button>
                                                            )}
                                                        </td>


                                                        {/*} <td>{content.dtm_validity}</td>*/}
                                                        <td>
                                                            <button className="action-button edit" onClick={() => handleUpdateFormIsOpen(content.id)}>✏️</button>
                                                        </td>
                                                        <td>
                                                            <button className="action-button delete" onClick={() => handleDelete(content.id)} style={{ color: "orange" }}>
                                                                🗑
                                                            </button></td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p></p><p></p>
                                
                                
                                
                                
                                        <div className='dis-page' style={{ marginTop: '10%' }}>
                                          {/* Custom Pagination */}
                                          <CustomPagination
                                            totalPages={totalPages1}
                                            currentPage={currentPage}
                                            onPageChange={handlePageChange1}
                                            maxVisiblePages={3} // Limit to 3 visible pages
                                          />
                                        </div>
                                <Modal show={showModal1} onHide={() => setShowModal1(false)} style={{ marginTop: "50px" }}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Video Player</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div style={{ width: "100%", height: "auto", textAlign: "center" }}>
                                            <iframe
                                                ref={videoRef}
                                                src={selectedVideoUrl}
                                                width="100%"
                                                height="315"
                                                frameBorder="0"
                                                allowFullScreen
                                                allow="fullscreen; autoplay; encrypted-media"
                                                controls
                                                controlsList="nodownload"
                                                sandbox="allow-same-origin allow-scripts allow-presentation"
                                                title="Video Player"
                                            >
                                                <div className="bolt-button svg-icon"></div>
                                            </iframe>

                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={() => setShowModal1(false)}>Close</Button>
                                        <Button variant="secondary" onClick={toggleFullScreen}>
                                            {isFullScreen ? <FaCompress /> : <FaExpand />} Toggle Fullscreen
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                                <Modal show={showDocumentModal} onHide={() => setShowDocumentModal(false)} size="xl" style={{ marginTop: "40px" }}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Document Viewer</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {/* Render the embedded content here */}
                                        {selectedDocEmbed && (
                                            <div className="embedded-document" dangerouslySetInnerHTML={{ __html: selectedDocEmbed }} />

                                        )}

                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={() => setShowDocumentModal(false)}>Close</Button>
                                    </Modal.Footer>
                                </Modal>
                                <div className='cui-statusbar'></div>
                            </div>
                        </div>

                    </div>
                )}
        </div>
    );
};

export default Lms;
