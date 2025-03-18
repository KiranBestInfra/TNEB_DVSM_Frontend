import { Outlet } from 'react-router-dom';
import LoginSlider from '../components/ui/LoginSlider/LoginSlider';
import Login from '../pages/Login';
import styles from '../styles/AuthLayout.module.css';
import { useState } from 'react';
import Buttons from '../components/ui/Buttons/Buttons';

// Simple placeholder components for Terms and Privacy
const TermsPlaceholder = () => (
    <div style={{ padding: '20px' }}>
        <h2>Terms and Conditions</h2>
        <p>This is a placeholder for the Terms and Conditions.</p>
        <p>The detailed terms document has been removed in the streamlined application.</p>
    </div>
);

const PrivacyPlaceholder = () => (
    <div style={{ padding: '20px' }}>
        <h2>Privacy Policy</h2>
        <p>This is a placeholder for the Privacy Policy.</p>
        <p>The detailed privacy policy document has been removed in the streamlined application.</p>
    </div>
);

const AuthLayout = ({ children }) => {
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    const handleTermsClick = (e) => {
        e.preventDefault();
        setShowTerms(true);
    };

    const handlePrivacyClick = (e) => {
        e.preventDefault();
        setShowPrivacy(true);
    };

    const handleModalClose = () => {
        setShowTerms(false);
        setShowPrivacy(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === styles.modal_overlay) {
            setShowTerms(false);
            setShowPrivacy(false);
        }
    };

    const ModalHeader = ({ title, date }) => (
        <div className={styles.modal_header}>
            <div>
                <h1 className="title">{title}</h1>
            </div>
            <div className={styles.modal_close}>
                <p className="sub_title">Effective Date: {date}</p>
                <Buttons
                    label="Accept"
                    onClick={() => {
                        window.location.href = '/bi/auth/login';
                    }}
                    variant="primarysmall"
                    alt="Accept"
                />
                <span className="icons" onClick={handleModalClose}>
                    <img src="icons/close.svg" alt="close" />
                </span>
            </div>
        </div>
    );

    return (
        <div className="main_container">
            <div className={styles.main_auth_layout}>
                <div className={styles.slider_container}>
                    <LoginSlider />
                </div>
                <div className={styles.form_placeholder}>
                    <div className={styles.form_header}>
                        <div className={styles.form_headlink}>
                            <div>
                                <span className="icons_white">
                                    <img src="icons/arrow-left.svg" />
                                </span>
                            </div>
                            <div>
                                <a href="/">
                                    Back to Website
                                </a>
                            </div>
                        </div>
                        <div className={styles.form_closeicon}>
                            <span className="icons_white">
                                <img src="icons/close.svg" />
                            </span>
                        </div>
                    </div>
                    <div className={styles.form_body_cont}>
                        <Outlet />
                    </div>
                    <div className={styles.form_footer}>
                        <div className={styles.form_support}>
                            Need Help?{' '}
                            <a href="/">
                                Contact Support
                            </a>
                        </div>
                        <div className={styles.form_footlink}>
                            <a href="#" onClick={handleTermsClick}>
                                Terms of Service
                            </a>
                            <a href="#" onClick={handlePrivacyClick}>
                                Privacy Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {showTerms && (
                <div
                    className={styles.modal_overlay}
                    onClick={handleOverlayClick}>
                    <div className={styles.modal_content}>
                        <ModalHeader
                            title="Terms and Conditions"
                            date="January 1, 2024"
                        />
                        <TermsPlaceholder />
                    </div>
                </div>
            )}

            {showPrivacy && (
                <div
                    className={styles.modal_overlay}
                    onClick={handleOverlayClick}>
                    <div className={styles.modal_content}>
                        <ModalHeader
                            title="Privacy Policy"
                            date="January 1, 2024"
                        />
                        <PrivacyPlaceholder />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthLayout;
