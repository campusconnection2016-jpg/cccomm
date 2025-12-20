import React, { useState, useEffect, useRef } from 'react';
import sandClock from '../../../assets/images/sandclock.png';
import PropTypes from 'prop-types';

const CodingTimer = ({
  duration,                     // total duration (in seconds)
  setTimeLeftCallback,          // callback to parent for time updates
  handleTestCompletionTimer,    // called when timer ends
  showFinalPage,                // stop timer when true
  dtmEnd                        // optional end datetime
}) => {

  const [remainingTime, setRemainingTime] = useState(duration * 1000); // in ms
  const endTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const hasCompletedRef = useRef(false); // ✅ prevents multiple triggers

  useEffect(() => {
    // ⏹ Stop timer when showing final page
    if (showFinalPage) {
      clearInterval(intervalRef.current);
      return;
    }

    // ✅ Set end time once — either from dtmEnd or based on duration
    if (!endTimeRef.current) {
      endTimeRef.current = dtmEnd
        ? new Date(
            dtmEnd
              .replace(/-/g, '/')
              .replace(/T/g, ' ')
              .replace(/Z/g, '')
          ).getTime()
        : Date.now() + duration * 1000;
    }

    const updateTimer = () => {
      const now = Date.now();
      const newTime = endTimeRef.current - now;

      if (newTime <= 0) {
        clearInterval(intervalRef.current);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setRemainingTime(0);
          setTimeLeftCallback(0);
          handleTestCompletionTimer(); // ✅ call only once
        }
        return;
      }

      setRemainingTime(newTime);
      setTimeLeftCallback(newTime / 1000);
    };

    // ⏱ Update every 250ms (more efficient & browser-safe)
    updateTimer();
    intervalRef.current = setInterval(updateTimer, 250);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [duration, dtmEnd, showFinalPage, handleTestCompletionTimer, setTimeLeftCallback]);

  // 🧮 Format HH:MM:SS
  const formatTime = (time) => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="timer-stop"
      style={{
        position: 'relative',
        color: 'black',
        width: '100%',
        backgroundColor: '#F1A128',
        padding: '6px',
        borderRadius: '8px',
        textAlign: 'center'
      }}
    >
      <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Time Left</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <img
          style={{ borderRadius: '8px', width: '30px', height: 'auto' }}
          src={sandClock}
          alt="timer icon"
        />
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          {formatTime(remainingTime)}
        </span>
      </div>
    </div>
  );
};

CodingTimer.propTypes = {
  duration: PropTypes.number.isRequired,
  setTimeLeftCallback: PropTypes.func.isRequired,
  handleTestCompletionTimer: PropTypes.func.isRequired,
  dtmEnd: PropTypes.string,
  showFinalPage: PropTypes.bool
};

export default CodingTimer;
