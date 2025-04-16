import styles from '../styles/LongDetailsWidget.module.css';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Buttons from '../components/ui/Buttons/Buttons';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';
import SummarySection from '../components/SummarySection';
import { useAuth } from '../components/AuthProvider';

const EdcDetails = () => {
    const { region, edcId } = useParams();
    const { isRegion } = useAuth();
    const regionUser = isRegion();
    const [timeRange, setTimeRange] = useState('Daily');
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });
    const [widgetsData, setWidgetsData] = useState(() => {
        const savedDemandData = localStorage.getItem('edcDemandData');
        const savedTimestamp = localStorage.getItem('edcDemandTimestamp');

        if (savedDemandData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedDemandData = JSON.parse(savedDemandData);
                return {
                    totalRegions: 0,
                    totalEdcs: 0,
                    totalSubstations: 0,
                    totalFeeders: 0,
                    commMeters: 0,
                    nonCommMeters: 0,
                    edcSubstationCount: 0,
                    edcFeederCount: parsedData.feederCount || 0,
                    edcNames: Object.keys(parsedDemandData),
                    regionEdcCount: 0,
                    substationCount: {},
                    feederCount: {},
                    edcDemandData: parsedDemandData,
                    districtcounts: 0,
                };
            }
        }

        return {
            totalRegions: 0,
            districtcounts: 0,
            totalEdcs: 0,
            totalSubstations: 0,
            totalFeeders: 0,
            edcSubstationCount: 0,
            commMeters: 0,
            nonCommMeters: 0,
            edcFeederCount: 0,
            edcNames: [],
            substationCount: {},
            feederCount: {},
            regionEdcCount: 0,
            edcDemandData: {},
        };
    });

    const entityId = regionUser ? edcId : edcId;
    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get(
                    `/edcs/graph/${entityId}/demand`
                );
                const data = response.data;
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching edc graph data:', error);
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

    useEffect(() => {
        if (!edcId) return;

        const fetchEdcWidgets = async () => {
            try {
                const response = await apiClient.get(`/edcs/${edcId}/widgets`);
                const feederCount =
                    response?.data?.regionFeederNames?.length || 0;
                setWidgetsData((prev) => ({
                    ...prev,
                    commMeters: response?.data?.commMeters || 0,
                    nonCommMeters: response?.data?.nonCommMeters || 0,
                    edcSubstationCount: response?.data?.substationCounts || 0,
                    edcFeederCount: feederCount,
                    districtcounts: response.data?.districtCounts || 0,
                }));
            } catch (error) {
                console.error('Error fetching EDC widgets:', error);
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

        fetchEdcWidgets();
    }, [edcId]);

    const stats = {
        substationCount: widgetsData.edcSubstationCount,
        feederCount: widgetsData.edcFeederCount,
        currentValue: 10.2,
        previousValue: 9.8,
        districtcounts: widgetsData.districtcounts,
        commMeters: widgetsData.commMeters || 0,
        nonCommMeters: widgetsData.nonCommMeters || 0,
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{entityName} EDC</h2>
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
                widgetsData={{
                    totalDistricts: stats.districtcounts,
                    totalSubstations: stats.substationCount,
                    totalFeeders: stats.feederCount,
                    commMeters: stats.commMeters,
                    nonCommMeters: stats.nonCommMeters,
                }}
                // isUserRoute={location.includes("/user/")}
                // isBiUserRoute={location.includes("/bi/user/")}
                showDistricts={true}
                showFeeders={true}
                showEdcs={false}
                showSubstations={true}
                showRegions={false}
            />

            <div className={styles.chart_container}>
                <DynamicGraph data={graphData} timeRange={timeRange} />
            </div>
        </div>
    );
};

export default EdcDetails;
