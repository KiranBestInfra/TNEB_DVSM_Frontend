import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import SummarySection from '../components/SummarySection';
import ShortDetailsWidget from './ShortDetailsWidget';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

const RegionFeeders = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const [feeders, setFeeders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { region } = useParams();

    const location = window.location.pathname;
    const isUserRoute = location.includes('/user/');

    useEffect(() => {
        const fetchFeeders = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/regions/${region}/feeders`
                );
                setFeeders(response.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching feeders for region:', error);
                setLoading(false);
            }
        };

        if (region) {
            fetchFeeders();
        }
    }, [region]);

    const mockFeeders = [
        {
            id: 'feeder-1',
            name: 'Feeder 1',
            meters: 120,
            substation: 'Substation 1',
            edc: 'Central',
            status: 'Active',
            currentValue: 850,
            previousValue: 780,
        },
        {
            id: 'feeder-2',
            name: 'Feeder 2',
            meters: 85,
            substation: 'Substation 2',
            edc: 'North',
            status: 'Active',
            currentValue: 720,
            previousValue: 680,
        },
        {
            id: 'feeder-3',
            name: 'Feeder 3',
            meters: 110,
            substation: 'Substation 1',
            edc: 'Central',
            status: 'Active',
            currentValue: 920,
            previousValue: 850,
        },
        {
            id: 'feeder-4',
            name: 'Feeder 4',
            meters: 75,
            substation: 'Substation 3',
            edc: 'South',
            status: 'Active',
            currentValue: 780,
            previousValue: 720,
        },
        {
            id: 'feeder-5',
            name: 'Feeder 5',
            meters: 95,
            substation: 'Substation 4',
            edc: 'East',
            status: 'Active',
            currentValue: 820,
            previousValue: 760,
        },
    ];

    const displayFeeders = feeders.length > 0 ? feeders : mockFeeders;
    const totalFeeders = displayFeeders.length;
    const totalMeters = displayFeeders.reduce(
        (sum, feeder) => sum + feeder.meters,
        0
    );

    const regionName = region
        ? region
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : 'Unknown';

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">{regionName} Region Feeders</h2>
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
                    totalEdcs: 0,
                    totalSubstations: 0,
                    totalFeeders: totalFeeders,
                    commMeters: 942,
                    nonCommMeters: 301,
                    totalDistricts: 0
                }}
                isUserRoute={isUserRoute}
                isBiUserRoute={location.includes('/bi/user/')}
                showRegions={false}
                showEdcs={false}
                showSubstations={false}
                showDistricts={false}
            />

            <div className={styles.section_header}>
                <h2 className="title">
                    Feeders:{' '}
                    <span
                        className={
                            styles.region_count
                        }>{`[ ${totalFeeders} ]`}</span>
                </h2>
            </div>
            <div className={styles.region_stats_container}>
                {displayFeeders.map((feeder) => (
                    <div
                        key={feeder.id}
                        className={styles.individual_region_stats}>
                        <ShortDetailsWidget
                            region={feeder.name}
                            name={feeder.name}
                            feederCount={feeder.meters}
                            currentValue={feeder.currentValue}
                            previousValue={feeder.previousValue}
                            pageType="feeders"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RegionFeeders;
