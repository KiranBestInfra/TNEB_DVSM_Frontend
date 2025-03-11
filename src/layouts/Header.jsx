import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Header.module.css';
import Buttons from '../components/ui/Buttons/Buttons';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import useDebounce from '../utils/debounce';
import Cookies from 'js-cookie';
import NotificationsPanel from '../components/NotificationsPanel/NotificationsPanel';
import { useAuth } from '../components/AuthProvider';

const Header = ({ title }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showTariffModal, setShowTariffModal] = useState(false);
    const [tariff, setTariff] = useState([]);
    const [error, setError] = useState(null);
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] =
        useState(false);
    const { isAdmin } = useAuth();
    const basePath = isAdmin() ? '/admin' : '/user';

    const debouncedSearchTerm = useDebounce(searchQuery, 500);

    const [profileData] = useState({
        profilePicture: null,
        firstName: 'John',
        lastName: 'Doe',
    });

    const handleSearchChange = (e) => {
        const query = e.target.value;
        if (query.length === 0) {
            setSearchResults([]);
        }
        setSearchQuery(query);
    };

    const handleResultClick = (consumerId) => {
        navigate(`${basePath}/consumers/view/${consumerId}`);
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

    // Add these new handlers
    const handleTariffClick = () => {
        setShowTariffModal(true);
    };

    const handleCloseModal = () => {
        setShowTariffModal(false);
    };

    const handleModalClick = (e) => {
        if (e.target.className === 'modal') {
            setShowTariffModal(false);
        }
    };

    useEffect(() => {
        const fetchTariff = async () => {
            try {
                const response = await apiClient.get('/tariff');
                setTariff(response.data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching tariff data:', err);
            }
        };

        fetchTariff();
    }, []);

    useEffect(() => {
        if (debouncedSearchTerm) {
            const search = async () => {
                const response = await apiClient.get(
                    `/consumers/search?term=${debouncedSearchTerm}`
                );
                const results = response.data;
                setSearchResults(results);
            };

            search();
        }
    }, [debouncedSearchTerm]);

    const placeholders = [
        'Search by Consumer ID',
        'Search by Consumer Name',
        'Search by Meter No',
        'Search by Unique ID',
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

    const handleNotificationsClick = () => {
        setIsNotificationsPanelOpen(true);
    };

    const handleCloseNotifications = () => {
        setIsNotificationsPanelOpen(false);
    };

    return (
        <div className={styles.header_container}>
            <div className={styles.consumer_id_cont}>
                <div className="title">{title}</div>
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
                                key={result.sl_no}
                                className={styles.search_result_item}
                                onClick={() => handleResultClick(result.uid)}>
                                <span className={styles.consumer_id}>
                                    {result.consumer_id}{' '}
                                </span>
                                <span className={styles.consumer_name}>
                                    {result.consumer_name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.right_cont}>
                <div className={styles.right_cont_item}>
                    {isAdmin() ? (
                        ''
                    ) : (
                        <Link to={`${basePath}/account`} title="Account">
                            <span className={styles.white_icons}>
                                {renderProfilePicture()}
                            </span>
                        </Link>
                    )}
                    <span
                        className={styles.white_icons}
                        onClick={handleNotificationsClick}>
                        <img src="icons/bell.svg" alt="notifications" />
                    </span>
                    <span
                        className={styles.white_icons}
                        onClick={handleTariffClick}>
                        <img src="icons/tax-alt.svg" alt="tariff" />
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

            {/* Add Tariff Modal */}
            {showTariffModal && (
                <div className="modal" onClick={handleModalClick}>
                    <div className="modalContent">
                        <div className="modalHeader">
                            <h2 className="title">Tariff Details</h2>
                            <span className="icons" onClick={handleCloseModal}>
                                <img src="icons/close.svg" alt="close" />
                            </span>
                        </div>
                        <div className="tariff-plans">
                            {tariff.map((plan, index) => (
                                <div className="tariff-plan" key={index}>
                                    <div className="tariff-plan-header">
                                        <h3 className="titles">
                                            Slab {index + 1}
                                        </h3>
                                        <p className="range">
                                            {plan.tariff_category}
                                        </p>
                                    </div>
                                    <p className="rate">
                                        <div className="rate_cont">
                                            <span className="icons_rupee">
                                                <img
                                                    src="icons/indian-rupee-sign.svg"
                                                    alt="rupee"
                                                />
                                            </span>
                                            {plan.rate || 0}
                                            <span className="perunit">
                                                /Unit
                                            </span>
                                        </div>
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="tariff-notes">
                            <p>
                                *Taxes are applicable and subjected to change
                                from time to time.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
