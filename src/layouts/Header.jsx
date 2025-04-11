import { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../styles/Header.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import useDebounce from '../utils/debounce';
import Cookies from 'js-cookie';
import NotificationsPanel from '../components/NotificationsPanel/NotificationsPanel';
import { useAuth } from '../components/AuthProvider';

const Header = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] =
        useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAdmin } = useAuth();
    const basePath = isAdmin() ? '/admin' : '/user';

    const debouncedSearchTerm = useDebounce(searchQuery, 500);

    const { user } = useAuth();

    const profileData = {
        profilePicture: user?.profilePicture || null,
        firstName: user?.name || 'User',
        lastName: '',
    };

    // Check if the screen is mobile-sized
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Add event listener for window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const formattedTime = currentDateTime.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    const handleSearchChange = (e) => {
        const query = e.target.value;
        if (query.length === 0) {
            setSearchResults([]);
        }
        setSearchQuery(query);
    };

    const handleResultClick = (result) => {
        const { id, hierarchy_type_id, hierarchy_name, region } = result;
        let redirectPath = '';

        const formatName = (name) => {
            return name.toLowerCase().replace(/\s+/g, '-');
        };

        switch (hierarchy_type_id) {
            case 10: // Region
                redirectPath = `${basePath}/regions/${formatName(hierarchy_name)}/details`;
                break;
            case 11: 
                redirectPath = `${basePath}/${formatName(
                    region
                )}/edcs/${id}/details`;
                break;
            case 35: // Substation
                redirectPath = `${basePath}/${formatName(region)}/substations/${id}/details`;
                break;
            default:
                redirectPath = `${basePath}/details/${id}`;
        }

        navigate(redirectPath);
        setSearchQuery('');
        setSearchResults([]);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(`.${styles.search_cont}`)) {
                setSearchResults([]);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const clearCookies = () => {
        const cookies = ['accessToken', 'accessTokenDuplicate'];
        const domains = ['.lk-ea.co.in', 'lk-ea.co.in'];
        const paths = ['/', '/auth'];

        cookies.forEach((cookieName) => {
            domains.forEach((domain) => {
                paths.forEach((path) => {
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure; samesite=strict`;
                });
            });
        });
    };

    const handleLogout = () => {
        apiClient.clearCache();
        localStorage.removeItem('api_cache');

        Cookies.remove('accessTokenDuplicate');
        clearCookies();
        navigate('/auth/login');
    };

    const renderProfilePicture = () => {
        const initials = `${profileData.firstName[0]}${profileData.lastName[0]}`;

        return profileData.profilePicture ? (
            <img
                src={profileData.profilePicture}
                alt="Profile"
                className={styles.profile_picture}
            />
        ) : (
            <div className={styles.profile_picture_initials}>{initials}</div>
        );
    };

    const handleNotificationsClick = () => {
        setIsNotificationsPanelOpen(true);
    };

    const handleCloseNotifications = () => {
        setIsNotificationsPanelOpen(false);
    };

    const handleProfileClick = () => {
        navigate(`${basePath}/account`);
    };

    const handleTicketsClick = () => {
        navigate(`${basePath}/tickets`);
    };

    useEffect(() => {
        if (debouncedSearchTerm) {
            const search = async () => {
                setIsSearching(true);
                try {
                    const response = await apiClient.get(
                        `/regions/search?term=${debouncedSearchTerm}`
                    );
                    const results = response.data;

                    setSearchResults(results);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setIsSearching(false);
                }
            };

            search();
        }
    }, [debouncedSearchTerm]);

    const placeholders = [
        'Search by Region',
        'Search by EDC',
        'Search by Substation',
    ];

    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setPlaceholderIndex(
                (prevIndex) => (prevIndex + 1) % placeholders.length
            );
        }, 3000);

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, [placeholders.length]);

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className={styles.header_container}>
            <div className={styles.logo_container}>
                <Link to={basePath}>
                    <img
                        src="images/tangedco.png"
                        alt="Company Logo"
                        className={styles.logo_bestinfra}
                    />
                </Link>
                <span className={styles.welcome_message}>
                    Welcome {profileData.firstName}!
                </span>
                {isMobile && (
                    <div 
                        className={styles.mobile_menu_toggle}
                        onClick={toggleMobileMenu}
                    >
                        <img 
                            src={isMobileMenuOpen ? "icons/close-button.svg" : "icons/hamburger-menu.svg"} 
                            alt="Menu"
                        />
                    </div>
                )}
            </div>
            <div className={`${styles.search_cont} ${isMobile && !isMobileMenuOpen ? styles.mobile_hidden : ''}`}>
                <input
                    type="text"
                    name="query"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={placeholders[placeholderIndex]}
                    className={styles.search_input}
                />
                <span className="icons icon_placement">
                    {isSearching ? (
                        <div className={styles.spinner}></div>
                    ) : (
                        <img src="icons/search-icon.svg" alt="Search" />
                    )}
                </span>
                {searchResults.length > 0 && (
                    <div className={styles.search_results}>
                        {searchResults.map((result) => (
                            <div
                                key={result.id}
                                className={styles.search_result_item}
                                onClick={() => handleResultClick(result)}>
                                <span className={styles.result_name}>
                                    {result.hierarchy_name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={`${styles.right_cont} ${isMobile && !isMobileMenuOpen ? styles.mobile_hidden : ''}`}>
                <div className={styles.right_cont_item}>
                    <div className={styles.date_time_display}>
                        <div className={styles.time}>{formattedTime}</div>
                        <div className={styles.date}>{formattedDate}</div>
                        <div
                            className={styles.clock_icons}
                            onClick={handleProfileClick}>
                            <img src="icons/clock-up-arrow.svg" alt="Clock" />
                        </div>
                    </div>

                    <span
                        className={styles.white_icons}
                        onClick={handleProfileClick}>
                        <img src="icons/settings.svg" alt="Settings" />
                    </span>

                    <span
                        className={styles.white_icons}
                        onClick={handleTicketsClick}>
                        <img src="icons/support-tickets.svg" alt="Tickets" />
                    </span>

                    <span
                        className={styles.white_icons}
                        onClick={handleNotificationsClick}>
                        <img src="icons/bell.svg" alt="notifications" />
                    </span>

                    <Buttons
                        label="Logout"
                        onClick={handleLogout}
                        variant="secondary"
                        icon="icons/logout-icon.svg"
                        alt="Logout"
                        iconPosition="right"
                    />
                </div>
            </div>

            {/* Add NotificationsPanel */}
            <NotificationsPanel
                isOpen={isNotificationsPanelOpen}
                onClose={handleCloseNotifications}
            />
        </div>
    );
};

export default Header;
