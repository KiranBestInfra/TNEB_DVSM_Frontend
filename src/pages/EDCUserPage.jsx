import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';

const EDCUserPage = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const { region } = useParams();
    const location = useLocation();

    // Determine if this is a region user path
    const isRegionUser = location.pathname.includes('/user/') &&
        !location.pathname.includes('/admin/');
    const currentBaseRoute = '/user';

    const [widgetsData, setWidgetsData] = useState({
        totalRegions: 0,
        totalEdcs: 0,
        totalSubstations: 0,
        totalFeeders: 0,
        commMeters: 0,
        nonCommMeters: 0,
        edcNames: [],
        regionEdcCount: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(
                'http://localhost:3000/api/v1/regions/widgets'
            );
            const data = await response.json();
            const regionWidgets = data.data;

            setWidgetsData((prev) => ({
                ...prev,
                totalRegions: regionWidgets.totalRegions || prev.totalRegions,
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

        const fetchEdcNames = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/v1/edcs/widgets/${region}`
                );
                const data = await response.json();

                setWidgetsData((prev) => ({
                    ...prev,
                    edcNames: data.data?.edcNames || [],
                    regionEdcCount: data.data?.edcNames?.length || 0,
                    substationNames: data.data?.substationNames || [],
                    regionSubstationCount:
                        data.data?.substationNames?.length || 0,
                }));
            } catch (error) {
                console.error('Error fetching EDC names:', error);
            }
        };

        fetchEdcNames();
    }, [region]);

    // EDC substation counts
    const edcSubstationCounts = {
        'Chennai North': 18,
        'Chennai South': 22,
        'Chennai Central': 20,
        'Chennai West': 15,
        'Coimbatore North': 16,
        'Coimbatore South': 19,
        'Madurai Urban': 17,
        'Madurai Rural': 14,
        'Trichy Urban': 15,
        'Trichy Rural': 13,
        'Thanjavur': 16,
        'Villupuram': 14,
        'Vellore': 17,
        'Salem': 18,
        'Erode': 16,
    };

    // EDC feeder counts
    const edcFeederCounts = {
        'Chennai North': 35,
        'Chennai South': 42,
        'Chennai Central': 38,
        'Chennai West': 32,
        'Coimbatore North': 28,
        'Coimbatore South': 34,
        'Madurai Urban': 30,
        'Madurai Rural': 25,
        'Trichy Urban': 28,
        'Trichy Rural': 24,
        'Thanjavur': 29,
        'Villupuram': 26,
        'Vellore': 31,
        'Salem': 33,
        'Erode': 29,
    };

    // EDC consumption stats
    const edcStats = {
        'Chennai North': { currentValue: 380, previousValue: 350 },
        'Chennai South': { currentValue: 420, previousValue: 390 },
        'Chennai Central': { currentValue: 390, previousValue: 360 },
        'Chennai West': { currentValue: 360, previousValue: 340 },
        'Coimbatore North': { currentValue: 340, previousValue: 310 },
        'Coimbatore South': { currentValue: 370, previousValue: 350 },
        'Madurai Urban': { currentValue: 350, previousValue: 320 },
        'Madurai Rural': { currentValue: 310, previousValue: 290 },
        'Trichy Urban': { currentValue: 330, previousValue: 300 },
        'Trichy Rural': { currentValue: 290, previousValue: 270 },
        'Thanjavur': { currentValue: 320, previousValue: 300 },
        'Villupuram': { currentValue: 300, previousValue: 280 },
        'Vellore': { currentValue: 340, previousValue: 310 },
        'Salem': { currentValue: 350, previousValue: 320 },
        'Erode': { currentValue: 330, previousValue: 300 },
    };

    // Build breadcrumb items based on current path
    const getBreadcrumbItems = () => {
        if (isRegionUser && region) {
            const formattedRegionName = region.charAt(0).toUpperCase() + region.slice(1);
            return [
                { label: 'Dashboard', path: '/user/dashboard' },
                { label: `Region : ${formattedRegionName}`, path: `/user/${region}/dashboard` },
                { label: 'EDCs', path: `/user/${region}/edcs` }
            ];
        } else {
            return [
                { label: 'Dashboard', path: `${currentBaseRoute}/dashboard` },
                { label: 'EDCs', path: `${currentBaseRoute}/edcs` }
            ];
        }
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">EDCs</h2>
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
                                className={styles.time_range_select_dropdown_icon}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Breadcrumb items={getBreadcrumbItems()} />
            <div className={styles.summary_section}>
                <div className={styles.total_regions_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/office.svg"
                            alt="Total Regions"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link to={`${currentBaseRoute}/regions`}>
                                    Regions
                                </Link>
                            </p>
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
                            alt="Total Region"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link to={region ? `${currentBaseRoute}/${region}/edcs` : `${currentBaseRoute}/edcs`}>
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
                                <Link to={region ? `${currentBaseRoute}/${region}/substations` : `${currentBaseRoute}/substations`}>
                                    Substations
                                </Link>
                            </p>
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
                            <div className="title">
                                <Link to={region ? `${currentBaseRoute}/${region}/feeders` : `${currentBaseRoute}/feeders`}>
                                    Feeders
                                </Link>
                            </div>
                            <div className={styles.summary_value}>
                                {widgetsData.totalFeeders}
                            </div>
                        </div>
                    </div>
                    <div className={styles.metrics_communication_info}>
                        <div className="titles">Communication Status</div>
                        <div className={styles.overall_communication_status}>
                            <div className={styles.communication_status_container}>
                                <div className={styles.communication_value}>
                                    {widgetsData.commMeters}
                                </div>
                                <div className={styles.communication_positive_percentage}>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={styles.communication_positive_arrow}
                                    />
                                    87%
                                </div>
                            </div>
                            <div className={styles.communication_status_container}>
                                <div className={styles.communication_value}>
                                    {widgetsData.nonCommMeters}
                                </div>
                                <div className={styles.communication_negative_percentage}>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={styles.communication_negative_arrow}
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
                    EDCs:{' '}
                    <span className={styles.region_count}>
                        [{widgetsData.regionEdcCount}]
                    </span>
                </h2>
            </div>
            <div className={styles.region_stats_container}>
                {widgetsData.edcNames && widgetsData.edcNames.length > 0 ? (
                    widgetsData.edcNames.map((edc, index) => (
                        <div
                            key={index}
                            className={styles.individual_region_stats}>
                            <ShortDetailsWidget
                                region={edc}
                                substationCount={
                                    edcSubstationCounts?.[edc] || 0
                                }
                                feederCount={edcFeederCounts?.[edc] || 0}
                                currentValue={
                                    edcStats?.[edc]?.currentValue || 0
                                }
                                previousValue={
                                    edcStats?.[edc]?.previousValue || 0
                                }
                                pageType="edcs"
                            />
                        </div>
                    ))
                ) : (
                    <p>No EDCs available for this region.</p>
                )}
            </div>
        </div>
    );
};

export default EDCUserPage; 