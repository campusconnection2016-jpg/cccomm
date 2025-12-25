import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Pagination } from "react-bootstrap";
import { getcontenttoolApi,getStudents_Course_LMSPlacement_API ,getSkilltypeApi} from "../../api/endpoints";
import { FaPlay, FaExpand, FaCompress } from "react-icons/fa";

import Next from "../../assets/images/nextarrow.png";
import Back from "../../assets/images/backarrow.png";
import ErrorModal from "../../components/auth/errormodal";
import "../../styles/po.css";
import { useTheme, useMediaQuery } from "@mui/material";
const LearningMaterial = ({ institute,username }) => {
  const [testcontents, setTestcontents] = useState([]);
  const [showModal1, setShowModal1] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocEmbed, setSelectedDocEmbed] = useState("");
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // Manage feedback modal visibility
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const videoRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState("All");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const { searchQuery } = useContext(SearchContext);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate the items to display based on the current page and items per page
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return testcontents.slice(startIndex, endIndex);
  };

  // Get total pages
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


const getLMSContentsol = () => {
    console.log("Fetching test contents for institute:", institute);

    getStudents_Course_LMSPlacement_API(institute)
      .then((data) => {
        console.log("API Response:", data);

        if (!data || data.length === 0) {
          console.warn("No data available for this college.");
          setTestcontents([]); // Ensure state is updated with an empty array
        } else {
          console.log("Setting test contents:", data);
          setTestcontents(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching test contents:", error);
        if (error.response) {
          console.error("Error details:", error.response.data);
        }
      });
  };

  // const { searchQuery } = useContext(SearchContext);
const [skillTypeData, setSkillTypeData] = useState([]);
const [questionTypeOptions, setQuestionTypeOptions] = useState([]);
const [filteredSkillTypes, setFilteredSkillTypes] = useState([]);
const [selectedQuestionType, setSelectedQuestionType] = useState("");
const [selectedSkillType, setSelectedSkillType] = useState("");
// 🔹 Load Skill Types
useEffect(() => {
  getSkilltypeApi()
    .then((data) => {
      console.log("📥 SkillType API Response:", data);
      setSkillTypeData(data);

      // Extract unique Question Types
      const uniqueQuestionTypes = [
        ...new Map(
          data.map((item) => [item.question_type_name, item.question_type_name]) // use name
        ).entries()
      ].map(([id, name]) => ({ id, name }));

      setQuestionTypeOptions(uniqueQuestionTypes);
      console.log("📌 QuestionTypeOptions:", uniqueQuestionTypes);
    })
    .catch((error) => {
      console.error("❌ Error fetching skill types:", error);
    });
}, []);

// 🔹 Filter Skill Types when Question Type changes
useEffect(() => {
  if (selectedQuestionType) {
    const skills = skillTypeData.filter(
      (item) => item.question_type_name === selectedQuestionType
    );
    setFilteredSkillTypes(skills);
    setSelectedSkillType(""); // reset skill type
    console.log("📌 Filtered skills for", selectedQuestionType, ":", skills);
  }
}, [selectedQuestionType, skillTypeData]);

// 🔹 Fetch Tool Contents only when filters or institute change
useEffect(() => {
  if (!institute) return;
  const questionTypeName = selectedQuestionType || "";
  const skillTypeName = selectedSkillType || "";

  console.log("🎯 Applying filters:", {
    institute,
    questionTypeName,
    skillTypeName,
  });

  getToolContents(questionTypeName, skillTypeName);
}, [institute, selectedQuestionType, selectedSkillType]);

// ❌ Remove this one – it breaks filtering
// useEffect(() => { getToolContents(); }, []);

// 🔹 Fetch Tool Contents
const getToolContents = async (questionType = "", skillType = "") => {
  let allResults = [];
  let page = 1;
  let hasNext = true;

  console.log("🚀 getToolContents START:", {
    questionType,
    skillType,
    page,
  });

  try {
    while (hasNext) {
      console.log(`📡 Calling API page=${page}...`);
      const data = await getcontenttoolApi(
        page,
        "",
        institute,
        questionType,
        skillType
      );

      console.log("📥 API Response:", data);

      if (data?.results) {
        allResults = [...allResults, ...data.results];
        console.log(`✅ Page ${page} received ${data.results.length} rows`);
      }

      hasNext = !!data?.next;
      if (hasNext) page++;
    }

    if (allResults.length > 0) {
      setTestcontents(allResults);
      console.log("🎉 Final Tool Contents:", allResults);
    } else {
      console.log("⚠️ No tool contents found → loading LMS fallback...");
      getLMSContents();
    }
  } catch (error) {
    console.error("❌ Error fetching tool contents:", error);
    getLMSContents();
  }
};
// Handle page change
 

  useEffect(() => {
    getToolContents();
  }, []);
 const getLMSContents = () => {
  getStudents_Course_LMSPlacement_API(institute, selectedQuestionType, selectedSkillType)
    .then((data) => {
      setTestcontents(data);
      console.log("📚 LMS Contents: ", data);
    })
    .catch((error) => console.error("Error fetching LMS contents:", error));
};

useEffect(() => {
  if (institute) {
    const questionTypeId = selectedQuestionType || "";
    const skillTypeId = selectedSkillType || "";

    console.log("🎯 Applying filters:", questionTypeId, skillTypeId);

    getToolContents(questionTypeId, skillTypeId);
  }
}, [institute, selectedQuestionType, selectedSkillType]);

  // 🔹 Decide which content to load based on Tool access
  const loadContents = () => {
    getcontenttoolApi(1, "", institute)
      .then((data) => {
        // If API returned data, use it (Tool access)
        if (data && data.results && data.results.length > 0) {
          setTestcontents(data.results);
          console.log("Tool Access Data Loaded:", data.results);
        } else {
          // If no Tool access → fallback to LMS API
          getLMSContents();
        }
      })
      .catch((error) => {
        console.log("Fallback to LMS due to error:", error);
        getLMSContents();
      });
  };

  useEffect(() => {
    if (institute) {
      loadContents();
    }
  }, [institute, username]);

  const handlePlayVideo = (videoUrl) => {
    setSelectedVideoUrl(videoUrl);
    setShowModal1(true);
  };


  const handleOpenDocument = (embedCode) => {
    setSelectedDocEmbed(embedCode);
    setShowDocumentModal(true);
  };

  const toggleFullScreen = () => {
    const elem = videoRef.current;
    if (!isFullScreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
      }
    } else {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
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
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.shiftKey && e.key === "S") // Windows Snipping Tool
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleCopy = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.shiftKey && e.key === "S")
      ) {
        e.preventDefault();
      }
    };

    if (showDocumentModal) {
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("copy", handleCopy);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDocumentModal]);

  const handleOpenFeedback = (id) => {
    console.log("Selected Feedback ID:", id);
    setSelectedFeedbackId(id);
    setShowFeedbackModal(true); // Open feedback modal
  };

  const handleCloseFeedback = () => {
    setShowFeedbackModal(false); // Close feedback modal
    // handleNextTopic(); // Move to the next topic after feedback submission
  };
  const [isFirstView, setIsFirstView] = useState(true);
  // Handle cancel button to close modal and open feedback
  const handleCancelAndOpenFeedback = () => {
    // Close the current modals
    setShowDocumentModal(false);
    setShowModal1(false);

    // Open feedback form for the current topic only on the first view
    if (isFirstView) {
      handleOpenFeedback(testcontents[currentContentIndex]?.id);
      setIsFirstView(false); // Set to false so feedback only opens once
    }
  };
  const [formCompleted, setFormCompleted] = useState(false); // State to track form completion

  const handleCloseModal = () => {
    if (!formCompleted) {
      // setErrorMessage('Please make sure to fill out the form completely and submit it');
      setShowError(false);
      handleCloseFeedback();
    } else {
      handleCloseFeedback(); // Call the function to handle closing the modal
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };
  return (
    <div className="no-select no-right-click">
      <div className="no-screenshot-overlay"></div>

      <div
         className="product-table-container-po"
        style={{ marginLeft: "0px" }}
      >
         <div className="dropdown-contain-2" >
  {/* Question Type Dropdown */}
  <select
    value={selectedQuestionType}
    className="dropdown-custom"
    
    onChange={(e) => setSelectedQuestionType(e.target.value)}
  >
    <option value="">Question Type</option>
    {questionTypeOptions.map((q) => (
      <option key={q.id} value={q.name}>
        {q.name}
      </option>
    ))}
  </select>

  {/* Skill Type Dropdown */}
  <select
    value={selectedSkillType}
     className="dropdown-custom"
    
    onChange={(e) => setSelectedSkillType(e.target.value)}
    disabled={!selectedQuestionType}
  >
    <option value="">Skill Type</option>
    {filteredSkillTypes.map((s) => (
      <option key={s.id} value={s.skill_type}>
        {s.skill_type}
      </option>
    ))}
  </select>
</div>
        <div>
          <div className="po-table-responsive-t-lms-po">
                                    <table className="placement-table-tpo">
                                  <thead >
                <tr>
                  <th style={{ textAlign: "center" }}>Department</th>
                  <th style={{ textAlign: "center" }}>year</th>
                  <th style={{ textAlign: "center" }}>Topic</th>

                  <th style={{ textAlign: "center" }}>Video</th>
                  <th style={{ textAlign: "center" }}>Contents</th>

                  <th style={{ textAlign: "center" }}>Worksheet</th>
                </tr>
              </thead>
              <tbody >
                {getPaginatedData()
                  .filter(
                    (content) =>
                      selectedContentType === "All" ||
                      content.content_type === selectedContentType
                  )

                  .map((content) => (
                    <tr key={content.id}>
                      <td style={{ textAlign: "center" }}>{content.departments}</td>
                      <td style={{ textAlign: "center" }}>{content.years}</td>
                      <td style={{ textAlign: "center" }}>{content.topic}</td>
                      <td style={{ textAlign: "center" }}>
                        {content.Content_URL ? (
                          <Button
                            variant="link"
                            onClick={() => handlePlayVideo(content.Content_URL)}
                            style={{ color: "white" }}
                          >
                            <FaPlay size={20} style={{ color: "white" }} />
                            <span className="play-video-text" style={{ color: "white" }}> Play Video</span>
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            disabled
                            style={{ color: "#a7b3ba" }}
                          >
                            <FaPlay size={20} style={{ color: "#a7b3ba" }} />
                            <span className="play-video-text" style={{ color: "#a7b3ba" }}>
                              {" "}
                              Play Video
                            </span>
                          </Button>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {content.actual_content ? (
                          <Button
                            variant="link"
                            onClick={() =>
                              handleOpenDocument(content.actual_content)
                            }
                            style={{ color: "white" }}
                          >
                            <span className="open-file-text">Open File</span>
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            disabled
                            style={{ color: "#a7b3ba" }}
                          >
                            <span className="open-file-text">Open File</span>
                          </Button>
                        )}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {content.worksheet_link ? (
                          <Button
                            variant="link"
                            onClick={() =>
                              handleOpenDocument(content.worksheet_link)
                            }
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
                      {/*}  <td style={{textAlign:"center"}}>{content.End_Date}</td>*/}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p></p>
          <p></p>
          <div className="placement-display-pagination">
            <Form.Group
              controlId="itemsPerPageSelect"
              style={{ display: "flex" }} >
              <Form.Label className="display">Display:</Form.Label>
              <Form.Control
                className="label-dis-placement"
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
            <Pagination className="pagination-custom-placement">
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
          {/* Feedback Modal */}

        </div>

        {/* Modal for Video */}
        <Modal
          show={showModal1}
          onHide={handleCancelAndOpenFeedback}
          style={{ marginTop: "50px" }}
        >
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
              ></iframe>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelAndOpenFeedback}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={toggleFullScreen}>
              {isFullScreen ? <FaCompress /> : <FaExpand />} Toggle Fullscreen
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal for Document */}
        <Modal
          show={showDocumentModal}
          onHide={handleCancelAndOpenFeedback}
          size="xl"
          style={{ marginTop: "40px" }}
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
            <Button variant="secondary" onClick={handleCancelAndOpenFeedback}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="cui-statusbar"></div>
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
