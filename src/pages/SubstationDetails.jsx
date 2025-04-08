import styles from '../styles/LongDetailsWidget.module.css';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';

const SubstationDetails = () => {
    const { region, substationId } = useParams();
    const [timeRange, setTimeRange] = useState('Daily');
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });

    const entityId = substationId;

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get(
                    `/substations/graph/${entityId}/demand`
                );
                const data = response.data;
                console.log('dataaaaa', data);
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching substation graph data:', error);
            }
        };

        fetchGraphData();
    }, [entityId, timeRange]);

    const entityName = entityId
        ? entityId
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
        : 'Unknown';

    const stats = {
        feederCount: 20,
        currentValue: 8.5,
        previousValue: 7.9,
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{entityName} Substation</h2>
                <div className={styles.action_container}>
                    <div className={styles.action_cont}>
                        <div className={styles.time_range_select_dropdown}>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={styles.time_range_select}>
                                <option value="Daily">Daily</option>
                                <option value="Monthly">Monthly</option>
                                <option value="PreviousMonth">
                                    Previous Month
                                </option>
                                <option value="Year">Year</option>
                            </select>
                            <img
                                src="icons/arrow-down.svg"
                                alt="Select Time"
                                className={
                                    styles.time_range_select_dropdown_icon
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Breadcrumb />

            <div className={styles.performance_stats}>
                <div className={styles.total_meters_container}>
                    <div className={styles.total_main_info}>
                        <div className={styles.TNEB_icons}>
                            <img
                                src="icons/electric-meter.svg"
                                alt="Feeder"
                                className={styles.TNEB_icons}
                            />
                        </div>

                        <div className={styles.total_title_value}>
                            <span className="title">
                                <Link
                                    to={`/admin/${region}/substations/${substationId}/feeders`}>
                                    Feeders
                                </Link>
                            </span>
                            <span className={styles.summary_value}>
                                {stats.feederCount}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.total_units_container}>
                    <div className={styles.total_main_info}>
                        <div className={styles.TNEB_icons}>
                            <img
                                src="icons/district.svg"
                                alt="Location"
                                className={styles.TNEB_icons}
                            />
                        </div>
                        <div className={styles.total_title_value}>
                            <span className="title">Region</span>
                            <span className={styles.summary_value}>
                                <Link to={`/admin/${region}/dashboard`}>
                                    {region
                                        ? region.charAt(0).toUpperCase() +
                                          region.slice(1)
                                        : 'N/A'}
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.chart_container}>
                <DynamicGraph data={graphData} timeRange={timeRange} />
            </div>
        </div>
    );
};

export default SubstationDetails;
