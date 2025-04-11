import React from 'react';
import styles from './TimeRangeSelectDropdown.module.css';

const TimeRangeSelectDropdown = ({ value, onChange }) => {
  return (
    <div className={styles.time_range_select_dropdown}>
      <select
        value={value}
        onChange={onChange}
        className={styles.time_range_select}
      >
        <option value="Daily">Daily</option>
        <option value="Monthly">Monthly</option>
        <option value="PreviousMonth">Previous Month</option>
        <option value="Year">Year</option>
      </select>
      <img
        src="icons/arrow-down.svg"
        alt="Select Time"
        className={styles.time_range_select_dropdown_icon}
      />
    </div>
  );
};

export default TimeRangeSelectDropdown; 