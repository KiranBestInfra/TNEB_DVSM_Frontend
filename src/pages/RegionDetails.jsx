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
                    edcNames: Object.keys(parsedDemandData),
                    regionEdcCount: 0,
                    substationCount: {},
                    feederCount: {},
                    edcDemandData: parsedDemandData,
                };
            }
        }

        return {
            totalRegions: 0,
            totalEdcs: 0,
            totalSubstations: 0,
            totalFeeders: 0,
            commMeters: 0,
            nonCommMeters: 0,
            edcNames: [],
            substationCount: {},
            feederCount: {},
            regionEdcCount: 0,
            edcDemandData: {},
        };
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

        useEffect(() => {
            if (!region) return;
    
            const fetchEdcNames = async () => {
                try {
                    const response = await apiClient.get(`/edcs/widgets/${region}`);
                    const data = response;
                    console.log('dataaa:',data)
                    const edcSubstationCounts =
                        data.data?.substationCounts?.reduce((acc, edc) => {
                            acc[edc.edc_name] = edc.substation_count;
                            return acc;
                        }, {}) || {};
    
                    setWidgetsData((prev) => ({
                        ...prev,
                        edcNames: data.data?.edcNames || [],
                        regionEdcCount: data.data?.edcNames?.length || 0,
                        substationNames: data.data?.substationNames || [],
                        substationCount: edcSubstationCounts,
                        feederCount: data.data?.feederCounts || {},
                        commMeters: data.data?.commMeters || 0,
                        nonCommMeters: data.data?.nonCommMeters || 0
                    }));
                } catch (error) {
                    console.error('Error fetching EDC names:', error);
                }
            };
    
            fetchEdcNames();
        }, [region]);

        useEffect(() => {
            console.log('Updated widgetsData:', widgetsData);
        }, [widgetsData]);

    const stats = {
        edcCount: widgetsData.regionEdcCount || 0,
        substationCount: Object.values(widgetsData.substationCount).reduce((sum, count) => sum + count, 0) || 0,
        feederCount: Object.values(widgetsData.feederCount).reduce((sum, count) => sum + count, 0) || 0,
        //currentValue: 13.6,
        //previousValue: 12.8,
        commMeters: widgetsData.commMeters || 0,
        nonCommMeters: widgetsData.nonCommMeters || 0
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
                    commMeters: stats.commMeters,
                    nonCommMeters: stats.nonCommMeters,
                    totalDistricts: stats.edcCount || 0
                }}
                isUserRoute={false}
                isBiUserRoute={false}
                showRegions={false}
                showEdcs={true}
                showSubstations={true}
                showDistricts={true}
                showMeters={true}
            />

            <div className={styles.chart_container}>
                <DynamicGraph data={graphData} timeRange={timeRange} />
            </div>
        </div>
    );
};

export default RegionDetails;
