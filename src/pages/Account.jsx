import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Account.module.css';
import { useNavigate } from 'react-router-dom';
import Tabs from '../components/ui/Tabs/Tabs';
import Profile from './Profile';
import Settings from './Settings';
import Preferences from './Preferences';
import Security from './Security';

const Account = () => {
    const navigate = useNavigate();

    const navigateTo = (path) => {
        navigate(path);
    };

    const tabs = [
        {
            label: 'Profile',
            content: (
                <div>
                    <Profile />
                </div>
            ),
        },
        {
            label: 'Settings',
            content: (
                <div>
                    <Settings />
                </div>
            ),
        },
        {
            label: 'Preferences',
            content: (
                <div>
                    <Preferences />
                </div>
            ),
        },
        {
            label: 'Security',
            content: (
                <div>
                    <Security />
                </div>
            ),
        },
    ];

    return (
        <div className={styles.main_content}>
            <div className="adminheader">
                <h1 className="title">Account</h1>
                <div className="header_actions">
                    <Buttons
                        label="Cancel"
                        variant="outline"
                        alt="Tariff"
                        icon="icons/cancel.svg"
                        iconPosition="left"
                        onClick={() => navigateTo('/tariff')}
                    />
                    <Buttons
                        label="Save"
                        variant="primary"
                        alt="Reports"
                        icon="icons/save.svg"
                        iconPosition="left"
                        onClick={() => navigateTo('/reports')}
                    />
                </div>
            </div>

            <Tabs tabs={tabs} defaultTab={0} />
        </div>
    );
};

export default Account;
