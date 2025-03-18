import React, { useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import styles from './LineBarChart.module.css';
import {
    formatDateDayMonthYear,
    formatDateMonth,
    formatMonthYear,
} from '../../../utils/globalUtils';

const LineBarChart = ({
    title = 'Distribution of Electricity',
    xAxisData = ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45'],
    seriesData = [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
    timeRange,
    availableTimeRanges = [],
    onTimeRangeChange,
    height = '100%',
    className,
    lineColor = '#3f68b2',
    markAreaColors = {
        morning: 'rgba(255, 173, 177, 0.4)',
        evening: 'rgba(255, 173, 177, 0.4)'
    },
    yAxisLabel = 'W',
    visualMapPieces = [
        { lte: 6, color: 'green' },
        { gt: 6, lte: 8, color: 'red' },
        { gt: 8, lte: 14, color: 'green' },
        { gt: 14, lte: 17, color: 'red' },
        { gt: 17, color: 'green' }
    ],
    markAreas = [
        [{ name: 'Morning Peak', xAxis: '07:30' }, { xAxis: '10:00' }],
        [{ name: 'Evening Peak', xAxis: '17:30' }, { xAxis: '21:15' }]
    ]
}) => {
    const chartRef = useRef(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

    const formatDateRange = () => {
        if (!xAxisData || xAxisData.length === 0) return '';

        try {
            if (selectedTimeRange === 'Daily') {
                const endDate = new Date();
                let startDate;

                try {
                    startDate = new Date(xAxisData[0]);
                    if (isNaN(startDate.getTime())) {
                        const parts = xAxisData[0].split('-');
                        if (parts.length === 3) {
                            startDate = new Date(
                                parts[0],
                                parts[1] - 1,
                                parts[2]
                            );
                        }
                    }
                } catch (e) {
                    console.error('Error parsing start date:', e);
                    return '';
                }

                if (!startDate || isNaN(startDate.getTime())) {
                    console.error('Invalid start date');
                    return '';
                }

                const formatDate = (date) => {
                    return formatDateDayMonthYear(date);
                };

                return ` (${formatDate(startDate)} - ${formatDate(endDate)})`;
            } else {
                try {
                    const dates = xAxisData
                        .map((date) => {
                            if (date instanceof Date) return date;
                            try {
                                const dateObj = new Date(date);
                                if (!isNaN(dateObj.getTime())) return dateObj;

                                // Try parsing YYYY-MM-DD format
                                const parts = date.split('-');
                                if (parts.length === 3) {
                                    return new Date(
                                        parts[0],
                                        parts[1] - 1,
                                        parts[2]
                                    );
                                }
                                return null;
                            } catch (e) {
                                console.error('Error parsing date:', date, e);
                                return null;
                            }
                        })
                        .filter((date) => date && !isNaN(date.getTime()));

                    if (dates.length === 0) {
                        console.log('No valid dates found in xAxisData');
                        return '';
                    }

                    const firstDate = dates[0];
                    const lastDate = dates[dates.length - 1];

                    return ` (${formatMonthYear(firstDate)} - ${formatMonthYear(
                        lastDate
                    )})`;
                } catch (e) {
                    console.error('Error parsing monthly dates:', e);
                    return '';
                }
            }
        } catch (error) {
            console.error('Error formatting date range:', error);
            return '';
        }
    };

    const handleDownload = () => {
        if (chartRef.current) {
            const base64 = chartRef.current.getEchartsInstance().getDataURL();
            const link = document.createElement('a');
            link.download = `${title}.png`;
            link.href = base64;
            link.click();
        }
    };

    const handleTimeRangeChange = (value) => {
        setSelectedTimeRange(value);
        if (onTimeRangeChange) {
            onTimeRangeChange(value);
        }
    };

    const option = {

        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#E5E5E5',
            borderWidth: 1,
            borderRadius: 8,
            padding: [12, 16],
            textStyle: {
                fontFamily: 'Roboto',
                fontSize: 12,
                color: '#424242',
            },
            extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);',
        },
        toolbox: {
            show: false,
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
            axisLabel: {
                fontFamily: 'Roboto',
                fontSize: '0.75rem',
                color: '#424242',
                margin: 20,
                letterSpacing: '-1',
            },
            axisTick: {
                show: true,
                alignWithLabel: true,
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#424242',
                },
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: `{value} ${yAxisLabel}`,
                fontFamily: 'Roboto',
                fontSize: '0.75rem',
                color: '#424242',
                letterSpacing: '-1',
                margin: 20,
            },
            axisPointer: {
                snap: true
            },
            axisTick: {
                show: true,
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#424242',
                },
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#E0E0E0',
                    type: 'dashed',
                },
            },
        },
        grid: {
            left: '0.2%',
            right: '0.1%',
            bottom: '0%',
            top: '13%',
            containLabel: true,
        },
        visualMap: {
            show: false,
            dimension: 0,
            pieces: visualMapPieces
        },
        series: [
            {
                name: 'Electricity',
                type: 'line',
                smooth: true,
                data: seriesData,
                itemStyle: {
                    color: lineColor
                },
                markArea: {
                    itemStyle: {
                        color: markAreaColors.morning
                    },
                    data: markAreas
                }
            }
        ]
    };

    return (
        <div
            className={`${styles.chart_container} ${className || ''}`}
            style={{ height, fontFamily: 'Roboto' }}>
            <div className={styles.chart_controls}>
                <h3 className={styles.chart_title}>
                    {title}
                    <span className={styles.date_range}>
                        {formatDateRange()}
                    </span>
                </h3>

                <div className={styles.action_cont}>
                    {availableTimeRanges && availableTimeRanges.length > 0 && (
                        <div className={styles.time_range_select_dropdown}>
                            <select
                                className={styles.time_range_select}
                                value={selectedTimeRange}
                                onChange={(e) =>
                                    handleTimeRangeChange(e.target.value)
                                }>
                                {availableTimeRanges.map((range) => (
                                    <option key={range} value={range}>
                                        {range}
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
                    )}
                    <span
                        className={styles.icons_chart_controls}
                        onClick={handleDownload}>
                        <img
                            src="icons/download-icon.svg"
                            alt="Download chart"
                        />
                    </span>
                </div>
            </div>
            <div className={styles.echart_container}>
                <ReactECharts ref={chartRef} option={option} />
            </div>
        </div>
    );
};

export default LineBarChart;
