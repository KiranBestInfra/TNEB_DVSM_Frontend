import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';

const Regions = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('Daily');
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const [widgetsData, setWidgetsData] = useState(() => {
        const savedDemandData = localStorage.getItem('regionDemandData');
        const savedTimestamp = localStorage.getItem('regionDemandTimestamp');
        console.log('savedDemandData', savedDemandData);

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
                    prevCommMeters: 0,
                    nonCommMeters: 0,
                    regionNames: Object.keys(parsedDemandData),
                    edcCount: {},
                    substationCount: {},
                    feederCount: {},
                    regionDemandData: parsedDemandData,
                    regionStats: {},
                };
            }
        }

        return {
            totalRegions: 0,
            totalEdcs: 0,
            totalSubstations: 0,
            totalFeeders: 0,
            commMeters: 0,
            prevCommMeters: 0,
            nonCommMeters: 0,
            regionNames: [],
            edcCount: {},
            substationCount: {},
            feederCount: {},
            regionDemandData: {},
            regionStats: {},
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('regionUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    regionDemandData: {
                        ...prevData.regionDemandData,
                        [data.region]: data.graphData,
                    },
                };
                localStorage.setItem(
                    'regionDemandData',
                    JSON.stringify(newData.regionDemandData)
                );
                localStorage.setItem(
                    'regionDemandTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('regionDemandData');
                localStorage.removeItem('regionDemandTimestamp');
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
        if (socket && widgetsData.regionNames.length > 0) {
            socket.emit('subscribe', {
                regions: widgetsData.regionNames,
            });
        }
    }, [widgetsData.regionNames, socket]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiClient.get('/regions/widgets');
            const data = response.data;

            setWidgetsData((prev) => ({
                totalRegions: data.totalRegions || prev.totalRegions,
                totalEdcs: data.totalEdcs || prev.totalEdcs,
                totalSubstations:
                    data.totalSubstations || prev.totalSubstations,
                totalFeeders: data.totalFeeders || prev.totalFeeders,
                commMeters: data.commMeters || prev.commMeters,
                prevCommMeters: data.prevCommMeters || prev.prevCommMeters,
                nonCommMeters: data.nonCommMeters || prev.nonCommMeters,
                regionNames: data.regionNames || prev.regionNames,
                edcCount: data.regionEdcCounts || prev.edcCount,
                substationCount:
                    data.regionSubstationCounts || prev.substationCount,
                feederCount: data.regionFeederCounts || prev.feederCount,
                //   regionDemandData: prev.regionDemandData,
                // regionStats: prev.regionStats,
            }));
        };

        fetchData();
    }, []);

    const handleRegionClick = (region) => {
        navigate(
            `/admin/regions/${region
                .toLowerCase()
                .replace(/\s+/g, '-')}/details`
        );
    };

    const isRegionUser =
        location.pathname.includes('/user/') ||
        (location.pathname.includes('/user/') &&
            !location.pathname.includes('/admin/'));
    const currentRegionName = isRegionUser
        ? location.pathname.split('/').filter((x) => x)[1] || ''
        : '';
    const baseRoute = location.pathname.includes('/user/')
        ? '/user'
        : location.pathname.includes('/user/')
        ? '/user'
        : '/admin';

    const handleEdcClick = () => {
        if (isRegionUser && currentRegionName) {
            navigate(`${baseRoute}/${currentRegionName}/edcs`);
        }
    };

    const handleSubstationClick = () => {
        if (isRegionUser && currentRegionName) {
            navigate(`${baseRoute}/${currentRegionName}/substations`);
        }
    };

    const getBreadcrumbItems = () => {
        if (isRegionUser) {
            // Region user breadcrumb - showing only Dashboard -> Region
            return [
                { label: 'Dashboard', path: '/user/dashboard' },
                { label: 'Regions', path: '/user/regions' },
            ];
        } else {
            // Standard admin or user breadcrumb
            return [
                { label: 'Dashboard', path: `${baseRoute}/dashboard` },
                { label: 'Regions', path: `${baseRoute}/regions` },
            ];
        }
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">Regions</h2>
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
                        <Buttons
                            label="Get Reports"
                            variant="primary"
                            alt="GetReports"
                            icon="icons/reports.svg"
                            iconPosition="left"
                        />
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
                            <p className="title">Regions</p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalRegions}
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={styles.total_edcs_container}
                    onClick={handleEdcClick}
                    style={isRegionUser ? { cursor: 'pointer' } : {}}
                    title={isRegionUser ? 'Click to view EDCs' : ''}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-edc.svg"
                            alt="Total EDCs"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                {isRegionUser ? (
                                    <span
                                        style={{ color: 'var(--brand-blue)' }}>
                                        EDCs{' '}
                                        {isRegionUser && (
                                            <span
                                                style={{ fontSize: '0.8rem' }}>
                                                🔗
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    'EDCs'
                                )}
                            </p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalEdcs}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={styles.total_substations_container}
                    onClick={handleSubstationClick}
                    style={isRegionUser ? { cursor: 'pointer' } : {}}
                    title={isRegionUser ? 'Click to view Substations' : ''}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-factory.svg"
                            alt="Total Substations"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                {isRegionUser ? (
                                    <span
                                        style={{ color: 'var(--brand-blue)' }}>
                                        Substations{' '}
                                        {isRegionUser && (
                                            <span
                                                style={{ fontSize: '0.8rem' }}>
                                                🔗
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    'Substations'
                                )}
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
                            <div className="title">Feeders</div>
                            <div className={styles.summary_value}>
                                {widgetsData.totalFeeders}
                            </div>
                        </div>
                    </div>
                    {/*Feeder communication status*/}
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
                                    ).toFixed(2)}
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
                                    ).toFixed(2)}
                                    %
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section_header}>
                <h2 className="title">
                    Regions:{' '}
                    <span className={styles.region_count}>
                        [{widgetsData.totalRegions}]
                    </span>
                </h2>
            </div>

            <div className={styles.region_stats_container}>
                {widgetsData.regionNames &&
                widgetsData.regionNames.length > 0 ? (
                    widgetsData.regionNames.map((region, index) => (
                        <div
                            key={index}
                            className={styles.individual_region_stats}>
                            <ShortDetailsWidget
                                region={region}
                                edcCount={
                                    widgetsData.edcCount?.[region.trim()] || 0
                                }
                                substationCount={
                                    widgetsData.substationCount?.[
                                        region.trim()
                                    ] ?? 0
                                }
                                feederCount={
                                    widgetsData.feederCount?.[region.trim()] ??
                                    0
                                }
                                currentValue={
                                    widgetsData.regionStats?.[region.trim()]
                                        ?.currentValue || 0
                                }
                                previousValue={
                                    widgetsData.regionStats?.[region.trim()]
                                        ?.previousValue || 0
                                }
                                graphData={
                                    widgetsData.regionDemandData?.[
                                        region.trim()
                                    ] ?? {
                                        xAxis: [],
                                        series: [],
                                    }
                                }
                            />
                        </div>
                    ))
                ) : (
                    <p>No regions available</p>
                )}
            </div>
        </div>
    );
};

export default Regions;
