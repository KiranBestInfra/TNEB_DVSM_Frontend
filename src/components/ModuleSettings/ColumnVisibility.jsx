import { useState } from 'react';
import styles from '../../styles/ModuleSettings.module.css';
import Buttons from '../ui/Buttons/Buttons';

const DEFAULT_COLUMNS = [
    { key: 'division', label: 'Division', category: 'hierarchy' },
    { key: 'area', label: 'Area', category: 'hierarchy' },
    { key: 'distributionSS', label: 'Distribution SS', category: 'hierarchy' },
    { key: 'qtrSS', label: 'QTR SS', category: 'hierarchy' },
    { key: 'quarter', label: 'Quarter', category: 'hierarchy' },
    { key: 'quarterNo', label: 'Quarter No', category: 'hierarchy' },
    { key: 'consumerName', label: 'Consumer Name', category: 'consumer' },
    { key: 'consumerId', label: 'Consumer ID', category: 'consumer' },
    { key: 'designation', label: 'Designation', category: 'consumer' },
    { key: 'meter', label: 'Meter', category: 'consumer' },
    { key: 'dcuId', label: 'DCU ID', category: 'consumer' },
    { key: 'acStatus', label: 'AC Status', category: 'consumer' }
];

const ColumnVisibility = ({ onClose, onSave, initialVisibility = {} }) => {
    const [columnVisibility, setColumnVisibility] = useState(
        DEFAULT_COLUMNS.reduce((acc, col) => ({
            ...acc,
            [col.key]: initialVisibility[col.key] ?? true
        }), {})
    );

    const handleToggle = (key) => {
        setColumnVisibility(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = () => {
        onSave(columnVisibility);
        onClose();
    };

    const hierarchyColumns = DEFAULT_COLUMNS.filter(col => col.category === 'hierarchy');
    const consumerColumns = DEFAULT_COLUMNS.filter(col => col.category === 'consumer');

    return (
        <div className={styles.columnVisibilityContainer}>
            <div className={styles.bulkUploadHeader}>
                <div className={styles.headerTitles}>
                    <div className="title">Configure Table Columns</div>
                    <p className="sub_title">Select which columns to display in the consumer table</p>
                </div>
                <div className={styles.headerActions}>
                    <Buttons
                        label="Cancel"
                        variant="outline"
                        onClick={onClose}
                    />
                    <Buttons
                        label="Save"
                        variant="primary"
                        onClick={handleSave}
                        icon="icons/check.svg"
                        iconPosition="left"
                    />
                </div>
            </div>

            <div className={styles.columnVisibilityContent}>
                <div>
                    <h3>Hierarchy Columns</h3>
                    <div className={styles.columnList}>
                        {hierarchyColumns.map(col => (
                            <div key={col.key} className={styles.columnItem}>
                                <input
                                    type="checkbox"
                                    id={col.key}
                                    checked={columnVisibility[col.key]}
                                    onChange={() => handleToggle(col.key)}
                                />
                                <label htmlFor={col.key}>{col.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>Consumer Data Columns</h3>
                    <div className={styles.columnList}>
                        {consumerColumns.map(col => (
                            <div key={col.key} className={styles.columnItem}>
                                <input
                                    type="checkbox"
                                    id={col.key}
                                    checked={columnVisibility[col.key]}
                                    onChange={() => handleToggle(col.key)}
                                />
                                <label htmlFor={col.key}>{col.label}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColumnVisibility; 