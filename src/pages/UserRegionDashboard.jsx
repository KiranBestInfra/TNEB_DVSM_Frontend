import styles from '../styles/LongDetailsWidget.module.css';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Buttons from '../components/ui/Buttons/Buttons';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const UserRegionDashboard = () => {
    const { region } = useParams();
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState('Daily');
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });

    const entityId = region;

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get(
                    `/regions/graph/${entityId}/demand`
                );
                const data = response.data;
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching region dashboard data:', error);
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
        edcCount: 5,
        substationCount: 18,
        feederCount: 42,
        currentValue: 12.4,
        previousValue: 11.9,
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{entityName} Region Dashboard</h2>
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
                        <Buttons
                            label="Get Reports"
                            variant="primary"
                            alt="GetReports"
                            icon="icons/reports.svg"
                            iconPosition="left"
                        />
                    </div>
                </div>
            </div>
            <Breadcrumb />

            <div className={styles.welcome_message}>
                <h3>Welcome, {user?.name || 'Region User'}</h3>
                <p>Here's an overview of your region's performance</p>
            </div>

            <div className={styles.performance_stats}>
                <div className={styles.total_edcs_container}>
                    <div className={styles.total_main_info}>
                        <div className={styles.TNEB_icons}>
                            <img
                                src="icons/electric-edc.svg"
                                alt="EDC"
                                className={styles.TNEB_icons}
                            />
                        </div>
                        <div className={styles.total_title_value}>
                            <span className="title">
                                <Link to={`/user/${entityId}/edcs`}>EDCs</Link>
                            </span>
                            <span className={styles.summary_value}>
                                {stats.edcCount}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.total_substations_container}>
                    <div className={styles.total_main_info}>
                        <div className={styles.TNEB_icons}>
                            <img
                                src="icons/electric-factory.svg"
                                alt="Substation"
                                className={styles.TNEB_icons}
                            />
                        </div>
                        <div className={styles.total_title_value}>
                            <span className="title">
                                <Link to={`/user/${entityId}/substations`}>
                                    Substations
                                </Link>
                            </span>
                            <span className={styles.summary_value}>
                                {stats.substationCount}
                            </span>
                        </div>
                    </div>
                </div>

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
                                <Link to={`/user/${entityId}/feeders`}>
                                    Feeders
                                </Link>
                            </span>
                            <span className={styles.summary_value}>
                                {stats.feederCount}
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

export default UserRegionDashboard;
