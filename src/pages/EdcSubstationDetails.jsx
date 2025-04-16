import styles from '../styles/LongDetailsWidget.module.css';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import SummarySection from '../components/SummarySection';

const EdcSubstationDetails = () => {
    const { region, edc, edcId, edcs, substationId } = useParams();
    const location = useLocation();
    const [timeRange, setTimeRange] = useState('Daily');
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });
    const [widgetsData, setWidgetsData] = useState(() => {
        const savedDemandData = localStorage.getItem('regionEdcDemandData');
        const savedTimestamp = localStorage.getItem('regionEdcDemandTimestamp');

        if (savedDemandData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedDemandData = JSON.parse(savedDemandData);
                return {
                    totalEdcs: 0,
                    totalSubstations: 0,
                    totalFeeders: 0,
                    commMeters: 0,
                    nonCommMeters: 0,
                    totalDistricts: 0,
                    edcNames: Object.keys(parsedDemandData),
                    substationCount: {},
                    feederCount: {},
                    edcDemandData: parsedDemandData,
                };
            }
        }

        return {
            totalEdcs: 0,
            totalSubstations: 0,
            totalFeeders: 0,
            commMeters: 0,
            nonCommMeters: 0,
            totalDistricts: 0,
            edcNames: [],
            substationCount: {},
            feederCount: {},
            edcDemandData: {},
        };
    });
    const entityId = substationId;
    const edcIdentifier = edcId || edcs || edc;
    const isUserRoute = location.pathname.includes('/user/');

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get(
                    `/substations/graph/${entityId}/demand`
                );
                console.log('response', response);
                const data = response.data;
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching substation graph data:', error);
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
    useEffect(() => {
        const fetchData = async () => {
            try {
                const feederResponse = await apiClient.get(
                    `/substations/${substationId}/feeders`
                );
                const data = feederResponse.data;
                console.log('dataaa:', data);

                setWidgetsData((prev) => ({
                    ...prev,
                    feederNames: data.feeders.map((feeder) => feeder.name),
                    feeders: data.feeders,
                    feederCount: data.feeders?.length,
                    commMeters: data.commMeters,
                    nonCommMeters: data.nonCommMeters,
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
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

        fetchData();
    }, [edcs, substationId]);

    const substationName = entityId
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
        feederCount: widgetsData.feederCount,
        commMeters: widgetsData.commMeters,
        nonCommMeters: widgetsData.nonCommMeters,
        currentValue: 5.7,
        previousValue: 5.2,
    };

    const routePrefix = isUserRoute ? '/user' : '/admin';
    const feedersLink = region
        ? `${routePrefix}/${region}/${edcIdentifier}/substations/${substationId}/feeders`
        : `${routePrefix}/${edcIdentifier}/substations/${substationId}/feeders`;
    const edcLink = region
        ? `${routePrefix}/${region}/edcs/${edcIdentifier}/details`
        : `${routePrefix}/${edcIdentifier}/dashboard`;

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{substationName} Substation</h2>
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

            <SummarySection
                //widgetsData={widgetsData}
                widgetsData={{
                    totalFeeders: stats.feederCount,
                    commMeters: stats.commMeters,
                    nonCommMeters: stats.nonCommMeters,
                }}
                isUserRoute={location.pathname.includes('/user/')}
                isBiUserRoute={location.pathname.includes('/bi/user/')}
                showRegions={false}
                showEdcs={false}
                showMeters={false}
                showSubstations={false}
                showDistricts={false}
            />

            <div className={styles.detail_chart}>
                <DynamicGraph data={graphData} timeRange={timeRange} />
            </div>
        </div>
    );
};

export default EdcSubstationDetails;
