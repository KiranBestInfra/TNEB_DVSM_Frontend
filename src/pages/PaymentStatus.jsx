import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/PaymentStatus.module.css';

const PaymentStatus = () => {
    const { invoiceNo } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isSuccess = location.pathname.includes('/success');

    return (
        <div className={styles.main_cont}>
            <div className={styles.card}>
                <div className={styles.icon_container}>
                    <span className="icons">
                        <img
                            src={isSuccess ? "/icons/progress-complete.svg" : "/icons/error-mark.svg"}
                            alt={isSuccess ? "Success" : "Failed"}
                            className={styles.icon}
                        />
                    </span>
                </div>

                <div className={styles.title}>
                    {isSuccess ? 'Payment Successful!' : 'Payment Failed!'}
                </div>

                <div className={styles.sub_title}>
                    Invoice No: {invoiceNo}
                    <br />
                    {isSuccess
                        ? 'Your payment has been processed successfully.'
                        : 'There was an error processing your payment. Please try again.'}
                </div>

                <div className="form_actions">
                    <button
                        onClick={() => navigate('/user/bills')}
                        className={styles.button}
                    >
                        Back to Bills
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus; 