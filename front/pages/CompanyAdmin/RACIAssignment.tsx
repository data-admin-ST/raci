import React from 'react';
import '../../styles/form.scss';

const RACIAssignment = () => (
  <div className="form-container">
    <h2>RACI Assignment</h2>
    <form>
      <label>
        Event Selection
        <select name="event">
          <option>Select Event</option>
        </select>
        <button type="button">Know More</button>
      </label>
      <label>
        Responsible (R)
        <select multiple>
          <option>Employee 1</option>
        </select>
        <input type="checkbox" /> Financial Limit
      </label>
      <label>
        Accountable (A)
        <select multiple>
          <option>Employee 1</option>
        </select>
        <input type="checkbox" /> Financial Limit
      </label>
      <label>
        Consulted (C)
        <select multiple>
          <option>Employee 1</option>
        </select>
        <input type="checkbox" /> Financial Limit
      </label>
      <label>
        Informed (I)
        <select multiple>
          <option>Employee 1</option>
        </select>
        <input type="checkbox" /> Financial Limit
      </label>
      <button type="button">Submit for Approval</button>
    </form>
  </div>
);

export default RACIAssignment;
