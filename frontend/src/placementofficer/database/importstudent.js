import React, { useState, useEffect } from 'react';

import { CollegeImportAPI, getcollegeApi,Update_DB_API_placement } from '../../api/endpoints';
import Upload from '../../assets/images/upload.png';
import ErrorModal from '../../components/auth/errormodal';
import Update from '../../assets/images/update-icon.png';
function ImportCandidate({ collegeName }) {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [collegeId, setCollegeId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCollegeId = async () => {
      try {
        console.log("Fetching college list...");
        const data = await getcollegeApi();
        console.log("API response data:", data);

        if (Array.isArray(data)) {
          // Find the matching college
          const matchingCollege = data.find(college => college.college.trim() === collegeName.trim());
          if (matchingCollege) {
            console.log("Matching college:", matchingCollege);
            setCollegeId(matchingCollege.id);
          } else {
            console.warn("No matching college found for:", collegeName);
            setErrorMessage('College not found');
            setShowError(true);
          }
        } else {
          console.warn("Unexpected response structure: Expected an array.");
          setErrorMessage('Unexpected response structure: Expected an array.');
          setShowError(true);
        }
      } catch (error) {
        console.error("Error fetching college data:", error);
        setErrorMessage('Error fetching college data');
        setShowError(true);
      }
    };

    fetchCollegeId();
  }, [collegeName]);

  
  const handleCloseError = () => {
    setShowError(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!collegeId) {
      setErrorMessage('College ID not found. Please verify the college name.');
      setShowError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await CollegeImportAPI(collegeId, formData);
      setErrorMessage('Data uploaded successfully');
      setShowError(true);
    } catch (error) {
      let errorMsg = 'An unexpected error occurred.';

      if (error.response) {
        const errorData = error.response.data;

        if (Array.isArray(errorData) && errorData.length > 0) {
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
    }
    setIsSubmitting(false);
  };
  const handleUpdate = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      return;
    }

    if (!collegeId) {
      setErrorMessage('College ID not found. Please verify the college name.');
      setShowError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await Update_DB_API_placement(formData, collegeId); // Pass collegeId here
      setErrorMessage('Data Updated Successfully');
      setShowError(true);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'An unexpected error occurred.';
      setErrorMessage(errorMsg);
      setShowError(true);
    }
  };
  

  return (
    <div className='sp-inner-div'>
      <input className='file-chosen-officer' type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isSubmitting} className="button-data-officer upload-button" >
        <img className='nextarrow' src={Upload} alt="Upload Icon" />
        <span>Upload</span>
      </button>
      <button onClick={handleUpdate} className="button-data-officer  update-button-db"  ><img className='nextarrow' src={Update}></img><span>Update</span></button>
    
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
    </div>
  );
}

export default ImportCandidate;
