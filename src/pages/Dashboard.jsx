import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection/SummarySection';
import { apiClient } from '../api/client';
import { io } from 'socket.io-client';

const nodeEnv = import.meta.env.VITE_NODE_ENV;
const socketPath = import.meta.env.VITE_SOCKET_PATH;
const devSocketPath = import.meta.env.VITE_DEV_SOCKET_PATH;

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00`;
};

const Dashboard = () => {
    const { region } = useParams();

    const location = window.location.pathname;
    const isUserRoute = location.includes('/user/');
    const isBiUserRoute = location.includes('/exedb/user/');
    const [timeRange, setTimeRange] = useState('Daily');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
        Demand: 0,
    });
    const [socket, setSocket] = useState(null);
    const [widgetsData, setWidgetsData] = useState({
        totalRegions: 0,
        totalEdcs: 0,
        totalSubstations: 0,
        totalFeeders: 0,
        commMeters: 0,
        nonCommMeters: 0,
        totalDistricts: 0,
        Demand: graphData.Demand,
        DemandUnit: 'MW',
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
    }, []);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
            path: nodeEnv === 'development' ? devSocketPath : socketPath,
        });
        setSocket(newSocket);

        // Handle data reception
        // newSocket.on('demandUpdate', (data) => {
        //     setGraphData({
        //         xAxis: data.xAxis || [],
        //         series: data.series || [],
        //     });
        // });
        newSocket.on('demandUpdate', (data) => {
            const lastDemandValue =
                data.series?.[0]?.data?.length > 0
                    ? parseFloat(
                          data.series[0].data[
                              data.series[0].data.length - 1
                          ].toFixed(1)
                      )
                    : 0;

            setGraphData({
                xAxis: data.xAxis || [],
                series: data.series || [],
                Demand: lastDemandValue,
            });

            // 👉 Update the widget demand value
            setWidgetsData((prev) => ({
                ...prev,
                Demand: lastDemandValue,
            }));
        });

        newSocket.on('error', (error) => {
            console.error('WebSocket error:', error.message);
        });

        // Emit data on initial connection and when selectedDate changes
        const emitDemand = () => {
            const formattedDate = formatDate(selectedDate);
            newSocket.emit('subscribeDemand', {
                regionId: region || 'main',
                date: formattedDate,
            });
        };

        // Emit on connect and when selectedDate changes
        newSocket.on('connect', emitDemand);
        emitDemand(); // Emit demand for the first time after connection

        return () => {
            if (newSocket.demandIntervalId) {
                clearInterval(newSocket.demandIntervalId);
            }
            newSocket.close();
        };
    }, [region, selectedDate]); // Only trigger when region or selectedDate changes

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
                showDemand={true}
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
                    selectedDate={selectedDate}
                    onTimeRangeChange={setTimeRange}
                    onDateChange={setSelectedDate} // Pass the date change handler
                />
            </div>
        </div>
    );
};

export default Dashboard;
