import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import SummarySection from '../components/SummarySection';
import { useAuth } from '../components/AuthProvider';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import TimeRangeSelectDropdown from '../components/TimeRangeSelectDropdown/TimeRangeSelectDropdown';

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
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const location = window.location.pathname;
    const [currentPage, setCurrentPage] = useState(1);
    const [substationsPerPage, setSubstationsPerPage] = useState(6);
    const [viewMode, setViewMode] = useState('card');
    const [searchQuery, setSearchQuery] = useState('');
    const [timeRange, setTimeRange] = useState('Daily');
    const regionUser = isRegion();

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
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
            path: '/dsocket/socket.io',
        });
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
    const handleFeederClick = () => {
        if (regionUser && edcs) {
            navigate(`/user/region/${edcs}/feeders`);
        }
    };
    const handlePageChange = (newPage, newPerPage = substationsPerPage) => {
        if (newPerPage !== substationsPerPage) {
            setCurrentPage(1);
            setSubstationsPerPage(newPerPage);
        } else {
            setCurrentPage(newPage);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const filteredSubstations = widgetsData.substationNames.filter(
        (substation) =>
            substation.substation_names
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    try {
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <SectionHeader title="Substations"></SectionHeader>                    

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
                        showFeeders={true}
                        onFeederClick={regionUser ? handleFeederClick : null}
                    />

                    <SectionHeader
                        title={`Substations: [ ${filteredSubstations.length} ]`}
                        showSearch={true}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearch}
                        showViewToggle={true}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        showPagination={true}
                        currentPage={currentPage}
                        totalPages={Math.ceil(
                            filteredSubstations.length / substationsPerPage
                        )}
                        itemsPerPage={substationsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={(newPerPage) =>
                            handlePageChange(1, newPerPage)
                        }
                    />

                    <div
                        className={`${styles.region_stats_container} ${
                            viewMode === 'list' ? styles.list_view : ''
                        }`}>
                        {filteredSubstations &&
                        filteredSubstations.length > 0 ? (
                            filteredSubstations
                                .slice(
                                    (currentPage - 1) * substationsPerPage,
                                    currentPage * substationsPerPage
                                )
                                .map((substation, index) => (
                                    <div
                                        key={index}
                                        className={
                                            styles.individual_region_stats
                                        }>
                                        <ShortDetailsWidget
                                            region={region}
                                            edc={edcs}
                                            //edc={parseInt({ edcs }, 10) || 0}
                                            name={substation.substation_names}
                                            subID={substation.hierarchy_id}
                                            substationCount={
                                                substation.substation_names
                                                    .length || 0
                                            }
                                            feederCount={
                                                widgetsData
                                                    .substationFeederCounts?.[
                                                    substation.substation_names
                                                ] || 0
                                            }
                                            currentValue={Number(
                                                parseFloat(
                                                    widgetsData.substationDemandData?.[
                                                        substation.hierarchy_id
                                                    ]?.series?.[0]?.data?.slice(
                                                        -1
                                                    )[0] || 0
                                                ).toFixed(1)
                                            )}
                                            previousValue={Number(
                                                parseFloat(
                                                    widgetsData.substationDemandData?.[
                                                        substation.hierarchy_id
                                                    ]?.series?.[0]?.data?.slice(
                                                        -2,
                                                        -1
                                                    )[0] || 0
                                                ).toFixed(1)
                                            )}
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
                                            showInfoIcon={true}
                                        />
                                    </div>
                                ))
                        ) : (
                            <p>No substations available</p>
                        )}
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
