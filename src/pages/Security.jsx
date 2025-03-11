import { useState } from 'react';
import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Account.module.css';
import { useNavigate } from 'react-router-dom';

const Security = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([
        {
            id: 1,
            name: 'Windows PC',
            lastActive: '2024-01-15 14:30',
            location: 'New York, US',
            browser: 'Chrome',
        },
        {
            id: 2,
            name: 'iPhone 13',
            lastActive: '2024-01-15 15:45',
            location: 'New York, US',
            browser: 'Safari',
        },
    ]);

    const [sessions, setSessions] = useState([
        {
            id: 1,
            device: 'Chrome Browser',
            ip: '192.168.1.1',
            lastActive: '2024-01-15 16:00',
            status: 'Active',
        },
        {
            id: 2,
            device: 'Safari Browser',
            ip: '192.168.1.2',
            lastActive: '2024-01-15 15:30',
            status: 'Active',
        },
    ]);

    const [recoveryOptions, setRecoveryOptions] = useState({
        email: true,
        phone: false,
        authenticator: false,
        securityQuestions: false,
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const navigateTo = (path) => {
        if (hasUnsavedChanges) {
            if (
                window.confirm(
                    'You have unsaved changes. Are you sure you want to leave?'
                )
            ) {
                navigate(path);
            }
        } else {
            navigate(path);
        }
    };

    const handleRemoveDevice = (deviceId) => {
        if (window.confirm('Are you sure you want to remove this device?')) {
            setDevices(devices.filter((device) => device.id !== deviceId));
            setHasUnsavedChanges(true);
        }
    };

    const handleEndSession = (sessionId) => {
        if (window.confirm('Are you sure you want to end this session?')) {
            setSessions(
                sessions.map((session) =>
                    session.id === sessionId
                        ? { ...session, status: 'Ended' }
                        : session
                )
            );
            setHasUnsavedChanges(true);
        }
    };

    const handleRecoveryOptionChange = (option) => {
        setRecoveryOptions((prev) => ({
            ...prev,
            [option]: !prev[option],
        }));
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        // Here you would typically make an API call to save changes
        setHasUnsavedChanges(false);
        navigate(' /');
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.security_content}>
                <section className={styles.security_section}>
                    <h2 className="title_account">Authorized Devices</h2>
                    <div className={styles.devices_list}>
                        {devices.map((device) => (
                            <div key={device.id} className={styles.device_item}>
                                <div className={styles.device_info}>
                                    <h3>{device.name}</h3>
                                    <p>Browser: {device.browser}</p>
                                    <p>Last active: {device.lastActive}</p>
                                    <p>Location: {device.location}</p>
                                </div>
                                <Buttons
                                    label="Remove"
                                    variant="outline"
                                    alt="Remove Device"
                                    onClick={() =>
                                        handleRemoveDevice(device.id)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.security_section}>
                    <h2 className="title_account">Active Sessions</h2>
                    <div className={styles.devices_list}>
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={styles.device_item}>
                                <div className={styles.device_info}>
                                    <h3>{session.device}</h3>
                                    <p>IP Address: {session.ip}</p>
                                    <p>Last active: {session.lastActive}</p>
                                    <p>
                                        Status:{' '}
                                        <span
                                            className={
                                                session.status === 'Active'
                                                    ? styles.active
                                                    : styles.ended
                                            }>
                                            {session.status}
                                        </span>
                                    </p>
                                </div>
                                <Buttons
                                    label="End Session"
                                    variant="outline"
                                    alt="End Session"
                                    onClick={() => handleEndSession(session.id)}
                                    disabled={session.status === 'Ended'}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.security_section}>
                    <h2 className="title_account">Password Recovery Options</h2>
                    <div className={styles.recovery_options}>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={recoveryOptions.email}
                                    onChange={() =>
                                        handleRecoveryOptionChange('email')
                                    }
                                />
                                Email Recovery
                            </label>
                            <p>Recover using your verified email address</p>
                        </div>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={recoveryOptions.phone}
                                    onChange={() =>
                                        handleRecoveryOptionChange('phone')
                                    }
                                />
                                Phone Recovery
                            </label>
                            <p>Recover using your verified phone number</p>
                        </div>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={recoveryOptions.authenticator}
                                    onChange={() =>
                                        handleRecoveryOptionChange(
                                            'authenticator'
                                        )
                                    }
                                />
                                Authenticator App
                            </label>
                            <p>Use an authenticator app for recovery</p>
                        </div>
                        <div className={styles.option_item}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={recoveryOptions.securityQuestions}
                                    onChange={() =>
                                        handleRecoveryOptionChange(
                                            'securityQuestions'
                                        )
                                    }
                                />
                                Security Questions
                            </label>
                            <p>
                                Set up security questions for account recovery
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Security;
