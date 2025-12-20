import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import {
  getCollege_logo_API_Training,
  update_Training_API,
  get_department_info_College,
  get_Distinct_Batches_API,
update_Trainingdates_API
} from '../../api/endpoints';
import HolidayComponent from './holidays';
import Select from 'react-select';
import { SearchContext } from '../../allsearch/searchcontext';
import '../../styles/trainingadmin.css';
import ErrorModal from '../auth/errormodal';

import "react-datetime/css/react-datetime.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import moment from 'moment';
import CustomPagination from '../../api/custompagination';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#39444e',
    color: '#fff', // Text color
    borderColor: state.isFocused ? '' : '#ffff', // Border color on focus
    boxShadow: 'none', // Remove box shadow
    '&:hover': {
      borderColor: state.isFocused ? '#ffff' : '#ffff' // Border color on hover
    },
    '&.css-1a1jibm-control': {
      // Additional styles for the specific class
    },
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px', // Smaller font size

      width: '70%'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#ffff', // Text color for selected value
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px' // Smaller font size
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
    color: '#ffff', // Text color
    '&:hover': {
      backgroundColor: '#39444e', // Background color on hover
      color: '#ffff' // Text color on hover
    },
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px',// Smaller font size
      width: '70%'
    }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#39444e',
    '@media (max-width: 768px)': { // Adjust for mobile devices
      fontSize: '12px' // Smaller font size
    }
  })
};

const Trainingschedule = () => {
  const [colleges, setColleges] = useState([]);
  const [updateNoOfDays, setUpdateNoOfDays] = useState('');
 const [isManualEndDate, setIsManualEndDate] = useState(false);
  // Setting up state for start and end dates
  const [updateStartDate, setUpdateStartDate] = useState(null);
  const [updateEndDate, setUpdateEndDate] = useState(null);

  const [updatelocat, setlocat] = useState('');

 
  const [updateNoOfBatch, setUpdateNoOfBatch] = useState('');
 
 
  const [updateCollege, setUpdateCollege] = useState('');
  
  const [updateCollegeId, setUpdateCollegeId] = useState(null);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search input
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [totalPages1, setTotalPages1] = useState(1);
  const [pageSize] = useState(10); // Items per page
  const [govtHolidayMap, setGovtHolidayMap] = useState({});
const [govtHolidays, setGovtHolidays] = useState([]);
const [remarksFile, setRemarksFile] = useState(null);
  const handleCloseError = () => {
    setShowError(false);
  };

const [highlightedDates, setHighlightedDates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [trainingDates, setTrainingDates] = useState([]);

useEffect(() => {
  fetch("/data/tn-holidays-2025.json")
    .then((response) => {
      if (!response.ok) throw new Error("File not found or fetch failed");
      return response.json();
    })
    .then((data) => {
      const locationKeys = Object.keys(data);
      setLocations(locationKeys);

      // Convert all holiday strings to actual Date objects and log
      const parsedHolidayMap = {};
      Object.entries(data).forEach(([location, holidays]) => {
        parsedHolidayMap[location] = holidays.map(dateStr => {
          const parsed = new Date(dateStr);
          console.log(`Parsed Holiday for ${location}: ${parsed.toDateString()}`);
          return parsed;
        });
      });

      setGovtHolidayMap(parsedHolidayMap);
    })
    .catch((error) => {
      console.error("Error loading JSON file:", error);
    });
}, []);

const navigate = useNavigate();

const handleNextClick = () => {
  // Optional: Save form data to state/context before navigation
  console.log("📤 Navigating to next page...");
  navigate(`/test/training/${updateCollegeId}`); // Change path to your actual route
};
const handleLocationChange = (e) => {
  const selectedLocation = e.target.value;
  setlocat(selectedLocation);

  if (govtHolidayMap[selectedLocation]) {
    setGovtHolidays(govtHolidayMap[selectedLocation]);
  } else {
    setGovtHolidays([]);
  }
};

  const fetchColleges = async (page) => {
    try {
      const collegesData = await getCollege_logo_API_Training(page, searchTerm); // Pass searchTerm here
      setColleges(collegesData.results);
      setTotalPages1(Math.ceil(collegesData.count / pageSize));

      if (collegesData.results.length > 0) {
        const college = collegesData.results[0];
        setUpdateStartDate(college.dtm_start ? moment(college.dtm_start, 'YYYY-MM-DDTHH:mm:ss').toDate() : null);
        setUpdateEndDate(college.dtm_end ? moment(college.dtm_end, 'YYYY-MM-DDTHH:mm:ss').toDate() : null);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

 
  // Fetch colleges when component mounts
  useEffect(() => {
    fetchColleges(currentPage, searchTerm);
  }, [currentPage, searchTerm]);


  const handlePageChange1 = (page) => {
    setCurrentPage(page);
  };

const calculateEndDate = (startDate, daysToAdd, holidays) => {
  let currentDate = new Date(startDate);
  let addedDays = 0;

  console.log(`Start Date: ${currentDate.toDateString()}`);
  console.log(`Days to Add (excluding weekends & holidays): ${daysToAdd}`);
  console.log(`Holidays: ${holidays.map(h => h.toDateString()).join(', ')}`);

  while (addedDays < daysToAdd) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const isHoliday = holidays.some(
      h => h.toDateString() === currentDate.toDateString()
    );

    console.log(`Checking: ${currentDate.toDateString()} | Weekend: ${isWeekend} | Holiday: ${isHoliday}`);

    if (!isWeekend && !isHoliday) {
      addedDays++;
      console.log(`Valid Day Counted: ${currentDate.toDateString()} (Total: ${addedDays}/${daysToAdd})`);
    } else {
      console.log(`Skipped: ${currentDate.toDateString()} (Weekend/Holiday)`);
    }

    // Only increment date AFTER checking it
    if (addedDays < daysToAdd) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  console.log(`Final End Date: ${currentDate.toDateString()}`);
  return currentDate;
};


  useEffect(() => {
    console.log("Resetting manual override due to change in start date or no of days.");
    setIsManualEndDate(false);
  }, [updateStartDate, updateNoOfDays]);

  const parseDateSafe = (date) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
};
/*
useEffect(() => {
  console.log("📍 useEffect for trainingDates triggered!");

  console.log("🔸 updateStartDate:", updateStartDate);
  console.log("🔸 updateNoOfDays:", updateNoOfDays);
  console.log("🔸 govtHolidays:", govtHolidays);

  if (updateStartDate && updateNoOfDays && govtHolidays.length) {
    const start = parseDateSafe(updateStartDate);
    const holidaysAsDates = govtHolidays.map(h => parseDateSafe(h)).filter(Boolean);

    if (!start) {
      console.warn("⛔ Invalid start date.");
      return;
    }

    const trainingDates = [];
    let current = new Date(start);
    let added = 0;

    while (added < parseInt(updateNoOfDays)) {
      current.setDate(current.getDate() + 1);
      const isHoliday = holidaysAsDates.some(h => h.toDateString() === current.toDateString());
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;

      if (!isHoliday && !isWeekend) {
        trainingDates.push(new Date(current));
        added++;
      }
    }

   
  if (trainingDates.length > 0) {
    trainingDates.forEach((date, index) => {
      console.log(`✅ State Day ${index + 1}: ${date.toDateString()}`);
    });
  } else {
    console.warn("⚠️ trainingDates state is empty.");
  }
setTrainingDates(trainingDates); // Add this line after trainingDates.forEach

    setHighlightedDates([
      { dates: holidaysAsDates, className: "holiday-date" },
      { dates: trainingDates, className: "training-date" }
    ]);
  } else {
    console.warn("⚠️ Missing updateStartDate, updateNoOfDays, or govtHolidays.");
  }

}, [updateStartDate, updateNoOfDays, govtHolidays]);
*/

useEffect(() => {
  if (updateCollegeId) {
    console.log("📌 College ID:", updateCollegeId);

    get_department_info_College([updateCollegeId]) // pass as array
      .then(data => {
        console.log("✅ Department data:", data);
        const deptOptions = data.map(item => ({
          value: item.department_id__id,
          label: item.department_id__department,
        }));
        setDepartments(deptOptions);
      })
      .catch(err => {
        console.error("❌ Error fetching departments:", err);
        setDepartments([]); // Clear if error
      });
  }
}, [updateCollegeId]);

useEffect(() => {
  if (updateCollegeId) {
    const collegeId = updateCollegeId;
    console.log("📌 College ID:", collegeId);

    // Fetch departments
    // Fetch batches
    console.log("📡 Calling get_Distinct_Batches_API...");
    get_Distinct_Batches_API(collegeId)
      .then(data => {
        console.log("✅ Batch data:", data);
        const batchOptions = data.map(item => ({
          value: item.value,
          label: item.label
        }));
        setBatches(batchOptions);
      })
      .catch(err => console.error("❌ Error fetching batches:", err));
  }
}, [updateCollege]);
useEffect(() => {
  if (updateStartDate && updateNoOfDays && govtHolidays?.length) {
    const start = parseDateSafe(updateStartDate);
    if (!start) return;

    const holidaysAsDates = govtHolidays.map(h => parseDateSafe(h)).filter(Boolean);

    // Training dates array
    const trainingDates = [];
    let current = new Date(start);
    let added = 0;

    while (added < parseInt(updateNoOfDays)) {
  const isHoliday = holidaysAsDates.some(h => h.toDateString() === current.toDateString());
  const isWeekend = current.getDay() === 0 || current.getDay() === 6;

  if (!isHoliday && !isWeekend) {
    trainingDates.push(new Date(current));
    added++;
  }

  // Only increment after checking current date
  current.setDate(current.getDate() + 1);
}
    setTrainingDates(trainingDates);

    const calculatedEndDate = calculateEndDate(start, parseInt(updateNoOfDays), holidaysAsDates);
    setUpdateEndDate(calculatedEndDate);

    setHighlightedDates([
      { dates: holidaysAsDates, className: "holiday-date" },
      { dates: trainingDates, className: "training-date" }
    ]);
  }
}, [updateStartDate, updateNoOfDays, govtHolidays]);

const handleUpdateCollegeold= async (event) => {
  event.preventDefault();

  try {
    // Prepare form data for first API
    const formData = new FormData();
    formData.append('college_id', updateCollegeId || '');
    formData.append('college', updateCollege || '');
    formData.append('location', updatelocat || '');
    formData.append('dtm_start', updateStartDate ? moment(updateStartDate).format('YYYY-MM-DD') : '');
    formData.append('dtm_end', updateEndDate ? moment(updateEndDate).format('YYYY-MM-DD') : '');
    formData.append('no_of_batch', updateNoOfBatch || '');
    formData.append('no_of_days', updateNoOfDays || '');

    if (remarksFile) {
      formData.append('remarks_file', remarksFile);
    }

    selectedBatches?.forEach(batch => {
      formData.append('batches', batch.value);
    });

    selectedDepartments?.forEach(dep => {
      formData.append('department_id', dep.value);
    });

    selectedYears?.forEach(yr => {
      formData.append('year', yr);
    });
    const trainer_date_obj = trainingDates.reduce((acc, date, index) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const dayLabel = `Day ${index + 1}`;

    console.log(`📅 ${dayLabel}: ${formattedDate}`);  // Logs each formatted day
    acc[dayLabel] = formattedDate;
    return acc;
  }, {});

  console.log("📦 Final trainer_date object to send:", trainer_date_obj);

  const trainerFormData = new FormData();
  trainerFormData.append("trainer_date", JSON.stringify(trainer_date_obj));
    // Call first API with POST and form-data
    const response = await update_Training_API(updateCollegeId, formData,trainerFormData);

    if (response) {
      // Prepare form data for second API (trainer_date)
   if (trainingDates?.length > 0) {
  console.log("📌 Raw trainingDates array:");
  trainingDates.forEach((date, i) => {
    console.log(`  [${i}] Original Date Object:`, date, "Formatted:", moment(date).format("YYYY-MM-DD"));
  });

  

  // Call second API with POST and form-data
 // const trainerDateResponse = await update_Trainingdates_API(updateCollegeId, trainerFormData);
 // console.log("✅ Trainer Date Updated:", trainerDateResponse);
}


      setErrorMessage('Data Updated Successfully');
      setShowError(true);
      setShowUpdateForm(false);
      fetchColleges();
      setUpdateCollege('');
      setRemarksFile(null);
      setSelectedBatches([]);
      setSelectedDepartments([]);
      setSelectedYears([]);
    } else {
      setErrorMessage('Failed to update college. Please try again.');
      setShowError(true);
    }
  } catch (error) {
    console.error('❌ Error during update:', error);
    setErrorMessage('Failed to update college. Please try again.');
    setShowError(true);
  }
};

const handleUpdateCollege = async (event) => {
  event.preventDefault();

  try {
    const formData = new FormData();
    formData.append('college_id', updateCollegeId || '');
    formData.append('college', updateCollege || '');
    formData.append('location', updatelocat || '');
    formData.append('dtm_start', updateStartDate ? moment(updateStartDate).format('YYYY-MM-DD') : '');
    formData.append('dtm_end', updateEndDate ? moment(updateEndDate).format('YYYY-MM-DD') : '');
    formData.append('no_of_batch', updateNoOfBatch || '');
    formData.append('no_of_days', updateNoOfDays || '');

    if (remarksFile) {
      formData.append('remarks_file', remarksFile);
    }

    selectedBatches?.forEach(batch => {
      formData.append('batches', batch.value);
    });

    selectedDepartments?.forEach(dep => {
      formData.append('department_id', dep.value);
    });

    selectedYears?.forEach(yr => {
      formData.append('year', yr);
    });

    // ✅ Build the trainer_date JSON object
    const trainer_date_obj = trainingDates.reduce((acc, date, index) => {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const dayLabel = `Day ${index + 1}`;
      console.log(`📅 ${dayLabel}: ${formattedDate}`);
      acc[dayLabel] = formattedDate;
      return acc;
    }, {});
    
    console.log("📦 Final trainer_date object to send:", trainer_date_obj);
    formData.append('trainer_date', JSON.stringify(trainer_date_obj)); // ✅ append to main formData

    // ✅ Call single backend API to handle everything including trainer_date
    const response = await update_Training_API(updateCollegeId, formData);

    if (response?.status === 200) {
      setErrorMessage('Data Updated Successfully');
      setShowError(true);
      setShowUpdateForm(false);
      fetchColleges();
      setUpdateCollege('');
      setRemarksFile(null);
      setSelectedBatches([]);
      setSelectedDepartments([]);
      setSelectedYears([]);
    } else {
      setErrorMessage('Failed to update college. Please try again.');
      setShowError(true);
    }
  } catch (error) {
    console.error('❌ Error during update:', error);
    setErrorMessage('Failed to update college. Please try again.');
    setShowError(true);
  }
};

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // setCurrentPage(1); // Reset to first page on search
  };

  const filteredColleges = colleges.filter((college) =>
    (college.college && college.college.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (college.college_group && college.college_group.toLowerCase().includes(searchTerm.toLowerCase()))
  );
 // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentColleges = colleges.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
  const currentColleges = filteredColleges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className='form-ques-settings'>

      <input
        type="text"
        className="search-box1-settings"
        placeholder="Search College..."
        value={searchTerm}
        onChange={handleSearchChange}

      />


      <p></p>


      {showUpdateForm && (
        <div className="popup-container-clg">
          <div className="input-group-clg" style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", marginTop: "10px" }}>

            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>

              <label className="label5-ques">CollegeName</label><p></p><p></p>

              <input
                autoComplete="off"
                type="text"
                value={updateCollege}
                className='input-ques'

                onChange={(e) => setUpdateCollege(e.target.value)}
                placeholder="Enter updated college name"
              />

            </div>
<div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
  <label className="label5-ques">Upload Training schedule</label><p></p>
  <input
    type="file"
    accept=".xlsx,.xls,.docx,.pdf,.txt"
    onChange={(e) => setRemarksFile(e.target.files[0])}
    className="input-ques"
  />
</div>


            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: '10px' }}>Location</label><p></p>
             <select
  value={updatelocat}
  onChange={handleLocationChange}
  className="input-ques"
>
  <option value="" disabled>Select a location</option>
  {locations.map((location) => (
    <option key={location} value={location}>
      {location}
    </option>
  ))}
</select>

            </div>
          </div>
          <p></p>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>



            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className='label5-ques' style={{ marginRight: '10px' }}>No.Of.Days</label><p></p>
              <input
                type="text"
                value={updateNoOfDays}
                autoComplete="off"
                onChange={(e) => setUpdateNoOfDays(e.target.value)}
                className='input-ques'
              />
            </div>
            {/* Start Date & Time */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: '10px' }}>Start Date & Time</label><p></p>
             <DatePicker
  selected={parseDateSafe(updateStartDate)}
  onChange={(date) => setUpdateStartDate(date)}
  highlightDates={highlightedDates}
  showTimeSelect
  timeFormat="hh:mm aa"
  timeIntervals={15}
  dateFormat="dd-MM-yyyy, h:mm aa"
  timeCaption="Time"
  className="input-date-custom32"
  autoComplete="off"
/>


            </div>

            {/* End Date & Time */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: '10px' }}>End Date & Time</label><p></p>
            <DatePicker
  selected={updateEndDate}
  onChange={(date) => {
    setUpdateEndDate(date);
    setIsManualEndDate(true);
  }}
  highlightDates={highlightedDates}
  showTimeSelect
  timeFormat="hh:mm aa"
  timeIntervals={15}
  dateFormat="dd-MM-yyyy, h:mm aa"
  timeCaption="Time"
  className="input-date-custom32"
  autoComplete="off"
/>


            </div>
          </div><p></p>


          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* No. of Batches */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: '10px' }}>No. of Batches</label><p></p>
              <input
                type="number"
                value={updateNoOfBatch}
                autoComplete="off"
                onChange={(e) => setUpdateNoOfBatch(e.target.value)}
                className="input-ques"
              />
            </div>


            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: "10px" }}>Batches</label><p></p>
              <Select
  isMulti
  options={batches}
  styles={customStyles}
  value={selectedBatches}
  onChange={setSelectedBatches}
 
  placeholder="Select batches"
/>
            </div>

            {/* Department */}
            <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
              <label className="label5-ques" style={{ marginRight: '10px' }}>Department</label><p></p>
             <Select
  isMulti
  options={departments}
  styles={customStyles}
  value={selectedDepartments}
  onChange={setSelectedDepartments}
 
/>
            </div>

            {/* Year */}
          


          </div>
          <p></p>
          
          {/* Holiday Selector Calendar */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
           <div style={{ display: "flex", flexDirection: "column", width: "30%" }}>
  <label className="label5-ques">Year</label><p></p>
  <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
    {[1, 2, 3, 4].map((yr) => (
      <label key={yr}>
        <input
       
          type="checkbox"
          value={yr}
          checked={selectedYears.includes(yr)}
          onChange={(e) => {
            const newYears = [...selectedYears];
            if (e.target.checked) {
              newYears.push(yr);
            } else {
              const index = newYears.indexOf(yr);
              if (index > -1) newYears.splice(index, 1);
            }
            setSelectedYears(newYears);
          }}
        />
        {yr}
      </label>
    ))}
  </div>
</div>
          <div style={{ display: "flex", flexDirection: "column", width: "26%", marginTop: "20px" }}>

            <label className="label5-ques">Holidays </label>
           <DatePicker
  inline
  highlightDates={[
    {
      "react-datepicker__day--holiday": govtHolidays.map(date => new Date(date)),
    },
    {
      "react-datepicker__day--weekend": (() => {
        const weekends = [];
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        for (let i = 1; i <= 31; i++) {
          const date = new Date(year, month, i);
          if (date.getMonth() === month && (date.getDay() === 0 || date.getDay() === 6)) {
            weekends.push(date);
          }
        }
        return weekends;
      })()
    }
  ]}
  onChange={(date) => {
    const dateString = new Date(date).toDateString();
    const exists = govtHolidays.some(
      (d) => new Date(d).toDateString() === dateString
    );
    let updated;
    if (exists) {
      updated = govtHolidays.filter(
        (d) => new Date(d).toDateString() !== dateString
      );
      console.log("Removed holiday:", dateString);
    } else {
      updated = [...govtHolidays, date];
      console.log("Added holiday:", dateString);
    }
    setGovtHolidays(updated);
  }}
  dayClassName={(date) => {
    const isHoliday = govtHolidays.some(
      (d) => new Date(d).toDateString() === date.toDateString()
    );
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isHoliday) return 'react-datepicker__day--holiday';
    if (isWeekend) return 'react-datepicker__day--weekend';
    return undefined;
  }}
/>

          </div>
          </div>
          <HolidayComponent location={updatelocat} onHolidaysFetched={setGovtHolidays} />

          <div className='button-container-set'>
            <button className='button-ques-save-st' onClick={handleUpdateCollege}>Update</button>
            <button className='cancel-master' onClick={() => setShowUpdateForm(false)}>Cancel</button>
            <div style={{ textAlign: "right", marginTop: "20px", marginRight: "20px" }}>
  <button
   className='button-ques-save-st'
    onClick={handleNextClick}
  >
    Next
  </button>
</div>

          </div>
        </div>
      )}



      <div className='table-responsive-settings'>

        <table className="product-table">
          <thead className="table-thead">
            <tr>
              <th>College</th>
            
              <th>Update</th>
            </tr>
          </thead>
          <tbody className="table-tbody">
            {colleges
              .map((college) => (
                <tr key={college.id}>
                  <td>{college.college}</td>
                 
                  <td>
                    <button className="action-button edit" onClick={() => {
                      setShowUpdateForm(true);
                      setUpdateCollegeId(college.id);
                      setUpdateCollege(college.college);

                      setUpdateStartDate(college.dtm_start);
                      setUpdateEndDate(college.dtm_end);
                      setUpdateNoOfBatch(college.no_of_batch);
       setUpdateNoOfDays(college.no_of_days);

                    }}>✏️</button>
                  </td>

                </tr>
              ))}
          </tbody>
        </table><p></p><p></p>



        <div className='dis-page' style={{ marginTop: '10%' }}>
          {/* Custom Pagination */}
          <CustomPagination
            totalPages={totalPages1}
            currentPage={currentPage}
            onPageChange={handlePageChange1}
            maxVisiblePages={3} // Limit to 3 visible pages
          />
        </div>

      </div>
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

    </div>
  );
};

export default Trainingschedule;

