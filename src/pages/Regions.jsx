import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/Dashboard.module.css";
import Buttons from "../components/ui/Buttons/Buttons";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import ShortDetailsWidget from "./ShortDetailsWidget";

const Regions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeRange, setTimeRange] = useState('Daily');
  const totalMeters = 1243;
  const totalRegions = 1; // Total number of regions
  const totalEdcs = 95; // Total number of EDCs
  const totalSubstations = 0; // Total number of substations
  const totalFeeders = 416; // Total number of feeders
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  const [widgetsData, setWidgetsData] = useState({
    totalRegions: 0,
    totalEdcs: 0,
    totalSubstations: 0,
    totalFeeders: 0,
    commMeters: 0,
    nonCommMeters: 0,
    regionNames: [],
    edcCount: {},
    substationCount: {},
    feederCount: {},
    regionStats: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:3000/api/v1/regions/widgets')
      const data = await response.json()
      const regionWidgets = data.data

      setWidgetsData((prev) => ({
        totalRegions: regionWidgets.totalRegions || prev.totalRegions,
        totalEdcs: regionWidgets.totalEdcs || prev.totalEdcs,
        totalSubstations: regionWidgets.totalSubstations || prev.totalSubstations,
        totalFeeders: regionWidgets.totalFeeders || prev.totalFeeders,
        commMeters: regionWidgets.commMeters || prev.commMeters,
        nonCommMeters: regionWidgets.nonCommMeters || prev.nonCommMeters,
        regionNames: regionWidgets.regionNames || prev.regionNames,
        edcCount: regionWidgets.regionEdcCounts || prev.edcCount,
        substationCount: regionWidgets.regionSubstationCounts || prev.substationCount,
        feederCount: regionWidgets.regionFeederCounts || prev.feederCount,
        regionStats: regionWidgets.regionStats || prev.regionStats
      }))
    }

    fetchData()

  }, [])

  const handleRegionClick = (region) => {
    navigate(`/admin/regions/${region.toLowerCase().replace(/\s+/g, '-')}/details`);
  };

  // Check if we're in a region user path
  const isRegionUser = location.pathname.includes('/user/') ||
    (location.pathname.includes('/user/') &&
      !location.pathname.includes('/admin/'));
  const currentRegionName = isRegionUser ?
    location.pathname.split('/').filter(x => x)[1] || '' :
    '';
  const baseRoute = location.pathname.includes('/user/') ?
    '/user' :
    (location.pathname.includes('/user/') ? '/user' : '/admin');

  // List of all region names
  const regionNames = ["Chennai", "Coimbatore", "Erode", "Kancheepuram", "Karur", "Madurai", "Thanjavur", "Thiruvallur", "Tirunelveli", "Tiruvannamalai", "Trichy", "Vellore", "Villupuram"];

  const handleEdcClick = () => {
    if (isRegionUser && currentRegionName) {
      navigate(`${baseRoute}/${currentRegionName}/edcs`);
    }
  };

  const handleSubstationClick = () => {
    if (isRegionUser && currentRegionName) {
      navigate(`${baseRoute}/${currentRegionName}/substations`);
    }
  };

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

  // Get the current page from the URL
  const currentPath = location.pathname.split('/');
  const currentPage = currentPath[currentPath.length - 1];

  // Build breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    if (!isRegionUser) {
      return [
        { label: 'Regions', path: '/admin/regions' }
      ];
    }

    // Format region name with first letter capitalized
    const formattedRegionName = currentRegionName.charAt(0).toUpperCase() + currentRegionName.slice(1);

    // Base items for region user
    const items = [
      { label: 'Dashboard', path: `${baseRoute}/dashboard` }
    ];

    // Add Region to breadcrumb if we're on a region page
    if (currentRegionName) {
      items.push({ label: `Region : ${formattedRegionName}`, path: `${baseRoute}/${currentRegionName}/dashboard` });
    }

    // Add EDCs to breadcrumb if on EDCs page
    if (currentPage === 'edcs') {
      items.push({ label: 'EDCs', path: `${baseRoute}/${currentRegionName}/edcs` });
    }

    // Add Substations to breadcrumb if on Substations page
    if (currentPage === 'substations') {
      items.push({ label: 'Substations', path: `${baseRoute}/${currentRegionName}/substations` });
    }

    return items;
  };

  return (
    <div className={styles.main_content}>
      <div className={styles.section_header}>
        <h2 className="title">Regions</h2>
        <div className={styles.action_container}>
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

      <Breadcrumb items={getBreadcrumbItems()} />

      <div className={styles.summary_section}>
        <div className={styles.total_regions_container}>
          <div className={styles.total_main_info}>
            <img src="icons/office.svg" alt="Total Regions" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">Regions</p>
              <div className={styles.summary_value}>{widgetsData.totalRegions}</div>
            </div>
          </div>
        </div>
        <div
          className={styles.total_edcs_container}
          onClick={handleEdcClick}
          style={isRegionUser ? { cursor: 'pointer' } : {}}
          title={isRegionUser ? "Click to view EDCs" : ""}
        >
          <div className={styles.total_main_info}>
            <img src="icons/electric-edc.svg" alt="Total EDCs" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">
                {isRegionUser ? (
                  <span style={{ color: "var(--brand-blue)" }}>EDCs {isRegionUser && <span style={{ fontSize: '0.8rem' }}>🔗</span>}</span>
                ) : (
                  "EDCs"
                )}
              </p>
              <div className={styles.summary_value}>{widgetsData.totalEdcs}</div>
            </div>
          </div>
        </div>

        <div
          className={styles.total_substations_container}
          onClick={handleSubstationClick}
          style={isRegionUser ? { cursor: 'pointer' } : {}}
          title={isRegionUser ? "Click to view Substations" : ""}
        >
          <div className={styles.total_main_info}>
            <img src="icons/electric-factory.svg" alt="Total Substations" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">
                {isRegionUser ? (
                  <span style={{ color: "var(--brand-blue)" }}>Substations {isRegionUser && <span style={{ fontSize: '0.8rem' }}>🔗</span>}</span>
                ) : (
                  "Substations"
                )}
              </p>
              <div className={styles.summary_value}>{widgetsData.totalSubstations}</div>
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
              <div className={styles.summary_value}>{widgetsData.totalFeeders}</div>
            </div>
          </div>
          {/*Feeder communication status*/}
          <div className={styles.metrics_communication_info}>
            <div className="titles">Communication Status</div>
            <div className={styles.overall_communication_status}>
              <div className={styles.communication_status_container}>
                <div className={styles.communication_value}>{widgetsData.commMeters}</div>
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
                <div className={styles.communication_value}>{widgetsData.nonCommMeters}</div>
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
        <h2 className="title">Regions: <span className={styles.region_count}>[{widgetsData.totalRegions}]</span></h2>
      </div>
      <div className={styles.region_stats_container}>
        {widgetsData.regionNames && widgetsData.regionNames.length > 0 ? (
          widgetsData.regionNames.map((region, index) => (
            <div key={index} className={styles.individual_region_stats}>
              <ShortDetailsWidget
                region={region}
                edcCount={widgetsData.edcCount?.[region.trim()] || 0}
                substationCount={widgetsData.substationCount?.[region.trim()] ?? 0}
                feederCount={widgetsData.feederCount?.[region.trim()] ?? 0}
                currentValue={widgetsData.regionStats?.[region.trim()]?.currentValue || 0}
                previousValue={widgetsData.regionStats?.[region.trim()]?.previousValue || 0}
              />
            </div>
          ))
        ) : (
          <p>No regions available</p> // ✅ Handle empty state
        )}
      </div>
    </div>
  );
};

export default Regions;
