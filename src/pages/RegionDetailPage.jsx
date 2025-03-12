import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/Region.module.css';
import LineBarChart from '../components/graphs/LineBarChart/LineBarChart';

const RegionDetailPage = () => {
    const { regionId } = useParams();
    const navigate = useNavigate();
    const [region, setRegion] = useState(null);
    const [timeframe, setTimeframe] = useState('Last 7 Days');

    //  this should be  fetched from an API
    const regions = [
        {
            id: 1,
            name: 'Chennai',
            communicated: 120,
            nonCommunication: 15,
            edc: 45,
            district: 'Chennai District',
            substation: 18
        },
        {
            id: 2,
            name: 'Coimbatore',
            communicated: 95,
            nonCommunication: 10,
            edc: 38,
            district: 'Coimbatore District',
            substation: 15
        },
        {
            id: 3,
            name: 'Madurai',
            communicated: 85,
            nonCommunication: 12,
            edc: 32,
            district: 'Madurai District',
            substation: 14
        },
        {
            id: 4,
            name: 'Trichy',
            communicated: 78,
            nonCommunication: 8,
            edc: 30,
            district: 'Trichy District',
            substation: 12
        },
        {
            id: 5,
            name: 'Salem',
            communicated: 72,
            nonCommunication: 9,
            edc: 28,
            district: 'Salem District',
            substation: 11
        },
        {
            id: 6,
            name: 'Tirunelveli',
            communicated: 68,
            nonCommunication: 7,
            edc: 26,
            district: 'Tirunelveli District',
            substation: 10
        },
        {
            id: 7,
            name: 'Erode',
            communicated: 65,
            nonCommunication: 6,
            edc: 25,
            district: 'Erode District',
            substation: 9
        },
        {
            id: 8,
            name: 'Vellore',
            communicated: 62,
            nonCommunication: 5,
            edc: 24,
            district: 'Vellore District',
            substation: 9
        },
        {
            id: 9,
            name: 'Thanjavur',
            communicated: 58,
            nonCommunication: 6,
            edc: 22,
            district: 'Thanjavur District',
            substation: 8
        },
        {
            id: 10,
            name: 'Thoothukudi',
            communicated: 55,
            nonCommunication: 5,
            edc: 21,
            district: 'Thoothukudi District',
            substation: 8
        },
        {
            id: 11,
            name: 'Dindigul',
            communicated: 52,
            nonCommunication: 4,
            edc: 20,
            district: 'Dindigul District',
            substation: 7
        },
        {
            id: 12,
            name: 'Kanchipuram',
            communicated: 48,
            nonCommunication: 5,
            edc: 18,
            district: 'Kanchipuram District',
            substation: 7
        },
        {
            id: 13,
            name: 'Cuddalore',
            communicated: 45,
            nonCommunication: 4,
            edc: 17,
            district: 'Cuddalore District',
            substation: 6
        }
    ];

    // Sub-districts data for the selected region
    const subDistricts = [
        {
            id: 101,
            name: 'All',
            communicated: 35,
            nonCommunication: 4,
            edc: 12
        },
        {
            id: 102,
            name: 'Chennai Central',
            communicated: 28,
            nonCommunication: 3,
            edc: 10
        },
        {
            id: 103,
            name: 'Chennai North',
            communicated: 32,
            nonCommunication: 5,
            edc: 11
        },
        {
            id: 104,
            name: 'Chennai West',
            communicated: 25,
            nonCommunication: 3,
            edc: 9
        }
    ];

    useEffect(() => {
        //  based on the regionId
        const selectedRegion = regions.find(r => r.id === parseInt(regionId));
        if (selectedRegion) {
            setRegion(selectedRegion);
        } else {
            // any errors then it should navigate to dashboard
            navigate('/admin/dashboard');
        }
    }, [regionId, navigate]);

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    // Generate sample data for the region graphs
    const generateMockDataForRegion = (region) => {
        if (!region) return null;

        return {
            daily: {
                xAxis: ['2023-10-01', '2023-10-02', '2023-10-03', '2023-10-04', '2023-10-05', '2023-10-06', '2023-10-07'],
                series: [
                    {
                        name: 'Communicating Meters',
                        data: Array.from({ length: 7 }, () => Math.floor(region.communicated * (0.85 + Math.random() * 0.3)))
                    },
                    {
                        name: 'Non-Communicating Meters',
                        data: Array.from({ length: 7 }, () => Math.floor(region.nonCommunication * (0.7 + Math.random() * 0.5)))
                    }
                ]
            },
            monthly: {
                xAxis: ['2023-05-01', '2023-06-01', '2023-07-01', '2023-08-01', '2023-09-01', '2023-10-01'],
                series: [
                    {
                        name: 'Communicating Meters',
                        data: Array.from({ length: 6 }, () => Math.floor(region.communicated * (0.75 + Math.random() * 0.5)))
                    },
                    {
                        name: 'Non-Communicating Meters',
                        data: Array.from({ length: 6 }, () => Math.floor(region.nonCommunication * (0.6 + Math.random() * 0.8)))
                    }
                ]
            }
        };
    };

    // Generate additional mock data for district details
    const generateDistrictData = (region) => {
        if (!region) return [];

        const districtCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 districts
        return Array.from({ length: districtCount }, (_, index) => ({
            id: index + 1,
            name: `${region.name} District ${index + 1}`,
            communicated: Math.floor(region.communicated / districtCount * (0.8 + Math.random() * 0.4)),
            nonCommunication: Math.floor(region.nonCommunication / districtCount * (0.8 + Math.random() * 0.4)),
            substations: Math.floor(region.substation / districtCount)
        }));
    };

    if (!region) {
        return <div>Loading...</div>;
    }

    const regionData = generateMockDataForRegion(region);
    const districtData = generateDistrictData(region);
    const communicationPercentage = Math.round((region.communicated / (region.communicated + region.nonCommunication)) * 100);
    const nonCommunicationPercentage = 100 - communicationPercentage;

    const renderSubDistrictCard = (subDistrict) => {
        return (
            <div className={styles.total_units_container} key={subDistrict.id}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_card_left}>
                        <div className={styles.region}>
                            <div className="title">{subDistrict.name}</div>
                            <div className={styles.stat_card_right}>
                                <span className="icons">
                                    <img src="icons/units.svg" alt={`${subDistrict.name} Icon`} />
                                </span>
                            </div>
                        </div>
                        

                        <div className={styles.commincation_status}>
                            <p className={styles.stat_number}>{subDistrict.communicated + subDistrict.nonCommunication}</p>
                            <div className={styles.communication_status_container}>
                                <div className={styles.communicating_status}>
                                    <div className={styles.meter_status}>
                                        <span className={`${styles.status_indicator} ${styles.communicating}`} />
                                    </div>
                                    <span><strong>{subDistrict.communicated}</strong></span>
                                </div>
                                <div className={styles.communicating_status}>
                                    <div className={styles.meter_status}>
                                        <span className={`${styles.status_indicator} ${styles.non_communicating}`} />
                                    </div>
                                    <span><strong>{subDistrict.nonCommunication}</strong></span>
                                </div>

                            </div>
                        </div>
                        <div className={styles.current_meter_values}>
                        </div>
                    </div>
                </div>

                <div className={styles.active_units_container}>
                    <div className="sub_title">
                        <span>EDC: <strong>{subDistrict.edc}</strong></span>
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
                    >
                        <img src="icons/arrow-left.svg" alt="Back" style={{ width: '24px', height: '24px' }} />
                        <span>Back to Dashboard</span>
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

            <h2 className='title'>{region.name} Region Details</h2>

            {/* Region Summary Card */}
            <div className={styles.summary_section}>
                <div className={styles.summary_card}>
                    <div className={styles.total_meters_container}>
                        <img src="icons/meter.svg" alt="Total Meters" />
                        <div className={styles.total_meters}>
                            <div className='titles'>{region.name} Total Meters</div>
                            <div className={styles.summary_value}>{region.communicated + region.nonCommunication}</div>
                        </div>
                    </div>

                    <div className={styles.meter_communication}>
                        <div className={styles.summary_item}>
                            <div className='title'>Communicating Meters</div>
                            <div className={styles.summary_progress}>
                                <div className={styles.summary_value}>
                                    <div>{region.communicated}</div>
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
                                    <div>{region.nonCommunication}</div>
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

            {/* Sub-district Cards Section */}
            <div className={styles.section_header}>
                <h2 className='title'>{region.name} Sub-Zones</h2>
            </div>

            <div className={styles.region_stats_grid_container}>
                <div className={styles.region_stats_grid}>
                    {subDistricts.map(subDistrict => renderSubDistrictCard(subDistrict))}
                </div>
            </div>

            {/* Graph  */}
            <div className={`${styles.detail_grid_item} ${styles.detail_grid_item_full}`}>
                <h3 className="title">{region.name} Communication Status</h3>
                <div className={styles.detail_chart}>
                    <LineBarChart
                        title=""
                        data={regionData}
                        seriesColors={['#029447', '#dc272c']}
                        yAxisLabel="Units"
                        height="100%"
                    />
                </div>
            </div>
        </div>
    );
};

export default RegionDetailPage; 