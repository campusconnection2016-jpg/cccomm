import React, { useState, useEffect, useContext } from "react";
import { Table, Form, Pagination } from "react-bootstrap";
import "../../styles/trainingadmin.css";
import {
  getInvoiceByIdApi,
  update_paymentApi,
  updateScheduleDateApi,
  updateInvoiceApi,
  deleteinvoiceApi
} from "../../api/endpoints";
import { Link } from "react-router-dom";
import Footer from "../../footer/footer";
import ErrorModal from "../auth/errormodal";
import { SearchContext } from "../../allsearch/searchcontext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
const InvoiceTB = () => {
  const [invoices, setInvoices] = useState([]);
  const [DateTime, setDateTime] = useState(new Date()); // State for storing the selected schedule date
 const navigate = useNavigate();
  const [test_name, setTestName] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const { searchQuery } = useContext(SearchContext);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // search
  const searchTerm = searchQuery || search;

  // Fetch invoices when the component mounts
  useEffect(() => {
    getInvoiceByIdApi()
      .then((data) => setInvoices(data))
      .catch((error) => console.error("Error fetching invoices:", error));
  }, []);

  // Global filtering for invoices based on searchTerm
  const filteredInvoices = invoices.filter((invoice) => {
    return (
      !searchTerm ||
      Object.values(invoice).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });
  // search

  // To store selected dates for each invoice
  const handleCloseError = () => {
    setShowError(false);
  };
  useEffect(() => {
    getQuestionPapers();
  }, []); // Run once on component mount

  const getQuestionPapers = () => {
    getInvoiceByIdApi()
      .then((data) => {
        setInvoices(data);
      })
      .catch((error) =>
        console.error("Error fetching question papers:", error)
      );
  };

  const handleDownloadInvoice = (invoice) => {
    const doc = new jsPDF();

    // Get the current date in a suitable format (e.g., DD/MM/YYYY)
    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const travelTotal =
      (invoice.travel_days || 0) * (invoice.travel_amount || 0);
    const foodTotal = (invoice.food_days || 0) * (invoice.food_amount || 0);
    const printTotal = (invoice.print_days || 0) * (invoice.print_amount || 0);

    const totalAmount = travelTotal + foodTotal + printTotal;
    const tdsAmount = totalAmount * 0.1;
    const netAmount = totalAmount - tdsAmount;

    // Add title
    const title = "Training Invoice";
    doc.setFontSize(24);
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - textWidth) / 2, 25);

    // Add current date and trainer details
    doc.setFontSize(13);
    doc.text(`Date: ${currentDate}`, 160, 42);
    doc.text("From", 14, 50);
    doc.text(
      `Trainer Name: ${invoice.trainer_id__trainer_name || "N/A"}`,
      14,
      62
    );
    doc.text("Address:", 14, 70);
    doc.text(` ${invoice.trainer_id__address || "N/A"}`, 14, 78);
    doc.text(` ${invoice.trainer_id__city || "N/A"}`, 14, 84);

    // Bank Details
    doc.text("Bank Details", 14, 100);
    doc.text(`Bank Name: ${invoice.trainer_id__bank_name || "N/A"}`, 14, 108);
    doc.text(
      `Branch Name: ${invoice.trainer_id__branch_name || "N/A"}`,
      14,
      116
    );
    doc.text(`Account No: ${invoice.trainer_id__account_no || "N/A"}`, 14, 126);
    doc.text(`IFSC Code: ${invoice.trainer_id__ifsc_code || "N/A"}`, 14, 134);
    doc.text(`PAN Number: ${invoice.trainer_id__pan_number || "N/A"}`, 14, 148);

    // Create table
    doc.autoTable({
      startY: 164,
      head: [
        ["S.No", "Purpose of Claim", "Attachment", "Days", "Amount", "Total"],
      ],
      body: [
        [
          "1",
          "Training",
          "N/A",
          invoice.training_days,
          invoice.training_amount,
          travelTotal.toFixed(2),
        ],
        [
          "2",
          "Travel",
          "Click here",
          invoice.travel_days,
          invoice.travel_amount,
          travelTotal.toFixed(2),
        ],
        [
          "3",
          "Food",
          "Click here",
          invoice.food_days,
          invoice.food_amount,
          foodTotal.toFixed(2),
        ],
        [
          "4",
          "Print",
          "Click here",
          invoice.print_days,
          invoice.print_amount,
          printTotal.toFixed(2),
        ],
      ],
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Gross: ${totalAmount.toFixed(2)}`, 140, finalY);
    doc.text(`TDS Deduction (10%): ${tdsAmount.toFixed(2)}`, 140, finalY + 10);
    doc.text(`Net Amount: ${netAmount.toFixed(2)}`, 140, finalY + 20);

    // Adding links to download respective PDFs
    const travelLinkY = finalY + 30;
    const foodLinkY = travelLinkY + 10;
    const miscLinkY = foodLinkY + 10;

    // Set link for travel expenses
    const travelPDF = generatePDFBase64(invoice, "travel");
    doc.setTextColor(0, 0, 255); // Change color to blue for links
    doc.textWithLink("Download Travel Expenses PDF", 14, travelLinkY, {
      url: travelPDF,
    });

    // Set link for food allowance
    const foodPDF = generatePDFBase64(invoice, "food");
    doc.textWithLink("Download Food Allowance PDF", 14, foodLinkY, {
      url: foodPDF,
    });

    // Set link for miscellaneous expenses
    const miscPDF = generatePDFBase64(invoice, "misc");
    doc.textWithLink("Download Miscellaneous Expenses PDF", 14, miscLinkY, {
      url: miscPDF,
    });

    // Save the main invoice PDF
    doc.save(`Invoice_${invoice.invoice_no}.pdf`);
  };
 const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        // Call the delete API
        await deleteinvoiceApi(id);
  
        // Show success message
        setErrorMessage("Data Deleted Successfully");
        setShowError(true);
  
        // Update the state to remove the deleted invoice
        const updatedInvoices = invoices.filter((item) => item.id !== id);
        setInvoices(updatedInvoices);
      } catch (error) {
        console.error("Error deleting invoice:", error);
        setErrorMessage("Data Not Deleted");
        setShowError(true);
      }
    }
  };
  // Function to generate PDF as Base64 string
  const generatePDFBase64 = (invoice, type) => {
    const pdfDoc = new jsPDF();
    let title = "";
    let textContent = "";

    switch (type) {
      case "travel":
        title = "Travel Expenses Details";
        textContent = invoice.travel_expenses_text || "No details available.";
        break;
      case "food":
        title = "Food Allowance Details";
        textContent = invoice.food_allowance_text || "No details available.";
        break;
      case "misc":
        title = "Miscellaneous Expenses Details";
        textContent = invoice.misc_expenses_text || "No details available.";
        break;
    }

    pdfDoc.text(title, 10, 10);
    pdfDoc.text(textContent, 10, 20);

    // Return Base64 string
    return pdfDoc.output("datauristring");
  };

  const filteredData = invoices.filter((item) => {
    // Ensure item.invoice_no is a string before calling toLowerCase
    const invoice = item.invoice_no || "";
    return invoice.toLowerCase().includes(test_name.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPaginationItems = () => {
    const items = [];
    let startPage, endPage;

    if (totalPages <= 3) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage === 1) {
      startPage = 1;
      endPage = 3;
    } else if (currentPage === totalPages) {
      startPage = totalPages - 2;
      endPage = totalPages;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return items;
  };

  const handlePay = (id) => {
    console.log(`Payment initiated for invoice ID: ${id}`);

    // Call the API to update payment status
    update_paymentApi(id)
      .then(() => {
        console.log(`Payment status updated to 'Paid' for invoice ID: ${id}`);

        // Update the local state to reflect payment status
        setInvoices((prevInvoices) =>
          prevInvoices.map((invoice) =>
            invoice.id === id ? { ...invoice, payment_status: "Paid" } : invoice
          )
        );
      })
      .catch((error) => {
        console.error("Error updating payment status:", error);
        setErrorMessage("Error updating payment status");
        setShowError(true);
      });
  };

  const [selectedDates, setSelectedDates] = useState({});

  const handleDateChange = (date, id) => {
    console.log(`Date changed for invoice ID: ${id}, New Date: ${date}`);

    setSelectedDates((prevDates) => ({
      ...prevDates,
      [id]: date, // Store the selected date for this invoice id
    }));
  };

   const handlePreview = (item) => {
      // Prevent default form submission behavior
      const doc = new jsPDF();
    
      // Get the current date in a suitable format (e.g., DD/MM/YYYY)
      const currentDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    
      // Assuming you already have the formData as an object from your state or API response
      // Populate the formData with the data from the clicked row (item)
      const formData = {
        invoice_no: item.invoice_no,
        college_name: item.college_id__college,
        training_days: item.training_days,
        training_amount: item.training_amount,
        travel_days: item.travel_days,
        travel_amount: item.travel_amount,
        food_days: item.food_days,
        food_amount: item.food_amount,
        print_days: item.print_days,
        print_amount: item.print_amount,
        travel_expenses: item.travel_expenses, // Assuming file links are included
        food_allowance: item.food_allowance,
        misc_expenses: item.misc_expenses,
        is_tds_deduct: item.is_tds_deduct,
        trainer_name: item.trainer_id__trainer_name || "N/A",  // Access trainer_name through trainer_id
        trainer_pan_number: item.trainer_id__pan_number || "N/A",  // Access pan_number through trainer_id
        address: item.trainer_id__address || "N/A",  // Access address through trainer_id
        city: item.trainer_id__city || "N/A",  // Access city through trainer_id
        bank_name: item.trainer_id__bank_name || "N/A",  // Access bank_name through trainer_id
        branch_name: item.trainer_id__branch_name || "N/A",  // Access branch_name through trainer_id
        account_no: item.trainer_id__account_no || "N/A",  // Access account_no through trainer_id
        ifsc_code: item.trainer_id__ifsc_code || "N/A",  // Access ifsc_code through trainer_id
        pan_number: item.trainer_id__pan_number || "N/A",  // Access pan_number through trainer_id
      };
    
      // Calculate totals
      const trainingTotal = (formData.training_amount || 0) / (formData.training_days || 1);
      const travelTotal = (formData.travel_amount || 0) / (formData.travel_days || 1); // Avoid division by zero
      const foodTotal = (formData.food_amount || 0) / (formData.food_days || 1); // Avoid division by zero
      const printTotal = (formData.print_amount || 0) / (formData.print_days || 1); // Avoid division by zero
    
      // Calculate total amount safely
      const totalAmount = 
        parseFloat(formData.training_amount || 0) + 
        parseFloat(formData.travel_amount || 0) + 
        parseFloat(formData.food_amount || 0) + 
        parseFloat(formData.print_amount || 0);
    
      // Ensure totalAmount is a valid number before using toFixed
      const formattedTotalAmount = isNaN(totalAmount) ? "0.00" : totalAmount.toFixed(2);
    
      // Initialize tdsAmount and netAmount variables
      let tdsAmount = 0;
      let netAmount = parseFloat(formattedTotalAmount);
    
      // Only calculate TDS if is_tds_deduct is true
      if (formData.is_tds_deduct === true) {
        tdsAmount = parseFloat(formData.training_amount) * 0.1;
        netAmount = parseFloat(formattedTotalAmount) - tdsAmount;
      }
    
      console.log("Formatted Total Amount:", formattedTotalAmount);
      console.log("TDS Amount:", tdsAmount);
      console.log("Net Amount:", netAmount);
    
      // Add title
      const title = "Training Invoice";
      const titleFontSize = 24;
      doc.setFontSize(titleFontSize);
    
      // Calculate text width and center it
      const textWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.getWidth();
    
      // Set the background to fill the entire page width with reduced height
      doc.setFillColor(200); // Grey color
      doc.rect(0, 10, pageWidth, 20, "F"); // Full-width background rectangle with reduced height (20)
    
      // Set the font to bold and add the centered title text
      doc.setFont("Helvetica", "bold");
    
      // Center the text but only affect the text's position, not the background
      const xPosition = (pageWidth - textWidth) / 2;
      doc.text(title, xPosition, 25); // Centered text with the Y position adjusted to fit within reduced background height
    
      // Add current date and trainer details
      doc.setFontSize(13);
      doc.text(`Date: ${currentDate}`, 160, 42);
      doc.text("From", 14, 50);
      doc.text(`Trainer Name: ${formData.trainer_name}`, 14, 62); // Display trainer_name
      doc.text("Address:", 14, 70);
      doc.text(` ${formData.address}`, 14, 78); // Display address
      doc.text(` ${formData.city}`, 14, 84); // Display city
      doc.text("Bank Details", 14, 100);
      doc.text(`Bank Name: ${formData.bank_name}`, 14, 108); // Display bank_name
      doc.text(`Branch Name: ${formData.branch_name}`, 14, 116); // Display branch_name
      doc.text(`Account No: ${formData.account_no}`, 14, 126); // Display account_no
      doc.text(`IFSC Code: ${formData.ifsc_code}`, 14, 134); // Display ifsc_code
      doc.text(`PAN Number: ${formData.pan_number}`, 14, 148); // Display pan_number
    
      // Convert file input into URLs (if files exist)
      const travelFileLink = formData.travel_expenses && formData.travel_expenses instanceof File 
        ? URL.createObjectURL(formData.travel_expenses) 
        : null;
      const foodFileLink = formData.food_allowance && formData.food_allowance instanceof File 
        ? URL.createObjectURL(formData.food_allowances) 
        : null;
      const printFileLink = formData.misc_expenses && formData.misc_expenses instanceof File 
        ? URL.createObjectURL(formData.misc_expenses) 
        : null;
    
      // Create table with autoTable plugin
      doc.autoTable({
        startY: 164, // Adjust the starting Y coordinate to account for the bank details
        head: [["S.No", "Purpose of Claim", "Attachment", "Days", "Amount", "Total"]],
        body: [
          [
            "1",
            `Training for ${formData.college_name}`,
            "N/A",
            formData.training_days,
            trainingTotal.toFixed(2),
            formData.training_amount,
          ],
          [
            "2",
            "Travel",
            travelFileLink ? { text: "Link", link: travelFileLink } : "N/A",
            formData.travel_days,
            travelTotal.toFixed(2),
            formData.travel_amount,
          ],
          [
            "3",
            "Food",
            foodFileLink ? { text: "Link", link: foodFileLink } : "N/A",
            formData.food_days,
            foodTotal.toFixed(2),
            formData.food_amount,
          ],
          [
            "4",
            "Print",
            printFileLink ? { text: "Link", link: printFileLink } : "N/A",
            formData.print_days,
            printTotal.toFixed(2),
            formData.print_amount,
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 14, // Increase font size for the table content
        },
        headStyles: {
          fillColor: [211, 211, 211],
          textColor: [0, 0, 0],
          fontSize: 14,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 12,
        },
        didDrawCell: function (data) {
          // Make links clickable inside the table
          const { cell, column, row } = data;
    
          if (column.index === 2 && cell.text[0] === "Link") {
            const link = row.raw[2].link;
            if (link) {
              doc.link(cell.textPos.x, cell.textPos.y, cell.width, cell.height, { url: link });
            }
          }
        },
      });
    
      // Add totals to the right of the table
      const finalY = doc.lastAutoTable.finalY + 10;
      const rightMargin = 140;
      doc.text(`Gross: ${totalAmount.toFixed(2)}`, rightMargin, finalY);
      if (formData.is_tds_deduct === true) {
        doc.text(`TDS Deduction (10%): ${tdsAmount.toFixed(2)}`, rightMargin, finalY + 7);
      } else {
        doc.text("No TDS Deduction", rightMargin, finalY + 7);
      }
      doc.text(`Net Amount: ${netAmount.toFixed(2)}`, rightMargin, finalY + 14);
    
      // Save the document as a PDF
      doc.save(`invoiceNo:_${formData.invoice_no}.pdf`);
    };
  const handleUpdateSchedule = (id) => {
    const selectedDate = selectedDates[id];

    console.log(`Attempting to update schedule date for invoice ID: ${id}`);

    if (!selectedDate) {
      console.log("No date selected. Please select a date.");
      alert("Please select a date before updating.");
      return;
    }

    console.log(`Selected date for invoice ID ${id}: ${selectedDate}`);

    // Adjust the selectedDate for time zone offset before sending to the API
    const adjustedDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    );

    console.log("Original selected date object:", selectedDate);
    console.log(
      "Adjusted schedule date for API (ISO string):",
      adjustedDate.toISOString()
    );

    // Call the API to update the schedule_date
    updateScheduleDateApi(id, adjustedDate)
      .then(() => {
        console.log(
          `API call successful: Schedule date updated for invoice ID: ${id}`
        );

        // Update the local state with the new schedule_date
        setInvoices((prevInvoices) =>
          prevInvoices.map((invoice) =>
            invoice.id === id
              ? { ...invoice, schedule_date: adjustedDate }
              : invoice
          )
        );
      })
      .catch((error) => {
        console.error("Error updating schedule date:", error);
        setErrorMessage("Error updating schedule date");
        setShowError(true);
      });
  };
  const handleInvoiceClick = (invoiceNo) => {
    // Redirect to UpdateInvoice page with the selected invoice_no
    navigate(`/update-invoice/${invoiceNo}`);
  };

  return (
    <div>
      <div className="product-table-container">
        <h6>Invoice Data</h6>
        <br />

        <input
          className="search-box"
          type="text"
          placeholder="Search..."
          value={test_name}
          onChange={(e) => setTestName(e.target.value)}
        />
        <div className="po-table-responsive-t">
                     <table className="placement-table-t">

        
            <thead >
              <tr>
                <th>Invoice No</th>
                <th>Trainer Name</th>
                <th>Payment Status</th>
                <th>Preview</th>
                <th>Schedule</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody >
              {currentData.map((item) => (
                <tr key={item.id} >
                  <td>
                    <Link to={`/update-invoice/${item.invoice_no}`}
                                         style={{ color: "white", cursor: "pointer" }}
                                         onClick={() => handleInvoiceClick(item.invoice_no)}
                                       >
                                         {item.invoice_no}
                                       </Link>  
                  </td>
                  <td>{item.trainer_id__trainer_name}</td>
                  <td>
                    {item.payment_status === "Paid" ? (
                      <button
                        className="button-ques-save"
                        style={{ width: "70px" }}
                        disabled
                      >
                        Paid
                      </button>
                    ) : (
                      <button
                        className="button-ques-save"
                        style={{ width: "70px" }}
                        onClick={() => handlePay(item.id)}
                      >
                        Pay
                      </button>
                    )}
                  </td>

                <td>  <button 
              onClick={() => handlePreview(item)} // Pass the row data to handlePreview
              className="button-ques-save"
            >
              Preview
            </button></td>
                 
            <td style={{ width: "350px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Smaller DatePicker */}
                      <DatePicker
                        selected={
                          selectedDates[item.id] ||
                          (item.schedule_date
                            ? new Date(item.schedule_date)
                            : null)
                        }
                        onChange={(date) => handleDateChange(date, item.id)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={15}
                        dateFormat="dd-MM-yyyy, h:mm aa"
                        timeCaption="Time"
                        className="input-date-custom-inv"
                        autoComplete="off"
                        required
                      />

                      {/* Smaller Update Button */}
                      <button
                        className="button-ques-save"
                        style={{ width: "100px" }}
                        onClick={() => handleUpdateSchedule(item.id)}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td>
          <button
              onClick={() => handleDelete(item.id)} // Add delete button
              className="action-button delete" 
              style={{ color: "orange" }}>🗑
            </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p></p>
        <div className="dis-page">
          <Form.Group
            controlId="itemsPerPageSelect"
            style={{ display: "flex" }}
          >
            <Form.Label style={{ marginRight: "10px" }}>Display:</Form.Label>
            <Form.Control
              as="select"
              style={{ width: "50px", boxShadow: "none", outline: "none" }}
              className="label-dis"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset page to 1 when items per page changes
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>

          <Pagination className="pagination-custom">
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {getPaginationItems()}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </div>
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default InvoiceTB;
