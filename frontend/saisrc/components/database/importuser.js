import React, { useState, useRef } from 'react';
import axios from 'axios';
import { CandidateuserExportAPI,Update_NonDB_API } from '../../api/endpoints';
import Upload from '../../assets/images/upload.png'
import ErrorModal from '../auth/errormodal';
import Update from '../../assets/images/update-icon.png';

function Importuser() {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  //const [errorMessage, setErrorMessage] = useState('');
 const fileInputRef = useRef(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
  const handleCloseError = () => {
    setShowError(false);
};
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  
  const handleUpdate = async () => {
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
      await Update_NonDB_API(formData);
      
      // setErrorMessage('');  // Clear any previous error messages
      setErrorMessage('Data Updated Successfully');
      setShowError(true);
      // alert('File uploaded successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'An unexpected error occurred.';
  
      setErrorMessage(errorMsg);
      setShowError(true);
    }
    finally {
    // 🔄 Always clear the file after upload attempt
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsSubmitting(false);
  }
   
    } 
  
  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      return;
    }
     if (isSubmitting) return;

    setIsSubmitting(true); 
   
    const formData = new FormData();
    formData.append('file', file);

    try {
      await CandidateuserExportAPI(formData);
     
      setErrorMessage('Data uploaded Successfully');
      setShowError(true);

     // alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      console.log('1...');

      // Check if error response is available
      if (error.response) {
        // Extract the detailed error message from the response
        const errorData = error.response.data;
        let errorMsg = 'Error uploading file. Check the Foreign Key data.';
        console.log('2...');
        if (errorData.error) {
          errorMsg = errorData.error;
          console.log('3...');
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
          console.log('4...');
        } else if (Array.isArray(errorData) && errorData.length > 0) {
          errorMsg = errorData[0].user_name[0]; // Adjust based on your specific error structure
          console.log('5...');
        }
        console.log('6...');
        setErrorMessage(errorMsg);
        setShowError(true);
        //setErrorMessage(errorMsg);
       // alert(errorMsg);
      } else {
        setErrorMessage('Error uploading file. Please try again.');
        setShowError(true);
        //setErrorMessage('Error uploading file. Please try again.');
        //alert('Error uploading file. Please try again.');
      }
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
    <div className="sp-inner-div" >
      <input className='file-chosen'  type="file" ref={fileInputRef} onChange={handleFileChange}  />
      <button onClick={handleUpload} className="button-data upload-button" style={{ width: "114px" }} disabled={isSubmitting} ><img className='nextarrow' src={Upload}></img><span>Upload</span></button>
      <button onClick={handleUpdate} className="button-data  update-button-db"  ><img className='nextarrow' src={Update}></img><span>Update</span></button>
   
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
                 
      </div>
  );
}

export default Importuser;