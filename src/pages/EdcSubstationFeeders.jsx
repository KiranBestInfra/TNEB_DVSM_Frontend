import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import { io } from 'socket.io-client';
import { useAuth } from '../components/AuthProvider';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import TimeRangeSelectDropdown from '../components/TimeRangeSelectDropdown/TimeRangeSelectDropdown';

const EdcSubstationFeeders = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [feedersPerPage, setFeedersPerPage] = useState(6);
    const [viewMode, setViewMode] = useState('card');
    const [searchQuery, setSearchQuery] = useState('');
    const { region: regionParam, edcs,edc, substationId } = useParams();
    const edcId = edcs || edc;
    const { user, isRegion,isCircle } = useAuth();
    const region = isRegion() && user?.id ? user.id : regionParam;
    const location = window.location.pathname;
    const [widgetsData, setWidgetsData] = useState(() => {
        const savedFeederData = localStorage.getItem('edcSubstationFeederData');
        const savedTimestamp = localStorage.getItem(
            'edcSubstationFeederDataTimestamp'
        );

        if (savedFeederData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedData = JSON.parse(savedFeederData);
                return {
                    totalRegions: 0,
                    totalEdcs: 0,
                    totalSubstations: 0,
                    totalFeeders: parsedData.feederNames?.length || 0,
                    commMeters: parsedData.commMeters || 0,
                    nonCommMeters: parsedData.nonCommMeters || 0,
                    feederNames: parsedData.name || [],
                    feeders: [],
                    feederCount: parsedData.feederNames?.length || 0,
                    meterCount: parsedData.meterCount || {},
                    feederStats: parsedData.feederStats || {},
                    feederDemandData: parsedData.feederDemandData,
                    feederIds: {},
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
            feederNames: [],
            feeders: [],
            feederCount: 0,
            meterCount: {},
            feederStats: {},
            feederDemandData: {},
            feederIds: [],
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
            path: '/dsocket/socket.io',
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {});

        newSocket.on('feederUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    feederDemandData: {
                        ...prevData.feederDemandData,
                        [data.feeder]: data.graphData,
                    },
                };

                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('edcSubstationFeederData');
                localStorage.removeItem('edcSubstationFeederDataTimestamp');
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
        const fetchData = async () => {
            try {
                const feederResponse = await apiClient.get(
                    `/substations/${substationId}/feeders`
                );
                const data = feederResponse.data;
                console.log('dataaa:', data);

                setWidgetsData((prev) => ({
                    ...prev,
                    feederNames: data.feeders.map((feeder) => feeder.name),
                    feeders: data.feeders,
                    feederCount: data.feeders?.length,
                    commMeters: data.commMeters,
                    nonCommMeters: data.nonCommMeters,
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
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

        fetchData();
    }, [edcId, substationId]);
    

    useEffect(() => {
        let ids = [];
        if (socket && widgetsData.feeders.length > 0) {
            widgetsData.feeders.map((value) => ids.push(value.id));
            socket.emit('subscribeFeeder', {
                feeders: ids,
            });
        }
    }, [widgetsData.feeders, socket]);

    const substationName = substationId
        ? substationId
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
        : 'Unknown';

    const handlePageChange = (newPage, newPerPage = feedersPerPage) => {
        if (newPerPage !== feedersPerPage) {
            setCurrentPage(1);
            setFeedersPerPage(newPerPage);
        } else {
            setCurrentPage(newPage);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const filteredFeeders =
        widgetsData.feeders?.filter((feeder) =>
            feeder.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

    return (
        <div className={styles.main_content}>
            <SectionHeader title={`${substationName} Substation Feeders`}>
                
            </SectionHeader>
            <Breadcrumb />
            <SummarySection
                widgetsData={{
                    totalEdcs: widgetsData.totalEdcs,
                    totalSubstations: widgetsData.totalSubstations,
                    totalDistricts: widgetsData.totalDistricts,
                    totalFeeders: widgetsData.feederCount,
                    commMeters: widgetsData.commMeters,
                    nonCommMeters: widgetsData.nonCommMeters,
                }}
                isUserRoute={isRegion()}
                isBiUserRoute={location.includes('/bi/user/')}
                showDistricts={false}
                showFeeders={true}
                showEdcs={false}
                showSubstations={false}
                showRegions={false}
            />

            <SectionHeader
                title={`Feeders: [ ${filteredFeeders.length} ]`}
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={handleSearch}
                showViewToggle={true}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showPagination={true}
                currentPage={currentPage}
                totalPages={Math.ceil(filteredFeeders.length / feedersPerPage)}
                itemsPerPage={feedersPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={(newPerPage) =>
                    handlePageChange(1, newPerPage)
                }
            />

            <div
                className={`${styles.region_stats_container} ${
                    viewMode === 'list' ? styles.list_view : ''
                }`}>
                {filteredFeeders.length > 0 ? (
                    filteredFeeders
                        .slice(
                            (currentPage - 1) * feedersPerPage,
                            currentPage * feedersPerPage
                        )
                        .map((feeder, index) => (
                            <div
                                key={index}
                                className={styles.individual_region_stats}>
                                <ShortDetailsWidget
                                    region={isCircle() ? '' : region}
                                    edc={edcId}
                                    id={feeder.id}
                                    name={feeder.name}
                                    substationId={substationId}
                                    edcCount={0}
                                    substationCount={0}
                                    feederCount={widgetsData.feederCount}
                                    currentValue={parseFloat(
                                        widgetsData.feederDemandData[
                                            feeder.id
                                        ]?.series?.[0]?.data?.slice(-1)[0] || 0
                                    )}
                                    previousValue={parseFloat(
                                        widgetsData.feederDemandData[
                                            feeder.id
                                        ]?.series?.[1]?.data?.slice(-1)[0] || 0
                                    )}
                                    pageType="feeders"
                                    graphData={
                                        widgetsData.feederDemandData[
                                            feeder.id
                                        ] || {
                                            xAxis: [],
                                            series: [],
                                        }
                                    }
                                    showInfoIcon={false}
                                />
                            </div>
                        ))
                ) : (
                    <p>No feeders available for this substation.</p>
                )}
            </div>
        </div>
    );
};

export default EdcSubstationFeeders;
