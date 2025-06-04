import React from 'react';
import '../../styles/form.scss';

const RACITracker = () => (
  <div className="form-container">
    <h2>RACI Tracker</h2>
    <div>
      <h3>RACI Meeting Calendar</h3>
      <p>Calendar integration placeholder</p>
      <h3>Event Tracker</h3>
      <p>Vertical event list, click to view RACI page</p>
      <ul>
        <li>Event 1 - Status: Pending</li>
        <li>Event 2 - Status: Approved</li>
      </ul>
    </div>
  </div>
);

export default RACITracker;
