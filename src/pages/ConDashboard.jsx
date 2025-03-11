import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/ConDashboard.module.css';
import '../admin.css';
import BarChart from '../components/graphs/BarChart/BarChart';
import { apiClient } from '../api/client';
import WidgetSkeleton from '../components/ui/WidgetSkeleton/WidgetSkeleton';
import Buttons from '../components/ui/Buttons/Buttons';
import PaymentModal from '../components/ui/Modal/PaymentModal';
import { convertToIST } from '../utils/globalUtils';

const ConDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isMeterDataLoading, setMeterDataLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const [chartTimeRanges, setChartTimeRanges] = useState({
        consumption: 'Monthly',
        reading: 'Monthly',
        mdKw: 'Monthly',
    });
    const navigate = useNavigate();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [consumerProfile, setConsumerProfile] = useState({
        consumerName: '',
        consumerId: '',
        accountStatus: 'Active',
        connectionType: '',
        tariffPlan: '',
        meterSerialNo: '',
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

    const [billingData, setBillingData] = useState({
        currentDue: 2500,
        dueDate: '2024-03-31',
        previousBalance: 0,
        lastPayment: 2300,
        lastPaymentDate: '2024-02-15',
    });

    // Consumption Data
    const [consumptionData, setConsumptionData] = useState({
        daily: [],
        monthly: [],
        yearly: [],
    });

    const [chartData, setChartData] = useState({
        consumption: {
            xAxis: [],
            series: [],
        },
        reading: {
            xAxis: [],
            series: [],
        },
        mdKw: {
            xAxis: [],
            series: [],
        },
    });

    const fetchConsumerData = async () => {
        try {
            const response = await apiClient.get(`/details`);
            if (response.status == 'success') {
                const data = response.data;
                setConsumerProfile((prev) => ({
                    ...prev,
                    ...data,
                    consumerName: data.consumer_name,
                    consumerId: data.uid,
                    connectionType: data.meter_type,
                    tariffPlan: data.consumer_type,
                    meterSerialNo: data.meter_serial,
                }));

                setMeterData((prev) => ({
                    ...prev,
                    lastCommunicationDate: data.lastComm,
                }));
            }
        } catch (error) {
            setError(
                error.message ||
                    'An error occurred while fetching consumer data'
            );
        }
    };

    const fetchMeterData = async () => {
        try {
            const response = await apiClient.get(`/power`);
            const pow = response.data;

            console.log(pow);
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
                lastCommunicationDate: prev.lastCommunicationDate,
            }));
        } catch (error) {
            setError(
                error.message ||
                    'An error occurred while fetching consumer data'
            );
        } finally {
            setMeterDataLoading(false);
        }
    };

    useEffect(() => {
        const fetchConsumer = async () => {
            try {
                setIsLoading(true);

                const months = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ];
                const currentDate = new Date();
                const last12Months = Array.from({ length: 12 }, (_, index) => {
                    const d = new Date(currentDate);
                    d.setMonth(d.getMonth() - (11 - index));
                    return `${months[d.getMonth()]} ${d.getFullYear()}`;
                });

                const last30Days = Array.from({ length: 30 }, (_, index) => {
                    const d = new Date(currentDate);
                    d.setDate(d.getDate() - (29 - index));
                    return `${months[d.getMonth()]} ${d.getDate()}`;
                });

                setChartData({
                    consumption: {
                        monthly: {
                            xAxis: last12Months,
                            series: [
                                {
                                    name: 'Peak Hours',
                                    data: [
                                        440, 390, 420, 470, 540, 610, 680, 690,
                                        600, 510, 450, 480,
                                    ],
                                },
                                {
                                    name: 'Off-Peak Hours',
                                    data: [
                                        340, 290, 320, 370, 440, 510, 580, 590,
                                        500, 410, 350, 380,
                                    ],
                                },
                            ],
                        },
                        daily: {
                            xAxis: last30Days,
                            series: [
                                {
                                    name: 'Peak Hours',
                                    data: Array.from({ length: 30 }, () =>
                                        Math.floor(
                                            Math.random() * (700 - 300) + 300
                                        )
                                    ),
                                },
                                {
                                    name: 'Off-Peak Hours',
                                    data: Array.from({ length: 30 }, () =>
                                        Math.floor(
                                            Math.random() * (500 - 200) + 200
                                        )
                                    ),
                                },
                            ],
                        },
                    },
                    reading: {
                        monthly: {
                            xAxis: last12Months,
                            series: [
                                {
                                    name: 'Active Energy',
                                    data: [
                                        14260, 14650, 15070, 15540, 16080,
                                        16690, 17370, 18060, 18660, 19170,
                                        19620, 20100,
                                    ],
                                },
                                {
                                    name: 'Reactive Energy',
                                    data: [
                                        7130, 7325, 7535, 7770, 8040, 8345,
                                        8685, 9030, 9330, 9585, 9810, 10050,
                                    ],
                                },
                            ],
                        },
                        daily: {
                            xAxis: last30Days,
                            series: [
                                {
                                    name: 'Active Energy',
                                    data: Array.from(
                                        { length: 30 },
                                        (_, i) => 20100 + i * 100
                                    ),
                                },
                                {
                                    name: 'Reactive Energy',
                                    data: Array.from(
                                        { length: 30 },
                                        (_, i) => 10050 + i * 50
                                    ),
                                },
                            ],
                        },
                    },
                    mdKw: {
                        monthly: {
                            xAxis: last12Months,
                            series: [
                                {
                                    name: 'Active Power',
                                    data: [
                                        2.9, 2.7, 3.0, 3.3, 3.7, 4.0, 4.3, 4.4,
                                        3.9, 3.5, 3.1, 3.0,
                                    ],
                                },
                                {
                                    name: 'Reactive Power',
                                    data: [
                                        1.45, 1.35, 1.5, 1.65, 1.85, 2.0, 2.15,
                                        2.2, 1.95, 1.75, 1.55, 1.5,
                                    ],
                                },
                            ],
                        },
                        daily: {
                            xAxis: last30Days,
                            series: [
                                {
                                    name: 'Active Power',
                                    data: Array.from(
                                        { length: 30 },
                                        () =>
                                            +(
                                                Math.random() * (4.5 - 2.5) +
                                                2.5
                                            ).toFixed(2)
                                    ),
                                },
                                {
                                    name: 'Reactive Power',
                                    data: Array.from(
                                        { length: 30 },
                                        () =>
                                            +(
                                                Math.random() * (2.5 - 1.2) +
                                                1.2
                                            ).toFixed(2)
                                    ),
                                },
                            ],
                        },
                    },
                });

                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchConsumer();
        fetchConsumerData();
        fetchMeterData();
    }, [id]);

    const handleTimeRangeChange = (chart, range) => {
        setChartTimeRanges((prev) => ({
            ...prev,
            [chart]: range,
        }));
    };

    const handlePaymentSuccess = (invoiceNo) => {
        setShowPaymentModal(false);
        navigate(`/payment/success/${invoiceNo}`);
    };

    const handlePaymentFailure = (invoiceNo) => {
        setShowPaymentModal(false);
        navigate(`/payment/failure/${invoiceNo}`);
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

    const renderMeterSection = () => (
        <div className={styles.stats_section}>
            {isMeterDataLoading ? (
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
                            <div className={styles.total_units_container}>
                                <div className={styles.stat_card}>
                                    <div className={styles.stat_card_left}>
                                        <div className="titles">Voltage</div>
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
                        )}
                        <div className={styles.total_units_container}>
                            <div className={styles.stat_card}>
                                <div className={styles.stat_card_left}>
                                    <div className="titles">Power Factor</div>
                                    <p className={styles.stat_number}>
                                        {meterData.powerFactor}
                                    </p>
                                </div>
                                <div className={styles.stat_card_right}>
                                    <span className="icons">
                                        <img
                                            src="icons/power-factor.svg"
                                            alt="Power Factor"
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.total_units_container}>
                            <div className={styles.stat_card}>
                                <div className={styles.stat_card_left}>
                                    <div className="titles">Frequency</div>
                                    <p className={styles.stat_number}>
                                        {meterData.frequency}
                                    </p>
                                </div>
                                <div className={styles.stat_card_right}>
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
                            <div className={styles.total_units_container}>
                                <div className={styles.stat_card}>
                                    <div className={styles.stat_card_left}>
                                        <div className="titles">Current</div>
                                        <p className={styles.stat_number}>
                                            {meterData.current}
                                        </p>
                                    </div>
                                    <div className={styles.stat_card_right}>
                                        <span className="icons-r">
                                            <img
                                                src="icons/r-phase-voltage.svg"
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
                        <div className={styles.total_units_container}>
                            <div className={styles.stat_card}>
                                <div className={styles.stat_card_left}>
                                    <div className="titles">
                                        Consumption (kWh)
                                    </div>
                                    <p className={styles.stat_number}>
                                        {meterData.kwhConsumption}
                                    </p>
                                </div>
                                <div className={styles.stat_card_right}>
                                    <span className="icons">
                                        <img
                                            src="icons/consumption.svg"
                                            alt="Consumption"
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.total_units_container}>
                            <div className={styles.stat_card}>
                                <div className={styles.stat_card_left}>
                                    <div className="titles">
                                        Last Communication
                                    </div>
                                    <p className={styles.stat_number}>
                                        {meterData.lastCommunicationDate}
                                    </p>
                                </div>
                                <div className={styles.stat_card_right}>
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
    );

    const renderAreaDetails = () => (
        <div className={styles.stats_section}>
            <div className={styles.details_grid}>
                <div className={styles.detail_card}>
                    <div className={styles.detail_header}>
                        <h3>Location Information</h3>
                    </div>
                    <div className={styles.detail_content}>
                        <div className={styles.detail_item}>
                            <span className={styles.detail_label}>City</span>
                            <span className={styles.detail_value}>
                                {consumerProfile.level5_name || ''}
                            </span>
                        </div>
                        <div className={styles.detail_item}>
                            <span className={styles.detail_label}>Area</span>
                            <span className={styles.detail_value}>
                                {consumerProfile.level4_name || ''}
                            </span>
                        </div>
                        <div className={styles.detail_item}>
                            <span className={styles.detail_label}>Builder</span>
                            <span className={styles.detail_value}>
                                {consumerProfile.level3_name || ''}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.detail_card}>
                    <div className={styles.detail_header}>
                        <h3>Property Details</h3>
                    </div>
                    <div className={styles.detail_content}>
                        <div className={styles.detail_item}>
                            <span className={styles.detail_label}>
                                Township
                            </span>
                            <span className={styles.detail_value}>
                                {consumerProfile.level2_name || ''}
                            </span>
                        </div>
                        <div className={styles.detail_item}>
                            <span className={styles.detail_label}>Block</span>
                            <span className={styles.detail_value}>
                                {consumerProfile.level1_name || ''}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.detail_card}>
                    <div className={styles.detail_header}>
                        <h3>Meter Information</h3>
                    </div>
                    <div className={styles.detail_content}>
                        <div className={styles.detail_item}>
                            <span className={styles.detail_label}>
                                Meter Serial No
                            </span>
                            <span className={styles.detail_value}>
                                {consumerProfile.meterSerialNo}
                            </span>
                        </div>
                        <div className={styles.detail_item}>
                            <span className={styles.detail_label}>
                                Last Communication
                            </span>
                            <span className={styles.detail_value}>
                                {meterData.lastCommunicationDate}
                            </span>
                        </div>
                        <div className={styles.detail_item}>
                            <span className={styles.detail_label}>Status</span>
                            <span
                                className={`${styles.detail_value} ${
                                    styles.status
                                } ${
                                    consumerProfile.accountStatus === 'Active'
                                        ? styles.active
                                        : styles.inactive
                                }`}>
                                {consumerProfile.accountStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.main_content}>
            <div className={styles.dashboard_header}>
                <div className={styles.header_left}>
                    <div class="title">Your Details</div>
                    <div className={styles.consumer_meta}>
                        <span className={styles.consumer_id}>
                            ID: {consumerProfile.consumerId || 'N/A'}
                        </span>
                        <span className={styles.connection_type}>
                            <img
                                src="public/icons/connection.svg"
                                alt="Connection"
                            />
                            {consumerProfile.connectionType}
                        </span>
                        <span className={styles.tariff}>
                            <img src="icons/tariff-money.svg" alt="Tariff" />
                            {consumerProfile.tariffPlan}
                        </span>
                    </div>
                </div>
                <div className={styles.header_right}>
                    <Buttons
                        label="Bill Payment"
                        variant="primary"
                        icon="icons/plus.svg"
                        onClick={() => setShowPaymentModal(true)}
                    />
                </div>
            </div>

            {error && (
                <div className="error">
                    <span className="error_icon">
                        <img src="icons/error-mark.svg" alt="Error" />
                    </span>
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className={styles.loading_container}>
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                </div>
            ) : (
                <div className={styles.dashboard_stats}>
                    <div className={styles.stats_section_primary}>
                        {renderAreaDetails()}
                        {renderMeterSection()}
                    </div>
                    <div className={styles.stats_section_secondary}>
                        <div className={styles.stats_section}>
                            {/* <h2 className={styles.section_title}>Consumption Metrics</h2> */}
                            <div className={styles.metrics_container}>
                                <div className={styles.metrics}>
                                    <BarChart
                                        title="Consumption"
                                        xAxisData={
                                            chartData.consumption[
                                                chartTimeRanges.consumption.toLowerCase()
                                            ]?.xAxis || []
                                        }
                                        seriesData={
                                            chartData.consumption[
                                                chartTimeRanges.consumption.toLowerCase()
                                            ]?.series || []
                                        }
                                        height="300px"
                                        availableTimeRanges={[
                                            'Daily',
                                            'Monthly',
                                        ]}
                                        timeRange={chartTimeRanges.consumption}
                                        onTimeRangeChange={(range) =>
                                            handleTimeRangeChange(
                                                'consumption',
                                                range
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className={styles.metrics_container}>
                                <div className={styles.metrics}>
                                    <BarChart
                                        title="Reading"
                                        xAxisData={
                                            chartData.reading[
                                                chartTimeRanges.reading.toLowerCase()
                                            ]?.xAxis || []
                                        }
                                        seriesData={
                                            chartData.reading[
                                                chartTimeRanges.reading.toLowerCase()
                                            ]?.series || []
                                        }
                                        height="300px"
                                        availableTimeRanges={[
                                            'Daily',
                                            'Monthly',
                                        ]}
                                        timeRange={chartTimeRanges.reading}
                                        onTimeRangeChange={(range) =>
                                            handleTimeRangeChange(
                                                'reading',
                                                range
                                            )
                                        }
                                    />
                                </div>
                                <div className={styles.metrics}>
                                    <BarChart
                                        title="MD-kW"
                                        xAxisData={
                                            chartData.mdKw[
                                                chartTimeRanges.mdKw.toLowerCase()
                                            ]?.xAxis || []
                                        }
                                        seriesData={
                                            chartData.mdKw[
                                                chartTimeRanges.mdKw.toLowerCase()
                                            ]?.series || []
                                        }
                                        height="300px"
                                        availableTimeRanges={[
                                            'Daily',
                                            'Monthly',
                                        ]}
                                        timeRange={chartTimeRanges.mdKw}
                                        onTimeRangeChange={(range) =>
                                            handleTimeRangeChange('mdKw', range)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    invoiceNo={billingData.currentDue ? `INV${Date.now()}` : ''}
                    amount={billingData.currentDue}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                />
            )}
        </div>
    );
};

export default ConDashboard;
