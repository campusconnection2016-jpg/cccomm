import React, { useState } from 'react';
import axios from 'axios';
import { TestsExportAPI } from '../../api/endpoints';

function ImportTests() {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await TestsExportAPI(formData);
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Error uploading file. Check the Foreign Key datas');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} style={{ width: '200px', marginRight: '10px' }} />
      <button onClick={handleUpload} style={{
              marginLeft: '10px',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}>Upload</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default ImportTests;
