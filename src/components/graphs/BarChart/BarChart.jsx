import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import styles from './BarChart.module.css';
import {
    formatDateDayMonthYear,
    formatDateMonth,
    formatMonthYear,
} from '../../../utils/globalUtils';

const BarChart = ({
    title = 'Energy Usage by Tariff Plan',
    xAxisData,
    seriesData,
    timeRange,
    availableTimeRanges = [],
    onTimeRangeChange,
    height = '100%',
    className,
    seriesColors = ['#3f68b2', '#029447', '#dc272c', '#ed8c22'],
}) => {
    const chartRef = React.useRef(null);
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
        onTimeRangeChange(value);
    };

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
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

            formatter: (params) => {
                const date = params[0].axisValue;
                let formattedDate = date;

                try {
                    const dateObj = new Date(date);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate =
                            timeRange === 'Monthly'
                                ? dateObj.toLocaleDateString('en-US', {
                                      month: 'short',
                                      year: 'numeric',
                                  })
                                : xAxisData[params[0].dataIndex];
                    }
                } catch (e) {
                    // Do nothing
                }

                let result = `<div style="margin: 0px 0 0;line-height:1;">${formattedDate}</div>`;
                params.forEach((param) => {
                    result += `<div style="margin: 10px 0 0;line-height:1;">
                        <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};">
                        </span>
                        ${param.seriesName}: ${param.value}
                    </div>`;
                });
                return result;
            },
        },
        legend: {
            show: seriesData?.length > 1,
            data: seriesData?.map((series) => series.name),
            top: 0,
            textStyle: {
                fontFamily: 'Roboto',
                fontSize: '0.85rem',
                color: '#424242',
            },
            type: 'scroll',
            orient: 'horizontal',
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
        },
        grid: {
            left: '0%',
            right: '0.1%',
            bottom: '0%',
            top: '13%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data:
                timeRange === 'Daily'
                    ? xAxisData.map((date) => {
                          try {
                              return formatDateMonth(date);
                          } catch (e) {
                              console.error('Error formatting date:', date, e);
                              return date;
                          }
                      })
                    : xAxisData.map((date) => {
                          try {
                              return formatMonthYear(date);
                          } catch (e) {
                              console.error('Error formatting date:', date, e);
                              return date;
                          }
                      }),
            axisLabel: {
                fontFamily: 'Roboto',
                fontSize: '0.75rem',
                color: '#424242',
                rotate: 45,
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
                fontFamily: 'Roboto',
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
        series: seriesData?.map((item, index) => ({
            name: item.name,
            type: 'bar',
            data: item.data,
            maxBarWidth: '26px',
            itemStyle: {
                color: seriesColors[index],
                borderRadius: 0,
            },
            emphasis: {
                focus: 'series',
            },
            showBackground: true,
            backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.1)',
            },
        })),
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
                    {availableTimeRanges.length > 0 && (
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

export default BarChart;
