import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import { io } from 'socket.io-client';
import SummarySection from '../components/SummarySection';

const RegionFeeders = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const { region } = useParams();
    const [socket, setSocket] = useState(null);

    const location = window.location.pathname;
    const isUserRoute = location.includes('/user/');

    const feederStats = {
        'Adyar Feeder 1': { currentValue: 850, previousValue: 780 },
        'Velachery Feeder 2': { currentValue: 720, previousValue: 680 },
        'T Nagar Feeder 3': { currentValue: 920, previousValue: 850 },
        'Mylapore Feeder 4': { currentValue: 780, previousValue: 720 },
        'Anna Nagar Feeder 5': { currentValue: 820, previousValue: 760 },
        'Porur Feeder 6': { currentValue: 680, previousValue: 620 },
        'Ambattur Feeder 7': { currentValue: 740, previousValue: 680 },
        'Perambur Feeder 8': { currentValue: 700, previousValue: 650 },
        'Guindy Feeder 9': { currentValue: 840, previousValue: 780 },
        'Kodambakkam Feeder 10': { currentValue: 760, previousValue: 700 },
        'Royapuram Feeder 11': { currentValue: 680, previousValue: 620 },
        'Thiruvanmiyur Feeder 12': { currentValue: 800, previousValue: 740 },
        'Kilpauk Feeder 13': { currentValue: 720, previousValue: 660 },
        'Egmore Feeder 14': { currentValue: 640, previousValue: 580 },
        'Nungambakkam Feeder 15': { currentValue: 780, previousValue: 720 },
    };

    const [widgetsData, setWidgetsData] = useState(() => {
        const savedFeederData = localStorage.getItem('feederDemandData');
        const savedTimestamp = localStorage.getItem('feederDemandTimestamp');

        if (savedFeederData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedFeederData = JSON.parse(savedFeederData);
                return {
                    totalRegions: 13,
                    totalEdcs: 95,
                    totalSubstations: 260,
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
            totalRegions: 13,
            totalEdcs: 95,
            totalSubstations: 260,
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

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

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

        if (region) {
            fetchFeeders();
        }
    }, [region]);

    const regionName = region
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
                isUserRoute={isUserRoute}
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
                                        )[0] ||
                                            widgetsData.feederStats[key]
                                                ?.previousValue ||
                                            feederStats[key]?.previousValue ||
                                            0
                                    )}
                                    currentValue={parseFloat(
                                        widgetsData.feederDemandData?.[
                                            value
                                        ]?.series?.[0]?.data?.slice(-1)[0] ||
                                            widgetsData.feederStats[key]
                                                ?.currentValue ||
                                            feederStats[key]?.currentValue ||
                                            0
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
