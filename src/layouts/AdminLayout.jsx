import { Outlet } from 'react-router-dom';
import '../global.css';
import styles from '../styles/AdminLayout.module.css';
import Header from './Header';
import Sidebar from './Sidebar';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
    const [mainTitle, setMainTitle] = useState('Dashboard');
    return (
        <div className="main_container">
            <div className={styles.main_admin_layout}>
                <div className={styles.sidebar_container}>
                    <Sidebar setMainTitle={setMainTitle} />
                </div>
                <div className={styles.header_placeholder}>
                    <Header title={mainTitle} />
                </div>
                <div className={styles.content_placeholder}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
