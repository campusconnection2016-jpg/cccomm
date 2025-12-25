// src/college/Dashboard/Calender.js
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarComponent = ({ onDateChange }) => {
  const handleDateChange = (date) => {
    onDateChange(date);
  };

  return (
    <div className="calendar">
      <Calendar onChange={handleDateChange} />
    </div>
  );
};

export default CalendarComponent;
