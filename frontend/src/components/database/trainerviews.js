import React, { useState, useEffect, useContext } from 'react';
import { getTrainer_Reports_All_Api,downloadResume } from '../../api/endpoints';
import '../../styles/trainingadmin.css';
import back from '../../assets/images/backarrow.png';
import Next from '../../assets/images/nextarrow.png';
import { SearchContext } from '../../allsearch/searchcontext';
import Download from '../../assets/images/download.png'
const TrainerView = () => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [currentTrainerIndex, setCurrentTrainerIndex] = useState(0);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');
  const { searchQuery } = useContext(SearchContext);

  useEffect(() => {
    // Fetch trainer data when the component mounts
    fetchTrainers();
  }, []);

  useEffect(() => {
    // Filter trainers whenever searchQuery or trainerFilter changes
    filterTrainers();
  }, [trainerFilter, searchQuery, trainers]);

  const fetchTrainers = async () => {
    try {
      const response = await getTrainer_Reports_All_Api();
      setTrainers(response); // Set the trainer data to the state
      setFilteredTrainers(response); // Initially, show all trainers
    } catch (error) {
      setError('Failed to fetch trainer data');
      console.error(error);
    }
  };

  const handleDownloadResume = async (trainerId) => {
    try {
      await downloadResume(trainerId);  // Use the existing downloadResume function
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  const filterTrainers = () => {
    // Filter trainers based on trainerFilter and searchQuery
    const filtered = trainers.filter(item => {
      const trainerDetails = [
        item.city,
        item.location,
        item.state,
        item.qualification,
        item.experience,
        item.bank_name,
        item.ifsc_code,
        item.mobile_no,
        item.email_id,
      ].join(' ').toLowerCase();

      return (
        (!trainerFilter || trainerDetails.includes(trainerFilter.toLowerCase())) &&
        (!searchQuery || trainerDetails.includes(searchQuery.toLowerCase()))
      );
    });

    setFilteredTrainers(filtered);
    setCurrentTrainerIndex(0); // Reset to first trainer after filtering
  };

  // Extract unique skill names from all trainers
  const allSkills = [...new Set(trainers.flatMap(trainer =>
    trainer.skill_id.map(skill => skill.skill_name)
  ))];

  // Handle skill selection change
  const handleSkillChange = (event) => {
    const skill = event.target.value;
    setSelectedSkill(skill);

    // Filter trainers by selected skill
    if (skill) {
      const filtered = trainers.filter(trainer =>
        trainer.skill_id.some(s => s.skill_name === skill)
      );
      setFilteredTrainers(filtered);
      setCurrentTrainerIndex(0); // Reset to first trainer after filtering
    } else {
      setFilteredTrainers(trainers); // Reset filter when no skill is selected
    }
  };

  // Handle Next and Back navigation
  const nextTrainer = () => {
    if (currentTrainerIndex < filteredTrainers.length - 1) {
      setCurrentTrainerIndex(currentTrainerIndex + 1);
    }
  };

  const prevTrainer = () => {
    if (currentTrainerIndex > 0) {
      setCurrentTrainerIndex(currentTrainerIndex - 1);
    }
  };

  // Get the current trainer based on the current index
  const currentTrainer = filteredTrainers[currentTrainerIndex];

  const getBase64Image = (binaryData) => {
    if (!binaryData) return null;
    return `data:image/jpeg;base64,${binaryData}`; // Adjust the MIME type based on your image format (e.g., image/png for PNG images)
  };

  // Check if currentTrainer and skill_id are available and correctly formatted
  const skillNames = currentTrainer?.skill_id?.map(skill => skill.skill_name).join(', ');

  return (
    <div className='train-det'>
    <div className="form-ques">
      <h6>Trainer Details</h6>
      {error && <p>{error}</p>}
      <div style={{ display: 'flex' }}>
        <select id="skillFilter" value={selectedSkill} onChange={handleSkillChange} className="search-box-trainer-report">
          <option value="">All Skills</option>
          {allSkills.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>

        <input
          className="search-box-trainer-report"
          type="text"
          placeholder="Search..."
          value={trainerFilter}
          onChange={(e) => setTrainerFilter(e.target.value)}
        />
      </div>
      <div className="form-ques">
        {filteredTrainers.length > 0 && currentTrainer ? (
          <div className="trainer-card">
            <div className="trainer-photo">
              {currentTrainer.photo ? (
                <img src={getBase64Image(currentTrainer.photo)} alt="Trainer Photo" />
              ) : (
                <p>No photo available</p>
              )}
            </div>
            <h5><strong>Trainer Name:</strong> {currentTrainer.trainer_name}</h5>

            <p><strong>City:</strong> {currentTrainer.city || 'N/A'}</p>
            <p><strong>Location:</strong> {currentTrainer.location}</p>
            <p><strong>State:</strong> {currentTrainer.state}</p>
            <p><strong>Qualification:</strong> {currentTrainer.qualification}</p>
            <p><strong>Experience:</strong> {currentTrainer.experience}</p>
            <p><strong>Mobile No:</strong> {currentTrainer.mobile_no}</p>
            <p><strong>Email ID:</strong> {currentTrainer.email_id}</p>
            <p><strong>Skills:</strong> {skillNames || 'No skills available'}</p>
            <p><strong>Languages Known:</strong> {currentTrainer.languages_known}</p>
            <p><strong>Bank Name:</strong> {currentTrainer.bank_name}</p>
            <p><strong>IFSC Code:</strong> {currentTrainer.ifsc_code}</p>
            <p><strong>Branch Name:</strong> {currentTrainer.branch_name}</p>
            <p><strong>Account No:</strong> {currentTrainer.account_no}</p>
            
            <p><strong>Certification:</strong> {currentTrainer.certification}</p>
            <p><strong>PAN Number:</strong> {currentTrainer.pan_number}</p>
            <p><strong>GST:</strong> {currentTrainer.gst}</p>

            <p><strong>Username:</strong> {currentTrainer.user_name}</p>
            {currentTrainer.id && (
              <button onClick={() => handleDownloadResume(currentTrainer.id)} className='button-ques-save'>
               <img src={Download} className='nextarrow'></img><span>Resume</span> 
              </button>
            )}
            {/* Pagination controls aligned to the right */}
            <div className="pagi-container">
              <button
              className='trai-list'
                onClick={prevTrainer}
                disabled={currentTrainerIndex === 0}
                style={{
                  backgroundColor: currentTrainerIndex === 0 ? 'f3de59' : '#F1A128',
                  cursor: currentTrainerIndex === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <img src={back} className='nextarrow' alt="Back Arrow" />
              </button>

              <button
              className='trai-list'
                onClick={nextTrainer}
                disabled={currentTrainerIndex === filteredTrainers.length - 1}
                style={{
                  backgroundColor: currentTrainerIndex === filteredTrainers.length - 1 ? 'f3de59' : '#F1A128',
                  cursor: currentTrainerIndex === filteredTrainers.length - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <img src={Next} className='nextarrow' alt="Next Arrow" />
              </button>

              <p>
                Showing trainer {currentTrainerIndex + 1} of {filteredTrainers.length}
              </p>
            </div>
          </div>
        ) : (
          <p>No trainers found</p>
        )}
      </div>
    </div></div>
  );
};

export default TrainerView;
