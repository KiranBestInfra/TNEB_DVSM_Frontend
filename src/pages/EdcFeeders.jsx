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

const EdcFeeders = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const { region: regionParam, edcs } = useParams();
    const { user, isRegion } = useAuth();
    const region = isRegion() && user?.id ? user.id : regionParam;
    const location = window.location.pathname;
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [feedersPerPage, setFeedersPerPage] = useState(6);
    const [viewMode, setViewMode] = useState('card');

    const [widgetsData, setWidgetsData] = useState(() => {
        const savedFeederData = localStorage.getItem('edcFeederData');
        const savedTimestamp = localStorage.getItem('edcFeederDataTimestamp');

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
                    nonCommMeters: 0,
                    feederNames: parsedData.feederNames || [],
                    feederCount: parsedData.regionFeederNames?.length || 0,
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
            feederIds: {},
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
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
                localStorage.removeItem('edcFeederData');
                localStorage.removeItem('edcFeederDataTimestamp');
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
        if (socket && widgetsData.feederNames.length > 0) {
            widgetsData.feederNames.map((value) => ids.push(value.id));
            socket.emit('subscribeFeeder', {
                feeders: ids,
            });
        }
    }, [widgetsData.feederNames, socket]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                try {
                    const data = await apiClient.get(`/edcs/${edcs}/widgets`);
                    const edcWidgets = data.data;

                    setWidgetsData((prev) => {
                        const newData = {
                            ...prev,
                            totalRegions:
                                edcWidgets.totalRegions || prev.totalRegions,
                            totalEdcs: edcWidgets.totalEdcs || prev.totalEdcs,
                            totalSubstations:
                                edcWidgets.totalSubstations ||
                                prev.totalSubstations,
                            totalFeeders:
                                edcWidgets.regionFeederNames?.length ||
                                prev.totalFeeders,
                            commMeters:
                                edcWidgets.commMeters || prev.commMeters,
                            nonCommMeters:
                                edcWidgets.nonCommMeters || prev.nonCommMeters,
                            feederNames: edcWidgets.regionFeederNames,
                            feederCount:
                                edcWidgets.regionFeederNames?.length || 0,
                        };
                        return newData;
                    });
                } catch (error) {
                    console.error(
                        'API error, using demo data for widgets:',
                        error
                    );
                }
            } catch (error) {
                console.error('Error fetching widget data:', error);
            }
        };

        fetchData();
    }, [edcs]);

    const handlePageChange = (newPage, newPerPage = feedersPerPage) => {
        if (newPerPage !== feedersPerPage) {
            setCurrentPage(1);
            setFeedersPerPage(newPerPage);
        } else {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className={styles.main_content}>
            <SectionHeader title="Feeders">
                <div className={styles.action_cont}>
                    <div className={styles.time_range_select_dropdown}>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
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
                widgetsData={{
                    totalFeeders: widgetsData.totalFeeders,
                    commMeters: widgetsData.commMeters,
                    nonCommMeters: widgetsData.nonCommMeters,
                    totalDistricts: 0,
                    feederCount: widgetsData.feederCount,
                }}
                isUserRoute={isRegion()}
                isBiUserRoute={location.includes('/bi/user/')}
                showRegions={false}
                showEdcs={false}
                showSubstations={false}
                showDistricts={false}
            />

            <SectionHeader
                title={`Feeders: [ ${widgetsData.feederCount} ]`}
                showSearch={true}
                showViewToggle={true}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showPagination={true}
                currentPage={currentPage}
                totalPages={Math.ceil(widgetsData.feederNames?.length / feedersPerPage)}
                itemsPerPage={feedersPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={(newPerPage) => handlePageChange(1, newPerPage)}
            />

            <div className={`${styles.region_stats_container} ${viewMode === 'list' ? styles.list_view : ''}`}>
                {widgetsData.feederNames &&
                widgetsData.feederNames.length > 0 ? (
                    widgetsData.feederNames
                        .slice((currentPage - 1) * feedersPerPage, currentPage * feedersPerPage)
                        .map((value) => (
                            <div
                                key={value.id}
                                className={styles.individual_region_stats}>
                                <ShortDetailsWidget
                                    region={region}
                                    edc={edcs}
                                    name={value.name}
                                    id={value.id}
                                    feederCount={
                                        widgetsData.meterCount[value.name] || 0
                                    }
                                    edcCount={widgetsData.totalEdcs || 0}
                                    substationCount={
                                        widgetsData.totalSubstations || 0
                                    }
                                    currentValue={
                                        parseFloat(
                                            widgetsData.feederDemandData?.[
                                                value.id
                                            ]?.series?.[0]?.data?.slice(-1)[0]
                                        ) || 0
                                    }
                                    previousValue={
                                        parseFloat(
                                            widgetsData.feederDemandData?.[
                                                value.id
                                            ]?.series?.[1]?.data?.slice(-1)[0]
                                        ) || 0
                                    }
                                    graphData={
                                        widgetsData.feederDemandData[value.id] || {
                                            xAxis: [],
                                            series: [],
                                        }
                                    }
                                    pageType="feeders"
                                />
                            </div>
                        ))
                ) : (
                    <p>No feeders available for this EDC.</p>
                )}
            </div>
        </div>
    );
};

export default EdcFeeders;
