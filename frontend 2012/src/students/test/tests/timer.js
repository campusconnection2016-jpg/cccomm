import React, { useState, useEffect } from 'react';
import { FaHourglass } from 'react-icons/fa';
import sandClock from'../../../assets/images/sandclock.png';
import '../../../styles/students.css'
const Timer = ({duration, setTimeLeftCallback  }) => {
    const [remainingTime, setRemainingTime] = useState(duration * 60); // Convert minutes to seconds
    const [timeLeft, setTimeLeft] = useState(duration);


    useEffect(() => {
        setRemainingTime(duration * 60); // Update the timer if duration changes
    }, [duration]);

    useEffect(() => {
        if (remainingTime === 0) {
            setTimeLeftCallback(0);
            return;
        }

        const timer = setInterval(() => {
            setRemainingTime(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                if ((prevTime - 1) % 60 === 0) {
                    // Decrement by 60 seconds, decrease 1 minute
                    return prevTime - 61;
                } else {
                    return prevTime - 1;
                }
            });
        }, 1000); // 1 second in milliseconds
        

        return () => clearInterval(timer);
        setTimeLeftCallback(timeLeft);
    }, [timeLeft, setTimeLeftCallback]);

    // Format the remaining time to HH:MM:SS
   // Format the remaining time to HH:MM:SS
const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};


    return (
        <div className="time-left-container">
  <h4>Time Left</h4>
  <div>
    <img
      src={sandClock}
      className="Campus-logo"
      alt="Sand Clock"
    />
    <span>{formatTime(remainingTime)}</span>
  </div>
</div>

    );
};

export default Timer;