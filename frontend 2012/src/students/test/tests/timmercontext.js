// TimerContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const [remainingTime, setRemainingTime] = useState(0);
    const [timerPaused, setTimerPaused] = useState(false);

    // Adjust the timer duration as per your requirement
    const duration = 30; // in minutes

    useEffect(() => {
        let timer = null;
        if (!timerPaused) {
            timer = setInterval(() => {
                setRemainingTime(prevTime => {
                    if (prevTime <= 0) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000); // 1 second in milliseconds
        }

        return () => clearInterval(timer);
    }, [timerPaused]);

    const pauseTimer = () => {
        setTimerPaused(true);
    };

    const resumeTimer = () => {
        setTimerPaused(false);
    };

    const resetTimer = () => {
        setRemainingTime(duration * 60);
    };

    const value = {
        remainingTime,
        pauseTimer,
        resumeTimer,
        resetTimer,
    };

    return (
        <TimerContext.Provider value={value}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => useContext(TimerContext);
