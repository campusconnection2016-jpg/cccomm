import React, { useState } from 'react';
import { TestReports_Upload_API, TestReports_Update_API } from '../../api/endpoints';
import ErrorModal from '../auth/errormodal';
import Upload from '../../assets/images/upload.png';
import { useNavigate } from 'react-router-dom';
import Update from '../../assets/images/update-icon.png';
import Word from '../../assets/sample_test_report.xlsx'

const UploadTestReport = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);  // Separate loading state for upload
    const [isUpdating, setIsUpdating] = useState(false);    // Separate loading state for update
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleCloseError = () => {
        setShowError(false);
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            setErrorMessage('Please select a file to upload');
            setShowError(true);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true); // Set uploading state
            const response = await TestReports_Upload_API(formData);

            if (response.status === 200) {
                setErrorMessage('File uploaded successfully!');
                setShowError(true);
                onUploadSuccess();
            } else {
                setErrorMessage('Error processing file');
                setShowError(true);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(`Error: ${error.response.data.error}`);
                setShowError(true);
            } else {
                setErrorMessage('An error occurred during file upload');
                setShowError(true);
            }
        } finally {
            setIsUploading(false); // Reset uploading state
        }
    };

    const handleUpdate = async () => {
        if (!file) {
            setErrorMessage('Please select a file to update');
            setShowError(true);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUpdating(true); // Set updating state
            const response = await TestReports_Update_API(formData);

            if (response.status === 200) {
                setErrorMessage('File updated successfully!');
                setShowError(true);
            } else {
                setErrorMessage('Error processing update');
                setShowError(true);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(`Error: ${error.response.data.error}`);
                setShowError(true);
            } else {
                setErrorMessage('An error occurred during file update');
                setShowError(true);
            }
        } finally {
            setIsUpdating(false); // Reset updating state
        }
    };


    const handleExportAllLang = () => {
        // Path to the document in the public/assets directory
        const documentUrl = Word;

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = 'sample_test_report.xlsx';

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };

    const handleNavigateToCumulativeReport = () => {
        navigate('/cumulative/test/report');
    };

    return (
        <div style={{ display: 'flex' }}>
            <div>
                <form onSubmit={handleSubmit} >
                    <div className='upload-repo'
                       >
                        <input
                            type="file"
                            id="file"
                            name="file"
                            onChange={handleFileChange}
                            accept=".xlsx, .xls"
                            required
                            style={{ margin: '10px', paddingTop: '8px' }}
                        />
                        <div className='button-repo'>
                            <button  className="button-data-uplod" type="submit" disabled={isUploading || isUpdating}>
                                {isUploading ? 'Uploading...' : <><img src={Upload} alt="Upload" className='nextarrow' /> Upload</>}</button>



                            <button  className="button-data-update" onClick={handleUpdate} disabled={isUpdating || isUploading}>
                                {isUpdating ? 'Updating...' : <><img src={Update} alt="Update" className='nextarrow' /> Update</>}

                            </button>
                            <button className='button-ques-save-sapmle'  onClick={handleExportAllLang}>
                                Sample
                            </button></div>

                    </div>
                </form>

                <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
            </div>

            {/*}
            <div>
                <button
                    style={{
                        margin: '10px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                    }}

                    className="button-data upload-button-db"
                    onClick={handleNavigateToCumulativeReport}
                >
                    Cumulative
                </button>
            </div>
            */}
        </div>
    );
};

export default UploadTestReport;
