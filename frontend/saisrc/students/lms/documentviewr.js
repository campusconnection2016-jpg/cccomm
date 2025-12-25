import React from 'react';

const DocumentViewer = ({ docUrl }) => {
    return (
        <div>
            <iframe src={docUrl} width="800" height="600"></iframe>
        </div>
    );
};

export default DocumentViewer;
