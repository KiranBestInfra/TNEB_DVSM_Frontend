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
    const { isAdmin } = useAuth();
    const basePath = isAdmin() ? '/admin' : '/user';

    const debouncedSearchTerm = useDebounce(searchQuery, 500);

    // Simulated profile data - in a real app, this would come from user context/auth
    const { user } = useAuth(); // Get user details from auth context
    //console.log(user);

    const profileData = {
        profilePicture: user?.profilePicture || null,
        firstName: user?.id || 'User',
        lastName: user?.lastName || '',
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        if (query.length === 0) {
            setSearchResults([]);
        }
        setSearchQuery(query);
    };

    const handleResultClick = (resultId) => {
        navigate(`${basePath}/details/${resultId}`);
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
        'Search by District',
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

    return (
        <div className={styles.header_container}>
            <div className={styles.logo_container}>
                <Link to={basePath}>
                    <img src="images/tangedco.png" alt="Company Logo" className={styles.logo_bestinfra} />
                </Link>
                <span className={styles.welcome_message}>
                    Welcome {profileData.firstName}!
                </span>
            </div>
            <div className={styles.search_cont}>
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
                                onClick={() => handleResultClick(result.id)}>
                                <span className={styles.result_name}>
                                    {result.hierarchy_name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.right_cont}>
                <div className={styles.right_cont_item}>
                    {/* <div className={styles.white_icons} onClick={handleProfileClick}>
                        {renderProfilePicture()}
                    </div> */}

                    <span className={styles.white_icons} onClick={handleProfileClick}>
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
