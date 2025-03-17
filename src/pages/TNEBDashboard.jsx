import { useState } from "react";
import styles from "../styles/TNEBDashboard.module.css";
import LineChartTNEB from "../components/graphs/LineChartTNEB/LineChartTNEB";

const TNEBDashboard = () => {
  const [timeframe, setTimeframe] = useState("Last 7 Days");
  const totalMeters = 1243;

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  // Sample data for the LineChart
  const data = {
    daily: {
      xAxis: ['2023-10-01', '2023-10-02', '2023-10-03', '2023-10-04', '2023-10-05', '2023-10-06', '2023-10-07'],
      series: [
        {
          name: 'Units',
          data: [120, 132, 101, 134, 90, 230, 210]
        }
      ]
    },
    monthly: {
      xAxis: ['2023-05-01', '2023-06-01', '2023-07-01', '2023-08-01', '2023-09-01', '2023-10-01'],
      series: [
        {
          name: 'Units',
          data: [120, 132, 101, 134, 90, 230]
        }
      ]
    }
  };

  const IndividualRegion = () => {
    return (
      <div className={styles.individual_region}>
        <div className={styles.individual_region_header}>
          <div className={styles.individual_region_header_left}>
            <h3 className="title">Chennai</h3>
            <p className="titles">Total Meters: 95  Sub Stations: 20</p>
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
          <div className={styles.region_unit_utilization}>
            <p className="titles">Units Utilization</p>
            <div className={styles.communication_status_container}>
              <div className={styles.communication_positive_percentage}>
                <img
                  src="icons/up-right-arrow.svg"
                  alt="Positive"
                  className={styles.communication_positive_arrow}
                />
                452
              </div>
              <div className={styles.communication_value}>324 Units</div>
            </div>
          </div>
          <div className={styles.region_graph}>
            <LineChartTNEB
              title="Energy Usage"
              data={data}
              seriesColors={['#3f68b2']}
              yAxisLabel="kWh"
              showLabel={false}
              toolbox={true}
              height="100px"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.main_content}>
      <div className={styles.section_header}>
        <h2 className="title">Dashboard</h2>

        <div className={styles.action_cont}>
          <div className={styles.time_range_select_dropdown}>
            <select
              value={timeframe}
              onChange={handleTimeframeChange}
              className={styles.time_range_select}
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
            <img
              src="icons/arrow-down.svg"
              alt="Select Time"
              className={styles.time_range_select_dropdown_icon}
            />
          </div>
        </div>
      </div>

      <div className={styles.summary_section}>
        <div className={styles.total_meters_container}>
          <div className={styles.total_meters_main_info}>
            <img
              src="icons/meter.svg"
              alt="Total Meters"
              className={styles.total_meters_icon}
            />
            <div className={styles.total_meters}>
              <div className="titles">Total Meters</div>
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
                    src="icons/up-right-arrow.svg"
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
        <h2 className="title">Regions (value)</h2>
      </div>
      <div className={styles.region_stats_container}>
        <div className={styles.individual_region_stats}>
          <IndividualRegion />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion />
        </div>
      </div>
    </div>
  );
};

export default TNEBDashboard;
