import styles from "../styles/LongDetailsWidget.module.css";
import FullDetailLineChart from "../components/graphs/FullDetailLineChart/FullDetailLineChart";
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Buttons from "../components/ui/Buttons/Buttons";
import { useState, useEffect } from "react";

// Dummy data for the detailed graph
const detailedGraphData = {
  daily: {
    xAxis: [
      "2025-03-16 23:59:59", "2025-03-16 23:45:00", "2025-03-16 23:30:00",
      "2025-03-16 23:15:00", "2025-03-16 23:00:00", "2025-03-16 22:45:00",
      "2025-03-16 22:30:00", "2025-03-16 22:15:00", "2025-03-16 22:00:00",
      "2025-03-16 21:45:00", "2025-03-16 21:30:00", "2025-03-16 21:15:00",
      "2025-03-16 21:00:00", "2025-03-16 20:45:00", "2025-03-16 20:30:00"
    ],
    series: [
      {
        name: 'Current Day',
        data: [13.6, 13.2, 13.0, 12.8, 12.6, 12.4, 12.2, 12.0, 11.8, 11.6, 11.4, 11.2, 11.0, 10.8, 10.6]
      },
      {
        name: 'Previous Day',
        data: [13.2, 12.8, 12.6, 12.4, 12.2, 12.0, 11.8, 11.6, 11.4, 11.2, 11.0, 10.8, 10.6, 10.4, 10.2]
      }
    ]
  }
};
const LongDetailsWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { region, regionId, edcId, substationId, feederId } = useParams();
  const [timeRange, setTimeRange] = useState('Daily');
  /* const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  }); */

  // Determine the type of view based on URL parameters and pathname
  let viewType = 'regions';
  let entityId = regionId || region;

  console.log('LongDetailsWidget - URL params:', { region, regionId, edcId, substationId, feederId });
  console.log('LongDetailsWidget - Current path:', location.pathname);

  // If we're in the user route with region/dashboard pattern, make sure we use 'regions' viewType
  if (location.pathname.includes('/user/') && location.pathname.includes('/dashboard')) {
    viewType = 'regions';
    entityId = region;
    console.log('LongDetailsWidget - Using new URL pattern with region:', entityId);
  } else if (feederId) {
    viewType = 'feeders';
    entityId = feederId;
  } else if (substationId) {
    viewType = 'substations';
    entityId = substationId;
  } else if (edcId) {
    viewType = 'edcs';
    entityId = edcId;
  }

  // Provide a proper entityId if none is found or if it's invalid
  if (!entityId || entityId === 'undefined' || entityId === 'dashboard') {
    // Try to get the region from localStorage
    try {
      const loginInfo = localStorage.getItem('loginInfo');
      if (loginInfo) {
        const parsedLoginInfo = JSON.parse(loginInfo);
        const userRegion = parsedLoginInfo?.user?.region;

        if (userRegion) {
          entityId = userRegion.toLowerCase();
          console.log('LongDetailsWidget - Using region from localStorage:', entityId);
        } else {
          console.error('LongDetailsWidget - CRITICAL: Unable to determine region');
          // We'll continue rendering with the undefined value, but we should log this
        }
      }
    } catch (e) {
      console.error('LongDetailsWidget - Error getting region from localStorage:', e);
    }
  } else {
    // Standardize entityId to lowercase for consistency
    entityId = entityId.toLowerCase();
  }

  console.log('LongDetailsWidget - Using entityId:', entityId, 'viewType:', viewType);

  // Format the entity name for display
  const entityName = entityId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Dummy data - in a real app, this would come from an API
  const stats = {
    edcCount: 8,
    substationCount: 25,
    feederCount: 45,
    currentValue: 13.6,
    previousValue: 12.8
  };

  // Calculate percentage change
  const percentageChange = ((stats.currentValue - stats.previousValue) / stats.previousValue * 100).toFixed(1);
  const isPositiveChange = stats.currentValue >= stats.previousValue;

  // Determine if we're in admin or user route
  const isUserRoute = location.pathname.includes('/user/');
  const baseRoute = isUserRoute ? '/user' : '/admin';

  return (
    <div className={styles.main_content}>
      <div className={styles.section_header}>
        <h2 className="title">{entityName} Region</h2>
        <div className={styles.action_container}>
          {/* <div className={styles.date_range}>
            <div className={styles.search_cont}>
              <DatePicker
                selected={dateRange.start}
                onChange={(date) =>
                  setDateRange({ ...dateRange, start: date })
                }
                dateFormat="MMM dd, yyyy"
                placeholderText="Start Date"
              />
              <span className="icons icon_placement">
                <img src="icons/date.svg" alt="Calendar" />
              </span>
            </div>

            <div className={styles.search_cont}>
              <DatePicker
                selected={dateRange.end}
                onChange={(date) =>
                  setDateRange({ ...dateRange, end: date })
                }
                dateFormat="MMM dd, yyyy"
                placeholderText="End Date"
                minDate={dateRange.start}
              />
              <span className="icons icon_placement">
                <img src="icons/date.svg" alt="Calendar" />
              </span>
            </div>
            <Buttons
              label="Get Reports"
              variant="primary"
              alt="GetReports"
              icon="icons/reports.svg"
              iconPosition="left"
            />
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

      {isUserRoute ? (
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: `/user/${entityId}/dashboard` },
            { label: `Region : ${entityName}`, path: `/user/${entityId}/dashboard` }
          ]}
        />
      ) : (
        <Breadcrumb />
      )}

      <div className={styles.performance_stats}>
        <div className={styles.total_edcs_container}>
          <div className={styles.total_main_info}>
            <div className={styles.TNEB_icons}>
              <img src="icons/electric-edc.svg" alt="EDC" className={styles.TNEB_icons} />
            </div>
            <div className={styles.total_title_value}>
              <span className='title'>
                <Link to={entityId ? `${baseRoute}/${entityId}/edcs` : `${baseRoute}/edcs`}>
                  EDCs
                </Link>
              </span>
              <span className={styles.summary_value}>{stats.edcCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.total_substations_container}>
          <div className={styles.total_main_info}>
            <div className={styles.TNEB_icons}>
              <img src="icons/electric-factory.svg" alt="Substation" className={styles.TNEB_icons} />
            </div>
            <div className={styles.total_title_value}>
              <span className='title'>
                <Link to={entityId ? `${baseRoute}/${entityId}/substations` : `${baseRoute}/substations`}>
                  Substations
                </Link>
              </span>
              <span className={styles.summary_value}>{stats.substationCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.total_meters_container}>
          <div className={styles.total_main_info}>
            <div className={styles.TNEB_icons}>
              <img src="icons/electric-meter.svg" alt="Feeder" className={styles.TNEB_icons} />
            </div>

            <div className={styles.total_title_value}>
              <span className='title'>
                <Link to={entityId ? `${baseRoute}/${entityId}/feeders` : `${baseRoute}/feeders`}>
                  Feeders
                </Link>
              </span>
              <span className={styles.summary_value}>{stats.feederCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.total_units_container}>
          <div className={styles.total_main_info}>
            {/* Location */}
            <div className={styles.total_main_info}>


              <div className={styles.TNEB_icons}>
                <img src="icons/electric-meter.svg" alt="Feeder" className={styles.TNEB_icons} />
              </div>

              <div className={styles.total_title_value}>
                <span className='title'>Location</span>
                <span className={styles.summary_value}>{stats.feederCount}</span>
              </div>
            </div>
            {/* <div className={styles.total_title_value}>
              <span className='title'>Actual Demand</span>
              <span className={`${styles.summary_value} ${isPositiveChange ? styles.positive : styles.negative}`}>
                {stats.currentValue} MW
                <div className={styles.percentage_change} >
                  <img
                    src={isPositiveChange ? "icons/up-right-arrow.svg" : "icons/down-right-arrow.svg"}
                    alt={isPositiveChange ? "Increase" : "Decrease"}
                    className={isPositiveChange ? styles.communication_positive_arrow_ : styles.communication_negative_arrow}
                  />
                  {Math.abs(percentageChange)}%
                </div>
              </span>
            </div> */}

            {/* Communication Your are Working here */}
            <div className={styles.regions_communication_info}>
              <div className="titles">Communication Status</div>
              <div className={styles.overall_communication_status}>
                <div className={styles.communication_status_container}>
                  <div className={styles.communication_value}>{stats.feederCount}</div>
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
                  <div className={styles.communication_value}>{stats.feederCount}</div>
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
      </div>

      <div className={styles.details_section}>
        <div className={styles.details_card}>
          <div className={styles.details_header}>
            {/* <h3>Actual Demand Graph</h3> */}
          </div>
          <div className={styles.detail_chart}>
            <FullDetailLineChart
              title="Actual Demand Graph"
              data={detailedGraphData}
              seriesColors={['#3f68b2', '#ed8c22']}
              yAxisLabel="MW"
              showLabel={false}
              toolbox={true}
              height="500px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LongDetailsWidget; 