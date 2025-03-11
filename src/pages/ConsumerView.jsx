import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import LineChart from '../components/graphs/LineChart/LineChart';
import BarChart from '../components/graphs/BarChart/BarChart';
import PieChart from '../components/graphs/PieChart/PieChart';
import styles from '../styles/ConsumerView.module.css';
import Table from '../components/ui/Table/Tables';
import Tabs from '../components/ui/Tabs/Tabs';
import dashboardStyles from '../styles/Dashboard.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    convertToIST,
    formatDateDayMonthYear,
    formatDateSlash,
    formatMonthYear,
} from '../utils/globalUtils';
import WidgetSkeleton from '../components/ui/WidgetSkeleton/WidgetSkeleton';

const ConsumerView = () => {
    const [activeTab, setActiveTab] = useState('billing');
    const [isLoading, setIsLoading] = useState(true);
    const [isInstantaneousDataLoading, setInstantaneousDataLoading] =
        useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [dailyChartData, setDailyChartData] = useState({
        xAxisData: [],
        seriesData: [],
    });
    const [monthlyChartData, setMonthlyChartData] = useState({
        xAxisData: [],
        seriesData: [],
    });
    const [projectedChartData, setProjectedChartData] = useState({
        xAxis: [],
        currMonthyValues: [],
        prevMonthyValues: [],
    });
    const [meterData, setMeterData] = useState({
        voltage: '0.0',
        vYPh: '0.0',
        vBPh: '0.0',
        cYPh: '0.0',
        cBPh: '0.0',
        current: '0.0',
        powerFactor: '0.0',
        kwhConsumption: '0.0',
        lastCommunicationDate: '0',
        frequency: '0',
    });
    const [cumulativeData, setCumulativeData] = useState([]);
    const [demoBarChartData, setDemoBarChartData] = useState({
        xAxisData: [],
        seriesData: [],
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
        total: 0,
    });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [consumerData, setConsumerData] = useState({
        fullName: '',
        consumerNumber: 'CN-2024-001',
        status: 'Active',
        designation: '*********',
        consumerId: '',
        uniqueIdentificationNo: '',
        primaryMobile: '',
        secondaryMobile: '',
        email: 'john.doe@example.com',
        permanentAddress: '',
        billingAddress: '',
        agreementStartDate: '2024-01-01',
        agreementEndDate: '2025-12-31',
        hierarchyTypeId: 'HT-001',
        hierarchyId: 'H-2024-789',
        acStatus: 'Regular',
        billingUnit: 'BU-North-001',
        depot: 'Central Depot',
        station: 'Station-NYC-05',
        profilePicture: null,
        meter_serial: '',
    });
    const [billData, setBillData] = useState({
        billingMonth: '',
        billPeriodfrom: '',
        billPeriodto: '',
        dueDate: '',
        status: '',
    });
    const [consumption, setConsumptionData] = useState({
        daily_consumption: 0,
        yesterday_consumption: 0,
        monthly_consumption: 0,
        last_month_consumption: 0,
    });
    const { id } = useParams();

    const billingData = useMemo(
        () => ({
            billNumber: 'BILL-2024-001',
            billingMonth: 'March 2024',
            billPeriod: {
                from: '2024-03-01',
                to: '2024-03-31',
            },
            generatedDate: '2024-04-01',
            dueDate: '2024-04-15',
            amounts: {
                currentBill: 1500.0,
                previousBalance: 200.0,
                balanceAfterPayment: 0.0,
            },
            paymentStatus: {
                status: 'Pending',
                mode: 'Online Banking',
            },
            consumption: {
                energy: { start: 5000, end: 5500 },
                solar: { start: 1000, end: 1200 },
                dg: 100,
            },
            tariffs: {
                energy: 8.5,
                solar: 4.2,
                dg: 12.0,
            },
            billAmounts: {
                energy: 4250.0,
                solar: 840.0,
                dg: 1200.0,
            },
            total_oustanding: 0,
        }),
        []
    );
    const [billHistory, setBillHistory] = useState([]);

    function getPhoneSuffix(fullName) {
        let hash = 0;
        for (let i = 0; i < fullName.length; i++) {
            hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        return (hash % 100).toString().padStart(2, '0');
    }

    function convertDate(dateArray) {
        return dateArray.map((dateStr) => {
            const dateObj = new Date(dateStr);

            const month = dateObj.toLocaleString('en-US', {
                month: 'short',
            });
            const day = dateObj.getDate();
            const year = dateObj.getFullYear().toString().slice(-2);
            return `${month} ${day}`;
        });
    }

    function convertDateString(dateStr) {
        const regex = /^([A-Za-z]{3})\s+\d+,\s+(\d{4})$/;
        const match = dateStr.match(regex);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
        return dateStr;
    }

    const fetchConsumerDetails = async (page, limit) => {
        try {
            setIsLoading(true);
            const response = await apiClient.get(
                `/consumer?consumer_uid=${id}&page=${page}&limit=${limit}`
            );

            const projectedGraphData = response.projectedGraphData;
            setProjectedChartData({
                xAxis: projectedGraphData.xAxis,
                currMonthyValues: projectedGraphData.currMonthyValues,
                prevMonthyValues: projectedGraphData.prevMonthyValues,
            });
            const lastbill = response.lastbill;
            const consumer = response.consumer;
            let dailyConsumption = response.dailyConsumption;
            const monthlyConsumption = response.monthlyConsumption;
            const invoices = response.invoices;
            const consumption = response.consumption;
            const pagination = response.pagination;
            setBillHistory(invoices);
            setConsumerData((prev) => ({
                ...prev,
                fullName: consumer.consumer_name,
                consumerId: consumer.consumer_id,
                primaryMobile: consumer.mobile1,
                secondaryMobile: consumer.mobile2,
                email: consumer.email,
                uniqueIdentificationNo: consumer.uid,
                permanentAddress:
                    consumer.permanent_address ||
                    `${consumer.block_name}, ${consumer.flat_no}, Sun City, Kondapur, Hyderabad, Telangana India`,
                billingAddress:
                    consumer.billing_address ||
                    `${consumer.block_name}, ${consumer.flat_no}, Sun City, Kondapur, Hyderabad, Telangana India`,
                block_name: consumer.block_name,
                flat_no: consumer.flat_no,
                meter_serial: consumer.meter_serial,
            }));

            setEditedData((prev) => ({
                ...prev,
                fullName: consumer.consumer_name,
                consumerId: consumer.consumer_id,
                primaryMobile: consumer.mobile1,
                secondaryMobile: consumer.mobile2,
                email: consumer.email,
                uniqueIdentificationNo: consumer.uid,
                permanentAddress:
                    consumer.permanent_address || prev.permanentAddress,
                billingAddress:
                    consumer.billing_address ||
                    `${consumer.block_name}, ${consumer.flat_no} Sun City Kondapur, Hyderabad - Telangana India`,
                block_name: consumer.block_name,
                flat_no: consumer.flat_no,
                meter_serial: consumer.meter_serial,
            }));

            setDailyChartData({
                xAxisData: dailyConsumption.dailyxAxisData,
                seriesData: [
                    {
                        name: 'Consumption',
                        data: dailyConsumption.dailysums,
                    },
                ],
            });
            setMonthlyChartData({
                xAxisData: monthlyConsumption.monthlyxAxisData,
                seriesData: [
                    {
                        name: 'Consumption',
                        data: monthlyConsumption.monthlysums,
                    },
                ],
            });

            setPagination({
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalCount: pagination.totalCount,
                limit: pagination.limit,
                hasNextPage: pagination.hasNextPage,
                hasPrevPage: pagination.hasPrevPage,
            });
            const monthly_consumption =
                monthlyConsumption.monthlysums[
                    monthlyConsumption.monthlysums.length - 1
                ];
            const last_month_consumption =
                monthlyConsumption.monthlysums[
                    monthlyConsumption.monthlysums.length - 2
                ];

            setConsumptionData((prev) => ({
                ...prev,
                monthly_consumption: monthly_consumption,
                last_month_consumption: last_month_consumption,
            }));

            setBillData((prev) => ({
                ...prev,
                billingMonth:
                    formatMonthYear(lastbill?.created_at) ?? prev.billingMonth,
                billPeriodfrom:
                    formatDateSlash(lastbill?.billing_period_start) ??
                    prev.billPeriodfrom,
                billPeriodto:
                    formatDateSlash(lastbill?.billing_period_end) ??
                    prev.billPeriodto,
                dueDate: formatDateSlash(lastbill?.due_date) ?? prev.dueDate,
                status: lastbill?.status ?? prev.status,
            }));

            setConsumptionData((prev) => ({
                ...prev,
                daily_consumption: consumption.todayConsumption,
                yesterday_consumption: consumption.yesterdayConsumption,
            }));
        } catch (err) {
            setError(err.message);
            console.error('Error fetching analytics data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUrlParams = (page, limit) => {
        navigate(`?page=${page}&limit=${limit}`, { replace: true });
    };

    const handlePageChange = (page, limit) => {
        updateUrlParams(page, limit);
        fetchConsumerDetails(page, limit);
    };

    function getStarCount(fullName) {
        let hash = 0;
        for (let i = 0; i < fullName.length; i++) {
            hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        const starCount = (hash % (20 - 6 + 1)) + 6;
        return starCount;
    }

    const renderStatCard = (
        title,
        value,
        icon,
        subtitle1,
        subtitle2,
        showTrend = false
    ) => {
        let comparisonValue;

        if (title === 'Daily Consumption (kWh)') {
            comparisonValue =
                consumption.daily_consumption -
                consumption.yesterday_consumption;
        } else if (title === 'Monthly Consumption (kWh)') {
            comparisonValue =
                consumption.monthly_consumption -
                consumption.last_month_consumption;
        }

        return (
            <div className={dashboardStyles.total_units_container}>
                <div className={dashboardStyles.stat_card}>
                    <div className={dashboardStyles.stat_card_left}>
                        <div className="titles">{title}</div>
                        <p className={dashboardStyles.stat_number}>
                            {value}
                            {showTrend && (
                                <span
                                    className={
                                        showTrend > 0
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
                    <div className={dashboardStyles.stat_card_right}>
                        <span className="icons">
                            <img src={icon} alt={`${title} Icon`} />
                        </span>
                    </div>
                </div>
                <div className={dashboardStyles.active_units_container}>
                    <div className="sub_title">{subtitle1}</div>
                    {subtitle2 && <div className="sub_title">{subtitle2}</div>}
                </div>
            </div>
        );
    };

    const renderBillingTab = () => {
        return (
            <div className={styles.tabContent}>
                <div className={styles.billingSummary}>
                    <h3 className="titles">Current Bill Details</h3>
                    <div className={styles.profileGrid}>
                        {/* <div className={styles.profileItem}>
              <span className={styles.label}>Bill Number</span>
              <span className={styles.value}>{billingData.billNumber}</span>
            </div> */}
                        <div className={styles.profileItem}>
                            <span className={styles.label}>Billing Month</span>
                            <span className={styles.value}>
                                {billData.billingMonth}
                            </span>
                        </div>
                        <div className={styles.profileItem}>
                            <span className={styles.label}>Bill Period</span>
                            <span className={styles.value}>
                                {billData.billPeriodfrom} -{' '}
                                {billData.billPeriodto}
                            </span>
                        </div>
                        <div className={styles.profileItem}>
                            <span className={styles.label}>Due Date</span>
                            <span className={styles.value}>
                                {billData.dueDate}
                            </span>
                        </div>
                    </div>

                    <h3 className="titles">Consumption Summary</h3>

                    <div className={styles.dashboard_stats_container}>
                        {renderStatCard(
                            'Monthly Consumption (kWh)',
                            consumption.monthly_consumption,
                            'icons/bolt.svg',
                            `Last Month: ${consumption.last_month_consumption} kWh`,
                            null,
                            true
                        )}
                        {renderStatCard(
                            'Daily Consumption (kWh)',
                            consumption.daily_consumption,
                            'icons/daily-consumption.svg',
                            `Yesterday: ${consumption.yesterday_consumption} kWh`,
                            null,
                            true
                        )}
                        {renderStatCard(
                            'Total Outstanding (Rs.)',
                            billingData.total_oustanding,
                            'icons/search-icon.svg',
                            'Last Month: ₹0'
                        )}
                        {renderStatCard(
                            'Bill Status',
                            billData.status,
                            'icons/due-payment.svg',
                            `Due Date: ${billData.dueDate}`
                        )}
                    </div>

                    {/* <h3 className="titles">Tariff and Billing Breakdown</h3>
                    <div className={styles.units_table_container}>
                        <Table
                            data={tariffTableData}
                            columns={[
                                { key: 'type', label: 'Type' },
                                {
                                    key: 'rate',
                                    label: 'Tariff Rate',
                                    render: (value) => `₹${value}/unit`,
                                },
                                // {
                                //   key: "amount",
                                //   label: "Amount",
                                //   render: (value) => `₹${value}`,
                                //   disabled: !showAmount,
                                // },
                            ]}
                            emptyMessage="No tariff data available"
                            customStyles={styles}
                        />
                    </div> */}
                </div>
            </div>
        );
    };

    const tabContent = [
        {
            label: 'Current Bill',
            content: renderBillingTab(),
        },
        {
            label: 'History',
            content: (
                <div className={styles.units_table_container}>
                    <Table
                        data={billHistory}
                        columns={[
                            { key: 'created_at', label: 'Billing Month' },
                            { key: 'invoice_id', label: 'Invoice No' },
                            {
                                key: 'bill_date',
                                label: 'Bill Date',
                                render: (value) =>
                                    new Date(value).toLocaleDateString(),
                            },
                            {
                                key: 'due_date',
                                label: 'Due Date',
                                render: (value) =>
                                    new Date(value).toLocaleDateString(),
                            },
                            {
                                key: 'status',
                                label: 'Paid Status',
                                render: (status) => {
                                    const statusMap = {
                                        paid: (
                                            <span
                                                className={styles.status_paid}>
                                                Paid
                                            </span>
                                        ),
                                        pending: (
                                            <span
                                                className={
                                                    styles.status_pending
                                                }>
                                                Pending
                                            </span>
                                        ),
                                        overdue: (
                                            <span
                                                className={
                                                    styles.status_overdue
                                                }>
                                                Overdue
                                            </span>
                                        ),
                                        partiallyPaid: (
                                            <span
                                                className={
                                                    styles.status_partially_paid
                                                }>
                                                Partially Paid
                                            </span>
                                        ),
                                    };
                                    return (
                                        statusMap[status.toLowerCase()] ||
                                        status
                                    );
                                },
                            },
                            {
                                key: 'consumption',
                                label: 'No. of Units',
                                render: (value) =>
                                    `${value.toLocaleString()} kWh`,
                            },
                            {
                                key: 'amount',
                                label: 'Total Bill',
                                render: (value) => `₹${value.toLocaleString()}`,
                            },
                        ]}
                        searchable={true}
                        sortable={true}
                        emptyMessage="No billing history available"
                        customStyles={styles}
                        loading={isLoading}
                        onPageChange={handlePageChange}
                        rowsPerPageOptions={[5, 10, 50]}
                        initialRowsPerPage={5}
                        serverPagination={pagination}
                        // onView={(row) => handleView(row.invoiceNo, row.meterNo)}
                        onDownload={(row) =>
                            window.open(`/pdf/${row.invoiceNo}`, '_blank')
                        }
                        showSkeletonActionButtons={false}
                        // onDelete={(row) => handleDelete(row)}
                    />
                </div>
            ),
        },
    ];

    const handleDelete = (row) => {};

    const handleEdit = (row) => {};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditClick = () => {
        setEditMode(true);
        setEditedData(consumerData);
    };

    const handleSaveClick = async () => {
        try {
            setError(false);
            const response = await apiClient.post(`/edit/consumer`, editedData);
            const uid = response.data;
            navigate(`/user/consumers/view/${uid}`);
            window.location.reload();
        } catch (error) {
            console.error('Error saving data:', error);
            setError(error.message);
        }
    };

    const renderField = (label, key) => (
        <div key={key} className={styles.profileItem}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>
                {editMode ? (
                    key === 'uniqueIdentificationNo' ? (
                        consumerData[key]
                    ) : (
                        <input
                            type="text"
                            name={key}
                            value={editedData[key] || ''}
                            onChange={handleInputChange}
                        />
                    )
                ) : (
                    consumerData[key]
                )}
            </span>
        </div>
    );

    const renderAddressField = (title, key) => {
        let value = consumerData[key];

        if (key === 'primaryMobile') {
            value = isLoading
                ? ''
                : '+91' + '********' + getPhoneSuffix(consumerData.fullName);
        } else if (key === 'secondaryMobile') {
            value = isLoading
                ? ''
                : '+91' +
                  '********' +
                  getPhoneSuffix(consumerData.fullName + '1');
        }

        if (key === 'email') {
            value = isLoading
                ? ''
                : `${'*'.repeat(
                      getStarCount(consumerData.fullName)
                  )}@gmail.com`;
        }

        return (
            <div key={key} className={styles.addressBlock}>
                <h3 className={styles.subTitle}>{title}</h3>
                {editMode ? (
                    <textarea
                        name={key}
                        value={editedData[key] || ''}
                        onChange={handleInputChange}
                    />
                ) : (
                    <p className={styles.addressText}>{value}</p>
                )}
            </div>
        );
    };

    const fetchInstantaneousData = async (meter) => {
        if (!meter) return;
        try {
            setInstantaneousDataLoading(true);
            const response = await apiClient.get(
                `/reports/power?meterOrUid=${meter}`
            );

            const pow = response.data.power;
            setMeterData((prev) => ({
                ...prev,
                voltage: pow.voltage ?? 0.0,
                vYPh: pow.vYPh,
                vBPh: pow.vBPh,
                cYPh: pow.cYPh,
                cBPh: pow.cBPh,
                current: pow.current ?? 0.0,
                frequency: pow.frequency,
                powerFactor: pow.powerFactor ?? 0.0,
                kwhConsumption: response.data.last_comm ?? 0.0,
                lastCommunicationDate: convertToIST(
                    response.data.last_comm_date
                ),
            }));
        } catch (error) {
            console.error('Error fetching widget data:', error);
        } finally {
            setInstantaneousDataLoading(false);
        }
    };

    const VoltagePhaseWidgets = () => (
        <>
            <div className={styles.total_units_container}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_card_left}>
                        <div className="titles">
                            {meterData.vYPh && meterData.vYPh !== '0.0'
                                ? 'R-Phase Voltage'
                                : 'Voltage'}
                        </div>
                        <p className={styles.stat_number}>
                            {meterData.voltage}
                        </p>
                    </div>
                    <div className={styles.stat_card_right}>
                        <span className="icons-r">
                            <img
                                src="icons/r-phase-voltage.svg"
                                alt="Voltage"
                            />
                        </span>
                    </div>
                </div>
                <div className={styles.active_units_container}>
                    <div className="sub_title">Volts</div>
                </div>
            </div>
            {meterData.vYPh && meterData.vYPh !== '0.0' && (
                <div className={styles.total_units_container}>
                    <div className={styles.stat_card}>
                        <div className={styles.stat_card_left}>
                            <div className="titles">Y-Phase Voltage</div>
                            <p className={styles.stat_number}>
                                {meterData.vYPh}
                            </p>
                        </div>
                        <div className={styles.stat_card_right}>
                            <span className="icons-y">
                                <img
                                    src="icons/r-phase-voltage.svg"
                                    alt="Voltage"
                                />
                            </span>
                        </div>
                    </div>
                    <div className={styles.active_units_container}>
                        <div className="sub_title">Volts</div>
                    </div>
                </div>
            )}
            {meterData.vBPh && meterData.vBPh !== '0.0' && (
                <div className={styles.total_units_container}>
                    <div className={styles.stat_card}>
                        <div className={styles.stat_card_left}>
                            <div className="titles">B-Phase Voltage</div>
                            <p className={styles.stat_number}>
                                {meterData.vBPh}
                            </p>
                        </div>
                        <div className={styles.stat_card_right}>
                            <span className="icons-b">
                                <img
                                    src="icons/r-phase-voltage.svg"
                                    alt="Voltage"
                                />
                            </span>
                        </div>
                    </div>
                    <div className={styles.active_units_container}>
                        <div className="sub_title">Volts</div>
                    </div>
                </div>
            )}
        </>
    );

    const CurrentPhaseWidgets = () => (
        <>
            <div className={styles.total_units_container}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_card_left}>
                        <div className="titles">
                            {' '}
                            {meterData.cYPh && meterData.cYPh !== '0.0'
                                ? 'R-Phase Current'
                                : 'Current'}
                        </div>
                        <p className={styles.stat_number}>
                            {meterData.current}
                        </p>
                    </div>
                    <div className={styles.stat_card_right}>
                        <span className="icons-r">
                            <img
                                src="icons/r-phase-current.svg"
                                alt="Current"
                            />
                        </span>
                    </div>
                </div>
                <div className={styles.active_units_container}>
                    <div className="sub_title">Amps</div>
                </div>
            </div>
            {meterData.cYPh && meterData.cYPh !== '0.0' && (
                <div className={styles.total_units_container}>
                    <div className={styles.stat_card}>
                        <div className={styles.stat_card_left}>
                            <div className="titles">Y-Phase Current</div>
                            <p className={styles.stat_number}>
                                {meterData.cYPh}
                            </p>
                        </div>
                        <div className={styles.stat_card_right}>
                            <span className="icons-y">
                                <img
                                    src="icons/r-phase-current.svg"
                                    alt="Current"
                                />
                            </span>
                        </div>
                    </div>
                    <div className={styles.active_units_container}>
                        <div className="sub_title">Amps</div>
                    </div>
                </div>
            )}
            {meterData.cBPh && meterData.cBPh !== '0.0' && (
                <div className={styles.total_units_container}>
                    <div className={styles.stat_card}>
                        <div className={styles.stat_card_left}>
                            <div className="titles">B-Phase Current</div>
                            <p className={styles.stat_number}>
                                {meterData.cBPh}
                            </p>
                        </div>
                        <div className={styles.stat_card_right}>
                            <span className="icons-b">
                                <img
                                    src="icons/r-phase-current.svg"
                                    alt="Current"
                                />
                            </span>
                        </div>
                    </div>
                    <div className={styles.active_units_container}>
                        <div className="sub_title">Amps</div>
                    </div>
                </div>
            )}
        </>
    );

    const fetchD3GraphsData = async (meter) => {
        if (!meter) return;
        try {
            const response = await apiClient.get(
                `/reports/power-graphs?meterOrUid=${meter}`
            );

            console.log(response);
            let cons = response.data.consumption;
            let md = response.data.md_kw;

            setCumulativeData({
                xAxisData: md.mdxAxisData,
                seriesData: [
                    {
                        name: 'MD-kW',
                        data: md.mdsums,
                    },
                ],
            });
            console.log(cons);
            setDemoBarChartData({
                xAxisData: cons.dailyxAxisData,
                seriesData: [
                    {
                        name: 'Consumption',
                        data: cons.dailysums,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching graph data:', error);
        } finally {
            // setInstantaneousDataLoading(false);
        }
    };

    useEffect(() => {
        fetchInstantaneousData(id);
        // fetchD3GraphsData(id);
    }, [id]);

    useEffect(() => {
        fetchConsumerDetails();
    }, [id]);

    useEffect(() => {
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        fetchConsumerDetails(page, limit);
    }, [searchParams]);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {error && (
                    <div className="error">
                        <span className="error_icon">
                            <img src="icons/error-mark.svg" alt="warning" />
                        </span>
                        {error}
                    </div>
                )}
                <header className={styles.header}>
                    <div className={styles.headerMain}>
                        <div className={styles.profileImageContainer}>
                            {consumerData.profilePicture ? (
                                <img
                                    src={consumerData.profilePicture}
                                    alt={`${consumerData.fullName}'s profile`}
                                    className={styles.profileImage}
                                />
                            ) : (
                                <div className={styles.profileInitials}>
                                    {consumerData.fullName
                                        .split(' ')
                                        .map((name) => name[0])
                                        .join('')
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className={styles.headerInfo}>
                            <h1 className="title">
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={editedData.fullName || ''}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    consumerData.fullName
                                )}
                            </h1>
                            <span
                                className={`${styles.statusBadge} ${
                                    styles[consumerData.status.toLowerCase()]
                                }`}>
                                {consumerData.status}
                            </span>
                        </div>
                        <div className={styles.header_left}>
                            {editMode ? (
                                <>
                                    {' '}
                                    <Buttons
                                        label="Save"
                                        onClick={handleSaveClick}
                                    />
                                    <Buttons
                                        label="Cancel"
                                        onClick={() => {
                                            setEditMode(false);
                                            setError(false);
                                        }}
                                    />
                                </>
                            ) : (
                                <Buttons
                                    label="Edit"
                                    variant="outline"
                                    alt="Edit"
                                    onClick={handleEditClick}
                                />
                            )}
                        </div>
                    </div>
                    <div className={styles.headerDetails}>
                        {/* <div className={styles.detailItem}>
                            <span className={styles.label}>
                                Unique Identification No
                            </span>
                            <span className={styles.value}>
                                {consumerData.uniqueIdentificationNo}
                            </span>
                        </div> */}
                        {/* <div className={styles.detailItem}>
                            <span className={styles.label}>Designation</span>
                            <span className={styles.value}>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="designation"
                                        value={editedData.designation || ''}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    consumerData.designation
                                )}
                            </span>
                        </div> */}
                        {/* <div className={styles.detailItem}>
                            <span className={styles.label}>
                                Meter Serial Number
                            </span>
                            <span className={styles.value}>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="meter_serial"
                                        value={editedData.meter_serial || ''}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    consumerData.meter_serial
                                )}
                            </span>
                        </div> */}
                    </div>
                </header>

                <section className={styles.profileSection}>
                    <div className="titles">Basic Information</div>
                    <div className={styles.profileGrid}>
                        {[
                            [
                                'Unique Identification No',
                                'uniqueIdentificationNo',
                            ],
                            ['Meter Serial Number', 'meter_serial'],
                            ['Flat No', 'flat_no'],
                            ['Block Name', 'block_name'],
                        ].map(([label, key]) => renderField(label, key))}
                    </div>

                    <div className={styles.addressGrid}>
                        {[
                            ['Permanent Address', 'permanentAddress'],
                            ['Billing Address', 'billingAddress'],
                            ['Mobile No', 'primaryMobile'],
                            ['Email ID', 'email'],
                        ].map(([title, key]) => renderAddressField(title, key))}
                    </div>
                </section>
                <section className={styles.profileSection}>
                    <div className="titles">Instantaneous Data</div>
                    <div className={styles.stats_section}>
                        {isInstantaneousDataLoading ? (
                            <>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gap: '1rem',
                                        marginBottom: '1rem',
                                    }}>
                                    {Array(5)
                                        .fill(0)
                                        .map((_, index) => (
                                            <WidgetSkeleton key={index} />
                                        ))}
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gap: '1rem',
                                    }}>
                                    {Array(5)
                                        .fill(0)
                                        .map((_, index) => (
                                            <WidgetSkeleton key={index} />
                                        ))}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* First Row */}
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${
                                            meterData.vYPh !== null &&
                                            meterData.vBPh !== null
                                                ? 5
                                                : 3
                                        }, 1fr)`,
                                        gap: '1rem',
                                        marginBottom: '1rem',
                                    }}>
                                    {meterData.vYPh !== '0.0' &&
                                    meterData.vBPh !== '0.0' ? (
                                        <VoltagePhaseWidgets />
                                    ) : (
                                        <div
                                            className={
                                                styles.total_units_container
                                            }>
                                            <div className={styles.stat_card}>
                                                <div
                                                    className={
                                                        styles.stat_card_left
                                                    }>
                                                    <div className="titles">
                                                        Voltage
                                                    </div>
                                                    <p
                                                        className={
                                                            styles.stat_number
                                                        }>
                                                        {meterData.voltage}
                                                    </p>
                                                </div>
                                                <div
                                                    className={
                                                        styles.stat_card_right
                                                    }>
                                                    <span className="icons">
                                                        <img
                                                            src="icons/voltage.svg"
                                                            alt="Voltage"
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.active_units_container
                                                }>
                                                <div className="sub_title">
                                                    Volts
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className={
                                            styles.total_units_container
                                        }>
                                        <div className={styles.stat_card}>
                                            <div
                                                className={
                                                    styles.stat_card_left
                                                }>
                                                <div className="titles">
                                                    Power Factor
                                                </div>
                                                <p
                                                    className={
                                                        styles.stat_number
                                                    }>
                                                    {meterData.powerFactor}
                                                </p>
                                            </div>
                                            <div
                                                className={
                                                    styles.stat_card_right
                                                }>
                                                <span className="icons">
                                                    <img
                                                        src="icons/power-factor.svg"
                                                        alt="Power Factor"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={
                                            styles.total_units_container
                                        }>
                                        <div className={styles.stat_card}>
                                            <div
                                                className={
                                                    styles.stat_card_left
                                                }>
                                                <div className="titles">
                                                    Frequency
                                                </div>
                                                <p
                                                    className={
                                                        styles.stat_number
                                                    }>
                                                    {meterData.frequency}
                                                </p>
                                            </div>
                                            <div
                                                className={
                                                    styles.stat_card_right
                                                }>
                                                <span className="icons">
                                                    <img
                                                        src="icons/frequency.svg"
                                                        alt="Frequency"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Second Row */}
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${
                                            meterData.cYPh !== null &&
                                            meterData.cBPh !== null
                                                ? 5
                                                : 3
                                        }, 1fr)`,
                                        gap: '1rem',
                                    }}>
                                    {meterData.cYPh !== '0.0' &&
                                    meterData.cBPh !== '0.0' ? (
                                        <CurrentPhaseWidgets />
                                    ) : (
                                        <div
                                            className={
                                                styles.total_units_container
                                            }>
                                            <div className={styles.stat_card}>
                                                <div
                                                    className={
                                                        styles.stat_card_left
                                                    }>
                                                    <div className="titles">
                                                        Current
                                                    </div>
                                                    <p
                                                        className={
                                                            styles.stat_number
                                                        }>
                                                        {meterData.current}
                                                    </p>
                                                </div>
                                                <div
                                                    className={
                                                        styles.stat_card_right
                                                    }>
                                                    <span className="icons">
                                                        <img
                                                            src="icons/current.svg"
                                                            alt="Current"
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.active_units_container
                                                }>
                                                <div className="sub_title">
                                                    Amps
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className={
                                            styles.total_units_container
                                        }>
                                        <div className={styles.stat_card}>
                                            <div
                                                className={
                                                    styles.stat_card_left
                                                }>
                                                <div className="titles">
                                                    Cumulative kWh (Active
                                                    Energy)
                                                </div>
                                                <p
                                                    className={
                                                        styles.stat_number
                                                    }>
                                                    {meterData.kwhConsumption}
                                                </p>
                                            </div>
                                            <div
                                                className={
                                                    styles.stat_card_right
                                                }>
                                                <span className="icons">
                                                    <img
                                                        src="icons/consumption.svg"
                                                        alt="Consumption"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={
                                            styles.total_units_container
                                        }>
                                        <div className={styles.stat_card}>
                                            <div
                                                className={
                                                    styles.stat_card_left
                                                }>
                                                <div className="titles">
                                                    Last Communication
                                                </div>
                                                <p
                                                    className={
                                                        styles.stat_number
                                                    }>
                                                    {
                                                        meterData.lastCommunicationDate
                                                    }
                                                </p>
                                            </div>
                                            <div
                                                className={
                                                    styles.stat_card_right
                                                }>
                                                <span className="icons">
                                                    <img
                                                        src="icons/last-comm.svg"
                                                        alt="Last Communication"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <section className={styles.profileSection}>
                    <div className="titles">Reports & Analytics</div>
                    <div className={styles.reportsGrid}>
                        <div className={styles.reportCard}>
                            <BarChart
                                title="Daily Consumption"
                                timeRange="Daily"
                                xAxisData={dailyChartData.xAxisData}
                                seriesData={dailyChartData.seriesData}
                            />
                        </div>
                        <div className={styles.reportCard}>
                            <BarChart
                                title="Monthly Consumption"
                                xAxisData={monthlyChartData.xAxisData}
                                seriesData={monthlyChartData.seriesData}
                                timeRange="Monthly"
                            />
                        </div>
                        {/* <div className={styles.reportCard}>
                            <PieChart
                                title="Consumption Breakdown"
                                data={pieChartData}
                                valueUnit="kWh"
                                chartRef={pieChartRef}
                            />
                        </div> */}
                    </div>
                    <div
                        className={`${styles.reportsGrid} ${styles.lineGraphReportsGrid}`}>
                        <div className={styles.reportCard}>
                            <LineChart
                                timeRange="Daily"
                                data={{
                                    daily: {
                                        xAxis: projectedChartData.xAxis,
                                        series: [
                                            {
                                                name: 'Current Month',
                                                data: projectedChartData.currMonthyValues,
                                            },
                                            {
                                                name: 'Previous Month',
                                                data: projectedChartData.prevMonthyValues,
                                            },
                                        ],
                                    },
                                }}
                            />
                        </div>
                    </div>
                </section>
                {/* <section className={styles.profileSection}>
                    <div className={styles.reportCard}>
                        <BarChart
                            title="Cumulative kWh (Active Energy)"
                            xAxisData={demoBarChartData.xAxisData ?? []}
                            seriesData={demoBarChartData.seriesData ?? []}
                            height="400px"
                            timeRange="Daily"
                        />
                    </div>
                    <BarChart
                        title="MD-kW"
                        xAxisData={cumulativeData.xAxisData ?? []}
                        seriesData={cumulativeData.seriesData ?? []}
                        height="400px"
                        timeRange="Daily"
                    />
                </section> */}
                <section className={styles.profileSection}>
                    <div className="titles">Billing & Reports</div>
                    <Tabs
                        tabs={tabContent}
                        defaultTab={0}
                        onTabChange={(index) =>
                            setActiveTab(index === 0 ? 'billing' : 'history')
                        }
                    />
                </section>
            </div>
        </div>
    );
};

export default ConsumerView;
