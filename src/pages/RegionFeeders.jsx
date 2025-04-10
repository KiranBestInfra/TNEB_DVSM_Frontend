import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import { io } from 'socket.io-client';
import SummarySection from '../components/SummarySection';
import { useAuth } from '../components/AuthProvider';

const RegionFeeders = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const { region: regionParam } = useParams();
    const { user, isRegion } = useAuth();
    const region = isRegion() && user?.id ? user.id : regionParam;
    const [socket, setSocket] = useState(null);

    const [widgetsData, setWidgetsData] = useState(() => {
        const savedFeederData = localStorage.getItem('feederDemandData');
        const savedTimestamp = localStorage.getItem('feederDemandTimestamp');

        if (savedFeederData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedFeederData = JSON.parse(savedFeederData);
                return {
                    totalRegions: 0,
                    totalEdcs: 0,
                    totalSubstations: 0,
                    totalFeeders: 0,
                    commMeters: 0,
                    nonCommMeters: 0,
                    feederNames: Object.keys(parsedFeederData),
                    feederCount: 0,
                    feederStats: {},
                    feederDemandData: parsedFeederData,
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
            feederStats: {},
            feederDemandData: {},
            feederIds: {},
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
                localStorage.removeItem('feederDemandData');
                localStorage.removeItem('feederDemandTimestamp');
                return newData;
            });
        });

        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        let ids = [];
        if (socket && widgetsData.feederIds.length > 0) {
            widgetsData.feederIds.forEach((value) => {
                Object.values(value).forEach((id) => ids.push(id));
            });
            socket.emit('subscribeFeeder', {
                feeders: ids,
            });
        }
    }, [widgetsData.feederIds, socket]);

    useEffect(() => {
        const fetchFeeders = async () => {
            try {
                const response = await apiClient.get(
                    `/regions/${region}/feeders`
                );

                const feedersData = response.data.feedersWithCount || [];
                const commMeters = response.data.commMeters || 0;
                const nonCommMeters = response.data.nonCommMeters || 0;

                setWidgetsData((prev) => ({
                    ...prev,
                    feederNames: feedersData.map((feeder) => feeder.name) || [],
                    feederIds:
                        feedersData.map((feeder) => ({
                            [feeder.name]: feeder.id,
                        })) || [],
                    feederCount: feedersData.length || 0,
                    totalFeeders: feedersData.length || 0,
                    commMeters,
                    nonCommMeters,
                }));
            } catch (error) {
                console.error('API error:', error);
            }
        };

        fetchFeeders();
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

    return (
        <div
            className={styles.main_content}
            onScroll={(e) =>
                e.currentTarget.addEventListener('scroll', null, {
                    passive: true,
                })
            }>
            <div className={styles.section_header}>
                <h2 className="title">{regionName} - Feeders</h2>
                <div className={styles.action_container}>
                    <div className={styles.action_cont}>
                        <div className={styles.time_range_select_dropdown}>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={styles.time_range_select}>
                                <option value="Daily">Daily</option>
                                <option value="Monthly">Monthly</option>
                                <option value="PreviousMonth">
                                    Previous Month
                                </option>
                                <option value="Year">Year</option>
                            </select>
                            <img
                                src="icons/arrow-down.svg"
                                alt="Select Time"
                                className={
                                    styles.time_range_select_dropdown_icon
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Breadcrumb />

            <SummarySection
                widgetsData={{
                    totalRegions: 0,
                    totalEdcs: 0,
                    totalSubstations: 0,
                    totalFeeders: widgetsData.totalFeeders,
                    commMeters: widgetsData.commMeters,
                    nonCommMeters: widgetsData.nonCommMeters,
                    totalDistricts: 0,
                }}
                isUserRoute={isRegion()}
                isBiUserRoute={false}
                showRegions={false}
                showDistricts={false}
                showEdcs={false}
                showSubstations={false}
            />

            <div className={styles.section_header}>
                <h2 className="title">
                    Feeders:{' '}
                    <span
                        className={
                            styles.region_count
                        }>{`[ ${widgetsData.feederCount} ]`}</span>
                </h2>
            </div>
            <div className={styles.region_stats_container}>
                {widgetsData.feederIds && widgetsData.feederIds.length > 0 ? (
                    widgetsData.feederIds.map((value) =>
                        Object.entries(value).map(([key, value]) => (
                            <div
                                key={value}
                                className={styles.individual_region_stats}>
                                <ShortDetailsWidget
                                    region={region}
                                    name={key}
                                    id={String(value)}
                                    edcCount={0}
                                    substationCount={0}
                                    commMeters={widgetsData.commMeters}
                                    nonCommMeters={widgetsData.nonCommMeters}
                                    graphData={
                                        widgetsData.feederDemandData[value]
                                    }
                                    previousValue={parseFloat(
                                        widgetsData.feederDemandData?.[
                                            value
                                        ]?.series?.[0]?.data?.slice(
                                            -2,
                                            -1
                                        )[0] || 0
                                    )}
                                    currentValue={parseFloat(
                                        widgetsData.feederDemandData?.[
                                            value
                                        ]?.series?.[0]?.data?.slice(-1)[0] || 0
                                    )}
                                    pageType="feeders"
                                    feederCount={widgetsData.feederCount}
                                />
                            </div>
                        ))
                    )
                ) : (
                    <p>No feeders available for this region.</p>
                )}
            </div>
        </div>
    );
};

export default RegionFeeders;
