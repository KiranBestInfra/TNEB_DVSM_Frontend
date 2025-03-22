import { useState } from "react";
import styles from "../styles/Dashboard.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Buttons from "../components/ui/Buttons/Buttons";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import ShortDetailsWidget from "./ShortDetailsWidget";

const EDCs = () => {
  const [timeframe, setTimeframe] = useState("Last 7 Days");
  const totalMeters = 1243;
  const totalRegions = 13; // Total number of regions
  const totalEDCs = 95; // Total number of EDCs
  const totalSubstations = 260; // Total number of substations
  const totalFeeders = 416; // Total number of feeders
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  // Replace region data with EDC data
  const edcNames = [
    "Chennai North", "Chennai South", "Chennai Central", "Chennai West",
    "Coimbatore North", "Coimbatore South", "Madurai Urban", "Madurai Rural",
    "Trichy Urban", "Trichy Rural", "Thanjavur", "Villupuram", "Vellore",
    "Salem", "Erode"
  ];
  
  // EDC substation counts
  const edcSubstationCounts = {
    "Chennai North": 18,
    "Chennai South": 22,
    "Chennai Central": 20,
    "Chennai West": 15,
    "Coimbatore North": 16,
    "Coimbatore South": 19,
    "Madurai Urban": 17,
    "Madurai Rural": 14,
    "Trichy Urban": 15,
    "Trichy Rural": 13,
    "Thanjavur": 16,
    "Villupuram": 14,
    "Vellore": 17,
    "Salem": 18,
    "Erode": 16
  };

  // EDC feeder counts
  const edcFeederCounts = {
    "Chennai North": 35,
    "Chennai South": 42,
    "Chennai Central": 38,
    "Chennai West": 32,
    "Coimbatore North": 28,
    "Coimbatore South": 34,
    "Madurai Urban": 30,
    "Madurai Rural": 25,
    "Trichy Urban": 28,
    "Trichy Rural": 24,
    "Thanjavur": 29,
    "Villupuram": 26,
    "Vellore": 31,
    "Salem": 33,
    "Erode": 29
  };

  // EDC consumption stats
  const edcStats = {
    "Chennai North": { currentValue: 380, previousValue: 350 },
    "Chennai South": { currentValue: 420, previousValue: 390 },
    "Chennai Central": { currentValue: 390, previousValue: 360 },
    "Chennai West": { currentValue: 360, previousValue: 340 },
    "Coimbatore North": { currentValue: 340, previousValue: 310 },
    "Coimbatore South": { currentValue: 370, previousValue: 350 },
    "Madurai Urban": { currentValue: 350, previousValue: 320 },
    "Madurai Rural": { currentValue: 310, previousValue: 290 },
    "Trichy Urban": { currentValue: 330, previousValue: 300 },
    "Trichy Rural": { currentValue: 290, previousValue: 270 },
    "Thanjavur": { currentValue: 320, previousValue: 300 },
    "Villupuram": { currentValue: 300, previousValue: 280 },
    "Vellore": { currentValue: 340, previousValue: 310 },
    "Salem": { currentValue: 350, previousValue: 320 },
    "Erode": { currentValue: 330, previousValue: 300 }
  };

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

  return (
    <div className={styles.main_content}>
      <div className={styles.section_header}>
        <h2 className="title">EDCs</h2>
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
              icon="icons/reports.svg"
              iconPosition="left"
            />
          </div>
        </div>
      </div>
      <Breadcrumb />
      <div className={styles.summary_section}>
        <div className={styles.total_regions_container}>
          <div className={styles.total_main_info}>
            <img src="icons/office.svg" alt="Total Regions" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">Regions</p>
              <div className={styles.summary_value}>{totalRegions}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_edcs_container}>
          <div className={styles.total_main_info}>
            <img src="icons/electric-edc.svg" alt="Total Region" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">EDCs</p>
              <div className={styles.summary_value}>{totalEDCs}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_substations_container}>
          <div className={styles.total_main_info}>
            <img src="icons/electric-factory.svg" alt="Total Substations" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">Substations</p>
              <div className={styles.summary_value}>{totalSubstations}</div>
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
        <h2 className="title">EDCs <span className={styles.region_count}>{`[ ${totalEDCs} ]`}</span></h2>
      </div>
      <div className={styles.region_stats_container}>
        {edcNames.map((edc, index) => (
          <div key={index} className={styles.individual_region_stats}>
            <ShortDetailsWidget
              region={edc} 
              substationCount={edcSubstationCounts[edc]}
              feederCount={edcFeederCounts[edc]}
              currentValue={edcStats[edc].currentValue}
              previousValue={edcStats[edc].previousValue}
              pageType="edcs"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EDCs;
