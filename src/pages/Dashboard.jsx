import { useState } from "react";
import styles from "../styles/Dashboard.module.css";
import LineChartTNEB from "../components/graphs/LineChartTNEB/LineChartTNEB";
import { Breadcrumbs } from "react-breadcrumbs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Buttons from "../components/ui/Buttons/Buttons";
import IndividualRegion from "./IndividualRegion";

const Dashboard = () => {
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

  const regionName = ["Chennai", "Coimbatore", "Erode", "Kancheepuram", "Karur", "Madurai", "Thanjavur ","Thiruvallur", "Tirunelveli", "Tiruvannamalai", "Trichy","Vellore","Villupuram"];
  
  // EDC counts for each region
  const regionEdcCounts = {
    "Chennai": 8,
    "Coimbatore": 7,
    "Erode": 6,
    "Kancheepuram": 8,
    "Karur": 7,
    "Madurai": 8,
    "Thanjavur": 7,
    "Thiruvallur": 8,
    "Tirunelveli": 7,
    "Tiruvannamalai": 8,
    "Trichy": 7,
    "Vellore": 7,
    "Villupuram": 7
  };

  // Add this new object for substation counts
  const regionSubstationCounts = {
    "Chennai": 25,
    "Coimbatore": 22,
    "Erode": 18,
    "Kancheepuram": 20,
    "Karur": 19,
    "Madurai": 23,
    "Thanjavur": 21,
    "Thiruvallur": 24,
    "Tirunelveli": 20,
    "Tiruvannamalai": 22,
    "Trichy": 21,
    "Vellore": 23,
    "Villupuram": 22
  };

  // Add this new object for feeder counts
  const regionFeederCounts = {
    "Chennai": 42,
    "Coimbatore": 38,
    "Erode": 35,
    "Kancheepuram": 36,
    "Karur": 32,
    "Madurai": 39,
    "Thanjavur": 34,
    "Thiruvallur": 37,
    "Tirunelveli": 33,
    "Tiruvannamalai": 35,
    "Trichy": 36,
    "Vellore": 34,
    "Villupuram": 35
  };

  // Region-wise current and previous values
  const regionStats = {
    "Chennai": { currentValue: 452, previousValue: 350 },
    "Coimbatore": { currentValue: 480, previousValue: 420 },
    "Erode": { currentValue: 510, previousValue: 480 },
    "Kancheepuram": { currentValue: 490, previousValue: 440 },
    "Karur": { currentValue: 520, previousValue: 460 },
    "Madurai": { currentValue: 540, previousValue: 470 },
    "Thanjavur": { currentValue: 500, previousValue: 450 },
    "Thiruvallur": { currentValue: 530, previousValue: 480 },
    "Tirunelveli": { currentValue: 560, previousValue: 500 },
    "Tiruvannamalai": { currentValue: 470, previousValue: 430 },
    "Trichy": { currentValue: 550, previousValue: 490 },
    "Vellore": { currentValue: 510, previousValue: 460 },
    "Villupuram": { currentValue: 480, previousValue: 440 }
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
        <h2 className="title">Dashboard</h2>
        <div className={styles.action_container}>
          <div className={styles.date_range}>
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
                <img src="icons/date.svg" alt="Calendar" />
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
        <span>EDC</span>
        <span className={styles.breadcrumb_separator}>/</span>
        <span>Substation</span>
        <span className={styles.breadcrumb_separator}>/</span>
        <span>Feeder</span>
      </Breadcrumbs>
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
        <h2 className="title">Regions <span className={styles.region_count}>{`[${totalRegions}]`}</span></h2>
      </div>
      <div className={styles.region_stats_container}>
        {regionName.map((region, index) => (
          <div key={index} className={styles.individual_region_stats}>
            <IndividualRegion 
              region={region} 
              edcCount={regionEdcCounts[region.trim()]}
              substationCount={regionSubstationCounts[region.trim()]}
              feederCount={regionFeederCounts[region.trim()]}
              currentValue={regionStats[region.trim()].currentValue}
              previousValue={regionStats[region.trim()].previousValue}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
