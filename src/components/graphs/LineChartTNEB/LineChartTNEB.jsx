import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import styles from './LineChartTNEB.module.css';
import { formatDateMonth } from '../../../utils/globalUtils';

const LineChartTNEB = ({
    title = 'Energy Usage by Tariff Plan',
    data,
    seriesColors = ['#029447', '#3f68b2', '#ed8c22', '#dc272c'],
    yAxisLabel = 'kWh',
    showLabel = false,
    toolbox = true,
    height = '100px',
    className,
}) => {
    const chartRef = React.useRef(null);
    const activeData = data.daily;

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
                const label = formatTooltipLabel(params);
                let result = ``;
                let total = 0;
                params.forEach((param) => {
                    total += param.value;
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
            show: false
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
                data: activeData.xAxis,
            },
        ],
        yAxis: [
            {
                show: false,
                type: 'value',
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
                      fontFamily: 'Roboto',
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
        <div
            className={`${styles.chart_container} ${className || ''}`}
            style={{ fontFamily: 'Roboto' }}>
            <div className={styles.echart_container}>
                <ReactECharts ref={chartRef} option={option} />
            </div>
        </div>
    );
};

export default LineChartTNEB;
