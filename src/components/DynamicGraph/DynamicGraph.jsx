import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styles from './DynamicGraph.module.css';

const DynamicGraph = ({
    title = 'Demand Graph',
    height = '100%',
    data,
    className,
    lineColor = '#3f68b2',
    yAxisLabel = 'Value',
    refreshInterval = 15000,
    timeRange,
    onTimeRangeChange,
    showTimeRangeDropdown = true,
}) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const handleDownload = () => {
        if (chartInstance.current) {
            const url = chartInstance.current.getDataURL();
            const link = document.createElement('a');
            link.download = `${title}.png`;
            link.href = url;
            link.click();
        }
    };

    useEffect(() => {
        if (chartRef.current && data) {
            chartInstance.current = echarts.init(chartRef.current);

            const handleResize = () => {
                chartInstance.current?.resize();
            };

            window.addEventListener('resize', handleResize);

            const option = {
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    textStyle: {
                        color: '#333',
                        fontFamily: 'Roboto',
                        fontSize: 12,
                    },
                    padding: [8, 12],
                    formatter: function (params) {
                        const timeLabel = params[0].axisValue;
                        let tooltipText = `<div style="font-weight: bold; margin-bottom: 8px;">${timeLabel}</div>`;

                        params.forEach((param) => {
                            tooltipText += `<div style="display: flex; align-items: center; margin: 3px 0;">
                                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; margin-right: 5px; border-radius: 50%;"></span>
                                <span style="margin-right: 5px;">${param.seriesName}:</span>
                                <span style="font-weight: bold;">${param.value} ${yAxisLabel}</span>
                            </div>`;
                        });

                        if (params.length === 2) {
                            const currentValue = params[0].value;
                            const previousValue = params[1].value;
                            const percentChange =
                                ((currentValue - previousValue) /
                                    previousValue) *
                                100;
                            const sign = percentChange >= 0 ? '+' : '';
                            const changeText = `${sign}${percentChange.toFixed(
                                2
                            )}%`;
                            const changeColor =
                                percentChange >= 0 ? '#4CAF50' : '#F44336';

                            tooltipText += `<div style="display: flex; align-items: center; margin-top: 8px; padding-top: 5px; border-top: 1px dashed #ddd;">
                                <span style="margin-right: 5px;">Comparison:</span>
                                <span style="font-weight: bold; color: ${changeColor};">${changeText}</span>
                            </div>`;
                        }

                        return tooltipText;
                    },
                    axisPointer: {
                        type: 'cross',
                        lineStyle: {
                            color: '#aaa',
                            width: 1,
                            type: 'dashed',
                        },
                        crossStyle: {
                            color: '#aaa',
                        },
                        animation: false,
                    },
                },
                legend: {
                    data: data.series.map((s) => s.name),
                    top: 25,
                    textStyle: {
                        fontFamily: 'Roboto',
                        fontSize: '0.8rem',
                        color: '#424242',
                    },
                },
                xAxis: {
                    type: 'category',
                    data: data.xAxis.map((time) => time.slice(0, 5)),
                    boundaryGap: false,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'dashed',
                            color: '#E0E0E0',
                        },
                    },
                    axisLabel: {
                        fontFamily: 'Roboto',
                        fontSize: '0.75rem',
                        color: '#424242',
                        letterSpacing: '-1',
                        margin: 16,
                        rotate: 45,
                        interval: function (index) {
                            return index % 2 === 0;
                        },
                    },
                    axisTick: {
                        show: true,
                        alignWithLabel: true,
                        interval: 0,
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#424242',
                            width: 1,
                        },
                    },
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '10%'],
                    axisLabel: {
                        formatter: `{value} ${yAxisLabel}`,
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
                            width: 1,
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
                    left: '1%',
                    right: '1%',
                    bottom: '20%',
                    top: '13%',
                    containLabel: true,
                },
                series: data.series.map((series, index) => ({
                    name: series.name,
                    type: 'line',
                    showSymbol: false,
                    data: series.data,
                    itemStyle: {
                        color: index === 0 ? '#008cd7' : '#029447',
                    },
                    lineStyle: {
                        width: 2,
                        type: index === 0 ? 'solid' : 'dashed',
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: index === 0 ? '#008cd760' : '#02944750',
                            },
                            {
                                offset: 1,
                                color: index === 0 ? '#008cd710' : '#02944710',
                            },
                        ]),
                    },
                })),
            };

            chartInstance.current.setOption(option);

            return () => {
                window.removeEventListener('resize', handleResize);
                chartInstance.current?.dispose();
            };
        }
    }, [data, title, lineColor, yAxisLabel]);

    return (
        <div
            className={`${styles.graph_container} ${className || ''}`}
            style={{ height }}>
            <div className={styles.chart_controls}>
                <h3 className={styles.chart_title}>{title}</h3>
                <div className={styles.action_cont}>
                    {showTimeRangeDropdown && (
                        <div className={styles.time_range_select_dropdown}>
                            <select
                                value={timeRange}
                                onChange={(e) => onTimeRangeChange(e.target.value)}
                                className={styles.time_range_select}>
                                <option value="Daily">Daily</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Last30days">Last 30 Days</option>
                                <option value="LastWeek">Last Week</option>
                                <option value="Year">Year</option>
                            </select>
                            <img
                                src="icons/arrow-down.svg"
                                alt="Select Time"
                                className={styles.time_range_select_dropdown_icon}
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
                <div ref={chartRef} className={styles.chart} />
            </div>
        </div>
    );
};

export default DynamicGraph;
