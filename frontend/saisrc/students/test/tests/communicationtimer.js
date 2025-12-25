import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import sandClock from "../../../assets/images/sandclock.png";

const CommunicationTimer = ({
  duration,
  setTimeLeftCallback,
  handleTestCompletionTimer,
  dtmEnd,
}) => {
  const [remainingTime, setRemainingTime] = useState(duration * 1000);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let remaining;

      // ✅ Calculate remaining time (based on either dtmEnd or duration)
      if (dtmEnd) {
        const end = new Date(
          dtmEnd.replace(/-/g, "/").replace(/T/g, " ")
        ).getTime();
        remaining = end - now;
      } else {
        const expectedEnd = startTime + duration * 1000;
        remaining = expectedEnd - now;
      }

      if (remaining <= 0) {
        clearInterval(timer);
        setRemainingTime(0);

        // ✅ Safely call callbacks only if functions
        if (typeof setTimeLeftCallback === "function") {
          setTimeLeftCallback(0);
        }
        if (typeof handleTestCompletionTimer === "function") {
          handleTestCompletionTimer();
        }
      } else {
        setRemainingTime(remaining);
        if (typeof setTimeLeftCallback === "function") {
          setTimeLeftCallback(remaining / 1000);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, dtmEnd, setTimeLeftCallback, handleTestCompletionTimer, startTime]);

  // ✅ Format HH:MM:SS
  const formatTime = (time) => {
    const totalSeconds = Math.max(0, Math.floor(time / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        position: "relative",
        color: "black",
        width: "100%",
        backgroundColor: "#F1A128",
      }}
    >
      <p>Time Left</p>
      <div>
        <img
          style={{ borderRadius: "8px", width: "40px", height: "auto" }}
          src={sandClock}
          alt="timer"
        />
        <span style={{ fontWeight: "bold" }}> {formatTime(remainingTime)}</span>
      </div>
    </div>
  );
};

// ✅ Updated prop types (optional props allowed)
CommunicationTimer.propTypes = {
  duration: PropTypes.number.isRequired,
  setTimeLeftCallback: PropTypes.func, // ✅ made optional
  handleTestCompletionTimer: PropTypes.func, // ✅ made optional
  dtmEnd: PropTypes.string,
};

export default CommunicationTimer;
