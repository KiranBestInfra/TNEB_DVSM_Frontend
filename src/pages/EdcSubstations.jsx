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

const EdcSubstations = () => {
    const { edcs } = useParams();
    const [socket, setSocket] = useState(null);
    const cacheTimeoutRef = useRef(null);
    const location = window.location.pathname;

    // Demo data for when API is unavailable
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
                    totalSubstations: 0,
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
            edcSubstationCount: 0,
            totalDistricts: 0,
            substationNames: [],
            substationFeederCounts: {},
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
                    substationNames:
                        data.substationNames || prevData.substationNames,
                    substationFeederCounts:
                        data.substationFeederCounts ||
                        prevData.substationFeederCounts,
                    edcSubstationCount:
                        data.substationNames?.length ||
                        prevData.edcSubstationCount,
                    totalDistricts:
                        data.totalDistricts ||
                        data.substationNames?.length ||
                        prevData.totalDistricts,
                };

                const cacheData = {
                    substationNames: newData.substationNames,
                    substationFeederCounts: newData.substationFeederCounts,
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
        if (socket && edcs) {
            socket.emit('subscribeSubstation', {
                edc: edcs,
            });
        }
    }, [edcs, socket]);

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

                    // Use demo data if API fails
                    setWidgetsData((prev) => ({
                        ...prev,
                        totalRegions: 5,
                        totalEdcs: 9,
                        totalSubstations: 162,
                        totalFeeders: 871,
                        commMeters: 735,
                        nonCommMeters: 246,
                    }));
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
                    console.error(
                        'API error, using demo data for substations:',
                        error
                    );

                    // Use demo data if API fails
                    setWidgetsData((prev) => {
                        const newData = {
                            ...prev,
                            substationNames: demoSubstationNames,
                            edcSubstationCount: demoSubstationNames.length,
                            totalDistricts: demoSubstationNames.length,
                            substationFeederCounts: demoSubstationFeederCounts,
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
                }
            } catch (error) {
                console.error('Error fetching substation names:', error);
            }
        };

        substationNames();
    }, [edcs]);

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
                            totalSubstations: widgetsData.totalSubstations,
                            totalFeeders: widgetsData.totalFeeders,
                            commMeters: `${(
                                (widgetsData.commMeters /
                                    (widgetsData.commMeters +
                                        widgetsData.nonCommMeters)) *
                                100
                            ).toFixed(1)}%`,
                            nonCommMeters: `${(
                                (widgetsData.nonCommMeters /
                                    (widgetsData.commMeters +
                                        widgetsData.nonCommMeters)) *
                                100
                            ).toFixed(1)}%`,
                            totalDistricts: widgetsData.totalDistricts,
                        }}
                        isUserRoute={location.includes('/user/')}
                        isBiUserRoute={location.includes('/bi/user/')}
                        showRegions={true}
                        showDistricts={false}
                    />

                    <div className={styles.section_header}>
                        <h2 className="title">
                            Substations{' '}
                            <span className={styles.region_count}>
                                {widgetsData.edcSubstationCount}
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
                                              feederCount={
                                                  widgetsData
                                                      .substationFeederCounts?.[
                                                      substation
                                                  ] || 0
                                              }
                                              currentValue={42}
                                              previousValue={38}
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
