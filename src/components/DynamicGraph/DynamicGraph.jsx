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
            link.download = 'dynamic-chart.png';
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
                title: {
                    text: title
                },
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
                        fontSize: '0.75rem',
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
                    left: '0.2%',
                    right: '0.1%',
                    bottom: '0%',
                    top: '13%',
                    containLabel: true,
                },
                series: [{
                    name: 'Current Day',
                    type: 'line',
                    showSymbol: false,
                    data: data,
                    itemStyle: {
                        color: lineColor
                    }
                },
                {
                    name: 'Previous Day',
                    type: 'line',
                    showSymbol: false,
                    data: data.map((item, index) => ({
                        name: item.name,
                        value: [item.value[0], index > 0 ? data[index - 1].value[1] : null]
                    })),
                    itemStyle: {
                        color: '#8e8e8e'  // A muted gray color for previous day
                    },
                    lineStyle: {
                        type: 'dashed'
                    }
                }]
            };

            chartInstance.current.setOption(option);

            // Update data periodically
            const timer = setInterval(() => {
                // Remove oldest data point and add new one
                data.shift();
                const newData = randomData();
                data.push(newData);
                
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
            <button 
                onClick={handleDownload}
                className={styles.download_button}
            >
                Download Chart
            </button>
            <div 
                ref={chartRef} 
                style={{ width: '100%', height: '400px' }} 
            />
        </div>
    );
};

export default DynamicGraph;