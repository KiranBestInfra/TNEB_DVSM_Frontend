import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import PropTypes from 'prop-types';

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

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

const RegionSubstations = () => {
    const [timeframe, setTimeframe] = useState('Last 7 Days');
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const { region } = useParams();

    // Always use admin routes regardless of actual path
    const isRegionUser = false;

    const [widgetsData, setWidgetsData] = useState(() => {
        const savedDemandData = localStorage.getItem('substationDemandData');
        const savedTimestamp = localStorage.getItem(
            'substationDemandTimestamp'
        );

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
                    substationNames: Object.keys(parsedDemandData),
                    regionSubstationCount: 0,
                    substationFeederCounts: {},
                    substationDemandData: parsedDemandData,
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
            substationNames: [],
            regionSubstationCount: 0,
            substationFeederCounts: {},
            substationDemandData: {},
        };
    });

    // Socket initialization
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('substationUpdate', (data) => {
            console.log('substationUpdate', data);
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    substationDemandData: {
                        ...prevData.substationDemandData,
                        [data.substation]: data.graphData,
                    },
                };
                localStorage.setItem(
                    'substationDemandData',
                    JSON.stringify(newData.substationDemandData)
                );
                localStorage.setItem(
                    'substationDemandTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('substationDemandData');
                localStorage.removeItem('substationDemandTimestamp');
            }, 30000);
        });

        return () => {
            newSocket.close();
            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
        };
    }, []);

    console.log('widgetsData', widgetsData);

    useEffect(() => {
        if (socket && widgetsData.substationNames.length > 0) {
            socket.emit('subscribeSubstation', {
                substations: widgetsData.substationNames,
            });
        }
    }, [widgetsData.substationNames, socket]);

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
                { label: 'Dashboard', path: `/user/dashboard` },
                {
                    label: `Region : ${formattedRegionName}`,
                    path: `/user/${region}/dashboard`,
                },
                {
                    label: 'Substations',
                    path: `/user/${region}/substations`,
                },
            ];
        } else {
            const items = [{ label: 'Dashboard', path: `/user/dashboard` }];

            if (region) {
                items.push({
                    label: 'Regions',
                    path: `/user/regions`,
                });
                items.push({
                    label: region.charAt(0).toUpperCase() + region.slice(1),
                    path: `/user/${region}`,
                });
            }

            items.push({
                label: 'Substations',
                path: region
                    ? `/user/${region}/substations`
                    : `/user/substations`,
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
                                        src="/icons/arrow-down.svg"
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
                                    src="/icons/office.svg"
                                    alt="Total Regions"
                                    className={styles.TNEB_icons}
                                />
                                <div className={styles.total_title_value}>
                                    <p className="title">
                                        <Link to={`/admin/regions`}>
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
                                    src="/icons/electric-edc.svg"
                                    alt="Total Region"
                                    className={styles.TNEB_icons}
                                />
                                <div className={styles.total_title_value}>
                                    <p className="title">
                                        <Link
                                            to={
                                                region
                                                    ? `/admin/${region}/edcs`
                                                    : `/admin/edcs`
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
                                    src="/icons/electric-factory.svg"
                                    alt="Total Substations"
                                    className={styles.TNEB_icons}
                                />
                                <div className={styles.total_title_value}>
                                    <p className="title">
                                        <Link
                                            to={
                                                region
                                                    ? `/admin/${region}/substations`
                                                    : `/admin/substations`
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
                                    src="/icons/electric-meter.svg"
                                    alt="Total Meters"
                                    className={styles.TNEB_icons}
                                />
                                <div className={styles.total_meters}>
                                    <div className="title">
                                        <Link
                                            to={
                                                region
                                                    ? `/admin/${region}/feeders`
                                                    : `/admin/feeders`
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
                                                src="/icons/up-right-arrow.svg"
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
                                                src="/icons/up-right-arrow.svg"
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
                                              region={region}
                                              name={substation}
                                              edcCount={0}
                                              substationCount={0}
                                              feederCount={
                                                  widgetsData
                                                      .substationFeederCounts?.[
                                                      substation
                                                  ] || 0
                                              }
                                              graphData={
                                                  widgetsData
                                                      .substationDemandData?.[
                                                      substation.trim()
                                                  ] ?? {
                                                      xAxis: [],
                                                      series: [],
                                                  }
                                              }
                                              currentValue={parseFloat(
                                                  widgetsData.substationDemandData?.[
                                                      substation.trim()
                                                  ]?.series?.[0]?.data?.slice(
                                                      -1
                                                  )[0] || 0
                                              ).toFixed(1)}
                                              previousValue={parseFloat(
                                                  widgetsData.substationDemandData?.[
                                                      substation.trim()
                                                  ]?.series?.[0]?.data?.slice(
                                                      -2,
                                                      -1
                                                  )[0] || 0
                                              ).toFixed(1)}
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
