import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, CheckCircle } from 'lucide-react';
import { uploadCommunicationTestApi, downloadTemplateApi } from '../../api/endpoints'
import { Col, Row, Form, Button } from 'react-bootstrap';
import MCQForm from './mcqform';
import ImportMCQWord from './importmcqword';
export default function UploadCommunicationTest({ userRole, collegeName }) {
  const [formData, setFormData] = useState({
    question_paper_name: '',
    question_paper_id: null,
    duration_of_test: '',
    topic: '',
    sub_topic: '',
    folder_name: '',
    test_type_categories: '',
    upload_type: '',
    no_of_questions: '',
    excel_file: null,
    audio_text: '',
    communication_category: ''
  });
  const [showMCQForm, setShowMCQForm] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [fileName, setFileName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`📝 Input Changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    console.log('🎯 handleFileChange - START');
    const file = e.target.files[0];
    console.log('📄 File object:', file);

    if (file) {
      console.log('✅ File details:');
      console.log('   - Name:', file.name);
      console.log('   - Size:', file.size, 'bytes');
      console.log('   - Type:', file.type);
      console.log('   - Last Modified:', new Date(file.lastModified));

      setFormData((prev) => ({
        ...prev,
        excel_file: file
      }));
      setFileName(file.name);

      console.log('✅ File state updated - ready for upload when Save is clicked');
    } else {
      console.log('❌ No file selected');
    }
    console.log('🎯 handleFileChange - END');
  };
  const handleSubmit = async () => {
    try {
      console.log("🚀 Upload started...");
      setMessage({ type: "loading", text: "Processing..." });

      // ✅ Validate required fields
      const requiredFields = [
        "question_paper_name",
        "duration_of_test",
        "topic",
        "sub_topic",
        "upload_type"
      ];
      const missing = requiredFields.filter((f) => !formData[f]);
      if (missing.length > 0) {
        setMessage({ type: "error", text: `Please fill all required fields: ${missing.join(", ")}` });
        return;
      }

      // ✅ Manual Upload flow
      if (formData.upload_type === "Manual" || formData.upload_type === 'word') {
        console.log("🧾 Manual upload selected... creating question paper...");

        const manualPaperData = new FormData();
        manualPaperData.append("question_paper_name", formData.question_paper_name);
        manualPaperData.append("duration_of_test", formData.duration_of_test);
        manualPaperData.append("no_of_questions", formData.no_of_questions || 0);
        manualPaperData.append("test_type_categories", formData.test_type_categories);
        manualPaperData.append("topic", formData.topic);
        manualPaperData.append("sub_topic", formData.sub_topic);
        manualPaperData.append("upload_type", "Manual");
        manualPaperData.append("created_by", "admin");
        manualPaperData.append("audio_text", formData.audio_text || "");
        manualPaperData.append("communication_category",formData.communication_category || "");


        console.log("📤 Sending request to create manual question paper...");
        const res = await uploadCommunicationTestApi(manualPaperData);

        if (!res || !res.question_paper_id) {
          throw new Error("❌ Failed to create manual question paper.");
        }

        console.log("✅ Manual question paper created:", res);
        setFormData((prev) => ({ ...prev, question_paper_id: res.question_paper_id }));

        setMessage({ type: "success", text: "Question paper created successfully! Opening MCQ form..." });
        setShowMCQForm(true);
        return;
      }

      // ✅ Excel Upload flow
      if (formData.upload_type === "Excel") {
        if (!formData.excel_file) {
          setMessage({ type: "error", text: "Please upload an Excel file before saving." });
          return;
        }

        console.log("📦 Sending Excel file upload request...");
        const formDataToSend = new FormData();
        formDataToSend.append("question_paper_name", formData.question_paper_name);
        formDataToSend.append("duration_of_test", formData.duration_of_test);
        formDataToSend.append("no_of_questions", formData.no_of_questions || "");
        formDataToSend.append("test_type", "Audio");
        formDataToSend.append("test_type_categories", formData.test_type_categories);
        formDataToSend.append("topic", formData.topic);
        formDataToSend.append("sub_topic", formData.sub_topic);
        formDataToSend.append("folder_name", formData.folder_name || "");
        formDataToSend.append("created_by", "admin");
        formDataToSend.append("audio_text", formData.audio_text || "");
        formDataToSend.append("excel_file", formData.excel_file);
        formDataToSend.append("communication_category", formData.communication_category || "");


        const data = await uploadCommunicationTestApi(formDataToSend);
        const successMessage = data.message || "Test uploaded successfully!";
        console.log("✅ Upload successful:", successMessage);

        setMessage({ type: "success", text: successMessage });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
        return;
      }

    } catch (error) {
      console.error("⚠️ Error during upload:", error.message);
      const messageText = error.response?.data?.error || "An error occurred. Please try again.";
      setMessage({ type: "error", text: messageText });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  const handleBack = () => {
    console.log('🔙 Back button clicked - navigating back');
    window.history.back();
  };

  const downloadSampleExcel = async () => {
    try {
      console.log("📥 Download Sample Excel clicked");
      setMessage({ type: "loading", text: "Preparing download..." });
      await downloadTemplateApi(); // ✅ Call endpoint helper
      setMessage({ type: "success", text: "Template download started!" });
      console.log("✅ Download initiated");

      // ✅ Automatically clear message after 4 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 4000);
    } catch (error) {
      console.error("⚠️ Error downloading file:", error);
      setMessage({ type: "error", text: "Failed to download template." });

      // ✅ Clear error message after few seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 4000);
    }
  };


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#36404a', padding: '24px' }}>
      {!showMCQForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // ✅ prevent page refresh
            handleSubmit();
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px' }}>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px' }}>

              {/* LEFT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Question Paper Name<span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="question_paper_name"
                    value={formData.question_paper_name}
                    onChange={handleInputChange}
                    placeholder="Enter paper name"
                    style={{ width: '100%', padding: '10px 16px', backgroundColor: '#36404a', border: '1px solid #64748b', borderRadius: '4px', color: 'white', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Topic<span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  </label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 16px', backgroundColor: '#36404a', border: '1px solid #64748b', borderRadius: '4px', color: 'white', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Select a Topic</option>
                    <option value="Communication">Communication</option>

                  </select>
                </div>

                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Folder Name<span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  </label>
                  <select
                    name="folder_name"
                    value={formData.folder_name}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 16px', backgroundColor: '#36404a', border: '1px solid #64748b', borderRadius: '4px', color: 'white', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Select Folder</option>
                    <option value="Folder1">level 1</option>
                    <option value="Folder2">level 2</option>
                    <option value="Folder3">level 3</option>
                  </select>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Duration of the Test (minutes)<span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="duration_of_test"
                    value={formData.duration_of_test}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Enter duration"
                    style={{ width: '100%', padding: '10px 16px', backgroundColor: '#36404a', border: '1px solid #64748b', borderRadius: '4px', color: 'white', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Sub Topic<span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  </label>
                  <select
                    name="sub_topic"
                    value={formData.sub_topic}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 16px', backgroundColor: '#36404a', border: '1px solid #64748b', borderRadius: '4px', color: 'white', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Select a Subtopic</option>
                    <option value="Pronunciation">Pronunciation</option>
                    <option value="Listening">Listening</option>
                    <option value="TypingBlank">TypingBlank</option>
                    <option value="Tamil_English">Tamil_English</option>
                    <option value="Telugu_English">Telugu_English</option>
                    <option value="Hindi_English">Hindi_English</option>
                    <option value="Kannada_English">Kannada_English</option>
                    <option value="Malayalam_English">Malayalam_English</option>

                  </select>
                </div>

                <div>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Test Type Category<span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                  </label>
                  <select
                    name="test_type_categories"
                    value={formData.test_type_categories}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 16px', backgroundColor: '#36404a', border: '1px solid #64748b', borderRadius: '4px', color: 'white', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">-- Select Category --</option>
                    <option value="Pronunciation">Pronunciation</option>
                    <option value="AudioTyping">AudioTyping</option>
                    <option value="AudioMCQ">AudioMCQ</option>
                    <option value="TypingBlank">TypingBlank</option>
                    <option value="Multi_Pronunciation">Multi Language Pronunciation</option>
                    <option value="Multi_AudioTyping">Multi Language AudioTyping</option>

                  </select>
                </div>


              </div>
              <div>
                <label style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Communication Category
                </label>

                <select
                  name="communication_category"
                  value={formData.communication_category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#36404a',
                    border: '1px solid #64748b',
                    borderRadius: '4px',
                    color: 'white',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Category Test</option>
                  <option value="PracticeTest">Practice Test</option>
                  <option value="Test">Test</option>
                </select>
              </div>

            </div>


            {/* Upload Questions Section */}
            <div style={{ marginBottom: '24px' }}>


              {/* Upload Type and Audio Text Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "24px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                {/* Left: Upload Type Radios */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: "1",
                    minWidth: "280px",
                  }}
                >
                  <label
                    style={{
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Upload Type<span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",

                      padding: "12px 16px",
                      borderRadius: "8px",
                    }}
                  >
                    <label style={{ display: "flex", alignItems: "center", color: "white" }}>
                      <input
                        type="radio"
                        name="upload_type"
                        value="Manual"
                        checked={formData.upload_type === "Manual"}
                        onChange={handleInputChange}
                        style={{ width: "16px", height: "16px", marginRight: "8px" }}
                      />
                      Manual
                    </label>

                    <label style={{ display: "flex", alignItems: "center", color: "white" }}>
                      <input
                        type="radio"
                        name="upload_type"
                        value="Excel"
                        checked={formData.upload_type === "Excel"}
                        onChange={handleInputChange}
                        style={{ width: "16px", height: "16px", marginRight: "8px" }}
                      />
                      Excel
                    </label>

                    <label style={{ display: "flex", alignItems: "center", color: "white" }}>
                      <input
                        type="radio"
                        name="upload_type"
                        value="Word"
                        checked={formData.upload_type === "Word"}
                        onChange={handleInputChange}
                        style={{ width: "16px", height: "16px", marginRight: "8px" }}
                      />
                      Word / PDF
                    </label>
                  </div>

                </div>

                {/* ✅ Right: Audio Text - only show if category is AudioMCQ */}
                {formData.test_type_categories === "AudioMCQ" && (
                  <div
                    style={{
                      flex: "1",

                      borderRadius: "8px",
                    }}
                  >
                    <label
                      style={{
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Audio Text
                    </label>
                    <textarea
                      name="audio_text"
                      value={formData.audio_text}
                      onChange={handleInputChange}
                      placeholder="Enter AI transcript or training audio content..."
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        backgroundColor: "#36404a",
                        border: "1px solid #64748b",
                        borderRadius: "6px",
                        color: "white",
                        minHeight: "90px",
                        resize: "vertical",
                        outline: "none",
                        fontSize: "14px",
                      }}
                    ></textarea>
                  </div>
                )}
              </div>

              <Row md={12}>
                <Col>
                  {formData.upload_type === 'Manual' && (

                    <React.Fragment>
                      < Col >
                        <div className='status' controlId='no_of_questions'>
                          <label className='label5-ques'>No of Questions</label><p></p>
                          <input
                            type="number"
                            autocomplete="off"
                            name="no_of_questions"
                            required
                            placeholder=""
                            style={{ width: '100%', padding: '10px 16px', backgroundColor: '#36404a', border: '1px solid #64748b', borderRadius: '4px', color: 'white', outline: 'none', cursor: 'pointer' }}
                            min="0"
                            onChange={handleInputChange}
                          />

                        </div>
                      </Col>


                    </React.Fragment>


                  )}
                </Col>

                <Col></Col>


              </Row>

              {formData.upload_type === 'Excel' && (
                <>
                  <div
                    style={{
                      border: '2px dashed #64748b',
                      borderRadius: '8px',
                      padding: '48px 24px',
                      textAlign: 'center',
                      backgroundColor: '#36404a',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      console.log('🎨 Drag over - changing border color');
                      e.currentTarget.style.borderColor = '#fb923c';
                      e.currentTarget.style.backgroundColor = '#475569';
                    }}
                    onDragLeave={(e) => {
                      console.log('🎨 Drag leave - resetting border color');
                      e.currentTarget.style.borderColor = '#64748b';
                      e.currentTarget.style.backgroundColor = '#36404a';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      console.log('📥 File dropped!');
                      e.currentTarget.style.borderColor = '#64748b';
                      e.currentTarget.style.backgroundColor = '#36404a';
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        console.log('Dropped file:', file.name);
                        setFormData((prev) => ({ ...prev, excel_file: file }));
                        setFileName(file.name);
                        setUploadSuccess(true);
                        setTimeout(() => setUploadSuccess(false), 3000);
                      }
                    }}
                    onClick={() => {
                      console.log('🖱️ Upload area clicked - opening file dialog');
                      document.getElementById('fileInput').click();
                    }}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <p style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '8px' }}>
                      📁 Drop Excel file here or click to browse
                    </p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>
                      Supported formats: .xlsx, .xls, .csv
                    </p>
                    {fileName && (
                      <p style={{ color: '#10b981', fontSize: '14px', marginTop: '12px', fontWeight: '500' }}>
                        ✓ Selected: {fileName}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>


              {formData.upload_type === 'Excel' && (
                <button
                  onClick={downloadSampleExcel}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <Download style={{ width: '18px', height: '18px' }} />
                  Sample
                </button>
              )}
            </div>

            {uploadSuccess && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 999,
                  }}
                  onClick={() => setUploadSuccess(false)} // ✅ click outside to close
                />
                <div
                  style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#1e293b',
                    padding: '32px 48px',
                    borderRadius: '8px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    textAlign: 'center',
                    minWidth: '300px',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%',
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle style={{ width: '40px', height: '40px', color: 'white' }} />
                  </div>
                  <h3
                    style={{
                      color: 'white',
                      fontSize: '20px',
                      marginBottom: '8px',
                      fontWeight: '600',
                    }}
                  >
                    File Selected!
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>{fileName}</p>

                  {/* ✅ Add close button */}
                  <button
                    onClick={() => setUploadSuccess(false)}
                    style={{
                      marginTop: '20px',
                      backgroundColor: '#fb923c',
                      color: '#1e293b',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}


            {message.text && message.type !== '' && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: '500',
                backgroundColor: message.type === 'success' ? '#16a34a' : message.type === 'error' ? '#dc2626' : '#2563eb',
                color: 'white'
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 24px',
                  backgroundColor: '#fb923c',
                  color: '#1e293b',
                  borderRadius: '4px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Back
              </button>
              <button
                type='submit'

                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 32px',
                  backgroundColor: '#fb923c',
                  color: '#1e293b',
                  borderRadius: '4px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 24px',
                  backgroundColor: '#fb923c',
                  color: '#1e293b',
                  borderRadius: '4px',
                  fontWeight: '500',
                  border: 'none',

                }}
              >
                <ArrowRight style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Next
              </button>
            </div>
          </div></form>
      ) : (
        <div >

          <MCQForm
            userRole={userRole}
            collegeName={collegeName}
            selectedTopic={formData.topic}
            selectedSubTopic={formData.test_type_categories}
            no_of_questions={formData.no_of_questions}
            questionPaperId={formData.question_paper_id}
            onComplete={() => navigate("/questionpaper")}
          /> </div>
      )}
      {formData.upload_type === 'Word' && (
        <ImportMCQWord
          setFormData={setFormData}
          fileName={fileName}
          setFileName={setFileName}
          userRole={userRole}
          collegeName={collegeName}
          selectedTopic={formData.topic}
          selectedSubTopic={formData.test_type_categories}
          selectedFolderName={formData.folder_name}
          setUploadSuccess={setUploadSuccess}
        />
      )}

    </div>
  );
}