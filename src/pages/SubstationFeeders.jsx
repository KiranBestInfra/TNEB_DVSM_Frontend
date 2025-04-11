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

const SubstationFeeders = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [feedersPerPage, setFeedersPerPage] = useState(6);
    const [viewMode, setViewMode] = useState('card');
    const [searchQuery, setSearchQuery] = useState('');

    const { region: regionParam, substationId } = useParams();
    const { user, isRegion } = useAuth();
    const region = isRegion() && user?.id ? user.id : regionParam;
    const location = window.location.pathname;

    const [widgetsData, setWidgetsData] = useState(() => {
        const savedFeederData = localStorage.getItem('substationFeederData');
        const savedTimestamp = localStorage.getItem(
            'substationFeederDataTimestamp'
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
                    commMeters: 0,
                    nonCommMeters: 0,
                    feederNames: parsedData.feederNames || [],
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
            feederCount: 0,
            meterCount: {},
            feederStats: {},
            feederDemandData: {},
            feederIds: [],
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);
        newSocket.on('feederUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    feederDemandData: {
                        ...prevData.feederDemandData,
                        [data.feeder]: data.graphData,
                    },
                };

                const cacheData = {
                    feederNames: newData.feederNames,
                    meterCount: newData.meterCount,
                    feederStats: newData.feederStats,
                    feederDemandData: newData.feederDemandData,
                    feederIds: newData.feederIds,
                };

                localStorage.setItem(
                    'substationFeederData',
                    JSON.stringify(cacheData)
                );
                localStorage.setItem(
                    'substationFeederDataTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('substationFeederData');
                localStorage.removeItem('substationFeederDataTimestamp');
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
        if (socket && widgetsData.feederIds.length > 0) {
            widgetsData.feederIds.forEach((item) => {
                Object.values(item).forEach((id) => ids.push(id));
            });
            socket.emit('subscribeFeeder', {
                feeders: ids,
            });
        }
    }, [widgetsData.feederIds, socket]);

    useEffect(() => {
        const fetchFeeders = async () => {
            try {
                try {
                    const response = await apiClient.get(
                        `/substations/${substationId}/feeders`
                    );
                    const feedersData = response.data.feeders || [];

                    setWidgetsData((prev) => {
                        const newData = {
                            ...prev,
                            commMeters: response.data.commMeters,
                            nonCommMeters: response.data.nonCommMeters,
                            feederNames: feedersData.map((f) => f.name) || [],
                            feederCount: feedersData.length || 0,
                            totalFeeders: feedersData.length || 0,
                            meterCount: feedersData.reduce((acc, f) => {
                                acc[f.name] = f.meter_count || 0;
                                return acc;
                            }, {}),
                            feederStats: feedersData.reduce((acc, f) => {
                                acc[f.name] = {
                                    currentValue: f.current_value || 0,
                                    previousValue: f.previous_value || 0,
                                };
                                return acc;
                            }, {}),
                            feederIds:
                                feedersData.map((feeder) => ({
                                    [feeder.name]: feeder.id,
                                })) || [],
                        };

                        const cacheData = {
                            feederNames: newData.feederNames,
                            meterCount: newData.meterCount,
                            feederStats: newData.feederStats,
                            feederDemandData: newData.feederDemandData,
                            feederIds: newData.feederIds,
                        };

                        localStorage.setItem(
                            'substationFeederData',
                            JSON.stringify(cacheData)
                        );
                        localStorage.setItem(
                            'substationFeederDataTimestamp',
                            Date.now().toString()
                        );

                        return newData;
                    });
                } catch (error) {
                    console.error(
                        'API error, using demo data for feeders:',
                        error
                    );
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
            } catch (error) {
                console.error('Error fetching feeders for substation:', error);
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

        if (substationId) {
            fetchFeeders();
        }
    }, [substationId]);

    const handlePageChange = (newPage, newPerPage = feedersPerPage) => {
        if (newPerPage !== feedersPerPage) {
            setCurrentPage(1);
            setFeedersPerPage(newPerPage);
        } else {
            setCurrentPage(newPage);
        }
    };

    const filteredFeeders = widgetsData.feederIds.filter(feeder => 
        Object.keys(feeder)[0].toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    return (
        <div className={styles.main_content}>
            <SectionHeader title="Feeders for Substation">
                <div className={styles.action_cont}>
                    <TimeRangeSelectDropdown
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    />
                </div>
            </SectionHeader>

            <Breadcrumb />

            <SummarySection
                widgetsData={{
                    totalRegions: widgetsData.totalRegions,
                    totalEdcs: widgetsData.totalEdcs,
                    totalSubstations: widgetsData.totalSubstations,
                    totalFeeders: widgetsData.totalFeeders,
                    commMeters: widgetsData.commMeters,
                    nonCommMeters: widgetsData.nonCommMeters,
                    totalDistricts: 0,
                }}
                isUserRoute={isRegion()}
                isBiUserRoute={location.includes('/bi/user/')}
                showRegions={false}
                showEdcs={false}
                showSubstations={false}
                showDistricts={false}
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
                onItemsPerPageChange={(newPerPage) => handlePageChange(1, newPerPage)}
            />

            <div className={`${styles.region_stats_container} ${viewMode === 'list' ? styles.list_view : ''}`}>
                {filteredFeeders && filteredFeeders.length > 0 ? (
                    filteredFeeders
                        .slice(
                            (currentPage - 1) * feedersPerPage,
                            currentPage * feedersPerPage
                        )
                        .map((value) =>
                            Object.entries(value).map(([key, value]) => (
                                <div
                                    key={value}
                                    className={styles.individual_region_stats}>
                                    <ShortDetailsWidget
                                        region={region}
                                        name={key}
                                        substationId={substationId}
                                        id={value}
                                        feederCount={
                                            widgetsData.meterCount[key] || 0
                                        }
                                        currentValue={parseFloat(
                                            widgetsData.feederDemandData?.[
                                                value
                                            ]?.series?.[0]?.data?.slice(-1)[0] ||
                                                widgetsData.feederStats[key]
                                                    ?.currentValue ||
                                                0
                                        ).toFixed(1)}
                                        previousValue={parseFloat(
                                            widgetsData.feederDemandData?.[
                                                value
                                            ]?.series?.[0]?.data?.slice(
                                                -2,
                                                -1
                                            )[0] ||
                                                widgetsData.feederStats[key]
                                                    ?.previousValue ||
                                                0
                                        ).toFixed(1)}
                                        graphData={
                                            widgetsData.feederDemandData[value] || {
                                                xAxis: [],
                                                series: [],
                                            }
                                        }
                                        pageType="feeders"
                                        showInfoIcon={true}
                                    />
                                </div>
                            ))
                        )
                ) : (
                    <p>No feeders available for this EDC.</p>
                )}
            </div>
        </div>
    );
};

export default SubstationFeeders;
