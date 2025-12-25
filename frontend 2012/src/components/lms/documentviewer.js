import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DocumentViewer = ({ embedCode, onClose }) => {
    return (
        <Modal.Body>
            {/* Render the embedded content here */}
            {embedCode && (
                <div className="embedded-document">
                    <iframe
                        srcDoc={embedCode}
                        width="100%"
                        height="2000"
                        frameBorder="0"
                        allowFullScreen={false} // Prevent full-screen option
                        sandbox="allow-scripts"
                        title="Embedded Document"
                    ></iframe>
                </div>
            )}
           
        </Modal.Body>
    );
};

export default DocumentViewer;
