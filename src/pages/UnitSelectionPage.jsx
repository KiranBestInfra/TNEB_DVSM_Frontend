import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Region.module.css';

const UnitSelectionPage = () => {
    const navigate = useNavigate();
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [timeframe, setTimeframe] = useState('Last 7 Days');

    // Sample units data
    const units = [
        {
            id: 1,
            name: 'Unit A',
            communicated: 85,
            nonCommunication: 12,
            edc: 32
        },
        {
            id: 2,
            name: 'Unit B',
            communicated: 78,
            nonCommunication: 8,
            edc: 30
        },
        {
            id: 3,
            name: 'Unit C',
            communicated: 72,
            nonCommunication: 9,
            edc: 28
        },
        {
            id: 4,
            name: 'Unit D',
            communicated: 68,
            nonCommunication: 7,
            edc: 26
        }
    ];

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    const handleUnitClick = (unit) => {
        setSelectedUnit(unit);
    };

    const handleKeyPress = (e, unit) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleUnitClick(unit);
        }
    };

    const renderUnitCard = (unit) => {
        const isSelected = selectedUnit && selectedUnit.id === unit.id;
        
        return (
            <div 
                className={`${styles.total_units_container} ${isSelected ? styles.selected_unit : ''}`} 
                key={unit.id}
                onClick={() => handleUnitClick(unit)}
                onKeyDown={(e) => handleKeyPress(e, unit)}
                tabIndex="0"
                role="button"
                aria-pressed={isSelected}
                aria-label={`Select ${unit.name}`}
                style={{ 
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #029447' : 'none',
                    boxShadow: isSelected ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none'
                }}
            >
                <div className={styles.stat_card}>
                    <div className={styles.stat_card_left}>
                        <div className={styles.region}>
                            <div className="title">{unit.name}</div>
                            <div className={styles.stat_card_right}>
                                <span className="icons">
                                    <img src="/icons/units.svg" alt="" aria-hidden="true" />
                                </span>
                            </div>
                        </div>

                        <div className={styles.commincation_status}>
                            <p className={styles.stat_number}>{unit.communicated + unit.nonCommunication}</p>
                            <div className={styles.communication_status_container}>
                                <div className={styles.communicating_status}>
                                    <div className={styles.meter_status}>
                                        <span className={`${styles.status_indicator} ${styles.communicating}`} />
                                    </div>
                                    <span><strong>{unit.communicated}</strong></span>
                                </div>
                                <div className={styles.communicating_status}>
                                    <div className={styles.meter_status}>
                                        <span className={`${styles.status_indicator} ${styles.non_communicating}`} />
                                    </div>
                                    <span><strong>{unit.nonCommunication}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={styles.active_units_container}>
                    <div className="sub_title">
                        <span>EDC: <strong>{unit.edc}</strong></span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.region_detail_container}>
            {/* Header with back button */}
            <div className={styles.detail_header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className={styles.back_button}
                        aria-label="Back to Dashboard"
                    >
                        <img src="/icons/arrow-left.svg" alt="" aria-hidden="true" style={{ width: '24px', height: '24px' }} />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
                <div className={styles.action_cont}>
                    <div className={styles.time_range_select_dropdown}>
                        <label htmlFor="timeframe-select" className="sr-only">Select Time Range</label>
                        <select
                            id="timeframe-select"
                            value={timeframe}
                            onChange={handleTimeframeChange}
                            className={styles.time_range_select}>
                            <option value="Today">Today</option>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                        </select>
                        <img
                            src="/icons/arrow-down.svg"
                            alt=""
                            aria-hidden="true"
                            className={styles.time_range_select_dropdown_icon}
                        />
                    </div>
                </div>
            </div>

            <h2 className='title'>Unit Selection</h2>

            {/* Unit Selection Section */}
            <div className={styles.section_header}>
                <h3 className='title'>Select a Unit</h3>
                <p className="subtitle">Click on any unit to view more details</p>
            </div>

            <div className={styles.region_stats_grid_container}>
                <div className={styles.region_stats_grid}>
                    {units.map(unit => renderUnitCard(unit))}
                </div>
            </div>

            {/* Display selected unit information */}
            {selectedUnit && (
                <div className={styles.summary_section} aria-live="polite">
                    <h3 className="title sr-only">Selected Unit Details</h3>
                    <div className={styles.summary_card}>
                        <div className={styles.total_meters_container}>
                            <img src="/icons/meter.svg" alt="" aria-hidden="true" />
                            <div className={styles.total_meters}>
                                <div className='titles'>Selected Unit: {selectedUnit.name}</div>
                                <div className={styles.summary_value}>{selectedUnit.communicated + selectedUnit.nonCommunication} Total Meters</div>
                            </div>
                        </div>

                        <div className={styles.meter_communication}> 
                            <div className={styles.summary_item}>
                                <div className='title'>Communicating Meters</div>
                                <div className={styles.summary_progress}>
                                    <div className={styles.summary_value}>
                                        <div>{selectedUnit.communicated}</div>
                                        <div className={styles.meter_percentage}>
                                            {Math.round((selectedUnit.communicated / (selectedUnit.communicated + selectedUnit.nonCommunication)) * 100)}%
                                        </div>
                                    </div>
                                    <div className={styles.progress_bar}>
                                        <div 
                                            className={`${styles.progress_fill} ${styles.progress_fill_positive}`} 
                                            style={{ width: `${Math.round((selectedUnit.communicated / (selectedUnit.communicated + selectedUnit.nonCommunication)) * 100)}%` }}
                                            role="progressbar"
                                            aria-valuenow={selectedUnit.communicated}
                                            aria-valuemin="0"
                                            aria-valuemax={selectedUnit.communicated + selectedUnit.nonCommunication}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.meter_communication}>
                            <div className={styles.summary_item}>
                                <div className='title'>Non-Communicating Meters</div>
                                <div className={styles.summary_progress}>
                                    <div className={`${styles.summary_value} ${styles.negative_value}`}>
                                        <div>{selectedUnit.nonCommunication}</div>
                                        <div className={styles.meter_percentage}>
                                            {Math.round((selectedUnit.nonCommunication / (selectedUnit.communicated + selectedUnit.nonCommunication)) * 100)}%
                                        </div>
                                    </div>
                                    <div className={styles.progress_bar}>
                                        <div 
                                            className={`${styles.progress_fill} ${styles.progress_fill_negative}`} 
                                            style={{ width: `${Math.round((selectedUnit.nonCommunication / (selectedUnit.communicated + selectedUnit.nonCommunication)) * 100)}%` }}
                                            role="progressbar"
                                            aria-valuenow={selectedUnit.nonCommunication}
                                            aria-valuemin="0"
                                            aria-valuemax={selectedUnit.communicated + selectedUnit.nonCommunication}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitSelectionPage; 