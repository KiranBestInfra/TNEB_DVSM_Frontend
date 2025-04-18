import styles from '../styles/LongDetailsWidget.module.css';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import SummarySection from '../components/SummarySection';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import { useAuth } from '../components/AuthProvider';

const EdcSubstationDetails = () => {
    const { region, edc, edcId, edcs, substationId } = useParams();
    const { isRegion, isCircle, isSubstation } = useAuth();
    const circleUser = isCircle();
    const navigate = useNavigate();
    const location = useLocation();
    const regionUser = isRegion();
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
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/substations/graph/${entityId}/demand`
                );
                const data = response.data;
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching substation graph data:', error);
                setError('Failed to load graph data');
                try {
                    await apiClient.post('/log/error', {
                        message: error.message,
                        stack: error.stack || 'No stack trace',
                        time: new Date().toISOString(),
                    });
                } catch (logError) {
                    console.error('Error logging to backend:', logError);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchGraphData();
    }, [entityId, timeRange]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const feederResponse = await apiClient.get(
                    `/substations/${substationId}/feeders`
                );
                const data = feederResponse.data;

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
                setError('Failed to load feeder data');
                try {
                    await apiClient.post('/log/error', {
                        message: error.message,
                        stack: error.stack || 'No stack trace',
                        time: new Date().toISOString(),
                    });
                } catch (logError) {
                    console.error('Error logging to backend:', logError);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [edcs, substationId]);

    const handleSubstationFeederClick = () => {
        if (circleUser && edcIdentifier && substationId) {
            navigate(
                `/user/edc/${edcIdentifier}/substations/${substationId}/feeders`
            );
        }
    };

    const handleFeederClick = () => {
        if (regionUser && substationId) {
            navigate(`/user/region/substations/${substationId}/feeders`);
        }
    };

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
            <SectionHeader title={`${substationName} Substation`} />
            <Breadcrumb />

            <SummarySection
                widgetsData={{
                    totalFeeders: stats.feederCount,
                    commMeters: stats.commMeters,
                    nonCommMeters: stats.nonCommMeters,
                }}
                // isUserRoute={location.pathname.includes('/user/')}
                // isBiUserRoute={location.pathname.includes('/bi/user/')}
                isUserRoute={isCircle()}
                showRegions={false}
                showEdcs={false}
                showMeters={false}
                showSubstations={false}
                showDistricts={false}
                showFeeders={true}
                onFeederClick={
                    regionUser
                        ? handleFeederClick
                        : circleUser
                        ? handleSubstationFeederClick
                        : null
                }

                // onFeederClick={() => {
                //     if (isCircle()) {
                //         navigate(`/user/edc/${edcId}/substations/${substationId}/feeders`);
                //     }
                // }}
            />

            <div className={styles.detail_chart}>
                <DynamicGraph data={graphData} timeRange={timeRange} />
            </div>
        </div>
    );
};

export default EdcSubstationDetails;
