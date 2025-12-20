import React, { useState,useRef } from 'react';

import { CandidateExportAPI, Update_DB_API } from '../../api/endpoints';

import Upload from '../../assets/images/upload.png';
import Update from '../../assets/images/update-icon.png';
import ErrorModal from '../auth/errormodal';

function ImportCandidate() {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  //const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
    const [loadingTime, setLoadingTime] = useState(0);
 
const fileInputRef = useRef(null);

  const handleCloseError = () => {
    setShowError(false);
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      //alert('Please select a file');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true); 
   
      
    const formData = new FormData();
    formData.append('file', file);

    try {
      await CandidateExportAPI(formData);
      
      // setErrorMessage('');  // Clear any previous error messages
      setErrorMessage('Data uploaded Successfully');
      setShowError(true);

      // alert('File uploaded successfully');
    } 
    catch (error) {
      let errorMsg = 'An unexpected error occurred.';

      if (error.response) {
        const errorData = error.response.data;

        if (Array.isArray(errorData) && errorData.length > 0) {
          // Adjust this line according to your actual error structure
          errorMsg = errorData[0].user_name[0] || 'Error message not found.';
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (Array.isArray(errorData)) {
          errorMsg = errorData.map(err => err.message).join(', ');
        } else if (typeof errorData === 'object') {
          errorMsg = Object.values(errorData).flat().join(', ');
        }
      } else {
        errorMsg = 'Error uploading file. Please try again.';
       

      }

      setErrorMessage(errorMsg);
      setShowError(true);
      //setErrorMessage(errorMsg);
      // alert(errorMsg);
    }
   
   
    finally {
    // 🔄 Always clear the file after upload attempt
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsSubmitting(false);
  }

};



const handleUpdate = async () => {
  if (!file) {
    setErrorMessage('Please select a file');
    //alert('Please select a file');
    return;
  }
 
  const formData = new FormData();
  formData.append('file', file);

  try {
    await Update_DB_API(formData);
    // setErrorMessage('');  // Clear any previous error messages
    setErrorMessage('Data Updated Successfully');
    setShowError(true);
    // alert('File uploaded successfully');
  } catch (error) {
    const errorMsg = error.response?.data?.error || 'An unexpected error occurred.';

    

  }
  finally {
    // 🔄 Always clear the file after upload attempt
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsSubmitting(false);
  } 
};



return (
  <div className='sp-inner-div' >

    <input className='file-chosen' type="file"   ref={fileInputRef} onChange={handleFileChange} />
    <button onClick={handleUpload} className="button-data  upload-button-db" disabled={isSubmitting} ><img className='nextarrow' src={Upload}></img><span>Upload</span></button>
    <button onClick={handleUpdate} className="button-data  update-button-db"  ><img className='nextarrow' src={Update}></img><span>Update</span></button>
    
    <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

  </div>
);
}

export default ImportCandidate;