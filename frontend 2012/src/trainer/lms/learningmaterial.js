import React, { useState, useEffect, useContext, useRef } from "react";
import { Modal, Button, Table, Form, Pagination } from "react-bootstrap";
import { getTrainer_Course_LMS_API,getTrainer_popup_API } from "../../api/endpoints";
import { FaPlay, FaExpand, FaCompress } from "react-icons/fa";
import { SearchContext } from "../../allsearch/searchcontext";
import TrainerReportForm from "./trainerreport";
import ErrorModal from "../../components/auth/errormodal";

const LearningMaterial = ({ username, institute }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testcontents, setTestcontents] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState("All");
  const [showModal1, setShowModal1] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocEmbed, setSelectedDocEmbed] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { searchQuery } = useContext(SearchContext);
  const [search, setSearch] = useState("");
  const [showTrainerReport, setShowTrainerReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [courseScheduleId, setCourseScheduleId] = useState(null); // or any default value
   const [coursesrc, setCoursesrc] = useState(null); 
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const searchTerm = searchQuery || search;

  const handleClosePopup = () => {
    setShowPopup(false);
  };
  const filteredContents = testcontents.filter((content) => {
    return (
      !searchTerm ||
      Object.values(content).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const handleCloseTrainerReport = () => {
    setShowTrainerReport(false);
  };

  const handleCloseError = () => {
    setShowError(false);
  };
  //error message

  //prtscr
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "PrintScreen") {
        event.preventDefault();
        // Optionally, display a message to the user or take some action
        alert("Screenshot functionality is restricted.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  // useEffect to track updates
 
  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false); // Close document modal
    setShowTrainerReport(true); // Open Trainer Report after closing document
  };


  const handlePlayVideo = (videoUrl) => {
    setSelectedVideoUrl(videoUrl);
    setShowModal1(true);
  };

  useEffect(() => {
  getTrainer_Course_LMS_API(username)
    .then((data) => {
      setTestcontents(data); // Set your fetched LMS contents
    })
    .catch((error) => console.error("Error fetching test contents:", error));
}, [username, showTrainerReport]);

const handleOpenDocument = (embedCode, contentId) => {
  // Log received parameters
  console.log("Embed Code:", embedCode);
  console.log("Received Content ID:", contentId);

  if (contentId === undefined || contentId === null) {
    console.error("❌ Content ID is undefined or null. Cannot open document.");
    return;
  }

  // Find the selected content by its ID
  const selectedContent = testcontents.find(item => item.id === contentId);

  if (selectedContent) {
    setSelectedDocEmbed(embedCode);
    setCourseScheduleId(selectedContent.id);       // Set the content ID
    setCoursesrc(selectedContent.source);          // Set source: 'training_schedule' or 'course_schedule'
    setShowDocumentModal(true);                    // Open the modal
    console.log("✅ Document modal opened with:", selectedContent);
  } else {
    console.error("❌ No content found with ID:", contentId);
  }

  // Log the current state (may still show previous value due to async setState)
  console.log("Current courseScheduleId (may be stale):", courseScheduleId);
};
 useEffect(() => {
    console.log("Updated courseScheduleId:", courseScheduleId);
  }, [courseScheduleId]);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return testcontents.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(testcontents.length / itemsPerPage);
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
  const handleFormSubmit = () => {
    console.log("Form submitted successfully!");
    setIsSubmitting(true);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(); // Calls handleFormSubmit to close the modal
  };
  useEffect(() => {
    getTrainer_popup_API(username)
      .then((response) => {
        if (response.popup) {
          setPopupMessage(response.message);
          setShowPopup(true);
        }
      })
      .catch((error) => console.error("Error fetching popup data:", error));
  }, [username]);
  return (
    <div>
      <div
        className="product-table-container-trainer"
        style={{ marginLeft: "0px" }}
      >
         <Modal show={showPopup} onHide={handleClosePopup}>
        <Modal.Header closeButton>
          <Modal.Title>Reminder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{popupMessage}</p>
        </Modal.Body>
        
      </Modal>
        <div className="table-responsive">
          <table className="product-table">
            <thead className="table-thead">
              <tr>
                <th>Topic</th>
              
                <th>Video</th>
                <th>Actual Content</th>
                <th>Worksheet</th>
              </tr>
            </thead>
            <tbody className="table-tbody">
              {getPaginatedData()
                .filter(
                  (content) =>
                    selectedContentType === "All" ||
                    content.content_type === selectedContentType
                )
                .filter((content) =>
                  Object.values(content).some((value) =>
                    String(value)
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                )
                .map((content) => (
                  <tr key={content.id}>
                    <td>{content.topic}</td>
                   
                    <td>
                      {content.Content_URL ? (
                        <Button
                          variant="link"
                          onClick={() => handlePlayVideo(content.Content_URL)}
                          style={{ color: "white" }}
                        >
                          <FaPlay size={20} style={{ color: "white" }} />
                          Play Video
                        </Button>
                      ) : (
                        <Button
                          variant="link"
                          disabled
                          style={{ color: "#a7b3ba" }}
                        >
                          <FaPlay size={20} style={{ color: "#a7b3ba" }} />
                          Play Video
                        </Button>
                      )}
                    </td>
                    <td>
                      {content.Actual_Content ? (
                        <Button
                          variant="link"
                          onClick={() => {
                            console.log("Content before opening:", content);
                            handleOpenDocument(
                              content.Actual_Content,
                              content.id
                            );
                          }}
                          style={{ color: "white" }}
                        >
                          Open File
                        </Button>
                      ) : (
                        <Button
                          variant="link"
                          disabled
                          style={{ color: "#a7b3ba" }}
                        >
                          Open File
                        </Button>
                      )}
                    </td>
                    <td>
                      {content.worksheet_link ? (
                        <Button
                          variant="link"
                          onClick={() => {
                            console.log("Content before opening:", content);
                            handleOpenDocument(
                              content.worksheet_link,
                              content.id
                            );
                          }}
                          style={{ color: "white" }}
                        >
                          Open File
                        </Button>
                      ) : (
                        <Button
                          variant="link"
                          disabled
                          style={{ color: "#a7b3ba" }}
                        >
                          Open File
                        </Button>
                      )}
                    </td>  
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Form.Group controlId="itemsPerPageSelect" style={{ display: "flex" }}>
          <Form.Label className="display-trainer">Display:</Form.Label>
          <Form.Control
            className="label-dis"
            style={{ width: "50px" }}
            as="select"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </Form.Control>
        </Form.Group>
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

        {/* Modal for document and Trainer Report */}
        <Modal
          show={showDocumentModal}
          onHide={handleCloseDocumentModal}
          size="xl"
        >
          <Modal.Header closeButton>
            <Modal.Title>Document Viewer</Modal.Title>
          </Modal.Header>
          <Modal.Body className="no-select no-right-click">
            {selectedDocEmbed && (
              <div
                className="embedded-document"
                dangerouslySetInnerHTML={{ __html: selectedDocEmbed }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => handleCloseDocumentModal()}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal for Trainer Report Form */}

        <Modal
          show={showTrainerReport}
          onHide={handleCloseTrainerReport}
          size="lg"
          style={{ width: "100%", alignItems: "center" }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Trainer Report Form</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TrainerReportForm
              username={username}
              courseScheduleId={courseScheduleId}
              coursesrc={coursesrc}
              handleClose={handleCloseTrainerReport}
              onSubmit={handleFormSubmit} // Ensure this triggers form submission
            />
          </Modal.Body>
        </Modal>

        {/* Modal for Video Player */}
        <Modal show={showModal1} onHide={() => setShowModal1(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Video Player</Modal.Title>
          </Modal.Header>
          <Modal.Body className="no-select no-right-click">
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
            <Button variant="secondary" onClick={() => setShowModal1(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        
        <ErrorModal
          show={showError}
          handleClose={handleCloseError}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
};

export default LearningMaterial;
