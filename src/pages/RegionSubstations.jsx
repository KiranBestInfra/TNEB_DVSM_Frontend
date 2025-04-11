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
import { useAuth } from '../components/AuthProvider';
import SectionHeader from '../components/SectionHeader/SectionHeader';

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
    const { user, isRegion } = useAuth();
    const region = isRegion() && user?.id ? user.id : regionParam;
    const [selectedSubstation, setSelectedSubstation] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [substationsPerPage, setSubstationsPerPage] = useState(6);
    const [viewMode, setViewMode] = useState('card');

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
            }
        };

        substationNames();
    }, [region]);

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
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
        };
    };

    const handlePageChange = (newPage, newPerPage = substationsPerPage) => {
        if (newPerPage !== substationsPerPage) {
            setCurrentPage(1);
            setSubstationsPerPage(newPerPage);
        } else {
            setCurrentPage(newPage);
        }
    };

    try {
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <SectionHeader title={`${regionName} - Substations`}>
                        <div className={styles.action_cont}>
                            <div className={styles.time_range_select_dropdown}>
                                <select
                                    value={timeframe}
                                    onChange={handleTimeframeChange}
                                    className={styles.time_range_select}>
                                    <option value="Daily">Daily</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="PreviousMonth">Previous Month</option>
                                    <option value="Year">Year</option>
                                </select>
                                <img
                                    src="icons/arrow-down.svg"
                                    alt="Select Time"
                                    className={styles.time_range_select_dropdown_icon}
                                />
                            </div>
                        </div>
                    </SectionHeader>
                    <Breadcrumb />

                    <SummarySection
                        widgetsData={getSummaryData()}
                        isUserRoute={isRegion()}
                        isBiUserRoute={location.pathname.includes('/bi/user/')}
                        showRegions={false}
                        showEdcs={false}
                        showDistricts={false}
                        showSubstations={true}
                        showFeeders={true}
                    />

                    <SectionHeader
                        title={`Substations: [ ${widgetsData.regionSubstationCount} ]`}
                        showSearch={true}
                        showViewToggle={true}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        showPagination={true}
                        currentPage={currentPage}
                        totalPages={Math.ceil(widgetsData.substationIds?.length / substationsPerPage)}
                        itemsPerPage={substationsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={(newPerPage) => handlePageChange(1, newPerPage)}
                    />

                    <div className={`${styles.region_stats_container} ${viewMode === 'list' ? styles.list_view : ''}`}>
                        {widgetsData.substationIds &&
                        widgetsData.substationIds.length > 0
                            ? widgetsData.substationIds
                                .slice((currentPage - 1) * substationsPerPage, currentPage * substationsPerPage)
                                .map((value) => (
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
                                                  ? parseFloat(
                                                        seriesData.slice(-1)[0]
                                                    ).toFixed(1)
                                                  : '0.0';
                                          })()}
                                          previousValue={(() => {
                                              const seriesData =
                                                  widgetsData
                                                      .substationDemandData?.[
                                                      value.id
                                                  ]?.series?.[0]?.data;
                                              return seriesData &&
                                                  seriesData.length > 1
                                                  ? parseFloat(
                                                        seriesData.slice(
                                                            -2,
                                                            -1
                                                        )[0]
                                                    ).toFixed(1)
                                                  : '0.0';
                                          })()}
                                          pageType="substations"
                                          handleRegionClick={() =>
                                              setSelectedSubstation(
                                                  value.substation_names
                                              )
                                          }
                                          showInfoIcon={true}
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
