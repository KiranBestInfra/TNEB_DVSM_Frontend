import { useState } from 'react';
import styles from './PaymentModal.module.css';
import { apiClient } from '../../../api/client';
import Buttons from '../Buttons/Buttons';

const PaymentModal = ({ invoiceNo, amount, onClose, onSuccess, onFailure }) => {
    const [loading, setLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Here you would integrate with your actual payment gateway
            const response = await apiClient.post(`/bills/payment/${invoiceNo}`, paymentDetails);

            if (response.success) {
                onSuccess(invoiceNo);
            } else {
                onFailure(invoiceNo);
            }
        } catch (err) {
            setError('Payment processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modal_overlay}>
            <div className={styles.modal_content}>
                <div className={styles.modal_header}>
                    <h2 className={styles.title}>Payment Gateway</h2>
                    <span className="icons" onClick={onClose}>
                        <img src="icons/close.svg" alt="close" />
                    </span>
                </div>

                <div className={styles.sub_title}>Invoice No: {invoiceNo}</div>
                <div className={styles.sub_title}>Amount: ₹{amount}</div>

                {error && (
                    <div className={styles.error}>
                        <span className="error_icon">
                            <img src="icons/error-mark.svg" alt="error" />
                        </span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.form_row}>
                        <div className={styles.form_group}>
                            <input
                                type="text"
                                name="cardNumber"
                                placeholder="Card Number"
                                value={paymentDetails.cardNumber}
                                onChange={handleInputChange}
                                maxLength="16"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.form_row}>
                        <div className={styles.form_group}>
                            <input
                                type="text"
                                name="cardHolder"
                                placeholder="Card Holder Name"
                                value={paymentDetails.cardHolder}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.form_row}>
                        <div className={styles.form_group}>
                            <input
                                type="text"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={paymentDetails.expiryDate}
                                onChange={handleInputChange}
                                maxLength="5"
                                required
                            />
                        </div>
                        <div className={styles.form_group}>
                            <input
                                type="password"
                                name="cvv"
                                placeholder="CVV"
                                value={paymentDetails.cvv}
                                onChange={handleInputChange}
                                maxLength="3"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.form_actions}>
                        <Buttons
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            label="Cancel"
                        />
                        <Buttons
                            type="submit"
                            disabled={loading}
                            variant="primary"
                            label={loading ? 'Processing...' : 'Pay Now'}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal; 