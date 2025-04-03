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
    const currentBaseRoute = isRegionUser
        ? location.pathname.includes('/user/')
            ? '/user'
            : '/user'
        : location.pathname.includes('/user/')
        ? '/user'
        : '/admin';

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
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

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
        console.log('region', region);
        if (!region) return;

        const fetchEdcNames = async () => {
            try {
                const response = await apiClient.get(`/edcs/widgets/${region}`);
                const data = response;
                console.log('Fetched EDC data:', data); // Log to check response
                const edcSubstationCounts =
                    data.data?.substationCounts?.reduce((acc, edc) => {
                        acc[edc.edc_name] = edc.substation_count;
                        return acc;
                    }, {}) || {};

                setWidgetsData((prev) => ({
                    ...prev,
                    edcNames: data.data?.edcNames || [],
                    regionEdcCount: data.data?.edcNames?.length || 0,
                    substationNames: data.data?.substationNames || [], // Added line
                    // regionSubstationCount:
                    //     data.data?.substationNames?.length || 0, // Added line
                    //SubstationCount: data.data?.substationCounts || [],
                    substationCount: edcSubstationCounts,
                    //feederCount: edcFeederCounts, // Store feeder count
                    feederCount: data.data?.feederCounts || {},
                }));
            } catch (error) {
                console.error('Error fetching EDC names:', error);
                console.error('Error fetching EDC names:', error);
            }
        };

        fetchEdcNames();
    }, [region]);

    console.log('widgetsData', widgetsData);

    const handleRegionClick = (region) => {
        setSelectedRegion(region); // Set region when clicked
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
        if (isRegionUser && region) {
            // Format region name with first letter capitalized
            const formattedRegionName =
                region.charAt(0).toUpperCase() + region.slice(1);

            // Region user breadcrumb - showing only Dashboard -> Region -> EDCs
            return [
                { label: 'Dashboard', path: '/user/dashboard' },
                {
                    label: `Region : ${formattedRegionName}`,
                    path: `/user/${region}/dashboard`,
                },
                { label: 'EDCs', path: `/user/${region}/edcs` },
            ];
        } else {
            // Standard admin or user breadcrumb
            const items = [
                { label: 'Dashboard', path: `${currentBaseRoute}/dashboard` },
            ];

            if (region) {
                items.push({
                    label: 'Regions',
                    path: `${currentBaseRoute}/regions`,
                });
                items.push({
                    label: region.charAt(0).toUpperCase() + region.slice(1),
                    path: `${currentBaseRoute}/${region}`,
                });
            }

            items.push({
                label: 'EDCs',
                path: region
                    ? `${currentBaseRoute}/${region}/edcs`
                    : `${currentBaseRoute}/edcs`,
            });

            return items;
        }
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">EDCs</h2>
                <div className={styles.action_container}>
                    <div className={styles.action_cont}>
                        <div className={styles.time_range_select_dropdown}>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={styles.time_range_select}>
                                <option value="Last30days">Last 30 Days</option>
                                <option value="Daily">Daily</option>
                                <option value="Monthly">Monthly</option>
                                <option value="PreviousMonth">Last Week</option>
                                <option value="Year">Year</option>
                            </select>
                            <img
                                src="icons/arrow-down.svg"
                                alt="Select Time"
                                className={styles.time_range_select_dropdown_icon}
                            />
                        </div>
                        {/* <Buttons
                            label="Get Reports"
                            variant="primary"
                            alt="GetReports"
                            icon="icons/reports.svg"
                            iconPosition="left"
                        /> */}
                    </div>
                </div>
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
                                <Link to={`${currentBaseRoute}/regions`}>
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
                                            ? `${currentBaseRoute}/${region}/edcs`
                                            : `${currentBaseRoute}/edcs`
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
                                            ? `${currentBaseRoute}/${region}/substations`
                                            : `${currentBaseRoute}/substations`
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
                                            ? `${currentBaseRoute}/${region}/feeders`
                                            : `${currentBaseRoute}/feeders`
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
                                    87%
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
                                    13%
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
                                // feederCount={edcFeederCounts?.[edc] || 0}
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
