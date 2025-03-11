import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import styles from './LineChart.module.css';
import { formatDateMonth } from '../../../utils/globalUtils';

const LineChart = ({
    title = 'Energy Usage by Tariff Plan',
    data,
    seriesColors = ['#029447', '#3f68b2', '#ed8c22', '#dc272c'],
    yAxisLabel = 'kWh',
    showLabel = false,
    toolbox = true,
    height = '100%',
    className,
}) => {
    const availableTimeRanges = Object.keys(data);
    const [timeRange, setTimeRange] = useState(
        availableTimeRanges[0] || 'daily'
    );
    const chartRef = React.useRef(null);

    const getActiveData = () => {
        return data[timeRange] || data.daily;
    };

    const activeData = getActiveData();

    const handleDownload = () => {
        if (chartRef.current) {
            const base64 = chartRef.current.getEchartsInstance().getDataURL();
            const link = document.createElement('a');
            link.download = `${title}.png`;
            link.href = base64;
            link.click();
        }
    };

    const formatTooltipLabel = (params) => {
        const date = new Date();
        if (timeRange === 'Daily') {
            date.setDate(date.getDate() - (6 - params[0].dataIndex));
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } else if (timeRange === 'Monthly') {
            date.setMonth(date.getMonth() - (11 - params[0].dataIndex));
            return date.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
            });
        } else if (timeRange === 'Hourly') {
            return `${params[0].axisValue}`;
        }
        return params[0].axisValue;
    };

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: seriesColors[0],
                    fontFamily: 'Roboto',
                    fontSize: '0.7rem',
                    lineHeight: 1.6,
                    borderRadius: '10',
                    padding: [10, 6, 8, 6],
                },
            },
            formatter: (params) => {
                const label = formatTooltipLabel(params);
                let result = `${label}<br/>`;
                let total = 0;
                params.forEach((param) => {
                    total += param.value;
                    result += `${param.marker} ${param.seriesName}: ${param.value} ${yAxisLabel}<br/>`;
                });
                // result += `<b>Total: ${total} ${yAxisLabel}</b>`;
                return result;
            },
            textStyle: {
                fontFamily: 'Roboto',
            },
            borderRadius: '10',
            padding: [8, 12, 8, 12],
        },
        legend: {
            data: activeData.series.map((item) => item.name),
            textStyle: {
                fontFamily: 'Roboto',
                fontSize: '0.85rem',
                color: '#424242',
            },
            type: 'scroll',
            orient: 'horizontal',
            top: 0, // Changed from bottom to top
        },
        grid: {
            left: '0%',
            right: '0.1%',
            bottom: '5%', // Reduced since legend is now at top
            top: '15%', // Increased to accommodate top legend
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: activeData.xAxis,
                axisLabel: {
                    fontFamily: 'Roboto',
                    fontSize: '0.75rem',
                    color: '#424242',
                    rotate: 45,
                    margin: 20,
                    letterSpacing: '-1',
                    formatter: (value, index) => {
                        return formatDateMonth(value);
                    },
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
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    fontFamily: 'Roboto',
                    formatter: `{value} ${yAxisLabel}`,
                    fontSize: '0.75rem',
                    color: '#424242',
                    letterSpacing: '-1',
                    margin: 20,
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
        ],
        series: activeData.series.map((item, index) => ({
            name: item.name,
            type: 'line',
            smooth: true, // Added smooth lines for better visualization
            lineStyle: {
                color: seriesColors[index],
                width: 2, // Slightly thicker lines
            },
            itemStyle: {
                color: seriesColors[index],
                borderWidth: 2,
            },
            emphasis: {
                focus: 'series',
                lineStyle: {
                    width: 3,
                },
            },
            label: showLabel
                ? {
                      show: true,
                      position: 'top',
                      fontFamily: 'Roboto',
                      fontSize: '0.75rem',
                  }
                : {},
            data: item.data,
            areaStyle: {
                opacity: 0.1, // Added subtle area fill
            },
        })),
    };

    return (
        <div
            className={`${styles.chart_container} ${className || ''}`}
            style={{ height, fontFamily: 'Roboto' }}>
            <div className={styles.chart_controls}>
                <h3 className={styles.chart_title}>{title}</h3>
                <div className={styles.action_cont}>
                    {availableTimeRanges.length > 1 && (
                        <div className={styles.time_range_select_dropdown}>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={styles.time_range_select}>
                                {availableTimeRanges.includes('monthly') && (
                                    <option value="monthly">Monthly</option>
                                )}
                                {availableTimeRanges.includes('daily') && (
                                    <option value="daily">Daily</option>
                                )}
                                {availableTimeRanges.includes('yearly') && (
                                    <option value="yearly">Yearly</option>
                                )}
                                {availableTimeRanges.includes('hourly') && (
                                    <option value="hourly">Hourly</option>
                                )}
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
                        onClick={handleDownload}
                        style={{ cursor: 'pointer' }}>
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

export default LineChart;
