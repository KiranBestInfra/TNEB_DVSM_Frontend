import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import styles from '../styles/ErrorLogs.module.css';
import Table from '../components/ui/Table/Tables';


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
                const response = await apiClient.get('/log/logs');
                setErrorLogs(response.logs);
                setUsingDummyData(false);
            } catch (err) {
                console.error('Error fetching error logs:', err);
                // setErrorLogs(dummyErrorLogs);
                // setUsingDummyData(true);
            } finally {
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
