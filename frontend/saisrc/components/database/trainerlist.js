
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import { getTrainer_Reports_All_Api,downloadResume } from '../../api/endpoints';
import '../../styles/trainingadmin.css';
import { Link } from 'react-router-dom';
import { Table, Form, Pagination } from 'react-bootstrap';
const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [trainerFilter, setTrainerFilter] = useState('');
  const [currentTrainerIndex, setCurrentTrainerIndex] = useState(0);
  const [skillFilter, setSkillFilter] = useState('');  // State for selected skill filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [searchQuery, skillFilter, trainerFilter]); 

  const fetchTrainers = async () => {
    try {
      const response = await getTrainer_Reports_All_Api();
      setTrainers(response);
      setFilteredTrainers(response);
    } catch (error) {
      console.error('Failed to fetch trainer data', error);
    }
  };

  const filterTrainers = () => {
    const query = searchQuery ? searchQuery.toLowerCase() : '';
    const filter = trainerFilter ? trainerFilter.toLowerCase() : '';
    const skill = skillFilter ? skillFilter.toLowerCase() : '';

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
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

        const hasSkill = item.skill_id?.some(
          (skillObj) => skillFilter === '' || skillObj?.skill_name?.toLowerCase().includes(skill)
        );

      return (!filter || trainerDetails.includes(filter)) &&
             (!query || trainerDetails.includes(query)) &&
             (skillFilter === '' || hasSkill); // Apply skill filter condition
    });

    setFilteredTrainers(filtered);
    setCurrentTrainerIndex(0);
  };

  const allSkills = [...new Set(trainers.flatMap(trainer =>
    trainer.skill_id ? trainer.skill_id.map(skill => skill.skill_name) : []
  ))];
  
  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrainers = filteredTrainers.slice(startIndex, endIndex);
 const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
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

  return (
    <div className="form-ques-stufeed">
      <h6>Trainer's Details</h6>
      <input
        type="text"
        className="search-box-db-nondb"
        placeholder="Search trainers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
       <div className="po-table-responsive-trainer">
       <table className="placement-table-t">
        <thead style={{ textAlign: "center" }}>
          <tr >
            <th>Name</th>
            <th>City</th>
            <th>
            <select style={{marginLeft:"10px"}}
        value={skillFilter}
        className='dropdown-custom'
        onChange={(e) => setSkillFilter(e.target.value)}
      >
        <option value="">All Skills</option>
        {allSkills.map((skill, index) => (
          <option key={index} value={skill}>
            {skill}
          </option>
        ))}
      </select>
            </th>
            <th>languages known</th>
          </tr>
        </thead>
        <tbody  >
          {paginatedTrainers.map(trainer => (
            <tr key={trainer.id}>
              <td>
                <Link to={`/trainer-details/${trainer.id}`} style={{ color: "white" }}>
               {trainer.trainer_name} </Link>
              </td>
              <td>{trainer.city}</td>
              <td>
                {trainer.skill_id?.map(skill => skill.skill_name).join(', ') || 'No skills listed'}
              </td>
              <td>
  
   {Array.isArray(trainer.languages_known) 
    ? trainer.languages_known.join(', ') 
    : (trainer.languages_known ? trainer.languages_known.split(',').join(', ') : 'No languages known')}
  
</td>

     </tr>
          ))}
        </tbody>
      </table></div>
      <p></p>
      <div className='placement-display-pagination'>
          <Form.Group controlId="itemsPerPageSelect" style={{ display: 'flex' }}>
            <Form.Label style={{ marginRight: '10px' }}>Display:</Form.Label>
            <Form.Control
              className='label-dis-placement'
              style={{ width: "50px", boxShadow: 'none', outline: 'none' }}
              as="select"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Control>
          </Form.Group>
        <Pagination className="pagination-custom-placement">
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
  );
};

export default TrainerList;
