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
    const cacheTimeoutRef = useRef(null);
    const [selectedEdc, setSelectedEdc] = useState(null);
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
                    totalDistricts:
                        data.totalDistricts || data.edcNames?.length || 0,
                    edcNames: data.edcNames || [],
                    substationCount:
                        data.substationCounts?.reduce((acc, item) => {
                            acc[item.edc_name] = item.substation_count || 0;
                            return acc;
                        }, {}) || {},
                    feederCount: data.feederCounts || {},
                    edcDemandData: widgetsData.edcDemandData || {},
                };

                console.log('Communication Meters:', transformedData.commMeters);
                console.log('Non-Communication Meters:', transformedData.nonCommMeters);
                console.log(typeof transformedData.commMeters); // Should be 'number'
                console.log(typeof transformedData.nonCommMeters); // Should be 'number'
                console.log('Total Meters:', transformedData.commMeters + transformedData.nonCommMeters);
                console.log('Communication Percentage:', ((transformedData.commMeters / (transformedData.commMeters + transformedData.nonCommMeters)) * 100).toFixed(1) + '%');
                console.log('Non-Communication Percentage:', ((transformedData.nonCommMeters / (transformedData.commMeters + transformedData.nonCommMeters)) * 100).toFixed(1) + '%');

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

    const handleEdcClick = (edc) => {
        setSelectedEdc(edc);
    };

    // const getSummaryData = () => {
    //     if (!selectedEdc) {
    //         return {
    //             totalEdcs: widgetsData.totalEdcs,
    //             totalSubstations: widgetsData.totalSubstations,
    //             totalFeeders: widgetsData.totalFeeders,
    //             commMeters: `${(
    //                 (widgetsData.commMeters /
    //                     (widgetsData.commMeters +
    //                         widgetsData.nonCommMeters)) *
    //                 100
    //             ).toFixed(1)}%`,
    //             nonCommMeters: `${(
    //                 (widgetsData.nonCommMeters /
    //                     (widgetsData.commMeters +
    //                         widgetsData.nonCommMeters)) *
    //                 100
    //             ).toFixed(1)}%`,
    //         };
    //     }

    //     return {
    //         totalEdcs: 1,
    //         totalSubstations: widgetsData.substationCount[selectedEdc] || 0,
    //         totalFeeders: widgetsData.feederCount[selectedEdc] || 0,
    //         commMeters: `${(
    //             (widgetsData.commMeters /
    //                 (widgetsData.commMeters +
    //                     widgetsData.nonCommMeters)) *
    //             100
    //         ).toFixed(1)}%`,
    //         nonCommMeters: `${(
    //             (widgetsData.nonCommMeters /
    //                 (widgetsData.commMeters +
    //                     widgetsData.nonCommMeters)) *
    //             100
    //         ).toFixed(1)}%`,
    //     };
    // };
    const getSummaryData = () => {
        const comm = widgetsData?.commMeters ?? 0;
        const nonComm = widgetsData?.nonCommMeters ?? 0;
        const total = comm + nonComm;

        const commPercentage = total ? ((comm / total) * 100).toFixed(1) : '0.0';
        const nonCommPercentage = total ? ((nonComm / total) * 100).toFixed(1) : '0.0';

        if (!selectedEdc) {
            return {
                totalEdcs: widgetsData.totalEdcs,
                totalSubstations: widgetsData.totalSubstations,
                totalFeeders: widgetsData.totalFeeders,
                commMeters: `${commPercentage}%`,
                nonCommMeters: `${nonCommPercentage}%`,
            };
        }

        return {
            totalEdcs: 1,
            totalSubstations: widgetsData.substationCount?.[selectedEdc] || 0,
            totalFeeders: widgetsData.feederCount?.[selectedEdc] || 0,
            commMeters: `${commPercentage}%`,
            nonCommMeters: `${nonCommPercentage}%`,
        };
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{regionName} Region EDCs</h2>
            </div>
            <Breadcrumb />

            <SummarySection
                widgetsData={getSummaryData()}
                isUserRoute={location.pathname.includes('/user/')}
                isBiUserRoute={location.pathname.includes('/bi/user/')}
                showRegions={false}
                showDistricts={false}
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
                                handleRegionClick={() => handleEdcClick(edc)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RegionEdcs;
