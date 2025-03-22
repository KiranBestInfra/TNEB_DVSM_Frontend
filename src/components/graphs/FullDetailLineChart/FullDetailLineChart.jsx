import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import styles from './FullDetailLineChart.module.css';

const FullDetailLineChart = ({
    title = 'Energy Usage by Tariff Plan',
    data,
    seriesColors = ['#029447', '#3f68b2', '#ed8c22', '#dc272c'],
    yAxisLabel = 'kWh',
    showLabel = false,
    toolbox = true,
    height = '100%',
    className,
}) => {
    const availableTimeRanges = Object.keys(data || {});
    const [timeRange, setTimeRange] = useState(availableTimeRanges[0] || 'daily');
    const chartRef = React.useRef(null);

    const getActiveData = () => {
        return data?.[timeRange] || { xAxis: [], series: [] };
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

    //Generate X-Axis labels in 15-minute intervals
    const generateTimeLabels = () => {
        let labels = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                labels.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            }
        }
        labels.push('24:00'); // Ensures last label is 24:00
        return labels;
    };

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: seriesColors[0],
                    fontSize: '0.7rem',
                    borderRadius: 10,
                    padding: [10, 6, 8, 6],
                },
            },
            formatter: (params) => {
                let result = `${params[0].axisValue}<br/>`;
                params.forEach((param) => {
                    result += `${param.marker} ${param.seriesName}: ${param.value} ${yAxisLabel}<br/>`;
                });
                return result;
            },
        },
        legend: {
            data: activeData.series.map((item) => item.name),
            textStyle: {
                fontSize: '0.85rem',
                color: '#424242',
            },
            type: 'scroll',
            orient: 'horizontal',
            top: 0,
        },
        toolbox: toolbox
            ? {
                  feature: {
                      saveAsImage: { title: 'Download' },
                  },
              }
            : undefined,
        grid: {
            left: '0%',
            right: '0.1%',
            bottom: '5%',
            top: '15%',
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: generateTimeLabels(),
                axisLabel: {
                    fontSize: '0.75rem',
                    color: '#424242',
                    rotate: 45,
                    margin: 20,
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
                    formatter: `{value} ${yAxisLabel}`,
                    fontSize: '0.75rem',
                    color: '#424242',
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
            smooth: true,
            lineStyle: {
                color: seriesColors[index],
                width: 2,
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
                      fontSize: '0.75rem',
                  }
                : {},
            data: item.data,
            areaStyle: {
                opacity: 0.1,
            },
        })),
    };

    return (
        <div className={`${styles.chart_container} ${className || ''}`} style={{ height }}>
            <div className={styles.chart_controls}>
                <h3 className={styles.chart_title}>{title}</h3>
                <div className={styles.action_cont}>
                    {availableTimeRanges.length > 1 && (
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className={styles.time_range_select}>
                            {availableTimeRanges.map((range) => (
                                <option key={range} value={range}>
                                    {range.charAt(0).toUpperCase() + range.slice(1)}
                                </option>
                            ))}
                        </select>
                    )}
                    {/* <button onClick={handleDownload} className={styles.download_button}>
                        <img src="icons/download-icon.svg" alt="Download chart" />
                    </button> */}
                </div>
            </div>
            <div className={styles.echart_container}>
                {activeData.series.length > 0 ? (
                    <ReactECharts ref={chartRef} option={option} />
                ) : (
                    <p style={{ textAlign: 'center', color: '#999' }}>No data available</p>
                )}
            </div>
        </div>
    );
};

export default FullDetailLineChart;
