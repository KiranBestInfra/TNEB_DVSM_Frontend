import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import PropTypes from 'prop-types';
import { useAuth } from '../components/AuthProvider';
const nodeEnv = import.meta.env.VITE_NODE_ENV;
const socketPath = import.meta.env.VITE_SOCKET_PATH;
const devSocketPath = import.meta.env.VITE_DEV_SOCKET_PATH;

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
    const { region: regionParam } = useParams();
    const { user, isRegion, isAdmin } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const region = isRegion() && user?.id ? user.id : regionParam;
    const [selectedSubstation, setSelectedSubstation] = useState(null);
    const regionUser = isRegion();
    const adminUser = isAdmin();
    const navigate = useNavigate();

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
                    substationIds: {},
                    Demand: 0,
                    DemandUnit: 'MW',
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
            substationIds: {},
            Demand: 0,
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
            path: nodeEnv === 'development' ? devSocketPath : socketPath,
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {});

        newSocket.on('substationUpdate', (data) => {
            setWidgetsData((prevData) => {
                // Update the specific substation's graph data
                const updatedDemandData = {
                    ...prevData.substationDemandData,
                    [data.substation]: data.graphData,
                };

                // Calculate total demand from all currentValues
                const totalDemand = Object.values(updatedDemandData).reduce(
                    (sum, graph) => {
                        const seriesData = graph?.series?.[0]?.data;
                        const currentValue =
                            seriesData && seriesData.length
                                ? parseFloat(seriesData[seriesData.length - 1])
                                : 0;
                        return sum + currentValue;
                    },
                    0
                );

                const newData = {
                    ...prevData,
                    substationDemandData: updatedDemandData,
                    Demand: parseFloat(totalDemand.toFixed(1)), // optional rounding
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

    useEffect(() => {
        let ids = [];
        if (socket && widgetsData.substationIds.length > 0) {
            widgetsData.substationIds.map((value) => ids.push(value.id));
            socket.emit('subscribeSubstation', {
                substations: ids,
            });
        }
    }, [widgetsData.substationIds, socket]);

    useEffect(() => {
        const substationNames = async () => {
            try {
                const response = await apiClient.get(
                    `/edcs/widgets/${region}/substations`
                );
                const data = response;
                const substationFeederCounts =
                    data.data?.substationFeederCounts;
                const feedersCount = Object.values(
                    substationFeederCounts
                ).reduce((sum, count) => sum + count, 0);

                setWidgetsData((prev) => ({
                    ...prev,
                    substationNames: data.data?.substationNames || [],
                    regionSubstationCount:
                        data.data?.substationNames?.length || 0,
                    substationFeederCounts:
                        data.data?.substationFeederCounts || {},
                    totalFeeders: feedersCount,
                    commMeters: data.data?.commMeters,
                    nonCommMeters: data.data?.nonCommMeters,
                    substationIds: data.data?.substationNames,
                }));
            } catch (error) {
                console.error('Error fetching substation data:', error);
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

        substationNames();
    }, [region]);

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };
    const handleFeederClick = () => {
        if (isRegion()) {
            navigate(`/user/region/feeders`);
        } else if (isAdmin() && region) {
            navigate(`/admin/${region}/feeders`);
        }
    };
    const regionName =
        isRegion() && user?.name
            ? user.name.split(' ')[0]
            : region
            ? region
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
            : 'Unknown';

    const getSummaryData = () => {
        if (!selectedSubstation) {
            return {
                totalRegions: widgetsData.totalRegions,
                totalEdcs: widgetsData.totalEdcs,
                totalSubstations: widgetsData.regionSubstationCount,
                totalFeeders: widgetsData.totalFeeders,
                commMeters: widgetsData.commMeters,
                nonCommMeters: widgetsData.nonCommMeters,
                Demand: widgetsData.Demand,
                DemandUnit: widgetsData.DemandUnit || 'MW',
            };
        }

        return {
            totalRegions: widgetsData.totalRegions,
            totalEdcs: widgetsData.totalEdcs,
            totalSubstations: 1,
            totalFeeders:
                widgetsData.substationFeederCounts?.[selectedSubstation] || 0,
            commMeters: widgetsData.commMeters,
            nonCommMeters: widgetsData.nonCommMeters,
            Demand: widgetsData.Demand,
            DemandUnit: widgetsData.DemandUnit || 'MW',
        };
    };

    try {
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <div className={styles.section_header}>
                        <h2 className="title">{regionName} - Substations</h2>
                    </div>
                    <Breadcrumb />

                    <SummarySection
                        widgetsData={getSummaryData()}
                        isUserRoute={isRegion()}
                        isRegion={isRegion()}
                        isAdmin={isAdmin()}
                        isBiUserRoute={location.pathname.includes('/bi/user/')}
                        showRegions={false}
                        showEdcs={false}
                        showDistricts={false}
                        showSubstations={true}
                        showFeeders={true}
                        onFeederClick={handleFeederClick || null}
                        showDemand={true}
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
                        {widgetsData.substationIds &&
                        widgetsData.substationIds.length > 0
                            ? widgetsData.substationIds.map((value) => (
                                  <div
                                      key={value.id}
                                      className={
                                          styles.individual_region_stats
                                      }>
                                      <ShortDetailsWidget
                                          region={region}
                                          name={value.substation_names}
                                          id={value.id}
                                          edcCount={0}
                                          substationCount={0}
                                          feederCount={
                                              widgetsData
                                                  .substationFeederCounts?.[
                                                  value.substation_names
                                              ] || 0
                                          }
                                          graphData={
                                              widgetsData
                                                  .substationDemandData?.[
                                                  value.id
                                              ] ?? {
                                                  xAxis: [],
                                                  series: [],
                                              }
                                          }
                                          currentValue={(() => {
                                              const seriesData =
                                                  widgetsData
                                                      .substationDemandData?.[
                                                      value.id
                                                  ]?.series?.[0]?.data;
                                              return seriesData &&
                                                  seriesData.length
                                                  ? Number(
                                                        parseFloat(
                                                            seriesData.slice(
                                                                -1
                                                            )[0]
                                                        ).toFixed(1)
                                                    )
                                                  : 0.0;
                                          })()}
                                          previousValue={(() => {
                                              const seriesData =
                                                  widgetsData
                                                      .substationDemandData?.[
                                                      value.id
                                                  ]?.series?.[0]?.data;
                                              return seriesData &&
                                                  seriesData.length > 1
                                                  ? Number(
                                                        parseFloat(
                                                            seriesData.slice(
                                                                -2,
                                                                -1
                                                            )[0]
                                                        ).toFixed(1)
                                                    )
                                                  : 0.0;
                                          })()}
                                          pageType="substations"
                                          handleRegionClick={() =>
                                              setSelectedSubstation(
                                                  value.substation_names
                                              )
                                          }
                                      />
                                  </div>
                              ))
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
