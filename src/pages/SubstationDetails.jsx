import styles from '../styles/LongDetailsWidget.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';
import SummarySection from '../components/SummarySection';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import { useAuth } from '../components/AuthProvider';
const SubstationDetails = () => {
    const { region, substationId } = useParams();
    const navigate = useNavigate();
    const { isRegion, isAdmin } = useAuth();
    const regionUser = isRegion();
    const adminUser = isAdmin();
    const [timeRange, setTimeRange] = useState('Daily');
    const [selectedDate, setSelectedDate] = useState(new Date());
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
    const entityId = substationId;

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const formatDate = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day} 00:00:00`;
                };

                const formattedDate = selectedDate ? formatDate(selectedDate) : formatDate(new Date());
                const response = await apiClient.get(
                    `/substations/graph/${entityId}/demand/${formattedDate}`
                );
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
    }, [entityId, timeRange,selectedDate]);

    const entityName = entityId
        ? entityId
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
        : 'Unknown';

    useEffect(() => {
        const fetchFeeders = async () => {
            try {
                try {
                    const response = await apiClient.get(
                        `/substations/${substationId}/feeders`
                    );
                    const feedersData = response.data.feeders || [];
                    const commMeters = response.data.commMeters || 0;
                    const nonCommMeters = response.data.nonCommMeters || 0;

                    setWidgetsData((prev) => {
                        const newData = {
                            ...prev,
                            commMeters: commMeters,
                            nonCommMeters: nonCommMeters,
                            feederNames: feedersData.map((f) => f.name) || [],
                            feederCount: feedersData.length || 0,
                            totalFeeders: feedersData.length || 0,
                            meterCount: feedersData.reduce((acc, f) => {
                                acc[f.name] = f.meter_count || 0;
                                return acc;
                            }, {}),
                            feederStats: feedersData.reduce((acc, f) => {
                                acc[f.name] = {
                                    currentValue: f.current_value || 0,
                                    previousValue: f.previous_value || 0,
                                };
                                return acc;
                            }, {}),
                            feederIds:
                                feedersData.map((feeder) => ({
                                    [feeder.name]: feeder.id,
                                })) || [],
                        };

                        const cacheData = {
                            feederNames: newData.feederNames,
                            meterCount: newData.meterCount,
                            feederStats: newData.feederStats,
                            feederDemandData: newData.feederDemandData,
                            feederIds: newData.feederIds,
                        };

                        localStorage.setItem(
                            'substationFeederData',
                            JSON.stringify(cacheData)
                        );
                        localStorage.setItem(
                            'substationFeederDataTimestamp',
                            Date.now().toString()
                        );

                        return newData;
                    });
                } catch (error) {
                    console.error(
                        'API error, using demo data for feeders:',
                        error
                    );
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
            } catch (error) {
                console.error('Error fetching feeders for substation:', error);
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

        if (substationId) {
            fetchFeeders();
        }
    }, [substationId]);

    const stats = {
        feederCount: 20,
        currentValue: 8.5,
        previousValue: 7.9,
    };

    const handleFeederClick = () => {
        if (regionUser && substationId) {
            navigate(`/user/region/substations/${substationId}/feeders`);
        } else if (adminUser && region && substationId) {
            navigate(`/admin/${region}/substations/${substationId}/feeders`);
        }
    };
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className={styles.main_content}>
            <SectionHeader title={`${entityName} Substation`} />
            <Breadcrumb />
            <SummarySection
                widgetsData={{
                    totalRegions: 0,
                    totalEdcs: stats.edcCount,
                    totalSubstations: stats.substationCount,
                    totalFeeders: widgetsData.feederCount,
                    commMeters: widgetsData.commMeters,
                    nonCommMeters: widgetsData.nonCommMeters,
                    totalDistricts: stats.edcCount || 0,
                }}
                isUserRoute={false}
                isBiUserRoute={false}
                isRegion={isRegion()}
                isAdmin={isAdmin()}
                showRegions={false}
                showEdcs={false}
                showSubstations={false}
                showDistricts={false}
                showMeters={true}
                showFeeders={true}
                onFeederClick={
                    regionUser
                        ? handleFeederClick
                        : adminUser
                        ? handleFeederClick
                        : null
                }
            />

            <div className={styles.chart_container}>
            <DynamicGraph 
                    data={graphData} 
                    timeRange={timeRange} 
                    onDateChange={handleDateChange}
                    selectedDate={selectedDate}
                />            </div>
        </div>
    );
};

export default SubstationDetails;
