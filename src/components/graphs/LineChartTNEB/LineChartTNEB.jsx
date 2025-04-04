import React from 'react';
import ReactECharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import styles from './LineChartTNEB.module.css';
import * as echarts from 'echarts';

const LineChartTNEB = ({
    title = 'Energy Usage by Tariff Plan',
    data,
    seriesColors = ['#008cd7', '#029447', '#ed8c22', '#dc272c'],
    yAxisLabel = 'kWh',
    showLabel = false,
    toolbox = true,
    height = '100px',
    className,
}) => {
    const chartRef = React.useRef(null);

    const formatTooltipLabel = (params) => {
        return params[0].axisValue;
    };

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
                let tooltipText = '';

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
                    const percentChange = ((currentValue - previousValue) / previousValue) * 100;
                    const sign = percentChange >= 0 ? '+' : '';
                    const changeText = `${sign}${percentChange.toFixed(2)}%`;
                    const changeColor = percentChange >= 0 ? '#4CAF50' : '#F44336';

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
            show: false,
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '0%',
            top: '0%',
            containLabel: false,
        },
        xAxis: [
            {
                show: false,
                type: 'category',
                boundaryGap: false,
                data: data.xAxis,
            },
        ],
        yAxis: [
            {
                show: false,
                type: 'value',
            },
        ],
        series: data.series.map((item, index) => ({
            name: item.name,
            type: 'line',
            smooth: true,
            lineStyle: {
                color: index === 0 ? '#008cd7' : '#029447',
                width: 2,
            },
            itemStyle: {
                color: index === 0 ? '#008cd7' : '#029447',
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

    return (
        <div
            className={`${styles.chart_container} ${className || ''}`}
            style={{ fontFamily: 'Roboto' }}>
            <div className={styles.echart_container}>
                {data.series.length > 0 ? (
                    <ReactECharts ref={chartRef} option={option} />
                ) : (
                    <div className={styles.loading_container}>
                        <div className={styles.loading_spinner}></div>
                        <p>Loading data...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

LineChartTNEB.propTypes = {
    title: PropTypes.string,
    data: PropTypes.shape({
        xAxis: PropTypes.arrayOf(PropTypes.string).isRequired,
        series: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                data: PropTypes.arrayOf(PropTypes.number).isRequired,
            })
        ).isRequired,
    }).isRequired,
    seriesColors: PropTypes.arrayOf(PropTypes.string),
    yAxisLabel: PropTypes.string,
    showLabel: PropTypes.bool,
    toolbox: PropTypes.bool,
    height: PropTypes.string,
    className: PropTypes.string,
};

export default LineChartTNEB;
