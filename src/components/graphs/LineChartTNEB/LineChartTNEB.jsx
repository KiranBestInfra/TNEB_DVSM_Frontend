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
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: seriesColors[0],
                    fontFamily: 'Roboto',
                    fontSize: '0.7rem',
                    lineHeight: 1.6,
                    borderRadius: '10',
                    padding: [0, 0, 0, 0],
                    width: '100%',
                },
            },
            formatter: (params) => {
                let result = ``;
                params.forEach((param) => {
                    result += `${param.seriesName}<br/>${param.value} ${yAxisLabel}<br/>`;
                });
                return result;
            },
            textStyle: {
                fontFamily: 'Roboto',
            },
            borderRadius: '10',
            padding: [5, 0, 5, 5],
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
