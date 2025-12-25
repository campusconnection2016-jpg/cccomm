import React, { useState, useEffect } from 'react';
import { addCodingQuestionUploadApi, getFolderBySubTopicId } from '../../api/endpoints';
import ExcelJS from 'exceljs';
import { useNavigate, useLocation } from 'react-router-dom';

// ✅ Import sample excel files
import withouttestcase from '../../assets/sample_without_testcases.xlsx';
import withtestcase from '../../assets/sample_testcase_questions.xlsx';

const norm = v => (v === null || v === undefined) ? '' : String(v).trim();

function mapCodingType(val) {
  if (!val) return false;
  if (val === 'testcases coding') return true;
  if (val === 'without testcases coding') return false;
  if (val === 'testcases') return true;
  if (val === 'without_testcases') return false;
  return true;
}

const AddCodingQuestion = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navState = location.state || {};

  // ✅ Debug
  console.log("➡️ Props received in AddCodingQuestion:", props);
  console.log("➡️ Location state received:", navState);

  const [formData, setFormData] = useState({
    topic: props.topic || navState.topic || '',
    test_type: props.test_type || navState.test_type || 'Coding Test',
    subtopic: props.subtopic || navState.subtopic || '',
    folder_name: props.folder_name || navState.folder_name || '',
    file: null,
    isTestcase: mapCodingType(props.codingType || navState.codingType),
  });
  const [loading, setLoading] = useState(false);
  const [folderOptions, setFolderOptions] = useState([]);
  const [subTopicOptions, setSubTopicOptions] = useState([]);



 useEffect(() => {
  const fetchSubTopics = async () => {
    if (!formData.topic) {
      setSubTopicOptions([]);
      return;
    }
    try {
      const response = await getFolderBySubTopicId({ topic: formData.topic });
      // Filter by matching topic
      const filtered = (response || []).filter(
        item => item.topic?.toLowerCase() === formData.topic.toLowerCase()
      );
      // Extract unique sub_topic values
      const uniqueSubTopics = [...new Set(filtered.map(item => item.sub_topic))];
      setSubTopicOptions(uniqueSubTopics);
    } catch (error) {
      console.error("Failed to fetch subtopics:", error);
      setSubTopicOptions([]);
    }
  };

  fetchSubTopics();
}, [formData.topic]);




  useEffect(() => {
    console.log("➡️ Initialized formData:", formData);
  }, []);

  // Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      if (!formData.topic || !formData.subtopic) {
        setFolderOptions([]);
        return;
      }
      try {
        const response = await getFolderBySubTopicId({
          topic: formData.topic,
          sub_topic: formData.subtopic,
        });
        const filteredFolders = (response || []).filter(
          folder =>
            folder.topic.toLowerCase() === formData.topic.toLowerCase() &&
            folder.sub_topic.toLowerCase() === formData.subtopic.toLowerCase()
        );
        setFolderOptions(filteredFolders);
      } catch (error) {
        console.error('Failed to fetch folder options:', error);
        setFolderOptions([]);
      }
    };

    fetchFolders();
  }, [formData.topic, formData.subtopic]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'topic') {
      setFormData(prev => ({ ...prev, topic: value, subtopic: '', folder_name: '' }));
    } else if (name === 'subtopic') {
      setFormData(prev => ({ ...prev, subtopic: value, folder_name: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTestcaseChange = (e) => {
    setFormData(prev => ({ ...prev, isTestcase: e.target.checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleExportwithouttestcase = () => {
    const documentUrl = withouttestcase;
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Sample_Without_Test_case.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExporttestcase = () => {
    const documentUrl = withtestcase;
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Sample_Testcase_Question.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert('Please choose a file to upload.');
      return;
    }
    setLoading(true);

    try {
      const data = await formData.file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
      const worksheet = workbook.worksheets[0];
      const rows = [];
      const questionsMap = new Map();
      const duplicateRows = [];

      worksheet.eachRow((row, rowNumber) => {
  if (rowNumber === 1) return; // Skip header row
  const questionText = row.values[1] ? String(row.values[1]).trim() : '';
  if (questionsMap.has(questionText)) {
    duplicateRows.push(rowNumber);
  } else {
    questionsMap.set(questionText, true);
  }
  rows.push(row.values.slice(1));
});

if (duplicateRows.length > 0) {
  alert(`Duplicate questions found in rows: ${duplicateRows.join(', ')}`);
  if (props.onClose) {
    props.onClose();  // close the modal after alert OK click
  }
  setLoading(false);
  return; // Cancel upload
}

      let created = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let folderNameExcel = '';
        let folderNameFinal = '';
        let payload = {};

        if (formData.isTestcase) {
          folderNameExcel = row[9] ? String(row[9]).trim() : '';
          folderNameFinal = folderNameExcel || formData.folder_name || 'Overall';

          payload = {
            question_text: row[0] || '',
            test_case1: row[1] || '',
            test_case2: row[2] || '',
            test_case3: row[3] || '',
            answer: row[4] || '',
            mark: row[5] || 0,
            explain_answer: row[6] || '',
            input_format: row[7] || '',
            difficulty_level: row[8] || '',
            topic: formData.topic,
            test_type: formData.test_type,
            test_type_categories: 'PracticeTest',
            subtopic: formData.subtopic,
            folder_name: folderNameFinal,
            is_testcase: formData.isTestcase,
          };
        } else {
          folderNameExcel = row[6] ? String(row[6]).trim() : '';
          folderNameFinal = folderNameExcel || formData.folder_name || 'Overall';

          payload = {
            question_text: row[0] || '',
            answer: row[1] || '',
            mark: row[2] || 0,
            explain_answer: row[3] || '',
            input_format: row[4] || '',
            difficulty_level: row[5] || '',
            topic: formData.topic,
            test_type: formData.test_type,
            test_type_categories: 'PracticeTest',
            subtopic: formData.subtopic,
            folder_name: folderNameFinal,
            is_testcase: formData.isTestcase,
          };
        }

        await addCodingQuestionUploadApi(payload);
        created++;
      }

      alert(`Excel data uploaded and saved successfully (${created} coding questions).`);

      if (props.onClose) {
        props.onClose(); // ✅ close modal if opened as modal
      } else {
        navigate('/demo'); // ✅ fallback for page mode
      }
    } catch (error) {
      console.error(error);
      alert('Failed to upload Excel data.');
      if (props.onClose) {
    props.onClose();  // Close the modal after alert OK click
  }
      
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { color: 'white' };
  const inputStyle = {
    width: '100%',
    background: '#1a252f',
    color: 'white',
    border: '1px solid #555',
    borderRadius: '6px',
    padding: '5px'
  };
  const inputStyle2 = {
    width: '100%',
    background: '#1a252f',
    color: 'white',
    border: '1px solid #555',
    borderRadius: '6px',
    padding: '8px'
  };

  return (
    <div style={{
      background: 'rgb(44, 62, 80)',
      padding: '40px',
      borderRadius: '8px',
      maxWidth: '700px',
      margin: props.onClose ? '0 auto' : '40px auto',
      minHeight: '480px',
      color: 'white'
    }}>
      <h2 style={{  marginBottom: '24px' }}>Add Coding Question</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Topic: </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              style={inputStyle}
              required
              readOnly={!!(props.topic || navState.topic)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Test Type: </label>
            <input
              type="text"
              name="test_type"
              value={formData.test_type}
              readOnly
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
  <label style={labelStyle}>Sub Topic: </label>
  <select
    name="subtopic"
    value={formData.subtopic}
    onChange={handleInputChange}
    style={inputStyle2}
    required
    // disabled={!!(props.subtopic || navState.subtopic)}
  >
    <option value="Select Sub Topic">Select Sub Topic</option>
{subTopicOptions.filter(sub => sub !== "Aptitude" && sub !== "Syllabus")
  .map((sub, idx) => (
    <option key={idx} value={sub}>
      {sub}
    </option>
  ))}

  </select>
</div>


          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Folder (Optional): </label>
            <select
              name="folder_name"
              value={formData.folder_name}
              onChange={handleInputChange}
              style={inputStyle2}
            >
              <option value="">Select Folder</option>
              {folderOptions.map(folder => (
                <option key={folder.id} value={folder.folder_name}>
                  {folder.folder_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={formData.isTestcase}
              onChange={handleTestcaseChange}
              style={{ marginRight: '8px' }}
            />
            Is Testcase
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ color: 'white', minWidth: '120px' }}>Upload File:</label>
          <input
            type="file"
            name="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            style={{ flex: 1, color: 'white' }}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#f1a128',
              color: 'black',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '5px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Uploading...' : 'Submit'}
          </button>
          <button
            type="button"
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '5px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={() => props.onClose ? props.onClose() : navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExportwithouttestcase}
            style={{
              background: 'orange',
              color: 'black',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Coding
          </button>
          <button
            type="button"
            onClick={handleExporttestcase}
            style={{
              background: 'orange',
              color: 'black',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Testcase
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCodingQuestion;
