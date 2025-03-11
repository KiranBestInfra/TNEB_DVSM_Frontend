import { useState } from 'react';
import styles from './RecentActivities.module.css';

const RecentActivities = ({ activities = [] }) => {
    const [displayCount, setDisplayCount] = useState(5);

    const handleShowMore = () => {
        setDisplayCount((prev) => prev + 5);
    };

    if (!activities || activities.length === 0) {
        return (
            <div className={styles.activities_container}>
                <div className={styles.empty_message}>No Recent Activities</div>
            </div>
        );
    }

    return (
        <div className={styles.activities_container}>
            <h2 className="title">Recent Activities</h2>
            <div className={styles.activities_list}>
                {activities.slice(0, displayCount).map((activity, index) => (
                    <div key={index} className={styles.activity_item}>
                        <div className={styles.activity_icon}>
                            <img
                                src={
                                    activity.icon || ' icons/activity-icon.svg'
                                }
                                alt="activity icon"
                            />
                        </div>
                        <div className={styles.activity_content}>
                            <p className={styles.activity_text}>
                                {activity.description}
                            </p>
                            <span className={styles.activity_time}>
                                {activity.timestamp}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {activities.length > displayCount && (
                <button
                    className={styles.show_more_btn}
                    onClick={handleShowMore}>
                    Show More
                </button>
            )}
        </div>
    );
};

export default RecentActivities;
