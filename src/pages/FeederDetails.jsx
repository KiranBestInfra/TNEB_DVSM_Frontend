import styles from '../styles/LongDetailsWidget.module.css';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Buttons from '../components/ui/Buttons/Buttons';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';

const FeederDetails = () => {
    const { region, feederId } = useParams();
    const [timeRange, setTimeRange] = useState('Daily');
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });

    const entityId = feederId;

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get(
                    `/feeders/graph/${entityId}/demand`
                );
                const data = response.data;
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching feeder graph data:', error);
                try {
                    await apiClient.post('/log/error', {
                        message: error.message,
                        stack: error.stack || 'No stack trace',
                        time: new Date().toISOString(),
                    });
                } catch (logError) {
                    console.error('Error logging to backend:', logError);
                }
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
        meterCount: 0,
        currentValue: 0,
        previousValue: 0,
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{entityName} Feeder</h2>
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
                                alt="Meter"
                                className={styles.TNEB_icons}
                            />
                        </div>

                        <div className={styles.total_title_value}>
                            <span className="title">Meters</span>
                            <span className={styles.summary_value}>
                                {stats.meterCount}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.total_units_container}>
                    <div className={styles.total_main_info}>
                        <div className={styles.TNEB_icons}>
                            <img
                                src="icons/location.svg"
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

export default FeederDetails;
