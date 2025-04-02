import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import Loader from '../components/Loader';
import { useAuth } from '../components/AuthProvider';
import Tables from '../components/ui/Table/Tables';
import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Feeder.module.css';

const EdcFeeders = () => {
    const { edc } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [feeders, setFeeders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchFeeders = async () => {
            setLoading(true);
            try {
                console.log('Fetching feeders for EDC:', edc);

                const response = await apiClient.get(`/api/edc/${edc}/feeders`);

                if (response.data) {
                    setFeeders(response.data);
                }
            } catch (error) {
                console.error('Error fetching feeders for EDC:', error);
                setFeeders([
                    {
                        id: 1,
                        name: 'Feeder 1',
                        substation: 'Substation A',
                        status: 'Healthy',
                        load: '70%',
                    },
                    {
                        id: 2,
                        name: 'Feeder 2',
                        substation: 'Substation A',
                        status: 'Warning',
                        load: '85%',
                    },
                    {
                        id: 3,
                        name: 'Feeder 3',
                        substation: 'Substation B',
                        status: 'Critical',
                        load: '95%',
                    },
                    {
                        id: 4,
                        name: 'Feeder 4',
                        substation: 'Substation B',
                        status: 'Healthy',
                        load: '60%',
                    },
                    {
                        id: 5,
                        name: 'Feeder 5',
                        substation: 'Substation C',
                        status: 'Warning',
                        load: '82%',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (edc) {
            fetchFeeders();
        }
    }, [edc]);

    const handleViewDetails = (feederId) => {
        navigate(`/user/edc/${edc}/feeders/${feederId}/details`);
    };

    const filterFeeders = (feeders) => {
        if (filterStatus === 'all') {
            return feeders;
        }
        return feeders.filter(
            (feeder) =>
                feeder.status.toLowerCase() === filterStatus.toLowerCase()
        );
    };

    const filteredFeeders = filterFeeders(feeders);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{edc.toUpperCase()} EDC Feeders</h2>

            <div className={styles.card_container}>
                <div className={styles.card}>
                    <div className={styles.card_body}>
                        <div className={styles.header}>
                            <h3 className={styles.card_title}>Feeders List</h3>
                            <div className={styles.button_group}>
                                <Buttons
                                    variant={
                                        filterStatus === 'all'
                                            ? 'primary'
                                            : 'outline-primary'
                                    }
                                    label="All"
                                    onClick={() => setFilterStatus('all')}
                                />
                                <Buttons
                                    variant={
                                        filterStatus === 'healthy'
                                            ? 'success'
                                            : 'outline-success'
                                    }
                                    label="Healthy"
                                    onClick={() => setFilterStatus('healthy')}
                                />
                                <Buttons
                                    variant={
                                        filterStatus === 'warning'
                                            ? 'warning'
                                            : 'outline-warning'
                                    }
                                    label="Warning"
                                    onClick={() => setFilterStatus('warning')}
                                />
                                <Buttons
                                    variant={
                                        filterStatus === 'critical'
                                            ? 'danger'
                                            : 'outline-danger'
                                    }
                                    label="Critical"
                                    onClick={() => setFilterStatus('critical')}
                                />
                            </div>
                        </div>

                        <Tables
                            data={filteredFeeders}
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'name', label: 'Name' },
                                { key: 'substation', label: 'Substation' },
                                { key: 'status', label: 'Status' },
                                { key: 'load', label: 'Load' },
                            ]}
                            actions={[
                                {
                                    label: 'View Details',
                                    icon: 'icons/eye.svg',
                                    onClick: (row) => handleViewDetails(row.id),
                                },
                            ]}
                            emptyMessage="No feeders found with the selected filter."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EdcFeeders;
