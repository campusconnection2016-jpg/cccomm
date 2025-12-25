import React from "react";

const OutputWindow = ({ output }) => {
    const formatOutput = (output) => {
        if (!output) return "";
        return output
            .replace(/\n/g, "<br />")
            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
    };

    return (
        <>
            <h1 className="output-title">Output</h1>
            <div 
                className="output-container" 
                style={{ padding: '10px' }} 
                dangerouslySetInnerHTML={{ __html: formatOutput(output) }} 
            />
        </>
    );
};

export default OutputWindow;
