import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
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

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('substationUpdate', (data) => {
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
        console.log('substationNames', widgetsData.substationNames);
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
                console.log('regionWidgets', regionWidgets);
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
                console.log('data', data);

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

    const regionName = region
        ? region
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : 'Unknown';
    try {
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <div className={styles.section_header}>
                        <h2 className="title">{regionName} - Substations</h2>
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
                    <Breadcrumb />

                    <SummarySection
                        widgetsData={{
                            totalRegions: widgetsData.totalRegions,
                            totalEdcs: widgetsData.totalEdcs,
                            totalSubstations: widgetsData.totalSubstations,
                            totalFeeders: widgetsData.totalFeeders,
                            commMeters: widgetsData.commMeters,
                            nonCommMeters: widgetsData.nonCommMeters,
                            totalDistricts:
                                widgetsData.totalDistricts ||
                                widgetsData.regionSubstationCount ||
                                0,
                        }}
                        isUserRoute={isRegionUser}
                        isBiUserRoute={location.pathname.includes('/bi/user/')}
                        showRegions={false}
                        showEdcs={false}
                        showSubstations={true}
                        showDistricts={true}
                    />

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
