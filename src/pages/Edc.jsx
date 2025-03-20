import { useState } from "react";
import styles from "../styles/Edc.module.css";
import LineChartTNEB from "../components/graphs/LineChartTNEB/LineChartTNEB";
import { Breadcrumbs } from "react-breadcrumbs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Buttons from "../components/ui/Buttons/Buttons";

const Edc = () => {
  const [timeframe, setTimeframe] = useState("Last 7 Days");
  const totalMeters = 1243;
  const totalRegions = 13;
  const totalEDCs = 95;
  const totalSubstations = 260;
  const totalFeeders = 416;
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  const edcNames = ["EDC North", "EDC South", "EDC East", "EDC West", "EDC Central", "EDC Metro", "EDC Rural", "EDC Urban", "EDC Industrial", "EDC Commercial", "EDC Residential", "EDC Agricultural", "EDC Mixed"];
  
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

  const IndividualEdc = ({ edc }) => {
    const currentValue = 452;
    const previousValue = 350;
    const percentageChange = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
    const isPositiveChange = currentValue >= previousValue;

    return (
      <div className={styles.individual_edc}>
        <div className={styles.individual_edc_header}>
          <div className={styles.individual_edc_header_left}>
            <h3 className={styles.individual_edc_header_title}>{edc}</h3>
            <p className="titles">20 Substations \ 16 Feeders</p>
          </div>
          <div className={styles.individual_edc_header_right}>
            <img
              src="icons/click-through-rate.svg"
              alt="Click Here"
              className={styles.click_individual_edc}
            />
          </div>
        </div>
        <div className={styles.individual_edc_body}>
          <div className={styles.edc_content_wrapper}>
            <div className={styles.edc_stats_utilization}>
              <p className="titles">Units Utilization</p>
              <div className={styles.edc_stats_values}>
                <div className={styles.edc_current_value}>
                  {currentValue}
                </div>
                <div className={styles.edc_previous_value}>
                  {previousValue} MW
                </div>
                <div className={`${styles.edc_percentage_change} ${isPositiveChange ? styles.positive : styles.negative}`}>
                  <img
                    src={isPositiveChange ? "icons/up-right-arrow.svg" : "icons/down-right-arrow.svg"}
                    alt={isPositiveChange ? "Increase" : "Decrease"}
                    className={`${styles.edc_trend_arrow} ${isPositiveChange ? styles.positive : styles.negative}`}
                  />
                  {Math.abs(percentageChange)}%
                </div>
              </div>
            </div>
            <div className={styles.edc_stats_graph}>
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
        <h2 className="title">EDC Dashboard</h2>
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
              <span className="icons icon_placement" >
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
        <span className={styles.active_breadcrumb}>EDCs</span>
        <span className={styles.breadcrumb_separator}>/</span>
        <span>Substations</span>
        <span className={styles.breadcrumb_separator}>/</span>
        <span>Feeders</span>
      </Breadcrumbs>
      <div className={styles.summary_section}>
        <div className={styles.total_substations_container}>
          <div className={styles.total_main_info}>
            <img src="icons/electric-factory.svg" alt="Total Substations" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">Substations</p>
              <div className={styles.summary_value}>{totalSubstations}</div>
            </div>
          </div>
        </div>
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
        <h2 className="title">EDCs <span className={styles.edc_count}>{`[${totalEDCs}]`}</span></h2>
      </div>
      <div className={styles.edc_stats_container}>
        {edcNames.map((edc, index) => (
          <div key={index} className={styles.individual_edc_stats}>
            <IndividualEdc edc={edc} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Edc; 