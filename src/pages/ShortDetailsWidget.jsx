import styles from "../styles/ShortDetailsWidget.module.css";
import LineChartTNEB from "../components/graphs/LineChartTNEB/LineChartTNEB";
import { Link } from 'react-router-dom';

// Dummy data for the graph
const graphData = {
  daily: {
    xAxis: [
      "2025-03-16 23:59:59", "2025-03-16 08:30:00", "2025-03-16 08:15:00",
      "2025-03-16 08:00:00", "2025-03-16 07:45:00", "2025-03-16 07:30:00",
      "2025-03-16 07:15:00", "2025-03-16 07:00:00", "2025-03-16 06:45:00",
      "2025-03-16 06:30:00", "2025-03-16 06:15:00", "2025-03-16 06:00:00"
    ],
    series: [
      {
        name: 'Current Day',
        data: [13.6, 12.0, 11.2, 11.2, 11.6, 10.4, 12.0, 10.8, 12.4, 12.0, 12.8, 13.6]
      },
      {
        name: 'Previous Day',
        data: [13.2, 10.8, 10.0, 11.2, 10.8, 10.8, 11.6, 10.8, 12.0, 11.6, 13.2, 12.8]
      }
    ]
  }
};

const ShortDetailsWidget = ({ 
  region, 
  edcCount, 
  substationCount,
  feederCount,
  currentValue, 
  previousValue,
  pageType = 'regions' // Default to 'regions' if not specified
}) => {
  // Calculate percentage change from the props
  const percentageChange = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
  const isPositiveChange = currentValue >= previousValue;

  const renderNavigationLinks = () => {
    switch (pageType) {
      case 'edcs':
        return (
          <>
            <Link to={`/admin/${region.toLowerCase().replace(/\s+/g, '-')}/substations/`} className={styles.nav_link}>
              {substationCount} Substations
            </Link>
            {' / '}
            <Link to={`/admin/${region.toLowerCase().replace(/\s+/g, '-')}/feeders/`} className={styles.nav_link}>
              {feederCount} Feeders
            </Link>
          </>
        );
      case 'substations':
        return (
          <Link to={`/admin/${region.toLowerCase().replace(/\s+/g, '-')}/feeders/`} className={styles.nav_link}>
            {feederCount} Feeders
          </Link>
        );
      case 'feeders':
        return null;
      default:
        return (
          <>
            <Link to={`/admin/${region.toLowerCase().replace(/\s+/g, '-')}/edcs/`} className={styles.nav_link}>
              {edcCount} EDCs
            </Link>
            {' / '}
            <Link to={`/admin/${region.toLowerCase().replace(/\s+/g, '-')}/substations/`} className={styles.nav_link}>
              {substationCount} Substations
            </Link>
            {' / '}
            <Link to={`/admin/${region.toLowerCase().replace(/\s+/g, '-')}/feeders/`} className={styles.nav_link}>
              {feederCount} Feeders
            </Link>
          </>
        );
    }
  };

  return (
    <div className={styles.individual_region}>
      <div className={styles.individual_region_header}>
        <div className={styles.individual_region_header_left}>
          <h3 className={styles.individual_region_header_title}>{region}</h3>
          <p className={styles.navigation_links}>
            {renderNavigationLinks()}
          </p>
        </div>
        <div className={styles.individual_region_header_right}>
          <img
            src="icons/click-through-rate.svg"
            alt="Click Here"
            className={styles.click_individual_region}
          />
        </div>
      </div>
      <div className={styles.individual_region_body}>
        <div className={styles.region_content_wrapper}>
          <div className={styles.region_stats_utilization}>
            <p className="titles">Units Utilization</p>
            <div className={styles.region_stats_values}>
              <div className={styles.region_current_value}>
                {currentValue}
              </div>
              <div className={styles.region_previous_value}>
                {previousValue} MW
              </div>
              <div className={`${styles.region_percentage_change} ${isPositiveChange ? styles.positive : styles.negative}`}>
                <img
                  src={isPositiveChange ? "icons/up-right-arrow.svg" : "icons/down-right-arrow.svg"}
                  alt={isPositiveChange ? "Increase" : "Decrease"}
                  className={`${styles.region_trend_arrow} ${isPositiveChange ? styles.positive : styles.negative}`}
                />
                {Math.abs(percentageChange)}%
              </div>
            </div>
          </div>
          <div className={styles.region_stats_graph}>
            <LineChartTNEB
              title="Energy Usage"
              data={graphData}
              seriesColors={['#3f68b2', '#ed8c22', '#dc272c']}
              yAxisLabel="MW"
              showLabel={false}
              toolbox={true}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortDetailsWidget; 