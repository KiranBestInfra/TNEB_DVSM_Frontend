import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { apiClient } from '../api/client';

const EDCUserPage = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const { region } = useParams();
    const location = useLocation();

    const isRegionUser =
        location.pathname.includes('/user/') &&
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
                const response = await apiClient.get(`/edcs/widgets/${region}`);
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
                <div className={styles.total_meters_container}>
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
