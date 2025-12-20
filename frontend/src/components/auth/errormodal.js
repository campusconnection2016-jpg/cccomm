import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import "./errormodal.css";
import { useTheme, useMediaQuery } from "@mui/material";

const ErrorModal = ({ show, handleClose, errorMessage }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    let timer;
    if (show) {
      console.log("Modal opened, starting timer...");
      timer = setTimeout(() => {
        console.log("Timer finished, closing modal...");
        handleClose(); // ✅ Ensure this function properly updates state
      }, 30000); // Auto-close after 5 seconds
    }

    return () => {
      console.log("Cleaning up previous timer...");
      clearTimeout(timer); // ✅ Cleanup timeout when component unmounts or re-renders
    };
  }, [show]); // ✅ Runs only when 'show' changes

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal-width"
      style={{
        marginTop: isMobile ? "-220px" : "-150px",
        width: isMobile ? "200px" : "300px",
        marginLeft: isMobile ? "90px" : "500px",
      }}
    >
      <Modal.Header
        closeButton
        style={{
          height: isMobile ? "1px" : "5px",
          backgroundColor: "#F1A128",
          color: "black",
          borderBottom: "none",
        }}
      ></Modal.Header>
      <Modal.Body
        style={{
          fontSize: isMobile ? "15px" : "16px",
          backgroundColor: "#F1A128",
          marginLeft: "10px",
          padding: "20px",
          fontWeight: "bold",
        }}
      >
        <div style={{ justifyContent: "center" }}>{errorMessage}</div>
      </Modal.Body>
    </Modal>
  );
};

export default ErrorModal;
