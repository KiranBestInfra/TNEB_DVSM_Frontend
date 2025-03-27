import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styles from './DynamicGraph.module.css';

const DynamicGraph = ({
    title = 'Dynamic Data & Time Axis',
    height = '100%',
    className,
    lineColor = '#3f68b2',
    yAxisLabel = 'Value'
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
        // Initialize data
        const generateData = () => {
            const data = [];
            let now = new Date(2025, 3, 22);
            let oneMinute = 60 * 1000; // 1 minute in milliseconds
            let value = Math.random() * 1000;
            
            const randomData = () => {
                now = new Date(+now + oneMinute);
                value = value + Math.random() * 21 - 10;
                return {
                    name: now.toString(),
                    value: [
                        // Format: YYYY/MM/DD HH:mm
                        `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                        Math.round(value)
                    ]
                };
            };

            // Generate exactly 96 data points (24 hours * 4 fifteen-minute intervals)
            for (let i = 0; i < 96; i++) {
                data.push(randomData());
            }
            return { data, randomData };
        };

        // Initialize chart
        if (chartRef.current) {
            chartInstance.current = echarts.init(chartRef.current);
            const { data, randomData } = generateData();

            // Add resize handler
            const handleResize = () => {
                chartInstance.current?.resize();
            };

            window.addEventListener('resize', handleResize);

            const option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        params = params[0];
                        const date = new Date(params.name);
                        const currentValue = params.value[1];
                        
                        // Find previous day's value
                        const dataIndex = params.dataIndex;
                        const previousValue = dataIndex > 0 ? data[dataIndex - 1].value[1] : '-';
                        
                        return `Date: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}\n` +
                               `Current Day: ${currentValue}\n` +
                               `Previous Day: ${previousValue}`;
                    },
                    axisPointer: {
                        animation: false
                    }
                },
                legend: {
                    data: ['Current Day', 'Previous Day'],
                    top: 25,
                    textStyle: {
                        fontFamily: 'Roboto',
                        fontSize: '0.8rem',
                        color: '#424242',
                    }
                },
                xAxis: {
                    type: 'time',
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        fontFamily: 'Roboto',
                        fontSize: '0.75rem',
                        color: '#424242',
                        letterSpacing: '-1',
                        margin: 16,
                        rotate: 45,
                        formatter: function(value) {
                            const date = new Date(value);
                            return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                        }
                    },
                    axisTick: {
                        show: true,
                        alignWithLabel: true,
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#424242',
                            width: 2
                        },
                    }
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%'],
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
                        },
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#E0E0E0',
                            type: 'dashed',
                        },
                    }
                },
                grid: {
                    left: '1%',
                    right: '1%',
                    bottom: '10%',
                    top: '13%',
                    containLabel: true,
                },
                series: [{
                    name: 'Current Day',
                    type: 'line',
                    showSymbol: false,
                    data: data,
                    itemStyle: {
                        color: '#008cd7'
                    },
                    lineStyle: {
                        width: 2
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: '#008cd720'
                            },
                            {
                                offset: 1,
                                color: '#008cd700'
                            }
                        ])
                    }
                },
                {
                    name: 'Previous Day',
                    type: 'line',
                    showSymbol: false,
                    data: data.map((item, index) => ({
                        name: item.name,
                        value: [item.value[0], index > 0 ? data[index - 1].value[1] + 50 : null]
                    })),
                    itemStyle: {
                        color: '#ed8c22'
                    },
                    lineStyle: {
                        type: 'dashed',
                        width: 1
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: '#ed8c2210'
                            },
                            {
                                offset: 1,
                                color: '#ed8c2200'
                            }
                        ])
                    }
                }]
            };

            chartInstance.current.setOption(option);

            // Update data periodically
            const timer = setInterval(() => {
                // Only update the last data point
                const newData = randomData();
                data[data.length - 1] = newData;
                
                chartInstance.current.setOption({
                    series: [{
                        data: data
                    },
                    {
                        data: data.map((item, index) => ({
                            name: item.name,
                            value: [item.value[0], index > 0 ? data[index - 1].value[1] : null]
                        }))
                    }]
                });
            }, 15000);

            // Cleanup
            return () => {
                clearInterval(timer);
                window.removeEventListener('resize', handleResize);
                chartInstance.current?.dispose();
            };
        }
    }, [title, lineColor, yAxisLabel]);

    return (
        <div className={`${styles.graph_container} ${className || ''}`} style={{ height }}>
            <div className={styles.chart_controls}>
                <h3 className={styles.chart_title}>
                    {title}
                </h3>
                <div className={styles.action_cont}>
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
                <div 
                    ref={chartRef} 
                    className={styles.chart}
                />
            </div>
        </div>
    );
};

export default DynamicGraph;