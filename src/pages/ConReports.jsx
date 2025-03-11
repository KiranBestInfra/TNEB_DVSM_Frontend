import { useState, useEffect } from 'react';
import BarChart from '../components/graphs/BarChart/BarChart';
import styles from '../styles/ConReports.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import DatePicker from 'react-datepicker';
import { apiClient } from '../api/client';
import WidgetSkeleton from '../components/ui/WidgetSkeleton/WidgetSkeleton';

const ConReports = () => {
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [statsloading, isStatsLoading] = useState(true);
    const [chartsLoading, setChartsLoading] = useState(true);

    const [metrics, setMetrics] = useState([
        {
            title: 'Total Consumption',
            value: '0 kWh',
            trend: 'up',
            percentage: '+15%',
            icon: 'icons/consumption.svg',
            key: 'totalConsumption',
        },
        {
            title: 'Power Factor',
            value: '0.92',
            trend: 'up',
            percentage: '+2%',
            icon: 'icons/power-factor.svg',
            key: 'powerFactor',
        },
        {
            title: 'Average Current',
            value: '0 A',
            trend: 'down',
            percentage: '-5%',
            icon: 'icons/current.svg',
            key: 'avgCurrent',
        },
        {
            title: 'Average Voltage',
            value: '0 V',
            trend: 'up',
            percentage: '+1%',
            icon: 'icons/voltage.svg',
            key: 'avgVoltage',
        },
        {
            title: 'Bill Amount',
            value: '₹0',
            trend: 'up',
            percentage: '+10%',
            icon: 'icons/overdue.svg',
            key: 'billAmount',
        },
    ]);

    // Initialize with 24 months of data
    const generateLast24Months = () => {
        const months = [];
        const currentDate = new Date();

        for (let i = 23; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push(date.toLocaleString('default', { month: 'short', year: '2-digit' }));
        }
        return months;
    };

    const defaultMonths = generateLast24Months();

    // Generate realistic consumption data with seasonal patterns and yearly growth
    const generateConsumptionData = () => {
        // Base consumption patterns for different seasons (kWh)
        const seasonalPatterns = {
            summer: {
                base: 450,
                variation: 100,    // Higher variation in summer
                growth: 20        // Yearly growth
            },
            winter: {
                base: 250,
                variation: 50,     // Lower variation in winter
                growth: 15        // Yearly growth
            },
            moderate: {
                base: 350,
                variation: 70,     // Moderate variation in spring/fall
                growth: 18        // Yearly growth
            }
        };

        // Helper function to add random variation
        const addVariation = (base, variation) => {
            return base + (Math.random() * 2 - 1) * variation;
        };

        return defaultMonths.map((month, index) => {
            const currentMonth = new Date().getMonth();
            const monthIndex = (currentMonth - (23 - index) + 12) % 12;
            const yearOffset = Math.floor(index / 12); // 0 for first year, 1 for second year

            let consumption;

            // Summer months (April to September)
            if (monthIndex >= 3 && monthIndex <= 8) {
                consumption = addVariation(
                    seasonalPatterns.summer.base + (yearOffset * seasonalPatterns.summer.growth),
                    seasonalPatterns.summer.variation
                );
            }
            // Winter months (December to February)
            else if (monthIndex >= 11 || monthIndex <= 1) {
                consumption = addVariation(
                    seasonalPatterns.winter.base + (yearOffset * seasonalPatterns.winter.growth),
                    seasonalPatterns.winter.variation
                );
            }
            // Spring/Fall months
            else {
                consumption = addVariation(
                    seasonalPatterns.moderate.base + (yearOffset * seasonalPatterns.moderate.growth),
                    seasonalPatterns.moderate.variation
                );
            }

            // Add small trend factor based on month index
            const trendFactor = 1 + (index * 0.002); // Small increase over time

            // Special events/anomalies
            if (monthIndex === 4) { // May - Peak summer start
                consumption *= 1.1; // 10% increase
            } else if (monthIndex === 11) { // December - Holiday season
                consumption *= 1.15; // 15% increase
            }

            // Ensure consumption is always positive and round to whole numbers
            return Math.max(Math.round(consumption * trendFactor), 100);
        });
    };

    const defaultChartData = {
        xAxisData: defaultMonths,
        seriesData: [{
            name: 'Default',
            data: generateConsumptionData(),
            type: 'bar'
        }]
    };

    const [consumptionData, setConsumptionData] = useState({
        ...defaultChartData,
        seriesData: [{
            name: 'Consumption',
            data: generateConsumptionData(),
            type: 'bar'
        }]
    });

    const fetchWidgets = async (dateRange = null) => {
        try {
            isStatsLoading(true);
            let url = '/consumer/reports/metrics';

            if (dateRange?.start && dateRange?.end) {
                url += `?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`;
            }

            // Simulating API call with dummy data
            setTimeout(() => {
                const dummyData = {
                    totalConsumption: '450 kWh',
                    powerFactor: '0.95',
                    avgCurrent: '15 A',
                    avgVoltage: '230 V',
                    billAmount: '₹3,500',
                    connectionStatus: 'Active',
                    percentages: {
                        totalConsumption: '+15%',
                        powerFactor: '+2%',
                        avgCurrent: '-5%',
                        avgVoltage: '+1%',
                        billAmount: '+10%',
                        connectionStatus: '100%'
                    }
                };

                setMetrics(prevMetrics =>
                    prevMetrics.map(metric => ({
                        ...metric,
                        value: dummyData[metric.key] || metric.value,
                        percentage: dummyData.percentages[metric.key] || metric.percentage
                    }))
                );
            }, 1000);
        } catch (err) {
            console.error('Error fetching consumer data:', err);
        } finally {
            isStatsLoading(false);
        }
    };

    const fetchGraphData = async () => {
        try {
            setChartsLoading(true);
            let url = '/consumer/reports/graphs';

            if (dateRange?.start && dateRange?.end) {
                url += `?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`;
            }

            // Generate consistent data for the demo
            const consistentData = generateConsumptionData();

            const dummyConsumptionData = {
                xAxisData: defaultMonths,
                seriesData: [
                    {
                        name: 'Consumption',
                        data: consistentData,
                        type: 'bar'
                    }
                ]
            };

            // Update total consumption metric based on last month's data
            const lastMonthConsumption = consistentData[consistentData.length - 1];
            setMetrics(prevMetrics =>
                prevMetrics.map(metric => {
                    if (metric.key === 'totalConsumption') {
                        return {
                            ...metric,
                            value: `${lastMonthConsumption} kWh`
                        };
                    }
                    return metric;
                })
            );

            setConsumptionData(dummyConsumptionData);
        } catch (err) {
            console.error('Error fetching graph data:', err);
            setConsumptionData({
                ...defaultChartData,
                seriesData: [{
                    name: 'Consumption',
                    data: generateConsumptionData(),
                    type: 'bar'
                }]
            });
        } finally {
            setChartsLoading(false);
        }
    };

    const handleDateRangeChange = (date, type) => {
        const newDateRange = { ...dateRange, [type]: date };
        setDateRange(newDateRange);

        // If both dates are selected, fetch new data
        if (newDateRange.start && newDateRange.end) {
            fetchWidgets(newDateRange);
            fetchGraphData();
        }
    };

    useEffect(() => {
        fetchGraphData();
        fetchWidgets();
    }, []);

    const renderStatCard = (title, value, icon, subtitle1, trend) => (
        <div className={styles.total_units_container}>
            <div className={styles.stat_card}>
                <div className={styles.stat_card_left}>
                    <div className="titles">{title}</div>
                    <p className={styles.stat_number}>
                        {value}
                        {trend === 'up' ? (
                            <span className="icons_increased">
                                <img src="icons/arrow-trend-up.svg" alt="Trend Up" />
                            </span>
                        ) : (
                            <span className="icons_decreased">
                                <img src="icons/arrow-trend-down.svg" alt="Trend Down" />
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
            {subtitle1 && (
                <div className={styles.active_units_container}>
                    <div className="sub_title">{subtitle1}</div>
                </div>
            )}
        </div>
    );

    const renderChart = (data, title) => {
        if (!data || !data.xAxisData || !data.seriesData || !Array.isArray(data.seriesData)) {
            return <WidgetSkeleton height="400px" />;
        }

        return (
            <BarChart
                title={title}
                xAxisData={data.xAxisData}
                seriesData={data.seriesData}
                height="400px"
                timeRange="Monthly"
            />
        );
    };

    return (
        <div className={styles.main_content}>
            {/* Header Section */}
            <div className="adminheader">
                <h1 className="title">Consumer Reports</h1>
                <div className={styles.date_range}>
                    <div className={styles.search_cont}>
                        <DatePicker
                            selected={dateRange.start}
                            onChange={(date) => handleDateRangeChange(date, 'start')}
                            className={styles.date_input}
                            dateFormat="MMM dd, yyyy"
                            placeholderText="Start Date"
                            maxDate={new Date()}
                        />
                        <span className="icons icon_placement">
                            <img src="icons/date.svg" alt="Calendar" />
                        </span>
                    </div>

                    <div className={styles.search_cont}>
                        <DatePicker
                            selected={dateRange.end}
                            onChange={(date) => handleDateRangeChange(date, 'end')}
                            className={styles.date_input}
                            dateFormat="MMM dd, yyyy"
                            placeholderText="End Date"
                            minDate={dateRange.start}
                            maxDate={new Date()}
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
                        onClick={() => {
                            fetchWidgets(dateRange);
                            fetchGraphData();
                        }}
                    />
                </div>
            </div>

            {/* Metrics Section */}
            <div className={styles.dashboard_stats}>
                {statsloading
                    ? metrics.map((metric, index) => (
                        <WidgetSkeleton key={index} />
                    ))
                    : metrics.map((metric, index) =>
                        renderStatCard(
                            metric.title,
                            metric.value,
                            metric.icon,
                            `${metric.percentage} from last month`,
                            metric.trend
                        )
                    )}
            </div>

            {/* Charts Section */}
            <div className="metrics_header">
                <h1 className="metrics_title">Consumption Metrics</h1>
            </div>
            <div className={styles.metrics_container}>
                <div className={styles.metrics}>
                    {chartsLoading ? (
                        <WidgetSkeleton height="400px" />
                    ) : (
                        renderChart(consumptionData, "Monthly Consumption")
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConReports;