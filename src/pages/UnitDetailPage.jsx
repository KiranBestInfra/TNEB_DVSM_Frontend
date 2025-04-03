import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Region.module.css';

const UnitDetailPage = () => {
    const navigate = useNavigate();
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [timeframe, setTimeframe] = useState('Last 7 Days');

    // Sample data for the four units
    const units = [
        {
            id: 1,
            name: 'Unit A',
            communicated: 85,
            nonCommunication: 15,
            edc: 32
        },
        {
            id: 2,
            name: 'Unit B',
            communicated: 92,
            nonCommunication: 8,
            edc: 28
        },
        {
            id: 3,
            name: 'Unit C',
            communicated: 78,
            nonCommunication: 22,
            edc: 25
        },
        {
            id: 4,
            name: 'Unit D',
            communicated: 88,
            nonCommunication: 12,
            edc: 30
        }
    ];

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    const handleUnitClick = (unit) => {
        setSelectedUnit(unit);
        // Announce to screen readers that unit was selected
        const announcement = document.getElementById('unit-selection-announcement');
        if (announcement) {
            announcement.textContent = `${unit.name} selected`;
        }
    };

    const renderUnitCard = (unit) => {
        const isSelected = selectedUnit && selectedUnit.id === unit.id;
        const totalCount = unit.communicated + unit.nonCommunication;
        const communicatingPercentage = Math.round((unit.communicated / totalCount) * 100);
        
        return (
            <div 
                className={`${styles.total_units_container} ${isSelected ? styles.selected_unit : ''}`} 
                key={unit.id}
                onClick={() => handleUnitClick(unit)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-pressed={isSelected}
                tabIndex="0"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleUnitClick(unit);
                        e.preventDefault();
                    }
                }}
                aria-label={`Select ${unit.name}`}
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
                            <p className={styles.stat_number}>{totalCount}</p>
                            <div className={styles.communication_status_container}>
                                <div className={styles.communicating_status}>
                                    <div className={styles.meter_status}>
                                        <span className={`${styles.status_indicator} ${styles.communicating}`} aria-hidden="true" />
                                    </div>
                                    <span><strong>{unit.communicated}</strong></span>
                                </div>
                                <div className={styles.communicating_status}>
                                    <div className={styles.meter_status}>
                                        <span className={`${styles.status_indicator} ${styles.non_communicating}`} aria-hidden="true" />
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
            {/* Accessibility announcement */}
            <div 
                id="unit-selection-announcement" 
                className="sr-only" 
                aria-live="polite" 
                style={{ position: 'absolute', height: '1px', width: '1px', overflow: 'hidden' }}
            ></div>
            
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
                        <label htmlFor="timeframe-select" className="sr-only">Select timeframe</label>
                        <select
                            id="timeframe-select"
                            value={timeframe}
                            onChange={handleTimeframeChange}
                            className={styles.time_range_select}
                            aria-label="Select time range">
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

            <h1 className='title'>Unit Details</h1>

            {/* Selected Unit Display Section */}
            {selectedUnit && (
                <div className={styles.summary_section} aria-label={`Details for ${selectedUnit.name}`}>
                    <div className={styles.summary_card}>
                        <div className={styles.total_meters_container}>
                            <img src="/icons/meter.svg" alt="" aria-hidden="true" />
                            <div className={styles.total_meters}>
                                <div className='titles'>Selected Unit: {selectedUnit.name}</div>
                                <div className={styles.summary_value} aria-label={`Total meters: ${selectedUnit.communicated + selectedUnit.nonCommunication}`}>
                                    {selectedUnit.communicated + selectedUnit.nonCommunication}
                                </div>
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
                                    <div className={styles.progress_bar} role="progressbar" 
                                        aria-valuenow={Math.round((selectedUnit.communicated / (selectedUnit.communicated + selectedUnit.nonCommunication)) * 100)}
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                        <div 
                                            className={`${styles.progress_fill} ${styles.progress_fill_positive}`} 
                                            style={{ width: `${Math.round((selectedUnit.communicated / (selectedUnit.communicated + selectedUnit.nonCommunication)) * 100)}%` }}
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
                                    <div className={styles.progress_bar} role="progressbar" 
                                        aria-valuenow={Math.round((selectedUnit.nonCommunication / (selectedUnit.communicated + selectedUnit.nonCommunication)) * 100)}
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                        <div 
                                            className={`${styles.progress_fill} ${styles.progress_fill_negative}`} 
                                            style={{ width: `${Math.round((selectedUnit.nonCommunication / (selectedUnit.communicated + selectedUnit.nonCommunication)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unit Cards Section */}
            <div className={styles.section_header}>
                <h2 className='title'>Units</h2>
                <p className="sub_title">Click on a unit to view details</p>
            </div>

            <div className={styles.region_stats_grid_container}>
                <div className={styles.region_stats_grid} role="group" aria-label="Unit selection">
                    {units.map(unit => renderUnitCard(unit))}
                </div>
            </div>
        </div>
    );
};

export default UnitDetailPage; 