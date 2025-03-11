import { useState } from 'react';
import Buttons from "../components/ui/Buttons/Buttons";
import styles from "../styles/Account.module.css";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add password change logic here
    };

    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.settings_container}>
                <div>
                    <h2 className='title_account'>Change Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='form_row'>
                        <div className="form_group">
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Current Password"
                                required
                            />
                        </div>
                        </div>
                        <div className="form_row">
                        <div className="form_group">
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="New Password"
                                required
                            />
                        </div>
                        <div className="form_group">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>
                        </div>
                    </form>
                    </div>

                    <div>
                    <h2 className='title_account'>Integrated Accounts</h2>
                    <div className={styles.accounts_list}>
                        <div className={styles.account_item}>
                            
                            <span>Google Account</span>
                            <Buttons
                                label="Connect"
                                variant="outline"
                                alt="Connect Google"
                                onClick={() => {/* Add Google integration logic */}}
                            />
                        </div>
                        <div className={styles.account_item}>
                            
                            <span>Microsoft Account</span>
                            <Buttons
                                label="Connect" 
                                variant="outline"
                                alt="Connect Microsoft"
                                onClick={() => {/* Add Microsoft integration logic */}}
                            />
                        </div>
                    </div>
                    </div>
                
            </div>
        </div>
    );
};

export default Settings;
