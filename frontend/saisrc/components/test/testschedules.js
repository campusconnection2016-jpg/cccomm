import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Pagination } from 'react-bootstrap';
import { get_test_name_group_API,get_user_colleges_API,get_test_name_group_Multiple_API, deleteTestcadidateApi, getTestSchedules_College_API } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import '../../styles/trainingadmin.css';
import { testNameContext } from './context/testtypecontext';
import Footer from '../../footer/footer';
import ErrorModal from '../auth/errormodal';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure this import if using npm
import { SearchContext } from '../../allsearch/searchcontext';
import CustomPagination from '../../api/custompagination';

const TestSchedules = ({userRole, institute,username}) => {
    console.log('******ts scheduole...cc')

    console.log('USerRole: ', userRole);
    console.log('Institute: ', institute);

    const [testCandidates, setTestCandidates] = useState([]);
    const [searchable, setSearchable] = useState('');
    const testNameContextValue = useContext(testNameContext);
    const setTestName = testNameContextValue?.setTestName || (() => console.warn("setTestName is not available"));
    const { searchQuery } = useContext(SearchContext);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [totalPages1, setTotalPages1] = useState(1);
    const [pageSize] = useState(10); // Items per page
    const [currentPage, setCurrentPage] = useState(1);

    const handleCloseError = () => {
        setShowError(false);
    };
    useEffect(() => {
        getTestCandidates(currentPage, searchable);
    }, [currentPage, searchable]);


    const handlePageChange1 = (page) => {
        setCurrentPage(page);
    };

const getTestCandidates = (page) => {
  console.log("➡️ STEP 1: getTestCandidates called");
  console.log("➡️ STEP 2: Raw User Role:", userRole);

  // Normalize role for comparison
  const roleNormalized = (userRole || "").toLowerCase();
  console.log("➡️ STEP 3: Normalized Role:", roleNormalized);

  console.log("➡️ STEP 4: Institute:", institute);
  console.log("➡️ STEP 5: Username:", username);
  console.log("➡️ STEP 6: Current Page:", page, "Searchable:", searchable);

  if (roleNormalized === "placement officer") {
    console.log("➡️ STEP 7: Branch = Placement Officer → calling getTestSchedules_College_API");
    getTestSchedules_College_API(institute, page, searchable)
      .then((data) => {
        console.log("➡️ STEP 8: API Response (Placement Officer):", data);
        if (data?.results) {
          setTestCandidates(data.results);
          setTotalPages1(Math.ceil(data.count / pageSize));
          console.log("➡️ STEP 9: ✅ Updated Test Candidates count:", data.results.length);
        } else {
          setTestCandidates([]);
          console.warn("➡️ STEP 9: ⚠️ No results for Placement Officer");
        }
      })
      .catch((error) =>
        console.error("➡️ STEP 10: ❌ Error (Placement Officer):", error)
      );

  } else if (roleNormalized === "training admin" ) {
    console.log("➡️ STEP 7: Branch = Training/Placement admin → calling get_user_colleges_API");
    get_user_colleges_API(username)
      .then((userData) => {
        console.log("➡️ STEP 8: ✅ User Data:", userData);
        const collegeIds = userData.college_ids || [];
        console.log("➡️ STEP 9: Extracted College IDs:", collegeIds);

        console.log("➡️ STEP 10: Calling get_test_name_group_Multiple_API with collegeIds:", collegeIds);
     return get_test_name_group_Multiple_API(page, searchable, collegeIds)
        .then((resp) => {
          console.log("➡️ STEP 10C: ✅ Returned from get_test_name_group_Multiple_API");
          return resp;
        });
      })
      .then((data) => {
        console.log("➡️ STEP 11: API Response (Training/Placement admin):", data);
        if (data?.results) {
          setTestCandidates(data.results);
          setTotalPages1(Math.ceil(data.count / pageSize));
          console.log("➡️ STEP 12: ✅ Updated Test Candidates count:", data.results.length);
        } else {
          setTestCandidates([]);
          console.warn("➡️ STEP 12: ⚠️ No results for Training/Placement admin");
        }
      })
      .catch((error) =>
        console.error("➡️ STEP 13: ❌ Error (Training/Placement admin):", error)
      );

  } else if (roleNormalized === "super admin" || roleNormalized === "placement admin") {
    console.log("➡️ STEP 7: Branch = Super admin → calling get_test_name_group_API");
    get_test_name_group_API(page, searchable)
      .then((data) => {
        console.log("➡️ STEP 8: API Response (Super admin):", data);
        if (data?.results) {
          setTestCandidates(data.results);
          setTotalPages1(Math.ceil(data.count / pageSize));
          console.log("➡️ STEP 9: ✅ Updated Test Candidates count:", data.results.length);
        } else {
          setTestCandidates([]);
          console.warn("➡️ STEP 9: ⚠️ No results for Super admin");
        }
      })
      .catch((error) =>
        console.error("➡️ STEP 10: ❌ Error (Super admin):", error)
      );

  } else {
    console.warn("➡️ STEP 7: ⚠️ Unknown role → no API call made.");
  }
};

const handleDelete = (test_name, college_id) => {
    console.log("➡️ [STEP 1] handleDelete called");
    console.log("➡️ [STEP 2] Test Name to delete:", test_name);
    console.log("➡️ [STEP 3] College ID to delete:", college_id);

    deleteTestcadidateApi(test_name, college_id)
        .then((response) => {
            console.log("➡️ [STEP 4] API call successful");
            console.log("➡️ [STEP 5] API Response:", response);

            setErrorMessage('Test candidate deleted successfully');
            setShowError(true);
            console.log("➡️ [STEP 6] Showing success message");

            console.log("➡️ [STEP 7] Refreshing test candidates table");
            getTestCandidates(currentPage, searchable);
        })
        .catch((error) => {
            console.error("➡️ [STEP 8] API call failed");
            console.error("➡️ [STEP 9] Error object:", error);

            setErrorMessage('Failed to delete test candidate');
            setShowError(true);
            console.log("➡️ [STEP 10] Showing error message");
        });
};

    const handleGetTestName = (tName) => {
        setTestName(tName);
        console.log('Set test name: ', tName);
    };

    // Filter search results
    const filteredData = (testCandidates?.results || [])
        .filter(item =>
            !searchQuery ||
            (item.test_name && item.test_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.question_paper_name && typeof item.question_paper_name === 'string' && item.question_paper_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.dtm_start && typeof item.dtm_start === 'string' && item.dtm_start.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .filter(item =>
            !searchable ||
            (item.test_name && item.test_name.toLowerCase().includes(searchable.toLowerCase())) ||
            (item.question_paper_name && typeof item.question_paper_name === 'string' && item.question_paper_name.toLowerCase().includes(searchable.toLowerCase())) ||
            (item.dtm_start && typeof item.dtm_start === 'string' && item.dtm_start.toLowerCase().includes(searchable.toLowerCase())) ||
            (item.dtm_end && typeof item.dtm_end === 'string' && item.dtm_end.toLowerCase().includes(searchable.toLowerCase()))
        );

    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination values


    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  
    return (
        <div>
            
            <div className="placement-container-t">
                <div >
                    <h6>Test Schedule</h6>

                    <input
                        className="search-box1"
                        type="text"
                        placeholder="Search..."
                        value={searchable}
                        onChange={(e) => setSearchable(e.target.value)}
                    />


                    <div className="po-table-responsive-testing">
                        <table className="placement-table-t">

                            <thead style={{ textAlign: "left" }}>
                                <tr>
                                    <th style={{ textAlign: "left", width: "200px", }} >Test Name</th>
                                    {/*} <th>Question Name</th>*/}
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th style={{ textAlign: "center" }}>Candidates</th>
                                    <th >Add</th>
                                    <th style={{ textAlign: "center" }}>View Results</th>
                                    <th >Delete</th>
                                </tr>
                            </thead>
                            <tbody  >
                                {testCandidates
                                    .map((item) => (
                                        <tr key={item.id} className="table-row" >
                                            <td >
                                                <Link to={`/update-test/${item.test_name}`} onClick={() => handleGetTestName(item.test_name)} style={{ color: "white" }}>
                                                {
          userRole === "Placement Officer" ? (
            item.test_name?.includes('_')
              ? item.test_name.split('_').slice(1).join('_')
              : item.test_name
          ) : ["Super admin", "Training admin", "Placement admin"].includes(userRole) ? (
            item.test_name
          ) : null   // ⛔ For all *other* roles, you return null → nothing is displayed
        }
                                                 </Link>
                                            </td>
                                            {/*} <td>{item.question_paper_name}</td>*/}
                                            <td>{item.dtm_start}</td>
                                            <td>{item.dtm_end}</td>
                                            <td style={{ textAlign: "center" }}>

                                                <Link to={`/test-report/${item.test_name}/${item.college_id}/`} style={{ color: "white" }}>
                                                    {item.student_count}
                                                </Link>
                                                {/*<p></p>{item.reassigned_student_count} */}
                                            </td>
                                            <td >
                                                <Link to={`/add-candidate/${item.test_name}/${item.college_id}/`}>
                                                    <button className="po-action-button add">
                                                        <i className="fas fa-plus plus-icon"></i>
                                                    </button>
                                                </Link>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Link to={`/test-result/${item.test_name}/${item.college_id}/`} style={{ color: "white" }} >
                                                    {item.active_student_count}
                                                </Link>
                                            </td>
                                            <td >
                                                <button className="po-action-button delete"  
                                                onClick={() => {
    if (item.college_id) {
      handleDelete(item.test_name, item.college_id);
    } else {
      console.warn("⚠️ College ID missing for this test:", item.test_name);
    }
  }}
                                                 style={{ color: "orange" }}>
                                                    🗑
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    <p></p>



                    <div className='dis-page pagi12' style={{ marginTop: '10%' }}>
                        {/* Custom Pagination */}
                        <CustomPagination
                            totalPages={totalPages1}
                            currentPage={currentPage}
                            onPageChange={handlePageChange1}
                            maxVisiblePages={3} // Limit to 3 visible pages
                        />
                    </div>
                </div>
            </div>
            <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

        </div>
    );
};

export default TestSchedules;
