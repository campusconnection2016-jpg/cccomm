import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import {
  get_Distinct_Batchesfrom_college_API,
  getdisplay_training_API,
} from "../../api/endpoints";

const TrainingTest = () => {
  const { collegeId } = useParams();
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [actualSelectedBatches, setActualSelectedBatches] = useState([]);
  const [trainingData, setTrainingData] = useState(null);

  useEffect(() => {
    if (collegeId) {
      get_Distinct_Batchesfrom_college_API(collegeId)
        .then((data) => {
          const batchList = data.batches || [];

          const batchOptions = batchList.map((item) => ({
            value: item,
            label: item,
          }));

          const allOption = { value: "*", label: "All" };
          setBatches([allOption, ...batchOptions]);
        })
        .catch((err) => console.error("❌ Error fetching batches:", err));
    }
  }, [collegeId]);

  const handleBatchChange = (selectedOptions) => {
    const allOption = { value: "*", label: "All" };

    if (!selectedOptions) {
      setSelectedBatches([]);
      setActualSelectedBatches([]);
      setTrainingData(null);
      return;
    }

    let selectedBatchValues = [];

    if (selectedOptions.some((option) => option.value === "*")) {
      setSelectedBatches([allOption]);
      selectedBatchValues = batches
        .filter((option) => option.value !== "*")
        .map((option) => option.value);
    } else {
      setSelectedBatches(selectedOptions);
      selectedBatchValues = selectedOptions.map((option) => option.value);
    }

    setActualSelectedBatches(selectedBatchValues);

    // 🔍 Fetch and filter relevant training data
    getdisplay_training_API(collegeId)
      .then((data) => {
        // If batches match, set training data
        const matchedBatches = data?.batches || [];
        const isMatch = matchedBatches.some((b) =>
          selectedBatchValues.includes(b)
        );

        if (isMatch) {
          setTrainingData(data);
        } else {
          setTrainingData(null);
        }
      })
      .catch((err) =>
        console.error("❌ Error fetching training data:", err)
      );
  };

  return (
    <div className="form-ques-settings">
      <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
        <label className="label5-ques" style={{ marginRight: "10px" }}>
          Batches
        </label>
        <p></p>
        <Select
          isMulti
          options={batches}
          value={selectedBatches}
          onChange={handleBatchChange}
          placeholder="Select batches"
        />
      </div>

      {/* 👇 Show data if available */}
      {trainingData && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>No. of Days:</strong> {trainingData.no_of_days}</p>
          <p><strong>No. of Topics:</strong> {trainingData.no_of_topics}</p>
          <p><strong>Location:</strong> {trainingData.location}</p>
          <p><strong>Start Date:</strong> {new Date(trainingData.dtm_start).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> {new Date(trainingData.dtm_end).toLocaleDateString()}</p>
          <p><strong>Topics:</strong></p>
          <ul>
            {trainingData.topics?.map((topic, idx) => (
              <li key={idx}>{topic}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrainingTest;
