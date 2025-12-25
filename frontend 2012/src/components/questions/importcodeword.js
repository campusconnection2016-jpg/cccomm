import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  deleteQuestionPaperLast_API,
  QuestionsExportAPI,
  WordImportCoding_Api,
  WordImportCoding_Api_place
} from '../../api/endpoints';
import '../../styles/trainingadmin.css';
import ErrorModal from '../auth/errormodal';
import { useNavigate } from 'react-router-dom';

import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';

const ImportCodeWord = ({ isFormValid, formData, selectedFolderName, collegeName, userRole,isTestCase }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const questionPaperName = formData.question_paper_name;
const {
          setQuestionPaperCon,
          setSubtopicCon,
          isTestAddQues
       } = useTestQuesContext();
     

  const handleCloseError = () => {
    setShowError(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const fileType = acceptedFiles[0].name.split('.').pop().toLowerCase();
      if (fileType === 'docx'|| fileType === 'pdf') {
        setFile(acceptedFiles[0]); // Set the file if valid
        setErrorMessage(null); // Clear any previous error
        setShowError(false);
      } else {
        setFile(null); // Clear file state if invalid
        setErrorMessage('Only Word Format files are allowed.'); // Set error message
        setShowError(true);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.docx',
  });


  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      setShowError(true);
      return;
    }
    const MCQTest = "Coding Test";
    setQuestionPaperCon(formData.question_paper_name);
    setSubtopicCon(formData.sub_topic);
    console.log("isTestCase:", isTestCase);

    const formDataToSend = {
      'file': file,
      'question_paper_name': formData.question_paper_name || '', // Default to empty string if undefined
      'duration_of_test': formData.duration_of_test || '',
      'topic': formData.topic || '',
      'sub_topic': formData.sub_topic || '',
      'no_of_questions': formData.no_of_questions || 0,
      'upload_type': formData.upload_type || '',
      'test_type': MCQTest || '',
      'folder_name': selectedFolderName || "",
      'created_by': collegeName || null,
      'is_testcase': isTestCase,

      //'is_testcase': isTestCase=== true ? true : false,
    }
    console.log('formDataToSend..............1: ', formDataToSend);



    try {
      console.log('formDataToSend: ', formDataToSend);
      // Define the API function dynamically based on userRole
      const apiFunction =
        userRole === 'Placement Officer'
          ? () => WordImportCoding_Api_place(formDataToSend)
          : () => WordImportCoding_Api(formDataToSend);

      // Call the selected API function
      const response = await apiFunction();
      console.log('API Response:', response);
      const numberOfQuestions = Array.isArray(response) ? response.length : 0;
      setErrorMessage(`${numberOfQuestions} questions uploaded successfully`);
      setShowError(true);
      if (!isTestAddQues) {
        navigate('/question-paper-table');
      }
    } catch (error) {
      handleUploadError(error);
    }
  };



  const handleUploadError = async (error) => {
    console.error('Error uploading file:', error);

    if (error.response) {
      // The response data might still be useful
      const errorData = error.response.data;
      let errorMsg = 'Error uploading file.';
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (errorData.errors) { // Adjust based on actual server response structure
        errorMsg = Object.values(errorData.errors).join(', ');
      }

      setErrorMessage(errorMsg);
      setShowError(true);

    } else {
      setErrorMessage('An unexpected error occurred.');
      setShowError(true);
    }
  };



  return (
    <div style={{marginTop:"-10px"}}>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
       {/*} <svg className="up-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
          <path fill="none" d="M0 0h24v24H0z" />
          <path fill="currentColor" d="M13 7.828V20h-2V7.828l-4.95 4.95-1.414-1.414L12 3l7.364 7.364-1.414 1.414z" />
        </svg>*/}
        <p>Drop files here or click to upload.</p>
      </div><br />

      <div className="button-container-lms1">
        <button
          className='button-ques-save'
          style={{ width: "100px" }}
          onClick={handleUpload}
         // disabled={!isFormValid() || !file}// Disable based on isFormValid

        >
          Upload
        </button>


        
      </div>

      {!isFormValid() && (
        <p style={{ color: '#F1A128', marginTop: '10px' }}>
          ensure the form is valid.
        </p>
      )}

      {!file && (
        <p style={{ color: '#F1A128', marginTop: '10px' }}>
          Please select a file
        </p>
      )}

      {file && <p style={{ color: 'orange' }}>Selected file: {file.name}</p>}

      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
    </div>
  );
}

export default ImportCodeWord;
