import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import TimeRangeSelectDropdown from '../components/TimeRangeSelectDropdown/TimeRangeSelectDropdown';

const Regions = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('Daily');
    const [socket, setSocket] = useState(null);
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
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
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

    // Always use admin routes regardless of actual path
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

    return (
        <div className={styles.main_content}>
            <SectionHeader title="Regions">
                <div className={styles.action_cont}>
                    <TimeRangeSelectDropdown
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    />
                </div>
            </SectionHeader>

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
                title={`Regions: [ ${widgetsData.totalRegions} ]`}
                showSearch={true}
                showViewToggle={true}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showPagination={true}
                currentPage={currentPage}
                totalPages={Math.ceil(
                    widgetsData.regionNames.length / regionsPerPage
                )}
                itemsPerPage={regionsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={(newPerPage) =>
                    handlePageChange(1, newPerPage)
                }
            />

            <div
                className={`${styles.region_stats_container} ${
                    viewMode === 'list' ? styles.list_view : ''
                }`}>
                {widgetsData.regionNames &&
                widgetsData.regionNames.length > 0 ? (
                    widgetsData.regionNames
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
                                    currentValue={parseFloat(
                                        widgetsData.regionDemandData?.[
                                            region.trim()
                                        ]?.series?.[0]?.data?.slice(-1)[0] || 0
                                    ).toFixed(1)}
                                    previousValue={parseFloat(
                                        widgetsData.regionDemandData?.[
                                            region.trim()
                                        ]?.series?.[0]?.data?.slice(
                                            -2,
                                            -1
                                        )[0] || 0
                                    ).toFixed(1)}
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
