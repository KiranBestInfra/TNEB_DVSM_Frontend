import { useState, useEffect } from 'react';
import styles from './NotificationsPanel.module.css';
import { apiClient } from '../../api/client';

const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        return notificationDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
};

const dummyNotifications = [
    {
        id: 1,
        title: 'New Bill Generated',
        message: 'Monthly electricity bill for Consumer ID: CONS123 has been generated.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        type: 'bill',
        isRead: false,
        category: 'all'
    },
    {
        id: 2,
        title: 'Power Fluctuation Alert',
        message: 'Unusual power fluctuation detected in Sector 5. Please check the distribution network.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        type: 'alert',
        isRead: false,
        category: 'alerts'
    },
    {
        id: 3,
        title: 'High Usage Alert',
        message: 'Unusual high power consumption detected for Meter No: MTR789.',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        type: 'alert',
        isRead: false,
        category: 'all'
    },
    {
        id: 4,
        title: 'Maintenance Schedule',
        message: 'Scheduled maintenance in Sector 7 on 25th April, 2024 from 10:00 AM to 2:00 PM.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        type: 'maintenance',
        isRead: false,
        category: 'all'
    },
    {
        id: 5,
        title: 'New Connection Request',
        message: 'New connection request received from John Doe for address: 123, Main Street.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        type: 'request',
        isRead: false,
        category: 'tickets'
    },
    {
        id: 6,
        title: 'Transformer Overload Alert',
        message: 'Transformer T-456 in Sector 3 is operating at 95% capacity. Immediate attention required.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        type: 'alert',
        isRead: false,
        category: 'alerts'
    }
];

const TABS = [
    { id: 'all', label: 'All' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'tickets', label: 'Tickets' }
];

const NotificationsPanel = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/notifications');
                setNotifications(response.data);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                // Use dummy notifications if API fails
                setNotifications(dummyNotifications);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleOverlayClick = (e) => {
        if (e.target.className === styles.overlay) {
            onClose();
        }
    };

    const handleMarkAsRead = (notificationId) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return !notification.isRead;
        return notification.category === activeTab && !notification.isRead;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <div className="title">Notifications <span className={styles.unreadCount}>{unreadCount}</span></div>
                    <span className="icons" onClick={onClose}>
                        <img src="icons/close.svg" alt="close" />
                    </span>
                </div>

                <div className={styles.tabs}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={styles.content}>
                    {loading && <div className={styles.loading}>Loading notifications...</div>}
                    {error && <div className={styles.error}>{error}</div>}
                    {!loading && !error && filteredNotifications.length === 0 && (
                        <div className={styles.empty}>No new notifications</div>
                    )}
                    {!loading && !error && filteredNotifications.map((notification) => (
                        <div key={notification.id} className={`${styles.notification} ${styles[notification.type]}`}>
                            <div className={styles.notificationHeader}>
                                <span className={styles.title}>{notification.title}</span>
                                <span className={styles.time}>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                            <p className={styles.message}>{notification.message}</p>
                            <button
                                className={styles.markAsRead}
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                Mark as read
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPanel; 