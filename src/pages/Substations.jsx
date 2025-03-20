import { useState } from "react";
import styles from "../styles/Substations.module.css";
import LineChartTNEB from "../components/graphs/LineChartTNEB/LineChartTNEB";
import { Breadcrumbs } from "react-breadcrumbs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Buttons from "../components/ui/Buttons/Buttons";

const Substations = () => {
  const [timeframe, setTimeframe] = useState("Last 7 Days");
  const totalSubstations = 260;
  const totalFeeders = 416;
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  const substationNames = [
    "Substation A1", "Substation A2", "Substation B1", "Substation B2",
    "Substation C1", "Substation C2", "Substation D1", "Substation D2",
    "Substation E1", "Substation E2", "Substation F1", "Substation F2"
  ];
  
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

  const IndividualSubstation = ({ substation }) => {
    const currentValue = 452;
    const previousValue = 350;
    const percentageChange = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
    const isPositiveChange = currentValue >= previousValue;

    return (
      <div className={styles.individual_substation}>
        <div className={styles.individual_substation_header}>
          <div className={styles.individual_substation_header_left}>
            <h3 className={styles.individual_substation_header_title}>{substation}</h3>
            <p className="titles">16 Feeders</p>
          </div>
          <div className={styles.individual_substation_header_right}>
            <img
              src="icons/click-through-rate.svg"
              alt="Click Here"
              className={styles.click_individual_substation}
            />
          </div>
        </div>
        <div className={styles.individual_substation_body}>
          <div className={styles.substation_content_wrapper}>
            <div className={styles.substation_stats_utilization}>
              <p className="titles">Units Utilization</p>
              <div className={styles.substation_stats_values}>
                <div className={styles.substation_current_value}>
                  {currentValue}
                </div>
                <div className={styles.substation_previous_value}>
                  {previousValue} MW
                </div>
                <div className={`${styles.substation_percentage_change} ${isPositiveChange ? styles.positive : styles.negative}`}>
                  <img
                    src={isPositiveChange ? "icons/up-right-arrow.svg" : "icons/down-right-arrow.svg"}
                    alt={isPositiveChange ? "Increase" : "Decrease"}
                    className={`${styles.substation_trend_arrow} ${isPositiveChange ? styles.positive : styles.negative}`}
                  />
                  {Math.abs(percentageChange)}%
                </div>
              </div>
            </div>
            <div className={styles.substation_stats_graph}>
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

  return (
    <div className={styles.main_content}>
      <div className={styles.section_header}>
        <h2 className="title">Substations Dashboard</h2>
        <div className={styles.action_container}>
          <div className={styles.date_range}>
            <div className={styles.search_cont}>
              <DatePicker
                selected={dateRange.start}
                onChange={(date) => setDateRange({ ...dateRange, start: date })}
                className={styles.date_input}
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
                onChange={(date) => setDateRange({ ...dateRange, end: date })}
                className={styles.date_input}
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
          </div>
        </div>
      </div>
      <Breadcrumbs>
        <span>Dashboard</span>
        <span className={styles.breadcrumb_separator}>/</span>
        <span>Region</span>
        <span className={styles.breadcrumb_separator}>/</span>
        <span>EDCs</span>
        <span className={styles.breadcrumb_separator}>/</span>
        <span className={styles.active_breadcrumb}>Substations</span>
        <span className={styles.breadcrumb_separator}>/</span>
        <span>Feeders</span>
      </Breadcrumbs>
      <div className={styles.summary_section}>
        <div className={styles.total_feeders_container}>
          <div className={styles.total_main_info}>
            <img src="icons/electric-meter.svg" alt="Total Feeders" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">Feeders</p>
              <div className={styles.summary_value}>{totalFeeders}</div>
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
        <h2 className="title">Substations <span className={styles.substation_count}>{`[${totalSubstations}]`}</span></h2>
      </div>
      <div className={styles.substation_stats_container}>
        {substationNames.map((substation, index) => (
          <div key={index} className={styles.individual_substation_stats}>
            <IndividualSubstation substation={substation} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Substations; 