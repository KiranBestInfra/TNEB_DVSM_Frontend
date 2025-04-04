import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';
import PropTypes from 'prop-types';
import SummarySection from '../components/SummarySection/SummarySection';

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
    const [timeframe, setTimeframe] = useState('Last 7 Days');
    const { region, edcs } = useParams();

    const isRegionUser = false;
    const routePrefix = '/admin';

    const [widgetsData, setWidgetsData] = useState({
        totalRegions: 0,
        totalEdcs: 0,
        totalSubstations: 0,
        totalFeeders: 0,
        commMeters: 0,
        nonCommMeters: 0,
        edcSubstationCount: 0,
        substationNames: {},
        substationFeederCounts: {},
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await apiClient.get(`/edcs/${edcs}/widgets`);
                const edcWidgets = data.data;

                setWidgetsData((prev) => ({
                    ...prev,
                    totalRegions: edcWidgets.totalRegions || prev.totalRegions,
                    totalEdcs: edcWidgets.totalEdcs || prev.totalEdcs,
                    totalSubstations:
                        edcWidgets.totalSubstations || prev.totalSubstations,
                    totalFeeders: edcWidgets.totalFeeders || prev.totalFeeders,
                    commMeters: edcWidgets.commMeters || prev.commMeters,
                    nonCommMeters:
                        edcWidgets.nonCommMeters || prev.nonCommMeters,
                }));
            } catch (error) {
                console.error('Error fetching widget data:', error);
            }
        };

        fetchData();
    }, [edcs]);

    useEffect(() => {
        if (!edcs) return;

        const substationNames = async () => {
            try {
                const response = await apiClient.get(
                    `/edcs/${edcs}/substations`
                );
                const data = response;

                setWidgetsData((prev) => ({
                    ...prev,
                    substationNames: data.data?.substationNames || [],
                    edcSubstationCount: data.data?.substationNames?.length || 0,
                    substationFeederCounts:
                        data.data?.substationFeederCounts || {},
                }));
            } catch (error) {
                console.error('Error fetching substation names:', error);
            }
        };

        substationNames();
    }, [edcs]);

    const handleTimeframeChange = (e) => {
        setTimeframe(e.target.value);
    };



    try {
        return (
            <ErrorBoundary>
                <div className={styles.main_content}>
                    <div className={styles.section_header}>
                        <h2 className="title">Substations</h2>
                        <div className={styles.action_container}>
                            <div className={styles.action_cont}>
                                <div
                                    className={
                                        styles.time_range_select_dropdown
                                    }>
                                    <select
                                        value={timeframe}
                                        onChange={handleTimeframeChange}
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
                    <Breadcrumb  />
                  
                    <SummarySection
                        widgetsData={{
                            totalRegions: widgetsData.totalRegions,
                            totalEdcs: widgetsData.totalEdcs,
                            totalSubstations: widgetsData.totalSubstations,
                            totalFeeders: widgetsData.totalFeeders,
                            commMeters: widgetsData.commMeters,
                            nonCommMeters: widgetsData.nonCommMeters,
                            totalDistricts:
                                widgetsData.totalDistricts ||
                                widgetsData.regionSubstationCount ||
                                0,
                        }}
                        isUserRoute={isRegionUser}
                        isBiUserRoute={location.pathname.includes('/bi/user/')}
                        showRegions={false}
                        showEdcs={false}
                        showSubstations={true}
                        showDistricts={true}
                    />
                    <div className={styles.section_header}>
                        <h2 className="title">
                            Substations:{' '}
                            <span className={styles.region_count}>
                                [ {widgetsData.edcSubstationCount} ]
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
                                              currentValue={42} // These values should come from your API
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
