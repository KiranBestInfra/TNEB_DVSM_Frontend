import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Dashboard.module.css';
import DynamicGraph from '../components/DynamicGraph/DynamicGraph';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { apiClient } from '../api/client';

const Dashboard = () => {
  const { region } = useParams();
  console.log('Dashboard - Region from params:', region);

  // Determine base route from URL path (admin or user)
  const location = window.location.pathname;
  const isUserRoute = location.includes('/user/');
  const isBiUserRoute = location.includes('/bi/user/');
  const baseRoute = isBiUserRoute ? '/bi/user' : (isUserRoute ? '/user' : '/admin');

  const [timeRange, setTimeRange] = useState('Daily');
  const [graphData, setGraphData] = useState({
        xAxis: [],
        series: [],
    });
  const [widgetsData, setWidgetsData] = useState({
    totalRegions: 0,
    totalEdcs: 0,
    totalSubstations: 0,
    totalFeeders: 0,
    commMeters: 0,
    nonCommMeters: 0
  });

<<<<<<< HEAD
    useEffect(() => {
        const fetchData = async () => {
            const response = await apiClient.get('/regions/widgets');
            const data = response.data;
=======
  // Determine base route from URL path (admin or user)
  const location = window.location.pathname;
  const isUserRoute = location.includes('/user/');
  const isBiUserRoute = location.includes('/user/');
  const baseRoute = isBiUserRoute ? '/user' : (isUserRoute ? '/user' : '/admin');
>>>>>>> 5695953c599bee14393c4f20cff740234bf85c4d

            setWidgetsData((prev) => ({
                ...prev,
                totalRegions: data.totalRegions || prev.totalRegions,
                totalEdcs: data.totalEdcs || prev.totalEdcs,
                totalSubstations:
                    data.totalSubstations || prev.totalSubstations,
                totalFeeders: data.totalFeeders || prev.totalFeeders,
                commMeters: data.commMeters || prev.commMeters,
                nonCommMeters: data.nonCommMeters || prev.nonCommMeters,
            }));
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get('/regions/graph/demand');
                const data = response.data;
                setGraphData({
                    xAxis: data.xAxis || [],
                    series: data.series || [],
                });
            } catch (error) {
                console.error('Error fetching graph data:', error);
            }
        };
        fetchGraphData();
    }, [timeRange]);

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
                                <option value="PreviousMonth">
                                    Last30days
                                </option>
                                <option value="PreviousMonth">Last Week</option>

<<<<<<< HEAD
                                <option value="Year">Year</option>
                            </select>
                            <img
                                src="icons/arrow-down.svg"
                                alt="Select Time"
                                className={
                                    styles.time_range_select_dropdown_icon
                                }
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
=======
        try {
          const response = await fetch(url);
          const data = await response.json();
          console.log('Received data:', data);

          if (data.status === 'error') {
            console.error('API Error:', data.message);
            // Set default data even in case of error
            setWidgetsData({
              totalRegions: 1,
              totalEdcs: 5,
              totalSubstations: 15,
              totalFeeders: 30,
              commMeters: 120,
              nonCommMeters: 10
            });
            return;
          }

          const regionWidgets = data.data || {};
          setWidgetsData({
            totalRegions: regionWidgets.totalRegions || 0,
            totalEdcs: regionWidgets.totalEdcs || 0,
            totalSubstations: regionWidgets.totalSubstations || 0,
            totalFeeders: regionWidgets.totalFeeders || 0,
            commMeters: regionWidgets.commMeters || 0,
            nonCommMeters: regionWidgets.nonCommMeters || 0
          });
        } catch (apiError) {
          console.error('Error fetching from API:', apiError);
          // Set some default data if the API call fails
          setWidgetsData({
            totalRegions: 1,
            totalEdcs: 5,
            totalSubstations: 15,
            totalFeeders: 30,
            commMeters: 120,
            nonCommMeters: 10
          });
        }
      } catch (error) {
        console.error('Error in fetchData function:', error);
      }
    };

    fetchData();
  }, [region]);

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
                <option value="PreviousMonth">Last 30 Days</option>
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
          { label: 'Dashboard', path: region && region !== 'undefined' ? `${baseRoute}/${region}/dashboard` : `${baseRoute}/dashboard` }
        ]}
      />

      <div className={styles.summary_section}>
        <div className={styles.total_regions_container}>
          <div className={styles.total_main_info}>
            <img src="icons/office.svg" alt="Total Regions" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">
                <Link to={`${baseRoute}/regions`}>
                  Regions
                </Link>
              </p>
              <div className={styles.summary_value}>{widgetsData.totalRegions}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_edcs_container}>
          <div className={styles.total_main_info}>
            <img src="icons/electric-edc.svg" alt="Total Region" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">
                <Link to={region ? `${baseRoute}/${region}/edcs` : `${baseRoute}/edcs`}>
                  EDCs
                </Link>
              </p>
              <div className={styles.summary_value}>{widgetsData.totalEdcs}</div>
            </div>
          </div>
        </div>
        <div className={styles.total_substations_container}>
          <div className={styles.total_main_info}>
            <img src="icons/electric-factory.svg" alt="Total Substations" className={styles.TNEB_icons} />
            <div className={styles.total_title_value}>
              <p className="title">
                <Link to={region ? `${baseRoute}/${region}/substations` : `${baseRoute}/substations`}>
                  Substations
                </Link>
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
              <div className="title">
                <Link to={region ? `${baseRoute}/${region}/feeders` : `${baseRoute}/feeders`}>
                  Feeders
                </Link>
              </div>
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
>>>>>>> 5695953c599bee14393c4f20cff740234bf85c4d
            </div>

            <Breadcrumb
                items={[
                    { label: 'Home', path: '/admin' },
                    {
                        label: 'Dashboard',
                        path: '/admin/dashboard',
                        active: true,
                    },
                    { label: 'Regions', path: '/admin/regions', active: false },
                    { label: 'Chennai', path: '/admin/chennai', active: false },
                    {
                        label: 'Coimbatore',
                        path: '/admin/coimbatore',
                        active: false,
                    },
                    { label: 'Erode', path: '/admin/erode', active: false },
                    {
                        label: 'Kancheepuram',
                        path: '/admin/kancheepuram',
                        active: false,
                    },
                    { label: 'Karur', path: '/admin/karur', active: false },
                    { label: 'Madurai', path: '/admin/madurai', active: false },
                ]}
            />

            <div className={styles.summary_section}>
                <div className={styles.total_regions_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/office.svg"
                            alt="Total Regions"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link to="/admin/regions">Regions</Link>
                            </p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalRegions}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_edcs_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-edc.svg"
                            alt="Total Region"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">EDCs</p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalEdcs}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_substations_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="icons/electric-factory.svg"
                            alt="Total Substations"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">Substations</p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalSubstations}
                            </div>
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
                            <div className={styles.summary_value}>
                                {widgetsData.totalFeeders}
                            </div>
                        </div>
                    </div>
                    <div className={styles.metrics_communication_info}>
                        <div className="titles">Communication Status</div>
                        <div className={styles.overall_communication_status}>
                            <div
                                className={
                                    styles.communication_status_container
                                }>
                                <div className={styles.communication_value}>
                                    {widgetsData.commMeters}
                                </div>
                                <div
                                    className={
                                        styles.communication_positive_percentage
                                    }>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={
                                            styles.communication_positive_arrow
                                        }
                                    />
                                    87%
                                </div>
                            </div>
                            <div
                                className={
                                    styles.communication_status_container
                                }>
                                <div className={styles.communication_value}>
                                    {widgetsData.nonCommMeters}
                                </div>
                                <div
                                    className={
                                        styles.communication_negative_percentage
                                    }>
                                    <img
                                        src="icons/up-right-arrow.svg"
                                        alt="Positive"
                                        className={
                                            styles.communication_negative_arrow
                                        }
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
                    data={graphData}
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
