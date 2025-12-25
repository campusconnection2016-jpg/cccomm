// src/college/Dashboard/EventForm.js
import React, { useState } from 'react';
import './eventform.css'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const EventForm = ({ selectedDate, eventDetails }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : eventDetails.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex < eventDetails.length - 1 ? prevIndex + 1 : 0));
  };

  const currentEvent = eventDetails[currentIndex];

  // console.log('selected Date: ', selectedDate);
  // console.log('eventDetails: ', eventDetails);

  return (
    <div className="event-form">
      <div>
        <label>Date</label>
        <input type="text" value={selectedDate.toLocaleDateString('en-GB')} readOnly />
      </div><p></p>
      {Array.isArray(eventDetails) && eventDetails.length > 0 ? (
        <>
          
          <ul>
            <li className="event-list-item">
              <div className="event-form-group">
                <p><span>Test Name: {currentEvent.test_name}</span></p>
              </div>
            </li>
          </ul>
          <div className="navigation" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={handlePrev} style={{ backgroundColor: '#F1A128', borderRadius: '5px' }}><FaChevronLeft /></button>
            <button onClick={handleNext} style={{ backgroundColor: '#F1A128', borderRadius: '5px' }}><FaChevronRight /></button>
          </div>
        </>
      ) : (
        <p>No events found for the selected date.</p>
      )}
    </div>
  );
};

export default EventForm;
