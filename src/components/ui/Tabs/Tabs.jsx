import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Tabs.module.css';

const Tabs = ({ tabs, defaultTab, onTabChange }) => {
    const [activeTab, setActiveTab] = useState(defaultTab || 0);

    const handleTabClick = (index) => {
        setActiveTab(index);
        if (onTabChange) {
            onTabChange(index);
        }
    };

    return (
        <div className={styles.tabs_container}>
            <div className={styles.tabs_header}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`${styles.tab} ${
                            activeTab === index ? styles.active : ''
                        }`}
                        onClick={() => handleTabClick(index)}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className={styles.tab_content}>{tabs[activeTab].content}</div>
        </div>
    );
};

Tabs.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            content: PropTypes.node.isRequired,
        })
    ).isRequired,
    defaultTab: PropTypes.number,
    onTabChange: PropTypes.func,
};

export default Tabs;
