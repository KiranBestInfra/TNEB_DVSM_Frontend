import styles from '../styles/LongDetailsWidget.module.css';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Buttons from '../components/ui/Buttons/Buttons';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';

const LongDetailsWidget = () => {
    const { regionId, region, edcId, substationId, feederId } = useParams();
    const [timeRange, setTimeRange] = useState('Daily');
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });

    let entityId = regionId || region;

    if (feederId) {
        entityId = feederId;
    } else if (substationId) {
        entityId = substationId;
    } else if (edcId) {
        entityId = edcId;
    }

    const isUserRoute = location.pathname.includes('/user/');
    const routePrefix = isUserRoute ? '/user' : '/admin';

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get(
                    `/regions/graph/${entityId}/demand`
                );
                const data = response.data;
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching graph data:', error);
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

    const stats = {
        edcCount: 0,
        substationCount: 0,
        feederCount: 0,
        currentValue: 0,
        previousValue: 0,
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title"> Region</h2>
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
                                <Link
                                    to={
                                        entityId
                                            ? `${routePrefix}/${entityId}/edcs`
                                            : `${routePrefix}/edcs`
                                    }>
                                    EDCs:{''}
                                </Link>
                            </span>
                            <span className={styles.summary_value}>
                                [ {stats.edcCount} ]
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
                                <Link
                                    to={
                                        entityId
                                            ? `${routePrefix}/${entityId}/substations`
                                            : `${routePrefix}/substations`
                                    }>
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
                                <Link
                                    to={
                                        entityId
                                            ? `${routePrefix}/${entityId}/feeders`
                                            : `${routePrefix}/feeders`
                                    }>
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
                                        to={
                                            entityId
                                                ? `${baseRoute}/${entityId}/feeders`
                                                : `${baseRoute}/feeders`
                                        }>
                                        Feeder
                                    </Link>
                                </span>
                                <span className={styles.summary_value}>
                                    [ {stats.feederCount} ]
                                </span>
                            </div>
                        </div>
                        <div className={styles.regions_communication_info}>
                            <div className="titles">Communication Status</div>
                            <div
                                className={styles.overall_communication_status}>
                                <div
                                    className={
                                        styles.communication_status_container
                                    }>
                                    <div className={styles.communication_value}>
                                        {stats.feederCount}
                                    </div>
                                    <div
                                        className={
                                            styles.communication_positive_percentage
                                        }>
                                        <img
                                            src="icons/up-right-arrow.svg"
                                            alt="Positive"
                                            className={
                                                styles.communication_positive_arrow
                                            }
                                        />
                                        87%
                                    </div>
                                </div>
                                <div
                                    className={
                                        styles.communication_status_container
                                    }>
                                    <div className={styles.communication_value}>
                                        {stats.feederCount}
                                    </div>
                                    <div
                                        className={
                                            styles.communication_negative_percentage
                                        }>
                                        <img
                                            src="icons/up-right-arrow.svg"
                                            alt="Positive"
                                            className={
                                                styles.communication_negative_arrow
                                            }
                                        />
                                        13%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.details_section}>
                <div className={styles.details_card}>
                    <div className={styles.details_header}></div>
                    <div className={styles.detail_chart}>
                        <DynamicGraph
                            title="Actual Demand Graph"
                            data={graphData}
                            seriesColors={['#3f68b2', '#ed8c22']}
                            yAxisLabel="MW"
                            showLabel={false}
                            toolbox={true}
                            height="500px"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LongDetailsWidget;
