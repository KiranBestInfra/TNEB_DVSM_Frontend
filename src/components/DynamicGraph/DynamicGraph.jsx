import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import PropTypes from "prop-types";
import styles from "./DynamicGraph.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DynamicGraph = ({
  title = "Demand Graph",
  height = "100%",
  data,
  className,
  lineColor = "#3f68b2",
  yAxisLabel = "MW",
  timeRange,
  onTimeRangeChange,
  showTimeRangeDropdown = true,
  onDateChange,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const handleDownload = () => {
    if (chartInstance.current) {
      const url = chartInstance.current.getDataURL();
      const link = document.createElement("a");
      link.download = `${title}.png`;
      link.href = url;
      link.click();
    }
  };

  useEffect(() => {
    if (chartRef.current && data) {
      chartInstance.current = echarts.init(chartRef.current, null, {
        renderer: "canvas",
        width: "auto",
        height: "410",
      });

      const handleResize = () => {
        if (chartInstance.current) {
          chartInstance.current.resize({
            width: "auto",
            height: "410",
          });
        }
      };

      window.addEventListener("resize", handleResize);

      const option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "var(--main-widget-color)",
          borderColor: "var(--border-color)",
          borderWidth: 1,
          textStyle: {
            color: "#333",
            fontFamily: "Roboto",
            fontSize: 12,
          },
          padding: [8, 12],
          formatter: function (params) {
            const timeLabel = params[0].axisValue;
            let tooltipText = `<div style="font-weight: bold; margin-bottom: 8px; color: var(--text-primary)">${timeLabel}</div>`;
            params.forEach((param) => {
              tooltipText += `<div style="display: flex; align-items: center; margin: 3px 0;">
                                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; margin-right: 5px; border-radius: 50%;"></span>
                                <span style="margin-right: 5px; color: var(--text-secondary)">${param.seriesName}:</span>
                                <span style="font-weight: bold; color: var(--text-primary)">${param.value} ${yAxisLabel}</span>
                            </div>`;
            });

            if (params.length === 2) {
              const currentValue = params[0].value;
              const previousValue = params[1].value;
              const percentChange =
                ((currentValue - previousValue) / previousValue) * 100;
              const sign = percentChange >= 0 ? "+" : "";
              const changeText = `${sign}${percentChange.toFixed(2)}%`;
              const changeColor = percentChange >= 0 ? "#4CAF50" : "#F44336";

              tooltipText += `<div style="display: flex; align-items: center; margin-top: 8px; padding-top: 5px; border-top: 1px dashed #ddd;">
                                <span style="margin-right: 5px; color: var(--text-secondary);">Comparison:</span>
                                <span style="font-weight: bold; color: ${changeColor};">${changeText}</span>
                            </div>`;
            }

            return tooltipText;
          },
          axisPointer: {
            type: "cross",
            lineStyle: {
              color: "#aaa",
              width: 1,
              type: "dashed",
            },
            crossStyle: {
              color: "#aaa",
            },
            animation: false,
          },
        },
        legend: {
          data: data.series.map((s) => s.name),
          top: 25,
          textStyle: {
            fontFamily: "Roboto",
            fontSize: "0.8rem",
            color: "#7e7e7e",
          },
        },
        xAxis: {
          type: "category",
          data: data.xAxis.map((time) => time.slice(0, 5)),
          boundaryGap: false,
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "var(--border-color)",
            },
          },
          axisLabel: {
            fontFamily: "Roboto",
            fontSize: "0.75rem",
            color: "#7e7e7e",
            letterSpacing: "-1",
            margin: 16,
            rotate: 45,
            interval: function (index) {
              return index % 2 === 0;
            },
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
            interval: 0,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "var(--text-primary)",
              width: 1,
            },
          },
        },
        yAxis: {
          type: "value",
          boundaryGap: [0, "10%"],
          axisLabel: {
            formatter: "{value} MW",
            fontFamily: "Roboto",
            fontSize: "0.75rem",
            color: "#7e7e7e",
            letterSpacing: "-1",
            margin: 20,
          },
          axisTick: {
            show: true,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "var(--text-primary)",
              width: 1,
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#b9b4b429",
              type: "dashed",
            },
          },
        },
        grid: {
          left: "1%",
          right: "1%",
          bottom: "3%",
          top: "13%",
          containLabel: true,
          backgroundColor: "var(--main-widget-color)",
        },
        series: data.series.map((series, index) => ({
          name: series.name,
          type: "line",
          showSymbol: false,
          data: series.data,
          itemStyle: {
            color: index === 0 ? "#008cd7" : "#029447",
          },
          lineStyle: {
            width: 2,
            type: index === 0 ? "solid" : "dashed",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: index === 0 ? "#008cd760" : "#02944750",
              },
              {
                offset: 1,
                color: index === 0 ? "#008cd710" : "#02944710",
              },
            ]),
          },
        })),
      };

      chartInstance.current.setOption(option);

      return () => {
        window.removeEventListener("resize", handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, [data, title, lineColor, yAxisLabel]);

  return (
    <div
      className={`${styles.graph_container} ${className || ""}`}
      style={{ height }}
    >
      <div className={styles.chart_controls}>
        <h3 className={styles.chart_title}>{title}</h3>
        <div className={styles.action_cont}>
          <div className={styles.date_picker}>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              className={styles.date_input}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select Date"
              maxDate={new Date()}
            />
            <span className={styles.date_icon}>
              <img 
                src="icons/date.svg" 
                alt="Select Date" 
                style={{ filter: "var(--icons-color-filter)" }}
              />
            </span>
          </div>
          <span
            className={styles.icons_chart_controls}
            onClick={handleDownload}
          >
            <img
              src="icons/download-icon.svg"
              alt="Download chart"
              style={{ filter: "var(--icons-color-filter)" }}
            />
          </span>
        </div>
      </div>
      <div className={styles.echart_container}>
        {data && data.series && data.series.length > 0 ? (
          <div ref={chartRef} className={styles.chart} />
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

DynamicGraph.propTypes = {
  title: PropTypes.string,
  height: PropTypes.string,
  data: PropTypes.shape({
    xAxis: PropTypes.arrayOf(PropTypes.string),
    series: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number),
      })
    ),
  }),
  className: PropTypes.string,
  lineColor: PropTypes.string,
  yAxisLabel: PropTypes.string,
  timeRange: PropTypes.string,
  onTimeRangeChange: PropTypes.func,
  showTimeRangeDropdown: PropTypes.bool,
  onDateChange: PropTypes.func,
};

export default DynamicGraph;
