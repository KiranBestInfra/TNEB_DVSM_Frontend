import { useState, useEffect, useRef } from 'react';
import BarChart from '../components/graphs/BarChart/BarChart';
import PieChart from '../components/graphs/PieChart/PieChart';
import styles from '../styles/Reports.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { apiClient } from '../api/client';
import WidgetSkeleton from '../components/ui/WidgetSkeleton/WidgetSkeleton';
import { useAuth } from '../components/AuthProvider';
import {
    convertToIST,
    formatDateDayMonthYear,
    formatDateMonth,
    formatMonthYear,
} from '../utils/globalUtils';

const Reports = () => {
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const { user } = useAuth();
    const chartRef = useRef(null);

    // Consolidated loading states
    const [isLoading, setIsLoading] = useState({
        stats: true,
        widgets: true,
        graphs: true,
        consumers: true,
    });

    const percentileKeyMapping = {
        totalRevenue: 'totalRevenuePercentile',
        activeConsumers: 'activeConsumersPercentile',
        pendingBills: 'pendingBillsPercentile',
        averageBillAmount: 'averageBillAmountPercentile',
        overdueBills: 'overdueBillsPercentile',
        newConnections: 'newConnectionsPercentile',
    };

    const [metrics, setMetrics] = useState([
        {
            title: 'Total Revenue',
            value: '0',
            trend: 'up',
            percentage: '-100%',
            icon: 'icons/total-revenue.svg',
            key: 'totalRevenue',
        },
        {
            title: 'Active Consumers',
            value: '0',
            trend: 'down',
            percentage: '0%',
            icon: 'icons/active-users.svg',
            key: 'activeConsumers',
        },
        {
            title: 'Pending Bills',
            value: '0',
            trend: 'up',
            percentage: '+100%',
            icon: 'icons/pending-payments.svg',
            key: 'pendingBills',
        },
        {
            title: 'Average Bill Amount',
            value: '0',
            trend: 'up',
            percentage: '0%',
            icon: 'icons/average-bill.svg',
            key: 'averageBillAmount',
        },
        {
            title: 'Collection Rate',
            value: '0%',
            trend: 'up',
            percentage: '-0%',
            icon: 'icons/collection.svg',
            key: 'collectionRate',
        },
        {
            title: 'Overdue Bills',
            value: '0',
            trend: 'down',
            percentage: '+0%',
            icon: 'icons/overdue.svg',
            key: 'overdueBills',
        },
        {
            title: 'New Connections',
            value: '0',
            trend: 'up',
            percentage: '0%',
            icon: 'icons/user-add.svg',
            key: 'newConnections',
        },
        {
            title: 'Service Requests',
            value: '0',
            trend: 'down',
            percentage: '-0%',
            icon: 'icons/time-twenty-four.svg',
            key: 'serviceRequests',
        },
    ]);

    const [meterSerials, setMeterSerials] = useState([]);
    const [selectedMeter, setSelectedMeter] = useState('');
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

    const [barChartData, setBarChartData] = useState({
        xAxisData: [],
        seriesData: [],
    });

    const [demoBarChartData, setDemoBarChartData] = useState({
        xAxisData: [],
        seriesData: [],
    });

    const [consumerTypes, setConsumerTypesData] = useState([]);
    const [cumulativeData, setCumulativeData] = useState({
        xAxisData: [],
        seriesData: [],
    });

    const fetchWidgets = async (dateRange = null) => {
        try {
            setIsLoading((prev) => ({ ...prev, stats: true }));
            let url = `/reports/widgets`;
            if (dateRange && dateRange.start && dateRange.end) {
                url += `?start=${encodeURIComponent(
                    dateRange.start
                )}&end=${encodeURIComponent(dateRange.end)}`;
            }

            const response = await apiClient.get(url);

            if (response.status === 'success') {
                const data = response.data;
                setMetrics((prevMetrics) =>
                    prevMetrics.map((metric) => {
                        const newValue =
                            data[metric.key] !== undefined
                                ? data[metric.key]
                                : metric.value;
                        const percentileKey =
                            percentileKeyMapping[metric.key] ||
                            (data[metric.key + 'Percentile'] !== undefined
                                ? metric.key + 'Percentile'
                                : null);

                        let newPercentage = metric.percentage;
                        if (
                            percentileKey &&
                            data[percentileKey] !== undefined
                        ) {
                            newPercentage =
                                parseFloat(data[percentileKey]) + '%';
                        }

                        const newTrend = newPercentage.trim().startsWith('-')
                            ? 'down'
                            : newPercentage.trim().startsWith('+')
                            ? 'up'
                            : 'down';

                        return {
                            ...metric,
                            value: newValue,
                            percentage: newPercentage,
                            trend: newTrend,
                        };
                    })
                );
            }
        } catch (err) {
            console.error('Error fetching widget data:', err);
        } finally {
            setIsLoading((prev) => ({ ...prev, stats: false }));
        }
    };

    const addAdditionalConsumerTypes = (originalData) => {
        const existingTypes = new Map(
            originalData.map((item) => [item.name, item.value])
        );
        const requiredTypes = [
            'Residential',
            'Commercial',
            'Industrial',
            'SEZ',
        ];
        return requiredTypes.map((type) => ({
            name: type,
            value: existingTypes.get(type) || 0,
        }));
    };

    const fetchGraphData = async () => {
        try {
            setIsLoading((prev) => ({ ...prev, graphs: true }));
            const response = await apiClient.get('/reports/graphs');
            setBarChartData(response.data.amounts);
            const completeConsumerData = addAdditionalConsumerTypes(
                response.data.consumer_types
            );
            setConsumerTypesData(completeConsumerData);
        } catch (err) {
            console.error('Error fetching graph data:', err);
        } finally {
            setIsLoading((prev) => ({ ...prev, graphs: false }));
        }
    };

    const fetchDemoWidgetsData = async (meter) => {
        if (!meter) return;
        try {
            setIsLoading((prev) => ({ ...prev, widgets: true }));
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
            setIsLoading((prev) => ({ ...prev, widgets: false }));
        }
    };

    function fillMissingDates(data) {
        const dates = data.dailyxAxisData;
        const values = data.dailysums;

        const startDate = new Date(dates[0]);
        const endDate = new Date();

        const completeDates = [];
        const completeValues = [];

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const formattedDate = `${currentDate.toLocaleDateString('en-US', {
                month: 'short',
            })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
            const originalIndex = dates.indexOf(formattedDate);
            completeDates.push(formattedDate);
            completeValues.push(
                originalIndex !== -1 ? values[originalIndex] : '0.0'
            );

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            dailyxAxisData: completeDates,
            dailysums: completeValues,
        };
    }

    function fillMissingData(data, startDateStr) {
        const parsedStartDate = new Date(startDateStr);
        const endDate = new Date();

        const dateMap = new Map(data.map((item) => [item.date, { ...item }]));

        const result = [];
        const currentDate = new Date(parsedStartDate);

        while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const isoDate = `${year}-${month}-${day}`;

            if (dateMap.has(isoDate)) {
                result.push(dateMap.get(isoDate));
            } else {
                result.push({
                    date: isoDate,
                    count: 0,
                    value: '0.000',
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }

    const fetchDemoGraphsData = async (meter) => {
        if (!meter) return;
        try {
            setIsLoading((prev) => ({ ...prev, graphs: true }));
            const response = await apiClient.get(
                `/reports/power-graphs?meterOrUid=${meter}`
            );
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
            console.log(cons.dailysums);
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
            setIsLoading((prev) => ({ ...prev, graphs: false }));
        }
    };

    const fetchConsumers = async () => {
        try {
            setIsLoading((prev) => ({ ...prev, consumers: true }));
            const response = await apiClient.get('/consumers');
            const serials = response.data.map((consumer) => ({
                serial: consumer.meter_serial,
                name: consumer.consumer_name,
                flatNo: consumer.flat_no,
            }));
            setMeterSerials(serials);
            if (serials.length > 0) {
                setSelectedMeter(serials[0].serial);
            }
        } catch (error) {
            console.error('Error fetching consumers:', error);
        } finally {
            setIsLoading((prev) => ({ ...prev, consumers: false }));
        }
    };

    useEffect(() => {
        if (user?.locationHierarchy === 8 && selectedMeter) {
            fetchDemoWidgetsData(selectedMeter);
            fetchDemoGraphsData(selectedMeter);
        }
    }, [user, selectedMeter]);

    useEffect(() => {
        fetchConsumers();
    }, []);

    useEffect(() => {
        fetchGraphData();
        fetchWidgets();
    }, []);

    const renderStatCard = (
        title,
        value,
        icon,
        subtitle1,
        subtitle2,
        trend
    ) => (
        <div className={styles.total_units_container}>
            <div className={styles.stat_card}>
                <div className={styles.stat_card_left}>
                    <div className="titles">{title}</div>
                    <p className={styles.stat_number}>
                        {value}
                        {trend === 'up' ? (
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
            {(subtitle1 || subtitle2) && (
                <div className={styles.active_units_container}>
                    {subtitle1 && <div className="sub_title">{subtitle1}</div>}
                    {subtitle2 && <div className="sub_title">{subtitle2}</div>}
                </div>
            )}
        </div>
    );

    const handleMeterChange = (e) => {
        setSelectedMeter(e.target.value);
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

    const renderMetricsContent = () => {
        if (user?.locationHierarchy === 8) {
            return (
                <>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                        className="metrics_header">
                        <h1 className="metrics_title">Metrics</h1>
                        <div className={styles.action_cont}>
                            <div className={styles.time_range_select_dropdown}>
                                <select
                                    value={selectedMeter}
                                    onChange={handleMeterChange}
                                    className={styles.time_range_select}
                                    disabled={isLoading.consumers}>
                                    {meterSerials.map((meter) => (
                                        <option
                                            key={meter.serial}
                                            value={meter.serial}>
                                            {`${meter.serial} (${meter.name})`}
                                        </option>
                                    ))}
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
                    </div>

                    <div className={styles.stats_section}>
                        {isLoading.widgets ? (
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
                                                    <span className="icons-r">
                                                        <img
                                                            src="icons/r-phase-voltage.svg"
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
                                                    <span className="icons-r">
                                                        <img
                                                            src="icons/r-phase-voltage.svg"
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
                                                    Consumption (kWh)
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

                    <div className={styles.metrics_container}>
                        <div
                            style={{
                                'grid-template-columns': '1fr',
                                marginBottom: '1rem',
                            }}
                            className={styles.metrics_row}>
                            <div className={styles.metrics}>
                                <BarChart
                                    title="Consumption"
                                    xAxisData={demoBarChartData.xAxisData}
                                    seriesData={demoBarChartData.seriesData}
                                    height="400px"
                                    timeRange="Daily"
                                />
                            </div>
                        </div>
                        <div
                            style={{ 'grid-template-columns': '1fr' }}
                            className={styles.metrics_row}>
                            <div className={styles.metrics}>
                                <BarChart
                                    title="MD-kW"
                                    xAxisData={cumulativeData.xAxisData ?? []}
                                    seriesData={cumulativeData.seriesData ?? []}
                                    height="400px"
                                    timeRange="Daily"
                                />
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        return (
            <>
                <div className="metrics_header">
                    <h1 className="metrics_title">Metrics</h1>
                </div>
                <div className={styles.metrics_container}>
                    <div className={styles.metrics_row}>
                        <div className={styles.metrics}>
                            <BarChart
                                title="Revenue vs Collections"
                                xAxisData={barChartData.xAxisData}
                                seriesData={barChartData.seriesData}
                                height="400px"
                                timeRange="Monthly"
                            />
                        </div>
                        <div className={styles.metrics}>
                            <PieChart
                                title="Consumer Growth Rate"
                                data={consumerTypes}
                                height="400px"
                                chartRef={chartRef}
                                showPlural={false}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className={styles.main_content}>
            <div className="adminheader">
                <h1 className="title"></h1>
                <div className={styles.date_range}>
                    <div className={styles.search_cont}>
                        <DatePicker
                            selected={dateRange.start}
                            onChange={(date) =>
                                setDateRange({ ...dateRange, start: date })
                            }
                            className={styles.date_input}
                            dateFormat="MMM dd, yyyy"
                            placeholderText="Start Date"
                        />
                        <span className="icons icon_placement">
                            <img src="icons/date.svg" alt="Calendar" />
                        </span>
                    </div>

                    <div className={styles.search_cont}>
                        <DatePicker
                            selected={dateRange.end}
                            onChange={(date) =>
                                setDateRange({ ...dateRange, end: date })
                            }
                            className={styles.date_input}
                            dateFormat="MMM dd, yyyy"
                            placeholderText="End Date"
                            minDate={dateRange.start}
                        />
                        <span className="icons icon_placement">
                            <img src="icons/date.svg" alt="Calendar" />
                        </span>
                    </div>

                    <Buttons
                        label="Get Reports"
                        variant="primary"
                        alt="GetReports"
                        icon="icons/reports.svg"
                        iconPosition="left"
                        onClick={() => fetchWidgets(dateRange)}
                    />
                </div>
            </div>

            <div className={styles.dashboard_stats}>
                {isLoading.stats
                    ? metrics.map((_, index) => <WidgetSkeleton key={index} />)
                    : metrics.map((metric, index) =>
                          renderStatCard(
                              metric.title,
                              metric.value,
                              metric.icon,
                              `${metric.percentage} from last month`,
                              null,
                              metric.trend
                          )
                      )}
            </div>

            {renderMetricsContent()}
        </div>
    );
};

export default Reports;
