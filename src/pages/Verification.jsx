import { useState, useEffect } from 'react';
import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Login.module.css';

const Verification = () => {
    const [step, setStep] = useState('otp');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(120); // Changed to 120 seconds (2 minutes)
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (timer > 0 && !canResend) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, canResend]);

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        const inputs = [...e.target.querySelectorAll('input[name^="otp"]')];
        const otp = inputs.map((input) => input.value).join('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            // Simulating API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setError('');
            setStep('newPassword');
        } catch (err) {
            setError('Invalid OTP. Please try again.');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const newPassword = e.target.newPassword.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError(
                'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
            );
            return;
        }

        try {
            // Simulating API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setError('');
            setSuccess('Password successfully reset!');
            setTimeout(() => {
                window.location.href = '/auth/login';
            }, 2000);
        } catch (err) {
            setError('Failed to reset password. Please try again.');
        }
    };

    const handleResendOTP = async () => {
        try {
            // Simulating API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setTimer(120); // Reset to 2 minutes
            setCanResend(false);
            setError('');
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        }
    };

    const handleInputChange = (e, nextInputName) => {
        if (e.target.value) {
            const nextInput = e.target.parentElement.querySelector(
                `input[name=${nextInputName}]`
            );
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (e, prevInputName) => {
        if (e.key === 'Backspace' && !e.target.value) {
            const prevInput = e.target.parentElement.querySelector(
                `input[name=${prevInputName}]`
            );
            if (prevInput) prevInput.focus();
        }
    };

    return (
        <div className={styles.login_container}>
            <div className="logo">
                <div>Logo</div>
            </div>
            <div className="title">
                {step === 'otp' ? 'OTP Verification' : 'Create New Password'}
            </div>
            {step === 'otp' ? (
                <form
                    className={styles.form_login_cont}
                    onSubmit={handleOTPSubmit}>
                    {error && (
                        <div className={styles.error_message}>{error}</div>
                    )}
                    <div className={styles.message}>
                        <p>Enter the verification code sent to your email</p>
                        {!canResend && <p>Resend code in {timer}s</p>}
                    </div>
                    <div>
                        <div className={styles.otp_inputs}>
                            {[1, 2, 3, 4, 5, 6].map((num, index) => (
                                <input
                                    key={num}
                                    type="text"
                                    maxLength="1"
                                    pattern="[0-9]"
                                    required
                                    name={`otp${num}`}
                                    placeholder="0"
                                    autoFocus={num === 1}
                                    onChange={(e) =>
                                        handleInputChange(e, `otp${num + 1}`)
                                    }
                                    onKeyDown={(e) =>
                                        handleKeyDown(e, `otp${num - 1}`)
                                    }
                                />
                            ))}
                        </div>
                    </div>
                    <div className={styles.verify_btn}>
                        {!canResend ? (
                            <Buttons
                                label="Verify OTP"
                                variant="primary"
                                alt="Verify OTP"
                                type="submit"
                            />
                        ) : (
                            <Buttons
                                label="Resend OTP"
                                variant="primary"
                                alt="Resend OTP"
                                onClick={handleResendOTP}
                                type="button"
                            />
                        )}
                    </div>
                </form>
            ) : (
                <form
                    className={styles.form_login_cont}
                    onSubmit={handlePasswordSubmit}>
                    {error && (
                        <div className={styles.error_message}>{error}</div>
                    )}
                    {success && (
                        <div className={styles.success_message}>{success}</div>
                    )}
                    <div>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            required
                            placeholder="New Password"
                            minLength="8"
                            autoFocus
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            placeholder="Confirm New Password"
                            minLength="8"
                        />
                    </div>
                    <div className={styles.password_rules}>
                        <p>Password should contain below:</p>
                        <ul>
                            <li>At least 8 characters</li>
                            <li>One uppercase letter</li>
                            <li>One lowercase letter</li>
                            <li>One number</li>
                            <li>One special character</li>
                        </ul>
                    </div>
                    <Buttons
                        label="Reset Password"
                        variant="primary"
                        alt="Reset Password"
                        type="submit"
                    />
                </form>
            )}
        </div>
    );
};

export default Verification;
