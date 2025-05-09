import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
const nodeEnv = import.meta.env.VITE_NODE_ENV;
const socketPath = import.meta.env.VITE_SOCKET_PATH;
const devSocketPath = import.meta.env.VITE_DEV_SOCKET_PATH;

const EDCs = () => {
    const [timeframe, setTimeframe] = useState('Last 7 Days');
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const [dateRange, setDateRange] = useState({
        start: null,
        end: null,
    });
    const { region } = useParams();
    const location = useLocation();

    const isRegionUser =
        location.pathname.includes('/user/') ||
        (location.pathname.includes('/user/') &&
            !location.pathname.includes('/admin/'));

    const routePrefix = isRegionUser ? '/user' : '/admin';

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

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
            path: nodeEnv === 'development' ? devSocketPath : socketPath,
        });
        setSocket(newSocket);
        newSocket.on('edcUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    edcDemandData: {
                        ...prevData.edcDemandData,
                        [data.edc]: data.graphData,
                    },
                };
                localStorage.setItem(
                    'edcDemandData',
                    JSON.stringify(newData.edcDemandData)
                );
                localStorage.setItem(
                    'edcDemandTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('edcDemandData');
                localStorage.removeItem('edcDemandTimestamp');
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
        if (socket && widgetsData.edcNames.length > 0) {
            socket.emit('subscribeEdc', {
                edcs: widgetsData.edcNames,
            });
        }
    }, [widgetsData.edcNames, socket]);

    useEffect(() => {
        if (!region) return;

        const fetchEdcNames = async () => {
            try {
                const response = await apiClient.get(`/edcs/widgets/${region}`);
                const data = response;
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
                }));
            } catch (error) {
                console.error('Error fetching EDC names:', error);
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

        fetchEdcNames();
    }, [region]);

    const handleRegionClick = (region) => {
        setSelectedRegion(region);
    };

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    // Replace region data with EDC data
    const edcNames = [
        'Chennai North',
        'Chennai South',
        'Chennai Central',
        'Chennai West',
        'Coimbatore North',
        'Coimbatore South',
        'Madurai Urban',
        'Madurai Rural',
        'Trichy Urban',
        'Trichy Rural',
        'Thanjavur',
        'Villupuram',
        'Vellore',
        'Salem',
        'Erode',
    ];

    // EDC substation counts
    const edcSubstationCounts = {
        'Chennai North': 18,
        'Chennai South': 22,
        'Chennai Central': 20,
        'Chennai West': 15,
        'Coimbatore North': 16,
        'Coimbatore South': 19,
        'Madurai Urban': 17,
        'Madurai Rural': 14,
        'Trichy Urban': 15,
        'Trichy Rural': 13,
        Thanjavur: 16,
        Villupuram: 14,
        Vellore: 17,
        Salem: 18,
        Erode: 16,
    };

    // EDC feeder counts
    const edcFeederCounts = {
        'Chennai North': 35,
        'Chennai South': 42,
        'Chennai Central': 38,
        'Chennai West': 32,
        'Coimbatore North': 28,
        'Coimbatore South': 34,
        'Madurai Urban': 30,
        'Madurai Rural': 25,
        'Trichy Urban': 28,
        'Trichy Rural': 24,
        Thanjavur: 29,
        Villupuram: 26,
        Vellore: 31,
        Salem: 33,
        Erode: 29,
    };

    // EDC consumption stats
    const edcStats = {
        'Chennai North': { currentValue: 380, previousValue: 350 },
        'Chennai South': { currentValue: 420, previousValue: 390 },
        'Chennai Central': { currentValue: 390, previousValue: 360 },
        'Chennai West': { currentValue: 360, previousValue: 340 },
        'Coimbatore North': { currentValue: 340, previousValue: 310 },
        'Coimbatore South': { currentValue: 370, previousValue: 350 },
        'Madurai Urban': { currentValue: 350, previousValue: 320 },
        'Madurai Rural': { currentValue: 310, previousValue: 290 },
        'Trichy Urban': { currentValue: 330, previousValue: 300 },
        'Trichy Rural': { currentValue: 290, previousValue: 270 },
        Thanjavur: { currentValue: 320, previousValue: 300 },
        Villupuram: { currentValue: 300, previousValue: 280 },
        Vellore: { currentValue: 340, previousValue: 310 },
        Salem: { currentValue: 350, previousValue: 320 },
        Erode: { currentValue: 330, previousValue: 300 },
    };

    // Sample data for the LineChart
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

    // Build breadcrumb items based on current path
    const getBreadcrumbItems = () => {
        if (isRegionUser) {
            // For region user
            const formattedRegionName = region
                ? region
                      .split('-')
                      .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')
                : 'Unknown';

            const items = [
                { label: 'Dashboard', path: `${routePrefix}/dashboard` },
            ];

            if (region) {
                items.push({
                    label: 'Regions',
                    path: `${routePrefix}/regions`,
                });
                items.push({
                    label: formattedRegionName,
                    path: `${routePrefix}/${region}`,
                });
            }

            items.push({
                label: 'EDCs',
                path: region
                    ? `${routePrefix}/${region}/edcs`
                    : `${routePrefix}/edcs`,
            });

            return items;
        }
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">EDCs</h2>
            </div>
            <Breadcrumb items={getBreadcrumbItems()} />
            <div className={styles.summary_section}>
                <div className={styles.total_regions_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/office.svg"
                            alt="Total Regions"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link to={`${routePrefix}/regions`}>
                                    Regions
                                </Link>
                            </p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalRegions}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_edcs_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-edc.svg"
                            alt="Total Region"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link
                                    to={
                                        region
                                            ? `${routePrefix}/${region}/edcs`
                                            : `${routePrefix}/edcs`
                                    }>
                                    EDCs
                                </Link>
                            </p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalEdcs}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_substations_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-factory.svg"
                            alt="Total Substations"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link
                                    to={
                                        region
                                            ? `${routePrefix}/${region}/substations`
                                            : `${routePrefix}/substations`
                                    }>
                                    Substations
                                </Link>
                            </p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalSubstations}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_meters_container}>
                    <div className={styles.total_meters_main_info}>
                        <img
                            src="icons/electric-meter.svg"
                            alt="Total Meters"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_meters}>
                            <div className="title">
                                <Link
                                    to={
                                        region
                                            ? `${routePrefix}/${region}/feeders`
                                            : `${routePrefix}/feeders`
                                    }>
                                    Feeders
                                </Link>
                            </div>
                            <div className={styles.summary_value}>
                                {widgetsData.totalFeeders}
                            </div>
                        </div>
                    </div>
                    <div className={styles.metrics_communication_info}>
                        <div className="titles">Communication Status</div>
                        <div className={styles.overall_communication_status}>
                            <div
                                className={
                                    styles.communication_status_container
                                }>
                                <div className={styles.communication_value}>
                                    {widgetsData.commMeters}
                                </div>
                                <div
                                    className={
                                        styles.communication_positive_percentage
                                    }>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={
                                            styles.communication_positive_arrow
                                        }
                                    />
                                    {(
                                        (widgetsData.commMeters /
                                            (widgetsData.commMeters +
                                                widgetsData.nonCommMeters)) *
                                        100
                                    ).toFixed(1)}
                                    %
                                </div>
                            </div>
                            <div
                                className={
                                    styles.communication_status_container
                                }>
                                <div className={styles.communication_value}>
                                    {widgetsData.nonCommMeters}
                                </div>
                                <div
                                    className={
                                        styles.communication_negative_percentage
                                    }>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={
                                            styles.communication_negative_arrow
                                        }
                                    />
                                    {(
                                        (widgetsData.nonCommMeters /
                                            (widgetsData.commMeters +
                                                widgetsData.nonCommMeters)) *
                                        100
                                    ).toFixed(1)}
                                    %
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section_header}>
                <h2 className="title">
                    EDCs:{' '}
                    <span className={styles.region_count}>
                        [{widgetsData.regionEdcCount}]
                    </span>
                </h2>
            </div>
            <div className={styles.region_stats_container}>
                {widgetsData.edcNames && widgetsData.edcNames.length > 0 ? (
                    widgetsData.edcNames.map((edc, index) => (
                        <div
                            key={index}
                            className={styles.individual_region_stats}>
                            <ShortDetailsWidget
                                region={edc}
                                substationCount={
                                    widgetsData.substationCount?.[edc] || 0
                                }
                                edcCount={widgetsData.edcNames.length}
                                feederCount={
                                    widgetsData.feederCount?.[edc] || 0
                                }
                                currentValue={
                                    edcStats?.[edc]?.currentValue || 0
                                }
                                previousValue={
                                    edcStats?.[edc]?.previousValue || 0
                                }
                                graphData={
                                    widgetsData.edcDemandData?.[edc.trim()] ?? {
                                        xAxis: [],
                                        series: [],
                                    }
                                }
                                pageType="edcs"
                                showInfoIcon={true}
                            />
                        </div>
                    ))
                ) : (
                    <p>No EDCs available for this region.</p>
                )}
            </div>
        </div>
    );
};

export default EDCs;
