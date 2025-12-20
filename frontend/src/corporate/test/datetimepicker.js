import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import TimePicker from 'react-time-picker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const DateTimePicker = ({ onDateTimeChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00');

  const handleDateChange = (date) => {
    setSelectedDate(date);
    combineDateTime(date, selectedTime);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    combineDateTime(selectedDate, time);
  };

  const combineDateTime = (date, time) => {
    const [hours, minutes] = time.split(':');
    const dateTime = new Date(date);
    dateTime.setHours(hours);
    dateTime.setMinutes(minutes);
    onDateTimeChange(dateTime);
  };

  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="MM/dd/yyyy"
      />
      <TimePicker
        onChange={handleTimeChange}
        value={selectedTime}
        format="h:m a"
      />
    </div>
  );
};

export default DateTimePicker;