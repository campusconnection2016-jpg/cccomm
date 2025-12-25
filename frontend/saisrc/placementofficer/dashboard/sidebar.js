// src/components/Sidebar.js
import React from 'react';
import './dashboard.css'
const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>My Lists</h2>
      <ul>
        <li>Life</li>
        <li>Work</li>
        <li>+ New List</li>
      </ul>
    </div>
  );
};

export default Sidebar;
