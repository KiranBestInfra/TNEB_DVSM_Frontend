import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';

const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleError = (error) => {
            console.error('Caught error:', error);
            setHasError(true);
            setError(error);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <div
                style={{
                    padding: '20px',
                    color: 'red',
                    background: '#ffeeee',
                    border: '1px solid red',
                }}>
                <h2>Something went wrong</h2>
                <p>{error?.message || 'Unknown error'}</p>
                <button onClick={() => window.history.back()}>Go Back</button>
            </div>
        );
    }
    if (hasError) {
        return (
            <div
                style={{
                    padding: '20px',
                    color: 'red',
                    background: '#ffeeee',
                    border: '1px solid red',
                }}>
                <h2>Something went wrong</h2>
                <p>{error?.message || 'Unknown error'}</p>
                <button onClick={() => window.history.back()}>Go Back</button>
            </div>
        );
    }

    return children;
    return children;
};

const Substations = () => {
    const [timeframe, setTimeframe] = useState('Last 7 Days');
    const totalMeters = 1243;
    const totalRegions = 13; // Total number of regions
    const totalEDCs = 95; // Total number of EDCs
    const totalSubstations = 260; // Total number of substations
    const totalFeeders = 416; // Total number of feeders
    const [dateRange, setDateRange] = useState({
        start: null,
        end: null,
    });
    const { region } = useParams();
    const location = useLocation();

    // Always use admin routes regardless of actual path
    const isRegionUser = false;
    const routePrefix = '/admin';

    const [widgetsData, setWidgetsData] = useState({
        totalRegions: 0,
        totalEdcs: 0,
        totalSubstations: 0,
        totalFeeders: 0,
        commMeters: 0,
        nonCommMeters: 0,
        regionSubstationCount: 0,
        substationNames: {},
        substationFeederCounts: {},
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await apiClient.get('/regions/widgets');
                const regionWidgets = data.data;

                setWidgetsData((prev) => ({
                    ...prev,
                    totalRegions:
                        regionWidgets.totalRegions || prev.totalRegions,
                    totalEdcs: regionWidgets.totalEdcs || prev.totalEdcs,
                    totalSubstations:
                        regionWidgets.totalSubstations || prev.totalSubstations,
                    totalFeeders:
                        regionWidgets.totalFeeders || prev.totalFeeders,
                    commMeters: regionWidgets.commMeters || prev.commMeters,
                    nonCommMeters:
                        regionWidgets.nonCommMeters || prev.nonCommMeters,
                }));
            } catch (error) {
                console.error('Error fetching widget data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log('region', region);
        if (!region) return;

        const substationNames = async () => {
            try {
                const response = await apiClient.get(
                    `/edcs/widgets/${region}/substations`
                );
                const data = response;

                console.log('Fetched Substation Data:', data);
                setWidgetsData((prev) => ({
                    ...prev,
                    substationNames: data.data?.substationNames || [],
                    regionSubstationCount:
                        data.data?.substationNames?.length || 0,
                    substationFeederCounts:
                        data.data?.substationFeederCounts || {}, // Add feeder counts
                }));
            } catch (error) {
                console.error('Error fetching EDC names:', error);
            }
        };

        substationNames();
    }, [region]);
    console.log('widgetsData', widgetsData);

    const handleRegionClick = (region) => {
        setSelectedRegion(region); // Set region when clicked
    };
    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    // Replace EDC data with Substation data
    const substationNames = [
        'Adyar SS',
        'Velachery SS',
        'T Nagar SS',
        'Mylapore SS',
        'Anna Nagar SS',
        'Porur SS',
        'Ambattur SS',
        'Perambur SS',
        'Guindy SS',
        'Kodambakkam SS',
        'Royapuram SS',
        'Thiruvanmiyur SS',
        'Kilpauk SS',
        'Egmore SS',
        'Nungambakkam SS',
    ];

    // Substation feeder counts
    const substationFeederCounts = {
        'Adyar SS': 8,
        'Velachery SS': 6,
        'T Nagar SS': 7,
        'Mylapore SS': 5,
        'Anna Nagar SS': 6,
        'Porur SS': 4,
        'Ambattur SS': 5,
        'Perambur SS': 6,
        'Guindy SS': 7,
        'Kodambakkam SS': 5,
        'Royapuram SS': 4,
        'Thiruvanmiyur SS': 6,
        'Kilpauk SS': 5,
        'Egmore SS': 4,
        'Nungambakkam SS': 6,
    };

    // Substation consumption stats (in MVA)
    const substationStats = {
        'Adyar SS': { currentValue: 42, previousValue: 38 },
        'Velachery SS': { currentValue: 35, previousValue: 32 },
        'T Nagar SS': { currentValue: 45, previousValue: 41 },
        'Mylapore SS': { currentValue: 38, previousValue: 35 },
        'Anna Nagar SS': { currentValue: 40, previousValue: 37 },
        'Porur SS': { currentValue: 32, previousValue: 29 },
        'Ambattur SS': { currentValue: 36, previousValue: 33 },
        'Perambur SS': { currentValue: 34, previousValue: 31 },
        'Guindy SS': { currentValue: 41, previousValue: 38 },
        'Kodambakkam SS': { currentValue: 37, previousValue: 34 },
        'Royapuram SS': { currentValue: 33, previousValue: 30 },
        'Thiruvanmiyur SS': { currentValue: 39, previousValue: 36 },
        'Kilpauk SS': { currentValue: 35, previousValue: 32 },
        'Egmore SS': { currentValue: 31, previousValue: 28 },
        'Nungambakkam SS': { currentValue: 38, previousValue: 35 },
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

            return [
                { label: 'Dashboard', path: `${routePrefix}/dashboard` },
                {
                    label: `Region : ${formattedRegionName}`,
                    path: `${routePrefix}/${region}/dashboard`,
                },
                {
                    label: 'Substations',
                    path: `${routePrefix}/${region}/substations`,
                },
            ];
        } else {
            const items = [
                { label: 'Dashboard', path: `${routePrefix}/dashboard` },
            ];

            if (region) {
                items.push({
                    label: 'Regions',
                    path: `${routePrefix}/regions`,
                });
                items.push({
                    label: region.charAt(0).toUpperCase() + region.slice(1),
                    path: `${routePrefix}/${region}`,
                });
            }

            items.push({
                label: 'Substations',
                path: region
                    ? `${routePrefix}/${region}/substations`
                    : `${routePrefix}/substations`,
            });
            return items;
        }
    };

    try {
        console.log('Rendering Substations component, timeRange:', timeframe);
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <div className={styles.section_header}>
                        <h2 className="title">Substations</h2>
                        <div className={styles.action_container}>
                            <div className={styles.action_cont}>
                                <div
                                    className={
                                        styles.time_range_select_dropdown
                                    }>
                                    <select
                                        value={timeframe}
                                        onChange={handleTimeframeChange}
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
                                <div className="titles">
                                    Communication Status
                                </div>
                                <div
                                    className={
                                        styles.overall_communication_status
                                    }>
                                    <div
                                        className={
                                            styles.communication_status_container
                                        }>
                                        <div
                                            className={
                                                styles.communication_value
                                            }>
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
                                        <div
                                            className={
                                                styles.communication_value
                                            }>
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
                            Substations:{' '}
                            <span className={styles.region_count}>
                                [ {widgetsData.regionSubstationCount} ]
                            </span>
                        </h2>
                    </div>
                    <div className={styles.region_stats_container}>
                        {widgetsData.substationNames &&
                            widgetsData.substationNames.length > 0
                            ? widgetsData.substationNames.map(
                                (substation, index) => (
                                    <div
                                        key={index}
                                        className={
                                            styles.individual_region_stats
                                        }>
                                        <ShortDetailsWidget
                                            region={substation}
                                            feederCount={
                                                widgetsData
                                                    .substationFeederCounts?.[
                                                substation
                                                ] || 0
                                            }
                                            currentValue={
                                                substationStats[substation]
                                                    ?.currentValue
                                            }
                                            previousValue={
                                                substationStats[substation]
                                                    ?.previousValue
                                            }
                                            pageType="substations"
                                        />
                                    </div>
                                )
                            )
                            : null}
                    </div>
                </div>
            </ErrorBoundary>
        );
    } catch (error) {
        console.error('Error in Substations component:', error);
        return <div>Error loading substations data</div>;
    }
};

export default Substations;
