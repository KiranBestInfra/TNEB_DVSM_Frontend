import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Bills.module.css';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Table from '../components/ui/Table/Tables';
import Buttons from '../components/ui/Buttons/Buttons';
import { apiClient } from '../api/client';
import AdvancedFilter from '../components/ui/Advanced/AdvancedFilter';
import WidgetSkeleton from '../components/ui/WidgetSkeleton/WidgetSkeleton';
import PaymentModal from '../components/ui/Modal/PaymentModal';
import { formatDateSlash } from '../utils/globalUtils';

const Bills = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [stats, setStats] = useState({
        totalBillsGenerated: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        overdueBills: { count: 0, amount: 0 },
        averageBillAmount: 0,
    });
    const [filters, setFilters] = useState({
        dateType: 'billGeneration',
        payment: '',
        consumer: '',
        billType: '',
        date: '',
    });
    const [advancedOptions, setAdvancedOptions] = useState({
        billUpdate: {
            updateType: 'bulk',
            bulkSelection: 'allPending',
            invoiceNumber: '',
            consumerType: '',
            newStatus: '',
        },
        reminder: {
            invoiceNumber: '',
            selectAll: false,
            notificationType: '',
        },
    });
    const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoiceNo, setSelectedInvoiceNo] = useState(null);

    const updateUrlParams = (page, limit) => {
        const params = new URLSearchParams(location.search);
        params.set('page', page);
        params.set('limit', limit);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const handlePageChange = (page, limit) => {
        updateUrlParams(page, limit);
    };

    function removeInitials(str) {
        return str.replace(/^[A-Za-z]{1,2}\s/, '');
    }

    const fetchBills = useCallback(
        async (
            page = pagination.currentPage,
            limit = pagination.limit,
            date,
            payment,
            consumer
        ) => {
            if (tableLoading) return;

            try {
                setTableLoading(true);
                const response = await apiClient.get(
                    `/billing?page=${page}&limit=${limit}&date=${date}&payment=${payment}&consumer=${consumer}`
                );
                const billsData = response.data;
                const pagination = response.pagination;

                setBills(billsData || []);

                setPagination((prev) => ({
                    ...prev,
                    currentPage: page,
                    limit: limit,
                    totalPages: pagination?.totalPages || prev.totalPages,
                    totalCount: pagination?.totalCount || prev.totalCount,
                    hasNextPage:
                        page < (pagination?.totalPages || prev.totalPages),
                    hasPrevPage: page > 1,
                }));
            } catch (err) {
                setError('Error fetching bills data');
                console.error('Error fetching bills:', err);
            } finally {
                setTableLoading(false);
            }
        },
        []
    );

    const handleEdit = async (billId) => {
        try {
            navigate(`/user/consumers/edit/${billId}`);
        } catch (err) {
            setError('Error navigating to edit page');
            console.error('Error navigating to edit page:', err);
        }
    };

    const handleView = async (invoiceId, meterNo) => {
        try {
            window.open(`/bi/pdf/${invoiceId}/${meterNo}`, '_blank');
        } catch (err) {
            setError('Error navigating to view page');
            console.error('Error navigating to view page:', err);
        }
    };

    const handleSendReminder = async (billId) => {
        try {
            setLoading(true);
            await apiClient.post(`/bills/${billId}/send-reminder`);
            alert('Payment reminder sent successfully');
        } catch (err) {
            setError('Failed to send payment reminder');
            console.error('Error sending reminder:', err);
        } finally {
            setLoading(false);
        }
    };

    function convertISOToISTDMY(isoString) {
        const date = new Date(isoString);
        const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(date.getTime() + IST_OFFSET_MS);
        const day = istDate.getUTCDate();
        const month = istDate.getUTCMonth() + 1;
        const year = istDate.getUTCFullYear();

        const formattedDay = String(day).padStart(2, '0');
        const formattedMonth = String(month).padStart(2, '0');

        return `${formattedDay}-${formattedMonth}-${year}`;
    }

    const handleReport = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/bills/report');
            // Handle report download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'bills-report.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            setError('Failed to generate report');
            console.error('Error generating report:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (billId) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                setLoading(true);
                await apiClient.delete(`/bills/${billId}`);
                setBills((prev) => prev.filter((bill) => bill.id !== billId));
                alert('Bill deleted successfully');
            } catch (err) {
                setError('Failed to delete bill');
                console.error('Error deleting bill:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePayment = (invoiceNo) => {
        setSelectedInvoiceNo(invoiceNo);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (invoiceNo) => {
        setShowPaymentModal(false);
        alert('Payment successful!');
        // fetchBills(); // Refresh the bills list
    };

    const handlePaymentFailure = (invoiceNo) => {
        setShowPaymentModal(false);
        alert('Payment failed. Please try again.');
    };

    const handleFilterChange = (name, value) => {
        const params = new URLSearchParams(location.search);
        setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
        });

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        navigate(`?${params.toString()}`, { replace: true });
    };

    const handleAdvancedOptionChange = (section, field, value) => {
        setAdvancedOptions((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleUpdateBillStatus = async () => {
        try {
            await apiClient.post(
                '/bills/bulk-update',
                advancedOptions.billUpdate
            );
            alert('Bills status updated successfully');
            // fetchBills(); // Refresh the bills list
        } catch (err) {
            setError('Failed to update bills status');
            console.error('Error updating bills status:', err);
        }
    };

    const handleSendBulkReminders = async () => {
        try {
            await apiClient.post(
                '/remainders/bulk-update',
                advancedOptions.reminder
            );
            alert('Reminders sent successfully');
        } catch (err) {
            setError('Failed to send reminders');
            console.error('Error sending reminders:', err);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStatsLoading(true);
                const response = await apiClient.get(
                    '/billing/widgets'
                );
                setStats(response.data);
            } catch (err) {
                setError('Error fetching stats');
                console.error('Error fetching stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const date = searchParams.get('date') || '';
        const payment = searchParams.get('payment') || '';
        const consumer = searchParams.get('consumer') || '';

        const controller = new AbortController();

        fetchBills(page, limit, date, payment, consumer);

        return () => {
            controller.abort();
        };
    }, [searchParams, fetchBills]);

    const renderStatCard = (title, value, icon, subtitle1, subtitle2) => (
        <div className={styles.total_units_container}>
            <div className={styles.stat_card}>
                <div className={styles.stat_card_left}>
                    <div className="titles">{title}</div>
                    <p className={styles.stat_number}>
                        {value}
                        {value > 0 ? (
                            <span className="icons_increased">
                                <img
                                    src="icons/arrow-trend-up.svg"
                                    alt="Trend Up"
                                />
                            </span>
                        ) : (
                            <span className="icons_decreased">
                                <img
                                    src="icons/arrow-trend-down.svg"
                                    alt="Trend Down"
                                />
                            </span>
                        )}
                    </p>
                </div>
                <div className={styles.stat_card_right}>
                    <span className="icons">
                        <img src={icon} alt={`${title} Icon`} />
                    </span>
                </div>
            </div>
            <div className={styles.active_units_container}>
                <div className="sub_title">{subtitle1}</div>
                <div className="sub_title">{subtitle2}</div>
            </div>
        </div>
    );

    return (
        <div className={styles.bills_container}>
            {error && (
                <div className="error">
                    <span className="error_icon">
                        <img src="icons/error-mark.svg" alt="warning" />
                    </span>
                    {error}
                </div>
            )}

            <div className="adminheader">
                <div className="title"></div>
                <div className="header_actions">
                    <Buttons
                        label="Advanced Options"
                        variant="outline"
                        icon="icons/send-reminder.svg"
                        iconPosition="left"
                        onClick={() =>
                            setShowAdvanceOptions(!showAdvanceOptions)
                        }
                        disabled={loading}
                    />
                    <Buttons
                        label="Generate Report"
                        variant="primary"
                        icon="icons/generate-report.svg"
                        iconPosition="left"
                        onClick={handleReport}
                        disabled={loading}
                    />
                </div>
            </div>

            {showAdvanceOptions && (
                <div className={styles.advanced_filter_section}>
                    <AdvancedFilter
                        advancedOptions={advancedOptions}
                        onAdvancedOptionChange={handleAdvancedOptionChange}
                        onUpdateBillStatus={handleUpdateBillStatus}
                        onSendBulkReminders={handleSendBulkReminders}
                        loading={loading}
                    />
                </div>
            )}

            <div className={styles.dashboard_stats}>
                {statsLoading ? (
                    <>
                        <WidgetSkeleton />
                        <WidgetSkeleton />
                        <WidgetSkeleton />
                        <WidgetSkeleton />
                        <WidgetSkeleton />
                    </>
                ) : (
                    <>
                        {renderStatCard(
                            'Total Bills Generated',
                            stats.totalBillsGenerated,
                            'icons/bills.svg',
                            'For Selected Period',
                            ''
                        )}
                        {renderStatCard(
                            'Total Revenue',
                            `${stats.totalRevenue}`,
                            'icons/total-revenue.svg',
                            'From Paid Bills',
                            ''
                        )}
                        {renderStatCard(
                            'Pending Payments',
                            `${stats.pendingPayments}`,
                            'icons/pending.svg',
                            'Unpaid Amounts',
                            ''
                        )}
                        {renderStatCard(
                            'Overdue Bills',
                            stats.overdueBills.count,
                            'icons/overdue.svg',
                            `${stats.overdueBills.amount} Total Amount`,
                            ''
                        )}
                        {renderStatCard(
                            'Average Bill Amount',
                            `${stats.averageBillAmount}`,
                            'icons/average.svg',
                            'Per Consumer',
                            ''
                        )}
                    </>
                )}
            </div>

            <div className={styles.filters_container}>
                <div className="form_row">
                    <div className="form_group">
                        <div className="search_cont">
                            <select
                                onChange={(e) => {
                                    let name = 'dateType';
                                    handleFilterChange(name, e.target.value);
                                }}
                                value={filters.dateType}>
                                <option value="billGeneration">
                                    Bill Generation Date
                                </option>
                                <option value="dueDate">Due Date</option>
                            </select>
                            <span className="arrow_icon arrowicon_placement">
                                <img
                                    src="icons/arrow-down.svg"
                                    alt="calendar"
                                />
                            </span>
                        </div>
                    </div>

                    <div className="form_group">
                        <div className="search_cont">
                            <select
                                onChange={(e) => {
                                    let name = 'date';
                                    handleFilterChange(name, e.target.value);
                                }}>
                                <option value="">Select Period</option>
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="year">Yearly</option>
                            </select>
                            <span className="arrow_icon arrowicon_placement">
                                <img src="icons/arrow-down.svg" alt="period" />
                            </span>
                        </div>
                    </div>

                    <div className="form_group">
                        <div className="search_cont">
                            <select
                                onChange={(e) => {
                                    let name = 'payment';
                                    handleFilterChange(name, e.target.value);
                                }}
                                value={filters.payment}>
                                <option value="">Select Payment Status</option>

                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                            <span className="arrow_icon arrowicon_placement">
                                <img
                                    src="icons/arrow-down.svg"
                                    alt="payment status"
                                />
                            </span>
                        </div>
                    </div>

                    <div className="form_group">
                        <div className="search_cont">
                            <select
                                onChange={(e) => {
                                    let name = 'consumer';
                                    handleFilterChange(name, e.target.value);
                                }}
                                value={filters.consumer}>
                                <option value="">Select Consumer Type</option>

                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industries">Industrial</option>
                                <option value="sez">SEZ</option>
                            </select>
                            <span className="arrow_icon arrowicon_placement">
                                <img
                                    src="icons/arrow-down.svg"
                                    alt="consumer type"
                                />
                            </span>
                        </div>
                    </div>

                    <div className="form_group">
                        <div className="search_cont">
                            <select
                                onChange={(e) => {
                                    let name = 'billType';
                                    handleFilterChange(name, e.target.value);
                                }}
                                value={filters.billType}>
                                <option value="">Select Bill Type</option>
                                <option value="regular">Regular</option>
                                <option value="credit">Credit</option>
                                <option value="adjustment">Advance</option>
                                <option value="closed">Closed</option>
                            </select>
                            <span className="arrow_icon arrowicon_placement">
                                <img
                                    src="icons/arrow-down.svg"
                                    alt="bill type"
                                />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Table
                data={bills}
                columns={[
                    {
                        key: 'invoice_id',
                        label: 'Invoice No',
                        sortable: true,
                    },
                    {
                        key: 'bill_date',
                        label: 'Bill Date',
                        render: (date) => formatDateSlash(date),
                        sortable: true,
                    },
                    {
                        key: 'due_date',
                        label: 'Due Date',
                        render: (due) => formatDateSlash(due),
                        sortable: true,
                    },
                    {
                        key: 'uid',
                        label: 'UID',
                        render: (uid) => uid,
                        sortable: true,
                    },
                    {
                        key: 'consumer_name',
                        label: 'Resident Name',
                        sortable: true,
                        render: (name) => removeInitials(name),
                    },
                    {
                        key: 'flat_no',
                        label: 'Flat No',
                        render: (flat) => `${flat}`,
                        sortable: true,
                    },
                    {
                        key: 'meter_serial',
                        label: 'Meter No',
                        render: (meter) => meter,
                        sortable: true,
                    },
                    {
                        key: 'status',
                        label: 'Paid Status',
                        render: (total) => {
                            if (total === 'Paid') {
                                return (
                                    <span className={styles.status_paid}>
                                        Paid
                                    </span>
                                );
                            } else if (total === 'Pending') {
                                return (
                                    <span className={styles.status_pending}>
                                        Pending
                                    </span>
                                );
                            } else if (total === 'Overdue') {
                                return (
                                    <span className={styles.status_overdue}>
                                        Overdue
                                    </span>
                                );
                            } else if (total === 'PartiallyPaid') {
                                return (
                                    <span
                                        className={
                                            styles.status_partially_paid
                                        }>
                                        Partially Paid
                                    </span>
                                );
                            }
                        },
                        sortable: true,
                    },
                    {
                        key: 'consumption',
                        label: 'No. of Units',
                        render: (units) => units,
                        sortable: true,
                    },

                    {
                        key: 'amount',
                        label: 'Total Bill',
                        render: (total) => total,
                        sortable: true,
                    },
                ]}
                sortable={true}
                searchable={true}
                loading={tableLoading}
                emptyMessage="No bills found"
                onView={(row) => handleView(row.invoice_id, row.meter_serial)}
                onDelete={handleDelete}
                onPayment={(row) => handlePayment(row.invoice_id)}
                pagination={true}
                rowsPerPageOptions={[5, 10, 50]}
                initialRowsPerPage={10}
                serverPagination={pagination}
                onPageChange={handlePageChange}
                text="Bill"
            />

            {showPaymentModal && (
                <PaymentModal
                    invoiceNo={selectedInvoiceNo}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                />
            )}
        </div>
    );
};

export default Bills;
