import React, { useState, useEffect, useContext, useRef } from 'react';
import { getMapLms_data_count_API } from '../../api/endpoints';
import './dummy.css';
import Back from '../../assets/images/backarrow.png'
//import DocumentViewer from './DocumentViewer';
import { SearchContext } from '../../allsearch/searchcontext';
import LMSMap from './maplms';
import { useNavigate } from "react-router-dom";
import CustomPagination from '../../api/custompagination';
const ViewMapLms = () => {
    const navigate = useNavigate();
    const [testcontents, setTestcontents] = useState([]);
    const [selectedContentType, setSelectedContentType] = useState('All');
    const [search, setSearch] = useState('');
    const { searchQuery } = useContext(SearchContext);
    const [filteredContents, setFilteredContents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [showLMSMap, setShowLMSMap] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");


    const [totalPages1, setTotalPages1] = useState(1);
    const [pageSize] = useState(10); // Items per page

    const [uniqueColleges, setUniqueColleges] = useState([]);
    const [uniqueTopics, setUniqueTopics] = useState([])


    const totalPages = Math.ceil(filteredContents.length / itemsPerPage);


    useEffect(() => {
        getTestcontents(currentPage, search);
    }, [currentPage, search, selectedTopic, selectedCollege]);

    const handlePageChange1 = (page) => {
        setCurrentPage(page);
    };


    useEffect(() => {
        filterContents();
    }, [testcontents, search, searchQuery, selectedContentType, selectedCollege, selectedTopic]);

    const getTestcontents = async (page) => {
        try {
            const response = await getMapLms_data_count_API(page, search, selectedTopic, selectedCollege);
            console.log("course", response)
            setTestcontents(response.results);
            setUniqueColleges(response.unique_colleges);
            setUniqueTopics(response.unique_topics);
          
            setTotalPages1(Math.ceil(response.count / pageSize));
        } catch (error) {
            console.error('Error fetching test contents:', error);
        }
    };
   const handleNavigate = (content) => {
    navigate("/lms/table/count/", {
        state: {
            topic: content.topic,
            topic_id: content.topic_id,         // Optional if topic_id is needed
            college: content.college,
            college_id: content.college_id,     // Optional if college_id is needed
            training_date: content.training_date,
            source: content.source              // ✅ Include this to differentiate between course/training
        }
    });
};

    const filterContents = () => {
        let filtered = testcontents;

        if (selectedCollege !== "All") {
            filtered = filtered.filter(content => content.college === selectedCollege);
        }

        if (selectedTopic !== "All") {
            filtered = filtered.filter(content => content.topic === selectedTopic);
        }


        if (search) {
            filtered = filtered.filter(content =>
                content.topic.toLowerCase().includes(search.toLowerCase()) ||
                content.college.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredContents(filtered);
    };

    // const uniqueColleges = ["All", ...new Set(testcontents.map(content => content.college))];
    // const uniqueTopics = ["All", ...new Set(testcontents.map(content => content.topic))];

    if (showLMSMap) {
        return <LMSMap />;
    }



    const onBackButtonClick = () => {
        navigate("/lms/map"); // Navigate back to LMSMap
    };

    return (
        <div className="placement-container-t">

            <div>
                <div >

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
                        <div className="po-table-responsive-test-schedule">
                            <table className="placement-table-t">
                                <thead >
                                    <tr>
                                        <th style={{ textAlign: "center" }}>Topic</th>

                                        <th style={{ textAlign: "center" }}>College</th>
                                    
                                        <th style={{ textAlign: "center" }}>Training Date</th>
                                        <th style={{ textAlign: "center" }}>Total Students</th>

                                    </tr>
                                    <tr>
                                        <th style={{ textAlign: "center" }}>
                                            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className='dropdown-custom'>

                                                <option value="" > All</option>
                                                {uniqueTopics.map(topic => (
                                                    <option key={topic} value={topic}>{topic}</option>
                                                ))}
                                            </select>
                                        </th>
                                        <th style={{ textAlign: "center" }}> <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)} className='dropdown-custom'>

                                            <option value="" > All</option>
                                            {uniqueColleges.map(college => (
                                                <option key={college} value={college}>{college}</option>
                                            ))}
                                        </select></th>
                                       

                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody >
                                    {testcontents.map(content => (
                                        <tr key={content.id}>
                                            <td style={{ textAlign: "center" }}>{content.topic}</td>

                                            <td style={{ textAlign: "center" }}>{content.college}</td>

 

                                           
                                            <td style={{ textAlign: "center" }}>{content.training_date}</td>
                                            <td style={{ cursor: "pointer", textDecoration: "underline", textAlign: "center" }} onClick={() => handleNavigate(content)}>{content.count}</td>

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

export default ViewMapLms;