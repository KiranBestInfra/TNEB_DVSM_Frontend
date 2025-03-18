import React from 'react';
import styles from '../styles/AuthLayout.module.css';

const Privacy = () => {
    return (
        <div className={styles.privacy_container}>
            <div className={styles.privacy_section}>
                <h2>1. Information We Collect</h2>
                <p>
                    We collect information you provide directly to us when you create an account, use our services, or communicate with us. This may include:
                </p>
                <ul>
                    <li>Contact information (name, email address, phone number)</li>
                    <li>Authentication information (username, password)</li>
                    <li>Usage data (system access logs, activity data)</li>
                    <li>Device information (browser type, IP address)</li>
                </ul>
            </div>

            <div className={styles.privacy_section}>
                <h2>2. How We Use Your Information</h2>
                <p>
                    We use the information we collect to:
                </p>
                <ul>
                    <li>Provide, maintain, and improve the TNEB Dashboard</li>
                    <li>Process and complete transactions</li>
                    <li>Send you technical notices, updates, and administrative messages</li>
                    <li>Respond to your comments, questions, and customer service requests</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                    <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                </ul>
            </div>

            <div className={styles.privacy_section}>
                <h2>3. Sharing of Information</h2>
                <p>
                    We may share the information we collect as follows:
                </p>
                <ul>
                    <li>With vendors, service providers, and consultants who need access to such information to carry out work on our behalf</li>
                    <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law or legal process</li>
                    <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of TNEB or others</li>
                </ul>
            </div>

            <div className={styles.privacy_section}>
                <h2>4. Data Security</h2>
                <p>
                    We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
                </p>
            </div>

            <div className={styles.privacy_section}>
                <h2>5. Your Choices</h2>
                <p>
                    You may update, correct, or delete your account information at any time by logging into your account or contacting us. You may also opt out of receiving promotional communications from us by following the instructions in those communications.
                </p>
            </div>

            <div className={styles.privacy_section}>
                <h2>6. Changes to This Privacy Policy</h2>
                <p>
                    We may change this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
                </p>
            </div>

            <div className={styles.privacy_section}>
                <h2>7. Contact Us</h2>
                <p>
                    If you have any questions about this privacy policy, please contact us at privacy@tneb.gov.in.
                </p>
            </div>
        </div>
    );
};

export default Privacy; 