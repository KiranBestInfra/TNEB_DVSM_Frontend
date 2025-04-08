import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../components/AuthProvider';
import Loader from '../components/Loader';
import styles from '../styles/Dashboard.module.css';
import PieChart from '../components/graphs/PieChart/PieChart';

const UserEdcDashboard = () => {
    const { edc } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);
    const [stats, setStats] = useState({
        totalSubstations: 0,
        totalFeeders: 0,
        healthyFeeders: 0,
        criticalFeeders: 0,
        warningFeeders: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {

                // Replace with actual API endpoint for EDC dashboard data
                const response = await apiClient.get(
                    `/api/dashboard/edc/${edc}`
                );

                if (response.data) {
                    setStats({
                        totalSubstations: response.data.totalSubstations || 0,
                        totalFeeders: response.data.totalFeeders || 0,
                        healthyFeeders: response.data.healthyFeeders || 0,
                        criticalFeeders: response.data.criticalFeeders || 0,
                        warningFeeders: response.data.warningFeeders || 0,
                    });
                }
            } catch (error) {
                console.error('Error fetching EDC dashboard data:', error);
                // Set sample data for demonstration
                setStats({
                    totalSubstations: 15,
                    totalFeeders: 45,
                    healthyFeeders: 30,
                    criticalFeeders: 5,
                    warningFeeders: 10,
                });
            } finally {
                setLoading(false);
            }
        };

        if (edc) {
            fetchData();
        }
    }, [edc]);

    const feederHealthData = [
        { name: 'Healthy', value: stats.healthyFeeders },
        { name: 'Warning', value: stats.warningFeeders },
        { name: 'Critical', value: stats.criticalFeeders },
    ];

    const colors = [
        '#4bC0C0', // Healthy - green
        '#ffce56', // Warning - yellow
        '#ff6384', // Critical - red
    ];

    if (loading) {
        return <Loader />;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{edc.toUpperCase()} EDC Dashboard</h2>

            <div className={styles.grid_row}>
                <div className={styles.grid_col_4}>
                    <div className={styles.card}>
                        <div className={styles.card_body}>
                            <h3 className={styles.card_title}>EDC Overview</h3>
                            <div className={styles.stat_list}>
                                <div className={styles.stat_item}>
                                    <span>Total Substations:</span>
                                    <span className={styles.stat_value}>
                                        {stats.totalSubstations}
                                    </span>
                                </div>
                                <div className={styles.stat_item}>
                                    <span>Total Feeders:</span>
                                    <span className={styles.stat_value}>
                                        {stats.totalFeeders}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.grid_col_8}>
                    <div className={styles.card}>
                        <div className={styles.card_body}>
                            <h3 className={styles.card_title}>
                                Feeder Health Status
                            </h3>
                            <div className={styles.chart_container}>
                                <div className={styles.chart_col}>
                                    <div className={styles.chart_wrapper}>
                                        <PieChart
                                            title="Feeder Health Status"
                                            data={feederHealthData}
                                            chartRef={chartRef}
                                            colors={colors}
                                            valueUnit="Feeder"
                                        />
                                    </div>
                                </div>
                                <div className={styles.chart_stats}>
                                    <div className={styles.stat_item}>
                                        <span className={styles.text_success}>
                                            Healthy:
                                        </span>
                                        <span className={styles.stat_value}>
                                            {stats.healthyFeeders}
                                        </span>
                                    </div>
                                    <div className={styles.stat_item}>
                                        <span className={styles.text_warning}>
                                            Warning:
                                        </span>
                                        <span className={styles.stat_value}>
                                            {stats.warningFeeders}
                                        </span>
                                    </div>
                                    <div className={styles.stat_item}>
                                        <span className={styles.text_danger}>
                                            Critical:
                                        </span>
                                        <span className={styles.stat_value}>
                                            {stats.criticalFeeders}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserEdcDashboard;
