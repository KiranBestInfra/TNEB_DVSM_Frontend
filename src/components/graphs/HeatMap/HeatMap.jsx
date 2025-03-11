import React from 'react';
import ReactECharts from 'echarts-for-react';
import styles from './HeatMap.module.css';

const HeatMap = ({
    title = 'Regional Energy Consumption',
    height = '100%',
    className,
    xAxisData = [], // Time intervals
    yAxisData = [], // Regions/Categories
    data = [], // Heat map data points
    xAxisName = 'Time Intervals',
    yAxisName = 'Regions',
    valueUnit = 'kWh',
    valueMin = 0,
    valueMax = 10,
    colorRange = ['#d73027', '#fee08b', '#1a9850'],
}) => {
    const chartRef = React.useRef(null);

    const handleDownload = () => {
        if (chartRef.current) {
            const base64 = chartRef.current.getEchartsInstance().getDataURL();
            const link = document.createElement('a');
            link.download = `${title}.png`;
            link.href = base64;
            link.click();
        }
    };

    const option = {
        tooltip: {
            position: 'top',
            formatter: function (params) {
                return `${yAxisName}: ${
                    yAxisData[params.data[1]]
                }<br>${xAxisName}: ${xAxisData[params.data[0]]}<br>Value: ${
                    params.data[2]
                } ${valueUnit}`;
            },
            textStyle: {
                fontFamily: 'Roboto',
            },
            borderRadius: '6',
            padding: [8, 12, 8, 12],
        },
        grid: {
            top: '12%',
            left: '0%',
            right: '0.5%',
            bottom: '25%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            name: xAxisName,
            splitArea: {
                show: true,
            },
            axisLabel: {
                fontFamily: 'Roboto',
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
        yAxis: {
            type: 'category',
            data: yAxisData,
            name: yAxisName,
            splitArea: {
                show: true,
            },
            axisLabel: {
                fontFamily: 'Roboto',
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
        },
        visualMap: {
            min: valueMin,
            max: valueMax,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '5%',
            text: ['High', 'Low'],
            textStyle: {
                fontFamily: 'Roboto',
                fontSize: '0.85rem',
                color: '#424242',
            },
            color: colorRange,
        },
        series: [
            {
                name: title,
                type: 'heatmap',
                data: data,
                label: {
                    show: true,
                    formatter: `{c} ${valueUnit}`,
                    fontFamily: 'Roboto',
                    fontSize: '0.75rem'
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    };

    return (
        <div className={`${styles.chart_container} ${className || ''}`} style={{ height, fontFamily: 'Roboto' }}>
            <div className={styles.chart_controls}>
                <h3 className={styles.chart_title}>{title}</h3>
                <div className={styles.action_cont}>
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

export default HeatMap;
