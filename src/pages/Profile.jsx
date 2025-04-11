import { useState } from 'react';
import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Profile.module.css';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Name } from '../utils/globalUtils';
import axios from 'axios';
import { apiClient } from '../api/client';

const Profile = () => {
    const navigate = useNavigate();

    const { user } = useAuth();
    const name = Name(user, false);

    // State
    const [profileData, setProfileData] = useState({
        profilePicture: null,
        consumerId: 'CID123456',
        firstName: 'John',
        lastName: 'Doe',
        occupation: 'Software Engineer',
        role: 'Consumer',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY 10001',
    });

    const [loginActivities] = useState([
        {
            id: 1,
            date: '2024-01-15 14:30',
            activity: 'Login successful',
            device: 'Chrome on Windows',
        },
        {
            id: 2,
            date: '2024-01-14 09:45',
            activity: 'Password changed',
            device: 'Safari on iPhone',
        },
        {
            id: 3,
            date: '2024-01-13 11:20',
            activity: 'Login successful',
            device: 'Firefox on MacOS',
        },
        {
            id: 4,
            date: '2024-01-12 16:15',
            activity: 'Profile updated',
            device: 'Chrome on Windows',
        },
        {
            id: 5,
            date: '2024-01-11 08:30',
            activity: 'Login successful',
            device: 'Edge on Windows',
        },
        {
            id: 6,
            date: '2024-01-10 19:45',
            activity: 'Login successful',
            device: 'Chrome on Android',
        },
        {
            id: 7,
            date: '2024-01-09 13:10',
            activity: 'Password reset requested',
            device: 'Safari on iPad',
        },
        {
            id: 8,
            date: '2024-01-08 10:25',
            activity: 'Login successful',
            device: 'Chrome on Windows',
        },
        {
            id: 9,
            date: '2024-01-07 17:40',
            activity: 'Account settings changed',
            device: 'Firefox on Linux',
        },
        {
            id: 10,
            date: '2024-01-06 12:15',
            activity: 'Login successful',
            device: 'Chrome on Windows',
        },
        {
            id: 11,
            date: '2024-01-05 09:30',
            activity: 'Login failed attempt',
            device: 'Unknown device',
        },
        {
            id: 12,
            date: '2024-01-04 14:50',
            activity: 'Login successful',
            device: 'Safari on MacOS',
        },
    ]);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');

    // Pagination state for login activities
    const [currentPage, setCurrentPage] = useState(1);
    const [activitiesPerPage, setActivitiesPerPage] = useState(5);
    const totalPages = Math.ceil(loginActivities.length / activitiesPerPage);

    // Handlers
    const handleProfilePictureUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('image', file);

                axios.defaults.withCredentials = true;
                const response = axios.post(
                    'http://localhost:3000/api/v1/profile/edit/image',
                    formData,
                    {
                        // headers: {
                        //     'Content-Type': 'multipart/form-data'
                        // }
                    }
                );

                setProfileData((prev) => ({
                    ...prev,
                    profilePicture:
                        response.imageUrl || URL.createObjectURL(file),
                }));
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                try {
                    await apiClient.post('/log/error', {
                        message: error.message,
                        stack: error.stack || 'No stack trace',
                        time: new Date().toISOString(),
                    });
                } catch (logError) {
                    console.error('Error logging to backend:', logError);
                }
            }
        }
    };

    const handleDeleteProfilePicture = () => {
        setProfileData((prev) => ({
            ...prev,
            profilePicture: null,
        }));
    };

    const handleInputChange = (field, value) => {
        setProfileData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleChangePassword = (e) => {
        e.preventDefault();

        // Reset any previous error
        setError('');

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        // TODO: Implement password change logic with backend

        // Clear the form after submission
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    const handlePageChange = (newPage, newPerPage = activitiesPerPage) => {
        if (newPerPage !== activitiesPerPage) {
            // If changing items per page, reset to first page
            setCurrentPage(1);
            setActivitiesPerPage(newPerPage);
        } else {
            // If using navigation buttons, update the page number
            setCurrentPage(newPage);
        }
    };

    // Render
    const renderProfilePicture = () => {
        const initials = user?.userId
            ? user.userId.slice(0, 2).toUpperCase()
            : '';

        return (
            <div className={styles.profile_picture_container}>
                {profileData.profilePicture ? (
                    <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        className={styles.profile_picture}
                    />
                ) : (
                    <div className={styles.profile_picture_initials}>
                        {initials}
                    </div>
                )}
                <div className={styles.profile_picture_actions}>
                    <input
                        type="file"
                        id="profile-picture-upload"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        style={{ display: 'none' }}
                    />
                    <label
                        htmlFor="profile-picture-upload"
                        className={styles.upload_button}>
                        <Buttons
                            label="Upload Picture"
                            variant="outline"
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById('profile-picture-upload')
                                    .click()
                            }
                        />
                    </label>
                    {profileData.profilePicture && (
                        <Buttons
                            label="Delete"
                            variant="danger"
                            onClick={handleDeleteProfilePicture}
                        />
                    )}
                </div>
            </div>
        );
    };

    const renderProfileForm = () => (
        <div className={styles.profile_section_content}>
            <div className={styles.profile_section_content_header}>
                <span className={styles.white_icons}>
                    <img src="icons/lock.svg" alt="Download chart" />
                </span>
                <h2>Change Password</h2>
            </div>
            <div>
                {error && (
                    <div className="form_row">
                        <div style={{ color: 'red', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleChangePassword}>
                <div className="form_row form_row_profile">
                    <div className="form_group">
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                                handlePasswordChange(
                                    'currentPassword',
                                    e.target.value
                                )
                            }
                            placeholder="Enter your current password"
                            required
                        />
                    </div>
                </div>

                <div className="form_row form_row_profile">
                    <div className="form_group">
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                                handlePasswordChange(
                                    'newPassword',
                                    e.target.value
                                )
                            }
                            placeholder="Enter your new password"
                            required
                        />
                    </div>
                </div>

                <div className="form_row form_row_profile">
                    <div className="form_group">
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                                handlePasswordChange(
                                    'confirmPassword',
                                    e.target.value
                                )
                            }
                            placeholder="Confirm your new password"
                            required
                        />
                    </div>
                </div>

                <div className="form_row form_row_profile">
                    <Buttons
                        label="Change Password"
                        variant="primary"
                        type="submit"
                    />
                </div>
            </form>
        </div>
    );

    const renderLoginActivities = () => {
        const startIndex = (currentPage - 1) * activitiesPerPage;
        const endIndex = startIndex + activitiesPerPage;
        const currentActivities = loginActivities.slice(startIndex, endIndex);

        return (
            <div className={styles.login_activities}>
                <div>
                    <h3>User Activities</h3>
                </div>
                <div className={styles.activities_container}>
                    {currentActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className={styles.activity_section}>
                            <div className={styles.login_activities}>
                                <div className={styles.activity_item}>
                                    <div className={styles.activity_details}>
                                        <p>{activity.activity}</p>
                                        <span>{activity.device}</span>
                                    </div>
                                    <div className={styles.activity_date}>
                                        {activity.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.pages_handler}>
                            <select
                                value={activitiesPerPage}
                                onChange={(e) =>
                                    handlePageChange(
                                        currentPage,
                                        Number(e.target.value)
                                    )
                                }
                                className={styles.select_pagination}>
                                {[5, 10, 15].map((option) => (
                                    <option key={option} value={option}>
                                        {option} Per Page
                                    </option>
                                ))}
                            </select>
                            <span className={styles.total_pages}>
                                Total: {loginActivities.length}
                            </span>
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                className={styles.paginationButton}>
                                Previous
                            </button>
                            <span className={styles.pageInfo}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                                className={styles.paginationButton}>
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.main_content}>
            <div className={styles.profile_sections}>
                <section className={styles.profile_section}>
                    {renderProfilePicture()}
                </section>
                <section className={styles.profile_form}>
                    {' '}
                    {renderProfileForm()}
                </section>
                <section className={styles.profile_activities}>
                    {' '}
                    {renderLoginActivities()}
                </section>
            </div>
        </div>
    );
};

export default Profile;
