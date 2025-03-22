import { useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import Logo from '../components/ui/Logo/Logo';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Sidebar = ({ setMainTitle }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const location = useLocation();
    const accessToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessTokenDuplicate='))
        ?.split('=')[1];

    let userRole = 'User';
    let locationHierarchy = 0;

    if (accessToken) {
        try {
            const decoded = jwtDecode(accessToken);
            userRole =
                decoded.role || decoded.Role || decoded.user_role || 'User';
            locationHierarchy = decoded.locationHierarchy || 0;

            if (userRole.toLowerCase().includes('admin')) {
                userRole = 'Admin';
            } else {
                userRole = 'User';
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            userRole = 'User';
            locationHierarchy = 0;
        }
    }

    const menuItems = [
        // Admin Menu Items
        {
            title: 'Dashboard',
            icon: 'icons/dashboard.svg',
            link: '/admin/dashboard',
            roles: ['Admin', 'Super Admin', 'User'],
        },
        {
            title: 'Units',
            icon: 'icons/units.svg',
            link: '/admin/units',
            roles: ['Admin', 'Super Admin', 'User'],
        },
        {
            title: 'Tickets',
            icon: 'icons/customer-service.svg',
            link: '/admin/tickets',
            roles: ['Admin', 'Super Admin', 'User'],
        },
        {
            title: 'Account',
            icon: 'icons/account.svg',
            link: '/admin/account',
            roles: ['Admin', 'Super Admin', 'User'],
        },
        {
            title: 'Emulate',
            icon: 'icons/meter-bolt.svg',
            link: '/admin/emulate',
            roles: ['Admin', 'Super Admin'],
            requiredHierarchy: 8,
        },
    ];

    const filteredMenuItems = menuItems.filter((item) => {
        const hasRoleAccess = item.roles.includes(userRole);

        if (item.title === 'Emulate') {
            return (
                hasRoleAccess && locationHierarchy === item.requiredHierarchy
            );
        }

        return hasRoleAccess;
    });

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    const handleClick = () => {
        setShowDeleteModal((prevState) => !prevState);
    };

    return (
        <div className={styles.sidebar_cont}>
            <div className={styles.top_navmenu}>
                <div className="logo">
                    <Logo width={170} />
                </div>

                <img
                    src="icons/hamburger.svg"
                    alt="Hamburger Icon"
                    className={styles.hamburger_menu_icon}
                    onClick={handleClick}
                />

                <div
                    className={`${styles.navmenu_cont} ${showDeleteModal ? styles.show : ''
                        }`}>
                    {filteredMenuItems.map((menuItem, index) => (
                        <Link
                            to={menuItem.link}
                            key={index}
                            className={`${styles.navmenu_item} ${isActiveRoute(menuItem.link)
                                ? styles.active
                                : ''
                                }`}
                            onClick={() => {
                                setMainTitle(menuItem.title);
                            }}>
                            <span className="icons">
                                <img src={menuItem.icon} alt={menuItem.title} />
                            </span>
                            <span>{menuItem.title}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div
                className={`${styles.modalFullScreen} ${showDeleteModal ? styles.show : ''
                    }`}>
                <div className={styles.modalContent}>
                    <div className={styles.modal_navmenu_cont}>
                        <div className={styles.bills_cont}>
                            <img
                                src="icons/hamburger.svg"
                                onClick={handleClick}
                            />
                        </div>
                        {filteredMenuItems.map((menuItem, index) => (
                            <Link
                                to={menuItem.link}
                                key={index}
                                className={`${styles.bills_cont} ${isActiveRoute(menuItem.link)
                                    ? styles.active
                                    : ''
                                    }`}>
                                <span>{menuItem.title}</span>
                                <span className="icons">
                                    <img
                                        src={menuItem.icon}
                                        alt={menuItem.title}
                                    />
                                </span>
                            </Link>
                        ))}
                        <div className={styles.bottom_modal_menu}>
                            <div className={styles.bottom_accmenu}></div>
                            <div className="version_number">VERSION 2.0.3</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.bottom_navmenu}>
                <div className={styles.bottom_accmenu}>
                    <div className="client-info">Client Info</div>
                    <div className={styles.bottom_logo_cont}>
                        <img
                            src="images/bi-logo.png"
                            alt="Logo"
                            className={styles.bottom_logo}
                        />
                    </div>
                </div>
                <div className="version_number">VERSION 2.0.3</div>
            </div>
        </div>
    );
};

export default Sidebar;
