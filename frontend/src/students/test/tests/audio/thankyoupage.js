import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ThankYouPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const duration = state?.duration || "0";
  const testName = state?.testName || "Your Test";

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
        padding: "40px",
        background:'#39444e',
        borderRadius: "15px",
        width: "60%",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h5>🎉 Thank You for Attending Test!</h5>
      
      <p style={{ fontSize: "18px", marginTop: "20px" }}>
        ⏱ Total Duration: <b>{duration} </b>
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "30px",
          background: "#F1A128",
          border: "none",
          color: "white",
          padding: "10px 25px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default ThankYouPage;
