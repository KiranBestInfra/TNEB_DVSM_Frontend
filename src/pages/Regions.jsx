import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import SectionHeader from '../components/SectionHeader/SectionHeader';
const nodeEnv = import.meta.env.VITE_NODE_ENV;
const socketPath = import.meta.env.VITE_SOCKET_PATH;
const devSocketPath = import.meta.env.VITE_DEV_SOCKET_PATH;

const Regions = () => {
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const cacheTimeoutRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [regionsPerPage, setRegionsPerPage] = useState(6);
    const [viewMode, setViewMode] = useState('card');
    const [widgetsData, setWidgetsData] = useState(() => {
        const savedDemandData = localStorage.getItem('regionDemandData');
        const savedTimestamp = localStorage.getItem('regionDemandTimestamp');

        if (savedDemandData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedDemandData = JSON.parse(savedDemandData);
                return {
                    totalRegions: 0,
                    totalEdcs: 0,
                    totalDistricts: 0,
                    totalSubstations: 0,
                    totalFeeders: 0,
                    commMeters: 0,
                    nonCommMeters: 0,
                    regionNames: Object.keys(parsedDemandData),
                    edcCount: {},
                    substationCount: {},
                    feederCount: {},
                    regionDemandData: parsedDemandData,
                    regionStats: {},
                };
            }
        }

        return {
            totalRegions: 0,
            totalEdcs: 0,
            totalDistricts: 0,
            totalSubstations: 0,
            totalFeeders: 0,
            commMeters: 0,
            nonCommMeters: 0,
            regionNames: [],
            edcCount: {},
            substationCount: {},
            feederCount: {},
            regionDemandData: {},
            regionStats: {},
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
            path: nodeEnv === 'development' ? devSocketPath : socketPath,
        });
        setSocket(newSocket);

        newSocket.on('regionUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    regionDemandData: {
                        ...prevData.regionDemandData,
                        [data.region]: data.graphData,
                    },
                };
                localStorage.setItem(
                    'regionDemandData',
                    JSON.stringify(newData.regionDemandData)
                );
                localStorage.setItem(
                    'regionDemandTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('regionDemandData');
                localStorage.removeItem('regionDemandTimestamp');
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
        if (socket && widgetsData.regionNames.length > 0) {
            socket.emit('subscribe', {
                regions: widgetsData.regionNames,
            });
        }
    }, [widgetsData.regionNames, socket]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiClient.get('/regions/widgets');

            const data = response.data;

            setWidgetsData((prev) => ({
                totalRegions: data.totalRegions || prev.totalRegions,
                totalEdcs: data.totalEdcs || prev.totalEdcs,
                totalDistricts: data.totalDistricts || prev.totalDistricts,
                totalSubstations:
                    data.totalSubstations || prev.totalSubstations,
                totalFeeders: data.totalFeeders || prev.totalFeeders,
                commMeters: data.commMeters || prev.commMeters,
                nonCommMeters: data.nonCommMeters || prev.nonCommMeters,
                regionNames: data.regionNames || prev.regionNames,
                edcCount: data.regionEdcCounts || prev.edcCount,
                substationCount:
                    data.regionSubstationCounts || prev.substationCount,
                feederCount: data.regionFeederCounts || prev.feederCount,
                //   regionDemandData: prev.regionDemandData,
                // regionStats: prev.regionStats,
            }));
        };

        fetchData();
    }, []);

    const handleRegionClick = (region) => {
        navigate(
            `/admin/regions/${region
                .toLowerCase()
                .replace(/\s+/g, '-')}/details`
        );
    };

    const isRegionUser = false;
    const currentRegionName = '';

    const handleEdcClick = () => {
        if (isRegionUser && currentRegionName) {
            navigate(`/user/${currentRegionName}/edcs`);
        }
    };

    const handleSubstationClick = () => {
        if (isRegionUser && currentRegionName) {
            navigate(`/user/${currentRegionName}/substations`);
        }
    };

    const handlePageChange = (newPage, newPerPage = regionsPerPage) => {
        if (newPerPage !== regionsPerPage) {
            setCurrentPage(1);
            setRegionsPerPage(newPerPage);
        } else {
            setCurrentPage(newPage);
        }
    };

    const filteredRegions = widgetsData.regionNames.filter((region) =>
        region.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Add this new function to calculate pagination options
    const getPaginationOptions = (totalItems) => {
        const options = [6]; // Start with default option
        if (totalItems > 10) options.push(10);
        if (totalItems > 20) options.push(20);
        if (totalItems > 50) options.push(50);
        if (totalItems > 100) options.push(100);
        return options.filter((opt) => opt <= totalItems);
    };

    return (
        <div className={styles.main_content}>
            <SectionHeader title="Regions"></SectionHeader>

            <Breadcrumb />

            <SummarySection
                widgetsData={widgetsData}
                isUserRoute={isRegionUser}
                isBiUserRoute={false}
                onEdcClick={isRegionUser ? handleEdcClick : null}
                onSubstationClick={isRegionUser ? handleSubstationClick : null}
                showRegions={false}
                showDistricts={true}
            />

            <SectionHeader
                title={`Regions: [ ${filteredRegions.length} ]`}
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={handleSearch}
                showViewToggle={true}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showPagination={true}
                currentPage={currentPage}
                totalPages={Math.ceil(filteredRegions.length / regionsPerPage)}
                itemsPerPage={regionsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={(newPerPage) =>
                    handlePageChange(1, newPerPage)
                }
                paginationOptions={getPaginationOptions(filteredRegions.length)}
            />

            <div
                className={`${styles.region_stats_container} ${
                    viewMode === 'list' ? styles.list_view : ''
                }`}>
                {filteredRegions && filteredRegions.length > 0 ? (
                    filteredRegions
                        .slice(
                            (currentPage - 1) * regionsPerPage,
                            currentPage * regionsPerPage
                        )
                        .map((region, index) => (
                            <div
                                key={index}
                                className={styles.individual_region_stats}>
                                <ShortDetailsWidget
                                    region={region}
                                    name={region}
                                    edcCount={
                                        widgetsData.edcCount?.[region.trim()] ||
                                        0
                                    }
                                    substationCount={
                                        widgetsData.substationCount?.[
                                            region.trim()
                                        ] ?? 0
                                    }
                                    feederCount={
                                        widgetsData.feederCount?.[
                                            region.trim()
                                        ] ?? 0
                                    }
                                    graphData={
                                        widgetsData.regionDemandData?.[
                                            region.trim()
                                        ] ?? {
                                            xAxis: [],
                                            series: [],
                                        }
                                    }
                                    currentValue={(() => {
                                        const value =
                                            widgetsData.regionDemandData?.[
                                                region.trim()
                                            ]?.series?.[0]?.data?.slice(-1)[0];
                                        return value !== undefined &&
                                            value !== null
                                            ? parseFloat(
                                                  parseFloat(value).toFixed(1)
                                              )
                                            : 0.0;
                                    })()}
                                    previousValue={(() => {
                                        const value =
                                            widgetsData.regionDemandData?.[
                                                region.trim()
                                            ]?.series?.[0]?.data?.slice(
                                                -2,
                                                -1
                                            )[0];
                                        return value !== undefined &&
                                            value !== null
                                            ? parseFloat(
                                                  parseFloat(value).toFixed(1)
                                              )
                                            : 0.0;
                                    })()}
                                    showInfoIcon={true}
                                />
                            </div>
                        ))
                ) : (
                    <p>No regions available</p>
                )}
            </div>
        </div>
    );
};

export default Regions;
