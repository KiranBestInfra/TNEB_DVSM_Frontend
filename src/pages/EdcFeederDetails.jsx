import styles from '../styles/LongDetailsWidget.module.css';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';

const EdcFeederDetails = () => {
    const { region, edc, edcId, edcs, feederId } = useParams();
    const location = useLocation();
    const [timeRange, setTimeRange] = useState('Daily');
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });

    const entityId = feederId;
    const edcIdentifier = edcId || edcs || edc;
    const isUserRoute = location.pathname.includes('/user/');

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

    const feederName = entityId
        ? entityId
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
        : 'Unknown';

    const edcName = edcIdentifier
        ? edcIdentifier
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
        : 'Unknown';

    const stats = {
        currentValue: 0,
        previousValue: 0,
        voltageLevel: '11kV',
    };
    const routePrefix = isUserRoute ? '/user' : '/admin';
    const edcLink = region
        ? `${routePrefix}/${region}/edcs/${edcIdentifier}/details`
        : `${routePrefix}/${edcIdentifier}/dashboard`;

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{feederName} Feeder</h2>
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
                <div className={styles.total_units_container}>
                    <div className={styles.total_main_info}>
                        <div className={styles.TNEB_icons}>
                            <img
                                src="icons/electric-factory.svg"
                                alt="EDC"
                                className={styles.TNEB_icons}
                            />
                        </div>
                        <div className={styles.total_title_value}>
                            <span className="title">EDC</span>
                            <span className={styles.summary_value}>
                                <Link to={edcLink}>{edcName}</Link>
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

export default EdcFeederDetails;
