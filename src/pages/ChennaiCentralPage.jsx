import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/Region.module.css';
import LineBarChart from '../components/graphs/LineBarChart/LineBarChart';

const ChennaiCentralPage = () => {
    const { subdistrictId } = useParams();
    const navigate = useNavigate();
    const [subdistrict, setSubdistrict] = useState(null);
    const [timeframe, setTimeframe] = useState('Last 7 Days');

    // Sample data for Chennai Central subdistrict
    const chennaiCentralData = {
        id: 102,
        name: 'Chennai Central',
        communicated: 28,
        nonCommunication: 3,
        edc: 10,
        region: 'Chennai',
        substations: 5,
        totalMeters: 31, // communicated + nonCommunication
    };

    // Sample data for areas within Chennai Central
    const areasData = [
        {
            id: 1001,
            name: 'All',
            communicated: 8,
            nonCommunication: 1,
            edc: 3
        },
        {
            id: 1002,
            name: 'Chennai Central  ',
            communicated: 7,
            nonCommunication: 1,
            edc: 2
        },
        {
            id: 1003,
            name: 'Chennai North',
            communicated: 6,
            nonCommunication: 0,
            edc: 3
        },
        {
            id: 1004,
            name: 'Chennai  West',
            communicated: 7,
            nonCommunication: 1,
            edc: 2
        }
    ];

    useEffect(() => {
        // In a real implementation, fetch subdistrict data based on subdistrictId
        // For now, we'll just use our sample data
        setSubdistrict(chennaiCentralData);
    }, [subdistrictId]);

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    // Generate sample data for the subdistrict graphs
    const generateMockDataForSubdistrict = (subdistrict) => {
        if (!subdistrict) return null;

        return {
            daily: {
                xAxis: ['2023-10-01', '2023-10-02', '2023-10-03', '2023-10-04', '2023-10-05', '2023-10-06', '2023-10-07'],
                series: [
                    {
                        name: 'Communicating Meters',
                        data: Array.from({ length: 7 }, () => Math.floor(subdistrict.communicated * (0.85 + Math.random() * 0.3)))
                    },
                    {
                        name: 'Non-Communicating Meters',
                        data: Array.from({ length: 7 }, () => Math.floor(subdistrict.nonCommunication * (0.7 + Math.random() * 0.5)))
                    }
                ]
            },
            monthly: {
                xAxis: ['2023-05-01', '2023-06-01', '2023-07-01', '2023-08-01', '2023-09-01', '2023-10-01'],
                series: [
                    {
                        name: 'Communicating Meters',
                        data: Array.from({ length: 6 }, () => Math.floor(subdistrict.communicated * (0.75 + Math.random() * 0.5)))
                    },
                    {
                        name: 'Non-Communicating Meters',
                        data: Array.from({ length: 6 }, () => Math.floor(subdistrict.nonCommunication * (0.6 + Math.random() * 0.8)))
                    }
                ]
            }
        };
    };

    const renderAreaCard = (area) => {
        return (
            <div className={styles.total_units_container} key={area.id}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_card_left}>
                        <div className={styles.region}>
                            <div className="title">{area.name}</div>
                            <div className={styles.stat_card_right}>
                                <span className="icons">
                                    <img src="icons/units.svg" alt={`${area.name} Icon`} />
                                </span>
                            </div>
                        </div>

                        <div className={styles.commincation_status}>
                            <p className={styles.stat_number}>{area.communicated + area.nonCommunication}</p>
                            <div className={styles.communication_status_container}>
                                <div className={styles.communicating_status}>
                                    <div className={styles.meter_status}>
                                        <span className={`${styles.status_indicator} ${styles.communicating}`} />
                                    </div>
                                    <span><strong>{area.communicated}</strong></span>
                                </div>
                                <div className={styles.communicating_status}>
                                    <div className={styles.meter_status}>
                                        <span className={`${styles.status_indicator} ${styles.non_communicating}`} />
                                    </div>
                                    <span><strong>{area.nonCommunication}</strong></span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.current_meter_values}>
                        </div>
                    </div>
                </div>

                <div className={styles.active_units_container}>
                    <div className="sub_title">
                        <span>EDC: <strong>{area.edc}</strong></span>
                    </div>
                </div>
            </div>
        );
    };

    if (!subdistrict) {
        return <div>Loading...</div>;
    }

    const subdistrictData = generateMockDataForSubdistrict(subdistrict);
    const communicationPercentage = Math.round((subdistrict.communicated / subdistrict.totalMeters) * 100);
    const nonCommunicationPercentage = 100 - communicationPercentage;

    return (
        <div className={styles.region_detail_container}>
            {/* Header with back button */}
            <div className={styles.detail_header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className={styles.back_button}
                    >
                        <img src="icons/arrow-left.svg" alt="Back" style={{ width: '24px', height: '24px' }} />
                        <span>Back to Region</span>
                    </button>
                </div>
                <div className={styles.action_cont}>
                    <div className={styles.time_range_select_dropdown}>
                        <select
                            value={timeframe}
                            onChange={handleTimeframeChange}
                            className={styles.time_range_select}>
                            <option value="Today">Today</option>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                        </select>
                        <img
                            src="icons/arrow-down.svg"
                            alt="Select Time"
                            className={styles.time_range_select_dropdown_icon}
                        />
                    </div>
                </div>
            </div>

            <h2 className='title'>{subdistrict.name} Details</h2>

            {/* Subdistrict Summary Card */}
            <div className={styles.summary_section}>
                <div className={styles.summary_card}>
                    <div className={styles.total_meters_container}>
                        <img src="icons/meter.svg" alt="Total Meters" />
                        <div className={styles.total_meters}>
                            <div className='titles'>{subdistrict.name} Total Meters</div>
                            <div className={styles.summary_value}>{subdistrict.totalMeters}</div>
                        </div>
                    </div>

                    <div className={styles.meter_communication}>
                        <div className={styles.summary_item}>
                            <div className='title'>Communicating Meters</div>
                            <div className={styles.summary_progress}>
                                <div className={styles.summary_value}>
                                    <div>{subdistrict.communicated}</div>
                                    <div className={styles.meter_percentage}>{communicationPercentage}%</div>
                                </div>
                                <div className={styles.progress_bar}>
                                    <div
                                        className={`${styles.progress_fill} ${styles.progress_fill_positive}`}
                                        style={{ width: `${communicationPercentage}%` }}
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
                                    <div>{subdistrict.nonCommunication}</div>
                                    <div className={styles.meter_percentage}>{nonCommunicationPercentage}%</div>
                                </div>
                                <div className={styles.progress_bar}>
                                    <div
                                        className={`${styles.progress_fill} ${styles.progress_fill_negative}`}
                                        style={{ width: `${nonCommunicationPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Area Cards Section */}
            <div className={styles.section_header}>
                <h2 className='title'>{subdistrict.name} Areas</h2>
            </div>

            <div className={styles.region_stats_grid_container}>
                <div className={styles.region_stats_grid}>
                    {areasData.map(area => renderAreaCard(area))}
                </div>
            </div>

            {/* Graph  */}
            <div className={`${styles.detail_grid_item} ${styles.detail_grid_item_full}`}>
                <h3 className="title">{subdistrict.name} Communication Status</h3>
                <div className={styles.detail_chart}>
                    <LineBarChart
                        title=""
                        data={subdistrictData}
                        seriesColors={['#029447', '#dc272c']}
                        yAxisLabel="Units"
                        height="100%"
                    />
                </div>
            </div>
        </div>
    );
};

export default ChennaiCentralPage; 