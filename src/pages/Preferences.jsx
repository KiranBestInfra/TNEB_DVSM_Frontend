import { useState } from 'react';
import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Account.module.css';
import { useNavigate } from 'react-router-dom';

const Preferences = () => {
    const navigate = useNavigate();
    const [communicationPrefs, setCommunicationPrefs] = useState({
        email: true,
        sms: true,
        app: true,
    });

    const [notificationPrefs, setNotificationPrefs] = useState({
        newsletters: true,
        promotions: true,
        systemUpdates: true,
    });

    const handleCommunicationChange = (method) => {
        setCommunicationPrefs((prev) => ({
            ...prev,
            [method]: !prev[method],
        }));
    };

    const handleNotificationChange = (type) => {
        setNotificationPrefs((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add save preferences logic here
        
    };

    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.preferences_container}>
                <section className={styles.preferences_section}>
                    <h2 className="title_account">Communication Preferences</h2>
                    <div className={styles.preferences_options}>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={communicationPrefs.email}
                                    onChange={() =>
                                        handleCommunicationChange('email')
                                    }
                                />
                                <span className="icons">
                                    <img
                                        src="icons/email.svg"
                                        alt="Email icon"
                                    />
                                </span>
                                Email
                            </label>
                            <p>Receive communications via email</p>
                        </div>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={communicationPrefs.sms}
                                    onChange={() =>
                                        handleCommunicationChange('sms')
                                    }
                                />
                                <span className="icons">
                                    <img src="icons/sms.svg" alt="SMS icon" />
                                </span>
                                SMS
                            </label>
                            <p>Receive communications via text message</p>
                        </div>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={communicationPrefs.app}
                                    onChange={() =>
                                        handleCommunicationChange('app')
                                    }
                                />
                                <span className="icons">
                                    <img src="icons/app.svg" alt="App icon" />
                                </span>
                                In-App
                            </label>
                            <p>Receive communications within the application</p>
                        </div>
                    </div>
                </section>

                <section className={styles.preferences_section}>
                    <h2 className="title_account">Notification Preferences</h2>
                    <div className={styles.preferences_options}>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notificationPrefs.newsletters}
                                    onChange={() =>
                                        handleNotificationChange('newsletters')
                                    }
                                />
                                <span className="icons">
                                    <img
                                        src="icons/email.svg"
                                        alt="Newsletter icon"
                                    />
                                </span>
                                Newsletters
                            </label>
                            <p>Receive our periodic newsletters</p>
                        </div>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notificationPrefs.promotions}
                                    onChange={() =>
                                        handleNotificationChange('promotions')
                                    }
                                />
                                <span className="icons">
                                    <img
                                        src="icons/promotions.svg"
                                        alt="Promotions icon"
                                    />
                                </span>
                                Promotions
                            </label>
                            <p>Receive promotional offers and updates</p>
                        </div>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={notificationPrefs.systemUpdates}
                                    onChange={() =>
                                        handleNotificationChange(
                                            'systemUpdates'
                                        )
                                    }
                                />
                                <span className="icons">
                                    <img
                                        src="icons/system-updates.svg"
                                        alt="System updates icon"
                                    />
                                </span>
                                System Updates
                            </label>
                            <p>
                                Receive important system updates and
                                announcements
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Preferences;
