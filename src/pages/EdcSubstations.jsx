import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import SummarySection from '../components/SummarySection';
import { useAuth } from '../components/AuthProvider';

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

const EdcSubstations = () => {
    const { edcs, region: regionParam } = useParams();
    const { user, isRegion } = useAuth();
    const region = isRegion() && user?.id ? user.id : regionParam;
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const location = window.location.pathname;

    useEffect(() => {
        if (!edcs) return;

        const substationNames = async () => {
            try {
                const response = await apiClient.get(
                    `/substations/widgets/${edcs}/substations`
                );
                const data = response;
                setWidgetsData((prev) => ({
                    ...prev,
                    substationNames: data.data?.edcsubstationNames || [],
                    regionSubstationCount:
                        data.data?.substationNames?.length || 0,
                    substationFeederCounts:
                        data.data?.substationFeederCountsedc || {},
                    feederCount: data.data?.regionFeederNames?.length || 0,
                }));
            } catch (error) {
                console.error('Error fetching substation data:', error);
            }
        };

        substationNames();
    }, [edcs]);

    useEffect(() => {
        if (!edcs) return;

        const fetchEdcWidgets = async () => {
            try {
                const response = await apiClient.get(`/edcs/${edcs}/widgets`);
                const feederCount =
                    response?.data?.regionFeederNames?.length || 0;
                setWidgetsData((prev) => ({
                    ...prev,
                    commMeters: response?.data?.commMeters || 0,
                    nonCommMeters: response?.data?.nonCommMeters || 0,
                    edcSubstationCount: response?.data?.substationCount || 0,
                    edcFeederCount: feederCount,
                }));
            } catch (error) {
                console.error('Error fetching EDC widgets:', error);
            }
        };

        fetchEdcWidgets();
    }, [edcs]);

    const [widgetsData, setWidgetsData] = useState(() => {
        const savedSubstationData = localStorage.getItem('substationData');
        const savedTimestamp = localStorage.getItem('substationDataTimestamp');

        if (savedSubstationData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedData = JSON.parse(savedSubstationData);
                return {
                    totalRegions: 0,
                    totalEdcs: 0,
                    totalsubstations: 0,
                    edcFeederCount: parsedData.feederCount || 0,
                    commMeters: 0,
                    nonCommMeters: 0,
                    edcSubstationCount: parsedData.substationNames?.length || 0,
                    totalDistricts:
                        parsedData.totalDistricts ||
                        parsedData.substationNames?.length ||
                        0,
                    substationNames: parsedData.substationNames || [],
                    substationFeederCounts:
                        parsedData.substationFeederCounts || {},
                    substationStats: parsedData.substationStats,
                    substationDemandData: parsedData.substationDemandData,
                };
            }
        }

        return {
            totalRegions: 0,
            totalEdcs: 0,
            totalsubstations: 0,
            edcFeederCount: 0,
            commMeters: 0,
            nonCommMeters: 0,
            edcSubstationCount: 0,
            totalDistricts: 0,
            substationNames: [],
            substationFeederCounts: {},
            substationStats: {},
            substationDemandData: {},
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {});

        newSocket.on('substationUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    ...prevData,
                    substationDemandData: {
                        ...prevData.substationDemandData,
                        [data.substation]: data.graphData,
                    },
                };

                const cacheData = {
                    substationDemandData: newData.substationDemandData,
                };

                localStorage.setItem(
                    'substationData',
                    JSON.stringify(cacheData)
                );
                localStorage.setItem(
                    'substationDataTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('substationData');
                localStorage.removeItem('substationDataTimestamp');
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
        if (socket && widgetsData.substationNames.length > 0) {
            widgetsData.substationNames.map((value) =>
                ids.push(value.hierarchy_id)
            );
            socket.emit('subscribeSubstation', {
                substations: ids,
            });
        }
    }, [widgetsData.substationNames, socket]);

    try {
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <div className={styles.section_header}>
                        <h2 className="title">Substations</h2>
                    </div>

                    <Breadcrumb />

                    <SummarySection
                        widgetsData={{
                            totalSubstations:
                                widgetsData.substationNames.length,
                            totalFeeders: widgetsData.edcFeederCount,
                            commMeters: widgetsData.commMeters,
                            nonCommMeters: widgetsData.nonCommMeters,
                            totalDistricts: widgetsData.totalDistricts,
                        }}
                        isUserRoute={isRegion()}
                        isBiUserRoute={location.includes('/bi/user/')}
                        showRegions={false}
                        showDistricts={false}
                        showEdcs={false}
                        showSubstations={true}
                    />

                    <div className={styles.section_header}>
                        <h2 className="title">
                            Substations:{' '}
                            <span className={styles.region_count}>
                                {widgetsData.substationNames.length}
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
                                              edc={edcs}
                                              name={substation.substation_names}
                                              subID={substation.hierarchy_id}
                                              feederCount={
                                                  widgetsData
                                                      .substationFeederCounts?.[
                                                      substation
                                                          .substation_names
                                                  ] || 0
                                              }
                                              currentValue={parseFloat(
                                                  widgetsData.substationDemandData?.[
                                                      substation.hierarchy_id
                                                  ]?.series?.[0]?.data?.slice(
                                                      -1
                                                  )[0] || 0
                                              ).toFixed(1)}
                                              previousValue={parseFloat(
                                                  widgetsData.substationDemandData?.[
                                                      substation.hierarchy_id
                                                  ]?.series?.[0]?.data?.slice(
                                                      -2,
                                                      -1
                                                  )[0] || 0
                                              ).toFixed(1)}
                                              graphData={
                                                  widgetsData
                                                      .substationDemandData?.[
                                                      substation.hierarchy_id
                                                  ] ?? {
                                                      xAxis: [],
                                                      series: [],
                                                  }
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
        console.error('Error in EdcSubstations component:', error);
        return <div>Error loading substations data</div>;
    }
};

export default EdcSubstations;
