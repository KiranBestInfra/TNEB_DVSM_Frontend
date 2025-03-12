import React, { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';
import '../admin.css';
import Table from '../components/ui/Table/Tables';
import { apiClient } from '../api/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PieChart from '../components/graphs/PieChart/PieChart';
import BarChart from '../components/graphs/BarChart/BarChart';
import WidgetSkeleton from '../components/ui/WidgetSkeleton/WidgetSkeleton.jsx';
import Modal from '../components/ui/Modal/Modal';
import {
    formatDateDayMonthYear,
    formatMonthYear,
} from '../utils/globalUtils.js';
import { useAuth } from '../components/AuthProvider.jsx';

const   Dashboard = () => {
    const [stats, setStats] = useState({
        // Widget 1
        totalConsumers: 0,
        activeUnits: 0,
        inactiveUnits: 0,

        // Widget 2
        prepaidConsumer: 0,
        prepaidDisconnected: 0,

        // Widget 3
        postpaidConsumers: 0,
        postpaidDisconnected: 0,

        // Widget 4
        totalOverdueAmount: 0,
        totalOverdueBillCount: 0,

        // Widget 5
        totalOutstanding: 0,
        totalOutstandingPercentage: 0,

        // Widget 6
        heavyUsers: 0,
        heavyUsersAverageConsumption: 0,

        // Monthly Widgets
        monthlyConsumption: 0,
        lastMonthConsumption: 0,

        currentMonthElectricityCharges: 0,
        lastMonthElectricityCharges: 0,

        currentMonthPaymentReceipts: 0,
        lastMonthPaymentReceipts: 0,

        lastMonthServiceRequests: 0,
        currentMonthServiceRequests: 0,

        // Daily Widgets
        yesterdayConsumption: 0,
        dayBeforeYesterdayConsumption: 0,

        yesterdayElectricCharges: 0,
        dayBeforeYesterdayElectricityCharges: 0,

        yesterDaypaymentReceipts: 0,
        dayBeforeYesterdayPaymentReceipts: 0,

        yesterDayServiceRequests: 0,
        dayBeforeYesterdayServiceRequests: 0,
        dayBeforeYesterdayDate: 0,

        // Today Widgets
        todayConsumption: 0,
        todayElectricCharges: 0,
        todayPaymentReceipts: 0,
        todayServiceRequests: 0,

        deactiveUnits: 1,
    });
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [isOverdueTableLoading, setIsOverdueTableLoading] = useState(false);
    const [isDisconnectedTableLoading, setIsDisconnectedTableLoading] =
        useState(false);
    const [overdueConsumerPagination, setOverdueConsumerPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [disconnectedConsumerPagination, setDisconnectedConsumerPagination] =
        useState({
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
        });
    const [error, setError] = useState(null);
    const [dailyChartData, setDailyChartData] = useState({
        xAxisData: [],
        seriesData: [],
    });
    const [monthlyChartData, setMonthlyChartData] = useState({
        xAxisData: [],
        seriesData: [],
    });
    const [billingData, setBillingData] = useState({
        xAxisData: [],
        seriesData: [],
    });
    const [connectedMeters, setConnectedMeters] = useState([]);
    const navigate = useNavigate();
    const [overdueConsumers, setOverdueConsumers] = useState([]);
    const [disconnectedConsumers, setDisconnectedConsumers] = useState([]);
    const [currentView, setCurrentView] = useState('Monthly');
    const [chartTimeRange, setChartTimeRange] = useState('Daily');
    const [overDueConsumerPageManager, setOverDueConsumerPageManager] =
        useState({
            page: 1,
            limit: 5,
        });
    const [
        disconnectedConsumerPageManager,
        setDisconnectedConsumerPageManager,
    ] = useState({
        page: 1,
        limit: 5,
    });
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        selectedConsumer: null,
    });

    const [reminderForm, setReminderForm] = useState({
        message: '',
        notificationType: 'sms',
    });

    const [creditForm, setCreditForm] = useState({
        amount: '',
        reason: '',
    });
    const { isAdmin } = useAuth();
    const basePath = isAdmin() ? '/admin' : '/user';

    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            type: null,
            selectedConsumer: null,
        });
        // Reset forms
        setReminderForm({
            message: '',
            notificationType: 'sms',
        });
        setCreditForm({
            amount: '',
            reason: '',
        });
    };

    const handleConfirmAction = async () => {
        try {
            switch (modalState.type) {
                case 'reminder':
                    await apiClient.post(
                        `/consumers/${modalState.selectedConsumer.consumer_id}/reminder`,
                        reminderForm
                    );
                    break;
                case 'credit':
                    await apiClient.post(
                        `/consumers/${modalState.selectedConsumer.consumer_id}/credit`,
                        creditForm
                    );
                    break;
                case 'disconnect':
                    const res = await apiClient.post(
                        `/consumer/${modalState.selectedConsumer.uid}/disconnect`
                    );

                    if (res.status === 'success') {
                        setModalState((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                    }

                    break;
                case 'connect':
                    const response = await apiClient.post(
                        `/consumer/${modalState.selectedConsumer.uid}/reconnect`
                    );

                    if (response.status === 'success') {
                        setModalState((prev) => ({
                            ...prev,
                            isOpen: false,
                        }));
                    }
                    break;
                default:
                    break;
            }
            handleCloseModal();
        } catch (error) {
            setError(error.message);
        }
    };

    const renderModalContent = () => {
        switch (modalState.type) {
            case 'reminder':
                return (
                    <div className={styles.modal_content}>
                        <div className={styles.form_group}>
                            <label>Message</label>
                            <textarea
                                value={reminderForm.message}
                                onChange={(e) =>
                                    setReminderForm((prev) => ({
                                        ...prev,
                                        message: e.target.value,
                                    }))
                                }
                                placeholder="Enter reminder message"
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label>Notification Type</label>
                            <select
                                value={reminderForm.notificationType}
                                onChange={(e) =>
                                    setReminderForm((prev) => ({
                                        ...prev,
                                        notificationType: e.target.value,
                                    }))
                                }>
                                <option value="sms">SMS</option>
                                <option value="email">Email</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                );
            case 'credit':
                return (
                    <div className={styles.modal_content}>
                        <div className={styles.form_group}>
                            <label>Amount (Rs.)</label>
                            <input
                                type="number"
                                value={creditForm.amount}
                                onChange={(e) =>
                                    setCreditForm((prev) => ({
                                        ...prev,
                                        amount: e.target.value,
                                    }))
                                }
                                placeholder="Enter credit amount"
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label>Reason</label>
                            <textarea
                                value={creditForm.reason}
                                onChange={(e) =>
                                    setCreditForm((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                    }))
                                }
                                placeholder="Enter reason for credit"
                            />
                        </div>
                    </div>
                );
            case 'disconnect':
                return (
                    <div className={styles.modal_content}>
                        <p>
                            Are you sure you want to disconnect this consumer?
                        </p>
                        <p>Consumer UID: {modalState.selectedConsumer?.uid}</p>
                        <p>
                            Name: {modalState.selectedConsumer?.consumer_name}
                        </p>
                    </div>
                );
            case 'connect':
                return (
                    <div className={styles.modal_content}>
                        <p>Are you sure you want to connect this consumer?</p>
                        <p>Consumer ID: {modalState.selectedConsumer?.uid}</p>
                        <p>
                            Name: {modalState.selectedConsumer?.consumer_name}
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    const fetchOverdueConsumers = async () => {
        setIsOverdueTableLoading(true);
        try {
            const response = await apiClient.get(
                `/main/overdue-consumers?page=${overDueConsumerPageManager.page}&limit=${overDueConsumerPageManager.limit}`
            );

            const { overdueConsumerDetails, pagination } = response.data;

            setOverdueConsumerPagination((prev) => ({
                ...prev,
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalCount: pagination.totalCount,
                limit: pagination.limit,
                hasNextPage: pagination.hasNextPage,
                hasPrevPage: pagination.hasPrevPage,
            }));

            setOverdueConsumers(overdueConsumerDetails);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching overdue consumers:', err);
        } finally {
            setIsOverdueTableLoading(false);
        }
    };

    const fetchDisconnectedConsumers = async () => {
        setIsDisconnectedTableLoading(true);
        try {
            const response = await apiClient.get(
                `/main/disconnected-consumers?page=${disconnectedConsumerPageManager.page}&limit=${disconnectedConsumerPageManager.limit}`
            );
            const { disconnectedMeters, pagination } = response.data;

            setDisconnectedConsumerPagination((prev) => ({
                ...prev,
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalCount: pagination.totalCount,
                limit: pagination.limit,
                hasNextPage: pagination.hasNextPage,
                hasPrevPage: pagination.hasPrevPage,
            }));

            setDisconnectedConsumers(disconnectedMeters);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching disconnected consumers:', err);
        } finally {
            setIsDisconnectedTableLoading(false);
        }
    };

    useEffect(() => {
        fetchOverdueConsumers();
    }, [overDueConsumerPageManager]);

    useEffect(() => {
        fetchDisconnectedConsumers();
    }, [disconnectedConsumerPageManager]);

    useEffect(() => {
        setIsStatsLoading(true);
        const fetchAnalytics = async () => {
            try {
                const response = await apiClient.get('/main/widgets');
                const res = response.data;

                const inactiveMeters = res.totalConsumers - res.activeUnits;
                setConnectedMeters([
                    {
                        name: 'Communicating',
                        value: res.activeUnits,
                    },
                    {
                        name: 'Non-Communicating',
                        value: inactiveMeters,
                    },
                ]);

                setStats((prevStats) => ({
                    ...prevStats,
                    totalConsumers:
                        res.totalConsumers || prevStats.totalConsumers,
                    activeUnits: res.activeUnits || prevStats.activeUnits,
                    inactiveUnits: inactiveMeters || prevStats.inactiveUnits,

                    prepaidConsumer:
                        res.prepaidConsumer || prevStats.prepaidConsumer,

                    postpaidConsumers:
                        res.postpaidConsumers || prevStats.postpaidConsumers,

                    totalOverdueAmount:
                        res.totalOverdueAmount || prevStats.totalOverdueAmount,
                    totalOverdueBillCount:
                        res.totalOverdueBillCount ||
                        prevStats.totalOverdueBillCount,
                    totalOutstanding:
                        res.totalOutstanding || prevStats.totalOutstanding,
                    prepaidDisconnected:
                        res.prepaidDisconnected ||
                        prevStats.prepaidDisconnected,
                    postpaidDisconnected:
                        res.postpaidDisconnected ||
                        prevStats.postpaidDisconnected,
                    totalOutstandingPercentage:
                        res.totalOutstandingPercentage ||
                        prevStats.totalOutstandingPercentage,

                    heavyUsers:
                        res.usersCount.heavyUsers || prevStats.heavyUsers,
                    heavyUsersAverageConsumption:
                        res.usersCount.threshold ||
                        prevStats.heavyUsersAverageConsumption,

                    // Monthly Widgets
                    currentMonthElectricityCharges:
                        res.currentMonthtotalRevenue ||
                        prevStats.currentMonthElectricityCharges,
                    lastMonthElectricityCharges:
                        res.lastMonthTotalRevenue ||
                        prevStats.lastMonthElectricityCharges,
                    currentMonthPaymentReceipts:
                        res.paymentReceiptsCurrentMonth ||
                        prevStats.currentMonthPaymentReceipts,
                    lastMonthPaymentReceipts:
                        res.paymentReceiptsLastMonth ||
                        prevStats.lastMonthPaymentReceipts,

                    // Daily Widgets
                    yesterdayConsumption:
                        res.yesterdayConsumption ||
                        prevStats.yesterdayConsumption,
                    dayBeforeYesterdayConsumption:
                        res.dayBeforeYesterdayConsumption ||
                        prevStats.dayBeforeYesterdayConsumption,

                    yesterdayElectricCharges:
                        res.yesterdayTotalRevenue ||
                        prevStats.yesterdayElectricCharges,
                    dayBeforeYesterdayElectricityCharges:
                        res.dayBeforeYesterdayTotalRevenue ||
                        prevStats.dayBeforeYesterdayElectricityCharges,

                    yesterdayPaymentReceipts:
                        res.yesterdayPaymentReceipts ||
                        prevStats.yesterDaypaymentReceipts,
                    dayBeforeYesterdayPaymentReceipts:
                        res.dayBeforeYesterdayPaymentReceipts ||
                        prevStats.dayBeforeYesterdayPaymentReceipts,

                    // Today Widgets
                    todayConsumption:
                        res.todayConsumption || prevStats.todayConsumption,
                    todayElectricCharges:
                        res.todayTotalRevenue || prevStats.todayElectricCharges,
                    todayPaymentReceipts:
                        res.todayPaymentReceipts ||
                        prevStats.todayPaymentReceipts,
                    todayServiceRequests:
                        res.todayServiceRequests ||
                        prevStats.todayServiceRequests,
                }));
            } catch (err) {
                setError(err.message);
                console.error('Error fetching analytics data:', err);
            } finally {
                setIsStatsLoading(false);
            }
        };

        function convertDate(dateArray) {
            if (!dateArray || dateArray.length === 0) return [];

            const dates = dateArray.map((dateStr) => {
                const dateObj = new Date(dateStr);
                const month = dateObj.toLocaleString('en-US', {
                    month: 'short',
                });
                const day = dateObj.getDate();
                const year = dateObj.getFullYear();

                return {
                    display: `${month} ${day}`,
                    full: `${month} ${day}, ${year}`,
                };
            });

            return dates;
        }

        const fetchGraphs = async () => {
            try {
                const graphs = await apiClient.get('/main/graphs');

                const graphData = graphs.data;
                const dailyConsumption = graphData.dailyData;
                const monthlyConsumption = graphData.monthlyData;
                const billingData = graphData.billingData;
                const monthConsumption =
                    monthlyConsumption.sums[
                        monthlyConsumption.sums.length - 3
                    ] ?? 0;
                const lastMonthConsumption =
                    monthlyConsumption.sums[
                        monthlyConsumption.sums.length - 4
                    ] ?? 0;

                setStats((prevStats) => ({
                    ...prevStats,
                    monthlyConsumption: monthConsumption,
                    lastMonthConsumption: lastMonthConsumption,
                }));

                setBillingData({
                    xAxisData: billingData.billMonth.map((date) => {
                        const monthYearRegex =
                            /^(\d{4})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i;
                        if (monthYearRegex.test(date)) {
                            return date;
                        }

                        try {
                            return formatMonthYear(date);
                        } catch (e) {
                            console.error('Error formatting date:', date, e);
                            return date;
                        }
                    }),
                    seriesData: [
                        {
                            name: 'Bills Generated',
                            data: billingData.totalBillCount,
                        },
                        {
                            name: 'Paid',
                            data: billingData.paidBillCount,
                        },
                        { name: 'Pending', data: billingData.pendingBillCount },
                        { name: 'Overdue', data: billingData.overDueCount },
                    ],
                });
                setDailyChartData({
                    xAxisData: dailyConsumption.xAxisData,
                    seriesData: [
                        {
                            name: 'Consumption',
                            data: dailyConsumption.sums,
                        },
                    ],
                });
                setMonthlyChartData({
                    xAxisData: monthlyConsumption.xAxisData,
                    seriesData: [
                        {
                            name: 'Consumption',
                            data: monthlyConsumption.sums,
                        },
                    ],
                });
            } catch (err) {
                setError(err.message);
                console.error('Error fetching graphs data:', err);
            }
        };

        fetchAnalytics();
        fetchGraphs();
    }, []);

    const handleOverDueConsumerPageChange = (page, limit) => {
        setOverDueConsumerPageManager((prev) => ({
            ...prev,
            page: page,
            limit: limit,
        }));
    };

    const handleDisconnectedConsumerPageChange = (page, limit) => {
        setDisconnectedConsumerPageManager((prev) => ({
            ...prev,
            page: page,
            limit: limit,
        }));
    };

    const handleSendReminder = (consumer) => {
        setModalState({
            isOpen: true,
            type: 'reminder',
            selectedConsumer: consumer,
        });
    };

    const handleAddCredit = (consumer) => {
        setModalState({
            isOpen: true,
            type: 'credit',
            selectedConsumer: consumer,
        });
    };

    const handleMarkDisconnected = (consumer) => {
        setModalState({
            isOpen: true,
            type: 'disconnect',
            selectedConsumer: consumer,
        });
    };

    const handleMarkConnected = (consumer) => {
        setModalState({
            isOpen: true,
            type: 'connect',
            selectedConsumer: consumer,
        });
    };

    const dayBeforeYesterdayDate = () => {
        const today = new Date();

        const dayBeforeYesterday = new Date(today);
        dayBeforeYesterday.setDate(today.getDate() - 2);

        const options = { year: '2-digit', month: 'short', day: 'numeric' };
        const formattedDate = dayBeforeYesterday.toLocaleDateString(
            'en-US',
            options
        );

        return formattedDate;
    };

    const getDateRangeTitle = () => {
        const today = new Date();

        switch (currentView) {
            case 'Daily':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return `(${yesterday.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })})`;
            case 'Monthly':
                const previousMonth = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1
                );
                return `(${previousMonth.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                })})`;
            default:
                return '';
        }
    };

    function extractBlockLetter(text) {
        const regex = /Block\s*-\s*([ABC])/i;
        const match = text.match(regex);
        return match ? match[1] : null;
    }

    const formatDateForDailyView = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateForMonthlyView = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    };

    const getPreviousMonthDate = () => {
        const today = new Date();
        const twoMonthsAgo = new Date(
            today.getFullYear(),
            today.getMonth() - 2,
            1
        );
        return formatDateForMonthlyView(twoMonthsAgo);
    };

    const getDayBeforeYesterdayFormatted = () => {
        const today = new Date();
        const dayBeforeYesterday = new Date(today);
        dayBeforeYesterday.setDate(today.getDate() - 2);
        return formatDateForDailyView(dayBeforeYesterday);
    };

    const renderStatCard = (
        title,
        value,
        icon,
        subtitle1,
        subtitle2,
        showTrend = false
    ) => {
        let comparisonValue;
        value = parseFloat(value);
        if (currentView === 'Daily') {
            comparisonValue =
                value -
                (title === 'Electricity Usage (kWh)'
                    ? stats.dayBeforeYesterdayConsumption
                    : title === 'Electricity Charges (Rs)'
                    ? stats.dayBeforeYesterdayElectricityCharges
                    : title === 'Payment Receipts'
                    ? stats.dayBeforeYesterdayPaymentReceipts
                    : stats.heavyUsers);
        } else if (currentView === 'Monthly') {
            comparisonValue =
                value -
                (title === 'Electricity Usage (kWh)'
                    ? stats.lastMonthConsumption
                    : title === 'Electricity Charges (Rs)'
                    ? stats.lastMonthElectricityCharges
                    : title === 'Payment Receipts'
                    ? stats.lastMonthPaymentReceipts
                    : stats.heavyUsers);
        }

        // Only apply special formatting for Consumption & Billing section
        if (
            title === 'Electricity Usage (kWh)' ||
            title === 'Electricity Charges (Rs)' ||
            title === 'Payment Receipts' ||
            title === 'Service Requests'
        ) {
            const formattedValue =
                title.includes('Charges') || title.includes('Receipts')
                    ? `${value}`
                    : value;
            const getSubtitle1Text = () => {
                if (currentView === 'Daily') {
                    if (title === 'Electricity Usage (kWh)') {
                        return `${stats.dayBeforeYesterdayConsumption} kWh`;
                    } else if (title === 'Electricity Charges (Rs)') {
                        return `${stats.dayBeforeYesterdayElectricityCharges}`;
                    } else if (title === 'Payment Receipts') {
                        return `${stats.dayBeforeYesterdayPaymentReceipts}`;
                    } else {
                        return stats.dayBeforeYesterdayPaymentReceipts;
                    }
                } else {
                    if (title === 'Electricity Usage (kWh)') {
                        return `${stats.lastMonthConsumption} kWh`;
                    } else if (title === 'Electricity Charges (Rs)') {
                        return `${stats.lastMonthElectricityCharges}`;
                    } else if (title === 'Payment Receipts') {
                        return `${stats.lastMonthPaymentReceipts}`;
                    } else {
                        return stats.lastMonthServiceRequests;
                    }
                }
            };

            const getSubtitle2Text = () => {
                if (currentView === 'Daily') {
                    return getDayBeforeYesterdayFormatted();
                } else {
                    return getPreviousMonthDate();
                }
            };

            return (
                <div className={styles.total_units_container}>
                    <div className={styles.stat_card}>
                        <div className={styles.stat_card_left}>
                            <div className="titles">{title}</div>
                            <p className={styles.stat_number}>
                                {formattedValue}
                                {showTrend && (
                                    <span
                                        className={
                                            comparisonValue > 0
                                                ? 'icons_increased'
                                                : 'icons_decreased'
                                        }>
                                        <img
                                            src={
                                                comparisonValue > 0
                                                    ? 'icons/arrow-trend-up.svg'
                                                    : 'icons/arrow-trend-down.svg'
                                            }
                                            alt={
                                                comparisonValue > 0
                                                    ? 'Trend Up'
                                                    : 'Trend Down'
                                            }
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
                        <div className="sub_title">{getSubtitle1Text()}</div>
                        <div className="sub_title">{getSubtitle2Text()}</div>
                    </div>
                </div>
            );
        }

        // Original rendering for Consumer Statistics section
        return (
            <div className={styles.total_units_container}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_card_left}>
                        <div className="titles">{title}</div>
                        <p className={styles.stat_number}>
                            {value}
                            {showTrend && (
                                <span
                                    className={
                                        comparisonValue > 0
                                            ? 'icons_increased'
                                            : 'icons_decreased'
                                    }>
                                    <img
                                        src={
                                            comparisonValue > 0
                                                ? 'icons/arrow-trend-up.svg'
                                                : 'icons/arrow-trend-down.svg'
                                        }
                                        alt={
                                            comparisonValue > 0
                                                ? 'Trend Up'
                                                : 'Trend Down'
                                        }
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
    };

    const renderUnitStatus = (count, label) => (
        <div className={styles.stat_card_right}>
            <span className="icons">{count}</span>
            {label}
        </div>
    );

    return (
        <div className={styles.main_content}>
            {error && (
                <div className="error">
                    <span className="error_icon">
                        <img src="icons/error-mark.svg" alt="warning" />
                    </span>
                    {error}
                </div>
            )}

            <div className={styles.dashboard_stats}>
                {isStatsLoading ? (
                    <>
                        <div className={styles.stats_section}>
                            <h2 className={styles.section_title}>
                                Consumer Statistics
                            </h2>
                            <div className={styles.stats_section_primary}>
                                <WidgetSkeleton />
                                <WidgetSkeleton />
                                <WidgetSkeleton />
                                <WidgetSkeleton />
                                <WidgetSkeleton />
                                <WidgetSkeleton />
                            </div>
                        </div>

                        <div className={styles.stats_section}>
                            <h2 className={styles.section_title}>
                                Consumption & Billing
                            </h2>
                            <div className={styles.stats_section_secondary}>
                                <WidgetSkeleton />
                                <WidgetSkeleton />
                                <WidgetSkeleton />
                                <WidgetSkeleton />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.stats_section}>
                            <h2 className={styles.section_title}>
                                Consumer Statistics
                            </h2>
                            <div className={styles.stats_section_primary}>
                                {renderStatCard(
                                    'Total Consumers',
                                    stats.totalConsumers,
                                    'icons/units.svg',
                                    `${stats.activeUnits} Active`,
                                    `${stats.inactiveUnits} In-Active`
                                )}
                                {renderStatCard(
                                    'Prepaid Consumers',
                                    stats.prepaidConsumer,
                                    'icons/prepaid.svg',
                                    `${stats.prepaidDisconnected} Disconnected`
                                )}
                                {renderStatCard(
                                    'Postpaid Consumers',
                                    stats.postpaidConsumers,
                                    'icons/point-of-sale-bill.svg',
                                    `${stats.postpaidDisconnected} Disconnected`
                                )}
                                {renderStatCard(
                                    'Overdue Amount',
                                    stats.totalOverdueAmount,
                                    'icons/due-payment.svg',
                                    `${stats.totalOverdueBillCount} Overdue Consumers`
                                )}
                                {renderStatCard(
                                    'Total Outstanding (Rs.)',
                                    stats.totalOutstanding,
                                    'icons/coins-shield.svg',
                                    `${stats.totalOutstandingPercentage}% of Total Billed Amount`
                                )}
                                {renderStatCard(
                                    'High-Usage Consumers',
                                    stats.heavyUsers,
                                    'icons/heavy-user.svg',
                                    `${stats.heavyUsersAverageConsumption} kWh Average Consumption`
                                )}
                                 {renderStatCard(
                                    'High-Usage Consumers',
                                    stats.heavyUsers,
                                    'icons/heavy-user.svg',
                                    `${stats.heavyUsersAverageConsumption} kWh Average Consumption`
                                )}
                            </div>
                        </div>

                        <div className={styles.stats_section}>
                            <h2 className={styles.section_title}>
                                Consumption & Billing {getDateRangeTitle()}
                                <div className={styles.action_cont}>
                                    <div
                                        className={
                                            styles.time_range_select_dropdown
                                        }>
                                        <select
                                            value={currentView}
                                            onChange={(e) =>
                                                setCurrentView(e.target.value)
                                            }
                                            className={
                                                styles.time_range_select
                                            }>
                                            <option value="Daily">Daily</option>
                                            <option value="Monthly">
                                                Monthly
                                            </option>
                                        </select>
                                        <img
                                            src="icons/arrow-down.svg"
                                            alt="Select Time"
                                            className={
                                                styles.time_range_select_dropdown_icon
                                            }
                                        />
                                    </div>
                                </div>
                            </h2>
                            <div className={styles.stats_section_secondary}>
                                {renderStatCard(
                                    'Electricity Usage (kWh)',
                                    currentView === 'Daily'
                                        ? stats.yesterdayConsumption
                                        : stats.monthlyConsumption,
                                    'icons/plug-alt.svg',
                                    `${
                                        currentView === 'Daily'
                                            ? stats.dayBeforeYesterdayConsumption
                                            : stats.lastMonthConsumption
                                    } ${
                                        currentView === 'Daily'
                                            ? 'kWh'
                                            : 'Last Month'
                                    }`,
                                    `${
                                        currentView === 'Daily'
                                            ? dayBeforeYesterdayDate()
                                            : ''
                                    }`,
                                    true
                                )}

                                {renderStatCard(
                                    'Electricity Charges (Rs)',
                                    currentView === 'Daily'
                                        ? stats.yesterdayElectricCharges
                                        : stats.currentMonthElectricityCharges,
                                    'icons/coins.svg',
                                    `${
                                        currentView === 'Daily'
                                            ? stats.dayBeforeYesterdayElectricityCharges
                                            : stats.lastMonthElectricityCharges
                                    } ${
                                        currentView === 'Daily'
                                            ? 'Rs'
                                            : 'Last Month'
                                    }`,
                                    `${
                                        currentView === 'Daily'
                                            ? dayBeforeYesterdayDate()
                                            : ''
                                    }`,
                                    true
                                )}

                                {renderStatCard(
                                    'Payment Receipts',
                                    currentView === 'Daily'
                                        ? stats.yesterDaypaymentReceipts
                                        : stats.currentMonthPaymentReceipts,
                                    'icons/file-invoice.svg',
                                    `${
                                        currentView === 'Daily'
                                            ? stats.dayBeforeYesterdayPaymentReceipts
                                            : stats.lastMonthPaymentReceipts
                                    } ${
                                        currentView === 'Daily'
                                            ? ''
                                            : 'Last Month'
                                    }`,
                                    `${
                                        currentView === 'Daily'
                                            ? dayBeforeYesterdayDate()
                                            : ''
                                    }`,
                                    true
                                )}

                                {renderStatCard(
                                    'Service Requests',
                                    currentView === 'Daily'
                                        ? stats.yesterDayServiceRequests
                                        : stats.currentMonthServiceRequests,
                                    'icons/mailbox.svg',
                                    `${
                                        currentView === 'Daily'
                                            ? stats.dayBeforeYesterdayPaymentReceipts
                                            : stats.lastMonthServiceRequests
                                    } ${
                                        currentView === 'Daily'
                                            ? ''
                                            : 'Last Month'
                                    }`,
                                    `${
                                        currentView === 'Daily'
                                            ? dayBeforeYesterdayDate()
                                            : ''
                                    }`,
                                    true
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="metrics_header">
                <h1 className="metrics_title">Metrics</h1>
            </div>
            <div className={styles.metrics_container}>
                {/* <div className={styles.metrics_row}>
                    <div className={styles.metrics}>
                        <BarChart
                            title="Daily Consumption"
                            xAxisData={dailyChartData.xAxisData}
                            seriesData={dailyChartData.seriesData}
                            timeRange="Dynamic"
                            onTimeRangeChange={() => { }}
                            height="400px"
                        />
                    </div>

                    <div className={styles.metrics}>
                        <BarChart
                            title="Monthly Consumption"
                            xAxisData={monthlyChartData.xAxisData}
                            seriesData={monthlyChartData.seriesData}
                            timeRange="Dynamic"
                            onTimeRangeChange={() => { }}
                            height="400px"
                        />
                    </div>
                </div> */}
                <div className={styles.metrics_row}>
                    <div className={styles.metrics}>
                        <BarChart
                            title="Consumption Metrics"
                            xAxisData={
                                chartTimeRange === 'Daily'
                                    ? dailyChartData.xAxisData
                                    : monthlyChartData.xAxisData
                            }
                            seriesData={
                                chartTimeRange === 'Daily'
                                    ? [
                                          {
                                              name: 'Consumption',
                                              data:
                                                  dailyChartData.seriesData[0]
                                                      ?.data || [],
                                          },
                                      ]
                                    : monthlyChartData.seriesData
                            }
                            timeRange={chartTimeRange}
                            availableTimeRanges={['Daily', 'Monthly']}
                            onTimeRangeChange={(selectedRange) => {
                                setChartTimeRange(selectedRange);
                                // If needed, fetch new data based on the selected range
                                if (selectedRange === 'Daily') {
                                    // You might want to fetch daily data for the last 2 months
                                    // fetchDailyData();
                                }
                            }}
                            height="400px"
                        />
                    </div>
                </div>
                <div
                    className={`${styles.metrics_row} ${styles.metric_graphs}`}>
                    <div className={styles.metrics}>
                        <PieChart
                            title="Meter Communication Status"
                            data={connectedMeters}
                            valueUnit=" Meter"
                            height="400px"
                            chartRef={React.useRef(null)}
                            showToolTip={false}
                            colors={['#029447', '#dc272c']}
                            onClick={(params) => {
                                if (params.name === 'Communicating') {
                                    navigate(
                                        `${basePath}/consumers?communicationStatus=communicating`
                                    );
                                } else if (
                                    params.name === 'Non-Communicating'
                                ) {
                                    navigate(
                                        `${basePath}/consumers?communicationStatus=non-communicating`
                                    );
                                }
                            }}
                        />
                    </div>
                    <div className={styles.metrics}>
                        <BarChart
                            title="Billing vs Collection"
                            xAxisData={billingData.xAxisData}
                            seriesData={billingData.seriesData}
                            timeRange="Monthly"
                            height="400px"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.tables_container}>
                <div className={styles.table_column}>
                    <h2 className={styles.section_title}>Overdue Consumers</h2>
                    <Table
                        data={overdueConsumers}
                        columns={[
                            { key: 'uid', label: 'UID' },
                            { key: 'consumer_name', label: 'Consumer Name' },
                            // {
                            //     key: 'block_name',
                            //     label: 'Block',
                            //     render: (block_no) =>
                            //         extractBlockLetter(block_no),
                            // },
                            { key: 'flat_no', label: 'Flat No' },
                            { key: 'due_amount', label: 'Overdue (Rs.)' },
                        ]}
                        actions={[
                            {
                                label: 'Send Reminder',
                                onClick: handleSendReminder,
                                icon: 'icons/paper-plane.svg',
                            },
                            {
                                label: 'Add Credit',
                                onClick: handleAddCredit,
                                icon: 'icons/credit.svg',
                            },
                            {
                                label: 'Disconnect - Power',
                                onClick: handleMarkDisconnected,
                                icon: 'icons/disconnect.svg',
                            },
                        ]}
                        sortable={true}
                        searchable={true}
                        loading={isOverdueTableLoading}
                        emptyMessage="No overdue consumers found"
                        rowsPerPageOptions={[5, 10, 50]}
                        initialRowsPerPage={10}
                        showSkeletonActionButtons={false}
                        serverPagination={overdueConsumerPagination}
                        onPageChange={handleOverDueConsumerPageChange}
                        showActions={true}
                    />
                </div>

                <div className={styles.table_column}>
                    <h2 className={styles.section_title}>
                        Disconnected Consumers
                    </h2>
                    <Table
                        data={disconnectedConsumers}
                        columns={[
                            { key: 'uid', label: 'UID' },
                            { key: 'consumer_name', label: 'Consumer Name' },
                            // {
                            //     key: 'block_name',
                            //     label: 'Block No',
                            //     render: (block_no) =>
                            //         extractBlockLetter(block_no),
                            // },
                            { key: 'flat_no', label: 'Flat No' },
                            { key: 'amount', label: 'Overdue (Rs.)' },
                        ]}
                        actions={[
                            {
                                label: 'Send Reminder',
                                onClick: handleSendReminder,
                                icon: 'icons/paper-plane.svg',
                            },
                            {
                                label: 'Add Credit',
                                onClick: handleAddCredit,
                                icon: 'icons/credit.svg',
                            },
                            {
                                label: 'Reconnect - Power',
                                onClick: handleMarkConnected,
                                icon: 'icons/connect.svg',
                            },
                        ]}
                        sortable={true}
                        searchable={true}
                        loading={isDisconnectedTableLoading}
                        emptyMessage="No disconnected consumers found"
                        rowsPerPageOptions={[5, 10, 50]}
                        initialRowsPerPage={10}
                        showSkeletonActionButtons={false}
                        showActions={true}
                        serverPagination={disconnectedConsumerPagination}
                        onPageChange={handleDisconnectedConsumerPageChange}
                    />
                </div>
            </div>

            <Modal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                title={
                    modalState.type === 'reminder'
                        ? 'Send Reminder'
                        : modalState.type === 'credit'
                        ? 'Add Credit'
                        : modalState.type === 'disconnect'
                        ? 'Disconnect Consumer'
                        : 'Connect Consumer'
                }
                onConfirm={handleConfirmAction}
                confirmLabel={
                    modalState.type === 'reminder'
                        ? 'Send'
                        : modalState.type === 'credit'
                        ? 'Add'
                        : modalState.type === 'disconnect'
                        ? 'Disconnect'
                        : 'Connect'
                }>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default Dashboard;
