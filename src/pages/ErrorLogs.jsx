import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import styles from '../styles/ErrorLogs.module.css';
import Table from '../components/ui/Table/Tables';

const dummyErrorLogs = [
    {
        id: 1,
        type: 'Error',
        message: 'Failed to load user data',
        path: '/api/users',
        time: '2023-06-15T08:30:45.123Z',
    },
    {
        id: 2,
        type: 'Warning',
        message: 'Connection timeout',
        path: '/api/regions',
        time: '2023-06-15T09:12:33.456Z',
    },
    {
        id: 3,
        type: 'Error',
        message: 'Database query failed',
        path: '/api/substations',
        time: '2023-06-15T10:45:21.789Z',
    },
    {
        id: 4,
        type: 'Info',
        message: 'User login attempt',
        path: '/auth/login',
        time: '2023-06-15T11:22:18.234Z',
    },
    {
        id: 5,
        type: 'Error',
        message: 'Permission denied',
        path: '/api/admin/settings',
        time: '2023-06-15T12:05:09.567Z',
    },
    {
        id: 6,
        type: 'Warning',
        message: 'Low memory warning',
        path: '/system/resources',
        time: '2023-06-15T13:17:42.890Z',
    },
    {
        id: 7,
        type: 'Error',
        message: 'API rate limit exceeded',
        path: '/api/feeders',
        time: '2023-06-15T14:33:27.123Z',
    },
    {
        id: 8,
        type: 'Info',
        message: 'Scheduled maintenance started',
        path: '/system/maintenance',
        time: '2023-06-15T15:10:55.456Z',
    },
    {
        id: 9,
        type: 'Error',
        message: 'File upload failed',
        path: '/api/documents',
        time: '2023-06-15T16:28:14.789Z',
    },
    {
        id: 10,
        type: 'Warning',
        message: 'Cache invalidation error',
        path: '/api/cache',
        time: '2023-06-15T17:40:36.234Z',
    },
    {
        id: 11,
        type: 'Error',
        message: 'Authentication token expired',
        path: '/auth/token',
        time: '2023-06-15T18:15:49.567Z',
    },
    {
        id: 12,
        type: 'Info',
        message: 'Backup completed successfully',
        path: '/system/backup',
        time: '2023-06-15T19:52:03.890Z',
    },
];

const ErrorLogs = () => {
    const [errorLogs, setErrorLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [usingDummyData, setUsingDummyData] = useState(false);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Type' },
        { key: 'message', label: 'Message' },
        { key: 'path', label: 'Path' },
        {
            key: 'time',
            label: 'Time',
            render: (value) => formatDateTime(value),
        },
    ];

    useEffect(() => {
        const fetchErrorLogs = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/error-logs');
                setErrorLogs(response);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching error logs:', err);
                setErrorLogs(dummyErrorLogs);
                setUsingDummyData(true);
                setLoading(false);
            }
        };

        fetchErrorLogs();
    }, []);

    const handlePageChange = (newPage, newRowsPerPage = rowsPerPage) => {
        setCurrentPage(newPage);
        setRowsPerPage(newRowsPerPage);
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className={styles.main_content}>
            <SectionHeader title="Error Logs" />

            <div className={styles.logs_container}>
                <Table
                    data={errorLogs}
                    columns={columns}
                    loading={loading}
                    pagination={true}
                    emptyMessage="No error logs found"
                    currentPage={currentPage}
                    initialRowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    onPageChange={handlePageChange}
                    showActions={false}
                    searchable={true}
                />
            </div>
        </div>
    );
};

export default ErrorLogs;
