import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
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

    return children;
};

const RegionSubstations = () => {
    const [timeframe, setTimeframe] = useState('Last 7 Days');
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
                const data = await apiClient.get(`/regions/widgets`);
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
    }, [region]);

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
                        data.data?.substationFeederCounts || {},
                }));
            } catch (error) {
                console.error('Error fetching substation data:', error);
            }
        };

        substationNames();
    }, [region]);

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };

    const getBreadcrumbItems = () => {
        if (isRegionUser && region) {
            const formattedRegionName =
                region.charAt(0).toUpperCase() + region.slice(1);

            return [
                { label: 'Dashboard', path: `${currentBaseRoute}/dashboard` },
                {
                    label: `Region : ${formattedRegionName}`,
                    path: `${currentBaseRoute}/${region}/dashboard`,
                },
                {
                    label: 'Substations',
                    path: `${currentBaseRoute}/${region}/substations`,
                },
            ];
        } else {
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
                label: 'Substations',
                path: region
                    ? `${currentBaseRoute}/${region}/substations`
                    : `${currentBaseRoute}/substations`,
            });
            return items;
        }
    };

    try {
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
                                    <p className="title">
                                        <Link
                                            to={`${currentBaseRoute}/regions`}>
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
                                            87%
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
                                            13%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section_header}>
                        <h2 className="title">
                            Substations{' '}
                            <span className={styles.region_count}>
                                {widgetsData.regionSubstationCount}
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
                                              currentValue={0}
                                              previousValue={0}
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
        console.error('Error in RegionSubstations component:', error);
        return <div>Error loading substations data</div>;
    }
};

export default RegionSubstations;
