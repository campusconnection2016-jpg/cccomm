import React, { useState, useEffect, useContext, useRef } from 'react';
import { Modal, Button, Table, Form, Pagination } from 'react-bootstrap';

import { getCourseScheduleApi } from '../../api/endpoints';

import './dummy.css';
import Back from '../../assets/images/backarrow.png'
//import DocumentViewer from './DocumentViewer';
import { SearchContext } from '../../allsearch/searchcontext';
import { useLocation } from "react-router-dom";
import { deleteCourseScheduleApi } from '../../api/endpoints';
import LMSMap from './maplms';
//import Popup from './dummy';
import { useNavigate } from "react-router-dom";
import CustomPagination from '../../api/custompagination';


const ViewLms = () => {
    const navigate = useNavigate();
    const [testcontents, setTestcontents] = useState([]);
    const [selectedContentType, setSelectedContentType] = useState('All');
    const [search, setSearch] = useState('');
    const { searchQuery } = useContext(SearchContext);
    const [filteredContents, setFilteredContents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showLMSMap, setShowLMSMap] = useState(false);
    const location = useLocation();
    
    const { topic, college, training_date,source } = location.state || {}; // Get navigation data
    console.log("locat", location.state)
      const [totalPages1, setTotalPages1] = useState(1);
      const [pageSize] = useState(10); // Items per page
    

    useEffect(() => {
        getTestcontents(currentPage, search);
    }, [currentPage, search, topic, college, training_date,source]);

    const getTestcontents = async (page) => {
        try {
            const data = await getCourseScheduleApi(page, search, topic, college, training_date,source);
            console.log("API Data (testcontents):", testcontents);

            setTestcontents(data.results);
            setTotalPages1(Math.ceil(data.count / pageSize));
        } catch (error) {
            console.error("Error fetching test contents:", error);
        }
    };

    const handlePageChange1 = (page) => {
      setCurrentPage(page);
    };
  


    if (showLMSMap) {
        return <LMSMap />;
    }
    const onBackButtonClick = () => {
        navigate("/lms/table/"); // Navigate back to LMSMap
    };
  


    return (
        <div>

            <div>
                <div className="product-table-container">

                    <br />

                    <button
                        className='button-ques-save' style={{ width: "100px", marginRight: "5px" }}
                        onClick={onBackButtonClick}
                    >
                        <img src={Back} className='nextarrow' alt="Back" />  Back
                    </button>
                    <input
                        className="search-box1"
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <br /><br />
                    <div>
                        <div className="po-table-responsive-t">
                            <table className="placement-table-t">
                                <thead >
                                    <tr>
                                        <th>Topic</th>
                                        {/* <th>Sub Topic</th>*/}
                                        <th>College</th>
                                        <th>Department</th>
<th>Year</th>
                                        
                                        <th>Students</th>
<th>Training Date</th>
                                    </tr>

                                </thead>
                                <tbody >
                                    {testcontents.map(content => (
                                        <tr key={content.id}>
                                            <td>{content.topic_name}</td>
                                            {/*} <td>{content.sub_topic}</td>*/}
                                            <td>{content.college_name}</td>
                                            <td>{content.department_name}</td>
                                    <td>{content.year}</td>

                                          
                                            <td>{content.student_name}</td>
  <td>{content.dtm_of_training}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <br /><br />
                        
                        
                        
                        
                                <div className='dis-page pagi12' style={{ marginTop: '10%' }}>
                                  {/* Custom Pagination */}
                                  <CustomPagination
                                    totalPages={totalPages1}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange1}
                                    maxVisiblePages={3} // Limit to 3 visible pages
                                  />
                                </div>
                        
                        <div className='cui-statusbar'></div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ViewLms;