import { useState } from 'react';
import Buttons from "../components/ui/Buttons/Buttons";
import styles from "../styles/Account.module.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();

    // State
    const [profileData, setProfileData] = useState({
        profilePicture: null,
        consumerId: "CID123456", 
        firstName: "John",
        lastName: "Doe",
        occupation: "Software Engineer", 
        role: "Consumer",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main St, New York, NY 10001"
    });

    const [loginActivities] = useState([
        { id: 1, date: '2024-01-15 14:30', activity: 'Login successful', device: 'Chrome on Windows' },
        { id: 2, date: '2024-01-14 09:45', activity: 'Password changed', device: 'Safari on iPhone' }
    ]);

    // Handlers
    const handleProfilePictureUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileData(prev => ({
                ...prev,
                profilePicture: URL.createObjectURL(file)
            }));
        }
    };

    const handleDeleteProfilePicture = () => {
        setProfileData(prev => ({
            ...prev,
            profilePicture: null
        }));
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Render
    const renderProfilePicture = () => {
        const initials = `${profileData.firstName[0]}${profileData.lastName[0]}`;
        
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
                    <label htmlFor="profile-picture-upload">
                        <Buttons
                            label="Upload Picture"
                            variant="outline"
                            type="button"
                            
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
            <div className="form_row">
                <div className="form_group">
                    <label className="form_label">Consumer ID</label>
                    <input
                        type="text"
                        value={profileData.consumerId}
                        disabled
                        className={styles.input_disabled}
                        placeholder="Consumer ID"
                    />
                </div>
                <div className="form_group">
                    <label className="form_label">First Name</label>
                    <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First Name"
                    />
                </div>
                <div className="form_group">
                    <label className="form_label">Last Name</label>
                    <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Last Name"
                    />
                </div>
            </div>

            <div className="form_row">
                <div className="form_group">
                    <label className="form_label">Occupation</label>
                    <input
                        type="text"
                        value={profileData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        placeholder="Occupation"
                    />
                </div>
                <div className="form_group">
                    <label className="form_label">Account Access Role</label>
                    <input
                        type="text"
                        value={profileData.role}
                        disabled
                        className={styles.input_disabled}
                        placeholder="Account Access Role"
                    />
                </div>
                <div className="form_group">
                    <label className="form_label">Email Address</label>
                    <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className={styles.input_disabled}
                        placeholder="Email Address"
                    />
                </div>
            </div>

            <div className="form_row">
                <div className="form_group">
                    <label className="form_label">Phone Number</label>
                    <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Phone Number"
                    />
                </div>
            </div>
            <div className="form_row">
                <div className="form_group">
                    <label className="form_label">Address</label>
                    <textarea
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        placeholder="Address"
                    />
                </div>
            </div>
        </div>
    );

    const renderLoginActivities = () => (
            <div className={styles.login_activities}>
                {loginActivities.map(activity => (
                    <div key={activity.id} className={styles.activity_item}>
                        
                        <div className={styles.activity_details}>
                            <p>{activity.activity}</p>
                            <span>{activity.device}</span>
                        </div>
                        <div className={styles.activity_date}>{activity.date}</div>
                    </div>
                ))}
            </div>
    );

    return (
        <div className={styles.main_content}>
            <div className={styles.profile_sections}>
                <section className={styles.profile_section}>
                    {renderProfilePicture()}
                    {renderProfileForm()}
                </section>
                {renderLoginActivities()}
            </div>
        </div>
    );
};

export default Profile;
