import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styles from './DynamicGraph.module.css';

const DynamicGraph = ({
    title = 'Dynamic Data & Time Axis',
    height = '100%',
    className,
    lineColor = '#3f68b2',
    yAxisLabel = 'Value',
    currentDayData = [],
    previousDayData = [],
    refreshInterval = 15000 // milliseconds between data updates (15 seconds for demo, should be 15 minutes in production)
}) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const dataRef = useRef({
        currentDay: [...currentDayData],
        previousDay: [...previousDayData],
        currentIndex: 0 // Keep track of how many points we've shown
    });

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
        // Initialize chart
        if (chartRef.current) {
            chartInstance.current = echarts.init(chartRef.current);
            
            // If no data provided, generate sample data for demo purposes
            if (dataRef.current.previousDay.length === 0) {
                const generateSampleData = () => {
                    const data = [];
                    let now = new Date(2025, 3, 22);
                    now.setHours(0, 0, 0, 0); // Start at midnight (0:00)
                    let fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
                    let value = Math.random() * 1000;
                    
                    // Generate exactly 96 data points (0:00 to 23:45 in 15-minute intervals)
                    for (let i = 0; i < 96; i++) {
                        value = value + Math.random() * 21 - 10;
                        data.push({
                            name: now.toString(),
                            value: [
                                // Format: YYYY/MM/DD HH:mm
                                `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                                Math.round(value)
                            ]
                        });
                        now = new Date(+now + fifteenMinutes);
                    }
                    return data;
                };

                // Generate previous day data (full day)
                dataRef.current.previousDay = generateSampleData();
            }
            
            // For current day data, we either use provided data or generate up to current time
            if (dataRef.current.currentDay.length === 0) {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();
                
                // Calculate how many 15-min intervals have passed today
                // Each hour has 4 intervals, then add the current interval based on minutes
                const currentInterval = (hours * 4) + Math.floor(minutes / 15);
                dataRef.current.currentIndex = currentInterval;
                
                // If we don't have currentDayData from props, generate some
                const generateCurrentDayData = () => {
                    const data = [];
                    let startTime = new Date(2025, 3, 22); // Same reference date as used elsewhere
                    startTime.setHours(0, 0, 0, 0);
                    let fifteenMinutes = 15 * 60 * 1000;
                    let value = Math.random() * 1000;
                    
                    // Generate only up to current time
                    for (let i = 0; i <= currentInterval; i++) {
                        value = value + Math.random() * 21 - 10;
                        data.push({
                            name: startTime.toString(),
                            value: [
                                `${startTime.getFullYear()}/${startTime.getMonth() + 1}/${startTime.getDate()} ${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
                                Math.round(value)
                            ]
                        });
                        startTime = new Date(+startTime + fifteenMinutes);
                    }
                    return data;
                };
                
                dataRef.current.currentDay = generateCurrentDayData();
            } else {
                // If currentDayData was provided, figure out how many intervals it represents
                dataRef.current.currentIndex = dataRef.current.currentDay.length - 1;
            }

            // Add resize handler
            const handleResize = () => {
                chartInstance.current?.resize();
            };

            window.addEventListener('resize', handleResize);

            // Create array of all possible time labels (all 96 intervals)
            const allTimeLabels = [];
            let labelTime = new Date(2025, 3, 22);
            labelTime.setHours(0, 0, 0, 0);
            const fifteenMinutes = 15 * 60 * 1000;
            
            for (let i = 0; i < 96; i++) {
                const hours = labelTime.getHours();
                const minutes = labelTime.getMinutes();
                allTimeLabels.push(`${hours}:${String(minutes).padStart(2, '0')}`);
                labelTime = new Date(+labelTime + fifteenMinutes);
            }

            const option = {
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    textStyle: {
                        color: '#333',
                        fontFamily: 'Roboto',
                        fontSize: 12
                    },
                    padding: [8, 12],
                    formatter: function (params) {
                        // Get the time value directly from the xAxis data
                        const timeLabel = params[0].axisValue;
                        
                        // Use fixed date from the dataset
                        const formattedDate = `22/4/2025 - ${timeLabel}`;
                        
                        // Get values for both series
                        let currentValue, previousValue;
                        params.forEach(param => {
                            if (param.seriesName === 'Current Day') {
                                currentValue = param.value;
                            } else if (param.seriesName === 'Previous Day') {
                                previousValue = param.value;
                            }
                        });
                        
                        // Calculate percentage difference
                        let percentChange = 0;
                        let changeText = '';
                        let changeColor = '#757575';
                        
                        if (currentValue && previousValue && previousValue !== 0) {
                            percentChange = ((currentValue - previousValue) / previousValue) * 100;
                            const sign = percentChange >= 0 ? '+' : '';
                            changeText = `${sign}${percentChange.toFixed(2)}%`;
                            changeColor = percentChange >= 0 ? '#4CAF50' : '#F44336';
                        }
                        
                        // Format tooltip
                        let tooltipText = `<div style="font-weight: bold; margin-bottom: 8px;">${formattedDate}</div>`;
                        
                        // Add each series with its color indicator
                        params.forEach(param => {
                            tooltipText += `<div style="display: flex; align-items: center; margin: 3px 0;">
                                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; margin-right: 5px; border-radius: 50%;"></span>
                                <span style="margin-right: 5px;">${param.seriesName}:</span>
                                <span style="font-weight: bold;">${param.value} ${yAxisLabel}</span>
                            </div>`;
                        });
                        
                        // Add comparison row
                        tooltipText += `<div style="display: flex; align-items: center; margin-top: 8px; padding-top: 5px; border-top: 1px dashed #ddd;">
                            <span style="margin-right: 5px;">Comparison:</span>
                            <span style="font-weight: bold; color: ${changeColor};">${changeText}</span>
                        </div>`;
                        
                        return tooltipText;
                    },
                    axisPointer: {
                        type: 'cross',
                        lineStyle: {
                            color: '#aaa',
                            width: 1,
                            type: 'dashed'
                        },
                        crossStyle: {
                            color: '#aaa'
                        },
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
                    type: 'category',
                    data: allTimeLabels, // Use all possible time labels
                    boundaryGap: false,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: 'dashed',
                            color: '#E0E0E0'
                        }
                    },
                    axisLabel: {
                        fontFamily: 'Roboto',
                        fontSize: '0.75rem',
                        color: '#424242',
                        letterSpacing: '-1',
                        margin: 16,
                        rotate: 45,
                        interval: function(index, value) {
                            // Only show labels at 30-minute intervals (0:00, 0:30, 1:00, 1:30, etc.)
                            return index % 2 === 0;
                        }
                    },
                    axisTick: {
                        show: true,
                        alignWithLabel: true,
                        interval: 0  // Show tick for every data point
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#424242',
                            width: 1
                        },
                    }
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
                            width: 1
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
                    bottom: '20%',
                    top: '13%',
                    containLabel: true,
                },
                series: [{
                    name: 'Current Day',
                    type: 'line',
                    showSymbol: false,
                    // Use all time slots but only fill with available data
                    data: Array(96).fill(null).map((_, index) => {
                        if (index <= dataRef.current.currentIndex) {
                            return dataRef.current.currentDay[index]?.value[1] || '-';
                        }
                        return '-'; // Use dash or null to indicate no data yet
                    }),
                    connectNulls: true, // Connect the line across null values
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
                                color: '#008cd760'
                            },
                            {
                                offset: 1,
                                color: '#008cd710'
                            }
                        ])
                    }
                },
                {
                    name: 'Previous Day',
                    type: 'line',
                    showSymbol: false,
                    data: dataRef.current.previousDay.map(item => item.value[1]),
                    itemStyle: {
                        color: '#029447'
                    },
                    lineStyle: {
                        type: 'dashed',
                        width: 2
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: '#02944750'
                            },
                            {
                                offset: 1,
                                color: '#02944710'
                            }
                        ])
                    }
                }]
            };

            chartInstance.current.setOption(option);

            // Update data periodically - only update the current day data
            const timer = setInterval(() => {
                // In a real implementation, you would fetch the new data from an API here
                // For demo purposes, we'll simulate a new data point

                // This simulates getting a new data point from API
                const fetchNewDataPoint = () => {
                    // If we already have all 96 points, don't add more
                    if (dataRef.current.currentIndex >= 95) {
                        return null;
                    }
                    
                    const lastIndex = dataRef.current.currentIndex;
                    const newIndex = lastIndex + 1;
                    
                    // In a production scenario this new value would come from your API call
                    let newValue;
                    if (lastIndex < dataRef.current.currentDay.length - 1) {
                        // If we already have this data point (from props), use it
                        newValue = dataRef.current.currentDay[newIndex].value[1];
                    } else {
                        // Otherwise generate a random new value based on the last one
                        const lastValue = dataRef.current.currentDay[lastIndex].value[1];
                        newValue = Math.round(lastValue + Math.random() * 21 - 10);
                        
                        // Create the new data point for our internal storage
                        const timeForNewPoint = new Date(2025, 3, 22);
                        timeForNewPoint.setHours(0, 0, 0, 0);
                        timeForNewPoint.setTime(timeForNewPoint.getTime() + (newIndex * 15 * 60 * 1000));
                        
                        const newDataPoint = {
                            name: timeForNewPoint.toString(),
                            value: [
                                `${timeForNewPoint.getFullYear()}/${timeForNewPoint.getMonth() + 1}/${timeForNewPoint.getDate()} ${String(timeForNewPoint.getHours()).padStart(2, '0')}:${String(timeForNewPoint.getMinutes()).padStart(2, '0')}`,
                                newValue
                            ]
                        };
                        
                        // Add it to our internal data array
                        dataRef.current.currentDay.push(newDataPoint);
                    }
                    
                    // Increment our current index
                    dataRef.current.currentIndex = newIndex;
                    
                    return newValue;
                };
                
                // Get new data point 
                const newValue = fetchNewDataPoint();
                
                // If we got a new value, update the chart
                if (newValue !== null) {
                    // Create a new data array with the updated values
                    const newData = Array(96).fill(null).map((_, index) => {
                        if (index <= dataRef.current.currentIndex) {
                            return dataRef.current.currentDay[index]?.value[1] || '-';
                        }
                        return '-';
                    });
                    
                    // Update the chart with only the currentDay series changing
                    chartInstance.current.setOption({
                        series: [{
                            data: newData
                        },
                        {
                            data: dataRef.current.previousDay.map(item => item.value[1])
                        }]
                    });
                }
            }, refreshInterval);

            // Cleanup
            return () => {
                clearInterval(timer);
                window.removeEventListener('resize', handleResize);
                chartInstance.current?.dispose();
            };
        }
    }, [title, lineColor, yAxisLabel, refreshInterval]);

    // Update the data refs when props change
    useEffect(() => {
        if (currentDayData.length > 0) {
            dataRef.current.currentDay = [...currentDayData];
            dataRef.current.currentIndex = currentDayData.length - 1;
        }
        if (previousDayData.length > 0) {
            dataRef.current.previousDay = [...previousDayData];
        }
        
        // Update chart if it exists
        if (chartInstance.current) {
            // Create a new data array with the updated values for current day
            const newData = Array(96).fill(null).map((_, index) => {
                if (index <= dataRef.current.currentIndex) {
                    return dataRef.current.currentDay[index]?.value[1] || '-';
                }
                return '-';
            });
            
            chartInstance.current.setOption({
                series: [{
                    data: newData
                },
                {
                    data: dataRef.current.previousDay.map(item => item.value[1])
                }]
            });
        }
    }, [currentDayData, previousDayData]);

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