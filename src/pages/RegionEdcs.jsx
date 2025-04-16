import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
import { apiClient } from '../api/client';
import ShortDetailsWidget from './ShortDetailsWidget';
import { useAuth } from '../components/AuthProvider';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import TimeRangeSelectDropdown from '../components/TimeRangeSelectDropdown/TimeRangeSelectDropdown';

const RegionEdcs = () => {
    const { region: regionParam } = useParams();
    const { user, isRegion } = useAuth();
    const region = isRegion() && user?.id ? user.id : regionParam;
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [timeRange, setTimeRange] = useState('Daily');
    const cacheTimeoutRef = useRef(null);
    const [selectedEdc, setSelectedEdc] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [edcsPerPage, setEdcsPerPage] = useState(6);
    const [viewMode, setViewMode] = useState('card');
    const [widgetsData, setWidgetsData] = useState(() => {
        const savedDemandData = localStorage.getItem('regionEdcDemandData');
        const savedTimestamp = localStorage.getItem('regionEdcDemandTimestamp');

        if (savedDemandData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedDemandData = JSON.parse(savedDemandData);
                return {
                    totalEdcs: 0,
                    totalSubstations: 0,
                    totalFeeders: 0,
                    commMeters: 0,
                    nonCommMeters: 0,
                    totalDistricts: 0,
                    edcNames: Object.keys(parsedDemandData),
                    substationCount: {},
                    feederCount: {},
                    edcDemandData: parsedDemandData,
                };
            }
        }

        return {
            totalEdcs: 0,
            totalSubstations: 0,
            totalFeeders: 0,
            commMeters: 0,
            nonCommMeters: 0,
            totalDistricts: 0,
            edcNames: [],
            substationCount: {},
            feederCount: {},
            edcDemandData: {},
        };
    });

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
            path: '/dsocket/socket.io',
        });
        setSocket(newSocket);
        newSocket.on('edcUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    edcDemandData: {
                        ...prevData.edcDemandData,
                        [data.edc]: data.graphData,
                    },
                };
                localStorage.setItem(
                    'regionEdcDemandData',
                    JSON.stringify(newData.edcDemandData)
                );
                localStorage.setItem(
                    'regionEdcDemandTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('regionEdcDemandData');
                localStorage.removeItem('regionEdcDemandTimestamp');
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
        if (socket && widgetsData.edcNames.length > 0) {
            widgetsData.edcNames.map((value) => ids.push(value.hierarchy_name));

            socket.emit('subscribeEdc', {
                edcs: ids,
            });
        }
    }, [widgetsData.edcNames, socket]);

    useEffect(() => {
        const fetchEdcs = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/edcs/widgets/${region}`);
                const data = response.data || {};
                console.log('response', response);
                const transformedData = {
                    totalEdcs: data.edcNames?.length || 0,
                    totalSubstations:
                        data.substationCounts?.reduce(
                            (sum, item) => sum + (item.substation_count || 0),
                            0
                        ) || 0,
                    totalFeeders: Object.values(data.feederCounts || {}).reduce(
                        (sum, count) => sum + (count || 0),
                        0
                    ),
                    commMeters: data.commMeters || 0,
                    nonCommMeters: data.nonCommMeters || 0,
                    totalDistricts: data.regionDistricts || 0,
                    edcNames: data.edcNames || [],
                    substationCount:
                        data.substationCounts?.reduce((acc, item) => {
                            acc[item.edc_name] = item.substation_count || 0;
                            return acc;
                        }, {}) || {},
                    feederCount: data.feederCounts || {},
                    edcDemandData: widgetsData.edcDemandData || {},
                };

                setWidgetsData(transformedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching EDCs for region:', error);
                try {
                    await apiClient.post('/log/error', {
                        message: error.message,
                        stack: error.stack || 'No stack trace',
                        time: new Date().toISOString(),
                    });
                } catch (logError) {
                    console.error('Error logging to backend:', logError);
                }
                setLoading(false);
            }
        };

        fetchEdcs();
    }, [region]);

    const regionName =
        isRegion() && user?.name
            ? user.name.split(' ')[0]
            : region
            ? region
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
            : 'Unknown';

    const handleEdcClick = (edc) => {
        setSelectedEdc(edc);
    };

    const getSummaryData = () => {
        if (!selectedEdc) {
            return {
                totalEdcs: widgetsData.totalEdcs,
                totalSubstations: widgetsData.totalSubstations,
                totalFeeders: widgetsData.totalFeeders,
                commMeters: widgetsData.commMeters || 0,
                nonCommMeters: widgetsData.nonCommMeters || 0,
                totalDistricts: widgetsData.totalDistricts,
            };
        }

        return {
            totalEdcs: widgetsData.totalEdcs,
            totalSubstations: widgetsData.substationCount[selectedEdc] || 0,
            totalFeeders: widgetsData.feederCount[selectedEdc] || 0,
            commMeters: widgetsData.commMeters || 0,
            nonCommMeters: widgetsData.nonCommMeters || 0,
            totalDistricts: widgetsData.totalDistricts,
        };
    };

    const handlePageChange = (newPage, newPerPage = edcsPerPage) => {
        if (newPerPage !== edcsPerPage) {
            setCurrentPage(1);
            setEdcsPerPage(newPerPage);
        } else {
            setCurrentPage(newPage);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const filteredEdcs = widgetsData.edcNames.filter((edc) =>
        edc.hierarchy_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.main_content}>
            <SectionHeader title={`${regionName} - EDCs`}>
                <div className={styles.action_cont}>
                    <TimeRangeSelectDropdown
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    />
                </div>
            </SectionHeader>
            <Breadcrumb />

            <SummarySection
                widgetsData={getSummaryData()}
                isUserRoute={isRegion()}
                isBiUserRoute={location.pathname.includes('/bi/user/')}
                showRegions={false}
                showDistricts={true}
            />

            <SectionHeader
                title={`EDCs: [ ${filteredEdcs.length} ]`}
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={handleSearch}
                showViewToggle={true}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showPagination={true}
                currentPage={currentPage}
                totalPages={Math.ceil(filteredEdcs.length / edcsPerPage)}
                itemsPerPage={edcsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={(newPerPage) =>
                    handlePageChange(1, newPerPage)
                }
            />

            {loading ? (
                <div className={styles.loading}>Loading EDCs...</div>
            ) : (
                <div
                    className={`${styles.region_stats_container} ${
                        viewMode === 'list' ? styles.list_view : ''
                    }`}>
                    {filteredEdcs
                        .slice(
                            (currentPage - 1) * edcsPerPage,
                            currentPage * edcsPerPage
                        )
                        .map((edc, index) => (
                            <div
                                key={index}
                                className={styles.individual_region_stats}>
                                <ShortDetailsWidget
                                    region={region}
                                    edc={edc.hierarchy_id}
                                    name={edc.hierarchy_name}
                                    edcId={edc.hierarchy_id}
                                    substationCount={
                                        widgetsData.substationCount[
                                            edc.hierarchy_name
                                        ] || 0
                                    }
                                    feederCount={
                                        widgetsData.feederCount[
                                            edc.hierarchy_name
                                        ] || 0
                                    }
                                    edcCount={widgetsData.totalEdcs}
                                    graphData={
                                        widgetsData.edcDemandData?.[
                                            edc.hierarchy_name
                                        ] ?? {
                                            xAxis: [],
                                            series: [],
                                        }
                                    }
                                    currentValue={Number(
                                        parseFloat(
                                            widgetsData.edcDemandData?.[
                                                edc.hierarchy_name
                                            ]?.series?.[0]?.data?.slice(
                                                -1
                                            )[0] || 0
                                        ).toFixed(1)
                                    )}
                                    previousValue={Number(
                                        parseFloat(
                                            widgetsData.edcDemandData?.[
                                                edc.hierarchy_name
                                            ]?.series?.[0]?.data?.slice(
                                                -2,
                                                -1
                                            )[0] || 0
                                        ).toFixed(1)
                                    )}
                                    pageType="edcs"
                                    handleRegionClick={() =>
                                        handleEdcClick(edc)
                                    }
                                    showInfoIcon={true}
                                />

                                <div>
                                    {/* <h3>{edc.hierarchy_name}</h3> */}
                                    {/* <p>Substation Count: {widgetsData.substationCount[edc.hierarchy_name] || 0}</p> */}
                                    {/* <p>Feeder Count: {widgetsData.feederCount[edc.hierarchy_name] || 0}</p> */}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default RegionEdcs;
