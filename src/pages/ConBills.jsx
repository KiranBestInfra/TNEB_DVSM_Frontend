import { useState, useEffect } from 'react';
import styles from '../styles/ConBills.module.css';
import { FaFileDownload, FaBell, FaWallet, FaEdit } from 'react-icons/fa';
import Buttons from '../components/ui/Buttons/Buttons';
import Tabs from '../components/ui/Tabs/Tabs';
import Table from '../components/ui/Table/Tables';
import PaymentModal from '../components/ui/Modal/PaymentModal';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

const ConBills = () => {
    const navigate = useNavigate();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [billHistory, setBillHistory] = useState([
        {
            created_at: 'March 2024',
            invoice_id: 'INV001',
            bill_date: '2024-03-01',
            due_date: '2024-03-15',
            status: 'pending',
            consumption: 500,
            amount: 4250,
        },
        {
            created_at: 'February 2024',
            invoice_id: 'INV002',
            bill_date: '2024-02-01',
            due_date: '2024-02-15',
            status: 'paid',
            consumption: 450,
            amount: 3825,
        },
    ]);

    const consumerData = {
        name: 'John Doe',
        consumerNumber: 'CON123456',
        address: '123 Energy Street, Power City',
        mobile: '+1 234-567-8900',
        email: 'john.doe@example.com',
        connectionStatus: 'Active',
    };

    const billData = {
        billNumber: 'BILL789012',
        billMonth: 'March 2024',
        periodFrom: '01/03/2024',
        periodTo: '31/03/2024',
        generationDate: '01/04/2024',
        dueDate: '15/04/2024',
        status: 'Pending',
        pendingAmount: '₹2,500',
    };

    const billBreakdown = [
        {
            type: 'Energy Charges',
            rate: '₹8.50/kWh',
            consumption: '500 kWh',
            amount: '₹4,250',
        },
    ];

    const handleDownloadPDF = () => {
        // Implement PDF download logic
    };

    const handleSendReminder = () => {
        // Implement reminder sending logic
    };

    const handlePaymentSuccess = (invoiceNo) => {
        setShowPaymentModal(false);
        navigate(`/payment/success/${invoiceNo}`);
    };

    const handlePaymentFailure = (invoiceNo) => {
        setShowPaymentModal(false);
        navigate(`/payment/failure/${invoiceNo}`);
    };

    const handleDownloadBill = (invoiceId) => {
        // Implement bill download logic
        console.log(`Downloading bill for invoice: ${invoiceId}`);
    };

    const handleViewBill = (invoiceId) => {
        // Implement bill view logic
        console.log(`Viewing bill for invoice: ${invoiceId}`);
    };

    async function fetchBill() {
        try {
            const response = await apiClient.get('/billing');
            console.log(response)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchBill();
    }, []);

    const renderBillDetailsTab = () => (
        <div className={styles.tabContent}>
            {/* Consumer Details Section */}
            <div className={styles.section}>
                <h2>Your Information</h2>
                <div className={styles.consumerDetails}>
                    <div className={styles.detailGroup}>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Consumer Name:</span>
                            <span className={styles.value}>
                                {consumerData.name}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>
                                Consumer Number:
                            </span>
                            <span className={styles.value}>
                                {consumerData.consumerNumber}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Address:</span>
                            <span className={styles.value}>
                                {consumerData.address}
                            </span>
                        </div>
                    </div>
                    <div className={styles.detailGroup}>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Mobile:</span>
                            <span className={styles.value}>
                                {consumerData.mobile}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>
                                {consumerData.email}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.label}>
                                Connection Status:
                            </span>
                            <span
                                className={`${styles.value} ${styles.status}`}>
                                {consumerData.connectionStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill Summary Section */}
            <div className={styles.section}>
                <h2>Bill Summary</h2>
                <div className={styles.billSummary}>
                    <div className={styles.summaryGroup}>
                        <div className={styles.summaryItem}>
                            <span className={styles.label}>Bill Number:</span>
                            <span className={styles.value}>
                                {billData.billNumber}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.label}>Bill Month:</span>
                            <span className={styles.value}>
                                {billData.billMonth}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.label}>
                                Billing Period:
                            </span>
                            <span
                                className={
                                    styles.value
                                }>{`${billData.periodFrom} to ${billData.periodTo}`}</span>
                        </div>
                    </div>
                    <div className={styles.summaryGroup}>
                        <div className={styles.summaryItem}>
                            <span className={styles.label}>
                                Generation Date:
                            </span>
                            <span className={styles.value}>
                                {billData.generationDate}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.label}>Due Date:</span>
                            <span className={styles.value}>
                                {billData.dueDate}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.label}>Status:</span>
                            <span
                                className={`${styles.value} ${
                                    styles[billData.status.toLowerCase()]
                                }`}>
                                {billData.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill Breakdown Section */}
            <div className={styles.section}>
                <h2>Bill Breakdown</h2>
                <div className={styles.billBreakdown}>
                    <table className={styles.breakdownTable}>
                        <thead>
                            <tr>
                                <th>Charge Type</th>
                                <th>Tariff Rate</th>
                                <th>Consumption</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billBreakdown.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.type}</td>
                                    <td>{item.rate}</td>
                                    <td>{item.consumption}</td>
                                    <td>{item.amount}</td>
                                </tr>
                            ))}
                            <tr
                                className={`${styles.totalRow} ${styles.pendingRow}`}>
                                <td colSpan="3">Previous Pending Amount</td>
                                <td>{billData.pendingAmount}</td>
                            </tr>
                            <tr
                                className={`${styles.totalRow} ${styles.grandTotal}`}>
                                <td colSpan="3">Grand Total</td>
                                <td>₹6,750</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderBillHistoryTab = () => (
        <div className={styles.tabContent}>
            <div className={styles.section}>
                <div className={styles.billBreakdown}>
                    <Table
                        data={billHistory}
                        columns={[
                            { key: 'created_at', label: 'Billing Month' },
                            { key: 'invoice_id', label: 'Invoice No' },
                            {
                                key: 'bill_date',
                                label: 'Bill Date',
                                render: (value) =>
                                    new Date(value).toLocaleDateString(),
                            },
                            {
                                key: 'due_date',
                                label: 'Due Date',
                                render: (value) =>
                                    new Date(value).toLocaleDateString(),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (status) => {
                                    const statusMap = {
                                        paid: (
                                            <span
                                                className={styles.status_paid}>
                                                Paid
                                            </span>
                                        ),
                                        pending: (
                                            <span
                                                className={
                                                    styles.status_pending
                                                }>
                                                Pending
                                            </span>
                                        ),
                                        overdue: (
                                            <span
                                                className={
                                                    styles.status_overdue
                                                }>
                                                Overdue
                                            </span>
                                        ),
                                        partiallyPaid: (
                                            <span
                                                className={
                                                    styles.status_partially_paid
                                                }>
                                                Partially Paid
                                            </span>
                                        ),
                                    };
                                    return (
                                        statusMap[status.toLowerCase()] ||
                                        status
                                    );
                                },
                            },
                            {
                                key: 'consumption',
                                label: 'Consumption',
                                render: (value) =>
                                    `${value.toLocaleString()} kWh`,
                            },
                            {
                                key: 'amount',
                                label: 'Amount',
                                render: (value) => `₹${value.toLocaleString()}`,
                            },
                            {
                                key: 'actions',
                                label: 'Actions',
                                render: (_, row) => (
                                    <div className={styles.actionButtons}>
                                        <span
                                            onClick={() =>
                                                handleDownloadBill(
                                                    row.invoice_id
                                                )
                                            }
                                            title="Download Bill">
                                            <img
                                                src="icons/download-arrow.svg"
                                                alt="Download"
                                            />
                                        </span>
                                        <span
                                            onClick={() =>
                                                handleViewBill(row.invoice_id)
                                            }
                                            title="View Bill">
                                            <img
                                                src="icons/eye.svg"
                                                alt="View"
                                            />
                                        </span>
                                    </div>
                                ),
                            },
                        ]}
                        searchable={true}
                        sortable={true}
                        emptyMessage="No billing history available"
                        customStyles={styles}
                    />
                </div>
            </div>
        </div>
    );

    const tabContent = [
        {
            label: 'Bill Amount',
            content: renderBillDetailsTab(),
        },
        {
            label: 'Bill History',
            content: renderBillHistoryTab(),
        },
    ];

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
                <h1 className="title">Bill Details</h1>
                <div className={styles.quickActions}>
                    <Buttons
                        label="Download PDF"
                        icon={<FaFileDownload />}
                        onClick={handleDownloadPDF}
                    />
                    <Buttons
                        label="Make Payment"
                        icon={<FaWallet />}
                        onClick={() => setShowPaymentModal(true)}
                    />
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs
                tabs={tabContent}
                defaultTab={0}
                onTabChange={(index) =>
                    setActiveTab(index === 0 ? 'details' : 'history')
                }
            />

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    invoiceNo={billData.billNumber}
                    amount={billData.pendingAmount
                        .replace('₹', '')
                        .replace(',', '')}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                />
            )}
        </div>
    );
};

export default ConBills;
