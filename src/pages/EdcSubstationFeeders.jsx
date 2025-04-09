import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
import ShortDetailsWidget from './ShortDetailsWidget';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { io } from 'socket.io-client';

const EdcSubstationFeeders = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);

    const { region, edcs, substationId } = useParams();
    const location = window.location.pathname;
    const isUserRoute = location.includes('/user/');

    const feederNames = [
        'Adyar Feeder 1',
        'Velachery Feeder 2',
        'T Nagar Feeder 3',
        'Mylapore Feeder 4',
        'Anna Nagar Feeder 5',
        'Porur Feeder 6',
        'Ambattur Feeder 7',
        'Perambur Feeder 8',
        'Guindy Feeder 9',
        'Kodambakkam Feeder 10',
        'Royapuram Feeder 11',
        'Thiruvanmiyur Feeder 12',
        'Kilpauk Feeder 13',
        'Egmore Feeder 14',
        'Nungambakkam Feeder 15',
    ];

    const feederMeterCounts = {
        'Adyar Feeder 1': 45,
        'Velachery Feeder 2': 38,
        'T Nagar Feeder 3': 42,
        'Mylapore Feeder 4': 35,
        'Anna Nagar Feeder 5': 40,
        'Porur Feeder 6': 32,
        'Ambattur Feeder 7': 36,
        'Perambur Feeder 8': 34,
        'Guindy Feeder 9': 41,
        'Kodambakkam Feeder 10': 37,
        'Royapuram Feeder 11': 33,
        'Thiruvanmiyur Feeder 12': 39,
        'Kilpauk Feeder 13': 35,
        'Egmore Feeder 14': 31,
        'Nungambakkam Feeder 15': 38,
    };

    const feederStats = {
        'Adyar Feeder 1': { currentValue: 850, previousValue: 780 },
        'Velachery Feeder 2': { currentValue: 720, previousValue: 680 },
        'T Nagar Feeder 3': { currentValue: 920, previousValue: 850 },
        'Mylapore Feeder 4': { currentValue: 780, previousValue: 720 },
        'Anna Nagar Feeder 5': { currentValue: 820, previousValue: 760 },
        'Porur Feeder 6': { currentValue: 680, previousValue: 620 },
        'Ambattur Feeder 7': { currentValue: 740, previousValue: 680 },
        'Perambur Feeder 8': { currentValue: 700, previousValue: 650 },
        'Guindy Feeder 9': { currentValue: 840, previousValue: 780 },
        'Kodambakkam Feeder 10': { currentValue: 760, previousValue: 700 },
        'Royapuram Feeder 11': { currentValue: 680, previousValue: 620 },
        'Thiruvanmiyur Feeder 12': { currentValue: 800, previousValue: 740 },
        'Kilpauk Feeder 13': { currentValue: 720, previousValue: 660 },
        'Egmore Feeder 14': { currentValue: 640, previousValue: 580 },
        'Nungambakkam Feeder 15': { currentValue: 780, previousValue: 720 },
    };

    const graphData = {
        daily: {
            xAxis: [
                '2025-03-16 23:59:59',
                '2025-03-16 08:30:00',
                '2025-03-16 08:15:00',
                '2025-03-16 08:00:00',
                '2025-03-16 07:45:00',
                '2025-03-16 07:30:00',
                '2025-03-16 07:15:00',
                '2025-03-16 07:00:00',
                '2025-03-16 06:45:00',
                '2025-03-16 06:30:00',
                '2025-03-16 06:15:00',
                '2025-03-16 06:00:00',
                '2025-03-16 05:45:00',
                '2025-03-16 05:30:00',
                '2025-03-16 05:15:00',
                '2025-03-16 05:00:00',
                '2025-03-16 04:45:00',
                '2025-03-16 04:30:00',
                '2025-03-16 04:15:00',
                '2025-03-16 04:00:00',
                '2025-03-16 03:45:00',
                '2025-03-16 03:30:00',
                '2025-03-16 03:15:00',
                '2025-03-16 03:00:00',
                '2025-03-16 02:45:00',
                '2025-03-16 02:30:00',
                '2025-03-16 02:15:00',
                '2025-03-16 02:00:00',
                '2025-03-16 01:45:00',
                '2025-03-16 01:30:00',
                '2025-03-16 01:15:00',
                '2025-03-16 01:00:00',
                '2025-03-16 00:45:00',
                '2025-03-16 00:30:00',
                '2025-03-16 00:15:00',
            ],
            series: [
                {
                    name: 'Current Day',
                    data: [
                        13.6, 12.0, 11.2, 11.2, 11.6, 10.4, 12.0, 10.8, 12.4,
                        12.0, 12.8, 13.6, 12.4, 13.6, 12.0, 13.6, 12.8, 13.2,
                        13.6, 12.4, 14.0, 12.4, 14.0, 12.4, 13.6, 12.8, 13.2,
                        14.0, 12.8, 14.0, 12.4, 13.6, 12.4, 13.6, 12.4,
                    ],
                },
                {
                    name: 'Previous Day',
                    data: [
                        13.2, 10.8, 10.0, 11.2, 10.8, 10.8, 11.6, 10.8, 12.0,
                        11.6, 13.2, 12.8, 13.2, 14.0, 12.8, 14.4, 13.2, 14.8,
                        13.6, 14.4, 14.8, 13.2, 14.8, 13.2, 14.4, 13.2, 14.4,
                        13.6, 13.6, 14.4, 13.2, 14.4, 12.8, 14.4, 12.8,
                    ],
                },
            ],
        },
    };

    const demoFeederDemandData = {};
    feederNames.forEach((feeder) => {
        demoFeederDemandData[feeder] = graphData.daily;
    });

    const [widgetsData, setWidgetsData] = useState(() => {
        const savedFeederData = localStorage.getItem('edcSubstationFeederData');
        const savedTimestamp = localStorage.getItem(
            'edcSubstationFeederDataTimestamp'
        );

        if (savedFeederData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedData = JSON.parse(savedFeederData);
                return {
                    totalRegions: 13,
                    totalEdcs: 95,
                    totalSubstations: 260,
                    totalFeeders: parsedData.feederNames?.length || 0,
                    commMeters: 942,
                    nonCommMeters: 301,
                    feederNames: parsedData.feederNames || [],
                    feederCount: parsedData.feederNames?.length || 0,
                    meterCount: parsedData.meterCount || {},
                    feederStats: parsedData.feederStats || {},
                    feederDemandData: parsedData.feederDemandData,
                    feederIds: {},
                };
            }
        }

        return {
            totalRegions: 13,
            totalEdcs: 95,
            totalSubstations: 260,
            totalFeeders: 416,
            commMeters: 942,
            nonCommMeters: 301,
            feederNames: [],
            feederCount: 0,
            meterCount: {},
            feederStats: {},
            feederDemandData: {},
            feederIds: [],
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {});

        newSocket.on('feederUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    feederDemandData: {
                        ...prevData.feederDemandData,
                        [data.feeder]: data.graphData,
                    },
                };

                const cacheData = {
                    feederNames: newData.feederNames,
                    meterCount: newData.meterCount,
                    feederStats: newData.feederStats,
                    feederDemandData: newData.feederDemandData,
                    feederIds: newData.feederIds,
                };

                localStorage.setItem(
                    'edcSubstationFeederData',
                    JSON.stringify(cacheData)
                );
                localStorage.setItem(
                    'edcSubstationFeederDataTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('edcSubstationFeederData');
                localStorage.removeItem('edcSubstationFeederDataTimestamp');
            }, 30000);
        });

        return () => {
            newSocket.close();
            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const feederResponse = await apiClient.get(
                    `/feeders/edc-substation/${edcs}/${substationId}`
                );
                const data = feederResponse.data;

                setWidgetsData((prev) => ({
                    ...prev,
                    feederNames: data.feederNames || feederNames,
                    feederCount: data.feederNames?.length || feederNames.length,
                    meterCount: data.meterCount || feederMeterCounts,
                    feederStats: data.feederStats || feederStats,
                    feederDemandData:
                        data.feederGraphData || demoFeederDemandData,
                    feederIds: data.feederIds || [],
                }));

                const cacheData = {
                    feederNames: data.feederNames || feederNames,
                    meterCount: data.meterCount || feederMeterCounts,
                    feederStats: data.feederStats || feederStats,
                    feederDemandData:
                        data.feederGraphData || demoFeederDemandData,
                    feederIds: data.feederIds || [],
                };

                localStorage.setItem(
                    'edcSubstationFeederData',
                    JSON.stringify(cacheData)
                );
                localStorage.setItem(
                    'edcSubstationFeederDataTimestamp',
                    Date.now().toString()
                );
            } catch (error) {
                console.error('Error fetching data:', error);
                setWidgetsData((prev) => ({
                    ...prev,
                    feederNames: feederNames,
                    feederCount: feederNames.length,
                    meterCount: feederMeterCounts,
                    feederStats: feederStats,
                    feederDemandData: demoFeederDemandData,
                }));
            }
        };

        fetchData();
    }, [edcs, substationId]);

    const substationName = substationId
        ? substationId
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
        : 'Unknown';

    const edcName = edcs
        ? edcs
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
        : 'Unknown';

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{substationName} Substation Feeders</h2>
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
                title="Total Feeders"
                value={widgetsData.feederCount}
                icon="icons/electric-meter.svg"
            />

            <div className={styles.widget_row_container}>
                {widgetsData.feederNames.map((feederName, index) => (
                    <div key={index} className={styles.widget_item}>
                        <ShortDetailsWidget
                            region={region}
                            edc={edcs}
                            name={feederName}
                            substationId={substationId}
                            edcCount={0}
                            substationCount={0}
                            feederCount={0}
                            currentValue={
                                widgetsData.feederStats[feederName]
                                    ?.currentValue || 0
                            }
                            previousValue={
                                widgetsData.feederStats[feederName]
                                    ?.previousValue || 0
                            }
                            pageType="feeders"
                            graphData={
                                widgetsData.feederDemandData[feederName] || {
                                    xAxis: [],
                                    series: [],
                                }
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EdcSubstationFeeders;
