import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
import { apiClient } from '../api/client';
import ShortDetailsWidget from './ShortDetailsWidget';

const RegionEdcs = () => {
    const { region } = useParams();
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [timeRange, setTimeRange] = useState("Daily");
    const cacheTimeoutRef = useRef(null);
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
                    //   totalDistricts: 0,
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

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

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
        if (socket && widgetsData.edcNames.length > 0) {
            socket.emit('subscribeEdc', {
                edcs: widgetsData.edcNames,
                region: region,
            });
        }
    }, [widgetsData.edcNames, socket, region]);

    useEffect(() => {
        const fetchEdcs = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/edcs/widgets/${region}`);
                const data = response.data || {};
                console.log('Fetched EDC data:', data);

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
                    //  totalDistricts: data.totalDistricts || data.edcNames?.length || 0,
                    totalDistricts:
                        data.districtCount?.[0]?.district_count || 0,
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
                setLoading(false);
            }
        };

        if (region) {
            fetchEdcs();
        }
    }, [region]);

    const regionName = region
        ? region
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : 'Unknown';

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{regionName} - EDCs</h2>
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
                    totalEdcs: widgetsData.totalEdcs,
                    totalSubstations: widgetsData.totalSubstations,
                    totalFeeders: widgetsData.totalFeeders,
                    commMeters: `${(
                        (widgetsData.commMeters /
                            (widgetsData.commMeters +
                                widgetsData.nonCommMeters)) *
                        100
                    ).toFixed(1)}%`,
                    nonCommMeters: widgetsData.nonCommMeters,
                    totalDistricts: widgetsData.totalDistricts,
                }}
                isUserRoute={location.pathname.includes('/user/')}
                isBiUserRoute={location.pathname.includes('/bi/user/')}
                showRegions={false}
                showDistricts={true}
            />

            <div className={styles.section_header}>
                <h2 className="title">
                    EDCs:{' '}
                    <span className={styles.region_count}>
                        [ {widgetsData.totalEdcs} ]
                    </span>
                </h2>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading EDCs...</div>
            ) : (
                <div className={styles.region_stats_container}>
                    {widgetsData.edcNames.map((edc, index) => (
                        <div
                            key={index}
                            className={styles.individual_region_stats}>
                            <ShortDetailsWidget
                                region={region}
                                edc={edc}
                                name={edc}
                                substationCount={
                                    widgetsData.substationCount[edc] || 0
                                }
                                feederCount={widgetsData.feederCount[edc] || 0}
                                edcCount={widgetsData.totalEdcs}
                                graphData={
                                    widgetsData.edcDemandData?.[edc.trim()] ?? {
                                        xAxis: [],
                                        series: [],
                                    }
                                }
                                currentValue={parseFloat(
                                    widgetsData.edcDemandData?.[
                                        edc.trim()
                                    ]?.series?.[0]?.data?.slice(-1)[0] || 0
                                ).toFixed(1)}
                                previousValue={parseFloat(
                                    widgetsData.edcDemandData?.[
                                        edc.trim()
                                    ]?.series?.[0]?.data?.slice(-2, -1)[0] || 0
                                ).toFixed(1)}
                                pageType="edcs"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RegionEdcs;
