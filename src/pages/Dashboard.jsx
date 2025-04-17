import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection/SummarySection';
import { apiClient } from '../api/client';
import useWebSocket from '../hooks/useWebSocket';

const Dashboard = () => {
    const { region } = useParams();

    const location = window.location.pathname;
    const isUserRoute = location.includes('/user/');
    const isBiUserRoute = location.includes('/exedb/user/');

    const [timeRange, setTimeRange] = useState('Daily');
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });
    const [widgetsData, setWidgetsData] = useState({
        totalRegions: 0,
        totalEdcs: 0,
        totalSubstations: 0,
        totalFeeders: 0,
        commMeters: 0,
        nonCommMeters: 0,
        totalDistricts: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiClient.get('/regions/widgets');
            const data = response.data;
            setWidgetsData((prev) => ({
                ...prev,
                totalRegions: data.totalRegions || prev.totalRegions,
                totalEdcs: data.totalEdcs || prev.totalEdcs,
                totalSubstations:
                    data.totalSubstations || prev.totalSubstations,
                totalFeeders: data.totalFeeders || prev.totalFeeders,
                commMeters: data.commMeters || prev.commMeters,
                nonCommMeters: data.nonCommMeters || prev.nonCommMeters,
                totalDistricts: data.totalDistricts || prev.totalDistricts,
            }));
        };
        fetchData();
        console.log()
    }, []);

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get('/regions/graph/demand');
                const data = response.data;
                setGraphData({
                    xAxis: data.xAxis || [],
                    series: data.series || [],
                });
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
    }, [timeRange]);

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">Dashboard</h2>
                
            </div>

            <Breadcrumb
                items={[
                    {
                        label: 'Dashboard',
                        path:
                            region && region !== 'undefined'
                                ? isBiUserRoute
                                    ? `/exedb/user/${region}/dashboard`
                                    : isUserRoute
                                    ? `/user/${region}/dashboard`
                                    : `/admin/${region}/dashboard`
                                : isBiUserRoute
                                ? `/exedb/user/dashboard`
                                : isUserRoute
                                ? `/user/dashboard`
                                : `/admin/dashboard`,
                    },
                ]}
            />

            <SummarySection
                widgetsData={widgetsData}
                isUserRoute={isUserRoute}
                isBiUserRoute={isBiUserRoute}
                showDistricts={true}
                showMaxDemand={false}
            />

            <div className={styles.detail_chart}>
                <DynamicGraph
                    title="Demand Trend"
                    data={graphData}
                    seriesColors={['#3f68b2', '#ed8c22']}
                    yAxisLabel="MW"
                    showLabel={false}
                    toolbox={true}
                    height="410px"
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                />
            </div>
        </div>
    );
};

export default Dashboard;
