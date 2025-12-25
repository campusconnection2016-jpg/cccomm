import React, { useState, useEffect, useContext, useRef } from 'react';
import { Modal, Button, Table, Form, updateLoginApi, Pagination } from 'react-bootstrap';
import UpdateLogin from './updatelogin';
import { getLoginApi, deleteloginApi } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import CustomOption from "../test/customoption";
import Back from '../../assets/images/backarrow.png'
import ErrorModal from '../auth/errormodal';
//import DocumentViewer from './DocumentViewer';
import { SearchContext } from '../../allsearch/searchcontext';
import Next from '../../assets/images/nextarrow.png';
import back from '../../assets/images/backarrow.png';
const LoginTable = ({userRole}) => {
    console.log("userole",userRole)
    const [testcontents, setTestcontents] = useState([]);
    const [selectedContentType, setSelectedContentType] = useState('All');
    const [search, setSearch] = useState('');
    const { searchQuery } = useContext(SearchContext);
    const [filteredContents, setFilteredContents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [showUpdateForm, setShowUpdateform] = useState(false);
    const [lmsId, setLmsId] = useState(null);
    const [showLMSMap, setShowLMSMap] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedCollege, setSelectedCollege] = useState('All');
   
    const handleCloseError = () => {
        setShowError(false);
    };
  

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredContents.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredContents.length / itemsPerPage);

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

    useEffect(() => {
        getTestcontents();
    }, []);

    useEffect(() => {
        filterContents();
    }, [testcontents, search, searchQuery, selectedRole, selectedCollege]);

    const getTestcontents = async () => {
        try {
            const data = await getLoginApi();
           let filteredData = data;

      // ✅ Hide Super admin data for Training admin or Placement admin
      if (["Training admin", "Placement admin"].includes(userRole)) {
        filteredData = data.filter(item => item.role !== "Super admin");
      }

      setTestcontents(filteredData);
      setFilteredContents(filteredData);

        } catch (error) {
            console.error('Error fetching test contents:', error);
        }
    };

    const filterContents = () => {
        let filtered = [...testcontents];

        if (selectedRole !== 'All') {
            filtered = filtered.filter(content => content.role === selectedRole);
        }
        if (selectedCollege !== 'All') {
            filtered = filtered.filter(content => content.college_name === selectedCollege);
        }
        if (selectedCollege === 'All' && selectedRole === 'All' && !search) {
            filtered = [...testcontents];
        }
        if (search) {
            filtered = filtered.filter(content =>
                (content.role && content.role.toLowerCase().includes(search.toLowerCase())) ||
                (content.college_name && content.college_name.toString().toLowerCase().includes(search.toLowerCase())) ||
                (content.user_name && content.user_name.toLowerCase().includes(search.toLowerCase())) ||
                (content.password && content.password.toLowerCase().includes(search.toLowerCase()))
            );
        }

        setFilteredContents(filtered);
    };
    const handleDelete = (id) => {
        deleteloginApi(id)
            .then(() => {
                // Remove the deleted content from testcontents
                setTestcontents((prevContents) => prevContents.filter((content) => content.id !== id));
                setErrorMessage('login Deleted Successfully');
                setShowError(true);
            })
            .catch((error) => console.error('Error deleting content:', error));
    };

   
    const getUniqueValues = (key) => {
        return ['All', ...new Set(testcontents.map(item => item[key]))];
    };
    return (
        <div>

            <div>
                <div className="placement-container">

                    <br />


                    <input
                        className="search-box1"
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <br /><br />
                    <div>
                        <div className='po-table-responsive-login'>
                            <table className="placement-table">
                                <thead >
                                    <tr>
                                    <th style={{textAlign:"center"}}>
                                    Role
                                  
                                </th>
                                <th style={{textAlign:"center"}}>
                                    College
                                   
                                </th>
                                        <th style={{textAlign:"center"}}>User Name</th>

                                        <th style={{textAlign:"center"}}>Password</th>

                                        <th style={{textAlign:"center"}}>Update</th>
                                        <th style={{textAlign:"center"}}>Delete</th>
                                    </tr>
                                    <tr>
                                    <th style={{textAlign:"center"}}>
                                   
                                    <select value={selectedRole} style={{width:"150px"}} onChange={(e) => setSelectedRole(e.target.value)} className='dropdown-custom'>
                                        {getUniqueValues('role' ).map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </th>
                                <th style={{textAlign:"center"}}>
                                  
                                    <select value={selectedCollege} style={{width:"250px"}} onChange={(e) => setSelectedCollege(e.target.value)} className='dropdown-custom'>
                                        {getUniqueValues('college_name').map(college => (
                                            <option key={college} value={college}>{college}</option>
                                        ))}
                                    </select>
                                </th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                    </tr>
                                </thead>
                                <tbody >
                                    {getPaginatedData().map(content => (
                                        <tr key={content.id}>
                                            <td style={{textAlign:"center"}}>{content.role}</td>

                                            <td style={{textAlign:"center"}}>   {content.college_name}
                                            </td>
                                            <td style={{textAlign:"center"}}>{content.user_name}</td>

                                            <td style={{textAlign:"center"}}>{content.password}</td>
                                            <td style={{textAlign:"center"}}> <Link to={`/update_users/${content.user_name}`} >
                                                <button className="po-action-button edit">✏️</button></Link></td>
                                            <td style={{textAlign:"center"}}> <Link onClick={() => handleDelete(content.id)}>
                                                <button className="po-action-button delete" style={{ color: 'orange' }}>
                                                    🗑
                                                </button></Link></td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <br /><br />
                        <div className='placement-display-pagination'>

                            <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
                                <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
                                <Form.Control
                                    style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
                                    as="select"
                                    className='label-dis-placement'
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                </Form.Control>
                            </Form.Group>

                            <Pagination className="pagination-custom-placement">
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

        </div>
    );
};

export default LoginTable;