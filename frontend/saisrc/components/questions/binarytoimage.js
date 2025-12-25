import React, { useState } from 'react';

const BinaryToImage = () => {
  const [binaryData, setBinaryData] = useState('');
  const [imageSrc, setImageSrc] = useState('');

  // Function to handle binary data input and convert it to image
  const handleBinaryDataChange = (event) => {
    const data = event.target.value;
    setBinaryData(data);

    // Convert binary data to a Blob and then to a Data URL
    try {
      const byteCharacters = atob(data); // Decode base64 string to binary data
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' }); // Assuming PNG format
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
    } catch (error) {
      console.error('Error converting binary data to image:', error);
    }
  };

  return (
    <div>
      <h1>Binary to Image Converter</h1>
      <textarea
        rows="10"
        cols="50"
        placeholder="Paste your binary data here..."
        value={binaryData}
        onChange={handleBinaryDataChange}
      />
      {imageSrc && (
        <div>
          <h2>Generated Image</h2>
          <img src={imageSrc} alt="Converted Binary Data" />
        </div>
      )}
    </div>
  );
};

export default BinaryToImage;
