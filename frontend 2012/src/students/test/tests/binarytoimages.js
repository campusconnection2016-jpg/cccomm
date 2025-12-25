import React, { useState, useEffect } from 'react';

const BinaryToImages = ({ binaryData, width, height }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (binaryData) {
      // Convert binary data to a Blob and then to a Data URL
      try {
        const byteCharacters = atob(binaryData); // Decode base64 string to binary data
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
    }
  }, [binaryData]);

  return (
    <div>
      {imageSrc && <img src={imageSrc} alt="Converted Binary Data" style={{ width: width, height: height }} />}
    </div>
  );
};

export default BinaryToImages;
