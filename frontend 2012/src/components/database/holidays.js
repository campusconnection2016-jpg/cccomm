import { useEffect } from 'react';

const HolidayComponent = ({ location, onHolidaysFetched }) => {
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch('/data/tn-holidays-2025.json');
        const data = await response.json();

        if (data[location]) {
          const holidays = data[location].map(date => new Date(date));
          onHolidaysFetched(holidays); // Send to parent
        } else {
          onHolidaysFetched([]); // Empty if not found
        }
      } catch (error) {
        console.error("Error loading holidays:", error);
        onHolidaysFetched([]);
      }
    };

    if (location) fetchHolidays();
  }, [location]);

  return null; // It's a non-visual component
};

export default HolidayComponent;
