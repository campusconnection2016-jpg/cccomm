import React, { useState, useEffect } from 'react';

const KeyPressTracker = () => {
    const [lastKeyPressed, setLastKeyPressed] = useState('');
    const [keyHistory, setKeyHistory] = useState([]);

    // Function to handle key press
    const handleKeyPress = (event) => {
        const pressedKey = event.key;
        const pressedKeyCode = event.code; // Use event.code for special keys

        // Check if Print Screen was pressed
        if (pressedKeyCode === 'PrintScreen') {
            alert('Print Screen key was pressed!');
        }

        setLastKeyPressed(pressedKeyCode);
        setKeyHistory((prevKeys) => [...prevKeys, pressedKeyCode]);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    return (
        <div>
            <h2>Last Key Pressed: {lastKeyPressed}</h2>
            <p>Press any key and see the result here!</p>

            <h3>Key History:</h3>
            <ul>
                {keyHistory.map((key, index) => (
                    <li key={index}>{key}</li>
                ))}
            </ul>
        </div>
    );
};

export default KeyPressTracker;
