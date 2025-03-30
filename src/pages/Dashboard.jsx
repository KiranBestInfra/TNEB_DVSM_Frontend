import React from 'react';
import { useState, useEffect } from "react";
import Buttons from "../components/ui/Buttons/Buttons";
import styles from "../styles/Dashboard.module.css";
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('Daily');
  const [widgetsData, setWidgetsData] = useState({
    totalRegions: 0,
    totalEdcs: 0,
    totalSubstations: 0,
    totalFeeders: 0,
    commMeters: 0,
    nonCommMeters: 0
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
        nonCommMeters: regionWidgets.nonCommMeters || prev.nonCommMeters
      }))
    }

    fetchData()

  }, [])

  const totalRegions = 0;
  const totalEDCs = 0;
  const totalSubstations = 0;
  const totalMeters = 0;

  const detailedGraphData = {
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
  };

  return (
    <div className={styles.main_content}>
      <div className={styles.section_header}>
        <h2 className="title">Dashboard</h2>
        <div className={styles.action_container}>
          <div className={styles.action_cont}>
            <div className={styles.time_range_select_dropdown}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={styles.time_range_select}>
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
                <option value="PreviousMonth">Last30days</option>
                <option value="PreviousMonth">Last Week</option>

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

      <Breadcrumb
        items={[
          { label: 'Home', path: '/admin' },
          { label: 'Dashboard', path: '/admin/dashboard', active: true },
          { label: 'Regions', path: '/admin/regions', active: false },
          { label: 'Chennai', path: '/admin/chennai', active: false },
          { label: 'Coimbatore', path: '/admin/coimbatore', active: false },
          { label: 'Erode', path: '/admin/erode', active: false },
          { label: 'Kancheepuram', path: '/admin/kancheepuram', active: false },
          { label: 'Karur', path: '/admin/karur', active: false },
          { label: 'Madurai', path: '/admin/madurai', active: false }
        ]}
      />

      <div className={styles.summary_section}>
        <div className={styles.total_regions_container}>
          <div className={styles.total_main_info}>
            <img src="icons/office.svg" alt="Total Regions" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title"><Link to="/admin/regions">Regions</Link></p>
              <div className={styles.summary_value}>{widgetsData.totalRegions}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_edcs_container}>
          <div className={styles.total_main_info}>
            <img src="icons/electric-edc.svg" alt="Total Region" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">EDCs</p>
              <div className={styles.summary_value}>{widgetsData.totalEdcs}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_substations_container}>
          <div className={styles.total_main_info}>
            <img src="icons/electric-factory.svg" alt="Total Substations" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">Substations</p>
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

      <div className={styles.detail_chart}>
        <DynamicGraph
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
  );
};

export default Dashboard;