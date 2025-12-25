// src/components/EventChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import './dashboard.css'
const EventChart = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Events',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return <Bar data={data} />;
};

export default EventChart;
