import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../components/AuthProvider';
import Loader from '../components/Loader';
import Tables from '../components/ui/Table/Tables';
import styles from '../styles/Substations.module.css';
import PieChart from '../components/graphs/PieChart/PieChart';

const UserSubstationDashboard = () => {
    const { substation } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);
    const [stats, setStats] = useState({
        totalFeeders: 0,
        healthyFeeders: 0,
        criticalFeeders: 0,
        warningFeeders: 0,
        feeders: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log(
                    'Fetching Substation dashboard data for:',
                    substation
                );

                // Replace with actual API endpoint for Substation dashboard data
                const response = await apiClient.get(
                    `/api/dashboard/substation/${substation}`
                );

                if (response.data) {
                    setStats({
                        totalFeeders: response.data.totalFeeders || 0,
                        healthyFeeders: response.data.healthyFeeders || 0,
                        criticalFeeders: response.data.criticalFeeders || 0,
                        warningFeeders: response.data.warningFeeders || 0,
                        feeders: response.data.feeders || [],
                    });
                }
            } catch (error) {
                console.error(
                    'Error fetching Substation dashboard data:',
                    error
                );
                // Set sample data for demonstration
                setStats({
                    totalFeeders: 12,
                    healthyFeeders: 8,
                    criticalFeeders: 2,
                    warningFeeders: 2,
                    feeders: [
                        {
                            id: 1,
                            name: 'Feeder 1',
                            status: 'Healthy',
                            load: '80%',
                        },
                        {
                            id: 2,
                            name: 'Feeder 2',
                            status: 'Warning',
                            load: '92%',
                        },
                        {
                            id: 3,
                            name: 'Feeder 3',
                            status: 'Critical',
                            load: '98%',
                        },
                        {
                            id: 4,
                            name: 'Feeder 4',
                            status: 'Healthy',
                            load: '75%',
                        },
                    ],
                });
            } finally {
                setLoading(false);
            }
        };

        if (substation) {
            fetchData();
        }
    }, [substation]);

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

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'healthy':
                return styles.text_success;
            case 'warning':
                return styles.text_warning;
            case 'critical':
                return styles.text_danger;
            default:
                return '';
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                {substation.toUpperCase()} Substation Dashboard
            </h2>

            <div className={styles.grid_row}>
                <div className={styles.grid_col_4}>
                    <div className={styles.card}>
                        <div className={styles.card_body}>
                            <h3 className={styles.card_title}>
                                Substation Overview
                            </h3>
                            <div className={styles.stat_list}>
                                <div className={styles.stat_item}>
                                    <span>Total Feeders:</span>
                                    <span className={styles.stat_value}>
                                        {stats.totalFeeders}
                                    </span>
                                </div>
                                <div className={styles.stat_item}>
                                    <span>Healthy Feeders:</span>
                                    <span
                                        className={`${styles.stat_value} ${styles.text_success}`}>
                                        {stats.healthyFeeders}
                                    </span>
                                </div>
                                <div className={styles.stat_item}>
                                    <span>Warning Feeders:</span>
                                    <span
                                        className={`${styles.stat_value} ${styles.text_warning}`}>
                                        {stats.warningFeeders}
                                    </span>
                                </div>
                                <div className={styles.stat_item}>
                                    <span>Critical Feeders:</span>
                                    <span
                                        className={`${styles.stat_value} ${styles.text_danger}`}>
                                        {stats.criticalFeeders}
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
                    </div>
                </div>
            </div>

            <div className={styles.grid_row}>
                <div className={styles.grid_col_12}>
                    <div className={styles.card}>
                        <div className={styles.card_body}>
                            <h3 className={styles.card_title}>Feeder Status</h3>
                            <Tables
                                data={stats.feeders}
                                columns={[
                                    { key: 'id', label: 'Feeder ID' },
                                    { key: 'name', label: 'Name' },
                                    {
                                        key: 'status',
                                        label: 'Status',
                                        render: (value) => (
                                            <span
                                                className={getStatusClass(
                                                    value
                                                )}>
                                                {value}
                                            </span>
                                        ),
                                    },
                                    { key: 'load', label: 'Current Load' },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSubstationDashboard;
