import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Pagination } from 'react-bootstrap';
import '../../styles/trainingadmin.css';
import { getQuestionPaperApi, deleteQuestionpaperApi, getQuestionPaperApi_place,getQuestionsApi_QP_ID } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import Footer from '../../footer/footer';
import ErrorModal from '../auth/errormodal';
import { SearchContext } from '../../allsearch/searchcontext';
import { FiDownload } from "react-icons/fi";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
const QuesPaperTb = ({ collegeName, userRole }) => {
  const [quesPaper, setQuesPaper] = useState([]);
  const [test_name, setTestName] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const { searchQuery } = useContext(SearchContext);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseError = () => {
    setShowError(false);
  };
  useEffect(() => {
    getQuestionPapers();
  }, [userRole]); // Run once on component mount

  const handleDelete = (id) => {
    deleteQuestionpaperApi(id)
      .then(() => {
        // Remove the deleted question paper from the state
        setQuesPaper((prevPapers) => prevPapers.filter((ques) => ques.id !== id));
        setErrorMessage('Questions Deleted Successfully');
        setShowError(true);
      })
      .catch((error) => console.error('Error deleting question paper:', error));
  };

  const getQuestionPapers = () => {
    console.log('USER ROLE: ', userRole);
    // Select the appropriate API function based on userRole
    const apiFunction =
        userRole === 'Placement Officer'
            ? () => getQuestionPaperApi_place(collegeName)
            : getQuestionPaperApi;

    // Call the selected API function
    apiFunction()
        .then((data) => {
            setQuesPaper(data);
        })
        .catch((error) => {
            console.error('Error fetching question papers:', error);
        });
};


  const filteredData = quesPaper.filter((item) => {
    // Ensure item.question_paper_name is a string before calling toLowerCase
    const questionPaperName = item.question_paper_name || '';
    return questionPaperName.toLowerCase().includes(test_name.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


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
const handleDownloadExcel = async (questionPaperId) => {
  try {
    const response = await getQuestionsApi_QP_ID(questionPaperId);

    if (!response || response.length === 0) {
      alert("No questions found for this paper.");
      return;
    }

    const testType = response[0]?.test_type;

    if (testType === "Coding Test") {
      await handleDownloadcodingExcel(questionPaperId);
    } else if (testType === "MCQ Test") {
      await handleDownloadmcqExcel(questionPaperId);
    } else {
      alert("Unknown test type.");
    }
  } catch (error) {
    console.error("Error determining test type:", error);
    alert("Failed to download due to an error.");
  }
};
const handleDownloadcodingExcel = async (questionPaperId) => {
  try {
    const response = await getQuestionsApi_QP_ID(questionPaperId);
    const questionData = response;

    if (!questionData || questionData.length === 0) {
      alert("No questions found for this paper.");
      return;
    }

    // Determine is_testcase from the first question (assuming same for all)
    const isTestcaseEnabled = questionData[0]?.is_testcase === true;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Questions");

    // Define base columns
    const baseColumns = [
      { header: "Questions**", key: "question_text", width: 40 },
     
      { header: "Answer**", key: "answer", width: 20 },
        { header: "Mark**", key: "mark", width: 10 },
         { header: "Explain Answer", key: "explain_answer", width: 30 },
      { header: "Input Format", key: "input_format", width: 20 },
    
      { header: "Difficulty Level", key: "difficulty_level", width: 15 },
    ];

    // Conditionally add test case columns
    const testCaseColumns = isTestcaseEnabled
      ? [
          { header: "TestCase1**", key: "test_case1", width: 30 },
          { header: "TestCase2**", key: "test_case2", width: 30 },
          { header: "TestCase3**", key: "test_case3", width: 30 },
        ]
      : [];

    worksheet.columns = [...baseColumns, ...testCaseColumns];

    // Add rows
    questionData.forEach((q) => {
      const rowData = {
        question_text: q.question_text,
        answer: q.answer,
        explain_answer: q.explain_answer,
        mark: q.mark,
        difficulty_level: q.difficulty_level,
        input_format: q.input_format,
      };

      if (isTestcaseEnabled) {
        rowData.test_case1 = q.test_case1;
        rowData.test_case2 = q.test_case2;
        rowData.test_case3 = q.test_case3;
      }

      worksheet.addRow(rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `QuestionPaper_${questionPaperId}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Failed to download questions.");
  }
};


const handleDownloadmcqExcel = async (questionPaperId) => {
  try {
    const response = await getQuestionsApi_QP_ID(questionPaperId);
    const questionData = response;

    if (!questionData || questionData.length === 0) {
      alert("No questions found for this paper.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Questions");

    const topic = questionData[0]?.topic;

    let columns = [];

    if (topic === "Pyschometry") {
      // Only show Option E, Mark Method, Section
      columns = [
        { header: "Option E", key: "option_e", width: 30 },
        { header: "Mark Method", key: "mark_method", width: 30 },
        { header: "Section", key: "section", width: 20 },
      ];
    } else {
      // Show all except Option E, Mark Method, Section
      columns = [
        { header: "Questions**", key: "question_text", width: 40 },
        { header: "Option A", key: "option_a", width: 30 },
        { header: "Option B", key: "option_b", width: 30 },
        { header: "Option C", key: "option_c", width: 30 },
        { header: "Option D", key: "option_d", width: 30 },
        { header: "Answer**", key: "answer", width: 20 },
        { header: "Mark**", key: "mark", width: 10 },
       
        { header: "Difficulty Level", key: "difficulty_level", width: 15 },
         { header: "Explain Answer", key: "explain_answer", width: 40 },
      ];
    }

    worksheet.columns = columns;

    questionData.forEach((q) => {
      worksheet.addRow({
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        option_e: q.option_e,
        answer: q.answer,
        mark: q.mark,
        explain_answer: q.explain_answer,
        difficulty_level: q.difficulty_level,
        mark_method: q.mark_method,
        section: q.section,
       
        topic: q.topic,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `QuestionPaper_${questionPaperId}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Failed to download questions.");
  }
};


  return (
    <div >
      <div className="product-table-container-training">
        <h6>Question Papers</h6>
        <br />

        <input
          className="search-box"
          type="text"
          placeholder="Search..."
          value={test_name}
          onChange={(e) => setTestName(e.target.value)}
        />
        <div className="po-table-responsive-t-Q">
          <table className="placement-table-Q">
            <thead >
              <tr>
                <th style={{ textAlign: "left" }} >Question Paper</th>
                <th style={{ textAlign: "center" }}>Add</th>
                <th style={{ textAlign: "center" }}>Edit</th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Download</th>
                <th style={{ textAlign: "center" }}>Delete</th>
              </tr>
            </thead>
            <tbody >
              {currentData
                .filter(item =>
                  !searchQuery ||
                  (item.question_paper_name && typeof item.question_paper_name === 'string' && item.question_paper_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (item.test_type && typeof item.test_type === 'string' && item.test_type.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .filter(item =>
                  !search ||
                  (item.question_paper_name && typeof item.question_paper_name === 'string' && item.question_paper_name.toLowerCase().includes(search.toLowerCase())) ||
                  (item.test_type && typeof item.test_type === 'string' && item.test_type.toLowerCase().includes(search.toLowerCase()))
                )
                .map((item) => (
                  <tr key={item.id} className="table-row">
                    <td style={{ textAlign: "left" }}>

                      <Link to={`/update-paper/${item.id}`} style={{ color: "white" }}>{item.question_paper_name}</Link>
                    </td>
                    <td style={{ textAlign: "center" }}>
                     <Link
  to={
    item.test_type === 'MCQ Test'
      ? `/add-questions/${item.id}?remarks=${item.remarks}`
      : item.test_type === 'Audio' && item.remarks === 'AudioMCQ'
      ? `/add-questions/${item.id}?remarks=${item.remarks}`
      : `/add-questions/code/${item.id}?remarks=${item.remarks}`
  }
>
  <button className="action-buttons add">
    <i className="fas fa-plus plus-icon"></i>
  </button>
</Link>

                    </td>
                    <td style={{ textAlign: "center" }}>


    <Link
  to={
    item.test_type === 'MCQ Test'
      ? `/update-mcq-form/${item.id}?remarks=${item.remarks}`
      : item.test_type === 'Audio' && item.remarks === 'AudioMCQ'
      ? `/update-mcq-form/${item.id}?remarks=${item.remarks}`
      : `/update-code-form/${item.id}?remarks=${item.remarks}`
  }
>
  <button className="action-buttons edit">✏️</button>
</Link>




                    </td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
  <div
    onClick={() => handleDownloadExcel(item.id)}
    style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      color: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      margin: '0 auto',
      
    }}
    title="Download Questions"
  >
    <FiDownload size={18} color="#fff" />
  </div>
</td>

                    <td style={{ textAlign: "center" }}>
                      <Link onClick={() => handleDelete(item.id)}>
                        <button className="action-buttons delete" style={{ color: 'orange' }}>
                          🗑
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table></div>
        <p></p>
        <div className='dis-page'>

          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
            <Form.Control
              as="select" style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
              className='label-dis'
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset page to 1 when items per page changes
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>


          <Pagination className="pagination-custom pagi13" >
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {getPaginationItems()}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>

        </div>
      </div>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />


    </div>
  );
};

export default QuesPaperTb;
