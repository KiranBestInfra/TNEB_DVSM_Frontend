import { useState } from "react";
import styles from "../styles/TNEBDashboard.module.css";
import LineChartTNEB from "../components/graphs/LineChartTNEB/LineChartTNEB";

const TNEBDashboard = () => {
  const [timeframe, setTimeframe] = useState("Last 7 Days");
  const totalMeters = 1243;

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };
const regionName = ["Chennai", "Coimbatore", "Erode", "Kancheepuram", "Karur", "Madurai", "Thanjavur ","Thiruvallur", "Tirunelveli", "Tiruvannamalai", "Trichy","Vellore","Villupuram"]
  // Sample data for the LineChart
  const graphData = {
    daily: {
      xAxis: [
        "2025-03-16 23:59:59", "2025-03-16 08:30:00", "2025-03-16 08:15:00",
        "2025-03-16 08:00:00", "2025-03-16 07:45:00", "2025-03-16 07:30:00",
        "2025-03-16 07:15:00", "2025-03-16 07:00:00", "2025-03-16 06:45:00",
        "2025-03-16 06:30:00", "2025-03-16 06:15:00", "2025-03-16 06:00:00",
        "2025-03-16 05:45:00", "2025-03-16 05:30:00", "2025-03-16 05:15:00",
        "2025-03-16 05:00:00", "2025-03-16 04:45:00", "2025-03-16 04:30:00",
        "2025-03-16 04:15:00", "2025-03-16 04:00:00", "2025-03-16 03:45:00",
        "2025-03-16 03:30:00", "2025-03-16 03:15:00", "2025-03-16 03:00:00",
        "2025-03-16 02:45:00", "2025-03-16 02:30:00", "2025-03-16 02:15:00",
        "2025-03-16 02:00:00", "2025-03-16 01:45:00", "2025-03-16 01:30:00",
        "2025-03-16 01:15:00", "2025-03-16 01:00:00", "2025-03-16 00:45:00",
        "2025-03-16 00:30:00", "2025-03-16 00:15:00"
      ],
      series: [
        {
          name: 'Current Day',
          data: [
            13.6, 12.0, 11.2, 11.2, 11.6, 10.4, 12.0, 10.8, 12.4, 12.0, 12.8,
            13.6, 12.4, 13.6, 12.0, 13.6, 12.8, 13.2, 13.6, 12.4, 14.0, 12.4,
            14.0, 12.4, 13.6, 12.8, 13.2, 14.0, 12.8, 14.0, 12.4, 13.6, 12.4,
            13.6, 12.4
          ]
        },
        {
          name: 'Previous Day',
          data: [
            13.2, 10.8, 10.0, 11.2, 10.8, 10.8, 11.6, 10.8, 12.0, 11.6, 13.2,
            12.8, 13.2, 14.0, 12.8, 14.4, 13.2, 14.8, 13.6, 14.4, 14.8, 13.2,
            14.8, 13.2, 14.4, 13.2, 14.4, 13.6, 13.6, 14.4, 13.2, 14.4, 12.8,
            14.4, 12.8
          ]
        }
      ]
    }
  };

  const IndividualRegion = ({ regionName }) => {
    return (
      <div className={styles.individual_region}>
        <div className={styles.individual_region_header}>
          <div className={styles.individual_region_header_left}>
            <h3 className={styles.individual_region_header_title}>{regionName}</h3>
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
                452
              </div>
              <div className={styles.communication_preprevious_value}>
                340
              </div>

              
            </div>
            <div className={styles.communication_value}>
              <img
                  src="icons/up-right-arrow.svg"
                  alt="Positive"
                  className={styles.communication_positive_arrow}
                />
                {100}%</div>
          </div>
          <div className={styles.region_graph}>
            <LineChartTNEB
              title="Energy Usage"
              data={graphData}
              seriesColors={['#3f68b2']}
              yAxisLabel="MW"
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
          <IndividualRegion regionName={regionName[0]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[1]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[2]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[3]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[4]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[5]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[6]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[7]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[8]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[9]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[10]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[11]} />
        </div>
        <div className={styles.individual_region_stats}>
          <IndividualRegion regionName={regionName[12]} />
        </div>

      </div>

      <div className={styles.section_header}>
        <h2 className="title">Overall Energy Usage</h2>
      </div>
      {/* <div className={styles.overall_graph_container}>
        <LineChartTNEB
          title="Energy Usage Trend"
          data={graphData}
          seriesColors={['#3f68b2', '#ff6b6b']}
          yAxisLabel="MW"
          showLabel={true}
          toolbox={true}
          height="300px"
        />
      </div> */}
    </div>
  );
};

export default TNEBDashboard;
