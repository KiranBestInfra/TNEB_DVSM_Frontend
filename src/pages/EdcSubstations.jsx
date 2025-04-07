import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import SummarySection from '../components/SummarySection';

const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleError = (error) => {
            console.error('Caught error:', error);
            setHasError(true);
            setError(error);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <div
                style={{
                    padding: '20px',
                    color: 'red',
                    background: '#ffeeee',
                    border: '1px solid red',
                }}>
                <h2>Something went wrong</h2>
                <p>{error?.message || 'Unknown error'}</p>
                <button onClick={() => window.history.back()}>Go Back</button>
            </div>
        );
    }

    return children;
};

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};
// useEffect(() => {
//     if (!edcs) return;

//     const substationNames = async () => {
//         try {
//             const response = await apiClient.get(
//                 `/widgets/:edcs/substations`
//             );
//             const data = response;
//             console.log('data', data);

//             setWidgetsData((prev) => ({
//                 ...prev,
//                 substationNames: data.data?.substationNames || [],
//                 regionSubstationCount:
//                     data.data?.substationNames?.length || 0,
//                 substationFeederCounts:
//                     data.data?.substationFeederCounts || {},
//             }));
//         } catch (error) {
//             console.error('Error fetching substation data:', error);
//         }
//     };

//     substationNames();
// }, [edcs]);

const EdcSubstations = () => {
    const { edcs } = useParams();
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const location = window.location.pathname;

    useEffect(() => {
        if (!edcs) return;

        const substationNames = async () => {
            try {
                const response = await apiClient.get(
                    `/substation/widgets/${edcs}/substations`
                );
                const data = response;
                console.log('data', data);

                setWidgetsData((prev) => ({
                    ...prev,
                    substationNames: data.data?.edcsubstationNames || [],
                    regionSubstationCount:
                        data.data?.substationNames?.length || 0,
                    substationFeederCounts:
                        data.data?.substationFeederCountsedc || {},
                }));
            } catch (error) {
                console.error('Error fetching substation data:', error);
            }
        };

        substationNames();
    }, [edcs]);

    const demoSubstationNames = [
        'Adyar Substation',
        'Velachery Substation',
        'T Nagar Substation',
        'Mylapore Substation',
        'Anna Nagar Substation',
        'Tambaram Substation',
        'Guindy Substation',
        'Porur Substation',
        'Kodambakkam Substation',
        'Royapuram Substation',
        'Perambur Substation',
        'Ambattur Substation',
    ];

    const demoSubstationFeederCounts = {
        'Adyar Substation': 8,
        'Velachery Substation': 6,
        'T Nagar Substation': 10,
        'Mylapore Substation': 7,
        'Anna Nagar Substation': 9,
        'Tambaram Substation': 5,
        'Guindy Substation': 8,
        'Porur Substation': 6,
        'Kodambakkam Substation': 7,
        'Royapuram Substation': 4,
        'Perambur Substation': 5,
        'Ambattur Substation': 6,
    };

    const demoSubstationStats = {
        'Adyar Substation': { currentValue: 42, previousValue: 38 },
        'Velachery Substation': { currentValue: 45, previousValue: 40 },
        'T Nagar Substation': { currentValue: 48, previousValue: 42 },
        'Mylapore Substation': { currentValue: 39, previousValue: 35 },
        'Anna Nagar Substation': { currentValue: 44, previousValue: 40 },
        'Tambaram Substation': { currentValue: 41, previousValue: 36 },
        'Guindy Substation': { currentValue: 46, previousValue: 41 },
        'Porur Substation': { currentValue: 40, previousValue: 36 },
        'Kodambakkam Substation': { currentValue: 43, previousValue: 38 },
        'Royapuram Substation': { currentValue: 38, previousValue: 34 },
        'Perambur Substation': { currentValue: 37, previousValue: 33 },
        'Ambattur Substation': { currentValue: 42, previousValue: 37 },
    };

    const graphData = {
        daily: {
            xAxis: [
                '2025-03-16 23:59:59',
                '2025-03-16 08:30:00',
                '2025-03-16 08:15:00',
                '2025-03-16 08:00:00',
                '2025-03-16 07:45:00',
                '2025-03-16 07:30:00',
                '2025-03-16 07:15:00',
                '2025-03-16 07:00:00',
                '2025-03-16 06:45:00',
                '2025-03-16 06:30:00',
                '2025-03-16 06:15:00',
                '2025-03-16 06:00:00',
                '2025-03-16 05:45:00',
                '2025-03-16 05:30:00',
                '2025-03-16 05:15:00',
                '2025-03-16 05:00:00',
                '2025-03-16 04:45:00',
                '2025-03-16 04:30:00',
                '2025-03-16 04:15:00',
                '2025-03-16 04:00:00',
                '2025-03-16 03:45:00',
                '2025-03-16 03:30:00',
                '2025-03-16 03:15:00',
                '2025-03-16 03:00:00',
                '2025-03-16 02:45:00',
                '2025-03-16 02:30:00',
                '2025-03-16 02:15:00',
                '2025-03-16 02:00:00',
                '2025-03-16 01:45:00',
                '2025-03-16 01:30:00',
                '2025-03-16 01:15:00',
                '2025-03-16 01:00:00',
                '2025-03-16 00:45:00',
                '2025-03-16 00:30:00',
                '2025-03-16 00:15:00',
            ],
            series: [
                {
                    name: 'Current Day',
                    data: [
                        13.6, 12.0, 11.2, 11.2, 11.6, 10.4, 12.0, 10.8, 12.4,
                        12.0, 12.8, 13.6, 12.4, 13.6, 12.0, 13.6, 12.8, 13.2,
                        13.6, 12.4, 14.0, 12.4, 14.0, 12.4, 13.6, 12.8, 13.2,
                        14.0, 12.8, 14.0, 12.4, 13.6, 12.4, 13.6, 12.4,
                    ],
                },
                {
                    name: 'Previous Day',
                    data: [
                        13.2, 10.8, 10.0, 11.2, 10.8, 10.8, 11.6, 10.8, 12.0,
                        11.6, 13.2, 12.8, 13.2, 14.0, 12.8, 14.4, 13.2, 14.8,
                        13.6, 14.4, 14.8, 13.2, 14.8, 13.2, 14.4, 13.2, 14.4,
                        13.6, 13.6, 14.4, 13.2, 14.4, 12.8, 14.4, 12.8,
                    ],
                },
            ],
        },
    };

    const demoSubstationDemandData = {};
    demoSubstationNames.forEach((substation) => {
        demoSubstationDemandData[substation] = graphData.daily;
    });

    const [widgetsData, setWidgetsData] = useState(() => {
        const savedSubstationData = localStorage.getItem('substationData');
        const savedTimestamp = localStorage.getItem('substationDataTimestamp');

        if (savedSubstationData && savedTimestamp) {
            const timestamp = parseInt(savedTimestamp);
            const now = Date.now();
            if (now - timestamp < 30000) {
                const parsedData = JSON.parse(savedSubstationData);
                return {
                    totalRegions: 0,
                    totalEdcs: 0,
                    totalsubstations: 0,
                    totalFeeders: 0,
                    commMeters: 0,
                    nonCommMeters: 0,
                    edcSubstationCount: parsedData.substationNames?.length || 0,
                    totalDistricts:
                        parsedData.totalDistricts ||
                        parsedData.substationNames?.length ||
                        0,
                    substationNames: parsedData.substationNames || [],
                    substationFeederCounts:
                        parsedData.substationFeederCounts || {},
                    substationStats: parsedData.substationStats,
                    substationDemandData: parsedData.substationDemandData,
                };
            }
        }

        return {
            totalRegions: 0,
            totalEdcs: 0,
            totalsubstations: 0,
            totalFeeders: 0,
            commMeters: 0,
            nonCommMeters: 0,
            edcSubstationCount: 0,
            totalDistricts: 0,
            substationNames: [],
            substationFeederCounts: {},
            substationStats: {},
            substationDemandData: {},
        };
    });

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_BASE_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('substationUpdate', (data) => {
            setWidgetsData((prevData) => {
                const newData = {
                    ...prevData,
                    // substationNames:
                    //     data.substationNames || prevData.substationNames,
                    // substationFeederCounts:
                    //     data.substationFeederCounts ||
                    //     prevData.substationFeederCounts,
                    // edcSubstationCount:
                    //     data.substationNames?.length ||
                    //     prevData.edcSubstationCount,
                    // totalDistricts:
                    //     data.totalDistricts ||
                    //     data.substationNames?.length ||
                    //     prevData.totalDistricts,
                    // substationStats:
                    //     data.substationStats || prevData.substationStats,
                    ...prevData,
                    substationDemandData: {
                        ...prevData.substationDemandData,
                        [data.substation]: data.graphData,
                    },
                };

                const cacheData = {
                    // substationNames: newData.substationNames,
                    // substationFeederCounts: newData.substationFeederCounts,
                    // totalDistricts: newData.totalDistricts,
                    // substationStats: newData.substationStats,
                    substationDemandData: newData.substationDemandData,
                };

                localStorage.setItem(
                    'substationData',
                    JSON.stringify(cacheData)
                );
                localStorage.setItem(
                    'substationDataTimestamp',
                    Date.now().toString()
                );
                return newData;
            });

            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
            cacheTimeoutRef.current = setTimeout(() => {
                localStorage.removeItem('substationData');
                localStorage.removeItem('substationDataTimestamp');
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
        if (socket && widgetsData.substationNames.length > 0) {
            socket.emit('subscribeSubstation', {
                substations: widgetsData.substationNames,
            });
        }
    }, [widgetsData.substationNames, socket]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                try {
                    const data = await apiClient.get(`/edcs/${edcs}/widgets`);
                    const edcWidgets = data.data;
                    console.log('edcWidgets', edcWidgets);

                    setWidgetsData((prev) => {
                        const newData = {
                            ...prev,
                            // totalRegions:
                            //     edcWidgets.totalRegions || prev.totalRegions,
                            // totalEdcs: edcWidgets.totalEdcs || prev.totalEdcs,
                            totalsubstations:
                                edcWidgets.totalsubstations ||
                                prev.totalsubstations,
                            totalFeeders:
                                edcWidgets.totalFeeders || prev.totalFeeders,
                            commMeters:
                                edcWidgets.commMeters || prev.commMeters,
                            nonCommMeters:
                                edcWidgets.nonCommMeters || prev.nonCommMeters,
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

        if (edcs) {
            fetchData();
        }
    }, [edcs]);

    useEffect(() => {
        if (!edcs) return;

        const substationNames = async () => {
            try {
                try {
                    const response = await apiClient.get(
                        `/edcs/${edcs}/substations`
                    );
                    const data = response;

                    setWidgetsData((prev) => {
                        const newData = {
                            ...prev,
                            substationNames: data.data?.substationNames || [],
                            edcSubstationCount:
                                data.data?.substationNames?.length || 0,
                            totalDistricts:
                                data.data?.totalDistricts ||
                                data.data?.substationNames?.length ||
                                0,
                            substationFeederCounts:
                                data.data?.substationFeederCounts || {},
                        };

                        const cacheData = {
                            substationNames: newData.substationNames,
                            substationFeederCounts:
                                newData.substationFeederCounts,
                            totalDistricts: newData.totalDistricts,
                        };

                        localStorage.setItem(
                            'substationData',
                            JSON.stringify(cacheData)
                        );
                        localStorage.setItem(
                            'substationDataTimestamp',
                            Date.now().toString()
                        );
                        return newData;
                    });
                } catch (error) {
                    console.error('API error fetching substations:', error);
                }
            } catch (error) {
                console.error('Error fetching substation names:', error);
            }
        };

        substationNames();
    }, [edcs]);

    console.log('widgetsData', widgetsData);

    try {
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <div className={styles.section_header}>
                        <h2 className="title">Substations</h2>
                    </div>
                    <Breadcrumb />

                    <SummarySection
                        widgetsData={{
                            totalRegions: widgetsData.totalRegions,
                            totalEdcs: widgetsData.totalEdcs,
                            totalSubstations: widgetsData.totalsubstations,
                            totalFeeders: widgetsData.totalFeeders,
                            commMeters: widgetsData.commMeters,
                            nonCommMeters: widgetsData.nonCommMeters,
                            totalDistricts: widgetsData.totalDistricts,
                        }}
                        isUserRoute={location.includes('/user/')}
                        isBiUserRoute={location.includes('/bi/user/')}
                        showRegions={false}
                        showDistricts={false}
                        showEdcs={false}
                        showSubstations={true}
                    />

                    <div className={styles.section_header}>
                        <h2 className="title">
                            Substations:{' '}
                            <span className={styles.region_count}>
                                {widgetsData.substationNames.length}
                            </span>
                        </h2>
                    </div>
                    <div className={styles.region_stats_container}>
                        {widgetsData.substationNames &&
                        widgetsData.substationNames.length > 0
                            ? widgetsData.substationNames.map(
                                  (substation, index) => (
                                      <div
                                          key={index}
                                          className={
                                              styles.individual_region_stats
                                          }>
                                          <ShortDetailsWidget
                                              region={substation}
                                              edc={edcs}
                                              name={substation}
                                              feederCount={
                                                  widgetsData
                                                      .substationFeederCounts?.[
                                                      substation
                                                  ] || 0
                                              }
                                              currentValue={parseFloat(
                                                  widgetsData.substationDemandData?.[
                                                      substation.trim()
                                                  ]?.series?.[0]?.data?.slice(
                                                      -1
                                                  )[0] || 0
                                              ).toFixed(1)}
                                              previousValue={parseFloat(
                                                  widgetsData.substationDemandData?.[
                                                      substation.trim()
                                                  ]?.series?.[0]?.data?.slice(
                                                      -2,
                                                      -1
                                                  )[0] || 0
                                              ).toFixed(1)}
                                              graphData={
                                                  widgetsData
                                                      .substationDemandData?.[
                                                      substation.trim()
                                                  ] ?? {
                                                      xAxis: [],
                                                      series: [],
                                                  }
                                              }
                                              pageType="substations"
                                          />
                                      </div>
                                  )
                              )
                            : null}
                    </div>
                </div>
            </ErrorBoundary>
        );
    } catch (error) {
        console.error('Error in EdcSubstations component:', error);
        return <div>Error loading substations data</div>;
    }
};

export default EdcSubstations;
