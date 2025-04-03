import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ShortDetailsWidget from './ShortDetailsWidget';
import { Link } from 'react-router-dom';

const Feeders = () => {
    const [timeRange, setTimeRange] = useState('Daily');
    const totalMeters = 1243;
    const totalRegions = 13; // Total number of regions
    const totalEDCs = 95; // Total number of EDCs
    const totalSubstations = 260; // Total number of substations
    const totalFeeders = 416; // Total number of feeders

    const { region } = useParams();
    console.log('Feeders - Region from params:', region);

    const location = window.location.pathname;
    const isUserRoute = location.includes('/user/');

    const feederNames = [
        'Adyar Feeder 1',
        'Velachery Feeder 2',
        'T Nagar Feeder 3',
        'Mylapore Feeder 4',
        'Anna Nagar Feeder 5',
        'Porur Feeder 6',
        'Ambattur Feeder 7',
        'Perambur Feeder 8',
        'Guindy Feeder 9',
        'Kodambakkam Feeder 10',
        'Royapuram Feeder 11',
        'Thiruvanmiyur Feeder 12',
        'Kilpauk Feeder 13',
        'Egmore Feeder 14',
        'Nungambakkam Feeder 15',
    ];

    // Feeder meter counts
    const feederMeterCounts = {
        'Adyar Feeder 1': 45,
        'Velachery Feeder 2': 38,
        'T Nagar Feeder 3': 42,
        'Mylapore Feeder 4': 35,
        'Anna Nagar Feeder 5': 40,
        'Porur Feeder 6': 32,
        'Ambattur Feeder 7': 36,
        'Perambur Feeder 8': 34,
        'Guindy Feeder 9': 41,
        'Kodambakkam Feeder 10': 37,
        'Royapuram Feeder 11': 33,
        'Thiruvanmiyur Feeder 12': 39,
        'Kilpauk Feeder 13': 35,
        'Egmore Feeder 14': 31,
        'Nungambakkam Feeder 15': 38,
    };

    // Feeder consumption stats (in kW)
    const feederStats = {
        'Adyar Feeder 1': { currentValue: 850, previousValue: 780 },
        'Velachery Feeder 2': { currentValue: 720, previousValue: 680 },
        'T Nagar Feeder 3': { currentValue: 920, previousValue: 850 },
        'Mylapore Feeder 4': { currentValue: 780, previousValue: 720 },
        'Anna Nagar Feeder 5': { currentValue: 820, previousValue: 760 },
        'Porur Feeder 6': { currentValue: 680, previousValue: 620 },
        'Ambattur Feeder 7': { currentValue: 740, previousValue: 680 },
        'Perambur Feeder 8': { currentValue: 700, previousValue: 650 },
        'Guindy Feeder 9': { currentValue: 840, previousValue: 780 },
        'Kodambakkam Feeder 10': { currentValue: 760, previousValue: 700 },
        'Royapuram Feeder 11': { currentValue: 680, previousValue: 620 },
        'Thiruvanmiyur Feeder 12': { currentValue: 800, previousValue: 740 },
        'Kilpauk Feeder 13': { currentValue: 720, previousValue: 660 },
        'Egmore Feeder 14': { currentValue: 640, previousValue: 580 },
        'Nungambakkam Feeder 15': { currentValue: 780, previousValue: 720 },
    };

    // Sample data for the LineChart
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

    return (
        <div className={styles.main_content}>
            <div className={styles.section_header}>
                <h2 className="title">Feeders</h2>
                <div className={styles.action_container}>
                    {/* <div className={styles.date_range}>
            <div className={styles.search_cont}>
              <DatePicker
                selected={dateRange.start}
                onChange={(date) =>
                  setDateRange({ ...dateRange, start: date })
                }
                className={styles.date_input}
                dateFormat="MMM dd, yyyy"
                placeholderText="Start Date"
              />
              <span className="icons icon_placement">
                <img src="/icons/date.svg" alt="Calendar" />
              </span>
            </div>

            <div className={styles.search_cont}>
              <DatePicker
                selected={dateRange.end}
                onChange={(date) =>
                  setDateRange({ ...dateRange, end: date })
                }
                className={styles.date_input}
                dateFormat="MMM dd, yyyy"
                placeholderText="End Date"
                minDate={dateRange.start}
              />
              <span className="icons icon_placement">
                <img src="/icons/date.svg" alt="Calendar" />
              </span>
            </div>
          
          </div> */}
          <div className={styles.action_cont}>
            <div className={styles.time_range_select_dropdown}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={styles.time_range_select}>
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
                <option value="PreviousMonth">Previous Month</option>
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
        <div className={styles.total_regions_container}>
          <div className={styles.total_main_info}>
            <img src="/icons/office.svg" alt="Total Regions" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">
                <Link to={`${baseRoute}/regions`}>
                  Regions
                </Link>
              </p>
              <div className={styles.summary_value}>{totalRegions}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_edcs_container}>
          <div className={styles.total_main_info}>
            <img src="/icons/electric-edc.svg" alt="Total Region" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">
                <Link to={region ? `${baseRoute}/${region}/edcs` : `${baseRoute}/edcs`}>
                  EDCs
                </Link>
              </p>
              <div className={styles.summary_value}>{totalEDCs}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_substations_container}>
          <div className={styles.total_main_info}>
            <img src="/icons/electric-factory.svg" alt="Total Substations" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">
                <Link to={region ? `${baseRoute}/${region}/substations` : `${baseRoute}/substations`}>
                  Substations
                </Link>
              </p>
              <div className={styles.summary_value}>{totalSubstations}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_meters_container}>
          <div className={styles.total_meters_main_info}>
            <img
              src="/icons/electric-meter.svg"
              alt="Total Meters"
              className={styles.TNEB_icons}
            />
            <div className={styles.total_meters}>
              <div className="title">Feeders</div>
              <div className={styles.summary_value}>{totalMeters}</div>
            </div>
          </div>
          <div className={styles.metrics_communication_info}>
            <div className="titles">Communication Status</div>
            <div className={styles.overall_communication_status}>
              <div className={styles.communication_status_container}>
                <div className={styles.communication_value}>942</div>
                <div className={styles.communication_positive_percentage}>
                  <img
                    src="/icons/up-right-arrow.svg"
                    alt="Positive"
                    className={styles.communication_positive_arrow}
                  />
                  87%
                </div>
              </div>
              <div className={styles.communication_status_container}>
                <div className={styles.communication_value}>301</div>
                <div className={styles.communication_negative_percentage}>
                  <img
                    src="/icons/up-right-arrow.svg"
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
                    Feeders:{' '}
                    <span
                        className={
                            styles.region_count
                        }>{`[ ${totalFeeders} ]`}</span>
                </h2>
            </div>
            <div className={styles.region_stats_container}>
                {feederNames.map((feeder, index) => (
                    <div key={index} className={styles.individual_region_stats}>
                        <ShortDetailsWidget
                            region={feeder}
                            feederCount={feederMeterCounts[feeder]}
                            currentValue={feederStats[feeder].currentValue}
                            previousValue={feederStats[feeder].previousValue}
                            pageType="feeders"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feeders;
