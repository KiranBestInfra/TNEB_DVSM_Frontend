import styles from '../../../styles/Dashboard.module.css';

const WidgetSkeleton = () => (
    <div className={styles.total_units_container}>
        <div className={`${styles.stat_card} skeleton-loading`}>
            <div className={styles.stat_card_left}>
                <div
                    className="skeleton-text skeleton-pulse"
                    style={{
                        width: '120px',
                        height: '24px',
                        borderRadius: '12px',
                        animation: 'pulse 0s ease-in-out infinite',
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                    <div
                        className="skeleton-text skeleton-pulse"
                        style={{
                            width: '80px',
                            height: '24px',
                            borderRadius: '12px',
                            animation: 'pulse 0s ease-in-out 0.2s infinite',
                        }}
                    />
                    <div
                        className="skeleton-circle skeleton-pulse"
                        style={{
                            width: '24px',
                            height: '24px',
                            animation: 'pulse 0s ease-in-out 0.3s infinite',
                        }}
                    />
                </div>
            </div>
            <div className={styles.stat_card_right}>
                <span
                    className="skeleton-circle"
                    style={{
                        width: '32px',
                        height: '32px',
                        animation: 'pulse 0s ease-in-out 0.4s infinite',
                    }}
                />
            </div>
        </div>
        <div className={styles.active_units_container}>
            <div
                className="skeleton-text skeleton-pulse"
                style={{
                    width: '80px',
                    height: '16px',
                    borderRadius: '8px',
                    animation: 'pulse 0s ease-in-out 0.5s infinite',
                }}
            />
            <div
                className="skeleton-text skeleton-pulse"
                style={{
                    width: '80px',
                    height: '16px',
                    borderRadius: '8px',
                    animation: 'pulse 0s ease-in-out 0.6s infinite',
                }}
            />
        </div>
    </div>
);

export default WidgetSkeleton;
