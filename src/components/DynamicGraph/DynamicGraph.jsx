import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styles from './DynamicGraph.module.css';
const DynamicGraph = () => {
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
            let oneDay = 24 * 3600 * 1000;
            let value = Math.random() * 1000;
            
            const randomData = () => {
                now = new Date(+now + oneDay);
                value = value + Math.random() * 21 - 10;
                return {
                    name: now.toString(),
                    value: [
                        [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
                        Math.round(value)
                    ]
                };
            };

            for (let i = 0; i < 1000; i++) {
                data.push(randomData());
            }
            return { data, randomData };
        };

        // Initialize chart
        if (chartRef.current) {
            chartInstance.current = echarts.init(chartRef.current);
            const { data, randomData } = generateData();

            const option = {
                title: {
                    text: 'Dynamic Data & Time Axis'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        params = params[0];
                        const date = new Date(params.name);
                        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} : ${params.value[1]}`;
                    },
                    axisPointer: {
                        animation: false
                    }
                },
                xAxis: {
                    type: 'time',
                    splitLine: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'value',
                    boundaryGap: [0, '100%'],
                    splitLine: {
                        show: false
                    }
                },
                series: [{
                    name: 'Fake Data',
                    type: 'line',
                    showSymbol: false,
                    data: data
                }]
            };

            chartInstance.current.setOption(option);

            // Update data periodically
            const timer = setInterval(() => {
                for (let i = 0; i < 5; i++) {
                    data.shift();
                    data.push(randomData());
                }
                chartInstance.current.setOption({
                    series: [{
                        data: data
                    }]
                });
            }, 1000);

            // Cleanup
            return () => {
                clearInterval(timer);
                chartInstance.current?.dispose();
            };
        }
    }, []);

    return (
        <div className={styles.graph_container}>
            <button 
                onClick={handleDownload}
                className={styles.download_button}
            >
                Download Chart
            </button>
            <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
        </div>
    );
};

export default DynamicGraph;