import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client.js';
import useWebSocket from '../hooks/useWebSocket';

const Regions = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('Daily');
    const [widgetsData, setWidgetsData] = useState({
        totalRegions: 0,
        totalEdcs: 0,
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
    });

    const handleWebSocketMessage = (data) => {
        if (data.type === 'regionUpdate') {
            setWidgetsData((prevData) => ({
                ...prevData,
                regionDemandData: {
                    ...prevData.regionDemandData,
                    [data.region]: data.graphData,
                },
            }));
        }
    };

    const { sendMessage } = useWebSocket(
        `ws://your-websocket-server/regions-data`,
        handleWebSocketMessage
    );

    useEffect(() => {
        if (widgetsData.regionNames.length > 0) {
            sendMessage({
                type: 'subscribe',
                regions: widgetsData.regionNames,
            });
        }
    }, [widgetsData.regionNames, sendMessage]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiClient.get('/regions/widgets');
            const data = response.data;
            console.log(data);

            setWidgetsData((prev) => ({
                totalRegions: data.totalRegions || prev.totalRegions,
                totalEdcs: data.totalEdcs || prev.totalEdcs,
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
                regionDemandData:
                    data.regionDemandData || prev.regionDemandData,
                // regionStats: data.regionStats || prev.regionStats,
            }));
        };

        fetchData();
    }, []);


    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">Regions</h2>
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
                        <Buttons
                            label="Get Reports"
                            variant="primary"
                            alt="GetReports"
                            icon="icons/reports.svg"
                            iconPosition="left"
                        />
                    </div>
                </div>
            </div>
            <Breadcrumb
                items={[
                    { label: 'Home', path: '/admin' },
                    { label: 'Regions', path: '/admin/regions' },
                ]}
            />
            <div className={styles.summary_section}>
                <div className={styles.total_regions_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/office.svg"
                            alt="Total Regions"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">Regions</p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalRegions}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_edcs_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-edc.svg"
                            alt="Total EDCs"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">EDCs</p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalEdcs}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_substations_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-factory.svg"
                            alt="Total Substations"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">Substations</p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalSubstations}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_meters_container}>
                    <div className={styles.total_meters_main_info}>
                        <img
                            src="icons/electric-meter.svg"
                            alt="Total Meters"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_meters}>
                            <div className="title">Feeders</div>
                            <div className={styles.summary_value}>
                                {widgetsData.totalFeeders}
                            </div>
                        </div>
                    </div>
                    <div className={styles.metrics_communication_info}>
                        <div className="titles">Communication Status</div>
                        <div className={styles.overall_communication_status}>
                            <div
                                className={
                                    styles.communication_status_container
                                }>
                                <div className={styles.communication_value}>
                                    {widgetsData.commMeters}
                                </div>
                                <div
                                    className={
                                        styles.communication_positive_percentage
                                    }>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={
                                            styles.communication_positive_arrow
                                        }
                                    />
                                    87%
                                </div>
                            </div>
                            <div
                                className={
                                    styles.communication_status_container
                                }>
                                <div className={styles.communication_value}>
                                    {widgetsData.nonCommMeters}
                                </div>
                                <div
                                    className={
                                        styles.communication_negative_percentage
                                    }>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={
                                            styles.communication_negative_arrow
                                        }
                                    />
                                    13%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section_header}>
                <h2 className="title">
                    Regions:{' '}
                    <span className={styles.region_count}>
                        [{widgetsData.totalRegions}]
                    </span>
                </h2>
            </div>

            <div className={styles.region_stats_container}>
                {widgetsData.regionNames &&
                widgetsData.regionNames.length > 0 ? (
                    widgetsData.regionNames.map((region, index) => (
                        <div
                            key={index}
                            className={styles.individual_region_stats}>
                            <ShortDetailsWidget
                                region={region}
                                edcCount={
                                    widgetsData.edcCount?.[region.trim()] || 0
                                }
                                substationCount={
                                    widgetsData.substationCount?.[
                                        region.trim()
                                    ] ?? 0
                                }
                                feederCount={
                                    widgetsData.feederCount?.[region.trim()] ??
                                    0
                                }
                                currentValue={
                                    widgetsData.regionStats?.[region.trim()]
                                        ?.currentValue || 0
                                }
                                previousValue={
                                    widgetsData.regionStats?.[region.trim()]
                                        ?.previousValue || 0
                                }
                                graphData={
                                    widgetsData.regionDemandData?.[
                                        region.trim()
                                    ] ?? {
                                        xAxis: [],
                                        series: [],
                                    }
                                }
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
