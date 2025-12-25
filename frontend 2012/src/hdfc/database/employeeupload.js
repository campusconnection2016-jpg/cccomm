import React, { useRef, useState } from 'react';
import { EmployeeUploadAPI } from '../../api/endpoints';
import EmployeeForm from './createemp';
import { useNavigate } from 'react-router-dom';
import EMPDB from '../../assets/emp_db.xlsx'
const EmployeeUpload = () => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await EmployeeUploadAPI(formData);
      alert(response.data.message);
    } catch (error) {
      console.error("❌ Upload Error:", error);
      if (error.response?.data) {
        const backendError = error.response.data.error || 'Upload failed.';
        const details = error.response.data.details;
        if (details) {
          alert(`${backendError}\n${JSON.stringify(details, null, 2)}`);
        } else {
          alert(backendError);
        }
      }
    } finally {
      setUploading(false);
    }
  };


  const handleDownloadSample = () => {
        // Path to the document in the public/assets directory
        const documentUrl = EMPDB; // This path should correspond to the public URL

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl; // Path to the file
        link.download = 'EmployeeDB.xlsx'; // Name of the file when downloaded

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };

  return (
    <div>
      <div className='form-ques-emp-db'>
        <div className='sp-in-db'>
          <h6>Upload Employee Profile</h6>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept=".xlsx"
              className='rect-db'
              ref={fileRef}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" disabled={uploading} className="button-ques-save">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button type="button" onClick={handleDownloadSample} className="button-ques-save">
                Sample
              </button>
              <button type="button" onClick={() => navigate("/employeetable")} className="button-ques-save">
                Next
              </button>
            </div>
          </form>
          {message && <p style={{ color: 'red' }}>{message}</p>}
        </div>
      </div>
      <p> </p>
      <div className='form-ques-emp-db'>
        <EmployeeForm />
      </div>
    </div>
  );
};

export default EmployeeUpload;
