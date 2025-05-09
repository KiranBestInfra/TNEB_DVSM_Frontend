import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';

const SubstationsUserPage = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const { region } = useParams();
    const location = useLocation();

    // Determine if this is a region user path
    const isRegionUser =
        location.pathname.includes('/user/') &&
        !location.pathname.includes('/admin/');
    const currentBaseRoute = '/user';

    const [widgetsData, setWidgetsData] = useState({
        totalEdcs: 0,
        totalSubstations: 0,
        totalFeeders: 0,
        commMeters: 0,
        nonCommMeters: 0,
        substationNames: [],
        regionSubstationCount: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiClient.get(`/regions/widgets`);
            const data = await response.json();
            const regionWidgets = data.data;

            setWidgetsData((prev) => ({
                ...prev,
                totalEdcs: regionWidgets.totalEdcs || prev.totalEdcs,
                totalSubstations:
                    regionWidgets.totalSubstations || prev.totalSubstations,
                totalFeeders: regionWidgets.totalFeeders || prev.totalFeeders,
                commMeters: regionWidgets.commMeters || prev.commMeters,
                nonCommMeters:
                    regionWidgets.nonCommMeters || prev.nonCommMeters,
            }));
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!region) return;

        const substationNames = async () => {
            try {
                const response = await apiClient.get(
                    `/edcs/widgets/${region}/substations`
                );
                const data = response;

                setWidgetsData((prev) => ({
                    ...prev,
                    substationNames: data.data?.substationNames || [],
                    regionSubstationCount:
                        data.data?.substationNames?.length || 0,
                }));
            } catch (error) {
                console.error('Error fetching substation names:', error);
                try {
                    await apiClient.post('/log/error', {
                        message: error.message,
                        stack: error.stack || 'No stack trace',
                        time: new Date().toISOString(),
                    });
                } catch (logError) {
                    console.error('Error logging to backend:', logError);
                }
            }
        };

        substationNames();
    }, [region]);

    const getBreadcrumbItems = () => {
        if (isRegionUser && region) {
            const formattedRegionName =
                region.charAt(0).toUpperCase() + region.slice(1);
            return [
                { label: 'Dashboard', path: '/user/dashboard' },
                {
                    label: `Region : ${formattedRegionName}`,
                    path: `/user/${region}/dashboard`,
                },
                { label: 'Substations', path: `/user/${region}/substations` },
            ];
        } else {
            return [
                { label: 'Dashboard', path: `${currentBaseRoute}/dashboard` },
                {
                    label: 'Substations',
                    path: `${currentBaseRoute}/substations`,
                },
            ];
        }
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">Substations</h2>
                <div className={styles.action_container}>
                    <div className={styles.action_cont}>
                        <div className={styles.time_range_select_dropdown}>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={styles.time_range_select}>
                                <option value="Last30days">Last 30 Days</option>
                                <option value="Daily">Daily</option>
                                <option value="Monthly">Monthly</option>
                                <option value="PreviousMonth">Last Week</option>
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
            <div className={styles.summary_section}>
                <div className={styles.total_edcs_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-edc.svg"
                            alt="Total Region"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link
                                    to={
                                        region
                                            ? `${currentBaseRoute}/${region}/edcs`
                                            : `${currentBaseRoute}/edcs`
                                    }>
                                    EDCs
                                </Link>
                            </p>
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
                            <p className="title">
                                <Link
                                    to={
                                        region
                                            ? `${currentBaseRoute}/${region}/substations`
                                            : `${currentBaseRoute}/substations`
                                    }>
                                    Substations
                                </Link>
                            </p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalSubstations}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_feeder_container}>
                    <div className={styles.total_meters_main_info}>
                        <img
                            src="icons/electric-meter.svg"
                            alt="Total Meters"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_meters}>
                            <div className="title">
                                <Link
                                    to={
                                        region
                                            ? `${currentBaseRoute}/${region}/feeders`
                                            : `${currentBaseRoute}/feeders`
                                    }>
                                    Feeders
                                </Link>
                            </div>
                            <div className={styles.summary_value}>
                                {widgetsData.totalFeeders}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_meters_container}>
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
                    Substations:{' '}
                    <span className={styles.region_count}>
                        [{widgetsData.regionSubstationCount}]
                    </span>
                </h2>
            </div>
            <div className={styles.region_stats_container}>
                {widgetsData.substationNames &&
                widgetsData.substationNames.length > 0 ? (
                    widgetsData.substationNames.map((substation, index) => (
                        <div
                            key={index}
                            className={styles.individual_region_stats}>
                            <ShortDetailsWidget
                                region={substation}
                                feederCount={
                                    substationFeederCounts?.[substation] || 0
                                }
                                currentValue={
                                    substationStats?.[substation]
                                        ?.currentValue || 0
                                }
                                previousValue={
                                    substationStats?.[substation]
                                        ?.previousValue || 0
                                }
                                pageType="substations"
                                showInfoIcon={true}
                            />
                        </div>
                    ))
                ) : (
                    <p>No substations available for this region.</p>
                )}
            </div>
        </div>
    );
};

export default SubstationsUserPage;
