import React from 'react';
import ReactECharts from 'echarts-for-react';
import styles from './PieChart.module.css';

const PieChart = ({
    title = 'Distribution',
    height = '100%',
    className,
    data = [],
    valueUnit = '',
    chartRef,
    colors = ['#3f68b2', '#029447', '#dc272c', '#ed8c22'],
    showToolTip = true,
    onClick,
    showPlural = true, // New prop to control pluralization
}) => {
    const handleDownload = () => {
        if (chartRef?.current) {
            const base64 = chartRef.current.getEchartsInstance().getDataURL();
            const link = document.createElement('a');
            link.download = `${title}.png`;
            link.href = base64;
            link.click();
        }
    };

    const option = {
        tooltip: showToolTip
            ? {
                  trigger: 'item',
                  formatter: function (params) {
                      return `${params.name}: ${params.value} ${valueUnit}${
                          showPlural && params.value > 1 ? 's' : ''
                      }`;
                  },
                  textStyle: {
                      fontFamily: 'Roboto',
                  },
                  borderRadius: '10',
                  padding: [8, 12, 8, 12],
                  borderWidth: 0,
              }
            : null,
        legend: {
            top: '0%',
            left: 'center',
            textStyle: {
                fontFamily: 'Roboto',
                fontSize: '0.85rem',
                color: '#424242',
                lineHeight: 0,
            },
            icon: 'circle',
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 20,
            textAlign: 'left',
            itemStyle: {
                borderWidth: 0,
            },
            padding: [0, 0, 0, 0],
        },
        series: [
            {
                type: 'pie',
                radius: ['30%', '55%'],
                center: ['50%', '50%'],
                label: {
                    show: false,
                },
                data: data.map((item, index) => ({
                    ...item,
                    itemStyle: {
                        color: colors[index % colors.length],
                    },
                    cursor: onClick ? 'pointer' : 'default',
                })),
                labelLine: {
                    show: false,
                },
                emphasis: {
                    scale: true,
                    scaleSize: 5,
                },
            },
        ],
    };

    const totalValue = data.reduce((sum, item) => sum + Number(item.value), 0);

    const handleChartClick = (params) => {
        if (onClick && params.data) {
            onClick(params.data);
        }
    };

    return (
        <div
            className={`${styles.chart_container} ${className || ''}`}
            style={{ height }}>
            <div className={styles.chart_controls}>
                <h3 className={styles.chart_title}>{title}</h3>
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
            <div className={styles.chart_content}>
                <div className={styles.echart_container}>
                    <ReactECharts
                        ref={chartRef}
                        option={option}
                        onEvents={{
                            click: handleChartClick,
                        }}
                    />
                </div>
                <div className={styles.stats_container}>
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className={styles.stat_item}
                            onClick={() => onClick && onClick(item)}
                            style={{ cursor: onClick ? 'pointer' : 'default' }}>
                            <div className={styles.stat_header}>
                                <span
                                    className={styles.color_indicator}
                                    style={{
                                        backgroundColor:
                                            colors[index % colors.length],
                                    }}
                                />
                                {/* <span className={styles.stat_label}>
                                    {item.name}
                                </span> */}
                            </div>
                            <div className={styles.stat_values}>
                                <span className={styles.stat_value}>
                                    {item.value}
                                    {valueUnit}
                                    {showPlural && item.value > 1 ? 's' : ''}
                                </span>
                                <span className={styles.stat_percentage}>
                                    {((item.value / totalValue) * 100).toFixed(
                                        1
                                    )}
                                    %
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PieChart;
