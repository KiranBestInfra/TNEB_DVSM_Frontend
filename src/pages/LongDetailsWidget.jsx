import styles from "../styles/LongDetailsWidget.module.css";
import FullDetailLineChart from "../components/graphs/FullDetailLineChart/FullDetailLineChart";
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Buttons from "../components/ui/Buttons/Buttons";
import { useState } from "react";

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
  const { regionId, edcId, substationId, feederId } = useParams();
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  
  // Determine the type of view based on URL parameters
  let viewType = 'regions';
  let entityId = regionId;
  
  if (feederId) {
    viewType = 'feeders';
    entityId = feederId;
  } else if (substationId) {
    viewType = 'substations';
    entityId = substationId;
  } else if (edcId) {
    viewType = 'edcs';
    entityId = edcId;
  }

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

  return (
    <div className={styles.main_content}>
      <div className={styles.section_header}>
        <h2 className="title">{entityName} Detailed View</h2>
        <div className={styles.action_container}>
          <div className={styles.date_range}>
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
              icon="/icons/reports.svg"
              iconPosition="left"
            />
          </div>
        </div>
      </div>
      <Breadcrumb />
      
      <div className={styles.performance_stats}>
        <div className={styles.total_edcs_container}>
          <div className={styles.total_main_info}>
          <div className={styles.TNEB_icons}>
              <img src="icons/electric-edc.svg" alt="EDC" className={styles.TNEB_icons}/>
            </div>
            <div className={styles.total_title_value}>
              <span className='title'>Total EDCs</span>
              <span className={styles.summary_value}>{stats.edcCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.total_substations_container}>
          <div className={styles.total_main_info}>
          <div className={styles.TNEB_icons}>
              <img src="icons/electric-factory.svg" alt="Substation" className={styles.TNEB_icons}/>
            </div>
            <div className={styles.total_title_value}>
              <span className='title'>Total Substations</span>
              <span className={styles.summary_value}>{stats.substationCount}</span>
            </div>
            
          </div>
        </div>

        <div className={styles.total_meters_container}>
          <div className={styles.total_main_info}>


            <div className={styles.TNEB_icons}>
              <img src="icons/electric-meter.svg" alt="Feeder" className={styles.TNEB_icons}/>
            </div>

            <div className={styles.total_title_value}>
              <span className='title'>Total Feeders</span>
              <span className={styles.summary_value}>{stats.feederCount}</span>
            </div>
            
          </div>
        </div>

        <div className={styles.total_units_container}>
          <div className={styles.total_main_info}>
            <div className={styles.total_title_value}>
              <span className='title'>Current Utilization</span>
              <span className={`${styles.summary_value} ${isPositiveChange ? styles.positive : styles.negative}`}>
                {stats.currentValue} MW
                <div className={styles.percentage_change}>
                  <img
                    src={isPositiveChange ? "icons/up-right-arrow.svg" : "icons/down-right-arrow.svg"}
                    alt={isPositiveChange ? "Increase" : "Decrease"}
                    className={isPositiveChange ? styles.communication_positive_arrow_ : styles.communication_negative_arrow}
                  />
                  {Math.abs(percentageChange)}%
                </div>
              </span>
            </div>
            <div className={styles.TNEB_icons}>
              <img src="icons/units.svg" alt="Units" />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.details_section}>
        <div className={styles.details_card}>
          <div className={styles.details_header}>
            {/* <h3>Detailed Energy Usage</h3> */}
          </div>
          <div className={styles.detail_chart}>
            <FullDetailLineChart
              title="Detailed Energy Usage"
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