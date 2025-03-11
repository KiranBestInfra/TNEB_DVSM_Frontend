import { useState } from 'react';
import styles from './AdvancedFilter.module.css';
import Buttons from '../Buttons/Buttons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
const AdvancedFilter = ({
    advancedOptions,
    onAdvancedOptionChange,
    onUpdateBillStatus,
    onSendBulkReminders,
    loading,
}) => {
    const [activeTab, setActiveTab] = useState('billUpdate');
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'billUpdate') {
            onAdvancedOptionChange('billUpdate', 'updateType', 'bulk');
        } else if (tab === 'reminders') {
            onAdvancedOptionChange('reminder', 'type', 'bulk');
            onAdvancedOptionChange('reminder', 'bulkSelection', 'allPending');
        }
    };

    return (
        <div className={styles.advanced_options}>
            <div className={styles.advanced_section}>
                <div className={styles.tabs_container}>
                    <div className={styles.tabs_list}>
                        <button
                            className={`${styles.tab_button} ${activeTab === 'billUpdate' ? styles.active : ''
                                }`}
                            onClick={() => handleTabChange('billUpdate')}>
                            Bills
                        </button>
                        <button
                            className={`${styles.tab_button} ${activeTab === 'reminders' ? styles.active : ''
                                }`}
                            onClick={() => handleTabChange('reminders')}>
                            Reminders
                        </button>
                    </div>

                    <div
                        className={`${styles.tab_content} ${activeTab === 'billUpdate' ? styles.active : ''
                            }`}>
                        <form className={styles.form_container}>
                            <div className={styles.toggle_container}>
                                <span className={styles.label}>
                                    Select Mode:
                                </span>
                                <div
                                    className={styles.toggle_buttons}
                                    data-state={
                                        advancedOptions.billUpdate
                                            .updateType === 'individual'
                                            ? 'right'
                                            : 'left'
                                    }>
                                    <button
                                        type="button"
                                        className={`${styles.toggle_btn} ${advancedOptions.billUpdate
                                                .updateType === 'bulk'
                                                ? styles.active
                                                : ''
                                            }`}
                                        onClick={() =>
                                            onAdvancedOptionChange(
                                                'billUpdate',
                                                'updateType',
                                                'bulk'
                                            )
                                        }
                                        autoFocus>
                                        Bulk
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.toggle_btn} ${advancedOptions.billUpdate
                                                .updateType === 'individual'
                                                ? styles.active
                                                : ''
                                            }`}
                                        onClick={() =>
                                            onAdvancedOptionChange(
                                                'billUpdate',
                                                'updateType',
                                                'individual'
                                            )
                                        }>
                                        Single
                                    </button>
                                </div>
                            </div>

                            {advancedOptions.billUpdate.updateType ===
                                'bulk' ? (
                                <div className={styles.filter_options}>
                                    <div className={styles.search_cont}>
                                        <select
                                            value={
                                                advancedOptions.billUpdate
                                                    .bulkSelection
                                            }
                                            onChange={(e) =>
                                                onAdvancedOptionChange(
                                                    'billUpdate',
                                                    'bulkSelection',
                                                    e.target.value
                                                )
                                            }
                                            className={styles.select_input}>
                                            <option value="">
                                                Filter Bills By
                                            </option>
                                            <option value="allPending">
                                                All Pending Bills
                                            </option>
                                            <option value="byConsumerType">
                                                Consumer Type
                                            </option>
                                            <option value="byDateRange">
                                                Date Range
                                            </option>
                                            <option value="byAmount">
                                                Bill Amount
                                            </option>
                                        </select>

                                        <span className="arrow_icon arrowicon_placement">
                                            <img
                                                src="icons/arrow-down.svg"
                                                alt="Select Consumer Type"
                                            />
                                        </span>
                                    </div>

                                    {advancedOptions.billUpdate
                                        .bulkSelection === 'byConsumerType' && (
                                            <div className={styles.search_cont}>
                                                <select
                                                    value={
                                                        advancedOptions.billUpdate
                                                            .consumerType
                                                    }
                                                    onChange={(e) =>
                                                        onAdvancedOptionChange(
                                                            'billUpdate',
                                                            'consumerType',
                                                            e.target.value
                                                        )
                                                    }
                                                    className={styles.select_input}>
                                                    <option value="">
                                                        Select Consumer Type
                                                    </option>
                                                    <option value="residential">
                                                        Residential
                                                    </option>
                                                    <option value="commercial">
                                                        Commercial
                                                    </option>
                                                    <option value="industrial">
                                                        Industrial
                                                    </option>
                                                    <option value="government">
                                                        SEZ
                                                    </option>
                                                </select>
                                                <span className="arrow_icon arrowicon_placement">
                                                    <img
                                                        src="icons/arrow-down.svg"
                                                        alt="Select Consumer Type"
                                                    />
                                                </span>
                                            </div>
                                        )}

                                    {advancedOptions.billUpdate
                                        .bulkSelection === 'byDateRange' && (
                                            <div className={styles.date_ranges}>
                                                <div className={styles.search_cont}>
                                                    <DatePicker
                                                        selected={dateRange.start}
                                                        onChange={(date) => {
                                                            setDateRange({
                                                                ...dateRange,
                                                                start: date,
                                                            });

                                                            onAdvancedOptionChange(
                                                                'billUpdate',
                                                                'startDate',
                                                                date
                                                            );
                                                        }}
                                                        className={
                                                            styles.date_input
                                                        }
                                                        dateFormat="MMM dd, yyyy"
                                                        placeholderText="Start Date"
                                                    />
                                                    <span className="icons icon_placement">
                                                        <img
                                                            src="icons/date.svg"
                                                            alt="Select Consumer Type"
                                                        />
                                                    </span>
                                                </div>
                                                <div className={styles.search_cont}>
                                                    <DatePicker
                                                        selected={dateRange.end}
                                                        onChange={(date) => {
                                                            setDateRange({
                                                                ...dateRange,
                                                                end: date,
                                                            });
                                                            onAdvancedOptionChange(
                                                                'billUpdate',
                                                                'endDate',
                                                                date
                                                            );
                                                        }}
                                                        className={
                                                            styles.date_input
                                                        }
                                                        dateFormat="MMM dd, yyyy"
                                                        placeholderText="End Date"
                                                    />
                                                    <span className="icons icon_placement">
                                                        <img
                                                            src="icons/date.svg"
                                                            alt="Select Consumer Type"
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                    {advancedOptions.billUpdate
                                        .bulkSelection === 'byAmount' && (
                                            <div className={styles.amount_range}>
                                                <div className={styles.search_cont}>
                                                    <input
                                                        type="number"
                                                        placeholder="Minimum Amount"
                                                        value={
                                                            advancedOptions
                                                                .billUpdate
                                                                .minAmount
                                                        }
                                                        onChange={(e) =>
                                                            onAdvancedOptionChange(
                                                                'billUpdate',
                                                                'minAmount',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <span className="icons icon_placement">
                                                        <img
                                                            src="icons/minimum.svg"
                                                            alt="Select Consumer Type"
                                                        />
                                                    </span>
                                                </div>
                                                <div className={styles.search_cont}>
                                                    <input
                                                        type="number"
                                                        placeholder="Maximum Amount"
                                                        value={
                                                            advancedOptions
                                                                .billUpdate
                                                                .maxAmount
                                                        }
                                                        onChange={(e) =>
                                                            onAdvancedOptionChange(
                                                                'billUpdate',
                                                                'maxAmount',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <span className="icons icon_placement">
                                                        <img
                                                            src="icons/maximum.svg"
                                                            alt="Select Consumer Type"
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Enter Invoice Number"
                                    className={styles.text_input}
                                    value={
                                        advancedOptions.billUpdate.invoiceNumber
                                    }
                                    onChange={(e) =>
                                        onAdvancedOptionChange(
                                            'billUpdate',
                                            'invoiceNumber',
                                            e.target.value
                                        )
                                    }
                                />
                            )}

                            <div className={styles.search_cont}>
                                <select
                                    value={advancedOptions.billUpdate.newStatus}
                                    onChange={(e) =>
                                        onAdvancedOptionChange(
                                            'billUpdate',
                                            'newStatus',
                                            e.target.value
                                        )
                                    }
                                    className={styles.select_input}>
                                    <option value="">Select Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                                <span className="arrow_icon arrowicon_placement">
                                    <img
                                        src="icons/arrow-down.svg"
                                        alt="Select Consumer Type"
                                    />
                                </span>
                            </div>
                            <Buttons
                                label="Update Status"
                                variant="primary"
                                onClick={onUpdateBillStatus}
                                disabled={loading}
                                icon="icons/update.svg"
                                iconPosition="left"
                            />
                        </form>
                    </div>

                    <div
                        className={`${styles.tab_content} ${activeTab === 'reminders' ? styles.active : ''
                            }`}>
                        <form className={styles.form_container}>
                            <div className={styles.reminder_options}>
                                <div className={styles.toggle_container}>
                                    <span className={styles.label}>
                                        Select Mode:
                                    </span>
                                    <div
                                        className={styles.toggle_buttons}
                                        data-state={
                                            advancedOptions.reminder.type ===
                                                'individual'
                                                ? 'right'
                                                : 'left'
                                        }>
                                        <button
                                            type="button"
                                            className={`${styles.toggle_btn} ${advancedOptions.reminder
                                                    .type === 'bulk'
                                                    ? styles.active
                                                    : ''
                                                }`}
                                            onClick={() =>
                                                onAdvancedOptionChange(
                                                    'reminder',
                                                    'type',
                                                    'bulk'
                                                )
                                            }
                                            autoFocus>
                                            Bulk
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.toggle_btn} ${advancedOptions.reminder
                                                    .type === 'individual'
                                                    ? styles.active
                                                    : ''
                                                }`}
                                            onClick={() =>
                                                onAdvancedOptionChange(
                                                    'reminder',
                                                    'type',
                                                    'individual'
                                                )
                                            }>
                                            Single
                                        </button>
                                    </div>
                                </div>

                                {advancedOptions.reminder.type === 'bulk' ? (
                                    <div className={styles.filter_options}>
                                        <div className={styles.search_cont}>
                                            <select
                                                value={
                                                    advancedOptions.reminder
                                                        .bulkSelection
                                                }
                                                onChange={(e) =>
                                                    onAdvancedOptionChange(
                                                        'reminder',
                                                        'bulkSelection',
                                                        e.target.value
                                                    )
                                                }
                                                className={styles.select_input}>
                                                <option value="">
                                                    Filter Recipients By
                                                </option>
                                                <option value="allPending">
                                                    All Pending Bills
                                                </option>
                                                <option value="overdue">
                                                    All Overdue Bills
                                                </option>
                                                <option value="consumerType">
                                                    Consumer Type
                                                </option>
                                            </select>
                                            <span className="arrow_icon arrowicon_placement">
                                                <img
                                                    src="icons/arrow-down.svg"
                                                    alt="Select Consumer Type"
                                                />
                                            </span>
                                        </div>
                                        {advancedOptions.reminder
                                            .bulkSelection ===
                                            'consumerType' && (
                                                <div className={styles.search_cont}>
                                                    <select
                                                        value={
                                                            advancedOptions.reminder
                                                                .consumerType
                                                        }
                                                        onChange={(e) =>
                                                            onAdvancedOptionChange(
                                                                'reminder',
                                                                'consumerType',
                                                                e.target.value
                                                            )
                                                        }
                                                        className={
                                                            styles.select_input
                                                        }>
                                                        <option value="">
                                                            Select Consumer Type
                                                        </option>
                                                        <option value="residential">
                                                            Residential
                                                        </option>
                                                        <option value="commercial">
                                                            Commercial
                                                        </option>
                                                        <option value="industrial">
                                                            Industrial
                                                        </option>
                                                        <option value="government">
                                                            SEZ
                                                        </option>
                                                    </select>
                                                    <span className="arrow_icon arrowicon_placement">
                                                        <img
                                                            src="icons/arrow-down.svg"
                                                            alt="Select Consumer Type"
                                                        />
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Enter Invoice Number"
                                        className={styles.text_input}
                                        value={
                                            advancedOptions.reminder
                                                .invoiceNumber
                                        }
                                        onChange={(e) =>
                                            onAdvancedOptionChange(
                                                'reminder',
                                                'invoiceNumber',
                                                e.target.value
                                            )
                                        }
                                    />
                                )}

                                <div className={styles.search_cont}>
                                    <select
                                        value={
                                            advancedOptions.reminder
                                                .notificationType
                                        }
                                        onChange={(e) =>
                                            onAdvancedOptionChange(
                                                'reminder',
                                                'notificationType',
                                                e.target.value
                                            )
                                        }
                                        className={styles.select_input}>
                                        <option value="">
                                            Notification Method
                                        </option>
                                        <option value="sms">SMS</option>
                                        <option value="email">Email</option>
                                        <option value="both">
                                            Both SMS & Email
                                        </option>
                                        <option value="sms">
                                            Consumer Preference
                                        </option>
                                    </select>
                                    <span className="arrow_icon arrowicon_placement">
                                        <img
                                            src="icons/arrow-down.svg"
                                            alt="Select Consumer Type"
                                        />
                                    </span>
                                </div>

                                <Buttons
                                    label="Send Reminders"
                                    variant="primary"
                                    onClick={onSendBulkReminders}
                                    disabled={loading}
                                    icon="icons/send-reminder.svg"
                                    iconPosition="left"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilter;
