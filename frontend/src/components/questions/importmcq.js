import React, { useState, useCallback } from 'react';

import { useDropzone } from 'react-dropzone';
import { deleteQuestionPaperLast_API, QuestionsExportAPI,QuestionsExportPhysicoAPI, QuestionsExportAPI_place } from '../../api/endpoints';
import '../../styles/trainingadmin.css';
import ErrorModal from '../auth/errormodal';

import { useNavigate } from 'react-router-dom';

import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';

const ImportMCQ = ({ isFormValid, formData, handleSubmit, selectedFolderName, collegeName, userRole, selectedTopic }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  console.log("Props received in ImportMCQ:", { selectedTopic});

  const questionPaperName = formData.question_paper_name;

  
      const {
          setQuestionPaperCon,
          setSubtopicCon,
          isTestAddQues
       } = useTestQuesContext();
    
  console.log("topic",selectedTopic)
  const handleCloseError = () => {
    setShowError(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const fileType = acceptedFiles[0].name.split('.').pop().toLowerCase();
      if (fileType === 'xls' || fileType === 'xlsx') {
        setFile(acceptedFiles[0]); // Set the file if valid
        setErrorMessage(null); // Clear any previous error
        setShowError(false);
      } else {
        setFile(null); // Clear file state if invalid
        setErrorMessage('Only Excel files are allowed.'); // Set error message
        setShowError(true);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleUpload = async () => {
    console.log("📌 Upload process started...");

    if (isSubmitting) {
        console.log("⚠ Upload is already in progress, skipping...");
        return;
    }

    setIsSubmitting(true);
    if (!file) {
        console.error("❌ No file selected.");
        setErrorMessage("Please select a file");
        setShowError(true);
        setIsSubmitting(false);
        return;
    }

    console.log("📂 Selected File:", file.name);

    const MCQTest = "MCQ Test";
    setQuestionPaperCon(formData.question_paper_name);
    setSubtopicCon(formData.sub_topic);

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    formDataToSend.append("question_paper_name", formData.question_paper_name);
    formDataToSend.append("duration_of_test", formData.duration_of_test);
    formDataToSend.append("topic", formData.topic);
    formDataToSend.append("sub_topic", formData.sub_topic);
    formDataToSend.append("no_of_questions", formData.no_of_questions);
    formDataToSend.append("upload_type", formData.upload_type);
    formDataToSend.append("created_by", formData.created_by);
    formDataToSend.append("test_type", MCQTest);
    formDataToSend.append("folder_name", selectedFolderName);
    formDataToSend.append("remarks", formData.remarks);


    console.log("📊 FormData Prepared for Upload:", formDataToSend);

    try {
        let apiFunction;

        // ✅ Choose API based on topic & userRole
        if (selectedTopic === "Psychometry") {
            console.log("✅ Using QuestionsExportPhysicoAPI for Psychometry");
            apiFunction = () => QuestionsExportPhysicoAPI(formDataToSend);
        } else if (userRole === "Placement Officer") {
            console.log("✅ Using QuestionsExportAPI_place for Placement Officer");
            apiFunction = () => QuestionsExportAPI_place(formDataToSend);
        } else {
            console.log("✅ Using QuestionsExportAPI for other topics");
            apiFunction = () => QuestionsExportAPI(formDataToSend);
        }

        // Call the selected API function
        console.log("🚀 Calling API...");
        const response = await apiFunction();
        console.log("✅ API Call Successful. Response:", response);

        const numberOfQuestions = response.data.length;
        console.log(`✅ ${numberOfQuestions} questions uploaded successfully.`);
        setErrorMessage(`${numberOfQuestions} questions uploaded successfully`);
        setShowError(true);
        if (!isTestAddQues) {
        navigate('/question-paper-table');
        }

    } catch (error) {
        console.error("❌ Error during API call:", error);
        handleUploadError(error);
    }

    setIsSubmitting(false);
    console.log("📌 Upload process completed.");
};

  const handleUploadError = async (error) => {
    console.error('Error uploading file:', error);

    if (error.response) {
      const errorData = error.response.data;
      let errorMsg = 'Error uploading file.';
      if (errorData.error) {
        errorMsg = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMsg = errorData;
      }

      setErrorMessage(errorMsg);
      setShowError(true);

      // Attempt to delete the question paper if error contains questionPaperName
      if (formData.question_paper_name) {
        try {
          await deleteQuestionPaperLast_API(formData.question_paper_name);
        } catch (deleteError) {
          console.error('Error deleting question paper:', deleteError);
        }
      }
    } else {
      setErrorMessage('Error uploading file. Please try again.');
      setShowError(true);
    }
  };


  return (
    <div style={{marginTop:"-10px"}}>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
       {/* <svg className="up-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
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
         // disabled={!isFormValid() || !file || isSubmitting}
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

export default ImportMCQ;
