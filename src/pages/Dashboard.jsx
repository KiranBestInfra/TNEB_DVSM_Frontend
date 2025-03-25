import React from 'react';
import { useState } from "react";
import Buttons from "../components/ui/Buttons/Buttons";
import DatePicker from "react-datepicker";
import styles from "../styles/Dashboard.module.css";
import DynamicGraph from '../components/DynamicGraph/DynamicGraph'; 
import { Link } from 'react-router-dom';
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";

const Dashboard = () => {
    const [dateRange, setDateRange] = useState({
        start: null,
        end: null
    });

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
          
          <Breadcrumb 
            items={[
              { label: 'Dashboard', path: '/admin/dashboard' }
            ]}
          />
          
          <div className={styles.summary_section}>
            <div className={styles.total_regions_container}>
              <div className={styles.total_main_info}>
                <img src="icons/office.svg" alt="Total Regions" className={styles.TNEB_icons} />
                <div className={styles.total_title_value}>
                  <p className="title"><Link to="/admin/regions">Regions</Link></p>
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