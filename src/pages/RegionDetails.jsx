import styles from '../styles/LongDetailsWidget.module.css';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import SummarySection from '../components/SummarySection';

const RegionDetails = () => {
    const { region } = useParams();
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
                console.error('Error fetching region graph data:', error);
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
        edcCount: 8,
        substationCount: 25,
        feederCount: 45,
        currentValue: 13.6,
        previousValue: 12.8,
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{entityName} Region</h2>
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
                    totalRegions: 0,
                    totalEdcs: stats.edcCount,
                    totalSubstations: stats.substationCount,
                    totalFeeders: stats.feederCount,
                    commMeters: 0,
                    nonCommMeters: 0,
                    totalDistricts: stats.edcCount || 0
                }}
                isUserRoute={false}
                isBiUserRoute={false}
                showRegions={false}
                showEdcs={true}
                showSubstations={true}
                showDistricts={true}
            />

            <div className={styles.chart_container}>
                <DynamicGraph data={graphData} timeRange={timeRange} />
            </div>
        </div>
    );
};

export default RegionDetails;
