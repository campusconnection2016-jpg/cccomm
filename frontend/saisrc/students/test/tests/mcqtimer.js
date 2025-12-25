import React, { useState, useEffect } from 'react';
import sandClock from '../../../assets/images/sandclock.png';
import PropTypes from 'prop-types';

const McqTimer = ({ duration, setTimeLeftCallback, handleTestCompletionTimer, dtmEnd }) => {
    const [remainingTime, setRemainingTime] = useState(duration * 1000);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();

            let remaining;
            if (dtmEnd) {
                // 🕒 If test has a fixed end time, calculate remaining time from dtmEnd
                const end = new Date(dtmEnd.replace(/-/g, '/').replace(/T/g, ' ')).getTime();
                remaining = end - now;
            } else {
                // ⏳ Otherwise, count down based on the given duration
                const expectedEnd = startTime + duration * 1000;
                remaining = expectedEnd - now;
            }

            if (remaining <= 0) {
                clearInterval(timer);
                setRemainingTime(0);
                setTimeLeftCallback(0);
                handleTestCompletionTimer();
            } else {
                setRemainingTime(remaining);
                setTimeLeftCallback(remaining / 1000);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [duration, dtmEnd, setTimeLeftCallback, handleTestCompletionTimer, startTime]);

    const formatTime = (time) => {
        const totalSeconds = Math.max(0, Math.floor(time / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ position: 'relative', color: 'black', width: '100%', backgroundColor: '#F1A128' }}>
            <p>Time Left</p>
            <div>
                <img
                    style={{ borderRadius: '8px', width: '40px', height: 'auto' }}
                    src={sandClock}
                    alt="timer"
                />
                <span style={{ fontWeight: 'bold' }}>{formatTime(remainingTime)}</span>
           </div>
        </div>
    );
};

// ✅ Keep this for runtime  prop validation
McqTimer.propTypes = {
    duration: PropTypes.number.isRequired,
    setTimeLeftCallback: PropTypes.func.isRequired,
    handleTestCompletionTimer: PropTypes.func.isRequired,
    dtmEnd: PropTypes.string
};

export default McqTimer;
