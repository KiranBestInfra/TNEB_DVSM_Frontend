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
    const totalMeters = 0;
    const totalRegions = 0;
    const totalEDCs = 0;
    const totalSubstations = 0;
    const totalFeeders = 0;
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
        if (!region) return;

        const substationNames = async () => {
            try {
                const response = await apiClient.get(
                    `/edcs/widgets/${region}/substations`
                );
                const data = response;

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

    const handleRegionClick = (region) => {
        setSelectedRegion(region); // Set region when clicked
    };
    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    try {
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <div className={styles.section_header}>
                        <h2 className="title">Substations</h2>
                    </div>
                    <Breadcrumb />
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
                                              showInfoIcon={true}
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
