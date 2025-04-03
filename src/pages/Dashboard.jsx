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
    const baseRoute = isBiUserRoute
        ? '/bi/user'
        : isUserRoute
            ? '/user'
            : '/admin';

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
        nonCommMeters: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiClient.get('/regions/widgets');
            const data = response.data;

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
                <option value="Last30days">Last 30 Days</option>
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
                <option value="PreviousMonth">Last Week</option>
                <option value="Year">Year</option>
              </select>
              <img
                src="icons/arrow-down.svg"
                alt="Select Time"
                className={styles.time_range_select_dropdown_icon}
              />
            </div>
            {/* <Buttons
              label="Get Reports"
              variant="primary"
              alt="GetReports"
              icon="icons/reports.svg"
              iconPosition="left"
            /> */}
          </div>
        </div>
      </div>

            <Breadcrumb
                items={[
                    {
                        label: 'Dashboard',
                        path:
                            region && region !== 'undefined'
                                ? `${baseRoute}/${region}/dashboard`
                                : `${baseRoute}/dashboard`,
                    },
                ]}
            />

            <div className={styles.summary_section}>
                <div className={styles.total_regions_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="/bi/icons/office.svg"
                            alt="Total Regions"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link to={`${baseRoute}/regions`}>Regions</Link>
                            </p>
                            <div className={styles.summary_value}>{widgetsData.totalRegions}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_edcs_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="/bi/icons/electric-edc.svg"
                            alt="Total Region"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link
                                    to={
                                        region
                                            ? `${baseRoute}/${region}/edcs`
                                            : `${baseRoute}/edcs`
                                    }>
                                    EDCs
                                </Link>
                            </p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalEdcs}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_substations_container}>
                    <div className={styles.total_main_info}>
                        <img
                            src="/bi/icons/electric-factory.svg"
                            alt="Total Substations"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_title_value}>
                            <p className="title">
                                <Link
                                    to={
                                        region
                                            ? `${baseRoute}/${region}/substations`
                                            : `${baseRoute}/substations`
                                    }>
                                    Substations
                                </Link>
                            </p>
                            <div className={styles.summary_value}>
                                {widgetsData.totalSubstations}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.total_meters_container}>
                    <div className={styles.total_meters_main_info}>
                        <img
                            src="/bi/icons/electric-meter.svg"
                            alt="Total Meters"
                            className={styles.TNEB_icons}
                        />
                        <div className={styles.total_meters}>
                            <div className="title">
                                <Link
                                    to={
                                        region
                                            ? `${baseRoute}/${region}/feeders`
                                            : `${baseRoute}/feeders`
                                    }>
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
                                        src="/bi/icons/up-right-arrow.svg"
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
                                        src="/bi/icons/up-right-arrow.svg"
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
                    title="Demand Trend"
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
