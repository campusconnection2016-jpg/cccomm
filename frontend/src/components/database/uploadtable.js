import React, { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../allsearch/searchcontext";
import { Table, Form, Pagination } from "react-bootstrap";
import "../../styles/trainingadmin.css";
import {
  getNonDbCandidates_API,
  getdbCandidates_API, deletecandidatesApi
} from "../../api/endpoints";
import moment from "moment-timezone";
import ExcelJS from 'exceljs';
import Download from '../../assets/images/download.png';
import { useLocation, useNavigate } from "react-router-dom";
import { saveAs } from 'file-saver';

const FilterDropdown = ({ options, selectedValue, onChange, className }) => {
  return (
    <select
      value={selectedValue || ""}
      onChange={(e) => onChange(e.target.value)}
      className={`dropdown-custom ${className}`}
    >
      <option value="">All</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const Uploadstudentdata = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collegeName, candidateType, uploadTime } = location.state;

  const [selectedCandidateType, setSelectedCandidateType] = useState(candidateType || "");
  // Determine the appropriate value based on candidateType

  console.log("College Name:", collegeName);
  console.log("Candidate Type:", candidateType);
  console.log("Batch or Upload Time:", uploadTime);


  const handleBackStudntCount = () => {
    // Navigate back to the data table
    navigate('/data-table'); // Ensure '/data-table' is the correct route
  };

  const { searchQuery } = useContext(SearchContext);
  const [filters, setFilters] = useState({});
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dbcandidates, setDbCandidates] = useState([]);
  const [nonDbcandidates, setNonDbCandidates] = useState([]);

  const [search, setSearch] = useState("");


  useEffect(() => {
    if (candidateType) {
      setSelectedCandidateType(candidateType);
    }
    fetchDbCandidates();
    fetchNonDbCandidates();
  }, [collegeName, searchQuery, search]);


  useEffect(() => {
    fetchDbCandidates();
    fetchNonDbCandidates();
  }, [searchQuery, search]);

  useEffect(() => {
    setFilteredStudents(filterCandidates());
    setCurrentPage(1);
  }, [filters, dbcandidates, nonDbcandidates, selectedCandidateType]);


  const fetchDbCandidates = () => {
    getdbCandidates_API()
      .then((data) => {
        const filteredStudentsDb = data.filter((item) => {
          // Apply filters for collegeName and batchNumber
          const matchesCollegeName = collegeName
            ? item.college_id__college === collegeName
            : true;

          const matchesSearchQuery = searchQuery
            ? (item.college_id__college?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.user_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.students_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.department_id__department?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.batch_no?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.year?.toLowerCase() || "").includes(searchQuery.toLowerCase())
            : true;


          const matchesSearch = search
            ? (item.college_id__college?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.user_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.students_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.department_id__department?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.batch_no?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.year?.toLowerCase() || "").includes(search.toLowerCase())
            : true;

          return matchesCollegeName && matchesSearchQuery && matchesSearch;
        });

        setDbCandidates(filteredStudentsDb);
        console.log("Filtered DbCandidates:", filteredStudentsDb);
      })
      .catch((error) => {
        console.error("Error fetching dbCandidates data:", error);
      });
  };


  const fetchDbCandidates_OLD = () => {
    getdbCandidates_API()
      .then((data) => {
        const filteredStudentsDb = data.filter(
          (item) =>
            (searchQuery
              ? (item.college_id__college?.toLowerCase() || "").includes(
                searchQuery.toLowerCase()
              ) ||
              (item.user_name?.toLowerCase() || "").includes(
                searchQuery.toLowerCase()
              ) ||
              (item.students_name?.toLowerCase() || "").includes(
                searchQuery.toLowerCase()
              ) ||
              (item.department_id__department?.toLowerCase() || "").includes(
                searchQuery.toLowerCase()
              ) ||
              (item.batch_no?.toLowerCase() || "").includes(
                searchQuery.toLowerCase()
              ) ||
              (item.year?.toLowerCase() || "").includes(
                searchQuery.toLowerCase()
              )
              : true) &&
            (search
              ? (item.college_id__college?.toLowerCase() || "").includes(
                search.toLowerCase()
              ) ||
              (item.user_name?.toLowerCase() || "").includes(
                search.toLowerCase()
              ) ||
              (item.students_name?.toLowerCase() || "").includes(
                search.toLowerCase()
              ) ||
              (item.department_id__department?.toLowerCase() || "").includes(
                search.toLowerCase()
              ) ||
              (item.batch_no?.toLowerCase() || "").includes(
                search.toLowerCase()
              ) ||
              (item.year?.toLowerCase() || "").includes(search.toLowerCase())
              : true)
        );
        setDbCandidates(filteredStudentsDb);
        console.log("setDbCandidates: ", data);
      })
      .catch((error) => {
        console.error("Error fetching dbCandidates data:", error);
      });
  };


  const fetchNonDbCandidates = () => {
    getNonDbCandidates_API()
      .then((data) => {
        console.log("Upload Time: ", data);
        const filteredStudentsNonDb = data.filter((item) => {
          // Apply filters for collegeName and batchNumber
          const matchesCollegeName = collegeName
            ? item.college_id__college === collegeName
            : true;
  
  
          const matchesSearchQuery = searchQuery
            ? (item.college_id__college?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
              (item.user_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
              (item.password?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
              (item.batch_no?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
              (item.dtm_upload?.toLowerCase() || "").includes(searchQuery.toLowerCase())
            : true;
  
          const matchesSearch = search
            ? (item.college_id__college?.toLowerCase() || "").includes(search.toLowerCase()) ||
              (item.user_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
              (item.students_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
              (item.department_id__department?.toLowerCase() || "").includes(search.toLowerCase()) ||
              (item.batch_no?.toLowerCase() || "").includes(search.toLowerCase()) ||
              (item.year?.toLowerCase() || "").includes(search.toLowerCase())
            : true;
  
          return matchesCollegeName && matchesSearchQuery && matchesSearch;
        });
  
        setNonDbCandidates(filteredStudentsNonDb);
        console.log("Filtered Non-DB Candidates: ", filteredStudentsNonDb);
      })
      .catch((error) => {
        console.error("Error fetching nonDbCandidates data:", error);
      });
  };
  


  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value || "", // Ensure empty selection resets filter
    }));
  };
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const handleSelectAllCheckbox = () => {
    if (selectedCandidates.length === filteredStudents.length) {
      // If all candidates are already selected, unselect all
      setSelectedCandidates([]);
    } else {
      // Select ALL filtered candidates, not just the first page
      setSelectedCandidates(filteredStudents.map(candidate => candidate.id));
    }
  };
  const handleCheckboxChange = (candidateId) => {
    setSelectedCandidates((prevSelected) =>
      prevSelected.includes(candidateId)
        ? prevSelected.filter((id) => id !== candidateId)
        : [...prevSelected, candidateId]
    );
  };

  const handleDeleteCandidates = () => {
    if (selectedCandidates.length === 0) {
      alert("Please select at least one candidate to delete.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete selected candidates?")) {
      return;
    }

    deletecandidatesApi(selectedCandidates)
      .then((response) => {
        console.log("Deletion response:", response);

        if (selectedCandidateType === "Db Candidates") {
          setDbCandidates((prevData) =>
            prevData.filter((candidate) => !selectedCandidates.includes(candidate.id))
          );
        } else {
          setNonDbCandidates((prevData) =>
            prevData.filter((candidate) => !selectedCandidates.includes(candidate.id))
          );
        }

        setSelectedCandidates([]); // Clear selection after delete

        // Refetch data to ensure UI updates properly
        fetchDbCandidates();
        fetchNonDbCandidates();
      })
      .catch((error) => {
        console.error("Error deleting candidates:", error);
      });
  };

  const exportToExcel_Db = async () => {
    console.log("Exporting Db Candidates to Excel...");
  
    if (filteredStudents.length === 0) {
      console.log("No data available to export.");
      return;
    }
  
    const collegeName = filteredStudents[0]?.college_id__college || "Unknown_College";
    const formattedCollegeName = collegeName.replace(/\s+/g, "_");
    const fileName = `${formattedCollegeName}_Database.xlsx`;
  
    const filteredData = filteredStudents.map(({ id, college_id, ...rest }) => rest);
  
    const headerMap = {
      college_id__college: 'College Name**',
      college_id__college_group: 'College Branch',
      batch_no: 'Batch',
      students_name: 'Student Name',
      user_name: 'User Name**',
      registration_number: 'Reg No',
      gender: 'Gender',
      email_id: 'Email ID',
      mobile_number: 'Mobile Number',
      year: 'Year**',
      cgpa: 'CGPA',
      department_id__department: 'Department**',
      marks_10th: '10th Mark',
      marks_12th: '12th Mark',
      history_of_arrears: 'History Of Arrears',
      standing_arrears: 'Standing Arrears',
      it_of_offers: 'No.Of.IT Offers',
      core_of_offers: 'No.Of.Core Offers',
      number_of_offers: 'No.Of.Offers',
      password: 'Password**',
    };
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DB");
  
    // Add header row
    const headerRow = Object.values(headerMap);
    worksheet.addRow(headerRow);
  
    // Add data rows
    filteredData.forEach(candidate => {
      const rowData = [];
      for (const key in headerMap) {
        rowData.push(candidate[key] || "");
      }
      worksheet.addRow(rowData);
    });
  
    // Adjust column width (optional)
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
  
    // Write the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, fileName);
  };
  
 
  const exportToExcel_Non_Db = async () => {
    console.log("Exporting Non-Db Candidates to Excel...");
  
    if (filteredStudents.length === 0) {
      console.log("No data available to export.");
      return;
    }
  
    // Extract college name from the first record (assumed same college for all)
    const collegeName = filteredStudents[0]?.college_id__college?.replace(/\s+/g, "_") || "UnknownCollege";
    const fileName = `${collegeName}_nonDatabase.xlsx`;
  
    // Exclude specific fields
    const filteredData = filteredStudents.map(({ college_id__id, dtm_upload, college, ...rest }) => rest);
  
    // Header mapping
    const headerMap = {
      user_name: 'user_name',
      password: 'password',
      college_id__college: 'college_id',
      college_id__college_group: 'college_group',
      batch_no: 'Batch',
    };
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Non DB");
  
    // Add header row
    const headerKeys = Object.keys(filteredData[0]);
    const headerRow = headerKeys.map(key => headerMap[key] || key);
    worksheet.addRow(headerRow);
  
    // Add data rows
    filteredData.forEach(candidate => {
      const rowData = headerKeys.map(key => candidate[key] || "");
      worksheet.addRow(rowData);
    });
  
    // Optional: adjust column widths
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
  
    // Generate Excel and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, fileName);
  };
  
  // Function to handle the export button click
  const handleExport = () => {
    if (selectedCandidateType === "Db Candidates") {
      exportToExcel_Db();
    } else {
      exportToExcel_Non_Db();
    }
  };

  const handleCandidateTypeChange = (value) => {
    setSelectedCandidateType(value);
    setFilters({});
    setCurrentPage(1);
  };


  const filterCandidates = () => {
    const candidates =
      selectedCandidateType === "Db Candidates"
        ? dbcandidates
        : nonDbcandidates;
    const searchTerm = searchQuery || search;

    return candidates.filter((item) => {
      // Global search across all fields
      const matchesSearch =
        !searchTerm ||
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Apply individual filters
      const matchesFilters = Object.entries(filters).every(
        ([key, value]) =>
          !value ||
          (item[key] &&
            item[key].toString().toLowerCase() === value.toLowerCase() )
      );

      return matchesSearch && matchesFilters;
    });
  };

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const filterOptions = {
    college_id__college: [
      ...new Set(
        (selectedCandidateType === "Db Candidates"
          ? dbcandidates
          : nonDbcandidates
        ).map((candidate) => candidate.college_id__college)
      ),
    ],
    department_id__department: [
      ...new Set(
        (selectedCandidateType === "Db Candidates"
          ? dbcandidates
          : nonDbcandidates
        ).map((candidate) => candidate.department_id__department)
      ),
    ],
    batch_no: [
      ...new Set(
        (selectedCandidateType === "Db Candidates"
          ? dbcandidates
          : nonDbcandidates
        )
          .map((candidate) => candidate.batch_no)
          .filter((batch) => batch !== undefined && batch !== null) // Ensure valid values
      ),
    ],
    year: [
      ...new Set(
        (selectedCandidateType === "Db Candidates"
          ? dbcandidates
          : nonDbcandidates
        )
          .map((candidate) => candidate.year)
          .filter((year) => year !== undefined && year !== null) // Ensure valid values
      ),
    ],
    students_name: [
      ...new Set(
        (selectedCandidateType === "Db Candidates"
          ? dbcandidates
          : nonDbcandidates
        )
          .map((candidate) => candidate.students_name)
          .filter((students_name) => students_name !== undefined && students_name !== null) // Ensure valid values
      ),
    ],
    user_name: [
      ...new Set(
        (selectedCandidateType === "Db Candidates"
          ? dbcandidates
          : nonDbcandidates
        )
          .map((candidate) => candidate.user_name)
          .filter((user_name) => user_name !== undefined && user_name !== null) // Ensure valid values
      ),
    ],
    upload_timing: [
      ...new Set(
        (selectedCandidateType === "Db Candidates"
          ? dbcandidates
          : nonDbcandidates
        )
          .map((candidate) => candidate.dtm_upload)
          .filter((dtm_upload) => dtm_upload !== undefined && dtm_upload !== null) // Ensure valid values
      ),
    ],
  };

  const formatDate1 = (dateString) => {
    if (!dateString) {
      return null; // Return null if dateString is null or undefined
    }

    const localDate = moment(dateString).local();
    return localDate.format("DD/MM/YYYY hh:mm A");
  };



  return (
    <div className="product-table-container-db">
      <div className="candidate-type-dropdown">
        <input
          className="search-box-db-nondb"
          type="text"
          placeholder="Search..."
          value={search}

          onChange={(e) => setSearch(e.target.value)}
        />
       
        <button className="button-ques-save" onClick={handleBackStudntCount}>
          Back
        </button>

        <button className="button-ques-save" onClick={handleExport}>
          <img src={Download} className='nextarrow'></img><span>Export</span>
        </button>

        <button
          onClick={handleDeleteCandidates}
          disabled={selectedCandidates.length === 0}
          className="button-ques-save"

        >
          Delete
        </button>

        <div className="student-count"><p>No of Students:</p><span style={{ marginTop: "-12px", marginLeft: "10px", fontSize: "18px", fontWeight: "bold", color: "white" }}>
          {filteredStudents.length}
        </span>
          <div></div>

        </div>
      </div>
      <div className="po-table-responsive-dbt">
        <table className="placement-table-t">


          <thead >
            {selectedCandidateType === "Db Candidates" && (
              <tr>
                <th style={{ textAlign: "center" }}></th>
                <th style={{ textAlign: "center" }}>CollegeName</th>
                <th style={{ textAlign: "center" }}>Batch</th>
                <th style={{ textAlign: "center" }}>Department</th>
                <th style={{ textAlign: "center" }}>Year</th>

                <th style={{ textAlign: "center" }}>Candidates</th>
                <th style={{ textAlign: "center" }}>LoginID</th>
                <th style={{ textAlign: "center" }}>Password</th>
              </tr>)}

            {selectedCandidateType === "Non-Db Candidates" && (
              <>
                <th style={{ textAlign: "center" }}>

                </th>
                <th style={{ textAlign: "center" }}>
                  College Name

                </th >
                <th style={{ textAlign: "center" }}>Batch No

                </th>
                <th style={{ textAlign: "center" }}>User Name</th>
                <th style={{ textAlign: "center" }}>Password</th>
                <th style={{ textAlign: "center" }}>Upload Time</th>
              </>

            )}
            <tr>
              {selectedCandidateType === "Db Candidates" && (
                <>
                  <th style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedCandidates.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAllCheckbox}
                    />

                  </th>
                  <th style={{ textAlign: "center" }}>

                    <FilterDropdown
                      options={filterOptions.college_id__college}
                      selectedValue={filters.college_id__college}
                      onChange={(value) =>
                        handleFilterChange("college_id__college", value)
                      }
                      className="dropdown-custom"
                    />
                  </th>
                  <th style={{ textAlign: "center" }}>
                    <FilterDropdown
                      options={filterOptions.batch_no}
                      selectedValue={filters.batch_no}
                      onChange={(value) =>
                        handleFilterChange("batch_no", value)
                      }
                      className="dropdown-custom"
                    />
                  </th>

                  <th style={{ textAlign: "center" }}>

                    <FilterDropdown
                      options={filterOptions.department_id__department}
                      selectedValue={filters.department_id__department}
                      onChange={(value) =>
                        handleFilterChange("department_id__department", value)
                      }
                      className="dropdown-custom"
                    />
                  </th>
                  <th style={{ textAlign: "center" }}>
                    <FilterDropdown
                      options={filterOptions.year}
                      selectedValue={filters.year}
                      onChange={(value) => handleFilterChange("year", value)}
                      className="dropdown-custom"
                    />
                  </th>



                  <th style={{ textAlign: "center" }}>
                    <FilterDropdown
                      options={filterOptions.students_name}
                      selectedValue={filters.students_name}
                      onChange={(value) => handleFilterChange("students_name", value)}
                      className="dropdown-custom"
                    />
                  </th>
                  <th style={{ textAlign: "center" }}> <FilterDropdown
                    options={filterOptions.user_name}
                    selectedValue={filters.user_name}
                    onChange={(value) => handleFilterChange("user_name", value)}
                    className="dropdown-custom"
                  /> </th>
                  <th style={{ textAlign: "center" }}></th>
                </>
              )}

              {selectedCandidateType === "Non-Db Candidates" && (

                <>
                  <th style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedCandidates.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAllCheckbox}
                    />
                  </th>
                  <th style={{ textAlign: "center" }}>

                    <FilterDropdown
                      options={filterOptions.college_id__college}
                      selectedValue={filters.college_id__college}
                      onChange={(value) =>
                        handleFilterChange("college_id__college", value)
                      }
                      className="dropdown-custom"
                    />
                  </th >
                  <th style={{ textAlign: "center" }}>
                    <FilterDropdown
                      options={filterOptions.batch_no}
                      selectedValue={filters.batch_no}
                      onChange={(value) =>
                        handleFilterChange("batch_no", value)
                      }
                      className="dropdown-custom"
                    />
                  </th>
                  <th style={{ textAlign: "center" }}><FilterDropdown
                    options={filterOptions.user_name}
                    selectedValue={filters.user_name}
                    onChange={(value) => handleFilterChange("user_name", value)}
                    className="dropdown-custom"
                  /> </th>
                  <th style={{ textAlign: "center" }}></th>
                  <th style={{ textAlign: "center" }}> <FilterDropdown
                    options={filterOptions.upload_timing}
                    selectedValue={filters.upload_timing}
                    onChange={(value) => handleFilterChange("dtm_upload", value)}
                    className="dropdown-custom"
                  /> </th>
                </>
              )}
            </tr>

          </thead>
          <tbody >
            {currentData.map((item) => (
              <tr
                key={item.id}

                style={{ padding: "30px" }}
              >
                {selectedCandidateType === "Db Candidates" && (
                  <>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{item.college_id__college}</td>
                    <td style={{ textAlign: "center" }}>{item.batch_no}</td>

                    <td style={{ textAlign: "center" }}>{item.department_id__department}</td>
                    <td style={{ textAlign: "center" }}>{item.year}</td>

                    <td style={{ textAlign: "center" }}>{item.students_name}</td>
                    <td style={{ textAlign: "center" }}>{item.user_name}</td>
                    <td style={{ textAlign: "center" }}>{item.password}</td>
                  </>
                )}
                {selectedCandidateType === "Non-Db Candidates" && (
                  <>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{item.college_id__college}</td>
                    <td style={{ textAlign: "center" }}>{item.batch_no}</td>
                    <td style={{ textAlign: "center" }}>{item.user_name}</td>
                    <td style={{ textAlign: "center" }}>{item.password}</td>
                    <td style={{ textAlign: "center" }}>{formatDate1(item.dtm_upload)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <p></p>
      </div>
      <div className="placement-display-pagination">
        <Form.Group controlId="itemsPerPageSelect" style={{ display: "flex" }}>
          <Form.Label style={{ marginRight: "10px" }}>Display:</Form.Label>
          <Form.Control
            as="select"
            className="label-dis-placement"
            style={{ width: "50px", boxShadow: "none", outline: "none" }}
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
    </div>
  );
};

export default Uploadstudentdata;
