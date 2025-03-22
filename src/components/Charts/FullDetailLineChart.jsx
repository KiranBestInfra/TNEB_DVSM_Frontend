import React from 'react';
import styles from '../../styles/FullDetailLineChart.module.css';

const FullDetailLineChart = ({ data }) => {
    // Example data structure - replace with actual data from props
    const summaryData = {
        totalMeters: data?.totalMeters || 0,
        communicated: data?.communicated || 0,
        nonCommunicated: data?.nonCommunicated || 0,
        communicationPercentage: data?.communicationPercentage || 0,
        nonCommunicationPercentage: data?.nonCommunicationPercentage || 0
    };

    return (
        <div className={styles.chart_container}>
            <div className={styles.summary_section}>
                <div className={styles.summary_card}>
                    <div className={styles.total_meters_container}>
                        <img src="icons/meter.svg" alt="Total Meters" />
                        <div className={styles.total_meters}>
                            <div className='titles'>Total Meters</div>
                            <div className={styles.summary_value}>{summaryData.totalMeters}</div>
                        </div>
                    </div>

                    <div className={styles.meter_communication}>
                        <div className={styles.summary_item}>
                            <div className='title'>Communicating Meters</div>
                            <div className={styles.summary_progress}>
                                <div className={styles.summary_value}>
                                    <div>{summaryData.communicated}</div>
                                    <div className={styles.meter_percentage}>{summaryData.communicationPercentage}%</div>
                                </div>
                                <div className={styles.progress_bar}>
                                    <div
                                        className={`${styles.progress_fill} ${styles.progress_fill_positive}`}
                                        style={{ width: `${summaryData.communicationPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.meter_communication}>
                        <div className={styles.summary_item}>
                            <div className='title'>Non-Communicating Meters</div>
                            <div className={styles.summary_progress}>
                                <div className={`${styles.summary_value} ${styles.negative_value}`}>
                                    <div>{summaryData.nonCommunicated}</div>
                                    <div className={styles.meter_percentage}>{summaryData.nonCommunicationPercentage}%</div>
                                </div>
                                <div className={styles.progress_bar}>
                                    <div
                                        className={`${styles.progress_fill} ${styles.progress_fill_negative}`}
                                        style={{ width: `${summaryData.nonCommunicationPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart section will be added here */}
            <div className={styles.chart_section}>
                {/* Chart implementation will go here */}
            </div>
        </div>
    );
};

export default FullDetailLineChart; 