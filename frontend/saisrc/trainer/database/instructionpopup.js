import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { update_is_TermsApi, Trainers_instructionApi } from "../../api/endpoints";

const InstructionPopup = ({ open, handleAccept, handleDecline, username }) => {
  const [instructions, setInstructions] = useState(''); // State to store fetched instructions
  const [trainerPayment, setTrainerPayment] = useState(''); // State to store trainer payment info
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle error state
  
  useEffect(() => {
    const fetchInstructions = async () => {
      setLoading(true); // Start loading
      try {
        console.log(`Fetching instructions for user: ${username}`);
        const response = await Trainers_instructionApi(username); // Fetch instructions
        
        // Log the entire response to check the structure
        console.log("API response object:", response);

        // Access the first element in the array (response[0])
        if (response && response.length > 0) {
          const data = response[0]; // The actual object you need is in the first array element
          console.log("Fetched college_instruction:", data.college_instruction);
          console.log("Fetched trainer_payment:", data.trainer_payment);

          // Set the state with the fetched data
          setInstructions(data.college_instruction || 'No instructions available.'); 
          setTrainerPayment(data.trainer_payment || 'No payment details available.');
        } else {
          console.error("No data found in the response.");
          setError('No instructions available.');
        }
        
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching instructions:", error);
        setError('Failed to fetch instructions. Please try again.'); // Set error message
        setLoading(false); // Stop loading
      }
    };

    if (open) {
      fetchInstructions(); // Fetch instructions when the dialog opens
    }
  }, [username, open]); // Fetch instructions when component mounts or username changes, or popup is opened

  const handleAcceptClick = async () => {
    console.log("Handling accept...");
    try {
      const response = await update_is_TermsApi(username, { is_terms: true });
      if (response.ok) {
        handleAccept(); // Call handleAccept after successful API call
      } else {
        console.error("Failed to update is_terms:", response.status);
      }
    } catch (error) {
      console.error("Error updating is_terms:", error);
    }
  };

  const handleDeclineClick = async () => {
    console.log("Handling decline...");
    try {
      const response = await update_is_TermsApi(username, { is_terms: false });
      if (response.ok) {
        handleDecline(); // Call handleDecline after successful API call
      } else {
        console.error("Failed to update is_terms:", response.status);
      }
    } catch (error) {
      console.error("Error updating is_terms:", error);
    }
  };

  const dialogStyles = {
    backgroundColor: '#39444e', // Light gray background for the entire dialog
    color: '#333',              // Text color for the entire dialog
  };
  
  const titleStyles = {
    backgroundColor: '#39444e', // Dark gray background for the title
    color: '#fff',              // White text for the title
    padding: '10px',            // Padding for the title
  };
  
  const contentStyles = {
    backgroundColor: '#39444e',
    color: '#fff',              // Text color for the content
    padding: '20px',            // Padding for the content
  };
  
  const actionsStyles = {
    backgroundColor: '#39444e', // Light gray background to match the dialog
    padding: '10px',            // Padding for the buttons area
  };
  
  return (
    <Dialog
      open={open}
      PaperProps={{
        style: dialogStyles, // Apply styles to the whole dialog
      }}
    >
      <DialogTitle style={titleStyles}>Instructions</DialogTitle>
      <DialogContent style={contentStyles}>
        {loading ? (
          <p>Loading instructions...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <h5>College Instructions</h5>
            <p>{instructions}</p> {/* Display fetched college instructions */}
  
            <h5>Trainer Payment: <strong>₹.{trainerPayment}</strong></h5>
            <p></p> {/* Display fetched trainer payment details */}
          </>
        )}
      </DialogContent>
  
      <DialogActions style={actionsStyles}>
        <Button onClick={handleDeclineClick} style={{ color: '#fff' }} color="secondary">
          Decline
        </Button>
        <Button onClick={handleAcceptClick} style={{ color: '#fff' }} color="primary">
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
  
};

export default InstructionPopup;
