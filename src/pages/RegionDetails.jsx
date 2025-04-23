import styles from '../styles/LongDetailsWidget.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import SummarySection from '../components/SummarySection';
import { useAuth } from '../components/AuthProvider';
const RegionDetails = () => {
    const { region: regionParam } = useParams();
    const { user, isRegion } = useAuth();
    const regionName = isRegion() && user?.name ? user.name : regionParam;
    const [timeRange, setTimeRange] = useState('Daily');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });
    const [demand, setDemand] = useState(0);
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

    const entityId = regionName;
    const entityName = regionName?.replace('_REG', '').toLowerCase();
    const capitalizedEntityName =
        entityName.charAt(0).toUpperCase() + entityName.slice(1);

    const navigate = useNavigate();
    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const formatDate = (date) => {
                    const year = date.getFullYear();

                    const month = String(date.getMonth() + 1).padStart(2, '0');

                    const day = String(date.getDate()).padStart(2, '0');

                    return `${year}-${month}-${day} 00:00:00`;
                };

                const formattedDate = selectedDate
                    ? formatDate(selectedDate)
                    : formatDate(new Date());
                const response = await apiClient.get(
                    `/regions/graph/${entityId}/demand/${formattedDate}`
                );
                const data = response.data;
                if (
                    data?.series?.length > 0 &&
                    data.series[0]?.data?.length > 0
                ) {
                    const latestCurrentDayValue =
                        data.series[0].data[data.series[0].data.length - 1];
                    setDemand(latestCurrentDayValue);
                    console.log('Latest Demand:', latestCurrentDayValue); // ✅ Here's your latest value!
                }
                setGraphData(data);
            } catch (error) {
                console.error('Error fetching region graph data:', error);
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
    }, [entityId, timeRange, selectedDate]);
    useEffect(() => {
        const fetchEdcs = async () => {
            try {
                const response = await apiClient.get(
                    `/edcs/widgets/${entityName}`
                );
                const data = response.data || {};
                const transformedData = {
                    totalEdcs: data.edcNames?.length || 0,
                    totalSubstations:
                        data.substationCounts?.reduce(
                            (sum, item) => sum + (item.substation_count || 0),
                            0
                        ) || 0,
                    totalFeeders: Object.values(data.feederCounts || {}).reduce(
                        (sum, count) => sum + (count || 0),
                        0
                    ),
                    commMeters: data.commMeters || 0,
                    nonCommMeters: data.nonCommMeters || 0,
                    totalDistricts: data.regionDistricts || 0,
                    edcNames: data.edcNames || [],
                    substationCount:
                        data.substationCounts?.reduce((acc, item) => {
                            acc[item.edc_name] = item.substation_count || 0;
                            return acc;
                        }, {}) || {},
                    feederCount: data.feederCounts || {},
                    edcDemandData: widgetsData.edcDemandData || {},
                };

                setWidgetsData(transformedData);
            } catch (error) {
                console.error('Error fetching EDCs for region:', error);
            }
        };
        fetchEdcs();
    }, [entityId]);

    const stats = {
        edcCount: widgetsData.totalEdcs || 0,
        substationCount:
            Object.values(widgetsData.substationCount).reduce(
                (sum, count) => sum + count,
                0
            ) || 0,
        feederCount:
            Object.values(widgetsData.feederCount).reduce(
                (sum, count) => sum + count,
                0
            ) || 0,
        commMeters: widgetsData.commMeters || 0,
        nonCommMeters: widgetsData.nonCommMeters || 0,
    };
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{capitalizedEntityName} Region</h2>
            </div>
            <Breadcrumb
                items={[
                    {
                        label: 'Dashboard',
                        path: isRegion()
                            ? '/user/region/dashboard'
                            : `/admin/${regionParam}/dashboard`,
                    },
                ]}
            />

            <SummarySection
                widgetsData={{
                    totalRegions: 0,
                    totalEdcs: stats.edcCount,
                    totalSubstations: stats.substationCount,
                    totalFeeders: stats.feederCount,
                    commMeters: stats.commMeters,
                    nonCommMeters: stats.nonCommMeters,
                    totalDistricts: stats.edcCount || 0,
                    Demand: demand,
                    DemandUnit: 'MW',
                }}
                isUserRoute={isRegion()}
                isBiUserRoute={false}
                showRegions={false}
                showEdcs={true}
                showSubstations={true}
                showDistricts={true}
                showMeters={true}
                showFeeders={true}
                onEdcClick={() => {
                    if (isRegion()) {
                        navigate('/user/region/edcs');
                    }
                }}
                onSubstationClick={() => {
                    if (isRegion()) {
                        navigate('/user/region/substations');
                    }
                }}
                onFeederClick={() => {
                    if (isRegion()) {
                        navigate('/user/region/feeders');
                    }
                }}
                showDemand={true}
            />
            <div className={styles.chart_container}>
                <DynamicGraph
                    data={graphData}
                    timeRange={timeRange}
                    onDateChange={handleDateChange}
                    selectedDate={selectedDate}
                />
            </div>
        </div>
    );
};

export default RegionDetails;
