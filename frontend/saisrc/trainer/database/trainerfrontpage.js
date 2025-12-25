import React, { useState, useEffect } from "react";
import { Col, Row, Form, Button, Table } from "react-bootstrap";
import {
  getTrainers_staus,
  update_is_EditApi,
  getSkillApi,
  updateTrainer_API_NEW,
} from "../../api/endpoints";
import Select, { components } from "react-select";
import CustomOption from "../../components/test/customoption";
import "../../styles/trainer.css";
import ErrorModal from "../../components/auth/errormodal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { rgb } from "pdf-lib";
import { PDFDocument } from "pdf-lib";
// Import necessary modules from pdf-lib
import { StandardFonts } from "pdf-lib";

// Rest of your code...

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#39444e",
    color: "#fff", // Text color
    borderColor: state.isFocused ? "" : "#ffff", // Border color on focus
    boxShadow: "none", // Remove box shadow
    "&:hover": {
      borderColor: state.isFocused ? "#ffff" : "#ffff", // Border color on hover
    },
    "&.css-1a1jibm-control": {
      // Additional styles for the specific class
    },
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      fontSize: "12px", // Smaller font size

      width: "98%",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#ffff", // Text color for selected value
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      fontSize: "12px", // Smaller font size
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#39444e"
      : state.isFocused
      ? "#39444e"
      : "#39444e",
    color: "#ffff", // Text color
    "&:hover": {
      backgroundColor: "#39444e", // Background color on hover
      color: "#ffff", // Text color on hover
    },
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      fontSize: "12px", // Smaller font size
      width: "98%",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#39444e",
    "@media (max-width: 768px)": {
      // Adjust for mobile devices
      fontSize: "12px", // Smaller font size
    },
  }),
};

const TrainerFrontPage = ({ username, userRole, onEditSuccess }) => {
  console.log("user", username);
  const [is_active, setactive] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [skill, setSkill] = useState([]);
  const [selectedskill, setSelectedskill] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [trainerData, setTrainerData] = useState({
    trainer_name: "",
    location: "",
    certification: "",
    gst: "",
    experience: "",
    qualification: "",
    is_active: true,
    state: "",
    city: "",
    mobile_no: "",
    email_id: "",
    skill_id: "",
    languages_known: "",
    bank_name: "",
    ifsc_code: "",
    branch_name: "",
    account_no: "",
    photo: null,
    resume: null,
    user_name: "",
    address: "",
  });

  //gayu
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    // Handling file inputs
    if (files) {
      setTrainerData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      setTrainerData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  useEffect(() => {
    getSkillApi()
      .then((data) => {
        // Log data to ensure it's correctly received
        console.log("Skills data:", data);
        const noneOption = { value: "", label: "None" };

        // Map data to match Select component requirements
        const formattedSkills = data.map((item) => ({
          value: item.id,
          label: item.skill_name,
        }));

        // Include "None" option at the beginning
        formattedSkills.unshift(noneOption);

        setSkill(formattedSkills);
      })
      .catch((error) => console.error("Error fetching Skills:", error));

    loadTrainers();
  }, []);

  const [mobileNoError, setMobileNoError] = useState("");
  const [emailIdError, setEmailIdError] = useState("");

  const validateMobileNo = (mobileNo) => {
    const regex = /^[6789]\d{9}$/;
    return regex.test(mobileNo);
  };

  const validateEmailId = (emailId) => {
    // Simple regex for email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailId);
  };

  const loadTrainers = () => {
    getTrainers_staus(username) // Pass the username to fetch the correct trainer's data
      .then((data) => {
        if (data) {
          setTrainerData((prevState) => ({
            ...prevState,
            trainer_name: data.trainer_name || "",
            location: data.location || "",
            certification: data.certification || "",
            gst: data.gst || "",
            experience: data.experience || "",
            qualification: data.qualification || "",
            is_active: data.is_active || true,
            state: data.state || "",
            city: data.city || "",
            mobile_no: data.mobile_no || "",
            email_id: data.email_id || "",
            skill_id: data.skill_id || "",
            languages_known: data.languages_known || "",
            bank_name: data.bank_name || "",
            ifsc_code: data.ifsc_code || "",
            branch_name: data.branch_name || "",
            account_no: data.account_no || "",
            pan_number: data.pan_number || "",
            photo: data.photo || null,
            address: data.address || "",
            resume_url: data.resume_url || null,
            remarks: data.remarks || null,
            user_name: data.user_name || "", // Ensure that user_name is set here
            is_edit: data.is_edit || false,
          }));
          setIsReadOnly(data.is_edit);
        } else {
          console.error("No data found for the provided username");
        }
      })
      .catch((error) => {
        console.error("Error fetching trainers:", error);
      });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setTrainerData((prevState) => ({
      ...prevState,
      [name]: files[0], // Take the first file from the FileList (for single file upload)
    }));
  };
  const viewResumeAsPDF = async () => {
    if (trainerData.remarks) {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();

      // Preprocess text: replace unsupported characters and define sections
      const cleanedResumeText = trainerData.remarks
        .replace(/➢/g, "-")
        .replace(//g, "-")
        .replace(//g, "•");
      // Define font sizes and spacings for different sections
      const fontSizeTitle = 16;
      const fontSizeText = 12;
      const lineHeight = 18;
      let y = height - 50;

      // Define sections based on keywords or content structure
      const sections = cleanedResumeText.split(/\n(?=[A-Z])/); // Splits at each new line that starts with a capital letter (approximate section)

      // Load the default font
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Draw each section with appropriate styling
      sections.forEach((section, index) => {
        if (y < 100) {
          // Add new page if necessary
          page = pdfDoc.addPage([600, 800]);
          y = height - 50;
        }

        // Check if section is a title or body based on content pattern
        if (
          section.match(
            /^(Objective|Educational Qualification|Professional Summary|Skills|Projects|Personal Details)/i
          )
        ) {
          page.drawText(section.trim(), {
            x: 50,
            y,
            size: fontSizeTitle,
            font,
          });
          y -= fontSizeTitle + 10;
        } else {
          page.drawText(section.trim(), {
            x: 50,
            y,
            size: fontSizeText,
            lineHeight,
          });
          y -= fontSizeText + lineHeight * section.split("\n").length;
        }

        // Add extra space between sections
        y -= 10;
      });

      // Save and open the PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    } else {
      alert("No resume text available");
    }
  };

  //gayu

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Append selected skills as a JSON string
    let skill_values =
      selectedskill && selectedskill.length > 0
        ? selectedskill.map((skill) => skill.value)
        : [];
    formData.append("skills", JSON.stringify(skill_values));
    const { mobile_no, email_id } = trainerData;

    if (!validateMobileNo(mobile_no)) {
      setMobileNoError(
        "Mobile number must start with 6, 7, 8, or 9 and be exactly 10 digits long."
      );
      return;
    } else {
      setMobileNoError("");
    }

    if (!validateEmailId(email_id)) {
      setEmailIdError("Invalid email address format.");
      return;
    } else {
      setEmailIdError("");
    }

    // Append photo if it exists
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    // Ensure 'username' exists and matches
    if (!username) {
      console.error("Username is not defined.");
      setErrorMessage("Username is not defined.");
      setShowError(true);
      return;
    }

    formData.append("user_name", username);

    // Check if the appended username matches
    const formUserName = formData.get("user_name");
    if (!formUserName) {
      console.error("Form user_name is missing.");
      setErrorMessage("Form user_name is missing.");
      setShowError(true);
      return;
    }

    if (formUserName !== username) {
      console.error("Usernames do not match. Aborting submission.");
      setErrorMessage("Usernames do not match. Please try again.");
      setShowError(true);
      return;
    }

    const logFormData = (formData) => {
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    };

    // Inside handleSubmit before sending the formData
    logFormData(formData);
    console.log("llog", logFormData);

    try {
      const result = await updateTrainer_API_NEW(formData, username);
      if (result.status !== null) {
        setErrorMessage("Data Updated Successfully");
        setShowError(true);
        setSelectedskill(null);
        e.target.reset();
        try {
          const editResult = await update_is_EditApi(username, {
            is_edit: true,
          });
          if (editResult.status === 200) {
            console.log("is_edit updated to true successfully.");
            setIsReadOnly(true);

            // Call the success handler to update the parent state
            onEditSuccess();

            // Redirect to dashboard after successful form submission
            // navigate("/dashboard");
          } else {
            console.error("Failed to update is_edit:", editResult.status);
          }
        } catch (error) {
          console.error("Error updating is_edit:", error);
        }
      } else {
        setErrorMessage(
          `Data Update Failed: ${result.message || "Unknown error"}`
        );
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage("Failed to Add. Check console for details.");
      setShowError(true);
    }
  };

  return (
    <div className="form-ques-trainer">
      <div className="form-ques-trainer">
        <h5 style={{ color: "white" }}>Add Trainers Profile </h5>
        <p></p>
        <Row>
          <Col>
            <form onSubmit={handleSubmit}>
              <Row md={12}>
                <Col>
                  <div controlId="trainer_name">
                    <label className="label5-ques">Trainer Name</label>
                    <p></p>
                    <input
                      type="text"
                      name="trainer_name"
                      className="input-ques"
                      value={trainerData.trainer_name}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
                <Col>
                  <div controlId="city">
                    <label className="label5-ques">City</label>
                    <p></p>
                    <input
                      type="text"
                      name="city"
                      className="input-ques"
                      value={trainerData.city}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
                <Col>
                  <div controlId="address">
                    <label className="label5-ques">Address</label>
                    <p></p>
                    <input
                      type="text"
                      name="address"
                      className="input-ques"
                      value={trainerData.address}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
              </Row>
              <p></p>
              <Row md={12}>
                <Col>
                  <div controlId="state">
                    <label className="label5-ques">State</label>
                    <p></p>
                    <input
                      type="text"
                      name="state"
                      className="input-ques"
                      value={trainerData.state}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
                <Col>
                  <div controlId="qualification">
                    <label className="label5-ques">Qualification</label>
                    <p></p>
                    <input
                      type="text"
                      name="qualification"
                      className="input-ques"
                      value={trainerData.qualification}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
                <Col>
                  <div controlId="experience">
                    <label className="label5-ques">Experience</label>
                    <p></p>
                    <input
                      type="text"
                      name="experience"
                      className="input-ques"
                      value={trainerData.experience}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
              </Row>
              <p></p>
              <Row md={12}>
                <Col>
                  <div controlId="mobile_no">
                    <label className="label5-ques">Mobile No</label>
                    <p></p>
                    <input
                      readOnly={isReadOnly}
                      type="text"
                      name="mobile_no"
                      className="input-ques"
                      value={trainerData.mobile_no}
                      onChange={(e) =>
                        setTrainerData({
                          ...trainerData,
                          mobile_no: e.target.value,
                        })
                      }
                      pattern="[6789][0-9]{9}" // Regex pattern for HTML5 validation
                      required
                    />
                    {mobileNoError && (
                      <p className="error-message">{mobileNoError}</p>
                    )}
                  </div>
                </Col>

                <Col>
                  <div controlId="email_id">
                    <label className="label5-ques">Email Id</label>
                    <p></p>
                    <input
                      readOnly={isReadOnly}
                      type="email" // HTML5 email input type
                      name="email_id"
                      className="input-ques"
                      value={trainerData.email_id}
                      onChange={(e) =>
                        setTrainerData({
                          ...trainerData,
                          email_id: e.target.value,
                        })
                      }
                      required
                    />
                    {emailIdError && (
                      <p className="error-message">{emailIdError}</p>
                    )}
                  </div>
                </Col>
                <Col>
                  <div controlId="languages_known">
                    <label className="label5-ques">Languages Known</label>
                    <p></p>
                    <input
                      type="text"
                      name="languages_known"
                      className="input-ques"
                      value={trainerData.languages_known}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
              </Row>
              <p></p>
              <Row md={12}>
                <Col>
                  <div className="add-profile" controlId="skill_id">
                    <label className="label6-ques">Skills**</label>
                    <p></p>
                    <Select
                      options={skill} // The list of skills
                      value={selectedskill} // The currently selected skills
                      onChange={isReadOnly ? null : setSelectedskill} // Disable onChange if in read-only mode
                      placeholder="Select skill"
                      styles={customStyles}
                      components={{ Option: CustomOption }}
                      closeMenuOnSelect={false}
                      isDisabled={isReadOnly} // Disable the component if in read-only mode
                      isMulti
                    />
                  </div>
                </Col>
                <Col>
                  <div controlId="location">
                    <label className="label5-ques">Preferred Location</label>
                    <p></p>
                    <input
                      type="text"
                      name="location"
                      className="input-ques"
                      value={trainerData.location}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>

                <Col>
                  <div controlId="bank_name">
                    <label className="label5-ques">Bank Name</label>
                    <p></p>
                    <input
                      type="text"
                      name="bank_name"
                      className="input-ques"
                      value={trainerData.bank_name}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
              </Row>
              <p></p>

              <Row md={12}>
                <Col>
                  <div controlId="branch_name">
                    <label className="label5-ques">Branch Name</label>
                    <p></p>
                    <input
                      type="text"
                      name="branch_name"
                      className="input-ques"
                      value={trainerData.branch_name}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
                <Col>
                  <div controlId="ifsc_code">
                    <label className="label5-ques">Ifsc Code</label>
                    <p></p>
                    <input
                      type="text"
                      name="ifsc_code"
                      className="input-ques"
                      value={trainerData.ifsc_code}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
                <Col>
                  <div controlId="account_no">
                    <label className="label5-ques">Account No</label>
                    <p></p>
                    <input
                      type="text"
                      name="account_no"
                      className="input-ques"
                      value={trainerData.account_no}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
              </Row>
              <p></p>
              <Row md={12}>
                <Col>
                  <div controlId="pan_number">
                    <label className="label5-ques">Pan Number</label>
                    <p></p>
                    <input
                      type="text"
                      name="pan_number"
                      className="input-ques"
                      value={trainerData.pan_number}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>

                <Col>
                  <div controlId="gst">
                    <label className="label5-ques">GST</label>
                    <p></p>
                    <input
                      type="text"
                      name="gst"
                      className="input-ques"
                      value={trainerData.gst}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>

                <Col>
                  <div controlId="photo">
                    <label className="label5-ques">Photo</label>
                    <p></p>
                    <input
                      className="input-ques"
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      required
                      // value={trainerDataResponse?.photo || ""}
                    />
                  </div>
                </Col>
              </Row>
              <p></p>
              <Row md={12}>
                <Col>
                  <div controlId="certification">
                    <label className="label5-ques">Certifications</label>
                    <p></p>
                    <input
                      type="text"
                      name="certification"
                      className="input-ques"
                      value={trainerData.certification}
                      onChange={handleChange}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>

                <Col>
                  <div controlId="is_active">
                    <label className="label5-ques">Ready To Relocate</label>
                    <p></p>
                    <Form.Check
                      type="switch"
                      className="custom-switch"
                      id="custom-switch"
                      label=""
                      checked={is_active}
                      onChange={(e) => setactive(e.target.checked)}
                      autoComplete="off"
                      readOnly={isReadOnly}
                    />
                  </div>
                </Col>
                <Col>
                  <div controlId="resume">
                    <label className="label5-ques">Resume</label>
                    <p></p>
                    {isReadOnly ? (
                      trainerData.remarks ? (
                        <button
                          onClick={viewResumeAsPDF}
                          className="input-ques"
                        >
                          View Resume
                        </button>
                      ) : (
                        <span>No Resume Available</span>
                      )
                    ) : (
                      <input
                        className="input-ques"
                        type="file"
                        name="resume"
                        accept=".pdf, .doc, .docx"
                        onChange={handleFileChange}
                        required
                      />
                    )}
                  </div>
                </Col>
              </Row>
              <p></p>
              <div>
                <button
                  className="button-ques-save"
                  type="submit"
                  style={{ width: "100px", marginLeft: "45%" }}
                  disabled={isReadOnly}
                  // onChange={(e) => setTrainerDataResponse({ ...trainerDataResponse, trainer_name: e.target.value })}
                >
                  Save
                </button>
              </div>
            </form>
          </Col>
        </Row>
        <p></p>
      </div>
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default TrainerFrontPage;
