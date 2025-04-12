import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Login.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setError('');
            setSuccess('Password reset instructions have been sent!');
            setTimeout(() => {
                navigate(' /auth/verification');
            }, 1500);
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.login_container}>
            <div className="logo">
                <div>Logo</div>
            </div>
            <div className="title">Forgot Password</div>
            {!success && (
                <p className={styles.message}>
                    Enter your details below to reset your password.
                </p>
            )}
            <form className={styles.form_login_cont} onSubmit={handleSubmit}>
                {error && <p className={styles.message}>{error}</p>}
                {success && <p className={styles.message}>{success}</p>}
                <div>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="Email Address"
                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                        title="Enter a valid email address"
                        autoFocus
                    />
                </div>
                <Buttons
                    label="Reset Password"
                    variant="primary"
                    alt="Reset Password"
                    type="submit"
                />
            </form>
        </div>
    );
};

export default ForgotPassword;
