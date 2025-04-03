import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';

const FeedersUserPage = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const { region } = useParams();
    const location = useLocation();

    // Determine if this is a region user path
    const isRegionUser = location.pathname.includes('/user/') ||
        (location.pathname.includes('/user/') &&
            !location.pathname.includes('/admin/'));
    const currentBaseRoute = isRegionUser ?
        (location.pathname.includes('/user/') ? '/user' : '/user') :
        (location.pathname.includes('/user/') ? '/user' : '/admin');

    const [widgetsData, setWidgetsData] = useState({
        totalEdcs: 0,
        totalSubstations: 0,
        totalFeeders: 0,
        commMeters: 0,
        nonCommMeters: 0,
        feederNames: [],
        regionFeederCount: 0,
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
        console.log('region', region);
        if (!region) return;

        const fetchFeederNames = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/v1/edcs/widgets/${region}`
                );
                const data = await response.json();
                console.log('Fetched Feeder Data:', data);

                setWidgetsData((prev) => ({
                    ...prev,
                    feederNames: data.data?.feederNames || [],
                    regionFeederCount: data.data?.feederNames?.length || 0,
                }));
            } catch (error) {
                console.error(
                    'Error fetching feeder names:',
                    error
                );
            }
        };

        fetchFeederNames();
    }, [region]);

    console.log('widgetsData', widgetsData);

    // Feeder meter counts
    const feederMeterCounts = {
        "Adyar Feeder 1": 45,
        "Velachery Feeder 2": 38,
        "T Nagar Feeder 3": 42,
        "Mylapore Feeder 4": 35,
        "Anna Nagar Feeder 5": 40,
        "Porur Feeder 6": 32,
        "Ambattur Feeder 7": 36,
        "Perambur Feeder 8": 34,
        "Guindy Feeder 9": 41,
        "Kodambakkam Feeder 10": 37,
        "Royapuram Feeder 11": 33,
        "Thiruvanmiyur Feeder 12": 39,
        "Kilpauk Feeder 13": 35,
        "Egmore Feeder 14": 31,
        "Nungambakkam Feeder 15": 38
    };

    // Feeder consumption stats
    const feederStats = {
        "Adyar Feeder 1": { currentValue: 850, previousValue: 780 },
        "Velachery Feeder 2": { currentValue: 720, previousValue: 680 },
        "T Nagar Feeder 3": { currentValue: 920, previousValue: 850 },
        "Mylapore Feeder 4": { currentValue: 780, previousValue: 720 },
        "Anna Nagar Feeder 5": { currentValue: 820, previousValue: 760 },
        "Porur Feeder 6": { currentValue: 680, previousValue: 620 },
        "Ambattur Feeder 7": { currentValue: 740, previousValue: 680 },
        "Perambur Feeder 8": { currentValue: 700, previousValue: 650 },
        "Guindy Feeder 9": { currentValue: 840, previousValue: 780 },
        "Kodambakkam Feeder 10": { currentValue: 760, previousValue: 700 },
        "Royapuram Feeder 11": { currentValue: 680, previousValue: 620 },
        "Thiruvanmiyur Feeder 12": { currentValue: 800, previousValue: 740 },
        "Kilpauk Feeder 13": { currentValue: 720, previousValue: 660 },
        "Egmore Feeder 14": { currentValue: 640, previousValue: 580 },
        "Nungambakkam Feeder 15": { currentValue: 780, previousValue: 720 }
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">Feeders</h2>
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
                    Feeders:{' '}
                    <span className={styles.region_count}>
                        [{widgetsData.regionFeederCount}]
                    </span>
                </h2>
            </div>
            <div className={styles.region_stats_container}>
                {widgetsData.feederNames && widgetsData.feederNames.length > 0 ? (
                    widgetsData.feederNames.map((feeder, index) => (
                        <div
                            key={index}
                            className={styles.individual_region_stats}>
                            <ShortDetailsWidget
                                region={feeder}
                                feederCount={feederMeterCounts?.[feeder] || 0}
                                currentValue={
                                    feederStats?.[feeder]?.currentValue || 0
                                }
                                previousValue={
                                    feederStats?.[feeder]?.previousValue || 0
                                }
                                pageType="feeders"
                            />
                        </div>
                    ))
                ) : (
                    <p>No feeders available for this region.</p>
                )}
            </div>
        </div>
    );
};

export default FeedersUserPage; 