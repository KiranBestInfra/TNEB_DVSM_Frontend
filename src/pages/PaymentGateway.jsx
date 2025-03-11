import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import styles from '../styles/PaymentGateway.module.css';

const PaymentGateway = () => {
    const { invoiceNo } = useParams();
    const navigate = useNavigate();
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
                navigate(`/payment/success/${invoiceNo}`);
            } else {
                navigate(`/payment/failure/${invoiceNo}`);
            }
        } catch (err) {
            setError('Payment processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.main_cont}>
            <div className={styles.card}>
                <div className={styles.title}>Payment Gateway</div>
                <div className={styles.sub_title}>Invoice No: {invoiceNo}</div>

                {error && (
                    <div className={styles.error}>
                        <span className="error_icon">
                            <img src="/icons/error-mark.svg" alt="error" />
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
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className={styles.cancel_button}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submit_button}
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentGateway; 